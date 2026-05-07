import { NextResponse } from 'next/server';
import Stripe from 'stripe';
const paypal = require('@paypal/checkout-server-sdk');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-16' as any,
});

// تنظیمات PayPal (حتما بعد از تست، به LiveEnvironment تغییر دهید)
const environment = new paypal.core.SandboxEnvironment(
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET || '' // اگر سکرت پیپال را ندارید فعلا خالی بگذارید
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

export async function POST(req: Request) {
  try {
    const { amount, gateway, serviceName, link } = await req.json();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // --- STRIPE ---
    if (gateway === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: serviceName },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${siteUrl}/dashboard/orders?success=true`,
        cancel_url: `${siteUrl}/dashboard/new-order?canceled=true`,
      });
      return NextResponse.json({ url: session.url });
    }

    // --- PAYPAL ---
    if (gateway === 'paypal') {
      const request = new paypal.orders.OrdersCreateRequest();
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: amount.toString() },
          description: serviceName,
        }],
        application_context: {
          return_url: `${siteUrl}/dashboard/orders?success=true`,
          cancel_url: `${siteUrl}/dashboard/new-order?canceled=true`,
        }
      });
      const order = await paypalClient.execute(request);
      const approveLink = order.result.links.find((l: any) => l.rel === 'approve');
      return NextResponse.json({ url: approveLink.href });
    }

    // --- HESABPAY (اتصال مستقیم به API حساب‌پی) ---
    if (gateway === 'hesabpay') {
      const response = await fetch('https://api.hesab.com/v1/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HESABPAY_API_KEY}`
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'AFN', // یا USD بسته به تنظیمات اکانت شما
          description: serviceName,
          callback_url: `${siteUrl}/api/webhooks/hesabpay`,
          return_url: `${siteUrl}/dashboard/orders`,
        }),
      });

      const data = await response.json();
      // فرض بر این است که HesabPay یک لینک پرداخت برمی‌گرداند
      return NextResponse.json({ url: data.payment_url || data.url });
    }

    return NextResponse.json({ error: 'Gateway not supported' }, { status: 400 });

  } catch (err: any) {
    console.error("Payment Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}