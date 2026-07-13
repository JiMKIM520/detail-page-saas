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

/** 변형의 '누끼 전용' 이미지 필드 키 — CSS의 object-fit:contain 클래스와 render 소스의
 *  media(필드, '클래스') 호출을 대조해 자동 산출한다(Sprint 12). 장식 프레임(원형·좌대·플롯)에
 *  배경 있는 실사가 들어가면 사각 사진이 프레임 안에 그대로 노출되는 결함(동원 ingredient-spotlight
 *  실사례)의 근거 데이터 — 수동 태깅 없이 신규 변형에도 자동 적용된다.
 *  플래너 카탈로그 마커(⛔누끼전용)와 컴포저 배치 가드가 같은 출처를 쓴다. */
const containKeysCache = new Map<string, ReadonlySet<string>>()
export function containSlotKeys(id: string): ReadonlySet<string> {
  const hit = containKeysCache.get(id)
  if (hit) return hit
  const v = REGISTRY.get(id)
  const keys = new Set<string>()
  if (v) {
    const containCls = new Set(
      [...String(v.css).matchAll(/\.([a-z0-9-]+)[^{}]*\{[^}]*object-fit:\s*contain/g)].map((m) => m[1]),
    )
    if (containCls.size) {
      // 렌더 함수 소스는 빌드 도구가 변형한다 — tsx는 `(0,import_shared.media)(d.image,"cls")`,
      // 원본은 `media(d.image, 'cls')`. 프로퍼티명(media)·마지막 필드 식별자·클래스 문자열은
      // 트랜스파일·minify에도 보존되므로 그 셋만으로 매칭한다.
      for (const m of String(v.render).matchAll(/(?:\bmedia|\.media\))\s*\(\s*([^,()]+?)\s*,\s*['"]([a-z0-9-]+)['"]/g)) {
        if (!containCls.has(m[2])) continue
        const field = m[1].trim().split('.').pop() ?? ''
        if (/^[a-zA-Z_$][\w$]*$/.test(field)) keys.add(field)
      }
    }
  }
  containKeysCache.set(id, keys)
  return keys
}

/** 변형의 최상위 media 슬롯 키 전체 — render 소스의 media(d.X, …) 호출에서 자동 산출한다.
 *  미사용 컷 재배치 패스가 "이 블록의 어느 필드에 이미지를 넣을 수 있는가"를 알기 위한 근거.
 *  d.X 형태(최상위 필드)만 수집 — 배열 아이템 필드는 구조를 알 수 없어 재배치 대상에서 제외. */
const mediaKeysCache = new Map<string, ReadonlySet<string>>()
export function mediaSlotKeys(id: string): ReadonlySet<string> {
  const hit = mediaKeysCache.get(id)
  if (hit) return hit
  const v = REGISTRY.get(id)
  const keys = new Set<string>()
  if (v) {
    for (const m of String(v.render).matchAll(/(?:\bmedia|\.media\))\s*\(\s*([a-zA-Z_$][\w$]*)\.([a-zA-Z_$][\w$]*)\s*,/g)) {
      keys.add(m[2])
    }
  }
  mediaKeysCache.set(id, keys)
  return keys
}
