/**
 * Blocks Composer (AI) — brief + 이미지 → 조합형 블록 PageSpec.
 *
 * 역할: 등록된 블록 변형 카탈로그에서 제품/카테고리/스타일에 맞는 12~18개를 골라
 *       순서·카피·이미지·토큰을 채운 PageSpec을 생성한다. (레이아웃/CSS는 변형이 소유)
 *
 * 검증: AI 출력(composerOutputSchema) → assemblePageSpec → renderPage(블록별 슬롯 zod 검증).
 *       실패 시 오류를 피드백해 1회 재시도. 토큰은 AI가 손으로 쓰지 않고 presetKey+브랜드색에서 도출.
 *
 * 정직성: brief에 없는 인증/후기/수치를 지어내지 않는다.
 */
import { z } from 'zod'
import { anthropicClient, parseJsonResponse, saveJson, timer, MODELS, extractText } from './utils'
import type { AgentResult, ProjectBrief } from './types'
import { catalog, deriveTokens, renderPage, type PageSpec } from './templates/blocks'
import { getVariant, containSlotKeys, mediaSlotKeys } from './templates/blocks/registry'
import { isOffPalette } from './templates/blocks/variant-meta'
import { reportAdd } from '@/lib/run-report'
import { ICON_NAMES } from './templates/blocks/shared'

// ── AI 출력 계약 ────────────────────────────────────────────────
const composerOutputSchema = z.object({
  meta: z.object({
    product: z.string().min(1),
    category: z.string().min(1),
    styleDirection: z.string().optional(),
  }),
  presetKey: z.enum(['warm-playful', 'modern-editorial', 'cobalt-premium', 'sand-luxury']),
  blocks: z
    .array(z.object({ variantId: z.string().min(1), data: z.unknown() }))
    .min(10)
    .max(20)
    .refine((b) => Boolean(b[0]?.variantId?.startsWith('hero-') || b[0]?.variantId?.startsWith('intro-')), { message: '첫 블록은 hero/intro 계열 변형이어야 함' })
    .refine((b) => Boolean(b[b.length - 1]?.variantId?.startsWith('closing-')), { message: '마지막 블록은 closing 변형이어야 함' }),
})
export type ComposerOutput = z.infer<typeof composerOutputSchema>

/**
 * AI 출력 + 브랜드색 → 검증 가능한 PageSpec (토큰은 여기서 결정론적으로 도출). 순수 함수(테스트 가능).
 * presetOverride가 있으면 AI가 고른 presetKey 대신 강제(카테고리별 프리미엄 프리셋 노출용).
 * 브랜드색이 있으면 배경도 옅게 틴트해 업체별로 분위기가 달라지게 한다.
 */
export function assemblePageSpec(
  out: ComposerOutput,
  brandColors?: string[],
  presetOverride?: string,
  styleGuide?: import('./templates/blocks/tokens').StyleGuideTokenInput,
): PageSpec {
  const presetKey = presetOverride ?? out.presetKey
  const hasBrand = (brandColors ?? []).length > 0
  const tokens = deriveTokens(presetKey, brandColors, { tintBackground: hasBrand, styleGuide })
  return { meta: { ...out.meta }, tokens, blocks: out.blocks }
}

export interface BlocksComposerInput {
  brief: ProjectBrief
  images?: { hero?: string; lifestyle?: string[]; cutout?: string; section?: string[] }
  /** 이미지 URL → 컷 설명(시맨틱 라벨). LLM이 섹션-이미지 의미 매칭을 하려면 필수. */
  imageNotes?: Record<string, string>
  brandColors?: string[]
  /** 카테고리에서 도출한 강제 프리셋(있으면 AI presetKey 대체). */
  preferredPreset?: string
  outputDir: string
  /** 다른 페이지에서 이미 사용된 변형 — 이번 페이지에서 사용 금지(다사 차별화). closing-* 는 넣지 말 것 */
  avoidVariants?: string[]
  /** 업로드 원본 누끼 URL 전체 — 연출형 슬롯 오배치 방지 가드(placement guard)용 */
  cutoutUrls?: string[]
  /** 페이지 플래너 청사진 — 있으면 블록·순서·이미지 배정의 구속 계약 (재설계 A→B단계) */
  blueprint?: import('./page-planner').PageBlueprint
  /** 브랜드 로고 URL — 배치 가드가 hero/closing/cs 외 오배치를 제거한다 */
  logoUrls?: string[]
  /** 아트디렉터 스타일가이드 — 팔레트·폰트를 토큰에 반영 (대비·화이트리스트 가드, Sprint 4-D) */
  styleGuide?: import('./templates/blocks/tokens').StyleGuideTokenInput
  /** 승인 스크립트 전문 — 근거 코퍼스(수치·전화 가드)의 완결 소스. copyBrief 요약만으로는
   *  스크립트가 담은 실데이터(고객센터 번호 등)가 누락되는 실사례가 있었다 */
  script?: { tone?: string; sections: Array<Record<string, unknown>> }
  /** 시각 감사 폐루프의 반려 노트 — 렌더 결함 사유를 첫 호출부터 반영해 재조립한다 */
  auditNote?: string
}

export interface BlocksComposerResult {
  spec: PageSpec
  html: string
  usedVariants: string[]
}

// ── 변형 데이터 계약 (AI가 각 블록 슬롯을 정확히 채우게 하는 레퍼런스) ──
// em = 인라인 강조 <span class="em">…</span> 허용, br = <br> 허용, (url) = 제공된 이미지 URL
const DATA_CONTRACTS = `
hero-centered { badge?, title(em), sub?(em), heroImage?(url), bubble?, caption?, brand }
hero-editorial { kicker?, title(em,br), lead?, heroImage?(url), figNo? }
hero-points { brand, sub?(em), title(em), heroImage?(url), points:[{ icon, label, desc(em) }] (2~4) }   // icon ∈ wheat|drop|clock|badge|snow|check|fryer|oven|star|heart|gift|truck|shield|leaf|trophy|thumb|fire|person|search|pin|box|calendar|card|won|bulb|gear|camera|phone|bolt|thermometer|target|store|doc|sprout|bell
hero-arch { brand, title(em), sub?(em), en?, heroImage?(url), points:[{ icon, label, desc(em) }] (2~4) }   // icon ∈ wheat|drop|clock|badge|snow|check|fryer|oven|star|heart|gift|truck|shield|leaf|trophy|thumb|fire|person|search|pin|box|calendar|card|won|bulb|gear|camera|phone|bolt|thermometer|target|store|doc|sprout|bell
recommend-dark { floatImage?(url), title(em), en?, image?(url), ribbon? }
checklist-checks { title(em), items:[{ text(em), star?:bool }] (2~6) }
strip-band { text }
checkpoint-rows { title(em), pill?, items:[{ icon, text(em) }] (3~6), photo?(url) }   // icon ∈ wheat|drop|clock|badge|snow|check|fryer|oven|star|heart|gift|truck|shield|leaf|trophy|thumb|fire|person|search|pin|box|calendar|card|won|bulb|gear|camera|phone|bolt|thermometer|target|store|doc|sprout|bell
checkpoint-grid { kicker?, title, items:[{ no, title, desc }] (2~6) }
point-bubble { label?, title(em), image?(url), bubbleTop?, bubbleBottom?, lead?(em,br) }
feature-fullbleed { image?(url), kicker?, title }
feature-seal { image?(url), sealMain?, sealSub? }
reason-question { question(em,br) }
equation-visual { a:{ image?(url), label }, b:{ image?(url), label }, c:{ image?(url), label }, quote?(em) }   // label은 a/b/c 모두 필수
callout-banner { big(em,br), small? }
statement-serif { quote(em,br), by? }
story-pair { label?, title(em), images:[url] (1~3), lead?(em,br) }
cert-rosette { title(em), desc?(em,br), rosetteLine1?, rosetteLine2?, rosetteSub?, image?(url) }
compare-cooking { label?, title(em), left:{ tag?, icon, name, steps:[{ text(em) }] (1~4) }, right:{ tag?, icon, name, steps:[{ text(em) }] (1~4) }, note?(em) }   // icon ∈ wheat|drop|clock|badge|snow|check|fryer|oven|star|heart|gift|truck|shield|leaf|trophy|thumb|fire|person|search|pin|box|calendar|card|won|bulb|gear|camera|phone|bolt|thermometer|target|store|doc|sprout|bell
spec-table { kicker?, title, rows:[{ k, v(em) }] (2~10) }
closing-mood { bgImage?(url), title(em), sub?(em) }
closing-light { kicker?, title(em), sub?, cta? }
review-bubbles { title(em), subtitle?, reviews:[{ text(em), author? }] (2~6), stat?(em,br) }   // 후기는 brief 근거 있을 때만, 지어내지 말 것
review-cards { kicker?, title(em), summary?:{ score, count?, stars?:1~5 }, reviews:[{ author, text(em), rating?:1~5, tag? }] (2~6) }   // 후기/평점은 brief 근거 있을 때만
faq-chat { title?, subtitle?, items:[{ q, a(em,br) }] (2~8) }
shipping-info { label?, image?(url), rows:[{ title, desc(em,br) }] (1~5), schedule?:[{ when, detail(em) }] (max4), note?(em,br) }
stats-highlight { image?(url), label?, headline(em), items:[{ icon, label, value(em) }] (2~4) }   // icon ∈ wheat|drop|clock|badge|snow|check|fryer|oven|star|heart|gift|truck|shield|leaf|trophy|thumb|fire|person|search|pin|box|calendar|card|won|bulb|gear|camera|phone|bolt|thermometer|target|store|doc|sprout|bell; 수치는 brief 근거만
gallery-options { eyebrow?, items:[{ label, caption?, image?(url) }] (1~6) }
banner-event { eyebrow?, title(em,br), subtitle?, bgImage?(url) }
feature-editorial { title, subtitle?, items:[{ heading(em), desc?(em,br), image?(url) }] (2~4) }   // 특장점 에디토리얼(대형 숫자+풀폭 밴드). cobalt-premium과 잘 맞음
feature-cards { title, subtitle?, image?(url), cards:[{ heading(em), desc?(em,br) }] (2~4), closer?(em,br) }   // 특장점 그라데이션 라운드 카드(밝은 톤). cobalt-premium
feature-dark { intro?, title, items:[{ heading(em), desc?(em,br), image?(url) }] (2~4), closer?(em,br) }   // 특장점 블랙 에디토리얼(다크 럭셔리). cobalt-premium
ingredient-accent { subtitle?, title, image?(url), items:[{ label, desc?(em,br), image?(url) }] (2~5), closer?(em,br) }   // 원료 소개(accent 컬러 풀배경+원형이미지+대형숫자)
ingredient-grid { eyebrow?, title, subtitle?, items:[{ label, desc?(em,br), image?(url) }] (2~6), closer?(em,br) }   // 원료 소개(다크 2×2 카드 그리드)
ingredient-spotlight { eyebrow?, title, subtitle?, image?(url), items:[{ label, desc?(em,br) }] (2~5), closer?(em,br) }   // 원료 소개(라이트 중앙정렬 타원 히어로+하이라이트 라벨 리스트). 다크 블록과 대비되는 라이트 룩
compare-beforeafter { title, subtitle?, beforeLabel?, afterLabel?, beforeImage?(url), afterImage?(url), rows:[{ before, after(em) }] (2~5), closer?(em,br) }   // 차별화 비교(BEFORE/AFTER 2단)
review-list { title, subtitle?, reviews:[{ text(em,br), author?, rating?:1~5, image?(url) }] (2~5), closer?(em,br) }   // 고객리뷰(아바타+별점 리스트+인정 카운트). 후기는 brief 근거만
usage-steps { title?, subtitle?, image?(url), steps:[{ icon, text(em,br), label? }] (2~5), closer?(em,br) }   // 사용법(HOW TO USE + 아이콘 STEP 리스트). icon ∈ 위 아이콘셋, label 기본 "STEP 0N"
usage-flow { title?, subtitle?, steps:[{ image?(url), text(em,br) }] (2~5), closer?(em,br) }   // 사용법(라이트 세로 플로우 — 타원 번호배지+풀폭 이미지+중앙 설명). 이미지 중심 단계
usage-dark { title?, subtitle?, steps:[{ image?(url), label?, text(em,br), icon? }] (2~5), closer?(em,br) }   // 사용법(다크 — 상단 리본+좌썸네일·우 STEP/설명·아이콘). 다크 블록. icon ∈ 위 아이콘셋, label 기본 "STEP 0N"
package-list { title?, subtitle?, packages:[{ name(em), desc?, image?(url), priceOriginal?, price?, best?:bool }] (2~4) }   // 상품 구성/패키지(가격). 가격·구성은 brief 근거만, 지어내지 말 것
package-cards { title?, subtitle?, packages:[{ name(em), desc?, image?(url), priceOriginal?, price?, best?:bool }] (2~4) }   // 상품 구성(accent 풀배경+흰 카드 세로 스택+BEST). 컬러블록. 가격·구성은 brief 근거만
package-dark { title?, subtitle?, image?(url), packages:[{ name(em), desc?, priceOriginal?, price? }] (2~4) }   // 상품 구성(다크+히어로+번호 가격카드). 다크 블록. 가격·구성은 brief 근거만
cert-frame { title?, subtitle?, certs:[{ label, image?(url), caption? }] (1~4) }   // 인증/시험성적서(액자+씰). 인증/시험 내용은 brief 근거만, 지어내지 말 것
gallery-grid { eyebrow?, title, subtitle?, hero?(url), shots:[{ image?(url), label, desc? }] (2~6) }   // 갤러리(12) 사진 중심 룩북 — 풀폭 히어로+섀도우 액자 그리드+인덱스 번호
event-promo { strip?, title, subtitle?(em,br), benefit, image?(url), sectionLabel?, points:[{ text }] (2~5) }   // 이벤트(13) 리뷰·쿠폰 다크 프로모 — marquee strip+선물 이미지+대형 제목+혜택 pill+체크 포인트 카드. 혜택/쿠폰은 brief 근거만
discount-deal { saleLabel?, eyebrow?, headline(em), discountRate, urgencyBadge?, subQuestion?, ctaText, originalPrice?, salePrice?, period?, bgImage?(url), burstImage?(url) }   // 할인(15) 임팩트형 — 밝은 배경+BIG SALE 빨강 헤드라인+블랙 pill 태그+빨강 버스트+CTA 바. 가격/할인율은 brief 근거만
detail-showcase { eyebrow?, title, productImage?(url), specs:[{ label, value }] (2~6), quote?(em,br), headline?(em,br), scenes:[{ image?(url), caption }] (2) }   // 제품설명(17) 에디토리얼 서술형 — 대제목→풀폭 이미지→스펙 미니표→인용 카피→헤드라인→2열 씬
detail-points { points:[{ image?(url), label?, title(em,br), desc(em,br) }] (2~4) }   // 제품설명(17) 다크 포인트형 — POINT별 풀폭 사진 위 라벨+헤드라인 오버레이 + 흰 설명밴드. 다크 블록. label 기본 "POINT N"
story-brand { index?, slogan?, year?, label, titlePre?, titleBold, titlePost?, paragraphs:[str] (1~4), image?(url) }   // 브랜드스토리(09) 풀블리드 — 메타바+에디토리얼 대형 혼합굵기 제목+본문 카피
banner-seasonal { eyebrow, titleLine1, titleLine2?, period?, image?(url), decoImage?(url), bgFrom?, bgTo? }   // 시즈널배너(18) 봄·여름·가을·겨울 범용 — 양쪽 라인 눈썹+Cafe24 Dangdanghae 대형 2줄 타이틀+기간 pill
intro-cover { brand, sub?, title(em), heroImage?(url), points:[{ icon, label, desc }] (2~3) }   // 인트로(01) 2존 커버 — 그라디언트 헤더+풀폭 이미지존+하단 원형아이콘 포인트 패널 // icon ∈ wheat|drop|clock|badge|snow|check|fryer|oven|star|heart|gift|truck|shield|leaf|trophy|thumb|fire|person|search|pin|box|calendar|card|won|bulb|gear|camera|phone|bolt|thermometer|target|store|doc|sprout|bell
stats-figures { eyebrow?, headline(em), symbolImage?(url), stars?(0~5), rows:[{ label, value(em), sub?(em) }] (1~4) }   // 수치강조(02) 대형 숫자 임팩트 — 다크 배경+별+Cafe24 ClassicType 황금 헤드라인+황금뱃지 수치행. 수치는 brief 근거만
stats-zigzag { eyebrow?, headline(em), symbolImage?(url), rows:[{ label, value(em), image?(url) }] (2~4) }   // 수치강조(02) 라이트 지그재그 — 상단 accent 밴드(숫자 알약+심볼)+하단 텍스트/이미지 교차 수치행. 수치는 brief 근거만
faq-list { title?, subtitle?, items:[{ q, a(em,br) }] (2~8) }   // FAQ(10) 정돈된 카드 리스트(Q 라벤더헤더+A 흰행). faq-chat 말풍선형과 차별화
hero-photo { brand, productName, story(em,br), eyebrow?, heroImage?(url), sectionLabel? }   // 사진인트로(11) 풀블리드 제품사진+오버레이 제품명+수직구분선+하단 컬러패널 스토리. 사진이 주인공
shipping-notice { noticeLabel?, title?, subtitle?, rows:[{ text(em,br), accent?:bool, sub? }] (1~6), customerLabel?, phone?, hours?:[str](max4), hoursNote?, contactIcon?, qaTitle?, qaDesc?, channelLabel?, channelDesc? }   // 배송(16) NOTICE 라벨+체크 카드+고객센터(전화/시간/Q&A/카카오) 카드. shipping-info와 차별화. icon ∈ ...(contactIcon, 위 아이콘셋)
hero-split-list { brand, subtitle?(em,br), title(em,br), productImage?(url), items(2~4)[label(em,br), desc?(em,br)] }   // 좌정렬 브랜드+대형 제품명 헤더, 기울어진 제품 이미지(좌), 원형 번호 뱃지 목록(우) — accent 풀배경 히어로
hero-icon-rows { brand, sub?(br), title(em,br), heroImage?(url), rows(2~5)[icon, label(em), desc(em,br)] }   // 좌정렬 브랜드+대제목 히어로 + 풀이미지 + 아이콘 행 리스트(헤어라인 구분선)
hero-dark-stack { subtitle?, title(em,br), heroImage?(url), points(2~4)[label?, desc(em,br)] }   // 다크 배경 원형 이미지 히어로 + 제품명 헤드라인 + 테두리 포인트 박스 수직 스택
hero-overlay-bubble { brand, title(em,br), heroImage?(url), bubble, sceneImage?(url), points(2~4)[{text(em,br)}] }   // accent 풀배경+브랜드pill+상품이미지 위 대제목 오버레이 + 말풍선 서브카피 + 씬이미지 + 번호 텍스트 행 목록
stats-glass-cards { eyebrow?, headline(em,br), heroImage?(url), starCount?, cards(2~4)[label, value(em,br)] }   // 단색 브랜드 배경 + 별점 뱃지 + 대형 숫자 헤드라인 + 히어로 이미지 + 반투명 글래스 카드 세로 스택
stats-columns { eyebrow?, headline(em,br), productImage?(url), columns(2~4)[trophyImage?(url), label, value(em,br)] }   // 어두운 배경 월계관 대형 숫자 + 와이드 제품 이미지 + 하단 3컬럼 트로피 수치 강조
stats-emoji-stack { pill?, headline(em,br), items(2~4)[emoji?(url), label, value(em,br)] }   // 다크 그라디언트 배경 + pill 라벨 + 대형 숫자 헤드라인 + 3D 이모지 아이콘 센터 스택 수치 강조
feature-arc-timeline { title(em,br), subtitle?, image?(url), nodes(2~4)[heading(em,br), desc?(em,br)], closer?(em,br) }   // 특장점 아크 타임라인: 헤더+좌측 제품이미지+원형 넘버 노드(SVG 곡선 연결)+하단 accent 배너
feature-split-panels { eyebrow?, title(em,br), rows(2~4)[subtitle(em,br), desc?(em,br), image?(url)], closer?(em,br) }   // accent 배경 텍스트 패널과 이미지가 50/50 지그재그 교대 배치되는 특장점 섹션
feature-zigzag-circle { subtitle?, title(em,br), rows(2~4)[image?(url), heading(em,br), desc?(em,br)], closer?(em,br) }   // 특장점 지그재그 원형이미지 — 라운드 카드 내 원형이미지·텍스트를 행마다 좌우 교대로 쌓는 3행 지그재그 레이아웃
ingredient-stagger { eyebrow?, title(em,br), subtitle?, items(2~4)[label(em,br), name(em,br), icon?], closer?(em,br) }   // 라이트 배경 4카드 지그재그 스태거 + NO.숫자 세로 태그 + 원형 아이콘 원료 순서 소개
ingredient-zigzag { eyebrow?, title(em,br), subtitle?, items(2~4)[image?(url), label(em,br), desc?(em,br)], closer?(em,br) }   // 원료 소개(지그재그): 라이트 배경 + 섹션 헤더 + 원료 2~4쌍 이미지↔텍스트 좌/우 교대 배치 + 마무리 문구
ingredient-pill-list { eyebrow?, title(em,br), subtitle?, items(2~4)[image?(url), label(em), desc?(em,br)], closer?(em,br) }   // 필/캡슐형 원료 행 카드: 라이트 배경+중앙헤더+pill 테두리 카드(원형이미지+라벨·설명)+하단 accent 그라데이션+클로저
ingredient-hero-rows { subtitle?, title(em,br), heroImage?(url), items(2~6)[label(em,br), desc?(em,br), image?(url)], closer?(em,br) }   // 라이트 그라데이션 배경 + 풀폭 히어로 + 번호뱃지·텍스트·썸네일 행 반복 원료 소개
ingredient-checklist-photo { eyebrow?, title(em,br), subtitle?, items(2~4)[label(em,br), desc?(em,br)], photo?(url), closer?(em,br) }   // 연한 배경+흰 카드 체크리스트(점선 구분)+하단 풀폭 사진+오버레이 캡션 신뢰감 원료 소개
usage-zigzag { title?(em,br), subtitle?, steps(2~4)[image?(url), label?, text(em,br)], closer?(em,br), closerSub?(em,br) }   // HOW TO USE 4단계 지그재그 블롭이미지+STEP라벨 교차 배치 (라이트 배경)
usage-accent-hero { title?(em,br), heroTagline?, heroImage?(url), steps(2~4)[image?(url), label?, title(em,br), desc?(em,br)], closer?(em,br) }   // 강조색 배경+HOW TO USE 히어로+교차 스텝 카드 사용법
usage-number-band { title?, subtitle?, steps(label?(em,br), desc?(em,br))(2~4), closer?(em,br), closerSub?(em,br) }   // 번호 밴드+초대형 배경 숫자 사용법 섹션 (이미지 없음, accent 직사각형 밴드 위에 반투명 대형 숫자 오버랩)
usage-checklist-card { title?, subtitle?(em,br), steps(2~4)[label?, desc(em,br)], closerSmall?, closerLarge?(em,br) }   // 솔리드 accent 풀배경 + 흰 둥근 카드에 원형체크+STEP 라벨+설명 행 목록(점선 구분) + 마무리 클로저 2행
review-alternating-rows { title(em,br), subtitle?, productImage?(url), featured{ label?, body(em,br), highlight?(em,br) }, rows(2~4)[{ body(em,br), highlight?(em,br) }] }   // 아치형 제품 이미지 + 피처드 리뷰 + accent/light 배경 교차 전체폭 리뷰 행 (아바타 없음)
review-image-grid { title(em,br), subtitle?, reviews(2~4)[image?(url), rating?, text(em,br), author?], closer?(em,br) }   // 2×2 체커보드 이미지+리뷰 텍스트 그리드, accent 헤더·마무리
review-chat-bubbles { eyebrow?, subtitle?, title(em,br), heroImage?(url), reviews(2~6)[text(em,br), emoji?, side?], closer?(em,br) }   // KakaoTalk 스타일 좌우 교차 메신저 말풍선 리뷰 — 이모지 아바타 + 대표상품 이미지 + 인정 카운트
review-thumbnail-cards { eyebrow?, quote?, title(em,br), reviews(2~4)[image?(url), author?, rating?, text(em,br)], closer?(em,br) }   // 다크 배경 + 정사각 제품 썸네일 인라인 리뷰 카드 리스트 (구매 인증 이미지 첨부형)
compare-asymmetric-cta { title(em,br), subtitle?, sharedImage?(url), beforeLabel?, afterLabel?, beforeItems(2~4,em,br), afterItems(2~4,em,br), cta(em,br) }   // 비대칭 BEFORE/AFTER 카드 + 공유 이미지 + 풀폭 다크 CTA 바
compare-stacked-rows { eyebrow?, title(em,br), beforeLabel?, afterLabel?, rows(2~4)[beforeText(em,br), afterText(em,br), image?(url)], closer?(em,br) }   // 3단 풀폭 행 비포/애프터 비교 — 좌=썸네일+BEFORE, 우=AFTER 텍스트, 헤어라인 구분, 하단 다크 클로저
compare-grid-table { title(em,br), subtitle?, beforeLabel?, afterLabel?, beforeImage?(url), afterImage?(url), rows(2~4)[before(em,br), after(em,br)], closer?(em,br) }   // 순수 그리드/표 비교: 카드 없이 구분선만으로 구성, pill 아웃라인 라벨 행 + 이미지 쌍 행 + 텍스트 비교 행(좌=뮤트, 우=accent)
package-hero-list { subtitle?, title?, heroImage?(url), packages(2~4)[name(em,br), desc?, priceOriginal?, price?] }   // 중앙 대제목+풀폭 히어로 이미지, 행별 이미지 없는 패키지명·설명·가격(취소선+accent pill) 텍스트 리스트, 헤어라인 구분
package-band-rows { badge?, title?(em,br), subtitle?, packages(2~4)[name(em,br), desc?, priceOriginal?, price?] }   // OFFER pill 배지 + 중앙 대제목 + 교차 풀폭 틴트 밴드 행(이름/설명/가격), 이미지 없음
story-photo-header { heroImage?(url), stripLabel?, eyebrow?(em,br), titleLine1(em,br), titleLine2?(em,br), paragraphs(em,br)(1~3) }   // 풀블리드 상단 사진 히어로 + 얇은 accent 라벨 띠 + 좌정렬 EN 디스플레이 제목 + 본문
story-dark-editorial { decoText?, image?(url), imageAlt?, title(em,br), paragraphs(em,br)(1~3) }   // 솔리드 다크 배경 + 초대형 EN 장식 텍스트(좌) + 인셋 이미지(우) + KR 헤드라인·본문 우정렬 에디토리얼
story-vertical-repeat { title(em), items:[{ heading(em,br), body?(em), image?(url), imageAlt? }] (2~5) }   // 내용전개 스크롤 서사(다크). accent 강조 대형 헤드라인 + [중앙 소제목·본문 → 풀폭 이미지] 수직 교번 반복
story-rotating-highlight { title, items[{lines, highlightLine:0|1|2, body?, image?, imageAlt?, caption?}] }   // 다크 내용전개: 3줄 소제목 중 1줄 accent 하이라이트 밴드 순환 + 선택 풀폭 이미지·캡션
detail-image-caption-stack { icon?, title, items[]{image?, imageAlt?, heading, bodyLines[]} }   // 다크 배경 원형 아이콘 배지 + 대제목 → [풀폭 이미지 → 좌정렬 소제목+본문] 수직 반복(2~5회)
story-gallery-narrative { brand, tagline, title, introCaption, introBody, items[]{image?,imageAlt?,caption,body?} }   // 라이트 웜그레이 배경 + 헤더바(brand/tagline) + 대형 헤드라인 + 인트로 → [전폭 이미지+캡션+본문] 2~4회 반복
story-labeled-image-stack { eyebrow?, brandName, descA?, descB?, headline, subA?, subB?, items[{chip, image?, imageAlt?}] }   // 라이트 배경 내용전개: 센터 헤더(eyebrow+브랜드명+디바이더+설명쌍+메인헤드라인) → 좌앵커 accent 칩 + 풀폭 이미지 수직반복(2~4회)
story-stacked-image-narrative { eyebrow?, titleAccent, titleDark, lead?, leadSub?, items[]{heading, body?, image?, imageAlt?} }   // 밝은 배경 스택 이미지 서사: 다크 배지 eyebrow + 2색 헤드라인(accent/ink) + [소제목·본문→풀폭이미지] 2~4회 반복
detail-point-scroll-stack { sectionTitle?, items[]{pointNo?, subtitle?, heading, body?, image?, imageCaption?, imageAlt?} }   // POINT 번호 eyebrow + 대형 헤드라인 + 본문 → 풀블리드 이미지 + 캡션 수직 반복 (2~5회), 밝은 배경 detail 서사 전개형
feature-numbered-callout-scroll { sectionTitle?(em), items[]{no, eyebrow?(em), heading(em), body?(em), image?, imageAlt?} }   // 밝은 배경 순번 말풍선 배지(01,02…) + eyebrow + 볼드 헤드라인 + 본문 + 풀폭 이미지 수직 반복(2~5회)
detail-spec-illustration-callout { title, body, image?, imageAlt?, calloutValue, calloutUnit, calloutLabel, chevronColor?, showBottomChevron? }   // 단일 특장점 수치 강조: 밝은 배경 + 위아래 chevron 전환 + 제품 일러스트 + 대형 수치 오버레이 콜아웃(accent-d, 손그림 언더라인 SVG)
detail-numbered-point-stack { label?, items[]{no, heading(em), body?(em), image?, imageAlt?} }   // 내용전개: 밝은배경 + PRODUCT POINT 아치라벨 + 대형순번(01/02…)+밑줄바 + KR헤드라인 + 본문 + 풀폭이미지 수직반복(2~5)
cs-hours-contact { logo?(img), brand(str), hoursTitle(str), hoursDesc(richSafe), hoursItems[]{day,time}(1-6), notices[]?(str,0-3), contacts[]{icon:pin|phone, text}(1-3) }   // CS 운영시간+연락처: 로고슬롯→헤어라인→2컬럼시간표(좌제목+설명/수직룰/우요일-시간rows+bullet공지)→헤어라인→하단연락처rows
cs-contact-banner { eyebrow, title, image?, imageAlt?, intro?, contacts[{label,value}]×1-3, notes[]×0-4 }   // CS 고객문의 안내 투존 배너 (상단 accent 그라디언트 헤더 + 하단 다크 연락처 존)
cs-closure-calendar { eyebrow?, title, datelines[], monthLabel?, weeks[{days[7]}], closureDays[{day,label}], footerNote? }   // 휴진·임시휴업 안내형: 웜베이지 배경 + 대형 제목 + 날짜목록 + 미니 캘린더 그리드(강조일 빨간 원+라벨) + 하단 안내문
reason-zebra-rows { chapterNumber:string, title:string(em/br), items[3-5]:{ num:string, desc:string(em) } }   // CS 근거 나열: 밝은 청회색 배경 + 챕터 헤더(accent 세로선) + 오프셋 흰카드 + 번호·설명 zebra 교번 행
cs-monthly-calendar { month, subtitle, notice1?, notice2?, days:[{date,status:'normal'|'operating'|'closed'|'empty',label?}](7~42) }   // CS 월간 운영일정 캘린더 — accent 다크 히어로존 + 7컬럼 그리드 + 원형 상태배지(운영=accent/휴진=danger)
cs-vacation-calendar { title, weeks[{days[{date,state,label?}x7]}x1-4], notes[1-3] }   // 휴가·명절 압축 캘린더(2~4주 창): 범위pill/휴무filled/재개outline 상태 + 날짜 레이블 + 하단 안내문
cs-holiday-calendar { title, badgeLabel, days[]{day,status,label?}, notes[], legend?[]{status,label}, monthLabel? }   // 공휴일 배송 마감 캘린더 — 다크(brand) 7열 그리드(핑크=배송휴무/흰=순차출고/노랑=범위휴무) + bullet 안내
cs-delivery-calendar { title, startDayOffset, weeks[]{day?,kind,label?,rangeStart?,rangeEnd?}, legend?[]{iconKind,text} }   // 배송 출고 캘린더 CS 블록 — 이미지 없음, 7열 SUN-SAT 그리드, 날짜 4종 상태(cutoff/holiday-range/sequential/closed)
cs-delivery-guarantee-split { eyebrow, headline, heroImage?, heroImageAlt?, weekday:{badge,condition}, weekend:{head,badge,condition,subCondition?}, footnote?, notices?:string[] }   // 당일발송·도착보장: brand 상단 아치존(일러스트+eyebrow+헤드라인) + 2컬럼 조건카드(평일=라이트/주말=brand다크, 도착보장 배지) + 하단 footnote+유의사항 리스트
shipping-hero-notice-strip { eyebrow, headlineTop, headlineBottom, heroImage?, heroImageAlt?, notices[2..5] }   // 배송 히어로(다크 brand 배경+eyebrow+2행 헤드라인+우측 3D 이미지) + 하단 코랄 공지 스트립(불릿 리스트)
shipping-speed-banner { headline: string; subline: string; note?: string; image?: string; imageAlt?: string }   // 빠른/당일배송 강조 배너 — 솔리드 브랜드블루 배경 + 초대형 흰 헤드라인 + accent 서브라인 + 우측 배송 일러스트 이미지
shipping-subscription-hero { productName, serviceLabel, subtitle, image?, imageAlt?, benefits[3]{icon?,label,desc?}, ctaText }   // 정기배송·구독 히어로: 브랜드 웜(accent) 배경 + 대형 2줄 헤드라인 + 중앙 이미지 + 01/02/03 점선 연결 3단 혜택 그리드 + 풀폭 CTA 밴드
shipping-speed-hero { headlineTop, headlineBadge, heroImage?, heroImageAlt?, body, steps[{label,highlight?}×3-5] }   // 빠른배송 히어로: 풀블리드 브랜드 배경+박스뱃지 헤드라인+중앙 이미지(1슬롯)+강조 서브 본문+도트 타임라인
package-event-price-rows { eyebrow?, title, items[]{image?, imageAlt?, name, regularLabel?, regularPrice, discountLabel?, discountPrice, eventLabel?, discountBadge, eventPrice}(1-6), notice? }   // 다크 섹션 헤더 + 흰 카드 안 상품 행 반복(3단 이벤트가 가격표: 정상가 취소선 / 할인가 취소선 / 이벤트가 pill+%배지+최종가)
package-image-rows-strike-price { brandLogo?, titleAccent, titleDark, hashtags?, items[]{image?,imageAlt?,badge?,name,originalPrice?,salePrice,unit?}(2-5), ctaText?, ctaUrl? }   // 브랜드 로고 배지 + accent 2줄 대제목 + 해시태그 + 회색 컨테이너 안 점선 구분 [좌측 정사각 이미지 + 강점 뱃지·제품명·취소선→화살표→판매가] 행 반복 + CTA 버튼
package-split-image-price-rows { brandLabel?, title, subtitle?, items[]{name, desc?, regularLabel?, regularPrice, benefitLabel?, benefitPrice, discountRate?, image?, imageAlt?} }   // 다크 브랜드 헤더 + 좌텍스트-우이미지 수평 분할 카드 반복 + 플로팅 원형 할인배지 + 이중 가격행(취소선 정상가/볼드 최대혜택가)
package-option-rows-panel { title, hashtags?, items[]{optionLabel, name, desc?, originalPrice?, salePrice, image?, imageAlt?} }   // 상품 구성: 웜 accent 배경 + 해시태그 아웃라인 배지 + 흰 패널 내 점선 divider 옵션 행(이미지+옵션배지+제품명+효과+2단가격)
package-numbered-split-rows { hero{image?,eyebrow?,title}, items[]{name,detail?,image?,originalPrice,discountRate,salePrice,unit?} }   // 히어로 카드 + 번호 분할 패널 행 반복, 배지 앰버→레드 단계 강조
product-tab-filter-rows { title, subtitle?, tabs[]{key,label}(1-5), items[]{tabKey?,image?,discountPct?,name,detail?,coupon?,originalPrice?,finalPrice,ctaHref?}(2-8) }   // 카테고리 탭 pill 필터 + 이미지-좌 상품 카드 행(할인% 배지 오버레이·쿠폰 pill·취소선 원가·강조 최종가·화살표 CTA)
package-discount-badge-grid { title, items[]{label, name, discountPct, originalPrice, finalPrice, image?, imageAlt?} }   // 다크 브랜드 배경 헤드라인 + 원형 할인율 배지 오버랩 3열 상품 카드(이미지·할인율·취소선원가·최종가)
package-option-grid { eyebrow?, title, options[]: { optionLabel, image?, imageAlt?, name, desc?, discountRate, originalPrice, finalPrice } }   // accent 솔리드 헤더(eyebrow+대제목+하향 쐐기) + 2×2 카드 그리드(이미지+옵션배지+상품명/설명+가격행)
package-lineup-badge-rows { sectionTitle?, items[]{badges[], name, desc?, originalPrice, discountPct, salePrice, unit?} }   // 상품 구성 행 반복: 아웃라인 pill 뱃지 + 제품명/설명 + 우측 정렬 3단 가격(취소선 정가→할인%→판매가 accent)
product-price-breakdown-card { productImage?, productImageAlt?, productName, productDesc?, priceRows[]{label,amount,tone?}, totalLabel?, totalAmount, benefits[]{badgeLabel,heading,desc?,image?} }   // 상품 구성: 가격 분해(판매가/할인가/적립가) + 합산 + 번호 pill 배지 혜택 카드(첫째 전폭, 나머지 2열)
product-discount-badge-rows { eyebrow?, title, items[]{discountPct, image?, imageAlt?, label, description, subLines?[]} }   // 카탈로그형 행: 썸네일 좌상단 % OFF pill 배지 + 카테고리 레이블 + 설명, 가격 없이 할인 강도만 시각화
package-numbered-option-selector { title, subtitle?, options[]{label?, name, image?, imageAlt?, features[], active?} }   // 상품 구성 옵션 선택기: 4-col 넘버드 카드 그리드, active 카드는 filled accent 배경
package-numbered-band-rows { title, subtitle?, period?, items[]{name, desc?, originalPrice?, price, highlight?}, footnote? }   // 다크 배경 번호 뱃지 밴드 행 가격표 — 마지막(또는 지정) 행 레드 액센트 앵커
package-split-icon-cards { eyebrow?, title(em), subtitle?(em), cards[2-4]{ label, icon, heading(em), footer? }, body?(em) }   // 다크 히어로(pill eyebrow + accent 대헤드라인) → 라이트 2열 아이콘 카드(번호 레이블+아이콘+설명+하단 스트라이프) → 마무리 본문. 가격 없는 구성 특징 안내.
package-gradient-bundle-discount { brand, period?, title, benefit?, bundleImage?, items[]{name,bonus?}(2-4), discountRate, originalPrice, salePrice }   // 파스텔 그라디언트 번들 구성 + 할인 바 섹션
package-bundle-gift-rows { eyebrow?, title, rows[]: { heading, mainImage?, giftImage?, giftLabel?, discountRate?, benefitLabel?, originalPrice?, finalPrice, ctaLabel?, ctaHref? } }   // 덧셈 번들 행: 메인상품+원형커넥터+사은품카드, 복합 원형 배지 클러스터(할인율+혜택명 겹침), 가격/CTA 행, 그라데이션 배경
product-lineup-dark-cards { title, badge?, items[]{hashtags, number?, image?, imageAlt?, name, desc?, footer}, body? }   // 상품 구성 라인업: 다크 배경 + 대형 헤드라인 + pill 서브배지 + 2열 카드(해시태그 상단 라벨 + ── N ── 구분선 + 제품 이미지 + 제품명/설명 + 인셋 다크 푸터 밴드) + 하단 본문
package-event-product-rows { eventBadge?, title, heroDecoImage?, items[]{image?, name, originalPrice, salePrice, finalPrice, discountRate} }   // 이벤트 축제 히어로(다크 배경+pill 배지+데코 오브젝트) + 3단계 가격 공개 상품 행 리스트(정상가 취소선→행사가 취소선→최종가 bold+역삼각형 할인율 배지)
product-hero-discount-grid { eyebrow?, heroTitle, heroImage?, heroImageAlt?, groups[1-2]{ bandHeading, cards[1-3]{ discountPercent, image?, imageAlt?, heading, originalPrice?, salePrice } } }   // 라이프스타일 히어로 + 섹션헤딩밴드 + 3열 퍼센트배지-이중가격 카드그리드 (1~2회 반복)
event-countdown-product-grid { eventLabel, title, subtitle?, countdownStart?(HH:MM), countdownEnd?(HH:MM), products[2-4]{image?,imageAlt?,badge?,name,desc?}, footer? }   // 다크 히어로 + HH:MM 카운트다운 타이머 + 이벤트 eyebrow 배지 + 2×2 상품 카드 그리드 + 하단 안내
package-discount-image-rows { eyebrow?, title, headerImage?, items[]{image?, name, desc?, option?, discountPct, originalPrice, salePrice}(2-5), footnote? }   // 브랜드 다크 헤더 + per-row 원형 할인% 배지 + 상품 이미지/가격 행 반복 라인업
product-hero-gift-price { title, subtitle?, productImage?, productImageAlt?, categoryLabel?, productNameLabel?, giftLabel?, giftImage?, giftImageAlt?, msrp?, msrpLabel?, salePrice, salePriceLabel?, extraDiscounts?[{desc,badge}] }   // 제품 이미지 우상단 플로팅 증정품 pill + MSRP취소선/판매가 가격 그리드 + 추가할인 배지 행
package-hero-price-table { eyebrow?, title, groupImage?, specialLabel, specialPrice, listLabel?, listPrice?, saleLabel?, salePrice?, ctaText? }   // 제품 그룹샷 + 3행 가격 투명성 테이블(신제품 특가/소비자가/판매가) + 다크 CTA 스트립
package-dark-component-grid { title, subtitle?, heroImage?, heroImageAlt?, items[]{image?,imageAlt?,heading,body?} }   // 다크 럭셔리 상품 구성 — 원형 페데스탈 스포트라이트 히어로 + 2열 아이템 카드 그리드
review-photo-bubble-staggered { eyebrow?, title(em), ratingLabel?, ratingScore?, ratingStars?, reviews[2-3]{ image?, imageAlt?, highlight(em), body(em|br) } }   // 다크 배경 스태거드 포토버블 리뷰: 집계 평점 pill 헤더 + 세로 포토 2열 수직 오프셋 + 오렌지 pill-bubble 쌍
review-divider-image-rows { headingTop, headingAccent, items[]{rating,nickname,title,body,image1?,image2?} }   // 채팅아이콘+2줄헤드(평문+accent) → HR → [★별점+닉네임헤더 / 제목+본문(좌)+썸네일2장(우) / HR] 반복(2~5)
recommend-persona-list-annotated { eyebrow?, title, label?, items[3-6]{ avatar?, heading, annotatedKeyword?, annotationType?(oval|underline|none), body? } }   // 추천 타겟 페르소나 리스트 — 핼프톤 실루엣 아바타 + 소제목 키워드에 오렌지 손그림 oval/underline 어노테이션 SVG 수직 반복
review-efficacy-bar-chart { title(string,em/br) | groups[](heading,rows[](label,value,displayValue?)) | textSection?(heading,body,footnote?) }   // 만족도·효능 바 차트: 대형 헤드라인 + 지표 그룹(섹션 헤딩+구분선) × 1~3 + 라벨|수평 진행바|퍼센트 행 반복 + 선택적 텍스트 섹션
review-aggregate-score-cards { eyebrow?, title, aggregateLabel?, aggregateProduct?, score, starCount?, reviews[]{heading, body?, nickname} }   // 민트 배경 집계평점 헤더(좌: 레이블+제품명, 우: 대형점수+빨간별) + 구분선 + 풀폭 흰 라운드 카드 스택
review-image-story-stack { eyebrow?, title, items[]{image?, imageAlt?, stars, ratingLabel, reviewer?, heading, body?} }   // 고객 후기: eyebrow+accent 대제목 + [풀와이드 라운드 이미지 + 하단 플로팅 화이트 카드(별점·리뷰어·굵은 헤딩·본문)] 2~5회 수직 반복
review-satisfaction-stats { brand, product, question, starCount, starLabel, badgeValue, tableHeader, rows[]{label,value} }   // 별점+원형 점선 퍼센트 뱃지 + 다크그린 속성별 만족도 테이블
review-divider-image-right { eyebrow, title, items[]{label, lines[], highlight, attribution, image?, imageAlt?} }   // 구분선-라벨-구분선 골격 리뷰 유닛 반복, 우측 고정 이미지, accent 강조 인용 한 줄
review-image-rows { eyebrow?, title, items[]{heading, body?, author?, image?, imageAlt?} }   // 고객 리얼 후기 — 밝은 배경 + eyebrow + 대형 헤드라인 + [좌 텍스트|우 썸네일] 수평 행 반복(2~6개) + 행간 수평 구분선
review-satisfaction-pill-bars { eyebrow?, satisfactionScore, productName, subtitle?, bars[{label, pct}×3-7] }   // 만족도 pill-gradient 바 스택 리뷰 섹션
review-thumbnail-rows { eyebrow?, titleLine1, titleLine2?, items[]{image?, imageAlt?, reviewer, bodyLine1, bodyLine2?, stars?} }   // 리뷰 오픈 로우: 좌측 앵커 썸네일 + 리뷰어 아이디/닉네임 인라인 + 2행 본문 + 별점(선택), 헤어라인 디바이더 분리
review-photo-bg-dashed-cards { bgImage?, eyebrow?, title, items[]{avatar?,name?,heading,body?} }   // 풀블리드 배경사진 + eyebrow 라벨 + 대형 헤드라인 + 반투명 점선 보더 카드(원형 아바타+리뷰 텍스트) 2~5장 수직 스택
review-hero-avatar-list { heroImage?, heroImageAlt?, quote, quoteCaption?, reviews[]{avatar?,name,body} }   // 히어로 상품 이미지 배너(헤더 겸) + 풀쿼트 대형 타이포 + 아바타+이름+본문 행 순수 반복
review-stat-header-card { eyebrow, brandName, productName, statLeftLabel, statLeftValue, statRightLabel, statRightValue, reviewSectionLabel, reviewText, reviewerName, reviewStars }   // eyebrow 라벨 + 브랜드/제품명 헤드 + 이중 KPI 통계 바(버티컬 구분선) + 섹션 pill + 단일 리뷰 카드(인용+작성자+별점)
review-instagram-dm-mockup { eyebrow?, rating?, title, bgImage?, dmSenderName?, dmSenderAvatar?, messages[]{text, reviewer?}(2-6), inputPlaceholder? }   // 소셜 증거: 섹션 헤더(해시태그 eyebrow+별점+대제목) + 스마트폰 목업 안 Instagram DM 스레드로 고객 리뷰를 실제 DM 스크린샷처럼 연출. 인풋바 크롬(카메라·마이크·하트·send) 재현. 배경 이미지 선택.
review-icon-alternating-rows { eyebrow?(string), title(string+em), items[2-6]{ iconImage?(url), iconName?(string), heading(string+em), body?(string) }, bgColor?(css) }   // 아이콘 교차 리뷰: 선명한 배경 + 화이트 라운드 카드, 홀수행=아이콘 좌/짝수행=아이콘 우 교차, 3D PNG 또는 라인 아이콘 폴백
review-aggregate-score-stack { eyebrow?, productLabel?, title, score, scoreUnit?, reviews[]{stars?,starScore?,line1,line2?,line3?,cta?} }   // 다크 배경 집계 점수 히어로 + 골드 별점+본문+CTA 카드 수직 반복
review-numbered-thumbnail-rows { eyebrow, title(em), items[]{heading(em), body?(em/br), image?, imageAlt?} }   // 만족도 1등 신뢰 앵커 + 번호(01~N)·이유·우측 썸네일 행 반복(3~7회) 리뷰 섹션
faq-circle-badge { title?(string), items[2-8]{ question(string, em/br ok), answer(string, em/br ok) } }   // 솔리드 원형 Q. 뱃지 + 질문(accent-d) + 답변(ink) 수직 스택, 흰 카드 컨테이너, 이미지 없음
faq-stagger-offset { eyebrow?, title, items[]{question, answer} }   // Q카드 풀폭+A카드 우측 오프셋 스태거, trailing A 글리프
faq-label-spec-table { eyebrow?, title, tableTitle?, rows[]{label, value, sub?} }   // 다크 헤드라인 헤더 + filled-black-badge 라벨×값 메타데이터 테이블 (채용공고·이벤트·상품스펙 공시형)
faq-editorial-split { brandTop?, brandBottom?, question, questionNote?, answerHead, answerBody, heroImage?, circleImage? }   // FAQ 단일 Q&A 에디토리얼 스플릿: 좌(크림) 사이드바 + 우(다크) 패널 풀블리드 히어로 + 대형 Q/구분선/A 오버레이 + 원형 블리드 이미지
faq-pill-card-split { displayTitle?, heading, items[]{question, answer} }   // Dark pill Q-header + white card A-answer, orange Q./A. labels, no images, 2–7 pairs
faq-satisfaction-bar { title(em), subtitle?, items[]{label, percent:int}, notes[]? }   // 다크 배경 + 골드 그라데이션 전폭 바 행 + 우측 대형 퍼센트 — 만족도 데이터 시각화
faq-dual-circle { title?(string+em), items[2-6]{ question(string+em), answerHead(string+em), answerBody?(string+em/br) } }   // 틸(Q) 네이비(A) 원형 글리프 배지 + 질문 + 볼드 헤드라인 + 보조 바디 반복. 이미지 없음.
spec-table-label-value { title, subtitle?, brand?, sectionHeading?, rows[{label, value}×2-8] }   // 구조형 라벨-값 테이블: 대제목+accent서브+우측브랜드 → 풀폭hr → 섹션헤딩 → [hr+좌라벨72px/우멀티라인텍스트우정렬] 행 반복(2~8). FAQ·스펙·채용·배송 구조 정보 전달용.
award-warranty-pledge { eyebrow?, headline(em), subCopy?, emblemLabel, productImage?, productImageAlt?, pledgeCopy(em/br), stripCopy(em), disclaimer? }   // A/S 보증 권위 선언: 딥네이비+골드 헤드라인 + 원형 픽토그램 엠블럼(시계+렌치+체크) + 기간 필 라벨 + 풀폭 제품 이미지 + 서약 카피 + 담당자 캐릭터 아이콘 보증 스트립
award-rank1-listing-card { contextLine, headline(em/br), listing{image?,rankBadge,productName,productDesc?,price?,sideNote?}, anchorLabel(em) }   // 딥네이비+골드테두리프레임 + 트로피히어로SVG + 카테고리랭킹달성헤드라인(서브+골드별행+대형선언) + 마켓플레이스리스팅카드목업(썸네일+1위원형배지오버랩+상품정보) + 하단로렐앵커 — 수상명·연도·기관은 반드시 플레이스홀더
award-laurel-stat-rows { headline, subCopy?, rows[]{label, stat}(2-5), productImage?, productImageAlt?, footnote? }   // 블랙+골드파티클+보케 배경, 좌우 월계관 SVG 감싼 대형 실적 수치 행 반복, 제품 목업 하단 우측, 각주. ⚠ stat/label은 실데이터 플레이스홀더(N건·N%)로만 — 지어내기 금지
award-no1-emblem-banner { logoImage?, logoAlt?, eyebrow?, headline(em), dateBadge?, rankNumber?, subCopy?(em,br) }   // 블랙 배경+골드 글로우+순환 로렐 리스 SVG 안 황금 숫자 엠블럼+3단 대리석 포디움. 수상명·기관·기간은 반드시 플레이스홀더.
award-trophy-declare { year, awardTitle(em), starCount?(1-7), message?(em/br), subMessage?(em/br) }   // 어워드 선언 히어로: 딥브라운/블랙 배경 + 골드 트로피 SVG + 로렐 리스 원형 구도 + 별·연도 배지 행 + 골드 대형 수상명 헤드라인 + 구분선 + 마무리 메시지. 수상명·연도는 반드시 플레이스홀더 사용
award-milestone-hero { eyebrow, milestoneNumber(em), milestoneSuffix?, tagline(em), subCopy?, productImage?, productImageAlt? }   // 어워드 마일스톤 히어로: 왕관→초대형 판매수치 3줄→월계관 태그라인→스포트라이트+포디움 제품샷. ⚠️ 수치·수상명은 플레이스홀더 필수
award-no1-emblem { eyebrow?, headline, badges[2-3]{mainValue,topLabel?,bottomLabel?}, medallionContext?, medallionMain, awardLabel?, showPodium? }   // 블랙+골드 듀얼존 어워드: 미니 로렐 뱃지 행(소형 크리덴셜) + 대형 원형 No.1 메달리온(월계관+포디움). ⚠️ 수상명·연도·기관 반드시 플레이스홀더
award-no1-emblem-streak { logoImage?, logoAlt?, awardHeadline, emblemSubLabel?, streakYears, subCopy, starCount?(1-5), productImage?, productImageAlt? }   // 블랙/딥브라운 골드 배경 + 5성 로우 + 로고 + 수상명 헤드라인 + 대형 황금 "1" 엠블럼(SVG 월계관 날개 좌우 대칭) + 원통형 포디움 + N년 연속 수상 선언 + 서브카피. 수상명·연도·기관은 모두 플레이스홀더(AI 작성 금지)
award-no1-emblem-hero { eyebrow?, showDivider?, headlineTop, headlineBottom, medallionContext?, medallionMain, awardLabel?, showPodium? }   // 어워드 #4: 블랙+골드 배경, 어워즈 아이브로우+골드 헤어라인 구분선, 2줄 골드 그라데이션 대형 브랜드×카테고리 헤드라인, 원형 No.1 메달리온(핀별+별5개+수상라벨)+좌우 대형 로렐 가지, 3단 골드 포디움
award-no1-emblem-badges { eyebrow?, headline(em), showDivider?, badges[1-3]{label,value,subLabel?}, emblemLabel?, closer?(em/br) }   // 딥블랙+골드 1위 엠블럼: 별5개 헤더→초대형 골드 헤드라인→구분선→로렐뱃지행(1~3)→초대형 "1" 입체+좌우월계관SVG+원통포디움+방사광→마무리 카피. 수치·수상명은 플레이스홀더 필수.
award-trophy-stat { starCount?(1-7), eyebrow?, statLabel, statValue(em), ribbons[1-3]{ label, value(em), hasStar? } }   // 블랙 스포트라이트 배경 + 원형 골드 월계관+트로피(인라인 SVG, 배경) + 초대형 골드 수치 히어로(트로피 앞 오버랩) + 하단 리본 배너 1~3행(소라벨+수치+브래킷 장식). 수치·라벨은 실제 데이터 기반 플레이스홀더 필수.
award-trophy-poster { eyebrow?, awardTitle, subtitle?, periodLabel? }   // 어워드 이벤트 포스터: 딥브라운 방사형 배경 + 골드 리본 컨페티 + 세리프 아이브로우 + 대형 골드 디스플레이 타이틀 + 서브 카피 + 골드 트로피 SVG + 측면 로렐 가지 SVG + 기간 필 배지
award-gov-seal-hero { eyebrow?, headline, category?, sealImage?, sealAlt?, yearBadge? }   // 정부기관 원형 씰 메달리온 히어로 — 딥브라운 배경+스포트라이트+풀쿼트 골드 헤드라인+다면 크리스탈 메달리온(씰 이미지 오버레이)+좌우 골드 월계수 리스+3단 원형 포디움+대리석 사각 베이스. ⚠️ 수상명·연도·기관명 플레이스홀더 필수
award-ranking-podium-sale { eyebrow?, headline, subCopy?, podium[3](rank,productName,stat,statUnit?), gridCards[4](desc?,name,price), brandSeparatorText, bottomCards[3](desc?,name,price), footerNote? }   // 어워드 랭킹 포디움 특가: Zone A 대형 골드 1 엠블럼+이벤트 헤드라인 / Zone B 1·2·3위 원형 포디움 메달배지 / Zone C 2×2 금테두리 상품그리드 / Zone D 브랜드 구분선 / Zone E 3열 대형 가격카드 / 푸터. ⚠️수상·순위·가격은 반드시 플레이스홀더
award-laurel-emblem-grid { since?, slogan?, categoryLabel?, brandName, statNumber?, statSuffix?, cumLabel?, cumStat?(em), cumNotes?[≤4], awards[2-6]{emblemLabel, org, awardName} }   // 골드 컬러바 + 대형 월계관 SVG 엠블럼 히어로 + 누적수치 + 2열 황금 수상카드 그리드; 수상명·기관은 실제 정보만
award-trophy-badge-grid { title, subtitle?, badges[2-7]{ topLine?, mainText, bottomLine? } }   // 딥블랙 배경+골드 보케+트로피·월계관 히어로 앵커+대형 헤드라인+최대 7개 월계관 뱃지 비대칭 그리드(2·3·2 행) — 수상명·연도·기관은 반드시 플레이스홀더
award-no1-emblem-rosette { headline, subCopy?, credLine1?, credLine2?, plaqueCenterText, certImageLeft?, certImageRight?, ribbonBrandName, closerCopy? }   // 딥브라운 배경+스포트라이트+골드 런칭연차 헤드라인+인증텍스트(A) / 유리 직사각 플라크+완전원형 로제트 월계관+대형 3D 골드 "1"+좌우 인증서 이미지 슬롯 2개+리본 배너(브랜드명)+반타원 포디움(B) / 마무리 클로저(C) — ⚠️ 수상·인증·브랜드명 반드시 플레이스홀더
shipping-vehicle-composite-hero { eyebrow, headline(em), subCaption?, vehicleImage?, vehicleImageAlt?, productLeftImage?, productLeftAlt?, productRightImage?, productRightAlt?, footerCaption?(em) }   // 다크 배경 당일출발 히어로: 시계 아이콘 + 주문마감 아이브로 + 대형 헤드라인 + 배송차량 중앙 + 제품 누끼 좌우 floating 합성 슬롯 + 하단 캡션
cs-authorized-seller-hero { brandLabel, title, certCaption?, badgeImage?, badgeImageAlt?, warningText, disclaimerText? }   // 공식 판매처 인증 히어로 — 상단 로고+헤드라인+배지이미지 / 하단 shield 경고카드
cs-authorized-retailer-badge { badgeBrand, badgeLabel, badgeStars?, headline, certBody, certSub?, warningLead, warningBody, warningSub?, legalNotice? }   // 공식 판매처 인증 배지 — 다크 배경 + 원형 금색 테두리 배지(좌) + 헤드라인(우) + 비공식 구매 경고 박스 + 저작권 고지
shipping-illust-hero { headLine1: string, headLine2: string, illustImage?: url, illustAlt?: string, bgTone?: 'light'|'mid' }   // CS 배송 히어로: 하늘색 배경 + 2줄 헤드라인(2번째 줄 노랑 하이라이트박스) + 배송 일러스트 1슬롯
shipping-date-timeline { title: string; steps: [{rail?:'accent'|'danger'|'neutral'|'none'; date: string; dateSuffix?: string; label: string; continuation?: string}](2-5); image?: string; imageAlt?: string }   // 배송공지 날짜 타임라인: 수평 컬러 레일 바 + 대형 날짜 숫자 + 카피 수직 반복
ba-painpoint-bubbles { title: string; items: { text: string }[2..6]; personImage?: string; personImageAlt?: string }   // 구매 전 공감 유발: brand 다크 배경 + 섹션 제목 + 점선 수직 커넥터 + 좌우 교차 흰 말풍선(2~6개) + 하단 고민 인물 사진(선택)
ba-photo-split-card { eyebrow?, title, badge?, cardNote?, cardHeading, beforeImage?, beforeLabel?, afterImage?, afterLabel? }   // 민트 배경 + 흰 라운드 카드 내 2열 B&A 이미지 + 차콜/틸 캡션바 compare 블록
recommend-persona-grid { eyebrow?, title, items[]{image?, imageAlt?, label} (2–6) }   // 다크(--ink) 배경 + eyebrow + accent 강조 헤드라인 + 원형 아바타 흰 카드 3열 그리드
compare-product-cards { title, subtitleLines[], rival{label,descLines[],image?,imageAlt?,feature}, ours{label,descLines[],image?,imageAlt?,feature} }   // 타사(중립회색)/자사(accent) 2열 카드 비교 — 대형 헤드라인 + 부연설명 3줄 → 라벨badge+설명+이미지+핵심기능 카드
event-comment-prize-grid { badgeLabel, headline(em/br), comments[]{username,text(em)}, deadline, prizes[]{image?,imageAlt?,label,winnerCount} }   // 댓글 이벤트: 필 배지 + CTA 헤드라인 + 폰 목업 댓글버블(1~3) + 마감일 + 2열 경품카드(이미지+원형배지+다크 라벨 푸터)
compare-price-bar-chart { badge?, title, body?, competitorPrice, competitorPriceLabel?, competitorLabel?, ourPrice, ourPriceLabel?, ourLabel?, ourImage?, ourImageAlt?, ourBarRatio?, savingsChip? }   // 다크네이비 배경 + Check Point pill badge + 절감률 헤드라인 → 라이트 카드 내 타사/자사 세로 바차트(CSS height%, ratio 조절) + 절약액 chip
compare-overlap-cards { title, subtitles[1-3], competitorLabel?, competitorImage?, competitorItems[2-4], ownLabel?, ownImage?, ownItems[2-4] }   // 경쟁사 비교 오버랩 카드: 라이트 배경 + 대형 헤드라인 + 3줄 부연 → 타사(중립회색, z-index 뒤) / 자사(다크네이비, z-index 앞) 겹침 2카드, 각 카드에 라벨+이미지+X/체크 아이콘 행(2~4행)
ba-multi-effect-stacked { eyebrow, title, cta?, beforeLabel?, afterLabel?, items[]{effectLabel, beforeImage?, afterImage?, beforeAlt?, afterAlt?} }   // 번호 효과 라벨 + 사용전(다크바)/사용후(accent바) 좌우 쌍 + 화살표 수직 스택 (2~4 효과)
compare-competitor-photo { title, subtitle?, competitorLabel?, ownLabel?, competitorImage?, ownImage?, competitorCaption, ownCaption, footerLines? }   // 타사(회색 캡션바)/자사(accent 캡션바) 2열 이미지 비교 + 하단 설명
recommend-painpoint-bubbles { eyebrow, title, bubbles[{text}]×2-4, chips[{label}]×1-4, productName, productSub?, heroImage?, heroAlt?, heroOverlay? }   // 추천 대상(페인포인트): eyebrow + 대형 추천 헤드라인 + 우정렬 채팅버블 pill 2~4행 + 소구점 chip 행 + 대형 제품명 + 전폭 히어로 이미지(오버레이)
compare-tab-panels-image-list { title, eyebrow?, productName?, rivalLabel?, ownLabel?, rivalImage?, ownImage?, rivalItems[2-6], ownItems[2-6] }   // 탭형 2열 비교: 라이트 배경 + 중앙 헤드라인(accent 하이라이트+수직 구분선) + eyebrow·제품명 서브 + 회색 타사탭/accent 자사탭 + 각 열 이미지 + hr 구분 항목 목록
compare-price-card-pair { badge, title, loser{label,image?,imageAlt?,priceLabel,price}, winner{label,image?,imageAlt?,priceLabel,price(em허용)}, caption? }   // 배지 eyebrow + 대형 헤드라인 + 타사(회색/흐림) vs 자사(accent 강조) 2열 단가 비교 카드 + 하단 부연 캡션(선택)
credentials-stat-bento { title, subtitle?, tiles[]{label, kpi, image?, imageAlt?, span:'full'|'full-rev'|'half'} }   // 다크 벤토 KPI: 라이트 헤더(대형 헤드라인+서브카피) + 전폭/반폭 교차 다크 타일 그리드, 각 타일 eyebrow 라벨+대형 KPI 숫자+3D 이모지/이미지
painpoint-brand-research-trio { brand, authorityCopy, authorityEmphasis?, painpoints[3]{label?, text}, bridge, productImage?, productImageAlt? }   // 다크 brand 배경 + 생각 이모지 + bracket 권위 카피 + 번호형 고민 3행(아웃라인 박스) + 해결 브릿지 + 제품 이미지 + bracket 브랜드 라벨
compare-product-spec-matrix { eyebrow?, title, products[2-4]{name,image?,imageAlt?,highlight?}, attributes[2-6]{label, cells[2-4]} }   // N제품×M속성 스펙 매트릭스: 제품 이미지 열헤더 + 속성 풀폭 띠행(--ink 배경) + 셀(자사 hl=accent, 경쟁사 muted)
compare-upgrade-product-cards { headline, subheadline?, oldLabel, oldImage?, oldFeatures[{text}], newBadge?, newLabel, newImage?, newFeatures[{text}], closer? }   // 업그레이드 비교: 중앙 헤드라인 + 구버전(중립 회색 카드) / 신버전(accent 카드+NEW 배지) 2열 + 카드별 제품이미지+특징목록(구:muted / 신:check 아이콘+ink)
feature-dark-grid { eyebrow, productName, price, priceSub?, gridTitle?, items[]{heading, body?, fullSpan?} }   // 라이트 가격 히어로 + 다크 2열 텍스트 전용 USP 피처 그리드(0~8셀, 홀수 마지막 자동 full-span)
feature-bento-photo-grid { eyebrow, title, price?, items[]{image?, imageAlt?, icon?, heading, body?} }   // 라이프스타일 풀블리드 벤토: 헤더(eyebrow+헤드라인)+가격배지 → 불균일 2열 그리드, 첫 카드 row-span 2(세로 2배), 각 카드=사진 배경+다크 오버레이+아이콘+흰 헤드라인
feature-bento-photo-tiles { eyebrow, heroTitle, heroBody?, heroImage?, heroImageAlt?, tiles[3-4]{ image?, imageAlt?, label, title, body?, wide? } }   // 풀블리드 히어로 사진+하단 오버레이 헤드라인 → 2열 벤토 피처 타일(사진+다크그라디언트+eyebrow라벨+제목+본문) 3~4개
feature-bento-mosaic { heroTitle, heroSub?, galleryImages[2-6]{url?,alt?}, bentoImage?, bentoImageAlt?, bullets[2-6]{heading,detail?}, lineup?[2-4]{name,price,description?,highlight?}, lineupLabel? }   // 스캐터 히어로 갤러리 + 비대칭 벤토(좌:이미지/우:불릿) + 가격 라인업 카드
compare-product-card-vs { eyebrow?, title, subtitle?, rival{label,image?,imageAlt?,statValue,statLabel,body?}, own{label,image?,imageAlt?,statValue,statLabel,quote?,quoteSource?}, closer? }   // 경쟁사(무채색) vs 자사(accent골드) 2열 제품카드 비교 — 핵심스펙수치+유저보이스 인용
spec-nutrition-macro-table { title, macros[]{nutrient,value,unit,featured?}, rows[]{label,amount,pct?,sub?,highlight?}, productImage?, productImageAlt?, footnote? }   // 다크 배경 + 원형 매크로 배지 3종(중앙 accent 강조) + 계층형 영양성분 테이블 + 제품이미지 우측 플로팅
ba-clinical-bar-chart { eyebrow, title(em/br), beforeLabel?, afterLabel?, axisMax?, items[]{metric, statValue, statSuffix?, beforePct(0-100), afterPct(0-100)} (2-5) }   // 다크 배경 임상 B&A 수평 막대 차트: eyebrow + 대제목 + [지표명 → 개선율% big-stat → 사용전(회색)/사용후(accent) 수평 바 카드 + 눈금 축] 반복
point-discount-price-reveal { eyebrow?, title(em), titleIcon?, image?, imageAlt?, caption?(em), discountLabel, priceRows[2-4]{label,value,strikethrough?,highlight?}, badges?[0-4]{label,value} }   // 다크 특가 섹션: oversized 할인% 좌측 + 우측 가격 breakdown grid + 하단 혜택 배지 행
point-promo-asymcard { eyebrow, title, dateRange?, mainCard{image?,imageAlt?,label?}, stackItems[2-3]{image?,imageAlt?,label?}, burstValue?, burstCaption? }   // 포인트 프로모 비대칭: vivid 그라데이션 + tall 좌카드(pill 라벨) + 우측 3-unit 스택 + floating burst 배지
feature-dark-product-grid { heading, subheading?, items[]{categoryLabel, saleLabel, image?, imageAlt?, ctaText?} }   // 다크 캠페인 헤딩 + 2-col 제품 카드 그리드 (pill 배지 2개 + ▶ NEXT CTA)
point-fullbleed-caption { image?, imageAlt?, badgeNo?, headline(em/br), body?(em/br) } × 2~4 items  // 풀블리드 제품사진 + 하단앵커 원형 번호배지 + 이미지 하단 accent 헤드라인·본문 수직 반복
point-award-credential { eyebrow?, headline, heroImages[1-3]{image?,alt?}, badges[1-3]{topLine?,mainText,bottomLine?}, awards[2-6]{year,desc} }   // 다크 배경 + 로렐 리스 마일스톤 헤드라인 + 제품 히어로 위 플로팅 원형 어워드 스탬프 뱃지 + 연도순 수상 히스토리 리스트
feature-dark-float-cutout { headline, lifestyleImage?, lifestyleAlt?, cutoutImage?, cutoutAlt?, badgeMain?, badgeSub?, eyebrow?, body? }   // 다크 배경 + 대형 헤드라인 + overflow 라이프스타일 카드(좌상 누끼 플로팅 + 우하 burst 뱃지) + eyebrow 라벨 + 서술 카피
point-editorial-marquee { tickerText, image?, imageAlt?, eyebrow, headline, ghostWord }   // 양측 세로 ticker strip + 풀블리드 라이프스타일 이미지 + solid-black 하단 카피 패널 + oversized ghost 워드 (운동/패션/라이프스타일)
point-heritage-split { brandKo, brandHanja?, brandSub?, eyebrow, slogan, image?, imageAlt? }   // 헤리티지 포인트: 크림슨 다크 + 단청 패턴 엠보스 + 이중언어 골드 세리프 브랜드 네임 + 캡션 밴드 + 풀블리드 제품 사진
point-ingredient-hero { badge?, title(em/br), subheading?(em/br), body?(em), image?, imageAlt? }   // pill 브랜드 배지 + 인라인 키워드 accent 강조 헤드라인 + 서브 + 본문 + 풀블리드 성분 이미지 수직 스택
point-brand-collab-editorial { brandCollab, headerLabel, geoTag, image?, imageAlt?, headline, ghostBrand, caption? }   // 아웃라인 로고타입 헤더 바 + 지오태그 칩 오버레이 풀블리드 이미지 + 대형 헤드라인 + 고스트 서브 브랜드네임 + 바코드 틱 스트립
promo-event-spotlight { eventLines[3], headline, body?, dateStart, dateEnd, spotlightColor? }   // 다크 배경 + 상단 코닉 스포트라이트 빔 + 3행 풀폭 오버사이즈 이벤트명(2번째 줄 accent) + accent 서브 헤드라인 + 본문 + 구분선 테두리 날짜 범위
promo-story-price-reveal { sourceLabel?, diaryLabel?, line1(pill:[text]), line2(pill:[text]), line3?, salePeriod?, originalPrice?, finalLabel?, finalPrice, specLine?, productImage? }   // 다이어리 헤더 + 인라인 반응 pill 헤드라인 + 가격 계단(취소선→최종가) + 제품 이미지 오버랩
point-fullbleed-bookend { pointLabel, eyebrow?, headline, body?, image?, imageAlt?, closing }   // pill 뱃지 → eyebrow → 대형 헤드라인 → 바디 → 풀블리드 이미지 → 클로징 스테이트먼트 (북엔드 구조)
point-timing-banner { badgeQuestion, badgeAnswer, headline(em/br), dateRange?, image?, imageAlt? }   // 타이밍 포인트 배너: 밝은 배경 + pill 2종(질문|답) + 풀폭 검정 하이라이트 밴드 위 대형 헤드라인 + 날짜기간 + 풀폭 이미지
promo-scatter-banner { eventLabel, headline, subCopy, hashtag?, objTopLeft?, objTopRight?, objBottomLeft?, objBottomRight? }   // 다크 풀블리드 + 이벤트 레이블 + 도트 구분 초대형 헤드라인 + 서브카피 + 해시태그 필 + 4귀 오브젝트 콜라주 산포
point-numbered-hero-card { items[]: badge, heading(em/br), image?, imageAlt?, caption(em) }   // 다크 카드 + 번호 pill 뱃지 + 헤드라인 헤더 존 → contained 이미지 → 별도 배경 캡션 스트립 (1~5 반복)
point-numbered-image-card { eyebrow?(string), items[]{caption, label, image?, imageAlt?} }   // 다크 카드 + 대형 서수 앵커 + 텍스트 존/이미지 존 분리 수직 스택(2~5)
point-step-timeline-bleed { eyebrow, eyebrowSub?, steps[]{label}(2~4), headThin, headBold, image?, imageAlt?, caption? }   // 수평 numbered-dot 타임라인 + split-weight 대형 헤드카피 + vertical overflow bleed 이미지
point-radar-web { brand, title, axes[6], image?, imageAlt?, calloutHeading, calloutItems[2-4] }   // 6축 레이더 차트 중앙에 제품 이미지 오버레이 + pill-badge callout 리스트. 뷰티/식품 성분 균형 시각화.
feature-event-poster { eyebrow?, dateHeadline, eventHeadline, timePill?, datePill?, bgImage?, calloutTitle?, calloutSub?, calloutPrice? }   // 다크 풀블리드 이벤트 포스터: ✦ sparkle 장식 대형 날짜/이벤트 헤드라인 + 시간 pill + 날짜 pill + 우하단 앵커 제품 콜아웃 카드
point-ingredient-overlay { headline, subline?, brandLabel?, productImage?, productImageAlt?, tags[{category, name, variant?, side}](3-8), disclaimer? }   // 제품 이미지 캔버스 위 성분·기능 필 태그 좌우 부유 배치 — +아이콘·카테고리·성분명 3-tier 수직 스택, primary(accent채움)/secondary(아웃라인) 두 레벨
feature-dark-tab-mosaic { eyebrow, headline(em), subcopy(br/em), heroImage?, tabs[]{label}×2-6, mosaicImages[3]{url?,alt?} }   // 다크 hero 상단(eyebrow+대형헤드라인+서브카피+우측블리드이미지) + 밝은 하단(수평카테고리탭+비대칭3이미지모자이크)
stats-satisfaction-bars { title, image?, imageAlt?, bars[]{label, value(0-100), display?}, subtitle?, caption? }   // 고객 만족도 바 차트: 웜 배경 + 선언형 헤드라인 + 제품 이미지 + 레이블·진행바·퍼센트 행 반복(2~5) + 식물 오버레이
point-product-annotation { title, subtitle?, productImage?, productImageAlt?, annotations[]{heading, desc?} (2–4) }   // 밝은 배경 + 대형 헤드라인 + 제품 이미지 중앙 + 우측 callout 점선 커넥터 annotation (기술 다이어그램/설명서 스타일)
feature-image-row-list { offerLabel(em), offerSub?, offerImage?, offerImageAlt?, items[]{image?, imageAlt?, heading(em), body?(em/br)} 2~4 }   // 파스텔 배경 + 상단 증정 오퍼 배너(목업 이미지) + 하단 좌정사각이미지-우제목/설명 행 반복(구분선)
point-urgency-tape-cross { eyebrow, dday, title(em), tapeText, image?, imageAlt?, body(em/br), cta? }   // 다크 배경 X자 테이프 크로스 urgency: eyebrow 라벨 + D-day 카운터 + 대형 헤드라인 + 제품 이미지 위 accent 대각선 테이프 2개(반복 마키 애니메이션) + 하단 서브카피 + CTA
point-list-image-bleed { eyebrow?, headline, sub?, watermark?, items[label,heading,desc?]×2-5, image?, imageAlt? }   // 전폭 워터마크 타이포(상·하) + 이중 쉐브론 다이아몬드 아웃라인 pill 배지 + 좌 포인트 리스트 + 우 풀블리드 이미지. warm 뷰티/스킨케어 톤.
stats-hero-anchor-card-grid { eyebrow, heroStat, heroCopy, images[]{url?,alt?}×1-3, cards[]{label,stat,desc}×2-6 }   // 소비자 만족도·수치 강조 — 히어로 수치(accent-d) + 좌카피 + 우이미지군집 + 하단 2열 카드그리드
feature-product-float-icon-grid { eyebrow?, title, heroBg?, productImage1?, productImage2?, productAlt?, items[]{icon?, heading, body?} }   // 솔리드 브랜드색 배경 위 제품 이미지 자유 부유 + eyebrow + 대형 헤드라인 → 2열 라운드 카드 그리드(아이콘+소제목+본문)
point-product-stats-split { eyebrow?, title, subtitle?, image?, imageAlt?, stats[3–5]{ value, label } }   // 다크 배경 + 풀폭 상단 헤더 + 좌 대형 제품 이미지(~50%) + 우 signed 수치 스탯 수직 리스트(구분선)
story-text-first { label?, titlePre?, titleBold(em,br), titlePost?, paragraphs(em,br)(1~4), bgImage?(url) }   // 텍스트 우선 에디토리얼 브랜드 스토리: EN 라벨+HR → 혼합 굵기 KR 대제목 → 수직 강조선 → 본문 문단
faq-numbered { eyebrow?, title?, items(q(em,br), a(em,br))(2~6) }   // 넘버링 고스트 숫자 목록형 FAQ — brand 풀배경 + FAQ 헤더 + 대형 반투명 서수 장식 + 굵은 질문 + 들여쓰기 답변 + 헤어라인 반복
faq-plain { title?, subtitle?, items(2~8)[q(em,br), a(em,br)] }   // 극미니멀 플랫 텍스트 FAQ — Q/A 글자 라벨 + 얇은 수평선 구분, 카드·버블 없음
hero-photo-bottom { brand, productName(em,br), productSubName?(em,br), heroImage?(url), badgeLabel?, badgeMain?, badgeSub?, logoText? }   // 컬러 그라데이션 상단(브랜드+제품명+구분선+서브명) + 하단 풀블리드 제품 사진(배지/씰 오버레이) + 브랜드 로고 푸터 — 사진 역전 배치 인트로
hero-photo-fullbg { productName(em,br), subcategory?, story(em,br), brandLogo?, heroImage?(url) }   // 풀배경 사진 히어로: 사진이 전체 배경, 상단 대형 제품명+서브카테고리+구분선, 중앙 스토리 카피, 하단 브랜드 로고
hero-photo-inset { brand, productName(em,br), heroImage?(url), sectionLabel?, story(em,br) }   // 텍스트 헤더+인셋 사진+WHY 푸터 3존 인트로 히어로
gallery-numbered-badge { eyebrow?, title(em,br), images(url)(2~4) }   // 타원 번호 배지 갤러리: eyebrow + 대형 display 타이틀 + 번호 배지(01–04)→풀폭 둥근 이미지 반복, 항목 사이 헤어라인 구분
gallery-caption-stack { sectionTitle, sectionSub?, items(title(em,br), caption?(em,br), image?(url))(2~5) }   // 좌정렬 대형 섹션 제목 + 풀폭 이미지 + 중앙 제목/캡션 블록 반복 갤러리
gallery-numbered-strip { title(em,br), subtitle?, images(url,2~4) }   // accent 솔리드 헤더 + 번호 밴드 풀폭 스트립 갤러리(01–04)
gallery-ribbon-card { heading, subtitle?(em,br), items(2~4)[title(em,br), image?(url), desc?(em,br)] }   // 컬러 배경 위 흰 둥근 카드 갤러리 — 상단 리본 번호 배지 · 손글씨 제목 · 풀폭 이미지 · 본문
event-review-prize-grid { badge?, heroImage?(url), title(em,br), subtitle?, prizeLabel?, prizes(2~4)[image?(url), name, winners], stepsLabel?, steps(2~4)[text(em,br)], notesLabel?, notes(1~8)?[text], footer? }   // 리뷰 이벤트 경품 그리드형 — 풀블리드 다크 히어로 + 경품 카드 그리드 + 번호형 참여 단계 + 유의사항
event-coupon-device-steps { tag?, title(em,br), subtitle?(em,br), couponAmount, couponLabel?, deviceImage?(url), steps(2~4)[text(em,br)] }   // 쿠폰 이벤트: pill 태그 + 이벤트 제목 + 폰 디바이스 목업(쿠폰 금액 강조) + 01/02/03 번호형 스텝 카드 세로 스택
event-launch-checklist { badge?, title(em,br), image?(url), limitLabel?, benefitText(em,br), recommendTitle?, checks(2~5)[text(em,br)] }   // 다크 상단(Launch Event 배지+대형 제목+히어로+선착순 pill) + 라이트 하단(타겟 체크리스트) 이분할 이벤트 섹션
cert-badge-hero { eyebrow?, title(em,br), subtitle?, badgeImage?(url), highlightText?(em,br), bannerText?(em,br), checks(2~4)[label(em,br), desc?(em,br)], summaryLines?(2~4)(em,br), certDocImage?(url) }   // 공식 인증 뱃지 히어로형 — eyebrow pill + 대형 헤드라인 + 원형 뱃지 이미지 + 하이라이트·accent 배너 + 체크리스트 + 요약박스 + 인증서 문서 이미지
discount-photo-price { bgImage?(url), topBadge?, headline(em,br), discountRate, subBadge?, originalPrice?, salePrice, ctaText, legalLines?(2~4) }   // 풀블리드 사진배경 + pill뱃지 + 대형헤드라인+할인율 + 정가→할인가 가격비교 + pill CTA + 하단 반투명 법적고지
discount-coupon-stack { bgImage?(url), badge?, headline(em,br), coupons(2~4)[couponLabel?, rate], period?, periodLabel? }   // 포토/다크 BG + pill 뱃지 + 대형 흰 헤드라인 + 풀폭 쿠폰 티켓 2~4장 세로 스택 + 사용기간 풋노트
shipping-icon-hero { heroIcon?, title, subtitle(em,br), caption?, bullets(em,br)(1~6), closing(em,br) }   // 다크 히어로(대형 트럭 아이콘+흰 제목+굵은 부제) → 라이트 불릿 목록 → 풀폭 다크 CTA 밴드
detail-policy-table { title(em,br), subtitle?, beforeLabel?, afterLabel?, beforeBody?(em,br), afterBody?(em,br), notice?(em,br), rows(1~6)[label(em,br), body(em,br)] }   // 정책/AS 정보표: 제목+영문 부제 → 2열 다크 before/after 비교 헤더+본문 → 주의사항 박스 → 수평 구분선 → 라벨(좌)-본문(우) 행 반복
detail-spec-table { eyebrow?, title(em,br), rows(2~14)[label, value(em,br), label2?, value2?(em,br)], cta? }   // eyebrow+대제목 → 4열 스펙 표(항목|내용 × 2쌍, 반복 행) → 풀폭 CTA 바. 전자제품·식품 공통 스펙 시트.
detail-compare-table { eyebrow?, title(em,br), subtitle?, body(em,br)?, genericLabel?, oursLabel(em,br), featureLabel?, rows(2~8)[feature, generic(em,br), ours(em,br)] }   // 헤드라인+서브카피 → 3열 비교표(비교항목|일반제품|우리제품 강조)로 경쟁 우위 소구
banner-seasonal-coupon-split { bgImage?(url), eyebrow?, title(em,br), period?, coupons(2~2)[label?,value(em,br),unit?,note?], panelNote? }   // 시즌 배너 상하 분할: 상단 포토+대형 타이틀+기간 pill / 하단 패널 쿠폰 2장 가로 배치
banner-seasonal-wreath { label?, discountRate, discountUnit?, period?, wreathTL?(url), wreathTR?(url), wreathBL?(url), wreathBR?(url) }   // 계절 소재 이미지 4장을 사방 화환 테두리로 배치하고 중앙에 초대형 할인율+날짜를 표시하는 시즌 배너
banner-event-twozone { eventBadge?, titleAccent, titleDark?, productImage?(url), subtitle?(em,br), bgColor? }   // 기념일 2존 배너 — oval 날짜 뱃지 + 영문 대형 2줄 타이틀(accent/ink) + 3D 상품 이미지 하반부
banner-image-dominant { subLabel?, image?(url), imageAlt?, badgePrefix?, badgeNumber?, badgeSuffix?, title(em,br), period?, decoCount? }   // 이미지 도미넌트 기념일 배너: 파스텔 배경 + 상품 이미지 중앙 지배 + 할인 뱃지 오버레이 + 상단 서브라벨 pill + 하단 대형 한국어 타이틀 + 기간 pill
hero-circle-check { subtitle?(em,br), productName(em,br), brandLogo?, productImage?(url), points(2~4)[text(em,br)] }   // 다크 그라데이션 상단(손글씨 부제+제품명) + 라벤더 말풍선 브랜드+원형 이미지 + accent 체크리스트 인트로
hero-pedestal { productImage?(url), subtitle?(em,br), productName(em,br), points(2~4)[label?, desc(em,br)] }   // 3D 원통 받침대 위 제품 이미지 + accent 그라데이션 컬러 밴드 제목 + Point 번호형 설명 리스트 3단 인트로
hero-thumb-list { brand?, headline(em,br), heroImage?(url), productName(em,br), points(2~4)[label?, desc(em,br), image?(url)] }   // 브랜드 필+대형 헤드라인+메인 히어로(accent 원형 배경)+제품명 배너+포인트별 번호·설명·썸네일 행 목록
hero-card-stack { brand, subtitle?(em,br), title(em,br), heroImage?(url), cards(2~4)[label?, desc(em,br)] }   // 장식 원형 도형 배경 위 대형 타이포 제목 + 히어로 이미지 + 전폭 카드 스택 히어로
hero-card-wrapper { brandLogo?(em,br), headline(em,br), subtitle?(em,br), productImage?(url), bullets(2~4) }   // 단일 라운드 컬러 카드 래퍼 — 브랜드 로고(외부) + accent 카드 안에 헤드라인·부제목·이미지·불릿 리스트 포함
hero-stripe-points { brand?, title(em,br), subtitle?(br), heroImage?(url), points(2~4)[label?, desc(em,br)] }   // 체커보드 스트라이프 구분 띠 + 번호 텍스트 블록 히어로
hero-connector-split { productName(em,br), subtitle?(em,br), heroImage?(url), brand, title(em,br), items(2~4)[image?(url), desc(em,br)] }   // 상단 영문 제품명+풀폭 이미지 → 수직 커넥터 라인 → 하단 브랜드+대형 제목+원형 썸네일 번호 목록
hero-circle-bg { brand?, productImage?(url), productName(em,br), description?(em,br), points(2~4)[{desc(em,br)}] }   // 대형 단색 원 배경 위 제품 이미지 오버랩 + 번호형 포인트 리스트 인트로
hero-check-rows { brand?, sub?(em,br), title(em,br), rows(2~4)[{ text(em,br) }], productImage?(url) }   // 브랜드 컬러 풀배경 히어로: 브랜드명+구분선+소제목+대형 제목 → 전폭 흰 체크마크 배지 행 2~4개 → 하단 제품 이미지
hero-bubble-points { eyebrow?, subtitle?(em,br), productName(em,br), bubbles(2~4)[text(em,br)], productImage?(url), brandLogo? }   // 포인트 텍스트 담은 3개 원형 버블이 중앙 제품 이미지 주변(좌·상·우)에 배치된 인트로 히어로
hero-numbered-cols { brandLogo?, subtitle?(em,br), productName(em,br), productImage?(url), cols(2~4)[desc(em,br)] }   // accent 풀배경 히어로: 브랜드 바 + 부제목 + 대형 제목 + 풀폭 이미지 + 01/02/03 세로 구분선 3열
stats-bento-grid { eyebrow?, headline(em,br), badge?, cards(2~4)[label, value(em,br), image?(url)] }   // 상단 accent 밴드(이브로우+대형숫자) + 2~4개 카드 체커보드(홀짝 텍스트↔이미지 교차) + BEST 뱃지
stats-header-card-stack { dividerLabel?, headline(em,br), cards(2~4)[headerLabel, image?(url), value(em,br)] }   // 라이트 배경 세로구분선+대형숫자 헤드라인 위, 컬러헤더바·이미지·흰값바 3레이어 카드 스택
stats-circle-stagger { label?, headline(em,br), items(2~4)[eyebrow?, value(em,br), image?(url)], symbolImage?(url) }   // 다크 배경 + pill 라벨 + 대형 숫자 헤드라인 + 원형 사진 스태거드 카드 + 하단 트로피 심볼
stats-icon-blocks { eyebrow?, headline(em,br), blocks(2~4)[label, value(em,br), image?(url)] }   // accent 풀배경 헤드라인 + 번호·라벨·이미지 내장 풀폭 블록(2~4개) + 흰 수치 밴드
stats-text-only { symbolImage?(url), rows(label,value(em,br) 2~4), podiumImage?(url) }   // 다크 배경 pill 라벨 + Cafe24 대형 수치 순수 타이포 스택
feature-captionbar { eyebrow?, title(em,br), items(2~4)[subtitle(em,br), image?(url), caption(em,br)] }   // 특장점 자막바 반복 — 소제목 뱃지+풀폭 이미지+하단 다크 자막바 그룹을 2~4회 반복하는 프리미엄 내러티브 섹션
feature-ribbon-cards { eyebrow?, title(em,br), cards(2~4)[badge?, subtitle(em,br), image?(url), desc?(em,br)] }   // 리본 배지 카드 스택 — 번호 리본 배지가 상단에 오버랩된 세로 카드 3장 + 이미지 + 소제목 + 설명
feature-why-iconlist { headline(em,br), image?(url), eyebrow?, title(em,br), badgeIcon?, items(2~4)[icon, subtitle(em,br), desc?(em,br)] }   // 대형 영문 질문 헤드라인 + 와이드 이미지 + 아이브로/대제목 + 흰 패널 내 배지 아이콘 + 아이콘·소제목·설명 카드 행 2~4개
feature-spoke-diagram { eyebrow?, title(em,br), productImage?(url), spokes(3)[subtitle(em,br), desc?(em,br)], closer?(em,br) }   // 특장점 삼각형 스포크 다이어그램: 중앙 제품 이미지 + 삼각 꼭짓점 3개 콜아웃 노드 + 마무리 카피밴드
feature-wave-table { heroImage?(url), subtitle?, title(em,br), rows(2~4)[label(em,br), desc(em,br)] }   // 풀블리드 히어로 이미지(하단 웨이브 SVG 컷) + accent 배경 + 중앙 서브/대제목 + 2열 테이블 행 2~4개
feature-dark-inset-card { title(em,br), subtitle?, items(2~4)[heading(em,br), desc?(em,br)], image?(url) }   // 다크 배경 + 라이트 인셋 카드(번호 뱃지 행) + 하단 제품 이미지
ingredient-radar { eyebrow?, title(em,br), subtitle?, radarImage(url)?, items(2~6)[icon?, label(em,br), desc?(em,br)] }   // 레이더차트+체크리스트 원료 소개: 영문 뱃지·대형 컬러 제목·오각형 차트 이미지·흰 카드 아이콘·라벨·설명 행
ingredient-rule-grid { title(em,br), subtitle?, items(2~4)[icon?, label(em,br), desc?(em,br)], closerLight?, closerBold?(em,br) }   // 헤어라인 룰만으로 나뉜 2×2 아이콘 그리드 원료 소개 (이미지 없음, 아이콘+라벨+설명, 2행 클로저)
ingredient-ellipse-zigzag { eyebrow?, title(em,br), subtitle?, items(2~4)[label(em,br), desc?(em,br), image?(url)], closer?(em,br) }   // 타원 이미지 지그재그: 4개 원형 이미지 좌우 교대 + 라벨·설명, 라이트 배경
ingredient-photo-grid { eyebrow?, heroImage?(url), title(em,br), subtitle?, items(2~4)[label(em,br), desc?(em,br)], closer?(em,br) }   // 풀블리드 사진 + 2×2 다크 번호 카드 원료 소개 섹션
ingredient-editorial-hero { heroImage?(url), heroTitle(em,br), eyebrow?, title(em,br), items(2~4)[image?(url), label(em,br), desc?(em,br)], closer?(em,br) }   // 풀블리드 히어로 헤드라인 오버레이 + 원형이미지·라벨·설명 2열 스플릿 행 + 다크 클로저 배너
usage-card-number { title?, subtitle?, steps(2~4)[label(em,br), desc?(em,br)], closer?(em,br), closerEmphasis?(em,br), image?(url) }   // 라이트 배경 + 영문 대제목 + 각 단계 흰 카드(좌측 초대형 숫자·우측 설명) 세로 나열 + 마무리 카피+이미지
usage-pill-steps { title?(em,br), subtitle?(em,br), headerImage?(url), steps(2~6)[label?, text(em,br)], closer?(em,br) }   // 배경이미지 헤더 + 타원 outline pill 세로 적층 스텝 + 하단 마무리 배너
usage-text-rows { title?(em,br), tagline?, heroImage?(url), steps(2~6)[label?, desc(em,br)], closer?(em,br) }   // 텍스트 전용 구분선 행+인용부호 사용법 — HOW TO USE 좌 대형 타이틀 + 우 히어로 이미지 + 헤어라인 + STEP 행(라벨·설명·우측 닫는따옴표 장식)
usage-dark-bands { title?, subtitle?, steps(heading(em,br), body(em,br))(2~4), closer?(em,br), closerAccent?(em,br) }   // 다크 배경+전폭 accent 직사각형 밴드 중앙 2줄 텍스트 사용법 블록
usage-photo-card { bgImage?(url), title?(em,br), subtitle?, bannerText?(em,br), steps(2~4)[image?(url), label?, title(em,br), desc?(em,br)] }   // 배경 사진 위 프로스티드 카드 패널에 단계별 원형 이미지+STEP 배지+설명을 나열하는 HOW TO USE 섹션
usage-photo-thumb-list { bgImage?(url), title?(em,br), subtitle?, closer?(em,br), steps(2~4)[image?(url), label?, title(em,br), desc?(em,br)] }   // 풀블리드 히어로 배경 사진+CTA 오버레이 상단, 원형 썸네일+STEP 리스트 하단
review-collage { eyebrow?, title(em,br), subtitle?, productImage?(url), reviews(2~4)[text(em,br), stars?, rotate?] }   // 말풍선 콜라주형 리뷰 — 좌정렬 대제목 + 제품 이미지 위 자유 각도 말풍선 4개 겹침
review-text-rows { productImage?(url), title(em,br), subtitle?, rows(2~4)[line1(em,br), line2?(em,br)], statQuote?(em,br) }   // 다크 방사 배경+트로피 제품 이미지+대형 제목+카드 없는 텍스트 pill 행+대형 따옴표 인정 stat
review-stacked-pairs { eyebrow?, subtitle?(em,br), title(em,br), reviews(2~4)[body(em,br)], cta?(em,br) }   // 중앙정렬 헤더 + 좌정렬 별점 행+전체폭 텍스트 카드 쌍 반복 + accent CTA 배너 (이미지 없음)
review-divider-list { image?(url), title(em,br), subtitle?, reviews(2~4)[rating?, text(em,br)], closer?(em,br) }   // 반원 이미지 블리드 + 별점·텍스트 행 구분선 미니멀 리스트 + 인정 카운트
compare-hero-table { title(em,br), subtitle?, heroImage?(url), sectionLabel?, beforeLabel?, afterLabel?, rows(2~4)[before(em,br), after(em,br)], closer?(em,br) }   // 히어로 이미지(원형 accent 배경) + Before&After 라벨 + 비대칭 플랫 테이블(좁은 BEFORE / 넓은 accent AFTER) + 클로징
compare-phone-mockup { badge?, title(em,br), subtitle?, beforeLabel?, beforeIcon?, beforeItems(2~4)[text(em,br)], afterLabel?, afterIcon?, afterItems(2~4)[text(em,br)], afterCta?, closer?(em,br) }   // 세로 오프셋 폰 카드 2개(BEFORE X아이콘·그레이/AFTER 하트·accent·CTA버튼) + 다크 마무리 배너, 이미지 슬롯 없음
compare-hero-panels { eyebrow?, title(em,br), subtitle?, afterLabel?, beforeLabel?, afterImage?(url), beforeImage?(url), vsLabel?, afterRows(2~5)[text(em,br)], beforeRows(2~5)[text(em,br)], closer?(em,br) }   // 풀배경 히어로 + 아이브로 필 뱃지 + 오프셋 AFTER/BEFORE 패널 + VS 원형 뱃지 + 클로징
compare-staggered-banners { title(em,br), subtitle?, beforeLabel?, afterLabel?, vsLabel?, pairs(em,br)(2~4) { beforeText(em,br), afterText(em,br) }, closer?(em,br) }   // 엇갈림 배너 스트립: 대제목+서브 → BEFORE(좌 오프셋)+VS 원+AFTER(우 오프셋) 쌍 반복(2~4) → 하단 클로저. 이미지 없음.
package-zigzag-circle { title?(em,br), subtitle?, packages(2~4)[name(em,br), desc?(em,br), priceOriginal?, price?, image?(url)] }   // 지그재그 원형 이미지 패키지 구성 — 홀수/짝수 행 좌우 교대 원형 제품 이미지 + accent 틴트 pill-band + 이름·설명·가격
package-hero-fade-list { subtitle?, title?(em,br), heroImage?(url), sectionLabel?, packages(2~4)[name(em,br), desc?(em,br), priceOriginal?, price?] }   // accent 페이드 히어로+흰 웨이브 오버레이 + OUR PACKAGE 섹션 라벨 + 텍스트 전용 패키지 가격 리스트
package-offset-image-rows { title?(em,br), subtitle?, packages(2~4)[image?(url), name(em,br), desc?(em,br), priceOriginal?, price?] }   // 이중 수평선 + 좌정렬 대형 제목 + 좌 오프셋 이미지·우측 우정렬 이름/설명/가격 패키지 행 리스트
package-ticket-podium { eyebrow?, title?(em,br), hero { name(em,br), desc?(em,br), image?(url), priceOriginal?, price?, best? }, cards(2~4) [{ name(em,br), desc?(em,br), image?(url), priceOriginal?, price?, best? }] }   // 티켓 카드+연단: 라벤더 연단 히어로+대형 제목+큰 메인 티켓(BEST 배지·원형 이미지·가격)+하단 2열 작은 티켓 카드
story-curve-panel { heroImage?(url), eyebrow?(em,br), titleLine1(em,br), titleLine2?(em,br), paragraphs(em,br)(1~3) }   // 풀블리드 이미지 상반 + 우상단 큰 라운드 코너 흰 패널 오버랩 곡선 전환 브랜드 스토리
story-wave-split { heroImage?(url), decoText?, title(em,br), paragraphs(em,br)(1~3) }   // 풀블리드 이미지+EN 장식 텍스트 → SVG 웨이브 전환 → accent 솔리드 패널(KR 헤드라인+본문)
story-arch-image { enLabel, image?(url), titlePre?(em,br), titleBold(em,br), paragraphs(1~3,em,br) }   // 아치/pill 이미지 + 영문 라벨 오버레이 + 중앙 KR 제목 + 중앙 본문 브랜드 스토리
story-highlight-box { heroImage?(url), titleLine1(em,br), titleLine2(em,br), titleLine3?(em,br), paragraphs(em,br 1~3), accentHeadline(em,br) }   // 풀블리드 이미지 + EN 3행 타이틀(중간 행 accent 하이라이트 바) + 본문 + 하단 accent 배경 KR 헤드라인 박스
story-centered-secondary-image { label?, titlePre?, titleBold(em,br), titlePost?, paragraphs(em,br)(1~4), secondaryImage?(url), secondaryImageAlt? }   // 배경 텍스처 + 중앙정렬 EN 라벨(상하 HR) + 혼합굵기 KR 제목 + 중앙정렬 본문 + 하단 보조 제품 이미지
faq-box { eyebrow?, title?(em,br), items(2~8)[q(em,br), a(em,br)], decorImage?(url) }   // 단일 외곽선 카드 컨테이너형 FAQ — 모든 Q/A를 하나의 둥근 테두리 박스로 감싸고 항목 사이 수평 헤어라인으로만 구분
faq-badge-row { eyebrow?, title?, items(2~6)[q(em,br), a(em,br)] }   // 원형 Q 배지 + Q/A 구분선 카드 행 FAQ — 라이트 배경·체커보드 헤더·대형 FAQ. 제목 → 카드별 accent 원형 Q 배지·굵은 질문·헤어라인·A 라벨·답변 행
faq-glyph-box { heading?, items(q, a(em,br))(2~8) }   // accent 직사각형 배너 헤딩 + 대형 Q.글리프+볼드 질문 행 + 라운드 박스 답변 반복 FAQ
faq-pill-bar { eyebrow?, title?(em,br), heroImage?(url), items(2~6)[q(em,br), a(em,br)] }   // 전폭 솔리드 Q바 + 중앙 A형 FAQ: 히어로 이미지 + 좌상단 FAQ 헤더 + ink 다크 pill 바 질문 + 박스 없는 중앙 답변 반복
hero-photo-quote { subcategory?, productName(em,br), heroImage?(url), quote(em,br), stories(2~4) }   // 전체 배경 사진 + 상단 제품명 오버레이 + 하단 accent 패널 따옴표 인용구 박스 + 스토리텔링 히어로
hero-photo-dual-stack { brandLogo?, productName(em,br), tagline?, image1(url)?, ghostNumber?, image2(url)?, roleHeadline(em,br), story?(em,br) }   // 두 사진 세로 스택 + 고스트 넘버 에디토리얼 히어로
hero-photo-dual-offset { brand, productName(em,br), subtitle?(em,br), heroImage?(url), pointLabel?, pointText(em,br), insetImage?(url) }   // 풀블리드 그라데이션 헤더 + 메인 사진 + 하단 좌 포인트 텍스트·우 오프셋 인셋 사진 듀얼 구조 히어로
hero-photo-circle { productName(em,br), subtitle?(em,br), productImage?(url), brandLogo?(url) }   // 초대형 원형 마스크 안 제품 사진 + accent 컬러 스트립 + 브랜드 로고 인트로
hero-photo-pinned { brandLogo?, subtitle?, productName(em,br), heroImage?(url), whyTitle?, whyDesc?(em,br) }   // accent 풀컬러 배경 + 블랙 상단 바 + 핀 장식 정사각 인셋 사진 + 하단 WHY 패널
hero-photo-blob-split { brandLogo?, heroImage?(url), productName(em,br), desc?(em,br) }   // 상반 풀블리드 사진+브랜드로고, 하반 대형 둥근 블롭 위 좌정렬 제품명·설명 분할 히어로
hero-photo-glass-card { brandLogo?(url), heroImage?(url), productName(em,br), whyLabel?, desc(em,br), insetImage?(url) }   // 전체 배경 사진 위 프로스트 글래스 카드(제품명+WHY+설명) + 상단 브랜드 로고 + 우하단 인셋 사진
gallery-stagger-rounded { sectionSub?, sectionTitle, images(2~4)[image?(url), alt?] }   // 엇갈림 대형 라운드 갤러리: 좌정렬 헤더 + 큰 라운드 이미지 2–4장 좌/우 오프셋 엇갈림, 캡션 없음
gallery-color-panel { panels(2~4): { heading, subtitle?(em,br), image?(url), imageAlt? } }   // 교대 풀폭 컬러블록 2–4패널: 중앙 대형 영문 제목 + 부제 + 정사각 이미지
gallery-arch-grid { eyebrow?, heading?(em,br), heroImage?(url), optionLabel?, images(url,2~4)[{ image?(url), caption? }] }   // 히어로 풀폭 이미지 + 디스플레이 헤딩 + 타원 Option 라벨 + 2×2 아치형 이미지 그리드
gallery-barframe-card { subtitle?, heading(em,br), cards(2~4)[label(em,br), image?(url), imageAlt?, caption(em,br)] }   // 상+하 accent 컬러바로 프레임된 풀폭 이미지 옵션 카드 갤러리 (2–4개 세로 스택)
gallery-halfwidth-stagger { heroImage?(url), heroTitle(em,br), heroSub?, panels(2~4)[image?(url), alt?, label?(em,br), title(em,br), desc?(em,br)] }   // 히어로 풀폭(그라데이션+대형제목) + 반폭 이미지 좌우 교대 + 옆 플로팅 라벨·제목·설명
event-coming-soon-teaser { eyebrow?, headline(em,br), image?(url), bullets(1~4)[icon?,text(em,br)], body?(em,br) }   // 날짜 eyebrow + 대형 예고 헤드라인 + 3D 이미지 + 번호/아이콘 블릿 + 안내 본문으로 구성된 커밍순 티저 블록
event-reopen-price-strip { eyebrow?, title(em,br), image?(url), bubbles(2~4)[text(em,br)], ribbonLabel?, productName?, originalPrice?, salePrice }   // 재오픈 이벤트: 라이트 그라데이션 배경 + 대형 헤드라인 + UI 목업 이미지 + 말풍선 후기 리스트 + 한정 리본 태그 + 정가→할인가 가격 스트립
event-hero-price-cta { eyebrow?, headline(em,br), priceNumber, priceUnit?, ctaText(em,br), ctaSub?, image?(url), disclaimers?(1~4) }   // 풀스크린 다크 그라디언트 + 거대 3D 가격 + 단일 CTA + 약관 밴드 이벤트 히어로
cert-pedestal { heading?, subtitle?, certs(labelTitle(em,br), labelNote?(em,br), image?(url))(2~4) }   // 다크 스튜디오 받침대 위 인증서 교번 진열 (사선 라벨 연결 + 홀로그램 씰)
cert-clipboard { title?, subtitle?(em,br), cards(1~3)[title(em,br), image?(url), caption?, sealText?] }   // 클립보드 래퍼 안 인증서 카드 1~3장 + CERTIFIED 씰 스탬프
discount-coupon-grid { tickerText?, heroImage1?(url), heroImage2?(url), headline(em,br), subCopy?, coupons(2~4)[couponLabel?,rate,target?], closingCta?(em,br), period? }   // 3D 일러스트 히어로 + 2쿠폰 카드 그리드형 할인 섹션
discount-event-billboard { tickerText?, preTitle?(em,br), eventName, eventNameLine2?, prop1Image?(url), prop2Image?(url), benefits(2~4)[text(em,br)], period?, closing(em,br) }   // 이벤트 빌보드: 다크 배경 + 반복 ticker + 초대형 이벤트명 + 소품이미지 2장 + 혜택 pill 3행 + 기간·클로징
discount-price-bullets { bgImage?(url), eyebrow?, headlineSub?, headline(em,br), originalPrice?, originalLabel?, salePrice, saleLabel?, bullets(em,br)(2~4), period? }   // 다크 포토BG + eyebrow pill + 2줄 헤드라인 + 정가취소선→쿠폰 티켓 가격비교 행 + bullet 혜택 행 + 날짜 풋노트
shipping-chapter-hero { chapterNumber?, title(em,br), eyebrow?, image(url)?, badgeIcon?, daysLabel, daysNote?, closing(em,br) }   // 챕터번호 히어로+풀폭 배송사진+다크 패널 타임라인(아이콘배지·소요일·클로징)
detail-steps-support { stepsEyebrow?, stepsTitle(em,br), stepsSubtitle?(em,br), steps(2~4)[label, image?(url)], supportTitle(em,br), supportSubtitle?(em,br), supports(1~6)[label, body(em,br)], processTitle?, processSteps(2~6)[icon?, label] }   // 번호 배지 2열 단계 사진 + 구매 후 지원 브래킷 행 + 아이콘 AS 프로세스
detail-dimension-faq { sectionTitle?, dims(url,widthLabel?,heightLabel?)(2), faqHeadingTop?, faqHeadingBottom(em,br), faqs(question,answer(em,br))(2~8) }   // 제품 사이즈 도면 2개(치수선 레이블) + FAQ 워터마크 배경 + Q&A 아코디언 리스트
detail-package-faq { sectionTitle?(em,br), mainItems(1~3)[name,weight?,image?(url)], components(2~6)[name,weight?,image?(url)], ctaText?, qaTitle?, faqs(2~6)[question(em,br),answer(em,br)] }   // 상품 구성표(메인 이미지 2열+소구성품 그리드) + pill 안내 문구 + 카드형 Q&A 리스트
detail-hero-info-table { heroBg?(url), heroHeadline(em,br), heroTagline?(em,br), productImage?(url), sectionLabel?, rows(2~12)[label, value(em,br), label2?, value2?(em,br)] }   // 풀블리드 히어로+헤드라인 → 제품 이미지 오버랩 전환 → 라벨|값 2열 제품정보 표
detail-editorial-venn { headline(em,br), body(em,br), body2?(em,br), circles(2~4)[image?(url), label(em,br)] }   // 에디토리얼 헤드라인 + 겹치는 원형 이미지 3개 벤다이어그램 제품 설명 섹션
banner-seasonal-arch { bgImage?(url), eyebrow?, month?, title(em,br), period?, discountRate?, discountLabel? }   // 포토 배경 + 아치형 반투명 컨테이너(이벤트 라벨·월 숫자·제목·기간 pill) + 좌하단 할인 뱃지
banner-seasonal-illustration { dateBadge?, titleKr(em,br), titleEn(em,br), illustrationImage?(url), bgColor?, badgeColor? }   // 전면 계절 일러스트 배경 + 상단 날짜 바 + KR+EN 대형 타이틀 시즌 배너
banner-seasonal-dark-coupon { subtitle?, titleLine1(em,br), titleLine2?(em,br), couponValue, couponUnit?, couponNote?, period? }   // 짙은 배경+원형 후광+CSS 눈송이+대형 2줄 타이틀+하단 단일 쿠폰 티켓(절취선) 겨울 시즌 배너
banner-dark-promo { patternText?, subhead?(em,br), titleLine1(em,br), titleLine2?(em,br), propLeft?(url), propRight?(url), propAccent?(url) }   // 다크 BG + 반복 텍스트 패턴 텍스처 + 영문 대형 2줄 타이틀 + 3D 소품 3개 산재 블랙프라이데이 배너
callout-coupon-channel { channelHandle, headline(em,br), couponValue, couponSub?, benefitLine?, couponTabLabel?, statNumber?, statLabel? }   // 채널 친구추가 유도 배너: 좌 CSS 폰 목업 + 채널 검색 UI, 우 절취선·CSS 바코드 티켓형 쿠폰
callout-painpoint-cards { bubble, titleSub(em), titleMain(em), image?(url), items(2~4)[text(em,br), highlightWidth?]   // 브리프에 근거 있을 때만, desc?(em,br), accent?(em,br)   // 브리프에 근거 있을 때만 }   // 말풍선 질문 헤드 + 전폭 사진 + 형광펜 카드 리스트 + 강조 박스
cert-list-badges { eyebrow?, title(em,br), items(2~4)[heading(em), body(em), certNumber?, image?(url), badgeArcTop?, badgeArcBottom?, badgeValue?] }   // 인증 3행 리스트(좌 사진+우 텍스트) + 각 행 좌하단 동심원 뱃지 오버랩. 수치·후기성 슬롯(certNumber, badgeValue)은 브리프에 근거 있을 때만.
cert-spotlight-zoom { title(em,br), subtitle?, image?(url), zoomText?(em,br), zoomLabel? }   // 딥 톤 배경 + 인증서 카드 + 하단 확대 강조 패널 (zoomText·zoomLabel은 브리프에 근거 있을 때만)
closing-quote-photo { bgImage?(url), subHead(em), title(em), desc?(em,br), photoLeft?(url), photoRight?(url), badge? }   // 풀블리드 배경사진+다크스크림 위 인용부호·구분선·대형헤드라인 스택, 좌우 원형사진 2장, 수치·후기성 badge는 브리프 근거 시만
compare-asym-panels { badge?, title(em,br), desc?, ourLabel, theirLabel, rows(2~6)[criterion, ours(em), theirs], footNote? }   // 3열 비대칭 비교 패널 — 자사 강조열(넓음·accent 배경)·기준열(중앙)·경쟁사열(좁음), VS 뱃지 없이 폭 대비로 우위 표현, 수치·후기 슬롯은 브리프에 근거 있을 때만
compare-bar-years { title(em,br), subtitle?, bars(2~5)[period, label, value(1~100), highlight?, note?], caption?, sourceNote? }   // 수직 막대 CSS 차트로 기간·수명·수치를 비교. note·sourceNote는 브리프에 근거 있을 때만.
point-metric-badge { chip?, title(em,br), desc?, image?(url), badgeValue?(근거수치), badgeUnit? }   // 흰 라운드 카드+원형 사진 오버랩, 이중링 수치뱃지 카드-사진 경계 오버랩
shipping-numeral-schedule { title(em,br), normalDate?(브리프 근거 시만), normalLabel?, normalResult?, delayDateA?(브리프 근거 시만), delayDateB?(브리프 근거 시만), delayReason?, delayResume?, footer?(em,br) }   // 80pt 대형 숫자 2행 타임라인(정상·지연 날짜 대비) + 하단 창고·배달부 인라인SVG 전경. 흰 배경 라이트.
award-sales-float-badges { productName(em), milestoneText(em,br), image1?(url), image2?(url), image3?(url), badge1Label?, badge1Sub?, badge2Label?, badge2Sub?, awards(2~6)[string(em)], starCount?(3~7) }   // 검정 배경 + 그라디언트 판매 돌파 헤드라인 + 제품 이미지 1~3컷 + CSS 수상 배지 2종 플로팅 + 수상 이력 리스트
award-serif-gold-decl { tagline(em), authority(em), awardTitle(em), awardCategory?, bgImage?(url) }   // 배경 이미지 전면 + 세리프 골드 그라디언트 텍스트로 수상 선언; 이미지 없으면 딥 다크 배경 강등
award-stage-burst { eyebrow?, title(em,br), subtitle?(em), awards(1~5)[year, name, category?], badge?, badgeSub? }   // 다크 스테이지 배경 + 중앙 원형 파티클 폭발 + 좌우 트로피 실루엣 + 꽃다발 — 수상 이력·권위 강조
award-star-rank { categoryLabel, countText, headline(em), rankDecl, subline?(em), productImage?(url), shopItems(1~4)[name, price, image?(url), desc?], awardCategory, awardLabel }   // 다크 그라디언트 + 글자별 인라인 별표 타이포로 1위 달성 선언 + 쇼핑몰 카드 그리드 + 수상 배지 띠
award-trophy-flanked-stat { sinceYear?, bannerSlogan?, brandLine1(em), brandLine2(em), reviewLabel?, reviewValue?(em, 브리프 근거 시만), reviewSuffix?, salesLabel?, salesMain?(em, 브리프 근거 시만), salesSub?(em), awards(2~4)[awardBody, awardName] }   // 좌우 트로피 플랭킹 + 배너바 + 누적판매 대형 수치 + 하단 2열 수상 카드
award-trophy-orb-flanked { title(em,br), subtitle?(em), badge?, image?(url), awards(1~4)[name, year?] }   // 좌우 황금 트로피가 중앙 광택 구체를 프레임처럼 감싸는 3요소 오버랩 어워드
banner-category-counter { label(em), count(number), unit?, sub? }   // 와이드 카테고리 섹션 구분자: 대형 카테고리명(좌) + 원형 도트·수량 숫자·단위 레이블(우) 한 줄 배치
banner-grand-mosaic { brandLine(em), headlineTop(em), headlineBottom?(em), desc?(em,br), heroImage?(url), categories(2~6)[string], mosaicLeftTop?(url), mosaicLeftBottom?(url), mosaicRight?(url) }   // 그랜드 오픈 공지: 다크 배경 + 그라디언트 헤드라인 + 와이드 대표이미지 + 카테고리 행 + 비대칭 3컷 모자이크(좌2단+우세로)
cert-badge-split { badgeLine1(em), badgeLine2(em), headline(em,br), body(em,br), subDesc?, warningTitle(em,br), warningBody(em,br), legalNote? }   // 다크 배경 분할형 정품 인증: 좌 그라디언트 배지 + 우 카피 + 하단 경고 카드
cert-point-badge-stack { headLight(em,br), headBold(em,br), desc?, watermark?, points(2~5)[label, title(em), sub?], cardImage1?(url), cardImage2?(url), cardImage3?(url) }   // 연핑크 배경 + 초대형 워터마크 + 좌측 오각형 뱃지 Point 목록 + 우측 3단 적층 인증카드
checklist-radial-ledger { eyebrow?, title(em,br), image?(url), items(3~6)[icon, label, text(em,br)] }   // 제품 이미지 중심 방사형 아이콘(상단) + 구분선 레저 목록(하단) 이중 구조. 연파랑 배경. 이미지 없으면 빈 원 강등.
compare-package-grid { headline(em,br), subheadline?(em,br), p0{ name, subName?, image?(url), accentColor? }, p1{ name, subName?, image?(url), accentColor? }, p2{ name, subName?, image?(url), accentColor? }, rows(2~10)[label, v0(check|x|text), v1(check|x|text), v2(check|x|text)], note? }   // 3제품 세로 패키지 이미지 나란히 + 다항목 체크/X 비교 테이블 통합 — 연파랑 배경, 제품별 색상 컬럼 헤더
cs-green-label-table { sectionTitle, rows(2~6)[label, value(br)], noticeTitle?, noticeBody(br), bannerText, phoneLabel?, phoneNumber?, phoneHours? }   // 초록 Bold 레이블 좌열+본문 우열 2열 정보 테이블 + 라운드 주의사항 박스 + 전폭 그린 CTA 배너 + 상담전화 행
cs-notice-typo-split { headline(em,br), calTitle(em,br), weeks[day,red?](1~5행×7열), ranges?[colStart,colEnd,row,label](최대4), markers?[day,label?](최대3), noticeBody(em,br), contactLine? }   // 좌측 fs96 에디토리얼 타이포 + 우측 7열 달력(범위바+다크원) + 하단 다크 안내 패널 배송공지 CS 블록
cs-schedule-divider { logoText?, sectionTitle(em불가), tagline?(br허용), rows(1~8)[day, time], notices?(최대4), address?, phone? }   // 수직 구분선 2열 진료일정 표 + 하단 주소·전화 아이콘 행
cs-slogan-info-table { slogan(em,br), logoText?, contact?, rows(2~9)[label, value(em), sub?] }   // 다크 슬로건 히어로 + 다크 뱃지 레이블·인라인 값 정보행 테이블 채용공고형 CS 레이아웃
discount-bolt-split { eventBadge?, brandName, leftWord, rightWord, discountRate?, image?(url), subCopy?(em), originalPrice?, eventLabel?, eventPrice?, finalLabel?, finalPrice?, benefits(2~3)[label, value] }   // 다크 그라디언트 + 초대형 브랜드명 + 파격[번개SVG]할인 타이포 분할 + 마스크 이미지(noimg-safe) + 3단 가격 + 3열 혜택 카드
event-poly-price-list { eventName(em,br), period?, headerImage?(url), items(1~6)[name(em), regularPrice, salePrice, discountRate, image?(url)] }   // 다크 그라디언트 헤더 + 흰 카드 3행 가격표, 삼각형 폴리곤 할인율 뱃지 우측 돌출
event-sale-asymcollage { tagline(em), brandName(em), period?, discountRate?, capsuleLabel?, imagePortrait?(url), imageSquare?(url), imageRect?(url) }   // 시즌 세일 비대칭 콜라주: 그라디언트 배경 + 초대형 타이포 헤더 + 좌측 세로 의류 이미지 + 우측 정방형·직사각형 이미지 스택 + 캡슐 버튼 + 별 할인 배지
event-spotlight-type { heroText(em,br), image?(url), subhead(em), desc?, dateRange }   // 검정 배경 + 스포트라이트 이미지 오버레이 + 3줄 초대형 디스플레이 타이포 + 날짜 행(수평선 사이)
event-stage-pillar { eyebrow?(em,br), dateDisplay(em,br), eventName(em,br), hoursLine?, badgeText?, image?(url), menuLabel?(em,br), menuName?(em,br), menuPrice? }   // 좌우 1px 수직 기둥선+수평 교차선 무대 프레임, 전면 이미지 위 다크 스크림, 날짜·이벤트명·배지·메뉴 분산 배치
faq-expert-card { sectionTitle(em), sectionDesc?, profileImage?(url), profileName?, profileRole?, pairs(1~4)[question(em,br), answer(em,br)] }   // 원형 전문가 프로필+직함 뱃지 + 흰 카드 내 핑크 Q. 접두 Q&A 세트 나열
faq-side-portrait-oval { brandLeft?, brandRight?, question(em,br), questionNote?, answerHead(em,br), answerBody(em,br), portraitImage?(url), cutoutImage?(url) }   // 크림 배경 + 우측 세로 인물 이미지 오버랩 + 하단 타원 그레이 도형 + 인물 컷아웃 장식, 단일 Q&A 라이트 톤
feature-bookmark-compare { headline(em,br), pill1?, pill2?, subDesc?, cards(2)[tag, icon?(enum), body(em,br), foot?], caption? }   // 다크 네이비 + 그라디언트 제품 헤드라인 + 2열 책갈피 카드(탭·줄무늬·아이콘·회색 푸터)
feature-dark-asymgrid { title(em,br), subtitle?, price?, heroImage?(url), cards(2)[image?(url), heading(em,br), body], features(2~4)[label, text], wideImage?(url), wideHeading(em,br), wideBody? }   // 히어로 이미지+가격 오버레이 → 다크 비대칭 그리드(이미지 카드 2행+텍스트 피처 최대 4행) → 와이드 이미지 카드
feature-dual-mosaic { bgImage?(url), eyebrow?, heading(em,br), subtext?, tallCards(2)[image?(url), title(em,br), desc?], smallCards(2~4)[image?(url), title(em,br), desc?] }   // 다크 전체배경 이미지 위 좌열 대형 2행 카드 + 우열 소형 2~4행 카드 비대칭 모자이크 그리드
hero-kanji-bead { kanjiLine(em), brandLeft(em), brandRight(em), labelEn?(em), headline(em,br), subCopy?(em,br), bgImage?(url), productImage?(url) }   // 다크 히어로: 블랙 배경+상단 마스크 사진+골드 비즈 체인 좌우+한자+한글 세로 타이포+골드 그라디언트 카피
hero-typo-frame { topWord, bottomWord, marqueeText, headline?(em), copy(em), image?(url) }   // 초대형 영문 타이포가 중앙 이미지를 위아래 프레임하고 좌우 세로 마퀴 스트립이 경계선을 형성하는 에디토리얼 다크 히어로
ingredient-badge-table { headline(em,br), bgImage?(url), badges(1~5)[label, value, color?], rows(1~16)[name, amount, pct?, highlight?], footnote? }   // 풀블리드 배경이미지 + 원형 영양소 배지 + 교차 하이라이트 성분표
ingredient-dot-nav-mint { productName, productDesc?, tags(2~5)[keyword], subHeadline, headline(em,br), badge?, image?(url), closing?(em,br) }   // 민트 배경 + dot+수평선 성분 태그 내비 + 라이트이탤릭 대형 헤드라인(좌) + 제품이미지(우) + 하단 클로징
ingredient-float-overlay { brandName, productName(em), specLine?, image?(url), ingredientTags(1~5)[name, sub?], efficacyBadges(1~4)[label], footnote? }   // 제품 세로 이미지 위 그라디언트 알약 성분 태그 + 흰 효능 배지 플로팅 오버레이, 상단 헤더+스펙, 하단 주석+구분선
lineup-bento-compare { productName(em,br), productDesc?, heroImage?(url), featureATitle(em,br), featureABody?, featureAImage?(url), featureBTitle(em,br), featureBBody?, icons(3~6)[name, label], colorCardTitle, bodyColors(2~5)[label, hex], bandColors(2~4)[label, hex], specCardTitle(em,br), specCardBody?, specImage?(url), lineupTitle?, plans(2~3)[tier, price, image?(url), highlight?] }   // 그라디언트 상단+벤토 그리드(좌 특징2카드+6아이콘 / 우 컬러칩3카드)+하단 3열 라인업 비교
lineup-bento-gradient { productName(em,br), productDesc?, heroImageA?(url), heroImageB?(url), leftTall{ label(em,br), text? }, leftTallImage?(url), leftCollection{ label(em,br), text? }, collectionImages?(url[0~5]), rightCards(2~4)[label(em,br), text?], bottomWide{ label(em,br), text? }, bottomHalf(2)[label(em,br), text?] }   // 상단 모크업 페어 + 비대칭 벤토(좌 대형+컬렉션 / 우 4행 컴팩트) + 하단 와이드·절반 — 다크 그라디언트 라운드 카드
lineup-dark-gauge { subtitle?(em,br), title(em,br), items(1~4)[name(em), image?(url), priceOriginal, priceDiscount, priceEvent, discountRatio(1~99 %), discountLabel?] }   // 다크 배경 + 흰 카드 상품 구성 리스트, 이벤트가 오렌지 게이지 바로 할인 비율 시각화
lineup-gradient-gallery { headline(em,br), sub?, cards(2~6)[label, linkLabel?, image?(url), nextLabel?, gradientFrom?, gradientTo?] }   // 다크 배경 초대형 헤드라인 + 그라디언트 라운드 카드 2행×3열 갤러리
lineup-hashtag-duo { headline(em,br), badge?, bodyText?, cards(1~2)[tags(1~4)[string], image?(url), name(em), subText?, buttonLabel] }   // 슬레이트 다크 2열 카드 — 해시태그행+이미지+제품명+pill버튼 SNS 패키지 선택 UI
lineup-hero-tier-bar { eventName(em,br), periodLabel?, heroBg?(url), heroFigure?(url), tiers(1~2)[barColor?, badgeColor?, tagline(em,br), cards(1~3)[image?(url), name(em,br), discountPct, originalPrice, salePrice(em,br)]] }   // 히어로 오버랩 + 컬러 바 2티어 패키지 라인업
lineup-persona-overlap { title(em,br), subtitle?, date?, personImage?(url), items(2~4)[category, name(em,br), detail?(em,br), discountRate?, discountFill?, image?(url)] }   // 헤더 우측 인물 이미지가 흰 카드 위로 오버랩되는 상품 구성 라인업
lineup-spike-col { title(em,br), subtitle?, highlightIndex?(0-3, 기본2), items(2~4)[name, tags(1~5), image?(url)] }   // 4열 상품 구성, 지정 열 상단에 accent 직사각+우돌출 삼각 스파이크 캡 하이라이트
lineup-tiered-float { title(em,br), options(2~4)[badge, isSpecial?, name(em), desc?, originalPrice?, price, image?(url)], giftLabel?, giftDesc?, giftImage?(url) }   // 좌 정사각 이미지 스택 + 우 뱃지·가격 행 반복 + 우상단 증정품 카드 부유 레이아웃
point-dual-bottle-bloom { title(em,br), subtitle?, desc?(em), badge?(url), bottleLeft?(url), bottleRight?(url), bg?(url), particleColor? }   // 다크 배경 위 두 병 모크업 역방향 기울기+핑크 파티클 산포 뷰티 포인트
point-spec-sandwich { specLabel, specValue(em), specUnit?, headlinePlain, headlineEm(em), body?(em,br), image?(url) }   // 상하 말풍선 배너 샌드위치 + 대형 스펙 수치 오버랩 포인트 섹션
promo-bokeh-card { brand, period?, productName(em,br), benefitPill?, bgImage?(url), cardImage?(url), items(1~6)[name(em), category], note?, priceOriginal?, priceEvent?, priceFinal, discountRate? }   // 전면 배경IMG+CSS 보케 타원 3개 + 흰 플로팅 카드(상품 구성 리스트·취소선 정상가·강조 최종가) + 할인율 배지
reason-alt-rows { sectionNum(기본'01'), headline(em,br), desc?, items(2~4)[num, text(em)] }   // 민트그린 배경 + 좌열 대형 순번·헤드라인 + 우열 2~4행 교차배경(흰/크림) 번호 리스트
reason-bubble-badge-stack { headline(em,br), items(2~6)[badge, text(em,br)] }   // 어두운 주황-갈색 배경 + 대형 제품명 헤드라인 + 말풍선 꼬리+오렌지 원형 배지 카드 수직 스택(좌우 교차)
reason-dot-connector { headline(em,br), subheading?, imageFront?(url), imageBack?(url), points(2~6)[label(em), text(em,br)] }   // 회색 배경 + 좌측 제품 이미지 2장 레이어드 스택 + 우측 흰 원 도트-수평선 커넥터 연결 포인트 목록
reason-numbered-thumb-stack { headSub(em,br), headAccent(em), headPlain?(em), items(2~5)[label(em), text(em), image?(url)] }   // 그라데이션 배경 + 2행 헤드라인(오렌지 강조) + 흰 카드 수직 스택, 각 카드 좌 번호·소제목·설명 + 우 섬네일
reason-staircard-overlap { title(em,br), subtitle?, hashtagBanner?, cards(2~4)[label(em), text(em), image?(url)] }   // 검정 배경 + Bold 헤드라인 + 그라디언트 해시태그 배너 + 흰 카드 4장 계단식 오프셋 + 카드 모서리 밖 제품 이미지 돌출 오버랩
recommend-cross-typo { headerLeft(em), headerRight, locationLabel, image?(url), brandName(em), personName, caption? }   // 좌우 수직 기둥선 프레임 + 브랜드명×인물명 96pt 교차 타이포 + 위치 배너 오버레이 이미지카드 + 하단 수직 막대 리듬 스트립
review-dark-highlight-stack { headSmall(em,br), headLarge(em,br), headAccent?, reviews(1~7)[image?(url), rating?(1~5), text, highlight?] }   // 다크 배경 리뷰 카드 수직 스택 — 좌 정사각 이미지+우 별점·본문, 키워드 흰 배경 인라인 하이라이트 강조
review-star-overlap { bgImage?(url), brandLabel?, headline?(em), tag?, reviews(1~5)[reviewer, rating(1~5), text(em,br)] }   // 전면 배경사진+스크림 위 REVIEWS 대형 헤드 + 검정 라운드 카드 3행, 카드 좌상단 흰 대형별 오버랩 + 황금 별점
shipping-hero-ribbon-trio { headline(em,br), subCopy?, productImage?(url), benefits(2~4)[num, icon?(url), label(em)], ctaText }   // 오렌지 배경 대형 헤드라인 + 우측 이미지 오버랩 + 리본 구분선 + 3열 번호뱃지·아이콘·혜택 행 + 다크 CTA 바
shipping-notice-twin-truck { badge?(텍스트), title(em,br), desc(em,br), truckLeft?(url), truckRight?(url), note? }   // 긴급 배송 공지: 노란 전면 배경 + NOTICE 뱃지 + 대형 헤딩 + 설명 + 트럭 2대 병렬(원형 그림자), 이미지 없으면 SVG 아이콘 강등
stats-bottle-stat-rail { eyebrow?, title(em,br), desc?, image?(url), stats(2~6)[value(em), label], sourceLine?(브리프 근거 시만) }   // 다크 그라데이션 배경 + 좌측 헤드라인 + 중앙 세로 제품 목업 + 우측 수직 스탯 레일
stats-satisfaction-dash { eyebrow?, heroStat, heroDesc?(em), image1?(url), image2?(url), image3?(url), cards(2~6)[category, label(em), pct] }   // 대형 히어로 수치 + 앱 UI 이미지 클러스터 + 2열 만족도 카드 그리드
story-doubt-stack { headline(em,br), panels(2)[image?(url), desc(em,br)] }   // 다크 배경 원형 물음표 아이콘 + 볼드 헤드라인 + 이미지+설명 패널 2개 수직 나열
callout-dual-circle { sub(text), title(em,br), imageA?(url), imageB?(url) }   // 좌측 서브+대형 오렌지 헤드라인, 우측 두 원형 이미지 오버랩 배너
callout-pill-cascade { question(em,br), items(2~5)[text], causeHeading, causeBody?(em,br) }   // 질문형 대제목 + 너비 가변 알약 리스트 계단식 배열 + 도트 구분자 + 원인 설명
cert-badge-triptych { title(em,br), titleSub?, badges(2~5)[image?(url), label], leftImage?(url), productImage?(url), bgColor? }   // 좌측 전면 사진 + 세리프 2줄 타이틀 + 흰색 라운드 카드 인증 배지 2~5열 + 우측 제품 오버랩
cert-derma-trio { subtitle?, title(em,br), markImage?(url), markAlt?, cards(2~3)[label, body(em), badge?] }   // 다크 올리브 배경 + 원형 인증 마크(단독) + 하단 2~3열 겹침 인증서 카드
cert-photo-badge-strip { pill?, title(em,br), desc?, image?(url), badges(2~4)[icon?(enum), label] }   // 배경 사진 위 pill 오버레이 + 하단 80%-불투명 검정 라운드 박스 인증 배지 행
cert-pill-grid { badge, title(em,br), subtitle?(em,br), logo?(url), trust(em,br), gridImages(2~4)[url], gradientFrom?, gradientTo? }   // 그라디언트 배경 + 상단 뱃지 + 원형 로고 pill 텍스트박스 + 2×2 라운드 이미지 그리드
checklist-colorbar-diag { eyebrow?, title(em,br), items(2~4)[label, text], diagLabel?, diagResult(em,br), image?(url) }   // 셀프진단 체크리스트: 브랜드색 헤더바+흰 원형 체크 아이콘 카드 + 진단 결론 + 원형 사진
checkpoint-fullbleed-numlist { header?, image?(url), items(2~5)[label(em), text(em,br)] }   // 전폭 제품 사진 + 대형 ExtraBold 라틴 헤더 + 라이트웨이트 번호 장식 수직 리스트
cs-support-tricard { csTitle, csSub?, phone, hoursLine1, hoursLine2?, shippingTitle, cards(2~4)[badge, icon, value(em), sub?], shippingNotes(em), returnTitle, returnNotes(em) }   // 고객센터 헤더+전화박스 → 배송 3열 카드(배지+아이콘링+값) + 텍스트박스 → 교환반품 텍스트박스
detail-palette-card { eyebrow?(em), title(em,br), titleSub?(em,br), image?(url), swatches(1~7)[color, name, desc?, selected?], badgeColor? }   // 검정 배경 + 2색 헤드라인 + 흰 라운드 카드(제품 이미지·원형 팔레트·색상명 배지)
detail-spec-icon-bar { badge, title(em,br), desc?(em,br), image?(url), specs(2~4)[icon(enum), label] }   // 배지+대형제목+사진+원형아이콘 세로선구분 N열 스펙바
discount-shock-badge { eventLabel?, headline(em,br), slogan(em,br), productName, image?(url), originalPrice, salePrice, badgeLines?(1~4)[string], originalLabel?, saleLabel? }   // 하늘색 전면 배경 + fs:150 초대형 헤드라인 + 할인 슬로건 + 상품명 박스 + 제품 이미지 + 정가/할인가 행 + 우측 원형 한정 뱃지 오버랩
feature-hashtag-chip-zigzag { sectionLabel?, title(em,br), subtitle?(em,br), heroImage?(url), items(2~5)[image?(url), name, desc(em,br), chip] }   // # 해시태그 헤더+수평선 · 풀폭 히어로 이미지 · 번호형(01/02/03) 지그재그 리스트 · 컬러필 키워드 칩
feature-mint-oval-grid { eyebrow?, title(em,br), headline(em,br), image?(url), badgeLine1?, badgeLine2?, badgeSub?, cards(2~4)[icon?, label, text] }   // 민트 배경 + 다중 타원 마스크 제품 이미지 + 원형 인증 배지 오버랩 + 2×2 흰 라운드 카드 그리드
feature-offset-gallery { pointLabel?, title(em,br), subtitle?, imageLeft?(url), imageRight?(url), captionTitle?(em,br), captionDesc? }   // 라틴 'point N' 헤더 + 좌우 100px 엇갈림 비대칭 2열 갤러리 + 중앙 캡션
feature-pivot-arc-shot { number?(string), title(em,br), desc?(em,br), image?(url), arcLabel?(string) }   // 베이지 배경 + 번호 pill + 센터 타이틀/설명 + 전체폭 제품 사진 + 파란 반투명 부채꼴 화살표 2개 SVG 오버레이(좌우 피벗 각도 시각화)
feature-point-watermark { pointLabel, productName(em), watermarkText, slogan(em,br), desc?(em,br), image?(url) }   // 포인트 번호 레이블+제품명 좌우 분할, 영문 워터마크 배경 타이포 스택, 하단 풀블리드 사진
feature-quad-imgcap-grid { tag?, headline(em,br), sub?, heroImage?(url), badgeText(em,br), badgeSub?, cards[4]{ image?(url), label(em,br), desc(em,br) } }   // 섹션태그+대제목+전체폭히어로+색상배지서브타이틀+2×2 이미지·브랜드필 캡션 그리드
feature-quote-pill-stack { headLine1(em,br), headLine2(em,br), image?(url), subTitle(em,br), bodyText?, pill1, pill2 }   // 상단 그린 배경+인용부호+2줄 헤드라인 + 라운드 제품 사진 + 하단 연녹 배경 너비 차등 두 pill 강조
feature-sky-badge-overlap { brand?, title(em,br), subtitle?(em,br), image?(url), items(2~4)[icon, label] }   // 하늘색 배경 + 브랜드 라벨/룰 + 대형 타이틀 위 제품이미지 오버랩 + 원형 아이콘 배지 행
feature-sky-icon-quad { headword?, badge(em), skyBg?, items(2~4)[icon?, heading(em), body(em,br)] }   // 하늘 배경 + 라틴 헤드워드 + 라인 배지 + 2×2 흰 라운드 카드 그리드(레이어드 아이콘)
feature-splitbox-keyword { heading(em,br), rows(1~3)[filled, outline], desc?(em,br), image?(url) }   // 라이트 회색 배경 + 좌채움/우윤곽 2단 키워드 타이포 + 설명 + 전폭 제품 이미지
feature-step-quote-reveal { eyebrow, title(em,br), steps(2~3)[label, text], quoteTop, quoteMid(em,br), quoteBottom(em,br), image?(url) }   // 올리브 번호 뱃지+세로 구분선 3열 케어 스텝 + 3색 계층 인용 텍스트 + 전체 폭 이미지(선택)
hero-badge-keypoint { brandName, title(em,br), subcopy(em,br), pills(2~4)[label], image?(url), keypoints(2~4)[num?, label(em,br), desc(em,br)] }   // 타원 브랜드 뱃지+대형 제목+컬러 pill 해시태그(상단 그라디언트 영역) + 전체 배경 제품 이미지 + 이미지 위 번호형 3열 키포인트 배너
hero-bleed-ribbon { productName, brand(em), titleLine1(em,br), titleLine2(em,br), image?(url), badges(2~4)[icon, label(br)] }   // 연파랑 배경 + 풀위드 반투명 리본 배너 + 브랜드+2행 계단 타이틀 + 와이드 블리드 제품사진 + 원형 아이콘 뱃지 행
hero-catalog-slide { brandLabel, title(em,br), slogan(em,br), image?(url), pageTotal?(1~9), pageCurrent?(1~9) }   // 전면 다크 배경 위 배지박스+대제목+도트페이지네이터+슬로건+헤어라인+하단 제품 이미지 카탈로그 슬라이드 히어로
hero-floatcard-hand { image?(url), handText, enSub, titleSm(em,br), titleLg(em,br), bgImage?(url) }   // 배경 이미지 위 부유 흰 카드: 라운드 제품 사진 + 손글씨 영문 대각 오버랩 + 세리프 영문 부제 + 산세리프 한글 대/소 타이틀 페어링
hero-marker-panel { kicker?(em), title(em,br), headline(em,br), desc? }   // 다크 배경 위 흰 라운드 패널 + 형광펜 하이라이트 타이틀 히어로
hero-olive-checklist { badge?(영문 배지 라벨), title(em,br), subtitle?(em,br), body?, image?(url), items(2~6)[text] }   // 올리브 그린 다크 히어로: 영문 배지 필 + 원형 대형 제품 이미지 + 2색 교대 체크리스트
hero-pill-serif-zones { supertitle, title(em,br), intro(em,br), imageMain?(url), badgeLabel, serifTitle, serifDesc(em,br), imageWide?(url), closerLabel?, closerTitle(em,br), closerSub?(em,br) }   // 베이지 배경박스 상단+640px 이미지+pill뱃지·Abhaya Libre 세리프 대제목·760px 이미지 하단 존+클로저 카피 라이트 웜 인트로
hero-rail-right { brandName, title(em,br), productName, image?(url) }   // 우측 정렬 브랜드 레일+영문명 / 대형 2행 타이틀 / 제품 서브텍스트 / 전폭 제품 사진
hero-sandwich-stack { subTop(em,br), title(em,br), subBottom(em,br), imageTop?(url), imageBottom?(url) }   // 상단 전면 이미지 + ExtraLight 서브→Bold 대제목→룰→Light 서브 텍스트 스택 + 하단 전면 이미지의 다크 샌드위치 히어로
hero-wave-icons { tagline?(em), title(em,br), subtitle?, image?(url), icons(2~3)[icon(enum), label], barText(em) }   // 파스텔 배경 히어로: 제품 사진 → 물결 SVG 전환 → 태그라인+대제목+부제 → 3열 원형 아이콘 배너 → 하단 포인트 바
ingredient-badge-arc { chip?, title(em,br), subtitle?, badges(1~6)[label], badgeSuffix?, image?(url), imageAlt? }   // 그린 아웃라인 원형 무첨가 인증 뱃지 N개 + 라운드 코너 제품 이미지
ingredient-orbit-badge-trio { pointTag?, title(em,br), desc?(em,br), image?(url), badges(2~3)[outerArc, innerArc, iconName, label(em,br)] }   // 상단 포인트 라벨 + 타이틀 + 풀폭 사진 + 동심원 3중링 SVG 뱃지 2~3열
ingredient-serif-ratio { accentWord, title(em,br), desc?, image?(url), components(3~6)[label, ratio] }   // 라틴 세리프 악센트어 + 한글 헤드라인 + 전폭 소재 이미지 + 성분명/대형 세리프 비율 대비 구성표
lineup-arrow-stack { eyebrow?(em), title(em), options(1~5)[name(em), spec, regularPrice, salePrice, discountRate, image?(url)] }   // 수직 스택 카드 + 우상단 화살표형 할인율 뱃지 상품 구성 라인업
lineup-swatch-zigzag { brand?, title(em,br), subtitle?, cards(2~6)[colorName, colorDesc(em,br), swatchBg, textOnDark?, image?(url)] }   // 컬러 라인업 좌우 교차 — 카드 배경색=컬러 스와치, 가로선 브랜드 라벨, 홀수=이미지왼/짝수=이미지오른
point-fullbg-oval-stats { titleBig(em,br), titleSub?(em,br), image?(url), stats(2~4)[label, value(em)] }   // 전면 배경 + 대형 Bold 타이틀 2단 + 반투명 타원 뱃지 수치 행
point-pill-flow { title(em,br), cards(2~4)[image?(url), label, text(em,br)], closerHeading(em,br), closerBody(em,br), heroImage?(url) }   // 다크 필 카드 리스트 + 화살표 전환 + 결론 + 하단 전폭 사진
point-stagger-pill { headline(em,br), heroImage?(url), photo1?(url), photo2?(url), photo3?(url), problems(2~4)[icon, text(em)], image?(url), resolve(em,br), resolveSub?(em,br) }   // 문제제기: 히어로 배경이미지+헤드라인 → 3분할 라운드 사진 → 스태거드 너비 알약 문제 리스트 → 대표 이미지 → 해결 카피
reason-bubble-stack { badge, title(em,br), image?(url), imageAlt?, items(2~6)[label(em), desc] }   // 말풍선 배지+삼각꼬리 → 대형헤드라인 → 라운드사진(noimg-safe) → 다크 원형번호+제목+부제 행카드 스택
reason-quad-circle-gallery { sub, headline(em,br), images[4]{ url?(url), alt } }   // 다크 배너: 좌 서브+오렌지 대형 헤드라인, 우 원형 이미지 4개 가로 갤러리 스트립
recommend-circle-zigzag { icon?(name), headline(em,br), subHeadline?(em,br), items(2~4)[image?(url), badge, title(em,br), desc(em,br)] }   // 상단 아이콘+2줄 헤드라인 + 정원(50%) 썸네일·오렌지 pill 뱃지·제목·설명 행의 지그재그 교차 리스트
recommend-grid-label { question(em,br), answer(em,br), cards(2~4)[image?(url), label(em,br)] }   // 증상 질문+권장 답변 2줄 헤더 + 2×2 라운드 사진·컬러 채움 레이블 카드 그리드
review-altcircle-grid { label?(text), headline(em,br), subHeadline?(text), gridPhotos?(url[]1~6), reviews(2~4)[text(em,br), stars?(1~5), nickname?(text), photo?(url)] }   // 라이트 배경·영문 필 라벨·헤드라인·3×2 사진 그리드·4카드(원형 썸네일 홀수=우 짝수=좌 교번·별점·닉네임)
review-fillbar-before-after { sectionLabel?, subtitle?, bars(2~6)[text, pct], transitionHead(em,br), transitionSub?, beforeImage?(url), beforeLabel?, beforeDesc?, afterImage?(url), afterLabel?, afterDesc(em,br) }   // 상단 수평 채움 바 그래프 + 하단 그린 배경 비포/애프터 카드 2열
review-speech-pair-grid { eyebrow?(text), title(em,br), heroImage?(url), reviews(2~4)[keyword, image?(url), text, reviewer, stars?] }   // 다크 배경 2열 말풍선 카드 리뷰 — 키워드 뱃지+사진+본문+별점 카드에 Subtract 꼬리 SVG 부착, 채팅 UI 연상
shipping-badge-dual-stack { overline?(text), delivery{ heading(em), body(em,br), icon? }, returns{ heading(em), body(em,br), icon? }, accentOverride? }   // 원형 badge 아이콘 + 컬러 섹션명 + 흰 카드 — 배송·교환반품 2섹션 수직 스택
spec-grid-cream-table { title(em,br), iconName?, photos?(url[1~4]), rows(1~10)[label, text(em,br)] }   // 중앙 아이콘+대형 타이틀 + 2×2 사진 그리드(noimg-safe) + 크림 제목셀·본문셀 분리 테이블
stats-score-cascade { score, scoreLabel?, headline(em,br), sub?(em,br), metrics?(2~5)[value, label] }   // 평점 숫자(4.9/5 등)를 좌열+우열(절반 오프셋) 5행씩 80px Bold로 배치하고 CSS 카운트업 카스케이드 모션으로 연출하는 타이포그래피 stats 블록
usage-day-timeline { label?, title(em,br), subtitle?, image?(url), days(2~6)[period, name, ratio(em,br), desc], notice?(em,br), noticeIcon? }   // DAY별 번호+세로선 타임라인 카드 사용법 섹션
ingredient-badge-tile-grid { badge?, titleSub?, title(em,br), desc?(em,br), image?(url), sectionTitle?(em,br), sectionDesc?(em,br), items(2~6)[num?, label, text(em,br)] }   // 원형 번호 배지 + 2열 교차색 타일 그리드 성분 소개 블록
ingredient-circle-badge-zigzag { pointLabel?, productName?, title(br), heroImage?(url), quote(em,br), badges(2~4)[latin, korean], items(2~4)[latin, name, subtitle(em), desc, image?(url)] }   // 포인트 레이블 + 풀폭 대표사진 + 따옴표 인용 + 투명도 차등 3원형 오버랩 성분 배지(삼각형 군집) + 번호-이미지 교차 리스트
ingredient-oval-stack { titlePre(em,br), titleKey, subtitle?, items(2~5)[name(em), benefit(em)], image?(url) }   // 컬러 텍스트박스 강조 타이틀 + 반투명 타원 수직 오버랩 적층 + 하단 전체폭 이미지(noimg-safe)
ingredient-point-serif-list { pointLabel?, headline(em,br), subhead?(em,br), photoA?(url), photoB?(url), badgeOrigin?, badgeDesc?, badgeBody?(em,br), rows(2~4)[title, desc(em,br), image?(url)] }   // 'point 01' 세리프 넘버 헤더 + 2열 사진 + 배지 캡션 + 번호형 썸네일 리스트
spec-dim-blueprint { title(em,br), subtitle?, image?(url), imageAlt?, dimWidth, dimHeight, dimExtra?, dimExtraAxis? }   // 전폭 제품 사진 위 치수선 SVG 오버레이 도면 스타일 사이즈 안내
banner-kinetic-duoscale { phrase(text), rows?(8~16), label?(text), subline?(text) }   // 동일 문구를 소형(35px)·대형(70px) 두 컬럼에 N행 반복 적층해 스크롤 타이밍 차이를 유도하는 키네틱 타이포그래피 배너
callout-chat-dark-problem { subhead(em,br), headline(em,br), heroImage?(url), bubbles(2~5)[text, side('left'|'right')], causes(2~3)[num, label(em,br), image?(url)], transition(em,br), cta?(em,br) }   // 흑배경 따옴표 인용 헤드 + 좌우 교대 채팅 말풍선 공감 대화 + 3열 원인 카드 + 전환 카피
callout-chat-zigzag { problemLabel(em,br), problemTitle(em,br), bubbles(2~4)[text(em,br)], solutionSub?(em,br), solutionTitle(em,br) }   // 베이지-브라운 다크 배경 + 상단 문제 타이틀 + SNS 채팅 좌우 교차 꼬리 말풍선 2~4개 + 하단 해결 질문 타이틀
callout-dark-stat-grid { headBefore?(em,br), headHighlight(esc), headAfter?(em,br), subCopy?(em,br), image?(url), stats(2~3)[value, label], empathyMain?(em,br), empathySub?(em,br) }   // 다크 배경 + 형광 그린 인라인 반전 박스 키워드 타이틀 + 2~3열 통계 다크카드 + 공감 텍스트
callout-kakaofriend-radial { sub, headline(em), benefitLine1, benefitLine2, channelName, channelCta?, bgHex? }   // 방사형 선레이 장식+좌헤드·중혜택박스·우채널목업 3단 이벤트 배너
cert-doc-zoom { caption?, labelText, title(em,br), subtitle?, docImage?(url), zoomImage?(url), body?(em,br) }   // 블랙 라벨박스 + 대형 헤드라인 + 인증서류 이미지 위 확대 클로즈업 오버랩으로 신뢰감 강화
cert-fan-stack { badge?, title(em), desc?(br), cards(2~3)[image?(url), label] }   // 노란 배경 + 오렌지 배지 + 대형 타이틀 + 인증서 3장 팬 스택(Z축 엇쌓기) + 다크 라운드 라벨 행
cert-laurel-triple { headline(em,br), subheadline?, certs(1~3)[caption, image?(url)], items(1~4)[label, detail, badgeText?] }   // 좌우 월계수 SVG + 그라데이션 헤드라인 + 인증서 사진 3장 수평 나열 + 흰 카드 체크리스트(골드 체크 + 별 합격 배지). noimg-safe.
cert-magnify-banner { heroTitle(em,br), heroSub?, certLabel(em), bgImage?(url), bannerIcon(enum), bannerTitle, bannerDesc? }   // 배경 이미지 위 인증서 카드+돋보기 줌인 효과, 하단 흰 배너(원형 아이콘 배지+제목/설명)
cert-orbit-ring { keyword, name(em), tagline?, image?(url,noimg-safe), certs(3~6)[label, icon?] }   // 그라디언트 박스 키워드 타이틀 + 원형 오비트 링 위 제품 사진 + 인증 뱃지 방사형 배치
checklist-brown-photo-row { subtitle?, title(em,br), caption?, items(2~6)[image?(url), label, text(em,br)], photoImage?(url), photoTitle?(em,br), photoSub?(em,br) }   // 진한 갈색 배경 6행 이미지+번호 리스트 + 하단 전체폭 사진 오버레이
compare-asympanel-befaft { badge?, title1(em,br), title2(em,br), subtitle?, beforeLabel?, beforeImage?(url), beforeItems(2~4)[text(em)], afterLabel?, afterImage?(url), afterItems(2~4)[text(em)] }   // VS 원형 뱃지 + 2행 타이틀 + 비대칭(44%전/56%후) 패널 + 우측 그라디언트 섀도 오버레이
compare-spec-trio { title(em,br), desc?(em,br), ownName, aName, bName, ownImage?(url), aImage?(url), bImage?(url), rows(2~7)[label, own, a, b], tagline? }   // 자사·A사·B사 3열 세로 스펙 카드 비교, 자사 accent 강조, 이미지 부재 시 안전 강등
compare-tri-axis { title(em,br), subtitle?, rivalName, oursName, rivalImage?(url), oursImage?(url), rows(2~6)[label, rival, ours] }   // 3열 대칭 비교표 — 중앙 vs 뱃지가 경쟁사·자사 컬럼을 가르는 축, 자사만 accent 강조
compare-triple-badge { badge?, title(em,br), subtitle?, oursLabel, theirsLabel, rows(2~8)[label, ours(em,br), theirs] }   // 알약 배지 + 대형 헤드라인 + 자사(브랜드색 좌열)·구분(중앙)·경쟁사(회색 우열) 3열 비교표
compare-vs-card-split { title(em,br), desc?, before{ label, image?(url), caption(em,br) }, after{ label, image?(url), caption(em,br) }, badgeText? }   // 좌우 라운드 카드 + 경계 중앙 원형 VS 배지 오버랩 비교 블록
detail-anatomy-callout { headLine1(em,br), headLine2(em,br), desc?(em,br), productImage?(url), callouts(2~6)[label(em), image?(url), side(left-top|left-mid|left-bot|right-top|right-mid|right-bot)], features(2~4)[icon?(iconName), title(em), desc(em)] }   // 제품 중앙 이미지에서 좌우 방사형 선+원형 디테일 컷+라벨 플로팅 해부도, 하단 원형아이콘 기능 리스트
detail-badge-callout { headline(em,br), subline?, image?(url), badges(2~4)[label(em), sub(em)], imageAlt?(브리프 근거 시만) }   // 전체폭 제품 이미지 좌측에 원형 배지 2~4개를 수직 오버레이·라인 연결하는 콜아웃 장치
detail-infotag-overlay { badge?, title(em,br), desc?(em,br), image?(url), tags(2~6)[label, left(0~100), top(0~100), lineDir('left'|'right')] }   // 전체폭 제품 이미지 위 검정 레이블 태그를 SVG 라인으로 연결한 인포그래픽 오버레이; 이미지 없으면 그리드 강등
detail-overlap-bookend { pointLabel?, topImage?(url), backImage?(url), frontImage?(url), centerHeadline(em,br), centerDesc(em,br), bottomImage?(url), sideImage?(url), sideCaption? }   // point 번호 헤더(가로선 분절)+풀블리드 북엔드 이미지+오버랩 2장+중앙 세리프 카피+베이지 사이드 사진
detail-pin-legend { title(em,br), subtitle?, image?(url), imageAlt?, pins(2~20)[n(int), left(0~100%), top(0~100%), label] }   // 제품 사진 위 번호 핀 오버레이 + 하단 2열 범례 인포그래픽
detail-section-explode { sectionNum, sectionTitle(em), sectionSub?(em,br), heroImage?(url), thumbs(2~3)[image?(url), caption?], subImage?(url), featureTitle?(em), featureDesc?(em,br), explodeImage?(url), layers(2~5)[label, offsetPct(5~95)] }   // 세리프 섹션번호 헤더 + 풀폭 히어로/서브 이미지 + 3열 썸네일 + 서브제목 설명 + 제품 단면 SVG 방사선 분해도
detail-serif-altrow { cover?(url), label?(em), rows(2~4)[image?(url), num?, heading, body(em)] }   // 풀블리드 커버 + 세리프 레이블 + 번호형 좌우 교차 행 2~4개
detail-serif-hero-zigzag { eyebrow?(em,br), subtitle?, heroImage?(url), items(2~6)[num?, label, text(em,br), image?(url)] }   // 영문 세리프 대제목+한글 부제 → 999px 원형 풀폭 대표 이미지 → 홀수=이미지좌+텍스트우 / 짝수=텍스트좌+이미지우 지그재그 소재·디테일 클로즈업 리스트(세리프 번호+세로선+라벨+본문)
event-circle-warranty { headline(em,br), body(em,br), footnote?, badgeLine1, badgeLine2, image?(url) }   // 다크 네이비 + 인디고 헤드라인 + 원형 제품사진 + 그라데이션 배지 원 AS보증 이벤트
event-darkbg-pricedrop { bgImage?(url), headlineTop, headlineBox(em), subCopy?(em), darkTitle1(em), darkTitle2(em), badges[1~3], products[2]{ name, tagline(em), images[1~3](url), priceOriginal?, priceLabel, priceValue, priceUnit? } }   // 전체폭 배경사진+반투명 강조박스·다크 타이틀띠+배지·흰 제품카드2장(블랙 가격바·노란 할인가)
event-kakao-coupon-split { channelHandle, headline(em,br), couponLabel?, couponValue, benefit, stubText? }   // 카카오채널 친구추가 유도 배너: CSS 목업(좌) + 쿠폰 티켓(중) + 브랜드핸들·헤드라인·혜택 필(우) 3단
event-oneplus-stack { eventLabel?, headline(em,br), heroImage?(url), brandName, eventName, promoKey, subtagline, boxImage?(url), boxLabel(em), benefitTags(1~5)[label], originalPrice?, discountLabel?, salePrice, salePriceUnit?, guaranteeBadge? }   // 1+1 런칭 이벤트형 다단 복합 레이아웃(웜브라운 배경·라운드라벨·대형헤드라인·풀이미지·흰박스·가격다크바·환불뱃지)
event-overlap-refund { badgeText, title(em,br), desc?, imageCircle?(url), imageRect?(url), refundLine1?, refundLine2?(em,br), socialProof? }   // 다크 브랜드 배경 + 노란 라운드 배지 + 대형 타이틀 → 원형·직사각 이미지 오버랩 + 그라디언트 원형 환불 배지(우상단 플로팅) → 소셜 증거 클로저
event-overlay-pricebar { overlayLine1(em,br), overlayLine2(em,br), productSub?, productName(em,br), priceItems(2~5)[label, amount, role(normal|sale|benefit)], finalLabel?, finalAmount, finalUnit?, image?(url) }   // 전체폭 이미지 위 반투명 타이틀 오버레이 + 색상 분기 할인 내역 리스트 + 강조 최종가 블랙바
faq-bubble-tail { label?(em), title?(em), pairs(1~6)[q(em), a(em,br)], image?(url) }   // 말풍선 꼬리 달린 Q버블 + 아이콘 A블록 쌍 + 하단 전폭 사진
faq-chat-bubble { title(em), subtitle?, image?(url), pairs(1~5)[q(em), a(em,br)] }   // 채팅 말풍선 FAQ: 히어로 이미지 + Q&A 타이틀 + 파란 질문/흰 답변 말풍선 쌍(꼬리 포함)
feature-alt-card-stack { tag?, title(em,br), subtitle?, heroImage?(url), badgeText?(em,br), badgeDesc?(em,br), cards(2~4)[label(em), cardTitle(em,br), cardDesc(em,br), image?(url)] }   // 섹션태그+헤드라인+전체폭 대표이미지+색상배지+좌우 교대형 라운드 카드(r=50) 스택
feature-arrow-trio { eyebrow?(text), title(em,br), image?(url), items(2~3)[thumb?(url), label(em), text(em)] }   // 진청 다크 배경 + 대곡률 제품 이미지 + 흰 카드 2~3개(화살표 구분선) 기능 리스트
feature-checklist-stat-banner { image?(url), title(em,br), checks(2~4)[text], stats(2~3)[icon, value, label], bannerColor? }   // 풀블리드 이미지 위 반투명 체크리스트 오버레이 + 하단 브랜드 배너 3열 스탯
feature-checkpoint-rail { pill?, title(em,br), subtitle?, productImage?(url), steps(2~3)[thumb?(url), label, text(em)] }   // 그라데이션 배경 + pill 레이블 + 대형 타이틀 + 풀너비 제품 이미지 위 좌측 수직 레일에 원형 썸네일 3개를 화살표로 연결한 체크포인트 오버레이
feature-dark-pill-stack { title(em,br), subtitle?, items(2~4)[icon(enum35), label(em,br), text(em,br)], gradientFrom?(css-color), gradientTo?(css-color) }   // 블랙 배경 + 반투명 pill 카드 수직 스택, 각 카드에 그라데이션 원형 아이콘
feature-hero-pill-zigzag { brand?(em), tagline?, title(em,br), subtitle?, heroImage?(url), features(2~3)[image?(url), heading(em,br), body] }   // 전폭 다크 제품사진 히어로(브랜드+상품명 오버레이) + 하단 2~3행 교차 이미지·텍스트 + 컬러 pill 번호 뱃지
feature-highlight-caption { pointLabel?(텍스트), headLine1(em,br), headKeyword(텍스트→파란배경박스), headLine2?(em,br), heroImage?(url), descTitle(em,br), descSub?(텍스트), subImage?(url), captionBar(텍스트→파란캡션바) }   // POINT 라벨+인라인 키워드 하이라이트 박스 대제목+풀블리드 제품 사진+설명+컬러드 캡션 바 보조 사진
feature-honeycomb-badge { eyebrow?(text), title(em,br), badges(2~6)[icon(ICON_NAMES), label(em,br)] }   // 다크 네이비 배경 + 중앙 타이틀 + 2열 원형 아이콘 뱃지 그리드(최대 6개)
feature-hotspot-callout { brand?, title(em,br), subtitle?, image?(url), badges(2~4)[text, top, left, lineToTop, lineToLeft] }   // 풀블리드 배경 이미지 위 브랜드+제목 상단 중앙, 반투명 흰 배지를 SVG 선으로 제품 부위와 연결하는 핫스팟 콜아웃
feature-hotspot-split { badge?, title(em,br), subtitle?(em,br), heroImage?(url), hotspots?(1~3)[label, anchorX?, anchorY?], items(2~4)[image?(url), title(em), desc(em,br)] }   // 컬러 배지+대형 제목+서브 카피, 풀폭 제품 이미지 SVG 핫스팟 오버레이(선+레이블), 번호+제목+설명 좌우 교차 분할 리스트
feature-pill-grid { sectionLabel(em), productLabel?, image?(url,noimg-safe), pillTitle(em,br), subHeadline?(em), desc?(em,br), cards[4][icon(enum), text] }   // 포인트 라벨 + 풀폭 사진(선택) + 그라데이션 pill 소제목 + 구분선 + 설명 + 2×2 원형 아이콘 라운드 카드 그리드
feature-stack-imgcap { pill?, title(em,br), subtitle?, items(2~5)[image?(url), icon?, label, desc(em,br)] }   // 라운드 pill 배너 + 중앙 대제목 + 풀폭 이미지-캡션 일체형 카드 N개 세로 스택 (다크 바 + 원형 아이콘)
feature-step-iconbox { eyebrow?, headline(em,br), desc?, solutionLabel?, steps(2~5)[title, body(em), boxLabel(em), boxDesc(em), icon?], image?(url) }   // 민트그린 배경 솔루션 단계 카드: 그라디언트 대제목 + 번호뱃지 헤더바 + 본문+우측아이콘패널 2레이어 박스텍스트 + 하단 풀블리드 이미지
feature-step-overlay-panel { eyebrow?, preTitle(br), boxKeyword, mechanism?(em), image?(url), imageAlt?, steps(2~4)[label?, keyword(em), keywordEn?, desc(em,br)] }   // 그라디언트 배경 + 컬러박스 키워드 타이틀 + 제품 풀블리드 이미지 위 좌측 Step 리스트 오버레이
gallery-hero-hashtag-grid { subcopy(em,br), brand, tags(2~6)[], hero?(url), images(1~6)[url?, alt] }   // 전체폭 히어로+해시태그 오버레이 + 2열 3행 갤러리 그리드
hero-badge-grid { badge, titleBrand(em,br), titleWhite(em,br), tagline?(em,br), image?(url), features(2~4)[icon, label(em,br)] }   // 전면 이미지 위 라운드 뱃지+2색 대제목, 하단 다크 브랜드 배너 내 2~4열 세로선 구분 아이콘 그리드
hero-badge-stagger { brandLatin, badge1(em), badge2(em), brandSub?, image?(url) }   // 전면 배경 사진 + 상단 라틴 브랜드명+가로선 + 황금·오렌지 두 배지 수평 오프셋 스태거 + 하단 브랜드 바
hero-bubble-grid { chip, titleLine1(em,br), titleLine2(em,br), desc?, badgeLine1?, badgeLine2?, image?(url), features(4~6)[icon(enum), label] }   // 전폭 제품 사진+오렌지pill칩+2톤헤드라인+타원말풍선배지 오버레이, 황색 2×3 아이콘카드 배너
hero-bubble-stack { titleLine1(em,br), titleLine2(em), subtitle?, bgImage?(url), bubbles(1~4)[label, value, sublabel?] }   // 다크 전면 배경 이미지 + 2줄 타이틀(솔리드 텍스트박스) + 우측 원형 버블 수치 카드 세로 스택
hero-cropmark-overlay { brandName, titleLight(em,br), titleBold(em,br), subCopy?, imageCircle?(url), caption?, watermark?, imageOverlay?(url), overlayLabel?, overlayTitle(em,br), overlayDesc?(em,br) }   // 브랜드 가로선 바+원형크롭사진+스크립트워터마크+오버레이 제2패널 샌들/패션 인트로
hero-dot-duoweight { dotPhrase(em), lightLine(em), image?(url), imageAlt?, ctaDot(em), heroBottom?(em), subCopy?, badgeText? }   // 다크 히어로: 점(.) 자간 분리 한글 + SemiBold·ExtraLight 극대비 2줄 → 이미지 → 세로선 → ExtraBold CTA → 그라디언트 서브카피+배지
hero-float-split { kicker(em), title(em,br), desc?, imageL?(url), imageR?(url), highlightColor? }   // 좌우 전면 이미지를 가르고 중앙 라운드 흰 패널이 부유하는 히어로. 형광펜 밑줄 + 소제목 + 대형 제품명 + 본문.
hero-glint-brand { brandName(em,br), subtitle?(em,br), slogan(em,br), tagline?(em,br), image?(url) }   // 검정 배경 + 상단 그라디언트 대형 브랜드명 + 제품 이미지(흰 세로 글린트 선 2줄 오버레이) + 하단 그라디언트 슬로건 블록
hero-handscript-icon-trio { brand, title(em,br), desc?(em,br), tags(2~4)[string], image?(url), sideNote?(em,br), cards(3)[iconImage?(url), iconName?, label(br)] }   // 라이트 히어로: 브랜드 pill 배지 + 핸드라이팅 대형 헤드라인 + 해시태그 pill 행 + 제품 이미지(우측 손글씨 장식+화살표) + 하단 r=100 아이콘 카드 3종
hero-numbered-trio { brand(plain), productName(em,br), tagline(plain), image?(url), points[3][keyword(em,br), sub(plain)] }   // 브랜드명+대형 제품명+태그라인 중앙 타이포 → 원형 모서리 제품 이미지 → 흰 카드 3열 번호 뱃지 포인트 배너
hero-oval-badge { subtitle(em), title(em,br), body?(em), tags(2~4)[string], image?(url) }   // 이중 타원 링 장식 안에 누끼 이미지 + 황금별 3개, 좌측 대제목+해시태그 뱃지 행, 라이트 크림 배경
hero-oval-mascot { brand, badge, tagline(em,br), title(em,br), image?(url), desc?(em,br), tags(1~8)[string] }   // 큐트 핑크 히어로: 워터마크+배지+2단 타이틀+3겹 타원 클리핑 마스크 사진+별 장식+해시태그 배너
hero-pill-watermark { brand, title(em,br), image?(url), watermark, labelLeft?, labelRight?, subName?(em,br), desc? }   // 브랜드 배경 + 가로선 분기 브랜드명 + 좌측 대형 헤드라인 + r=400 pill 제품사진 위 fs=200 필기체 워터마크 + 좌우 반투명 영문 레이블 + 하단 제품명·설명
hero-ribbon-panel { bgImage?(url), panelColor?, ribbon(em), title(em,br), subtitle?(em), cards(2~4)[keyword(em), detail] }   // 배경 이미지 위 대형 둥근 패널 + 리본 서브타이틀 + 디스플레이 제목 + 카드 배너 히어로
hero-serif-icon-panel { headline(em,br), subline?(em,br), image?(url), panelTitle?, features(2~3)[icon, label, text(em)] }   // 전폭 배경 사진 위 명조 감성 카피+별 장식 구분선, 하단 흰 라운드 패널에 2~3열 원형 아이콘 기능 배너 중첩
hero-split-orbit { badge?, titleSub(em,br), titleMain(em,br), image?(url), headlineTop(em,br), headlineBottom(em,br), subCopy?(em,br) }   // 흰 상단(뱃지+2줄 타이틀)과 다크 하단(대형 카피)을 원형 제품 이미지가 경계에서 오버랩하여 연결하는 이분할 히어로
hero-stamp-grid { overlayCopy(em), image?(url), badgeLine1, badgeLine2, badgeArc, labelLat?, title(em), subtitle?, features[6][icon, label] }   // 다크 웜 배경 히어로: 제품사진 오버레이 카피 + 별형 공식판매처 회전 스탬프 배지 + 타이틀 블록 + 2행×3열 아이콘 피처 그리드
hero-tint-oval-drop { highlight, title(em,br), subtitle?(em,br), image?(url), badgeLine1?, badgeLine2?, bgWord?, brand?, brandSub? }   // 브랜드 단색 배경 히어로: 흰 하이라이트 박스+대형 타이틀+r=400 타원 이미지+검정 원형 배지 오버랩+대형 영문 배경 타이포
hero-vertical-badge { image?(url), vertLine1(em), vertLine2?(em), badges(1~3)[line1(em,br), line2?, tone(light|mid|dark)], brandLabel?, title(em,br), desc?(em,br) }   // 전폭 배경 이미지 위 우측 세로쓰기 카피 + 좌측 원형 성분 뱃지 3단 + 하단 브랜드·헤드라인·태그라인
hero-weight-slash { brandStrong(em), brandLight(em), image?(url), keywords(2~5)[string], badge?, sub(em,br) }   // ExtraBold/Thin 2행 브랜드명 + 슬래시 분리 키워드 + 그라디언트 하단 히어로
ingredient-bubble-float { badge?, title(em,br), subtitle?, bubbles(2~5)[label(em), align?(left|right|center)] }   // 다크 배경 + 형광 pill 뱃지 + 대형 헤드라인 + 말풍선 꼬리 달린 흰색 pill 성분 태그 불규칙 플로팅
ingredient-card-bar-stack { badge?, title(em,br), subtitle?(em,br), cards(1~4)[title, subtitle, icon?, rows(1~12)[name, pct]], footnote? }   // 뱃지+헤드라인 + 라운드 카드 수직 스택, 카드마다 아이콘 원+수평 퍼센트 바 차트 행 목록
ingredient-ellipse-bar-stack { sectionTag?, headline(em,br), subheadline?(em,br), heroImage?(url), badges(2~4)[string], qualityTitle?(em,br), qualitySub?, qualities(3~6)[icon, text], qualityImage?(url), stackTitle?(em,br), stackSub?, layers(2~3)[label, sublabel, tagline, bars(2~10)[name, pct]] }   // 3파트 성분 구조: ①이미지배경+뱃지 ②품질아이콘격자+이미지 ③타원스택+바그래프카드
ingredient-onion-stack { badge?(텍스트), title(em,br), subtitle?(em,br), layers(2~4)[name(em,br), detail], note? }   // 반투명 타원 2~4개가 세로로 겹쳐 쌓이는 온이언 구조로 성분 카테고리를 레이어별 시각화
ingredient-ph-gauge-banner { title(em,br), subtitle?, stats(2~4)[value, unit], phValue?, phLabel?, phMin?, phMax?, image?(url) }   // 수치 배너 + 풀폭사진 위 원형 pH 게이지 오버랩 성분 섹션
ingredient-ph-scale { title(em,br), subtitle?, phValue?, phLabel?, acidLabel?, alkLabel?, desc?(em,br), image?(url) }   // pH 그라데이션 원형 스케일 + 전폭 사진 성분 소개 블록
ingredient-pill-icon-list { headline(em,br), sub?, image?(url), pills(1~2)[label, body?(em,br)], items(2~5)[icon?, label, text(em,br)] }   // 풀블리드 다크 배경 + 그라디언트 pill 섹션 헤더 + 원형 아이콘·컬러 라벨 리스트
ingredient-radial-dot-map { badge?, headline(em,br), subtitle?, image?(url), items(2~4)[name, desc, angle?] }   // 원형 제품 이미지 둘레에 흰 도트 앵커로 2~4가지 성분명·효능을 방사형 배치한 인포그래픽 성분 맵
ingredient-step-panel-split { badge?(text), title(em,br), subtitle?, image?(url), steps(2~9)[label, name] }   // 다크 2열 패널: 좌 원형 번호 뱃지 N단계 리스트 + 우 세로 이미지. 이미지 없으면 리스트 풀폭 강등.
lineup-dual-price-seal { headTop, headMain(em,br), headSub?, heroImage?(url), sealText?, items(1~3)[title(em,br), desc?, brandLabel, regularPrice, discountBrandLabel, discountPrice] }   // 베이지 배경+3단 헤드+전폭 이미지+3카드(원형이미지+브랜드박스-취소가/할인가 이중뱃지)+원형 인장
lineup-wordmark-split { imageLeft?(url), imageRight?(url), title(em,br), subtitle?, tiles(2~6)[char, bg, color], ctaText, ctaUrl? }   // 좌우 50:50 분할 사진 + 낱자 컬러박스 워드마크 행 + CTA. noimg-safe.
point-badge-section-trio { sections(1~3)[layout('feature-stack'|'altcard'|'grid-cards'), num, title(em,br), sub, image?(url), ...layout-specific] }   // 3포인트 섹션 수직 나열: 해시넘버 태그+배지헤드라인+섹션별 배경교체, 레이아웃 3종(feature-stack/altcard/grid-cards)
point-badge-word-split { badgeWord(2~5자), headline(em,br), imageBefore?(url), imageAfter?(url), arrowLabel?, items(2~4)[title, text] }   // 낱글자 원형 뱃지 배열로 키워드를 분해·강조 + before/after 이미지를 삼중 화살표로 연결 + 다크 넘버드 리스트 카드
point-bubble-chat { subtitle(em), headline(em,br), bubbles(2~6)[text(em)], image?(url), quoteMain(em,br), quoteSub?(em,br) }   // 크림 베이지 배경 + 말풍선 꼬리 좌우 교차 채팅 카드 + 라운드 사진 + 따옴표 인용 블록
point-bubble-zigzag { sec1{ pointLabel, productTag?, image?(url), kw(em,br), kwSub?, desc?, bubbles(2~4)[nameLat, nameKo], ingredients(2~4)[image?(url), name(em), nameLat?, benefit, desc] }, sec2{ pointLabel, productTag?, image?(url), kw(em,br), kwSub?, desc?, beforeAfters(1~3)[label, period?, imageBefore?(url), imageAfter?(url)], disclaimer? }, sec3{ pointLabel, productTag?, image?(url), kw(em,br), kwSub?, desc?, certs(2~4)[title(em), detail] } }   // 3섹션 포인트: 오버랩 버블+지그재그 성분·비포애프터 카드·동심원 인증 카드
point-card-split-check { eyebrow?, titleLine1(em,br), titleLine2(em,br), image?(url), panelHead(em,br), items(2~5)[label] }   // 라벤더 배경 위 흰 카드, 내부 흰↔보라 이중 배경 분할 + 원형 체크배지 리스트
point-circle-badge-panel { image?(url), badgeValue(브리프 근거 시만), badgeUnit(브리프 근거 시만), tag, title(em,br), desc? }   // 원형 제품 이미지 + 좌하 오렌지 수치 뱃지 오버랩 + 우측 반투명 패널에 라운드 태그·헤드라인·본문
point-circle-grid-reveal { quote(em,br), quoteDesc?, circleImage?(url), keyword(em,br), cards(2~4)[image?(url), label(em), text], conclusionIcon?(브리프 근거 시만), conclusion(em,br), conclusionSub?, fullbleedImage?(url, 브리프 근거 시만) }   // 인용문박스+원형이미지+세로선+고민키워드+2×2어두운카드+화살표+형광펜결론+풀블리드
point-dark-grid-resolve { title(em,br), desc?, cards(2~4)[sub, keyword, image?(url)], checks(2~6), resolveLabel, resolveBox(em,br), bridgeText?(em,br) }   // 네이비 다크 배경 문제제기: 2×2 이미지+다크 캡션 그리드 + 원형 체크리스트 + 세로선 + 색상 반전 클로징 박스
point-dual-circle-badge { subtitle?(em), title(em,br), tagline?(em), imageLeft?(url), imageRight?(url), badges(2~4)[line1, line2] }   // 좌·우 원형 이미지 + 배경 대원 앵커 + 좌측 타이틀 스택 + 하단 이중 원 뱃지 행
point-glass-grid { bgImage?(url), title(br), points(2~4)[label, image?(url), keyword(em), text(em)] }   // 전폭 배경사진+제품명 오버레이 + 2×2 반투명 글라스 카드 그리드(번호레이블·원형이미지·키워드·설명)
point-highlight-stack { points(1~4)[pointLabel?, headPlain, headHighlight, subTitle, subCaption?, bodyDesc?, image?(url), tinted?, detail(checklist|thumbrow)] }   // 포인트 수직 스택: POINT 레이블 + 대제목 + 브랜드색 인라인 하이라이트 박스 + 전폭 제품사진 + 체크리스트 또는 원형 썸네일 행
point-numeral-stack { sections(1~3)[number, kicker(em), headline(em,br), desc?, imageA?(url), imageB?(url), pills(2~4)[string], stats(3)[value, label]] }   // 번호형 포인트 1~3섹션 수직 적층: 대형 액센트 넘버 + 2장 오프셋 사진 + frosted-pill 체크리스트 + 3열 스탯 배너
point-pill-cascade-review { subTitle, title(em,br), productImage?(url), pills(2~4)[text], quote, desc(em,br), reviews(2~4)[image?(url), keyword, desc, stars?] }   // 다크 그라디언트+밑줄 헤드라인+대형 제품사진+계단식 알약 리스트+붓글씨 감성 인용+설명+리뷰 카드 3열
point-ruled-chapter-overlap { eyebrow?, sections(2~4)[pointLabel?, title(em), sub?, layout(duo|overlap|single|none), imageA?(url), imageB?(url), capLatTitle?(em)?, capSub?, items?(0~4)[thumb?(url), label, text], bg(white|warm)] }   // 가로선+라틴 point N 챕터 헤더 → 타이틀+서브 → 이미지존 3종(duo오프셋/overlap대소/single) → 선택적 번호리스트, 2~4섹션 수직 스택
point-serif-layer-callout { sections(1~4)[num, keyword(em), heading(em,br), subHeading?(em), body?(em,br), heroImage?(url), thumbs?(url[0~3]), layerImage?(url), callouts?(0~5)[label]] }   // 세리프 대형 번호 + 전폭 히어로 + 썸네일·레이어 이미지 + 소재 callout 선 도해 반복 섹션
point-triple-badge { sectionLabel?, intro?(em,br), p1{label, heading(em,br), body?, image?(url)}, ba{duration, effect(em), beforeLabel?, afterLabel?, beforeDesc?, afterDesc?, beforeImage?(url), afterImage?(url)}, p2{label, heading(em,br), body?, image?(url)}, checkHeading?(em), checks(2~6)[text], p3{label, heading(em,br), body?, image?(url)}, badges(2~4)[outerText, innerText, label(em)] }   // 세로 3파트 포인트 스택: 파트1=사용전후 비교 패널, 파트2=체크리스트, 파트3=원형 곡선텍스트 인증뱃지 3연
point-triple-scroll { productName?, s1Label?, s1Image?(url), s1Title(em,br), s1Sub?, s1CheckTitle?, s1Checks(1~4)[text(em,br)], s1Image2?(url), s1PillLabel?, s1PillSub?, s1Cards(2~4)[icon, label], s2Label?, s2Image?(url), s2CertBadge?, s2Title(em,br), s2Sub?, s2Heading?, s2HeadingSub?, s2Rows(1~4)[image?(url), keyword, stamp, heading, desc(em,br), refNo?], s3Label?, s3Image?(url), s3Title(em,br), s3Sub?, s3Rows(1~4)[image?(url), keyword, name, desc(em,br)] }   // 포인트 3섹션 연속: ①체크리스트+아이콘카드 ②원형스탬프+인증행 ③좌우교차 성분행
promo-letter-badge-oval { badgeWord(2~4자), title(em,br), sub?(em), cta?(str), ctaLabel?(str), imageLeft?(url), imageRight?(url) }   // 연살구 배경 + 색상 띠 + 4색 낱글자 배지 행 + 대형 헤드라인 + 좌우 타원 이미지 프레임
recommend-sky-oval { question(em,br), image?(url), badgeText?(br) /* 브리프 근거 시만 */, panelTitle(em,br), panelBadge?, items(2~6)[icon, text] }   // 하늘 배경 질문 타이틀 + 타원 2중 아웃라인 인물 사진 + 원형 키워드 배너 오버랩 + 흰 패널 추천 리스트
review-bubble-grid { headline(em,br), subheadline?, desc?, reviews(2~4)[photo?(url), titleBar, body(em,br), stars(1~5), reviewer], lifestyleImage?(url), accentBar? }   // 2열 말풍선 카드(사진+컬러바+리뷰+별점+ID+하향꼬리) + 하단 전폭 라이프스타일 이미지
review-bubble-score { title(em,br), score?(string), scoreLabel?(string), scoreNote?(string), bubbles(2~4)[text(em,br), author?], image?(url) }   // 연파 배경 + 인용부호 SVG + 대형 평점 숫자 + 그라데이션 별 5개 + 꼬리 달린 말풍선 카드 + 하단 전폭 이미지
review-card-summarybar { stars?, title(em,br), reviews(1~3)[keyword, text, reviewer, summary, image?(url)] }   // 짙은 남색 배경 + 빨간 별점 + 센터 대제목 + 흰 카드(파란 키워드 뱃지·리뷰·닉네임+별점+우측 사진) + 하단 파란 한줄 요약 바. noimg-safe.
review-donut-pillow { title(em,br), badgeText, subtitle?, donuts(2~4)[pct, label, color?], disclaimer?, image?(url) }   // 그라디언트 필로우 배지 + SVG 도넛 그래프 행 + 전면 이미지로 체험단 만족도 수치를 시각화하는 데이터 후기 섹션
review-kpi-bubble-trio { latinLabel?, title(em,br), subtitle?, kpiLeft[label, value, basis?], kpiRight[label, value, basis?], reviews(1~3)[quoteHeadline(em), quoteResult, fullText(em), reviewer?], image?(url), imageAlt? }   // 다크 KPI 2분할 평점박스 + 말풍선 카드(확대 인용 오버레이 돌출) 3행 + 하단 전폭 이미지
review-laurel-bubble { heading(em,br), displayText?, subheading?, salesNumber?(브리프 근거 시만), salesLabel?, salesNote?, reviews(2~4)[text(em,br), stars?(1~5), nick?], photo?(url) }   // 월계수 SVG 장식 + 그라데이션 누적판매량 + 좌우 교번 말풍선 후기 스택 + 하단 리뷰 사진
review-stat-overlay { subtitle?(em,br), title(em,br), stats(2~4)[label, value, suffix?], heroImage?(url), reviews(1~4)[image?(url), badge, text(em — 브리프 근거 시만), stars(1~5), reviewer?] }   // 다크 배경 복합 리뷰: 2단 타이틀 + 통계 행 + 풀블리드 이미지 오버레이 + 썸네일 카드 리스트
shipping-clock-urgency { headline(em,br), deadline(em,br), cutoffHour, cutoffMin, badge?(text), sub?(em,br) }   // 아날로그 시계 SVG(좌) + 검정 라운드 카드 디지털 마감시각(중) + 당일발송 헤드라인·안내(우), 다크 블루
shipping-coldchain-steps { badge, title(em,br), subtitle?, image?(url), steps(2~6)[label(em), text], guarantee?(em,br), guaranteeIcon? }   // amber 원형 STEP 배지+세로선 연결 프로세스 리스트 + 크림 보증 강조박스
shipping-poly-deadline-split { badgeLabel(default '배송마감'), cutoffTime(default '02 : 00'), timePeriod?, tagline(default '당일발송'), imageLeft?(url), imageRight?(url), subNote? }   // 좌우 제품사진 사이 노란 불규칙 다각형 SVG 위에 마감시각 배지+형광펜 구호를 수직 스택으로 강조하는 긴장감 유도 배너
shipping-roundcard-cs { sectionTitle(em), sectionSub?, cards(2~4)[badge, icon, desc(em)], shippingTitle?, shippingBody?, returnTitle?, returnBody?, csPhone?, csHours?, csOff? }   // Paperlogy 대형 타이틀 + 2×2 앰버 라운드 카드 그리드 + 배송·교환반품 텍스트 블록 + 다크 브라운 고객센터 풀위드 배너
spec-battery-progress { badge?(텍스트), title(em,br), desc?(em,br), image?(url), batteryCaption?(텍스트 — 이미지 있을 때만 표시), rows(1~4)[label, sub, value, fillPct(0~100)] }   // 배터리 지속시간 스펙 비교: 뱃지+대형 제목+제품 사진(배터리 오버레이)+프로그레스 바 스펙 행
spec-dim-overlay { label(em), labelEn?, image?(url), imageSub?(url), dimWidth, dimHeight, dimDepth?, dimExtra? }   // 제품 실물 이미지에 SVG 치수선+mm 수치 오버레이, 우측 소형 보조 이미지, 이미지 없으면 치수 텍스트 카드 패널로 강등
spec-foot-measure-grid { titleLat?, titleKo(em,br), subtitle?, guideDesc?(em,br), guideUnit?, footImage?(url), colHeaders(3~6)[str], rows(2~4)[rowLabel, cells(3~6)], tip?, notice? }   // 신발 사이즈 안내 — 라틴 대제목 밴드 + 발 측정 도해(인라인 SVG 측정선+footImage) + 3행×최대6열 사이즈 그리드 표 + 팁 배너
spec-height-gauge { step?(text), title(em,br), desc?(text), image?(url), measures(2~6)[label, sub?] }   // 그라데이션 배경 + 번호 pill + 타이틀/설명 + 높이 단계 화살표 연출 제품 사진 + 검정 바 수치 비교표
spec-silhouette-badge { titleLat?, titleKo(em), headline(em), desc?(em,br), image?(url), dims(2~3)[label, value], badgeTop, badgeMain, notice? }   // 라틴 대제목 + 실루엣 위 가로 치수선 3개 + 브랜드 컬러 원형 용량 배지 오버랩 + 범례 행
stats-decibel-overlay { badge?, title(em,br), subtitle?, bgImage?(url), productImage?(url), barLabel?, steps(3~5)[value, label, highlight?], highlightNote? }   // 다크 배경 이미지 위 반투명 수평 데시벨(수치) 비교 바 오버레이 섹션
story-cause-flow { eyebrow(em), title(em,br), causeImage?(url), causeLabel(em), causeSubLabel(em), steps(2~3)[num, label(em)], resultHeadline(em,br), resultSub?(em), symptomCards(2)[image?(url), caption], quote(em), quoteDesc?(em,br), bottomImage?(url) }   // 문제 원인→결과 스토리: 다크 올리브 배경 + 원인 이미지·인과 레이어 + 번호형 플로우 카드 + 2열 증상 카드 + 인용 + 전폭 하단 이미지
story-serif-ruled { label, headline(em,br), headlineSub?, quoteStrong(em,br), quoteBody(em,br), quoteClose?(em,br), cardImage?(url), cardTitle, cardDesc(em,br) }   // 필 라벨 + 세리프 헤드라인 + 가로선 2중 구획 철학 인용 + 좌이미지/우텍스트 제품 카드
usage-fanout-grid { pointNum(em,br), pointLabel?, title(em,br), subtitle?, fanCenter?(url), fanLeft?(url), fanRight?(url), descHeading?(em,br), desc?(em,br), thumbs?(2~4)[image?(url), alt], bottomImage?(url) }   // 대형 번호 배지+제목 헤더 → 3장 오버플로우 팬아웃 이미지 → 설명 → 2×2 썸네일 그리드 → 풀폭 바텀 이미지
usage-numbered-split { tagline?(string), title(em,br), subtitle?, steps(2~4)[label, text(em,br), image?(url)] }   // 영문 장식 레이블 + 강조박스 한글 대제목 + ExtraBold 번호 + 4단계 L/R 사각 이미지 지그재그
usage-scene-altcard { title(em,br), subtitle?(em,br), iconName?, scenes(2~4)[tag?, place(em), desc(em,br), image?(url), bgColor?] }   // 장소별 사용 씬 교번 카드: 번호 해시태그 + 컬러 배경 박스 + 원형 클립 이미지 홀짝 교번, noimg-safe
recommend-hashtag-card { titleLine1(em,br), titleLine2(em,br), subtitle?, tags(1~6)[string], image?(url), items(2~8)[string], badge? }   // 앰버 반원 아치 + 2색 타이틀 + 해시태그 pill 배지 행 + 체크리스트 카드
recommend-oval-checklist { tagline?(text), title(em,br), image?(url), badgeText?(text — 브리프에 근거 있을 때만), items(2~5)[icon(ICON_NAMES 35종, default:check), text] }   // 타원 이중 라인 원형 이미지+별+배지 + 하단 아이콘 체크 카드 2~5행 추천 블록
shipping-deadline-clock { tagline(em), d0, d1, d2, d3, cutoffDesc, subNote?, carrierNote? }   // 딥 블루 전폭 배너: 아날로그 시계 SVG + 디지털 숫자 카드 4개(HH:MM) + 당일발송 마감 카피
spec-measure-table { sectionEn?(em), title(em,br), panelTitle, image?(url), callouts(1~4)[label, posX, posY, dir?('left'|'right'|'up'|'down')], tips(1~4)[], col1?, col2?, col3?, rows(2~8)[size, measure, desc?] }   // 측정법 이미지+CSS 말풍선 주석+다크 헤더 사이즈 표. 수치·체형 슬롯은 브리프에 근거 있을 때만.
spec-silhouette-table { decoTitle?(em), subtitle?, image?(url), dims(1~5)[key, label], rows(1~6)[size, values{key:cm}], tipTitle?(em), tipBody?, toleranceNote? }   // 실루엣 도해(이미지 or SVG)+치수라벨 좌측 / 5열 사이즈표 우측 2단 + size tip 하단
spec-size-diagram { titleLat?(라틴대제목, 기본 'size info'), titleKo(em,br), image?(url), dims?[label, value](2~3, 치수선 — 브리프에 근거 있을 때만), colHeaders(2~4, 사이즈옵션명), rows(2~5)[metric, values(1~4)], notice?(오차안내 — 브리프에 근거 있을 때만) }   // 제품 사진 위 CSS 치수선 오버레이 + 하단 4열 사이즈 비교표
stats-gauge-bars { productName(em), badgeText?, surveyNote?, gaugeLabel, gaugePct(int 1~100), bars(2~3)[label, pct(int 1~100)], disclaimer? }   // 체험단·임상 실측 수치 전용: CSS conic-gradient 도넛 게이지 + 수평 진행 바 2~3항목. 브리프에 근거 없으면 사용 금지.
`.trim()

/** DATA_CONTRACTS에 슬롯 계약이 정의된 variantId 집합 (각 줄 맨 앞 `<id> {` 파싱).
 *  catalog()에는 있으나 계약이 없는 변형은 AI에게 제시하지 않는다 → 계약/카탈로그 드리프트로 인한
 *  Zod 검증 실패를 원천 차단(correct-by-construction). */
export const CONTRACTED_IDS: ReadonlySet<string> = new Set(
  DATA_CONTRACTS.split('\n')
    .map((line) => line.trim().match(/^([a-z0-9-]+)\s*\{/i)?.[1])
    .filter((id): id is string => Boolean(id)),
)

/** variantId → 계약 라인 — 청사진 경로에서 선택 변형의 계약만 전달(343→N 프롬프트 축소, Sprint 2) */
const CONTRACT_LINE_BY_ID: ReadonlyMap<string, string> = new Map(
  DATA_CONTRACTS.split('\n')
    .map((line) => {
      const id = line.trim().match(/^([a-z0-9-]+)\s*\{/i)?.[1]
      return id ? ([id, line.trim()] as const) : null
    })
    .filter((e): e is readonly [string, string] => Boolean(e)),
)

// 계약/카탈로그 드리프트 가시화 — 등록됐지만 계약 없는 변형은 제외되며 1회 경고.
const UNCONTRACTED_IDS = catalog()
  .filter((c) => !CONTRACTED_IDS.has(c.id))
  .map((c) => c.id)
if (UNCONTRACTED_IDS.length > 0) {
  console.warn(
    `[Blocks Composer] DATA_CONTRACTS 미정의로 AI 카탈로그에서 제외: ${UNCONTRACTED_IDS.join(', ')}`,
  )
}

const SYSTEM_PROMPT = `You are a senior Korean e-commerce art director composing a long detail page from a fixed library of premium "section blocks".
You DO NOT write layout or CSS. You select blocks, order them, and fill each block's content slots with Korean copy + map provided image URLs.

OUTPUT: pure JSON, no markdown. Shape:
{ "meta": { "product": string, "category": string, "styleDirection": string? },
  "presetKey": "warm-playful" | "modern-editorial" | "cobalt-premium" | "sand-luxury",
  "blocks": [ { "variantId": string, "data": { …block-specific slots… } } ] }

RULES
- Use ONLY variantId values from the catalog. Fill data EXACTLY per the block's data contract.
- Compose 12~18 blocks. FIRST block must be a hero-family variant (variantId starting with "hero-" or "intro-"). LAST block must be a closing (closing-mood or closing-light).
- Order for a real detail page: hero → recommend/checklist → trust/checkpoint → point/feature sections (alternate text+photo) → reason/equation/callout → story → cert → compare/spec → closing.
- VISUAL RHYTHM (CRITICAL for premium depth — a flat single-tone page reads as low quality): alternate LIGHT and DARK sections. Include 2~3 DARK / dramatic blocks spread across the page — many families (story/feature/stats/ingredient/recommend/point/package/award/promo) have dark variants; identify them by "다크"/"dark"/"블랙" in the catalog descriptions and pick DIFFERENT dark variants each page. NEVER place 3+ light sections in a row. brand-story and closing especially should be dark/dramatic.
- SCALE HIERARCHY: vary section scale — include at least one big-impact full-bleed/statement/banner-scale block (fullbleed·statement·callout·banner·대형 수치 계열) so the page is not uniform density.
- IMAGE USE: when MANY distinct images are provided, lead with them across image-bearing blocks. When FEW are provided, do NOT stretch them — a repeated identical photo reads as low-effort. Follow the per-page image budget given in the user prompt.
- Pick presetKey by feel: warm-playful (친근한 식품/생활), modern-editorial (프리미엄/미니멀 명조), cobalt-premium (모던 커머스/전자·뷰티, 코발트블루), sand-luxury (따뜻한 뉴트럴 고급, 카멜/베이지). Match the product.
- Do NOT repeat the same variantId more than twice. Use strip-band at most once. Vary blocks for richness.
- DIVERSITY (CRITICAL): the catalog has 300+ variants — do NOT default to the same familiar variants page after page. The user prompt includes a FEATURED VARIANTS rotation list for THIS page: when multiple variants fit a role, PREFER ones from that list. Aim for at least half of your non-hero/non-closing picks to come from FEATURED VARIANTS when they fit the content.
- Korean copy only. Emphasis via <span class="em">강조</span> sparingly; <br> for line breaks. NO other HTML/markdown in slot text.
- <span class="em"> and <br> are allowed ONLY in fields annotated (em) / (br) in the contract. In a field WITHOUT that annotation, output PLAIN TEXT — inserting em/br there renders as literal visible tags.
- NEVER output an empty emphasis tag as a fill-in-blank placeholder (e.g. 우리 아이에게 <span class="em"></span>가 있어요 is WRONG). Put the real word inside the span, or use plain text with no span.
- Map provided image URLs into (url) slots, distributing them so each image-bearing block gets a DIFFERENT image (lifestyle/scene shots → hero/story/sensory/usage; detail·macro → ingredient/feature; mood → closing/fullbleed). **HARD CAP: use the SAME image URL in at most 1 block.** When images run out, choose image-light/text-first variants instead of repeating — repeated identical photos read as low-effort.
- IMAGE-SECTION SEMANTICS (CRITICAL): match each image's 컷 내용 note to the section's meaning. Lifestyle/연출 shots belong in hero, feature/point, story, usage, closing — NEVER inside spec tables, 성분/영양 정보, FAQ, shipping/CS blocks (those are text-led; leave their image fields empty instead). Texture/누끼 close-ups fit ingredient/detail sections. When in doubt, prioritize giving images to feature/point sections over tables. If a block truly has no fitting image, omit the field.
- FORBIDDEN WORDS: 완벽한, 최고의, 혁신적인, 압도적인, 특별한 경험, 특별한 이유, 자연의 선택, 깊고 진한 — AI-cliché adjectives; replace with concrete facts (온도·질감·시간·수치의 맥락 등 물리적 구체어).
- HONESTY (CRITICAL): never fabricate certifications, reviews, ratings, or numbers not present in the brief. Omit cert/spec rows you cannot ground.
- SPEC QUANTITIES (CRITICAL): 제품 스펙 수치(중량·용량·수량·개입 등)는 반드시 입력 자료(스크립트·청사진·브리프)에 기재된 값을 그대로 사용할 것. 유사 제품·일반 상식·LLM 사전지식으로 채우지 말 것.
- IDENTITY DATA (CRITICAL): phone numbers, business/item registration numbers, addresses, courier/partner brand names, account numbers — use ONLY strings that appear verbatim in the brief. If the brief has none, OMIT the row/line entirely (e.g., write "고객센터로 문의해 주세요" without a number). A fabricated phone number sends real customers to a stranger.
- IMAGE REALITY (CRITICAL): each image's 컷 내용 note starting with "실물 확인" describes what is ACTUALLY in the image — trust it over the filename or your assumption. A note marked "차선 — 소형 슬롯에만" may only fill small thumbnail slots, never hero/full-bleed.
- ORIENTATION-FIT: notes mark each image [세로]/[가로]/[정방]. NEVER place a [세로] image into a wide panorama/full-width banner slot — it becomes a grotesque over-zoomed crop. Wide full-bleed slots take [가로] images only.
- IMAGE-ASSET GROUNDING: blocks whose visual story requires specific subjects (raw ingredients for 원료 공식/원료 비주얼, real usage scene for usage photos) may only be selected if a note confirms such an image EXISTS. Never caption an image with content it does not show (e.g., a package close-up captioned as "베르가못 오일"). If no fitting image exists, choose a text/graphic variant instead.
- CUTOUT USE: 누끼(제품 단독컷) images fit product-focused slots (hero, detail, feature, ingredient). Do NOT use them as story/gallery/mood backgrounds or full-bleed scenery.
- NO EMOJI anywhere in output text — this is a professional detail page; use block-provided icons only.
- ICON VOCABULARY (CRITICAL): every "icon" slot accepts ONLY these names — ${ICON_NAMES.join(' | ')}. NEVER invent icon names (no "protein", "coffee" etc.). If no icon fits the meaning, use the closest generic one (check/star/target).
- REPETITION CAP: state each numeric claim (e.g. "단백질 20g") at most TWICE per page. From the 3rd mention, replace it with NEW information: a comparison basis, a daily-intake %, or a usage scenario. Repeating identical claims collapses scroll value.
- HERO HOOK: the hero headline must NOT be a spec list ("20g / 105kcal" style). Write ONE sentence about the customer's change, sensation, or desire; move numbers into sub-copy or point rows.
- GROUNDING-FIT: if the brief lacks the grounded data a block's REQUIRED fields/counts demand (e.g., package/price variants need 2+ real 구성·가격, review variants need real 후기), DO NOT select that block — pick a different archetype you CAN fill honestly. Never pad required arrays with invented or near-empty entries.
- Do not output tokens/colors — only presetKey. The system derives the palette.`

/** 카탈로그 로테이션 — 호출마다 다른 부분집합을 FEATURED로 지목해 LLM의 익숙한 변형 편향을 깬다.
 *  id 접두 계열별 셔플 후 상위 N개 추출 → 모든 계열이 매 호출 노출 기회를 가진다. */
function sampleFeatured(avoid: ReadonlySet<string>, perFamily = 3, cap = 48): string[] {
  const byFamily = new Map<string, string[]>()
  for (const c of catalog()) {
    if (!CONTRACTED_IDS.has(c.id)) continue
    if (c.id.startsWith('closing-')) continue
    if (avoid.has(c.id)) continue
    const fam = c.id.split('-')[0]
    const arr = byFamily.get(fam) ?? []
    arr.push(c.id)
    byFamily.set(fam, arr)
  }
  const picked: string[] = []
  for (const arr of byFamily.values()) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    picked.push(...shuffled.slice(0, perFamily))
  }
  return picked.sort(() => Math.random() - 0.5).slice(0, cap)
}

function buildUserPrompt(input: BlocksComposerInput, repairNote?: string): string {
  const { brief, images } = input
  const notes = input.imageNotes ?? {}
  const withNote = (u: string): string => (notes[u] ? `${u}\n    ↳ 컷 내용: ${notes[u]}` : u)
  const imgLines: string[] = []
  if (images?.hero) imgLines.push(`- hero(메인): ${withNote(images.hero)}`)
  if (images?.cutout) imgLines.push(`- cutout(누끼/단면): ${withNote(images.cutout)}`)
  ;(images?.lifestyle ?? []).forEach((u, i) => imgLines.push(`- lifestyle${i + 1}(연출): ${withNote(u)}`))
  ;(images?.section ?? []).forEach((u, i) => imgLines.push(`- section${i + 1}: ${withNote(u)}`))
  const imageBlock = imgLines.length ? imgLines.join('\n') : '(제공 이미지 없음 — 이미지 슬롯은 생략)'
  const distinctImgs = new Set([images?.hero, images?.cutout, ...(images?.lifestyle ?? []), ...(images?.section ?? [])].filter(Boolean)).size
  const imgBudget =
    distinctImgs === 0
      ? ''
      : distinctImgs < 5
        ? `\n\nIMAGE BUDGET (엄수): 서로 다른 이미지가 ${distinctImgs}장뿐이다. 같은 이미지 URL은 **최대 1개 블록**에만 사용. 이미지 슬롯을 채우는 블록 수를 ${Math.min(distinctImgs, 8)}개 이하로 유지하고, 나머지 자리는 이미지 없이도 완성돼 보이는 텍스트/그래픽/수치 변형을 선택하라. 점선 placeholder 박스가 보이면 실패다 — image? 필드를 비울 바에는 이미지 없는 변형을 고를 것.`
        : ''

  const required =
    brief.requiredContent?.phrases?.length
      ? `\nREQUIRED PHRASES (verbatim 등장):\n${brief.requiredContent.phrases.map((p) => `- "${p}"`).join('\n')}`
      : ''
  const certs =
    brief.requiredContent?.certifications?.length
      ? `\nCERTIFICATIONS (cert/spec 근거로만 사용):\n${brief.requiredContent.certifications.map((c) => `- "${c}"`).join('\n')}`
      : '\nCERTIFICATIONS: (없음) → 인증/수치 지어내지 말 것'
  const forbidden = brief.restrictions?.words?.length
    ? `\nFORBIDDEN WORDS: ${brief.restrictions.words.map((w) => `"${w}"`).join(', ')}`
    : ''

  const repair = repairNote
    ? `\n\n⚠️ 직전 출력이 검증 실패. 아래 오류를 정확히 고쳐 다시 유효 JSON만 출력:\n${repairNote}`
    : ''

  const avoid = new Set(input.avoidVariants ?? [])
  const avoidBlock = avoid.size
    ? `\n\nDO NOT USE (다른 페이지에서 이미 사용 — 다사 비교 시 차별화를 위해 이번 페이지 사용 금지):\n${[...avoid].join(', ')}`
    : ''

  return `제품명: ${brief.productName}
카테고리: ${brief.category}
플랫폼: ${brief.platform}
타겟: ${brief.targetAudience}
핵심 강조점: ${(brief.keyHighlights ?? []).join(' | ')}
톤: ${(brief.toneKeywords ?? []).join(', ')} / 방향: ${brief.styleDirection ?? ''}${required}${certs}${forbidden}

사용 가능한 이미지:
${imageBlock}${imgBudget}

${
  input.blueprint
    ? `PAGE BLUEPRINT (BINDING — 아래 순서·변형·이미지 배정을 그대로 따르라. 변형 임의 교체·추가 금지):
${input.blueprint.sections
  .map((s, i) => `${i + 1}. ${s.variantId} | 이미지: ${s.imageUrls.join(', ') || '(없음)'} | 내용: ${s.copyBrief}`)
  .join('\n')}

카피 원천 (CRITICAL): 각 항목의 '내용'은 고객이 승인한 스크립트의 요지다 — 이를 다듬어 슬롯을 채우고, 여기에 없는 사실·수치·주장을 창작하지 말 것.`
    : `FEATURED VARIANTS (이번 페이지 다양성 로테이션 — 역할에 맞으면 카탈로그의 다른 변형보다 우선 선택):
${sampleFeatured(avoid).join(', ')}

${avoidBlock}`
}\n\n시스템 프롬프트의 블록 카탈로그·데이터 계약을 준수해, 위 제품을 위한 상세페이지를 블록 조합으로 설계해 JSON으로 출력하세요.${repair}`
}

/** 캐시 대상 정적 페이로드 — 카탈로그+데이터 계약(~70k자)은 호출마다 동일하므로 시스템 블록으로 옮겨
 *  프롬프트 캐싱(cache_control) 적용. avoid 필터를 여기 적용하면 캐시가 깨지므로 회피는
 *  유저 프롬프트의 DO NOT USE 지시로만 처리한다. 캐시 히트 시 이 구간 입력 단가 90% 절감. */
let staticCatalogBlock: string | null = null
function getStaticCatalogBlock(): string {
  if (staticCatalogBlock) return staticCatalogBlock
  staticCatalogBlock = `블록 카탈로그(variantId · archetype · imageSlots · 설명):
${catalog()
  .filter((c) => CONTRACTED_IDS.has(c.id))
  .map((c) => `- ${c.id} · ${c.archetype} · img${c.imageSlots} · ${c.describe}`)
  .join('\n')}

각 블록 데이터 계약:
${DATA_CONTRACTS}`
  return staticCatalogBlock
}


/** 결정적 이미지 새니타이저 — LLM이 지어낸 URL 제거 + 같은 이미지 3회째부터 제거.
 *  제거로 블록 스키마가 깨지면 해당 블록 데이터 원복(필수 필드 보호). 프롬프트 규칙의 확률적 위반을 코드로 봉쇄. */
function sanitizeSpecImages(spec: PageSpec, allowed: ReadonlySet<string>): { removedFabricated: number; removedOverBudget: number } {
  let removedFabricated = 0
  let removedOverBudget = 0
  // 섹션 중요도 — 예산 초과 시 낮은 곳부터 이미지를 회수한다(특장점이 스펙표에 이미지를 뺏기지 않도록)
  const PRIORITY: Record<string, number> = {
    hero: 100, closing: 90,
    feature: 80, point: 80, ingredient: 80, stats: 78, detail: 76,
    story: 60, gallery: 60, usage: 60, compare: 58, recommend: 56, review: 54,
    banner: 50, event: 50, promo: 50, discount: 50, award: 50,
    checklist: 40, checkpoint: 40, reason: 40, equation: 40, callout: 40, strip: 40, cert: 40, lineup: 40,
    faq: 10, shipping: 10, cs: 10, spec: 10,
  }
  type Ref = { obj: Record<string, unknown>; key: string; blockIdx: number; prio: number }
  const refsByUrl = new Map<string, Ref[]>()
  const collect = (obj: Record<string, unknown>, blockIdx: number, prio: number): void => {
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string' && /^https?:\/\//.test(v)) {
        if (!allowed.has(v)) {
          obj[k] = undefined
          removedFabricated++
          continue
        }
        const arr = refsByUrl.get(v) ?? []
        arr.push({ obj, key: k, blockIdx, prio })
        refsByUrl.set(v, arr)
      } else if (Array.isArray(v)) {
        for (const item of v) if (item && typeof item === 'object') collect(item as Record<string, unknown>, blockIdx, prio)
      } else if (v && typeof v === 'object') {
        collect(v as Record<string, unknown>, blockIdx, prio)
      }
    }
  }
  const backups = spec.blocks.map((b) => JSON.parse(JSON.stringify(b.data ?? {})))
  spec.blocks.forEach((b, i) => {
    const arch = String(getVariant(b.variantId)?.archetype ?? '')
    collect((b.data ?? {}) as Record<string, unknown>, i, PRIORITY[arch] ?? 45)
  })
  for (const [, refs] of refsByUrl) {
    if (refs.length <= 2) continue
    // 우선순위 낮은 곳부터 회수 (동순위면 문서 뒤쪽부터)
    const sorted = [...refs].sort((a, b) => a.prio - b.prio || b.blockIdx - a.blockIdx)
    for (let i = 0; i < refs.length - 2; i++) {
      sorted[i].obj[sorted[i].key] = undefined
      removedOverBudget++
    }
  }
  // 백업 복원 시 지어낸 URL이 되살아나면 안 된다 — 예산 회수만 되돌리고 위조 URL은 재제거
  const stripFabricated = (obj: Record<string, unknown>): void => {
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string' && /^https?:\/\//.test(v) && !allowed.has(v)) obj[k] = undefined
      else if (Array.isArray(v)) {
        for (const item of v) if (item && typeof item === 'object') stripFabricated(item as Record<string, unknown>)
      } else if (v && typeof v === 'object') stripFabricated(v as Record<string, unknown>)
    }
  }
  spec.blocks.forEach((b, i) => {
    const schema = getVariant(b.variantId)?.schema
    if (schema && !schema.safeParse(b.data).success) {
      b.data = backups[i]
      stripFabricated((b.data ?? {}) as Record<string, unknown>)
    }
  })
  return { removedFabricated, removedOverBudget }
}

/** ── 결정적 자동 수리(repair) + 불량 블록 드롭(salvage) ─────────────────────
 *  LLM 출력의 사소한 스키마 위반(배열 개수 초과·문자열 길이 초과·빈 문자열)은 재호출 없이 기계적으로
 *  수리하고, 수리 불가 블록은 드롭한다. 블록 1개 불량이 페이지 전체 실패로 번지지 않게 하는 최종 방어선.
 *  단 히어로(첫 블록)·클로징(마지막 블록)은 페이지 성립 요건이라 수리 실패 시 throw — 상위 재시도로 넘긴다. */
type RepairIssue = {
  code: string
  path?: (string | number)[]
  maximum?: number | bigint
  minimum?: number | bigint
  origin?: string
  keys?: string[]
  /** invalid_value(enum/literal 위반) 시 zod가 허용값 목록을 담는 필드 */
  values?: unknown[]
}

function resolveParent(root: unknown, path: (string | number)[]): { parent: Record<string, unknown> | null; key: string | number } {
  let parent: unknown = root
  for (let i = 0; i < path.length - 1; i++) parent = (parent as Record<string, unknown> | undefined)?.[path[i] as never]
  return {
    parent: parent && typeof parent === 'object' ? (parent as Record<string, unknown>) : null,
    key: path[path.length - 1],
  }
}

/** path 조상 중 가장 가까운 배열 원소를 제거 — 필수 필드가 비어 아이템 자체가 성립 불가할 때의 최후 수단 */
function dropNearestArrayItem(root: unknown, path: (string | number)[]): boolean {
  for (let i = path.length - 1; i >= 0; i--) {
    if (typeof path[i] !== 'number') continue
    let arr: unknown = root
    for (let j = 0; j < i; j++) arr = (arr as Record<string, unknown> | undefined)?.[path[j] as never]
    if (Array.isArray(arr)) {
      arr.splice(path[i] as number, 1)
      return true
    }
  }
  return false
}

function applyMechanicalFixes(data: unknown, issues: RepairIssue[]): boolean {
  let fixed = false
  // 뒤쪽 인덱스부터 처리 — 배열 splice가 앞쪽 이슈의 path를 흔들지 않도록
  const sorted = [...issues].sort((a, b) => JSON.stringify(b.path ?? []).localeCompare(JSON.stringify(a.path ?? [])))
  for (const issue of sorted) {
    const path = issue.path ?? []
    const { parent, key } = resolveParent(data, path)
    if (issue.code === 'unrecognized_keys' && issue.keys) {
      const target = path.length === 0 ? (data as Record<string, unknown>) : (parent?.[key as never] as Record<string, unknown> | undefined)
      if (target && typeof target === 'object') {
        for (const k of issue.keys) delete target[k]
        fixed = true
      }
    } else if (issue.code === 'too_big' && parent) {
      const v = parent[key as never] as unknown
      const max = Number(issue.maximum)
      if (Array.isArray(v) && Number.isFinite(max)) {
        v.length = max
        fixed = true
      } else if (typeof v === 'string' && Number.isFinite(max)) {
        ;(parent as Record<string, unknown>)[key as never] = v.slice(0, max) as never
        fixed = true
      } else if (typeof v === 'number' && Number.isFinite(max)) {
        // 수치 상한 위반은 상한으로 클램프 (비타민 1000% 같은 실데이터 — 블록 드롭보다 보수적 표기가 낫다)
        ;(parent as Record<string, unknown>)[key as never] = Number(max) as never
        fixed = true
      }
    } else if (issue.code === 'too_small' && issue.origin === 'string' && parent) {
      // 빈/짧은 문자열은 지어낼 수 없다 — 필드 제거(옵션 필드면 통과), 필수면 다음 라운드 invalid_type에서 아이템 제거
      delete parent[key as never]
      fixed = true
    } else if (issue.code === 'invalid_value' && parent) {
      // enum 위반 — 아이콘 필드에 한해 어휘 내 최근접 이름으로 치환(히어로가 아이콘 하나로 전체
      // 재생성되던 실사례 8건 봉쇄). 아이콘 외 enum(달력 status·bgTone 등)은 오치환이 의미를
      // 왜곡하므로(리뷰 지적) 치환하지 않고 해당 배열 항목 드롭 → 필드 제거 순으로 위임한다.
      const allowed = issue.values?.filter((v): v is string => typeof v === 'string') ?? []
      const cur = parent[key as never] as unknown
      const isIconField =
        String(key) === 'icon' || (allowed.length > 0 && allowed.every((a) => (ICON_NAMES as readonly string[]).includes(a)))
      if (isIconField && allowed.length > 0 && typeof cur === 'string') {
        const lc = cur.toLowerCase()
        // 최장 일치 우선 — "shield-check"는 check가 아니라 shield로 (부분 일치 다수 시 의미 보존)
        const near = allowed
          .filter((a) => lc.includes(a.toLowerCase()) || a.toLowerCase().includes(lc))
          .sort((a, b) => b.length - a.length)[0]
        const pick = near ?? (allowed.includes('check') ? 'check' : allowed[0])
        ;(parent as Record<string, unknown>)[key as never] = pick as never
        console.warn(`[Blocks Composer] 아이콘 enum 치환 — "${cur}" → "${pick}"`)
        fixed = true
      } else if (dropNearestArrayItem(data, path)) {
        fixed = true
      } else {
        // 배열 밖 단독 필드 — 필드 제거(옵션이면 통과, 필수면 다음 라운드가 블록 단위로 처리)
        delete parent[key as never]
        fixed = true
      }
    } else if (issue.code === 'invalid_type' && path.length > 0) {
      const { parent: p2, key: k2 } = resolveParent(data, path)
      const cur = p2?.[k2 as never]
      if (cur === undefined && dropNearestArrayItem(data, path)) fixed = true
      // 타입 불일치(예: bullets 아이템이 객체여야 하는데 문자열 — hero-card-wrapper 3연속 실패
      // 실사례): 해당 배열 아이템만 드롭해 블록을 살린다
      else if (cur !== undefined && dropNearestArrayItem(data, path)) fixed = true
    }
  }
  return fixed
}

export function repairAndSalvageBlocks(spec: PageSpec): void {
  const kept: PageSpec['blocks'] = []
  const dropped: string[] = []
  let repairedCount = 0
  const lastIdx = spec.blocks.length - 1
  for (let i = 0; i < spec.blocks.length; i++) {
    const b = spec.blocks[i]
    const schema = getVariant(b.variantId)?.schema
    if (!schema) {
      kept.push(b)
      continue
    }
    let res = schema.safeParse(b.data)
    let touched = false
    for (let t = 0; !res.success && t < 5; t++) {
      if (!applyMechanicalFixes(b.data, res.error.issues as unknown as RepairIssue[])) break
      touched = true
      res = schema.safeParse(b.data)
    }
    if (res.success) {
      if (touched) repairedCount++
      kept.push(b)
      continue
    }
    if (i === 0 || i === lastIdx) {
      throw new Error(
        `[composer] invalid slot data for ${b.variantId} (block ${i}, 자동수리 불가): ${JSON.stringify(res.error.issues).slice(0, 600)}`,
      )
    }
    dropped.push(b.variantId)
  }
  if (repairedCount) console.warn(`[Blocks Composer] 스키마 자동 수리 — ${repairedCount}개 블록`)
  if (dropped.length) console.warn(`[Blocks Composer] 수리 불가 블록 드롭 — ${dropped.join(', ')}`)
  if (kept.length < 6)
    throw new Error(`[composer] 드롭 후 블록 ${kept.length}개(<6) — 페이지 구성 미달 (dropped: ${dropped.join(', ')})`)
  spec.blocks = kept
}

/** ── 근거 없는 단위 수치 봉쇄 ─────────────────────────────────────────────
 *  식품 상세페이지에서 영양·용량 수치를 지어내면 표시광고 리스크가 된다.
 *  브리프(고객 제공 데이터)·이미지노트 코퍼스에 없는 "숫자+단위" 토큰을 실은 블록은 드롭.
 *  단위 없는 숫자(순번·개수 등)는 검사하지 않아 오탐을 피한다. 프롬프트 GROUNDING 규칙의 결정적 백업. */
const UNIT_NUM_RE = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(g|kg|mg|kcal|ml|l|%)(?![a-z0-9])/gi

function collectUnitNums(text: string): Set<string> {
  const out = new Set<string>()
  for (const m of text.matchAll(UNIT_NUM_RE)) {
    out.add(`${parseFloat(m[1].replace(/,/g, ''))}${m[2].toLowerCase()}`)
  }
  return out
}

/** ── 배치 결함 결정적 가드 3종 ─────────────────────────────────────────────
 *  ① 표/FAQ/배송/CS 계열(텍스트 주도)에서 이미지 필드 강제 제거 — 프롬프트 규칙(IMAGE-SECTION
 *     SEMANTICS)의 확률적 위반을 코드로 봉쇄 (황태 영양표에 누끼가 들어간 실사례).
 *  ② 이모지 스트립 — 상세페이지 디자인 정책상 이모지 금지(아트 디렉터 규칙)를 블록 데이터에도 적용.
 *  ③ 누끼(제품 단독컷) 배치 화이트리스트 — 연출형 스토리/갤러리/무드 슬롯에 누끼가 들어가면
 *     과확대 크롭 괴물이 된다(럽앤 실사례). 제품 중심 아키타입에만 허용. */
const TEXT_LED_ARCHETYPES = new Set(['spec', 'faq', 'shipping', 'cs'])
const CUTOUT_OK_ARCHETYPES = new Set(['hero', 'detail', 'feature', 'point', 'ingredient', 'usage', 'compare', 'equation', 'stats'])
const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu

function walkStringFields(
  obj: Record<string, unknown>,
  fn: (parent: Record<string, unknown>, key: string, value: string) => void,
): void {
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    if (typeof v === 'string') fn(obj, k, v)
    else if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const item = v[i]
        if (typeof item === 'string') fn(v as unknown as Record<string, unknown>, String(i), item)
        else if (item && typeof item === 'object') walkStringFields(item as Record<string, unknown>, fn)
      }
    } else if (v && typeof v === 'object') walkStringFields(v as Record<string, unknown>, fn)
  }
}

const LOGO_OK_ARCHETYPES = new Set(['hero', 'closing', 'cs'])

/** 명백한 텍스트 필드 키 — URL이 이 필드에 들어가면 화면에 경로 문자열이 그대로 노출된다
 *  (럽앤 히어로 brand 필드에 로고 서명 URL 실사례, 시각 감사 검출). 이미지 키 화이트리스트는
 *  변형별 명명이 제각각(prop, hero, wreathTL…)이라 오탐 위험 — 텍스트 키 블록리스트가 오탐 0. */
const TEXT_ONLY_KEY_RE =
  /^(title|subtitle|headline|big|small|text|desc|description|label|name|brand|brandLogo|brandName|quote|by|caption|line|closer|closerSub|sub|copy|body|note|question|answer|head|kicker|tagline|cta)$/i

/** 다행 리스트 이미지 균일성(블록 단위) — 일부 행에만 이미지가 있으면 전부 제거(절름발이 레이아웃 방지).
 *  usage·ingredient 한정이던 것을 전 아키타입으로 확대(feature-checkpoint-rail 빈 링 실사례) +
 *  검사 키를 'image' 하드코딩에서 변형 render의 배열 아이템 media 키 자동 식별로 일반화.
 *  배치 가드와 페어링 QA(개별 제거로 배열을 부분 채움으로 만드는 유일한 후행 패스) 양쪽에서 호출. */
function uniformizeBlockItemImages(b: PageSpec['blocks'][number]): number {
  let removed = 0
  const data = (b.data ?? {}) as Record<string, unknown>
  const vshape = ((getVariant(b.variantId)?.schema as { shape?: Record<string, unknown> } | undefined)?.shape) ?? {}
  const itemImgKeys = new Set(['image', ...[...mediaSlotKeys(b.variantId)].filter((k) => !(k in vshape))])
  for (const v of Object.values(data)) {
    if (!Array.isArray(v) || v.length < 2) continue
    const items = v.filter((it): it is Record<string, unknown> => Boolean(it) && typeof it === 'object')
    if (items.length < 2) continue
    for (const key of itemImgKeys) {
      const withImg = items.filter((it) => typeof it[key] === 'string' && /^https?:\/\//.test(String(it[key])))
      if (withImg.length > 0 && withImg.length < items.length) {
        for (const it of items) delete it[key]
        removed += withImg.length
      }
    }
  }
  return removed
}

export function applyPlacementGuards(
  spec: PageSpec,
  cutoutSet: ReadonlySet<string>,
  logoSet: ReadonlySet<string> = new Set(),
): void {
  const stats: Record<string, number> = { textLedImg: 0, emoji: 0, cutoutMoved: 0, usageUniform: 0, logoMoved: 0, urlInText: 0, emSpace: 0, containSlot: 0, urlDup: 0 }

  // URL 1회 사용 가드 — 같은 이미지 URL의 2번째 이후 등장 슬롯을 결정적으로 제거.
  // redistributeUnusedImages의 pool은 미사용 URL만 다루므로 이 가드와 충돌 없음.
  {
    const urlCount = new Map<string, number>()
    for (const b of spec.blocks) {
      walkStringFields((b.data ?? {}) as Record<string, unknown>, (parent, key, value) => {
        if (!/^https?:\/\//.test(value)) return
        const count = (urlCount.get(value) ?? 0) + 1
        urlCount.set(value, count)
        if (count >= 2) {
          delete parent[key]
          stats.urlDup++
        }
      })
    }
  }

  for (const b of spec.blocks) {
    const arch = String(getVariant(b.variantId)?.archetype ?? '')
    // 누끼 전용 필드(contain 프레임) — 레지스트리가 CSS×render 대조로 자동 산출 (Sprint 12)
    const containKeys = containSlotKeys(b.variantId)
    const data = (b.data ?? {}) as Record<string, unknown>
    // 다행 리스트 이미지 균일성 — 함수로 추출(uniformizeBlockItemImages): 페어링 QA가 개별
    // 제거로 배열을 부분 채움으로 만든 뒤 재적용할 수 있어야 해서(성분 2/4 노출 실사례).
    stats.usageUniform += uniformizeBlockItemImages(b)
    walkStringFields(data, (parent, key, value) => {
      const isUrl = /^https?:\/\//.test(value)
      // URL이 명백한 텍스트 필드에 들어가면 경로 문자열이 화면에 노출 — 필드 수술
      if (isUrl && TEXT_ONLY_KEY_RE.test(key)) {
        delete parent[key]
        stats.urlInText++
        return
      }
      if (isUrl && TEXT_LED_ARCHETYPES.has(arch)) {
        delete parent[key]
        stats.textLedImg++
        return
      }
      if (isUrl && cutoutSet.has(value) && !CUTOUT_OK_ARCHETYPES.has(arch)) {
        delete parent[key]
        stats.cutoutMoved++
        return
      }
      // 브랜드 로고는 브랜드 라벨 성격 슬롯(hero/closing/cs)에만 — 본문 콘텐츠 이미지로 오배치 금지
      if (isUrl && logoSet.has(value) && !LOGO_OK_ARCHETYPES.has(arch)) {
        delete parent[key]
        stats.logoMoved++
        return
      }
      // 누끼 전용 슬롯(contain 장식 프레임)에 배경 있는 실사·원본이 들어가면 사각 사진이
      // 프레임 안에 그대로 노출된다(동원 ingredient-spotlight 원형 속 사각 실사례) —
      // 누끼·로고 외 URL은 제거하고 noimg-safe 강등에 맡긴다.
      if (isUrl && containKeys.has(key) && !cutoutSet.has(value) && !logoSet.has(value)) {
        delete parent[key]
        stats.containSlot++
        return
      }
      // 클로징 무드 배경에 업로드 원본 금지 — 원본은 앵글·라벨 방향이 통제되지 않아
      // 풀블리드 배경에서 거꾸로 팩이 그대로 노출된다(매일 실사례). 태거는 고객 원본을
      // reject하지 않는 설계(실물=정답 기준)라 이 가드가 유일한 방벽. 무드 배경은 연출 생성컷만.
      // 히어로도 동일 — §4는 "hero = 연출 생성컷만(로고는 소형 슬롯만)"인데 코드 가드가
      // closing에만 있어 프롬프트 지시에만 의존하던 비대칭을 해소한다(룰 감사 §8 공백 목록).
      // 로고·누끼는 §4가 명시 허용하므로 예외 — 위 logoSet/cutoutSet 가드가 별도로 통제한다.
      const heroOriginalBanned =
        arch === 'hero' && !logoSet.has(value) && !cutoutSet.has(value)
      // 업로드 원본 실사(배경·앵글·라벨 방향 미통제 → 검은배경·기울어진 팩 그대로 노출)는
      // 연출·라이프스타일 슬롯에 부적합하다. 제품/성분 클로즈업 성격 아키타입(ingredient·detail·
      // spec)과 hero 누끼 슬롯만 원본을 허용하고, 그 외 전 아키타입(story·feature·usage·mood·
      // gallery·banner·point·review·callout·compare·closing…)에는 원본 배치를 차단한다.
      // (이전엔 hero/closing만 막아 원본 실사가 story 등 연출 블록에 그대로 들어갔다.)
      const originalAllowedArch = arch === 'ingredient' || arch === 'detail' || arch === 'spec'
      // 허용 아키타입이라도 최상위(대형 hero/대표) 슬롯엔 원본 금지 — 행별 소형 슬롯만.
      // 기울어진 업로드 원본이 ingredient 대표 이미지로 크게 걸리던 실사례(동원 INGREDIENTS 상단).
      const isTopLevelSlot = parent === data
      const bannedForOriginal =
        heroOriginalBanned || (arch !== 'hero' && !originalAllowedArch) || (originalAllowedArch && isTopLevelSlot)
      if (isUrl && bannedForOriginal && (value.includes('/intake-files/') || value.includes('/cutouts/'))) {
        delete parent[key]
        stats.closingOriginal = (stats.closingOriginal ?? 0) + 1
        return
      }
      // 강조 스팬 경계 공백 누락 수술 — "…텍스처를</span>발행하다"처럼 조사로 끝나는 강조 뒤에
      // 한글이 바로 붙으면 항상 띄어쓰기 오류(단어 중간 강조는 조사로 끝나지 않아 오탐 없음)
      if (!isUrl && /[가-힣][를을이가은는와과도의로에서]<\/span>[가-힣]/.test(value)) {
        parent[key] = value.replace(/([가-힣][를을이가은는와과도의로에서]<\/span>)(?=[가-힣])/g, '$1 ')
        stats.emSpace = (stats.emSpace ?? 0) + 1
      }
      if (!isUrl && EMOJI_RE.test(value)) {
        const cleaned = value.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim()
        stats.emoji++
        if (cleaned) parent[key] = cleaned
        else delete parent[key]
      }
    })
  }
  reportAdd('placement-guards', stats)
  if (stats.textLedImg || stats.emoji || stats.cutoutMoved || stats.usageUniform || stats.urlInText || stats.containSlot || stats.closingOriginal || stats.urlDup)
    console.warn(
      `[Blocks Composer] 배치 가드 — 표계열 이미지 제거 ${stats.textLedImg} · 이모지 정리 ${stats.emoji} · 누끼 오배치 제거 ${stats.cutoutMoved} · 스텝 균일화 ${stats.usageUniform} · 로고 오배치 ${stats.logoMoved} · 텍스트필드URL 수술 ${stats.urlInText} · 강조경계 공백 ${stats.emSpace} · 누끼전용슬롯 실사 제거 ${stats.containSlot} · 클로징 원본 제거 ${stats.closingOriginal ?? 0} · URL 중복 제거 ${stats.urlDup}`,
    )
}

/** 제품 스펙 수치 린터 — 중량·개입 패턴(예: "56g(14g×4개입)")이 원천 텍스트(groundingCorpus)에 없는
 *  조합이면 결정적 치환(원본 집합이 정확히 1개일 때) 또는 위반 수집 후 경고. 순수 함수(테스트 가능).
 *  패턴: /(\d+(?:\.\d+)?)g\s*\((\d+(?:\.\d+)?)g\s*[×xX]\s*(\d+)개입\)/ (내부 공백 유연). */
function mkQtyRe(): RegExp {
  // 괄호형: 56g(14g×4개입) · 56g (14g × 4개입)
  // 쉼표형: 56g, 14g×4개입 · 56g, 14g × 4개입  (괄호 없는 원문 형태)
  // 공통: ×(U+00D7)·x·X, 내부 공백 유연, 닫는 ) 선택적
  return /(\d+(?:\.\d+)?)\s*g\s*[,(]\s*(\d+(?:\.\d+)?)\s*g\s*[×xX]\s*(\d+)\s*개입\s*\)?/g
}

type QtyCombo = { total: string; perUnit: string; count: string; key: string }

function extractQtyCombos(text: string): QtyCombo[] {
  const result: QtyCombo[] = []
  for (const m of text.matchAll(mkQtyRe())) {
    result.push({ total: m[1], perUnit: m[2], count: m[3], key: `${m[1]}g(${m[2]}g×${m[3]}개입)` })
  }
  return result
}

/** 단독 중량 라벨 패턴 — 실제중량·총중량 등 라벨 키워드 뒤에 단독으로 오는 g값.
 *  - 콤보 패턴(56g(14g×4개입))은 mkQtyRe()가 담당 — 여기선 괄호/쉼표 시작을 negative lookahead로 제외.
 *  - 영양성분(단백질 10g), 급여량(1일 30g) 등은 라벨 키워드가 없어 오탐 발생 안 함(라벨 문맥 한정). */
const WEIGHT_LABEL_RE_SRC =
  '(실제중량|총중량|순중량|내용량|단위중량)\\s*[:：]?\\s*(\\d+(?:\\.\\d+)?)\\s*g(?!\\s*[,(×xX])'

export function extractSrcWeights(text: string): Set<string> {
  const result = new Set<string>()
  for (const m of text.matchAll(new RegExp(WEIGHT_LABEL_RE_SRC, 'g'))) result.add(m[2])
  return result
}

export function fixSpecQuantities(spec: PageSpec, sourceText: string): void {
  const srcCombos = extractQtyCombos(sourceText)
  const srcKeys = new Set(srcCombos.map((c) => c.key))
  let substituted = 0
  const violations: string[] = []

  // ── 콤보 중량·개입 체크 (56g(14g×4개입) 패턴) ───────────────────────────────
  for (const b of spec.blocks) {
    walkStringFields((b.data ?? {}) as Record<string, unknown>, (parent, key, value) => {
      const found = extractQtyCombos(value)
      if (!found.length) return
      const bad = found.filter((c) => !srcKeys.has(c.key))
      if (!bad.length) return
      if (srcCombos.length === 1) {
        // 원본 집합이 정확히 1개 — 틀린 조합을 결정적으로 교정, 이미 올바른 조합은 보존
        const replacement = srcCombos[0].key
        parent[key] = (parent[key] as string).replace(mkQtyRe(), (_match, total, perUnit, count) => {
          const k = `${total}g(${perUnit}g×${count}개입)`
          return srcKeys.has(k) ? _match : replacement
        })
        substituted++
      } else {
        violations.push(...bad.map((c) => `${b.variantId}.${key}:${c.key}`))
      }
    })
  }

  // ── 단독 중량 라벨 체크 (실제중량 56g 등) ────────────────────────────────────
  // 원문에 없는 g값이 중량 라벨 문맥에 나오면 원문 유일값으로 치환, 복수·부재 시 위반 기록.
  // 영양성분 %·급여량 등 다른 수치는 라벨 키워드 문맥이 아니므로 오탐 안 됨.
  const srcWeights = extractSrcWeights(sourceText)
  const srcWeightArr = [...srcWeights]
  const weightLabelRe = new RegExp(WEIGHT_LABEL_RE_SRC, 'g')
  for (const b of spec.blocks) {
    walkStringFields((b.data ?? {}) as Record<string, unknown>, (parent, key, value) => {
      const bad = [...value.matchAll(new RegExp(WEIGHT_LABEL_RE_SRC, 'g'))].filter((m) => !srcWeights.has(m[2]))
      if (!bad.length) return
      if (srcWeightArr.length === 1) {
        const target = srcWeightArr[0]
        parent[key] = (parent[key] as string).replace(weightLabelRe, (_m, label, val) =>
          srcWeights.has(val) ? _m : `${label}${target}g`,
        )
        substituted++
      } else {
        violations.push(...bad.map((m) => `${b.variantId}.${key}:weight-label-${m[2]}g`))
      }
    })
  }

  if (substituted || violations.length) {
    console.warn(
      `[Blocks Composer] 수치 린터 — 중량·개입 치환 ${substituted}건 · 미매칭 위반 ${violations.length}건${violations.length ? ` (${violations.slice(0, 4).join(' · ')})` : ''}`,
    )
    reportAdd('quantity-lint', { substituted, violations: violations.slice(0, 8) })
  }
}

/** 무근거 전화번호 수술 — 브리프에 없는 전화번호(하이픈 표기)가 든 문자열 필드를 제거한다.
 *  지어낸 상담 전화는 실제 고객을 엉뚱한 번호로 보내는 사고 — 프롬프트 규칙의 결정적 백업.
 *  필드 제거로 스키마가 깨지면 이어지는 repairAndSalvageBlocks가 해당 배열 아이템만 들어낸다. */
const PHONE_RE = /(?<!\d)0\d{1,2}-\d{3,4}-\d{4}(?!\d)/g

export function sanitizeUngroundedPhones(spec: PageSpec, corpus: string): void {
  const digits = (s: string): string => s.replace(/\D/g, '')
  const grounded = new Set([...corpus.matchAll(PHONE_RE)].map((m) => digits(m[0])))
  const removed: string[] = []
  const walk = (obj: Record<string, unknown>, variantId: string): void => {
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string') {
        const bad = [...v.matchAll(PHONE_RE)].filter((m) => !grounded.has(digits(m[0])))
        if (bad.length) {
          delete obj[k]
          removed.push(`${variantId}.${k}(${bad.map((m) => m[0]).join(',')})`)
        }
      } else if (Array.isArray(v)) {
        for (const item of v) if (item && typeof item === 'object') walk(item as Record<string, unknown>, variantId)
      } else if (v && typeof v === 'object') {
        walk(v as Record<string, unknown>, variantId)
      }
    }
  }
  for (const b of spec.blocks) walk((b.data ?? {}) as Record<string, unknown>, b.variantId)
  if (removed.length) console.warn(`[Blocks Composer] 무근거 전화번호 제거 — ${removed.join(' · ')}`)
}

export function dropUngroundedNumericBlocks(spec: PageSpec, corpus: string): void {
  const grounded = collectUnitNums(corpus)
  const lastIdx = spec.blocks.length - 1
  const dropped: string[] = []
  spec.blocks = spec.blocks.filter((b, i) => {
    const nums = collectUnitNums(JSON.stringify(b.data ?? {}))
    const violations = [...nums].filter((n) => !grounded.has(n))
    if (violations.length === 0) return true
    // 무근거 1개는 정당한 파생일 수 있다(5g×2포→10g, "대두만 사용"→100%) — 경고만.
    // 2개 이상 몰리면 지어낸 영양표/스펙표 패턴 — 드롭. 히어로·클로징은 페이지 성립 요건이라 항상 경고만.
    if (violations.length === 1 || i === 0 || i === lastIdx) {
      console.warn(`[Blocks Composer] ⚠ 무근거 수치 경고 — ${b.variantId}: ${violations.join(', ')}`)
      return true
    }
    dropped.push(`${b.variantId}(${violations.join(',')})`)
    return false
  })
  if (dropped.length) console.warn(`[Blocks Composer] 무근거 수치 블록 드롭 — ${dropped.join(' · ')}`)
  if (spec.blocks.length < 6)
    throw new Error(`[composer] 무근거 수치 드롭 후 블록 ${spec.blocks.length}개(<6) — 페이지 구성 미달`)
}

/** 사진 주도형 블록(imageSlots>=2)인데 이미지가 하나도 없으면 — 거대한 빈 공간을 만들므로 블록 자체 제거(히어로/클로징 제외) */
function dropEmptyPhotoBlocks(spec: PageSpec): void {
  const hasHttp = (o: unknown): boolean => {
    if (typeof o === 'string') return /^https?:\/\//.test(o)
    if (Array.isArray(o)) return o.some(hasHttp)
    if (o && typeof o === 'object') return Object.values(o as Record<string, unknown>).some(hasHttp)
    return false
  }
  const beforeLen = spec.blocks.length
  spec.blocks = spec.blocks.filter((b, i) => {
    if (i === 0 || i === spec.blocks.length - 1) return true
    const v = getVariant(b.variantId)
    if (!v || v.imageSlots < 1) return true
    if (hasHttp(b.data)) return true
    // 무이미지 강등 렌더(noimg-safe)를 갖춘 변형은 슬롯 수와 무관하게 안전 — 드롭 대신 강등에 맡긴다
    if (v.styleTags?.includes('noimg-safe')) return true
    // 사진 주도형(imageSlots>=2)은 이미지 0장이면 거대한 빈 공간 — 드롭
    if (v.imageSlots >= 2) return false
    // 오버레이형(absolute 배치 CSS)은 이미지 0장이면 높이가 붕괴해 캡션이 이웃 섹션 위로
    // 떠오른다(feature-fullbleed 텍스트 겹침 실사례) — 강등 렌더가 없는 변형은 드롭
    if (/position:\s*absolute/.test(v.css ?? '')) return false
    return true
  })
  if (spec.blocks.length < beforeLen)
    console.warn(`[Blocks Composer] 이미지 없는 사진형/오버레이형 블록 ${beforeLen - spec.blocks.length}개 제거`)
}

/** ── 미사용 컷 재배치 패스 ──────────────────────────────────────────────
 *  게이트(QA·가드·블록 드롭·재작업)가 이미지 배치를 제거하면 이미 생성한 컷이 고아가 되고
 *  페이지 이미지 밀도가 깎인다(매일 16블록에 2장 실사례 — 생성 60컷 중 37만 사용).
 *  원칙: 만든 컷은 전부 사용 가능해야 한다. 최종 스펙에서 빈 media 슬롯에 미사용 컷을
 *  되돌린다 — ① 1순위: 컷의 원래 니즈(need_x.png)가 속한 청사진 블록 ② 2순위: 태거
 *  노트-아키타입 키워드 매칭. 재배치 후 배치 가드·페어링 QA가 재검증하므로 규칙 위반
 *  주입(누끼전용·클로징 원본·표계열)은 자동 회수된다. */
const ARCH_NOTE_KEYWORDS: Record<string, RegExp> = {
  ingredient: /원료|원물|성분|텍스처|질감|마크로|매크로/,
  usage: /사용|급여|스텝|단계|장면|손/,
  story: /라이프|무드|연출|배경|플랫레이|공간/,
  gallery: /라이프|무드|연출|디테일|클로즈업|질감/,
  detail: /제품|패키지|디테일|클로즈업|라벨/,
  feature: /제품|패키지|연출|장면/,
  point: /제품|패키지|연출|비교/,
  hero: /대표|히어로|패키지|정면/,
}

function redistributeUnusedImages(
  spec: PageSpec,
  candidates: Record<string, string>,
  blueprint?: import('./page-planner').PageBlueprint,
): { reassigned: number; unused: number; used: number } {
  const usedUrls = new Set<string>()
  for (const b of spec.blocks)
    walkStringFields((b.data ?? {}) as Record<string, unknown>, (_p, _k, v) => {
      if (/^https?:\/\//.test(v)) usedUrls.add(v)
    })
  // 재배치 풀 = 미사용 후보 전량(2026-07-20 룰 감사: 원본 전면 배제가 "스타일링컷 전량 사용"
  // (룰 7-16)의 구조적 미달 원인 — v7에서 원본 5장이 회수 경로 자체가 없었다).
  // 원본의 앵글·배경 미통제 리스크(매일 usage 풀블리드 기울어진 팩 실사례)는 배치 대상을
  // 제한해 통제한다: hero·closing 금지(가드와 동일), 배열 일괄 주입 금지(단일 슬롯만).
  const pool = Object.entries(candidates).filter(([url]) => !usedUrls.has(url))
  if (!pool.length) return { reassigned: 0, unused: 0, used: usedUrls.size }

  // 니즈 id(파일명) → 청사진 소속 variantId 매핑 — 1순위 복귀 근거
  const needHome = new Map<string, string>()
  for (const s of blueprint?.sections ?? [])
    for (const n of s.imageNeeds ?? []) needHome.set(n.id, s.variantId)

  const blockOf = new Map<string, (typeof spec.blocks)[number]>()
  for (const b of spec.blocks) blockOf.set(b.variantId, b)

  /** 블록의 주입 가능 슬롯 — 최상위 media 키 중 스키마에 존재하고 현재 비어 있는 것.
   *  누끼전용 키·표계열 아키타입은 가드가 도로 빼므로 애초에 제외(무의미 주입 방지). */
  const openSlots = (b: (typeof spec.blocks)[number]): string[] => {
    const v = getVariant(b.variantId)
    if (!v) return []
    const arch = String(v.archetype ?? '')
    if (TEXT_LED_ARCHETYPES.has(arch)) return []
    // 오버레이형(absolute 배치)은 주입 이미지가 배경 그래픽·텍스트를 가린다 — 재배치 금지
    // (매일 BCAA 수치 그래픽이 주입 컷에 가려진 실사례. 원 설계 배치만 허용)
    if (/position:\s*absolute/.test(String(v.css ?? ''))) return []
    const data = (b.data ?? {}) as Record<string, unknown>
    const contains = containSlotKeys(b.variantId)
    const shape = (v.schema as { shape?: Record<string, unknown> } | undefined)?.shape ?? {}
    return [...mediaSlotKeys(b.variantId)].filter(
      (k) => k in shape && !contains.has(k) && (data[k] === undefined || data[k] === null || data[k] === ''),
    )
  }

  let reassigned = 0
  const remaining = [...pool]
  const take = (idx: number): string => remaining.splice(idx, 1)[0][0]

  for (let i = 0; i < remaining.length; ) {
    const [url, note] = remaining[i]
    const needId = ((url.split('/').pop() ?? '').split('?')[0]).replace(/^regen_/, '').replace(/\.[a-z]+$/i, '')
    // 원본(intake)은 클로징 금지 가드와 동일 원칙 — 무드 배경 재배치 불가, 본문만
    const isOriginal = url.includes('/intake-files/') || url.includes('/cutouts/')
    let placed = false
    // 1순위: 원래 니즈의 소속 블록
    const home = needHome.get(needId)
    if (home) {
      const b = blockOf.get(home)
      const slot = b ? openSlots(b)[0] : undefined
      if (b && slot) {
        ;((b.data ??= {}) as Record<string, unknown>)[slot] = url
        reassigned++
        placed = true
      }
    }
    // 2순위: 태거 노트 ↔ 아키타입 키워드 매칭 (히어로 제외 — 대표컷은 계획 유지.
    // 클로징 무드 배경은 생성컷에 한해 허용 — 원본만 금지가 가드와 정합)
    if (!placed) {
      for (const b of spec.blocks.slice(1)) {
        const arch = String(getVariant(b.variantId)?.archetype ?? '')
        if (isOriginal && arch === 'closing') continue
        const kw = ARCH_NOTE_KEYWORDS[arch] ?? (arch === 'closing' ? /무드|연출|배경|라이프|공간/ : undefined)
        if (!kw || !kw.test(note)) continue
        const slot = openSlots(b)[0]
        if (slot) {
          ;((b.data ??= {}) as Record<string, unknown>)[slot] = url
          reassigned++
          placed = true
          break
        }
      }
    }
    if (placed) remaining.splice(i, 1)
    else i++
  }

  // 3순위: 배열 아이템 슬롯 일괄 주입 — usage 스텝·리스트류의 item.image는 균일화 가드
  // (전부 있거나 전부 없거나) 대상이라, 모든 아이템을 채울 수 있을 때만 통째로 넣는다
  // (스텝 균일화가 걷어낸 2컷이 통째 고아가 된 매일 실사례의 복구 경로).
  for (const b of spec.blocks.slice(1, -1)) {
    if (remaining.length === 0) break
    const v = getVariant(b.variantId)
    if (!v) continue
    const arch = String(v.archetype ?? '')
    if (TEXT_LED_ARCHETYPES.has(arch)) continue
    const shape = (v.schema as { shape?: Record<string, unknown> } | undefined)?.shape ?? {}
    // media 키인데 최상위 shape에 없는 키 = 배열 아이템 이미지 필드라는 결정적 신호
    const itemKeys = [...mediaSlotKeys(b.variantId)].filter((k) => !(k in shape) && !containSlotKeys(b.variantId).has(k))
    if (!itemKeys.length) continue
    const data = (b.data ?? {}) as Record<string, unknown>
    for (const val of Object.values(data)) {
      if (!Array.isArray(val) || val.length < 2 || remaining.length < val.length) continue
      const items = val.filter((it): it is Record<string, unknown> => Boolean(it) && typeof it === 'object')
      if (items.length !== val.length) continue
      const key = itemKeys[0]
      if (items.some((it) => typeof it[key] === 'string' && /^https?:\/\//.test(String(it[key])))) continue
      // 노트가 이 아키타입과 어울리는 컷 우선으로 아이템 수만큼 소진
      const kw = ARCH_NOTE_KEYWORDS[arch]
      // 배열 일괄 주입은 생성컷만 — 원본이 섞이면 스텝 레일에서 앵글이 튄다
      const ranked = remaining
        .map(([u, n], idx) => ({ idx, score: kw?.test(n) ? 1 : 0, u }))
        .filter((r) => !r.u.includes('/intake-files/') && !r.u.includes('/cutouts/'))
        .sort((a, b2) => b2.score - a.score)
        .slice(0, items.length)
      if (ranked.length < items.length) continue
      ranked.sort((a, b2) => b2.idx - a.idx) // splice 안정성 — 뒤 인덱스부터 제거
      const urls = ranked.map((r) => take(r.idx)).reverse()
      items.forEach((it, j) => {
        it[key] = urls[j]
      })
      reassigned += items.length
      break
    }
  }

  // 4순위: 아키타입 무관 순차 폴백 — 키워드 매칭에 실패한 컷이 통째로 사장되는 것을 막는다
  // (룰 감사 v7: 노트-아키타입 키워드가 좁아 미회수 11장 중 1장만 복구). 위 가드가 이미
  // 걸러낸 openSlots(표계열·오버레이·누끼전용·기점유 제외)만 대상이라 안전하고,
  // hero(대표컷 계획 유지)·closing(무드 배경)은 slice로 제외한다.
  for (const b of spec.blocks.slice(1, -1)) {
    if (remaining.length === 0) break
    const arch = String(getVariant(b.variantId)?.archetype ?? '')
    if (arch === 'closing' || arch === 'hero') continue
    // 순차 폴백은 생성컷만 — 원본 실사(intake/cutouts)는 배치 금지.
    // openSlots는 최상위(대형) 슬롯이라 원본이 대표 이미지로 크게 걸린다(기울어진 팩 실사례).
    // 원본의 정당 경로는 planner의 useOriginal 니즈(1순위 needHome, 행별 소형)뿐.
    for (const slot of openSlots(b)) {
      if (remaining.length === 0) break
      const idx = remaining.findIndex(([u]) => !u.includes('/intake-files/') && !u.includes('/cutouts/'))
      if (idx < 0) break // 남은 게 원본뿐 → 순차 배치 종료
      ;((b.data ??= {}) as Record<string, unknown>)[slot] = take(idx)
      reassigned++
    }
  }

  return { reassigned, unused: remaining.length, used: usedUrls.size }
}

/** 가격 없는 할인 블록 드롭 — 무근거 가격 차단이 값을 지우면 "정상가/타임딜가" 라벨만 남아
 *  빈 프레임이 노출된다(루미트론 실사례). 할인 소구는 가격 표기가 성립 요건 — 원화·퍼센트
 *  표현이 하나도 없으면 블록 자체를 제거한다(히어로/클로징은 discount 아키타입이 아니므로 무관). */
const PRICE_TOKEN_RE = /\d[\d,.]*\s*(?:원|₩)|₩\s*\d|\d+\s*%/
function dropPricelessDiscountBlocks(spec: PageSpec): void {
  const beforeLen = spec.blocks.length
  spec.blocks = spec.blocks.filter((b) => {
    if (getVariant(b.variantId)?.archetype !== 'discount') return true
    return PRICE_TOKEN_RE.test(JSON.stringify(b.data ?? {}))
  })
  if (spec.blocks.length < beforeLen)
    console.warn(`[Blocks Composer] 가격 표기 없는 할인 블록 ${beforeLen - spec.blocks.length}개 제거`)
}

/** ── 결정적 카피 린터 (Sprint 7) ──────────────────────────────────────────
 *  품질 다각도 리뷰(4산출×13관점)에서 반복 확인된 카피 결함 3종을 기계 검출한다:
 *  ① 동일 수치 클레임 3회+ 반복(스크롤 정보 밀도 붕괴) ② AI 상투어 ③ 스펙 나열형 히어로 헤드라인.
 *  하드 차단이 아니라 페이지 평가자에게 힌트로 전달 — 오탐이 품질을 깎지 않게 판단은 평가자가. */
const BANNED_COPY_RE = /특별한 (?:경험|이유|선택)|완벽한|최고의|혁신적인|압도적인|자연의 선택|깊고 진한/g
// 경성 단위(측정치) — 3회째부터 힌트. 배/만/억 같은 배수·통화 표현은 일상 문구("3배 더", "1만원")
// 오탐이 잦아(리뷰 지적) 별도 임계(5회째부터)로 분리한다.
const NUMERIC_CLAIM_RE = /\d[\d,.]*\s?(?:mg|ml|g|kcal|%|℃|°c)(?![a-z가-힣])/gi
const MULTIPLIER_CLAIM_RE = /\d[\d,.~]*\s?(?:배|만|억)(?![a-z가-힣])/g

/** 이미지 결손 감사 (Sprint 9-D) — 변형 슬롯 수 대비 배정 수 부족을 결정적으로 계측.
 *  부분 결손은 빈 블록 드롭(0장 기준)과 시각 감사(파손 기준) 둘 다의 사각이었다(럽앤 실사례). */
export function lintImageDeficit(spec: PageSpec): string[] {
  const hints: string[] = []
  spec.blocks.forEach((b, i) => {
    const v = getVariant(b.variantId)
    if (!v || v.imageSlots < 2) return
    let assigned = 0
    walkStringFields((b.data ?? {}) as Record<string, unknown>, (_p, _k, val) => {
      if (/^https?:\/\//.test(val)) assigned++
    })
    if (assigned > 0 && assigned < v.imageSlots)
      hints.push(`블록 ${i}(${b.variantId}): 이미지 슬롯 ${v.imageSlots}개 중 ${assigned}개만 채워짐 — 빈 프레임 노출 가능`)
  })
  return hints
}

export function lintCopyQuality(spec: PageSpec): string[] {
  const claims = new Map<string, number>()
  const multipliers = new Map<string, number>()
  const banned = new Map<string, number>()
  for (const b of spec.blocks) {
    walkStringFields((b.data ?? {}) as Record<string, unknown>, (_p, _k, v) => {
      if (/^https?:\/\//.test(v)) return
      const plain = v.replace(/<[^>]+>/g, '')
      for (const m of plain.matchAll(NUMERIC_CLAIM_RE)) {
        const key = m[0].replace(/\s+/g, '').toLowerCase()
        claims.set(key, (claims.get(key) ?? 0) + 1)
      }
      for (const m of plain.matchAll(MULTIPLIER_CLAIM_RE)) {
        const key = m[0].replace(/\s+/g, '')
        multipliers.set(key, (multipliers.get(key) ?? 0) + 1)
      }
      for (const m of plain.matchAll(BANNED_COPY_RE)) banned.set(m[0], (banned.get(m[0]) ?? 0) + 1)
    })
  }
  const hints: string[] = []
  const repeated = [
    ...[...claims.entries()].filter(([, n]) => n > 2),
    ...[...multipliers.entries()].filter(([, n]) => n > 4),
  ]
  if (repeated.length)
    hints.push(
      `동일 수치 클레임 3회 이상 반복: ${repeated.map(([k, n]) => `"${k}"×${n}`).join(', ')} — 반복분은 비교 기준·권장량 환산·사용 시나리오 등 새 정보로 대체돼야 함`,
    )
  if (banned.size)
    hints.push(`상투어 감지: ${[...banned.entries()].map(([k, n]) => `"${k}"×${n}`).join(', ')} — 물리적 구체어로 대체돼야 함`)
  const hero = (spec.blocks[0]?.data ?? {}) as Record<string, unknown>
  const heroTitle = String(hero.title ?? hero.headline ?? hero.productName ?? '').replace(/<[^>]+>/g, '')
  const unitCount = (heroTitle.match(NUMERIC_CLAIM_RE) ?? []).length
  if (unitCount >= 2)
    hints.push(`히어로 헤드라인이 스펙 나열형(수치 ${unitCount}개): "${heroTitle.slice(0, 60)}" — 소비자 변화·감각 중심 한 문장으로, 수치는 서브카피/포인트로 이동돼야 함`)
  return hints
}

/** ── 조립 후 페어링 QA ─────────────────────────────────────────────────────
 *  컴포저는 텍스트 노트만 보고 배치하므로 "카피 ↔ 이미지 어울림"의 최종 판단이 확률적이다
 *  (효능 카피 옆 패키지 라벨 확대 실사례). 조립이 끝난 spec의 (섹션 카피, 이미지) 쌍을
 *  비전 모델이 실제로 보고, 부적합 쌍의 이미지만 제거한다. 실패 시 spec 그대로(무중단). */
async function applyPairingQA(spec: PageSpec): Promise<number> {
  const pairs: Array<{ id: string; url: string; sectionCopy: string }> = []
  spec.blocks.forEach((b, i) => {
    // 히어로도 검사 대상 (Sprint 12) — 무관 원본이 대표컷이 됐는데 스킵 때문에 그물에 안 걸린
    // 실사례(동원). 히어로 카피(헤드라인·제품명)와 이미지의 적합성은 오히려 가장 중요하다.
    const data = (b.data ?? {}) as Record<string, unknown>
    const urls = new Set<string>()
    const copyParts: string[] = []
    walkStringFields(data, (_p, _k, v) => {
      if (/^https?:\/\//.test(v)) urls.add(v)
      else if (v.length > 3) copyParts.push(v)
    })
    if (!urls.size) return
    const copy = copyParts.join(' · ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140)
    for (const u of urls) pairs.push({ id: `${i}|${u}`, url: u, sectionCopy: copy || b.variantId })
  })
  if (!pairs.length) return 0

  const { runPairingQA } = await import('./image-tagger')
  const qa = await runPairingQA({ pairs })
  if (!qa.success || !qa.data) return 0

  let removed = 0
  const reasons: string[] = []
  for (const [id, verdict] of Object.entries(qa.data)) {
    if (verdict.fit) continue
    const sep = id.indexOf('|')
    const idx = Number(id.slice(0, sep))
    const url = id.slice(sep + 1)
    const b = spec.blocks[idx]
    if (!b) continue
    walkStringFields((b.data ?? {}) as Record<string, unknown>, (parent, key, value) => {
      if (value === url) {
        delete parent[key]
        removed++
      }
    })
    reasons.push(`${b.variantId}(${verdict.reason ?? '부적합'})`)
  }
  if (removed) {
    console.warn(`[Blocks Composer] 페어링 QA — 부적합 이미지 ${removed}건 제거: ${reasons.join(' · ')}`)
    // QA의 개별 제거가 다행 리스트를 부분 채움(2/4 등)으로 무너뜨린 채 최종 렌더까지 가던
    // 실사례(성분 리스트) — 제거 발생 시 균일화를 재적용해 "전부 있거나 전부 없거나"를 복원.
    let uni = 0
    for (const b of spec.blocks) uni += uniformizeBlockItemImages(b)
    if (uni) console.warn(`[Blocks Composer] 페어링 QA 후 균일화 — 부분 채움 ${uni}건 정리`)
  }
  reportAdd('pairing-qa', { removed, reasons: reasons.slice(0, 6) })
  return removed
}

async function callOnce(input: BlocksComposerInput, repairNote?: string): Promise<BlocksComposerResult> {
  // max_tokens 24576은 SDK 논스트리밍 10분 제한을 초과 추정 → 스트리밍 필수 (SDK가 create를 거부)
  // 청사진 경로(Sprint 2): 변형 선택이 끝났으므로 카탈로그 불필요 — 선택 변형의 계약만 전달(343→N).
  // 프롬프트가 ~100k→~10k 토큰으로 줄어 비용·주의분산 모두 감소. 무청사진 경로는 기존 캐시 블록 유지.
  const system: Array<Record<string, unknown>> = input.blueprint
    ? [
        { type: 'text', text: SYSTEM_PROMPT },
        {
          type: 'text',
          text: `각 블록 데이터 계약(청사진 변형만):\n${input.blueprint.sections
            .map((s) => CONTRACT_LINE_BY_ID.get(s.variantId))
            .filter(Boolean)
            .join('\n')}`,
        },
      ]
    : [
        { type: 'text', text: SYSTEM_PROMPT },
        // 정적 카탈로그+계약 — 캐시 히트 시 이 구간 입력 단가 90% 절감 (5분 TTL: 재시도·체인 실행에서 히트)
        { type: 'text', text: getStaticCatalogBlock(), cache_control: { type: 'ephemeral' } },
      ]
  const message = await anthropicClient.messages
    .stream({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 40000, // S5는 페이지 JSON에 28~32k+ 출력(32000 캡 도달 실사례) — 여유 확보
      system: system as never,
      messages: [{ role: 'user', content: buildUserPrompt(input, repairNote) }],
    })
    .finalMessage()
  const usage = message.usage as unknown as {
    input_tokens?: number
    cache_creation_input_tokens?: number
    cache_read_input_tokens?: number
    output_tokens?: number
    output_tokens_details?: { thinking_tokens?: number }
  }
  console.log(
    `[Blocks Composer] usage — in:${usage.input_tokens} cacheW:${usage.cache_creation_input_tokens ?? 0} cacheR:${usage.cache_read_input_tokens ?? 0} out:${usage.output_tokens} think:${usage.output_tokens_details?.thinking_tokens ?? 0} stop:${message.stop_reason}`,
  )
  const text = extractText(message.content)
  const raw = parseJsonResponse<unknown>(text)
  const out = composerOutputSchema.parse(raw)
  const spec = assemblePageSpec(out, input.brandColors, input.preferredPreset, input.styleGuide)

  // 청사진 이탈 결정적 검증 — 조립 변형은 청사진의 부분집합이어야 하고 2개 초과 누락 금지 (실패 시 재시도 피드백)
  if (input.blueprint) {
    const planned = input.blueprint.sections.map((s) => s.variantId)
    const plannedSet = new Set(planned)
    const composed = spec.blocks.map((b) => b.variantId)
    const alien = composed.filter((v) => !plannedSet.has(v))
    if (alien.length > 0 || composed.length < planned.length - 2) {
      throw new Error(
        `[composer] 청사진 이탈 — 계획 외 변형: ${alien.join(',') || '없음'} / 조립 ${composed.length}블록 vs 계획 ${planned.length}블록. PAGE BLUEPRINT를 그대로 따르라.`,
      )
    }
  }
  const allowedUrls = new Set(
    [input.images?.hero, input.images?.cutout, ...(input.images?.lifestyle ?? []), ...(input.images?.section ?? [])].filter(
      (u): u is string => Boolean(u),
    ),
  )
  const sanStats = sanitizeSpecImages(spec, allowedUrls)
  if (sanStats.removedFabricated || sanStats.removedOverBudget)
    console.warn(`[Blocks Composer] 이미지 새니타이즈 — 지어낸URL ${sanStats.removedFabricated}건, 예산초과 ${sanStats.removedOverBudget}건 제거`)

  // 근거 코퍼스 = 브리프 + 이미지노트 + 승인 스크립트 전문 + 청사진 요지 — 스크립트가 홈페이지에서
  // 가져온 실데이터(고객센터 번호 등)를 가드가 오제거하지 않도록 (평가자 반려↔가드 제거 루프 실사례)
  const groundingCorpus =
    JSON.stringify(input.brief) +
    JSON.stringify(input.imageNotes ?? {}) +
    (input.script ? JSON.stringify(input.script) : '') +
    (input.blueprint ? JSON.stringify(input.blueprint.sections.map((s) => s.copyBrief)) : '')

  // 배치 결함 가드 — 표계열 이미지·이모지·누끼 오배치를 코드로 봉쇄 (깨진 스키마는 수리 패스가 수습)
  applyPlacementGuards(
    spec,
    new Set(input.cutoutUrls ?? (input.images?.cutout ? [input.images.cutout] : [])),
    new Set(input.logoUrls ?? []),
  )

  // 제품 스펙 수치(중량·개입) 린터 — sourceText에 없는 조합은 결정적 치환(단일 원본) 또는 위반 경고
  fixSpecQuantities(spec, groundingCorpus)

  // 무근거 전화번호가 든 필드 제거 — 깨진 스키마는 아래 수리 패스가 해당 항목만 들어낸다
  sanitizeUngroundedPhones(spec, groundingCorpus)

  // 사소한 스키마 위반은 기계적으로 수리, 수리 불가 블록은 드롭 — 블록 1개 불량이 전체 실패로 번지지 않게
  repairAndSalvageBlocks(spec)

  // 근거 없는 단위 수치(g/kcal/% 등) 봉쇄 — 브리프·이미지노트에 없는 수치를 실은 블록은 드롭
  dropUngroundedNumericBlocks(spec, groundingCorpus)

  // 빈 사진 블록 드롭은 반드시 이미지를 제거하는 가드들(새니타이즈·배치 가드·수리) 이후에 —
  // 배치 가드(스텝 균일화)가 걷어낸 뒤 빈 원형 플레이스홀더가 그대로 렌더된 실사례(황태 uzz, 시각 감사 검출)
  dropEmptyPhotoBlocks(spec)
  dropPricelessDiscountBlocks(spec)

  const rendered = renderPage(spec) // 변형 id/슬롯 데이터 검증 (실패 시 throw)
  return { spec, html: rendered.html, usedVariants: rendered.usedVariants }
}

export async function runBlocksComposer(input: BlocksComposerInput): Promise<AgentResult<BlocksComposerResult>> {
  const elapsed = timer()
  console.log('[Blocks Composer] 시작')
  // S1 가드: 저장 청사진에 offPalette 변형 잔류(기획 후 gen-variant-meta 재실행 타이밍 회귀) 제거.
  // 기획-생성 경계에서 청사진을 정규화해 LLM 계약 전달·이탈 검증·sceneId 매핑 세 경로 모두 보호.
  if (input.blueprint?.sections?.length) {
    const before = input.blueprint.sections.length
    input.blueprint.sections = input.blueprint.sections.filter((s) => !isOffPalette(s.variantId))
    if (input.blueprint.sections.length < before)
      console.warn(`[Blocks Composer] 청사진 offPalette 변형 제거 — ${before - input.blueprint.sections.length}개`)
  }
  try {
    let result: BlocksComposerResult
    try {
      result = await callOnce(input, input.auditNote ? `⚠ 직전 렌더 시각 감사 결함 — 반드시 해소하라:\n${input.auditNote}` : undefined)
    } catch (firstErr: unknown) {
      const issues = firstErr instanceof Error ? firstErr.message.slice(0, 900) : String(firstErr)
      console.warn('[Blocks Composer] 1차 검증 실패 → 재시도 1/2:', issues.slice(0, 160))
      try {
        result = await callOnce(input, issues)
      } catch (secondErr: unknown) {
        const issues2 = secondErr instanceof Error ? secondErr.message.slice(0, 900) : String(secondErr)
        console.warn('[Blocks Composer] 2차 검증 실패 → 재시도 2/2:', issues2.slice(0, 160))
        result = await callOnce(input, issues2)
      }
    }
    // 조립 후 페어링 QA — 부적합 (카피,이미지) 쌍의 이미지 제거 후 재렌더 (QA 실패 시 원안 유지)
    try {
      const removed = await applyPairingQA(result.spec)
      if (removed > 0) {
        dropEmptyPhotoBlocks(result.spec)
        dropPricelessDiscountBlocks(result.spec)
        repairAndSalvageBlocks(result.spec)
        const re = renderPage(result.spec)
        result = { spec: result.spec, html: re.html, usedVariants: re.usedVariants }
      }
    } catch (e) {
      console.warn('[Blocks Composer] 페어링 QA 스킵:', (e as Error).message?.slice(0, 120))
    }

    // 페이지 평가자 (Sprint 3) — 생성자-평가자 분리. 명백한 결함만 반려, 재작업 1회 한도.
    // 재작업 실패 시 원안 유지(무중단) — 평가는 품질 게이트지 가용성 게이트가 아니다.
    try {
      const { runPageEvaluator } = await import('./page-evaluator')
      const lintHints = [...lintCopyQuality(result.spec), ...lintImageDeficit(result.spec)]
      if (lintHints.length) console.warn(`[Blocks Composer] 카피 린터 감지 ${lintHints.length}건 — 평가자 전달:\n  - ${lintHints.join('\n  - ')}`)
      const verdict = await runPageEvaluator({ brief: input.brief, blueprint: input.blueprint, spec: result.spec, lintHints })
      if (verdict.success && verdict.data) reportAdd('evaluator', { pass: verdict.data.pass, issues: (verdict.data.issues ?? []).slice(0, 6) })
      if (verdict.success && verdict.data && !verdict.data.pass && verdict.data.issues.length) {
        const note = `페이지 평가자 반려 — 아래 결함을 모두 고쳐 유효한 전체 JSON을 다시 출력:\n${verdict.data.issues.join('\n')}`
        try {
          let rework = await callOnce(input, note)
          const removed2 = await applyPairingQA(rework.spec).catch(() => 0)
          if (removed2 > 0) {
            dropEmptyPhotoBlocks(rework.spec)
        dropPricelessDiscountBlocks(rework.spec)
            repairAndSalvageBlocks(rework.spec)
            const re2 = renderPage(rework.spec)
            rework = { spec: rework.spec, html: re2.html, usedVariants: re2.usedVariants }
          }
          result = rework
          console.log('[Blocks Composer] 평가자 반려 재작업 반영')
          // 재작업 반영 후 평가자 1회 재실행 — 무한루프 금지(재반려 시 추가 재작업 없이 이슈만 리포트)
          try {
            const lintHints2 = [...lintCopyQuality(result.spec), ...lintImageDeficit(result.spec)]
            const verdict2 = await runPageEvaluator({ brief: input.brief, blueprint: input.blueprint, spec: result.spec, lintHints: lintHints2 })
            if (verdict2.success && verdict2.data) {
              reportAdd('evaluator', { pass: verdict2.data.pass, issues: (verdict2.data.issues ?? []).slice(0, 6), rerun: true })
              if (!verdict2.data.pass && verdict2.data.issues.length) {
                console.warn(`[Blocks Composer] ⚠ 재평가 반려 — 재작업 미반영 이슈: ${verdict2.data.issues.slice(0, 3).join(' | ')}`)
              }
            }
          } catch (rerunErr: unknown) {
            console.warn('[Blocks Composer] 재평가 스킵:', (rerunErr as Error).message?.slice(0, 120))
          }
        } catch (reworkErr: unknown) {
          console.warn('[Blocks Composer] 반려 재작업 실패 — 원안 유지:', (reworkErr as Error).message?.slice(0, 120))
        }
      }
    } catch (e) {
      console.warn('[Blocks Composer] 평가자 스킵:', (e as Error).message?.slice(0, 120))
    }

    // 미사용 컷 재배치 — 게이트가 뺀 자리를 남은 컷으로 채운다 (만든 컷은 전부 사용 원칙).
    // 재배치분은 배치 가드→페어링 QA 재검증을 거치므로 규칙 위반 주입은 자동 회수된다.
    try {
      const dist = redistributeUnusedImages(result.spec, input.imageNotes ?? {}, input.blueprint)
      if (dist.reassigned > 0) {
        applyPlacementGuards(
          result.spec,
          new Set(input.cutoutUrls ?? (input.images?.cutout ? [input.images.cutout] : [])),
          new Set(input.logoUrls ?? []),
        )
        await applyPairingQA(result.spec).catch(() => 0)
        dropEmptyPhotoBlocks(result.spec)
        // 재배치 체인에도 가격 가드 — callOnce 체인에만 있어 재배치 후 가격 없는 할인 블록이 살아났다(D-C7)
        dropPricelessDiscountBlocks(result.spec)
        repairAndSalvageBlocks(result.spec)
        const re3 = renderPage(result.spec)
        result = { spec: result.spec, html: re3.html, usedVariants: re3.usedVariants }
      }
      // 이미지 활용 계측 — 낭비를 상시 관측한다 (사후 실측이 아니라 매 런 로그)
      const finalUrls = new Set<string>()
      for (const b of result.spec.blocks)
        walkStringFields((b.data ?? {}) as Record<string, unknown>, (_p, _k, v) => {
          if (/^https?:\/\//.test(v)) finalUrls.add(v)
        })
      const candidateCount = Object.keys(input.imageNotes ?? {}).length
      const finalUsed = [...finalUrls].filter((u) => (input.imageNotes ?? {})[u] !== undefined).length
      console.log(
        `[Blocks Composer] 이미지 활용 — 후보 ${candidateCount} · 최종 사용 ${finalUsed} · 재배치 ${dist.reassigned} · 미회수 ${candidateCount - finalUsed}`,
      )
      // 최소 밀도 룰 — 후보가 있는데 페이지가 빈약하면 명시적 경고 (16블록 2장 실사례)
      const minImages = Math.min(6, candidateCount)
      if (finalUsed < minImages)
        console.warn(`[Blocks Composer] ⚠ 이미지 밀도 미달 — 최종 ${finalUsed}장 < 최소 ${minImages}장 (후보 ${candidateCount})`)
      reportAdd('image-usage', { candidates: candidateCount, used: finalUsed, reassigned: dist.reassigned, belowMinimum: finalUsed < minImages })
    } catch (e) {
      console.warn('[Blocks Composer] 재배치 패스 스킵:', (e as Error).message?.slice(0, 120))
    }

    // sceneId 결정적 매핑 — 청사진 경로에서만 부여(LLM에 맡기지 않음).
    // 가드·재배치가 모두 완료된 후 최종 spec에 적용해 렌더가 씬 래퍼를 정확히 감싼다.
    if (input.blueprint) {
      const bp = input.blueprint
      let bpIdx = 0
      let lastSceneId = 1
      for (const block of result.spec.blocks) {
        let found = false
        for (let si = bpIdx; si < bp.sections.length; si++) {
          if (bp.sections[si].variantId === block.variantId) {
            block.sceneId = bp.sections[si].scene ?? lastSceneId
            lastSceneId = block.sceneId
            bpIdx = si + 1
            found = true
            break
          }
        }
        if (!found) block.sceneId = lastSceneId
      }
      // S3 씬 번호 재정규화: 가드가 블록을 드롭하면 씬 번호가 비연속(예: 1,2,3,5)이 된다.
      // 최종 spec 블록의 등장 순서를 기준으로 1..N 연속 재라벨(상대 순서 보존).
      const seenScenes = [...new Set(result.spec.blocks.map((b) => b.sceneId ?? 1))].sort((a, b) => a - b)
      const sceneRemap = new Map(seenScenes.map((id, i) => [id, i + 1] as const))
      for (const block of result.spec.blocks) block.sceneId = sceneRemap.get(block.sceneId ?? 1) ?? 1
      const reScene = renderPage(result.spec)
      result = { spec: result.spec, html: reScene.html, usedVariants: reScene.usedVariants }
    }

    // ── S2 씬 높이 리밸런싱 — 실측 → 경계 재분할 → 재렌더 ──
    // 플래너의 사전 높이 추정은 폰트 확대·장식 밀도가 렌더 시점에 결정되므로 구조적으로 빗나간다.
    // 렌더 후 실측값으로 씬 경계만 옮긴다(블록 순서·개수·씬 개수 불변 → 서사 훼손 없음).
    // 경계가 바뀌면 장식(indexInScene·isLastScene)이 달라져 높이가 미세하게 변하므로 최대 2패스.
    try {
      const sceneIdsPresent = result.spec.blocks
        .map((b) => b.sceneId)
        .filter((s): s is number => s !== undefined)
      if (sceneIdsPresent.length === result.spec.blocks.length && sceneIdsPresent.length > 0) {
        const sceneCount = new Set(sceneIdsPresent).size
        const { measureSectionLayout } = await import('@/lib/render-audit')
        const { balanceScenes, estimateSceneOverhead } = await import('./templates/blocks/scene-balance')
        for (let pass = 1; pass <= 2; pass++) {
          const layout = await measureSectionLayout(result.html)
          if (!layout) {
            console.warn('[Blocks Composer] 씬 리밸런싱 스킵 — chromium 없음(환경 미지원)')
            break
          }
          const before = layout.sceneHeights
          const bad = before.filter((h) => h < 1600 || h > 2700).length
          if (bad === 0) {
            if (pass === 1) console.log(`[Blocks Composer] 씬 높이 적합 — [${before.join(', ')}]`)
            break
          }
          // 섹션 1개 = 블록 1개 전제가 깨지면(변형이 section을 0개/2개 렌더) 인덱스 대응이 어긋난다
          if (layout.sectionHeights.length !== result.spec.blocks.length) {
            console.warn(
              `[Blocks Composer] 씬 리밸런싱 스킵 — 섹션 ${layout.sectionHeights.length} ≠ 블록 ${result.spec.blocks.length}`,
            )
            break
          }
          const overhead = estimateSceneOverhead(
            layout.sceneHeights,
            layout.sectionHeights,
            layout.sceneOfSection,
          )
          const bal = balanceScenes(layout.sectionHeights, { sceneCount, overhead })
          if (!bal) {
            console.warn(`[Blocks Composer] 씬 리밸런싱 해 없음 — 블록 ${result.spec.blocks.length}/씬 ${sceneCount}`)
            break
          }
          const moved = result.spec.blocks.filter((b, i) => b.sceneId !== bal.sceneIds[i]).length
          if (moved === 0) {
            console.warn(
              `[Blocks Composer] ⚠ 씬 높이 이탈 ${bad}개 — 현재 분할이 이미 최적(블록 단위로는 해소 불가): [${before.join(', ')}]`,
            )
            break
          }
          // 악화 방지 — 리밸런싱은 개선이 확실할 때만 적용한다.
          // 블록 하나가 목표 상한보다 큰 페이지에서는 어떤 분할도 해가 없어, 최적화가
          // 엉뚱한 방향으로 수렴할 수 있다(씬1 4,081 → 7,971px 실측 2026-07-21).
          // 척도는 DP가 최소화하는 것과 같아야 한다 — 이탈 "개수"로 재면 판단이 뒤집힌다.
          // 실측: [.., 3856, ..](이탈 1) vs [2808, 2540, 2870, ..](이탈 3)에서 개수 기준은
          // 전자를 택하지만, 한 씬이 3,856px인 편이 세 씬이 조금씩 넘는 것보다 나쁘다.
          // 목표 구간[1600,2400] 기준 — sceneCost(DP 최소화)와 동일 척도로 채택 판정
          const badness = (hs: readonly number[]): number =>
            hs.reduce((s, h) => s + (h > 2400 ? (h - 2400) ** 2 : h < 1600 ? (1600 - h) ** 2 : 0), 0)
          if (badness(bal.predicted) >= badness(before)) {
            console.warn(
              `[Blocks Composer] ⚠ 씬 리밸런싱 미적용(개선 없음) — [${before.join(', ')}] → 예상 [${bal.predicted.join(', ')}]. ` +
                `블록 하나가 상한을 넘는 등 분할로 해소 불가한 구성이다.`,
            )
            reportAdd('scene-rebalance-skipped', { before, predicted: bal.predicted, reason: 'no-improvement' })
            break
          }
          result.spec.blocks.forEach((b, i) => {
            b.sceneId = bal.sceneIds[i]
          })
          const reBal = renderPage(result.spec)
          result = { spec: result.spec, html: reBal.html, usedVariants: reBal.usedVariants }
          console.log(
            `[Blocks Composer] 씬 리밸런싱 ${pass}패스 — 이탈 ${bad}개 · 블록 ${moved}개 이동 · [${before.join(', ')}] → 예상 [${bal.predicted.join(', ')}]`,
          )
          reportAdd('scene-rebalance', { pass, before, moved, predicted: bal.predicted, overhead })
        }
      }
    } catch (e) {
      console.warn('[Blocks Composer] 씬 리밸런싱 스킵:', (e as Error).message?.slice(0, 120))
    }

    saveJson(result.spec, `${input.outputDir}/page-spec.json`)
    const ms = elapsed()
    console.log(`[Blocks Composer] 완료 (${ms}ms) — ${result.usedVariants.length} blocks`)
    return { success: true, data: result, durationMs: ms }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const ms = elapsed()
    console.error('[Blocks Composer] 실패:', msg.slice(0, 200))
    return { success: false, error: msg, durationMs: ms }
  }
}
