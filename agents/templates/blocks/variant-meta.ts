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

/**
 * 변형 예상 높이(px).
 * 1순위: 실측값
 * 2순위: 같은 아키타입 실측 평균
 * 3순위: 1100 폴백
 */
export function estimateHeight(variantId: string, archetype: BlockArchetype): number {
  const own = getVariantMeta(variantId)
  if (own?.height != null) return own.height

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
      archetypeMeasured.reduce((acc, h) => acc + h, 0) / archetypeMeasured.length,
    )
  }

  return 1100
}
