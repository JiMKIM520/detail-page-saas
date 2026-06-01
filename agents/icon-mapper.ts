/**
 * Agent: Icon Mapper
 * StyleGuide + Script 기반으로 섹션별 Phosphor 아이콘 매핑
 * API 호출 없이 코드 기반 매핑 (빠름)
 */

import { saveJson, timer } from './utils'
import type { StyleGuide, Script, AgentResult } from './types'

export interface IconMapping {
  library: string
  weight: string
  size: number
  color: string
  sections: Record<string, string[]>    // sectionType → 아이콘 이름 배열
  cdnUrl: string
  cssClass: (name: string) => string    // 런타임에서만 사용 (직렬화 불가)
}

export interface IconMappingJson {
  library: string
  weight: string
  size: number
  color: string
  cdnUrl: string
  sections: Record<string, string[]>
}

// Phosphor 아이콘명 사전 (icon_suggestion 키워드 → phosphor 아이콘명)
const ICON_DICT: Record<string, string> = {
  // 시간 관련
  '시계': 'clock-countdown',
  '달력': 'calendar-check',
  '시간': 'clock',
  // 재료/자연
  '벼이삭': 'plant',
  '밀': 'grains',
  '잎': 'leaf',
  '자연': 'leaf',
  '씨앗': 'seed',
  // 가족/감성
  '가족': 'house-simple',
  '집': 'house',
  '하트': 'heart',
  '손': 'hand-heart',
  '아이': 'baby',
  // 배송/포장
  '배송': 'truck',
  '박스': 'package',
  '포장': 'gift',
  // 인증/신뢰
  '인증': 'seal-check',
  '인증서': 'certificate',
  '체크': 'check-circle',
  '무첨가': 'shield-check',
  // 온도/신선도
  '냉동': 'snowflake',
  '신선': 'sun-horizon',
  '불': 'fire',
  // 조리
  '오븐': 'oven',
  '요리': 'cooking-pot',
  '주방': 'fork-knife',
  // 별/리뷰
  '별': 'star',
  '리뷰': 'chat-dots',
  // 기본
  '정보': 'info',
  '경고': 'warning',
  '플러스': 'plus-circle',
}

// 섹션 타입별 기본 아이콘
const SECTION_DEFAULT_ICONS: Record<string, string[]> = {
  hero:         ['sparkle'],
  features:     ['check-fat', 'star', 'heart'],
  benefits:     ['lightning', 'trophy', 'hand-thumbs-up'],
  social_proof: ['seal-check', 'star', 'users'],
  how_to_use:   ['number-circle-one', 'number-circle-two', 'number-circle-three'],
  usage:        ['number-circle-one', 'number-circle-two', 'number-circle-three'],
  story:        ['book-open-text'],
  ingredients:  ['flask', 'leaf', 'warning-circle'],
  packaging:    ['package', 'truck', 'snowflake'],
  delivery:     ['truck', 'clock', 'thermometer'],
  certifications: ['seal-check', 'certificate'],
  comparison:   ['arrows-left-right'],
  cta:          ['shopping-cart-simple', 'arrow-right'],
  brand_story:  ['quote'],
}

function resolveIconName(suggestion: string, useCases: Record<string, string>): string {
  // 1) useCases 키워드 매칭
  for (const [key, icon] of Object.entries(useCases)) {
    if (suggestion.includes(key)) return icon
  }
  // 2) ICON_DICT 사전 매칭
  for (const [keyword, icon] of Object.entries(ICON_DICT)) {
    if (suggestion.includes(keyword)) return icon
  }
  // 3) 기본값
  return 'circle-dashed'
}

export function runIconMapper(
  script: Script,
  styleGuide: StyleGuide,
  outputDir: string
): AgentResult<IconMappingJson> {
  const elapsed = timer()
  console.log('[Icon Mapper] 시작')

  const { library, weight, size, primaryColor, useCases } = styleGuide.icons
  const sections: Record<string, string[]> = {}

  for (const section of script.sections) {
    const type = section.type

    if (section.items && section.items.length > 0) {
      // items에 icon_suggestion이 있으면 각각 매핑
      sections[type] = section.items.map((item) =>
        item.icon_suggestion
          ? resolveIconName(item.icon_suggestion, useCases)
          : (SECTION_DEFAULT_ICONS[type]?.[0] ?? 'circle-dashed')
      )
    } else {
      sections[type] = SECTION_DEFAULT_ICONS[type] ?? ['circle-dashed']
    }
  }

  // 라이브러리별 CDN URL
  const CDN_URLS: Record<string, string> = {
    phosphor: 'https://unpkg.com/@phosphor-icons/web@2.1.1',
    lucide:   'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js',
    tabler:   'https://unpkg.com/@tabler/icons-webfont@latest/tabler-icons.min.css',
    iconoir:  'https://unpkg.com/iconoir@7.8.0/css/iconoir.css',
  }
  const cdnUrl = CDN_URLS[library] ?? CDN_URLS.phosphor

  const result: IconMappingJson = {
    library,
    weight,
    size,
    color: primaryColor,
    cdnUrl,
    sections,
  }

  saveJson(result, `${outputDir}/icon-mapping.json`)
  console.log(`[Icon Mapper] 완료 (${elapsed()}ms) — ${Object.keys(sections).length}개 섹션 매핑`)

  return { success: true, data: result, durationMs: elapsed() }
}
