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
  /** 씬별 톤 정보 — .dpg > .scene 이 없는 구 HTML은 빈 배열 */
  sceneTones: Array<{ tone: string; mixed: boolean }>
  sectionCount: number
  fontSamples: { title: number[]; body: number[] }
  imgDup: Array<{ src: string; count: number }>
  /** 솔리드 장식과 텍스트의 bbox 교차 — "장식클래스 ↔ 텍스트 앞부분" */
  decoOverlaps?: string[]
  /** 최종 렌더에 실제로 보이는 빈 플레이스홀더(.ph) — 소속 섹션 data-name */
  phVisible?: string[]
  /** 로드 실패 이미지(naturalWidth===0)의 src 말미 */
  brokenImg?: string[]
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
      const sceneTones = Array.from(document.querySelectorAll('.dpg > .scene')).map((scene) => {
        const sections = Array.from(scene.querySelectorAll('section[data-tone]'))
        if (sections.length === 0) return { tone: '', mixed: false }
        const toneCount = new Map<string, number>()
        sections.forEach((s) => {
          const t = s.getAttribute('data-tone') ?? ''
          toneCount.set(t, (toneCount.get(t) ?? 0) + 1)
        })
        let maxCount = 0
        let majority = ''
        toneCount.forEach((count, tone) => {
          if (count > maxCount) { maxCount = count; majority = tone }
        })
        return { tone: majority, mixed: toneCount.size > 1 }
      })
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
      // 솔리드 장식 ↔ 텍스트 bbox 교차 — 워시(고스트·텍스처)는 저불투명이라 제외
      const decoOverlaps: string[] = []
      const solidDecos = Array.from(
        document.querySelectorAll('.dpg .dL-seal, .dpg .dL-arrow, .dpg .dL-spark, .dpg .dL-vlabel, .dpg .dL-vlabel-r'),
      ).slice(0, 60)
      for (const deco of solidDecos) {
        const d = deco.getBoundingClientRect()
        if (d.width === 0 || d.height === 0) continue
        const section = deco.closest('section')
        if (!section) continue
        const texts = Array.from(section.querySelectorAll('h1,h2,h3,h4,p,li,dt,dd')).filter(
          (el) => (el.textContent ?? '').trim().length >= 2,
        )
        for (const t of texts.slice(0, 80)) {
          const r = t.getBoundingClientRect()
          const ix = Math.min(d.right, r.right) - Math.max(d.left, r.left)
          const iy = Math.min(d.bottom, r.bottom) - Math.max(d.top, r.top)
          if (ix > 6 && iy > 6 && ix * iy > 40) {
            // SVG 요소의 className은 SVGAnimatedString이라 split 불가 — getAttribute로 통일
            // (이 버그로 장식 SVG가 있는 페이지에서 감사 전체가 예외 → ran:false로 무력화됐다)
            const cls = (deco.getAttribute('class') ?? '').split(' ')[0]
            decoOverlaps.push(`${cls} ↔ "${(t.textContent ?? '').trim().slice(0, 24)}"`)
            break
          }
        }
      }
      // §5 P0 — 빈 플레이스홀더가 최종 렌더에 실제로 보이는지 결정적 검사
      // (dropEmptyPhotoBlocks는 URL 0장 기준 사전 드롭일 뿐, DOM 노출 검사는 없었다)
      const phVisible = Array.from(document.querySelectorAll('.dpg .ph'))
        .filter((el) => {
          const e = el as HTMLElement
          if (e.offsetWidth === 0 || e.offsetHeight === 0) return false
          const cs = getComputedStyle(e)
          return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.05
        })
        .slice(0, 10)
        .map((el) => el.closest('section')?.getAttribute('data-name') ?? '(unknown)')
      const brokenImg = Array.from(document.querySelectorAll('.dpg img'))
        .filter((img) => (img as HTMLImageElement).naturalWidth === 0)
        .slice(0, 10)
        .map((img) => (img as HTMLImageElement).src.slice(-60))
      return {
        scrollHeight,
        sceneHeights,
        sceneTones,
        sectionCount,
        fontSamples: { title: titleFonts, body: bodyFonts },
        imgDup,
        decoOverlaps,
        phVisible,
        brokenImg,
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
  // 본문 폰트 < 23px — 클라이언트 폰트 룰 v2(2026-07-20): 기본 정보 최소 23px(872px 캔버스 기준,
  // 커머스 상세는 모바일에서 ~45%로 축소 표시되므로 웹 표준보다 큰 하한이 실무 기준)
  const smallBody = measurements.fontSamples.body.filter((sz) => Number.isFinite(sz) && sz < 23)
  if (smallBody.length > 0)
    ruleViolations.push(
      `본문 폰트 소형(<23px): ${smallBody.length}개, 최소 ${Math.min(...smallBody)}px`,
    )
  // 동일 이미지 중복
  if (measurements.imgDup.length > 0)
    ruleViolations.push(
      `동일 이미지 중복: ${measurements.imgDup.map((d) => `${d.src}(${d.count}회)`).join(', ')}`,
    )
  // 씬 톤 혼재 — mixed 씬 목록 (리포트 전용)
  if (measurements.sceneTones.length > 0) {
    const mixedIdxs = measurements.sceneTones
      .map((s, i) => (s.mixed ? i + 1 : -1))
      .filter((n) => n > 0)
    if (mixedIdxs.length > 0)
      ruleViolations.push(`씬 톤 혼재: 씬 ${mixedIdxs.join(', ')}번`)
    // 톤 3연속 동일 — 발생 구간
    const consecutiveRanges: string[] = []
    let ci = 0
    while (ci < measurements.sceneTones.length) {
      const t = measurements.sceneTones[ci].tone
      if (t === '') { ci++; continue }
      let cj = ci + 1
      while (cj < measurements.sceneTones.length && measurements.sceneTones[cj].tone === t) cj++
      if (cj - ci >= 3) consecutiveRanges.push(`씬${ci + 1}~${cj}(${t})`)
      ci = cj
    }
    if (consecutiveRanges.length > 0)
      ruleViolations.push(`톤 3연속 동일: ${consecutiveRanges.join(', ')}`)
  }
  // 씬 높이 리듬 이탈 (목표 1600~2400px) — 기존 2500 초과 위반과 별도 경고
  if (measurements.sceneHeights.length > 0) {
    const rhythmShort = measurements.sceneHeights.filter((h) => h < 1600)
    const rhythmTall = measurements.sceneHeights.filter((h) => h > 2400)
    if (rhythmShort.length > 0 || rhythmTall.length > 0) {
      const parts: string[] = []
      if (rhythmShort.length > 0) parts.push(`1600px 미만 ${rhythmShort.length}개`)
      if (rhythmTall.length > 0) parts.push(`2400px 초과 ${rhythmTall.length}개`)
      ruleViolations.push(`씬 높이 리듬 이탈: ${parts.join(', ')} (목표 1600~2400px)`)
    }
  }
  // 플레이스홀더 노출·깨진 이미지 — §5 P0 결정적 검사(AI 감사 변동성의 보완 그물)
  if (measurements.phVisible && measurements.phVisible.length > 0) {
    ruleViolations.push(
      `빈 플레이스홀더 노출 ${measurements.phVisible.length}건: ${measurements.phVisible.slice(0, 5).join(', ')}`,
    )
  }
  if (measurements.brokenImg && measurements.brokenImg.length > 0) {
    ruleViolations.push(
      `이미지 로드 실패 ${measurements.brokenImg.length}건: ${measurements.brokenImg.slice(0, 3).join(', ')}`,
    )
  }
  // 솔리드 장식-텍스트 겹침 — 결정적 bbox 교차 (AI 감사 변동성의 보완 그물)
  if (measurements.decoOverlaps && measurements.decoOverlaps.length > 0) {
    ruleViolations.push(
      `장식-텍스트 겹침 ${measurements.decoOverlaps.length}건: ${measurements.decoOverlaps.slice(0, 5).join(' / ')}`,
    )
  }
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
