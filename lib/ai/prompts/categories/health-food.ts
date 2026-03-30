import { CategoryPrompt } from './types'

export const healthFoodPrompt: CategoryPrompt = {
  slug: 'health-food',
  name: '건강기능식품',
  legalRules:
    '건강기능식품법 제10조. 식약처 인정 기능성 문구만. 인증마크+GMP 최상단. "질병 예방 및 치료를 위한 의약품이 아닙니다" 면책 필수. 사전심의 필증번호.',
  forbiddenExpressions: [
    { forbidden: '치매 예방에 탁월', allowed: '기억력 개선에 도움을 줄 수 있음' },
    { forbidden: '간염 개선/당뇨 치료', allowed: '간 건강에 도움을 줄 수 있습니다' },
    { forbidden: '의학박사 추천', allowed: '의사 OOO가 R&D에 공동 참여' },
    { forbidden: '혈압을 낮춥니다', allowed: '혈압 조절에 도움을 줄 수 있음' },
    { forbidden: '살이 빠집니다/100% 효과', allowed: '체지방 감소에 도움을 줄 수 있습니다' },
    { forbidden: '명현반응', allowed: '(금지)' },
    { forbidden: '병원/약국에서만 판매', allowed: '(금지)' },
    { forbidden: '부원료 기능성 과장', allowed: '주원료만 기능성 표기' },
  ],
  requiredSections: [
    '권위 선언(인증마크)',
    '페인포인트 공감',
    '핵심 기능성(식약처 문구)',
    '과학적 증거(그래프)',
    '제형 디테일',
    '섭취방법+주의사항+면책',
    '인증서/시험성적서',
    '고객리뷰+FAQ+배송',
  ],
  tone: '극도로 이성적·논리적·차분한 전문가 톤. 감정 호소 최소화.',
  shootingGuide:
    '블루/화이트 배경, 실험실 콘셉트, 캡슐 접사+크기비교, 1일 섭취량 시각화, 패키지 전/후면, 원료 원물, GMP 시설, 인증서',
}
