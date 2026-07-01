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
import { anthropicClient, parseJsonResponse, saveJson, timer, MODELS } from './utils'
import type { AgentResult, ProjectBrief } from './types'
import { catalog, deriveTokens, renderPage, type PageSpec } from './templates/blocks'

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
    .refine((b) => Boolean(b[0]?.variantId?.startsWith('hero-')), { message: '첫 블록은 hero 변형이어야 함' })
    .refine((b) => Boolean(b[b.length - 1]?.variantId?.startsWith('closing-')), { message: '마지막 블록은 closing 변형이어야 함' }),
})
export type ComposerOutput = z.infer<typeof composerOutputSchema>

/**
 * AI 출력 + 브랜드색 → 검증 가능한 PageSpec (토큰은 여기서 결정론적으로 도출). 순수 함수(테스트 가능).
 * presetOverride가 있으면 AI가 고른 presetKey 대신 강제(카테고리별 프리미엄 프리셋 노출용).
 * 브랜드색이 있으면 배경도 옅게 틴트해 업체별로 분위기가 달라지게 한다.
 */
export function assemblePageSpec(out: ComposerOutput, brandColors?: string[], presetOverride?: string): PageSpec {
  const presetKey = presetOverride ?? out.presetKey
  const hasBrand = (brandColors ?? []).length > 0
  const tokens = deriveTokens(presetKey, brandColors, { tintBackground: hasBrand })
  return { meta: { ...out.meta }, tokens, blocks: out.blocks }
}

export interface BlocksComposerInput {
  brief: ProjectBrief
  images?: { hero?: string; lifestyle?: string[]; cutout?: string; section?: string[] }
  brandColors?: string[]
  /** 카테고리에서 도출한 강제 프리셋(있으면 AI presetKey 대체). */
  preferredPreset?: string
  outputDir: string
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
const CONTRACTED_IDS: ReadonlySet<string> = new Set(
  DATA_CONTRACTS.split('\n')
    .map((line) => line.trim().match(/^([a-z0-9-]+)\s*\{/i)?.[1])
    .filter((id): id is string => Boolean(id)),
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
- Compose 12~18 blocks. FIRST block must be a hero (hero-centered, hero-editorial, hero-points, or hero-arch). LAST block must be a closing (closing-mood or closing-light).
- Order for a real detail page: hero → recommend/checklist → trust/checkpoint → point/feature sections (alternate text+photo) → reason/equation/callout → story → cert → compare/spec → closing.
- VISUAL RHYTHM (CRITICAL for premium depth — a flat single-tone page reads as low quality): alternate LIGHT and DARK sections. Include 2~3 DARK / dramatic blocks spread across the page (recommend-dark, feature-dark, ingredient-grid, statement-serif, stats-figures, story-brand, event-promo, closing-mood). NEVER place 3+ light sections in a row. brand-story and closing especially should be dark/dramatic.
- SCALE HIERARCHY: vary section scale — include at least one big-impact full-bleed/statement block (feature-fullbleed, statement-serif, callout-banner, banner-event, stats-figures) so the page is not uniform density.
- IMAGE-FIRST: you are given MANY images (hero, lifestyle, detail, ingredient, mood). Put a DISTINCT image in as many image-bearing blocks as possible; prefer variants that carry images over text-only ones. A premium detail page is image-led — minimize text-only sections.
- Pick presetKey by feel: warm-playful (친근한 식품/생활), modern-editorial (프리미엄/미니멀 명조), cobalt-premium (모던 커머스/전자·뷰티, 코발트블루), sand-luxury (따뜻한 뉴트럴 고급, 카멜/베이지). Match the product.
- Do NOT repeat the same variantId more than twice. Use strip-band at most once. Vary blocks for richness.
- Korean copy only. Emphasis via <span class="em">강조</span> sparingly; <br> for line breaks. NO other HTML/markdown in slot text.
- <span class="em"> and <br> are allowed ONLY in fields annotated (em) / (br) in the contract. In a field WITHOUT that annotation, output PLAIN TEXT — inserting em/br there renders as literal visible tags.
- NEVER output an empty emphasis tag as a fill-in-blank placeholder (e.g. 우리 아이에게 <span class="em"></span>가 있어요 is WRONG). Put the real word inside the span, or use plain text with no span.
- Map provided image URLs into (url) slots, distributing them so each image-bearing block gets a DIFFERENT image (lifestyle/scene shots → hero/story/sensory/usage; detail·macro → ingredient/feature; mood → closing/fullbleed). Only repeat an image when you run out. If a block truly has no fitting image, omit the field.
- FORBIDDEN WORDS: 완벽한, 최고의, 혁신적인, 압도적인 — replace with concrete facts.
- HONESTY (CRITICAL): never fabricate certifications, reviews, ratings, or numbers not present in the brief. Omit cert/spec rows you cannot ground.
- Do not output tokens/colors — only presetKey. The system derives the palette.`

function buildUserPrompt(input: BlocksComposerInput, repairNote?: string): string {
  const { brief, images } = input
  const imgLines: string[] = []
  if (images?.hero) imgLines.push(`- hero(메인): ${images.hero}`)
  if (images?.cutout) imgLines.push(`- cutout(누끼/단면): ${images.cutout}`)
  ;(images?.lifestyle ?? []).forEach((u, i) => imgLines.push(`- lifestyle${i + 1}(연출): ${u}`))
  ;(images?.section ?? []).forEach((u, i) => imgLines.push(`- section${i + 1}: ${u}`))
  const imageBlock = imgLines.length ? imgLines.join('\n') : '(제공 이미지 없음 — 이미지 슬롯은 생략)'

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

  return `제품명: ${brief.productName}
카테고리: ${brief.category}
플랫폼: ${brief.platform}
타겟: ${brief.targetAudience}
핵심 강조점: ${(brief.keyHighlights ?? []).join(' | ')}
톤: ${(brief.toneKeywords ?? []).join(', ')} / 방향: ${brief.styleDirection ?? ''}${required}${certs}${forbidden}

사용 가능한 이미지:
${imageBlock}

블록 카탈로그(variantId · archetype · imageSlots · 설명):
${catalog()
  .filter((c) => CONTRACTED_IDS.has(c.id))
  .map((c) => `- ${c.id} · ${c.archetype} · img${c.imageSlots} · ${c.describe}`)
  .join('\n')}

각 블록 데이터 계약:
${DATA_CONTRACTS}

위 제품을 위한 상세페이지를 블록 조합으로 설계해 JSON으로 출력하세요.${repair}`
}

async function callOnce(input: BlocksComposerInput, repairNote?: string): Promise<BlocksComposerResult> {
  const message = await anthropicClient.messages.create({
    model: MODELS.CLAUDE_SONNET,
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(input, repairNote) }],
  })
  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  const raw = parseJsonResponse<unknown>(text)
  const out = composerOutputSchema.parse(raw)
  const spec = assemblePageSpec(out, input.brandColors, input.preferredPreset)
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
      console.warn('[Blocks Composer] 1차 검증 실패 → 1회 재시도:', issues.slice(0, 160))
      result = await callOnce(input, issues)
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
