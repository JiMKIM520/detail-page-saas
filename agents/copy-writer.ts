/**
 * Agent 3-4: Copy Writer
 * 스크립트 + 스타일 가이드 기반으로 섹션별 마이크로 카피 튜닝
 */

import { anthropicClient, parseJsonResponse, saveJson, sanitizeRefinedCopy, timer, MODELS } from './utils'
import type { Script, StyleGuide, RefinedCopy, AgentResult, ProjectBrief } from './types'

const SYSTEM_PROMPT = `You are a senior Korean e-commerce copywriter specializing in high-conversion product detail pages.
Your task: take the raw script and style guide, then refine every piece of copy to maximize emotional impact and conversion.

RULES:
- Output Korean copy only
- Maintain the brand tone and keywords from the style guide
- Headlines: punchy, emotional, max 15 characters
- Body text: specific, concrete, avoid vague superlatives
- Use the tone ratio from the category (emotional:informational)
- NO forbidden expressions
- REQUIRED PHRASES: if required phrases are listed, they MUST appear verbatim somewhere in the refined copy
- JSON only, no markdown

COPY QUALITY RULES (CRITICAL):
- items[].value: minimum 15 characters. If the script provides a short value, expand it with sensory or benefit language. NEVER output an empty or very short value.
- items[].label: minimum 4 characters. Short labels (e.g. "해동", "발효") are acceptable only if they clearly communicate the concept.
- body: sections with sectionType in [brand_story, sensory, packaging, gift_suggestion, size_comparison, usage, cta] MUST have a non-empty "body" field (minimum 30 characters). Do NOT output null for body in these sections.
- All sections must have at least ONE of: body, or items array with 2+ entries.
- FORBIDDEN WORDS: 완벽한, 최고의, 혁신적인, 압도적인 — replace with specific facts or sensory descriptions instead.`

function buildUserPrompt(script: Script, styleGuide: StyleGuide, brief: ProjectBrief): string {
  const requiredPhrases = brief.requiredContent.phrases.length > 0
    ? `\nREQUIRED PHRASES (must appear verbatim in refined copy):\n${brief.requiredContent.phrases.map((p) => `- "${p}"`).join('\n')}`
    : ''

  const forbiddenWords = brief.restrictions.words.length > 0
    ? `\nFORBIDDEN WORDS (must NOT appear):\n${brief.restrictions.words.map((w) => `- "${w}"`).join('\n')}`
    : ''

  return `
Brand: ${styleGuide.brand.name}
Mood: ${styleGuide.brand.moodKeywords.join(', ')}
Target Emotion: ${styleGuide.brand.targetEmotion}
Tone Keywords: ${styleGuide.brand.moodKeywords.join(', ')}
${requiredPhrases}${forbiddenWords}

Raw Script:
${JSON.stringify(script.sections, null, 2)}

Refine the copy for each section. Output this JSON schema:
{
  "sections": [
    {
      "sectionType": string,
      "headline": string,
      "subheadline": string | null,
      "body": string | null,
      "items": [{ "label": string, "value": string }] | null
    }
  ]
}

JSON only.`
}

export async function runCopyWriter(
  script: Script,
  styleGuide: StyleGuide,
  outputDir: string,
  brief: ProjectBrief
): Promise<AgentResult<RefinedCopy>> {
  const elapsed = timer()
  console.log('[Copy Writer] 시작')

  try {
    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(script, styleGuide, brief) }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const refinedCopy = parseJsonResponse<RefinedCopy>(text)

    // items.value 누락 보정 — 빈 값이면 label 첫 단어로 대체
    for (const section of refinedCopy.sections) {
      if (section.items) {
        section.items = section.items.map((item) => ({
          ...item,
          value: (item.value && item.value.trim().length > 0)
            ? item.value
            : item.label,
        }))
      }
    }

    // 금지어 후처리 필터 (결정론적 치환)
    const sanitized = sanitizeRefinedCopy(refinedCopy)

    saveJson(sanitized, `${outputDir}/refined-copy.json`)
    console.log(`[Copy Writer] 완료 (${elapsed()}ms) — ${sanitized.sections.length}개 섹션 (금지어 필터 적용)`)

    return { success: true, data: refinedCopy, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Copy Writer] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
