import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const payload = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let orderData = { userId: "", serviceId: "", quantity: "", link: "" };

    // ۱. استخراج اطلاعات داینامیک
    if (payload.metadata && payload.metadata.serviceId) {
      orderData = {
        userId: payload.metadata.userId,
        serviceId: payload.metadata.serviceId,
        quantity: payload.metadata.quantity,
        link: payload.metadata.link
      };
    } else if (payload.order_id) {
      const parts = payload.order_id.split('_');
      orderData.userId = parts[0];
      orderData.serviceId = parts[1]; // این همان آیدی داخلی است (مثل 84)
      orderData.quantity = parts[2];
      orderData.link = parts.slice(3).join('_').replace(/\|/g, '/');
    }

    // ۲. پیدا کردن آیدی ۴ رقمی سپلایر فقط برای ارسال به API
    const { data: serviceData } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(orderData.serviceId))
      .single();

    const supplierServiceId = serviceData?.supplier_service_id;
    let supplierResponseId = null;

    // ۳. ارسال به سپلایر (با آیدی ۴ رقمی)
    if (supplierServiceId) {
      try {
        const formData = new URLSearchParams();
        formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
        formData.append('action', 'add');
        formData.append('service', String(supplierServiceId));
        formData.append('link', orderData.link);
        formData.append('quantity', String(orderData.quantity));

        const res = await fetch('https://famegrows.com/api/v2', { method: 'POST', body: formData });
        const result = await res.json();
        if (result.order) supplierResponseId = String(result.order);
      } catch (err) {
        console.error("API Error:", err);
      }
    }

    // ۴. ثبت در دیتابیس (با آیدی داخلی برای رفع ارور Foreign Key)
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: orderData.userId,
      service_id: parseInt(orderData.serviceId), // ذخیره آیدی داخلی (مثل 84)
      link: orderData.link,
      quantity: parseInt(orderData.quantity),
      total_cost: parseFloat(String(payload.actually_paid || payload.amount || "0")),
      status: supplierResponseId ? 'processing' : 'pending_manual_check',
      supplier_order_id: supplierResponseId
    });

    // ۵. گزارش تلگرام
    const dbStatus = dbError ? `❌ خطا: ${dbError.message}` : "✅ ثبت موفق در دیتابیس";
    const telegramMessage = `
📦 <b>گزارش نهایی سیستم</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${orderData.userId}</code>
<b>📦 آیدی داخلی:</b> <code>${orderData.serviceId}</code>
<b>🆔 آیدی سپلایر:</b> <code>${supplierServiceId}</code>
<b>🔢 تعداد:</b> <code>${orderData.quantity}</code>
<b>🆔 اردر سپلایر:</b> <code>${supplierResponseId || 'Manual'}</code>
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