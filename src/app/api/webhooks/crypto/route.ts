import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // ۱. دریافت دیتای ورودی بدون فرض قبلی
  const payload = await req.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let orderData = {
      userId: "",
      serviceId: "",
      quantity: "",
      link: ""
    };

    // ۲. منطق استخراج دیتای عمومی (اگر در متادیتا نبود، از order_id استفاده کن)
    if (payload.metadata && payload.metadata.serviceId) {
      orderData.userId = payload.metadata.userId;
      orderData.serviceId = payload.metadata.serviceId;
      orderData.quantity = payload.metadata.quantity;
      orderData.link = payload.metadata.link;
    } 
    else if (payload.order_id) {
      // تجزیه رشته بر اساس جداکننده استاندارد سیستم تو (_)
      const parts = payload.order_id.split('_');
      orderData.userId = parts[0];
      orderData.serviceId = parts[1];
      orderData.quantity = parts[2];
      // بازسازی لینک و اصلاح کاراکترهای تغییر یافته
      orderData.link = parts.slice(3).join('_').replace(/\|/g, '/');
    }

    // بررسی امنیتی: اگر اطلاعات پایه استخراج نشد، عملیات را متوقف کن
    if (!orderData.serviceId || !orderData.link) {
      console.error("❌ Unable to parse dynamic order data from payload");
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // ۳. پیدا کردن آیدی سپلایر به صورت داینامیک از دیتابیس
    const { data: serviceData } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(orderData.serviceId))
      .single();

    const finalSupplierServiceId = serviceData?.supplier_service_id || orderData.serviceId;
    let supplierResponseId = null;

    // ۴. ارسال خودکار به سپلایر (FameGrows)
    try {
      const formData = new URLSearchParams();
      formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
      formData.append('action', 'add');
      formData.append('service', String(finalSupplierServiceId));
      formData.append('link', orderData.link);
      formData.append('quantity', String(orderData.quantity));

      const res = await fetch('https://famegrows.com/api/v2', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.order) supplierResponseId = String(result.order);
    } catch (apiErr) {
      console.error("❌ Supplier API Connection Error:", apiErr);
    }

    // ۵. ثبت نهایی در دیتابیس smm_orders به صورت داینامیک
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: orderData.userId,
      service_id: parseInt(finalSupplierServiceId),
      link: orderData.link,
      quantity: parseInt(orderData.quantity),
      total_cost: parseFloat(payload.actually_paid || payload.amount || "0"),
      status: supplierResponseId ? 'processing' : 'pending_manual_check',
      supplier_order_id: supplierResponseId
    });

    // ۶. اطلاع‌رسانی تلگرام بدون متن ثابت
    const telegramMessage = `
📦 <b>اردر جدید ثبت شد</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${orderData.userId}</code>
<b>📦 سرویس:</b> <code>${finalSupplierServiceId}</code>
<b>🔢 تعداد:</b> <code>${orderData.quantity}</code>
<b>🔗 لینک:</b> ${orderData.link}
<b>💰 مبلغ:</b> ${payload.actually_paid || payload.amount || 'N/A'} ${payload.pay_currency || ''}
<b>🆔 کد سپلایر:</b> <code>${supplierResponseId || 'Manual Check'}</code>
<b>🗄 دیتابیس:</b> ${dbError ? '❌ خطا' : '✅ موفق'}
━━━━━━━━━━━━━━━━━━
`;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: telegramMessage, parse_mode: 'HTML' }),
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Universal Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}