import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();

    // ۱. بررسی وجود کلید در تنظیمات ورسل
    const apiKey = process.env.HESABPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing in server settings" }, { status: 500 });
    }

    // ۲. درخواست لینک پرداخت از حساب‌پی
    const response = await fetch('https://api.hesabpay.af/api/v1/checkout/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // در این حالت، کلید شما هم نقش شناسایی و هم نقش امنیت را دارد
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify({
  amount: amount,
  currency: "AFN",
  description: `Wallet recharge for user: ${userId}`,
  callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/hesabpay`, // آدرس وب‌هوک
  metadata: { userId: userId } // بسیار مهم برای شارژ خودکار ولت
}),
    });

    const data = await response.json();

    // ۳. لاگ گرفتن برای عیب‌یابی (فقط در کنسول سرور دیده می‌شود)
    console.log("HesabPay API Response:", data);

    if (data.url || data.payment_url) {
      return NextResponse.json({ url: data.url || data.payment_url });
    } else {
      // اگر حساب‌پی ارور بدهد، پیغام دقیقش را برمی‌گردانیم
      return NextResponse.json({ 
        error: data.message || "HesabPay error: Please check your API Key permissions." 
      }, { status: 400 });
    }

  } catch (err: any) {
    console.error("Connection Error:", err.message);
    return NextResponse.json({ error: "Failed to connect to HesabPay server" }, { status: 500 });
  }
}