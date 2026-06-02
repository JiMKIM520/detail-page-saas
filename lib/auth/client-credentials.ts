/**
 * 사업자(client) 로그인 자격증명 규칙 (2026-06-02 회의 결정).
 * - 로그인 = 이메일 + 전화번호 뒷 4자리.
 * - Supabase 비밀번호 최소 6자 제약 때문에, 실제 저장 비밀번호는 뒷4자리에 고정 접미사를 붙인 값.
 *   클라이언트는 4자리만 입력/기억하면 되고, 로그인·계정생성이 동일 변환을 사용한다.
 */
export function clientPassword(phoneLast4: string): string {
  const digits = (phoneLast4 || '').replace(/\D/g, '').slice(-4)
  return `kompa-${digits}`
}
