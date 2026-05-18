import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { userId, serviceId, serviceName, quantity, link, amount, transactionInfo } = await req.json();

    // اتصال به سوپابیس با کلید سرویس‌رول برای دسترسی کامل
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ۱. پیدا کردن آیدی ۴ رقمی سپلایر (Supplier ID) بر اساس آیدی داخلی سرویس
    const { data: serviceData, error: serviceError } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(serviceId))
      .single();

    // اگر آیدی سپلایر پیدا نشد، از همان آیدی داخلی استفاده می‌کنیم یا پیام خطا می‌دهیم
    const finalSupplierId = serviceData?.supplier_service_id || "نامشخص";

    // ۲. ثبت در دیتابیس smm_orders با وضعیت انتظار برای تایید دستی
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: userId,
      service_id: parseInt(serviceId),
      link: link,
      quantity: parseInt(quantity),
      total_cost: parseFloat(amount),
      status: 'pending_manual_check',
      // ذخیره اطلاعات تراکنش در فیلد آیدی سپلایر به صورت موقت برای پیگیری شما
      supplier_order_id: `HP-${transactionInfo || 'PENDING'}` 
    });

    if (dbError) {
      console.error("Database Insert Error:", dbError.message);
      throw new Error("خطا در ثبت دیتابیس: " + dbError.message);
    }

    // ۳. آماده‌سازی پیام تلگرام با جزئیات کامل و آیدی ۴ رقمی
    const telegramMessage = `
🏦 <b>Manual Payment: HesabPay</b>
━━━━━━━━━━━━━━━━━━
<b>👤 User ID:</b> <code>${userId}</code>
<b>📦 Service:</b> <code>${serviceName}</code>
<b>🆔 Supplier ID:</b> <code>${finalSupplierId}</code>
<b>🔢 Quantity:</b> <code>${quantity}</code>
<b>🔗 Link:</b> ${link}
<b>💰 Amount:</b> ${amount} USD
<b>📝 Memo/Info:</b> ${transactionInfo || 'No Memo Provided'}
━━━━━━━━━━━━━━━━━━
✅ <b>دستورالعمل:</b>
ابتدا حساب‌پی خود را چک کنید. در صورت دریافت مبلغ، سفارش را با استفاده از آیدی سپلایر <code>${finalSupplierId}</code> به صورت دستی در پنل اصلی ثبت کنید.
`;

    // ۴. ارسال همزمان و موازی به هر دو ربات تلگرام
    await Promise.all([
      // ربات اول
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      }).catch(err => console.error("HesabPay Robot 1 Error:", err)),

      // ربات دوم
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN_2}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID_2,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      }).catch(err => console.error("HesabPay Robot 2 Error:", err))
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "سفارش شما ثبت شد و در صف تایید مدیریت قرار گرفت." 
    });

  } catch (err: any) {
    console.error("Webhook Internal Error:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 400 });
  }
}