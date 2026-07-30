/**
 * POST /api/auth/company-name
 *
 * 사업자등록번호 10자리로 기업명만 조회한다(로그인 화면의 자동 확인용).
 * 인증 정보(email·password)는 돌려주지 않는다 — 실제 로그인은 client-lookup이 담당.
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

  const { bizNo } = body as { bizNo?: string }
  const digits = (bizNo ?? '').replace(/\D/g, '')
  if (digits.length !== 10) {
    return NextResponse.json({ error: '사업자등록번호 10자리를 입력해주세요.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('user_profiles')
    .select('name')
    .eq('role', 'client')
    .eq('business_number', digits)
    .limit(1)

  if (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }

  const name = data?.[0]?.name
  if (!name) {
    return NextResponse.json({ error: '등록되지 않은 사업자등록번호입니다.' }, { status: 404 })
  }

  return NextResponse.json({ companyName: name })
}
