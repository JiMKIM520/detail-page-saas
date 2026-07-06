/**
 * Agent 5: Validator (디자인 통일성 검증)
 * style-guide.json 기준으로 모든 산출물의 통일성 검증
 */

import { anthropicClient, parseJsonResponse, saveJson, timer, MODELS, extractText } from './utils'
import type { StyleGuide, RefinedCopy, ValidationReport, AgentResult, ProjectBrief } from './types'
import * as fs from 'fs'
import * as path from 'path'

const SYSTEM_PROMPT = `You are a design quality validator for Korean e-commerce detail pages.
Validate whether all generated assets follow the style guide contract.

FONT EQUIVALENCE RULES (CRITICAL — never flag these as violations):
- "Pretendard" = "Pretendard Variable" = "Pretendard Variable Woff2" — same font family, different CDN name formats
- "Noto Sans KR" = "Noto Sans Korean" — same font
- "Noto Serif KR" = "Noto Serif Korean" — same font
- If HTML uses a CDN-valid font (Pretendard Variable, Noto Sans KR, Noto Serif KR) while style guide lists a non-CDN font (e.g., "Spoqa Han Sans Neo"), the HTML implementation is CORRECT. Score typography 4/5 or 5/5 — the HTML Builder properly overrode a bad style guide font recommendation.
- Only flag typography as CRITICAL if HTML uses a completely different font family from the style guide (e.g., style guide says serif but HTML uses sans-serif with no relation).

ICON FORMAT RULES:
- Phosphor icons in HTML use CSS classes: "ph ph-duotone ph-leaf" or "ph ph-leaf"
- Style guide useCases format "leaf-duotone" means: ph-leaf icon with duotone weight
- To check icon consistency: verify all icons use ph- prefix (correct library) and if weight="duotone", they should have ph-duotone class alongside the specific icon class
- Icons rendered as "ph-leaf" without "ph-duotone" = mild inconsistency (HIGH, not CRITICAL)
- Icons from wrong library = CRITICAL

Check these rules:
1. Icon library consistency (all icons from the same library/weight)
2. Color palette adherence (only colors from the palette used)
3. Typography consistency (only defined font pairs used — apply font equivalence rules above)
4. Section rhythm order matches sectionRhythm
5. No emoji icons (instant CRITICAL fail)
6. Tone match between copy sections and style guide brand keywords
7. Client restrictions: if forbidden words/styles/colors are listed, verify they do NOT appear in copy headlines
8. Required phrases: if required phrases are listed, verify they appear verbatim anywhere in the page content (headings h1-h3, body text, spec items, CTA text — not limited to main headlines)

Score each dimension 1-5. Flag issues with severity.
Output JSON only, no markdown.`

function buildUserPrompt(
  styleGuide: StyleGuide,
  refinedCopy: RefinedCopy,
  generatedFiles: string[],
  brief?: ProjectBrief
): string {
  // HTML 파일이 있으면 핵심 부분 추출 (CSS vars + icon classes + section structure)
  const htmlFile = generatedFiles.find((f) => f.endsWith('.html'))
  let htmlSnippet = 'No HTML file provided.'
  if (htmlFile && fs.existsSync(htmlFile)) {
    const raw = fs.readFileSync(htmlFile, 'utf8')
    // CSS 변수 섹션 추출
    const cssVarMatch = raw.match(/:root\s*\{([\s\S]*?)\}/)
    const cssVars = cssVarMatch ? cssVarMatch[0] : ''
    // font-family 선언 추출 (실제 사용 폰트 확인용)
    const fontFamilyMatches = raw.match(/font-family\s*:\s*[^;}{]+/g) ?? []
    const uniqueFonts = [...new Set(fontFamilyMatches.map((f) => f.trim()))].slice(0, 8).join('\n')
    // @font-face src 추출 (CDN URL)
    const fontFaceMatches = raw.match(/@font-face[\s\S]*?}/g) ?? []
    const fontFaceSummary = fontFaceMatches
      .map((ff) => {
        const familyMatch = ff.match(/font-family\s*:\s*['"]?([^'";]+)['"]?/)
        const srcMatch = ff.match(/src\s*:.*?url\(['"]?([^'")]+)['"]?\)/)
        return familyMatch ? `${familyMatch[1]}${srcMatch ? ` → ${srcMatch[1].substring(0, 60)}` : ''}` : null
      })
      .filter(Boolean)
      .slice(0, 6)
      .join('\n')
    // 아이콘 클래스 추출 (ph- 클래스, 중복 제거)
    const iconMatches = raw.match(/ph-[a-z-]+/g) ?? []
    const uniqueIcons = [...new Set(iconMatches)].join(', ')
    // 아이콘 weight 클래스 추출 (ph-duotone 등)
    const hasDuotone = raw.includes('ph-duotone')
    const iconWeightNote = hasDuotone ? 'ph-duotone weight class found ✓' : 'ph-duotone weight class NOT found'
    // 섹션 헤드라인 + h3 추출 (required phrases는 h3에도 있을 수 있음)
    const headlineMatches = raw.match(/<h[123][^>]*>([^<]+)<\/h[123]>/g) ?? []
    const headlines = headlineMatches.slice(0, 20).join('\n')
    // 본문 텍스트 샘플 (required phrase 확인용) — p + span + div 계열 포함
    const bodyTextMatches = raw.match(/<(?:p|span|dd|dt|li)[^>]*>([^<]{5,100})<\/(?:p|span|dd|dt|li)>/g) ?? []
    const bodyTextSample = bodyTextMatches.slice(0, 20).join('\n')

    // 필수 문구 결정론적 사전 검사 (Claude 판단 오류 방지)
    const requiredPhraseCheck = brief && brief.requiredContent.phrases.length > 0
      ? '\n\n[Pre-checked Required Phrases — DETERMINISTIC, DO NOT OVERRIDE]:\n' +
        brief.requiredContent.phrases.map(phrase => {
          const found = raw.includes(phrase)
          return `- "${phrase}": ${found ? '✅ FOUND in HTML' : '❌ NOT FOUND in HTML'}`
        }).join('\n')
      : ''

    htmlSnippet = `CSS Variables:\n${cssVars}\n\nFont families declared:\n${uniqueFonts}\n\n@font-face loaded:\n${fontFaceSummary || '(none)'}\n\nIcons used: ${uniqueIcons}\nIcon weight: ${iconWeightNote}\n\nHeadings (h1-h3):\n${headlines}\n\nBody text sample:\n${bodyTextSample}${requiredPhraseCheck}`
  }

  const restrictionsSection = brief ? `
Client Restrictions (MUST NOT appear in copy or design):
- Forbidden words: ${brief.restrictions.words.length > 0 ? brief.restrictions.words.join(', ') : 'None'}
- Forbidden styles: ${brief.restrictions.styles.length > 0 ? brief.restrictions.styles.join(', ') : 'None'}
- Forbidden colors: ${brief.restrictions.colors.length > 0 ? brief.restrictions.colors.join(', ') : 'None'}

Required phrases (MUST appear verbatim):
${brief.requiredContent.phrases.length > 0 ? brief.requiredContent.phrases.map(p => `- "${p}"`).join('\n') : 'None'}
` : ''

  return `
Style Guide Contract:
${JSON.stringify(styleGuide, null, 2)}
${restrictionsSection}
Refined Copy (sections):
${JSON.stringify(refinedCopy.sections.map((s) => ({ type: s.sectionType, headline: s.headline })), null, 2)}

Generated Files: ${generatedFiles.map((f) => path.basename(f)).join(', ')}

HTML Implementation Analysis:
${htmlSnippet}

Validate and output:
{
  "passed": boolean,
  "issues": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM",
      "rule": string,
      "description": string
    }
  ],
  "scores": {
    "iconConsistency": number (1-5),
    "colorConsistency": number (1-5),
    "typographyConsistency": number (1-5),
    "rhythmConsistency": number (1-5),
    "noEmoji": boolean,
    "toneMatch": number (1-5)
  },
  "checkedAt": "${new Date().toISOString()}"
}

passed = true only if all scores >= 3 AND noEmoji = true AND no CRITICAL issues.
JSON only.`
}

export async function runValidator(
  styleGuide: StyleGuide,
  refinedCopy: RefinedCopy,
  generatedFiles: string[],
  outputDir: string,
  brief?: ProjectBrief
): Promise<AgentResult<ValidationReport>> {
  const elapsed = timer()
  console.log('[Validator] 시작')

  try {
    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_SONNET,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(styleGuide, refinedCopy, generatedFiles, brief),
        },
      ],
    })

    const text = extractText(message.content)
    const report = parseJsonResponse<ValidationReport>(text)

    saveJson(report, `${outputDir}/validation-report.json`)

    console.log(`[Validator] 완료 (${elapsed()}ms) — ${report.passed ? '✅ PASS' : '❌ FAIL'}`)
    if (!report.passed) {
      const critical = report.issues.filter((i) => i.severity === 'CRITICAL')
      if (critical.length > 0) {
        console.log(`  CRITICAL 이슈:`)
        critical.forEach((i) => console.log(`    - ${i.rule}: ${i.description}`))
      }
    }

    return { success: true, data: report, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Validator] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
