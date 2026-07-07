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
import { getVariant } from './templates/blocks/registry'

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
- Map provided image URLs into (url) slots, distributing them so each image-bearing block gets a DIFFERENT image (lifestyle/scene shots → hero/story/sensory/usage; detail·macro → ingredient/feature; mood → closing/fullbleed). **HARD CAP: use the SAME image URL in at most 2 blocks.** When images run out, choose image-light/text-first variants instead of repeating a third time — repeated identical photos read as low-effort.
- IMAGE-SECTION SEMANTICS (CRITICAL): match each image's 컷 내용 note to the section's meaning. Lifestyle/연출 shots belong in hero, feature/point, story, usage, closing — NEVER inside spec tables, 성분/영양 정보, FAQ, shipping/CS blocks (those are text-led; leave their image fields empty instead). Texture/누끼 close-ups fit ingredient/detail sections. When in doubt, prioritize giving images to feature/point sections over tables. If a block truly has no fitting image, omit the field.
- FORBIDDEN WORDS: 완벽한, 최고의, 혁신적인, 압도적인 — replace with concrete facts.
- HONESTY (CRITICAL): never fabricate certifications, reviews, ratings, or numbers not present in the brief. Omit cert/spec rows you cannot ground.
- IDENTITY DATA (CRITICAL): phone numbers, business/item registration numbers, addresses, courier/partner brand names, account numbers — use ONLY strings that appear verbatim in the brief. If the brief has none, OMIT the row/line entirely (e.g., write "고객센터로 문의해 주세요" without a number). A fabricated phone number sends real customers to a stranger.
- IMAGE REALITY (CRITICAL): each image's 컷 내용 note starting with "실물 확인" describes what is ACTUALLY in the image — trust it over the filename or your assumption. A note marked "차선 — 소형 슬롯에만" may only fill small thumbnail slots, never hero/full-bleed.
- ORIENTATION-FIT: notes mark each image [세로]/[가로]/[정방]. NEVER place a [세로] image into a wide panorama/full-width banner slot — it becomes a grotesque over-zoomed crop. Wide full-bleed slots take [가로] images only.
- IMAGE-ASSET GROUNDING: blocks whose visual story requires specific subjects (raw ingredients for 원료 공식/원료 비주얼, real usage scene for usage photos) may only be selected if a note confirms such an image EXISTS. Never caption an image with content it does not show (e.g., a package close-up captioned as "베르가못 오일"). If no fitting image exists, choose a text/graphic variant instead.
- CUTOUT USE: 누끼(제품 단독컷) images fit product-focused slots (hero, detail, feature, ingredient). Do NOT use them as story/gallery/mood backgrounds or full-bleed scenery.
- NO EMOJI anywhere in output text — this is a professional detail page; use block-provided icons only.
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
        ? `\n\nIMAGE BUDGET (엄수): 서로 다른 이미지가 ${distinctImgs}장뿐이다. 같은 이미지 URL은 **최대 2개 블록**에만 사용. 이미지 슬롯을 채우는 블록 수를 ${Math.min(distinctImgs * 2, 8)}개 이하로 유지하고, 나머지 자리는 이미지 없이도 완성돼 보이는 텍스트/그래픽/수치 변형을 선택하라. 점선 placeholder 박스가 보이면 실패다 — image? 필드를 비울 바에는 이미지 없는 변형을 고를 것.`
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
      }
    } else if (issue.code === 'too_small' && issue.origin === 'string' && parent) {
      // 빈/짧은 문자열은 지어낼 수 없다 — 필드 제거(옵션 필드면 통과), 필수면 다음 라운드 invalid_type에서 아이템 제거
      delete parent[key as never]
      fixed = true
    } else if (issue.code === 'invalid_type' && path.length > 0) {
      const { parent: p2, key: k2 } = resolveParent(data, path)
      const cur = p2?.[k2 as never]
      if (cur === undefined && dropNearestArrayItem(data, path)) fixed = true
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
      for (const item of v) if (item && typeof item === 'object') walkStringFields(item as Record<string, unknown>, fn)
    } else if (v && typeof v === 'object') walkStringFields(v as Record<string, unknown>, fn)
  }
}

const LOGO_OK_ARCHETYPES = new Set(['hero', 'closing', 'cs'])

export function applyPlacementGuards(
  spec: PageSpec,
  cutoutSet: ReadonlySet<string>,
  logoSet: ReadonlySet<string> = new Set(),
): void {
  const stats = { textLedImg: 0, emoji: 0, cutoutMoved: 0, usageUniform: 0, logoMoved: 0 }
  for (const b of spec.blocks) {
    const arch = String(getVariant(b.variantId)?.archetype ?? '')
    const data = (b.data ?? {}) as Record<string, unknown>
    // usage 스텝 이미지 균일성 — 일부 스텝에만 이미지가 있으면 전부 제거(절름발이 레이아웃 방지)
    if (arch === 'usage') {
      for (const v of Object.values(data)) {
        if (!Array.isArray(v) || v.length < 2) continue
        const items = v.filter((it): it is Record<string, unknown> => Boolean(it) && typeof it === 'object')
        if (items.length < 2) continue
        const withImg = items.filter((it) => typeof it.image === 'string' && /^https?:\/\//.test(String(it.image)))
        if (withImg.length > 0 && withImg.length < items.length) {
          for (const it of items) delete it.image
          stats.usageUniform += withImg.length
        }
      }
    }
    walkStringFields(data, (parent, key, value) => {
      const isUrl = /^https?:\/\//.test(value)
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
      if (!isUrl && EMOJI_RE.test(value)) {
        const cleaned = value.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim()
        stats.emoji++
        if (cleaned) parent[key] = cleaned
        else delete parent[key]
      }
    })
  }
  if (stats.textLedImg || stats.emoji || stats.cutoutMoved || stats.usageUniform)
    console.warn(
      `[Blocks Composer] 배치 가드 — 표계열 이미지 제거 ${stats.textLedImg} · 이모지 정리 ${stats.emoji} · 누끼 오배치 제거 ${stats.cutoutMoved} · 스텝 균일화 ${stats.usageUniform} · 로고 오배치 ${stats.logoMoved}`,
    )
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
    // 사진 주도형(imageSlots>=2)은 이미지 0장이면 거대한 빈 공간 — 드롭
    if (v.imageSlots >= 2) return false
    // 오버레이형(absolute 배치 CSS)은 이미지 0장이면 높이가 붕괴해 캡션이 이웃 섹션 위로
    // 떠오른다(feature-fullbleed 텍스트 겹침 실사례) — 무이미지 강등 렌더(noimg-safe)가 없는 변형은 드롭
    if (v.styleTags?.includes('noimg-safe')) return true
    if (/position:\s*absolute/.test(v.css ?? '')) return false
    return true
  })
  if (spec.blocks.length < beforeLen)
    console.warn(`[Blocks Composer] 이미지 없는 사진형/오버레이형 블록 ${beforeLen - spec.blocks.length}개 제거`)
}

/** ── 조립 후 페어링 QA ─────────────────────────────────────────────────────
 *  컴포저는 텍스트 노트만 보고 배치하므로 "카피 ↔ 이미지 어울림"의 최종 판단이 확률적이다
 *  (효능 카피 옆 패키지 라벨 확대 실사례). 조립이 끝난 spec의 (섹션 카피, 이미지) 쌍을
 *  비전 모델이 실제로 보고, 부적합 쌍의 이미지만 제거한다. 실패 시 spec 그대로(무중단). */
async function applyPairingQA(spec: PageSpec): Promise<number> {
  const pairs: Array<{ id: string; url: string; sectionCopy: string }> = []
  spec.blocks.forEach((b, i) => {
    if (i === 0) return // 히어로 메인컷은 제품 대표 비주얼 — 카피 적합성 검사 대상 아님
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
  if (removed) console.warn(`[Blocks Composer] 페어링 QA — 부적합 이미지 ${removed}건 제거: ${reasons.join(' · ')}`)
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

  dropEmptyPhotoBlocks(spec)

  // 근거 코퍼스 = 브리프 + 이미지노트 + 승인 스크립트 전문 + 청사진 요지 — 스크립트가 홈페이지에서
  // 가져온 실데이터(고객센터 번호 등)를 가드가 오제거하지 않도록 (평가자 반려↔가드 제거 루프 실사례)
  const groundingCorpus =
    JSON.stringify(input.brief) +
    JSON.stringify(input.imageNotes ?? {}) +
    (input.script ? JSON.stringify(input.script.sections) : '') +
    (input.blueprint ? JSON.stringify(input.blueprint.sections.map((s) => s.copyBrief)) : '')

  // 배치 결함 가드 — 표계열 이미지·이모지·누끼 오배치를 코드로 봉쇄 (깨진 스키마는 수리 패스가 수습)
  applyPlacementGuards(
    spec,
    new Set(input.cutoutUrls ?? (input.images?.cutout ? [input.images.cutout] : [])),
    new Set(input.logoUrls ?? []),
  )

  // 무근거 전화번호가 든 필드 제거 — 깨진 스키마는 아래 수리 패스가 해당 항목만 들어낸다
  sanitizeUngroundedPhones(spec, groundingCorpus)

  // 사소한 스키마 위반은 기계적으로 수리, 수리 불가 블록은 드롭 — 블록 1개 불량이 전체 실패로 번지지 않게
  repairAndSalvageBlocks(spec)

  // 근거 없는 단위 수치(g/kcal/% 등) 봉쇄 — 브리프·이미지노트에 없는 수치를 실은 블록은 드롭
  dropUngroundedNumericBlocks(spec, groundingCorpus)

  const rendered = renderPage(spec) // 변형 id/슬롯 데이터 검증 (실패 시 throw)
  return { spec, html: rendered.html, usedVariants: rendered.usedVariants }
}

export async function runBlocksComposer(input: BlocksComposerInput): Promise<AgentResult<BlocksComposerResult>> {
  const elapsed = timer()
  console.log('[Blocks Composer] 시작')
  try {
    let result: BlocksComposerResult
    try {
      result = await callOnce(input)
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
      const verdict = await runPageEvaluator({ brief: input.brief, blueprint: input.blueprint, spec: result.spec })
      if (verdict.success && verdict.data && !verdict.data.pass && verdict.data.issues.length) {
        const note = `페이지 평가자 반려 — 아래 결함을 모두 고쳐 유효한 전체 JSON을 다시 출력:\n${verdict.data.issues.join('\n')}`
        try {
          let rework = await callOnce(input, note)
          const removed2 = await applyPairingQA(rework.spec).catch(() => 0)
          if (removed2 > 0) {
            dropEmptyPhotoBlocks(rework.spec)
            repairAndSalvageBlocks(rework.spec)
            const re2 = renderPage(rework.spec)
            rework = { spec: rework.spec, html: re2.html, usedVariants: re2.usedVariants }
          }
          result = rework
          console.log('[Blocks Composer] 평가자 반려 재작업 반영')
        } catch (reworkErr: unknown) {
          console.warn('[Blocks Composer] 반려 재작업 실패 — 원안 유지:', (reworkErr as Error).message?.slice(0, 120))
        }
      }
    } catch (e) {
      console.warn('[Blocks Composer] 평가자 스킵:', (e as Error).message?.slice(0, 120))
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
