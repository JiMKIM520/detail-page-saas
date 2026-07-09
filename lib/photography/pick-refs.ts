/**
 * 스타일링샷 생성 레퍼런스 선택 (Sprint 9-C).
 * 기존 "업로드 오래된 순 앞 3장" 고정은 늦게 올린 사진(패키지·구성컷 등)을 배제해
 * 생성 결과에 반영되지 못하는 사고를 만들었다(럽앤 신규 5장 미활용 실사례).
 * 규칙: 샷 텍스트(니즈 이름·파일명) 토큰과 업로드 파일명 토큰의 겹침 점수 우선,
 * 동점은 최신 업로드 우선. 반환은 photos 배열 인덱스(cap개).
 */
export function pickShotReferences(
  shotText: string,
  photoNames: string[],
  cap = 3,
): number[] {
  const tokensOf = (t: string): string[] =>
    (t ?? '')
      .toLowerCase()
      .split(/[^a-z0-9가-힣]+/)
      .filter((w) => w.length >= 2)
  const needTok = new Set(tokensOf(shotText))
  const scored = photoNames.map((name, i) => ({
    i,
    score: tokensOf(name).filter((w) => needTok.has(w)).length,
  }))
  // 점수 내림차순 → 최신(인덱스 큰 쪽, created_at asc 정렬 가정) 우선
  scored.sort((a, b) => b.score - a.score || b.i - a.i)
  return scored.slice(0, cap).map((s) => s.i)
}
