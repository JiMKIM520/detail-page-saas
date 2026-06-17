/**
 * 토큰 프리셋 + 브랜드색 기반 토큰 도출.
 * 변형(블록)은 토큰 무관하게 동작하고, 토큰만 바꿔도 페이지 분위기가 달라진다.
 */
import type { Tokens } from './types'

/** 스타일 A — 따뜻한 플레이풀 푸드 (Black Han Sans + 말풍선/워터마크). */
export const warmPlayful: Tokens = {
  bg: '#FAF5EE',
  paper: '#FFFFFF',
  ink: '#2A2118',
  ink2: '#3D3025',
  muted: '#8A7560',
  accent: '#E8801F',
  accentDark: '#CE6A10',
  brand: '#2A2118',
  line: '#E4D7C5',
  fontDisplay: "'Black Han Sans', sans-serif",
  fontBody: "'Pretendard', sans-serif",
  fontSerif: "'Gowun Batang', serif",
  fontHand: "'Gaegu', cursive",
}

/** 스타일 B — 모던 에디토리얼 (명조 + 헤어라인 + 여백). */
export const modernEditorial: Tokens = {
  bg: '#F6F4EF',
  paper: '#FFFFFF',
  ink: '#1C1A17',
  ink2: '#3A352D',
  muted: '#9A9384',
  accent: '#B5532E',
  accentDark: '#8F3F22',
  brand: '#1C1A17',
  line: '#DED7CA',
  fontDisplay: "'Gowun Batang', serif",
  fontBody: "'Pretendard', sans-serif",
  fontSerif: "'Gowun Batang', serif",
  fontHand: "'Gaegu', cursive",
}

/** 스타일 C — 코발트 프리미엄 (와디즈 200섹션 템플릿 시그니처: Paperlogy + Cafe24 + 코발트/딥플럼).
 *  fontDisplay=Paperlogy(제목, 800), fontSerif=Cafe24 ClassicType(대형 숫자), fontHand=Cafe24 Dangdanghae(둥근 카피). */
export const cobaltPremium: Tokens = {
  bg: '#F3F5FF',
  paper: '#FFFFFF',
  ink: '#1B1B2E',
  ink2: '#33344F',
  muted: '#8488A6',
  accent: '#5874D7',
  accentDark: '#3E57BE',
  brand: '#271633',
  line: '#DDE4FF',
  fontDisplay: "'Paperlogy', sans-serif",
  fontBody: "'Pretendard', sans-serif",
  fontSerif: "'Paperlogy', sans-serif",
  fontHand: "'Cafe24 Dangdanghae', sans-serif",
}

/** 스타일 D — 샌드 럭셔리 (와디즈 템플릿 시그니처 폰트 + 따뜻한 캐러멜/크림 팔레트).
 *  cobalt-premium과 동일한 레이아웃/폰트지만 컬러만 웜톤 → 식품(빵/디저트 등) 스타일링샷과 조화. */
export const sandLuxury: Tokens = {
  bg: '#F7F1E8',
  paper: '#FFFFFF',
  ink: '#2A1E13',
  ink2: '#5C4A37',
  muted: '#9C8A72',
  accent: '#B47B3C',
  accentDark: '#8C5C28',
  brand: '#2A1E13',
  line: '#E8DECB',
  fontDisplay: "'Paperlogy', sans-serif",
  fontBody: "'Pretendard', sans-serif",
  fontSerif: "'Paperlogy', sans-serif",
  fontHand: "'Cafe24 Dangdanghae', sans-serif",
}

export const TOKEN_PRESETS: Record<string, Tokens> = {
  'warm-playful': warmPlayful,
  'modern-editorial': modernEditorial,
  'cobalt-premium': cobaltPremium,
  'sand-luxury': sandLuxury,
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
export function deriveTokens(
  presetKey: string,
  brandColors?: string[],
  opts?: { tintBackground?: boolean },
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
  return next
}
