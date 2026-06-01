/**
 * Step 5 테스트: Copy Writer
 * 스크립트 + 스타일 가이드 기반 카피 튜닝
 */
import { runCopyWriter } from '../agents/copy-writer'
import { ensureOutputDirs, loadJson } from '../agents/utils'
import type { StyleGuide, Script, ProjectBrief } from '../agents/types'

const brief: ProjectBrief = {
  projectId: 'test-001',
  productName: '고메코나 천연발효종 앙버터소금빵',
  category: 'food',
  platform: 'smartstore',
  targetAudience: '30-40대 가족 중심 소비자, 건강한 먹거리를 중시하는 부모',
  keyHighlights: [
    '천연발효종(르방) 사용 — 시판 이스트 없이 장시간 저온 숙성',
    '당일생산 · 당일판매 — 오늘 구운 빵만 보내드립니다',
    '국산 쌀가루 20% 배합 — 쫄깃한 식감의 비결',
    '앙버터 필링: 직접 만든 팥앙금 + 프랑스산 무염버터',
    '아빠가 딸에게 먹이는 빵, 그 마음 그대로 구웠습니다',
    '무첨가 · HACCP 인증',
  ],
  brandColors: ['#C8A96E', '#F5E6C8', '#3B2106'],
  styleDirection: '감성 편집형',
  toneKeywords: ['따뜻한', '진솔한', '수제의', '가족적인', '정성스러운'],
  requiredContent: {
    phrases: ['당일생산 · 당일판매', '오늘 구운 빵만 보내드립니다', 'HACCP 인증'],
    images: [],
    certifications: [],
  },
  restrictions: {
    styles: [],
    colors: [],
    words: ['살빠지는', '다이어트', '최고', '완벽한'],
  },
  generatedAt: new Date().toISOString(),
}

;(async () => {
  const dirs = ensureOutputDirs('test-001')
  console.log('=== [5단계] Copy Writer 테스트 ===\n')

  const styleGuide = loadJson<StyleGuide>(`${dirs.base}/style-guide.json`)
  const script = loadJson<Script>(`${dirs.script}/script.json`)

  const result = await runCopyWriter(script, styleGuide, dirs.base, brief)

  if (!result.success) {
    console.error('❌ 실패:', result.error)
    process.exit(1)
  }

  console.log('\n✍️ 정제된 카피:')
  result.data?.sections.forEach((s, i) => {
    console.log(`  ${i + 1}. [${s.sectionType}] ${s.headline}`)
    if (s.subheadline) console.log(`       ↳ ${s.subheadline}`)
  })

  console.log(`\n✅ 저장 완료: ${dirs.base}/refined-copy.json`)
  console.log(`총 소요: ${((result.durationMs ?? 0) / 1000).toFixed(1)}초`)
})()
