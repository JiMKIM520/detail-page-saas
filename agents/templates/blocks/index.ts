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
import { pointDiscountPriceReveal } from './variants/point-discount-price-reveal'
import { pointPromoAsymcard } from './variants/point-promo-asymcard'
import { featureDarkProductGrid } from './variants/feature-dark-product-grid'
import { pointFullbleedCaption } from './variants/point-fullbleed-caption'
import { pointAwardCredential } from './variants/point-award-credential'
import { featureDarkFloatCutout } from './variants/feature-dark-float-cutout'
import { pointEditorialMarquee } from './variants/point-editorial-marquee'
import { pointHeritageSplit } from './variants/point-heritage-split'
import { pointIngredientHero } from './variants/point-ingredient-hero'
import { pointBrandCollabEditorial } from './variants/point-brand-collab-editorial'
import { promoEventSpotlight } from './variants/promo-event-spotlight'
import { promoStoryPriceReveal } from './variants/promo-story-price-reveal'
import { pointFullbleedBookend } from './variants/point-fullbleed-bookend'
import { pointTimingBanner } from './variants/point-timing-banner'
import { promoScatterBanner } from './variants/promo-scatter-banner'
import { pointNumberedHeroCard } from './variants/point-numbered-hero-card'
import { pointNumberedImageCard } from './variants/point-numbered-image-card'
import { pointStepTimelineBleed } from './variants/point-step-timeline-bleed'
import { pointRadarWeb } from './variants/point-radar-web'
import { featureEventPoster } from './variants/feature-event-poster'
import { pointIngredientOverlay } from './variants/point-ingredient-overlay'
import { featureDarkTabMosaic } from './variants/feature-dark-tab-mosaic'
import { statsSatisfactionBars } from './variants/stats-satisfaction-bars'
import { pointProductAnnotation } from './variants/point-product-annotation'
import { featureImageRowList } from './variants/feature-image-row-list'
import { pointUrgencyTapeCross } from './variants/point-urgency-tape-cross'
import { pointListImageBleed } from './variants/point-list-image-bleed'
import { statsHeroAnchorCardGrid } from './variants/stats-hero-anchor-card-grid'
import { featureProductFloatIconGrid } from './variants/feature-product-float-icon-grid'
import { pointProductStatsSplit } from './variants/point-product-stats-split'
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
import { packageEventPriceRows } from './variants/package-event-price-rows'
import { packageImageRowsStrikePrice } from './variants/package-image-rows-strike-price'
import { packageSplitImagePriceRows } from './variants/package-split-image-price-rows'
import { packageOptionRowsPanel } from './variants/package-option-rows-panel'
import { packageNumberedSplitRows } from './variants/package-numbered-split-rows'
import { productTabFilterRows } from './variants/product-tab-filter-rows'
import { packageDiscountBadgeGrid } from './variants/package-discount-badge-grid'
import { packageOptionGrid } from './variants/package-option-grid'
import { packageLineupBadgeRows } from './variants/package-lineup-badge-rows'
import { productPriceBreakdownCard } from './variants/product-price-breakdown-card'
import { productDiscountBadgeRows } from './variants/product-discount-badge-rows'
import { packageNumberedOptionSelector } from './variants/package-numbered-option-selector'
import { packageNumberedBandRows } from './variants/package-numbered-band-rows'
import { packageSplitIconCards } from './variants/package-split-icon-cards'
import { packageGradientBundleDiscount } from './variants/package-gradient-bundle-discount'
import { packageBundleGiftRows } from './variants/package-bundle-gift-rows'
import { productLineupDarkCards } from './variants/product-lineup-dark-cards'
import { packageEventProductRows } from './variants/package-event-product-rows'
import { productHeroDiscountGrid } from './variants/product-hero-discount-grid'
import { eventCountdownProductGrid } from './variants/event-countdown-product-grid'
import { packageDiscountImageRows } from './variants/package-discount-image-rows'
import { productHeroGiftPrice } from './variants/product-hero-gift-price'
import { packageHeroPriceTable } from './variants/package-hero-price-table'
import { packageDarkComponentGrid } from './variants/package-dark-component-grid'
import { reviewPhotoBubbleStaggered } from './variants/review-photo-bubble-staggered'
import { reviewDividerImageRows } from './variants/review-divider-image-rows'
import { recommendPersonaListAnnotated } from './variants/recommend-persona-list-annotated'
import { reviewEfficacyBarChart } from './variants/review-efficacy-bar-chart'
import { reviewAggregateScoreCards } from './variants/review-aggregate-score-cards'
import { reviewImageStoryStack } from './variants/review-image-story-stack'
import { reviewSatisfactionStats } from './variants/review-satisfaction-stats'
import { reviewDividerImageRight } from './variants/review-divider-image-right'
import { reviewImageRows } from './variants/review-image-rows'
import { reviewSatisfactionPillBars } from './variants/review-satisfaction-pill-bars'
import { reviewThumbnailRows } from './variants/review-thumbnail-rows'
import { reviewPhotoBgDashedCards } from './variants/review-photo-bg-dashed-cards'
import { reviewHeroAvatarList } from './variants/review-hero-avatar-list'
import { reviewStatHeaderCard } from './variants/review-stat-header-card'
import { reviewInstagramDmMockup } from './variants/review-instagram-dm-mockup'
import { reviewIconAlternatingRows } from './variants/review-icon-alternating-rows'
import { reviewAggregateScoreStack } from './variants/review-aggregate-score-stack'
import { reviewNumberedThumbnailRows } from './variants/review-numbered-thumbnail-rows'
import { faqCircleBadge } from './variants/faq-circle-badge'
import { faqStaggerOffset } from './variants/faq-stagger-offset'
import { faqLabelSpecTable } from './variants/faq-label-spec-table'
import { faqEditorialSplit } from './variants/faq-editorial-split'
import { faqPillCardSplit } from './variants/faq-pill-card-split'
import { faqSatisfactionBar } from './variants/faq-satisfaction-bar'
import { faqDualCircle } from './variants/faq-dual-circle'
import { specTableLabelValue } from './variants/spec-table-label-value'
import { awardWarrantyPledge } from './variants/award-warranty-pledge'
import { awardRank1ListingCard } from './variants/award-rank1-listing-card'
import { awardLaurelStatRows } from './variants/award-laurel-stat-rows'
import { awardNo1EmblemBanner } from './variants/award-no1-emblem-banner'
import { awardTrophyDeclare } from './variants/award-trophy-declare'
import { awardMilestoneHero } from './variants/award-milestone-hero'
import { awardNo1Emblem } from './variants/award-no1-emblem'
import { awardNo1EmblemStreak } from './variants/award-no1-emblem-streak'
import { awardNo1EmblemHero } from './variants/award-no1-emblem-hero'
import { awardNo1EmblemBadges } from './variants/award-no1-emblem-badges'
import { awardTrophyStat } from './variants/award-trophy-stat'
import { awardTrophyPoster } from './variants/award-trophy-poster'
import { awardGovSealHero } from './variants/award-gov-seal-hero'
import { awardRankingPodiumSale } from './variants/award-ranking-podium-sale'
import { awardLaurelEmblemGrid } from './variants/award-laurel-emblem-grid'
import { awardTrophyBadgeGrid } from './variants/award-trophy-badge-grid'
import { awardNo1EmblemRosette } from './variants/award-no1-emblem-rosette'
// Sprint 8 — 1420종 .fig 흡수 변형 (docs/plans/image-pipeline-redesign.md)
import { calloutCouponChannel } from './variants/callout-coupon-channel'
import { calloutPainpointCards } from './variants/callout-painpoint-cards'
import { certListBadges } from './variants/cert-list-badges'
import { certSpotlightZoom } from './variants/cert-spotlight-zoom'
import { closingQuotePhoto } from './variants/closing-quote-photo'
import { compareAsymPanels } from './variants/compare-asym-panels'
import { compareBarYears } from './variants/compare-bar-years'
import { pointMetricBadge } from './variants/point-metric-badge'
import { recommendHashtagCard } from './variants/recommend-hashtag-card'
import { recommendOvalChecklist } from './variants/recommend-oval-checklist'
import { shippingDeadlineClock } from './variants/shipping-deadline-clock'
import { specMeasureTable } from './variants/spec-measure-table'
import { specSilhouetteTable } from './variants/spec-silhouette-table'
import { specSizeDiagram } from './variants/spec-size-diagram'
import { statsGaugeBars } from './variants/stats-gauge-bars'
// Sprint 8 wave-2 — 1420종 2차 흡수
import { bannerKineticDuoscale } from './variants/banner-kinetic-duoscale'
import { calloutChatDarkProblem } from './variants/callout-chat-dark-problem'
import { calloutChatZigzag } from './variants/callout-chat-zigzag'
import { calloutDarkStatGrid } from './variants/callout-dark-stat-grid'
import { calloutKakaofriendRadial } from './variants/callout-kakaofriend-radial'
import { certDocZoom } from './variants/cert-doc-zoom'
import { certFanStack } from './variants/cert-fan-stack'
import { certLaurelTriple } from './variants/cert-laurel-triple'
import { certMagnifyBanner } from './variants/cert-magnify-banner'
import { certOrbitRing } from './variants/cert-orbit-ring'
import { checklistBrownPhotoRow } from './variants/checklist-brown-photo-row'
import { compareAsympanelBefaft } from './variants/compare-asympanel-befaft'
import { compareSpecTrio } from './variants/compare-spec-trio'
import { compareTriAxis } from './variants/compare-tri-axis'
import { compareTripleBadge } from './variants/compare-triple-badge'
import { compareVsCardSplit } from './variants/compare-vs-card-split'
import { detailAnatomyCallout } from './variants/detail-anatomy-callout'
import { detailBadgeCallout } from './variants/detail-badge-callout'
import { detailInfotagOverlay } from './variants/detail-infotag-overlay'
import { detailOverlapBookend } from './variants/detail-overlap-bookend'
import { detailPinLegend } from './variants/detail-pin-legend'
import { detailSectionExplode } from './variants/detail-section-explode'
import { detailSerifAltrow } from './variants/detail-serif-altrow'
import { detailSerifHeroZigzag } from './variants/detail-serif-hero-zigzag'
import { eventCircleWarranty } from './variants/event-circle-warranty'
import { eventDarkbgPricedrop } from './variants/event-darkbg-pricedrop'
import { eventKakaoCouponSplit } from './variants/event-kakao-coupon-split'
import { eventOneplusStack } from './variants/event-oneplus-stack'
import { eventOverlapRefund } from './variants/event-overlap-refund'
import { eventOverlayPricebar } from './variants/event-overlay-pricebar'
import { faqBubbleTail } from './variants/faq-bubble-tail'
import { faqChatBubble } from './variants/faq-chat-bubble'
import { featureAltCardStack } from './variants/feature-alt-card-stack'
import { featureArrowTrio } from './variants/feature-arrow-trio'
import { featureChecklistStatBanner } from './variants/feature-checklist-stat-banner'
import { featureCheckpointRail } from './variants/feature-checkpoint-rail'
import { featureDarkPillStack } from './variants/feature-dark-pill-stack'
import { featureHeroPillZigzag } from './variants/feature-hero-pill-zigzag'
import { featureHighlightCaption } from './variants/feature-highlight-caption'
import { featureHoneycombBadge } from './variants/feature-honeycomb-badge'
import { featureHotspotCallout } from './variants/feature-hotspot-callout'
import { featureHotspotSplit } from './variants/feature-hotspot-split'
import { featurePillGrid } from './variants/feature-pill-grid'
import { featureStackImgcap } from './variants/feature-stack-imgcap'
import { featureStepIconbox } from './variants/feature-step-iconbox'
import { featureStepOverlayPanel } from './variants/feature-step-overlay-panel'
import { galleryHeroHashtagGrid } from './variants/gallery-hero-hashtag-grid'
import { heroBadgeGrid } from './variants/hero-badge-grid'
import { heroBadgeStagger } from './variants/hero-badge-stagger'
import { heroBubbleGrid } from './variants/hero-bubble-grid'
import { heroBubbleStack } from './variants/hero-bubble-stack'
import { heroCropmarkOverlay } from './variants/hero-cropmark-overlay'
import { heroDotDuoweight } from './variants/hero-dot-duoweight'
import { heroFloatSplit } from './variants/hero-float-split'
import { heroGlintBrand } from './variants/hero-glint-brand'
import { heroHandscriptIconTrio } from './variants/hero-handscript-icon-trio'
import { heroNumberedTrio } from './variants/hero-numbered-trio'
import { heroOvalBadge } from './variants/hero-oval-badge'
import { heroOvalMascot } from './variants/hero-oval-mascot'
import { heroPillWatermark } from './variants/hero-pill-watermark'
import { heroRibbonPanel } from './variants/hero-ribbon-panel'
import { heroSerifIconPanel } from './variants/hero-serif-icon-panel'
import { heroSplitOrbit } from './variants/hero-split-orbit'
import { heroStampGrid } from './variants/hero-stamp-grid'
import { heroTintOvalDrop } from './variants/hero-tint-oval-drop'
import { heroVerticalBadge } from './variants/hero-vertical-badge'
import { heroWeightSlash } from './variants/hero-weight-slash'
import { ingredientBubbleFloat } from './variants/ingredient-bubble-float'
import { ingredientCardBarStack } from './variants/ingredient-card-bar-stack'
import { ingredientEllipseBarStack } from './variants/ingredient-ellipse-bar-stack'
import { ingredientOnionStack } from './variants/ingredient-onion-stack'
import { ingredientPhGaugeBanner } from './variants/ingredient-ph-gauge-banner'
import { ingredientPhScale } from './variants/ingredient-ph-scale'
import { ingredientPillIconList } from './variants/ingredient-pill-icon-list'
import { ingredientRadialDotMap } from './variants/ingredient-radial-dot-map'
import { ingredientStepPanelSplit } from './variants/ingredient-step-panel-split'
import { lineupDualPriceSeal } from './variants/lineup-dual-price-seal'
import { lineupWordmarkSplit } from './variants/lineup-wordmark-split'
import { pointBadgeSectionTrio } from './variants/point-badge-section-trio'
import { pointBadgeWordSplit } from './variants/point-badge-word-split'
import { pointBubbleChat } from './variants/point-bubble-chat'
import { pointBubbleZigzag } from './variants/point-bubble-zigzag'
import { pointCardSplitCheck } from './variants/point-card-split-check'
import { pointCircleBadgePanel } from './variants/point-circle-badge-panel'
import { pointCircleGridReveal } from './variants/point-circle-grid-reveal'
import { pointDarkGridResolve } from './variants/point-dark-grid-resolve'
import { pointDualCircleBadge } from './variants/point-dual-circle-badge'
import { pointGlassGrid } from './variants/point-glass-grid'
import { pointHighlightStack } from './variants/point-highlight-stack'
import { pointNumeralStack } from './variants/point-numeral-stack'
import { pointPillCascadeReview } from './variants/point-pill-cascade-review'
import { pointRuledChapterOverlap } from './variants/point-ruled-chapter-overlap'
import { pointSerifLayerCallout } from './variants/point-serif-layer-callout'
import { pointTripleBadge } from './variants/point-triple-badge'
import { pointTripleScroll } from './variants/point-triple-scroll'
import { promoLetterBadgeOval } from './variants/promo-letter-badge-oval'
import { recommendSkyOval } from './variants/recommend-sky-oval'
import { reviewBubbleGrid } from './variants/review-bubble-grid'
import { reviewBubbleScore } from './variants/review-bubble-score'
import { reviewCardSummarybar } from './variants/review-card-summarybar'
import { reviewDonutPillow } from './variants/review-donut-pillow'
import { reviewKpiBubbleTrio } from './variants/review-kpi-bubble-trio'
import { reviewLaurelBubble } from './variants/review-laurel-bubble'
import { reviewStatOverlay } from './variants/review-stat-overlay'
import { shippingClockUrgency } from './variants/shipping-clock-urgency'
import { shippingColdchainSteps } from './variants/shipping-coldchain-steps'
import { shippingPolyDeadlineSplit } from './variants/shipping-poly-deadline-split'
import { shippingRoundcardCs } from './variants/shipping-roundcard-cs'
import { specBatteryProgress } from './variants/spec-battery-progress'
import { specDimOverlay } from './variants/spec-dim-overlay'
import { specFootMeasureGrid } from './variants/spec-foot-measure-grid'
import { specHeightGauge } from './variants/spec-height-gauge'
import { specSilhouetteBadge } from './variants/spec-silhouette-badge'
import { statsDecibelOverlay } from './variants/stats-decibel-overlay'
import { storyCauseFlow } from './variants/story-cause-flow'
import { storySerifRuled } from './variants/story-serif-ruled'
import { usageFanoutGrid } from './variants/usage-fanout-grid'
import { usageNumberedSplit } from './variants/usage-numbered-split'
import { usageSceneAltcard } from './variants/usage-scene-altcard'
import { ingredientBadgeTileGrid } from './variants/ingredient-badge-tile-grid'
import { ingredientCircleBadgeZigzag } from './variants/ingredient-circle-badge-zigzag'
import { ingredientOvalStack } from './variants/ingredient-oval-stack'
import { ingredientPointSerifList } from './variants/ingredient-point-serif-list'
import { specDimBlueprint } from './variants/spec-dim-blueprint'
// Sprint 10 — 184종 novel 57 + 1420 3점 novel 51 (라이브러리 실대조 기반)
import { awardSalesFloatBadges } from './variants/award-sales-float-badges'
import { awardSerifGoldDecl } from './variants/award-serif-gold-decl'
import { awardStageBurst } from './variants/award-stage-burst'
import { awardStarRank } from './variants/award-star-rank'
import { awardTrophyFlankedStat } from './variants/award-trophy-flanked-stat'
import { awardTrophyOrbFlanked } from './variants/award-trophy-orb-flanked'
import { bannerCategoryCounter } from './variants/banner-category-counter'
import { bannerGrandMosaic } from './variants/banner-grand-mosaic'
import { certBadgeSplit } from './variants/cert-badge-split'
import { certPointBadgeStack } from './variants/cert-point-badge-stack'
import { checklistRadialLedger } from './variants/checklist-radial-ledger'
import { comparePackageGrid } from './variants/compare-package-grid'
import { csGreenLabelTable } from './variants/cs-green-label-table'
import { csNoticeTypoSplit } from './variants/cs-notice-typo-split'
import { csScheduleDivider } from './variants/cs-schedule-divider'
import { csSloganInfoTable } from './variants/cs-slogan-info-table'
import { discountBoltSplit } from './variants/discount-bolt-split'
import { eventPolyPriceList } from './variants/event-poly-price-list'
import { eventSaleAsymcollage } from './variants/event-sale-asymcollage'
import { eventSpotlightType } from './variants/event-spotlight-type'
import { eventStagePillar } from './variants/event-stage-pillar'
import { faqExpertCard } from './variants/faq-expert-card'
import { faqSidePortraitOval } from './variants/faq-side-portrait-oval'
import { featureBookmarkCompare } from './variants/feature-bookmark-compare'
import { featureDarkAsymgrid } from './variants/feature-dark-asymgrid'
import { featureDualMosaic } from './variants/feature-dual-mosaic'
import { heroKanjiBead } from './variants/hero-kanji-bead'
import { heroTypoFrame } from './variants/hero-typo-frame'
import { ingredientBadgeTable } from './variants/ingredient-badge-table'
import { ingredientDotNavMint } from './variants/ingredient-dot-nav-mint'
import { ingredientFloatOverlay } from './variants/ingredient-float-overlay'
import { lineupBentoCompare } from './variants/lineup-bento-compare'
import { lineupBentoGradient } from './variants/lineup-bento-gradient'
import { lineupDarkGauge } from './variants/lineup-dark-gauge'
import { lineupGradientGallery } from './variants/lineup-gradient-gallery'
import { lineupHashtagDuo } from './variants/lineup-hashtag-duo'
import { lineupHeroTierBar } from './variants/lineup-hero-tier-bar'
import { lineupPersonaOverlap } from './variants/lineup-persona-overlap'
import { lineupSpikeCol } from './variants/lineup-spike-col'
import { lineupTieredFloat } from './variants/lineup-tiered-float'
import { pointDualBottleBloom } from './variants/point-dual-bottle-bloom'
import { pointSpecSandwich } from './variants/point-spec-sandwich'
import { promoBokehCard } from './variants/promo-bokeh-card'
import { reasonAltRows } from './variants/reason-alt-rows'
import { reasonBubbleBadgeStack } from './variants/reason-bubble-badge-stack'
import { reasonDotConnector } from './variants/reason-dot-connector'
import { reasonNumberedThumbStack } from './variants/reason-numbered-thumb-stack'
import { reasonStaircardOverlap } from './variants/reason-staircard-overlap'
import { recommendCrossTypo } from './variants/recommend-cross-typo'
import { reviewDarkHighlightStack } from './variants/review-dark-highlight-stack'
import { reviewStarOverlap } from './variants/review-star-overlap'
import { shippingHeroRibbonTrio } from './variants/shipping-hero-ribbon-trio'
import { shippingNoticeTwinTruck } from './variants/shipping-notice-twin-truck'
import { statsBottleStatRail } from './variants/stats-bottle-stat-rail'
import { statsSatisfactionDash } from './variants/stats-satisfaction-dash'
import { storyDoubtStack } from './variants/story-doubt-stack'
import { calloutDualCircle } from './variants/callout-dual-circle'
import { calloutPillCascade } from './variants/callout-pill-cascade'
import { certBadgeTriptych } from './variants/cert-badge-triptych'
import { certDermaTrio } from './variants/cert-derma-trio'
import { certPhotoBadgeStrip } from './variants/cert-photo-badge-strip'
import { certPillGrid } from './variants/cert-pill-grid'
import { checklistColorbarDiag } from './variants/checklist-colorbar-diag'
import { checkpointFullbleedNumlist } from './variants/checkpoint-fullbleed-numlist'
import { csSupportTricard } from './variants/cs-support-tricard'
import { detailPaletteCard } from './variants/detail-palette-card'
import { detailSpecIconBar } from './variants/detail-spec-icon-bar'
import { discountShockBadge } from './variants/discount-shock-badge'
import { featureHashtagChipZigzag } from './variants/feature-hashtag-chip-zigzag'
import { featureMintOvalGrid } from './variants/feature-mint-oval-grid'
import { featureOffsetGallery } from './variants/feature-offset-gallery'
import { featurePivotArcShot } from './variants/feature-pivot-arc-shot'
import { featurePointWatermark } from './variants/feature-point-watermark'
import { featureQuadImgcapGrid } from './variants/feature-quad-imgcap-grid'
import { featureQuotePillStack } from './variants/feature-quote-pill-stack'
import { featureSkyBadgeOverlap } from './variants/feature-sky-badge-overlap'
import { featureSkyIconQuad } from './variants/feature-sky-icon-quad'
import { featureSplitboxKeyword } from './variants/feature-splitbox-keyword'
import { featureStepQuoteReveal } from './variants/feature-step-quote-reveal'
import { heroBadgeKeypoint } from './variants/hero-badge-keypoint'
import { heroBleedRibbon } from './variants/hero-bleed-ribbon'
import { heroCatalogSlide } from './variants/hero-catalog-slide'
import { heroFloatcardHand } from './variants/hero-floatcard-hand'
import { heroMarkerPanel } from './variants/hero-marker-panel'
import { heroOliveChecklist } from './variants/hero-olive-checklist'
import { heroPillSerifZones } from './variants/hero-pill-serif-zones'
import { heroRailRight } from './variants/hero-rail-right'
import { heroSandwichStack } from './variants/hero-sandwich-stack'
import { heroWaveIcons } from './variants/hero-wave-icons'
import { ingredientBadgeArc } from './variants/ingredient-badge-arc'
import { ingredientOrbitBadgeTrio } from './variants/ingredient-orbit-badge-trio'
import { ingredientSerifRatio } from './variants/ingredient-serif-ratio'
import { lineupArrowStack } from './variants/lineup-arrow-stack'
import { lineupSwatchZigzag } from './variants/lineup-swatch-zigzag'
import { pointFullbgOvalStats } from './variants/point-fullbg-oval-stats'
import { pointPillFlow } from './variants/point-pill-flow'
import { pointStaggerPill } from './variants/point-stagger-pill'
import { reasonBubbleStack } from './variants/reason-bubble-stack'
import { reasonQuadCircleGallery } from './variants/reason-quad-circle-gallery'
import { recommendCircleZigzag } from './variants/recommend-circle-zigzag'
import { recommendGridLabel } from './variants/recommend-grid-label'
import { reviewAltcircleGrid } from './variants/review-altcircle-grid'
import { reviewFillbarBeforeAfter } from './variants/review-fillbar-before-after'
import { reviewSpeechPairGrid } from './variants/review-speech-pair-grid'
import { shippingBadgeDualStack } from './variants/shipping-badge-dual-stack'
import { specGridCreamTable } from './variants/spec-grid-cream-table'
import { statsScoreCascade } from './variants/stats-score-cascade'
import { usageDayTimeline } from './variants/usage-day-timeline'
import { shippingNumeralSchedule } from './variants/shipping-numeral-schedule'

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
  pointDiscountPriceReveal,
  pointPromoAsymcard,
  featureDarkProductGrid,
  pointFullbleedCaption,
  pointAwardCredential,
  featureDarkFloatCutout,
  pointEditorialMarquee,
  pointHeritageSplit,
  pointIngredientHero,
  pointBrandCollabEditorial,
  promoEventSpotlight,
  promoStoryPriceReveal,
  pointFullbleedBookend,
  pointTimingBanner,
  promoScatterBanner,
  pointNumberedHeroCard,
  pointNumberedImageCard,
  pointStepTimelineBleed,
  pointRadarWeb,
  featureEventPoster,
  pointIngredientOverlay,
  featureDarkTabMosaic,
  statsSatisfactionBars,
  pointProductAnnotation,
  featureImageRowList,
  pointUrgencyTapeCross,
  pointListImageBleed,
  statsHeroAnchorCardGrid,
  featureProductFloatIconGrid,
  pointProductStatsSplit,
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
  packageEventPriceRows,
  packageImageRowsStrikePrice,
  packageSplitImagePriceRows,
  packageOptionRowsPanel,
  packageNumberedSplitRows,
  productTabFilterRows,
  packageDiscountBadgeGrid,
  packageOptionGrid,
  packageLineupBadgeRows,
  productPriceBreakdownCard,
  productDiscountBadgeRows,
  packageNumberedOptionSelector,
  packageNumberedBandRows,
  packageSplitIconCards,
  packageGradientBundleDiscount,
  packageBundleGiftRows,
  productLineupDarkCards,
  packageEventProductRows,
  productHeroDiscountGrid,
  eventCountdownProductGrid,
  packageDiscountImageRows,
  productHeroGiftPrice,
  packageHeroPriceTable,
  packageDarkComponentGrid,
  reviewPhotoBubbleStaggered,
  reviewDividerImageRows,
  recommendPersonaListAnnotated,
  reviewEfficacyBarChart,
  reviewAggregateScoreCards,
  reviewImageStoryStack,
  reviewSatisfactionStats,
  reviewDividerImageRight,
  reviewImageRows,
  reviewSatisfactionPillBars,
  reviewThumbnailRows,
  reviewPhotoBgDashedCards,
  reviewHeroAvatarList,
  reviewStatHeaderCard,
  reviewInstagramDmMockup,
  reviewIconAlternatingRows,
  reviewAggregateScoreStack,
  reviewNumberedThumbnailRows,
  faqCircleBadge,
  faqStaggerOffset,
  faqLabelSpecTable,
  faqEditorialSplit,
  faqPillCardSplit,
  faqSatisfactionBar,
  faqDualCircle,
  specTableLabelValue,
  awardWarrantyPledge,
  awardRank1ListingCard,
  awardLaurelStatRows,
  awardNo1EmblemBanner,
  awardTrophyDeclare,
  awardMilestoneHero,
  awardNo1Emblem,
  awardNo1EmblemStreak,
  awardNo1EmblemHero,
  awardNo1EmblemBadges,
  awardTrophyStat,
  awardTrophyPoster,
  awardGovSealHero,
  awardRankingPodiumSale,
  awardLaurelEmblemGrid,
  awardTrophyBadgeGrid,
  awardNo1EmblemRosette,
  // Sprint 8 흡수 변형
  calloutCouponChannel,
  calloutPainpointCards,
  certListBadges,
  certSpotlightZoom,
  closingQuotePhoto,
  compareAsymPanels,
  compareBarYears,
  pointMetricBadge,
  recommendHashtagCard,
  recommendOvalChecklist,
  shippingDeadlineClock,
  specMeasureTable,
  specSilhouetteTable,
  specSizeDiagram,
  statsGaugeBars,
  // Sprint 8 wave-2
  bannerKineticDuoscale,
  calloutChatDarkProblem,
  calloutChatZigzag,
  calloutDarkStatGrid,
  calloutKakaofriendRadial,
  certDocZoom,
  certFanStack,
  certLaurelTriple,
  certMagnifyBanner,
  certOrbitRing,
  checklistBrownPhotoRow,
  compareAsympanelBefaft,
  compareSpecTrio,
  compareTriAxis,
  compareTripleBadge,
  compareVsCardSplit,
  detailAnatomyCallout,
  detailBadgeCallout,
  detailInfotagOverlay,
  detailOverlapBookend,
  detailPinLegend,
  detailSectionExplode,
  detailSerifAltrow,
  detailSerifHeroZigzag,
  eventCircleWarranty,
  eventDarkbgPricedrop,
  eventKakaoCouponSplit,
  eventOneplusStack,
  eventOverlapRefund,
  eventOverlayPricebar,
  faqBubbleTail,
  faqChatBubble,
  featureAltCardStack,
  featureArrowTrio,
  featureChecklistStatBanner,
  featureCheckpointRail,
  featureDarkPillStack,
  featureHeroPillZigzag,
  featureHighlightCaption,
  featureHoneycombBadge,
  featureHotspotCallout,
  featureHotspotSplit,
  featurePillGrid,
  featureStackImgcap,
  featureStepIconbox,
  featureStepOverlayPanel,
  galleryHeroHashtagGrid,
  heroBadgeGrid,
  heroBadgeStagger,
  heroBubbleGrid,
  heroBubbleStack,
  heroCropmarkOverlay,
  heroDotDuoweight,
  heroFloatSplit,
  heroGlintBrand,
  heroHandscriptIconTrio,
  heroNumberedTrio,
  heroOvalBadge,
  heroOvalMascot,
  heroPillWatermark,
  heroRibbonPanel,
  heroSerifIconPanel,
  heroSplitOrbit,
  heroStampGrid,
  heroTintOvalDrop,
  heroVerticalBadge,
  heroWeightSlash,
  ingredientBubbleFloat,
  ingredientCardBarStack,
  ingredientEllipseBarStack,
  ingredientOnionStack,
  ingredientPhGaugeBanner,
  ingredientPhScale,
  ingredientPillIconList,
  ingredientRadialDotMap,
  ingredientStepPanelSplit,
  lineupDualPriceSeal,
  lineupWordmarkSplit,
  pointBadgeSectionTrio,
  pointBadgeWordSplit,
  pointBubbleChat,
  pointBubbleZigzag,
  pointCardSplitCheck,
  pointCircleBadgePanel,
  pointCircleGridReveal,
  pointDarkGridResolve,
  pointDualCircleBadge,
  pointGlassGrid,
  pointHighlightStack,
  pointNumeralStack,
  pointPillCascadeReview,
  pointRuledChapterOverlap,
  pointSerifLayerCallout,
  pointTripleBadge,
  pointTripleScroll,
  promoLetterBadgeOval,
  recommendSkyOval,
  reviewBubbleGrid,
  reviewBubbleScore,
  reviewCardSummarybar,
  reviewDonutPillow,
  reviewKpiBubbleTrio,
  reviewLaurelBubble,
  reviewStatOverlay,
  shippingClockUrgency,
  shippingColdchainSteps,
  shippingPolyDeadlineSplit,
  shippingRoundcardCs,
  specBatteryProgress,
  specDimOverlay,
  specFootMeasureGrid,
  specHeightGauge,
  specSilhouetteBadge,
  statsDecibelOverlay,
  storyCauseFlow,
  storySerifRuled,
  usageFanoutGrid,
  usageNumberedSplit,
  usageSceneAltcard,
  ingredientBadgeTileGrid,
  ingredientCircleBadgeZigzag,
  ingredientOvalStack,
  ingredientPointSerifList,
  specDimBlueprint,
  // Sprint 10
  awardSalesFloatBadges,
  awardSerifGoldDecl,
  awardStageBurst,
  awardStarRank,
  awardTrophyFlankedStat,
  awardTrophyOrbFlanked,
  bannerCategoryCounter,
  bannerGrandMosaic,
  certBadgeSplit,
  certPointBadgeStack,
  checklistRadialLedger,
  comparePackageGrid,
  csGreenLabelTable,
  csNoticeTypoSplit,
  csScheduleDivider,
  csSloganInfoTable,
  discountBoltSplit,
  eventPolyPriceList,
  eventSaleAsymcollage,
  eventSpotlightType,
  eventStagePillar,
  faqExpertCard,
  faqSidePortraitOval,
  featureBookmarkCompare,
  featureDarkAsymgrid,
  featureDualMosaic,
  heroKanjiBead,
  heroTypoFrame,
  ingredientBadgeTable,
  ingredientDotNavMint,
  ingredientFloatOverlay,
  lineupBentoCompare,
  lineupBentoGradient,
  lineupDarkGauge,
  lineupGradientGallery,
  lineupHashtagDuo,
  lineupHeroTierBar,
  lineupPersonaOverlap,
  lineupSpikeCol,
  lineupTieredFloat,
  pointDualBottleBloom,
  pointSpecSandwich,
  promoBokehCard,
  reasonAltRows,
  reasonBubbleBadgeStack,
  reasonDotConnector,
  reasonNumberedThumbStack,
  reasonStaircardOverlap,
  recommendCrossTypo,
  reviewDarkHighlightStack,
  reviewStarOverlap,
  shippingHeroRibbonTrio,
  shippingNoticeTwinTruck,
  statsBottleStatRail,
  statsSatisfactionDash,
  storyDoubtStack,
  calloutDualCircle,
  calloutPillCascade,
  certBadgeTriptych,
  certDermaTrio,
  certPhotoBadgeStrip,
  certPillGrid,
  checklistColorbarDiag,
  checkpointFullbleedNumlist,
  csSupportTricard,
  detailPaletteCard,
  detailSpecIconBar,
  discountShockBadge,
  featureHashtagChipZigzag,
  featureMintOvalGrid,
  featureOffsetGallery,
  featurePivotArcShot,
  featurePointWatermark,
  featureQuadImgcapGrid,
  featureQuotePillStack,
  featureSkyBadgeOverlap,
  featureSkyIconQuad,
  featureSplitboxKeyword,
  featureStepQuoteReveal,
  heroBadgeKeypoint,
  heroBleedRibbon,
  heroCatalogSlide,
  heroFloatcardHand,
  heroMarkerPanel,
  heroOliveChecklist,
  heroPillSerifZones,
  heroRailRight,
  heroSandwichStack,
  heroWaveIcons,
  ingredientBadgeArc,
  ingredientOrbitBadgeTrio,
  ingredientSerifRatio,
  lineupArrowStack,
  lineupSwatchZigzag,
  pointFullbgOvalStats,
  pointPillFlow,
  pointStaggerPill,
  reasonBubbleStack,
  reasonQuadCircleGallery,
  recommendCircleZigzag,
  recommendGridLabel,
  reviewAltcircleGrid,
  reviewFillbarBeforeAfter,
  reviewSpeechPairGrid,
  shippingBadgeDualStack,
  specGridCreamTable,
  statsScoreCascade,
  usageDayTimeline,
  shippingNumeralSchedule,
])

export { renderPage, pageSpecSchema } from './composer'
export type { RenderResult } from './composer'
export { getVariant, listVariants, catalog } from './registry'
export { deriveTokens, TOKEN_PRESETS, warmPlayful, modernEditorial, cobaltPremium, sandLuxury, presetForCategory } from './tokens'
export type { PresetKey } from './tokens'
export type { BlockArchetype, BlockVariant, PageSpec, PageBlock, Tokens, RenderCtx } from './types'
