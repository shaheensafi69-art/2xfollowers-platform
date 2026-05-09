import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2023-10-16' as any 
});

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // استفاده از کلید سیستمی برای دسترسی کامل
  );

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata && metadata.serviceId && metadata.link) {
        
        // ۱. ارسال سفارش به FameGrows
        let supplierOrderId = null;
        try {
          const formData = new URLSearchParams();
          formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b'); // API Key تو
          formData.append('action', 'add');
          formData.append('service', metadata.serviceId);
          formData.append('link', metadata.link);
          formData.append('quantity', metadata.quantity || '10000');

          const supplierResponse = await fetch('https://famegrows.com/api/v2', {
            method: 'POST',
            body: formData,
          });
          const result = await supplierResponse.json();
          supplierOrderId = result.order ? String(result.order) : null;
        } catch (err) {
          console.error("FameGrows API Error:", err);
        }

        // ۲. ثبت نهایی در جدول smm_orders
        // نام ستون‌ها دقیقاً طبق دیتابیس تو (user_id, service_id, total_cost)
        const { error: dbError } = await supabase.from('smm_orders').insert({
          user_id: metadata.userId, 
          service_id: parseInt(metadata.serviceId),
          link: metadata.link,
          quantity: parseInt(metadata.quantity || '10000'),
          total_cost: session.amount_total ? session.amount_total / 100 : 0, 
          status: supplierOrderId ? 'processing' : 'pending_metadata',
          supplier_order_id: supplierOrderId
        });

        if (dbError) {
          console.error("Supabase Error during webhook:", dbError.message);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}