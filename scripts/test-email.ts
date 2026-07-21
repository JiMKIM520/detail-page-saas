/**
 * 메일 발송 테스트 — 프로바이더(Gmail/Resend/stub)를 실제로 타고 발송한다.
 *
 * 사용: npx tsx --env-file=.env.local scripts/test-email.ts [수신주소]
 *   - GMAIL_USER + GMAIL_APP_PASSWORD 설정 시 Gmail로 실제 발송
 *   - 아무 키도 없으면 콘솔 stub 출력
 */
import { sendDraftReadyEmail } from '@/lib/email/send'

async function main(): Promise<void> {
  const to = process.argv[2] ?? 'developuskr@gmail.com'
  const provider = process.env.GMAIL_USER
    ? `Gmail(${process.env.GMAIL_USER})`
    : process.env.RESEND_API_KEY
      ? 'Resend'
      : 'stub(키 없음)'
  console.log(`수신: ${to} · 프로바이더: ${provider}`)
  const r = await sendDraftReadyEmail(to, '테스트 상품(뉴트리 스틱)', 'https://detail-page-saas.vercel.app')
  console.log('결과:', JSON.stringify(r))
  console.log(r.sent ? '✓ 발송 성공' : `✗ 실패: ${r.error}`)
  process.exit(r.sent ? 0 : 1)
}
main().catch((e) => {
  console.error('실패:', e instanceof Error ? e.message : e)
  process.exit(1)
})
