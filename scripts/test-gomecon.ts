/**
 * 테스트 파이프라인 — 쌀과밀(소금빵) / 고메코나 베이커리
 * 제품: 천연발효종 강릉 고메코나 소금빵
 * 실행: npx ts-node --project tsconfig.json scripts/test-gomecon.ts
 */

import { runPipeline } from '../agents/index'
import type { ProjectInput } from '../agents/index'

const BASE = '/Users/jinman/Desktop/Projects/Product-Detail-Page-Automation/docs/test/쌀과밀(소금빵)'

const input: ProjectInput = {
  productName: '천연발효종 강릉 고메코나 소금빵',
  category: 'food',
  platform: 'smartstore',

  productHighlights: [
    '강릉 소금빵 맛집 1위 선정 — SNS 인증',
    '앵커 무염버터(뉴질랜드 청정산 100% 동물성버터) 사용, 마가린·트랜스지방 NO',
    '계란NO · 우유NO · 화학첨가물NO — 알레르기·아토피 아이도 안심',
    '24시간 저온숙성 천연발효종 — 이스트 대신 자체 배양 효모 사용',
    '당일생산 당일판매 한정수량 — 오늘 구운 빵만 보냅니다',
    '타 제품 대비 2배 큰 사이즈 (짐승용량) — 버터동굴 발생',
    '크로와상처럼 밀대로 최대한 길게 밀어 성형 — 페이스츄리 결이 살아있음',
    '아빠의 마음 — 우리 딸 먹일 빵집, 소화 잘 되는 정직한 빵',
    '강원도 사회적 기업 — 지역 취약계층 빵 나눔 정기 진행',
  ].join('\n'),

  targetAudience: '30-40대 부모, 아이에게 안심하고 먹일 빵을 찾는 가족, 건강한 베이커리에 관심 있는 소비자, 강릉 맛집 팬',

  brandColors: ['#F5A623', '#F8D347', '#1A1A1A'],

  styleDirections: ['감성 편집형', '자연친환경', '모던'],
  toneKeywords: ['따뜻한', '정직한', '먹음직스러운', '수제의', '아빠마음'],

  requiredPhrases: [
    '당일생산 당일판매',
    '천연발효종',
    '강릉 소금빵 맛집 1위',
    '화학첨가물 NO',
    '앵커 무염버터',
    '아빠의 마음',
  ],
  certificationImagePaths: [],
  requiredImagePaths: [],

  forbiddenWords: ['살빠지는', '다이어트', '완벽한', '최고'],
  forbiddenStyles: ['어두운', '차가운'],
  forbiddenColors: [],
  competitorRestrictions: ['타르테마베이커리'],

  referenceDescription: '따뜻하고 감성적인 강릉 베이커리 브랜드. 편집샵 매거진 느낌. 노랑/주황/크림 컬러. 아날로그 필름 감성.',

  nukkiPaths: [
    `${BASE}/누끼_01.png`,
    `${BASE}/누끼_02.png`,
    `${BASE}/누끼_03.png`,
    `${BASE}/누끼_04.png`,
  ],
}

;(async () => {
  console.log('=== 쌀과밀(소금빵) 파이프라인 테스트 ===\n')
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
