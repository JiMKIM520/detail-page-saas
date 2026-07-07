/**
 * Agent: Page Evaluator — 재설계 D단계 (docs/plans/image-pipeline-redesign.md Sprint 3).
 * 생성자-평가자 분리(하네스 원칙): 필러가 만든 페이지 스펙을 별도 에이전트가 회의적으로 채점한다.
 * 비전 페어링 QA(카피↔이미지 실물 정합)와 상보적 — 여기서는 텍스트 수준의
 * ① 무근거 주장 ② 서사 흐름 파탄 ③ 반복·단조로움 ④ 청사진 위배를 본다.
 * 반려(pass=false)는 "납품 전 반드시 고쳐야 할 명백한 결함"만 — 재작업은 1회 한도라
 * 취향 수준의 지적으로 반려하지 않는다. 평가 실패 시 통과 처리(무중단).
 */
import { anthropicClient, parseJsonResponse, timer, MODELS, extractText } from './utils'
import type { AgentResult, ProjectBrief } from './types'
import type { PageBlueprint } from './page-planner'
import type { PageSpec } from './templates/blocks'

export interface EvaluatorVerdict {
  pass: boolean
  issues: string[]
}

const SYSTEM_PROMPT = `You are the PAGE EVALUATOR — a skeptical reviewer for composed Korean e-commerce detail pages.
You receive the client brief facts, an optional binding blueprint, and a summary of the composed page
(block sequence with copy excerpts and image assignments). Find OBVIOUS defects ONLY:

1. UNGROUNDED: copy asserting facts absent from the brief/blueprint — invented numbers, certifications,
   awards, superlative claims ("최초/최고/1위") without basis.
2. NARRATIVE: broken flow — e.g., purchase push before the product is introduced, two blocks saying
   the same thing back-to-back, closing in the middle.
3. REPETITION: the same phrase/claim recycled across 3+ blocks; 3+ consecutive blocks with identical
   structure making the page monotonous.
4. BLUEPRINT VIOLATION (when blueprint given): a block's copy contradicting its assigned copyBrief.

Judging discipline:
- pass=false ONLY when at least one defect MUST be fixed before client delivery.
- Stylistic taste, tone nuances, minor wording → NOT issues. When unsure, pass.
- Each issue: one Korean sentence, prefixed with the block number, concrete and fixable.

Output raw compact JSON only: {"pass":true,"issues":[]} or {"pass":false,"issues":["블록 3: ..."]}`

function summarizeSpec(spec: PageSpec): string {
  return spec.blocks
    .map((b, i) => {
      const texts: string[] = []
      let imgs = 0
      const walk = (obj: Record<string, unknown>): void => {
        for (const v of Object.values(obj)) {
          if (typeof v === 'string') {
            if (/^https?:\/\//.test(v)) imgs++
            else if (v.length > 3) texts.push(v)
          } else if (Array.isArray(v)) {
            for (const item of v) if (item && typeof item === 'object') walk(item as Record<string, unknown>)
          } else if (v && typeof v === 'object') walk(v as Record<string, unknown>)
        }
      }
      walk((b.data ?? {}) as Record<string, unknown>)
      const copy = texts.join(' · ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 260)
      return `[블록 ${i}] ${b.variantId} | 이미지 ${imgs}개\n${copy}`
    })
    .join('\n\n')
}

export async function runPageEvaluator(input: {
  brief: ProjectBrief
  blueprint?: PageBlueprint
  spec: PageSpec
}): Promise<AgentResult<EvaluatorVerdict>> {
  const elapsed = timer()
  console.log('[Page Evaluator] 시작')
  try {
    const bpBlock = input.blueprint
      ? `\n청사진(구속 계약이었음):\n${input.blueprint.sections.map((s, i) => `${i}. ${s.variantId}: ${s.copyBrief}`).join('\n')}\n`
      : ''
    const userPrompt = `브리프 사실 관계(근거의 전부 — 여기 없는 사실·수치는 무근거):
제품: ${input.brief.productName} / 카테고리: ${input.brief.category}
핵심 강조점: ${(input.brief.keyHighlights ?? []).join(' | ').slice(0, 8000)}
${bpBlock}
조립된 페이지:
${summarizeSpec(input.spec)}

위 페이지를 채점해 JSON만 출력하세요.`

    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    if (message.stop_reason === 'max_tokens') console.warn('[Page Evaluator] ⚠ 출력 잘림')
    const raw = parseJsonResponse<{ pass?: boolean; issues?: unknown[] }>(extractText(message.content))
    const verdict: EvaluatorVerdict = {
      pass: raw.pass !== false,
      issues: Array.isArray(raw.issues) ? raw.issues.map(String).slice(0, 8) : [],
    }
    console.log(
      `[Page Evaluator] 완료 (${elapsed()}ms) — ${verdict.pass ? '통과' : `반려(${verdict.issues.length}건)`}${verdict.issues.length ? ': ' + verdict.issues.join(' / ').slice(0, 200) : ''}`,
    )
    return { success: true, data: verdict, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Page Evaluator] 실패(통과 처리):', msg.slice(0, 140))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
