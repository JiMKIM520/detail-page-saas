/**
 * 전체 파이프라인 테스트 — 고메코나 소금빵
 * 실행: npx ts-node --project tsconfig.json scripts/test-pipeline.ts
 */

import { runPipeline } from '../agents/index'
import type { ProjectInput } from '../agents/index'

const NUKKI_DIR = '/Users/jinman/Downloads/상세페이지ai개발/쌀과밀(소금빵)'

const input: ProjectInput = {
  // 기본 정보
  productName: '고메코나 천연발효종 앙버터소금빵',
  category: 'food',
  platform: 'smartstore',
  productHighlights: [
    '천연발효종(르방) 사용 — 시판 이스트 없이 장시간 저온 숙성',
    '당일생산 · 당일판매 — 오늘 구운 빵만 보내드립니다',
    '국산 쌀가루 20% 배합 — 쫄깃한 식감의 비결',
    '앙버터 필링: 직접 만든 팥앙금 + 프랑스산 무염버터',
    '아빠가 딸에게 먹이는 빵, 그 마음 그대로 구웠습니다',
    '무첨가 · HACCP 인증',
  ].join('\n'),
  targetAudience: '30-40대 가족 중심 소비자, 건강한 먹거리를 중시하는 부모, 선물용 구매 고객',

  // 브랜드 아이덴티티
  brandColors: ['#C8A96E', '#F5E6C8', '#3B2106'],

  // 디자인 선호도
  styleDirections: ['감성 편집형'],
  toneKeywords: ['따뜻한', '진솔한', '수제의', '가족적인', '정성스러운'],

  // 포함 희망 사항
  requiredPhrases: [
    '당일생산 · 당일판매',
    '오늘 구운 빵만 보내드립니다',
    'HACCP 인증',
    '무첨가',
  ],
  certificationImagePaths: [],
  requiredImagePaths: [],

  // 금지사항
  forbiddenWords: ['살빠지는', '다이어트', '최고', '완벽한'],
  forbiddenStyles: [],
  forbiddenColors: [],
  competitorRestrictions: [],

  // 레퍼런스
  referenceDescription: '따뜻하고 감성적인 베이커리 브랜드. bread&co, 유하베이커리 스타일. 편집샵 매거진 느낌.',

  // 자료 (관리자 촬영 누끼컷)
  nukkiPaths: [
    `${NUKKI_DIR}/누끼_01.png`,
    `${NUKKI_DIR}/누끼_02.png`,
    `${NUKKI_DIR}/누끼_03.png`,
  ],
  // 연출컷은 사용하지 않음 — 스타일링샷 에이전트가 Gemini로 새로 생성
}

;(async () => {
  console.log('DetailAI 파이프라인 테스트 시작\n')
  console.log('입력 데이터:')
  console.log(`  제품명: ${input.productName}`)
  console.log(`  카테고리: ${input.category} | 플랫폼: ${input.platform}`)
  console.log(`  누끼컷: ${input.nukkiPaths.length}장`)
  console.log()

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
