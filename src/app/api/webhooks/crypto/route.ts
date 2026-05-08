import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // در سیستم Invoice، وقتی وضعیت 'finished' شود یعنی پول تایید شده است
    if (body.payment_status === 'finished') {
      
      // باز کردن اطلاعات از order_id
      const [userId, serviceId, quantity, linkRaw] = body.order_id.split('_');
      const link = linkRaw.replace(/\|/g, '/');

      // ۱. ارسال سفارش به FameGrows
      const formData = new URLSearchParams();
      formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b'); // FameGrows API Key
      formData.append('action', 'add');
      formData.append('service', serviceId);
      formData.append('link', link);
      formData.append('quantity', quantity);

      const supplierResponse = await fetch('https://famegrows.com/api/v2', {
        method: 'POST',
        body: formData,
      });

      const result = await supplierResponse.json();

      // ۲. ثبت در دیتابیس سوپابیس (مطابق فیلدهای دیتابیس تو)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabase.from('smm_orders').insert({
        user_id: parseInt(userId),
        service_id: parseInt(serviceId),
        link: link,
        quantity: parseInt(quantity),
        total_cost: body.actually_paid || body.price_amount,
        status: result.order ? 'processing' : 'error',
        supplier_order_id: result.order ? String(result.order) : null
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: "Webhook Failed" }, { status: 400 });
  }
}