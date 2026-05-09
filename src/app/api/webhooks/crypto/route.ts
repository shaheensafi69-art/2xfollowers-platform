import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // ۱. دریافت دیتای خام از درگاه (NowPayments یا هر درگاه مشابه)
  const payload = await req.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // ۲. استخراج اطلاعات داینامیک از فیلد order_id
    // فرمت ارسالی شما: userId_serviceId_quantity_link
    if (!payload.order_id) {
      console.error("❌ No order_id found in payload");
      return NextResponse.json({ error: "No order_id" }, { status: 400 });
    }

    const parts = payload.order_id.split('_');
    const userId = parts[0];
    const internalServiceId = parts[1];
    const quantity = parts[2];
    // بازسازی لینک: بخش‌های باقی‌مانده را به هم می‌چسبانیم و کاراکترهای لوله | را به / تبدیل می‌کنیم
    const link = parts.slice(3).join('_').replace(/\|/g, '/');

    console.log(`📦 Processing Order: User:${userId}, Service:${internalServiceId}, Qty:${quantity}`);

    // ۳. پیدا کردن آیدی ۴ رقمی سپلایر از دیتابیس (داینامیک برای هر سرویس)
    const { data: serviceData } = await supabase
      .from('smm_services')
      .select('supplier_service_id')
      .eq('id', parseInt(internalServiceId))
      .single();

    const realSupplierId = serviceData?.supplier_service_id;
    let supplierOrderId = null;

    // ۴. ارسال خودکار به FameGrows (فقط اگر آیدی سپلایر معتبر باشد)
    if (realSupplierId && link) {
      try {
        const formData = new URLSearchParams();
        formData.append('key', '91eebf77733dcda06d6839fa4a4c9b2b');
        formData.append('action', 'add');
        formData.append('service', String(realSupplierId));
        formData.append('link', link);
        formData.append('quantity', quantity);

        const res = await fetch('https://famegrows.com/api/v2', { method: 'POST', body: formData });
        const result = await res.json();
        
        if (result.order) {
          supplierOrderId = String(result.order);
        }
      } catch (err) {
        console.error("❌ FameGrows API Error:", err);
      }
    }

    // ۵. ثبت داینامیک در دیتابیس smm_orders
    const { error: dbError } = await supabase.from('smm_orders').insert({
      user_id: userId,
      service_id: realSupplierId ? parseInt(realSupplierId) : parseInt(internalServiceId),
      link: link,
      quantity: parseInt(quantity),
      total_cost: parseFloat(payload.actually_paid || payload.amount || "0"),
      status: supplierOrderId ? 'processing' : 'pending_manual_check',
      supplier_order_id: supplierOrderId
    });

    // ۶. ارسال نوتیفیکیشن زنده به تلگرام
    const statusEmoji = supplierOrderId ? "✅" : "⚠️";
    const telegramMessage = `
${statusEmoji} <b>اردر جدید (Crypto)</b>
━━━━━━━━━━━━━━━━━━
<b>👤 کاربر:</b> <code>${userId}</code>
<b>📦 سرویس:</b> <code>${realSupplierId || internalServiceId}</code>
<b>🔢 تعداد:</b> <code>${quantity}</code>
<b>🔗 لینک:</b> ${link}
<b>💰 مبلغ:</b> ${payload.actually_paid || payload.amount} ${payload.pay_currency || ''}
<b>🆔 کد سپلایر:</b> <code>${supplierOrderId || 'Manual Check'}</code>
<b>🗄 دیتابیس:</b> ${dbError ? '❌ خطا' : '✅ ثبت شد'}
━━━━━━━━━━━━━━━━━━
`;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: telegramMessage, parse_mode: 'HTML' }),
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}