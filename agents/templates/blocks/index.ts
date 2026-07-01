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
import { ingredientAccent, ingredientGrid, ingredientSpotlight } from './variants/ingredient'
import { compareBeforeAfter } from './variants/compare-beforeafter'
import { reviewList } from './variants/review-list'
import { usageSteps } from './variants/usage-steps'
import { usageFlow, usageDark } from './variants/usage-extra'
import { packageList } from './variants/package-list'
import { packageCards, packageDark } from './variants/package-extra'
import { certFrame } from './variants/cert-frame'
import { galleryGrid } from './variants/gallery-grid'
import { eventPromo } from './variants/event-promo'
import { discountDeal } from './variants/discount-deal'
import { detailShowcase } from './variants/detail-showcase'
import { detailPoints } from './variants/detail-points'
import { detailSpecTable } from './variants/detail-spec-table'
import { storyBrand } from './variants/story-brand'
import { bannerSeasonal } from './variants/banner-seasonal'
import { introCover } from './variants/intro-cover'
import { statsFigures } from './variants/stats-figures'
import { statsZigzag } from './variants/stats-zigzag'
import { faqList } from './variants/faq-list'
import { heroPhoto } from './variants/hero-photo'
import { shippingNotice } from './variants/shipping-notice'
import { reviewChatBubbles } from './variants/review-chat-bubbles'
import { heroSplitList } from './variants/hero-split-list'
import { heroIconRows } from './variants/hero-icon-rows'
import { heroDarkStack } from './variants/hero-dark-stack'
import { heroOverlayBubble } from './variants/hero-overlay-bubble'
import { statsGlassCards } from './variants/stats-glass-cards'
import { statsColumns } from './variants/stats-columns'
import { statsEmojiStack } from './variants/stats-emoji-stack'
import { featureArcTimeline } from './variants/feature-arc-timeline'
import { featureSplitPanels } from './variants/feature-split-panels'
import { featureZigzagCircle } from './variants/feature-zigzag-circle'
import { ingredientStagger } from './variants/ingredient-stagger'
import { ingredientZigzag } from './variants/ingredient-zigzag'
import { ingredientPillList } from './variants/ingredient-pill-list'
import { ingredientHeroRows } from './variants/ingredient-hero-rows'
import { ingredientChecklistPhoto } from './variants/ingredient-checklist-photo'
import { usageZigzag } from './variants/usage-zigzag'
import { usageAccentHero } from './variants/usage-accent-hero'
import { usageNumberBand } from './variants/usage-number-band'
import { usageChecklistCard } from './variants/usage-checklist-card'
import { reviewAlternatingRows } from './variants/review-alternating-rows'
import { reviewImageGrid } from './variants/review-image-grid'
import { reviewThumbnailCards } from './variants/review-thumbnail-cards'
import { compareAsymmetricCta } from './variants/compare-asymmetric-cta'
import { compareStackedRows } from './variants/compare-stacked-rows'
import { compareGridTable } from './variants/compare-grid-table'
import { packageHeroList } from './variants/package-hero-list'
import { packageBandRows } from './variants/package-band-rows'
import { storyPhotoHeader } from './variants/story-photo-header'
import { storyDarkEditorial } from './variants/story-dark-editorial'
import { storyVerticalRepeat } from './variants/story-vertical-repeat'
import { storyRotatingHighlight } from './variants/story-rotating-highlight'
import { detailImageCaptionStack } from './variants/detail-image-caption-stack'
import { storyGalleryNarrative } from './variants/story-gallery-narrative'
import { storyLabeledImageStack } from './variants/story-labeled-image-stack'
import { storyStackedImageNarrative } from './variants/story-stacked-image-narrative'
import { detailPointScrollStack } from './variants/detail-point-scroll-stack'
import { featureNumberedCalloutScroll } from './variants/feature-numbered-callout-scroll'
import { detailSpecIllustrationCallout } from './variants/detail-spec-illustration-callout'
import { detailNumberedPointStack } from './variants/detail-numbered-point-stack'
import { csHoursContact } from './variants/cs-hours-contact'
import { csContactBanner } from './variants/cs-contact-banner'
import { csClosureCalendar } from './variants/cs-closure-calendar'
import { reasonZebraRows } from './variants/reason-zebra-rows'
import { csMonthlyCalendar } from './variants/cs-monthly-calendar'
import { csVacationCalendar } from './variants/cs-vacation-calendar'
import { csHolidayCalendar } from './variants/cs-holiday-calendar'
import { csDeliveryCalendar } from './variants/cs-delivery-calendar'
import { csDeliveryGuaranteeSplit } from './variants/cs-delivery-guarantee-split'
import { shippingHeroNoticeStrip } from './variants/shipping-hero-notice-strip'
import { shippingSpeedBanner } from './variants/shipping-speed-banner'
import { shippingSubscriptionHero } from './variants/shipping-subscription-hero'
import { shippingSpeedHero } from './variants/shipping-speed-hero'
import { shippingVehicleCompositeHero } from './variants/shipping-vehicle-composite-hero'
import { csAuthorizedSellerHero } from './variants/cs-authorized-seller-hero'
import { csAuthorizedRetailerBadge } from './variants/cs-authorized-retailer-badge'
import { shippingIllustHero } from './variants/shipping-illust-hero'
import { shippingDateTimeline } from './variants/shipping-date-timeline'
import { baPainpointBubbles } from './variants/ba-painpoint-bubbles'
import { baPhotoSplitCard } from './variants/ba-photo-split-card'
import { recommendPersonaGrid } from './variants/recommend-persona-grid'
import { compareProductCards } from './variants/compare-product-cards'
import { eventCommentPrizeGrid } from './variants/event-comment-prize-grid'
import { comparePriceBarChart } from './variants/compare-price-bar-chart'
import { compareOverlapCards } from './variants/compare-overlap-cards'
import { baMultiEffectStacked } from './variants/ba-multi-effect-stacked'
import { compareCompetitorPhoto } from './variants/compare-competitor-photo'
import { recommendPainpointBubbles } from './variants/recommend-painpoint-bubbles'
import { compareTabPanelsImageList } from './variants/compare-tab-panels-image-list'
import { comparePriceCardPair } from './variants/compare-price-card-pair'
import { credentialsStatBento } from './variants/credentials-stat-bento'
import { painpointBrandResearchTrio } from './variants/painpoint-brand-research-trio'
import { compareProductSpecMatrix } from './variants/compare-product-spec-matrix'
import { compareUpgradeProductCards } from './variants/compare-upgrade-product-cards'
import { featureDarkGrid } from './variants/feature-dark-grid'
import { featureBentoPhotoGrid } from './variants/feature-bento-photo-grid'
import { featureBentoPhotoTiles } from './variants/feature-bento-photo-tiles'
import { featureBentoMosaic } from './variants/feature-bento-mosaic'
import { compareProductCardVs } from './variants/compare-product-card-vs'
import { specNutritionMacroTable } from './variants/spec-nutrition-macro-table'
import { baClinicalBarChart } from './variants/ba-clinical-bar-chart'
import { storyTextFirst } from './variants/story-text-first'
import { faqNumbered } from './variants/faq-numbered'
import { faqPlain } from './variants/faq-plain'
import { faqBox } from './variants/faq-box'
import { heroPhotoBottom } from './variants/hero-photo-bottom'
import { heroPhotoFullbg } from './variants/hero-photo-fullbg'
import { heroPhotoInset } from './variants/hero-photo-inset'
import { galleryNumberedBadge } from './variants/gallery-numbered-badge'
import { galleryCaptionStack } from './variants/gallery-caption-stack'
import { galleryNumberedStrip } from './variants/gallery-numbered-strip'
import { galleryRibbonCard } from './variants/gallery-ribbon-card'
import { eventReviewPrizeGrid } from './variants/event-review-prize-grid'
import { eventCouponDeviceSteps } from './variants/event-coupon-device-steps'
import { eventLaunchChecklist } from './variants/event-launch-checklist'
import { certBadgeHero } from './variants/cert-badge-hero'
import { discountPhotoPrice } from './variants/discount-photo-price'
import { discountCouponStack } from './variants/discount-coupon-stack'
import { shippingIconHero } from './variants/shipping-icon-hero'
import { detailPolicyTable } from './variants/detail-policy-table'
import { detailCompareTable } from './variants/detail-compare-table'
import { bannerSeasonalCouponSplit } from './variants/banner-seasonal-coupon-split'
import { bannerSeasonalWreath } from './variants/banner-seasonal-wreath'
import { bannerEventTwozone } from './variants/banner-event-twozone'
import { bannerImageDominant } from './variants/banner-image-dominant'
import { heroCircleCheck } from './variants/hero-circle-check'
import { heroPedestal } from './variants/hero-pedestal'
import { heroThumbList } from './variants/hero-thumb-list'
import { heroCardStack } from './variants/hero-card-stack'
import { heroCardWrapper } from './variants/hero-card-wrapper'
import { heroStripePoints } from './variants/hero-stripe-points'
import { heroConnectorSplit } from './variants/hero-connector-split'
import { heroCircleBg } from './variants/hero-circle-bg'
import { heroCheckRows } from './variants/hero-check-rows'
import { heroBubblePoints } from './variants/hero-bubble-points'
import { heroNumberedCols } from './variants/hero-numbered-cols'
import { statsBentoGrid } from './variants/stats-bento-grid'
import { statsHeaderCardStack } from './variants/stats-header-card-stack'
import { statsCircleStagger } from './variants/stats-circle-stagger'
import { statsIconBlocks } from './variants/stats-icon-blocks'
import { statsTextOnly } from './variants/stats-text-only'
import { featureCaptionbar } from './variants/feature-captionbar'
import { featureRibbonCards } from './variants/feature-ribbon-cards'
import { featureWhyIconlist } from './variants/feature-why-iconlist'
import { featureSpokeDiagram } from './variants/feature-spoke-diagram'
import { featureWaveTable } from './variants/feature-wave-table'
import { featureDarkInsetCard } from './variants/feature-dark-inset-card'
import { ingredientRadar } from './variants/ingredient-radar'
import { ingredientRuleGrid } from './variants/ingredient-rule-grid'
import { ingredientEllipseZigzag } from './variants/ingredient-ellipse-zigzag'
import { ingredientPhotoGrid } from './variants/ingredient-photo-grid'
import { ingredientEditorialHero } from './variants/ingredient-editorial-hero'
import { usageCardNumber } from './variants/usage-card-number'
import { usagePillSteps } from './variants/usage-pill-steps'
import { usageTextRows } from './variants/usage-text-rows'
import { usageDarkBands } from './variants/usage-dark-bands'
import { usagePhotoCard } from './variants/usage-photo-card'
import { usagePhotoThumbList } from './variants/usage-photo-thumb-list'
import { reviewCollage } from './variants/review-collage'
import { reviewTextRows } from './variants/review-text-rows'
import { reviewStackedPairs } from './variants/review-stacked-pairs'
import { reviewDividerList } from './variants/review-divider-list'
import { compareHeroTable } from './variants/compare-hero-table'
import { comparePhoneMockup } from './variants/compare-phone-mockup'
import { compareHeroPanels } from './variants/compare-hero-panels'
import { compareStaggeredBanners } from './variants/compare-staggered-banners'
import { packageZigzagCircle } from './variants/package-zigzag-circle'
import { packageHeroFadeList } from './variants/package-hero-fade-list'
import { packageOffsetImageRows } from './variants/package-offset-image-rows'
import { packageTicketPodium } from './variants/package-ticket-podium'
import { storyCurvePanel } from './variants/story-curve-panel'
import { storyWaveSplit } from './variants/story-wave-split'
import { storyArchImage } from './variants/story-arch-image'
import { storyHighlightBox } from './variants/story-highlight-box'
import { storyCenteredSecondaryImage } from './variants/story-centered-secondary-image'
import { faqBadgeRow } from './variants/faq-badge-row'
import { faqGlyphBox } from './variants/faq-glyph-box'
import { faqPillBar } from './variants/faq-pill-bar'
import { heroPhotoQuote } from './variants/hero-photo-quote'
import { heroPhotoDualStack } from './variants/hero-photo-dual-stack'
import { heroPhotoDualOffset } from './variants/hero-photo-dual-offset'
import { heroPhotoCircle } from './variants/hero-photo-circle'
import { heroPhotoPinned } from './variants/hero-photo-pinned'
import { heroPhotoBlobSplit } from './variants/hero-photo-blob-split'
import { heroPhotoGlassCard } from './variants/hero-photo-glass-card'
import { galleryStaggerRounded } from './variants/gallery-stagger-rounded'
import { galleryColorPanel } from './variants/gallery-color-panel'
import { galleryArchGrid } from './variants/gallery-arch-grid'
import { galleryBarframeCard } from './variants/gallery-barframe-card'
import { galleryHalfwidthStagger } from './variants/gallery-halfwidth-stagger'
import { eventComingSoonTeaser } from './variants/event-coming-soon-teaser'
import { eventReopenPriceStrip } from './variants/event-reopen-price-strip'
import { eventHeroPriceCta } from './variants/event-hero-price-cta'
import { certPedestal } from './variants/cert-pedestal'
import { certClipboard } from './variants/cert-clipboard'
import { discountCouponGrid } from './variants/discount-coupon-grid'
import { discountEventBillboard } from './variants/discount-event-billboard'
import { discountPriceBullets } from './variants/discount-price-bullets'
import { shippingChapterHero } from './variants/shipping-chapter-hero'
import { detailStepsSupport } from './variants/detail-steps-support'
import { detailDimensionFaq } from './variants/detail-dimension-faq'
import { detailPackageFaq } from './variants/detail-package-faq'
import { detailHeroInfoTable } from './variants/detail-hero-info-table'
import { detailEditorialVenn } from './variants/detail-editorial-venn'
import { bannerSeasonalArch } from './variants/banner-seasonal-arch'
import { bannerSeasonalIllustration } from './variants/banner-seasonal-illustration'
import { bannerSeasonalDarkCoupon } from './variants/banner-seasonal-dark-coupon'
import { bannerDarkPromo } from './variants/banner-dark-promo'

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
  ingredientSpotlight,
  // 템플릿 충실 재현(07_차별화 비교)
  compareBeforeAfter,
  // 템플릿 충실 재현(06_고객리뷰)
  reviewList,
  reviewChatBubbles,
  // 템플릿 충실 재현(05_사용법)
  usageSteps,
  usageFlow,
  usageDark,
  // 템플릿 충실 재현(08_상품 구성)
  packageList,
  packageCards,
  packageDark,
  // 템플릿 충실 재현(14_인증)
  certFrame,
  // 템플릿 충실 재현(12_갤러리 — 사진 중심 룩북 그리드)
  galleryGrid,
  // 템플릿 충실 재현(13_이벤트 — 다크 쿠폰 프로모)
  eventPromo,
  // 템플릿 충실 재현(15_할인 — 임팩트형 빨강 세일)
  discountDeal,
  // 템플릿 충실 재현(17_제품설명 — 에디토리얼 서술형 / 스펙 표)
  detailShowcase,
  detailPoints,
  detailSpecTable,
  // 템플릿 충실 재현(09_브랜드스토리 — 풀블리드 에디토리얼)
  storyBrand,
  // 템플릿 충실 재현(18_시즈널 배너 — 자족형 시즌 무드)
  bannerSeasonal,
  // 템플릿 충실 재현(01_인트로 — 2존 커버)
  introCover,
  // 템플릿 충실 재현(02_수치강조 — 대형 숫자 임팩트)
  statsFigures,
  statsZigzag,
  // 템플릿 충실 재현(10_FAQ — 정돈된 카드 리스트)
  faqList,
  // 템플릿 충실 재현(11_인트로 사진중심 — 풀블리드 컬러블록)
  heroPhoto,
  // 템플릿 충실 재현(16_배송 — NOTICE 카드형)
  shippingNotice,
  // Figma high-priority distinct 레이아웃 확장 배치
  heroSplitList,
  heroIconRows,
  heroDarkStack,
  heroOverlayBubble,
  statsGlassCards,
  statsColumns,
  statsEmojiStack,
  featureArcTimeline,
  featureSplitPanels,
  featureZigzagCircle,
  ingredientStagger,
  ingredientZigzag,
  ingredientPillList,
  ingredientHeroRows,
  ingredientChecklistPhoto,
  usageZigzag,
  usageAccentHero,
  usageNumberBand,
  usageChecklistCard,
  reviewAlternatingRows,
  reviewImageGrid,
  reviewThumbnailCards,
  compareAsymmetricCta,
  compareStackedRows,
  compareGridTable,
  packageHeroList,
  packageBandRows,
  storyPhotoHeader,
  storyDarkEditorial,
  storyVerticalRepeat,
  storyRotatingHighlight,
  detailImageCaptionStack,
  storyGalleryNarrative,
  storyLabeledImageStack,
  storyStackedImageNarrative,
  detailPointScrollStack,
  featureNumberedCalloutScroll,
  detailSpecIllustrationCallout,
  detailNumberedPointStack,
  csHoursContact,
  csContactBanner,
  csClosureCalendar,
  reasonZebraRows,
  csMonthlyCalendar,
  csVacationCalendar,
  csHolidayCalendar,
  csDeliveryCalendar,
  csDeliveryGuaranteeSplit,
  shippingHeroNoticeStrip,
  shippingSpeedBanner,
  shippingSubscriptionHero,
  shippingSpeedHero,
  shippingVehicleCompositeHero,
  csAuthorizedSellerHero,
  csAuthorizedRetailerBadge,
  shippingIllustHero,
  shippingDateTimeline,
  baPainpointBubbles,
  baPhotoSplitCard,
  recommendPersonaGrid,
  compareProductCards,
  eventCommentPrizeGrid,
  comparePriceBarChart,
  compareOverlapCards,
  baMultiEffectStacked,
  compareCompetitorPhoto,
  recommendPainpointBubbles,
  compareTabPanelsImageList,
  comparePriceCardPair,
  credentialsStatBento,
  painpointBrandResearchTrio,
  compareProductSpecMatrix,
  compareUpgradeProductCards,
  featureDarkGrid,
  featureBentoPhotoGrid,
  featureBentoPhotoTiles,
  featureBentoMosaic,
  compareProductCardVs,
  specNutritionMacroTable,
  baClinicalBarChart,
  storyTextFirst,
  faqNumbered,
  faqPlain,
  faqBox,
  heroPhotoBottom,
  heroPhotoFullbg,
  heroPhotoInset,
  galleryNumberedBadge,
  galleryCaptionStack,
  galleryNumberedStrip,
  galleryRibbonCard,
  eventReviewPrizeGrid,
  eventCouponDeviceSteps,
  eventLaunchChecklist,
  certBadgeHero,
  discountPhotoPrice,
  discountCouponStack,
  shippingIconHero,
  detailPolicyTable,
  detailCompareTable,
  bannerSeasonalCouponSplit,
  bannerSeasonalWreath,
  bannerEventTwozone,
  bannerImageDominant,
  // Figma high-priority distinct 레이아웃 확장 배치
  heroCircleCheck,
  heroPedestal,
  heroThumbList,
  heroCardStack,
  heroCardWrapper,
  heroStripePoints,
  heroConnectorSplit,
  heroCircleBg,
  heroCheckRows,
  heroBubblePoints,
  heroNumberedCols,
  statsBentoGrid,
  statsHeaderCardStack,
  statsCircleStagger,
  statsIconBlocks,
  statsTextOnly,
  featureCaptionbar,
  featureRibbonCards,
  featureWhyIconlist,
  featureSpokeDiagram,
  featureWaveTable,
  featureDarkInsetCard,
  ingredientRadar,
  ingredientRuleGrid,
  ingredientEllipseZigzag,
  ingredientPhotoGrid,
  ingredientEditorialHero,
  usageCardNumber,
  usagePillSteps,
  usageTextRows,
  usageDarkBands,
  usagePhotoCard,
  usagePhotoThumbList,
  reviewCollage,
  reviewTextRows,
  reviewStackedPairs,
  reviewDividerList,
  compareHeroTable,
  comparePhoneMockup,
  compareHeroPanels,
  compareStaggeredBanners,
  packageZigzagCircle,
  packageHeroFadeList,
  packageOffsetImageRows,
  packageTicketPodium,
  storyCurvePanel,
  storyWaveSplit,
  storyArchImage,
  storyHighlightBox,
  storyCenteredSecondaryImage,
  faqBadgeRow,
  faqGlyphBox,
  faqPillBar,
  heroPhotoQuote,
  heroPhotoDualStack,
  heroPhotoDualOffset,
  heroPhotoCircle,
  heroPhotoPinned,
  heroPhotoBlobSplit,
  heroPhotoGlassCard,
  galleryStaggerRounded,
  galleryColorPanel,
  galleryArchGrid,
  galleryBarframeCard,
  galleryHalfwidthStagger,
  eventComingSoonTeaser,
  eventReopenPriceStrip,
  eventHeroPriceCta,
  certPedestal,
  certClipboard,
  discountCouponGrid,
  discountEventBillboard,
  discountPriceBullets,
  shippingChapterHero,
  detailStepsSupport,
  detailDimensionFaq,
  detailPackageFaq,
  detailHeroInfoTable,
  detailEditorialVenn,
  bannerSeasonalArch,
  bannerSeasonalIllustration,
  bannerSeasonalDarkCoupon,
  bannerDarkPromo,
])

export { renderPage, pageSpecSchema } from './composer'
export type { RenderResult } from './composer'
export { getVariant, listVariants, catalog } from './registry'
export { deriveTokens, TOKEN_PRESETS, warmPlayful, modernEditorial, cobaltPremium, sandLuxury, presetForCategory } from './tokens'
export type { PresetKey } from './tokens'
export type { BlockArchetype, BlockVariant, PageSpec, PageBlock, Tokens, RenderCtx } from './types'
