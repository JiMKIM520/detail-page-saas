/**
 * 테스트 파이프라인 — 돈덕(순대)
 * 제품: 60년고구마잡채순대
 * 실행: npx ts-node --project tsconfig.json scripts/test-donduck.ts
 */

import { runPipeline } from '../agents/index'
import type { ProjectInput } from '../agents/index'

const BASE = '/Users/jinman/Desktop/Projects/Product-Detail-Page-Automation/docs/test/돈덕(순대)'

const input: ProjectInput = {
  productName: '60년고구마잡채순대',
  category: 'food',
  platform: 'smartstore',

  productHighlights: [
    '특허 10-211256호 고구마순대 제조방법 — 벤처 확인받은 순대 제조 기술기업',
    '해발 700m 덕가산 기슭 청정제조장 — HACCP · 6차산업인증',
    '고구마를 처음 들여온 조엄선생의 고장, 원주 고구마로 만든 순대',
    '직접 키운 고구마 + 로컬야채 + 천연암반수로 빚은 60년 전통 손맛',
    '우거지백김치·잡채와 고구마의 풍성한 조화 — 사랑방 아낙들의 웃음꽃 레시피',
    '농공상융합형 · 사회적기업 · 벤처 인증',
    '냉장 500g / 즉석조리식품 — 물 끓이면 6분, 간편 조리',
  ].join('\n'),

  targetAudience: '40-60대 전통 식품 애호가, 건강한 국산 먹거리를 선호하는 가족, 강원도 특산물 구매자, 고향사랑기부제 답례품 수령자',

  brandColors: ['#2D6A2D', '#8B4513', '#F5F0E8'],

  styleDirections: ['모던', '고급스러운'],
  toneKeywords: ['전통적인', '정통의', '청정한', '장인의', '먹음직스러운'],

  requiredPhrases: [
    '특허 10-211256호',
    'HACCP 인증',
    '60년 전통',
    '해발 700m',
    '원주 고구마',
    '청정제조장',
  ],
  certificationImagePaths: [],
  requiredImagePaths: [],

  forbiddenWords: ['최고', '완벽한', '살빠지는'],
  forbiddenStyles: ['귀여운', '발랄한', '화려한'],
  forbiddenColors: [],
  competitorRestrictions: ['병천순대', '백암순대'],

  referenceDescription: '전통 식품 프리미엄 브랜드. 초록/갈색/크림 팔레트. 장인 정신과 청정 자연을 강조하는 고급스러운 편집 레이아웃.',

  nukkiPaths: [
    `${BASE}/누끼_01.png`,
    `${BASE}/누끼_02.png`,
    `${BASE}/누끼_03.png`,
  ],
}

;(async () => {
  console.log('=== 돈덕(순대) 파이프라인 테스트 ===\n')
  console.log(`제품명: ${input.productName}`)
  console.log(`카테고리: ${input.category} | 플랫폼: ${input.platform}`)
  console.log(`누끼컷: ${input.nukkiPaths.length}장\n`)

  try {
    const result = await runPipeline(input)

    console.log('\n=== 파이프라인 결과 ===')
    console.log(`projectId: ${result.projectId}`)
    console.log(`성공 여부: ${result.success ? '✅ SUCCESS' : '⚠️ PARTIAL/FAIL'}`)
    console.log(`총 소요: ${(result.totalDurationMs / 1000).toFixed(1)}초`)
    console.log(`재작업 횟수: ${result.retryCount}회`)
    console.log(`출력 경로: ${result.outputDir}`)

    console.log('\n=== 단계별 결과 ===')
    for (const [stage, info] of Object.entries(result.stages)) {
      const icon = info.success ? '✅' : '❌'
      const duration = info.durationMs ? ` (${(info.durationMs / 1000).toFixed(1)}초)` : ''
      console.log(`  ${icon} ${stage}${duration}`)
      if (info.error) console.log(`     오류: ${info.error.substring(0, 100)}`)
    }

    console.log(`\n결과물 확인: open ${result.outputDir}`)
  } catch (err) {
    console.error('파이프라인 실행 오류:', err)
    process.exit(1)
  }
})()
