/**
 * Agent 3-3: Layer Image v5
 *
 * v5 변경 (Brief Executor):
 * - Art Director가 작성한 sectionImageBriefs[]를 그대로 실행 (하드코딩 템플릿 폐기 진행 중)
 * - 멀티 에셋 지원: background (필수) + frame/accent (선택, transparent PNG)
 * - role별 모델 분기 (transparent → GEMINI_FLASH_IMAGE_TRANSPARENT)
 * - 출력 키: section_{section}_{role} (snake_case)
 * - briefs 미존재 시 legacy v4 hardcoded 경로 fallback
 *
 * Rate limit: LAYER_IMAGE_SLEEP_MS env로 조절 (기본 2500ms).
 *   - Gemini AI Studio 무료 티어는 5 RPM → 12000ms 권장
 *   - 유료 티어는 더 짧아도 OK
 */

import { generateImageWithGemini, loadImageAsBase64, saveImage, timer, MODELS } from './utils'
import type { StyleGuide, Script, AgentResult, LayoutPattern, TextPlacement, SectionImageBrief } from './types'
import type { ConceptShot } from './types'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

// ─────────────────────────────────────────────────────────────
// 공통 컨텍스트 헬퍼
// ─────────────────────────────────────────────────────────────

function findLayoutPattern(sg: StyleGuide, sectionType: string): LayoutPattern | undefined {
  return sg.layoutPatterns.find(p => p.section.toLowerCase() === sectionType.toLowerCase())
}

/**
 * v5 — textPlacement에 따른 safe zone 설명.
 * Gemini에게 카드/텍스트가 놓일 영역을 비워두라고 지시할 때 사용.
 */
function safeZoneDescription(placement: TextPlacement | undefined): string {
  switch (placement) {
    case 'top':        return 'TOP 30% of the canvas'
    case 'center':     return 'CENTER 60% area (horizontal band from 20% to 80% vertical)'
    case 'bottom':     return 'BOTTOM 30% of the canvas'
    case 'side-right': return 'RIGHT 50% of the canvas'
    case 'side-left':  return 'LEFT 50% of the canvas'
    default:           return 'CENTER area of the canvas'
  }
}

/**
 * v5 — 모든 비-hero 섹션 프롬프트에 강제 주입되는 절대 금지 블록.
 * 박스/카드/프레임이 이미지에 박히면 HTML 카드 오버레이와 충돌하므로 엄격 금지.
 */
const V5_STRICT_BACKGROUND_POLICY = `
━━━━━ V5 ABSOLUTE BACKGROUND POLICY (MUST FOLLOW) ━━━━━
This image will be used as a CSS background-image. Cards, boxes, and text are
rendered as HTML/SVG OVERLAY on top — they are NOT part of this image.

PROHIBITED (image will be REJECTED if present):
✗ Any text, letters, numbers, logos, watermarks
✗ Any rectangles, boxes, cards, panels, frames, badges
✗ Any UI elements (buttons, dividers, lines mimicking dividers)
✗ Any sharp geometric shapes that read as "container"

REQUIRED:
✓ Pure decorative atmosphere — texture, gradient, light, organic forms
✓ Soft transitions — no hard edges that suggest a layout container
✓ Designed to RECEIVE an HTML card overlay, not compete with it
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

/**
 * v5 — 섹션별 safe zone 지침 블록. 카드가 놓일 영역을 비워두도록 지시.
 */
function buildSafeZoneBrief(sg: StyleGuide, sectionType: string): string {
  const pattern = findLayoutPattern(sg, sectionType)
  const zone = safeZoneDescription(pattern?.textPlacement)
  const overlay = pattern?.overlayStrategy ?? 'center-card'
  return `
━━━━━ V5 SAFE ZONE (HTML card will be placed here) ━━━━━
A card with text will overlay the ${zone}.
Overlay strategy: ${overlay}

This safe zone MUST be visually CALM:
- Reduced contrast and saturation in this area
- No focal elements, busy textures, or competing details
- Smooth, unobtrusive — like a quiet canvas waiting for type

The REMAINING area carries the design interest:
- Texture, light play, gradient transitions, organic forms
- Atmospheric details that frame the card without crowding it
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

/**
 * StyleGuide + Script 정보를 종합한 공통 컨텍스트 블록.
 * 모든 프롬프트가 이 블록을 포함하여 Art Director의 결정을 완전히 반영.
 */
function buildLayerPromptContext(sg: StyleGuide, script: Script, sectionType: string): string {
  const pattern = findLayoutPattern(sg, sectionType)
  const scriptSection = script.sections.find(s => s.type.toLowerCase() === sectionType.toLowerCase())
  const sectionIndex = script.sections.findIndex(s => s.type.toLowerCase() === sectionType.toLowerCase())
  const totalSections = script.sections.length

  return `
━━━━━ DESIGN CONTEXT (from Art Director) ━━━━━

BRAND IDENTITY:
- Product: ${sg.brand.name}
- Mood keywords: ${sg.brand.moodKeywords.join(', ')}
- Target emotion: ${sg.brand.targetEmotion}

COLOR SYSTEM:
- Primary: ${sg.colors.primary} (main brand color)
- Secondary: ${sg.colors.secondary}
- Accent: ${sg.colors.accent}
- Surface tones: ${sg.colors.surface1} / ${sg.colors.surface2} / ${sg.colors.surface3}
- Text colors: ${sg.colors.textDark} (on light) / ${sg.colors.textLight} (on dark)

TYPOGRAPHY SYSTEM:
- Headline font: ${sg.typography.headlineFont}
- Story font: ${sg.typography.storyFont}
- Body font: ${sg.typography.bodyFont}
- Accent font: ${sg.typography.accentFont}
- Letter spacing: ${sg.typography.letterSpacing}

DECORATIVE ELEMENTS:
- Corner radius: ${sg.decorativeElements.cornerRadius}
- Shadow style: ${sg.decorativeElements.shadows}
- Divider style: ${sg.decorativeElements.dividerStyle}

SECTION POSITION:
- This section: ${sectionType} (${sectionIndex + 1} of ${totalSections})
- Layout pattern: ${pattern?.pattern ?? 'default'}
- Background style: ${pattern?.backgroundStyle ?? 'default'}
${scriptSection?.title ? `- Section title context: "${scriptSection.title}"` : ''}
${scriptSection?.subtitle ? `- Subtitle: "${scriptSection.subtitle}"` : ''}

SECTION RHYTHM: ${sg.sectionRhythm}

DESIGNER NOTES (from Art Director):
${sg.designNotes}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

// ─────────────────────────────────────────────────────────────
// 섹션별 전용 프롬프트 8개
// ─────────────────────────────────────────────────────────────

function buildHeroBackgroundPrompt(script: Script, sg: StyleGuide): string {
  const hero = script.sections.find(s => s.type === 'hero')
  return `Create a premium graphic design hero background for Korean e-commerce product detail page.

${buildLayerPromptContext(sg, script, 'hero')}

━━━━━ HERO SECTION DESIGN BRIEF ━━━━━

PURPOSE: This is the FIRST impression. Must command attention and convey premium quality.

CANVAS: 860×1200px vertical (portrait)

COMPOSITION LAYOUT:
- Upper 20%: darker gradient zone (white brand name will be placed here)
- Middle 40%: light/warm focal area (product will be photographed here in next step)
- Lower 35%: gradual darkening for Korean headline overlay
- Bottom 5%: subtle fade/glow for CTA hint

VISUAL DESIGN:
- Rich gradient combining ${sg.colors.primary} and ${sg.colors.surface1}
- Layered depth: base gradient → atmospheric light → subtle texture overlay
- Texture character: ${sg.brand.moodKeywords.join(', ')} — choose linen/paper/marble/grain
- Decorative accents: thin gold lines, soft bokeh, or geometric shapes matching ${sg.decorativeElements.dividerStyle}
- Premium editorial magazine aesthetic (마켓컬리, 올가니카 수준)

${hero?.text ? `KEY MESSAGE CONTEXT: "${hero.text}"` : ''}

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: DESIGN REFERENCES — study composition, color depth, texture quality
- Last images: Product context — informs mood only, DO NOT copy layout

CRITICAL:
- NO text, NO letters, NO product images in background
- Pure DESIGNED background asset — text and product layered separately in next steps
- Must feel CRAFTED, not photographed or AI-generated
- Avoid generic stock look`
}

function buildBrandStoryBgPrompt(script: Script, sg: StyleGuide): string {
  return `Create a dark emotional brand story section background for Korean premium food detail page.

${buildLayerPromptContext(sg, script, 'brand_story')}

━━━━━ BRAND STORY DESIGN BRIEF ━━━━━

PURPOSE: Emotional storytelling. Create weight and depth. Dark/moody atmosphere.

CANVAS: 860×900px (portrait)

COMPOSITION LAYOUT:
- Full-bleed dark atmospheric background
- Center area: slightly lighter focal zone for text
- Edges: deep shadow falloff

VISUAL DESIGN:
- Dark gradient using ${sg.colors.secondary} blended with deep shadows
- Accent glow from ${sg.colors.accent} or ${sg.colors.primary} (subtle, 10-20% opacity)
- Heritage feel: aged paper, warm firelight glow, vintage darkroom aesthetic
- Depth through layered gradients — NOT flat
- Mood: ${sg.brand.moodKeywords.join(', ')}
- Dramatic editorial quality — luxury magazine spread

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: DARK STORYTELLING REFERENCES — match their emotional weight
- Last images: Product context only

${buildSafeZoneBrief(sg, 'brand_story')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- Dark but not pure black — must have depth and warmth
- Must feel CINEMATIC and INTENTIONAL`
}

function buildKeyBenefitBgPrompt(script: Script, sg: StyleGuide): string {
  return `Create a clean benefit-card-friendly section background for Korean food detail page.

${buildLayerPromptContext(sg, script, 'key_benefit')}

━━━━━ KEY BENEFIT DESIGN BRIEF ━━━━━

PURPOSE: Display product benefits as clean cards. Background must support — NOT compete with — cards.

CANVAS: 860×1000px (portrait)

COMPOSITION LAYOUT:
- Calm, uniform base — 2×2 or 3-column card grid will be placed on top
- Subtle variation across canvas to avoid flat look
- Edges slightly darker for visual frame

VISUAL DESIGN:
- Soft surface color: ${sg.colors.surface1} or ${sg.colors.surface2}
- Very subtle texture: paper grain, fabric weave (low 15% opacity)
- Single subtle decorative element: thin divider line or small accent shape
- Card drop shadows will sit on this background — ensure mid-tone brightness
- Corner radius ${sg.decorativeElements.cornerRadius} context (matching cards)

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: CARD LAYOUT REFERENCES — show card/grid backgrounds
- Last images: Product context

${buildSafeZoneBrief(sg, 'key_benefit')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- Must be SUBTLE — HTML cards with content will be the hero
- Uniform-ish but not boring
- Premium feel through quality of texture and color`
}

function buildIngredientsBgPrompt(script: Script, sg: StyleGuide): string {
  return `Create a natural materials-feel section background for ingredients/sourcing storytelling.

${buildLayerPromptContext(sg, script, 'ingredients')}

━━━━━ INGREDIENTS DESIGN BRIEF ━━━━━

PURPOSE: Showcase natural ingredients and sourcing quality. Should feel authentic, earthy, trustworthy.

CANVAS: 860×900px (portrait)

COMPOSITION LAYOUT:
- Natural full-bleed backdrop
- Organic asymmetric focal area for ingredient photos
- Text zones at edges

VISUAL DESIGN:
- Earthy gradient: ${sg.colors.surface2} with accents of ${sg.colors.primary}
- Natural material texture (strong): linen fabric, raw wood, stone, kraft paper
- Texture should be visible 30-40% — this is an "earthy" section
- Warm natural light feeling
- Handcraft aesthetic, not digital

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: INGREDIENT SOURCING DESIGN — natural aesthetic
- Last images: Product context

${buildSafeZoneBrief(sg, 'ingredients')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- Must feel AUTHENTIC and ORGANIC
- Natural imperfections in texture OK
- Convey trust through material quality`
}

function buildProcessBgPrompt(script: Script, sg: StyleGuide): string {
  return `Create a process-flow section background for artisan making steps.

${buildLayerPromptContext(sg, script, 'process')}

━━━━━ PROCESS DESIGN BRIEF ━━━━━

PURPOSE: Show sequential process steps. Background must support horizontal or vertical step flow.

CANVAS: 860×1000px (portrait)

COMPOSITION LAYOUT:
- Neutral base for 3-5 step cards/panels
- Subtle directional flow cues (horizontal lines, gentle gradient drift)
- Step circles/numbers will overlay — needs clean space

VISUAL DESIGN:
- Paper-like base: ${sg.colors.surface1} or soft cream
- Very subtle horizontal rhythm (like printed guide paper)
- Warm neutral tones, artisan feel
- Step markers will be ${sg.colors.primary} — background should contrast
- Texture: parchment, handmade paper, soft fabric (20% opacity)

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: PROCESS/TIMELINE DESIGN
- Last images: Product context

${buildSafeZoneBrief(sg, 'process')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- Clean enough for HTML step cards/icons/text to read clearly on top
- Feel of an artisan's workbook — handcrafted, authentic`
}

function buildSensoryBgPrompt(script: Script, sg: StyleGuide): string {
  return `Create an atmospheric full-bleed sensory section background.

${buildLayerPromptContext(sg, script, 'sensory')}

━━━━━ SENSORY DESIGN BRIEF ━━━━━

PURPOSE: Visual break. Evoke sensory experience (taste/texture/aroma). Atmospheric, mood-driven.

CANVAS: 860×600px (landscape-ish)

COMPOSITION LAYOUT:
- Full-bleed atmospheric composition
- No defined text zones — overlay text may come but should feel integrated
- Slight vignette at edges

VISUAL DESIGN:
- Deep atmospheric gradient: ${sg.colors.secondary} → ${sg.colors.surface2}
- Strong texture layer (30-50% opacity): steam, mist, warm light rays, bokeh
- Cinematic color grading — warm highlights, cool shadows
- Film-like quality (but NOT instructed to look like Kodak — just atmospheric)
- Macro-feel — as if zoomed into a sensory moment

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: ATMOSPHERIC/SENSORY DESIGN — match mood and depth
- Last images: Product context

${buildSafeZoneBrief(sg, 'sensory')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- NO obvious product shapes (atmospheric only)
- Must feel IMMERSIVE and EMOTIONAL
- Atmospheric — like a perfume ad or high-end food film still
- Depth through gradient and texture layering`
}

function buildPackagingBgPrompt(script: Script, sg: StyleGuide): string {
  return `Create a packaging/shipping section background emphasizing product trust.

${buildLayerPromptContext(sg, script, 'packaging')}

━━━━━ PACKAGING DESIGN BRIEF ━━━━━

PURPOSE: Show packaging quality and delivery trust. Clean, product-focused.

CANVAS: 860×900px (portrait)

COMPOSITION LAYOUT:
- Clean backdrop with product placement area (center or split)
- Minimal distractions — product is the hero
- Subtle shipping/trust cues at edges

VISUAL DESIGN:
- Clean neutral: ${sg.colors.surface1} or white-ish
- Very subtle texture: fine paper or light canvas (10% opacity)
- One accent element: thin border, subtle divider, or brand color stripe
- Feels like a premium delivery box opening — clean, crisp
- Minimal design language

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: PACKAGING DESIGN LAYOUTS
- Last images: Product context

${buildSafeZoneBrief(sg, 'packaging')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- Must feel CLEAN and TRUSTWORTHY
- HTML card with product info will be placed prominently — avoid busy backgrounds
- Minimalism with premium details`
}

function buildCtaBgPrompt(script: Script, sg: StyleGuide): string {
  return `Create a conversion-focused CTA section background for purchase action.

${buildLayerPromptContext(sg, script, 'cta')}

━━━━━ CTA DESIGN BRIEF ━━━━━

PURPOSE: Drive purchase action. Must create urgency and desire. Dramatic and focused.

CANVAS: 860×700px

COMPOSITION LAYOUT:
- Dramatic gradient background
- Center area reserved for large CTA button (${sg.colors.primary} button)
- Upper area: urgency/value text zone
- Edges: deepen for focus

VISUAL DESIGN:
- Bold gradient: ${sg.colors.primary} energized with ${sg.colors.accent} glow
- OR dark conversion-focused: dark base with ${sg.colors.accent} highlight
- Subtle radial glow toward center (where button will go)
- Premium urgency — not pushy, confident
- Button area must be visually "inviting" — not distracting

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: CTA/PURCHASE DESIGN
- Last images: Product context

${buildSafeZoneBrief(sg, 'cta')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- HTML button will be overlaid — background must FRAME the CTA, not compete with it
- Must feel PREMIUM and CONFIDENT
- Focal point area where CTA button will be placed must be calm`
}

// ─────────────────────────────────────────────────────────────
// 히어로 타이포그래피 (배경 위에 타이포 추가)
// ─────────────────────────────────────────────────────────────

function buildHeroTypographyPrompt(script: Script, sg: StyleGuide): string {
  const hero = script.sections.find(s => s.type === 'hero')
  return `You are a senior Korean graphic designer. Add premium Korean typography to this hero background.

${buildLayerPromptContext(sg, script, 'hero')}

━━━━━ TYPOGRAPHY INSTRUCTION ━━━━━

[Image 1 = the designed background] Add typography directly integrated with the composition.

TOP ZONE (top 15%):
- Brand name: "${sg.brand.name}"
- Typeface: ${sg.typography.accentFont} or ${sg.typography.storyFont}
- Style: small, refined, wide letter-spacing (~${sg.typography.letterSpacing})
- Color: ${sg.colors.accent}
- Weight: light/regular

MAIN HEADLINE ZONE (center-bottom 40%):
- Headline text: "${hero?.title ?? sg.brand.name}"
- Typeface: ${sg.typography.headlineFont} — USE THIS ACTUAL FONT STYLE
- Size: LARGE (occupies ~70% width of canvas)
- Weight: bold/heavy for hierarchy
- Color: ${sg.colors.textLight} with subtle drop shadow
- Letter-spacing: ${sg.typography.letterSpacing}

SUBTITLE ZONE (below headline):
- Text: "${hero?.subtitle ?? sg.brand.targetEmotion ?? ''}"
- Typeface: ${sg.typography.storyFont} or ${sg.typography.bodyFont}
- Size: small (${sg.typography.sizes.body}px feel)
- Weight: light
- Color: ${sg.colors.textLight} at 75% opacity

DESIGN INTEGRATION:
- Typography must feel like part of overall composition
- Natural visual hierarchy: brand → headline → subtitle
- Text shadows/glow for contrast with background
- Mood: ${sg.brand.moodKeywords.join(', ')}
- Quality: premium Korean e-commerce brand campaign level

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- Reference images show typography design examples — match quality level

CRITICAL:
- Keep background EXACTLY as provided — only ADD typography
- Korean text must be BEAUTIFUL — not "text placed on image"
- Feel like a magazine cover or premium ad campaign`
}

// ─────────────────────────────────────────────────────────────
// 섹션 타입 → 프롬프트 빌더 매핑
// ─────────────────────────────────────────────────────────────

type PromptBuilder = (script: Script, sg: StyleGuide) => string

const SECTION_PROMPT_BUILDERS: Partial<Record<string, PromptBuilder>> = {
  hero: buildHeroBackgroundPrompt,
  brand_story: buildBrandStoryBgPrompt,
  key_benefit: buildKeyBenefitBgPrompt,
  ingredients: buildIngredientsBgPrompt,
  process: buildProcessBgPrompt,
  sensory: buildSensoryBgPrompt,
  packaging: buildPackagingBgPrompt,
  cta: buildCtaBgPrompt,
}

/** conceptShot suffix — 섹션별 분기 */
function buildConceptShotPrompt(shot: ConceptShot, script: Script, sg: StyleGuide): string {
  const sectionType = shot.targetSection.toLowerCase()
  const sectionBuilder = SECTION_PROMPT_BUILDERS[sectionType]

  if (sectionBuilder) {
    return `${shot.prompt}

━━━━━ ADDITIONAL SECTION CONTEXT ━━━━━

The image will be used for a "${sectionType}" section in a Korean e-commerce detail page.

${buildLayerPromptContext(sg, script, sectionType)}

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: ${sectionType.toUpperCase()} SECTION DESIGN REFERENCES
- Last images: Product context

Purpose-specific requirement: ${shot.purpose}

${buildSafeZoneBrief(sg, sectionType)}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL: 860×800px composition.`
  }

  // 매핑 없는 섹션은 기본 suffix
  return `${shot.prompt}

${buildLayerPromptContext(sg, script, sectionType)}

${buildSafeZoneBrief(sg, sectionType)}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL: 860×800px. Premium editorial quality.`
}

/** 비주얼 브레이크 프롬프트 (sensory 전용 분리) */
function buildBreakImagePrompt(script: Script, sg: StyleGuide): string {
  // sensory가 sections 에 있는지 확인, 없으면 범용 전환 이미지로
  const hasSensory = script.sections.some(s => (s.type as string) === 'sensory')
  if (hasSensory) {
    return buildSensoryBgPrompt(script, sg)
  }

  return `Create a visual break transition design element for Korean product detail page.

${buildLayerPromptContext(sg, script, 'sensory')}

━━━━━ VISUAL BREAK DESIGN BRIEF ━━━━━

PURPOSE: Transitional atmospheric element between content sections. Emotional pause.

CANVAS: 860×500px wide format

VISUAL DESIGN:
- Atmospheric gradient: ${sg.colors.secondary} → ${sg.colors.surface2}
- Subtle texture layer: linen, paper grain, or fabric (20% opacity)
- Soft bokeh or light rays
- Cinematic editorial feel
- Edges must blend naturally with adjacent sections

━━━━━ REFERENCE IMAGES ATTACHED ━━━━━
- First images: ATMOSPHERIC TRANSITION DESIGN
- Last images: Product context

${buildSafeZoneBrief(sg, 'sensory')}
${V5_STRICT_BACKGROUND_POLICY}

CRITICAL:
- Pure atmospheric asset for visual breathing`
}

// ─────────────────────────────────────────────────────────────
// 레퍼런스 이미지 로드
// ─────────────────────────────────────────────────────────────

/** 섹션별 디자인 레퍼런스 이미지 로드 (Pinterest 크롤링 결과) */
function loadSectionRefs(sectionType: string, maxCount = 5): { data: string; mimeType: string }[] {
  const normalized = sectionType.toLowerCase()
  const refDir = path.join(process.cwd(), 'docs', 'references', 'sections', normalized)
  if (!fs.existsSync(refDir)) return []

  const files = fs.readdirSync(refDir)
    .filter(f => /\.(jpg|png|jpeg)$/i.test(f))
    .sort(() => Math.random() - 0.5)  // 랜덤화로 다양성 확보
    .slice(0, maxCount)

  const refs: { data: string; mimeType: string }[] = []
  for (const f of files) {
    try {
      const buf = fs.readFileSync(path.join(refDir, f))
      refs.push({ data: buf.toString('base64'), mimeType: 'image/jpeg' })
    } catch { /* skip */ }
  }
  return refs
}

// ─────────────────────────────────────────────────────────────
// 메인 실행
// ─────────────────────────────────────────────────────────────

/**
 * v5 Brief Executor — Art Director가 작성한 sectionImageBriefs[]를 그대로 실행.
 * 각 asset의 prompt를 Gemini에 전달, role/transparent에 따라 모델 분기.
 * Hero 텍스트 베이크 단계는 brief 시스템에서는 사용 안 함 (HTML 텍스트 오버레이 사용).
 */
async function runLayerImageWithBriefs(
  briefs: SectionImageBrief[],
  productRefs: { data: string; mimeType: string }[],
  outputDir: string,
  savedFiles: Record<string, string>
): Promise<void> {
  const totalAssets = briefs.reduce((n, b) => n + b.assets.length, 0)
  console.log(`\n[Layer Image v5 brief executor] ${briefs.length}개 섹션 / ${totalAssets}개 에셋`)

  let assetIdx = 0
  for (const brief of briefs) {
    if (!brief.assets || brief.assets.length === 0) {
      console.warn(`  ⚠️  ${brief.section}: assets 누락 — 스킵`)
      continue
    }
    const hasBg = brief.assets.some(a => a.role === 'background')
    if (!hasBg) {
      console.warn(`  ⚠️  ${brief.section}: background asset 누락 — 진행하지만 HTML 배경 비어 있을 가능성`)
    }
    console.log(`\n  ── [${brief.section}] ${brief.designIntent.substring(0, 60)}...`)
    for (const asset of brief.assets) {
      // role 검증 (잘못된 enum 값 방어)
      if (!['background', 'frame', 'accent'].includes(asset.role)) {
        console.warn(`    ⚠️  invalid role "${asset.role}" — 스킵`)
        continue
      }
      assetIdx++
      const sectionRefs = loadSectionRefs(brief.section, 4)
      const refs = asset.role === 'background'
        ? [...sectionRefs, ...productRefs.slice(0, 1)]
        : [...sectionRefs.slice(0, 2)]   // frame/accent는 제품 ref 적게
      console.log(`    [${assetIdx}/${totalAssets}] ${asset.role} → ${asset.filename} (${asset.size}${asset.transparent ? ', transparent' : ''})`)

      const model = asset.transparent
        ? MODELS.GEMINI_FLASH_IMAGE_TRANSPARENT
        : MODELS.GEMINI_PRO_IMAGE

      const result = await generateImageWithGemini({
        prompt: asset.prompt,
        model,
        referenceImages: refs,
        retryWithFallback: true,
      })

      if (result) {
        const filepath = path.join(outputDir, asset.filename)
        saveImage(result.imageBuffer, filepath)
        const key = `section_${brief.section.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_${asset.role}`
        savedFiles[key] = filepath
        console.log(`      ✓ ${key} (${result.sizeKb}KB)`)
      } else {
        console.warn(`      ✗ 생성 실패: ${asset.filename}`)
      }

      const sleepMs = parseInt(process.env.LAYER_IMAGE_SLEEP_MS ?? '2500', 10)
      await new Promise(r => setTimeout(r, sleepMs))
    }
  }
}

export async function runLayerImage(
  script: Script,
  styleGuide: StyleGuide,
  stylingShots: string[],
  nukkiPaths: string[],
  outputDir: string,
  conceptShots?: ConceptShot[],
  sectionImageBriefs?: SectionImageBrief[]
): Promise<AgentResult<Record<string, string>>> {
  const elapsed = timer()
  const usingBriefs = sectionImageBriefs && sectionImageBriefs.length > 0
  const totalSteps = usingBriefs
    ? sectionImageBriefs.reduce((n, b) => n + b.assets.length, 0)
    : 3 + (conceptShots?.length ?? 0)
  console.log(`[Layer Image v5] 시작 — ${usingBriefs ? `brief executor (${totalSteps} assets)` : `legacy v5 (${totalSteps} steps)`}`)

  const savedFiles: Record<string, string> = {}

  try {
    // 스타일링샷 + 누끼 로드 (제품 맥락용)
    const productRefs: { data: string; mimeType: string }[] = []
    for (const shotPath of stylingShots.slice(0, 2)) {
      if (fs.existsSync(shotPath)) {
        const b64 = await loadImageAsBase64(shotPath, 1200)
        productRefs.push({ data: b64, mimeType: 'image/jpeg' })
      }
    }
    if (nukkiPaths[0] && fs.existsSync(nukkiPaths[0])) {
      const b64 = await loadImageAsBase64(nukkiPaths[0], 1000, 'png')
      productRefs.push({ data: b64, mimeType: 'image/png' })
    }

    // ── v5 Brief Executor 분기 (sectionImageBriefs 있으면 우선) ──
    if (usingBriefs) {
      await runLayerImageWithBriefs(sectionImageBriefs!, productRefs, outputDir, savedFiles)
      console.log(`\n[Layer Image v5] 완료 (${elapsed()}ms) — ${Object.keys(savedFiles).length}개 에셋`)
      return { success: Object.keys(savedFiles).length > 0, data: savedFiles, durationMs: elapsed() }
    }

    // ── Step 1: 히어로 배경 ──
    console.log(`\n  [1/${totalSteps}] 히어로 배경 (섹션 전용 프롬프트)`)
    const heroDesignRefs = loadSectionRefs('hero', 5)
    console.log(`    📎 hero 디자인 레퍼런스 ${heroDesignRefs.length}장 + 제품 레퍼런스 ${productRefs.length}장`)
    const heroBgResult = await generateImageWithGemini({
      prompt: buildHeroBackgroundPrompt(script, styleGuide),
      model: MODELS.GEMINI_PRO_IMAGE,
      referenceImages: [...heroDesignRefs, ...productRefs],
      retryWithFallback: true,
    })

    if (heroBgResult) {
      const bgPath = path.join(outputDir, 'hero_background.png')
      saveImage(heroBgResult.imageBuffer, bgPath)
      savedFiles.heroBg = bgPath
      console.log(`    ✓ hero_background.png (${heroBgResult.sizeKb}KB)`)

      await new Promise(r => setTimeout(r, 3000))

      // ── Step 2: 히어로 타이포 추가 ──
      console.log(`\n  [2/${totalSteps}] 히어로 타이포 합성 (Pro 모델)`)
      const bgBase64 = (
        await sharp(heroBgResult.imageBuffer).resize(1200).jpeg({ quality: 90 }).toBuffer()
      ).toString('base64')

      const typoRefs = loadSectionRefs('hero', 2)
      const typoInputs = [{ data: bgBase64, mimeType: 'image/jpeg' }, ...typoRefs]
      console.log(`    📎 배경 1장 + 타이포 레퍼런스 ${typoRefs.length}장`)

      const heroWithTypoResult = await generateImageWithGemini({
        prompt: buildHeroTypographyPrompt(script, styleGuide),
        model: MODELS.GEMINI_PRO_IMAGE,
        referenceImages: typoInputs,
        retryWithFallback: true,
      })

      if (heroWithTypoResult) {
        const typoPath = path.join(outputDir, 'hero_with_typo.png')
        saveImage(heroWithTypoResult.imageBuffer, typoPath)
        savedFiles.heroWithTypo = typoPath
        console.log(`    ✓ hero_with_typo.png (${heroWithTypoResult.sizeKb}KB)`)
      }
    }

    await new Promise(r => setTimeout(r, 3000))

    // ── Step 3: 비주얼 브레이크 (sensory) ──
    console.log(`\n  [3/${totalSteps}] 비주얼 브레이크 디자인`)
    const sensoryDesignRefs = loadSectionRefs('sensory', 5)
    console.log(`    📎 sensory 디자인 레퍼런스 ${sensoryDesignRefs.length}장 + 제품 레퍼런스 ${productRefs.slice(0, 1).length}장`)
    const breakResult = await generateImageWithGemini({
      prompt: buildBreakImagePrompt(script, styleGuide),
      model: MODELS.GEMINI_PRO_IMAGE,
      referenceImages: [...sensoryDesignRefs, ...productRefs.slice(0, 1)],
      retryWithFallback: true,
    })
    if (breakResult) {
      const breakPath = path.join(outputDir, 'break_image.png')
      saveImage(breakResult.imageBuffer, breakPath)
      savedFiles.breakImage = breakPath
      console.log(`    ✓ break_image.png (${breakResult.sizeKb}KB)`)
    }

    // ── 컨셉샷 (Art Director 자율, 0~3장) ──
    if (conceptShots && conceptShots.length > 0) {
      for (let i = 0; i < conceptShots.length; i++) {
        const shot = conceptShots[i]
        await new Promise(r => setTimeout(r, 3000))
        console.log(`\n  [${4 + i}/${totalSteps}] 컨셉샷: ${shot.filename} → ${shot.targetSection}`)

        const conceptDesignRefs = loadSectionRefs(shot.targetSection, 4)
        console.log(`    📎 ${shot.targetSection} 디자인 레퍼런스 ${conceptDesignRefs.length}장 + 제품 레퍼런스 ${productRefs.slice(0, 2).length}장`)

        const conceptResult = await generateImageWithGemini({
          prompt: buildConceptShotPrompt(shot, script, styleGuide),
          model: MODELS.GEMINI_PRO_IMAGE,
          referenceImages: [...conceptDesignRefs, ...productRefs.slice(0, 2)],
          retryWithFallback: true,
        })

        if (conceptResult) {
          const baseName = path.basename(shot.filename, path.extname(shot.filename))
          const conceptPath = path.join(outputDir, `${baseName}.png`)
          saveImage(conceptResult.imageBuffer, conceptPath)
          const key = `section_${shot.targetSection.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`
          savedFiles[key] = conceptPath
          console.log(`    ✓ ${shot.filename} → ${key} (${conceptResult.sizeKb}KB)`)
        }
      }
    }

    // ── v5: layoutPatterns 중 bgType='layer-image'인 누락 섹션 자동 채움 ──
    const sectionsToFill = styleGuide.layoutPatterns
      .filter(lp => lp.bgType === 'layer-image')
      .map(lp => lp.section.toLowerCase())
      .filter(sec => {
        if (sec === 'hero') return false  // hero_background.png로 처리됨
        if (sec === 'sensory') return false  // break_image.png로 처리됨
        const key = `section_${sec.replace(/[^a-z0-9_]/g, '_')}`
        return !savedFiles[key]  // 컨셉샷에서 이미 생성된 섹션 제외
      })
      .filter(sec => SECTION_PROMPT_BUILDERS[sec])  // 빌더 있는 섹션만

    if (sectionsToFill.length > 0) {
      console.log(`\n  [v5 fill] layer-image 미생성 섹션 ${sectionsToFill.length}개: ${sectionsToFill.join(', ')}`)
      for (let i = 0; i < sectionsToFill.length; i++) {
        const sec = sectionsToFill[i]
        await new Promise(r => setTimeout(r, 3000))
        console.log(`\n  [v5 fill ${i + 1}/${sectionsToFill.length}] ${sec} 배경 생성`)

        const builder = SECTION_PROMPT_BUILDERS[sec]
        if (!builder) continue

        const designRefs = loadSectionRefs(sec, 5)
        console.log(`    📎 ${sec} 디자인 레퍼런스 ${designRefs.length}장 + 제품 레퍼런스 ${productRefs.slice(0, 1).length}장`)

        const bgResult = await generateImageWithGemini({
          prompt: builder(script, styleGuide),
          model: MODELS.GEMINI_PRO_IMAGE,
          referenceImages: [...designRefs, ...productRefs.slice(0, 1)],
          retryWithFallback: true,
        })

        if (bgResult) {
          const bgPath = path.join(outputDir, `section_${sec}_bg.png`)
          saveImage(bgResult.imageBuffer, bgPath)
          const key = `section_${sec}`
          savedFiles[key] = bgPath
          console.log(`    ✓ section_${sec}_bg.png → ${key} (${bgResult.sizeKb}KB)`)
        }
      }
    }

    console.log(`\n[Layer Image v5] 완료 (${elapsed()}ms) — ${Object.keys(savedFiles).length}개 생성`)
    return { success: Object.keys(savedFiles).length > 0, data: savedFiles, durationMs: elapsed() }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Layer Image v4] 실패:', msg.substring(0, 200))
    return { success: false, error: msg, durationMs: elapsed() }
  }
}
