/**
 * v5 검증 2단계 — 모든 섹션 배경/액센트 생성 후 시각 평가
 * 비용 ~$1 (AD Opus + Layer Image 6~12장)
 */
import { runArtDirector } from '../agents/art-director'
import { runLayerImage } from '../agents/layer-image'
import { loadJson } from '../agents/utils'
import { collectReferences } from '../agents/design-researcher'
import type { ProjectBrief } from '../agents/types'
import * as path from 'path'
import * as fs from 'fs'
import { execFileSync } from 'child_process'

const PROJECT_ID = '512266a3'
const BASE = path.join(process.cwd(), 'output', PROJECT_ID)
const TEST_DIR = path.join(BASE, '3_v5_test_all')

;(async () => {
  console.log('=== v5 전체 섹션 배경 생성 테스트 ===\n')
  fs.mkdirSync(TEST_DIR, { recursive: true })

  // ── 1) Art Director ──
  console.log('[1/3] Art Director 실행')
  const brief = loadJson<ProjectBrief>(path.join(BASE, 'project-brief.json'))
  const refs = await collectReferences(brief.category, brief.toneKeywords ?? [], TEST_DIR, {
    perSectionRefs: 3,
    countPerWebSource: 0,
    webScrape: false,
  })
  const refImages = [...refs.categoryRefs, ...refs.webRefs]
  const sectionRefs = refs.sectionRefs

  const ad = await runArtDirector(brief, refImages, TEST_DIR, sectionRefs)
  if (!ad.success || !ad.data) {
    console.error('AD 실패:', ad.error)
    process.exit(1)
  }

  const briefs = ad.data.stylingPrompts.sectionImageBriefs ?? []
  console.log(`\n  ✓ sectionImageBriefs ${briefs.length}개 생성\n`)
  briefs.forEach(b => {
    console.log(`  [${b.section}] ${b.assets.length}장 — texture: "${b.textureHint}"`)
  })

  // ── 2) 모든 섹션 Layer Image ──
  console.log(`\n[2/3] Layer Image 전체 섹션 실행 (${briefs.length}개 섹션, 총 ${briefs.reduce((n, b) => n + b.assets.length, 0)}장)`)

  const stylingShotsDir = path.join(BASE, '2_styling_shots')
  const stylingShotPaths = fs.existsSync(stylingShotsDir)
    ? fs.readdirSync(stylingShotsDir).filter(f => /\.(jpg|png)$/i.test(f)).slice(0, 2).map(f => path.join(stylingShotsDir, f))
    : []

  const li = await runLayerImage(
    JSON.parse(fs.readFileSync(path.join(BASE, '1_script', 'script.json'), 'utf8')),
    ad.data.styleGuide,
    stylingShotPaths,
    stylingShotPaths.slice(0, 1),
    TEST_DIR,
    undefined,
    briefs,
  )

  if (!li.success) {
    console.error('Layer Image 실패:', li.error)
    process.exit(1)
  }

  // ── 3) 시각 확인 ──
  console.log(`\n[3/3] 시각 확인 — ${TEST_DIR}`)
  const generated = Object.entries(li.data ?? {}).sort(([a], [b]) => a.localeCompare(b))
  console.log(`  생성된 에셋 (${generated.length}장):`)
  for (const [key, p] of generated) {
    const size = (fs.statSync(p).size / 1024).toFixed(0)
    console.log(`    ${key}: ${size}KB`)
  }

  // 섹션별로 묶어서 오픈
  const filesToOpen = generated.map(([, p]) => p)
  if (filesToOpen.length > 0) {
    console.log('\n파일 오픈 중...')
    execFileSync('open', filesToOpen)
  }

  console.log('\n=== 시각 평가 가이드 ===')
  console.log('  - 각 섹션이 톤이 명백히 다른가?')
  console.log('  - 각 배경이 카드/텍스트 올릴 만한 calm zone을 가지는가?')
  console.log('  - "촌스러운" 인상이 줄었는가?')
})()
