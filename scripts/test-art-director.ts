/**
 * Step 2 테스트: Art Director
 * style-guide.json + styling-shots-prompts.json 생성
 */
import { runArtDirector } from '../agents/art-director'
import { ensureOutputDirs, loadJson } from '../agents/utils'
import type { ProjectBrief } from '../agents/types'
import * as fs from 'fs'

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
  console.log('=== [2단계] Art Director 테스트 ===\n')

  // 레퍼런스 이미지 없이 테스트 (기업 레퍼런스 미업로드 케이스)
  const result = await runArtDirector(brief, [], dirs.base)

  if (!result.success) {
    console.error('❌ 실패:', result.error)
    process.exit(1)
  }

  const { styleGuide, stylingPrompts } = result.data!

  console.log('\n🎨 Style Guide:')
  console.log('  브랜드 무드:', styleGuide.brand.moodKeywords.join(', '))
  console.log('  타겟 감정:', styleGuide.brand.targetEmotion)
  console.log('  Primary:', styleGuide.colors.primary)
  console.log('  아이콘 라이브러리:', styleGuide.icons.library)
  console.log('  섹션 리듬:', styleGuide.sectionRhythm)
  console.log('\n  레이아웃 패턴:')
  styleGuide.layoutPatterns.forEach((p, i) => {
    console.log(`    ${i+1}. [${p.section}] → ${p.pattern}`)
  })

  console.log('\n📷 스타일링샷 프롬프트:')
  stylingPrompts.shots.forEach((s, i) => {
    console.log(`  ${i+1}. ${s.name}: ${s.composition}`)
  })

  console.log(`\n✅ 저장 완료:`)
  console.log(`  ${dirs.base}/style-guide.json`)
  console.log(`  ${dirs.base}/styling-shots-prompts.json`)
})()
