/**
 * Agent: HTML Builder
 * StyleGuide.layoutPatterns 기반 7개 패턴 + 스타일링샷/레이어이미지 활용
 * PRD design-guide-v3.md 기준: section-title 42px/700, 배경색 교차, 구분선 없음
 */

import { saveJson, timer, escapeHtml } from './utils'
import type { StyleGuide, RefinedCopy, Script, ScriptSection, AgentResult, LayoutPattern, OverlayStrategy, CardStyle } from './types'
import type { IconMappingJson } from './icon-mapper'
import { getTemplateById } from './templates/index'
import * as fs from 'fs'
import * as path from 'path'

type CopySection = RefinedCopy['sections'][number]

// ── v5 헬퍼: layoutPattern 조회 ──────────────────────────────────
function findLayoutPattern(sg: StyleGuide, sectionType: string): LayoutPattern | undefined {
  return sg.layoutPatterns.find(p => p.section.toLowerCase() === sectionType.toLowerCase())
}

// ── v5: section_${type}_{role} 키로 layer image 경로 조회 ────────
function getLayerAssetUrl(
  sectionType: string,
  role: 'background' | 'frame' | 'accent',
  imageRelPaths: Record<string, string>
): string | null {
  const slug = sectionType.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  const roleKey = `section_${slug}_${role}`
  if (imageRelPaths[roleKey]) return imageRelPaths[roleKey]

  // background: legacy 호환 (이전 v5는 section_X 단일 키 사용)
  if (role === 'background') {
    const legacyKey = `section_${slug}`
    if (imageRelPaths[legacyKey]) return imageRelPaths[legacyKey]
    if (sectionType.toLowerCase() === 'hero' && imageRelPaths.heroBackground) return imageRelPaths.heroBackground
    if ((sectionType.toLowerCase() === 'sensory' || sectionType.toLowerCase() === 'break') && imageRelPaths.breakImage) return imageRelPaths.breakImage
  }
  return null
}

function getLayerBgUrl(sectionType: string, imageRelPaths: Record<string, string>): string | null {
  return getLayerAssetUrl(sectionType, 'background', imageRelPaths)
}

// ── 섹션타입별 의미론적 이미지 배정 맵 ──────────────────────────────

const SECTION_IMAGE_MAP: Record<string, string> = {
  hero:            'heroBg',
  hero_main:       'heroBg',
  photo_gallery:   'shot0',
  sensory:         'breakImage',
  break:           'breakImage',
  texture_focus:   'shot1',
  close_up:        'shot2',
  ingredients:     'shot2',
  packaging:       'shot3',
  gift_suggestion: 'shot4',
  delivery:        'shot5',
  delivery_info:   'shot5',
  brand_story:     'shot1',
  story:           'shot1',
  social_proof:    'shot2',
  reviews:         'shot2',
  certifications:  'shot3',
  usage:           'shot1',
  process:         'shot0',
  features:        'shot1',
  size_comparison: 'shot4',
  cta:             'heroWithTypo',
  faq:             'shot5',
}

function resolveImageForSection(
  sectionType: string,
  imageRelPaths: Record<string, string>,
  fallbackIdx: number
): string {
  // 1. concept shot (Art Director이 targetSection으로 지정한 이미지 우선)
  const conceptKey = `section_${sectionType.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`
  if (imageRelPaths[conceptKey]) return imageRelPaths[conceptKey]
  // 2. 의미론적 고정 맵
  const key = SECTION_IMAGE_MAP[sectionType.toLowerCase()]
  if (key && imageRelPaths[key]) return imageRelPaths[key]
  // 3. 순환 fallback
  const fallbackKey = `shot${fallbackIdx % 6}`
  return imageRelPaths[fallbackKey] ?? imageRelPaths.shot0 ?? ''
}

function hasMinimalContent(copySection: CopySection): boolean {
  return !!(copySection.body || (copySection.items && copySection.items.length > 0))
}

function buildBackgroundStyleMap(styleGuide: StyleGuide): Map<string, string> {
  const map = new Map<string, string>()
  for (const lp of styleGuide.layoutPatterns) {
    if (lp.backgroundStyle) {
      map.set(lp.section.toLowerCase(), lp.backgroundStyle)
    }
  }
  return map
}

function isDarkBackground(style: string): boolean {
  if (!style || style === 'image') return false
  const s = style.toLowerCase()
  // 모든 hex 색상을 추출해 휘도(luminance) 계산 — 평균 < 0.35면 어두운 배경
  const hexColors = s.match(/#[0-9a-f]{6}/g)
  if (hexColors && hexColors.length > 0) {
    const avgLuminance = hexColors.reduce((sum, hex) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return sum + (0.299 * r + 0.587 * g + 0.114 * b) / 255
    }, 0) / hexColors.length
    return avgLuminance < 0.35
  }
  return s.includes('dark')
}

// ── 패턴 매핑 ────────────────────────────────────────────────────

function buildPatternMap(styleGuide: StyleGuide): Map<string, string> {
  const map = new Map<string, string>()
  for (const lp of styleGuide.layoutPatterns) {
    map.set(lp.section.toLowerCase(), lp.pattern)
  }
  return map
}

function resolvePattern(
  sectionType: string,
  patternMap: Map<string, string>,
  sectionIndex: number,
  templateOverrides?: Partial<Record<string, string>>
): string {
  // 0. 템플릿 오버라이드 최우선 적용
  if (templateOverrides && templateOverrides[sectionType]) return templateOverrides[sectionType]!
  // 1. 정확히 일치
  if (patternMap.has(sectionType.toLowerCase())) return patternMap.get(sectionType.toLowerCase())!
  // 2. 부분 포함
  for (const [key, pattern] of patternMap) {
    if (key.includes(sectionType.toLowerCase()) || sectionType.toLowerCase().includes(key)) return pattern
  }
  // 3. sectionType 기본값
  const defaults: Record<string, string> = {
    // ── 기존 패턴 ──
    hero: 'full-bleed-hero',
    story: 'dark-story-centered',
    brand_story: 'split-text-heavy',
    process: 'numbered-steps-horizontal',
    cta: 'dark-story-centered',
    features: 'icon-feature-row',
    benefits: 'grid-info-cards',
    certifications: 'grid-info-cards',
    social_proof: 'testimonial-quote',
    ingredients: 'grid-info-cards',
    usage: 'numbered-steps-horizontal',
    how_to_use: 'timeline-vertical',
    packaging: 'grid-info-cards',
    delivery: 'grid-info-cards',
    package_info: 'grid-info-cards',
    photo_gallery: 'masonry-gallery',
    gallery: 'masonry-gallery',
    sensory: 'full-bleed-sensory',
    texture_focus: 'full-bleed-sensory',
    break: 'full-bleed-overlay',
    size_comparison: 'comparison-table',
    quality_assurance: 'centered-statement',
    faq: 'grid-info-cards',
    gift_suggestion: 'right-image-left-text',
    // ── 신규 패턴 전용 섹션 타입 ──
    testimonials: 'testimonial-quote',
    reviews: 'testimonial-quote',
    comparison: 'comparison-table',
    timeline: 'timeline-vertical',
    history: 'timeline-vertical',
    key_benefit: 'icon-feature-row',
    highlight: 'centered-statement',
    philosophy: 'centered-statement',
    slogan: 'centered-statement',
  }
  if (defaults[sectionType]) return defaults[sectionType]
  // 4. 인덱스 교차 (split 계열 자동 좌우 교대)
  return sectionIndex % 2 === 0 ? 'left-image-right-text' : 'right-image-left-text'
}

function sectionBgClass(pattern: string, sectionIndex: number): string {
  if (pattern === 'dark-story-centered') return 'bg-dark'
  if (pattern === 'full-bleed-hero' || pattern === 'full-bleed-sensory') return 'bg-none'
  const cycle = ['bg-white', 'bg-cream', 'bg-warm', 'bg-white']
  return cycle[sectionIndex % cycle.length]
}

// ── 아이콘 헬퍼 ──────────────────────────────────────────────────

function mkIcon(icons: string[], iconWeight: string, iconColor: string, iconSize: number, idx = 0): string {
  const n = icons[idx] ?? icons[0] ?? 'star'
  return `<i class="ph-${iconWeight} ph-${n}" style="color:${iconColor};font-size:${iconSize}px"></i>`
}

// ── 7개 레이아웃 패턴 구현 ────────────────────────────────────────

function renderFullBleedHero(
  copySection: CopySection,
  imageRelPaths: Record<string, string>
): string {
  return `
  <!-- HERO -->
  <section class="section-hero bg-none">
    <div class="hero-image-wrap">
      <img src="${imageRelPaths.heroWithTypo ?? ''}" alt="${copySection.headline}" loading="eager" fetchpriority="high">
    </div>
  </section>`
}

function renderLeftImageRightText(
  copySection: CopySection,
  scriptSection: ScriptSection | undefined,
  icons: string[], iconWeight: string, iconColor: string, iconSize: number,
  imageRelPaths: Record<string, string>,
  shotIndex: number,
  bgClass: string
): string {
  const imgSrc = resolveImageForSection(copySection.sectionType, imageRelPaths, shotIndex)
  const items = copySection.items ?? []

  return `
  <!-- LEFT-IMAGE-RIGHT-TEXT -->
  <section class="split-section ${bgClass}">
    <div class="split-image">
      ${imgSrc ? `<img src="${imgSrc}" alt="${copySection.headline}" loading="lazy">` : '<div class="split-placeholder"></div>'}
    </div>
    <div class="split-content">
      <p class="section-eyebrow">${copySection.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
      ${copySection.body ? `<p class="body-text">${copySection.body}</p>` : ''}
      ${items.length > 0
        ? `<ul class="split-list">${items.map((item, i) => `<li>${mkIcon(icons, iconWeight, iconColor, 18, i % icons.length)} <span><strong>${item.label}</strong>${item.value ? ` — ${item.value}` : ''}</span></li>`).join('')}</ul>`
        : ''
      }
    </div>
  </section>`
}

function renderRightImageLeftText(
  copySection: CopySection,
  scriptSection: ScriptSection | undefined,
  icons: string[], iconWeight: string, iconColor: string, iconSize: number,
  imageRelPaths: Record<string, string>,
  shotIndex: number,
  bgClass: string
): string {
  const imgSrc = resolveImageForSection(copySection.sectionType, imageRelPaths, shotIndex)
  const items = copySection.items ?? []

  return `
  <!-- RIGHT-IMAGE-LEFT-TEXT -->
  <section class="split-section reverse ${bgClass}">
    <div class="split-image">
      ${imgSrc ? `<img src="${imgSrc}" alt="${copySection.headline}" loading="lazy">` : '<div class="split-placeholder"></div>'}
    </div>
    <div class="split-content">
      <p class="section-eyebrow">${copySection.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
      ${copySection.body ? `<p class="body-text">${copySection.body}</p>` : ''}
      ${items.length > 0
        ? `<ul class="split-list">${items.map((item, i) => `<li>${mkIcon(icons, iconWeight, iconColor, 18, i % icons.length)} <span><strong>${item.label}</strong>${item.value ? ` — ${item.value}` : ''}</span></li>`).join('')}</ul>`
        : ''
      }
    </div>
  </section>`
}

function renderFullBleedSensory(
  copySection: CopySection,
  imageRelPaths: Record<string, string>
): string {
  const imgSrc = imageRelPaths.breakImage ?? imageRelPaths.shot2 ?? ''
  return `
  <!-- FULL-BLEED-SENSORY -->
  <section class="sensory-section bg-none">
    ${imgSrc ? `<img src="${imgSrc}" alt="${copySection.headline}" loading="lazy">` : ''}
    <div class="sensory-overlay">
      <div class="sensory-text">
        <h2 class="section-title">${copySection.headline}</h2>
        ${copySection.subheadline ? `<p class="sensory-sub">${copySection.subheadline}</p>` : ''}
        ${copySection.body ? `<p class="sensory-body">${copySection.body}</p>` : ''}
      </div>
    </div>
  </section>`
}

function renderDarkStoryCentered(
  sectionType: string,
  copySection: CopySection,
  scriptSection: ScriptSection | undefined,
  imageRelPaths: Record<string, string>,
  backgroundStyle?: string
): string {
  if (sectionType === 'cta') {
    const urgency = (scriptSection as any)?.urgency ?? ''
    const ctaBg = (backgroundStyle && backgroundStyle !== 'image')
      ? `background:${backgroundStyle}`
      : 'background:var(--color-text-dark)'
    return `
  <!-- CTA -->
  <section class="section-cta dark-section" style="${ctaBg}">
    <div class="cta-inner">
      ${urgency ? `<p class="cta-urgency">${urgency}</p>` : ''}
      <h2 class="cta-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="cta-sub">${copySection.subheadline}</p>` : ''}
      <div class="cta-divider"></div>
      ${copySection.body ? `<p class="cta-tagline">${copySection.body}</p>` : ''}
    </div>
  </section>`
  }

  // brand story — backgroundStyle CSS 우선, fallback 어두운 색
  const storyBg = (backgroundStyle && backgroundStyle !== 'image')
    ? `background:${backgroundStyle}`
    : 'background:linear-gradient(135deg,#3B2106 0%,#1a0f04 100%)'
  return `
  <!-- DARK-STORY-CENTERED -->
  <section class="section-story bg-none">
    <div class="story-bg dark-section" style="${storyBg}; min-height: auto">
      <div class="story-content">
        <div class="story-quote">"</div>
        <h2 class="story-title">${copySection.headline}</h2>
        <p class="story-body">${copySection.body ?? copySection.subheadline ?? ''}</p>
      </div>
    </div>
  </section>`
}

function renderNumberedStepsHorizontal(
  copySection: CopySection,
  scriptSection: ScriptSection | undefined,
  imageRelPaths: Record<string, string>,
  shotIndex: number,
  bgStyle: string,
  isDark: boolean
): string {
  const copyItems = copySection.items ?? []
  const scriptSteps: string[] = (scriptSection as any)?.steps ?? []

  const displayItems = copyItems.length > 0
    ? copyItems.map((item, i) => ({ num: String(i + 1).padStart(2, '0'), label: item.label, body: item.value ?? '' }))
    : scriptSteps.map((step, i) => ({ num: String(i + 1).padStart(2, '0'), label: '', body: step }))

  const imgSrc = resolveImageForSection(copySection.sectionType, imageRelPaths, shotIndex)
  const sectionClass = `steps-section${isDark ? ' dark-section' : ''}`
  const styleAttr = bgStyle ? ` style="background:${bgStyle}"` : ''

  return `
  <!-- NUMBERED-STEPS-HORIZONTAL -->
  <section class="${sectionClass}"${styleAttr}>
    ${imgSrc ? `<div class="steps-image-header"><img src="${imgSrc}" alt="${copySection.headline}" loading="lazy"></div>` : ''}
    <div class="steps-content-area">
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
      <div class="steps-horizontal">
        ${displayItems.map((item) => `
        <div class="step-h-item">
          <div class="step-h-number">${item.num}</div>
          <div class="step-h-text">
            ${item.label ? `<h3 class="step-h-title">${item.label}</h3>` : ''}
            <p class="step-h-body">${item.body}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>`
}

function renderGridInfoCards(
  copySection: CopySection,
  scriptSection: ScriptSection | undefined,
  icons: string[], iconWeight: string, iconColor: string, iconSize: number,
  imageRelPaths: Record<string, string>,
  shotIndex: number,
  bgStyle: string,
  isDark: boolean,
  sectionType = ''
): string {
  const rawItems: unknown[] = (scriptSection as any)?.items ?? []
  const stringItems = rawItems.filter((i): i is string => typeof i === 'string')
  const copyItems = copySection.items ?? []

  const displayItems: { label: string; value: string }[] =
    copyItems.length > 0
      ? copyItems
      : stringItems.map((s) => ({ label: s, value: '' }))

  const imgSrc = resolveImageForSection(copySection.sectionType, imageRelPaths, shotIndex)
  const sectionClass = `grid-section${isDark ? ' dark-section' : ''}`
  const styleAttr = bgStyle ? ` style="background:${bgStyle}"` : ''

  return `
  <!-- GRID-INFO-CARDS -->
  <section class="${sectionClass}"${styleAttr}>
    ${imgSrc ? `<div class="grid-image-header"><img src="${imgSrc}" alt="${copySection.headline}" loading="lazy"></div>` : ''}
    <div class="grid-content-area">
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
      <div class="info-grid">
        ${displayItems.map((item, i) => `
        <div class="info-card">
          ${['ingredients', 'components', 'recipe'].includes(sectionType)
            ? `<div class="info-badge">${String(i + 1).padStart(2, '0')}</div>`
            : `<div class="info-icon">${mkIcon(icons, iconWeight, iconColor, iconSize, i % icons.length)}</div>`
          }
          <h3 class="info-title">${item.label}</h3>
          ${item.value ? `<p class="info-body">${item.value}</p>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>`
}

// ── 패턴 라우터 ───────────────────────────────────────────────────

let shotUsageCount = 0      // 스타일링샷 순환 인덱스 (모듈 레벨)
let gridThemeCounter = 0    // grid 섹션 테마 순환
let stepsThemeCounter = 0   // steps 섹션 테마 순환

function renderPhotoGalleryStrip(
  copySection: CopySection,
  imageRelPaths: Record<string, string>,
  bgClass: string
): string {
  const s = [0, 1, 2].map((offset) =>
    imageRelPaths[`shot${(shotUsageCount + offset) % 6}`] ?? ''
  )
  shotUsageCount += 3

  return `
  <!-- PHOTO-GALLERY-STRIP -->
  <section class="gallery-strip ${bgClass}">
    ${copySection.headline ? `
    <div class="gallery-header">
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
    </div>` : ''}
    <div class="gallery-grid-3">
      ${s.map((src) => src ? `<div class="gallery-item"><img src="${src}" loading="lazy"></div>` : '').join('')}
    </div>
  </section>`
}

// ── 신규 패턴 8종 ─────────────────────────────────────────────────

function renderMasonryGallery(
  copySection: CopySection,
  imageRelPaths: Record<string, string>,
  bgClass: string
): string {
  const shots = [0, 1, 2, 3].map((i) => imageRelPaths[`shot${i}`] ?? '')
  return `
  <!-- MASONRY-GALLERY -->
  <section class="masonry-section ${bgClass}">
    ${copySection.headline ? `<div class="masonry-header">
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
    </div>` : ''}
    <div class="masonry-grid">
      ${shots[0] ? `<div class="masonry-item masonry-tall"><img src="${shots[0]}" loading="lazy"></div>` : ''}
      <div class="masonry-col">
        ${shots[1] ? `<div class="masonry-item"><img src="${shots[1]}" loading="lazy"></div>` : ''}
        ${shots[2] ? `<div class="masonry-item"><img src="${shots[2]}" loading="lazy"></div>` : ''}
      </div>
    </div>
  </section>`
}

function renderSplitTextHeavy(
  copySection: CopySection,
  icons: string[], iconWeight: string, iconColor: string, iconSize: number,
  imageRelPaths: Record<string, string>,
  shotIndex: number,
  bgClass: string
): string {
  const imgSrc = resolveImageForSection(copySection.sectionType, imageRelPaths, shotIndex)
  const items = copySection.items ?? []
  return `
  <!-- SPLIT-TEXT-HEAVY -->
  <section class="split-heavy ${bgClass}">
    <div class="split-heavy-image">
      ${imgSrc ? `<img src="${imgSrc}" alt="${copySection.headline}" loading="lazy">` : '<div class="split-placeholder"></div>'}
    </div>
    <div class="split-heavy-text">
      <p class="section-eyebrow">${copySection.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
      ${copySection.body ? `<p class="body-text">${copySection.body}</p>` : ''}
      ${items.length > 0
        ? `<ul class="split-list">${items.map((item, i) => `<li>${mkIcon(icons, iconWeight, iconColor, 18, i % icons.length)} <span><strong>${item.label}</strong>${item.value ? ` — ${item.value}` : ''}</span></li>`).join('')}</ul>`
        : ''}
    </div>
  </section>`
}

function renderCenteredStatement(
  copySection: CopySection,
  bgStyle: string
): string {
  const styleAttr = bgStyle ? ` style="background:${bgStyle}"` : ''
  return `
  <!-- CENTERED-STATEMENT -->
  <section class="statement-section"${styleAttr}>
    <div class="statement-inner">
      <p class="section-eyebrow">${copySection.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
      <h2 class="statement-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="statement-sub">${copySection.subheadline}</p>` : ''}
      <div class="statement-divider"></div>
      ${copySection.body ? `<p class="statement-body">${copySection.body}</p>` : ''}
    </div>
  </section>`
}

function renderIconFeatureRow(
  copySection: CopySection,
  icons: string[], iconWeight: string, iconColor: string, iconSize: number,
  bgStyle: string,
  isDark: boolean
): string {
  const items = copySection.items ?? []
  const sectionClass = `feature-row-section${isDark ? ' dark-section' : ''}`
  const styleAttr = bgStyle ? ` style="background:${bgStyle}"` : ''
  return `
  <!-- ICON-FEATURE-ROW -->
  <section class="${sectionClass}"${styleAttr}>
    <div class="feature-row-head">
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
    </div>
    <div class="feature-row-cols">
      ${items.map((item, i) => `
      <div class="feature-col">
        <div class="feature-icon">${mkIcon(icons, iconWeight, iconColor, iconSize, i % icons.length)}</div>
        <h3 class="feature-col-title">${item.label}</h3>
        ${item.value ? `<p class="feature-col-body">${item.value}</p>` : ''}
      </div>`).join('')}
    </div>
  </section>`
}

function renderComparisonTable(
  copySection: CopySection,
  bgClass: string
): string {
  const items = copySection.items ?? []
  return `
  <!-- COMPARISON-TABLE -->
  <section class="compare-section ${bgClass}">
    <div class="compare-head-area">
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
    </div>
    <div class="compare-table">
      <div class="compare-header-row">
        <div class="compare-cell compare-label-cell"></div>
        <div class="compare-cell compare-general">일반 제품</div>
        <div class="compare-cell compare-us">우리 제품</div>
      </div>
      ${items.map((item) => {
        const parts = item.value.split('|')
        const general = parts[0]?.trim() ?? '—'
        const ours = parts[1]?.trim() ?? item.value
        return `
      <div class="compare-row">
        <div class="compare-cell compare-label-cell">${item.label}</div>
        <div class="compare-cell compare-general">${general}</div>
        <div class="compare-cell compare-us">${ours}</div>
      </div>`
      }).join('')}
    </div>
  </section>`
}

function renderTimelineVertical(
  copySection: CopySection,
  bgStyle: string,
  isDark: boolean
): string {
  const items = copySection.items ?? []
  const sectionClass = `timeline-section${isDark ? ' dark-section' : ''}`
  const styleAttr = bgStyle ? ` style="background:${bgStyle}"` : ''
  return `
  <!-- TIMELINE-VERTICAL -->
  <section class="${sectionClass}"${styleAttr}>
    <div class="timeline-head">
      <h2 class="section-title">${copySection.headline}</h2>
      ${copySection.subheadline ? `<p class="section-sub">${copySection.subheadline}</p>` : ''}
    </div>
    <div class="timeline">
      ${items.map((item, i) => `
      <div class="timeline-item">
        <div class="timeline-marker">
          <div class="timeline-dot"></div>
          ${i < items.length - 1 ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-content">
          <h3 class="timeline-title">${item.label}</h3>
          ${item.value ? `<p class="timeline-body">${item.value}</p>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </section>`
}

function renderFullBleedOverlay(
  copySection: CopySection,
  imageRelPaths: Record<string, string>,
  shotIndex: number
): string {
  const imgSrc = resolveImageForSection(copySection.sectionType, imageRelPaths, shotIndex)
  return `
  <!-- FULL-BLEED-OVERLAY -->
  <section class="overlay-section bg-none">
    ${imgSrc ? `<img src="${imgSrc}" alt="${copySection.headline}" loading="lazy">` : ''}
    <div class="overlay-center">
      <div class="overlay-text">
        <h2 class="section-title">${copySection.headline}</h2>
        ${copySection.subheadline ? `<p class="sensory-sub">${copySection.subheadline}</p>` : ''}
        ${copySection.body ? `<p class="sensory-body">${copySection.body}</p>` : ''}
      </div>
    </div>
  </section>`
}

function renderTestimonialQuote(
  copySection: CopySection,
  bgStyle: string
): string {
  const styleAttr = bgStyle ? ` style="background:${bgStyle}"` : ''
  return `
  <!-- TESTIMONIAL-QUOTE -->
  <section class="testimonial-section"${styleAttr}>
    <div class="testimonial-inner">
      <div class="testimonial-quote-mark">"</div>
      <p class="testimonial-text">${copySection.body ?? copySection.subheadline ?? ''}</p>
      <div class="testimonial-divider"></div>
      <p class="testimonial-source">${copySection.headline}</p>
    </div>
  </section>`
}

// Art Director가 backgroundStyle 미지정 시 fallback 배경 목록
const FALLBACK_GRID_BACKGROUNDS = [
  'linear-gradient(135deg,#fdf6ec 0%,#f5e6cc 100%)',
  'linear-gradient(160deg,#1a2a1a 0%,#2d3e2d 100%)',
  'linear-gradient(135deg,#fff8f0 0%,#fde8d0 100%)',
  'linear-gradient(160deg,#0d1117 0%,#1c2333 100%)',
]
const FALLBACK_STEPS_BACKGROUNDS = [
  '#fafaf8',
  'linear-gradient(180deg,#1a1a1a 0%,#2a2a2a 100%)',
  'linear-gradient(135deg,#e8e4dc 0%,#d4cfc6 100%)',
]

function buildLayoutSection(
  sectionType: string,
  copySection: CopySection,
  scriptSection: ScriptSection | undefined,
  iconMapping: IconMappingJson,
  imageRelPaths: Record<string, string>,
  pattern: string,
  sectionIndex: number,
  backgroundStyle?: string,
  styleGuide?: StyleGuide
): string {
  const icons = iconMapping.sections[sectionType] ?? iconMapping.sections['features'] ?? ['star']
  const iconWeight = iconMapping.weight
  const iconColor = iconMapping.color
  const iconSize = iconMapping.size
  const bgClass = sectionBgClass(pattern, sectionIndex)

  // ── v5 디스패치 우선: bgType==='layer-image' && overlayStrategy 있으면 v5 렌더 사용 ──
  if (styleGuide) {
    const lp = findLayoutPattern(styleGuide, sectionType)
    const v5 = tryV5Render(lp, copySection, scriptSection, iconMapping, imageRelPaths, sectionType)
    if (v5) return v5
  }

  switch (pattern) {
    case 'full-bleed-hero':
      return renderFullBleedHero(copySection, imageRelPaths)

    case 'left-image-right-text': {
      const idx = shotUsageCount++
      return renderLeftImageRightText(copySection, scriptSection, icons, iconWeight, iconColor, iconSize, imageRelPaths, idx, bgClass)
    }

    case 'right-image-left-text': {
      const idx = shotUsageCount++
      return renderRightImageLeftText(copySection, scriptSection, icons, iconWeight, iconColor, iconSize, imageRelPaths, idx, bgClass)
    }

    case 'full-bleed-sensory':
      return renderFullBleedSensory(copySection, imageRelPaths)

    case 'dark-story-centered':
      return renderDarkStoryCentered(sectionType, copySection, scriptSection, imageRelPaths, backgroundStyle)

    case 'numbered-steps-horizontal': {
      if (!hasMinimalContent(copySection)) {
        return renderFullBleedSensory(copySection, imageRelPaths)
      }
      const idx = shotUsageCount++
      const bg = (backgroundStyle && backgroundStyle !== 'image')
        ? backgroundStyle
        : FALLBACK_STEPS_BACKGROUNDS[stepsThemeCounter++ % FALLBACK_STEPS_BACKGROUNDS.length]
      return renderNumberedStepsHorizontal(copySection, scriptSection, imageRelPaths, idx, bg, isDarkBackground(bg))
    }

    case 'grid-info-cards': {
      const idx = shotUsageCount++
      const bg = (backgroundStyle && backgroundStyle !== 'image')
        ? backgroundStyle
        : FALLBACK_GRID_BACKGROUNDS[gridThemeCounter++ % FALLBACK_GRID_BACKGROUNDS.length]
      return renderGridInfoCards(copySection, scriptSection, icons, iconWeight, iconColor, iconSize, imageRelPaths, idx, bg, isDarkBackground(bg), sectionType)
    }

    case 'photo-gallery-strip':
      return renderPhotoGalleryStrip(copySection, imageRelPaths, bgClass)

    // ── 신규 8종 ──────────────────────────────────────────────────
    case 'masonry-gallery':
      return renderMasonryGallery(copySection, imageRelPaths, bgClass)

    case 'split-text-heavy': {
      const idx = shotUsageCount++
      return renderSplitTextHeavy(copySection, icons, iconWeight, iconColor, iconSize, imageRelPaths, idx, bgClass)
    }

    case 'centered-statement': {
      const bg = (backgroundStyle && backgroundStyle !== 'image')
        ? backgroundStyle
        : FALLBACK_GRID_BACKGROUNDS[gridThemeCounter++ % FALLBACK_GRID_BACKGROUNDS.length]
      return renderCenteredStatement(copySection, bg)
    }

    case 'icon-feature-row': {
      const bg = (backgroundStyle && backgroundStyle !== 'image')
        ? backgroundStyle
        : FALLBACK_GRID_BACKGROUNDS[gridThemeCounter++ % FALLBACK_GRID_BACKGROUNDS.length]
      return renderIconFeatureRow(copySection, icons, iconWeight, iconColor, iconSize, bg, isDarkBackground(bg))
    }

    case 'comparison-table':
      return renderComparisonTable(copySection, bgClass)

    case 'timeline-vertical': {
      const bg = (backgroundStyle && backgroundStyle !== 'image')
        ? backgroundStyle
        : FALLBACK_STEPS_BACKGROUNDS[stepsThemeCounter++ % FALLBACK_STEPS_BACKGROUNDS.length]
      return renderTimelineVertical(copySection, bg, isDarkBackground(bg))
    }

    case 'full-bleed-overlay': {
      const idx = shotUsageCount++
      return renderFullBleedOverlay(copySection, imageRelPaths, idx)
    }

    case 'testimonial-quote': {
      const bg = (backgroundStyle && backgroundStyle !== 'image')
        ? backgroundStyle
        : FALLBACK_GRID_BACKGROUNDS[gridThemeCounter++ % FALLBACK_GRID_BACKGROUNDS.length]
      return renderTestimonialQuote(copySection, bg)
    }

    default: {
      if (!hasMinimalContent(copySection)) {
        return renderFullBleedSensory(copySection, imageRelPaths)
      }
      const idx = shotUsageCount++
      const bg = (backgroundStyle && backgroundStyle !== 'image')
        ? backgroundStyle
        : FALLBACK_GRID_BACKGROUNDS[gridThemeCounter++ % FALLBACK_GRID_BACKGROUNDS.length]
      return renderGridInfoCards(copySection, scriptSection, icons, iconWeight, iconColor, iconSize, imageRelPaths, idx, bg, isDarkBackground(bg))
    }
  }
}

/** 생성된 HTML의 <section> 태그에 에디터용 data-* 속성 주입 */
function injectEditorDataAttrs(html: string, sectionType: string, sectionIndex: number, pattern: string): string {
  return html.replace(
    /<section(\s)/,
    `<section data-section-type="${sectionType}" data-section-index="${sectionIndex}" data-pattern="${pattern}" data-editable="true"$1`
  )
}

// ── CSS ───────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// v5 — 3-레이어 오버레이 시스템 렌더러
// 배경(CSS background-image) + 카드(HTML/SVG) + 텍스트(vector)
// ─────────────────────────────────────────────────────────────────

function v5SectionWrap(
  bgUrl: string | null,
  bgFallback: string | undefined,
  cardClass: string,
  innerHtml: string,
  isDark: boolean,
  alignClass: string
): string {
  const bgStyle = bgUrl
    ? `background-image:url('${bgUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;`
    : (bgFallback && bgFallback !== 'image' ? `background:${bgFallback};` : '')
  const sectionClass = `v5-section ${isDark ? 'dark-section' : ''} ${alignClass}`.trim()
  // frame/accent overlays는 tryV5Render의 injectV5Overlays에서 후주입.
  return `
  <!-- v5: ${cardClass} -->
  <section class="${sectionClass}" style="${bgStyle}">
    <div class="v5-section-inner">
      ${innerHtml}
    </div>
  </section>`
}

function v5CardClassNames(cardStyle: CardStyle | undefined, strategy: OverlayStrategy): string {
  const style = cardStyle ?? 'elevated'
  return `v5-card v5-card--${style} v5-card--${strategy}`
}

function v5RenderItems(items: { label: string; value: string }[] | undefined): string {
  if (!items || items.length === 0) return ''
  return `<ul class="v5-list">${items.map(it => `
        <li class="v5-list-item">
          <span class="v5-list-label">${it.label}</span>
          <span class="v5-list-value">${it.value}</span>
        </li>`).join('')}</ul>`
}

function v5RenderCenterCard(
  copy: CopySection,
  cardStyle: CardStyle | undefined,
  bgUrl: string | null,
  bgFallback: string | undefined,
  isDark: boolean
): string {
  const cardCls = v5CardClassNames(cardStyle, 'center-card')
  const inner = `
      <article class="${cardCls}">
        <p class="v5-eyebrow">${copy.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
        <h2 class="v5-title">${copy.headline}</h2>
        ${copy.subheadline ? `<p class="v5-sub">${copy.subheadline}</p>` : ''}
        ${copy.body ? `<p class="v5-body">${copy.body}</p>` : ''}
        ${v5RenderItems(copy.items)}
      </article>`
  return v5SectionWrap(bgUrl, bgFallback, 'center-card', inner, isDark, 'v5-align-center')
}

function v5RenderSideCard(
  copy: CopySection,
  cardStyle: CardStyle | undefined,
  bgUrl: string | null,
  bgFallback: string | undefined,
  isDark: boolean,
  side: 'left' | 'right'
): string {
  const cardCls = v5CardClassNames(cardStyle, 'side-card') + ` v5-side-${side}`
  const inner = `
      <article class="${cardCls}">
        <p class="v5-eyebrow">${copy.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
        <h2 class="v5-title">${copy.headline}</h2>
        ${copy.subheadline ? `<p class="v5-sub">${copy.subheadline}</p>` : ''}
        ${copy.body ? `<p class="v5-body">${copy.body}</p>` : ''}
        ${v5RenderItems(copy.items)}
      </article>`
  return v5SectionWrap(bgUrl, bgFallback, 'side-card', inner, isDark, `v5-align-${side}`)
}

function v5RenderSplitCard(
  copy: CopySection,
  cardStyle: CardStyle | undefined,
  bgUrl: string | null,
  bgFallback: string | undefined,
  isDark: boolean,
  imgSrc: string
): string {
  const cardCls = v5CardClassNames(cardStyle, 'split-card')
  const inner = `
      <div class="v5-split">
        <div class="v5-split-img">
          ${imgSrc ? `<img src="${imgSrc}" alt="${copy.headline}" loading="lazy">` : ''}
        </div>
        <article class="${cardCls}">
          <p class="v5-eyebrow">${copy.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
          <h2 class="v5-title">${copy.headline}</h2>
          ${copy.subheadline ? `<p class="v5-sub">${copy.subheadline}</p>` : ''}
          ${copy.body ? `<p class="v5-body">${copy.body}</p>` : ''}
          ${v5RenderItems(copy.items)}
        </article>
      </div>`
  return v5SectionWrap(bgUrl, bgFallback, 'split-card', inner, isDark, 'v5-align-stretch')
}

function v5RenderFullBleed(
  copy: CopySection,
  bgUrl: string | null,
  bgFallback: string | undefined,
  isDark: boolean
): string {
  const cardCls = 'v5-card v5-card--none v5-card--full-bleed'
  const inner = `
      <div class="${cardCls}">
        <p class="v5-eyebrow">${copy.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
        <h2 class="v5-title">${copy.headline}</h2>
        ${copy.subheadline ? `<p class="v5-sub">${copy.subheadline}</p>` : ''}
        ${copy.body ? `<p class="v5-body">${copy.body}</p>` : ''}
      </div>`
  return v5SectionWrap(bgUrl, bgFallback, 'full-bleed', inner, isDark, 'v5-align-center')
}

function v5RenderStackedCards(
  copy: CopySection,
  scriptSec: ScriptSection | undefined,
  cardStyle: CardStyle | undefined,
  bgUrl: string | null,
  bgFallback: string | undefined,
  isDark: boolean
): string {
  const cardCls = v5CardClassNames(cardStyle, 'stacked-cards')
  const items = copy.items ?? []
  const steps = scriptSec?.steps ?? []
  const useSteps = items.length === 0 && steps.length > 0
  const cards = useSteps
    ? steps.map((s, i) => ({ num: String(i + 1).padStart(2, '0'), label: '', value: s }))
    : items.map((it, i) => ({ num: String(i + 1).padStart(2, '0'), label: it.label, value: it.value }))

  const cardsHtml = cards.map(c => `
        <div class="${cardCls} v5-step">
          <span class="v5-step-num">${c.num}</span>
          <div class="v5-step-body">
            ${c.label ? `<h3 class="v5-step-title">${c.label}</h3>` : ''}
            <p class="v5-step-value">${c.value}</p>
          </div>
        </div>`).join('')

  const inner = `
      <header class="v5-stack-header">
        <p class="v5-eyebrow">${copy.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
        <h2 class="v5-title">${copy.headline}</h2>
        ${copy.subheadline ? `<p class="v5-sub">${copy.subheadline}</p>` : ''}
      </header>
      <div class="v5-stacked">
        ${cardsHtml}
      </div>`
  return v5SectionWrap(bgUrl, bgFallback, 'stacked-cards', inner, isDark, 'v5-align-center')
}

function v5RenderBentoGrid(
  copy: CopySection,
  cardStyle: CardStyle | undefined,
  bgUrl: string | null,
  bgFallback: string | undefined,
  isDark: boolean,
  icons: string[],
  iconWeight: string,
  iconColor: string,
  iconSize: number
): string {
  const cardCls = v5CardClassNames(cardStyle, 'bento-grid')
  const items = copy.items ?? []

  const cardsHtml = items.map((it, i) => `
        <div class="${cardCls} v5-bento-cell">
          <div class="v5-bento-icon">${mkIcon(icons, iconWeight, iconColor, iconSize, i)}</div>
          <h3 class="v5-bento-label">${it.label}</h3>
          <p class="v5-bento-value">${it.value}</p>
        </div>`).join('')

  const inner = `
      <header class="v5-stack-header">
        <p class="v5-eyebrow">${copy.sectionType.toUpperCase().replace(/_/g, ' ')}</p>
        <h2 class="v5-title">${copy.headline}</h2>
        ${copy.subheadline ? `<p class="v5-sub">${copy.subheadline}</p>` : ''}
      </header>
      <div class="v5-bento">
        ${cardsHtml}
      </div>`
  return v5SectionWrap(bgUrl, bgFallback, 'bento-grid', inner, isDark, 'v5-align-center')
}

/** v5 디스패처: bgType==='layer-image' && overlayStrategy 있을 때 v5 렌더 사용 */
/**
 * v5 frame/accent overlay 주입 — 렌더된 섹션 HTML에 추가 PNG 레이어 삽입.
 * 렌더 함수 시그니처를 변경하지 않기 위해 post-render 문자열 치환 방식 사용.
 *
 * 안전성: 첫 <section> 태그 바로 뒤에 frame을 삽입하고, 마지막 </section> 직전에 accent를 삽입.
 * v5 렌더 결과는 항상 단일 <section> 래퍼이지만, 향후 nested section 추가 시에도 외곽 태그만
 * 변경되도록 indexOf/lastIndexOf 사용.
 */
function injectV5Overlays(
  html: string,
  frameUrl: string | null,
  accentUrl: string | null,
  accentPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'
): string {
  if (!frameUrl && !accentUrl) return html

  let result = html
  if (frameUrl) {
    const openMatch = result.match(/<section\b[^>]*>/)
    if (openMatch && openMatch.index !== undefined) {
      const insertAt = openMatch.index + openMatch[0].length
      const overlay = `\n    <div class="v5-frame-overlay"><img src="${frameUrl}" alt=""></div>`
      result = result.slice(0, insertAt) + overlay + result.slice(insertAt)
    }
  }
  if (accentUrl) {
    // 가장 외곽 </section> = 문자열에서 마지막 </section>
    const closeIdx = result.lastIndexOf('</section>')
    if (closeIdx !== -1) {
      const overlay = `  <img class="v5-accent v5-accent--${accentPosition}" src="${accentUrl}" alt="">\n  `
      result = result.slice(0, closeIdx) + overlay + result.slice(closeIdx)
    }
  }
  return result
}

function tryV5Render(
  lp: LayoutPattern | undefined,
  copy: CopySection,
  scriptSec: ScriptSection | undefined,
  iconMapping: IconMappingJson,
  imageRelPaths: Record<string, string>,
  sectionType: string
): string | null {
  if (!lp) return null
  const strategy = lp.overlayStrategy
  if (!strategy) return null
  // bgType==='layer-image'가 핵심 트리거 — 다른 bgType은 기존 시스템 사용
  if (lp.bgType !== 'layer-image') return null

  const bgUrl = getLayerBgUrl(sectionType, imageRelPaths)
  const frameUrl = getLayerAssetUrl(sectionType, 'frame', imageRelPaths)
  const accentUrl = getLayerAssetUrl(sectionType, 'accent', imageRelPaths)
  const bgFallback = lp.backgroundStyle
  const isDark = isDarkBackground(bgFallback ?? '') || strategy === 'full-bleed'
  const cardStyle = lp.cardStyle

  const icons = iconMapping.sections[sectionType] ?? iconMapping.sections['features'] ?? ['star']

  let rendered: string | null = null
  switch (strategy) {
    case 'center-card':
      rendered = v5RenderCenterCard(copy, cardStyle, bgUrl, bgFallback, isDark)
      break
    case 'side-card': {
      const side = lp.textPlacement === 'side-left' ? 'left' : 'right'
      rendered = v5RenderSideCard(copy, cardStyle, bgUrl, bgFallback, isDark, side)
      break
    }
    case 'split-card': {
      const fallbackImg = resolveImageForSection(sectionType, imageRelPaths, shotUsageCount++)
      rendered = v5RenderSplitCard(copy, cardStyle, bgUrl, bgFallback, isDark, fallbackImg)
      break
    }
    case 'full-bleed':
      rendered = v5RenderFullBleed(copy, bgUrl, bgFallback, isDark)
      break
    case 'stacked-cards':
      rendered = v5RenderStackedCards(copy, scriptSec, cardStyle, bgUrl, bgFallback, isDark)
      break
    case 'bento-grid':
      rendered = v5RenderBentoGrid(copy, cardStyle, bgUrl, bgFallback, isDark, icons, iconMapping.weight, iconMapping.color, iconMapping.size)
      break
    default:
      return null
  }

  if (!rendered) return null

  // accent 위치는 textPlacement와 반대편 코너 (텍스트와 충돌 회피)
  const accentPos: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' =
    lp.textPlacement === 'side-right' ? 'top-left'
    : lp.textPlacement === 'side-left' ? 'top-right'
    : lp.textPlacement === 'top' ? 'bottom-right'
    : 'top-right'

  return injectV5Overlays(rendered, frameUrl, accentUrl, accentPos)
}

function buildCSS(sg: StyleGuide): string {
  const c = sg.colors
  const t = sg.typography
  const d = sg.decorativeElements

  return `
:root {
  --color-primary:    ${c.primary};
  --color-secondary:  ${c.secondary};
  --color-surface1:   ${c.surface1};
  --color-surface2:   ${c.surface2};
  --color-surface3:   ${c.surface3};
  --color-text-dark:  ${c.textDark};
  --color-text-light: ${c.textLight};
  --color-accent:     ${c.accent};

  --font-headline: '${t.headlineFont}', 'Black Han Sans', 'Noto Serif KR', serif;
  --font-story:    '${(t as any).storyFont ?? t.headlineFont}', 'Noto Serif KR', serif;
  --font-body:     '${t.bodyFont}', 'Noto Sans KR', sans-serif;
  --font-accent:   '${(t as any).accentFont ?? t.bodyFont}', 'Nanum Myeongjo', serif;

  --size-hero:    clamp(52px, 8vw, 80px);
  --size-h2:      clamp(32px, 5.5vw, 54px);
  --size-h3:      clamp(22px, 3vw, 28px);
  --size-body:    clamp(18px, 2vw, 20px);
  --size-caption: 15px;

  --weight-headline: 700;
  --weight-body:     400;
  --letter-spacing:  ${t.letterSpacing};

  --radius:  ${d.cornerRadius};
  --shadow:  ${d.shadows};
  --page-width:      860px;
  --section-padding: clamp(52px,7vw,80px) clamp(28px,5vw,52px);

  /* v5 — 3-레이어 카드 시스템 */
  --radius-card: 20px;
  --shadow-card: 0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05);
  --shadow-elevated: 0 24px 60px rgba(0,0,0,0.14);
  --surface-overlay-light: rgba(255,255,255,0.94);
  --surface-overlay-dark:  rgba(20,15,10,0.86);
  --card-padding: clamp(28px, 5vw, 48px);
  --v5-section-padding-y: clamp(80px, 12vw, 140px);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #ede9e3;
  font-family: var(--font-body);
  font-size: var(--size-body);
  color: var(--color-text-dark);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

.page-wrap {
  max-width: var(--page-width);
  margin: 0 auto;
  background: var(--color-surface1);
  box-shadow: 0 0 60px rgba(0,0,0,0.15);
  overflow: hidden;
}

/* ── 배경 교차 (구분선 없음) ── */
.bg-white  { background: #FFFFFF; }
.bg-cream  { background: var(--color-surface2); }
.bg-warm   { background: var(--color-surface1); }
.bg-dark   { background: var(--color-text-dark); color: white; }
.bg-none   { background: transparent; }

/* ── 공유 ── */
.section-padded { padding: var(--section-padding); }

.section-eyebrow {
  font-family: var(--font-accent);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 14px;
}

/* ── 다크 배경 인라인 공통 유틸 ── */
.dark-section { color: #f0f0ee; }
.dark-section .section-eyebrow { color: rgba(200,169,110,0.85); }
.dark-section .section-title   { color: #f0ede8; }
.dark-section .section-sub     { color: rgba(240,237,232,0.65); }
.dark-section .body-text       { color: rgba(240,237,232,0.75); }
.dark-section .info-card       { background: rgba(255,255,255,0.07); border-top-color: rgba(200,169,110,0.5); box-shadow: none; }
.dark-section .info-title      { color: #f0ede8; }
.dark-section .info-body       { color: rgba(232,240,232,0.75); }
.dark-section .step-h-number   { color: rgba(200,169,110,0.85); }
.dark-section .step-h-title    { color: #f0ede8; }
.dark-section .step-h-body     { color: rgba(240,237,232,0.7); }
.dark-section .steps-horizontal { border-top-color: rgba(255,255,255,0.1); }
.dark-section .step-h-item:not(:last-child) { border-bottom-color: rgba(255,255,255,0.1); }

/* ── J: 텍스트 대비 강제 보장 — Art Director 색상보다 우선 적용 ── */
body { color: var(--color-text-dark, #1a1a1a); }
.section-title, .section-sub, .body-text,
.info-title, .info-body,
.step-h-title, .step-h-body { color: inherit; }
/* light 섹션: 항상 어두운 텍스트 */
.section-wrapper:not(.dark-section) .section-title,
.section-wrapper:not(.dark-section) .section-sub,
.section-wrapper:not(.dark-section) .body-text { color: #1a1a1a; }
/* dark 섹션: 항상 밝은 텍스트 */
.section-wrapper.dark-section .section-title,
.section-wrapper.dark-section .section-sub,
.section-wrapper.dark-section .body-text { color: #f0ede8; }

.section-title {
  font-family: var(--font-headline);
  font-size: var(--size-h2);
  font-weight: var(--weight-headline);
  letter-spacing: -0.5px;
  color: var(--color-text-dark);
  margin-bottom: 16px;
  line-height: 1.25;
}

.section-sub {
  font-size: clamp(17px, 2.2vw, 20px);
  color: #3a3530;
  margin-bottom: 36px;
  line-height: 1.65;
}

.body-text {
  font-size: var(--size-body);
  color: #3a3530;
  line-height: 1.85;
  margin-bottom: 24px;
}

/* ── HERO ── */
.section-hero { position: relative; width: 100%; }
.hero-image-wrap img { width: 100%; display: block; }
/* O: 히어로 다음 섹션 margin 제거 (hero 하단 패딩으로만 처리) */
.section-hero + .section-wrapper { margin-top: 0; }

/* ── SPLIT (left-image-right-text / right-image-left-text) ── */
.split-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.split-section.reverse { flex-direction: column; }

.split-image {
  width: 100%;
  height: 460px;
  overflow: hidden;
  flex-shrink: 0;
}
.split-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.split-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-surface3);
}

.split-content {
  flex: 1;
  padding: 44px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.split-list {
  list-style: none;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.split-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 17px;
  color: var(--color-text-dark);
  line-height: 1.65;
}
.split-list li i { flex-shrink: 0; margin-top: 3px; }

/* ── SENSORY ── */
.sensory-section {
  position: relative;
  overflow: hidden;
}
.sensory-section > img {
  width: 100%;
  height: 620px;
  object-fit: cover;
  display: block;
}
.sensory-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(59,33,6,0.88) 0%,
    rgba(59,33,6,0.50) 55%,
    rgba(59,33,6,0.15) 100%
  );
  display: flex;
  align-items: center;
  padding: 0 36px;
}
.sensory-text { max-width: 520px; }
.sensory-text .section-title {
  color: var(--color-secondary);
  font-size: clamp(32px, 5vw, 48px);
  margin-bottom: 14px;
}
.sensory-sub  { color: rgba(245,230,200,0.92); font-size: 18px; margin-bottom: 12px; }
.sensory-body { color: rgba(245,230,200,0.85); font-size: 17px; line-height: 1.75; }

/* ── STORY ── */
.section-story { position: relative; }
.story-bg {
  min-height: 800px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
}
.story-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59,33,6,0.88) 0%, rgba(59,33,6,0.7) 100%);
}
.story-content {
  position: relative;
  z-index: 1;
  padding: clamp(52px,7vw,80px) clamp(28px,5vw,56px);
  max-width: 700px;
}
.story-quote {
  font-family: Georgia, serif;
  font-size: 96px;
  color: rgba(200,169,110,0.25);
  line-height: 0.6;
  margin-bottom: 24px;
  user-select: none;
}
.story-title {
  font-family: var(--font-story);
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 700;
  color: var(--color-secondary);
  letter-spacing: -0.5px;
  margin-bottom: 24px;
  line-height: 1.2;
}
.story-body {
  font-size: clamp(18px, 2.5vw, 22px);
  color: rgba(245,230,200,0.92);
  line-height: 1.9;
}

/* ── NUMBERED STEPS HORIZONTAL ── */
.steps-horizontal {
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  border-top: 1px solid var(--color-surface3);
}
.step-h-item {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 28px 0;
  position: relative;
}
.step-h-item:not(:last-child) {
  border-bottom: 1px solid var(--color-surface3);
}
.step-h-number {
  font-family: var(--font-headline);
  font-size: 48px;
  font-weight: 900;
  color: var(--color-primary);
  line-height: 1;
  letter-spacing: -1px;
  flex-shrink: 0;
  width: 64px;
  text-align: center;
}
.step-h-text { flex: 1; }
.step-h-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 8px;
  letter-spacing: var(--letter-spacing);
}
.step-h-body {
  font-size: 17px;
  color: #3a3530;
  line-height: 1.7;
}

/* ── GRID INFO CARDS ── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 36px;
}
@media (max-width: 480px) {
  /* A. 폰트 크기 강제 — 모바일에서 읽기 편한 최소 크기 */
  body { font-size: 18px; }
  .section-title, .story-title, .statement-title, .overlay-title { font-size: 28px !important; }
  .section-sub, .sensory-sub, .statement-sub { font-size: 16px !important; }
  .body-text, .story-body, .sensory-body, .info-body, .step-h-body,
  .feature-col-body, .timeline-body { font-size: 16px !important; line-height: 1.7 !important; }

  /* B. 텍스트 대비 강화 — light 배경에서 어두운 텍스트, dark 배경에서 밝은 텍스트 */
  .bg-white .section-title, .bg-cream .section-title, .bg-warm .section-title { color: var(--color-text-dark) !important; }
  .bg-white .body-text, .bg-cream .body-text, .bg-warm .body-text { color: #2a2520 !important; }

  /* C. Split 레이아웃 → 모바일 세로 스택 */
  .split-section { flex-direction: column !important; }
  .split-section.reverse { flex-direction: column !important; }
  .split-left, .split-right, .split-img-wrap { width: 100% !important; min-width: 0 !important; }
  .split-img-wrap img { width: 100% !important; height: auto !important; }

  /* D. Grid 카드 → 1열 */
  .info-grid { grid-template-columns: 1fr !important; }

  /* E. Steps → 세로 배치 */
  .steps-horizontal { flex-direction: column !important; gap: 24px !important; }
  .step-h-item { width: 100% !important; }

  /* F. Split-heavy → 세로 스택 */
  .split-heavy { flex-direction: column !important; }
  .split-heavy > * { width: 100% !important; }

  /* G. Icon Feature Row → 세로 */
  .feature-row-section .feature-row-grid { grid-template-columns: 1fr !important; }

  /* H. Gallery strip → 세로 스크롤 */
  .gallery-strip { flex-direction: column !important; }
  .gallery-strip img { width: 100% !important; height: auto !important; }

  /* I. Brand Story — min-height 제거 */
  .story-bg { min-height: 0 !important; }

  /* J. Sensory — 이미지 높이 축소 */
  .sensory-section > img { height: 300px !important; object-fit: cover; }

  /* K. 섹션 패딩 축소 */
  .page-wrap > section { padding: 40px 20px !important; }

  /* L. CTA 버튼 전체폭 */
  .cta-button { width: 100% !important; text-align: center !important; }

  /* M. Timeline — 좌측 정렬 */
  .timeline-section .timeline-line { left: 16px !important; }
  .timeline-section .timeline-item { padding-left: 40px !important; }
}
.info-card {
  background: white;
  border-radius: var(--radius);
  padding: 28px 20px;
  border-top: 3px solid var(--color-primary);
  box-shadow: var(--shadow);
}
.info-icon { margin-bottom: 16px; }
.info-title {
  font-family: var(--font-headline);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 10px;
  letter-spacing: var(--letter-spacing);
}
.info-body {
  font-size: 17px;
  color: #3a3530;
  line-height: 1.7;
}

/* ── GRID 섹션 배경 테마 ── */
.grid-theme-cream    { background: linear-gradient(135deg, #fdf6ec 0%, #f5e6cc 100%); }
.grid-theme-forest   { background: linear-gradient(160deg, #1a2a1a 0%, #2d3e2d 100%); color: #e8f0e8; }
.grid-theme-midnight { background: linear-gradient(160deg, #0d1117 0%, #1c2333 100%); color: #c9d1d9; }
.grid-theme-warm     { background: linear-gradient(135deg, #fff8f0 0%, #fde8d0 100%); }

.grid-theme-forest .section-title,
.grid-theme-midnight .section-title { color: #f0ede8; }
.grid-theme-forest .section-sub,
.grid-theme-midnight .section-sub   { color: rgba(240,237,232,0.7); }
.grid-theme-forest .info-card  { background: rgba(255,255,255,0.08); border-top-color: rgba(200,169,110,0.6); box-shadow: none; color: #f0ede8; }
.grid-theme-midnight .info-card { background: rgba(255,255,255,0.06); border-top-color: rgba(200,169,110,0.5); box-shadow: none; color: #f0ede8; }
.grid-theme-forest .info-title,
.grid-theme-midnight .info-title { color: #f0ede8; }
.grid-theme-forest .info-body,
.grid-theme-midnight .info-body  { color: rgba(240,237,232,0.88); }

/* ── STEPS 섹션 배경 테마 ── */
.steps-theme-paper   { background: #fafaf8; }
.steps-theme-ink     { background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%); color: #f0f0ee; }
.steps-theme-stone   { background: linear-gradient(135deg, #e8e4dc 0%, #d4cfc6 100%); color: #2a2520; }

.steps-theme-ink .section-title  { color: #f0ede8; }
.steps-theme-ink .section-sub    { color: rgba(240,237,232,0.65); }
.steps-theme-ink .step-h-number  { color: rgba(200,169,110,0.85); }
.steps-theme-ink .step-h-title   { color: #f0ede8; }
.steps-theme-ink .step-h-body    { color: rgba(240,237,232,0.7); }
.steps-theme-ink .steps-horizontal { border-top-color: rgba(255,255,255,0.1); }
.steps-theme-ink .step-h-item:not(:last-child) { border-bottom-color: rgba(255,255,255,0.1); }

/* ── STEPS with image ── */
.steps-image-header { width: 100%; height: 380px; overflow: hidden; }
.steps-image-header img { width: 100%; height: 100%; object-fit: cover; display: block; }
.steps-content-area { padding: var(--section-padding); }

/* ── GRID with image ── */
.grid-image-header { width: 100%; height: 360px; overflow: hidden; }
.grid-image-header img { width: 100%; height: 100%; object-fit: cover; display: block; }
.grid-content-area { padding: var(--section-padding); }

/* ── PHOTO GALLERY STRIP (매거진 그리드) ── */
.gallery-strip { }
.gallery-header { padding: 56px 48px 32px; text-align: center; }
.gallery-grid-3 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 8px 8px;
}
.gallery-item { overflow: hidden; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
.gallery-item:hover img { transform: scale(1.04); }
/* 첫 번째 이미지: 전체폭 */
.gallery-item:first-child { grid-column: span 2; height: 460px; }
/* 나머지: 2열 균등 */
.gallery-item:not(:first-child) { height: 280px; }

/* ── 재료/성분 번호 배지 (아이콘 대체) ── */
.info-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  font-family: var(--font-headline);
}

/* ── CTA ── */
.section-cta { padding: clamp(72px,10vw,100px) clamp(28px,5vw,56px); text-align: center; }
.cta-inner   { max-width: 620px; margin: 0 auto; }
.cta-urgency {
  font-size: 13px;
  color: rgba(200,169,110,0.85);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 16px;
  font-weight: 600;
}
.cta-title {
  font-family: var(--font-accent);
  font-size: clamp(40px, 7vw, 56px);
  color: var(--color-secondary);
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.2;
}
.cta-sub {
  color: rgba(245,230,200,0.82);
  font-size: clamp(17px, 2.5vw, 20px);
  margin-bottom: 32px;
  line-height: 1.7;
}
.cta-divider {
  width: 48px;
  height: 2px;
  background: rgba(200,169,110,0.5);
  margin: 0 auto 28px;
}
.cta-tagline {
  color: rgba(245,230,200,0.65);
  font-size: clamp(15px, 2vw, 17px);
  line-height: 1.8;
}

/* ── MASONRY GALLERY ── */
.masonry-section { }
.masonry-header { padding: 56px 48px 32px; text-align: center; }
.masonry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 8px 8px;
}
.masonry-tall { grid-row: span 2; height: 600px; }
.masonry-col { display: flex; flex-direction: column; gap: 8px; }
.masonry-item { overflow: hidden; }
.masonry-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
.masonry-item:hover img { transform: scale(1.03); }
.masonry-col .masonry-item { height: 292px; }

/* ── SPLIT TEXT HEAVY ── */
.split-heavy {
  display: flex;
  flex-direction: column;
}
.split-heavy-image {
  width: 100%;
  height: 420px;
  overflow: hidden;
  flex-shrink: 0;
}
.split-heavy-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
.split-heavy-text {
  flex: 1;
  padding: 52px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* ── CENTERED STATEMENT ── */
.statement-section {
  padding: clamp(72px,10vw,100px) clamp(32px,5vw,64px);
  text-align: center;
}
.statement-inner { max-width: 680px; margin: 0 auto; }
.statement-title {
  font-family: var(--font-headline);
  font-size: clamp(36px, 6vw, 60px);
  font-weight: 800;
  color: var(--color-text-dark);
  line-height: 1.2;
  margin-bottom: 20px;
  letter-spacing: -1px;
}
.statement-sub {
  font-size: clamp(18px, 2.5vw, 22px);
  color: #3a3530;
  line-height: 1.7;
  margin-bottom: 28px;
}
.statement-divider {
  width: 48px;
  height: 2px;
  background: var(--color-primary);
  margin: 0 auto 28px;
}
.statement-body {
  font-size: var(--size-body);
  color: #3a3530;
  line-height: 1.85;
}

/* ── ICON FEATURE ROW ── */
.feature-row-section {
  padding: var(--section-padding);
}
.feature-row-head {
  text-align: center;
  margin-bottom: 48px;
}
.feature-row-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 600px) {
  .feature-row-cols { grid-template-columns: 1fr; }
}
.feature-col {
  text-align: center;
  padding: 32px 20px;
}
.feature-icon { margin-bottom: 16px; }
.feature-col-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 10px;
  font-family: var(--font-headline);
}
.feature-col-body {
  font-size: 16px;
  color: #3a3530;
  line-height: 1.7;
}

/* ── COMPARISON TABLE ── */
.compare-section { padding: var(--section-padding); }
.compare-head-area { text-align: center; margin-bottom: 40px; }
.compare-table { border-radius: var(--radius); overflow: hidden; border: 1px solid rgba(0,0,0,0.08); }
.compare-header-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: var(--color-text-dark);
  color: white;
}
.compare-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.compare-row:last-child { border-bottom: none; }
.compare-row:nth-child(even) { background: rgba(0,0,0,0.02); }
.compare-cell {
  padding: 16px 20px;
  font-size: 15px;
  display: flex;
  align-items: center;
}
.compare-label-cell { font-weight: 600; color: #3a3530; }
.compare-general { color: #888; justify-content: center; text-align: center; }
.compare-us {
  color: var(--color-primary);
  font-weight: 700;
  justify-content: center;
  text-align: center;
  background: rgba(var(--color-primary), 0.05);
}
.compare-header-row .compare-general { color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600; }
.compare-header-row .compare-us { color: white; font-size: 13px; font-weight: 700; background: rgba(255,255,255,0.1); }
.compare-header-row .compare-cell { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }

/* ── TIMELINE VERTICAL ── */
.timeline-section { padding: var(--section-padding); }
.timeline-head { margin-bottom: 48px; }
.timeline { display: flex; flex-direction: column; gap: 0; padding-left: 16px; }
.timeline-item {
  display: flex;
  gap: 24px;
  position: relative;
}
.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-primary);
  flex-shrink: 0;
  margin-top: 4px;
}
.timeline-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, var(--color-primary), rgba(var(--color-primary), 0.1));
  min-height: 40px;
}
.timeline-content { padding-bottom: 36px; flex: 1; }
.timeline-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 8px;
  font-family: var(--font-headline);
}
.timeline-body { font-size: 16px; color: #3a3530; line-height: 1.7; }

/* ── FULL BLEED OVERLAY ── */
.overlay-section {
  position: relative;
  overflow: hidden;
}
.overlay-section > img {
  width: 100%;
  height: 580px;
  object-fit: cover;
  display: block;
}
.overlay-center {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 40px;
}
.overlay-text { max-width: 600px; }
.overlay-text .section-title {
  color: white;
  font-size: clamp(32px, 5vw, 52px);
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  margin-bottom: 16px;
}

/* ── TESTIMONIAL QUOTE ── */
.testimonial-section {
  padding: clamp(72px,10vw,100px) clamp(32px,5vw,64px);
  text-align: center;
}
.testimonial-inner { max-width: 680px; margin: 0 auto; }
.testimonial-quote-mark {
  font-family: Georgia, serif;
  font-size: 120px;
  color: var(--color-primary);
  opacity: 0.25;
  line-height: 0.7;
  margin-bottom: 24px;
  user-select: none;
}
.testimonial-text {
  font-family: var(--font-story);
  font-size: clamp(20px, 3vw, 26px);
  color: var(--color-text-dark);
  line-height: 1.75;
  margin-bottom: 32px;
  font-style: italic;
}
.testimonial-divider {
  width: 48px;
  height: 2px;
  background: var(--color-primary);
  margin: 0 auto 20px;
  opacity: 0.6;
}
.testimonial-source {
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 600;
}

/* ─────────────────────────────────────────────────────────── */
/* v5 — 3-레이어 오버레이 (배경 + 카드 + 텍스트)                  */
/* ─────────────────────────────────────────────────────────── */

.v5-section {
  position: relative;
  padding: var(--v5-section-padding-y) 0;
  isolation: isolate;
  overflow: hidden;
}

/* v5 멀티 에셋: frame overlay (장식 프레임) */
.v5-frame-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}
.v5-frame-overlay img {
  max-width: 92%;
  max-height: 92%;
  object-fit: contain;
}

/* v5 멀티 에셋: accent (작은 장식 요소) */
.v5-accent {
  position: absolute;
  pointer-events: none;
  z-index: 2;
  width: clamp(64px, 9vw, 120px);
  height: auto;
}
.v5-accent--top-right { top: 24px; right: 24px; }
.v5-accent--top-left { top: 24px; left: 24px; }
.v5-accent--bottom-right { bottom: 24px; right: 24px; }
.v5-accent--bottom-left { bottom: 24px; left: 24px; }
.v5-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  z-index: -1;
}
.v5-section.dark-section { color: #f5f1ea; }

.v5-section-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 clamp(24px, 4vw, 48px);
  position: relative;
  z-index: 3;  /* frame(1) + accent(2)보다 위 */
}

.v5-eyebrow {
  font-family: var(--font-accent);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 700;
  margin-bottom: 14px;
}
.v5-section.dark-section .v5-eyebrow { color: var(--color-accent); }

.v5-title {
  font-family: var(--font-headline);
  font-size: var(--size-h2);
  font-weight: var(--weight-headline);
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: var(--color-text-dark);
  margin-bottom: 16px;
}
.v5-section.dark-section .v5-title { color: #f5f1ea; }

.v5-sub {
  font-family: var(--font-story);
  font-size: var(--size-h3);
  color: rgba(0,0,0,0.62);
  line-height: 1.55;
  margin-bottom: 20px;
}
.v5-section.dark-section .v5-sub { color: rgba(245,241,234,0.78); }

.v5-body {
  font-family: var(--font-body);
  font-size: var(--size-body);
  line-height: 1.78;
  color: rgba(0,0,0,0.74);
  margin-bottom: 16px;
}
.v5-section.dark-section .v5-body { color: rgba(245,241,234,0.85); }

/* 카드 베이스 */
.v5-card {
  padding: var(--card-padding);
  border-radius: var(--radius-card);
  position: relative;
}
.v5-card--elevated {
  background: #ffffff;
  box-shadow: var(--shadow-card);
}
.v5-card--flat {
  background: var(--color-surface1);
}
.v5-card--outlined {
  background: transparent;
  border: 1.5px solid rgba(0,0,0,0.08);
}
.v5-card--glass {
  background: var(--surface-overlay-light);
  backdrop-filter: blur(14px) saturate(120%);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 12px 36px rgba(0,0,0,0.08);
}
.v5-section.dark-section .v5-card--glass {
  background: var(--surface-overlay-dark);
  border-color: rgba(255,255,255,0.08);
}
.v5-card--none {
  background: transparent;
  padding: 0;
}

/* 전략별 레이아웃 */
.v5-card--center-card { max-width: 600px; margin: 0 auto; }

.v5-card--side-card { max-width: 56%; }
.v5-card--side-card.v5-side-right { margin-left: auto; }
.v5-card--side-card.v5-side-left  { margin-right: auto; }

.v5-card--full-bleed {
  text-align: center;
  padding: clamp(40px, 8vw, 80px) clamp(20px, 4vw, 40px);
  max-width: 720px;
  margin: 0 auto;
}
.v5-card--full-bleed .v5-title { font-size: clamp(40px, 7vw, 64px); }

/* split-card — 좌 이미지 + 우 카드 */
.v5-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(20px, 3vw, 40px);
  align-items: center;
}
.v5-split-img img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-card);
  display: block;
}
@media (max-width: 600px) {
  .v5-split { grid-template-columns: 1fr; }
}

/* stacked-cards — 타임라인 */
.v5-stack-header { text-align: center; margin-bottom: clamp(28px, 4vw, 48px); }
.v5-stack-header .v5-title { margin-bottom: 12px; }
.v5-stacked {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2.5vw, 24px);
}
.v5-step.v5-card {
  display: flex;
  gap: clamp(16px, 2.5vw, 24px);
  align-items: flex-start;
  padding: clamp(20px, 3vw, 32px);
}
.v5-step-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 16px;
}
.v5-step-body { flex: 1; min-width: 0; }
.v5-step-title { font-family: var(--font-headline); font-size: 20px; font-weight: 700; margin-bottom: 6px; color: inherit; }
.v5-step-value { font-family: var(--font-body); font-size: 16px; line-height: 1.65; color: rgba(0,0,0,0.72); }
.v5-section.dark-section .v5-step-value { color: rgba(245,241,234,0.82); }

/* bento-grid — 2×2 */
.v5-bento {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(12px, 2vw, 20px);
}
@media (max-width: 480px) {
  .v5-bento { grid-template-columns: 1fr; }
}
.v5-bento-cell.v5-card {
  padding: clamp(20px, 3vw, 32px);
  text-align: left;
}
.v5-bento-icon { margin-bottom: 12px; }
.v5-bento-icon i { font-size: 32px !important; }
.v5-bento-label {
  font-family: var(--font-headline);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: inherit;
}
.v5-bento-value {
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  color: rgba(0,0,0,0.72);
}
.v5-section.dark-section .v5-bento-value { color: rgba(245,241,234,0.82); }

/* 리스트 */
.v5-list { list-style: none; padding: 0; margin: 16px 0 0; }
.v5-list-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-size: 15px;
}
.v5-list-item:last-child { border-bottom: none; }
.v5-list-label { color: rgba(0,0,0,0.55); font-family: var(--font-accent); letter-spacing: 0.04em; }
.v5-list-value { color: var(--color-text-dark); font-weight: 600; text-align: right; }
.v5-section.dark-section .v5-list-item { border-bottom-color: rgba(255,255,255,0.08); }
.v5-section.dark-section .v5-list-label { color: rgba(245,241,234,0.6); }
.v5-section.dark-section .v5-list-value { color: #f5f1ea; }

/* 정렬 */
.v5-align-center .v5-section-inner { text-align: center; }
.v5-align-center .v5-card { text-align: left; }
.v5-align-left .v5-section-inner { text-align: left; }
.v5-align-right .v5-section-inner { text-align: left; }
.v5-align-stretch .v5-section-inner { text-align: left; }
`
}

// ── 폰트 링크 동적 생성 ───────────────────────────────────────────

const GOOGLE_FONTS_MAP: Record<string, string> = {
  // 기존 13종
  'Black Han Sans':    'Black+Han+Sans',
  'Noto Serif KR':     'Noto+Serif+KR:wght@300;400;600;700',
  'Noto Sans KR':      'Noto+Sans+KR:wght@400;500;700',
  'Gowun Batang':      'Gowun+Batang',
  'Gowun Dodum':       'Gowun+Dodum',
  'Nanum Myeongjo':    'Nanum+Myeongjo:wght@400;700',
  'Nanum Gothic':      'Nanum+Gothic:wght@400;700',
  'Do Hyeon':          'Do+Hyeon',
  'Jua':               'Jua',
  'IBM Plex Sans KR':  'IBM+Plex+Sans+KR:wght@400;500;700',
  'Hahmlet':           'Hahmlet:wght@400;700',
  'Poor Story':        'Poor+Story',
  'Gaegu':             'Gaegu:wght@400;700',
  // 추가 14종
  'Gothic A1':          'Gothic+A1:wght@400;600;700;900',
  'Sunflower':          'Sunflower:wght@300;500;700',
  'Song Myung':         'Song+Myung',
  'Stylish':            'Stylish',
  'Nanum Pen Script':   'Nanum+Pen+Script',
  'Nanum Brush Script': 'Nanum+Brush+Script',
  'Gamja Flower':       'Gamja+Flower',
  'Yeon Sung':          'Yeon+Sung',
  'Gugi':               'Gugi',
  'East Sea Dokdo':     'East+Sea+Dokdo',
  'Single Day':         'Single+Day',
  'Hi Melody':          'Hi+Melody',
  'Kirang Haerang':     'Kirang+Haerang',
  'Cute Font':          'Cute+Font',
}

interface SelfHostedFontFace {
  file: string
  weight: number
  format: 'truetype' | 'opentype'
}

// 자체 호스팅 폰트 — assets/fonts/ 디렉토리에서 로드
const SELF_HOSTED_FONTS: Record<string, SelfHostedFontFace[]> = {
  // Apple SD Gothic Neo — 제거: Apple EULA 상업적 사용 불가
  // HGGGothicssi — 제거: 한양시스템 상용 라이선스 필요
  'GmarketSans': [
    { file: 'GmarketSansLight.otf',    weight: 300, format: 'opentype' },
    { file: 'GmarketSansMedium.otf',   weight: 500, format: 'opentype' },
    { file: 'GmarketSansBold.otf',     weight: 700, format: 'opentype' },
  ],
  'KoPub Batang': [
    { file: 'KoPub Batang Light.ttf',  weight: 300, format: 'truetype' },
    { file: 'KoPub Batang Medium.ttf', weight: 500, format: 'truetype' },
    { file: 'KoPub Batang Bold.ttf',   weight: 700, format: 'truetype' },
  ],
  'KoPub Dotum': [
    { file: 'KoPub Dotum Light.ttf',   weight: 300, format: 'truetype' },
    { file: 'KoPub Dotum Medium.ttf',  weight: 500, format: 'truetype' },
    { file: 'KoPub Dotum Bold.ttf',    weight: 700, format: 'truetype' },
  ],
  'NanumSquareNeo': [
    { file: 'NanumSquareNeo-aLt.ttf',  weight: 300, format: 'truetype' },
    { file: 'NanumSquareNeo-bRg.ttf',  weight: 400, format: 'truetype' },
    { file: 'NanumSquareNeo-cBd.ttf',  weight: 700, format: 'truetype' },
    { file: 'NanumSquareNeo-dEb.ttf',  weight: 800, format: 'truetype' },
    { file: 'NanumSquareNeo-eHv.ttf',  weight: 900, format: 'truetype' },
  ],
  'Paperlogy': [
    { file: 'Paperlogy-1Thin.ttf',       weight: 100, format: 'truetype' },
    { file: 'Paperlogy-2ExtraLight.ttf', weight: 200, format: 'truetype' },
    { file: 'Paperlogy-3Light.ttf',      weight: 300, format: 'truetype' },
    { file: 'Paperlogy-4Regular.ttf',    weight: 400, format: 'truetype' },
    { file: 'Paperlogy-5Medium.ttf',     weight: 500, format: 'truetype' },
    { file: 'Paperlogy-6SemiBold.ttf',   weight: 600, format: 'truetype' },
    { file: 'Paperlogy-7Bold.ttf',       weight: 700, format: 'truetype' },
    { file: 'Paperlogy-8ExtraBold.ttf',  weight: 800, format: 'truetype' },
    { file: 'Paperlogy-9Black.ttf',      weight: 900, format: 'truetype' },
  ],
  'Tenada': [
    { file: 'Tenada.ttf', weight: 400, format: 'truetype' },
  ],
}

const ASSETS_FONTS_DIR = path.join(process.cwd(), 'assets', 'fonts')

function buildFontLinks(sg: StyleGuide): string {
  const t = sg.typography as any
  const roles: string[] = [
    t.headlineFont,
    t.storyFont ?? '',
    t.bodyFont,
    t.accentFont ?? '',
  ].filter(Boolean)
  const unique = [...new Set(roles)]

  // 자체 호스팅 우선, 그 다음 Google CDN, 마지막 Pretendard CDN
  const selfHostedUsed = unique.filter((f) => SELF_HOSTED_FONTS[f] && fs.existsSync(ASSETS_FONTS_DIR))
  const googleFamilies = unique
    .filter((f) => !SELF_HOSTED_FONTS[f] && f !== 'Pretendard Variable' && GOOGLE_FONTS_MAP[f])
    .map((f) => `family=${GOOGLE_FONTS_MAP[f]}`)
  const hasPretendard = unique.includes('Pretendard Variable')

  let links = ''

  // Google CDN 링크
  if (googleFamilies.length > 0) {
    links += `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${googleFamilies.join('&')}&display=swap" rel="stylesheet">\n`
  }

  // Pretendard CDN
  if (hasPretendard) {
    links += `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">\n`
  }

  // 자체 호스팅 @font-face
  if (selfHostedUsed.length > 0) {
    const fontFaceRules = selfHostedUsed.flatMap((family) =>
      SELF_HOSTED_FONTS[family].map((face) =>
        `    @font-face {
      font-family: '${family}';
      src: url('./fonts/${face.file}') format('${face.format}');
      font-weight: ${face.weight};
      font-style: normal;
      font-display: swap;
    }`
      )
    ).join('\n')
    links += `  <style>\n${fontFaceRules}\n  </style>\n`
  }

  // 아무것도 없으면 기본 preconnect
  if (!links.trim()) {
    links = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
  }

  return links.trimEnd()
}

// ── HTML 조립 ─────────────────────────────────────────────────────

/** HTML 조립 (순수 함수 — fs 의존 없음, 에디터 API에서 재사용 가능) */
export function buildHTML(
  styleGuide: StyleGuide,
  refinedCopy: RefinedCopy,
  script: Script,
  iconMapping: IconMappingJson,
  imageRelPaths: Record<string, string>
): string {
  const patternMap = buildPatternMap(styleGuide)
  const bgStyleMap = buildBackgroundStyleMap(styleGuide)
  shotUsageCount = 0      // 렌더링 시작 시 리셋
  gridThemeCounter = 0
  stepsThemeCounter = 0

  // 선택된 템플릿의 patternOverrides 로드 (최우선 적용)
  const selectedTemplate = styleGuide.selectedTemplateId
    ? getTemplateById(styleGuide.selectedTemplateId)
    : undefined
  const templateOverrides = selectedTemplate?.patternOverrides as Partial<Record<string, string>> | undefined

  // 템플릿 sectionSequence로 섹션 순서 재정렬 (정의된 경우)
  // sequence에 없는 섹션 타입은 원래 상대 순서를 유지하며 뒤로 배치 (명시적 stable sort)
  let orderedSections = refinedCopy.sections
  const seq = selectedTemplate?.sectionSequence
  if (seq && seq.length > 0) {
    const rankOf = (t: string): number => {
      const i = seq.indexOf(t)
      return i === -1 ? seq.length : i
    }
    orderedSections = refinedCopy.sections
      .map((s, i) => ({ s, i }))
      .sort((a, b) => rankOf(a.s.sectionType) - rankOf(b.s.sectionType) || a.i - b.i)
      .map(({ s }) => s)
  }

  const sections = orderedSections.map((copySec, idx) => {
    // AI 생성 텍스트 XSS 방지
    const safeCopy = {
      ...copySec,
      headline: escapeHtml(copySec.headline),
      subheadline: copySec.subheadline ? escapeHtml(copySec.subheadline) : copySec.subheadline,
      body: copySec.body ? escapeHtml(copySec.body) : copySec.body,
      items: copySec.items?.map(item => ({ ...item, label: escapeHtml(item.label), value: escapeHtml(item.value) })),
    }
    const scriptSec = script.sections.find((s) => s.type === copySec.sectionType)
    const pattern = resolvePattern(copySec.sectionType, patternMap, idx, templateOverrides)
    const backgroundStyle = bgStyleMap.get(copySec.sectionType.toLowerCase())
    const rendered = buildLayoutSection(copySec.sectionType, safeCopy, scriptSec, iconMapping, imageRelPaths, pattern, idx, backgroundStyle, styleGuide)
    return injectEditorDataAttrs(rendered, copySec.sectionType, idx, pattern)
  }).join('\n')

  const fontLinks = buildFontLinks(styleGuide)

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${styleGuide.brand.name}</title>
  ${fontLinks}
  <script src="${iconMapping.cdnUrl}"><\/script>
  <style>
${buildCSS(styleGuide)}
  </style>
</head>
<body>
<div class="page-wrap">
${sections}
</div>
</body>
</html>`
}

// ── 진입점 ────────────────────────────────────────────────────────

export async function runHtmlBuilder(
  styleGuide: StyleGuide,
  refinedCopy: RefinedCopy,
  script: Script,
  iconMapping: IconMappingJson,
  outputDir: string,
  allImagePaths: Record<string, string>
): Promise<AgentResult<{ htmlPath: string }>> {
  const elapsed = timer()
  console.log('[HTML Builder] 시작')

  try {
    // absolute → relative (HTML 파일 위치 기준)
    const imageRelPaths: Record<string, string> = {}
    for (const [key, absPath] of Object.entries(allImagePaths)) {
      if (absPath && fs.existsSync(absPath)) {
        imageRelPaths[key] = path.relative(outputDir, absPath)
      }
    }

    console.log(`  이미지 경로: ${Object.keys(imageRelPaths).join(', ')}`)

    // 템플릿 fontPairing으로 typography 덮어쓰기 (Art Director 선택보다 우선)
    const selectedTemplate = styleGuide.selectedTemplateId
      ? getTemplateById(styleGuide.selectedTemplateId)
      : undefined
    const resolvedStyleGuide: StyleGuide = selectedTemplate?.fontPairing
      ? {
          ...styleGuide,
          typography: {
            ...styleGuide.typography,
            headlineFont: selectedTemplate.fontPairing.headlineFont,
            storyFont:    selectedTemplate.fontPairing.storyFont,
            bodyFont:     selectedTemplate.fontPairing.bodyFont,
            accentFont:   selectedTemplate.fontPairing.accentFont,
          } as StyleGuide['typography'],
        }
      : styleGuide
    if (selectedTemplate?.fontPairing) {
      console.log(`  폰트 오버라이드 (템플릿 ${selectedTemplate.id}): ${selectedTemplate.fontPairing.headlineFont} / ${selectedTemplate.fontPairing.bodyFont}`)
    }

    // 자체 호스팅 폰트 파일 복사 (output/fonts/)
    const t = resolvedStyleGuide.typography as any
    const usedFonts: string[] = [t.headlineFont, t.storyFont ?? '', t.bodyFont, t.accentFont ?? ''].filter(Boolean)
    const selfHostedUsed = [...new Set(usedFonts)].filter((f) => SELF_HOSTED_FONTS[f])
    if (selfHostedUsed.length > 0 && fs.existsSync(ASSETS_FONTS_DIR)) {
      const fontsOutDir = path.join(outputDir, 'fonts')
      fs.mkdirSync(fontsOutDir, { recursive: true })
      let copied = 0
      for (const family of selfHostedUsed) {
        for (const face of SELF_HOSTED_FONTS[family]) {
          const src = path.join(ASSETS_FONTS_DIR, face.file)
          const dst = path.join(fontsOutDir, face.file)
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, dst)
            copied++
          }
        }
      }
      if (copied > 0) console.log(`  폰트 복사: ${copied}개 파일 → fonts/`)
    }

    const html = buildHTML(resolvedStyleGuide, refinedCopy, script, iconMapping, imageRelPaths)

    const htmlPath = path.join(outputDir, 'index.html')
    fs.writeFileSync(htmlPath, html, 'utf8')

    const sizeKb = Math.round(fs.statSync(htmlPath).size / 1024)
    console.log(`[HTML Builder] 완료 (${elapsed()}ms) — index.html (${sizeKb}KB)`)

    saveJson({ generatedAt: new Date().toISOString(), patterns: styleGuide.layoutPatterns }, `${outputDir}/html-build-report.json`)

    return { success: true, data: { htmlPath }, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[HTML Builder] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
