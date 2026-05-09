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

      // بررسی وجود اطلاعات ضروری در متادیتا
      if (metadata && metadata.serviceId && metadata.link && metadata.quantity) {
        
        // ۱. آماده‌سازی دیتا برای FameGrows
        const formData = new URLSearchParams();
        formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
        formData.append('action', 'add');
        formData.append('service', metadata.serviceId); // استرایپ خودش استرینگ می‌دهد
        formData.append('link', metadata.link);
        formData.append('quantity', metadata.quantity);

        // ۲. ارسال به تامین‌کننده
        const supplierResponse = await fetch('https://famegrows.com/api/v2', {
          method: 'POST',
          body: formData,
        });

        const result = await supplierResponse.json();

        // ۳. ثبت در سوپابیس (با تبدیل دستی انواع داده برای جلوگیری از ارور)
        // بخش ثبت در سوپابیس در فایل stripe webhook
const { error: dbError } = await supabase.from('smm_orders').insert({
  // در فایل ویب‌هوک این خط را اصلاح کن:
user_id: metadata.userId, // مستقیم بفرست، چون هر دو متن هستند 
  service_id: parseInt(metadata.serviceId),
  link: metadata.link,
  quantity: parseInt(metadata.quantity || '100'),
  total_cost: session.amount_total ? session.amount_total / 100 : 0, 
  status: result.order ? 'processing' : 'error',
  supplier_order_id: result.order ? String(result.order) : null 
});

        if (dbError) {
          console.error("Supabase Database Error:", dbError.message);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Protection Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}