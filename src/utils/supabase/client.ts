import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // اگر این متغیرها در Vercel نباشند، اپلیکیشن به خطا می‌خورد
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}