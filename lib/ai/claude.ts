import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateScript(systemPrompt: string, userPrompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })
  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text
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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: contentBlocks }],
    system: systemPrompt,
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text
}
