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
  food: {
    smartstore:
      '리뷰 수와 별점을 최상단에 배치하고 네이버페이 혜택을 명시하세요. 가성비 표현과 무료배송 조건을 히어로 영역에 넣어 구매 결정 속도를 높이세요.',
    coupang:
      '첫 3장 이미지에서 신선도와 핵심 가치를 전달하세요. 로켓배송 식품은 당일 배송 가능 시간대와 보냉 포장 방식을 명확히 표기하면 전환율이 높아집니다.',
    '11st':
      '할인율 숫자를 크게 노출하고 타임딜 긴급성을 활용하세요. 원산지와 생산 이력 정보를 상단에 배치해 식품 신뢰도를 높이세요.',
    gmarket:
      '묶음 할인과 세트 구성을 적극 제안하세요. 스마일페이 적립 혜택과 함께 대용량/소포장 옵션을 나란히 제시하면 구매 단가를 높일 수 있습니다.',
    kakao:
      '선물 가치가 압도적으로 중요합니다. 패키지 디자인, 보냉 포장, 메시지카드 옵션을 최상단에 배치하세요.',
    wemakeprice:
      '최대 할인율을 첫 화면에 크게 표시하고 타임딜 마감 시간을 강조하세요. 정품 인증과 생산 이력으로 초저가 품질 우려를 해소하세요.',
    ssg:
      '프리미엄 산지 스토리와 고급 패키징을 전면에 내세우세요. SSG페이 혜택과 함께 백화점 식품관 품질 기준을 언급해 프리미엄 포지셔닝을 강화하세요.',
  },
  'health-food': {
    smartstore:
      '성분 출처, 함량, GMP 인증을 상단에 배치하고 건강 정보 콘텐츠로 신뢰를 쌓으세요. 네이버 지식인/블로그 연계 마케팅을 고려해 검색 노출을 최적화하세요.',
    coupang:
      '모바일 스크롤에서 면책 문구가 묻히지 않도록 상단 인포그래픽에 배치하세요. 효능 관련 법적 면책 문구를 눈에 띄는 위치에 고정합니다.',
    '11st':
      '중장년 건강 관심 소비자 타겟으로 복용법과 효과를 도표로 정리하세요. 임상 데이터나 식약처 인정 기능성을 명확히 표기해 신뢰도를 확보하세요.',
    gmarket:
      '패밀리 건강 앵글로 접근하세요. 가족 구성원별 섭취 가이드와 함께구매 구성(부모님+자녀용)을 제안하면 객단가를 높일 수 있습니다.',
    ssg: '브랜드 신뢰도가 핵심입니다. 임상 데이터, GMP 인증, 제조 과정을 깊이 있게 다루어 프리미엄 포지셔닝을 강화하세요.',
  },
  beauty: {
    smartstore:
      '실제 사용자 Before/After 리뷰 사진을 적극 활용하세요. 스킨케어 루틴 스토리텔링으로 제품을 일상 속에 자연스럽게 녹여 반복 구매를 유도하세요.',
    coupang:
      '첫 화면 3초에서 핵심 성분과 차별점을 전달하세요. 경쟁 제품 대비 강점을 간결하게 표현하고, 로켓그로스 배지를 활용해 빠른 배송 신뢰를 확보하세요.',
    '11st':
      '30-50대 여성 피부 고민(건조함, 탄력, 미백) 중심으로 접근하세요. 성분 안전성과 피부과 테스트 완료 여부를 강조해 신뢰도를 높이세요.',
    kakao:
      '선물하기 특성상 패키징 비주얼이 중요합니다. 기능성보다 감성 브랜딩과 언박싱 경험을 앞세우세요.',
    musinsa:
      '10-20대 뷰티 트렌드 소비자를 타겟으로 미니멀 클린뷰티 감성을 강조하세요. 성분 리스트를 간결하게 표현하고 SNS 인증샷을 유도하는 비주얼을 구성하세요.',
    wemakeprice:
      '대용량/리필 구성으로 가성비를 강조하세요. 정품 인증과 성분 안전성을 명확히 표기해 저가 이미지에서 오는 품질 우려를 해소하세요.',
    ssg:
      '백화점 뷰티 신뢰도를 적극 활용하세요. 고급 성분과 제조 스토리를 깊이 있게 다루고, 피부과 전문의 추천이나 수상 이력을 상단에 배치하세요.',
  },
  fashion: {
    smartstore:
      '시즌별 코디 제안과 다양한 스타일링 컷을 충분히 제공하세요. 실측 사이즈 표와 모델 착용 정보(키/체중)를 명확히 표기해 교환 반품을 줄이세요.',
    coupang:
      '사이즈 교환 정책과 빠른 배송 조건을 상단에 명시하세요. 핵심 소재와 세탁 방법을 간결하게 표기해 구매 결정을 돕세요.',
    '11st':
      '트렌드 키워드를 활용한 코디 제안으로 검색 노출을 높이세요. 빠른 배송과 교환 정책을 히어로 영역에 배치해 구매 불안을 낮추세요.',
    gmarket:
      '기획전/번들 할인 구성을 적극 활용하세요. 시즌 트렌드 스타일링을 제안하고 스마일페이 적립 혜택을 함께 안내하세요.',
    musinsa:
      '실측 사이즈 가이드가 핵심입니다. 코디 탭 스타일링을 필수로 포함하고, 다양한 체형 모델의 착용 사진에 키와 체중을 반드시 명시하세요.',
    wemakeprice:
      '타임딜 한정 수량을 강조해 긴급성을 만드세요. 소재 품질을 직접 증명하는 클로즈업 컷과 세탁 후 비교 이미지로 가성비 패션의 신뢰도를 높이세요.',
    ssg:
      '백화점 패션 신뢰도와 프리미엄 소재 스토리를 전면에 내세우세요. 시즌 에디토리얼 컷을 활용하고 SSG 단독 라인업임을 강조하면 고객 충성도를 높일 수 있습니다.',
  },
  living: {
    smartstore:
      '실제 생활 공간에서의 사용 장면을 연출하세요. 배송 및 설치 정보를 상단에 명확히 표기하고 무료 반품 정책으로 구매 장벽을 낮추세요.',
    coupang:
      '로켓배송 빠른 수령을 강조하고 조립/설치 편의성을 시각적으로 설명하세요. 내구성 스펙과 실사용 장면을 함께 구성해 온라인 구매 불안을 해소하세요.',
    '11st':
      '가격 대비 품질 강조와 함께 할인 이벤트를 연계하세요. 실제 사용 리뷰와 인증 사진을 풍부하게 활용해 구매 신뢰도를 높이세요.',
    gmarket:
      '인테리어 감성 스타일링 이미지를 활용하고 세트/번들 구성으로 객단가를 높이세요. 스마일클럽 포인트 적립을 언급해 재구매를 유도하세요.',
    ohouse:
      '누끼컷과 스펙 나열을 지양하세요. 룸셋 스타일링과 비포/애프터 연출을 매거진 형식으로 구성하는 것이 핵심입니다.',
  },
  electronics: {
    smartstore:
      '최저가 인증과 AS 보장 정보를 상단에 배치하세요. 스펙 비교표와 실사용 리뷰를 충분히 제공하고, 네이버쇼핑 최저가 뱃지 획득을 위한 가격 경쟁력을 확보하세요.',
    coupang:
      '첫 화면 3초 안에 핵심 스펙과 경쟁 제품 대비 강점을 전달하세요. 로켓직구 수입 제품 대비 국내 AS와 정품 보증을 명확히 강조하세요.',
    '11st':
      'SK 통신사 제휴 혜택과 할부 구매 조건을 명시하세요. 전자제품 전문몰 이미지를 활용해 스펙 비교와 사용 편의성을 상세히 설명하세요.',
    gmarket:
      '스마일클럽 포인트 혜택과 기획전 연계 할인을 강조하세요. 번들 구성(본품+액세서리)으로 객단가를 높이고 사용 시나리오별 장점을 제시하세요.',
  },
  pet: {
    smartstore:
      'KC 인증 마크를 최상단에 고지하세요. 도매 이미지를 검증 없이 사용하지 말고, 실제 제품 촬영본을 사용하세요.',
    coupang:
      '정기배송 구독 할인을 강조하고 반려동물 사료/간식 안전성 인증을 상단에 배치하세요. 로켓배송으로 급하게 필요한 상황을 케어하는 메시지를 활용하세요.',
    '11st':
      '수의사 추천이나 성분 안전성 검증 내용을 전면에 내세우세요. 반려동물 커뮤니티 리뷰 인증샷을 활용해 보호자 공감을 이끌어내세요.',
    gmarket:
      '다양한 용량/사이즈 구성으로 다견·다묘 가정을 공략하세요. 패밀리 펫 앵글로 여러 반려동물 적용 가능성을 보여주면 구매 수량을 높일 수 있습니다.',
  },
}

export function getCrossStrategyTip(
  categorySlug: string,
  platformSlug: string
): string | null {
  return CROSS_STRATEGY_TIPS[categorySlug]?.[platformSlug] ?? null
}
