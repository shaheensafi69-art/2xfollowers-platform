import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2023-10-16' as any 
});

// تابع کمکی برای ارسال پیام به تلگرام
async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.error("❌ Telegram keys are missing in environment variables.");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    console.log("📨 Telegram notification sent!");
  } catch (err) {
    console.error("❌ Failed to send Telegram message:", err);
  }
}

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      console.log("🔔 Webhook Received. Session:", session.id);

      const userId = metadata?.userId || 'f76c21e7-fbd9-4700-8fb0-2992a4bf1078';
      const internalServiceId = metadata?.serviceId || '84'; 
      const link = metadata?.link || 'No Link Provided';
      const quantity = metadata?.quantity || '1000';

      let supplierOrderId = null;
      let realSupplierId = null;

      // ۱. پیدا کردن آیدی ۴ رقمی سپلایر
      if (internalServiceId) {
        const { data: serviceData } = await supabase
          .from('smm_services')
          .select('supplier_service_id, name')
          .eq('id', parseInt(internalServiceId))
          .single();
        
        realSupplierId = serviceData?.supplier_service_id;
      }

      // ۲. ارسال به FameGrows
      if (realSupplierId && metadata?.link) {
        try {
          const formData = new URLSearchParams();
          formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b'); 
          formData.append('action', 'add');
          formData.append('service', realSupplierId); 
          formData.append('link', link);
          formData.append('quantity', quantity);

          const supplierResponse = await fetch('https://famegrows.com/api/v2', {
            method: 'POST',
            body: formData,
          });
          const result = await supplierResponse.json();
          
          if (result.order) {
            supplierOrderId = String(result.order);
          }
        } catch (err) {
          console.error("❌ FameGrows API Error:", err);
        }
      }

      // ۳. ثبت در دیتابیس
      const { error: dbError } = await supabase.from('smm_orders').insert({
        user_id: userId, 
        service_id: parseInt(internalServiceId),
        link: link,
        quantity: parseInt(quantity),
        total_cost: session.amount_total ? session.amount_total / 100 : 0, 
        status: supplierOrderId ? 'processing' : 'pending_manual_check',
        supplier_order_id: supplierOrderId
      });

      // ۴. ارسال نوتیفیکیشن به تلگرام شاهین
      const statusEmoji = supplierOrderId ? "✅" : "⚠️";
      const telegramMessage = `
${statusEmoji} <b>اردر جدید در 2X Followers</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${userId}</code>
<b>📦 آیدی سپلایر:</b> <code>${realSupplierId}</code>
<b>🔢 تعداد:</b> <code>${quantity}</code>
<b>🔗 لینک:</b> ${link}
<b>💰 مبلغ پرداختی:</b> $${session.amount_total ? session.amount_total / 100 : 0}
<b>🆔 کد پیگیری سپلایر:</b> <code>${supplierOrderId || 'ثبت نشد'}</code>
<b>📢 وضعیت:</b> ${supplierOrderId ? 'در حال انجام (API)' : 'نیاز به بررسی دستی'}
━━━━━━━━━━━━━━━━━━
`;
      await sendTelegramNotification(telegramMessage);

      if (dbError) console.error("❌ Supabase Error:", dbError.message);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}