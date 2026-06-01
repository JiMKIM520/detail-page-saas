/**
 * SVG Builder 에이전트
 * Playwright에서 추출한 레이아웃 정보를 기반으로 Figma import용 SVG 생성.
 *
 * 출력:
 *   designer-figma/
 *   ├── sections/         섹션별 SVG
 *   ├── full/             전체 통합 SVG
 *   ├── photos/           이미지 소재 복사
 *   ├── fonts/            사용 폰트 복사
 *   ├── style-tokens.json 디자인 토큰
 *   └── import-guide.md   Figma import 안내
 */

import * as fs from 'fs'
import * as path from 'path'
import type { SectionLayout, LayoutElement, StyleGuide } from './types'

// ── 타입 ─────────────────────────────────────────────────────

export interface SvgBuilderInput {
  layouts: SectionLayout[]
  styleGuide: StyleGuide
  baseOutputDir: string      // output/{projectId}/
  outputDir: string          // 5_export/designer-figma/
}

export interface SvgBuilderResult {
  success: boolean
  sectionCount: number
  fullPageSvgPath?: string
  error?: string
}

// ── SVG 유틸 ─────────────────────────────────────────────────

/** CSS rgb(r, g, b) → SVG hex 변환 */
function cssColorToHex(cssColor: string): string {
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return cssColor
  const [, r, g, b] = match
  return `#${[r, g, b].map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`
}

/** 특수 문자 XML 이스케이프 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** SVG text-anchor 매핑 */
function textAnchor(align: string | undefined): string {
  if (align === 'center') return 'middle'
  if (align === 'right') return 'end'
  return 'start'
}

/** 텍스트 X 위치 계산 (정렬 기반) */
function textX(el: LayoutElement, sectionLeft: number): number {
  const relX = el.bounds.left - sectionLeft
  if (el.textAlign === 'center') return relX + el.bounds.width / 2
  if (el.textAlign === 'right') return relX + el.bounds.width
  return relX
}

// ── 텍스트 줄바꿈 처리 ───────────────────────────────────────

/** 텍스트를 tspan 요소로 분리 (줄바꿈 + 너비 기반 자동 줄바꿈) */
function buildTextTspans(
  el: LayoutElement,
  x: number,
  startY: number,
  lineHeight: number
): string {
  const content = el.content ?? ''
  const lines = content.split('\n').filter(l => l.trim())

  if (lines.length === 0) return ''

  // 단일 줄이면 tspan 불필요
  if (lines.length === 1) return escapeXml(lines[0])

  return lines.map((line, i) => {
    const dy = i === 0 ? 0 : lineHeight
    return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`
  }).join('\n      ')
}

// ── 섹션 SVG 생성 ────────────────────────────────────────────

function buildSectionSvg(layout: SectionLayout, photosRelPath: string): string {
  const { sectionBounds, backgroundColor, backgroundImage, elements } = layout
  const w = Math.round(sectionBounds.width)
  const h = Math.round(sectionBounds.height)
  const sTop = sectionBounds.top
  const sLeft = sectionBounds.left

  const svgParts: string[] = []

  // 1. 배경
  const bgColor = cssColorToHex(backgroundColor)
  svgParts.push(`  <rect width="${w}" height="${h}" fill="${bgColor}"/>`)

  // 배경 그라데이션 (CSS linear-gradient → SVG linearGradient)
  if (backgroundImage && backgroundImage.includes('linear-gradient')) {
    // 단순 처리: 첫 번째 색상과 마지막 색상 추출
    const colors = backgroundImage.match(/#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g)
    if (colors && colors.length >= 2) {
      const id = `grad_${layout.sectionIndex}`
      svgParts.push(`  <defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cssColorToHex(colors[0])}"/>
      <stop offset="100%" stop-color="${cssColorToHex(colors[colors.length - 1])}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>`)
    }
  }

  // 2. 이미지 요소
  const imageElements = elements.filter(el => el.type === 'image' && el.src)
  for (const el of imageElements) {
    const relX = Math.round(el.bounds.left - sLeft)
    const relY = Math.round(el.bounds.top - sTop)
    const elW = Math.round(el.bounds.width)
    const elH = Math.round(el.bounds.height)

    // 이미지 src → photos/ 상대 경로로 변환
    let href = el.src ?? ''
    if (href.startsWith('/api/designs/')) {
      // 프록시 URL → 파일명 추출
      const fileParam = new URL(href, 'http://localhost').searchParams.get('file')
      if (fileParam) href = `${photosRelPath}/${path.basename(fileParam)}`
    } else if (href.startsWith('../') || href.startsWith('./')) {
      href = `${photosRelPath}/${path.basename(href)}`
    } else if (href.startsWith('data:')) {
      // base64 인라인은 그대로 유지
    } else {
      href = `${photosRelPath}/${path.basename(href)}`
    }

    svgParts.push(`  <image href="${href}" x="${relX}" y="${relY}" width="${elW}" height="${elH}" preserveAspectRatio="xMidYMid slice"/>`)
  }

  // 3. 텍스트 요소
  const textElements = elements.filter(el => el.type === 'text' && el.content)
  for (const el of textElements) {
    const x = Math.round(textX(el, sLeft))
    const relY = Math.round(el.bounds.top - sTop)
    const fontSize = Math.round(el.fontSize ?? 16)
    const lineH = Math.round(el.lineHeight ?? fontSize * 1.5)
    const anchor = textAnchor(el.textAlign)
    const fill = el.color ? cssColorToHex(el.color) : '#1A1A1A'
    const fontFamily = el.fontFamily ?? 'sans-serif'
    const fontWeight = el.fontWeight ?? '400'

    const tspans = buildTextTspans(el, x, relY + fontSize, lineH)
    if (!tspans) continue

    svgParts.push(`  <text x="${x}" y="${relY + fontSize}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}" text-anchor="${anchor}">
    ${tspans}
  </text>`)
  }

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
${svgParts.join('\n')}
</svg>`
}

// ── 전체 통합 SVG ────────────────────────────────────────────

function buildFullPageSvg(layouts: SectionLayout[], photosRelPath: string): string {
  if (layouts.length === 0) return '<svg xmlns="http://www.w3.org/2000/svg"/>'

  const totalWidth = Math.round(Math.max(...layouts.map(l => l.sectionBounds.width)))
  const totalHeight = Math.round(
    layouts[layouts.length - 1].sectionBounds.top +
    layouts[layouts.length - 1].sectionBounds.height -
    layouts[0].sectionBounds.top
  )
  const baseTop = layouts[0].sectionBounds.top

  const groups = layouts.map(layout => {
    const yOffset = Math.round(layout.sectionBounds.top - baseTop)
    const sectionSvgContent = buildSectionSvg(layout, photosRelPath)
    // SVG 내부 콘텐츠만 추출 (svg 태그 제거)
    const inner = sectionSvgContent
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '')
      .trim()
    return `  <g transform="translate(0, ${yOffset})" data-section="${layout.sectionType}">
  ${inner}
  </g>`
  })

  return `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
${groups.join('\n')}
</svg>`
}

// ── 이미지/폰트 복사 ────────────────────────────────────────

function collectPhotos(baseOutputDir: string, photosDir: string): number {
  fs.mkdirSync(photosDir, { recursive: true })
  let count = 0

  const dirs = [
    path.join(baseOutputDir, '2_styling_shots'),
    path.join(baseOutputDir, '3_layer_images'),
  ]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(png|jpg|jpeg|webp)$/i.test(f)) continue
      fs.copyFileSync(path.join(dir, f), path.join(photosDir, f))
      count++
    }
  }

  return count
}

function collectFonts(baseOutputDir: string, fontsDir: string): number {
  fs.mkdirSync(fontsDir, { recursive: true })
  let count = 0

  // 4_final/fonts/ 에서 복사
  const finalFonts = path.join(baseOutputDir, '4_final', 'fonts')
  if (fs.existsSync(finalFonts)) {
    for (const f of fs.readdirSync(finalFonts)) {
      if (!/\.(ttf|otf|woff|woff2)$/i.test(f)) continue
      fs.copyFileSync(path.join(finalFonts, f), path.join(fontsDir, f))
      count++
    }
  }

  // assets/fonts/ 에서 추가 복사 (프로젝트 루트)
  const assetsFonts = path.join(process.cwd(), 'assets', 'fonts')
  if (fs.existsSync(assetsFonts)) {
    for (const f of fs.readdirSync(assetsFonts)) {
      if (!/\.(ttf|otf|woff|woff2)$/i.test(f)) continue
      const dest = path.join(fontsDir, f)
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(assetsFonts, f), dest)
        count++
      }
    }
  }

  return count
}

// ── 스타일 토큰 ──────────────────────────────────────────────

function generateStyleTokens(sg: StyleGuide, outputPath: string): void {
  const tokens = {
    colors: sg.colors,
    typography: {
      headlineFont: sg.typography.headlineFont,
      bodyFont: sg.typography.bodyFont,
      storyFont: sg.typography.storyFont,
      accentFont: sg.typography.accentFont,
      sizes: sg.typography.sizes,
    },
    decorative: sg.decorativeElements,
  }
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2), 'utf8')
}

// ── import 가이드 ────────────────────────────────────────────

function generateImportGuide(sg: StyleGuide, fontsDir: string, outputPath: string): void {
  const fontFiles = fs.existsSync(fontsDir)
    ? fs.readdirSync(fontsDir).filter(f => /\.(ttf|otf|woff|woff2)$/i.test(f))
    : []

  const fontList = fontFiles.length > 0
    ? fontFiles.map(f => `- ${f}`).join('\n')
    : '- (폰트 파일 없음 — Google Fonts에서 직접 다운로드 필요)'

  const guide = `# Figma Import 가이드

## 1. 폰트 설치
fonts/ 폴더의 모든 폰트를 시스템에 설치해주세요.
${fontList}

사용된 Google Fonts (CDN):
- ${sg.typography.headlineFont.split(',')[0].replace(/['"]/g, '').trim()}
- ${sg.typography.bodyFont.split(',')[0].replace(/['"]/g, '').trim()}
- ${sg.typography.storyFont.split(',')[0].replace(/['"]/g, '').trim()}

## 2. Figma Import 방법

### 방법 A: 섹션별 import
1. Figma → 새 파일 생성 (860px 너비 프레임)
2. File → Place Image (Ctrl+Shift+K 또는 Cmd+Shift+K)
3. sections/ 폴더에서 SVG 파일 선택
4. 각 섹션이 독립 프레임으로 배치됨

### 방법 B: 전체 페이지 import
1. Figma → 새 파일 생성
2. full/full_page.svg 파일을 드래그 앤 드롭
3. 전체 상세페이지가 하나의 프레임으로 배치됨

## 3. 편집 방법
- **텍스트**: 더블클릭 → 직접 수정 (폰트 설치 필요)
- **이미지**: 선택 → Fill → Change Image
- **색상**: 요소 선택 → Fill 색상 변경
- **순서**: 레이어 패널에서 드래그

## 4. 색상 토큰 (style-tokens.json)
| 용도 | 색상 |
|------|------|
| Primary | ${sg.colors.primary} |
| Secondary | ${sg.colors.secondary} |
| Surface 1 | ${sg.colors.surface1} |
| Surface 2 | ${sg.colors.surface2} |
| Accent | ${sg.colors.accent} |
| Text Dark | ${sg.colors.textDark} |
| Text Light | ${sg.colors.textLight} |

## 5. 이미지 소재
photos/ 폴더에 스타일링샷 및 레이어 이미지 원본이 포함되어 있습니다.
SVG에서 참조하는 이미지 경로가 정확하려면 폴더 구조를 유지해주세요.
`
  fs.writeFileSync(outputPath, guide, 'utf8')
}

// ── 메인 실행 ────────────────────────────────────────────────

export async function runSvgBuilder(input: SvgBuilderInput): Promise<SvgBuilderResult> {
  const { layouts, styleGuide, baseOutputDir, outputDir } = input

  if (layouts.length === 0) {
    return { success: false, sectionCount: 0, error: 'No layouts provided' }
  }

  console.log(`\n  [SVG Builder] 시작 — ${layouts.length}섹션`)

  try {
    // 디렉토리 생성
    const sectionsDir = path.join(outputDir, 'sections')
    const fullDir = path.join(outputDir, 'full')
    const photosDir = path.join(outputDir, 'photos')
    const fontsDir = path.join(outputDir, 'fonts')
    for (const d of [sectionsDir, fullDir, photosDir, fontsDir]) {
      fs.mkdirSync(d, { recursive: true })
    }

    // 이미지 + 폰트 복사
    const photoCount = collectPhotos(baseOutputDir, photosDir)
    console.log(`  ✅ photos/ ${photoCount}개 복사`)

    const fontCount = collectFonts(baseOutputDir, fontsDir)
    console.log(`  ✅ fonts/ ${fontCount}개 복사`)

    // 섹션별 SVG 생성
    for (const layout of layouts) {
      const idx = String(layout.sectionIndex + 1).padStart(2, '0')
      const filename = `${idx}_${layout.sectionType}.svg`
      const svg = buildSectionSvg(layout, '../photos')
      fs.writeFileSync(path.join(sectionsDir, filename), svg, 'utf8')
    }
    console.log(`  ✅ sections/ ${layouts.length}개 SVG 생성`)

    // 전체 통합 SVG
    const fullSvg = buildFullPageSvg(layouts, '../photos')
    const fullSvgPath = path.join(fullDir, 'full_page.svg')
    fs.writeFileSync(fullSvgPath, fullSvg, 'utf8')
    console.log(`  ✅ full/full_page.svg 생성`)

    // 스타일 토큰
    generateStyleTokens(styleGuide, path.join(outputDir, 'style-tokens.json'))
    console.log(`  ✅ style-tokens.json 생성`)

    // import 가이드
    generateImportGuide(styleGuide, fontsDir, path.join(outputDir, 'import-guide.md'))
    console.log(`  ✅ import-guide.md 생성`)

    console.log(`  [SVG Builder] 완료`)
    return { success: true, sectionCount: layouts.length, fullPageSvgPath: fullSvgPath }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`  ❌ SVG Builder 실패: ${msg}`)
    return { success: false, sectionCount: 0, error: msg }
  }
}
