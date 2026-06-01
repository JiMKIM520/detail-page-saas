/**
 * Step 7 테스트: Validator
 * 디자인 통일성 검증
 */
import { runValidator } from '../agents/validator'
import { ensureOutputDirs, loadJson } from '../agents/utils'
import type { StyleGuide, RefinedCopy, ProjectBrief } from '../agents/types'
import * as path from 'path'
import * as fs from 'fs'

;(async () => {
  const dirs = ensureOutputDirs('test-001')
  console.log('=== [7단계] Validator 테스트 ===\n')

  const styleGuide = loadJson<StyleGuide>(`${dirs.base}/style-guide.json`)
  const refinedCopy = loadJson<RefinedCopy>(`${dirs.base}/refined-copy.json`)

  // brief: project-brief.json이 있으면 로드, 없으면 테스트용 인라인 정의
  const briefPath = `${dirs.base}/project-brief.json`
  const brief: ProjectBrief = fs.existsSync(briefPath)
    ? loadJson<ProjectBrief>(briefPath)
    : {
        projectId: 'test-001',
        productName: '고메코나 천연발효종 앙버터소금빵',
        category: 'food',
        platform: 'smartstore',
        targetAudience: '30-40대 가족 중심 소비자',
        keyHighlights: ['천연발효종(르방) 사용', '당일생산·당일판매', 'HACCP 인증'],
        brandColors: ['#C8A96E', '#F5E6C8', '#3B2106'],
        styleDirection: '감성 편집형',
        toneKeywords: ['따뜻한', '진솔한', '수제의', '가족적인'],
        requiredContent: { phrases: ['당일생산·당일판매', 'HACCP 인증'], images: [], certifications: [] },
        restrictions: { styles: [], colors: [], words: ['살빠지는', '다이어트', '최고', '완벽한'] },
        generatedAt: new Date().toISOString(),
      }

  // 스타일링샷 파일명 동적 로드
  const stylingPromptsJson = loadJson<{ shots: { filename: string }[] }>(`${dirs.base}/styling-shots-prompts.json`)
  const generatedFiles = [
    ...stylingPromptsJson.shots.map(s => path.join(dirs.stylingShots, s.filename)),
    path.join(dirs.layers, 'hero_background.png'),
    path.join(dirs.layers, 'hero_with_typo.png'),
    path.join(dirs.layers, 'story_background.png'),
    path.join(dirs.layers, 'break_image.png'),
    path.join(dirs.final, 'index.html'),
  ]

  const result = await runValidator(styleGuide, refinedCopy, generatedFiles, dirs.base, brief)

  if (!result.success) {
    console.error('❌ 실패:', result.error)
    process.exit(1)
  }

  const report = result.data!
  console.log(`\n결과: ${report.passed ? '✅ PASS' : '❌ FAIL'}`)

  console.log('\n📊 통일성 점수:')
  console.log(`  아이콘 일관성: ${report.scores.iconConsistency}/5`)
  console.log(`  색상 일관성: ${report.scores.colorConsistency}/5`)
  console.log(`  타이포 일관성: ${report.scores.typographyConsistency}/5`)
  console.log(`  섹션 리듬: ${report.scores.rhythmConsistency}/5`)
  console.log(`  이모지 없음: ${report.scores.noEmoji ? '✅' : '❌'}`)
  console.log(`  톤 일치: ${report.scores.toneMatch}/5`)

  if (report.issues.length > 0) {
    console.log('\n⚠️ 이슈:')
    report.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.severity}] ${issue.rule}: ${issue.description}`)
    })
  }

  console.log(`\n✅ 저장 완료: ${dirs.base}/validation-report.json`)
  console.log(`총 소요: ${((result.durationMs ?? 0) / 1000).toFixed(1)}초`)
})()
