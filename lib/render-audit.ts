/**
 * 렌더 시각 감사 유틸 — HTML을 헤드리스 chromium으로 세그먼트 캡처해 비전 감사에 넘긴다.
 * e2e 러너 전용이던 STEP 6을 파이프라인 공용으로 승격(200사 무인 운영의 최종 그물).
 * chromium이 없는 환경(Vercel)에서는 ran:false로 명시 기록 — 조용한 생략 금지.
 */
import fs from 'node:fs'

const DEFAULT_SHELL =
  '/Users/jinman/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell'

export function chromiumShellPath(): string | null {
  const p = process.env.PLAYWRIGHT_CHROMIUM_SHELL ?? DEFAULT_SHELL
  return fs.existsSync(p) ? p : null
}

/** 단일 page.evaluate로 수집하는 DOM 계측 결과 */
export interface PageMeasurements {
  scrollHeight: number
  sceneHeights: number[]
  sectionCount: number
  fontSamples: { title: number[]; body: number[] }
  imgDup: Array<{ src: string; count: number }>
}

export interface RenderAuditResult {
  /** 감사가 실제로 실행됐는가 — false면 pass는 판단 아님(미실행) */
  ran: boolean
  pass: boolean
  issues: string[]
  reason?: string
  /** 글로벌 룰 위반 목록 — 리포트 전용, pass 판정과 폐루프 재조립에 영향 없음 */
  ruleViolations?: string[]
  /** DOM 계측 원시값 — 타이틀 분포 포함, 기준 확정 전 분포 파악 용도 */
  measurements?: object
}

export async function captureSegments(
  html: string,
): Promise<{ segments: string[]; measurements: PageMeasurements } | null> {
  const shell = chromiumShellPath()
  if (!shell) return null
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({ executablePath: shell })
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } })
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 90000 })
    // 한 번의 evaluate로 모든 계측 — .dpg 범위로 좁혀 querySelectorAll('*') 금지
    const measurements = (await page.evaluate(() => {
      const scrollHeight = document.body.scrollHeight
      const sceneHeights = Array.from(document.querySelectorAll('.dpg > .scene')).map(
        (el) => (el as HTMLElement).offsetHeight,
      )
      const sectionCount = document.querySelectorAll('.dpg > *').length
      const titleFonts = Array.from(
        document.querySelectorAll('.dpg h1, .dpg h2, .dpg .disp'),
      )
        .slice(0, 200)
        .map((el) => parseFloat(getComputedStyle(el).fontSize))
      const bodyFonts = Array.from(document.querySelectorAll('.dpg p, .dpg li'))
        .filter((el) => (el.textContent ?? '').trim().length >= 10)
        .slice(0, 200)
        .map((el) => parseFloat(getComputedStyle(el).fontSize))
      const srcCount = new Map<string, number>()
      Array.from(document.querySelectorAll('.dpg img')).forEach((img) => {
        const src = (img as HTMLImageElement).src
        srcCount.set(src, (srcCount.get(src) ?? 0) + 1)
      })
      const imgDup = Array.from(srcCount.entries())
        .filter(([, c]) => c >= 2)
        .map(([s, c]) => ({ src: s.slice(-60), count: c }))
      return {
        scrollHeight,
        sceneHeights,
        sectionCount,
        fontSamples: { title: titleFonts, body: bodyFonts },
        imgDup,
      }
    })) as PageMeasurements
    const segments: string[] = []
    const H = measurements.scrollHeight
    for (let y = 0; y * 2400 < H && segments.length < 8; y++) {
      const h = Math.min(2400, H - y * 2400)
      const buf = await page.screenshot({ clip: { x: 0, y: y * 2400, width: 900, height: h }, fullPage: true })
      segments.push(Buffer.from(buf).toString('base64'))
    }
    return { segments, measurements }
  } finally {
    await browser.close()
  }
}

export async function auditRenderedHtml(html: string): Promise<RenderAuditResult> {
  let captured: { segments: string[]; measurements: PageMeasurements } | null
  try {
    captured = await captureSegments(html)
  } catch (e) {
    return { ran: false, pass: true, issues: [], reason: `캡처 실패: ${(e as Error).message?.slice(0, 120)}` }
  }
  if (!captured) return { ran: false, pass: true, issues: [], reason: 'chromium 없음(환경 미지원)' }
  const { segments, measurements } = captured
  // 명백한 룰 위반만 판정 — 리포트 전용, pass 판정과 폐루프 재조립에 영향 없음
  const ruleViolations: string[] = []
  // 씬 높이 > 2500px (씬 래퍼 없으면 검사 skip)
  if (measurements.sceneHeights.length > 0) {
    const tall = measurements.sceneHeights.filter((h) => h > 2500)
    if (tall.length > 0)
      ruleViolations.push(`씬 높이 초과(>2500px): ${tall.length}개, 최대 ${Math.max(...tall)}px`)
  }
  // 전체 scrollHeight > 25000px
  if (measurements.scrollHeight > 25000)
    ruleViolations.push(`전체 높이 초과(>25000px): ${measurements.scrollHeight}px`)
  // 본문 폰트 < 13px
  const smallBody = measurements.fontSamples.body.filter((sz) => Number.isFinite(sz) && sz < 13)
  if (smallBody.length > 0)
    ruleViolations.push(
      `본문 폰트 소형(<13px): ${smallBody.length}개, 최소 ${Math.min(...smallBody)}px`,
    )
  // 동일 이미지 중복
  if (measurements.imgDup.length > 0)
    ruleViolations.push(
      `동일 이미지 중복: ${measurements.imgDup.map((d) => `${d.src}(${d.count}회)`).join(', ')}`,
    )
  // 타이틀 분포 — 위반 판정 없이 측정값만 보존(오탐 방지, 분포 확보 후 기준 확정)
  const titleValid = measurements.fontSamples.title.filter((sz) => Number.isFinite(sz) && sz > 0)
  const titleFontDistribution =
    titleValid.length > 0
      ? {
          min: Math.min(...titleValid),
          max: Math.max(...titleValid),
          median: [...titleValid].sort((a, b) => a - b)[Math.floor(titleValid.length / 2)],
        }
      : null
  const measurementsOut: object = { ...measurements, titleFontDistribution }
  const { runVisualAudit } = await import('@/agents/image-tagger')
  const audit = await runVisualAudit(segments)
  if (!audit.success || !audit.data)
    return {
      ran: false,
      pass: true,
      issues: [],
      reason: `감사 실패: ${audit.error?.slice(0, 120)}`,
      ruleViolations,
      measurements: measurementsOut,
    }
  return { ran: true, pass: audit.data.pass, issues: audit.data.issues, ruleViolations, measurements: measurementsOut }
}
