/**
 * Agent: Scene Designer — 씬 자유 설계 (design-system.md Phase 3, 2026-07-29)
 * 청사진의 씬(스크롤 단위) 콘텐츠를 기성 블록 조합이 아니라 콘텐츠 맞춤 HTML/CSS로
 * 직접 설계한다. 스타일 언어 9종(style-languages.ts) 바이블이 페이지 전체 일관성을,
 * 씬별 시각 감사 + 블록 경로 폴백(blocks-pipeline)이 품질 하한을 담보한다.
 * 실증: 9종 × 7제품 전체 페이지 프로토(2026-07-28, scripts/proto-full-page.ts).
 */
import { anthropicClient, extractText, timer, MODELS } from './utils'
import type { AgentResult } from './types'
import type { PageBlueprint } from './page-planner'
import type { Tokens } from './templates/blocks/types'
import { getStyleLanguage } from './templates/blocks/style-languages'
import { variantTone } from './templates/blocks/variant-meta'
import { buildFontLinks } from './templates/blocks/shared'

export interface SceneDesignInput {
  /** 씬 네임스페이스 (예: 'sc3') — 모든 셀렉터 접두사 */
  ns: string
  sceneNo: number
  totalScenes: number
  /** 이 씬의 톤 (플래너 씬 톤 설계) */
  tone: 'light' | 'dark'
  prevTone?: 'light' | 'dark'
  /** 승인된 콘텐츠 요지들 (청사진 copyBrief) */
  briefs: string[]
  /** 이 씬 전용 이미지 URL (반복 금지) */
  images: string[]
  /** 제품명·브랜드 무드 */
  productName: string
  moodKeywords: string[]
  /** 스타일 언어 id (§2.4) */
  styleLanguageId: string
}

const SYSTEM_BASE = `You are a senior Korean e-commerce art director DESIGNING one scene (scroll unit)
of a long vertical detail page from scratch. Not a template — a bespoke composition for THIS content.

HARD CONSTRAINTS:
- Output exactly ONE <style> tag + ONE <section class="{NS}"> — nothing else, no markdown fences.
- Every selector MUST be prefixed .{NS} (scene namespace isolation).
- Width 872px fixed. Scene height 1600~2400px (this is scene {N} of {TOTAL} in one page).
- Colors/fonts ONLY via: var(--bg) var(--paper) var(--ink) var(--ink-2) var(--brand) var(--accent)
  var(--font-display) var(--font-body) var(--font-serif). Tints via color-mix() allowed.
- Use the provided images meaningfully (object-fit ok, creative crop/mask ok, no distortion,
  never repeat one image twice). If an image does not fit the copy, omit it rather than force it.
- Copy: refine the provided copyBrief into final Korean copy — NEVER invent facts, numbers,
  certifications not present in the briefs. Emphasis via color/weight, not emoji. No banned
  cliché adjectives (완벽한·최고의·혁신적인·압도적인).
- OVERLAP SAFETY (CRITICAL): text must NEVER collide with other text. Any text over an image
  needs a guaranteed-contrast zone (scrim/panel/solid area). Check your layout mentally at 872px.
- TONE: this scene must be {TONE} (page rhythm alternates; previous scene was {PREV_TONE}).
- Flow: the scene must read top→bottom naturally; no dead empty bands over 200px.
- No external assets beyond the given image URLs, no webfont imports, no JS.`

/** 출력 형식 결정적 검증 — LLM 재량이 아닌 기계 게이트(§6). 위반 시 재시도 근거. */
export function validateSceneHtml(html: string, ns: string): string[] {
  const issues: string[] = []
  const styleCount = (html.match(/<style/g) ?? []).length
  const sectionCount = (html.match(/<section/g) ?? []).length
  if (styleCount !== 1) issues.push(`<style> ${styleCount}개 (1개 필요)`)
  if (sectionCount !== 1) issues.push(`<section> ${sectionCount}개 (1개 필요)`)
  if (!html.includes(`class="${ns}`)) issues.push(`네임스페이스 .${ns} 미사용`)
  if (/<script/i.test(html)) issues.push('script 태그 금지')
  if (/@import|fonts\.googleapis/i.test(html)) issues.push('외부 폰트 임포트 금지')
  // 네임스페이스 밖 전역 셀렉터 검출(body·:root·* 직접 스타일링)
  if (new RegExp(`<style[^>]*>[^<]*?(^|\\})\\s*(body|:root|\\*)\\s*\\{`, 's').test(html)) issues.push('전역 셀렉터 금지')
  return issues
}

export interface SceneDesignPageInput {
  productName: string
  moodKeywords: string[]
  styleLanguageId: string
  /** 조립 시점 청사진 — sections[].imageUrls는 bridge가 니즈→실URL 매핑을 마친 상태 */
  blueprint: PageBlueprint
  /** deriveTokens 산출 — 블록 경로와 동일한 색·폰트 체계 보장 */
  tokens: Tokens
  width?: number
}

/** 페이지 전체 씬 자유 설계 — 씬 순차 생성(전 씬 성공 시에만 성공).
 *  실패 시 호출부(blocks-pipeline)가 블록 경로로 폴백한다. 시각 감사·반려 루프는
 *  pipeline-bridge의 기존 게이트가 페이지 레벨로 커버(반려 재조립은 자동으로 블록 경로). */
export async function runSceneDesignPage(
  input: SceneDesignPageInput,
): Promise<AgentResult<{ html: string; sceneCount: number }>> {
  const elapsed = timer()
  const width = input.width ?? 872

  // 씬 그룹핑 — 청사진의 scene 번호 기준, 톤은 씬 첫 블록의 variantTone(플래너 톤 설계 반영)
  const groups = new Map<number, { briefs: string[]; images: string[]; tone: 'light' | 'dark' }>()
  for (const s of input.blueprint.sections) {
    const n = s.scene ?? 1
    const g = groups.get(n) ?? { briefs: [], images: [], tone: variantTone(s.variantId) }
    g.briefs.push(s.copyBrief)
    for (const u of s.imageUrls ?? []) if (u && !g.images.includes(u)) g.images.push(u)
    groups.set(n, g)
  }
  const sceneNos = [...groups.keys()].sort((a, b) => a - b)
  if (sceneNos.length < 3) return { success: false, error: `씬 수 부족(${sceneNos.length}) — 청사진 씬 구조 필요`, durationMs: elapsed() }

  const parts: string[] = []
  let prevTone: 'light' | 'dark' | undefined
  for (const n of sceneNos) {
    const g = groups.get(n)!
    console.log(`[Scene Designer] 씬 ${n}/${sceneNos.length} (${g.tone}) 설계…`)
    const r = await runSceneDesigner({
      ns: `sc${n}`,
      sceneNo: n,
      totalScenes: sceneNos.length,
      tone: g.tone,
      prevTone,
      briefs: g.briefs,
      images: g.images,
      productName: input.productName,
      moodKeywords: input.moodKeywords,
      styleLanguageId: input.styleLanguageId,
    })
    if (!r.success || !r.data) {
      return { success: false, error: `씬 ${n} 설계 실패: ${r.error}`, durationMs: elapsed() }
    }
    parts.push(r.data.html)
    prevTone = g.tone
  }

  const t = input.tokens
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${width}">
<title>${input.productName}</title>
${buildFontLinks(t)}
<style>
:root{--bg:${t.bg};--paper:${t.paper};--ink:${t.ink};--ink-2:${t.ink2};--brand:${t.brand};--accent:${t.accent};--font-display:${t.fontDisplay};--font-body:${t.fontBody};--font-serif:${t.fontSerif}}
body{margin:0;width:${width}px;font-family:var(--font-body);background:var(--bg)}
img{max-width:100%}
</style>
</head>
<body>
<div class="dpg">
${parts.join('\n')}
</div>
</body>
</html>`
  console.log(`[Scene Designer] 페이지 완성 — 씬 ${parts.length}개 (${elapsed()}ms)`)
  return { success: true, data: { html, sceneCount: parts.length }, durationMs: elapsed() }
}

export async function runSceneDesigner(
  input: SceneDesignInput,
  _retried = false,
): Promise<AgentResult<{ html: string }>> {
  const elapsed = timer()
  const lang = getStyleLanguage(input.styleLanguageId)
  if (!lang) return { success: false, error: `알 수 없는 스타일 언어: ${input.styleLanguageId}`, durationMs: 0 }

  const system =
    SYSTEM_BASE.replaceAll('{NS}', input.ns)
      .replace('{N}', String(input.sceneNo))
      .replace('{TOTAL}', String(input.totalScenes))
      .replace('{TONE}', input.tone)
      .replace('{PREV_TONE}', input.prevTone ?? '(first scene)') +
    '\n\n' + lang.bible

  const user = `제품: ${input.productName} (브랜드 무드: ${input.moodKeywords.join(', ')})
SCENE ${input.sceneNo}/${input.totalScenes} 콘텐츠(각 항목은 이 씬이 다뤄야 할 승인된 내용 요지):
${input.briefs.map((b, i) => `${i + 1}. ${b}`).join('\n')}

사용 가능 이미지(이 씬 전용, 반복 금지):
${input.images.slice(0, 5).map((u, i) => `[img${i}] ${u}`).join('\n') || '(없음 — 타이포·그래픽 중심으로 설계)'}

Output the final <style> + <section class="${input.ns}"> now.`

  try {
    const msg = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_OPUS,
      max_tokens: 9000,
      system,
      messages: [{ role: 'user', content: user }],
    })
    if (msg.stop_reason === 'max_tokens') throw new Error('출력 잘림(max_tokens)')
    const html = extractText(msg.content).replace(/^```html?\n?|```$/g, '').trim()
    const issues = validateSceneHtml(html, input.ns)
    if (issues.length) {
      if (!_retried) {
        console.warn(`[Scene Designer] 씬 ${input.sceneNo} 형식 위반 재시도 — ${issues.join(' | ')}`)
        return runSceneDesigner(input, true)
      }
      return { success: false, error: `형식 위반: ${issues.join(' | ')}`, durationMs: elapsed() }
    }
    return { success: true, data: { html }, durationMs: elapsed() }
  } catch (err) {
    const msg2 = err instanceof Error ? err.message : String(err)
    if (!_retried && /timed out|timeout|overloaded|529|503|Connection/i.test(msg2)) {
      await new Promise((r) => setTimeout(r, 5000))
      return runSceneDesigner(input, true)
    }
    return { success: false, error: msg2, durationMs: elapsed() }
  }
}
