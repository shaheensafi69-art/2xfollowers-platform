import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * تابع کمکی برای ارسال اعلان به تلگرام شاهین صافی
 */
async function sendTelegramMessage(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram credentials missing in environment variables.");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text, 
        parse_mode: 'HTML' 
      }),
    });
  } catch (err) {
    console.error("Telegram Notification Error:", err);
  }
}

export async function POST(req: Request) {
  /**
   * تعریف سوپابیس در داخل تابع POST:
   * این کار حیاتی است تا در زمان بیلد ورسل، به دلیل نبود متغیرهای محیطی، پروسه متوقف نشود.
   */
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    const body = await req.json();
    
    /**
     * منطق بررسی تراکنش حساب‌پی
     * طبق داکیومنت HesabPay، وضعیت تراکنش در بدنه درخواست ارسال می‌شود.
     */
    if (body.status === 'success' || body.event === 'payment_success' || body.state === 'COMPLETED') {
      const amount = Number(body.amount); // مبلغ واریزی
      const userPhone = body.user_phone || body.phone; // شماره موبایل پرداخت‌کننده

      // ۱. پیدا کردن پروفایل کاربر بر اساس شماره موبایل در دیتابیس سوپابیس
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, balance, full_name')
        .eq('phone', userPhone)
        .single();

      if (profileError) {
        console.error("User not found or database error:", profileError);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (profile) {
        // ۲. آپدیت موجودی کیف پول کاربر
        const newBalance = (profile.balance || 0) + amount;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', profile.id);

        if (updateError) {
          console.error("Failed to update balance:", updateError);
          return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }

        // ۳. ارسال پیام تاییدیه به تلگرام مدیریت
        const message = `
🇦🇫 <b>واریز موفق از HesabPay!</b>
────────────────
👤 <b>مشتری:</b> ${profile.full_name || 'کاربر سیستم'}
📱 <b>شماره موبایل:</b> ${userPhone}
💵 <b>مبلغ شارژ:</b> ${amount} AFN
💰 <b>موجودی جدید:</b> ${newBalance} AFN
✅ <b>وضعیت:</b> کیف پول با موفقیت شارژ شد.
────────────────
🌐 <b>2xfollowers.com</b>
        `;
        await sendTelegramMessage(message);
      }
    }

    return NextResponse.json({ received: true, status: 'success' });
  } catch (err: any) {
    console.error("HesabPay Webhook Error:", err.message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}