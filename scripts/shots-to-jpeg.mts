/** 산출물 HTML → 씬별 JPEG(품질/폭 지정) — 클라이언트 공유본 제작용 */
import { chromium } from 'playwright'
import fs from 'node:fs'
const SHELL = '/Users/jinman/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const [htmlPath, outDir, qualityArg] = process.argv.slice(2)
const quality = Number(qualityArg ?? 68)
const b = await chromium.launch({ executablePath: SHELL })
const p = await b.newPage({ viewport: { width: 872, height: 2000 } })
await p.setContent(fs.readFileSync(htmlPath, 'utf8'), { waitUntil: 'networkidle' })
const scenes = await p.evaluate(`(() => Array.from(document.querySelectorAll('.dpg > .scene')).map((el) => {
  const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), n: el.getAttribute('data-scene') }
}))()`) as any[]
fs.mkdirSync(outDir, { recursive: true })
for (const s of scenes) {
  await p.screenshot({ path: `${outDir}/scene-${s.n}.jpg`, type: 'jpeg', quality, fullPage: true, clip: { x: 0, y: s.top, width: 872, height: s.h } })
}
console.log(scenes.map((s: any) => `씬${s.n}:${s.h}px`).join(' '))
await b.close()
