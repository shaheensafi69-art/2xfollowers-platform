import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();
    const apiKey = process.env.HESABPAY_API_KEY;

    const response = await fetch('https://api.hesabpay.com/api/v1/checkout/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        amount: amount,
        currency: "AFN",
        description: `Charge Wallet - User: ${userId}`,
        callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/hesabpay`,
      }),
    });

    const data = await response.json();

    if (data.url || data.payment_url) {
      return NextResponse.json({ url: data.url || data.payment_url });
    } else {
      return NextResponse.json({ error: data.message || "HesabPay Error" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Connection to HesabPay failed" }, { status: 500 });
  }
}