/**
 * Exporter 에이전트
 * PRD 1.3 최종 산출물 — htmlPath 존재 시 항상 실행 (QA 결과 무관)
 *
 * 출력 구조:
 *   5_export/
 *   ├── mobile/
 *   │   ├── detail_page.png   (430px × 2x = 860px, 모바일 CSS 적용)
 *   │   └── sections/         (섹션별 PNG)
 *   ├── pc/
 *   │   ├── detail_page.png   (860px × 1x = 860px, PC CSS 적용)
 *   │   └── sections/         (섹션별 PNG)
 *   ├── designer/
 *   │   ├── index.html + fonts/  (수정 가능 HTML)
 *   │   ├── style-guide.json
 *   │   └── layers/              (레이어별 PNG)
 *   ├── mobile.zip
 *   ├── pc.zip
 *   └── designer.zip
 */

import * as path from 'path'
import * as fs from 'fs'
import archiver from 'archiver'
import type { SectionLayout, StyleGuide } from './types'
import { runSvgBuilder } from './svg-builder'

export interface ExporterResult {
  success: boolean
  exportDir: string
  mobileDir: string
  pcDir: string
  designerDir: string
  mobileZip?: string
  pcZip?: string
  designerZip?: string
  figmaZip?: string
  mobileSectionCount: number
  pcSectionCount: number
  error?: string
}

export async function runExporter(
  htmlPath: string,
  baseOutputDir: string,   // output/{projectId}/
  styleGuide?: StyleGuide   // SVG builder용 (없으면 style-guide.json에서 로드)
): Promise<ExporterResult> {
  console.log('\n[Exporter] 시작')

  const exportDir  = path.join(baseOutputDir, '5_export')
  const mobileDir  = path.join(exportDir, 'mobile')
  const pcDir      = path.join(exportDir, 'pc')
  const designerDir = path.join(exportDir, 'designer')

  for (const d of [mobileDir, pcDir, designerDir]) {
    fs.mkdirSync(d, { recursive: true })
  }

  const executablePath = await findChromiumExecutable()
  let mobileSectionCount = 0
  let pcSectionCount = 0
  let pcLayouts: SectionLayout[] = []

  if (!executablePath) {
    console.warn('  ⚠️ Chrome/Chromium 실행 파일 없음 — Playwright 캡처 스킵')
    console.log('  → Chrome을 설치하거나 HTML 파일을 브라우저에서 직접 열어 확인하세요')
  } else {
    console.log(`  [Exporter] Chrome: ${path.basename(path.dirname(executablePath))}`)

    // ── Mobile 캡처 (430px × 2x = 860px, 모바일 CSS 적용) ──
    console.log('\n  [Mobile] 캡처 시작 (430px × 2x → 860px)')
    const mobileResult = await captureVersion(htmlPath, mobileDir, executablePath, {
      viewportWidth: 430,
      viewportHeight: 932,
      deviceScaleFactor: 2,
      injectMobileFix: true,
    })
    mobileSectionCount = mobileResult.sectionCount

    // ── PC 캡처 (860px × 1x = 860px, PC CSS 적용) + 레이아웃 추출 ──
    console.log('\n  [PC] 캡처 시작 (860px × 1x → 860px)')
    const pcResult = await captureVersion(htmlPath, pcDir, executablePath, {
      viewportWidth: 860,
      viewportHeight: 1200,
      deviceScaleFactor: 1,
      injectMobileFix: false,
    })
    pcSectionCount = pcResult.sectionCount
    pcLayouts = pcResult.layouts  // SVG builder에서 사용 (PC 뷰포트 기준)
  }

  // ── 디자이너 패키지 복사 (HTML 기반) ──
  copyDesignerFiles(baseOutputDir, designerDir)

  // ── Figma SVG 패키지 생성 ──
  const figmaDir = path.join(exportDir, 'designer-figma')
  fs.mkdirSync(figmaDir, { recursive: true })

  // styleGuide 로드 (파라미터 없으면 파일에서)
  let sg = styleGuide
  if (!sg) {
    const sgPath = path.join(baseOutputDir, 'style-guide.json')
    if (fs.existsSync(sgPath)) {
      sg = JSON.parse(fs.readFileSync(sgPath, 'utf8'))
    }
  }

  if (sg && pcLayouts && pcLayouts.length > 0) {
    await runSvgBuilder({
      layouts: pcLayouts,
      styleGuide: sg,
      baseOutputDir,
      outputDir: figmaDir,
    })
  }

  // ── ZIP 패키징 ──
  let mobileZip: string | undefined
  let pcZip: string | undefined
  let designerZip: string | undefined
  let figmaZip: string | undefined

  try {
    mobileZip = await createZip(mobileDir, path.join(exportDir, 'mobile.zip'))
    console.log('  ✅ mobile.zip 생성')
  } catch (err: unknown) {
    console.warn(`  ⚠️ mobile.zip 생성 실패: ${err instanceof Error ? err.message : String(err)}`)
  }

  try {
    pcZip = await createZip(pcDir, path.join(exportDir, 'pc.zip'))
    console.log('  ✅ pc.zip 생성')
  } catch (err: unknown) {
    console.warn(`  ⚠️ pc.zip 생성 실패: ${err instanceof Error ? err.message : String(err)}`)
  }

  try {
    designerZip = await createZip(designerDir, path.join(exportDir, 'designer.zip'))
    console.log('  ✅ designer.zip 생성')
  } catch (err: unknown) {
    console.warn(`  ⚠️ designer.zip 생성 실패: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (fs.existsSync(figmaDir) && fs.readdirSync(figmaDir).length > 0) {
    try {
      figmaZip = await createZip(figmaDir, path.join(exportDir, 'designer-figma.zip'))
      console.log('  ✅ designer-figma.zip 생성')
    } catch (err: unknown) {
      console.warn(`  ⚠️ designer-figma.zip 생성 실패: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const success = mobileSectionCount > 0 || pcSectionCount > 0
  console.log(`\n[Exporter] 완료 — Mobile ${mobileSectionCount}섹션, PC ${pcSectionCount}섹션`)

  return {
    success,
    exportDir,
    mobileDir,
    pcDir,
    designerDir,
    mobileZip,
    pcZip,
    designerZip,
    figmaZip,
    mobileSectionCount,
    pcSectionCount,
  }
}

// ─── Playwright 캡처 ───────────────────────────────────────────────────────────

interface CaptureOptions {
  viewportWidth: number
  viewportHeight: number
  deviceScaleFactor: number
  injectMobileFix: boolean   // 모바일 캡처 시 min-height 오버라이드 CSS 주입
}

async function findChromiumExecutable(): Promise<string | null> {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }

  try {
    const chromiumModule = await import('@sparticuz/chromium-min')
    const execPath = await chromiumModule.default.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
    )
    if (execPath && fs.existsSync(execPath)) return execPath
  } catch {
    // 서버리스 환경 아님
  }

  return null
}

interface CaptureResult {
  sectionCount: number
  layouts: SectionLayout[]
}

/**
 * 하나의 뷰포트 설정으로 PNG(전체+섹션별) 캡처 + 요소별 레이아웃 추출
 */
async function captureVersion(
  htmlPath: string,
  outputDir: string,
  executablePath: string,
  opts: CaptureOptions
): Promise<CaptureResult> {
  let sectionCount = 0
  let layouts: SectionLayout[] = []

  try {
    const { chromium } = await import('playwright-core')
    const browser = await chromium.launch({
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true,
    })

    const context = await browser.newContext({
      deviceScaleFactor: opts.deviceScaleFactor,
      viewport: { width: opts.viewportWidth, height: opts.viewportHeight },
    })
    const page = await context.newPage()
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })

    // 모바일 캡처 시: 기존 HTML(html-builder 구버전)의 min-height 오버라이드
    if (opts.injectMobileFix) {
      await page.addStyleTag({
        content: `
          .story-bg { min-height: 0 !important; }
          .sensory-section > img { height: 400px !important; }
        `,
      })
    }

    // lazy 이미지 강제 로드 — 헤드리스에서 뷰포트 밖 이미지 미로드 방지
    await page.evaluate(() => {
      document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager'
        if (img.dataset.src) img.src = img.dataset.src
      })
    })
    // 전체 스크롤 후 대기 → 이미지 로드 완료 보장
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => window.scrollTo(0, 0))

    // 전체 페이지 PNG
    const screenshotPath = path.join(outputDir, 'detail_page.png')
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`    ✅ detail_page.png (${opts.viewportWidth}px × ${opts.deviceScaleFactor}x)`)

    // 섹션별 PNG
    const sectionsDir = path.join(outputDir, 'sections')
    fs.mkdirSync(sectionsDir, { recursive: true })

    const sectionLocators = await page.locator('section').all()
    for (let i = 0; i < sectionLocators.length; i++) {
      const bbox = await sectionLocators[i].boundingBox()
      if (!bbox || bbox.height < 50) continue
      const sectionPath = path.join(sectionsDir, `section_${String(i + 1).padStart(2, '0')}.png`)
      await sectionLocators[i].screenshot({ path: sectionPath })
      sectionCount++
    }
    console.log(`    ✅ 섹션별 PNG ${sectionCount}장 → sections/`)

    // 요소별 레이아웃 추출 (SVG builder용 — page 객체가 아직 살아있는 상태)
    layouts = (await page.evaluate(() => {
      const TEXT_SELECTORS: Record<string, string> = {
        headline: '.section-title, .story-title, .cta-title, .statement-title, .overlay-title',
        subheadline: '.section-sub, .sensory-sub, .cta-sub, .statement-sub',
        body: '.body-text, .story-body, .cta-tagline, .sensory-body, .statement-body',
        itemTitle: '.info-title, .step-h-title, .feature-col-title, .timeline-title',
        itemBody: '.info-body, .step-h-body, .feature-col-body, .timeline-body',
      }

      const sections = document.querySelectorAll('[data-section-type]')
      return Array.from(sections).map(section => {
        const rect = section.getBoundingClientRect()
        const style = getComputedStyle(section)

        const elements: { type: string; bounds: { top: number; left: number; width: number; height: number }; content?: string; fontFamily?: string; fontSize?: number; fontWeight?: string; color?: string; textAlign?: string; lineHeight?: number; src?: string }[] = []

        for (const sel of Object.values(TEXT_SELECTORS)) {
          section.querySelectorAll(sel).forEach(el => {
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) return
            const s = getComputedStyle(el)
            elements.push({
              type: 'text',
              bounds: { top: r.top, left: r.left, width: r.width, height: r.height },
              content: el.textContent?.trim() ?? '',
              fontFamily: s.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
              fontSize: parseFloat(s.fontSize),
              fontWeight: s.fontWeight,
              color: s.color,
              textAlign: s.textAlign,
              lineHeight: parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.5,
            })
          })
        }

        section.querySelectorAll('img[src]').forEach(img => {
          const r = (img as HTMLElement).getBoundingClientRect()
          if (r.width === 0 || r.height === 0) return
          elements.push({
            type: 'image',
            bounds: { top: r.top, left: r.left, width: r.width, height: r.height },
            src: (img as HTMLImageElement).getAttribute('src') ?? '',
          })
        })

        return {
          sectionIndex: parseInt((section as HTMLElement).dataset.sectionIndex ?? '0'),
          sectionType: (section as HTMLElement).dataset.sectionType ?? '',
          sectionBounds: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage !== 'none' ? style.backgroundImage : undefined,
          elements,
        }
      })
    })) as unknown as SectionLayout[]
    console.log(`    ✅ 레이아웃 추출 ${layouts.length}섹션`)

    await browser.close()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`    ⚠️ 캡처 실패: ${msg.substring(0, 120)}`)
  }

  return { sectionCount, layouts }
}

// ─── 디자이너 패키지 복사 ──────────────────────────────────────────────────────

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function copyDesignerFiles(baseOutputDir: string, designerDir: string): void {
  const finalDir  = path.join(baseOutputDir, '4_final')
  const layersDir = path.join(baseOutputDir, '3_layers')

  const htmlSrc = path.join(finalDir, 'index.html')
  if (fs.existsSync(htmlSrc)) {
    fs.copyFileSync(htmlSrc, path.join(designerDir, 'index.html'))
    console.log('  ✅ index.html → designer/')
  }

  const fontsSrc = path.join(finalDir, 'fonts')
  if (fs.existsSync(fontsSrc)) {
    copyDirRecursive(fontsSrc, path.join(designerDir, 'fonts'))
    console.log('  ✅ fonts/ → designer/')
  }

  const styleSrc = path.join(baseOutputDir, 'style-guide.json')
  if (fs.existsSync(styleSrc)) {
    fs.copyFileSync(styleSrc, path.join(designerDir, 'style-guide.json'))
    console.log('  ✅ style-guide.json → designer/')
  }

  if (fs.existsSync(layersDir)) {
    const layerFiles = fs.readdirSync(layersDir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
    copyDirRecursive(layersDir, path.join(designerDir, 'layers'))
    console.log(`  ✅ layers/ (${layerFiles.length}개) → designer/`)
  }
}

// ─── ZIP 패키징 ────────────────────────────────────────────────────────────────

function createZip(sourceDir: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 6 } })

    output.on('close', () => resolve(outputPath))
    archive.on('error', reject)

    archive.pipe(output)
    archive.directory(sourceDir, false)
    archive.finalize()
  })
}
