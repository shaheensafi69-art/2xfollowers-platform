import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // ۱. دریافت دیتای داینامیک از درگاه
  const payload = await req.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // ۲. استخراج اطلاعات از متادیتا (این بخش برای تمام اردرها داینامیک است)
    const metadata = payload.metadata || {};
    const internalId = metadata.serviceId; // آیدی داخلی سرویس
    const userId = metadata.userId;        // آیدی کاربر
    const link = metadata.link;            // لینک مقصد (اینستاگرام، تیک‌تاک و...)
    const quantity = metadata.quantity;    // تعداد سفارش

    // اگر اطلاعات اساسی ناقص بود، متوقف کن
    if (!internalId || !link || !userId) {
      console.error("❌ Missing required metadata in Crypto payload");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // ۳. پیدا کردن آیدی ۴ رقمی سپلایر از دیتابیس (کاملاً داینامیک)
    const { data: serviceData } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(internalId))
      .single();

    const realSupplierId = serviceData?.supplier_service_id;
    let supplierOrderId = null;

    // ۴. ارسال خودکار به FameGrows
    if (realSupplierId) {
      try {
        const formData = new URLSearchParams();
        formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
        formData.append('action', 'add');
        formData.append('service', String(realSupplierId));
        formData.append('link', link);
        formData.append('quantity', String(quantity));

        const res = await fetch('https://famegrows.com/api/v2', { method: 'POST', body: formData });
        const result = await res.json();
        
        if (result.order) {
          supplierOrderId = String(result.order);
        }
      } catch (err) {
        console.error("❌ FameGrows API Error (Dynamic Order):", err);
      }
    }

    // ۵. ثبت داینامیک در دیتابیس smm_orders
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: userId,
      service_id: realSupplierId ? parseInt(realSupplierId) : parseInt(internalId),
      link: link,
      quantity: parseInt(quantity),
      total_cost: parseFloat(payload.actually_paid || payload.amount || "0"), // قیمت واقعی پرداخت شده
      status: supplierOrderId ? 'processing' : 'pending_manual_check',
      supplier_order_id: supplierOrderId
    });

    // ۶. ارسال نوتیفیکیشن هوشمند به تلگرام
    const statusEmoji = supplierOrderId ? "✅" : "⚠️";
    const telegramMessage = `
${statusEmoji} <b>اردر کریپتو جدید (سیستم خودکار)</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${userId}</code>
<b>📦 آیدی سپلایر:</b> <code>${realSupplierId || 'Unknown'}</code>
<b>🔗 لینک:</b> ${link}
<b>🔢 تعداد:</b> <code>${quantity}</code>
<b>💰 مبلغ پرداختی:</b> ${payload.actually_paid || payload.amount} ${payload.pay_currency || ''}
<b>🆔 کد سپلایر:</b> <code>${supplierOrderId || 'ثبت نشد'}</code>
<b>🗄 وضعیت دیتابیس:</b> ${dbError ? '❌ خطا' : '✅ موفق'}
━━━━━━━━━━━━━━━━━━
`;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: telegramMessage, parse_mode: 'HTML' }),
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook General Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}