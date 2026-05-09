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
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      // ۱. دریافت آیدی داخلی از متادیتا (مثلاً ۸۴)
      const internalId = metadata?.serviceId || "84"; 
      const userId = metadata?.userId || 'f76c21e7-fbd9-4700-8fb0-2992a4bf1078';
      const link = metadata?.link || 'No Link Provided';
      const quantity = metadata?.quantity || '1000';

      // ۲. جستجوی Supplier Service ID (آیدی ۴ رقمی) از دیتابیس قبل از هر کاری
      const { data: serviceData, error: searchError } = await supabase
        .from('smm_services')
        .select('supplier_service_id')
        .eq('id', parseInt(internalId))
        .single();

      if (searchError || !serviceData) {
        console.error("❌ Service mapping not found for ID:", internalId);
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
      }

      const realSupplierId = serviceData.supplier_service_id; // آیدی ۴ رقمی اصلی
      console.log(`🎯 Mapping: Internal ${internalId} -> Supplier ${realSupplierId}`);

      let supplierOrderId = null;

      // ۳. صدا زدن سپلایر با آیدی ۴ رقمی اصلی
      try {
        const formData = new URLSearchParams();
        formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b'); 
        formData.append('action', 'add');
        formData.append('service', String(realSupplierId)); 
        formData.append('link', link);
        formData.append('quantity', quantity);

        const supplierResponse = await fetch('https://famegrows.com/api/v2', {
          method: 'POST',
          body: formData,
        });
        const result = await supplierResponse.json();
        
        if (result.order) {
          supplierOrderId = String(result.order);
          console.log("✅ Supplier Success. ID:", supplierOrderId);
        } else {
          console.error("❌ Supplier Rejected Request:", result);
        }
      } catch (err) {
        console.error("❌ FameGrows API Connection Error:", err);
      }

      // ۴. ثبت در دیتابیس: حالا در ستون service_id مستقیماً آیدی سپلایر (realSupplierId) ذخیره می‌شود
      const { error: dbError } = await supabase.from('smm_orders').insert({
        user_id: userId, 
        service_id: parseInt(realSupplierId), // ذخیره مستقیم آیدی ۴ رقمی سپلایر
        link: link,
        quantity: parseInt(quantity),
        total_cost: session.amount_total ? session.amount_total / 100 : 0, 
        status: supplierOrderId ? 'processing' : 'pending_manual_check',
        supplier_order_id: supplierOrderId
      });

      if (dbError) console.error("❌ DB Insert Error:", dbError.message);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}