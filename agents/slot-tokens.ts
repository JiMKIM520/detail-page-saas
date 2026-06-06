/**
 * Slot Tokens — 슬롯템플릿 경로의 "축소된 Art Director".
 *
 * 슬롯템플릿은 레이아웃/폰트/CSS가 고정이므로 풀 StyleGuide(8색·4폰트·레이아웃) 생성이 불필요하다.
 * 슬롯 경로가 필요로 하는 것은 브랜드 색 토큰(FoodTokens) 4개뿐 → 브랜드색에서 결정론적으로 도출.
 * (LLM 호출/비용 없음, 재현 가능, 테스트 가능)
 */
import type { FoodTokens } from './templates/slots/food-slot'

/** 현재 식품 슬롯템플릿 ID (변형 추가 시 확장) */
export const FOOD_SLOT_TEMPLATE_ID = 'food_slot_dubrow_01'

const HEX_RE = /^#?([0-9a-fA-F]{6})$/

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = HEX_RE.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** color1 → color2 를 t(0~1)만큼 섞음 (t=1이면 완전 color2) */
function mix(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number): string {
  return toHex(c1.r + (c2.r - c1.r) * t, c1.g + (c2.g - c1.g) * t, c1.b + (c2.b - c1.b) * t)
}

const BLACK = { r: 0, g: 0, b: 0 }
const WARM_WHITE = { r: 250, g: 246, b: 239 } // cream을 살짝 따뜻하게

const DEFAULT_TOKENS: FoodTokens = {
  primary: '#5C4A32',
  accent: '#C0392B',
  cream: '#F8F3EC',
  ink: '#211C19',
}

/**
 * 브랜드 색에서 식품 슬롯 토큰(primary/accent/cream/ink) 도출.
 * - primary = 브랜드 1번 색 (없으면 기본 딥브라운)
 * - accent  = 브랜드 2번 색 (없으면 식품 포인트 기본 레드)
 * - cream   = primary를 따뜻한 화이트 쪽으로 93% 섞은 밝은 배경
 * - ink     = primary를 블랙 쪽으로 섞은, 브랜드 색조가 남은 진한 본문색
 */
export function deriveFoodTokens(brandColors: string[] | undefined, accentHint?: string): FoodTokens {
  const valid = (brandColors ?? []).map((c) => ({ raw: c, rgb: parseHex(c) })).filter((x) => x.rgb !== null)

  const primaryHex = valid[0]?.raw ? toHexNormalized(valid[0].raw) : DEFAULT_TOKENS.primary
  const primaryRgb = parseHex(primaryHex)!

  let accentHex: string
  const accentParsed = accentHint ? parseHex(accentHint) : null
  if (accentParsed) accentHex = toHexNormalized(accentHint!)
  else if (valid[1]?.rgb) accentHex = toHexNormalized(valid[1].raw)
  else accentHex = DEFAULT_TOKENS.accent

  const cream = mix(primaryRgb, WARM_WHITE, 0.93)
  const ink = mix(primaryRgb, BLACK, 0.58)

  return { primary: primaryHex, accent: accentHex, cream, ink }
}

/** '3E5060' / '#3e5060' 등을 '#3e5060' 정규형으로 */
function toHexNormalized(hex: string): string {
  const rgb = parseHex(hex)
  return rgb ? toHex(rgb.r, rgb.g, rgb.b) : hex
}
