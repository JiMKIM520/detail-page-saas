/**
 * 아키타입 캔버스 사전 — 재설계 Sprint 4-A/B (docs/plans/image-pipeline-redesign.md).
 * "유한한 레고가 표현할 수 있는 것"의 공용 어휘. 스크립트 생성(상류)에 주입해
 * 스크립트가 태생부터 조립 가능한 형태로만 쓰이게 하고(A), 플래너의 타입→아키타입
 * 판단을 테이블로 좁힌다(B). 카탈로그(variants)와 나란히 유지 — 계열 추가 시 함께 갱신.
 */

/** 아키타입별 콘텐츠 캔버스 — 스크립트가 섹션을 쓸 때 지켜야 할 형태 제약 */
export interface ArchetypeCanvas {
  /** 스크립트 생성 프롬프트에 노출할 한 줄 형태 정의 */
  form: string
}

export const ARCHETYPE_CANVAS: Record<string, ArchetypeCanvas> = {
  hero: { form: '제품명+핵심 카피 1~2줄+체크포인트 2~4개, 대표 이미지 1' },
  point: { form: '포인트 제목+본문 1~3문장, 이미지 0~1' },
  feature: { form: '특장점 2~4개(제목+1문장), 이미지 0~2' },
  story: { form: '브랜드/제품 서사 2~4문단(문단당 1~2문장), 이미지 0~2' },
  ingredient: { form: '원료/성분 2~4개(이름+설명 1줄), 원료 실물 이미지 권장' },
  detail: { form: '라벨-값 정보 2~8행(행당 값 1~2줄), 이미지 없음' },
  spec: { form: '스펙/영양/고시 표 2~10행, 이미지 없음' },
  usage: { form: '사용/섭취 스텝 2~4개(스텝당 제목+1문장)' },
  compare: { form: '자사 vs 일반 비교 2~6행(행당 좌우 각 1줄)' },
  checklist: { form: '추천 대상/체크 항목 2~6개(항목당 1문장)' },
  checkpoint: { form: '핵심 확인 포인트 2~6개(아이콘+1문장)' },
  stats: { form: '수치 강조 1~4개(수치+라벨) — 브리프에 있는 수치만' },
  faq: { form: 'Q&A 3~6쌍(답변 1~3문장), 이미지 없음' },
  cs: { form: '배송/교환/문의 안내 2~6항목, 이미지 없음' },
  shipping: { form: '배송 안내 2~5항목, 이미지 없음' },
  review: { form: '실제 후기 2~4개 — 브리프에 실후기가 있을 때만' },
  gallery: { form: '연출 사진 2~4장+짧은 캡션 — 이미지 필수' },
  event: { form: '기간/혜택 고지 1~2줄 — 브리프에 실제 이벤트가 있을 때만' },
  banner: { form: '전환 배너 카피 1~2줄' },
  closing: { form: '마무리 카피 1~2줄+브랜드 라벨, 무드 이미지 0~1' },
}

/** 스크립트 섹션 type → 허용 블록 아키타입 (결정적 매핑 테이블, Sprint 4-B).
 *  테이블 밖 조합은 플래너 검증이 거부. 미등재 type은 FALLBACK_ARCHETYPES로 폴백 + 갭 리포트(4-C). */
export const SCRIPT_TYPE_TO_ARCHETYPES: Record<string, string[]> = {
  hero: ['hero'],
  brand_story: ['story', 'point'],
  brand_philosophy: ['story', 'banner', 'closing', 'point'],
  key_benefit: ['feature', 'point', 'checkpoint', 'stats'],
  features: ['feature', 'point', 'checkpoint'],
  ingredients: ['ingredient', 'detail', 'feature'],
  ingredient_grid: ['ingredient', 'feature'],
  scent_notes: ['ingredient', 'point', 'story'],
  texture_focus: ['point', 'gallery', 'story'],
  sensory: ['story', 'point', 'gallery'],
  process: ['usage', 'story', 'checkpoint'],
  how_to_use: ['usage'],
  usage: ['usage'],
  photo_gallery: ['gallery', 'story'],
  comparison: ['compare'],
  social_proof: ['review', 'stats', 'checkpoint', 'recommend'],
  certifications: ['cert', 'checkpoint', 'detail', 'stats'],
  spec: ['spec', 'detail'],
  nutrition: ['spec', 'detail'],
  packaging: ['detail', 'point', 'gallery'],
  delivery_info: ['cs', 'shipping', 'detail'],
  faq: ['faq'],
  event: ['event', 'banner'],
  price: ['event', 'banner'],
  gift_suggestion: ['point', 'checklist'],
  size_comparison: ['detail', 'compare'],
  target_audience: ['checklist', 'checkpoint', 'recommend'],
  cta: ['closing', 'banner'],
  closing: ['closing'],
  // 레거시 스크립트(generate-script 구버전 어휘)에서 관측된 type — 갭 리포터 데이터 기반 등재
  trust_badge: ['cert', 'checkpoint', 'stats', 'point'],
  pain_point: ['reason', 'point', 'feature', 'story'],
  product_story: ['story', 'point'],
  nutrition_table: ['spec', 'detail', 'stats'],
  product_spec: ['spec', 'detail'],
  price_highlight: ['event', 'banner', 'stats'],
  scent_story: ['ingredient', 'story', 'point'],
  ingredient_highlight: ['ingredient', 'feature'],
  texture_experience: ['point', 'story', 'gallery', 'feature'],
  full_ingredients: ['spec', 'detail', 'faq'],
  bundle_upsell: ['event', 'banner', 'point', 'detail'],
}

/** 미등재 type의 폴백 계열 — 범용 표현이 가능한 아키타입 */
export const FALLBACK_ARCHETYPES: string[] = ['story', 'point', 'banner']

/** 스크립트 생성 프롬프트에 주입할 "표현 가능 공간" 사전 (Sprint 4-A).
 *  섹션 type과 형태 제약을 함께 제시 — 이 밖의 형태는 조립 불가이므로 쓰지 않게 한다. */
export function buildCanvasPrompt(): string {
  const lines = Object.entries(SCRIPT_TYPE_TO_ARCHETYPES).map(([type, archs]) => {
    const form = ARCHETYPE_CANVAS[archs[0]]?.form ?? ''
    return `- ${type}: ${form}`
  })
  return `표현 가능 섹션 사전 (CRITICAL — 아래 type만 사용하고, 각 형태 제약(개수 상한)을 반드시 지켜라.
이 사전은 상세페이지 조립 블록이 실제로 표현할 수 있는 것의 전부다 — 상한을 넘겨 쓰면
조립 단계에서 잘리거나 변형되므로, 내용이 많으면 상한 안으로 요약하거나 섹션을 나눠라):
${lines.join('\n')}`
}
