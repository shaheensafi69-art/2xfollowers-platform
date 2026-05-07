import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // 1. منطق جدید: اگر کاربر در ریشه سایت (/) است
  if (request.nextUrl.pathname === '/') {
    // اگر لاگین است برود دشبورد، اگر نیست برود لاگین
    return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', request.url))
  }

  // 2. تعریف مسیرهای عمومی (Public)
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // 3. اگر کاربر لاگین نیست و در مسیرهای عمومی نیست -> هدایت به لاگین
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. اگر کاربر لاگین است و می‌خواهد به مسیرهای عمومی برود (مثل لاگین مجدد) -> هدایت به دشبورد
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}