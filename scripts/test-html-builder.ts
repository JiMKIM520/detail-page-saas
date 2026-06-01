/**
 * Step 8 테스트: HTML Builder + Icon Mapper
 * 전체 산출물 → 860px HTML 상세페이지
 */
import { runIconMapper } from '../agents/icon-mapper'
import { runHtmlBuilder } from '../agents/html-builder'
import { ensureOutputDirs, loadJson } from '../agents/utils'
import type { StyleGuide, RefinedCopy, Script } from '../agents/types'
import * as path from 'path'
import * as fs from 'fs'

;(async () => {
  const dirs = ensureOutputDirs('test-001')
  console.log('=== [8단계] HTML Builder + Icon Mapper 테스트 ===\n')

  const styleGuide = loadJson<StyleGuide>(`${dirs.base}/style-guide.json`)
  const refinedCopy = loadJson<RefinedCopy>(`${dirs.base}/refined-copy.json`)
  const script = loadJson<Script>(`${dirs.script}/script.json`)

  // 아이콘 매핑
  console.log('아이콘 매핑 중...')
  const iconResult = runIconMapper(script, styleGuide, dirs.icons)
  if (!iconResult.success) {
    console.error('❌ Icon Mapper 실패:', iconResult.error)
    process.exit(1)
  }
  const iconMapping = iconResult.data!
  console.log('  섹션별 아이콘 매핑 완료\n')

  // 이미지 경로 매핑
  const imagePaths: Record<string, string> = {
    heroWithTypo:    path.join(dirs.layers, 'hero_with_typo.png'),
    heroBackground:  path.join(dirs.layers, 'hero_background.png'),
    storyBackground: path.join(dirs.layers, 'story_background.png'),
    breakImage:      path.join(dirs.layers, 'break_image.png'),
  }
  // 스타일링샷: styling-shots-prompts.json 기반 동적 로드
  const stylingPromptsJson = loadJson<{ shots: { filename: string }[] }>(`${dirs.base}/styling-shots-prompts.json`)
  stylingPromptsJson.shots.forEach((shot, i) => {
    const shotPath = path.join(dirs.stylingShots, shot.filename)
    if (fs.existsSync(shotPath)) {
      imagePaths[`shot${i}`] = shotPath
    }
  })
  console.log(`  스타일링샷: ${Object.keys(imagePaths).filter(k => k.startsWith('shot')).length}장 로드`)

  // HTML 생성
  console.log('HTML 생성 중...')
  const htmlResult = await runHtmlBuilder(
    styleGuide,
    refinedCopy,
    script,
    iconMapping,
    dirs.final,
    imagePaths
  )

  if (!htmlResult.success) {
    console.error('❌ HTML Builder 실패:', htmlResult.error)
    process.exit(1)
  }

  console.log(`\n✅ HTML 생성 완료: ${htmlResult.data!.htmlPath}`)
  console.log(`총 소요: ${((htmlResult.durationMs ?? 0) / 1000).toFixed(1)}초`)

  // 아이콘 매핑 요약
  console.log('\n📦 아이콘 매핑:')
  for (const [section, icons] of Object.entries(iconMapping.sections)) {
    console.log(`  ${section}: ${icons.join(', ')}`)
  }
})()
