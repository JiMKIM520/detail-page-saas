/**
 * v5 검증 1단계 — brand_story 1섹션만 단독 테스트
 *  1) AD 1회 호출 (sectionImageBriefs 확인)
 *  2) brand_story sectionImageBrief의 assets만 Layer Image 실행
 *  3) 시각 확인 (open mobile assets)
 *
 * 비용 ~$0.5 (AD Opus + Layer Image 1~3장)
 */
import { runArtDirector } from '../agents/art-director'
import { runLayerImage } from '../agents/layer-image'
import { loadJson } from '../agents/utils'
import type { ProjectBrief, SectionImageBrief } from '../agents/types'
import * as path from 'path'
import * as fs from 'fs'
import { execFileSync } from 'child_process'

const PROJECT_ID = '512266a3'
const BASE = path.join(process.cwd(), 'output', PROJECT_ID)
const TEST_DIR = path.join(BASE, '3_v5_test_brand_story')

;(async () => {
  console.log('=== v5 검증 1단계: brand_story 1섹션 단독 테스트 ===\n')

  fs.mkdirSync(TEST_DIR, { recursive: true })

  // ── Step 1: AD 호출 ──
  console.log('[1/3] Art Director (sectionImageBriefs 검증용)')
  const brief = loadJson<ProjectBrief>(path.join(BASE, 'project-brief.json'))

  // collectReferences로 통합 ref 로드 (카테고리 mockup 제외, 섹션 ref 사용)
  const { collectReferences } = await import('../agents/design-researcher')
  const refs = await collectReferences(brief.category, [], TEST_DIR, {
    perSectionRefs: 3,
    countPerWebSource: 0,   // 검증 단계에서 웹 스크래핑 스킵
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
  console.log(`\n  ✓ sectionImageBriefs ${briefs.length}개 생성`)
  briefs.forEach(b => {
    console.log(`    - ${b.section}: ${b.assets.length}개 에셋 (${b.assets.map(a => a.role).join('+')})`)
    console.log(`      texture: "${b.textureHint}", lighting: "${b.lightingMood}"`)
  })

  const target = briefs.find((b: SectionImageBrief) => b.section.toLowerCase() === 'brand_story')
  if (!target) {
    console.error('\n❌ brand_story sectionImageBrief 누락')
    process.exit(1)
  }

  console.log(`\n[2/3] brand_story Layer Image 생성 (${target.assets.length}장)`)
  console.log(`  designIntent: ${target.designIntent}`)
  console.log(`  assets:`)
  target.assets.forEach(a => {
    console.log(`    - ${a.role} (${a.size}, ${a.transparent ? 'transparent' : 'opaque'})`)
    console.log(`      prompt: ${a.prompt.substring(0, 120)}...`)
  })

  // 스타일링샷 (제품 ref용) — 기존 ones 재활용
  const stylingShotsDir = path.join(BASE, '2_styling_shots')
  const stylingShotPaths = fs.existsSync(stylingShotsDir)
    ? fs.readdirSync(stylingShotsDir).filter(f => /\.(jpg|png)$/i.test(f)).slice(0, 2).map(f => path.join(stylingShotsDir, f))
    : []

  // brand_story brief만 단독 실행 (다른 섹션 빼기)
  const minimalSsp = {
    productPreservationRules: ad.data.stylingPrompts.productPreservationRules,
    shots: ad.data.stylingPrompts.shots,
    sectionImageBriefs: [target],
  }

  const li = await runLayerImage(
    JSON.parse(fs.readFileSync(path.join(BASE, '1_script', 'script.json'), 'utf8')),
    ad.data.styleGuide,
    stylingShotPaths,
    stylingShotPaths.slice(0, 1),
    TEST_DIR,
    undefined,
    minimalSsp.sectionImageBriefs
  )

  if (!li.success) {
    console.error('Layer Image 실패:', li.error)
    process.exit(1)
  }

  // ── Step 3: 시각 확인 ──
  console.log(`\n[3/3] 시각 확인 — ${TEST_DIR}`)
  const generated = Object.entries(li.data ?? {})
  console.log(`  생성된 에셋:`)
  generated.forEach(([key, p]) => {
    const size = (fs.statSync(p).size / 1024).toFixed(0)
    console.log(`    ${key}: ${size}KB`)
  })

  const filesToOpen = generated.map(([, p]) => p)
  if (filesToOpen.length > 0) {
    console.log('\n파일 오픈 중...')
    execFileSync('open', filesToOpen)
  }

  console.log('\n=== 시각 평가 가이드 ===')
  console.log('체크 포인트:')
  console.log('  1. background — 텍스트/박스/제품 없는 decorative texture인가?')
  console.log('  2. background — center 60% (카드 자리)가 시각적으로 calm 한가?')
  console.log('  3. frame (있으면) — 투명 배경의 장식 프레임으로 분리되었는가?')
  console.log('  4. accent (있으면) — 작은 장식 요소가 transparent로 분리되었는가?')
  console.log('  5. 톤이 brand_story 의도("따뜻한 가족 베이커리" 등)에 맞는가?')
})()
