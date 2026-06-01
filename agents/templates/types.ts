/**
 * DetailAI 카테고리별 상세페이지 템플릿 타입
 */

import type { LayoutPatternType } from '../types'

export type VisualTone = 'minimal' | 'warm' | 'premium' | 'natural' | 'bold' | 'editorial'
export type ColorFamily = 'warm-cream' | 'earth' | 'dark-luxury' | 'fresh-green' | 'clean-white' | 'vibrant' | 'soft-pink' | 'midnight-blue'
export type FontMood = 'elegant' | 'casual' | 'modern' | 'natural' | 'serif-heavy'

export interface FontPairing {
  headlineFont: string   // hero title, section-title, step numbers
  storyFont: string      // brand_story, sensory sections
  bodyFont: string       // 본문, 리스트, 설명 (가독성 최우선)
  accentFont: string     // CTA, 라벨, 작은 callout
  rationale: string      // 조합 근거 (디버깅·문서용)
}

export interface DetailTemplate {
  id: string
  name: string
  description: string             // 한 줄 설명 (Art Director 프롬프트에 삽입)
  category: string                // food | beauty | electronics
  visualTone: VisualTone
  colorFamily: ColorFamily
  fontMood: FontMood
  fontPairing: FontPairing        // 검증된 폰트 조합 (Art Director 판단 배제)
  sectionSequence: string[]       // 권장 섹션 타입 순서 (8~10개)
  patternOverrides: Partial<Record<string, LayoutPatternType>>  // 기본값 오버라이드
  artDirectorHints: string        // Art Director에게 전달할 디자인 방향 메모

  // ── v6 검증 메타 (선택 — 실제 레퍼런스에서 추출한 템플릿용) ──
  validatedAt?: string            // 검수 완료 ISO 날짜. 빈 문자열/미설정 = 미검수(설계 의도 단계)
  validatedBy?: string            // 검수자명 또는 "auto-eval"
  originReference?: string        // 추출 근거가 된 레퍼런스 이미지/분석 경로
  colorTokens?: {                 // 레퍼런스에서 추출한 실제 색 (fidelity 채점용)
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
}
