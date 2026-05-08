import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  // جلوگیری از ارور در صورت نبود کلید
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: "Stripe Key missing" }, { status: 500 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2025-01-27' as any // ورژن را به جدیدترین تغییر بده یا کلاً این خط را حذف کن
});

  try {
    const { amount, userId } = await req.json();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
     line_items: [
  {
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(amount * 100),
      product_data: {
        name: 'Wallet Deposit', // این خط نباید حذف شود
      },
    },
    quantity: 1,
  },
],
      submit_type: 'pay',
      mode: 'payment',
      metadata: { userId }, // برای Webhook ضروری است
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/add-funds`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}