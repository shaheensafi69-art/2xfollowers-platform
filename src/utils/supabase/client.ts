import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // گرفتن متغیرها از محیط پروژه
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // چک کردن برای اینکه اگر کلیدها نبودند، در کنسول به ما هشدار بدهد
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase keys are missing! Check your Vercel Environment Variables.");
  }

  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  )
}