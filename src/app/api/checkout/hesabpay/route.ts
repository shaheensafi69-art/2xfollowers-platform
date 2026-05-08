import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();
    const apiKey = process.env.HESABPAY_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "HesabPay Key missing" }, { status: 500 });

    const response = await fetch('https://api.hesabpay.com/api/v1/checkout/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify({
        amount: amount,
        currency: "AFN",
        description: `Wallet recharge for user: ${userId}`,
        callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/hesabpay`,
        metadata: { userId: userId } 
      }),
    });

    const data = await response.json();

    if (data.url || data.payment_url) {
      return NextResponse.json({ url: data.url || data.payment_url });
    } else {
      return NextResponse.json({ error: data.message || "Checkout failed" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Connection failed" }, { status: 500 });
  }
}