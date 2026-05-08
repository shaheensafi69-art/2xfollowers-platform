import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// توابع کمکی
async function sendToFameGrows(serviceId: string, link: string, quantity: number) {
  const apiKey = process.env.SUPPLIER_API_KEY;
  const apiUrl = process.env.SUPPLIER_API_URL;
  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}&action=add&service=${serviceId}&link=${link}&quantity=${quantity}`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) { 
    console.error("FameGrows Connection Error");
    return { error: "Connection Failed" }; 
  }
}

async function sendTelegramMessage(text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch (err) { console.error("Telegram Error:", err); }
}

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-16' as any });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '' // حتما از Service Role استفاده کن تا محدودیت RLS نداشته باشی
  );

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`❌ Webhook Signature failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // شروع پردازش رویداد
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // دریافت اطلاعات از متادیتا و سشن
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const customerEmail = session.customer_details?.email;
    const userId = session.metadata?.userId; // ترجیحاً از UserId استفاده کن که دقیق‌تر است
    
    const service_id = session.metadata?.serviceId;
    const link = session.metadata?.link;
    const quantity = session.metadata?.quantity;

    try {
      // ۱. پیدا کردن پروفایل (ابتدا با UserId اگر نبود با ایمیل)
      let query = supabase.from('profiles').select('id, balance');
      
      if (userId) {
        query = query.eq('id', userId);
      } else {
        query = query.eq('email', customerEmail);
      }

      const { data: profile, error: profileError } = await query.single();

      if (profile) {
        // ۲. آپدیت موجودی در دیتابیس (استفاده از RPC که قبلاً ساختیم امن‌تر است)
        await supabase.rpc('increment_balance', { 
          user_id: profile.id, 
          amount_to_add: amount 
        });

        // ۳. اگر این پرداخت برای یک "سفارش مستقیم" بوده (نه فقط شارژ حساب)
        let supplierInfo = "";
        if (service_id && link && quantity) {
          const result = await sendToFameGrows(service_id, link, Number(quantity));
          if (result.order) {
            supplierInfo = `\n🚀 <b>سفارش در FameGrows ثبت شد:</b> <code>${result.order}</code>`;
            // ثبت در جدول سفارشات خودت
            await supabase.from('orders').insert([{
              user_id: profile.id,
              service_id: service_id,
              link: link,
              quantity: Number(quantity),
              amount: amount,
              status: 'completed',
              supplier_order_id: result.order
            }]);
          } else {
            supplierInfo = `\n⚠️ <b>خطا در تامین‌کننده:</b> ${result.error || 'Unknown'}`;
          }
        }

        // ۴. اطلاع‌رسانی تلگرام
        const message = `💰 <b>پرداخت موفق Stripe!</b>\n\n👤 <b>مشتری:</b> ${customerEmail}\n💵 <b>مبلغ واریزی:</b> $${amount}${supplierInfo}\n✅ <b>وضعیت ولت:</b> آپدیت شد\n\n@SafiInternational`;
        await sendTelegramMessage(message);
      }
    } catch (dbError: any) {
      console.error("Database Error in Webhook:", dbError.message);
    }
  }

  return NextResponse.json({ received: true });
}