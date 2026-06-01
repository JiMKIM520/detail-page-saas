/**
 * Step 4 테스트: Layer Image
 * B방식 2단계 — 히어로 배경 + 한글 타이포, 브랜드 스토리 배경
 */
import { runLayerImage } from '../agents/layer-image'
import { ensureOutputDirs, loadJson } from '../agents/utils'
import type { StyleGuide, Script } from '../agents/types'
import * as path from 'path'

const NUKKI_DIR = '/Users/jinman/Downloads/상세페이지ai개발/쌀과밀(소금빵)'

;(async () => {
  const dirs = ensureOutputDirs('test-001')
  console.log('=== [4단계] Layer Image 테스트 ===\n')

  const styleGuide = loadJson<StyleGuide>(`${dirs.base}/style-guide.json`)
  const script = loadJson<Script>(`${dirs.script}/script.json`)

  const stylingPromptsJson = loadJson<{ shots: { filename: string }[] }>(`${dirs.base}/styling-shots-prompts.json`)
  const stylingShots = stylingPromptsJson.shots.map((s) => path.join(dirs.stylingShots, s.filename))

  const nukkiPaths = [
    path.join(NUKKI_DIR, '누끼_01.png'),
    path.join(NUKKI_DIR, '누끼_02.png'),
    path.join(NUKKI_DIR, '누끼_03.png'),
  ]

  console.log('히어로 배경 + 타이포 + 스토리 배경 생성 시작...')
  console.log('예상 소요: 5-8분 (3단계 이미지 생성)\n')

  const result = await runLayerImage(script, styleGuide, stylingShots, nukkiPaths, dirs.layers)

  if (!result.success) {
    console.error('❌ 실패:', result.error)
    process.exit(1)
  }

  console.log('\n🖼️ 생성된 레이어 이미지:')
  for (const [key, filePath] of Object.entries(result.data ?? {})) {
    console.log(`  - ${key}: ${path.basename(filePath)}`)
  }

  console.log(`\n✅ 저장 완료: ${dirs.layers}`)
  console.log(`총 소요: ${((result.durationMs ?? 0) / 1000).toFixed(1)}초`)
})()
