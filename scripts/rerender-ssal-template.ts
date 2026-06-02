/**
 * 소금빵 템플릿 재렌더 (API 불필요 — 기존 planning 재사용).
 * - 다크 풀블리드 섹션 배경에 실제 스타일링샷 배선 + html-builder의 CSS 스크림 수정 반영
 * - runHtmlBuilder(순수 조립) → runExporter(Playwright, Google Chrome) → 로컬 산출
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local scripts/rerender-ssal-template.ts
 * 결과: /tmp/ssal-rerender/4_final/index.html, /tmp/ssal-rerender/5_export/{mobile,pc,designer}
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { runHtmlBuilder } from '@/agents/html-builder'
import { runExporter } from '@/agents/exporter'

const PID = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096'
const BASE = 'https://uddyemjqoxqttzpminwa.supabase.co/storage/v1/object/public/designs/projects/' + PID
const OUT = '/tmp/ssal-rerender'

async function dl(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`다운로드 실패 ${res.status}: ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
}
async function dlJson(url: string): Promise<any> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`JSON 실패 ${res.status}: ${url}`)
  return res.json()
}

async function main(): Promise<void> {
  // 디렉터리 준비
  fs.rmSync(OUT, { recursive: true, force: true })
  const finalDir = path.join(OUT, '4_final')
  const assets = path.join(OUT, 'assets')
  fs.mkdirSync(finalDir, { recursive: true })
  fs.mkdirSync(assets, { recursive: true })

  // 1) planning 로드
  console.log('[rerender] planning 로드...')
  const styleGuide = await dlJson(`${BASE}/style-guide.json`)
  const refinedCopy = await dlJson(`${BASE}/refined-copy.json`)
  const script = await dlJson(`${BASE}/planning/script.json`)
  const iconMapping = await dlJson(`${BASE}/icons/icon-mapping.json`)
  // copyDesignerFiles가 base/style-guide.json 을 읽으므로 동봉
  fs.writeFileSync(path.join(OUT, 'style-guide.json'), JSON.stringify(styleGuide, null, 2))
  console.log(`  sections(script)=${script?.sections?.length} copy=${refinedCopy?.sections?.length} template=${styleGuide?.selectedTemplateId}`)

  // 2) 스타일링샷 다운로드 (이미 /tmp/ssal 에 있으면 복사)
  console.log('[rerender] 스타일링샷 준비...')
  const shotSrc = [
    { key: 'hero', file: 'hero_dark_closeup.png' },
    { key: 'overhead', file: 'overhead_minimal.png' },
    { key: 'butter', file: 'butter_pairing.png' },
  ]
  const shotPath: Record<string, string> = {}
  for (const s of shotSrc) {
    const dest = path.join(assets, `styling_${s.key}.png`)
    const cached = `/tmp/ssal/styling_${s.key}.png`
    if (fs.existsSync(cached)) fs.copyFileSync(cached, dest)
    else await dl(`${BASE}/styling_real/${s.file}`, dest)
    shotPath[s.key] = dest
  }

  // 3) allImagePaths — 다크 풀블리드 섹션 배경 = 스타일링샷, split/gallery = 스타일링샷 회전
  const allImagePaths: Record<string, string> = {
    // 다크 풀블리드 배경 (getLayerAssetUrl: section_{slug}_background 우선)
    section_hero_background: shotPath.hero,
    section_sensory_background: shotPath.overhead,
    section_cta_background: shotPath.butter,
    section_brand_story_background: shotPath.overhead,
    section_ingredients_background: shotPath.butter,
    section_packaging_background: shotPath.hero,
    // 레거시 폴백 키
    heroBackground: shotPath.hero,
    heroBg: shotPath.hero,
    heroWithTypo: shotPath.hero,
    breakImage: shotPath.overhead,
    // split/gallery용 회전
    shot0: shotPath.overhead,
    shot1: shotPath.butter,
    shot2: shotPath.hero,
    shot3: shotPath.overhead,
  }

  // 4) html-builder (순수 조립, CSS 스크림 수정 포함)
  console.log('[rerender] runHtmlBuilder...')
  const hb = await runHtmlBuilder(styleGuide, refinedCopy, script, iconMapping, finalDir, allImagePaths)
  if (!hb.success) throw new Error('html-builder 실패: ' + hb.error)
  console.log('  HTML:', (hb.data as any)?.htmlPath)

  // 5) exporter (Playwright 렌더 + designer 번들)
  console.log('[rerender] runExporter...')
  const ex = await runExporter(path.join(finalDir, 'index.html'), OUT, styleGuide)
  console.log('  exporter success=', ex.success)

  // 6) 산출 확인
  const pcFull = path.join(OUT, '5_export/pc/detail_page.png')
  const designerImages = path.join(OUT, '5_export/designer/images')
  console.log('\n=== 결과 ===')
  console.log('PC full:', fs.existsSync(pcFull) ? '✅ ' + Math.round(fs.statSync(pcFull).size/1024) + 'KB' : '❌ 없음')
  console.log('designer/images:', fs.existsSync(designerImages) ? '✅ ' + fs.readdirSync(designerImages).length + '개' : '❌ 없음')
  const pcSecDir = path.join(OUT, '5_export/pc/sections')
  if (fs.existsSync(pcSecDir)) console.log('PC sections:', fs.readdirSync(pcSecDir).filter(f=>f.endsWith('.png')).length + '개')
  console.log('OUT:', OUT)
}
main().catch(e => { console.error('FATAL', e.message, e.stack); process.exit(1) })
