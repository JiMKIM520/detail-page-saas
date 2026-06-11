/**
 * 블록 변형 레지스트리 — 변형 id/아키타입으로 조회.
 * 변형은 이질적이므로 BlockVariant<any>로 보관하고, 작성은 defineBlock<T>로 타입을 강제한다.
 */
import type { BlockArchetype, BlockVariant } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyVariant = BlockVariant<any>

const REGISTRY = new Map<string, AnyVariant>()

/** 변형 등록 (중복 id는 에러 — 충돌 조기 발견). */
export function registerBlocks(variants: AnyVariant[]): void {
  for (const v of variants) {
    if (REGISTRY.has(v.id)) throw new Error(`[blocks] duplicate variant id: ${v.id}`)
    REGISTRY.set(v.id, v)
  }
}

export function getVariant(id: string): AnyVariant | undefined {
  return REGISTRY.get(id)
}

/** 특정 아키타입의 변형 목록 (AI 컴포저가 선택지로 사용). */
export function listVariants(archetype?: BlockArchetype): AnyVariant[] {
  const all = [...REGISTRY.values()]
  return archetype ? all.filter((v) => v.archetype === archetype) : all
}

/** 변형 카탈로그 요약 (AI 컴포저 프롬프트 주입용). */
export function catalog(): Array<{ id: string; archetype: BlockArchetype; styleTags: string[]; imageSlots: number; describe: string }> {
  return listVariants().map((v) => ({
    id: v.id,
    archetype: v.archetype,
    styleTags: v.styleTags,
    imageSlots: v.imageSlots,
    describe: v.describe,
  }))
}
