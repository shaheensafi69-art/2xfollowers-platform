import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  // جلوگیری از ارور در صورت نبود کلید
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: "Stripe Key missing" }, { status: 500 });

  const stripe = new Stripe(secretKey, { apiVersion: '2024-04-16' as any });

  try {
    const { amount, userId } = await req.json();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: { 
            name: 'Wallet Deposit',
            description: 'Top up your 2X Followers balance' 
          },
        },
        quantity: 1,
      }],
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