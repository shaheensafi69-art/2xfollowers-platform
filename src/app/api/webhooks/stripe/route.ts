import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

async function sendToFameGrows(serviceId: string, link: string, quantity: number) {
  const apiKey = process.env.SUPPLIER_API_KEY;
  const apiUrl = process.env.SUPPLIER_API_URL;
  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}&action=add&service=${serviceId}&link=${link}&quantity=${quantity}`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) { return { error: "Connection Failed" }; }
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
  // تعریف Stripe و Supabase در داخل تابع برای جلوگیری از کرش بیلد
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-16' as any });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const customerEmail = session.customer_details?.email;
    const { service_id, link, quantity } = session.metadata || {};

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, balance')
      .eq('email', customerEmail)
      .single();

    if (profile) {
      await supabase.from('profiles').update({ balance: profile.balance + amount }).eq('id', profile.id);

      let supplierInfo = "";
      if (service_id && link && quantity) {
        const result = await sendToFameGrows(service_id, link, Number(quantity));
        supplierInfo = result.order ? `\n🚀 <b>سفارش ثبت شد:</b> ${result.order}` : `\n⚠️ <b>خطا در تامین‌کننده</b>`;
      }

      const message = `💰 <b>پرداخت موفق Stripe!</b>\n👤 <b>مشتری:</b> ${customerEmail}\n💵 <b>مبلغ:</b> $${amount}${supplierInfo}\n\n@SafiInternational`;
      await sendTelegramMessage(message);
    }
  }
  return NextResponse.json({ received: true });
}