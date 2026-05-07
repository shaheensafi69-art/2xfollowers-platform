import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// تابع کمکی برای ارسال پیام به تلگرام
async function sendTelegramMessage(text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: process.env.TELEGRAM_CHAT_ID, 
        text: text, 
        parse_mode: 'HTML' 
      }),
    });
  } catch (err) {
    console.error("Telegram Notification Error:", err);
  }
}

export async function POST(req: Request) {
  // تعریف سوپابیس در داخل تابع برای جلوگیری از ارور بیلد
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const body = await req.json();
    
    // منطق بررسی تراکنش حساب‌پی
    if (body.status === 'success' || body.event === 'payment_success') {
      const amount = body.amount;
      const userPhone = body.user_phone;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, balance')
        .eq('phone', userPhone)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: profile.balance + amount })
          .eq('id', profile.id);

        const message = `
🇦🇫 <b>واریز موفق از HesabPay!</b>
────────────────
👤 <b>مشتری:</b> ${userPhone}
💵 <b>مبلغ:</b> ${amount} AFN
✅ <b>وضعیت:</b> کیف پول شارژ شد.
────────────────
🌐 2xfollowers.com
        `;
        await sendTelegramMessage(message);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}