/**
 * Agent 2: Art Director
 * 레퍼런스 기반 style-guide.json + styling-shots-prompts.json 생성
 * Claude Opus 4 사용 (깊은 분석)
 */

import type { ImageBlockParam, TextBlockParam } from '@anthropic-ai/sdk/resources'
import { anthropicClient, loadImageAsBase64, parseJsonResponse, saveJson, timer, MODELS } from './utils'
import type { ProjectBrief, StyleGuide, StylingPromptsJson, AgentResult } from './types'
import { buildTemplateCatalog } from './templates/index'
import * as fs from 'fs'

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
- NO emoji icons — only professional SVG library icons (Phosphor, Lucide, Tabler, Iconoir)
- NO templates — every design must be custom-crafted for this specific product
- NO placeholder text or wireframe aesthetics
- Typography must be GRAPHIC DESIGN quality, not just text overlay
- Styling shots: mix clean product shots with natural lifestyle/usage scenes (emotional imagery required); keep the product identical to the reference
- USAGE GROUNDING (CRITICAL): every usage/lifestyle scene MUST reflect how the product is ACTUALLY consumed/used per the brief (섭취법·사용법·용도). NEVER invent consumption methods — e.g. do not show powder dissolved in water, brewing, or cooking steps unless the brief explicitly says so.

Icon library selection guide:
- Food/handmade/emotional → Phosphor duotone
- Premium/minimal → Lucide
- Tech/professional → Tabler
- Friendly/cute → Iconoir

4-ROLE FONT SYSTEM (CRITICAL — assign all 4 roles):
Available Korean fonts — grouped by character:

  [산세리프 · 범용/모던] — 가독성 최고, 본문·제목 모두 적합
    Pretendard Variable, Noto Sans KR, IBM Plex Sans KR, Gothic A1, Sunflower, Stylish,
    NanumSquareNeo, KoPub Dotum

  [세리프 · 고급/전통] — 고급스러운 본문, 브랜드 스토리, 전통적 무드
    Noto Serif KR, Gowun Batang, Hahmlet, Nanum Myeongjo, Song Myung, KoPub Batang

  [산세리프 · 개성/임팩트] — 제목 전용, 강한 인상
    Black Han Sans, Do Hyeon, Jua, Gowun Dodum, GmarketSans, Paperlogy, Tenada

  [손글씨 · 감성 포인트] — 단문 헤드라인 강조, 따뜻한 감성
    Nanum Pen Script, Nanum Brush Script, Gamja Flower, Gaegu, Poor Story

  [디스플레이 · 특수] — 개성 강한 단일 헤드라인 (본문 사용 금지)
    Yeon Sung, Gugi, East Sea Dokdo, Single Day, Hi Melody, Kirang Haerang, Cute Font, Nanum Gothic

Roles:
  headlineFont — hero title, section-title, step numbers (choose bold/impactful)
  storyFont    — brand_story title/body, sensory sections (choose emotional/literary)
  bodyFont     — general body text, lists, descriptions (choose readable)
  accentFont   — CTA title, eyebrow labels, small callouts (choose distinctive)

Selection rules:
  - Analyze the product mood, reference images, and brand tone to decide freely
  - Do NOT use the same font for multiple roles
  - Do NOT use only serif or only sans-serif — create contrast
  - headlineFont + accentFont should feel bold or distinctive
  - bodyFont must prioritize readability — choose from [산세리프 · 범용/모던] group only
  - storyFont should match emotional register — [세리프 · 고급/전통] for warmth/premium, [손글씨] for handmade
  - headlineFont — choose from [개성/임팩트] or [범용/모던] group; AVOID repeating same font across runs
  - [손글씨] and [디스플레이 · 특수] fonts — use only for headlineFont or accentFont, NEVER for bodyFont
  - Category guidance: food → GmarketSans/Paperlogy/Tenada/KoPub Batang 우선;
                       beauty → NanumSquareNeo/Sunflower/GmarketSans 우선;
                       electronics → Gothic A1/IBM Plex Sans KR/NanumSquareNeo 우선

DO NOT use any font not listed above.

LAYOUT PATTERN DISTRIBUTION (CRITICAL):
- For 12+ sections, assign layoutPatterns to at least 10 sections explicitly.
- MANDATORY inclusions — at least ONE of each pattern type:
  - "right-image-left-text" (not just left-image-right-text — must appear at least twice)
  - "full-bleed-sensory" (assign to texture_focus, sensory, or break sections)
  - "photo-gallery-strip" (assign to photo_gallery sections)
  - "dark-story-centered" (assign to brand_story and cta)
  - "numbered-steps-horizontal" (assign to process, usage, how_to_use sections)
  - "grid-info-cards" (assign to features, certifications, social_proof, ingredients, faq)
- Do NOT assign the same split direction consecutively — alternate "left-image-right-text" and "right-image-left-text" for split-type sections.
- ingredients, packaging, gift_suggestion, size_comparison → use "left-image-right-text" or "right-image-left-text" (alternating).

BACKGROUND STYLE (backgroundStyle field in each layoutPattern — CRITICAL):
- Output a valid CSS background value that you freely choose based on product mood and reference images.
- "image" → use a generated image as the section background (only for sensory/break/story sections)
- CSS value → applied inline directly (for grid, steps, split, cta sections)
- Examples: "#fafaf8", "linear-gradient(135deg, #2D4A2D 0%, #1A3020 100%)",
  "radial-gradient(ellipse at top, #1a1a2e 0%, #16213e 100%)", "var(--color-surface2)"
- Alternate dark and light sections — never use the same tone consecutively.
- For dark backgrounds (hex starts with #0 or #1, or clearly dark gradient): text will auto-invert.
- For split sections: backgroundStyle applies to the text-content side.
- brand_story, cta: choose dramatic dark gradients that complement brand color.

LAYER IMAGE DESIGN GUIDE (v5 CRITICAL — REPLACES conceptShots):

For EVERY layoutPattern with bgType='layer-image', you MUST author a sectionImageBrief
in stylingPrompts.sectionImageBriefs[]. Each brief contains 1~3 image assets that will
be composited as separate layers in HTML. This is your most important output for visual
quality — Layer Image agent will execute your prompts verbatim with Gemini.

ASSET ROLES:
1. background (REQUIRED for every layer-image section):
   - Full-bleed decorative texture/gradient/atmosphere
   - NO text, NO product, NO box, NO frame, NO UI elements
   - Safe zone in the textPlacement area must be visually CALM
   - Sized to match section (typically 860x900 vertical, 860x600 sensory landscape)
   - transparent: false

2. frame (OPTIONAL — decorative border/frame):
   - Transparent PNG that wraps content area
   - Examples: thin gold border with corner ornaments, woven texture frame, organic blob
   - Sized smaller than section (typical 780x740)
   - transparent: true

3. accent (OPTIONAL — small decorative element):
   - Transparent PNG positioned as visual flourish
   - Examples: small wheat illustration, floral motif, abstract shape, badge
   - Small size (typical 120x120)
   - transparent: true

PROMPT WRITING RULES (per asset):
- Write in English at Styling Shots level of detail (composition / surface / lighting / mood)
- Reflect the references you analyzed
- Match the section's textureHint / lightingMood / atmosphericKeywords for cohesion
- Strict prohibitions: NO text, NO Korean characters, NO prices/percentages
- For backgrounds: explicitly mark the safe zone (e.g. "calm center 60% area for text overlay")
- For transparent assets: prompt should describe a single isolated decorative element

DECISION RULE (asset count per section):
- hero / sensory / brand_story: background + frame + accent (3 assets)
- key_benefit / ingredients / process: background + accent (2 assets)
- packaging / cta: background only (1 asset) or + accent (2)
- bento-grid sections: background + accent (2) — frame redundant with cards
- AUTONOMY: skip optional assets when not adding value. Quality over quantity.

OUTPUT EXAMPLE (for stylingPrompts.sectionImageBriefs[]):
{
  "section": "brand_story",
  "designIntent": "따뜻한 가족 베이커리 무드, 빈티지 편집형 톤. 본문이 차분히 읽히도록 중앙 캄 영역 보장",
  "textureHint": "warm linen + soft golden bokeh",
  "lightingMood": "soft afternoon window light",
  "atmosphericKeywords": ["intimate", "warm", "handcrafted"],
  "assets": [
    {
      "role": "background",
      "prompt": "Warm linen fabric texture with soft golden bokeh in upper area, gradient fade to deeper warm tones at bottom. NO text, NO product, NO frame. Calm center 60% area (vertical 20%-80%) reserved for HTML card overlay. 860x900 vertical, editorial Korean food magazine aesthetic, subtle Kodak Portra grain, no AI-generated look.",
      "filename": "brand_story_bg.png",
      "size": "860x900",
      "transparent": false
    },
    {
      "role": "frame",
      "prompt": "Decorative thin gold ornamental border with elegant corner flourishes, art-deco-meets-Korean-traditional motif, transparent PNG, 780x740, no text, no product, isolated decorative element only.",
      "filename": "brand_story_frame.png",
      "size": "780x740",
      "transparent": true
    },
    {
      "role": "accent",
      "prompt": "Small minimal wheat grain illustration in soft golden watercolor, transparent PNG, 120x120, hand-drawn editorial style, no text, no product, single isolated motif.",
      "filename": "brand_story_accent.png",
      "size": "120x120",
      "transparent": true
    }
  ]
}

REFERENCE EMULATION (CRITICAL — DO NOT SKIP):
Each prompt in sectionImageBriefs[].assets[].prompt MUST be informed by the attached
section reference images. The "Section-tagged References" block in the user message lists
which images belong to which section.

For each sectionImageBrief.background prompt:
  1. Identify the section's matching reference images (3장 per section).
  2. Describe the SPECIFIC visual qualities you observe — NOT generic textureHint keywords:
     - exact color palette ("deep oxblood transitioning to charcoal at edges")
     - lighting direction/quality ("low raking light from upper-left, hard shadows on right")
     - texture grain/material ("visible canvas weave at 30% opacity, subtle film grain")
     - composition geometry ("negative space concentrated in center 50%, dense detail at edges")
     - atmospheric details specific to those refs (steam, haze, bokeh distribution)
  3. AVOID stock keyword chains ("warm + soft + golden + amber") — be specific to what you see in the refs.
  4. If 3 references for the section show 3 different tones, choose ONE and commit to it (don't blend).

When in doubt: write your prompt as if instructing a designer to recreate ONE specific reference image, not as a generic mood board summary.

DIVERSITY CONSTRAINT (CRITICAL):
Each sectionImageBrief MUST have a distinct textureHint and lightingMood from the others.
Forbidden: all 8 sections sharing "warm linen" or "vintage darkroom" — that produces monotone results.
Vary by section purpose:
- hero: epic/atmospheric (golden hour bokeh, cinematic gradient)
- brand_story: intimate/dark (warm wood, candle glow, vintage paper)
- key_benefit: clean/structured (subtle pastel, geometric grid hint)
- ingredients: natural/raw (linen, kraft paper, organic stone)
- process: artisan/workbook (parchment, soft horizontal rhythm, sketch grid)
- sensory: immersive/dramatic (steam, mist, deep gradient, macro feel)
- packaging: clean/trustworthy (canvas, white paper, minimal stripe)
- cta: bold/converting (dramatic gradient, dark luxury, brand color glow)
The above are STARTING points — adjust per product, but DO NOT make them similar.

CRITICAL REMINDERS:
- sectionImageBriefs MUST cover every layoutPattern with bgType='layer-image'
- Reuse conceptShots field is DEPRECATED — use sectionImageBriefs only
- If you generate fewer than the layer-image sections, validation will fail and trigger retry
- Each brief's textureHint and lightingMood MUST be section-specific (no copy-paste across sections)

3-LAYER OVERLAY SYSTEM (v5 — REQUIRED for every layoutPattern):
Every section is rendered as 3 stacked layers:
  Layer 1: BACKGROUND   — decorative texture (Gemini PNG) or CSS (gradient/solid/SVG)
  Layer 2: CARD/BOX     — HTML/SVG with radius/shadow/border (NEVER baked into image)
  Layer 3: TEXT         — vector typography on top of card

For each layoutPattern, you MUST also output these 4 fields:

(a) bgType — how the background is generated:
  - "layer-image"  → Gemini PNG (decorative, text-free, box-free, product-free)
                     Use for sections where atmosphere matters: brand_story, sensory, packaging, cta, hero, ingredients
  - "gradient"     → CSS linear/radial gradient (cleaner sections like key_benefit, process)
  - "solid"        → single color (clean grids, dense info)
  - "texture-svg"  → inline SVG pattern (subtle dots/lines/grain)

(b) cardStyle — how the overlay card looks:
  - "elevated"  → white card with soft shadow on photo-textured background
  - "flat"      → solid color card, no shadow, modern look
  - "outlined"  → transparent card with border, lets background show through
  - "glass"     → frosted glass (backdrop-blur) — premium feel on rich backgrounds
  - "none"      → no card, text overlays directly on background (hero, sensory)

(c) overlayStrategy — card layout within the section:
  - "center-card"   → 1 big centered card (brand_story, cta, dense narrative)
  - "side-card"     → card on one side, background fills the other (ingredients, packaging)
  - "split-card"    → image on one side + card on other (packaging with photo)
  - "full-bleed"    → no card, text directly on full-bleed image (hero, sensory)
  - "stacked-cards" → vertical timeline cards (process, how_to_use)
  - "bento-grid"    → 2×2 or 3-cell grid of small cards (key_benefit, features)

(d) textPlacement — where text/card sits (drives layer-image safe zone):
  - "top" / "center" / "bottom" / "side-right" / "side-left"
  - The layer-image generator will leave this area visually calm (low contrast)

(e) cardCount (optional) — for bento-grid: 2/3/4/6

SECTION RECOMMENDATIONS (use as starting point, adjust per product mood):
| section        | bgType       | cardStyle | overlayStrategy | textPlacement |
|----------------|--------------|-----------|-----------------|---------------|
| hero           | layer-image  | none      | full-bleed      | bottom        |
| brand_story    | layer-image  | glass     | center-card     | center        |
| key_benefit    | gradient     | elevated  | bento-grid      | center        |
| ingredients    | layer-image  | flat      | side-card       | side-right    |
| process        | gradient     | flat      | stacked-cards   | center        |
| sensory        | layer-image  | none      | full-bleed      | center        |
| packaging      | layer-image  | elevated  | split-card      | side-left     |
| cta            | layer-image  | none      | full-bleed      | center        |
| features       | solid        | outlined  | bento-grid      | center        |
| social_proof   | solid        | flat      | stacked-cards   | center        |
| certifications | gradient     | outlined  | bento-grid      | center        |

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

  return `
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
  "icons": { "library": "phosphor"|"lucide"|"tabler"|"iconoir", "weight": string, "size": number, "primaryColor": "#HEX", "useCases": { "key": "icon-name" } },
  "decorativeElements": { "dividerStyle": string, "cornerRadius": string, "shadows": string },
  "layoutPatterns": [{
    "section": string,
    "pattern": "full-bleed-hero"|"left-image-right-text"|"right-image-left-text"|"full-bleed-sensory"|"dark-story-centered"|"numbered-steps-horizontal"|"grid-info-cards"|"photo-gallery-strip"|"masonry-gallery"|"split-text-heavy"|"centered-statement"|"icon-feature-row"|"comparison-table"|"timeline-vertical"|"full-bleed-overlay"|"testimonial-quote",
    "backgroundStyle": string,
    "bgType": "layer-image"|"gradient"|"solid"|"texture-svg",
    "cardStyle": "elevated"|"flat"|"outlined"|"glass"|"none",
    "overlayStrategy": "center-card"|"side-card"|"split-card"|"full-bleed"|"stacked-cards"|"bento-grid",
    "textPlacement": "top"|"center"|"bottom"|"side-right"|"side-left",
    "cardCount": number
  }],
  "sectionRhythm": string,
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
  ],
  "conceptShots": [
    {
      "filename": string,
      "purpose": string,
      "targetSection": string,
      "prompt": string
    }
  ],
  "sectionImageBriefs": [
    {
      "section": string,
      "designIntent": string,
      "textureHint": string,
      "lightingMood": string,
      "atmosphericKeywords": string[],
      "assets": [
        {
          "role": "background"|"frame"|"accent",
          "prompt": string,
          "filename": string,
          "size": string,
          "transparent": boolean,
          "notes": string
        }
      ]
    }
  ]
}

Generate 8 styling shots covering a DIVERSE set so every section of a long detail page gets a distinct image:
- 1 HERO: product on a clean styled surface (the main beauty shot)
- 1~2 DETAIL/MACRO: texture or key feature close-up
- 1 INGREDIENT/COMPONENT: real ingredients/parts placed BESIDE the product (never inside/cross-section)
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

CONCEPT SHOTS (DEPRECATED in v5):
- Use sectionImageBriefs[] instead — see LAYER IMAGE DESIGN GUIDE above.
- For backwards compatibility you may still output "conceptShots": [] (empty array).
- Do NOT add new conceptShots. All layer-image content goes into sectionImageBriefs.

SECTION IMAGE BRIEFS (REQUIRED for v5):
- For every layoutPattern with bgType='layer-image', author one sectionImageBrief.
- Each brief contains 1~3 assets: background (required) + frame/accent (optional).
- Follow the LAYER IMAGE DESIGN GUIDE rules above precisely.
- Validation will reject the response if any layer-image section has no brief.

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
      sectionRefsText = `\n## Section-tagged References (image order continues from category refs)\nThe following reference images are pre-grouped by section. Use these to inform sectionImageBriefs[] for each section's design tone:\n` +
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

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // 두 JSON 분리
    const parts = text.split('===SEPARATOR===')
    if (parts.length < 2) throw new Error('JSON 분리 실패 — SEPARATOR 없음')

    const styleGuide = parseJsonResponse<StyleGuide>(parts[0])
    const stylingPrompts = parseJsonResponse<StylingPromptsJson>(parts[1])

    // 저장
    saveJson(styleGuide, `${outputDir}/style-guide.json`)
    saveJson(stylingPrompts, `${outputDir}/styling-shots-prompts.json`)

    console.log(`[Art Director] 완료 (${elapsed()}ms)`)
    console.log(`  - 아이콘 라이브러리: ${styleGuide.icons.library}`)
    console.log(`  - 레이아웃 패턴: ${styleGuide.layoutPatterns.length}개`)
    console.log(`  - 스타일링샷 프롬프트: ${stylingPrompts.shots.length}개`)
    console.log(`  - 컨셉샷 프롬프트: ${stylingPrompts.conceptShots?.length ?? 0}개`)

    return { success: true, data: { styleGuide, stylingPrompts }, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Art Director] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
