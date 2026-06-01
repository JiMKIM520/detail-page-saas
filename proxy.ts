import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** 인증 없이 접근 가능한 경로 */
const PUBLIC_PATHS = ['/login', '/admin', '/signup', '/api/auth/', '/salt-bread']

/** 관리자 역할만 접근 가능한 경로 */
const ADMIN_PATHS = ['/planner', '/designer', '/photography', '/users']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 공개 경로 — 인증 불필요
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // 미인증 → 로그인 리다이렉트 (API는 401 반환)
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 관리자 전용 경로 — 역할 검증
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    const role = user.user_metadata?.role as string | undefined
    if (!role || role !== 'admin') {
      return NextResponse.redirect(new URL('/projects', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
