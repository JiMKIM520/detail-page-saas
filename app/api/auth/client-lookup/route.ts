/**
 * POST /api/auth/client-lookup
 *
 * 기업 로그인: 사업자등록번호 10자리로 이메일·패스워드 조회.
 * 클라이언트는 반환된 { email, password }로 supabase.auth.signInWithPassword() 호출.
 *
 * 보안 노트: password = user_profiles.business_number (10자리 사업자등록번호).
 * 사용자가 10자리 전체를 입력해야 통과하므로, 본인이 이미 아는 값을 HTTPS 하에서
 * 되돌려주는 셈이다. (2026-07-29 로그인 방식 변경 — 이전엔 사업자명 + 뒷 5자리)
 */
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  // 신규: bizNo(10자리). 구버전 호출(companyName + bizLast5)도 당분간 함께 받는다.
  const { bizNo, companyName, bizLast5 } = body as {
    bizNo?: string
    companyName?: string
    bizLast5?: string
  }
  const digits = (bizNo ?? '').replace(/\D/g, '')
  const legacy =
    typeof companyName === 'string' &&
    companyName.trim() !== '' &&
    typeof bizLast5 === 'string' &&
    /^\d{5}$/.test(bizLast5)

  if (digits.length !== 10 && !legacy) {
    return NextResponse.json(
      { error: '사업자등록번호 10자리를 입력해주세요.' },
      { status: 400 }
    )
  }

  const service = createServiceClient()

  const { data: profiles, error: profilesError } = await service
    .from('user_profiles')
    .select('id, business_number, name')
    .eq('role', 'client')
    .not('business_number', 'is', null)

  if (profilesError) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }

  const match = (profiles ?? []).find(p => {
    const biz = (p.business_number ?? '').replace(/\D/g, '')
    if (digits.length === 10) return biz === digits
    // 구버전 경로 — 사업자명 정확 매칭 + 뒷 5자리
    const normalizedName = (p.name ?? '').trim().replace(/\s+/g, ' ')
    const normalizedInput = (companyName ?? '').trim().replace(/\s+/g, ' ')
    return normalizedName === normalizedInput && biz.slice(-5) === bizLast5
  })

  if (!match) {
    return NextResponse.json(
      { error: '등록되지 않은 사업자등록번호입니다.' },
      { status: 401 }
    )
  }

  const { data: userData, error: userError } = await service.auth.admin.getUserById(match.id)

  if (userError || !userData?.user?.email) {
    return NextResponse.json({ error: '계정 정보를 찾을 수 없습니다.' }, { status: 500 })
  }

  return NextResponse.json({
    email: userData.user.email,
    password: match.business_number as string,
    companyName: match.name as string,
  })
}
