/**
 * Agent 4: QA (법적 검증 + 필수 포함 검증)
 * - 카테고리별 법적 금지 표현 체크
 * - 기업 요청 필수 포함 사항 체크
 * - 기업 금지사항 체크
 */

import { anthropicClient, parseJsonResponse, saveJson, timer, MODELS, extractText } from './utils'
import { getCategoryPrompt } from '../lib/ai/prompts/categories'
import { getPlatformPrompt } from '../lib/ai/prompts/platforms'
import type { Script, ProjectBrief, ComplianceReport, AgentResult } from './types'

const SYSTEM_PROMPT = `You are a Korean e-commerce legal compliance specialist.
Analyze the provided script and report any compliance issues.

Check three things:
1. Legal forbidden expressions for the category
2. Required content that the client requested (must be present)
3. Client restrictions (forbidden words/styles must NOT be present)

Output JSON only, no markdown.`

function buildUserPrompt(script: Script, brief: ProjectBrief): string {
  const category = getCategoryPrompt(brief.category)
  const platform = getPlatformPrompt(brief.platform)

  return `
Category: ${brief.category}
Platform: ${brief.platform}

Category Legal Rules: ${category?.legalRules ?? 'General commercial standards'}

Platform Rules (${platform?.name ?? brief.platform}):
- Layout Rules: ${platform?.layoutRules ?? 'Standard layout'}
- Common Mistakes to Avoid: ${platform?.commonMistakes ?? 'None'}

Forbidden Expressions (MUST NOT appear):
${category?.forbiddenExpressions.map((e) => `- "${e.forbidden}" (allowed: "${e.allowed}")`).join('\n') ?? 'None'}
${brief.restrictions.words.length > 0 ? brief.restrictions.words.map((w) => `- "${w}"`).join('\n') : ''}

Required Content (MUST be present):
${brief.requiredContent.phrases.length > 0 ? brief.requiredContent.phrases.map((p) => `- "${p}"`).join('\n') : 'None'}
${brief.requiredContent.certifications.length > 0 ? brief.requiredContent.certifications.map((c) => `- Certification: ${c}`).join('\n') : ''}

Script to check:
${JSON.stringify(script.sections, null, 2)}

Output this JSON:
{
  "passed": boolean,
  "issues": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM",
      "type": "legal" | "required_content" | "restriction",
      "description": string,
      "location": string,
      "suggestion": string | null
    }
  ],
  "checkedAt": "${new Date().toISOString()}"
}

JSON only.`
}

export async function runQA(
  script: Script,
  brief: ProjectBrief,
  outputDir: string
): Promise<AgentResult<ComplianceReport>> {
  const elapsed = timer()
  console.log('[QA] 시작')

  try {
    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_HAIKU,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(script, brief) }],
    })

    const text = extractText(message.content)
    const report = parseJsonResponse<ComplianceReport>(text)

    saveJson(report, `${outputDir}/compliance-report.json`)

    const criticalCount = report.issues.filter((i) => i.severity === 'CRITICAL').length
    const highCount = report.issues.filter((i) => i.severity === 'HIGH').length

    console.log(`[QA] 완료 (${elapsed()}ms) — ${report.passed ? '✅ PASS' : '❌ FAIL'}`)
    if (report.issues.length > 0) {
      console.log(`  CRITICAL: ${criticalCount}, HIGH: ${highCount}, 총 이슈: ${report.issues.length}`)
    }

    return { success: true, data: report, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[QA] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
