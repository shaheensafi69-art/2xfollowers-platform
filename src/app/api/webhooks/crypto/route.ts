import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const payload = await req.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // نکته: در اینجا باید وضعیت پرداخت را بر اساس درگاهی که استفاده می‌کنی (مثل NowPayments) چک کنی
  // فرض می‌کنیم وضعیت "finished" یا "confirmed" به معنی پرداخت موفق است
  if (payload.payment_status === 'finished' || payload.status === 'confirmed') {
    
    const metadata = payload.metadata || {}; // متادیتا که موقع ایجاد پادخت فرستادی
    const internalServiceId = metadata.serviceId || "84";
    const userId = metadata.userId;
    const link = metadata.link;
    const quantity = metadata.quantity;

    // ۱. پیدا کردن آیدی ۴ رقمی سپلایر
    const { data: serviceData } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(internalServiceId))
      .single();

    const realSupplierId = serviceData?.supplier_service_id;
    let supplierOrderId = null;

    // ۲. ارسال به FameGrows
    if (realSupplierId && link) {
      try {
        const formData = new URLSearchParams();
        formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
        formData.append('action', 'add');
        formData.append('service', realSupplierId);
        formData.append('link', link);
        formData.append('quantity', quantity);

        const res = await fetch('https://famegrows.com/api/v2', { method: 'POST', body: formData });
        const result = await res.json();
        if (result.order) supplierOrderId = String(result.order);
      } catch (err) {
        console.error("FameGrows API Error (Crypto):", err);
      }
    }

    // ۳. ثبت در دیتابیس
    await supabase.from('smm_orders').insert({
      user_id: userId,
      service_id: parseInt(realSupplierId),
      link: link,
      quantity: parseInt(quantity),
      total_cost: payload.actually_paid || 0, // مقدار پرداخت شده به کریپتو
      status: supplierOrderId ? 'processing' : 'pending_manual_check',
      supplier_order_id: supplierOrderId
    });

    // ۴. اطلاع‌رسانی تلگرام برای پرداخت کریپتو
    const telegramMessage = `
💰 <b>پرداخت کریپتو موفق!</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${userId}</code>
<b>📦 سرویس:</b> <code>${realSupplierId}</code>
<b>💰 مقدار:</b> ${payload.actually_paid} ${payload.pay_currency}
<b>🆔 اردر سپلایر:</b> <code>${supplierOrderId || 'Manual'}</code>
━━━━━━━━━━━━━━━━━━
`;
    // تابع ارسال تلگرام که قبلاً داشتیم را اینجا صدا بزن
  }

  return NextResponse.json({ received: true });
}