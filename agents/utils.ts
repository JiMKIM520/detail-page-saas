/**
 * DetailAI — 에이전트 공통 유틸리티
 */

import { GoogleGenAI, type Part } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

// ─── API 클라이언트 초기화 ────────────────────────────────────

function loadEnv(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local')
  try {
    const content = fs.readFileSync(envPath, 'utf8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).trim()
    }
    return env
  } catch {
    // Vercel 등 .env.local 파일이 없는 환경 → process.env fallback
    return Object.fromEntries(
      Object.entries(process.env).filter((e): e is [string, string] => e[1] !== undefined)
    )
  }
}

const env = loadEnv()

// Vertex AI 우선 (GCP 크레딧 사용). GOOGLE_CLOUD_PROJECT가 설정되면 자동 전환.
// 인증: gcloud auth application-default login 또는 GOOGLE_APPLICATION_CREDENTIALS
export const geminiClient = env.GOOGLE_CLOUD_PROJECT
  ? new GoogleGenAI({
      vertexai: true,
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION ?? 'asia-northeast3',
    })
  : new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

export const anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

// ─── 모델 상수 ───────────────────────────────────────────────

// Vertex AI / AI Studio 모델명 분기
// Vertex AI는 preview 모델명 대신 정식 모델명 또는 exp 사용
const isVertexAI = !!env.GOOGLE_CLOUD_PROJECT

export const MODELS = {
  // Gemini 이미지 생성
  // AI Studio: gemini-3-pro-image-preview (최고 품질)
  // Vertex AI: gemini-2.0-flash-exp (이미지 생성 지원)
  GEMINI_PRO_IMAGE: isVertexAI
    ? 'gemini-2.0-flash-exp'
    : 'gemini-3-pro-image-preview',

  // 한글 타이포 추가용
  GEMINI_FLASH_IMAGE_TYPO: isVertexAI
    ? 'gemini-2.0-flash-exp'
    : 'gemini-3.1-flash-image-preview',

  // Fallback (Pro 실패 시)
  GEMINI_FLASH_IMAGE_FALLBACK: isVertexAI
    ? 'gemini-2.0-flash-exp'
    : 'gemini-2.5-flash-image',

  // v5 — Transparent PNG 지원 (frame/accent 등 투명 배경 에셋용)
  GEMINI_FLASH_IMAGE_TRANSPARENT: isVertexAI
    ? 'gemini-2.0-flash-exp'
    : 'gemini-2.5-flash-image',

  // Gemini 텍스트
  GEMINI_FLASH: 'gemini-2.5-flash',

  // Claude (2026 최신)
  // Sonnet 5: 2026-08-31까지 인트로 단가 $2/$10 — 9/1 정가($3/$15) 전환 시 비용 재평가 필요.
  // 신형 토크나이저(Sonnet 5·Opus 4.7+)는 같은 텍스트에 ~30% 더 많은 토큰 → max_tokens 여유 필요.
  CLAUDE_SONNET: 'claude-sonnet-5',
  CLAUDE_OPUS:   'claude-opus-4-8',
  CLAUDE_HAIKU:  'claude-haiku-4-5-20251001',
} as const

// ─── 이미지 로더 ─────────────────────────────────────────────

export async function loadImageAsBase64(
  imagePath: string,
  width = 1200,
  format: 'jpeg' | 'png' = 'jpeg'
): Promise<string> {
  // Claude many-image 요청은 각 이미지의 모든 차원이 ≤2000px여야 함 (초과 시 400 invalid_request_error).
  // 권장 최대는 1568px(그 이상은 Claude가 자동 축소 → 토큰만 낭비)이므로 가로·세로 모두 1568로 cap.
  const cap = 1568
  const w = Math.min(width, cap)
  if (format === 'png') {
    return (await sharp(imagePath).resize(w, cap, { fit: 'inside' }).png().toBuffer()).toString('base64')
  }
  return (await sharp(imagePath).resize(w, cap, { fit: 'inside' }).jpeg({ quality: 90 }).toBuffer()).toString('base64')
}

export async function loadImagesAsBase64(
  imagePaths: string[],
  width = 1200,
  format: 'jpeg' | 'png' = 'jpeg'
): Promise<string[]> {
  return Promise.all(imagePaths.map((p) => loadImageAsBase64(p, width, format)))
}

// ─── Gemini 이미지 생성 헬퍼 ─────────────────────────────────

export interface GeminiImageResult {
  imageBuffer: Buffer
  mimeType: string
  width: number
  height: number
  sizeKb: number
}

export async function generateImageWithGemini(opts: {
  prompt: string
  model?: string
  referenceImages?: { data: string; mimeType: string }[]
  retryWithFallback?: boolean
}): Promise<GeminiImageResult | null> {
  const {
    prompt,
    model = MODELS.GEMINI_PRO_IMAGE,
    referenceImages = [],
    retryWithFallback = true,
  } = opts

  const contents: object[] = [{ text: prompt }]
  for (const ref of referenceImages) {
    contents.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } })
  }

  const tryGenerate = async (m: string): Promise<GeminiImageResult | null> => {
    const response = await geminiClient.models.generateContent({
      model: m,
      contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { imageSize: '4K' },
      },
    })

    const candidates = response.candidates
    if (!candidates || candidates.length === 0) return null

    const parts = candidates[0].content?.parts ?? []
    for (const part of parts) {
      if (part.inlineData?.data) {
        const buf = Buffer.from(part.inlineData.data, 'base64')
        const meta = await sharp(buf).metadata()
        return {
          imageBuffer: buf,
          mimeType: part.inlineData.mimeType ?? 'image/jpeg',
          width: meta.width ?? 0,
          height: meta.height ?? 0,
          sizeKb: Math.round(buf.length / 1024),
        }
      }
    }
    return null
  }

  try {
    return await tryGenerate(model)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[Gemini] ${model} 실패: ${msg.substring(0, 100)}`)
    if (retryWithFallback && model !== MODELS.GEMINI_FLASH_IMAGE_FALLBACK) {
      console.log(`[Gemini] Fallback 모델로 재시도: ${MODELS.GEMINI_FLASH_IMAGE_FALLBACK}`)
      return await tryGenerate(MODELS.GEMINI_FLASH_IMAGE_FALLBACK)
    }
    return null
  }
}

// ─── 파일 저장 헬퍼 ─────────────────────────────────────────

export function saveImage(buffer: Buffer, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buffer)
}

export function saveJson<T>(data: T, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
}

export function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

// ─── Claude JSON 파싱 헬퍼 ───────────────────────────────────

/** 응답 content에서 text 블록만 이어붙인다 — Sonnet 5는 복잡한 작업에서 thinking 블록을
 *  선두에 낼 수 있어 content[0] 고정 접근은 빈 문자열이 된다(JSON.parse가 "Unexpected end of JSON input"). */
export function extractText(content: ReadonlyArray<{ type: string }>): string {
  return content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text)
    .join('')
}

export function parseJsonResponse<T>(text: string): T {
  // 마크다운 코드 블록 제거
  const cleaned = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()
  return JSON.parse(cleaned) as T
}

// ─── 타이머 ─────────────────────────────────────────────────

export function timer(): () => number {
  const start = Date.now()
  return () => Date.now() - start
}

// ─── 출력 디렉토리 ───────────────────────────────────────────

export function getOutputDir(projectId: string): string {
  const base = process.env.VERCEL ? '/tmp/output' : path.join(process.cwd(), 'output')
  return path.join(base, projectId)
}

export function ensureOutputDirs(projectId: string): Record<string, string> {
  const base = getOutputDir(projectId)
  const dirs = {
    base,
    script: path.join(base, '1_script'),
    stylingShots: path.join(base, '2_styling_shots'),
    layers: path.join(base, '3_layers'),
    icons: path.join(base, 'icons'),
    final: path.join(base, '4_final'),
  }
  for (const dir of Object.values(dirs)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dirs
}

// ─── HTML 이스케이프 ─────────────────────────────────────────────

/** AI 생성 텍스트를 HTML에 삽입할 때 XSS 방지용 이스케이프 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── 금지어 후처리 필터 ──────────────────────────────────────────

/** 마케팅 버즈워드 치환 맵 (QA에서 반복 실패하는 단어들) */
const FORBIDDEN_WORD_REPLACEMENTS: [RegExp, string][] = [
  [/완벽한\s*(맛|식감|조화|사이즈|크기|밸런스|비율)/g, '뛰어난 $1'],
  [/완벽한\s*/g, '탁월한 '],
  [/완벽하게\s*/g, '정성껏 '],
  [/완벽히\s*/g, '섬세하게 '],
  [/최고의\s*/g, '특별한 '],
  [/최고급\s*/g, '프리미엄 '],
  [/업계\s*1위/g, '전문'],
  [/세계\s*최초/g, '독자적'],
  [/100%\s*(효과|보장)/g, '높은 만족도'],
  [/기적의\s*/g, '특별한 '],
  [/혁신적인\s*/g, '차별화된 '],
  [/압도적인\s*/g, '눈에 띄는 '],
]

/** 텍스트에서 금지어를 안전한 대체어로 치환 (결정론적) */
export function sanitizeForbiddenWords(text: string): string {
  let result = text
  for (const [pattern, replacement] of FORBIDDEN_WORD_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

/** RefinedCopy의 모든 텍스트 필드에 금지어 필터 적용 */
export function sanitizeRefinedCopy<T extends { sections: { headline: string; subheadline?: string; body?: string; items?: { label: string; value: string }[] }[] }>(copy: T): T {
  return {
    ...copy,
    sections: copy.sections.map(sec => ({
      ...sec,
      headline: sanitizeForbiddenWords(sec.headline),
      subheadline: sec.subheadline ? sanitizeForbiddenWords(sec.subheadline) : sec.subheadline,
      body: sec.body ? sanitizeForbiddenWords(sec.body) : sec.body,
      items: sec.items?.map(item => ({
        ...item,
        label: sanitizeForbiddenWords(item.label),
        value: sanitizeForbiddenWords(item.value),
      })),
    })),
  }
}
