import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  try {
    const body = await req.json();

    // ۱. بررسی نوع رویداد (فقط پرداخت‌های تکمیل شده)
    if (body.event_type === 'PAYMENT.SALE.COMPLETED') {
      const amount = body.resource.amount.total;
      const customData = body.resource.custom; // متادیتایی که موقع خرید فرستادیم
      const email = body.resource.payer_email || "PayPal User";

      // ۲. شارژ کیف پول در سوپابیس
      // اینجا بر اساس ایمیل یا ID کاربر که در custom فرستادیم فیلتر می‌کنیم
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

        // ۳. ارسال اعلان به تلگرام
        const message = `
🔵 <b>پرداخت جدید PayPal!</b>
────────────────
👤 <b>مشتری:</b> ${email}
💵 <b>مبلغ:</b> $${amount}
✅ <b>وضعیت:</b> حساب شارژ شد و آماده ارسال به تامین‌کننده است.
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