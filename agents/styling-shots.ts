/**
 * Agent 3-2: Styling Shots (프롬프트 출력 전용)
 *
 * v6 변경 (2026-05 클라이언트 회의 결정):
 * - Gemini API 자동 호출 폐기 — 비용 절감 + 디자이너 워크플로 정합
 * - 운영자가 직접 Gemini/GPT 웹 UI에서 이미지를 추출하도록 "완성 프롬프트"만 출력
 * - 출력: styling-final-prompts.json (운영자 admin 화면에서 복사용)
 * - 누끼컷 경로도 함께 기록 (운영자가 외부 모델에 첨부할 reference)
 *
 * 이미지 경로는 빈 배열 반환 — 실제 이미지는 운영자가 추출 후 업로드 (photography 단계).
 */

import { timer } from './utils'
import type { StylingPromptsJson, StylingShot, AgentResult } from './types'
import * as fs from 'fs'
import * as path from 'path'

/**
 * buildShotPrompt에 전달하는 프로젝트 메타.
 * 모두 optional — 미전달 시 해당 강화 요소만 생략.
 */
export interface ShotMeta {
  /** 카테고리 슬러그. 예: "food", "beauty" */
  category?: string
  /** 플랫폼 슬러그. 예: "smartstore", "coupang" */
  platform?: string
  /** style-guide의 primary brand color HEX. 예: "#C8A96E" */
  brandColorHex?: string
  /** 출력 비율. 기본값: "3:4" */
  aspectRatio?: string
}

// 항상 적용되는 비제품-특화 기본 보존 규칙
const BASE_PRESERVATION_RULES = [
  'DO NOT redraw, reimagine, or reinterpret the product in any way. Treat it as a fixed object placed into a new scene.',
  'STRICTLY FORBIDDEN: Do NOT show any ingredients, fillings, cross-sections, or internal components of the product as separate props or decorations. ONLY the finished, intact product exterior appears.',
  'DO NOT add logos, packaging, branding elements, or text of any kind.',
  'NO artificial light, NO studio flash. Natural window light only.',
  'Film grain: Kodak Portra 400, slightly grainy, warm color temperature.',
  'Natural imperfections welcome: crumbs on surface, slightly wrinkled linen, asymmetric placement.',
  'Must feel like a real photographer shot — NOT a 3D render, NOT AI-generated look.',
  // 세팅은 컷의 composition에 따름: 제품 단독(클린 표면) 또는 자연스러운 라이프스타일 장면(아늑한 가정/테이블/연출).
  // 어떤 경우든 PRODUCT 자체는 레퍼런스 그대로(형태·색·로고·텍스트 보존), 주변 장면만 달라진다.
  'Setting follows the composition: either the product alone on a clean surface, OR a natural real-feeling lifestyle scene that fits the product (cozy home, table, soft daylight). The PRODUCT must stay EXACTLY as in the reference image; only the surrounding scene/props vary.',
]

// 제품 보존 규칙 빌더
// Art Director 규칙(제품 특화) + BASE_RULES(항상 적용) 항상 병합
function buildPreservationPrefix(rules: string[]): string {
  // Art Director 규칙을 먼저, BASE_RULES를 뒤에 추가 (항상 둘 다 적용)
  const allRules = rules.length > 0
    ? [...rules, ...BASE_PRESERVATION_RULES]
    : BASE_PRESERVATION_RULES
  return '[ABSOLUTE RULES]\n' + allRules.join('\n') + '\n\n'
}

// 카테고리별 역할 선언 (영문 — 이미지 모델용)
const CATEGORY_ROLE: Record<string, string> = {
  food: 'professional Korean e-commerce food photographer',
  'health-food': 'professional Korean e-commerce health supplement photographer',
  beauty: 'professional Korean e-commerce beauty product photographer',
  fashion: 'professional Korean e-commerce fashion photographer',
  living: 'professional Korean e-commerce lifestyle photographer',
  electronics: 'professional Korean e-commerce electronics photographer',
  pet: 'professional Korean e-commerce pet product photographer',
}

/** 히어로 프레이밍 규칙 본문 — 제품 전신 노출 강제 (룰 7-11)
 *
 *  2026-07-21 완화: 이전 규칙은 "풀블리드 배너에 깔려 상하 20%가 잘린다"를 전제로
 *  중앙 60% 배치 + 사방 10% 안전 여백을 요구했는데, 실제 레이아웃은 260×280px 박스에
 *  사진을 통째로 넣는 경우가 많았다. 잘리지 않으니 여백까지 전부 박스 안에 들어가
 *  제품이 작게 보였다("억지로 집어넣은 느낌"의 직접 원인).
 *  전제를 없애고 화면을 채우는 연출로 바꾼다 — 잘림 방지(I1)는 유지한다. */
export function heroFramingRules(): string {
  return `HERO FRAMING RULES (MANDATORY — PRODUCT INTEGRITY IS THE TOP PRIORITY):
The ENTIRE product package must be fully visible with GENEROUS clear space on ALL FOUR sides.
ABSOLUTE RULE: no part of the package (top cap, bottom seal, side seams, printed text) may touch,
overlap, or cross any frame edge. Keep at least 12% empty margin between every product edge and the
frame boundary. Any cropping, clipping, or bleeding of the package is STRICTLY FORBIDDEN and is a failure.
The package is the primary subject and should read clearly and be reasonably large and centered —
but being FULLY CONTAINED always wins over being big. If enlarging the product would clip any edge,
make the product SMALLER so the whole package stays inside the safe margin.
People, pets, hands, and props are secondary: they may point to or sit beside the product but must
NEVER cover, hold over the edge, or push the package out of frame.
Place the whole package within the CENTER 70% of the frame in BOTH width and height, upright and unobstructed.`
}

/** name·filename에 hero가 있으면 히어로 샷 */
export function isHeroShot(shot: { name?: string; filename?: string }): boolean {
  return /hero/i.test(shot.name ?? '') || /hero/i.test(shot.filename ?? '')
}

/**
 * 히어로 샷 프롬프트에 프레이밍 규칙을 보장한다(멱등).
 * shot-prompter가 만든 finalPrompt는 buildShotPrompt를 우회하므로(2026-07-20 감사에서
 * 히어로 규칙이 실경로에 한 번도 적용되지 않은 것을 확인) 생성 직전 모든 경로에서 호출한다.
 */
export function ensureHeroFraming(prompt: string, shot: { name?: string; filename?: string }): string {
  if (!isHeroShot(shot)) return prompt
  if (/HERO FRAMING RULES/.test(prompt)) return prompt
  const rules = heroFramingRules()
  // [OUTPUT SPECS] 블록이 있으면 그 직후에, 없으면 말미에 삽입
  const idx = prompt.indexOf('[OUTPUT SPECS]')
  if (idx === -1) return `${prompt}\n\n${rules}`
  const lineEnd = prompt.indexOf('\n', idx)
  const at = lineEnd === -1 ? prompt.length : lineEnd
  return `${prompt.slice(0, at)}\n${rules}${prompt.slice(at)}`
}

export function buildShotPrompt(shot: StylingShot, rules: string[], meta?: ShotMeta): string {
  const role = (meta?.category ? CATEGORY_ROLE[meta.category] : undefined)
    ?? 'professional Korean e-commerce product photographer'
  const aspectRatio = meta?.aspectRatio ?? '3:4'

  // P1: 브랜드 컬러 힌트 (선택적 — HEX 있을 때만)
  const brandColorLine = meta?.brandColorHex
    ? `Brand color reference (use as tonal accent, not forced): ${meta.brandColorHex}.`
    : ''

  // P2: 색온도
  const colorTempLine = 'Color temperature: 3200–4500K warm natural light.'

  // 상세페이지 히어로는 object-fit:cover로 상하가 잘리므로 별도 프레이밍 규칙 적용
  const heroFramingBlock = isHeroShot(shot) ? heroFramingRules() : ''

  // 히어로는 30% 네거티브 스페이스를 요구하지 않는다 — heroFramingRules가 "프레임을 채우라"고
  // 지시하는데 같은 프롬프트에 "가장자리 30%를 비우라"가 함께 들어가면 정면 충돌한다.
  // 두 제약이 겹쳐 제품이 작고 여백만 넓은 사진이 나온 실측(2026-07-21) 반영.
  const negativeSpaceLine = isHeroShot(shot)
    ? ''
    : 'Leave 30% of top OR bottom edge as clean negative space for text overlay.'

  const positiveBody = `${buildPreservationPrefix(rules)}
[ROLE] You are a ${role}.

[OUTPUT SPECS]
Output aspect ratio: ${aspectRatio} (portrait), do not crop subject.
${negativeSpaceLine}
${heroFramingBlock}
${brandColorLine}

[Composition: ${shot.composition}]
Rule of thirds: place subject at one of the four intersection points.
Props: maximum 3 items (odd number), each no larger than 1/3 of product size, brand-relevant.
Actual props used: ${shot.props.join(', ')}.

[Scene]
${shot.surface}.
Lighting: ${shot.lighting}.
${colorTempLine}
Camera: ${shot.camera}.
Mood: ${shot.mood}.
Use the setting described in [Scene] above — a clean studio surface or a natural lifestyle scene as fits this shot. Keep the product identical to the reference.`

  const negativeBlock = `
[NEGATIVE]
text overlay, watermark, fake logo, altered packaging, distorted product, 3D render, CGI, hyperrealistic plastic look, overexposed, deep-fried colors, staged symmetry, extra limbs, duplicate product, mangled text on package.`

  return positiveBody + negativeBlock
}

/** 운영자 admin 화면에서 읽는 프롬프트 출력 구조. */
export interface StylingFinalPrompt {
  name: string
  filename: string
  composition: string
  /** Gemini/GPT 웹 UI에 그대로 붙여넣는 완성 프롬프트. */
  finalPrompt: string
}

export interface StylingPromptsOutput {
  /** 운영자가 외부 모델에 첨부할 누끼컷 경로. */
  nukkiReferenceImages: string[]
  /** 운영자 가이드 (한국어). */
  operatorGuide: string
  shots: StylingFinalPrompt[]
  generatedAt: string
}

/**
 * 스타일링샷 프롬프트 출력 — Gemini 호출 없음.
 * Art Director가 만든 shot 메타데이터 → 완성 프롬프트로 조립 → JSON 저장.
 *
 * @param nukkiPaths 운영자가 외부 모델에 첨부할 누끼컷 (이미지 생성 안 하지만 가이드로 기록)
 * @param meta 프로젝트 메타 — 비율·여백·역할 강화에 사용 (optional)
 * @returns 이미지 경로는 빈 배열 (운영자가 외부 모델로 직접 추출)
 */
export async function runStylingShots(
  stylingPrompts: StylingPromptsJson,
  nukkiPaths: string[],
  outputDir: string,
  meta?: ShotMeta
): Promise<AgentResult<string[]>> {
  const elapsed = timer()
  console.log(`[Styling Shots] 프롬프트 출력 모드 — ${stylingPrompts.shots.length}개 (API 호출 없음)`)

  try {
    const shots: StylingFinalPrompt[] = stylingPrompts.shots.map((shot) => ({
      name: shot.name,
      filename: shot.filename,
      composition: shot.composition,
      finalPrompt: buildShotPrompt(shot, stylingPrompts.productPreservationRules, meta),
    }))

    const output: StylingPromptsOutput = {
      nukkiReferenceImages: nukkiPaths,
      operatorGuide:
        '아래 각 프롬프트를 Gemini(Pro Image) 또는 GPT(Image)에 입력하고, nukkiReferenceImages의 누끼컷을 첨부하세요. ' +
        '생성된 이미지를 검수 후 photography 단계에서 업로드합니다.',
      shots,
      generatedAt: new Date().toISOString(),
    }

    fs.mkdirSync(outputDir, { recursive: true })
    const outPath = path.join(outputDir, 'styling-final-prompts.json')
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8')

    console.log(`[Styling Shots] 완료 (${elapsed()}ms) — ${shots.length}개 프롬프트 저장: ${outPath}`)

    // 이미지 경로는 빈 배열 — 실제 추출은 운영자가 외부 모델로 진행
    return { success: true, data: [], durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Styling Shots] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
