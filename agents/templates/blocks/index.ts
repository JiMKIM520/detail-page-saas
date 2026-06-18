/**
 * 조합형 블록 시스템 공개 API.
 *
 * 사용:
 *   import { renderPage, deriveTokens } from '@/agents/templates/blocks'
 *   const { html } = renderPage({ meta, tokens, blocks })
 *
 * 변형 추가(피그마 인제스천): variants/<archetype>.ts 에 defineBlock 추가 → 아래 registerBlocks 배열에 등록.
 */
import { registerBlocks } from './registry'
import { heroCentered, heroEditorial, heroPoints, heroArch } from './variants/hero'
import { checkpointRows, checkpointGrid } from './variants/checkpoint'
import { pointBubble, featureFullbleed } from './variants/point'
import { calloutBanner, statementSerif } from './variants/callout'
import { compareCooking } from './variants/compare'
import { specTable } from './variants/spec'
import { closingMood, closingLight } from './variants/closing'
import { recommendDark } from './variants/recommend'
import { checklistChecks } from './variants/checklist'
import { stripBand } from './variants/strip'
import { reasonQuestion } from './variants/reason'
import { featureSeal } from './variants/seal'
import { equationVisual } from './variants/equation'
import { storyPair } from './variants/story'
import { certRosette } from './variants/cert'
import { reviewBubbles, reviewCards } from './variants/review'
import { faqChat } from './variants/faq'
import { shippingInfo } from './variants/shipping'
import { statsHighlight } from './variants/stats'
import { galleryOptions } from './variants/gallery'
import { bannerEvent } from './variants/banner'
import { featureEditorial, featureCards, featureDark } from './variants/feature-editorial'
import { ingredientAccent, ingredientGrid } from './variants/ingredient'
import { compareBeforeAfter } from './variants/compare-beforeafter'
import { reviewList } from './variants/review-list'
import { usageSteps } from './variants/usage-steps'
import { packageList } from './variants/package-list'
import { certFrame } from './variants/cert-frame'
import { galleryGrid } from './variants/gallery-grid'
import { eventPromo } from './variants/event-promo'
import { discountDeal } from './variants/discount-deal'
import { detailShowcase } from './variants/detail-showcase'
import { storyBrand } from './variants/story-brand'
import { bannerSeasonal } from './variants/banner-seasonal'

registerBlocks([
  heroCentered,
  heroEditorial,
  heroPoints,
  heroArch,
  checkpointRows,
  checkpointGrid,
  pointBubble,
  featureFullbleed,
  calloutBanner,
  statementSerif,
  compareCooking,
  specTable,
  closingMood,
  closingLight,
  // 식품 라이브러리 완성 변형 (스타일 A 8종)
  recommendDark,
  checklistChecks,
  stripBand,
  reasonQuestion,
  featureSeal,
  equationVisual,
  storyPair,
  certRosette,
  // review 아키타입 (Figma 200섹션 인제스천 파일럿)
  reviewBubbles,
  reviewCards,
  // Figma 200섹션 신규 아키타입 배치 (faq/shipping/stats/gallery/banner)
  faqChat,
  shippingInfo,
  statsHighlight,
  galleryOptions,
  bannerEvent,
  // 템플릿 충실 재현(와디즈 200섹션 03_특장점 — 3가지 다양한 룩)
  featureEditorial,
  featureCards,
  featureDark,
  // 템플릿 충실 재현(와디즈 200섹션 04_원료 소개)
  ingredientAccent,
  ingredientGrid,
  // 템플릿 충실 재현(07_차별화 비교)
  compareBeforeAfter,
  // 템플릿 충실 재현(06_고객리뷰)
  reviewList,
  // 템플릿 충실 재현(05_사용법)
  usageSteps,
  // 템플릿 충실 재현(08_상품 구성)
  packageList,
  // 템플릿 충실 재현(14_인증)
  certFrame,
  // 템플릿 충실 재현(12_갤러리 — 사진 중심 룩북 그리드)
  galleryGrid,
  // 템플릿 충실 재현(13_이벤트 — 다크 쿠폰 프로모)
  eventPromo,
  // 템플릿 충실 재현(15_할인 — 임팩트형 빨강 세일)
  discountDeal,
  // 템플릿 충실 재현(17_제품설명 — 에디토리얼 서술형)
  detailShowcase,
  // 템플릿 충실 재현(09_브랜드스토리 — 풀블리드 에디토리얼)
  storyBrand,
  // 템플릿 충실 재현(18_시즈널 배너 — 자족형 시즌 무드)
  bannerSeasonal,
])

export { renderPage, pageSpecSchema } from './composer'
export type { RenderResult } from './composer'
export { getVariant, listVariants, catalog } from './registry'
export { deriveTokens, TOKEN_PRESETS, warmPlayful, modernEditorial, cobaltPremium, sandLuxury } from './tokens'
export type { BlockArchetype, BlockVariant, PageSpec, PageBlock, Tokens, RenderCtx } from './types'
