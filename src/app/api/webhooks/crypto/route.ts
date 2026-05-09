import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const payload = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const metadata = payload.metadata || {};
    const internalId = metadata.serviceId || "84";
    const userId = metadata.userId || 'f76c21e7-fbd9-4700-8fb0-2992a4bf1078';
    const link = metadata.link || 'No Link';
    const quantity = metadata.quantity || '1000';

    // ۱. پیدا کردن آیدی ۴ رقمی
    const { data: serviceData } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(internalId))
      .single();

    const realSupplierId = serviceData?.supplier_service_id || internalId;
    let supplierOrderId = null;

    // ۲. ارسال به FameGrows
    try {
      const formData = new URLSearchParams();
      formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
      formData.append('action', 'add');
      formData.append('service', String(realSupplierId));
      formData.append('link', link);
      formData.append('quantity', String(quantity));

      const res = await fetch('https://famegrows.com/api/v2', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.order) supplierOrderId = String(result.order);
    } catch (err) {
      console.error("FameGrows API Error:", err);
    }

    // ۳. ثبت در دیتابیس با مدیریت خطا
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: userId,
      service_id: parseInt(realSupplierId),
      link: link,
      quantity: parseInt(quantity),
      total_cost: parseFloat(payload.actually_paid || "0.57"), // تبدیل امن به عدد
      status: supplierOrderId ? 'processing' : 'pending_manual_check',
      supplier_order_id: supplierOrderId
    });

    // ۴. اطلاع‌رسانی تلگرام (شامل وضعیت دیتابیس)
    const dbStatus = dbError ? `❌ خطا در دیتابیس: ${dbError.message}` : "✅ ثبت شد";
    const telegramMessage = `
💰 <b>اردر کریپتو (تست)</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${userId}</code>
<b>📦 آیدی سپلایر:</b> <code>${realSupplierId}</code>
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