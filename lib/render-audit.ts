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

export interface RenderAuditResult {
  /** 감사가 실제로 실행됐는가 — false면 pass는 판단 아님(미실행) */
  ran: boolean
  pass: boolean
  issues: string[]
  reason?: string
}

export async function captureSegments(html: string): Promise<string[] | null> {
  const shell = chromiumShellPath()
  if (!shell) return null
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({ executablePath: shell })
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } })
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 90000 })
    const H = await page.evaluate(() => document.body.scrollHeight)
    const segments: string[] = []
    for (let y = 0; y * 2400 < H && segments.length < 8; y++) {
      const h = Math.min(2400, H - y * 2400)
      const buf = await page.screenshot({ clip: { x: 0, y: y * 2400, width: 900, height: h }, fullPage: true })
      segments.push(Buffer.from(buf).toString('base64'))
    }
    return segments
  } finally {
    await browser.close()
  }
}

export async function auditRenderedHtml(html: string): Promise<RenderAuditResult> {
  let segments: string[] | null
  try {
    segments = await captureSegments(html)
  } catch (e) {
    return { ran: false, pass: true, issues: [], reason: `캡처 실패: ${(e as Error).message?.slice(0, 120)}` }
  }
  if (!segments) return { ran: false, pass: true, issues: [], reason: 'chromium 없음(환경 미지원)' }
  const { runVisualAudit } = await import('@/agents/image-tagger')
  const audit = await runVisualAudit(segments)
  if (!audit.success || !audit.data)
    return { ran: false, pass: true, issues: [], reason: `감사 실패: ${audit.error?.slice(0, 120)}` }
  return { ran: true, pass: audit.data.pass, issues: audit.data.issues }
}
