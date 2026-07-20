/**
 * 룰 준수 채점기 — 산출물 HTML 하나를 렌더해 글로벌 룰 전체를 자동 채점한다.
 *
 * 왜: 룰이 40개를 넘어 눈으로 매번 확인하는 것이 병목이다. 수정→확인 루프를 1분으로 줄인다.
 * 채점 대상은 docs/plans/page-rules.md의 룰 코드(F·S·I·E)와 1:1 대응한다.
 *
 * 사용: npx tsx --env-file=.env.local scripts/check-rules.ts <회사명|HTML경로>
 */
import fs from 'node:fs'
import { chromiumShellPath } from '@/lib/render-audit'
import { createServiceClient } from '@/lib/supabase/service'

const ARG = process.argv[2]
if (!ARG) {
  console.error('사용: check-rules.ts <회사명|HTML경로>')
  process.exit(1)
}

interface Check {
  code: string
  rule: string
  pass: boolean | null // null = 측정 불가(정보 부족)
  detail: string
}

async function loadHtml(arg: string): Promise<{ html: string; label: string }> {
  if (fs.existsSync(arg)) return { html: fs.readFileSync(arg, 'utf8'), label: arg }
  const svc = createServiceClient()
  const { data: projs } = await svc.from('projects').select('id, company_name')
  const p = (projs ?? []).find((x) =>
    String(x.company_name).replace(/\s+/g, '').includes(arg.replace(/\s+/g, '')),
  )
  if (!p) throw new Error(`프로젝트 못 찾음: ${arg}`)
  const { data } = await svc.storage.from('designs').download(`projects/${p.id}/4_final/index.html`)
  if (!data) throw new Error('산출물(4_final/index.html) 없음')
  return { html: await data.text(), label: String(p.company_name) }
}

async function main(): Promise<void> {
  const { html, label } = await loadHtml(ARG)
  const shell = chromiumShellPath()
  if (!shell) throw new Error('chromium 없음')
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({ executablePath: shell })
  const page = await browser.newPage({ viewport: { width: 872, height: 1200 } })
  await page.setContent(html, { waitUntil: 'networkidle', timeout: 90000 })

  // 주의: page.evaluate 안에서 이름 있는 함수·화살표 상수를 쓰면 tsx(esbuild) 계측이 붙어
  // "__name is not defined"로 죽는다. 전부 인라인 식으로만 작성한다.
  const m = await page.evaluate(`(() => {
    const vis = (el) => {
      const cs = getComputedStyle(el)
      return el.offsetWidth > 0 && el.offsetHeight > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'
    }
    const fam = (el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()
    const sz = (el) => parseFloat(getComputedStyle(el).fontSize)
    const root = document.querySelector('.dpg')
    const scenes = Array.from(document.querySelectorAll('.dpg > .scene'))
    const sections = Array.from(document.querySelectorAll('.dpg section'))
    const titles = Array.from(document.querySelectorAll('.dpg h1, .dpg h2, .dpg .disp')).filter(vis)
    const subs = Array.from(document.querySelectorAll('.dpg [class*="sub"], .dpg [class*="lead"]'))
      .filter((el) => vis(el) && (el.textContent || '').trim().length >= 4 && el.children.length === 0)
    const bodies = Array.from(document.querySelectorAll('.dpg p, .dpg li, .dpg dd'))
      .filter((el) => vis(el) && (el.textContent || '').trim().length >= 8)
    const imgs = Array.from(document.querySelectorAll('.dpg img'))
    const srcCount = new Map()
    imgs.forEach((i) => srcCount.set(i.src, (srcCount.get(i.src) || 0) + 1))
    const textLed = sections.filter((s) => ['spec','faq','cs','shipping'].includes(s.getAttribute('data-arch') || ''))
    let faces = 0
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const r of Array.from(sheet.cssRules)) if (r.constructor.name === 'CSSFontFaceRule') faces++
      } catch (e) { /* cross-origin */ }
    }
    return {
      totalHeight: document.body.scrollHeight,
      sceneCount: scenes.length,
      sceneHeights: scenes.map((s) => s.offsetHeight),
      sceneBgs: scenes.map((s) => getComputedStyle(s.querySelector('section') || s).backgroundColor),
      sectionCount: sections.length,
      namedSections: sections.filter((s) => s.hasAttribute('data-name')).length,
      allFamilies: Array.from(new Set(Array.from(document.querySelectorAll('.dpg *')).filter(vis).map(fam))).filter(Boolean),
      titleFamilies: Array.from(new Set(titles.map(fam))),
      subFamilies: Array.from(new Set(subs.map(fam))),
      bodyFamilies: Array.from(new Set(bodies.map(fam))),
      titleSizes: titles.map(sz),
      subSizes: subs.map(sz),
      bodySizes: bodies.map(sz),
      imgCount: imgs.length,
      imgDup: Array.from(srcCount.values()).filter((c) => c > 1).length,
      imgBroken: imgs.filter((i) => i.naturalWidth === 0).length,
      heroHasImg: sections[0] ? sections[0].querySelectorAll('img').length > 0 : false,
      heroImageRatio: (() => {
        const h = sections[0]
        if (!h || !h.offsetWidth || !h.offsetHeight) return -1
        let a = 0
        Array.from(h.querySelectorAll('img')).forEach((img) => {
          if (img.naturalWidth === 0) return
          const cs = getComputedStyle(img)
          if (cs.display === 'none' || cs.visibility === 'hidden') return
          a += img.offsetWidth * img.offsetHeight
        })
        return Math.round((a / (h.offsetWidth * h.offsetHeight)) * 1000) / 10
      })(),
      phVisible: Array.from(document.querySelectorAll('.dpg .ph')).filter(vis).length,
      textLedWithImg: textLed.filter((s) => s.querySelectorAll('img').length > 0).length,
      fontFaces: faces,
      canvasWidth: root ? root.offsetWidth : 0,
    }
  })()`) as {
    totalHeight: number; sceneCount: number; sceneHeights: number[]; sceneBgs: string[]
    sectionCount: number; namedSections: number; allFamilies: string[]
    titleFamilies: string[]; subFamilies: string[]; bodyFamilies: string[]
    titleSizes: number[]; subSizes: number[]; bodySizes: number[]
    imgCount: number; imgDup: number; imgBroken: number; heroHasImg: boolean; heroImageRatio: number
    phVisible: number; textLedWithImg: number; fontFaces: number; canvasWidth: number
  }
  await browser.close()

  const min = (a: number[]) => (a.length ? Math.min(...a) : 0)
  const max = (a: number[]) => (a.length ? Math.max(...a) : 0)
  const checks: Check[] = [
    { code: 'F1', rule: '폰트 5종 이하', pass: m.allFamilies.length <= 5, detail: `${m.allFamilies.length}종: ${m.allFamilies.join(', ')}` },
    { code: 'F2', rule: '타이틀 1종', pass: m.titleFamilies.length <= 1, detail: `${m.titleFamilies.length}종: ${m.titleFamilies.join(', ')}` },
    { code: 'F3', rule: '서브 1종·최소 30px', pass: m.subFamilies.length <= 1 && (m.subSizes.length === 0 || min(m.subSizes) >= 30), detail: `${m.subFamilies.length}종 · ${min(m.subSizes)}~${max(m.subSizes)}px` },
    { code: 'F4', rule: '본문 1종·최소 23px', pass: m.bodyFamilies.length <= 1 && min(m.bodySizes) >= 23, detail: `${m.bodyFamilies.length}종(${m.bodyFamilies.join(',')}) · ${min(m.bodySizes)}~${max(m.bodySizes)}px · 미달 ${m.bodySizes.filter((s) => s < 23).length}개` },
    { code: 'F6', rule: '제공 폰트 내장(@font-face)', pass: m.fontFaces > 0, detail: `@font-face ${m.fontFaces}건` },
    { code: 'S1', rule: '7씬 고정', pass: m.sceneCount === 7, detail: `${m.sceneCount}씬` },
    { code: 'S2', rule: '씬당 1,600~2,400px(상한 2,500)', pass: m.sceneHeights.every((h) => h >= 1600 && h <= 2500), detail: `[${m.sceneHeights.join(', ')}] 이탈 ${m.sceneHeights.filter((h) => h < 1600 || h > 2500).length}개` },
    { code: 'S3', rule: '전체 ≤25,000px', pass: m.totalHeight <= 25000, detail: `${m.totalHeight.toLocaleString()}px` },
    { code: 'S4', rule: '씬 배경 교차', pass: new Set(m.sceneBgs).size >= 2, detail: `배경 ${new Set(m.sceneBgs).size}종` },
    { code: 'S6', rule: '14~20블록', pass: m.sectionCount >= 14 && m.sectionCount <= 20, detail: `${m.sectionCount}블록` },
    { code: 'I1', rule: '히어로 이미지 존재', pass: m.heroHasImg, detail: m.heroHasImg ? '있음' : '없음' },
    { code: 'I10', rule: '히어로 이미지 면적 25%+', pass: m.heroImageRatio >= 25, detail: `씬1 면적의 ${m.heroImageRatio}%` },
    { code: 'I5', rule: '동일 사진 1회', pass: m.imgDup === 0, detail: `중복 ${m.imgDup}건 / 총 ${m.imgCount}장` },
    { code: 'I7', rule: '표계열 이미지 금지', pass: m.textLedWithImg === 0, detail: `위반 ${m.textLedWithImg}개 섹션` },
    { code: 'E3', rule: '고정폭 872px', pass: m.canvasWidth === 872, detail: `${m.canvasWidth}px` },
    { code: 'E4', rule: '플레이스홀더 미노출', pass: m.phVisible === 0 && m.imgBroken === 0, detail: `.ph ${m.phVisible}개 · 깨진 이미지 ${m.imgBroken}개` },
    { code: 'FG', rule: '피그마 레이어 이름', pass: m.namedSections === m.sectionCount, detail: `${m.namedSections}/${m.sectionCount} 섹션` },
  ]

  const passN = checks.filter((c) => c.pass === true).length
  console.log(`\n════ 룰 채점: ${label} ════`)
  for (const c of checks) {
    const mark = c.pass === null ? '—' : c.pass ? '✅' : '❌'
    console.log(`${mark} ${c.code.padEnd(3)} ${c.rule.padEnd(24)} ${c.detail}`)
  }
  console.log(`\n통과 ${passN}/${checks.length}`)
  process.exit(passN === checks.length ? 0 : 1)
}

main().catch((e) => {
  console.error('[check-rules] 실패:', (e as Error).message)
  process.exit(1)
})
