import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const path = request.nextUrl.pathname;

  // ۱. استثنای حیاتی: باز کردن مسیر ویب‌هوک‌ها برای استرایپ و کریپتو
  // این خط اجازه می‌دهد درگاه‌ها بدون نیاز به لاگین، دیتابیس را آپدیت کنند
  if (path.startsWith('/api/webhooks')) {
    return response;
  }

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

  const isPublicPage = path === '/services' || path.startsWith('/products');
  const isAuthPage = path === '/login' || path === '/signup';

  if (path === '/') {
    return NextResponse.redirect(new URL('/services', request.url))
  }

  // اینجا ویب‌هوک‌ها قبلاً در خط ۱۷ هندل شده‌اند، پس با خیال راحت بقیه مسیرها را قفل می‌کنیم
  if (!session && !isPublicPage && !isAuthPage) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 }); 
    // یا ریدایرکت: return NextResponse.redirect(new URL('/login', request.url))
  }

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