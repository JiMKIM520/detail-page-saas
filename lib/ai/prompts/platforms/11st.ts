import { PlatformPrompt } from './types'

export const elevenStPrompt: PlatformPrompt = {
  slug: '11st',
  name: '11번가',
  imageSpecs: {
    width: 831,
    maxFileSize: '1MB/장',
    thumbnailSize: '1000x1000px',
    formats: 'JPG/PNG',
  },
  targetAudience:
    '30~50대 주력. 할인/프로모션에 민감. SK 멤버십(T멤버십) 연계 구매 유인.',
  layoutRules:
    '혜택/할인 쿠폰 강조형 레이아웃. 할인가·혜택을 최상단에 명확히 표기. 파격 할인율 시각적 강조. 구성품/용량 대비 가격 가치 부각.',
  conversionTips:
    '월간 십일절 타이밍 연계 문구. T멤버십 할인 혜택 명시. 타겟 쿠폰 적용 후 최종가 강조. 번들/묶음 상품 구성 추천.',
  commonMistakes:
    '1MB 용량 제한 — 고화질 유지하며 압축 필수(TinyPNG 등). 멀티마켓 공용 이미지 사용 시 잘림 발생. 할인 혜택 미표기로 전환율 손실.',
}
