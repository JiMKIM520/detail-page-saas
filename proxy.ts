import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** 인증 없이 접근 가능한 경로 (prefix 매칭) */
const PUBLIC_PREFIXES = ['/login', '/signup', '/api/auth/', '/salt-bread', '/samples']

/** 인증 없이 접근 가능한 정확 경로 (하위 경로는 공개 아님) */
const PUBLIC_EXACT = ['/admin']

/** 스태프(admin/planner/designer) 공용 작업 경로 */
const STAFF_PATHS = ['/dashboard', '/planner', '/designer', '/photography']

/** admin 전용 경로 */
const ADMIN_ONLY_PATHS = ['/users']

/** 스태프로 인정되는 역할 */
const STAFF_ROLES = ['admin', 'planner', 'designer']

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
  if (PUBLIC_EXACT.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  // 미인증 → 로그인 리다이렉트 (API는 401 반환)
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = user.user_metadata?.role as string | undefined
  const isStaff = !!role && STAFF_ROLES.includes(role)

  // 스태프 공용 경로 — admin/planner/designer 허용, 그 외(클라이언트)는 본인 프로젝트로
  if (STAFF_PATHS.some(p => pathname.startsWith(p)) && !isStaff) {
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  // admin 전용 경로 — admin만 허용
  if (ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p)) && role !== 'admin') {
    return NextResponse.redirect(new URL(isStaff ? '/dashboard' : '/projects', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
