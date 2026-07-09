/** INGREDIENT 아키타입: ingredient-radial-dot-map
 *  피그마 104_성분소개_01 패턴 흡수.
 *  상단 제품명 라운드 뱃지 + 2단 타이틀(대형 헤드라인 + 부제) + 중앙 원형 제품 이미지 위에
 *  흰 도트 4개를 앵커로 핵심 성분명·설명을 방사형으로 배치한 인포그래픽 성분 맵. 라이트 배경. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const ingredientItem = z.object({
  name: z.string().min(1),           // 성분명 (굵게)
  desc: z.string().min(1),           // 짧은 효능 설명
  /** 도트 위치: 원 중심 기준 각도(deg, 0=12시, 시계방향). 기본값 0/90/180/270 */
  angle: z.number().min(0).max(359).optional(),
})

const schema = z.object({
  badge: z.string().optional(),       // 라운드 뱃지 제품명 (없으면 미노출)
  headline: z.string().min(1),        // 대형 헤드라인 (em,br) — "핵심성분"
  subtitle: z.string().optional(),    // 헤드라인 아래 부제 (plain)
  image: z.string().optional(),       // 원형 제품 이미지 url
  items: z.array(ingredientItem).min(2).max(4),
})
type Data = z.infer<typeof schema>

/** 각도(deg, 0=12시 시계방향) → 원 둘레 위 좌표. r=반지름, cx/cy=중심 */
function polarPct(angleDeg: number, r: number, cx: number, cy: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** 도트 위치에서 라벨 정렬: 오른쪽 절반이면 왼쪽 정렬, 왼쪽 절반이면 오른쪽 정렬 */
function labelAlign(angleDeg: number): 'left' | 'right' {
  const a = ((angleDeg % 360) + 360) % 360
  return a <= 180 ? 'left' : 'right'
}

/** 도트 위치 → 라벨 오프셋 (도트 끝에서 선이 이어지므로 추가 간격) */
function labelOffset(angleDeg: number, dotR: number, gap: number): { dx: number; dy: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    dx: Math.cos(rad) * (dotR + gap),
    dy: Math.sin(rad) * (dotR + gap),
  }
}

// SVG 뷰포트 내 레이아웃 상수 (원형 이미지 맵)
const VW = 900          // SVG viewBox 너비 (라벨 공간 확보)
const VH = 900          // SVG viewBox 높이
const CX = 450          // 원 중심 x
const CY = 450          // 원 중심 y
const R_IMG = 280       // 원형 이미지 반지름 (라벨 공간 확보를 위해 축소)
const R_RING = 295      // 바깥 트레이스 링 반지름
const R_DOT_POS = 292   // 도트 앵커가 놓이는 반지름 (이미지 테두리 위)
const DOT_R = 12        // 도트 반지름(px 상당)
const LABEL_GAP = 54    // 도트 끝에서 라벨까지 간격 (원 외부 배치 보장)

// 기본 각도 배열 (성분 수 2~4)
const DEFAULT_ANGLES_4 = [45, 135, 225, 315]
const DEFAULT_ANGLES_3 = [45, 180, 315]
const DEFAULT_ANGLES_2 = [60, 300]

function defaultAngles(count: number): number[] {
  if (count === 2) return DEFAULT_ANGLES_2
  if (count === 3) return DEFAULT_ANGLES_3
  return DEFAULT_ANGLES_4
}

export const ingredientRadialDotMap = defineBlock<Data>({
  id: 'ingredient-radial-dot-map',
  archetype: 'ingredient',
  // noimg-safe: 이미지 없을 때 원형 틴트 배경으로 강등 렌더 (도트+라벨은 유지)
  styleTags: ['light', 'infographic', 'beauty', 'radial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분 인포그래픽(방사형 도트 맵). 라이트 배경 + 제품명 라운드 뱃지 + 대형 헤드라인 + 중앙 원형 제품 이미지 둘레에 흰 도트 앵커로 2~4가지 핵심 성분명·효능을 방사형 배치. 뷰티/스킨케어 성분 소개.',
  schema,
  css: `
.irwi{background:var(--bg);color:var(--ink);padding:62px var(--pad-x,56px) 68px;text-align:center}
.irwi-badge-wrap{margin-bottom:18px}
.irwi-badge{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:600;font-size:22px;padding:10px 32px;border-radius:999px;letter-spacing:.02em}
.irwi-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,8vw,82px);color:var(--ink);letter-spacing:-.03em;line-height:1.08}
.irwi-headline .em{color:var(--accent)}
.irwi-subtitle{margin-top:10px;font-size:20px;font-weight:500;color:var(--muted);letter-spacing:-.01em}
.irwi-map{margin:36px auto 0;width:100%;max-width:700px}
.irwi-map svg{width:100%;height:auto;overflow:visible}
/* 원형 이미지 클립 (clipPath defs로 처리하므로 CSS clip-path는 제거) */
/* noimg-safe: 이미지 없을 때 원형 틴트 배경 */
.irwi-img-circle{fill:color-mix(in srgb,var(--accent) 8%,var(--bg))}
.irwi-img-circle.has-img{fill:none}
/* 링 */
.irwi-ring{fill:none;stroke:var(--line);stroke-width:1.5;opacity:.5}
/* 도트 */
.irwi-dot{fill:#fff;stroke:var(--accent);stroke-width:2.5}
/* 커넥터 선 */
.irwi-line{stroke:var(--line);stroke-width:1.5;opacity:.7}
/* 라벨 */
.irwi-lbl-name{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:700;fill:var(--ink);font-size:22px}
.irwi-lbl-desc{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:400;fill:var(--muted);font-size:17px}
`,
  render: (d, { esc, richSafe }) => {
    const angles = d.items.map(
      (item, i) => item.angle ?? defaultAngles(d.items.length)[i] ?? DEFAULT_ANGLES_4[i],
    )

    // 이미지 유무
    const hasImg =
      typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    // 클립패스 id (전역 충돌 방지 — 정적 suffix)
    const clipId = 'irwi-clip'
    const maskId = 'irwi-mask'

    // 각 성분별 SVG 요소 생성
    const dotItems = d.items.map((item, i) => {
      const angle = angles[i]
      const dot = polarPct(angle, R_DOT_POS, CX, CY)
      const align = labelAlign(angle)
      const off = labelOffset(angle, DOT_R, LABEL_GAP)
      const lx = dot.x + off.dx
      const ly = dot.y + off.dy

      // 커넥터 라인: 이미지 테두리(R_IMG)→도트 안쪽
      const rad = ((angle - 90) * Math.PI) / 180
      const lineStartX = CX + R_IMG * Math.cos(rad)
      const lineStartY = CY + R_IMG * Math.sin(rad)
      const lineEndX = dot.x - Math.cos(rad) * DOT_R
      const lineEndY = dot.y - Math.sin(rad) * DOT_R

      // 라벨 앵커
      const anchor = align === 'left' ? 'start' : 'end'

      // 라벨 영역 오프셋 보정: 왼쪽 배치면 x를 조금 더 당김
      const labelX = align === 'left' ? lx + 4 : lx - 4

      return `
    <!-- 성분 ${i + 1}: ${esc(item.name)} -->
    <line class="irwi-line" x1="${lineStartX.toFixed(1)}" y1="${lineStartY.toFixed(1)}" x2="${lineEndX.toFixed(1)}" y2="${lineEndY.toFixed(1)}"/>
    <circle class="irwi-dot" cx="${dot.x.toFixed(1)}" cy="${dot.y.toFixed(1)}" r="${DOT_R}"/>
    <text class="irwi-lbl-name" x="${labelX.toFixed(1)}" y="${(ly - 4).toFixed(1)}" text-anchor="${anchor}" dominant-baseline="auto">${esc(item.name)}</text>
    <text class="irwi-lbl-desc" x="${labelX.toFixed(1)}" y="${(ly + 20).toFixed(1)}" text-anchor="${anchor}" dominant-baseline="auto">${esc(item.desc)}</text>`
    })

    // 이미지 또는 틴트 원
    const imgEl = hasImg
      ? `<defs>
      <clipPath id="${clipId}">
        <circle cx="${CX}" cy="${CY}" r="${R_IMG}"/>
      </clipPath>
    </defs>
    <image href="${esc(d.image!)}" x="${CX - R_IMG}" y="${CY - R_IMG}" width="${R_IMG * 2}" height="${R_IMG * 2}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="${CX}" cy="${CY}" r="${R_IMG}" class="irwi-img-circle"/>`

    return `
<section class="irwi">
  ${d.badge ? `<div class="irwi-badge-wrap"><span class="irwi-badge">${esc(d.badge)}</span></div>` : ''}
  <h2 class="irwi-headline">${richSafe(d.headline)}</h2>
  ${d.subtitle ? `<p class="irwi-subtitle">${esc(d.subtitle)}</p>` : ''}
  <div class="irwi-map">
    <svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="성분 인포그래픽">
      <!-- 바깥 트레이스 링 -->
      <circle class="irwi-ring" cx="${CX}" cy="${CY}" r="${R_RING}"/>
      <!-- 원형 이미지 또는 틴트 배경 -->
      ${imgEl}
      <!-- 도트 + 라벨 레이어 -->
      ${dotItems.join('')}
    </svg>
  </div>
</section>`
  },
})
