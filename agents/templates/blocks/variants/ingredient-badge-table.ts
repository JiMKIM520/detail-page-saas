/** INGREDIENT 아키타입: ingredient-badge-table
 *  원본: 161_추천_및_B_A_구성_페이지_23.json
 *  구조: 풀블리드 배경 이미지 위 대형 Bold 헤드라인 + 원형 영양성분 배지 3종 + 교차 하이라이트 성분표.
 *  배지는 색상이 다른 원형 3개(핵심 영양소 강조), 테이블은 강조 행(accent)과 일반 행(다크)이 교차.
 *  이미지 없을 때: 배경을 brand 단색으로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* 배지 하나 */
const badgeSchema = z.object({
  label: z.string().min(1),   // 영양소명 (예: 단백질)
  value: z.string().min(1),   // 함량 표시 (예: 22g)
  color: z.string().optional(), // 배지 배경 hex (없으면 --accent-d)
})

/* 테이블 행 하나 */
const rowSchema = z.object({
  name: z.string().min(1),          // 성분명
  amount: z.string().min(1),        // 함량 (예: 22g)
  pct: z.string().optional(),       // %DV (선택)
  highlight: z.boolean().optional(), // true면 accent 강조 행
})

const schema = z.object({
  bgImage: z.string().optional(),            // 배경 이미지 URL
  headline: z.string().min(1),               // 대형 헤드라인 (em, br 허용)
  badges: z.array(badgeSchema).min(1).max(5), // 원형 영양소 배지
  rows: z.array(rowSchema).min(1).max(16),   // 영양성분 테이블 행
  footnote: z.string().optional(),           // 하단 주석 (* 제품명 기준 등)
})
type Data = z.infer<typeof schema>

export const ingredientBadgeTable = defineBlock<Data>({
  id: 'ingredient-badge-table',
  archetype: 'ingredient',
  styleTags: ['dark', 'food', 'premium', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '풀블리드 배경이미지 위 대형 헤드라인 + 원형 영양소 배지(1~5개) + 교차 하이라이트 성분표. 식품 영양성분 강조에 최적. 이미지 없을 때 brand 다크 배경으로 강등.',
  schema,
  css: `
/* ── 최상위 래퍼 ── */
.imzh{position:relative;background:var(--brand);overflow:hidden}
.imzh .em{color:var(--em-dark,#FFF7EA)}

/* 배경 이미지 */
.imzh-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;z-index:0}
.imzh-bg.ph{display:none!important}

/* 스크림: 이미지 위 텍스트 가독성 보장 */
.imzh-scrim{position:absolute;inset:0;z-index:1;
  background:linear-gradient(
    to bottom,
    rgba(0,0,0,.55) 0%,
    rgba(0,0,0,.42) 38%,
    rgba(0,0,0,.62) 62%,
    rgba(0,0,0,.82) 100%
  )}

/* 콘텐츠 레이어 */
.imzh-body{position:relative;z-index:2;padding:60px var(--pad-x,56px) 52px}

/* 헤드라인 */
.imzh-hl{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(42px,6.5vw,72px);
  line-height:1.18;
  color:#ffffff;
  letter-spacing:-.02em;
  margin-bottom:36px;
  text-shadow:0 2px 12px rgba(0,0,0,.45)
}

/* 배지 행 */
.imzh-badges{
  display:flex;
  gap:20px;
  flex-wrap:wrap;
  justify-content:center;
  margin-bottom:36px
}

/* 개별 배지 */
.imzh-badge{
  width:180px;
  height:180px;
  border-radius:50%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  background:var(--accent-d);
  box-shadow:0 0 0 5px rgba(255,255,255,.18),0 8px 28px rgba(0,0,0,.55);
  flex-shrink:0
}
.imzh-badge-label{
  font-size:17px;
  font-weight:600;
  color:#ffffff;
  letter-spacing:.02em
}
.imzh-badge-value{
  font-family:var(--font-display);
  font-weight:800;
  font-size:46px;
  line-height:1.05;
  color:#ffffff;
  letter-spacing:-.02em
}
/* 밝은 배경 배지: 텍스트를 다크로 반전 */
.imzh-badge--light .imzh-badge-label,
.imzh-badge--light .imzh-badge-value{
  color:#1a1200;
  text-shadow:0 1px 0 rgba(255,255,255,.25)
}

/* 성분표 */
.imzh-table{
  width:100%;
  border-collapse:collapse
}

/* 테이블 행 공통 */
.imzh-tr{display:flex;align-items:center;padding:0 16px;height:56px}
.imzh-tr-dark{background:rgba(0,0,0,.30)}
.imzh-tr-hi{background:rgba(255,255,255,.92)}

/* 셀 */
.imzh-td{flex:1;font-size:18px;line-height:1}
.imzh-td:nth-child(2){text-align:center}
.imzh-td:nth-child(3){text-align:right}

/* 다크 행 텍스트 */
.imzh-tr-dark .imzh-td{color:#ffffff;font-weight:400}
/* 하이라이트 행 텍스트 */
.imzh-tr-hi .imzh-td{color:var(--accent-d,#a37800);font-weight:700}

/* 주석 */
.imzh-foot{
  margin-top:16px;
  font-size:13px;
  color:rgba(255,255,255,.55);
  text-align:right
}
`,
  render: (d, { esc, richSafe }) => {
    /** hex 색상이 밝은지 판단 (perceived luminance > 0.45) */
    const isLightHex = (hex: string): boolean => {
      const c = hex.replace('#', '')
      if (c.length !== 6) return false
      const r = parseInt(c.slice(0, 2), 16) / 255
      const g = parseInt(c.slice(2, 4), 16) / 255
      const b = parseInt(c.slice(4, 6), 16) / 255
      return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45
    }
    // 배경 이미지 강등: URL 없으면 스크림도 생략(brand 단색이 충분히 어두움)
    const hasBg = typeof d.bgImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.bgImage.trim())

    const bgEl = hasBg
      ? media(d.bgImage, 'imzh-bg', '배경 이미지')
      : ''
    const scrimEl = hasBg
      ? '<div class="imzh-scrim" aria-hidden="true"></div>'
      : ''

    const badgesHtml = d.badges
      .map((b) => {
        const isLight = b.color ? isLightHex(b.color) : false
        const bgStyle = b.color
          ? ` style="background:${esc(b.color)}"`
          : ''
        const lightCls = isLight ? ' imzh-badge--light' : ''
        return `<div class="imzh-badge${lightCls}"${bgStyle}>
  <span class="imzh-badge-label">${esc(b.label)}</span>
  <span class="imzh-badge-value">${esc(b.value)}</span>
</div>`
      })
      .join('\n')

    const rowsHtml = d.rows
      .map((r) => {
        const cls = r.highlight ? 'imzh-tr imzh-tr-hi' : 'imzh-tr imzh-tr-dark'
        return `<div class="${cls}" role="row">
  <span class="imzh-td" role="cell">${esc(r.name)}</span>
  <span class="imzh-td" role="cell">${esc(r.amount)}</span>
  <span class="imzh-td" role="cell">${r.pct ? esc(r.pct) : ''}</span>
</div>`
      })
      .join('\n')

    return `<section class="imzh">
  ${bgEl}
  ${scrimEl}
  <div class="imzh-body">
    <h2 class="imzh-hl">${richSafe(d.headline)}</h2>
    <div class="imzh-badges" role="list" aria-label="핵심 영양성분">
      ${badgesHtml}
    </div>
    <div class="imzh-table" role="table" aria-label="영양성분 상세">
      ${rowsHtml}
    </div>
    ${d.footnote ? `<p class="imzh-foot">${esc(d.footnote)}</p>` : ''}
  </div>
</section>`
  },
})
