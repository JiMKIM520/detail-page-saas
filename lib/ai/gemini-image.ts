import { GoogleGenAI } from '@google/genai'

let _client: GoogleGenAI | null = null
function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is required')
    _client = new GoogleGenAI({ apiKey })
  }
  return _client
}

const MODELS = {
  pro: 'gemini-3-pro-image-preview',       // Nano Banana Pro — 최고 예술적 품질, 참조 4장
  nb2: 'gemini-3.1-flash-image-preview',   // Nano Banana 2 — 한글 90%+, 참조 14장, 빠름
  standard: 'gemini-2.5-flash-image',      // Nano Banana Standard — fallback
} as const

type ModelTier = keyof typeof MODELS

export interface GenerateImageOptions {
  prompt: string
  referenceImages?: string[]    // base64 배열 (누끼컷, 스타일링샷)
  aspectRatio?: string          // '3:4' | '9:16' | '1:1' | '16:9'
  model?: ModelTier             // 'pro' | 'nb2' | 'standard'
}

/**
 * Gemini 이미지 생성 — Pro(스타일링샷) 또는 NB2(섹션 이미지) 선택
 * 실패 시 하위 모델로 fallback
 */
export async function generateDesignImage(opts: GenerateImageOptions): Promise<Buffer> {
  const tier = opts.model ?? 'nb2'
  const fallbackChain: ModelTier[] = tier === 'pro'
    ? ['pro', 'nb2', 'standard']
    : tier === 'nb2'
      ? ['nb2', 'standard']
      : ['standard']

  let lastError: Error | null = null

  for (const modelTier of fallbackChain) {
    try {
      return await callGeminiImage(MODELS[modelTier], opts)
    } catch (err) {
      lastError = err as Error
      console.warn(`[gemini-image] ${MODELS[modelTier]} 실패, 다음 모델 시도:`, String(err).slice(0, 200))
    }
  }

  throw lastError ?? new Error('Gemini 이미지 생성 실패: 모든 모델 실패')
}

async function callGeminiImage(modelId: string, opts: GenerateImageOptions): Promise<Buffer> {
  const ai = getClient()

  // contents 구성: 텍스트 + 참조 이미지
  const contents: any[] = [{ text: opts.prompt }]

  if (opts.referenceImages && opts.referenceImages.length > 0) {
    for (const base64 of opts.referenceImages) {
      contents.push({
        inlineData: { mimeType: 'image/png', data: base64 },
      })
    }
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: opts.aspectRatio ? { aspectRatio: opts.aspectRatio } : undefined,
    },
  })

  const parts = response.candidates?.[0]?.content?.parts
  if (!parts) throw new Error(`Gemini ${modelId}: 응답에 parts 없음`)

  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64')
    }
  }

  // 텍스트만 반환된 경우 (이미지 생성 거부 — safety filter 등)
  const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text).join(' ')
  throw new Error(`Gemini ${modelId}: 이미지 없음. 응답: ${textParts.slice(0, 200)}`)
}

export { MODELS }
