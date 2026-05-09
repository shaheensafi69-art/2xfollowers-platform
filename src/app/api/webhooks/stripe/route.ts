import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2025-01-27' as any 
});

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      // ۱. استخراج اطلاعات با مقادیر پیش‌فرض (حتی اگر در متادیتا نباشند)
      const userId = metadata?.userId || "Guest_User";
      const serviceId = metadata?.serviceId || "0";
      const link = metadata?.link || "No Link in Metadata";
      const quantity = metadata?.quantity || "0";

      let supplierOrderId = null;

      // ۲. تلاش برای ارسال به FameGrows (فقط اگر اطلاعات کامل باشد)
      if (metadata?.serviceId && metadata?.link) {
        try {
          const formData = new URLSearchParams();
          formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
          formData.append('action', 'add');
          formData.append('service', serviceId);
          formData.append('link', link);
          formData.append('quantity', quantity);

          const supplierResponse = await fetch('https://famegrows.com/api/v2', {
            method: 'POST',
            body: formData,
          });
          const result = await supplierResponse.json();
          supplierOrderId = result.order ? String(result.order) : null;
        } catch (fameError) {
          console.error("FameGrows Error:", fameError);
        }
      }

      // ۳. ثبت قطعی در سوپابیس (حتی با دیتای ناقص برای دیباگ)
      const { error: dbError } = await supabase.from('smm_orders').insert({
        user_id: userId, 
        service_id: parseInt(serviceId) || 0,
        link: link,
        quantity: parseInt(quantity) || 0,
        total_cost: session.amount_total ? session.amount_total / 100 : 0, 
        status: supplierOrderId ? 'processing' : 'pending_metadata',
        supplier_order_id: supplierOrderId
      });

      if (dbError) {
        console.error("Supabase Insertion Error:", dbError.message);
        // اگر اینجا ارور بدهد، در لاگ ورسل چاپ می‌شود
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Protection Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}