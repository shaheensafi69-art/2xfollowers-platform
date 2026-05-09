import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const payload = await req.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let extractedData = { userId: "", serviceId: "", quantity: "", link: "" };

    // ۱. استخراج کاملاً داینامیک: اولویت با metadata، در غیر این صورت تجزیه order_id
    if (payload.metadata && payload.metadata.serviceId) {
      extractedData = {
        userId: payload.metadata.userId,
        serviceId: payload.metadata.serviceId,
        quantity: payload.metadata.quantity,
        link: payload.metadata.link
      };
    } else if (payload.order_id) {
      const parts = payload.order_id.split('_');
      extractedData.userId = parts[0] || "";
      extractedData.serviceId = parts[1] || "";
      extractedData.quantity = parts[2] || "";
      // بازسازی لینک و اصلاح کاراکترها
      extractedData.link = parts.slice(3).join('_').replace(/\|/g, '/');
    }

    // اگر دیتای حیاتی پیدا نشد، عملیات را متوقف کن تا دیتای غلط ثبت نشود
    if (!extractedData.serviceId || !extractedData.link) {
      return NextResponse.json({ error: "Invalid dynamic data" }, { status: 400 });
    }

    // ۲. پیدا کردن آیدی ۴ رقمی سپلایر از جدول خدمات (بدون فرض قبلی)
    const { data: serviceData } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(extractedData.serviceId))
      .single();

    const finalSupplierId = serviceData?.supplier_service_id || extractedData.serviceId;
    let supplierOrderId = null;

    // ۳. ارسال به FameGrows
    try {
      const formData = new URLSearchParams();
      formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
      formData.append('action', 'add');
      formData.append('service', String(finalSupplierId));
      formData.append('link', extractedData.link);
      formData.append('quantity', String(extractedData.quantity));

      const res = await fetch('https://famegrows.com/api/v2', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.order) supplierOrderId = String(result.order);
    } catch (apiErr) {
      console.error("❌ Supplier API Error:", apiErr);
    }

    // ۴. ثبت در دیتابیس (فقط با استفاده از دیتای دریافتی)
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: extractedData.userId,
      service_id: parseInt(String(finalSupplierId)), 
      link: extractedData.link,
      quantity: parseInt(String(extractedData.quantity)),
      total_cost: parseFloat(String(payload.actually_paid || payload.amount || "0")), 
      status: supplierOrderId ? 'processing' : 'pending_manual_check',
      supplier_order_id: supplierOrderId
    });

    // ۵. گزارش تلگرام (نمایش وضعیت واقعی)
    const dbStatus = dbError ? `❌ خطا در ثبت: ${dbError.message}` : "✅ با موفقیت ثبت شد";
    const telegramMessage = `
📦 <b>گزارش سیستمی اردر</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${extractedData.userId}</code>
<b>📦 سرویس:</b> <code>${finalSupplierId}</code>
<b>🔗 لینک:</b> ${extractedData.link}
<b>🔢 تعداد:</b> <code>${extractedData.quantity}</code>
<b>🆔 کد سپلایر:</b> <code>${supplierOrderId || 'Manual'}</code>
<b>🗄 دیتابیس:</b> ${dbStatus}
━━━━━━━━━━━━━━━━━━
`;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: telegramMessage, parse_mode: 'HTML' }),
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}