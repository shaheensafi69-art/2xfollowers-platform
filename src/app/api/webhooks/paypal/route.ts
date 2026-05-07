import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  // انتقال تعریف سوپابیس به داخل تابع برای رفع ارور بیلد
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const body = await req.json();

    if (body.event_type === 'PAYMENT.SALE.COMPLETED') {
      const amount = body.resource.amount.total;
      const email = body.resource.payer_email || "PayPal User";

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, balance')
        .eq('email', email) 
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: profile.balance + parseFloat(amount) })
          .eq('id', profile.id);

        const message = `
🔵 <b>پرداخت جدید PayPal!</b>
────────────────
👤 <b>مشتری:</b> ${email}
💵 <b>مبلغ:</b> $${amount}
✅ <b>وضعیت:</b> حساب شارژ شد.
────────────────
🌐 2xfollowers.com
        `;
        await sendTelegramMessage(message);
      }
    }
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}