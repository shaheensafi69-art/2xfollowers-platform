import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();
    const apiKey = process.env.HESABPAY_API_KEY;

    // ۱. ارسال درخواست
    const response = await fetch('https://api.hesabpay.com/api/v1/checkout/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        apiKey: apiKey,
        amount: amount,
        currency: "AFN",
        externalId: userId, // این خط بسیار حیاتی است! برای اینکه ویب‌هوک بفهمد پول مال کیست
        description: `Wallet Top-up for user ${userId}`,
        callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/hesabpay`,
      }),
    });

    // ۲. خواندن متن خام پاسخ برای عیب‌یابی
    const responseText = await response.text();
    console.log("Raw Response from HesabPay:", responseText);

    try {
      const data = JSON.parse(responseText);
      if (data.url || data.payment_url) {
        return NextResponse.json({ url: data.url || data.payment_url });
      } else {
        return NextResponse.json({ error: data.message || "خطا در پاسخ حساب‌پی" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: "پاسخ سرور حساب‌پی معتبر نیست (JSON error)" }, { status: 500 });
    }

  } catch (err: any) {
    console.error("Connection Error:", err.message);
    return NextResponse.json({ error: "ارتباط با سرور حساب‌پی برقرار نشد" }, { status: 500 });
  }
}