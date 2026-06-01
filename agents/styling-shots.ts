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

// 항상 적용되는 비제품-특화 기본 보존 규칙
const BASE_PRESERVATION_RULES = [
  'DO NOT redraw, reimagine, or reinterpret the product in any way. Treat it as a fixed object placed into a new scene.',
  'STRICTLY FORBIDDEN: Do NOT show any ingredients, fillings, cross-sections, or internal components of the product as separate props or decorations. ONLY the finished, intact product exterior appears.',
  'DO NOT add logos, packaging, branding elements, or text of any kind.',
  'NO artificial light, NO studio flash. Natural window light only.',
  'Film grain: Kodak Portra 400, slightly grainy, warm color temperature.',
  'Natural imperfections welcome: crumbs on surface, slightly wrinkled linen, asymmetric placement.',
  'Must feel like a real food photographer shot — NOT a 3D render, NOT AI-generated look.',
  'Studio setting ONLY — NO cafes, NO kitchens, NO outdoor locations, NO restaurants.',
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

export function buildShotPrompt(shot: StylingShot, rules: string[]): string {
  return `${buildPreservationPrefix(rules)}
[Composition: ${shot.composition}]
${shot.surface}.
Props: ${shot.props.join(', ')}.
Lighting: ${shot.lighting}.
Camera: ${shot.camera}.
Mood: ${shot.mood}.
Studio background only — NO real location (no cafe, no kitchen, no outdoor).
FORBIDDEN words in rendering: "perfect", "clean", "symmetrical", "4K", "hyperrealistic".`
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
 * @returns 이미지 경로는 빈 배열 (운영자가 외부 모델로 직접 추출)
 */
export async function runStylingShots(
  stylingPrompts: StylingPromptsJson,
  nukkiPaths: string[],
  outputDir: string
): Promise<AgentResult<string[]>> {
  const elapsed = timer()
  console.log(`[Styling Shots] 프롬프트 출력 모드 — ${stylingPrompts.shots.length}개 (API 호출 없음)`)

  try {
    const shots: StylingFinalPrompt[] = stylingPrompts.shots.map((shot) => ({
      name: shot.name,
      filename: shot.filename,
      composition: shot.composition,
      finalPrompt: buildShotPrompt(shot, stylingPrompts.productPreservationRules),
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
