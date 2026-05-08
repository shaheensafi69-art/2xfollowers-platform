import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, userId, serviceId, link, quantity, serviceName } = await req.json();

    // بسته‌بندی اطلاعات برای بازیابی در ویب‌هوک
    const customOrderId = `${userId || '0'}_${serviceId}_${quantity}_${link.replace(/\//g, '|')}`;

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        order_id: customOrderId, // اطلاعات در اینجا ذخیره شده
        order_description: `${serviceName} for ${link}`,
        ipn_callback_url: "https://www.2xfollowers.com/api/webhooks/crypto",
        success_url: "https://www.2xfollowers.com/dashboard?status=success",
        cancel_url: "https://www.2xfollowers.com/dashboard/new-order"
      }),
    });

    const data = await response.json();

    if (data && data.invoice_url) {
      return NextResponse.json({ url: data.invoice_url }); // ریدایرکت به صفحه انتخاب ارز
    } else {
      console.error("Invoice Error:", data);
      return NextResponse.json({ error: "خطا در ایجاد فاکتور کریپتو" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}