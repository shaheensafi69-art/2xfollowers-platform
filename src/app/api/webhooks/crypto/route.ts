import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // ۱. دریافت دیتا (بعضی درگاه‌ها به صورت JSON و بعضی FormData می‌فرستند)
  const payload = await req.json();
  
  console.log("🪙 Crypto Webhook Received:", payload);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // ۲. چک کردن وضعیت پرداخت (بسته به درگاه: finished, confirmed, success)
    const status = payload.payment_status || payload.status;
    
    if (status === 'finished' || status === 'confirmed' || status === 'partially_paid') {
      
      // ۳. استخراج متادیتا (بسیار مهم: نام فیلد متادیتا در درگاه‌ها فرق می‌کند)
      const metadata = payload.metadata || {};
      const internalId = metadata.serviceId || "84"; 
      const userId = metadata.userId || "f76c21e7-fbd9-4700-8fb0-2992a4bf1078";
      const link = metadata.link || "No Link";
      const quantity = metadata.quantity || "1000";

      // ۴. پیدا کردن آیدی ۴ رقمی سپلایر
      const { data: serviceData } = await supabase
        .from('smm_services')
        .select('supplier_service_id')
        .eq('id', parseInt(internalId))
        .single();

      const realSupplierId = serviceData?.supplier_service_id;
      let supplierOrderId = null;

      // ۵. ارسال به FameGrows
      if (realSupplierId && link !== "No Link") {
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
          console.error("❌ FameGrows Error (Crypto):", err);
        }
      }

      // ۶. ثبت در دیتابیس (با آیدی سپلایر طبق خواسته قبلی‌ات)
      const { error: dbError } = await supabase.from('smm_orders').insert({
        user_id: userId,
        service_id: parseInt(realSupplierId || internalId),
        link: link,
        quantity: parseInt(quantity),
        total_cost: payload.actually_paid || 0, 
        status: supplierOrderId ? 'processing' : 'pending_manual_check',
        supplier_order_id: supplierOrderId
      });

      if (dbError) console.error("❌ DB Error (Crypto):", dbError.message);

      // ۷. نوتیفیکیشن تلگرام
      const telegramText = `
💰 <b>پرداخت کریپتو موفق!</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${userId}</code>
<b>📦 سرویس:</b> <code>${realSupplierId}</code>
<b>🔗 لینک:</b> ${link}
<b>💰 مبلغ:</b> ${payload.actually_paid} ${payload.pay_currency || 'Crypto'}
<b>🆔 کد سپلایر:</b> <code>${supplierOrderId || 'Manual'}</code>
━━━━━━━━━━━━━━━━━━
`;
      
      // اینجا تابع ارسال تلگرام را صدا بزن
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: telegramText, parse_mode: 'HTML' }),
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Crypto Webhook Crash:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}