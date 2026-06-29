/**
 * 브랜드 색 도출 — 로고/제품 이미지에서 대표 강조색을 추출한다.
 *
 * 목적: 모든 상세페이지가 프리셋 원본 팔레트(= 소금빵 데모와 동일)로 찍히는 것을 막고,
 *       업체별로 색조가 달라지게 한다. deriveTokens(presetKey, brandColors)에 넣어 쓴다.
 *
 * 전략: sharp로 64×64 축소 후 픽셀을 스캔, 투명/근백색/근흑색/저채도를 제외하고
 *       (채도×명도가중) 히스토그램에서 가장 지배적인 유채색을 고른다.
 *       유효 색을 못 찾으면 null → 호출부가 프리셋 기본색을 그대로 쓴다.
 */
import sharp from 'sharp'

function toHex(r: number, g: number, b: number): string {
  const c = (v: number): string =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** RGB → HSV의 S, V (0~1). 색 선별용. */
function satVal(r: number, g: number, b: number): { s: number; v: number } {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const v = max / 255
  const s = max === 0 ? 0 : (max - min) / max
  return { s, v }
}

/**
 * 이미지 버퍼에서 대표 유채색 HEX 1개 추출. 실패 시 null.
 * @param buffer 원본 이미지(png/jpg/webp 등)
 */
export async function extractBrandColor(buffer: Buffer): Promise<string | null> {
  try {
    const { data, info } = await sharp(buffer)
      .resize(64, 64, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const channels = info.channels // 4 (RGBA)
    // 색을 32단계로 양자화해 버킷 누적 (채도×명도 가중)
    const buckets = new Map<string, { r: number; g: number; b: number; w: number }>()

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = channels === 4 ? data[i + 3] : 255
      if (a < 128) continue // 투명 제외
      if (r > 235 && g > 235 && b > 235) continue // 근백색 제외
      if (r < 22 && g < 22 && b < 22) continue // 근흑색 제외
      const { s, v } = satVal(r, g, b)
      if (s < 0.25) continue // 저채도(회색) 제외
      const key = `${r >> 5}-${g >> 5}-${b >> 5}`
      const weight = s * v // 선명하고 밝을수록 가중
      const cur = buckets.get(key)
      if (cur) {
        cur.r += r * weight
        cur.g += g * weight
        cur.b += b * weight
        cur.w += weight
      } else {
        buckets.set(key, { r: r * weight, g: g * weight, b: b * weight, w: weight })
      }
    }

    if (buckets.size === 0) return null
    let best: { r: number; g: number; b: number; w: number } | null = null
    for (const v of buckets.values()) {
      if (!best || v.w > best.w) best = v
    }
    if (!best || best.w === 0) return null
    return toHex(best.r / best.w, best.g / best.w, best.b / best.w)
  } catch {
    return null
  }
}
