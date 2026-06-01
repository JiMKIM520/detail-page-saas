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
export function buildTemplateCatalog(category: string): string {
  const templates = getTemplatesByCategory(category)
  if (templates.length === 0) return ''

  const lines = [
    `## 카테고리 템플릿 카탈로그 (${category})`,
    `아래 템플릿 중 제품 특성에 가장 적합한 하나를 선택하여 "selectedTemplateId" 필드로 반환하세요.`,
    `중요: 선택한 템플릿의 폰트 조합·섹션 순서·섹션별 레이아웃은 렌더링 시 자동으로 강제 적용됩니다.`,
    `따라서 아래 "폰트 조합 / 섹션 순서 / 섹션별 레이아웃"이 제품에 맞는지 확인하고 선택하세요.`,
    ``,
  ]

  for (const t of templates) {
    lines.push(`### ${t.id}  —  ${t.name}`)
    lines.push(`설명: ${t.description}`)
    lines.push(`비주얼 톤: ${t.visualTone} | 색상 계열: ${t.colorFamily} | 폰트 무드: ${t.fontMood}`)
    lines.push(`폰트 조합: 헤드라인=${t.fontPairing.headlineFont} / 스토리=${t.fontPairing.storyFont} / 본문=${t.fontPairing.bodyFont} / 액센트=${t.fontPairing.accentFont}`)
    lines.push(`섹션 순서: ${t.sectionSequence.join(' → ')}`)
    const overrides = Object.entries(t.patternOverrides)
    if (overrides.length > 0) {
      lines.push(`섹션별 레이아웃: ${overrides.map(([s, p]) => `${s}→${p}`).join(', ')}`)
    }
    lines.push(`디자인 방향: ${t.artDirectorHints}`)
    lines.push(``)
  }

  return lines.join('\n')
}
