/**
 * 임의 HTML 파일을 860px 폭으로 풀페이지 렌더 → PNG. (디자인 반복 검증용)
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx scripts/render-html.ts <html파일> [출력png] [폭]
 */
import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function main(): Promise<void> {
  const htmlPath = process.argv[2]
  const outPng = process.argv[3] || htmlPath.replace(/\.html?$/, '.png')
  const width = Number(process.argv[4] || 860)
  if (!htmlPath || !fs.existsSync(htmlPath)) { console.error('HTML 파일 없음:', htmlPath); process.exit(1) }

  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  // deviceScaleFactor 1: 긴 페이지(×2 시 19800px)가 Chrome 캡처 한계(~16384px) 초과 → 하단 wrap 발생. 1x로 회피.
  const page = await browser.newPage({ viewport: { width, height: 1200 }, deviceScaleFactor: 1 })
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(async () => { if ((document as any).fonts?.ready) await (document as any).fonts.ready })
  // 이미지 디코드 + 레이아웃 안정화: 끝까지 스크롤했다가 복귀
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map(img => img.complete ? null : img.decode().catch(() => {})))
    for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(600)
  const h = await page.evaluate(() => document.body.scrollHeight)
  // fullPage 타일 중복 버그 회피: 뷰포트를 전체 높이로 키워 단일 캡처
  await page.setViewportSize({ width, height: Math.min(h, 30000) })
  await page.waitForTimeout(300)
  await page.screenshot({ path: outPng })
  await browser.close()
  console.log(`✅ 렌더 완료: ${outPng} (${width}px 폭, 높이 ${h}px, 단일뷰포트 캡처)`)
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
