/**
 * 512266a3 프로젝트 HTML 재빌드 + PNG 캡처
 * v4 레이어 이미지가 3_layers/에 반영된 상태에서 실행
 */
import { runIconMapper } from '../agents/icon-mapper'
import { runHtmlBuilder } from '../agents/html-builder'
import { runExporter } from '../agents/exporter'
import { loadJson } from '../agents/utils'
import type { StyleGuide, RefinedCopy, Script } from '../agents/types'
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
}

;(async () => {
  console.log('=== 512266a3 HTML 재빌드 + PNG 캡처 (v4 레이어 이미지) ===\n')

  const styleGuide = loadJson<StyleGuide>(`${dirs.base}/style-guide.json`)
  const refinedCopy = loadJson<RefinedCopy>(`${dirs.base}/refined-copy.json`)
  const script = loadJson<Script>(`${dirs.script}/script.json`)

  console.log('아이콘 매핑 중...')
  const iconResult = runIconMapper(script, styleGuide, dirs.icons)
  if (!iconResult.success) {
    console.error('Icon Mapper 실패:', iconResult.error)
    process.exit(1)
  }
  const iconMapping = iconResult.data!

  const imagePaths: Record<string, string> = {
    heroWithTypo:    path.join(dirs.layers, 'hero_with_typo.png'),
    heroBackground:  path.join(dirs.layers, 'hero_background.png'),
    storyBackground: path.join(dirs.layers, 'story_background.png'),
    breakImage:      path.join(dirs.layers, 'break_image.png'),
  }

  for (const f of fs.readdirSync(dirs.layers)) {
    const m = f.match(/^(.+)_concept\.png$/i)
    if (m) {
      imagePaths[`concept_${m[1]}`] = path.join(dirs.layers, f)
    }
  }

  const stylingPromptsJson = loadJson<{ shots: { filename: string }[] }>(`${dirs.base}/styling-shots-prompts.json`)
  stylingPromptsJson.shots.forEach((shot, i) => {
    const shotPath = path.join(dirs.stylingShots, shot.filename)
    if (fs.existsSync(shotPath)) {
      imagePaths[`shot${i}`] = shotPath
    }
  })
  console.log(`  스타일링샷: ${Object.keys(imagePaths).filter(k => k.startsWith('shot')).length}장`)
  console.log(`  레이어: ${Object.keys(imagePaths).filter(k => !k.startsWith('shot')).length}장`)

  console.log('\nHTML 생성 중...')
  const htmlResult = await runHtmlBuilder(
    styleGuide,
    refinedCopy,
    script,
    iconMapping,
    dirs.final,
    imagePaths
  )

  if (!htmlResult.success) {
    console.error('HTML Builder 실패:', htmlResult.error)
    process.exit(1)
  }

  console.log(`  HTML: ${htmlResult.data!.htmlPath}`)

  console.log('\nExporter 실행 중...')
  const exportResult = await runExporter(htmlResult.data!.htmlPath, dirs.base)
  console.log(`  성공: ${exportResult.success}`)
  console.log(`  Mobile: ${exportResult.mobileSectionCount}장 캡처`)
  console.log(`  PC:     ${exportResult.pcSectionCount}장 캡처`)

  const mobilePng = path.join(dirs.base, '5_export', 'mobile', 'detail_page.png')
  if (fs.existsSync(mobilePng)) {
    console.log(`\n완성본 오픈: ${mobilePng}`)
    execFileSync('open', [mobilePng])
  }
})()
