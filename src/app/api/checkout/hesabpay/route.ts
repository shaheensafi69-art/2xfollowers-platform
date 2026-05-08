import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, orderId } = await req.json();

    const response = await fetch('https://api.hesabpay.af/api/v1/payment/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HESABPAY_API_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'USD',
        description: `Order #${orderId}`,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/hesabpay`,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ url: data.payment_url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}