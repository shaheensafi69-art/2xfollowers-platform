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
  try {
    const body = await req.json();
    
    // در HesabPay معمولاً استاتوس موفقیت در فیلد status یا نتیجه تراکنش است
    if (body.status === 'success' || body.event === 'payment_success') {
      const amount = body.amount; // مبلغ واریزی
      const userPhone = body.user_phone; // یا هر فیلدی که برای شناسایی کاربر دارید

      // ۱. پیدا کردن کاربر و شارژ ولت
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, balance, email')
        .eq('phone', userPhone) // یا بر اساس ایمیل
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: profile.balance + amount })
          .eq('id', profile.id);

        // ۲. ارسال پیام به تلگرام شما برای فروش در افغانستان
        const message = `
🇦🇫 <b>واریز موفق از HesabPay!</b>
────────────────
👤 <b>مشتری (موبایل):</b> ${userPhone}
💵 <b>مبلغ:</b> ${amount} AFN
✅ <b>وضعیت:</b> ولت شارژ شد.
────────────────
@SafiInternational
        `;
        await sendTelegramMessage(message);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}