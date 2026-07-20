/**
 * POST /api/auth/client-lookup
 *
 * 기업 로그인: 사업자명 + 사업자번호 뒷 5자리로 이메일·패스워드 조회.
 * 클라이언트는 반환된 { email, password }로 supabase.auth.signInWithPassword() 호출.
 *
 * 보안 노트: password = user_profiles.business_number (10자리 사업자번호).
 * 사용자는 5자리 입력으로 본인의 사업자번호 일부를 이미 알고 있으므로
 * HTTPS 전송 하에서 반환이 허용된다. MVP 200사 규모에서 수용 가능.
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

  const { companyName, bizLast5 } = body as { companyName?: string; bizLast5?: string }

  if (
    typeof companyName !== 'string' || companyName.trim() === '' ||
    typeof bizLast5 !== 'string' || !/^\d{5}$/.test(bizLast5)
  ) {
    return NextResponse.json(
      { error: '사업자명과 사업자번호 뒷 5자리(숫자)를 입력해주세요.' },
      { status: 400 }
    )
  }

  const normalizedInput = companyName.trim().replace(/\s+/g, ' ')
  const service = createServiceClient()

  const { data: profiles, error: profilesError } = await service
    .from('user_profiles')
    .select('id, business_number, name')
    .eq('role', 'client')
    .not('business_number', 'is', null)

  if (profilesError) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }

  // 공백 정규화 후 정확 매칭 + 사업자번호 뒤 5자리 검증
  const match = (profiles ?? []).find(p => {
    const normalizedName = (p.name ?? '').trim().replace(/\s+/g, ' ')
    return (
      normalizedName === normalizedInput &&
      (p.business_number ?? '').slice(-5) === bizLast5
    )
  })

  if (!match) {
    return NextResponse.json(
      { error: '사업자명 또는 사업자번호가 올바르지 않습니다.' },
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
  })
}
