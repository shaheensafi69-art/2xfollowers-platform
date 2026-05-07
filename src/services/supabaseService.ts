import { createClient } from '../utils/supabase/client';

const supabase = createClient();

// تایپ‌های مربوط به سرویس‌ها (می‌توانید در فایل جداگانه‌ای هم بگذارید)
export interface Service {
  id: string;
  name: string;
  platform: string;
  price: number;
}

// ۱. گرفتن لیست سرویس‌ها بر اساس پلتفرم
export const getServicesByPlatform = async (platform: string) => {
  const { data, error } = await supabase
    .from('smm_services') // اینجا را هم اصلاح کنید
    .select('*')
    .ilike('platform', platform);

  // ... باقی کد
};

// ۲. ثبت سفارش جدید
export const submitOrder = async (orderData: { 
  service_id: string; 
  link: string; 
  quantity: number; 
  user_id: string 
}) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData]);

  if (error) {
    console.error("Error submitting order:", error);
    return { success: false, error };
  }
  return { success: true, data };
};

// ۳. گرفتن موجودی کاربر (برای نمایش در داشبورد)
export const getUserBalance = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();

  return { data, error };
};