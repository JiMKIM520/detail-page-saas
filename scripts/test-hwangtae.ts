/**
 * 테스트 파이프라인 — 황태이야기
 * 제품: 청국콩을 먹은 황태과립
 * 실행: npx ts-node --project tsconfig.json scripts/test-hwangtae.ts
 */

import { runPipeline } from '../agents/index'
import type { ProjectInput } from '../agents/index'

const BASE = '/Users/jinman/Desktop/Projects/Product-Detail-Page-Automation/docs/test/황태이야기'

const input: ProjectInput = {
  productName: '청국콩을 먹은 황태과립',
  category: 'food',
  platform: 'smartstore',

  productHighlights: [
    '120일 청정 대관령 800고지 덕장에서 바람과 햇살로 자연건조한 명품 황태',
    '자연건조 황태 — 전체성분의 60%가 단백질인 최고의 고단백 식품',
    '청정 평창 무농약 GMO프리 유기농 대두 청국콩 — 대표적 고단백 발효식품',
    '국내 최초 황태과립 제품 — 황태와 청국콩을 최상의 비율로 MIX',
    '간편스틱 소포장 (5g × 20포) — 언제 어디서나 휴대·섭취 가능',
    '간을 보호하는 메타오닌 등 아미노산 풍부 — 숙취 해소에 탁월',
    '임산부·성장기 아동·노약자·다이어트 관심자 모두에게 적합',
    '120일 프로젝트 — 고객이 이름표 달고 황태 건조 과정을 직접 체험',
    '콜레스테롤 거의 없음, 지방 적고 담백한 맛',
  ].join('\n'),

  targetAudience: '건강을 중시하는 30-60대, 다이어트 관심 여성, 임산부·어린이·노약자를 위한 건강식을 찾는 가족, 숙취 해소가 필요한 직장인',

  brandColors: ['#8B7355', '#D4A853', '#F5F0E0'],

  styleDirections: ['자연친환경', '프리미엄', '내츄럴'],
  toneKeywords: ['건강한', '자연의', '깨끗한', '믿을수있는', '정직한'],

  requiredPhrases: [
    '120일 자연건조',
    '대관령 800고지',
    'GMO프리',
    '국내 최초 황태과립',
    '5g × 20포',
    '숙취 해소',
  ],
  certificationImagePaths: [],
  requiredImagePaths: [],

  forbiddenWords: ['최고', '완벽한', '살빠지는'],
  forbiddenStyles: ['어두운', '화려한', '귀여운'],
  forbiddenColors: [],
  competitorRestrictions: [],

  referenceDescription: '건강기능식품 프리미엄 브랜드. 황토/베이지/골드 팔레트. 자연 건조 과정의 아날로그 감성과 건강 효능을 조화롭게 담은 편집 레이아웃.',

  nukkiPaths: [
    `${BASE}/누끼1.jpg`,
    `${BASE}/누끼2.png`,
    `${BASE}/누끼3.png`,
  ],
}

;(async () => {
  console.log('=== 황태이야기 파이프라인 테스트 ===\n')
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
