import { FOOD_TEMPLATES } from './food'
import { BEAUTY_TEMPLATES } from './beauty'
import { ELECTRONICS_TEMPLATES } from './electronics'
import type { DetailTemplate } from './types'

export type { DetailTemplate }
export { FOOD_TEMPLATES, BEAUTY_TEMPLATES, ELECTRONICS_TEMPLATES }

const ALL_TEMPLATES: DetailTemplate[] = [
  ...FOOD_TEMPLATES,
  ...BEAUTY_TEMPLATES,
  ...ELECTRONICS_TEMPLATES,
]

/** 카테고리별 템플릿 목록 반환 */
export function getTemplatesByCategory(category: string): DetailTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.category === category)
}

/** ID로 특정 템플릿 조회 */
export function getTemplateById(id: string): DetailTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id)
}

/**
 * Art Director 프롬프트용 템플릿 카탈로그 텍스트 생성
 * category에 해당하는 템플릿 목록을 선택 가이드 형태로 반환
 */
/** 힌트의 구체 색 각인 제거 — design-system.md §2.2. 팔레트 나열·HEX·금속 액센트 문구가
 *  아트디렉터에 각인되어 프로젝트 간 수렴을 유발한 실측(7사 중 5사 네이비+골드) 대응.
 *  템플릿 원본은 참고 자산으로 보존하고 프롬프트 주입 시점에만 걸러낸다. */
function stripPaletteImprint(hint: string): string {
  return hint
    .replace(/[^.]*팔레트[^.]*\.\s*/g, '') // "…팔레트…" 문장 전체 제거
    .replace(/\s*\(#[0-9A-Fa-f]{3,8}[^)]*\)/g, '') // HEX 괄호 제거
    .replace(/#[0-9A-Fa-f]{3,8}(\s*계열)?/g, '') // 잔여 HEX
    .replace(/[^.]*(금빛|골드|네이비|실버|퍼플|버건디) [액엑]센트[^.]*\.\s*/g, '') // 금속·색 액센트 문장 제거
    .replace(/[^.]*\/[^.]*배경[^.]*\.\s*/g, '') // "색A/색B 배경" 색 나열 배경 문장 제거
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function buildTemplateCatalog(category: string): string {
  const templates = getTemplatesByCategory(category)
  if (templates.length === 0) return ''

  const lines = [
    `## 카테고리 템플릿 카탈로그 (${category})`,
    `아래 템플릿 중 제품 특성에 가장 적합한 하나를 선택하여 "selectedTemplateId" 필드로 반환하세요.`,
    `템플릿은 무드·구성의 참고 방향이다 — 색 팔레트는 템플릿이 아니라 §2.2 전략(브리프·레퍼런스·제품 실측색 기반)으로 직접 결정하라.`,
    ``,
  ]

  for (const t of templates) {
    lines.push(`### ${t.id}  —  ${t.name}`)
    lines.push(`설명: ${t.description}`)
    lines.push(`비주얼 톤: ${t.visualTone} | 폰트 무드: ${t.fontMood}`)
    lines.push(`폰트 조합: 헤드라인=${t.fontPairing.headlineFont} / 스토리=${t.fontPairing.storyFont} / 본문=${t.fontPairing.bodyFont} / 액센트=${t.fontPairing.accentFont}`)
    lines.push(`디자인 방향: ${stripPaletteImprint(t.artDirectorHints)}`)
    lines.push(``)
  }

  return lines.join('\n')
}
