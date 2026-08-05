/**
 * Agent 2: Art Director
 * 레퍼런스 기반 style-guide.json + styling-shots-prompts.json 생성
 * Claude Opus 4 사용 (깊은 분석)
 */

import type { ImageBlockParam, TextBlockParam } from '@anthropic-ai/sdk/resources'
import { z } from 'zod'
import { anthropicClient, loadImageAsBase64, parseJsonResponse, saveJson, timer, MODELS, extractText } from './utils'
import type { ProjectBrief, StyleGuide, StylingPromptsJson, AgentResult } from './types'
import { buildTemplateCatalog } from './templates/index'
import { isWhitelistedFont } from './templates/blocks/shared'
import { rankStyleLanguages, STYLE_LANGUAGES } from './templates/blocks/style-languages'
import * as fs from 'fs'

/** 스타일가이드 출력 게이트 (design-system.md §8-1) — 유일하게 Zod 없이 raw 파싱되던
 *  에이전트라 HEX 오형식·shapeLanguage 오타가 침묵 통과해 토큰 파생을 오염시켰다.
 *  구조·형식 위반 = 하드 실패(상위 재시도 유도). 폰트 화이트리스트 위반 = 소프트
 *  경고(렌더 계층에 프리셋 폴백이 있어 치명적이지 않음 — 로그로 감시). */
const HEX6 = /^#[0-9A-Fa-f]{6}$/
const styleGuideGate = z
  .object({
    brand: z.object({ name: z.string().min(1), moodKeywords: z.array(z.string()).min(1) }).passthrough(),
    shapeLanguage: z.enum(['sharp-editorial', 'soft-round', 'organic', 'arch-serif', 'neutral']).optional(),
    styleLanguage: z.enum(STYLE_LANGUAGES.map((l) => l.id) as [string, ...string[]]).optional(),
    colors: z
      .object({
        primary: z.string().regex(HEX6), secondary: z.string().regex(HEX6),
        surface1: z.string().regex(HEX6), surface2: z.string().regex(HEX6), surface3: z.string().regex(HEX6),
        textDark: z.string().regex(HEX6), textLight: z.string().regex(HEX6), accent: z.string().regex(HEX6),
      })
      .passthrough(),
    typography: z
      .object({ headlineFont: z.string().min(1), storyFont: z.string().min(1), bodyFont: z.string().min(1), accentFont: z.string().min(1) })
      .passthrough(),
  })
  .passthrough()

function gateStyleGuide(sg: StyleGuide): void {
  const parsed = styleGuideGate.safeParse(sg)
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ')
    throw new Error(`스타일가이드 게이트 위반 — ${issues}`)
  }
  const t = sg.typography
  for (const [role, font] of [['headline', t.headlineFont], ['story', t.storyFont], ['body', t.bodyFont], ['accent', t.accentFont]] as const) {
    if (font && !isWhitelistedFont(font))
      throw new Error(`화이트리스트 외 폰트(${role}): "${font}" — 드라이브 36종 목록의 정확한 이름만 사용하라`)
  }
}

const SYSTEM_PROMPT = `You are a world-class Art Director specializing in Korean e-commerce product detail pages.
Your task: analyze the brand brief and reference images, then produce two JSON documents that will serve as a binding contract for all downstream agents.

REFERENCE IMAGE INTERPRETATION:
You will receive multiple batches of images in this order:
1. CURATED CATEGORY EXAMPLES (first 5 images): Korean e-commerce detail pages for this category
   → Extract: section composition, color palette, typography scale, background treatment, visual rhythm
   → These define what WORKS in the Korean market for this category
2. WEB SEARCH RESULTS (next ~8 images): Fresh design references from Naver/Pinterest/Notofolio/Wadiz
   → Extract: current design trends, layout ideas, mood/atmosphere choices
3. PRODUCT IMAGES (remaining images): The actual product to sell
   → Extract: product shape, color, material, packaging style

USE ALL REFERENCES. Do not ignore the first batches. The design references carry 60% of the design DNA, the product images carry 40%.
SEARCH QUERY PRINCIPLE: Design direction is based on PRODUCT TYPE + CUSTOMER CONTEXT, never on brand names.

CRITICAL RULES:
- NO emoji icons — the render layer provides its own curated SVG icon set; do not specify icon libraries
- NO templates — every design must be custom-crafted for this specific product
- NO placeholder text or wireframe aesthetics
- Typography must be GRAPHIC DESIGN quality, not just text overlay
- Styling shots: mix clean product shots with natural lifestyle/usage scenes (emotional imagery required); keep the product identical to the reference
- USAGE GROUNDING (CRITICAL): every usage/lifestyle scene MUST reflect how the product is ACTUALLY consumed/used per the brief (섭취법·사용법·용도). NEVER invent consumption methods — e.g. do not show powder dissolved in water, brewing, or cooking steps unless the brief explicitly says so.

PALETTE CONTRAST RULE (CRITICAL — prevents monochrome drift):
The colors.accent MUST differ meaningfully in hue from colors.primary.
- FORBIDDEN: accent created by simply lightening or darkening the brand primary (e.g. primary #1A3A6C → accent #2B5BA8 is just a lighter blue — this is NOT a true accent).
- REQUIRED: pick ONE palette STRATEGY and name it in designNotes. Strategies are defined by RELATIONSHIP, not by example colors (concrete color-pair examples are BANNED here — they imprint and cause cross-project convergence):
  · complementary-pop — accent from the opposite side of the color wheel vs primary
  · warm-cool-tension — temperature contrast between primary and accent
  · metallic-accent — muted/neutral primary + metallic accent. Do NOT choose this if the recent-projects context marks it as used.
  · tonal-depth — lightness ladder of one hue + ONE high-chroma point color
  · category-native — promote a color measured from the actual product/package to primary
- DIVERSITY: never converge on the same primary hue family + headline font as a typical "safe premium" answer. If the product itself does not demand it, avoid defaulting to dark-navy primaries and gold accents.
- Dark scene budget: plan for 1~3 dark scenes per page, never 3 consecutive same-tone scenes (the page planner owns final scene tones — your palette must support both light and dark scenes).
- Test: if colors.primary and colors.accent look like two shades of the same color, pick a different accent.

4-ROLE FONT SYSTEM (CRITICAL — assign all 4 roles):
아래 36종만 사용 가능하다. Helvetica·Arial·Roboto·San Francisco·Noto Sans KR·Black Han Sans 등
이 목록에 없는 모든 영문 전용·시스템·Google Fonts 폰트는 절대 사용 금지.
반드시 아래의 정확한 이름(띄어쓰기·대소문자·숫자 포함 그대로)을 사용하라.

  [범용 — 제목·소제목·정보 모두 적합] ★ bodyFont는 반드시 이 그룹에서만 선택
    프리텐다드, 페이퍼로지, 지마켓 산스, 마루 부리, 나눔스퀘어, 나눔명조, SUIT

  [제목+소제목 — headlineFont·storyFont·accentFont 적합, bodyFont 금지]
    평창평화체, 카페24 당당해, 카페24 써라운드, 창원단감아삭체, 카페24 단정해,
    어그로체, 빛고을광주체, 티몬몬소리체,
    Rufina, Apollo, High Summit, Gontserrat, Quentin, Belgiano

  [디스플레이 — headlineFont·accentFont 전용, bodyFont·storyFont 금지]
    카페24 클래식타입, 카페24 빛나는별, 카페24 아네모네, 영양군 음식디미방체,
    영도체, 여기어때 잘난체, 안성탕면체, 수성혜정체, 상주곶감체,
    문경감홍사과체, 땅스부대찌개체, tvN 즐거운이야기, 가나초콜릿체

  [손글씨 — headlineFont·accentFont 전용, bodyFont 절대 금지]
    나눔 부장님 눈치체, 나눔브러쉬

Roles:
  headlineFont — 히어로 제목·섹션 제목·스텝 번호 (임팩트 있는 폰트 선택)
  storyFont    — 브랜드 스토리 제목/본문·감성 섹션 (감성적/문학적 폰트)
  bodyFont     — 일반 본문·목록·설명 (가독성 최우선 — [범용] 그룹에서만)
  accentFont   — CTA 제목·아이브로 레이블·짧은 콜아웃 (개성 있는 폰트)

Selection rules:
  - 4개 역할에 서로 다른 폰트를 반드시 배정
  - 산세리프/세리프/개성체를 혼합해 대비 생성 — 전부 같은 계열 금지
  - headlineFont + accentFont는 굵거나 임팩트 있게
  - bodyFont는 [범용] 그룹에서만 — 손글씨·디스플레이 절대 금지
  - storyFont — [범용]의 세리프계(나눔명조·마루 부리) 또는 [제목+소제목]의 감성폰트
  - DIVERSITY: 같은 폰트 조합 반복 금지 — 이번 제품의 무드·레퍼런스에서 유도

위 36종 이외의 폰트는 절대 사용 금지. 이름이 정확히 일치해야 한다.

PRODUCT PRESERVATION RULES — ABSOLUTE CONSTRAINTS:
productPreservationRules must ONLY contain rules that PROTECT and PRESERVE the product's exterior appearance.
NEVER include any instruction that:
- Shows ingredients, fillings, cross-sections, or internal components of the product
- Reveals what the product looks like inside (e.g. "앙버터 필링이 살짝 보이는 단면", "크림이 흘러내리는")
- Adds raw ingredients as props (e.g. butter, red bean paste, cream, sauce as separate items)
Every rule must focus on keeping the FINISHED, INTACT product looking exactly as it appears in the reference images.

STYLING SHOTS — SETTING:
- Product/detail shots: clean studio surface (wood board, linen, marble, slate)
- Lifestyle/usage shots: a natural, real-feeling scene that fits the product (cozy home, table, soft daylight),
  a hand or the relevant subject MAY appear — but the PRODUCT must remain exactly as in the reference (no altered packaging/logo/text)

Output: two JSON objects, separated by ===SEPARATOR===
1. style-guide.json (StyleGuide schema)
2. styling-shots-prompts.json (StylingPromptsJson schema)

Output raw JSON only, no markdown code blocks.`

function buildUserPrompt(brief: ProjectBrief, hasReferenceImages: boolean): string {
  const templateCatalog = buildTemplateCatalog(brief.category)

  // 기업 인테이크 디자인 키워드 → 스타일 언어 후보(§2.4) — 기업 의사가 1차 결정자
  const picks = (brief.styleDirection ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const ranked = rankStyleLanguages(picks)
  const candidates = ranked.length ? ranked : STYLE_LANGUAGES.map((l) => ({ id: l.id, name: l.name, score: 0, matched: [] as string[] }))
  const styleLangBlock = `## Style Language Candidates (씬 자유 설계용 — §2.4)
${candidates
    .slice(0, ranked.length ? 3 : 9)
    .map((c) => {
      const lang = STYLE_LANGUAGES.find((l) => l.id === c.id)
      return `- ${c.id} (${lang?.name}): ${lang?.identity}${c.matched.length ? ` — 기업 선택 키워드 일치: ${c.matched.join(', ')}` : ''}`
    })
    .join('\n')}
${ranked.length ? '기업이 고른 디자인 키워드와 매칭된 후보다 — 이 중 제품 무드에 가장 맞는 하나를 styleLanguage로 확정하라.' : '기업 키워드 매칭이 없다 — 제품 무드에 가장 맞는 하나를 styleLanguage로 확정하라.'}`

  return `
${styleLangBlock}

## Brand Brief
Product: ${brief.productName}
Category: ${brief.category}
Platform: ${brief.platform}
Target Audience: ${brief.targetAudience}
Style Direction: ${brief.styleDirection}
Tone Keywords: ${brief.toneKeywords.join(', ')}
Brand Colors (if any): ${brief.brandColors.join(', ') || 'None — suggest appropriate colors'}
Key Highlights: ${brief.keyHighlights.join(' | ')}
Restrictions: ${brief.restrictions.styles.join(', ') || 'None'}
Forbidden Colors: ${brief.restrictions.colors.join(', ') || 'None'}

${templateCatalog ? templateCatalog + '\n' : ''}${hasReferenceImages ? '## Reference Images\nAnalyze the attached reference images to extract the design DNA.' : '## No Reference Images\nCreate a custom design direction based on the brief.'}

## Required Output

### JSON 1: StyleGuide
{
  "brand": { "name": string, "moodKeywords": string[], "targetEmotion": string },
  "shapeLanguage": "sharp-editorial"|"soft-round"|"organic"|"arch-serif"|"neutral",  // 페이지 기하학(곡률·사진 프레임·여백 리듬)을 결정하는 형태 언어 — 브랜드 무드에 근거해 선택. sharp-editorial=미니멀/모던(직각·넓은 여백), soft-round=포근/발랄(큰 곡률), organic=자연/수제(블롭 프레임), arch-serif=클래식/프리미엄(아치 프레임), neutral=균형
  "styleLanguage": string,  // 씬 자유 설계 스타일 언어 — 유저 프롬프트의 STYLE LANGUAGE CANDIDATES 중 하나를 확정(후보가 없으면 제품 무드에 가장 맞는 것을 후보 목록에서 선택)
  "colors": { "primary": "#HEX", "secondary": "#HEX", "surface1": "#HEX", "surface2": "#HEX", "surface3": "#HEX", "textDark": "#HEX", "textLight": "#HEX", "accent": "#HEX" },
  "typography": {
    "headlineFont": string,
    "storyFont": string,
    "bodyFont": string,
    "accentFont": string,
    "sizes": { "hero": number, "h2": number, "h3": number, "body": number, "caption": number },
    "weights": { "headline": string, "body": string },
    "letterSpacing": string
  },
  "decorativeElements": { "dividerStyle": string, "cornerRadius": string, "shadows": string },
  "referenceUrls": string[],
  "designNotes": string,
  "selectedTemplateId": string
}

===SEPARATOR===

### JSON 2: StylingPromptsJson
{
  "productPreservationRules": string[],
  "shots": [
    {
      "name": string,
      "filename": string,
      "composition": string,
      "surface": string,
      "props": string[],
      "lighting": string,
      "camera": string,
      "mood": string
    }
  ]
}

Generate 8 styling shots covering a DIVERSE set so every section of a long detail page gets a distinct image:
- 1 HERO: product on a clean styled surface (the main beauty shot)
- 1~2 DETAIL/MACRO: texture or key feature close-up
- 1 INGREDIENT/COMPONENT: real ingredients/parts placed BESIDE the product (never inside/cross-section).
    ONLY ingredients/materials explicitly stated in the brief may appear — NEVER invent ingredients
    the product does not contain (wrong raw materials in an ingredient shot destroy trust).
- 2~3 LIFESTYLE/USAGE: the product in a natural, real-feeling scene that fits the category —
    pet → a happy dog with the product or a hand offering it; food → served at a cozy table / a hand holding it;
    beauty → applied or held in hand; living·electronics → in real use at home.
    A natural human hand or the relevant subject MAY appear. (Emotional/lifestyle imagery is REQUIRED — a page
    with only static product shots reads as low quality.)
- 1 MOOD/ATMOSPHERE shot
Rules for every shot:
- The PRODUCT must stay EXACTLY as in the reference (form, color, logo, text preserved) — only the scene/props vary
- Unique composition; vary surface/lighting/mood so no two shots look alike
- English camera settings (Canon 5D Mark IV, specific mm + f-stop), Kodak Portra 400 film grain, natural imperfections
- NO "perfect", "clean", "symmetrical", "hyperrealistic" words

Output raw JSON only, separated by ===SEPARATOR===`
}

export async function runArtDirector(
  brief: ProjectBrief,
  referenceImagePaths: string[],
  outputDir: string,
  sectionRefs?: { section: string; paths: string[] }[]
): Promise<AgentResult<{ styleGuide: StyleGuide; stylingPrompts: StylingPromptsJson }>> {
  const elapsed = timer()
  console.log('[Art Director] 시작')

  try {
    // 카테고리 통합 레퍼런스 (최대 12장)
    const imageContents: ImageBlockParam[] = []
    for (const imgPath of referenceImagePaths.slice(0, 12)) {
      if (fs.existsSync(imgPath)) {
        const b64 = await loadImageAsBase64(imgPath, 800)
        imageContents.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: b64 },
        })
      }
    }

    // v5: 섹션별 레퍼런스 첨부 (각 섹션 2~3장)
    let sectionRefsText = ''
    if (sectionRefs && sectionRefs.length > 0) {
      const sectionLabels: string[] = []
      for (const { section, paths } of sectionRefs) {
        for (const p of paths) {
          if (fs.existsSync(p)) {
            const b64 = await loadImageAsBase64(p, 800)
            imageContents.push({
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: b64 },
            })
            sectionLabels.push(section)
          }
        }
      }
      // 섹션 인덱스 텍스트 — 시스템 프롬프트가 어느 이미지가 어느 섹션인지 알도록
      const sectionMap: Record<string, number[]> = {}
      sectionLabels.forEach((s, i) => {
        const startIdx = referenceImagePaths.slice(0, 12).filter(p => fs.existsSync(p)).length
        if (!sectionMap[s]) sectionMap[s] = []
        sectionMap[s].push(startIdx + i + 1)
      })
      sectionRefsText = `\n## Section-tagged References (image order continues from category refs)\nThe following reference images are pre-grouped by section. Use them to inform the overall design tone (palette strategy, mood, texture direction):\n` +
        Object.entries(sectionMap).map(([s, idxs]) => `- ${s}: images #${idxs.join(', #')}`).join('\n')
      console.log(`  섹션별 레퍼런스: ${sectionLabels.length}장 (${Object.keys(sectionMap).length}개 섹션)`)
    }

    const textBlock: TextBlockParam = {
      type: 'text',
      text: buildUserPrompt(brief, imageContents.length > 0) + sectionRefsText,
    }
    const userContent: (ImageBlockParam | TextBlockParam)[] = [...imageContents, textBlock]

    const message = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_OPUS,
      max_tokens: 16384,   // v5 sectionImageBriefs로 출력 크기 증가 (8섹션 × 2~3 에셋 × 상세 프롬프트)
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const text = extractText(message.content)

    // 두 JSON 분리
    const parts = text.split('===SEPARATOR===')
    if (parts.length < 2) throw new Error('JSON 분리 실패 — SEPARATOR 없음')

    const styleGuide = parseJsonResponse<StyleGuide>(parts[0])
    const stylingPrompts = parseJsonResponse<StylingPromptsJson>(parts[1])
    gateStyleGuide(styleGuide) // 위반 시 throw → 상위(PM) 재시도

    // 저장
    saveJson(styleGuide, `${outputDir}/style-guide.json`)
    saveJson(stylingPrompts, `${outputDir}/styling-shots-prompts.json`)

    console.log(`[Art Director] 완료 (${elapsed()}ms)`)
    // icons·layoutPatterns·conceptShots 로깅 제거 — 스키마 슬림화(2026-07-26)로 미출력 필드.
    // 대신 수렴 감시에 유용한 팔레트·형태 언어를 기록한다(design-system.md §2.2·§2.3 검증용).
    console.log(`  - 형태 언어: ${styleGuide.shapeLanguage ?? '(미지정)'} · primary ${styleGuide.colors?.primary} · accent ${styleGuide.colors?.accent}`)
    console.log(`  - 폰트: headline=${styleGuide.typography?.headlineFont} / story=${styleGuide.typography?.storyFont}`)
    console.log(`  - 스타일링샷 프롬프트: ${stylingPrompts.shots.length}개`)

    return { success: true, data: { styleGuide, stylingPrompts }, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Art Director] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
