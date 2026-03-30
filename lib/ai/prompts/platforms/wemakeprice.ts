import { PlatformPrompt } from './types'

export const wemakepricePrompt: PlatformPrompt = {
  slug: 'wemakeprice',
  name: '위메프',
  imageSpecs: {
    width: 860,
    maxFileSize: '10MB',
    formats: 'JPG/PNG/GIF',
  },
  targetAudience:
    '20~40대, 딜/특가 중심. 가격 민감도 높음. 리빙/생활용품 카테고리 강세.',
  layoutRules:
    '딜/특가 강조형 레이아웃. 할인율·타임세일 배너 최상단 배치. 간결하고 직관적 구성. 가격 대비 가치 비교 표현 중심.',
  conversionTips:
    '특가 딜 기간 및 잔여 수량 강조. 타임세일 카운트다운 연동 유도. 리빙/생활용품 카테고리 번들 구성 추천. 단독 특가 표현으로 긴급성 부여.',
  commonMistakes:
    '딜 종료 후 상세페이지 미업데이트 → 신뢰도 하락. 타임세일 배너를 상세 이미지 하단에 배치 → 스크롤 전 이탈. 할인율 강조 없는 평이한 레이아웃.',
}
