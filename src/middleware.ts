import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // جلوگیری از کرش در صورت نبود متغیرهای محیطی در زمان لوکال یا بیلد
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname;

  // ۱. مسیرهای کاملاً عمومی (سرویس‌ها و محصولات برای همه باز باشد)
  const isPublicPage = path === '/services' || path.startsWith('/products');
  
  // ۲. مسیرهای مربوط به ورود و ثبت نام
  const isAuthPage = path === '/login' || path === '/signup';

  // منطق درخواستی تو:
  
  // الف) اگر کاربر در صفحه اصلی (/) است
  if (path === '/') {
    return NextResponse.redirect(new URL('/services', request.url))
  }

  // ب) اگر کاربر لاگین نیست و می‌خواهد به بخش‌های خصوصی (مثل دشبورد یا ثبت سفارش) برود
  // ما اینجا فرض می‌کنیم هر مسیری غیر از سرویس‌ها و لاگین، نیاز به ورود دارد
  if (!session && !isPublicPage && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ج) اگر کاربر لاگین است و بیخودی به صفحه لاگین می‌رود
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}