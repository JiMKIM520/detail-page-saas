/**
 * Step 3 테스트: Styling Shots
 * styling-shots-prompts.json 기반 Gemini Pro 4K 이미지 4장 생성
 */
import { runStylingShots } from '../agents/styling-shots'
import { ensureOutputDirs, loadJson } from '../agents/utils'
import type { StylingPromptsJson } from '../agents/types'
import * as path from 'path'

const NUKKI_DIR = '/Users/jinman/Downloads/상세페이지ai개발/쌀과밀(소금빵)'

;(async () => {
  const dirs = ensureOutputDirs('test-001')
  console.log('=== [3단계] Styling Shots 테스트 ===\n')

  // Art Director가 생성한 프롬프트 로드
  const stylingPrompts = loadJson<StylingPromptsJson>(`${dirs.base}/styling-shots-prompts.json`)

  console.log(`스타일링샷 ${stylingPrompts.shots.length}장 생성 시작...`)
  console.log('예상 소요: 3-5분 (이미지당 3초 대기 포함)\n')

  const nukkiPaths = [
    path.join(NUKKI_DIR, '누끼_01.png'),
    path.join(NUKKI_DIR, '누끼_02.png'),
    path.join(NUKKI_DIR, '누끼_03.png'),
  ]

  const result = await runStylingShots(stylingPrompts, nukkiPaths, dirs.stylingShots)

  if (!result.success) {
    console.error('❌ 실패:', result.error)
    process.exit(1)
  }

  console.log('\n📷 생성된 스타일링샷:')
  result.data?.forEach((p, i) => {
    const filename = path.basename(p)
    console.log(`  ${i + 1}. ${filename}`)
  })

  console.log(`\n✅ 저장 완료: ${dirs.stylingShots}`)
  console.log(`총 소요: ${((result.durationMs ?? 0) / 1000).toFixed(1)}초`)
})()
