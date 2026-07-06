/**
 * Agent 3-6: Script Writer
 * 기존 자산(builder.ts, categories, platforms, compatibility)을 활용하여
 * 카테고리×플랫폼 분화 스크립트 생성
 */

import { buildDifferentiatedSystemPrompt } from '../lib/ai/prompts/builder'
import { getCategoryPrompt } from '../lib/ai/prompts/categories'
import { getPlatformPrompt } from '../lib/ai/prompts/platforms'
import { anthropicClient, parseJsonResponse, saveJson, timer, MODELS, extractText } from './utils'
import type { ProjectBrief, Script, AgentResult, StyleGuide } from './types'
import * as fs from 'fs'

const EMOTION_INFO_RATIO: Record<string, { emotion: number; info: number }> = {
  food:         { emotion: 70, info: 30 },
  beauty:       { emotion: 60, info: 40 },
  living:       { emotion: 50, info: 50 },
  electronics:  { emotion: 30, info: 70 },
  'health-food':{ emotion: 20, info: 80 },
  fashion:      { emotion: 65, info: 35 },
  pet:          { emotion: 60, info: 40 },
}

function buildUserPrompt(
  brief: ProjectBrief,
  styleGuide?: StyleGuide,
  validationFeedback?: string[]
): string {
  const ratio = EMOTION_INFO_RATIO[brief.category] ?? { emotion: 50, info: 50 }
  const category = getCategoryPrompt(brief.category)
  const platform = getPlatformPrompt(brief.platform)

  const styleSection = styleGuide
    ? `
## Art Director 스타일 가이드 (반드시 반영)
무드 키워드: ${styleGuide.brand.moodKeywords.join(', ')}
타겟 감성: ${styleGuide.brand.targetEmotion}
디자인 노트: ${styleGuide.designNotes}
`
    : ''

  const feedbackSection =
    validationFeedback && validationFeedback.length > 0
      ? `
⚠️ 이전 스크립트에서 발견된 필수 수정 항목 (반드시 해결):
${validationFeedback.map((f) => `- ${f}`).join('\n')}
`
      : ''

  return `
제품명: ${brief.productName}
카테고리: ${category?.name ?? brief.category}
판매 플랫폼: ${platform?.name ?? brief.platform}
타겟 고객층: ${brief.targetAudience}
브랜드 컬러: ${brief.brandColors.join(', ') || '미지정 (AI 추천)'}
스타일 방향: ${brief.styleDirection}
톤앤매너 키워드: ${brief.toneKeywords.join(', ')}

제품 특장점:
${brief.keyHighlights.join('\n')}

필수 포함 사항 (스크립트 어딘가에 반드시 포함):
${brief.requiredContent.phrases.length > 0 ? brief.requiredContent.phrases.join('\n') : '없음'}
${brief.requiredContent.certifications.length > 0 ? '인증: ' + brief.requiredContent.certifications.join(', ') : ''}

금지사항:
${brief.restrictions.words.length > 0 ? '금지 표현: ' + brief.restrictions.words.join(', ') : '없음'}
${brief.restrictions.styles.length > 0 ? '금지 스타일: ' + brief.restrictions.styles.join(', ') : ''}

감성:정보 비율 = ${ratio.emotion}:${ratio.info}
- 감성적 스토리텔링 ${ratio.emotion}%, 객관적 정보 ${ratio.info}%로 구성하세요.
${styleSection}${feedbackSection}
섹션 수 (중요): 이상적으로 8~10개. 최대 10개를 절대 초과하지 말 것. 억지로 섹션을 늘리지 말 것 — 필요한 내용만 자연스럽게 구성하세요.
포함 필수 타입(7개): hero, brand_story, photo_gallery, process 또는 how_to_use, ingredients 또는 key_benefit, packaging 또는 delivery_info, cta
steps 타입을 사용할 경우 최대 4단계 이내로 구성할 것 — 단계가 많으면 가독성이 떨어짐.

photo_gallery 타입 형식:
{ "type": "photo_gallery", "title": "갤러리 제목", "subtitle": "서브 제목", "items": [] }

sensory 타입 형식 (제품 질감·감각 강조 풀블리드 섹션):
{ "type": "sensory", "title": "감각적 제목 (15자 이내)", "subtitle": "서브 제목", "body": "제품의 질감·향·촉감·맛을 2-3문장으로 감각적으로 묘사. 최소 40자 이상." }
권장 배치: texture_focus 또는 process 섹션 이후

FIELD REQUIREMENTS (중요):
- sectionType이 [brand_story, packaging, gift_suggestion, size_comparison, usage, sensory, cta]인 경우 "body" 필드 필수 (최소 30자).
- items 배열의 각 항목은 "label"(최소 4자)과 "value" 또는 "description"(최소 10자) 모두 포함.
- null 또는 빈 body를 출력하지 말 것 — 항상 설명적인 한국어 문장으로 채울 것.

위 정보를 바탕으로 ${platform?.name ?? brief.platform} 플랫폼에 최적화된 ${category?.name ?? brief.category} 카테고리 상세페이지 스크립트를 JSON으로 생성하세요.
JSON만 출력하세요 (마크다운 코드 블록 없이).
`
}

function buildScriptMarkdown(script: Script, brief: ProjectBrief): string {
  const lines: string[] = [
    `# 상세페이지 스크립트 — ${brief.productName}`,
    ``,
    `> 카테고리: ${brief.category} | 플랫폼: ${brief.platform} | 생성일: ${new Date().toLocaleDateString('ko-KR')}`,
    ``,
  ]

  for (const section of script.sections) {
    const s = section as any
    lines.push(`## [${section.type}] ${s.title ?? s.text ?? ''}`)
    if (s.subtitle) lines.push(`> ${s.subtitle}`)
    if (s.content) lines.push(``, s.content)
    if (s.body) lines.push(``, s.body)
    if (s.urgency) lines.push(``, `**긴급 메시지**: ${s.urgency}`)

    if (Array.isArray(s.items)) {
      lines.push(``)
      for (const item of s.items) {
        if (typeof item === 'string') {
          lines.push(`- ${item}`)
        } else if (item.title || item.name) {
          lines.push(`- **${item.title ?? item.name}** — ${item.description ?? ''}`)
        }
      }
    }

    if (Array.isArray(s.steps)) {
      lines.push(``)
      s.steps.forEach((step: string, i: number) => lines.push(`${i + 1}. ${step}`))
    }

    if (Array.isArray(s.scenarios)) {
      lines.push(``)
      for (const sc of s.scenarios) {
        lines.push(`- **${sc.situation}**: ${sc.description}`)
      }
    }

    if (s.image_description) lines.push(``, `📷 _${s.image_description}_`)
    lines.push(``)
  }

  if (script.shooting_requirements) {
    const sr = script.shooting_requirements as any
    lines.push(`---`, `## 촬영 가이드`)
    if (sr.nukki_shots) {
      lines.push(``, `### 누끼컷`)
      sr.nukki_shots.forEach((s: string) => lines.push(`- ${s}`))
    }
    if (sr.styling_shots) {
      lines.push(``, `### 스타일링샷`)
      sr.styling_shots.forEach((s: string) => lines.push(`- ${s}`))
    }
    if (sr.additional_notes) lines.push(``, `> ${sr.additional_notes}`)
  }

  return lines.join('\n')
}

export async function runScriptWriter(
  brief: ProjectBrief,
  outputDir: string,
  styleGuide?: StyleGuide,
  validationFeedback?: string[]
): Promise<AgentResult<Script>> {
  const elapsed = timer()
  console.log('[Script Writer] 시작')

  try {
    // 카테고리/플랫폼 미등록 시 fallback
    const categorySlug = getCategoryPrompt(brief.category) ? brief.category : 'food'
    const platformSlug = getPlatformPrompt(brief.platform) ? brief.platform : 'smartstore'

    const systemPrompt = buildDifferentiatedSystemPrompt(categorySlug, platformSlug, {
      includeDesignGuide: true,
    })

    // max_tokens 24576은 SDK 논스트리밍 10분 제한을 초과 추정 → 스트리밍 필수 (SDK가 create를 거부)
    const message = await anthropicClient.messages
      .stream({
        model: MODELS.CLAUDE_SONNET,
        max_tokens: 24576,   // 4096은 한글 다섹션 스크립트에 부족 → 응답 잘림 유발. Sonnet 5 토크나이저 +30% 반영 상향
        system: systemPrompt,
        messages: [{ role: 'user', content: buildUserPrompt(brief, styleGuide, validationFeedback) }],
      })
      .finalMessage()

    const text = extractText(message.content)
    if (message.stop_reason === 'max_tokens') {
      console.warn('[Script Writer] ⚠️ 응답이 max_tokens로 잘림 — JSON 불완전 가능, max_tokens 추가 상향 필요')
    }
    const script = parseJsonResponse<Script>(text)

    // JSON 저장
    saveJson(script, `${outputDir}/script.json`)

    // MD 파일 저장
    const md = buildScriptMarkdown(script, brief)
    fs.writeFileSync(`${outputDir}/script.md`, md, 'utf8')

    console.log(`[Script Writer] 완료 (${elapsed()}ms) — 섹션 ${script.sections.length}개`)

    return { success: true, data: script, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Script Writer] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
