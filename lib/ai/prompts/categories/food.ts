import { CategoryPrompt } from './types'

export const foodPrompt: CategoryPrompt = {
  slug: 'food',
  name: '식품/농축수산물',
  legalRules:
    '식품표시광고법 제8조. 원재료명·영양성분·알레르기 22종·소비기한·원산지 필수. 생산자 실명·사진, 배송 포장 상태 촬영.',
  forbiddenExpressions: [
    { forbidden: '당뇨 치료에 탁월', allowed: '비타민C가 풍부한 과일' },
    { forbidden: '혈관 속 피를 맑게', allowed: '아삭한 식감과 높은 당도' },
    { forbidden: 'A사 제품과 달리 화학첨가물 0%', allowed: '신선한 원료로 제조' },
    { forbidden: '암 예방/혈압 낮춤', allowed: '원물의 영양적 특성 객관적 서술' },
    { forbidden: '100% 유기농 (인증 없이)', allowed: '인증 획득 시 인증마크와 함께 표기' },
    { forbidden: '최고/가장 (근거 없이)', allowed: '구체적 수치로 대체' },
  ],
  requiredSections: [
    '시즐 후킹',
    '산지 스토리',
    '핵심 USP 3가지',
    '활용 제안',
    '법적 정보(영양성분표)',
    '인증 마크',
    '배송/언박싱',
    '고객 리뷰+교환/반품',
  ],
  tone: '따뜻한 전문성. 감성적 스토리텔링 + 객관적 수치 교차.',
  shootingGuide:
    '매크로컷(신선도), 시즐컷(조리후), 따뜻한 색온도, 패키지 전/후면, 사이즈 비교, 단면컷, 산지/생산자, 배송포장',
}
