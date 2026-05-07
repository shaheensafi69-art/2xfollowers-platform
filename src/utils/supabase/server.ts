// src/utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ... سایر ایمپورت‌ها
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
       // ... بقیه کد کوکی‌ها
    }
  )
}
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // در برخی محیط‌های بیلد یا صفحات استاتیک ممکن است ست کردن کوکی خطا بدهد
            // با این try-catch از متوقف شدن بیلد جلوگیری می‌کنیم
          }
        },
      },
    }
  )
}