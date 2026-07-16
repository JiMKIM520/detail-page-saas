/**
 * Agent: Image Tagger — 배치 전 이미지 실물 검수.
 * 컴포저는 이미지를 보지 못한 채 파일명·의도 노트만으로 배치한다(블라인드 배치).
 * 생성 컷은 의도와 다르게 나올 수 있으므로(라벨 훼손·브랜드명 변조·엉뚱한 피사체),
 * 저렴한 비전 모델(Haiku)이 각 컷을 실제로 보고 ① 실물 설명 ② 용도 태그 ③ 방향
 * ④ 품질 판정(reject 사유 포함)을 생성한다. reject 컷은 풀에서 제외되고,
 * 설명·방향은 imageNotes로 컴포저에 전달되어 의도≠실물 배치를 막는다.
 */
import { anthropicClient, parseJsonResponse, timer, MODELS, extractText } from './utils'
import type { AgentResult } from './types'

export interface ImageTag {
  /** 실물에 실제로 보이는 것 한 줄 (라벨 판독 가능 여부 포함) */
  desc: string
  /** 적합 용도 태그 (예: hero, lifestyle, texture, ingredient, product-label, usage) */
  roles: string[]
  orientation: 'portrait' | 'landscape' | 'square'
  /** ok=사용 가능, degraded=차선(작게만 사용), reject=사용 금지 */
  quality: 'ok' | 'degraded' | 'reject'
  /** 결함 사유 (브랜드명 오기, 라벨 뭉개짐, 흰 밴드, 왜곡 등) */
  defects?: string
}

export interface TaggerInput {
  url: string
  /** 'cutout'=업로드 원본 누끼(품질 신뢰, 설명만), 'styling'=제품 포함 생성 컷(라벨 대조 검수),
   *  'asset'=제품 미포함 생성 컷(원료·소재·질감 — 라벨 대조 없음), 'section'=보조 이미지 */
  kind: 'cutout' | 'styling' | 'section' | 'asset'
  /** 아트 디렉터의 컷 의도 (실물과 대조용) */
  intendedNote?: string
}

const SYSTEM_PROMPT = `You are a meticulous photo editor QA-ing images for a Korean e-commerce detail page.
For EACH numbered image you receive, report what is ACTUALLY visible — not what was intended.

REFERENCE COMPARISON (CRITICAL):
The first image labeled [REFERENCE] is the client's ORIGINAL product photo — its label text is ground truth.
For every test image where the product label is visible, compare the brand name and label text
CHARACTER BY CHARACTER against the reference. AI-generated shots frequently alter letters
(e.g. MOMOS→NONOS, 500g→800g, garbled Korean). Any mismatch in brand name, product name,
or quantity = quality "reject". Do not assume text is correct because it looks plausible — READ it.

KIND-SPECIFIC RULES:
- kind "asset": the shot is INTENDED to contain no product/packaging (raw ingredients, texture,
  scene). Skip reference comparison. Reject ONLY for gross artifacts/distortion, any rendered text,
  or if a product package appears when it should not. Judge whether the subject matches the intent.
- kind "cutout": client original — describe only, do not reject.

Judging rules:
- desc: ONE short Korean sentence (max 80 chars) describing the actual content. If a product label
  is visible, state whether its text matches the reference or how it deviates. Be terse — no prose.
- roles: which page roles this image actually fits (choose from: hero, lifestyle, mood, texture,
  ingredient, product-label, usage, detail, gallery). Base this on what you SEE.
- orientation: portrait / landscape / square by visual aspect.
- quality — judge as a SHOPPER at page scale, not a forensic zoom (컷은 대부분 축소되어 배치된다):
  - "reject" ONLY for defects a shopper would notice: brand name misspelled/altered (e.g. MOMOS→NONOS),
    wrong quantity on packaging, large empty bands, gross distortion, garbled text that is LARGE and
    prominent in frame, or the product rendered UPSIDE-DOWN / label text flipped or mirrored
    (제품이 뒤집혀 라벨이 거꾸로 보이는 컷 — 배경·무드용으로도 쓰지 않는다).
  - "degraded" for label text that is merely soft/small/angled, minor artifacts — these images are
    still valuable as lifestyle/mood/background scenes. Do NOT reject them.
  - "ok" otherwise. Bias: when torn between reject and degraded, choose degraded.
- defects: short Korean note of the specific defect when quality is not "ok".
- If an intended note is provided and the actual content does NOT match it, say so in desc
  (e.g. "의도는 크림 텍스처였으나 실제로는 패키지 라벨 확대").

Output raw JSON array only, one object per image in the same order:
[{"index":0,"desc":"...","roles":["hero"],"orientation":"portrait","quality":"ok","defects":""}]`

export interface PairingInput {
  /** 검사할 (섹션 카피, 이미지) 쌍 */
  pairs: Array<{ id: string; url: string; sectionCopy: string }>
}

const PAIRING_SYSTEM = `You are QA-ing a composed Korean e-commerce detail page.
You receive numbered images, then a list of (pair id → image number + section copy) assignments.
For EACH pair, judge: does this image MEANINGFULLY support this copy for a shopper?

- fit=false when the image is unrelated to the copy's subject (e.g. copy about skin absorption
  next to a close-up of the package label; a step "물과 함께 섭취" next to a shelf mood shot).
- A product/package shot fits copy about the product itself, packaging, or brand — but NOT copy
  about efficacy, texture, ingredients, or usage steps it does not depict.
- When unsure, fit=true (do not over-remove).
Output raw JSON array only: [{"id":"...","fit":true,"reason":"..."}] — reason in Korean, max 40 chars.`

/** 조립 후 페어링 QA — 배치된 (카피, 이미지) 쌍을 실제로 보고 부적합 쌍을 알려준다.
 *  실패 시 success:false — 호출부는 쌍 제거 없이 진행(무중단). */
export async function runPairingQA(
  input: PairingInput,
): Promise<AgentResult<Record<string, { fit: boolean; reason?: string }>>> {
  const elapsed = timer()
  if (input.pairs.length === 0) return { success: true, data: {}, durationMs: 0 }
  const urls = [...new Set(input.pairs.map((p) => p.url))]
  console.log(`[Pairing QA] 시작 — 쌍 ${input.pairs.length}개 (이미지 ${urls.length}장)`)
  try {
    const content: Array<Record<string, unknown>> = []
    urls.forEach((u, i) => {
      content.push({ type: 'text', text: `[image ${i}]` })
      content.push({ type: 'image', source: { type: 'url', url: u } })
    })
    const pairLines = input.pairs
      .map((p) => `- id "${p.id}": image ${urls.indexOf(p.url)} ← 카피: "${p.sectionCopy.slice(0, 140)}"`)
      .join('\n')
    content.push({ type: 'text', text: `배치된 쌍 목록:\n${pairLines}\n\n각 쌍을 판정해 JSON 배열만 출력하세요.` })

    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 6000,
      system: PAIRING_SYSTEM,
      messages: [{ role: 'user', content: content as never }],
    })
    const rows = parseJsonResponse<Array<{ id?: string; fit?: boolean; reason?: string }>>(extractText(message.content))
    const out: Record<string, { fit: boolean; reason?: string }> = {}
    for (const r of rows) {
      if (typeof r.id === 'string') out[r.id] = { fit: r.fit !== false, reason: r.reason ? String(r.reason).slice(0, 80) : undefined }
    }
    const unfit = Object.values(out).filter((v) => !v.fit).length
    console.log(`[Pairing QA] 완료 (${elapsed()}ms) — 부적합 ${unfit}/${input.pairs.length}쌍`)
    return { success: true, data: out, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Pairing QA] 실패(쌍 제거 없이 진행):', msg.slice(0, 140))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}

const VISUAL_AUDIT_SYSTEM = `You are a rendering QA inspector for Korean e-commerce detail pages.
You receive one full page as vertical screenshot segments (top→bottom, numbered).
Detect ONLY rendering defects:
1. Overlapping text — two text layers colliding, or caption text floating over an unrelated section
2. Collapsed sections or huge unintended empty gaps
3. Sentences visibly cut off mid-word
4. Broken image icons / grossly distorted layout
5. Product image in the hero (topmost) section visibly cropped at the frame edges
Do NOT comment on content, copy quality, taste, or design preferences. When unsure, pass.
Output raw compact JSON only: {"pass":true,"issues":[]} or {"pass":false,"issues":["세그먼트 2: ..."]}`

/** 렌더 시각 감사 — 조립·가드가 못 보는 "실제 렌더 결함"(겹침·붕괴)을 스크린샷으로 검출.
 *  chromium이 있는 환경(로컬 러너/QA)에서 호출. 실패 시 success:false(감사 생략). */
export async function runVisualAudit(
  pngBase64Segments: string[],
): Promise<AgentResult<{ pass: boolean; issues: string[] }>> {
  const elapsed = timer()
  if (pngBase64Segments.length === 0) return { success: true, data: { pass: true, issues: [] }, durationMs: 0 }
  console.log(`[Visual Audit] 시작 — 세그먼트 ${pngBase64Segments.length}장`)
  try {
    const content: Array<Record<string, unknown>> = []
    pngBase64Segments.slice(0, 8).forEach((data, i) => {
      content.push({ type: 'text', text: `[세그먼트 ${i}]` })
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/png', data } })
    })
    content.push({ type: 'text', text: '렌더 결함만 검출해 JSON만 출력하세요.' })
    // 산문 응답으로 JSON 파싱이 깨져 감사가 통째로 생략된 실사례(로모노소프) — 1회 재시도
    let raw: { pass?: boolean; issues?: unknown[] } | null = null
    for (let attempt = 0; attempt < 2 && !raw; attempt++) {
      const message = await anthropicClient.messages.create({
        model: MODELS.CLAUDE_SONNET,
        max_tokens: 3000,
        system: VISUAL_AUDIT_SYSTEM,
        messages: [{ role: 'user', content: content as never }],
      })
      try {
        raw = parseJsonResponse<{ pass?: boolean; issues?: unknown[] }>(extractText(message.content))
      } catch (parseErr) {
        if (attempt === 1) throw parseErr
        console.warn('[Visual Audit] 응답 파싱 실패 — 재시도 1회')
      }
    }
    if (!raw) throw new Error('visual audit 응답 없음')
    const verdict = {
      pass: raw.pass !== false,
      issues: Array.isArray(raw.issues) ? raw.issues.map(String).slice(0, 8) : [],
    }
    console.log(
      `[Visual Audit] 완료 (${elapsed()}ms) — ${verdict.pass ? '통과' : `결함 ${verdict.issues.length}건: ${verdict.issues.join(' / ').slice(0, 200)}`}`,
    )
    return { success: true, data: verdict, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Visual Audit] 실패(감사 생략):', msg.slice(0, 140))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}

/** 이미지 URL들을 한 번의 비전 호출로 검수한다. referenceUrl은 라벨 대조용 원본 누끼.
 *  실패 시 success:false — 호출부는 파일명 폴백. (Haiku는 라벨 변조를 놓쳐 Sonnet 사용) */
export async function runImageTagger(
  inputs: TaggerInput[],
  referenceUrl?: string,
): Promise<AgentResult<Record<string, ImageTag>>> {
  const elapsed = timer()
  if (inputs.length === 0) return { success: true, data: {}, durationMs: 0 }
  console.log(`[Image Tagger] 시작 — ${inputs.length}장 검수${referenceUrl ? ' (원본 라벨 대조)' : ''}`)

  try {
    const content: Array<Record<string, unknown>> = []
    if (referenceUrl) {
      content.push({ type: 'text', text: '[REFERENCE] 고객 제공 원본 — 라벨 텍스트의 정답 기준' })
      content.push({ type: 'image', source: { type: 'url', url: referenceUrl } })
    }
    inputs.forEach((img, i) => {
      content.push({
        type: 'text',
        text: `[image ${i}] kind: ${img.kind}${img.intendedNote ? ` / 의도: ${img.intendedNote}` : ''}`,
      })
      content.push({ type: 'image', source: { type: 'url', url: img.url } })
    })
    content.push({ type: 'text', text: `위 ${inputs.length}장을 순서대로 검수해 JSON 배열만 출력하세요.` })

    const callOnce = async (repairNote?: string): Promise<Array<Partial<ImageTag> & { index?: number }>> => {
      const message = await anthropicClient.messages.create({
        model: MODELS.CLAUDE_SONNET,
        max_tokens: 10000, // 10장+ 검수 시 4096은 잘림(Unterminated JSON 실사례) — S5 토크나이저 여유 포함
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: (repairNote
              ? [...content, { type: 'text', text: `⚠️ 직전 출력이 JSON 파싱 실패: ${repairNote} — 문자열 안에 개행 없이 한 줄 JSON으로 다시.` }]
              : content) as never,
          },
        ],
      })
      if (message.stop_reason === 'max_tokens')
        console.warn('[Image Tagger] ⚠ 출력이 max_tokens로 잘림 — 검수 장수를 줄이거나 한도 상향 필요')
      return parseJsonResponse<Array<Partial<ImageTag> & { index?: number }>>(extractText(message.content))
    }
    let rows: Array<Partial<ImageTag> & { index?: number }>
    try {
      rows = await callOnce()
    } catch (parseErr: unknown) {
      // 문자열 내 개행 등 형식 문제 — 1회 재시도 (실패 시 상위에서 파일명 폴백)
      rows = await callOnce((parseErr as Error).message?.slice(0, 120))
    }

    const out: Record<string, ImageTag> = {}
    rows.forEach((row, i) => {
      const idx = typeof row.index === 'number' ? row.index : i
      const input = inputs[idx]
      if (!input) return
      out[input.url] = {
        desc: String(row.desc ?? '').slice(0, 200) || '설명 없음',
        roles: Array.isArray(row.roles) ? row.roles.map(String).slice(0, 5) : [],
        orientation: row.orientation === 'landscape' || row.orientation === 'square' ? row.orientation : 'portrait',
        // 업로드 원본(누끼)은 고객 제공물 — 비전 오판으로 제외되지 않게 reject를 degraded로 완화
        quality:
          row.quality === 'reject'
            ? input.kind === 'cutout'
              ? 'degraded'
              : 'reject'
            : row.quality === 'degraded'
              ? 'degraded'
              : 'ok',
        defects: row.defects ? String(row.defects).slice(0, 120) : undefined,
      }
    })
    const rejected = Object.values(out).filter((t) => t.quality === 'reject').length
    console.log(`[Image Tagger] 완료 (${elapsed()}ms) — ${Object.keys(out).length}장 태깅, reject ${rejected}장`)
    return { success: true, data: out, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Image Tagger] 실패(파일명 폴백):', msg.slice(0, 160))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
