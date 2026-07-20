/**
 * 변형 메타 로더 — variant-meta.json에서 톤·높이·아키타입 조회.
 * JSON은 scripts/gen-variant-meta.ts 실행으로 갱신한다.
 */
import metaJson from './variant-meta.json'
import type { BlockArchetype } from './types'

export interface VariantMetaEntry {
  tone: 'dark' | 'light'
  height: number | null
  archetype: string
  /** 팔레트 외 유채색 하드코딩이 3개 이상인 변형 — 카탈로그에서 제외된다 */
  offPalette?: boolean
}

// 내부 JSON 형상 — 메타 필드(_로 시작)와 변형 엔트리 혼재
interface MetaFile {
  _generated: string
  _measured: number
  _total: number
  [variantId: string]: VariantMetaEntry | string | number
}

const META = metaJson as unknown as MetaFile

/** 변형의 톤·높이·아키타입 원시 엔트리. 미등록 id면 undefined. */
export function getVariantMeta(variantId: string): VariantMetaEntry | undefined {
  const e = META[variantId]
  if (e !== null && typeof e === 'object' && 'tone' in e) {
    return e as VariantMetaEntry
  }
  return undefined
}

/** 변형 배경 톤. 미등록이면 'light' 폴백. */
export function variantTone(variantId: string): 'dark' | 'light' {
  return getVariantMeta(variantId)?.tone ?? 'light'
}

/** 변형이 오프팔레트(팔레트 외 유채색 하드코딩 ≥3)인지 여부. 미등록이면 false 폴백. */
export function isOffPalette(variantId: string): boolean {
  return getVariantMeta(variantId)?.offPalette === true
}

/**
 * 변형 예상 높이(px).
 * 1순위: 실측값
 * 2순위: 같은 아키타입 실측 평균
 * 3순위: 1100 폴백
 */
/**
 * 렌더 보정 계수 — variant-meta의 height는 변형을 **단독으로** 렌더한 값이라
 * 실제 페이지보다 작다. 실제 페이지에서는 장식 레이어(decorateSection)·씬 래퍼 여백이
 * 더해지고 슬롯에 실제 카피가 들어가 행이 늘어난다.
 *
 * 실측(2026-07-21, 동원 20블록): 추정합 9,873px → 실제 17,713px = 1.79배.
 * 실측 기반 항목만 봐도 1.22~2.06배로 일관되게 크다.
 *
 * 이 보정이 없어서 플래너는 씬당 1,410px로 계획했는데 실제로는 2,530px가 나왔다 —
 * S2(씬당 1,600~2,400px) 실패의 근본 원인이다. 플래너 프롬프트의 "~1.2×" 안내도 함께 고쳤다.
 */
const RENDER_SCALE = 1.75

export function estimateHeight(variantId: string, archetype: BlockArchetype): number {
  const own = getVariantMeta(variantId)
  if (own?.height != null) return Math.round(own.height * RENDER_SCALE)

  // 같은 아키타입의 실측 평균
  const archetypeMeasured = Object.entries(META)
    .filter(([k]) => !k.startsWith('_'))
    .map(([, v]) => v)
    .filter(
      (e): e is VariantMetaEntry =>
        e !== null &&
        typeof e === 'object' &&
        (e as VariantMetaEntry).archetype === archetype &&
        (e as VariantMetaEntry).height != null,
    )
    .map((e) => e.height as number)

  if (archetypeMeasured.length > 0) {
    return Math.round(
      (archetypeMeasured.reduce((acc, h) => acc + h, 0) / archetypeMeasured.length) * RENDER_SCALE,
    )
  }

  // 폴백은 보정하지 않는다 — 단독 렌더 실측이 아니라 처음부터 실제 페이지 감각으로 잡은 값이다
  // (실측 대조: cs-green-label-table 폴백 1300 vs 실제 1136 — 이미 현실적이다)
  return 1300
}
