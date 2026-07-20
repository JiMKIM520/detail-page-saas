/**
 * 토큰 프리셋 + 브랜드색 기반 토큰 도출.
 * 변형(블록)은 토큰 무관하게 동작하고, 토큰만 바꿔도 페이지 분위기가 달라진다.
 */
import type { Tokens } from './types'
import { resolveWhitelistFont, isBodySafeFont } from './shared'

/** 스타일 A — 따뜻한 플레이풀 푸드 (Black Han Sans + 말풍선/워터마크). */
export const warmPlayful: Tokens = {
  bg: '#FAF5EE',
  paper: '#FFFFFF',
  ink: '#2A2118',
  ink2: '#3D3025',
  muted: '#6D5A44',
  accent: '#E8801F',
  accentDark: '#CE6A10',
  brand: '#2A2118',
  line: '#E4D7C5',
  fontDisplay: "'가나초콜릿체', sans-serif",
  fontBody: "'SUIT', sans-serif",
  fontSerif: "'MaruBuri', serif",
  fontHand: "'tvN 즐거운이야기', sans-serif",
}

/** 스타일 B — 모던 에디토리얼 (명조 + 헤어라인 + 여백). */
export const modernEditorial: Tokens = {
  bg: '#F6F4EF',
  paper: '#FFFFFF',
  ink: '#1C1A17',
  ink2: '#3A352D',
  muted: '#6E6756',
  accent: '#B5532E',
  accentDark: '#8F3F22',
  brand: '#1C1A17',
  line: '#DED7CA',
  fontDisplay: "'NanumSquare', sans-serif",
  fontBody: "'SUIT', sans-serif",
  fontSerif: "'Nanum Myeongjo', serif",
  fontHand: "'가나초콜릿체', sans-serif",
}

/** 스타일 C — 코발트 프리미엄 (와디즈 200섹션 템플릿 시그니처: Paperlogy + Cafe24 + 코발트/딥플럼).
 *  fontDisplay=Paperlogy(제목, 800), fontSerif=Cafe24 ClassicType(대형 숫자), fontHand=Cafe24 Dangdanghae(둥근 카피). */
export const cobaltPremium: Tokens = {
  bg: '#F3F5FF',
  paper: '#FFFFFF',
  ink: '#1B1B2E',
  ink2: '#33344F',
  muted: '#5A5F7E',
  accent: '#5874D7',
  accentDark: '#3E57BE',
  brand: '#271633',
  line: '#DDE4FF',
  fontDisplay: "'SUIT', sans-serif",
  fontBody: "'SUIT', sans-serif",
  fontSerif: "'Nanum Myeongjo', serif",
  fontHand: "'tvN 즐거운이야기', sans-serif",
}

/** 스타일 D — 샌드 럭셔리 (와디즈 템플릿 시그니처 폰트 + 따뜻한 캐러멜/크림 팔레트).
 *  cobalt-premium과 동일한 레이아웃/폰트지만 컬러만 웜톤 → 식품(빵/디저트 등) 스타일링샷과 조화. */
export const sandLuxury: Tokens = {
  bg: '#F7F1E8',
  paper: '#FFFFFF',
  ink: '#2A1E13',
  ink2: '#5C4A37',
  muted: '#6D5B45',
  accent: '#B47B3C',
  accentDark: '#8C5C28',
  brand: '#2A1E13',
  line: '#E8DECB',
  fontDisplay: "'MaruBuri', serif",
  fontBody: "'SUIT', sans-serif",
  fontSerif: "'Nanum Myeongjo', serif",
  fontHand: "'가나초콜릿체', sans-serif",
}

export const TOKEN_PRESETS: Record<string, Tokens> = {
  'warm-playful': warmPlayful,
  'modern-editorial': modernEditorial,
  'cobalt-premium': cobaltPremium,
  'sand-luxury': sandLuxury,
}

export type PresetKey = 'warm-playful' | 'modern-editorial' | 'cobalt-premium' | 'sand-luxury'

/**
 * 카테고리 → 프리미엄 프리셋 매핑.
 * AI는 식품류에 warm-playful(소금빵 데모와 동일)을 고르는 편향이 있어, 카테고리별로
 * 와디즈 200섹션 시그니처 프리셋(Paperlogy/Cafe24, cobalt/sand)을 기본값으로 강제해
 * "프리미엄 템플릿"이 실제로 노출되게 한다. 색조는 brandColors가 다시 덮어쓴다.
 */
export function presetForCategory(category?: string): PresetKey {
  const c = (category ?? '').toLowerCase()
  // 한글/영문 키워드 모두 매칭 — 4개 프리셋을 카테고리 성격에 맞게 분산
  // (뷰티·건강·전자가 전부 cobalt로 몰리고 warm-playful이 미사용이던 매핑을 재배치.
  //  식품은 warm-playful 편향 방지를 위해 sand-luxury 유지 — 위 주석 참조)
  if (/(pet|반려|강아지|고양이|애완|키즈|유아|완구)/.test(c)) return 'warm-playful'
  if (/(beauty|뷰티|화장품|코스메틱|스킨케어)/.test(c)) return 'modern-editorial'
  if (/(fashion|패션|의류|잡화|액세서리)/.test(c)) return 'modern-editorial'
  if (/(health|건강|영양|supplement|헬스)/.test(c)) return 'cobalt-premium'
  if (/(electronic|전자|가전|디지털|테크|tech)/.test(c)) return 'cobalt-premium'
  if (/(food|식품|음식|먹|디저트|베이커리|빵|커피|카페|농축수산)/.test(c)) return 'sand-luxury'
  if (/(living|생활|리빙|홈|인테리어)/.test(c)) return 'sand-luxury'
  return 'cobalt-premium'
}

const HEX_RE = /^#?([0-9a-fA-F]{6})$/

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = HEX_RE.exec((hex ?? '').trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function mix(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number): string {
  return toHex(c1.r + (c2.r - c1.r) * t, c1.g + (c2.g - c1.g) * t, c1.b + (c2.b - c1.b) * t)
}

const BLACK = { r: 0, g: 0, b: 0 }
const WARM_WHITE = { r: 250, g: 246, b: 239 }

/**
 * 프리셋을 기반으로 브랜드 색을 입혀 토큰을 도출.
 * - accent = 브랜드 강조색(있으면) / 프리셋 accent
 * - brand  = 브랜드 메인색(있으면) / 프리셋 brand
 * - bg     = 브랜드 메인색을 따뜻한 화이트로 93% 섞은 밝은 배경 (프리셋 bg 대체, 선택)
 * 폰트/구조는 프리셋 유지 → 스타일 방향은 프리셋이, 색조는 브랜드가 결정.
 */
/** WCAG 상대 휘도 기반 대비율 — 스타일가이드 색 오버라이드의 가독성 가드(Sprint 4-D) */
function luminance(c: { r: number; g: number; b: number }): number {
  const f = (v: number): number => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
}
function contrastRatio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}
const WHITE = { r: 255, g: 255, b: 255 }

/** 아트디렉터 스타일가이드 → 토큰 오버라이드 입력 (Sprint 4-D; 형태 축은 Sprint 6) */
export interface StyleGuideTokenInput {
  colors?: {
    primary?: string
    accent?: string
    surface1?: string
    surface2?: string
    textDark?: string
  }
  typography?: {
    headlineFont?: string
    storyFont?: string
    bodyFont?: string
    accentFont?: string
  }
  /** 아트디렉터가 명시한 형태 언어 (SHAPE_PRESETS 키). 미지정 시 moodKeywords로 결정 */
  shapeLanguage?: string
  /** 형태 언어 폴백 결정용 무드 키워드 (brand.moodKeywords) */
  moodKeywords?: string[]
}

/** ── 형태 언어 프리셋 (Sprint 6) ─────────────────────────────────────────────
 *  팔레트·폰트만 바뀌고 기하학이 고정이라 "색만 다른 같은 템플릿"이 되는 문제의 해법.
 *  같은 343개 변형이 브랜드마다 다른 곡률·사진 프레임·여백 리듬으로 렌더된다.
 *  photoShape는 지정 시 페이지의 시그니처 사진 프레임을 하나의 형태 언어로 통일
 *  (미지정 프리셋은 변형 고유 모양 유지 — fallback 체인). */
export interface ShapeTokens {
  rScale: number
  photoShape?: string
  padX: number
}

export const SHAPE_PRESETS: Record<string, ShapeTokens> = {
  /** 직각·타이트 곡률·넓은 여백 — 미니멀/에디토리얼/모던 */
  'sharp-editorial': { rScale: 0.25, photoShape: '0', padX: 64 },
  /** 큰 곡률·둥근 프레임 — 부드러움/포근함/키즈/반려 */
  'soft-round': { rScale: 1.7, photoShape: '30px', padX: 52 },
  /** 유기적 블롭 프레임·그레인 곡률 — 자연/수제/유기농 */
  organic: { rScale: 1.25, photoShape: '46% 54% 52% 48% / 44% 46% 56% 54%', padX: 52 },
  /** 아치 프레임·절제 곡률 — 클래식/전통/명조 감성 */
  'arch-serif': { rScale: 0.7, photoShape: '50% 50% 6px 6px / 34% 34% 6px 6px', padX: 60 },
  /** 현행 기하학 유지(곡률·프레임 그대로) — 균형/범용 */
  neutral: { rScale: 1, padX: 56 },
}

export type ShapeKey = keyof typeof SHAPE_PRESETS

/** 무드 키워드 → 형태 언어 결정 테이블 — 아트디렉터 shapeLanguage 부재 시 폴백.
 *  기존 프로젝트(스타일가이드에 형태 축이 없던 시절)도 즉시 분화되게 한다. */
export function shapeForMood(moodKeywords?: string[], category?: string): ShapeKey {
  const m = (moodKeywords ?? []).join(' ').toLowerCase() + ' ' + (category ?? '').toLowerCase()
  if (/(미니멀|모던|시크|절제|도시|프로페셔널|minimal|modern|sleek|urban)/.test(m)) return 'sharp-editorial'
  if (/(귀여|포근|부드러|사랑스|발랄|키즈|유아|반려|강아지|고양이|cute|soft|playful|friendly)/.test(m)) return 'soft-round'
  if (/(자연|유기농|수제|핸드메이드|건강한|신선|대지|숲|오가닉|natural|organic|handmade|earthy)/.test(m)) return 'organic'
  if (/(클래식|전통|헤리티지|장인|프리미엄|고급|우아|classic|heritage|elegant|luxury)/.test(m)) return 'arch-serif'
  return 'neutral'
}

export function deriveTokens(
  presetKey: string,
  brandColors?: string[],
  opts?: { tintBackground?: boolean; styleGuide?: StyleGuideTokenInput },
): Tokens {
  const preset = TOKEN_PRESETS[presetKey] ?? warmPlayful
  const valid = (brandColors ?? []).map((c) => parseHex(c)).filter((x): x is { r: number; g: number; b: number } => x !== null)

  const brandRgb = valid[0]
  const accentRgb = valid[1] ?? valid[0]

  const next: Tokens = { ...preset }
  if (brandRgb) {
    next.brand = toHex(brandRgb.r, brandRgb.g, brandRgb.b)
    next.ink = mix(brandRgb, BLACK, 0.62)
    next.ink2 = mix(brandRgb, BLACK, 0.42)
    if (opts?.tintBackground) next.bg = mix(brandRgb, WARM_WHITE, 0.93)
  }
  if (accentRgb) {
    next.accent = toHex(accentRgb.r, accentRgb.g, accentRgb.b)
    next.accentDark = mix(accentRgb, BLACK, 0.18)
  }

  // ── 스타일가이드 오버라이드 (Sprint 4-D) — 아트디렉터 기획을 실제 토큰에 반영.
  // 각 색은 가독성 대비 가드 통과 시만 적용, 폰트는 화이트리스트만 — 미달은 조용히 프리셋/브랜드색 유지.
  const sg = opts?.styleGuide
  if (sg) {
    const applied: string[] = []
    const skipped: string[] = []
    const c = sg.colors ?? {}
    const inkRgb = (): { r: number; g: number; b: number } => parseHex(next.ink) ?? BLACK

    const bgCand = parseHex(c.surface1 ?? '')
    if (bgCand) {
      if (contrastRatio(inkRgb(), bgCand) >= 7) {
        next.bg = toHex(bgCand.r, bgCand.g, bgCand.b)
        applied.push('bg')
      } else skipped.push('bg(대비)')
    }
    const paperCand = parseHex(c.surface2 ?? '')
    if (paperCand) {
      if (contrastRatio(inkRgb(), paperCand) >= 7) {
        next.paper = toHex(paperCand.r, paperCand.g, paperCand.b)
        applied.push('paper')
      } else skipped.push('paper(대비)')
    }
    const inkCand = parseHex(c.textDark ?? '')
    if (inkCand) {
      const bgNow = parseHex(next.bg) ?? WHITE
      if (contrastRatio(inkCand, bgNow) >= 7) {
        next.ink = toHex(inkCand.r, inkCand.g, inkCand.b)
        next.ink2 = mix(inkCand, WHITE, 0.24)
        applied.push('ink')
      } else skipped.push('ink(대비)')
    }
    const primaryCand = parseHex(c.primary ?? '')
    if (primaryCand) {
      // brand는 다크 섹션 배경(흰 텍스트) — 흰색과의 대비가 확보돼야 한다
      if (contrastRatio(WHITE, primaryCand) >= 4.5) {
        next.brand = toHex(primaryCand.r, primaryCand.g, primaryCand.b)
        applied.push('brand')
      } else skipped.push('brand(대비)')
    }
    const accentCand = parseHex(c.accent ?? '')
    if (accentCand) {
      const paperNow = parseHex(next.paper) ?? WHITE
      if (contrastRatio(accentCand, paperNow) >= 3) {
        next.accent = toHex(accentCand.r, accentCand.g, accentCand.b)
        next.accentDark = mix(accentCand, BLACK, 0.18)
        applied.push('accent')
      } else skipped.push('accent(대비)')
    }

    const t = sg.typography ?? {}
    // shared의 화이트리스트 — 동적 import 불가 위치라 lazy require 대신 정적 import 사용
    const setFont = (key: 'fontDisplay' | 'fontBody' | 'fontSerif' | 'fontHand', family: string | undefined, generic: string): void => {
      if (!family?.trim()) return
      const canonical = resolveWhitelistFont(family)
      if (canonical) {
        next[key] = `'${canonical}', ${generic}`
        applied.push(key)
      } else skipped.push(`${key}(${family.trim()})`)
    }
    setFont('fontDisplay', t.headlineFont, 'sans-serif')
    // bodyFont: 세리프·손글씨·디스플레이 차단 — 산세리프만 허용 (art-director 규칙 강제)
    if (!isBodySafeFont(t.bodyFont))
      skipped.push(`fontBody(${t.bodyFont!.trim()})·비산세리프`)
    else
      setFont('fontBody', t.bodyFont, 'sans-serif')
    setFont('fontSerif', t.storyFont, 'serif')
    setFont('fontHand', t.accentFont, 'sans-serif')

    if (applied.length || skipped.length)
      console.log(`[tokens] 스타일가이드 반영 — 적용: ${applied.join(',') || '없음'} · 폴백: ${skipped.join(',') || '없음'}`)
  }

  // ── 다크 섹션 강조색 (--em-dark) — 전역 .em은 accent-d(밝은 배경용)라 brand 다크 배경에서
  // 저대비로 뭉개진다(황태 callout "꾸준한 섭취" 실사례, 시각 감사 검출). accent를 흰색 쪽으로
  // 밝혀 brand 대비 4.5:1을 보장하는 색을 항상 도출 — 다크 변형들이 스코프 오버라이드로 소비.
  {
    const brandRgbNow = parseHex(next.brand) ?? BLACK
    let emRgb = parseHex(next.accent) ?? WHITE
    for (let t = 0; t <= 1.0001 && contrastRatio(emRgb, brandRgbNow) < 4.5; t += 0.15) {
      const mixed = parseHex(mix(parseHex(next.accent) ?? WHITE, WHITE, t))
      if (mixed) emRgb = mixed
    }
    if (contrastRatio(emRgb, brandRgbNow) < 4.5) emRgb = { r: 255, g: 247, b: 234 } // 웜 화이트 폴백
    next.emDark = toHex(emRgb.r, emRgb.g, emRgb.b)
  }

  // ── 형태 언어 (Sprint 6) — shapeLanguage(아트디렉터 명시) 우선, 없으면 무드 키워드 결정.
  // 스타일가이드 자체가 없으면 형태 토큰 미지정 → 현행 렌더와 픽셀 동일(하위 호환).
  if (sg) {
    const explicit = (sg.shapeLanguage ?? '').trim()
    const shapeKey: ShapeKey = explicit in SHAPE_PRESETS ? (explicit as ShapeKey) : shapeForMood(sg.moodKeywords)
    const shape = SHAPE_PRESETS[shapeKey]
    next.rScale = shape.rScale
    next.photoShape = shape.photoShape
    next.padX = shape.padX
    console.log(
      `[tokens] 형태 언어 — ${shapeKey}${explicit && !(explicit in SHAPE_PRESETS) ? ` (미지원 "${explicit}" → 무드 폴백)` : explicit ? ' (아트디렉터 명시)' : ' (무드 폴백)'} · rScale ${shape.rScale} · padX ${shape.padX}`,
    )
  }
  return next
}
