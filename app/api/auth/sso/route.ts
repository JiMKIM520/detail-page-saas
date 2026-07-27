import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * AI 패키지 디자인(하나파워온) 관리자에서 넘어오는 SSO 진입점.
 * 공유 시크릿(SSO_SECRET)으로 서명된 단기 토큰을 검증한 뒤, 관리자 계정의
 * magiclink 해시 토큰을 발급·즉시 소진해 이 도메인에 Supabase 세션을 심는다.
 * 실패 시 항상 일반 관리자 로그인(/admin)으로 폴백 — 에러 내용은 노출하지 않는다.
 */

const WINDOW_MS = 60_000

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const fail = () => NextResponse.redirect(`${origin}/admin`, { status: 303 })

  const secret = process.env.SSO_SECRET
  const ts = searchParams.get('ts') ?? ''
  const token = searchParams.get('token') ?? ''
  if (!secret || !ts || !token) return fail()

  const tsNum = Number(ts)
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() - tsNum) > WINDOW_MS) return fail()

  const expected = createHmac('sha256', secret).update(`apd-sso:${ts}`).digest('hex')
  const expectedBuf = Buffer.from(expected)
  const tokenBuf = Buffer.from(token)
  if (expectedBuf.length !== tokenBuf.length || !timingSafeEqual(expectedBuf, tokenBuf)) {
    return fail()
  }

  // 서명 검증 통과 — 관리자 계정으로 세션 발급 (링크는 메일 발송 없이 즉시 소진)
  const email = process.env.ADMIN_EMAIL ?? 'admin@kompa.kr'
  const service = createServiceClient()
  const { data, error } = await service.auth.admin.generateLink({ type: 'magiclink', email })
  const tokenHash = data?.properties?.hashed_token
  if (error || !tokenHash) return fail()

  const supabase = await createClient()
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: tokenHash,
  })
  if (otpError) return fail()

  return NextResponse.redirect(`${origin}/dashboard`, { status: 303 })
}
