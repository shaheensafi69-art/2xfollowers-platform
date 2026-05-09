import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    // دریافت اطلاعات کامل سفارش از سمت کلاینت
    const { amount, userId, serviceId, link, quantity, serviceName } = await req.json();

    // ایجاد جلسه پرداخت در استرایپ
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100), // تبدیل دلار به سنت
          product_data: {
            name: serviceName || '2X Followers Service',
            description: `Order for: ${link}`,
          },
        },
        quantity: 1,
      }],
      mode: 'payment',
      
      // بخش حیاتی: ارسال تمام اطلاعات به متادیتا
      // چون یوزر آیدی را به متن تبدیل کردی، مستقیماً ذخیره می‌شود
      metadata: { 
        userId: String(userId), 
        serviceId: String(serviceId), 
        link: link, 
        quantity: String(quantity) 
      },

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/new-order`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}