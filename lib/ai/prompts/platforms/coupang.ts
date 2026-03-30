import { PlatformPrompt } from './types'

export const coupangPrompt: PlatformPrompt = {
  slug: 'coupang',
  name: '쿠팡',
  imageSpecs: {
    width: 780,
    maxHeight: 30000,
    maxFileSize: '3MB/장, 최대 20장',
    thumbnailSize: '1000x1000px',
    formats: 'JPG/PNG (GIF 불가)',
  },
  targetAudience:
    '전 연령대, 빠른 배송 선호. 목적형 구매 비율 높음. 모바일 80%+ 사용.',
  layoutRules:
    '브랜드 로고 → 핵심 베네핏 대표이미지 → 3가지 이내 특장점 → 상세/사용법 순서. 간결하고 직관적. 모바일 기준 폰트 18-24pt 이상. 이미지당 3000px 초과 시 반드시 분할.',
  conversionTips:
    '로켓배송/로켓그로스 뱃지 이미지 활용. 아이템위너 획득을 위한 가격 경쟁력 강조. "다른 상품과 뭐가 다른지" 비교 구성 필수. 배송일 강조.',
  commonMistakes:
    '3000px 초과 미분할로 업로드 오류. GIF 형식 사용 불가. PC 기준으로 제작 → 모바일 가독성 저하.',
}
