import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/** Claude 모델 ID — env로 오버라이드 가능. 파이프라인 표준(MODELS.CLAUDE_SONNET)과 정렬. */
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-5'

// Sonnet 5 호환 3종(스트리밍·thinking 블록 대비 텍스트 추출·출력 여유) — 모델 세대 교체 시 필수 체크리스트.
// S5는 동일 스크립트에 4.6 대비 ~2.5배 출력 토큰을 쓰므로 16384 캡은 잘림 사고로 이어진다(실사례 3회).
const MAX_TOKENS = 24576

function textOf(message: Anthropic.Message): string {
  // 잘린 응답을 조용히 반환하면 JSON을 파싱하지 않는 호출부가 결손 산출물을 쓰게 된다(리뷰 지적).
  // 두 호출부(generateScriptForProject·A/B 변형) 모두 재시도 로직이 있으므로 throw가 안전하다.
  if (message.stop_reason === 'max_tokens')
    throw new Error(`[claude] 출력이 max_tokens(${MAX_TOKENS})에서 잘림 — 프롬프트 축소 또는 상한 증설 필요`)
  if (message.stop_reason !== 'end_turn')
    console.warn(`[claude] stop_reason=${message.stop_reason} — 비정상 종료 가능성`)
  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('Unexpected response type (no text block)')
  return block.text
}

export async function generateScript(systemPrompt: string, userPrompt: string): Promise<string> {
  const message = await client.messages
    .stream({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })
    .finalMessage()
  return textOf(message)
}

export type ImageInput = {
  type: 'base64'
  media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  data: string
  label?: string
}

export async function generateScriptWithImages(
  systemPrompt: string,
  userPrompt: string,
  images: ImageInput[]
): Promise<string> {
  const contentBlocks: Anthropic.MessageCreateParams['messages'][0]['content'] = []

  // 이미지 블록 추가
  for (const img of images) {
    if (img.label) {
      contentBlocks.push({ type: 'text', text: `[${img.label}]` })
    }
    contentBlocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.media_type,
        data: img.data,
      },
    })
  }

  // 텍스트 프롬프트
  contentBlocks.push({ type: 'text', text: userPrompt })

  const message = await client.messages
    .stream({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: contentBlocks }],
      system: systemPrompt,
    })
    .finalMessage()
  return textOf(message)
}
