import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { userId, serviceId, serviceName, quantity, link, amount, transactionInfo } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ۱. ثبت در دیتابیس با وضعیت pending_manual_check
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: userId,
      service_id: parseInt(serviceId),
      link: link,
      quantity: parseInt(quantity),
      total_cost: parseFloat(amount),
      status: 'pending_manual_check',
      supplier_order_id: `HP-${transactionInfo}` // کد تراکنش را اینجا ذخیره می‌کنیم
    });

    if (dbError) throw new Error(dbError.message);

    // ۲. ارسال گزارش کامل به تلگرام برای تایید دستی شما
    const telegramMessage = `
🏦 <b>Manual Payment: HesabPay</b>
━━━━━━━━━━━━━━━━━━
<b>👤 User ID:</b> <code>${userId}</code>
<b>📦 Service:</b> <code>${serviceName}</code>
<b>🔢 Quantity:</b> <code>${quantity}</code>
<b>🔗 Link:</b> ${link}
<b>💰 Amount:</b> ${amount}
<b>📝 TX Info:</b> ${transactionInfo}
━━━━━━━━━━━━━━━━━━
✅ <i>Check your HesabPay app. If received, start the order manually.</i>
`;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'HTML',
      }),
    });

    return NextResponse.json({ success: true, message: "Order submitted for review" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}