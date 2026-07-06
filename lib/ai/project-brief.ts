/**
 * 의뢰 데이터 → AI 스크립트/파이프라인 입력용 제품 컨텍스트 합성.
 *
 * Step1 회사 소개(product_highlights)와 Step2 제품 정보(product_name/description/selling_points)를
 * 하나의 구조화된 텍스트로 합쳐 AI가 제품 중심으로 기획하도록 한다.
 * (기존 product_highlights만 있던 프로젝트도 그대로 동작 — 누락 필드는 건너뜀)
 */
export interface ProductBriefSource {
  product_highlights?: string | null
  product_name?: string | null
  product_description?: string | null
  selling_points?: unknown
  /** 참고사항(섭취법·FAQ·주의점 등 자유 기재) — 미반영이던 필드, 재설계 Sprint 1c에서 편입 */
  reference_notes?: string | null
}

function normalizeSellingPoints(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value.split('\n').map(s => s.trim()).filter(Boolean)
  }
  return []
}

export function composeProductContext(source: ProductBriefSource): string {
  const parts: string[] = []
  if (source.product_name?.trim()) parts.push(`[제품명] ${source.product_name.trim()}`)
  if (source.product_description?.trim()) parts.push(`[제품 소개]\n${source.product_description.trim()}`)
  const points = normalizeSellingPoints(source.selling_points)
  if (points.length > 0) parts.push(`[셀링 포인트]\n${points.map(p => `- ${p}`).join('\n')}`)
  if (source.product_highlights?.trim()) parts.push(`[회사 소개]\n${source.product_highlights.trim()}`)
  if (source.reference_notes?.trim()) parts.push(`[참고사항 — 고객 기재 원문]\n${source.reference_notes.trim()}`)
  return parts.join('\n\n')
}
