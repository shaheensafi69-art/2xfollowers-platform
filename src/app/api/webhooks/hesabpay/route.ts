import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // استفاده از Service Role برای دور زدن RLS و آپدیت مستقیم دیتابیس
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    console.log("HesabPay Webhook Data:", body);

    // حساب‌پی معمولاً وضعیت موفقیت را با 'success' یا 'payment_success' می‌فرستد
    if (body.status === 'success' || body.event === 'payment_success') {
      
      // استخراج مقدار و آی‌دی کاربر
      const amount = Number(body.amount);
      const userId = body.externalId; // یا هر فیلدی که در زمان درخواست ست کردی

      if (userId && amount > 0) {
        // اجرای تابع SQL برای افزایش موجودی
        const { error } = await supabase.rpc('increment_balance', {
          user_id: userId,
          amount_to_add: amount
        });

        if (error) {
          console.error("Database Error:", error.message);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        return NextResponse.json({ message: "Done" }, { status: 200 });
      }
    }

    return NextResponse.json({ message: "Ignored" }, { status: 200 });

  } catch (err: any) {
    console.error("Webhook Logic Error:", err.message);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}