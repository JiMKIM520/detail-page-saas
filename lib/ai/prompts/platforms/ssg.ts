import { PlatformPrompt } from './types'

export const ssgPrompt: PlatformPrompt = {
  slug: 'ssg',
  name: 'SSG',
  imageSpecs: {
    width: 1000,
    maxFileSize: '10MB',
    formats: 'JPG/PNG',
  },
  targetAudience:
    '30~50대, 프리미엄 쇼핑 성향. 신세계/이마트 브랜드 신뢰 기반. 품질 중시, 가격보다 가치 소비.',
  layoutRules:
    '프리미엄 톤 유지. 고급 이미지 중심. 브랜드 스토리 깊이 있게 전달. 여백을 활용한 고급 레이아웃. 불필요한 정보 배제, 핵심 가치 집중.',
  conversionTips:
    '신세계포인트 적립 혜택 강조. SSG.PAY 간편결제 연동. 이마트몰 동시 진출 시 채널 일관성 유지. 브랜드 인지도 기반 신뢰 신호 강화.',
  commonMistakes:
    '일반 오픈마켓 느낌으로 제작 → 프리미엄 이미지 훼손. 프리미엄 톤 미적용(형광색, 과다 강조). 여백 없이 빽빽한 구성으로 고급감 상실.',
}
