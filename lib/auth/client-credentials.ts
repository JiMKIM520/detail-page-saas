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

/**
 * 운영팀(관리자·디자이너) 로그인 자격증명 규칙 (테스트 단계 — 2026-07-20).
 * 아이디는 admin·designer1~4, 비밀번호는 1234로 통일한다. Supabase 최소 6자 제약 때문에
 * 실제 저장 비밀번호는 같은 접두사 규칙을 쓴 값 — 사용자는 1234만 기억하면 된다.
 * 운영 전환 시 이 함수를 제거하고 실제 비밀번호 정책으로 교체할 것.
 */
export function staffPassword(input: string): string {
  return `kompa-${(input || '').trim()}`
}
