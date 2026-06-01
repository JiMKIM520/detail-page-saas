/**
 * 512266a3 v5 풀 재생성:
 *  1) style-guide.json/3_layers/4_final/5_export 백업
 *  2) Art Director 재실행 (v5 신규 필드 포함된 layoutPatterns 생성)
 *  3) Layer Image v5 재실행 (layer-image bgType 섹션의 누락 배경 자동 채움)
 *  4) HTML Builder + Exporter 재실행
 *  5) Mobile PNG 오픈
 */
import { runArtDirector } from '../agents/art-director'
import { runLayerImage } from '../agents/layer-image'
import { runIconMapper } from '../agents/icon-mapper'
import { runHtmlBuilder } from '../agents/html-builder'
import { runExporter } from '../agents/exporter'
import { loadJson } from '../agents/utils'
import type { ProjectBrief, StyleGuide, RefinedCopy, Script, StylingPromptsJson } from '../agents/types'
import * as path from 'path'
import * as fs from 'fs'
import { execFileSync } from 'child_process'

const PROJECT_ID = '512266a3'
const BASE = path.join(process.cwd(), 'output', PROJECT_ID)

const dirs = {
  base: BASE,
  script: path.join(BASE, '1_script'),
  stylingShots: path.join(BASE, '2_styling_shots'),
  layers: path.join(BASE, '3_layers'),
  icons: path.join(BASE, 'icons'),
  final: path.join(BASE, '4_final'),
  designRefs: path.join(BASE, 'design-refs'),
}

function backup(filePath: string, suffix: string): void {
  if (!fs.existsSync(filePath)) return
  const ext = path.extname(filePath)
  const target = filePath.replace(ext, `.${suffix}${ext}`)
  fs.copyFileSync(filePath, target)
  console.log(`  💾 backup: ${path.basename(target)}`)
}

function backupDir(dirPath: string, suffix: string): void {
  if (!fs.existsSync(dirPath)) return
  const target = `${dirPath}_${suffix}`
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true })
  fs.cpSync(dirPath, target, { recursive: true })
  console.log(`  💾 backup dir: ${path.basename(target)}`)
}

;(async () => {
  console.log('=== 512266a3 v5 풀 재생성 ===\n')

  // ── Step 0: 백업 ──
  console.log('[Step 0] 백업')
  backup(path.join(BASE, 'style-guide.json'), 'v4')
  backup(path.join(BASE, 'styling-shots-prompts.json'), 'v4')
  backupDir(dirs.layers, 'v4')

  // ── Step 1: Art Director 재실행 ──
  console.log('\n[Step 1] Art Director 재실행 (v5 신규 필드 포함)')
  const brief = loadJson<ProjectBrief>(path.join(BASE, 'project-brief.json'))

  // 섹션별 레퍼런스 로드 (8 섹션 × 3장)
  const V5_SECTIONS = ['hero', 'brand_story', 'key_benefit', 'ingredients', 'process', 'sensory', 'packaging', 'cta']
  const sectionsDir = path.join(process.cwd(), 'docs', 'references', 'sections')
  const sectionRefs = V5_SECTIONS.map(section => {
    const dir = path.join(sectionsDir, section)
    if (!fs.existsSync(dir)) return { section, paths: [] as string[] }
    const files = fs.readdirSync(dir)
      .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(f => path.join(dir, f))
    return { section, paths: files }
  })
  console.log(`  섹션별 레퍼런스: ${sectionRefs.reduce((n, s) => n + s.paths.length, 0)}장`)

  const refImages = fs.existsSync(dirs.designRefs)
    ? fs.readdirSync(dirs.designRefs)
        .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
        .map(f => path.join(dirs.designRefs, f))
    : []
  console.log(`  레퍼런스 이미지: ${refImages.length}장`)

  const adResult = await runArtDirector(brief, refImages, BASE, sectionRefs)
  if (!adResult.success) {
    console.error('Art Director 실패:', adResult.error)
    process.exit(1)
  }

  const sg = adResult.data!.styleGuide
  const v5Sections = sg.layoutPatterns
    .filter(lp => lp.bgType === 'layer-image' || lp.overlayStrategy)
    .map(lp => `${lp.section}(${lp.bgType ?? '?'}/${lp.overlayStrategy ?? '?'})`)
  console.log(`  v5 섹션: ${v5Sections.length}/${sg.layoutPatterns.length}`)
  console.log(`    ${v5Sections.join(', ')}`)

  // ── Step 2: Layer Image v5 ──
  console.log('\n[Step 2] Layer Image v5 (누락 섹션 자동 채움)')
  const script = loadJson<Script>(path.join(dirs.script, 'script.json'))
  const ssp = loadJson<StylingPromptsJson>(path.join(BASE, 'styling-shots-prompts.json'))

  const stylingShotPaths = ssp.shots
    .map(s => path.join(dirs.stylingShots, s.filename))
    .filter(p => fs.existsSync(p))
  console.log(`  스타일링샷: ${stylingShotPaths.length}장`)

  // 누끼 — 기존 1번 샷을 사용 (실제 nukki는 별도 등록되어 있지 않은 케이스)
  const nukkiPaths = stylingShotPaths.slice(0, 1)

  // 기존 3_layers 디렉터리 정리 후 재생성
  fs.mkdirSync(dirs.layers, { recursive: true })

  const liResult = await runLayerImage(script, sg, stylingShotPaths, nukkiPaths, dirs.layers, ssp.conceptShots, ssp.sectionImageBriefs)
  if (!liResult.success) {
    console.error('Layer Image 실패:', liResult.error)
    process.exit(1)
  }
  console.log(`  생성된 레이어: ${Object.keys(liResult.data!).length}개`)

  // ── Step 3: HTML Builder ──
  console.log('\n[Step 3] HTML Builder')
  const refinedCopy = loadJson<RefinedCopy>(path.join(BASE, 'refined-copy.json'))

  const iconResult = runIconMapper(script, sg, dirs.icons)
  if (!iconResult.success) {
    console.error('Icon Mapper 실패:', iconResult.error)
    process.exit(1)
  }

  // 이미지 경로 매핑: layer + 스타일링샷
  const imagePaths: Record<string, string> = {}
  for (const [k, v] of Object.entries(liResult.data!)) imagePaths[k] = v
  imagePaths.heroBackground = path.join(dirs.layers, 'hero_background.png')
  imagePaths.heroWithTypo = path.join(dirs.layers, 'hero_with_typo.png')
  imagePaths.breakImage = path.join(dirs.layers, 'break_image.png')
  ssp.shots.forEach((shot, i) => {
    const p = path.join(dirs.stylingShots, shot.filename)
    if (fs.existsSync(p)) imagePaths[`shot${i}`] = p
  })

  const htmlResult = await runHtmlBuilder(sg, refinedCopy, script, iconResult.data!, dirs.final, imagePaths)
  if (!htmlResult.success) {
    console.error('HTML Builder 실패:', htmlResult.error)
    process.exit(1)
  }

  // ── Step 4: Exporter ──
  console.log('\n[Step 4] Exporter')
  const exportResult = await runExporter(htmlResult.data!.htmlPath, BASE)
  console.log(`  Mobile: ${exportResult.mobileSectionCount}장 / PC: ${exportResult.pcSectionCount}장`)

  const mobilePng = path.join(BASE, '5_export', 'mobile', 'detail_page.png')
  if (fs.existsSync(mobilePng)) {
    console.log(`\n✅ 완성: ${mobilePng}`)
    execFileSync('open', [mobilePng])
  }
})()
