import { getCategoryPrompt } from './prompts/categories'
import { getPlatformPrompt } from './prompts/platforms'
import { getCrossStrategyTip } from './prompts/compatibility'

// 감정:정보 비율 (카테고리별)
const EMOTION_RATIOS: Record<string, string> = {
  food: '감성 70% / 정보 30%',
  'health-food': '감성 20% / 정보 80%',
  beauty: '감성 60% / 정보 40%',
  fashion: '감성 65% / 정보 35%',
  living: '감성 50% / 정보 50%',
  electronics: '감성 30% / 정보 70%',
  pet: '감성 60% / 정보 40%',
}

// 카테고리별 배경 제안
const CATEGORY_BACKGROUNDS: Record<string, string> = {
  food: '화이트(가공식품/위생), 나무 텍스처(자연/수제), 대리석(프리미엄), 크림/베이지 패브릭(유기농/따뜻한)',
  'health-food': '블루/화이트 배경(과학적/신뢰), 실험실 콘셉트',
  beauty: '화이트 마블(클린뷰티/더마), 소프트 핑크/라벤더 패브릭(여성 타겟), 블랙 마블(럭셔리/안티에이징)',
  fashion: '깔끔한 스튜디오 배경, 색상 왜곡 통제 필수',
  living: '실제 사용 환경(주방/욕실/거실) 필수 — 누끼컷 단독 배치 지양',
  electronics: '다크그레이/블랙 그라데이션(테크 프리미엄), 미니멀 화이트 테이블',
  pet: '밝은 자연광 배경, 건강한 느낌의 그린/화이트',
}

// 카테고리별 조명 비율
const CATEGORY_LIGHTING: Record<string, string> = {
  food: '메인:필 = 3:1 (자연스러운 깊이감), 따뜻한 색온도',
  'health-food': '메인:필 = 2:1 (균일하고 밝은), 5500K 스튜디오 조명',
  beauty: '메인:필 = 3:1, 림라이트로 투명 용기 강조, 부드러운 광택',
  fashion: '메인:필 = 2:1, 색상 재현 정확도 최우선',
  living: '메인:필 = 2:1 (밝고 균일), 실내 자연광 느낌',
  electronics: '메인:필 = 2:1, f/8-11 전체 선명도, 화면 제품은 별도 합성',
  pet: '메인:필 = 3:1, 따뜻하고 부드러운 자연광',
}

// 카테고리별 카메라 세팅
const CATEGORY_CAMERA: Record<string, string> = {
  food: '85-100mm 매크로, f/4-5.6, ISO 100-200, 삼각대 필수',
  'health-food': '85-100mm 매크로, f/4-5.6, ISO 100-200',
  beauty: '85-100mm 매크로, f/4-5.6, ISO 100-200, 초접사 질감',
  fashion: '50-85mm, f/5.6-8, 워킹컷/피팅컷',
  living: '50mm 표준, f/5.6-8, 실사용 환경',
  electronics: '50-85mm, f/8-11 (전체 선명도), ISO 100',
  pet: '85-100mm, f/4-5.6, 동물 포커싱',
}

// 섹션 타입 한글명
const SECTION_NAMES: Record<string, string> = {
  hero: '히어로 배너',
  benefits: '핵심 장점',
  features: '상세 스펙',
  how_to_use: '사용법',
  social_proof: '고객 후기/신뢰',
  comparison: '비교',
  cta: '구매 유도(CTA)',
}

// 섹션 타입별 디자인 규칙
const SECTION_DESIGN_RULES: Record<string, string> = {
  hero: `풀폭 히어로 배너. 제품을 화면의 40-60% 차지.
헤드라인은 최대 15자, 고객 니즈/결과 중심("매일 아침 갓 구운 행복" ○, "소금빵" ×).
서브카피 1줄. 임팩트 있는 첫인상이 구매 결정.
배경은 스타일링샷 활용 또는 브랜드 컬러 그라데이션.`,
  benefits: `핵심 장점 3~5개. 카드형 또는 아이콘+텍스트 그리드.
결과 중심 서술("3년 써도 뒤틀림 없는" ○, "고강도 소재 사용" ×).
각 항목에 시각적 구분(아이콘, 컬러 포인트). 제품 이미지와 함께 배치.`,
  features: `상세 스펙/특징. 인포그래픽 스타일. 정확한 수치 강조(크기, 무게, 재질).
제품 클로즈업 또는 다이어그램. 2단 레이아웃(이미지+텍스트) 또는 풀폭 인포그래픽.`,
  how_to_use: `사용법. 단계별 넘버링(1, 2, 3...).
각 단계에 시각적 아이콘 또는 이미지. 스텝 간 시각적 흐름(화살표/연결선).
라이프스타일 장면과 결합.`,
  social_proof: `고객 후기/신뢰. 구체적 수치("구매 후기 4.8점, 2,340명" ○, "많은 분들이 만족" ×).
인용 부호 스타일. 인증 마크/뱃지 배치. 별점 시각화.`,
  comparison: `비교표. Before/After 또는 경쟁 비교. 명확한 시각적 대비. 자사 강점 하이라이트.`,
  cta: `구매 유도. 브랜드 컬러 풀폭 배경. 행동 동사 + 희소성("지금 담기 — 오늘만 특가").
버튼형 시각 요소. 마지막 강렬한 인상.`,
}

interface StylingPromptOptions {
  stylingDescription: string
  category: string
  platform: string
  companyName: string
  productHighlights: string
  colorHex: string
  tone: string
}

/**
 * Task 2: 스타일링샷 생성용 프롬프트
 * 카테고리별 촬영가이드 + 디자인가이드 PART 2 반영
 */
export function buildStylingPrompt(opts: StylingPromptOptions): string {
  const cat = getCategoryPrompt(opts.category)
  const crossTip = getCrossStrategyTip(opts.category, opts.platform)
  const background = CATEGORY_BACKGROUNDS[opts.category] ?? '깔끔한 스튜디오 배경'
  const lighting = CATEGORY_LIGHTING[opts.category] ?? '메인:필 = 2:1, 5500K'
  const camera = CATEGORY_CAMERA[opts.category] ?? '50-85mm, f/5.6-8'

  const lines = [
    `당신은 ${cat?.name ?? opts.category} 전문 이커머스 상품 포토그래퍼입니다.`,
    `제공된 제품 이미지(누끼컷)를 활용하여 고품질 스타일링 사진을 촬영해주세요.`,
    ``,
    `[브랜드]: ${opts.companyName}`,
    `[제품 특징]: ${opts.productHighlights}`,
    `[메인 컬러]: ${opts.colorHex}`,
    `[톤앤매너]: ${opts.tone}`,
    ``,
    `[장면 연출]`,
    opts.stylingDescription,
    ``,
    `[카테고리별 촬영 기법]`,
    cat?.shootingGuide ?? '',
    ``,
    `[조명]: ${lighting}`,
    `[카메라]: ${camera}`,
    `[배경 제안]: ${background}`,
    ``,
    `[구도 규칙]`,
    `- 삼분법: 제품을 4개 교차점 중 하나에 배치`,
    `- 소품: 제품의 1/3 이하 크기, 최대 3개(홀수), 브랜드 관련`,
    `- 여백: 전방위 15-20%, 텍스트용 상단 또는 하단 30% 의도적 비움`,
  ]

  if (crossTip) {
    lines.push(``, `[카테고리×플랫폼 전략]`, crossTip)
  }

  lines.push(
    ``,
    `[필수 규칙]`,
    `- 제공된 누끼컷의 제품을 자연스럽게 장면에 배치 (제품 형태 변형 금지)`,
    `- 텍스트를 이미지에 넣지 마세요`,
    `- 전문적인 이커머스 상품 사진 퀄리티`,
    `- RAW 촬영 후 라이트룸 보정한 듯한 자연스러운 색감`,
  )

  return lines.join('\n')
}

interface SectionDesignPromptOptions {
  section: {
    type: string
    title?: string
    subtitle?: string
    items?: Array<{ title: string; description: string }>
    steps?: string[]
    text?: string
    image_description?: string
  }
  category: string
  platform: string
  companyName: string
  tone: string
  colorSuggestion: string
}

/**
 * Task 3: 섹션별 상세페이지 이미지 생성용 프롬프트
 * 카테고리×플랫폼 전략 + 감정:정보 비율 + 섹션 디자인 규칙
 */
export function buildSectionDesignPrompt(opts: SectionDesignPromptOptions): string {
  const { section } = opts
  const cat = getCategoryPrompt(opts.category)
  const plat = getPlatformPrompt(opts.platform)
  const crossTip = getCrossStrategyTip(opts.category, opts.platform)
  const emotionRatio = EMOTION_RATIOS[opts.category] ?? '감성 50% / 정보 50%'
  const sectionName = SECTION_NAMES[section.type] ?? section.type
  const designRule = SECTION_DESIGN_RULES[section.type] ?? ''

  const lines = [
    `당신은 ${cat?.name ?? opts.category} 전문 이커머스 상세페이지 디자이너입니다.`,
    `${opts.companyName}의 ${plat?.name ?? opts.platform} 상세페이지에서 [${sectionName}] 섹션을 디자인해주세요.`,
    ``,
    `[톤앤매너]: ${opts.tone}`,
    `[메인 컬러]: ${opts.colorSuggestion} (이 컬러를 강조색으로 활용)`,
    `[감정:정보 비율]: ${emotionRatio}`,
  ]

  if (crossTip) {
    lines.push(``, `[카테고리×플랫폼 핵심 전략]`, crossTip)
  } else if (plat) {
    // crossTip null 시 플랫폼 기본 전략으로 fallback
    lines.push(``, `[플랫폼 전략]`, `타겟: ${plat.targetAudience}`, `레이아웃: ${plat.layoutRules}`)
  }

  // 섹션 콘텐츠
  lines.push(``, `[섹션 콘텐츠]`)
  if (section.title) lines.push(`제목: ${section.title}`)
  if (section.subtitle) lines.push(`부제목: ${section.subtitle}`)
  if (section.text) lines.push(`본문: ${section.text}`)
  if (section.items && section.items.length > 0) {
    lines.push(`항목:`)
    section.items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.title} — ${item.description}`)
    })
  }
  if (section.steps && section.steps.length > 0) {
    lines.push(`단계:`)
    section.steps.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`)
    })
  }

  // 이미지 연출 가이드
  if (section.image_description) {
    lines.push(``, `[이미지 연출 가이드]`, section.image_description)
  }

  // 섹션 디자인 규칙
  if (designRule) {
    lines.push(``, `[${sectionName} 디자인 규칙]`, designRule)
  }

  lines.push(
    ``,
    `[기술 요구사항]`,
    `- 가로 860px, 세로는 콘텐츠에 맞게 자유`,
    `- 한글 텍스트를 이미지 안에 깔끔하게 배치 (Noto Sans KR 스타일)`,
    `- 텍스트 가독성 최우선: 충분한 대비, 최소 18pt`,
    `- 제공된 제품 사진과 스타일링 사진을 자연스럽게 배치`,
    `- 실제 ${plat?.name ?? '이커머스 플랫폼'}에 올라갈 상세페이지 디자인`,
    `- 전문 디자이너가 만든 것처럼 완성도 높은 디자인`,
    ``,
    `[금지사항]`,
    `- 와이어프레임/스케치/기획안 느낌`,
    `- 섹션 라벨이나 뱃지 ("히어로", "핵심 장점" 등 메타 표시)`,
    `- 플레이스홀더 텍스트`,
    `- 저해상도/흐릿한 요소`,
  )

  return lines.join('\n')
}

export { SECTION_NAMES, EMOTION_RATIOS }
