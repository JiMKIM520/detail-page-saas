/**
 * 템플릿 품질 자동 채점기 — 생성자-평가자 분리.
 *
 * DetailTemplate을 mock 입력으로 html-builder.buildHTML()에 넣어 렌더링하고,
 * 출력 HTML이 템플릿 의도(폰트/패턴/섹션순서)대로 나왔는지 자동 채점한다.
 * "만드는 쪽(html-builder)"과 "검사하는 쪽(이 스크립트)"을 분리해 자기 평가를 배제.
 *
 * 사용:
 *   npx tsx scripts/validate-template.ts            # 전체 템플릿 채점
 *   npx tsx scripts/validate-template.ts food_natural_01   # 특정 템플릿
 *
 * 합격선 70점. 결과: 콘솔 + templates/validation/{id}-report.json
 *
 * 채점 (100점):
 *   - patternOverrides 유효성  25  (값이 유효한 LayoutPatternType인가)
 *   - sectionSequence 유효성   20  (비어있지 않고 중복/공백 없는가)
 *   - fontPairing 완전성       15  (4개 폰트 역할 모두 채워졌는가)
 *   - 렌더 스모크              20  (buildHTML이 에러 없이 HTML 생성하는가)
 *   - 렌더 적용 확인           20  (출력에 폰트·패턴·섹션순서가 실제 반영됐는가)
 *
 * 색(colorTokens) 채점은 DetailTemplate에 색 필드 추가 후 별도 도입 (현재 미포함).
 */
import { FOOD_TEMPLATES, BEAUTY_TEMPLATES, ELECTRONICS_TEMPLATES, getTemplateById } from '../agents/templates/index'
import { buildHTML } from '../agents/html-builder'
import type { DetailTemplate } from '../agents/templates/types'
import type { StyleGuide, RefinedCopy, Script, LayoutPatternType, LayoutPattern } from '../agents/types'
import type { IconMappingJson } from '../agents/icon-mapper'
import * as fs from 'fs'
import * as path from 'path'

const PASS_SCORE = 70

const VALID_PATTERNS = new Set<string>([
  'full-bleed-hero', 'left-image-right-text', 'right-image-left-text', 'full-bleed-sensory',
  'dark-story-centered', 'numbered-steps-horizontal', 'grid-info-cards', 'photo-gallery-strip',
  'masonry-gallery', 'split-text-heavy', 'centered-statement', 'icon-feature-row',
  'comparison-table', 'timeline-vertical', 'full-bleed-overlay', 'testimonial-quote',
])

// script-writer가 실제 생성하는 sectionType (output/*/script.json 실증 + script-writer.ts 프롬프트 기준).
// 주의: agents/types.ts의 ScriptSection.type union은 불완전(key_benefit/sensory/process 등 누락) —
// 실제 동작 기준은 script-writer 출력 + html-builder resolvePattern 처리 섹션이다.
// 이 집합에 없는 값(한국어 라벨, 오타 등)만 비표준으로 감지 → sectionSequence 재정렬 매칭 실패.
const KNOWN_SECTION_TYPES = new Set<string>([
  'hero', 'brand_story', 'story',
  'key_benefit', 'benefits', 'features',
  'ingredients', 'sensory', 'texture_focus',
  'how_to_use', 'usage', 'process',
  'packaging', 'delivery', 'package_info',
  'photo_gallery', 'gallery',
  'social_proof', 'comparison', 'size_comparison',
  'certifications', 'gift_suggestion', 'faq', 'cta',
])

interface ScoreBreakdown {
  patternValidity: number
  sectionSequence: number
  fontPairing: number
  renderSmoke: number
  renderApplied: number
  colorFidelity: number
}

interface TemplateReport {
  templateId: string
  name: string
  category: string
  total: number
  passed: boolean
  breakdown: ScoreBreakdown
  issues: string[]
  checkedAt: string
}

// ── mock 입력 구성 ────────────────────────────────────────────
// buildHTML이 참조하는 최소 구조만 채운다. 색/카피 품질이 아니라
// "템플릿 데이터가 렌더에 반영되는가"를 보는 것이 목적.

function buildMockStyleGuide(t: DetailTemplate): StyleGuide {
  const layoutPatterns: LayoutPattern[] = t.sectionSequence.map((section) => ({
    section,
    pattern: (t.patternOverrides[section] ?? 'grid-info-cards') as LayoutPatternType,
    backgroundStyle: '#ffffff',
  }))

  // colorTokens가 있으면 실제 템플릿 색을 colors에 매핑 (렌더 결과로 색 반영 검증)
  const ct = t.colorTokens
  const colors = ct
    ? {
        primary: ct.primary, secondary: ct.secondary, surface1: ct.background, surface2: ct.background,
        surface3: '#ffffff', textDark: ct.text, textLight: '#ffffff', accent: ct.accent,
      }
    : {
        primary: '#3A7D44', secondary: '#6AAB5E', surface1: '#f5f5f0', surface2: '#ede9e0',
        surface3: '#ffffff', textDark: '#111111', textLight: '#ffffff', accent: '#C8A84B',
      }

  return {
    brand: { name: `TEST_${t.id}`, moodKeywords: ['test'], targetEmotion: 'trust' },
    colors,
    typography: {
      headlineFont: t.fontPairing.headlineFont,
      storyFont: t.fontPairing.storyFont,
      bodyFont: t.fontPairing.bodyFont,
      accentFont: t.fontPairing.accentFont,
      sizes: { hero: 48, h2: 32, h3: 24, body: 16, caption: 12 },
      weights: { headline: '800', body: '400' },
      letterSpacing: '-0.02em',
    },
    icons: { library: 'phosphor', weight: 'regular', size: 24, primaryColor: '#3A7D44', useCases: {} },
    decorativeElements: { dividerStyle: 'line', cornerRadius: '12px', shadows: 'soft' },
    layoutPatterns,
    sectionRhythm: 'alternating',
    referenceUrls: [],
    designNotes: 'mock for validation',
    selectedTemplateId: t.id,
  }
}

function buildMockRefinedCopy(t: DetailTemplate): RefinedCopy {
  return {
    sections: t.sectionSequence.map((sectionType) => ({
      sectionType,
      headline: `${sectionType} 헤드라인`,
      subheadline: `${sectionType} 서브헤드라인`,
      body: `${sectionType} 본문 텍스트입니다. 템플릿 검증용 더미 콘텐츠.`,
      items: [
        { label: '항목1', value: '값1' },
        { label: '항목2', value: '값2' },
      ],
    })),
  }
}

function buildMockScript(t: DetailTemplate): Script {
  return {
    sections: t.sectionSequence.map((type) => ({
      type: type as Script['sections'][number]['type'],
      title: `${type} 제목`,
      subtitle: `${type} 부제`,
      text: `${type} 스크립트 텍스트`,
      items: [{ title: '항목', description: '설명' }],
      steps: ['단계1', '단계2'],
    })),
    shooting_requirements: { nukki_shots: [], styling_shots: [], additional_notes: '' },
    tone: 'warm',
    color_suggestion: 'natural',
    key_insights: 'mock',
  }
}

function buildMockIconMapping(): IconMappingJson {
  return {
    library: 'phosphor',
    weight: 'regular',
    size: 24,
    color: '#3A7D44',
    cdnUrl: 'https://unpkg.com/@phosphor-icons/web',
    sections: {},
  }
}

// ── 채점 ──────────────────────────────────────────────────────

function scoreTemplate(t: DetailTemplate): TemplateReport {
  const issues: string[] = []
  const breakdown: ScoreBreakdown = {
    patternValidity: 0, sectionSequence: 0, fontPairing: 0, renderSmoke: 0, renderApplied: 0, colorFidelity: 0,
  }

  // 1. patternOverrides 유효성 (20)
  const overrideEntries = Object.entries(t.patternOverrides)
  if (overrideEntries.length === 0) {
    issues.push('patternOverrides 비어있음 (섹션별 레이아웃 미지정 → 기본값 의존)')
    breakdown.patternValidity = 8 // 비어있어도 치명적은 아님 (기본값 동작)
  } else {
    const invalid = overrideEntries.filter(([, p]) => !VALID_PATTERNS.has(p as string))
    if (invalid.length === 0) {
      breakdown.patternValidity = 20
    } else {
      invalid.forEach(([s, p]) => issues.push(`patternOverrides.${s} 무효 패턴: "${p}"`))
      breakdown.patternValidity = Math.max(0, 20 - invalid.length * 8)
    }
  }

  // 2. sectionSequence 유효성 (15)
  const seq = t.sectionSequence
  if (!seq || seq.length === 0) {
    issues.push('sectionSequence 비어있음 — 섹션 순서 보장 불가')
  } else {
    const dupes = seq.filter((s, i) => seq.indexOf(s) !== i)
    const blanks = seq.filter((s) => !s || !s.trim())
    if (dupes.length > 0) issues.push(`sectionSequence 중복: ${[...new Set(dupes)].join(', ')}`)
    if (blanks.length > 0) issues.push('sectionSequence 빈 항목 존재')
    // 비표준 sectionType 감지 — copy 파이프라인과 매칭 안 되면 실제 운영에서 순서 재정렬 실패
    const nonStandard = seq.filter((s2) => s2 && s2.trim() && !KNOWN_SECTION_TYPES.has(s2))
    if (nonStandard.length > 0) {
      issues.push(`비표준 sectionType (copy 파이프라인 매칭 불가 — 한국어 라벨 등): ${nonStandard.join(', ')}`)
    }
    let s = 15
    if (seq.length < 6) { s -= 4; issues.push(`sectionSequence 짧음 (${seq.length}개, 권장 8개+)`) }
    if (dupes.length > 0) s -= 6
    if (blanks.length > 0) s -= 6
    if (nonStandard.length > 0) s -= Math.min(10, nonStandard.length * 2)
    breakdown.sectionSequence = Math.max(0, s)
  }

  // 3. fontPairing 완전성 (15)
  const fp = t.fontPairing
  const fontRoles = [fp.headlineFont, fp.storyFont, fp.bodyFont, fp.accentFont]
  const filledFonts = fontRoles.filter((f) => f && f.trim()).length
  breakdown.fontPairing = Math.round((filledFonts / 4) * 15)
  if (filledFonts < 4) issues.push(`fontPairing 누락: ${4 - filledFonts}개 역할 비어있음`)

  // 4 & 5. 렌더 검증 (스모크 20 + 적용 20)
  let html = ''
  try {
    html = buildHTML(
      buildMockStyleGuide(t),
      buildMockRefinedCopy(t),
      buildMockScript(t),
      buildMockIconMapping(),
      {} // imageRelPaths 빈 객체 → CSS 배경 폴백
    )
    if (html && html.includes('<!DOCTYPE html>') && html.length > 500) {
      breakdown.renderSmoke = 20
    } else {
      breakdown.renderSmoke = 5
      issues.push('렌더 출력이 비정상적으로 짧거나 DOCTYPE 누락')
    }
  } catch (err) {
    issues.push(`렌더 실패(buildHTML throw): ${err instanceof Error ? err.message.substring(0, 120) : String(err)}`)
    breakdown.renderSmoke = 0
  }

  if (html) {
    let applied = 0
    // (a) 폰트 반영 — 헤드라인 폰트가 출력 CSS에 포함 (8)
    if (fp.headlineFont && html.includes(fp.headlineFont)) applied += 8
    else issues.push(`렌더 결과에 헤드라인 폰트 "${fp.headlineFont}" 미반영`)

    // (b) 패턴 반영 — patternOverrides 값이 data-pattern으로 출력에 등장 (8)
    if (overrideEntries.length > 0) {
      const patternsInHtml = overrideEntries.filter(([, p]) => html.includes(`data-pattern="${p}"`))
      if (patternsInHtml.length === overrideEntries.length) applied += 8
      else {
        applied += Math.round((patternsInHtml.length / overrideEntries.length) * 8)
        const missing = overrideEntries.filter(([, p]) => !html.includes(`data-pattern="${p}"`)).map(([s]) => s)
        issues.push(`data-pattern 미반영 섹션: ${missing.join(', ')}`)
      }
    } else {
      applied += 4 // override 없으면 부분 점수
    }

    // (c) 섹션 순서 반영 — 출력 data-section-type 순서가 sectionSequence 순서를 따르는가 (4)
    const sectionTypeOrder = [...html.matchAll(/data-section-type="([^"]+)"/g)].map((m) => m[1])
    if (sectionTypeOrder.length > 0 && seq.length > 0) {
      // sectionSequence에 있는 타입들이 출력에서 같은 상대 순서로 나오는가
      const filteredOutput = sectionTypeOrder.filter((s) => seq.includes(s))
      const expectedOrder = seq.filter((s) => filteredOutput.includes(s))
      const ordered = JSON.stringify(filteredOutput) === JSON.stringify(expectedOrder)
      if (ordered) applied += 4
      else issues.push(`섹션 순서 불일치: 출력[${filteredOutput.join(',')}] vs 기대[${expectedOrder.join(',')}]`)
    }
    breakdown.renderApplied = applied
  }

  // 6. 색 fidelity (10) — colorTokens 정의(레퍼런스 추출) + 렌더 반영
  const ct = t.colorTokens
  if (!ct) {
    issues.push('colorTokens 미정의 — 레퍼런스 색 fidelity 미검증 (설계 의도 단계 템플릿)')
    breakdown.colorFidelity = 0
  } else {
    let cScore = 0
    const hexRe = /^#[0-9a-fA-F]{3,8}$/
    const allValid = [ct.primary, ct.secondary, ct.background, ct.text, ct.accent].every((c) => hexRe.test(c))
    if (allValid) cScore += 5
    else issues.push('colorTokens에 유효하지 않은 HEX 값 존재')
    if (html.includes(ct.primary)) cScore += 3
    else issues.push(`렌더 결과에 primary 색(${ct.primary}) 미반영`)
    if (html.includes(ct.accent)) cScore += 2
    else issues.push(`렌더 결과에 accent 색(${ct.accent}) 미반영`)
    breakdown.colorFidelity = cScore
  }

  const total = breakdown.patternValidity + breakdown.sectionSequence + breakdown.fontPairing + breakdown.renderSmoke + breakdown.renderApplied + breakdown.colorFidelity

  return {
    templateId: t.id,
    name: t.name,
    category: t.category,
    total,
    passed: total >= PASS_SCORE,
    breakdown,
    issues,
    checkedAt: new Date().toISOString(),
  }
}

// ── 실행 ──────────────────────────────────────────────────────

function main(): void {
  const arg = process.argv[2]
  const all: DetailTemplate[] = [...FOOD_TEMPLATES, ...BEAUTY_TEMPLATES, ...ELECTRONICS_TEMPLATES]
  // 인자: .json 경로(draft 직접 로드) | templateId(정확 일치) | category | 생략(전체)
  let targets: DetailTemplate[]
  if (!arg) {
    targets = all
  } else if (arg.endsWith('.json')) {
    const p = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg)
    if (!fs.existsSync(p)) {
      console.error(`draft JSON 파일 없음: ${p}`)
      process.exit(1)
    }
    targets = [JSON.parse(fs.readFileSync(p, 'utf8')) as DetailTemplate]
  } else {
    const byId = getTemplateById(arg)
    targets = byId ? [byId] : all.filter((t) => t.category === arg)
  }

  if (targets.length === 0) {
    console.error(`템플릿/카테고리/파일을 찾을 수 없음: ${arg}`)
    process.exit(1)
  }

  const outDir = path.join(process.cwd(), 'templates', 'validation')
  fs.mkdirSync(outDir, { recursive: true })

  console.log(`\n템플릿 품질 채점 — ${targets.length}개 (합격선 ${PASS_SCORE}점)\n${'='.repeat(64)}`)

  const reports = targets.map(scoreTemplate)
  for (const r of reports) {
    const mark = r.passed ? '✅' : '❌'
    const b = r.breakdown
    console.log(`\n${mark} ${r.templateId} (${r.name}) — ${r.total}/100`)
    console.log(`   패턴유효 ${b.patternValidity}/20 · 섹션순서 ${b.sectionSequence}/15 · 폰트 ${b.fontPairing}/15 · 렌더 ${b.renderSmoke}/20 · 적용 ${b.renderApplied}/20 · 색 ${b.colorFidelity}/10`)
    if (r.issues.length > 0) {
      r.issues.forEach((i) => console.log(`   ⚠️  ${i}`))
    }
    fs.writeFileSync(path.join(outDir, `${r.templateId}-report.json`), JSON.stringify(r, null, 2), 'utf8')
  }

  const passCount = reports.filter((r) => r.passed).length
  const avg = Math.round(reports.reduce((s, r) => s + r.total, 0) / reports.length)
  console.log(`\n${'='.repeat(64)}`)
  console.log(`결과: ${passCount}/${reports.length} 합격 · 평균 ${avg}점`)
  console.log(`리포트 저장: templates/validation/`)

  // 전체 실행 시 합격률 50% 미만이면 비정상 종료 (CI 게이트용)
  if (!arg && passCount < reports.length * 0.5) {
    console.error('\n⚠️ 합격률 50% 미만 — 템플릿 품질 점검 필요')
    process.exit(1)
  }
}

main()
