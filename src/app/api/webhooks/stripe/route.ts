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

      console.log("🔔 Webhook Received. Session:", session.id);

      // ۱. استخراج اطلاعات اولیه
      const userId = metadata?.userId || 'f76c21e7-fbd9-4700-8fb0-2992a4bf1078';
      const internalServiceId = metadata?.serviceId || '84'; // آیدی داخلی (مثلاً ۸۴)
      const link = metadata?.link || 'No Link Provided';
      const quantity = metadata?.quantity || '1000';

      let supplierOrderId = null;
      let realSupplierId = null;

      // ۲. پیدا کردن آیدی ۴ رقمی سپلایر از جدول smm_services
      if (internalServiceId) {
        const { data: serviceData } = await supabase
          .from('smm_services')
          .select('supplier_service_id')
          .eq('id', parseInt(internalServiceId))
          .single();
        
        realSupplierId = serviceData?.supplier_service_id;
        console.log(`🔍 Internal ID ${internalServiceId} mapped to Supplier ID: ${realSupplierId}`);
      }

      // ۳. ارسال به FameGrows (فقط اگر آیدی سپلایر پیدا شد)
      if (realSupplierId && metadata?.link) {
        try {
          const formData = new URLSearchParams();
          formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b'); 
          formData.append('action', 'add');
          formData.append('service', realSupplierId); // ارسال آیدی ۴ رقمی
          formData.append('link', link);
          formData.append('quantity', quantity);

          const supplierResponse = await fetch('https://famegrows.com/api/v2', {
            method: 'POST',
            body: formData,
          });
          const result = await supplierResponse.json();
          
          if (result.order) {
            supplierOrderId = String(result.order);
            console.log("✅ FameGrows Success. Order ID:", supplierOrderId);
          } else {
            console.error("❌ FameGrows Rejected:", result);
          }
        } catch (err) {
          console.error("❌ FameGrows API Error:", err);
        }
      }

      // ۴. ثبت در دیتابیس (با آیدی داخلی ۸۴ برای حفظ ارتباط جداول)
      const { error: dbError } = await supabase.from('smm_orders').insert({
        user_id: userId, 
        service_id: parseInt(internalServiceId),
        link: link,
        quantity: parseInt(quantity),
        total_cost: session.amount_total ? session.amount_total / 100 : 0, 
        status: supplierOrderId ? 'processing' : 'pending_manual_check',
        supplier_order_id: supplierOrderId
      });

      if (dbError) console.error("❌ Supabase Error:", dbError.message);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}