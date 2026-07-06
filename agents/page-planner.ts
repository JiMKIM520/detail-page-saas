/**
 * Agent: Page Planner — 재설계 A단계 (docs/plans/image-pipeline-redesign.md).
 * 컴포저 1콜이 서사·블록 선택·카피·이미지 배치를 전부 결정하던 구조(구멍 1·2)를 분리:
 * 승인 스크립트(고객이 확인한 서사) + 이미지 태거 인벤토리(실물 검수)를 입력으로
 * "섹션 순서 · 블록(variantId) · 섹션별 이미지 배정 · 카피 지침"만 결정한 청사진을 낸다.
 * 필러(컴포저)는 이 청사진을 구속 계약으로 슬롯을 채운다.
 */
import { z } from 'zod'
import { anthropicClient, parseJsonResponse, timer, MODELS, extractText } from './utils'
import { catalog } from './templates/blocks'
import { CONTRACTED_IDS } from './blocks-composer'
import type { AgentResult, ProjectBrief } from './types'

export interface BlueprintSection {
  order: number
  variantId: string
  /** 이 블록이 다룰 승인 스크립트 내용 요지 (필러의 카피 원천) */
  copyBrief: string
  /** 배정 이미지 (0~2, 제공 풀 URL만) */
  imageUrls: string[]
}
export interface PageBlueprint {
  sections: BlueprintSection[]
}

export interface PagePlannerInput {
  brief: ProjectBrief
  /** 승인 스크립트 — scripts.content(tone, sections[]) 또는 planning script.json */
  script: { tone?: string; sections: Array<Record<string, unknown>> }
  /** 이미지 인벤토리: URL → 태거 실물 노트(설명·방향·품질) */
  imageNotes: Record<string, string>
  avoidVariants?: string[]
}

// 상한 초과는 기계적으로 수리 가능한 위반 — 실패 대신 절단(컴포저 수리 패스와 같은 철학)
const blueprintSchema = z.object({
  sections: z.preprocess(
    (v) => (Array.isArray(v) ? v.slice(0, 20) : v),
    z
      .array(
        z.object({
          order: z.number().int().min(0),
          variantId: z.string().min(1),
          copyBrief: z.string().min(1),
          imageUrls: z.preprocess(
            (v) => (Array.isArray(v) ? v.slice(0, 3) : v),
            z.array(z.string()).max(3).default([]),
          ),
        }),
      )
      .min(8)
      .max(20),
  ),
})

const SYSTEM_PROMPT = `You are the PAGE PLANNER for a Korean e-commerce detail page system.
You do NOT write copy. You produce a page blueprint that a filler agent will follow verbatim.

Inputs you receive: the client-APPROVED script (narrative sections), a verified image inventory
(each entry describes what is ACTUALLY in the image — trust it), and the block catalog (in this
system prompt). Your job:

1. NARRATIVE: follow the approved script's section order as the spine of the page. Merge or split
   script sections only when the catalog demands it. Every page starts with one hero-family block
   and ends with one closing-family block. 10~16 blocks total.
2. BLOCK CHOICE: pick variantIds ONLY from the catalog below. Match each script section's intent
   to the block archetype (story→story/point, 성분→ingredient, 사용법→usage, FAQ→faq, 배송→cs/shipping).
   Do not use the same variant twice. Avoid three consecutive blocks of the same archetype.
3. IMAGE ASSIGNMENT: assign images from the inventory ONLY where the image's actual content
   supports the section (읽어라 — 노트가 실물이다). Rules:
   - [세로] images never go to wide full-bleed/panorama blocks.
   - "차선" images only in small thumbnail slots.
   - product-label/누끼 shots fit hero, detail, feature, ingredient — not story/mood backgrounds.
   - Each image at most 2 sections. Leave imageUrls [] when nothing fits — text blocks are fine.
   - Blocks with imageSlots>=2 need at least 1 assigned image or must not be chosen.
4. copyBrief: ONE terse Korean sentence (max 80 chars) stating WHAT the filler must say there,
   quoting key facts from the script (numbers, claims). The filler may not invent beyond this.

Output raw compact JSON only (no prose, no markdown, minimal whitespace):
{"sections":[{"order":0,"variantId":"hero-arch","copyBrief":"...","imageUrls":["https://..."]}]}`

/** 카탈로그(계약 있는 변형만) — 정적이므로 프롬프트 캐싱 대상 */
let catalogBlock: string | null = null
function getCatalogBlock(): string {
  if (catalogBlock) return catalogBlock
  catalogBlock = `블록 카탈로그(variantId · archetype · imageSlots · 설명):\n${catalog()
    .filter((c) => CONTRACTED_IDS.has(c.id))
    .map((c) => `- ${c.id} · ${c.archetype} · img${c.imageSlots} · ${c.describe}`)
    .join('\n')}`
  return catalogBlock
}

function summarizeScriptSections(sections: Array<Record<string, unknown>>): string {
  return sections
    .map((s, i) => {
      const type = String(s.type ?? s.sectionType ?? 'section')
      const title = String(s.title ?? s.text ?? '').slice(0, 60)
      const body = JSON.stringify(s).replace(/https?:\/\/\S+/g, '').slice(0, 420)
      return `[${i}] type=${type} | ${title}\n${body}`
    })
    .join('\n\n')
}

function buildUserPrompt(input: PagePlannerInput, repairNote?: string): string {
  const imgLines = Object.entries(input.imageNotes)
    .map(([url, note]) => `- ${url}\n    ↳ ${note}`)
    .join('\n')
  const avoid = input.avoidVariants?.length
    ? `\n\nDO NOT USE variants: ${input.avoidVariants.join(', ')}`
    : ''
  const repair = repairNote ? `\n\n⚠️ 직전 청사진 검증 실패 — 고쳐서 다시: ${repairNote}` : ''
  return `제품명: ${input.brief.productName}
카테고리: ${input.brief.category} / 플랫폼: ${input.brief.platform}
타겟: ${input.brief.targetAudience}
톤: ${input.script.tone ?? input.brief.styleDirection ?? ''}

승인 스크립트 섹션(서사의 뼈대 — 이 순서를 따르라):
${summarizeScriptSections(input.script.sections)}

이미지 인벤토리(실물 검수 완료 — 노트 기준으로만 배정):
${imgLines || '(이미지 없음)'}${avoid}${repair}

위 스크립트 서사에 맞는 페이지 청사진 JSON만 출력하세요.`
}

/** 결정적 청사진 검증+수리 — 수리 가능한 위반(중복·미지 변형·위치)은 고치고, 불가한 것만 issue */
function validateBlueprint(bp: PageBlueprint, allowedUrls: ReadonlySet<string>): string[] {
  const issues: string[] = []
  const arch = (id: string): string => String(catalog().find((c) => c.id === id)?.archetype ?? '')

  // 수리 1: 미지 변형·중복 제거(첫 항목 유지), 이미지 풀 이탈 제거
  const seen = new Set<string>()
  bp.sections = bp.sections.filter((s) => {
    if (!CONTRACTED_IDS.has(s.variantId) || seen.has(s.variantId)) return false
    seen.add(s.variantId)
    s.imageUrls = s.imageUrls.filter((u) => allowedUrls.has(u))
    return true
  })

  // 수리 2: hero/closing이 존재하는데 위치만 틀리면 재배치
  const heroIdx = bp.sections.findIndex((s) => arch(s.variantId) === 'hero')
  if (heroIdx > 0) bp.sections.unshift(...bp.sections.splice(heroIdx, 1))
  const closingIdx = bp.sections.findIndex((s) => arch(s.variantId) === 'closing')
  if (closingIdx >= 0 && closingIdx !== bp.sections.length - 1)
    bp.sections.push(...bp.sections.splice(closingIdx, 1))

  // 수리 불가 위반만 재시도 사유로
  if (bp.sections.length < 8) issues.push(`수리 후 블록 ${bp.sections.length}개(<8)`)
  if (!bp.sections.length || arch(bp.sections[0].variantId) !== 'hero') issues.push('hero 계열 블록 없음')
  if (!bp.sections.length || arch(bp.sections[bp.sections.length - 1].variantId) !== 'closing')
    issues.push('closing 계열 블록 없음')
  return issues
}

export async function runPagePlanner(input: PagePlannerInput): Promise<AgentResult<PageBlueprint>> {
  const elapsed = timer()
  console.log(`[Page Planner] 시작 — 스크립트 ${input.script.sections.length}섹션 · 이미지 ${Object.keys(input.imageNotes).length}장`)
  const allowedUrls = new Set(Object.keys(input.imageNotes))

  const callOnce = async (repairNote?: string): Promise<PageBlueprint> => {
    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 16000, // 8192는 16블록 청사진에서 잘림(Unterminated JSON 실사례) — S5 토크나이저 여유 포함
      system: [
        { type: 'text', text: SYSTEM_PROMPT },
        { type: 'text', text: getCatalogBlock(), cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(input, repairNote) }],
    })
    if (message.stop_reason === 'max_tokens')
      console.warn('[Page Planner] ⚠ 출력이 max_tokens로 잘림 — JSON 불완전')
    const bp = blueprintSchema.parse(parseJsonResponse<unknown>(extractText(message.content))) as PageBlueprint
    bp.sections.sort((a, b) => a.order - b.order)
    const issues = validateBlueprint(bp, allowedUrls)
    if (issues.length) throw new Error(issues.join(' / '))
    return bp
  }

  try {
    let bp: PageBlueprint
    try {
      bp = await callOnce()
    } catch (firstErr: unknown) {
      const note = firstErr instanceof Error ? firstErr.message.slice(0, 500) : String(firstErr)
      console.warn('[Page Planner] 1차 검증 실패 → 재시도:', note.slice(0, 140))
      bp = await callOnce(note)
    }
    console.log(`[Page Planner] 완료 (${elapsed()}ms) — ${bp.sections.length}블록: ${bp.sections.map((s) => s.variantId).join(', ')}`)
    return { success: true, data: bp, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Page Planner] 실패(청사진 없이 진행):', msg.slice(0, 160))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
