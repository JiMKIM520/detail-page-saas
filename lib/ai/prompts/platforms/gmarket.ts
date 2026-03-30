import { PlatformPrompt } from './types'

export const gmarketPrompt: PlatformPrompt = {
  slug: 'gmarket',
  name: 'G마켓/옥션',
  imageSpecs: {
    width: 860,
    maxHeight: 40000,
    maxFileSize: '10MB',
    formats: 'JPG/PNG/GIF',
  },
  targetAudience:
    '30~50대(50대 비율 38%). 가격 비교 성향 강함. PC 구매 비중 타 플랫폼 대비 높음.',
  layoutRules:
    '상단 프로모션 배너 배치. 연령대 고려한 시인성 높은 대형 텍스트. 가격 우위 비교표 포함. 묶음/수량 할인 구성 강조. HTML 기반 상세페이지 지원.',
  conversionTips:
    'ESM PLUS 회원 혜택 연동. 슈퍼딜/빅스마일데이 시즌 프로모션 타이밍 활용. 스마일배송 상품 뱃지 강조. 옥션 동시 노출 가능성 고려한 중립적 브랜드 표현.',
  commonMistakes:
    'PC HTML 방식 제작 후 모바일 미확인 → 레이아웃 붕괴. 연령대(50대) 가독성 미확보(폰트 너무 작음). GIF 허용이나 과도한 사용 시 느린 로딩.',
}
