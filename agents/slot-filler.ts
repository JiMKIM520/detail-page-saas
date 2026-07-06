/**
 * Slot Filler (식품) — 슬롯템플릿 경로 전용.
 * 생성된 Script + RefinedCopy + Brief를 식품 슬롯 구조(FoodCopyData)로 매핑한다.
 * 출력은 foodCopySchema(zod)로 검증하며, 실패 시 오류를 피드백해 1회 재시도.
 *
 * 정직성 원칙: 실제 제품의 고객 후기/평점을 지어내지 않는다.
 *   - trust.certs = brief 인증정보에서만
 *   - trust.score/count/reviews = 입력 소스에 명시된 경우에만, 없으면 비움
 */
import { anthropicClient, parseJsonResponse, saveJson, timer, MODELS, extractText } from './utils'
import type { Script, RefinedCopy, AgentResult, ProjectBrief } from './types'
import { foodCopySchema, type FoodCopyData } from './templates/slots/food-slot'

const SYSTEM_PROMPT = `You are a senior Korean e-commerce content architect.
Your task: take the generated script, refined copy, and brief, then map them into a FIXED food detail-page slot structure (그래놀라급 9-section premium layout).
You are NOT writing layout or CSS — only filling content slots that a fixed template will render.

RULES:
- Output Korean copy only. JSON only, no markdown.
- Reuse and compose the provided script/refined copy. Do not invent product facts not implied by the input.
- Headlines punchy; body specific and sensory; avoid vague superlatives.
- FORBIDDEN WORDS: 완벽한, 최고의, 혁신적인, 압도적인 — never use; replace with concrete facts.
- REQUIRED PHRASES (if listed) MUST appear verbatim somewhere.
- HONESTY (CRITICAL): Do NOT fabricate customer reviews or star ratings for a real product.
    - trust.certs: fill ONLY from the brief's certifications.
    - trust.score / trust.count / trust.reviews: include ONLY if explicitly present in the input source. Otherwise omit them entirely.
- Slot count constraints (STRICT): pills 3-5, ingredients 4-9, checkpoints 3-4, howToEat 2-3, whenToEat 2-3, spec >=3, lineup 2-4.
- intro.headline may contain inline emphasis as <span class="em">강조</span> (keep minimal). All other fields are plain text.`

interface SlotFillerInput {
  brief: ProjectBrief
  script: Script
  refinedCopy?: RefinedCopy
  brand: string
  outputDir: string
}

function schemaBlock(): string {
  return `Output EXACTLY this JSON shape:
{
  "brand": string,                 // 브랜드명
  "product": string,               // 제품명
  "usp": string,                   // 히어로 한 줄 가치제안
  "badge": string?,                // 우상단 뱃지 (선택, 예: "스마트스토어 단독")
  "heroEyebrow": string?,          // 영문 eyebrow (선택)
  "pills": string[],               // 3~5개 핵심 키워드 칩
  "intro": { "headline": string, "body": string },
  "ingredientsTitle": string?,     // 선택
  "ingredients": [{ "name": string, "desc": string? }],   // 4~9개 (원재료/특성)
  "ingredientsNote": string?,
  "checkpoints": [{ "title": string, "desc": string }],   // 3~4개 (차별점)
  "howToEat": [{ "title": string, "desc": string }],      // 2~3개 (먹는/쓰는 법)
  "whenToEat": [{ "title": string, "desc": string }],     // 2~3개 (먹는 상황)
  "spec": [{ "k": string, "v": string }],                 // >=3 (상품 정보 표)
  "trust": { "certs": string[]? },                        // 후기/평점 지어내지 말 것
  "lineup": [{ "name": string, "tag": string? }],         // 2~4개 (라인업/추천)
  "cta": { "eyebrow": string?, "headline": string, "sub": string?, "button": string, "note": string? }
}
JSON only.`
}

function buildUserPrompt(input: SlotFillerInput, repairNote?: string): string {
  const { brief, script, refinedCopy, brand } = input
  const required =
    brief.requiredContent.phrases.length > 0
      ? `\nREQUIRED PHRASES (verbatim):\n${brief.requiredContent.phrases.map((p) => `- "${p}"`).join('\n')}`
      : ''
  const forbidden =
    brief.restrictions.words.length > 0
      ? `\nFORBIDDEN WORDS:\n${brief.restrictions.words.map((w) => `- "${w}"`).join('\n')}`
      : ''
  const certs =
    brief.requiredContent.certifications.length > 0
      ? `\nCERTIFICATIONS (→ trust.certs):\n${brief.requiredContent.certifications.map((c) => `- "${c}"`).join('\n')}`
      : '\nCERTIFICATIONS: (none) → leave trust.certs empty'

  const repair = repairNote ? `\n\n⚠️ Previous output failed validation. Fix exactly these issues and re-output valid JSON:\n${repairNote}` : ''

  return `Brand: ${brand}
Product: ${brief.productName}
Category: ${brief.category}
Platform: ${brief.platform}
Target: ${brief.targetAudience}
Key highlights: ${brief.keyHighlights.join(' | ')}
Tone: ${brief.toneKeywords.join(', ')} / direction: ${brief.styleDirection}${required}${forbidden}${certs}

Generated script sections:
${JSON.stringify(script.sections, null, 2)}

Refined copy:
${refinedCopy ? JSON.stringify(refinedCopy.sections, null, 2) : '(none)'}

Map the above into the food slot structure. Compose — merge related sections, expand thin slots with sensory/benefit detail grounded in the input.${repair}

${schemaBlock()}`
}

async function callOnce(input: SlotFillerInput, repairNote?: string): Promise<FoodCopyData> {
  const message = await anthropicClient.messages.create({
    model: MODELS.CLAUDE_SONNET,
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(input, repairNote) }],
  })
  const text = extractText(message.content)
  const raw = parseJsonResponse<unknown>(text)
  return foodCopySchema.parse(raw)
}

export async function runSlotFiller(input: SlotFillerInput): Promise<AgentResult<FoodCopyData>> {
  const elapsed = timer()
  console.log('[Slot Filler] 시작')
  try {
    let data: FoodCopyData
    try {
      data = await callOnce(input)
    } catch (firstErr: unknown) {
      const issues = firstErr instanceof Error ? firstErr.message.slice(0, 800) : String(firstErr)
      console.warn('[Slot Filler] 1차 검증 실패 → 1회 재시도:', issues.slice(0, 160))
      data = await callOnce(input, issues)
    }
    saveJson(data, `${input.outputDir}/slot-copy.json`)
    console.log(`[Slot Filler] 완료 (${elapsed()}ms) — ingredients ${data.ingredients.length} · checkpoints ${data.checkpoints.length}`)
    return { success: true, data, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Slot Filler] 실패:', msg.slice(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
