import { PlatformPrompt } from './types'

export const kakaoPrompt: PlatformPrompt = {
  slug: 'kakao',
  name: '카카오쇼핑',
  imageSpecs: {
    width: 750,
    maxFileSize: '10MB',
    thumbnailSize: '750x750(1:1) 또는 750x1000(3:4)',
    formats: 'PNG/JPG',
  },
  targetAudience:
    '20~40대, 여성 비율 높음. 카카오톡 선물하기 중심. 감성적 소비, 선물 목적 구매 비율 높음.',
  layoutRules:
    '감성적이고 선물 친화적 레이아웃. 대표이미지에 텍스트 삽입 불가(가이드 위반). 로고는 우측 상단에만 허용. 패키징/언박싱 경험 시각화. 비율 준수(1:1 또는 3:4) 필수.',
  conversionTips:
    '카카오톡 선물하기 특성 극대화. 톡채널 친구 혜택 연동 문구. 메시지카드/포장 선택지 노출. 시즌/기념일(생일, 어버이날, 크리스마스) 연계 카피.',
  commonMistakes:
    '대표이미지에 과도한 텍스트 삽입(정책 위반, 게시 거부). 비율 미준수로 잘림 발생. 선물 맥락 미반영 → 일반 구매 대비 전환율 저하.',
}
