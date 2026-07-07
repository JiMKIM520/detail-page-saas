/**
 * Agent: Shot Prompter — 재설계 Sprint 5 (수요 기반 이미지 공급).
 * 플래너 청사진의 이미지 니즈(무엇이 찍혀야 하는가) × 아트디렉터 스타일가이드(톤·조명·무드)를
 * 결합해 컷별 최종 생성 프롬프트를 만든다. filename = 니즈 id — 생성된 컷이 태어날 때부터
 * 배치처를 갖는다(낭비 0). withProduct=false 컷(원료·소재·질감)은 제품 레퍼런스 없이 순수 생성.
 * 산출 형식은 기존 styling-final-prompts.json의 shots와 호환(생성 라우트 무변경 소비).
 */
import { anthropicClient, parseJsonResponse, timer, MODELS, extractText } from './utils'
import type { AgentResult, StyleGuide } from './types'
import type { ImageNeed } from './page-planner'

export interface PromptedShot {
  name: string
  filename: string
  finalPrompt: string
  withProduct: boolean
}

const SYSTEM_PROMPT = `You are a commercial photography prompt director for Korean e-commerce detail pages.
You receive a list of IMAGE NEEDS (each says WHAT must be in the shot) and a style guide
(mood/lighting/palette). Write ONE generation prompt per need.

Rules per prompt:
- English, detailed: composition / surface & props / lighting / mood / camera (specific mm + f-stop),
  Kodak Portra 400 grain, natural imperfections. NO words like "perfect", "hyperrealistic".
- Follow the style guide mood so all shots feel like one campaign, but vary composition/surface/light
  so no two shots look alike.
- withProduct=true: the product appears EXACTLY as in the reference photos (form, colors, label text
  preserved character-by-character — reference images will be attached at generation time).
- withProduct=false: NO product, NO packaging, NO text anywhere in frame — pure subject shot
  (raw ingredients / texture / scene). Only subjects explicitly given in the need.
- NEVER invent ingredients, props, or usage scenes beyond the need's subject line.
- End every prompt with: "[OUTPUT SPECS] 1000x1333px vertical 3:4, editorial Korean e-commerce
  detail page photography, no text overlays, no watermarks."

Output raw compact JSON array only:
[{"name":"니즈 subject 요약(한국어)","filename":"<need id>.png","finalPrompt":"...","withProduct":true}]`

export async function runShotPrompter(input: {
  needs: ImageNeed[]
  styleGuide?: Partial<StyleGuide>
  productName: string
  category: string
}): Promise<AgentResult<PromptedShot[]>> {
  const elapsed = timer()
  if (input.needs.length === 0) return { success: true, data: [], durationMs: 0 }
  console.log(`[Shot Prompter] 시작 — 니즈 ${input.needs.length}건`)
  try {
    const sg = input.styleGuide
    const styleBlock = sg
      ? `스타일가이드:
무드: ${(sg.brand?.moodKeywords ?? []).join(', ')} / 감성: ${sg.brand?.targetEmotion ?? ''}
팔레트: primary ${sg.colors?.primary ?? '-'} · accent ${sg.colors?.accent ?? '-'} · surface ${sg.colors?.surface1 ?? '-'}
디자인 노트: ${String((sg as { designNotes?: string }).designNotes ?? '').slice(0, 300)}`
      : '스타일가이드: (없음 — 카테고리 관례를 따르되 절제된 톤)'
    const needLines = input.needs
      .map((n) => `- id=${n.id} | style=${n.style} | withProduct=${n.withProduct} | subject: ${n.subject}`)
      .join('\n')

    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 12000, // 니즈 12건 × 상세 프롬프트 — S5 토크나이저 여유
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `제품: ${input.productName} (${input.category})
${styleBlock}

IMAGE NEEDS:
${needLines}

각 니즈당 1개 프롬프트, JSON 배열만 출력.`,
        },
      ],
    })
    if (message.stop_reason === 'max_tokens') console.warn('[Shot Prompter] ⚠ 출력 잘림')
    const rows = parseJsonResponse<Array<Partial<PromptedShot>>>(extractText(message.content))
    const byId = new Map(input.needs.map((n) => [n.id, n]))
    const shots: PromptedShot[] = []
    for (const r of rows) {
      const id = String(r.filename ?? '').replace(/\.png$/i, '')
      const need = byId.get(id)
      if (!need || !r.finalPrompt) continue
      shots.push({
        name: String(r.name ?? need.subject).slice(0, 80),
        filename: `${id}.png`,
        finalPrompt: String(r.finalPrompt),
        withProduct: need.withProduct, // 프롬프터 출력이 아니라 니즈가 결정 (결정적)
      })
    }
    // 누락 니즈 관측 — 프롬프터가 빠뜨린 니즈는 로그로 (생성 단계에서 그 컷만 없음)
    const missing = input.needs.filter((n) => !shots.some((s) => s.filename === `${n.id}.png`))
    if (missing.length) console.warn(`[Shot Prompter] 니즈 누락 ${missing.length}건: ${missing.map((m) => m.id).join(', ')}`)
    console.log(`[Shot Prompter] 완료 (${elapsed()}ms) — 컷 프롬프트 ${shots.length}건 (제품 미포함 ${shots.filter((s) => !s.withProduct).length}건)`)
    return { success: true, data: shots, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Shot Prompter] 실패:', msg.slice(0, 160))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
