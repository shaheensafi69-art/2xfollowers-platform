import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { afgAmount, userId } = await req.json();

  try {
    // ۱. گرفتن نرخ واقعی دالر به افغانی از API جهانی
    // نکته: این یک API رایگان و بسیار سریع است
    const exchangeRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const exchangeData = await exchangeRes.json();
    const realRate = exchangeData.rates.AFN; // مثلاً عدد ۷۰.۵ را برمی‌گرداند

    // ۲. خواندن حاشیه سود تو از جدول تنظیمات (مثلاً ۲ درصد)
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'profit_margin_percent')
      .single();
    
    const margin = settings?.value || 2;

    // ۳. فراخوانی تابع SQL با نرخ "آپدیت شده" و "سود تو"
    const { error } = await supabase.rpc('add_funds_converted', {
      user_id: userId,
      afg_amount: afgAmount,
      exchange_rate: realRate,
      profit_margin_percent: margin
    });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      rateUsed: realRate, 
      finalUsd: afgAmount / (realRate * (1 + margin/100)) 
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}