export type Compat = 'best' | 'good' | 'limited' | 'none'

const MATRIX: Record<string, Record<string, Compat>> = {
  food: {
    smartstore: 'best',
    coupang: 'best',
    '11st': 'good',
    gmarket: 'good',
    kakao: 'best',
    ohouse: 'limited',
    musinsa: 'none',
    wemakeprice: 'good',
    ssg: 'good',
  },
  'health-food': {
    smartstore: 'best',
    coupang: 'best',
    '11st': 'good',
    gmarket: 'good',
    kakao: 'good',
    ohouse: 'none',
    musinsa: 'none',
    wemakeprice: 'good',
    ssg: 'good',
  },
  beauty: {
    smartstore: 'good',
    coupang: 'good',
    '11st': 'good',
    gmarket: 'good',
    kakao: 'best',
    ohouse: 'none',
    musinsa: 'good',
    wemakeprice: 'good',
    ssg: 'best',
  },
  fashion: {
    smartstore: 'good',
    coupang: 'limited',
    '11st': 'good',
    gmarket: 'good',
    kakao: 'limited',
    ohouse: 'none',
    musinsa: 'best',
    wemakeprice: 'good',
    ssg: 'good',
  },
  living: {
    smartstore: 'best',
    coupang: 'best',
    '11st': 'good',
    gmarket: 'best',
    kakao: 'good',
    ohouse: 'best',
    musinsa: 'limited',
    wemakeprice: 'good',
    ssg: 'good',
  },
  electronics: {
    smartstore: 'best',
    coupang: 'best',
    '11st': 'best',
    gmarket: 'best',
    kakao: 'good',
    ohouse: 'limited',
    musinsa: 'none',
    wemakeprice: 'good',
    ssg: 'good',
  },
  pet: {
    smartstore: 'best',
    coupang: 'best',
    '11st': 'good',
    gmarket: 'good',
    kakao: 'good',
    ohouse: 'good',
    musinsa: 'none',
    wemakeprice: 'good',
    ssg: 'good',
  },
}

export function getCompatibility(
  categorySlug: string,
  platformSlug: string
): Compat {
  return MATRIX[categorySlug]?.[platformSlug] ?? 'none'
}

export function getCompatibilityLabel(compat: Compat): {
  emoji: string
  label: string
  description: string
} {
  switch (compat) {
    case 'best':
      return { emoji: '◎', label: '최적', description: '이 조합에서 최고의 성과를 낼 수 있습니다.' }
    case 'good':
      return { emoji: '○', label: '적합', description: '일반적으로 좋은 성과를 기대할 수 있습니다.' }
    case 'limited':
      return { emoji: '△', label: '제한적', description: '일부 제약이 있어 전략적 접근이 필요합니다.' }
    case 'none':
      return { emoji: '×', label: '부적합', description: '이 플랫폼에서는 해당 카테고리 판매가 어렵습니다.' }
  }
}

export function isBlocked(categorySlug: string, platformSlug: string): boolean {
  return getCompatibility(categorySlug, platformSlug) === 'none'
}

export function isWarning(categorySlug: string, platformSlug: string): boolean {
  return getCompatibility(categorySlug, platformSlug) === 'limited'
}

const CROSS_STRATEGY_TIPS: Record<string, Record<string, string>> = {
  'health-food': {
    coupang:
      '모바일 스크롤에서 면책 문구가 묻히지 않도록 상단 인포그래픽에 배치하세요. 효능 관련 법적 면책 문구를 눈에 띄는 위치에 고정합니다.',
    ssg: '브랜드 신뢰도가 핵심입니다. 임상 데이터, GMP 인증, 제조 과정을 깊이 있게 다루어 프리미엄 포지셔닝을 강화하세요.',
  },
  food: {
    kakao:
      '선물 가치가 압도적으로 중요합니다. 패키지 디자인, 보냉 포장, 메시지카드 옵션을 최상단에 배치하세요.',
  },
  pet: {
    smartstore:
      'KC 인증 마크를 최상단에 고지하세요. 도매 이미지를 검증 없이 사용하지 말고, 실제 제품 촬영본을 사용하세요.',
  },
  living: {
    ohouse:
      '누끼컷과 스펙 나열을 지양하세요. 룸셋 스타일링과 비포/애프터 연출을 매거진 형식으로 구성하는 것이 핵심입니다.',
  },
  fashion: {
    musinsa:
      '실측 사이즈 가이드가 핵심입니다. 코디 탭 스타일링을 필수로 포함하고, 다양한 체형 모델의 착용 사진에 키와 체중을 반드시 명시하세요.',
  },
  beauty: {
    kakao:
      '선물하기 특성상 패키징 비주얼이 중요합니다. 기능성보다 감성 브랜딩과 언박싱 경험을 앞세우세요.',
  },
}

export function getCrossStrategyTip(
  categorySlug: string,
  platformSlug: string
): string | null {
  return CROSS_STRATEGY_TIPS[categorySlug]?.[platformSlug] ?? null
}
