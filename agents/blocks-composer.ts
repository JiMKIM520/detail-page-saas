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

/** AI 출력 + 브랜드색 → 검증 가능한 PageSpec (토큰은 여기서 결정론적으로 도출). 순수 함수(테스트 가능). */
export function assemblePageSpec(out: ComposerOutput, brandColors?: string[]): PageSpec {
  const tokens = deriveTokens(out.presetKey, brandColors, { tintBackground: false })
  return { meta: out.meta, tokens, blocks: out.blocks }
}

export interface BlocksComposerInput {
  brief: ProjectBrief
  images?: { hero?: string; lifestyle?: string[]; cutout?: string; section?: string[] }
  brandColors?: string[]
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
compare-beforeafter { title, subtitle?, beforeLabel?, afterLabel?, beforeImage?(url), afterImage?(url), rows:[{ before, after(em) }] (2~5), closer?(em,br) }   // 차별화 비교(BEFORE/AFTER 2단)
review-list { title, subtitle?, reviews:[{ text(em,br), author?, rating?:1~5, image?(url) }] (2~5), closer?(em,br) }   // 고객리뷰(아바타+별점 리스트+인정 카운트). 후기는 brief 근거만
usage-steps { title?, subtitle?, image?(url), steps:[{ icon, text(em,br), label? }] (2~5), closer?(em,br) }   // 사용법(HOW TO USE + 아이콘 STEP 리스트). icon ∈ 위 아이콘셋, label 기본 "STEP 0N"
package-list { title?, subtitle?, packages:[{ name(em), desc?, image?(url), priceOriginal?, price?, best?:bool }] (2~4) }   // 상품 구성/패키지(가격). 가격·구성은 brief 근거만, 지어내지 말 것
cert-frame { title?, subtitle?, certs:[{ label, image?(url), caption? }] (1~4) }   // 인증/시험성적서(액자+씰). 인증/시험 내용은 brief 근거만, 지어내지 말 것
gallery-grid { eyebrow?, title, subtitle?, hero?(url), shots:[{ image?(url), label, desc? }] (2~6) }   // 갤러리(12) 사진 중심 룩북 — 풀폭 히어로+섀도우 액자 그리드+인덱스 번호
event-promo { strip?, title, subtitle?(em,br), benefit, image?(url), sectionLabel?, points:[{ text }] (2~5) }   // 이벤트(13) 리뷰·쿠폰 다크 프로모 — marquee strip+선물 이미지+대형 제목+혜택 pill+체크 포인트 카드. 혜택/쿠폰은 brief 근거만
discount-deal { saleLabel?, eyebrow?, headline(em), discountRate, urgencyBadge?, subQuestion?, ctaText, originalPrice?, salePrice?, period?, bgImage?(url), burstImage?(url) }   // 할인(15) 임팩트형 — 밝은 배경+BIG SALE 빨강 헤드라인+블랙 pill 태그+빨강 버스트+CTA 바. 가격/할인율은 brief 근거만
detail-showcase { eyebrow?, title, productImage?(url), specs:[{ label, value }] (2~6), quote?(em,br), headline?(em,br), scenes:[{ image?(url), caption }] (2) }   // 제품설명(17) 에디토리얼 서술형 — 대제목→풀폭 이미지→스펙 미니표→인용 카피→헤드라인→2열 씬
story-brand { index?, slogan?, year?, label, titlePre?, titleBold, titlePost?, paragraphs:[str] (1~4), image?(url) }   // 브랜드스토리(09) 풀블리드 — 메타바+에디토리얼 대형 혼합굵기 제목+본문 카피
banner-seasonal { eyebrow, titleLine1, titleLine2?, period?, image?(url), decoImage?(url), bgFrom?, bgTo? }   // 시즈널배너(18) 봄·여름·가을·겨울 범용 — 양쪽 라인 눈썹+Cafe24 Dangdanghae 대형 2줄 타이틀+기간 pill
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
- Pick presetKey by feel: warm-playful (친근한 식품/생활), modern-editorial (프리미엄/미니멀 명조), cobalt-premium (모던 커머스/전자·뷰티, 코발트블루), sand-luxury (따뜻한 뉴트럴 고급, 카멜/베이지). Match the product.
- Do NOT repeat the same variantId more than twice. Use strip-band at most once. Vary blocks for richness.
- Korean copy only. Emphasis via <span class="em">강조</span> sparingly; <br> for line breaks. NO other HTML/markdown in slot text.
- Map provided image URLs into (url) slots. Reuse the few available images sensibly across blocks. If no suitable image, omit that field.
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
  const spec = assemblePageSpec(out, input.brandColors)
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
