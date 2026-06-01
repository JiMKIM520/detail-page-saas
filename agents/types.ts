/**
 * DetailAI — 에이전트 공유 타입 정의
 */

// ─── 기업 입력 ───────────────────────────────────────────────
export interface ProjectInput {
  // Step 1. 기본 정보
  productName: string
  category: string          // 카테고리 슬러그 또는 자유 입력
  platform: string          // 플랫폼 슬러그 또는 자유 입력
  productHighlights: string
  targetAudience: string

  // Step 2. 브랜드 아이덴티티
  brandLogoPath?: string
  brandColors?: string[]    // HEX codes
  homepageUrl?: string
  snsUrl?: string
  existingDetailUrl?: string

  // Step 3. 디자인 선호도
  styleDirections?: string[]
  toneKeywords?: string[]

  // Step 4. 레퍼런스
  referenceImagePaths?: string[]
  referenceUrls?: string[]
  referenceDescription?: string

  // Step 5. 포함 희망 사항
  certificationImagePaths?: string[]
  requiredPhrases?: string[]
  requiredImagePaths?: string[]
  eventInfo?: string
  legalNotices?: string

  // Step 6. 금지사항
  forbiddenStyles?: string[]
  forbiddenColors?: string[]
  forbiddenWords?: string[]
  competitorRestrictions?: string[]

  // Step 7. 자료 (관리자가 업로드)
  nukkiPaths: string[]      // 관리자 촬영 누끼컷 (필수)
  productPhotoPaths?: string[]
}

// ─── 프로젝트 브리프 (PM 출력) ───────────────────────────────
export interface ProjectBrief {
  projectId: string
  productName: string
  category: string
  platform: string
  targetAudience: string
  keyHighlights: string[]
  brandColors: string[]
  styleDirection: string
  toneKeywords: string[]
  requiredContent: {
    phrases: string[]
    images: string[]
    certifications: string[]
  }
  restrictions: {
    styles: string[]
    colors: string[]
    words: string[]
  }
  generatedAt: string
}

// ─── 스타일 가이드 (Art Director 출력) ──────────────────────
export interface StyleGuide {
  brand: {
    name: string
    moodKeywords: string[]
    targetEmotion: string
  }
  colors: {
    primary: string
    secondary: string
    surface1: string
    surface2: string
    surface3: string
    textDark: string
    textLight: string
    accent: string
  }
  typography: {
    headlineFont: string
    storyFont: string
    bodyFont: string
    accentFont: string
    sizes: {
      hero: number
      h2: number
      h3: number
      body: number
      caption: number
    }
    weights: {
      headline: string
      body: string
    }
    letterSpacing: string
  }
  icons: {
    library: 'phosphor' | 'lucide' | 'tabler' | 'iconoir'
    weight: string
    size: number
    primaryColor: string
    useCases: Record<string, string>
  }
  decorativeElements: {
    dividerStyle: string
    cornerRadius: string
    shadows: string
  }
  layoutPatterns: LayoutPattern[]
  sectionRhythm: string
  referenceUrls: string[]
  designNotes: string
  selectedTemplateId?: string   // 카테고리 템플릿 ID (Art Director 선택)
}

export type LayoutPatternType =
  // ── 기존 8종 ──
  | 'full-bleed-hero'
  | 'left-image-right-text'
  | 'right-image-left-text'
  | 'full-bleed-sensory'
  | 'dark-story-centered'
  | 'numbered-steps-horizontal'
  | 'grid-info-cards'
  | 'photo-gallery-strip'
  // ── 신규 8종 ──
  | 'masonry-gallery'
  | 'split-text-heavy'
  | 'centered-statement'
  | 'icon-feature-row'
  | 'comparison-table'
  | 'timeline-vertical'
  | 'full-bleed-overlay'
  | 'testimonial-quote'

// ── 3-레이어 오버레이 시스템 (v5) ──────────────────────────────
// Layer 1: 배경 (bgType) → Gemini PNG 또는 CSS gradient/solid/SVG
// Layer 2: 카드 (cardStyle + overlayStrategy) → HTML/SVG로 렌더
// Layer 3: 텍스트 (textPlacement) → vector

/** 섹션 배경 생성 방식 */
export type BgType =
  | 'layer-image'   // Gemini로 생성한 decorative PNG (text/box/product-free)
  | 'gradient'      // CSS linear/radial gradient
  | 'solid'         // 단색
  | 'texture-svg'   // 인라인 SVG 패턴

/** 카드(박스) 시각 스타일 */
export type CardStyle =
  | 'elevated'      // shadow + 흰 배경
  | 'flat'          // 단색 배경, shadow 없음
  | 'outlined'      // 보더만, 배경 투명
  | 'glass'         // backdrop-filter blur 반투명
  | 'none'          // 카드 없음 (full-bleed 텍스트)

/** 카드 배치 전략 */
export type OverlayStrategy =
  | 'center-card'    // 중앙 1개 큰 카드 (brand_story, cta)
  | 'side-card'      // 좌/우 50% 카드 + 배경 나머지 (ingredients)
  | 'split-card'     // 좌 이미지 + 우 카드 (packaging)
  | 'full-bleed'     // 카드 없음, 텍스트 오버레이만 (hero, sensory)
  | 'stacked-cards'  // 수직 타임라인 카드 (process)
  | 'bento-grid'     // 2×2 4카드 (key_benefit)

/** 텍스트/카드 배치 위치 (safe zone 결정에 사용) */
export type TextPlacement =
  | 'top'
  | 'center'
  | 'bottom'
  | 'side-right'
  | 'side-left'

export interface LayoutPattern {
  section: string
  pattern: LayoutPatternType
  backgroundStyle: string

  // ── v5 신규: 3-레이어 시스템용 (선택적, 점진 도입) ──
  /** 배경 생성 방식. 미지정 시 'gradient' 또는 backgroundStyle에서 추론 */
  bgType?: BgType
  /** 카드 시각 스타일. 미지정 시 overlayStrategy에 따라 기본값 */
  cardStyle?: CardStyle
  /** 카드 배치 전략. 미지정 시 pattern에서 추론 */
  overlayStrategy?: OverlayStrategy
  /** 텍스트/카드 배치 위치. layer-image 생성 시 safe zone 결정에 사용 */
  textPlacement?: TextPlacement
  /** bento-grid 등에서 카드 개수 */
  cardCount?: number
}

// ─── 스타일링샷 프롬프트 (Art Director 출력) ─────────────────
export interface StylingShot {
  name: string
  filename: string
  composition: string
  surface: string
  props: string[]
  lighting: string
  camera: string
  mood: string
}

export interface ConceptShot {
  filename: string
  purpose: string
  targetSection: string
  prompt: string
}

// ── v5: 멀티 에셋 레이어 이미지 시스템 ──────────────────────────
// Art Director가 섹션별로 1~3개 에셋의 정밀 프롬프트를 직접 작성.
// Layer Image는 brief executor 역할만 (하드코딩 템플릿 폐기).

export type SectionImageAssetRole =
  | 'background'         // 필수 — full-bleed decorative (no text/box/product)
  | 'frame'              // 선택 — transparent ornamental border/frame
  | 'accent'             // 선택 — small transparent decorative element

export interface SectionImageAsset {
  role: SectionImageAssetRole
  /** Gemini-ready 영어 프롬프트 (Art Director 작성). */
  prompt: string
  /** 출력 파일명. 예: "brand_story_bg.png" */
  filename: string
  /** 권장 사이즈. 예: "860x900", "780x740", "120x120" */
  size: string
  /** true면 transparent 지원 모델로 분기 (Gemini 2.5 Flash Image). */
  transparent?: boolean
  /** 디자이너용 한국어 메모 (선택). */
  notes?: string
}

export interface SectionImageBrief {
  /** layoutPatterns의 section과 매칭. */
  section: string
  /** 한국어로 작성된 디자인 의도 (디버깅/재현용). */
  designIntent: string
  /** 텍스처 힌트. 예: "linen paper", "dark wood grain". */
  textureHint: string
  /** 조명 무드. 예: "golden hour", "soft studio". */
  lightingMood: string
  /** 분위기 키워드. 예: ["intimate", "warm", "handcrafted"]. */
  atmosphericKeywords: string[]
  /** 1~3개 에셋. background 1개 필수 + frame/accent 0~2개. */
  assets: SectionImageAsset[]
}

export interface StylingPromptsJson {
  productPreservationRules: string[]
  shots: StylingShot[]
  /** @deprecated v5에서 sectionImageBriefs로 대체. 점진 제거. */
  conceptShots?: ConceptShot[]
  /** v5 — 모든 layer-image bgType 섹션에 의무. */
  sectionImageBriefs?: SectionImageBrief[]
}

// ─── 스크립트 (Script Writer 출력) ──────────────────────────
export interface ScriptSection {
  type: 'hero' | 'benefits' | 'features' | 'how_to_use' | 'social_proof' | 'comparison' | 'cta' | 'brand_story' | 'certifications' | 'delivery' | 'usage' | 'story' | 'ingredients' | 'packaging'
  title?: string
  subtitle?: string
  text?: string
  items?: { title: string; description: string; icon_suggestion?: string }[]
  steps?: string[]
  image_description?: string
}

export interface Script {
  sections: ScriptSection[]
  shooting_requirements: {
    nukki_shots: string[]
    styling_shots: string[]
    additional_notes: string
  }
  tone: string
  color_suggestion: string
  key_insights: string
}

// ─── 정제된 카피 (Copy Writer 출력) ─────────────────────────
export interface RefinedCopy {
  sections: {
    sectionType: string
    headline: string
    subheadline?: string
    body?: string
    items?: { label: string; value: string }[]
  }[]
}

// ─── QA 리포트 ───────────────────────────────────────────────
export interface ComplianceReport {
  passed: boolean
  issues: {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    type: 'legal' | 'required_content' | 'restriction'
    description: string
    location: string
    suggestion?: string
  }[]
  checkedAt: string
}

// ─── Validator 리포트 ────────────────────────────────────────
export interface ValidationReport {
  passed: boolean
  issues: {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    rule: string
    description: string
  }[]
  scores: {
    iconConsistency: number
    colorConsistency: number
    typographyConsistency: number
    rhythmConsistency: number
    noEmoji: boolean
    toneMatch: number
  }
  checkedAt: string
}

// ─── SVG Builder 레이아웃 추출 ───────────────────────────────

export interface ElementBounds {
  top: number
  left: number
  width: number
  height: number
}

export interface LayoutElement {
  type: 'text' | 'image'
  bounds: ElementBounds
  content?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: string
  color?: string
  textAlign?: string
  lineHeight?: number
  src?: string
}

export interface SectionLayout {
  sectionIndex: number
  sectionType: string
  sectionBounds: ElementBounds
  backgroundColor: string
  backgroundImage?: string
  elements: LayoutElement[]
}

// ─── 에이전트 공통 결과 래퍼 ────────────────────────────────
export interface AgentResult<T> {
  success: boolean
  data?: T
  error?: string
  durationMs?: number
}
