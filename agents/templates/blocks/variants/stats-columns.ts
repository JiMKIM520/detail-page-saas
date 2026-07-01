/** STATS 아키타입(템플릿 충실 재현): stats-columns.
 *  와디즈 200섹션 02_수치강조 섹션_02 (nodeId 564:1032) 패턴 재구성.
 *  어두운 배경 + 월계관 프레임 대형 숫자 헤드라인 + 와이드 제품 이미지
 *  + 하단 3개 수치 항목 가로 3분할 (각 열: 트로피 아이콘 이미지 + 라벨 + 값).
 *  기존 stats-figures(수평 구분선 행) / stats-highlight(아이콘 카드행)와 다른
 *  3컬럼 트로피 레이아웃. 누적 판매량·수상 실적·평점 등 수치 성과 강조에 적합. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const colSchema = z.object({
  trophyImage: z.string().optional(),   // 트로피/어워드 아이콘 이미지 (url)
  label: z.string().min(1),             // 항목 라벨 (예: "누적 판매량")
  value: z.string().min(1),             // 수치 값 (em,br 허용)
})

const schema = z.object({
  eyebrow: z.string().optional(),        // 월계관 안 소제목 (예: "누적 판매량")
  headline: z.string().min(1),           // 대형 숫자 헤드라인 (em,br 허용)
  productImage: z.string().optional(),   // 와이드 제품 이미지 (url)
  columns: z.array(colSchema).min(2).max(4), // 하단 수치 열 (2~4개)
})
type Data = z.infer<typeof schema>

export const statsColumns = defineBlock<Data>({
  id: 'stats-columns',
  archetype: 'stats',
  styleTags: ['premium', 'dark', 'impact', 'template', 'cobalt'],
  imageSlots: 4,
  describe:
    '3컬럼 트로피 수치 강조. 어두운 배경 + 월계관 대형 숫자 헤드라인 + 와이드 제품 이미지 + 하단 3분할(트로피 아이콘 이미지·라벨·값). 누적 판매량·평점·수상 실적 등 성과 수치를 트로피 이미지로 시각화.',
  schema,
  css: `
/* sc = stats-columns 접두사 */
.sc{background:var(--brand);color:#fff;padding:56px 0 0;text-align:center;position:relative;overflow:hidden}

/* 배경 광채 */
.sc::before{content:'';position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);width:680px;height:680px;background:radial-gradient(ellipse at center,rgba(255,210,80,.10) 0%,transparent 66%);pointer-events:none}

/* 월계관 프레임 영역 */
.sc-wreath-wrap{position:relative;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;padding:0 0 8px;margin-bottom:28px}

/* 월계관 SVG 장식 */
.sc-wreath{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:-8px}
.sc-wreath-svg{width:220px;height:110px;opacity:.92}

/* eyebrow — 월계관 안 소제목 */
.sc-eyebrow{position:relative;font-family:var(--font-display);font-weight:800;font-size:16px;color:rgba(255,255,255,.80);letter-spacing:.08em;margin-bottom:6px}

/* 대형 숫자 헤드라인 */
.sc-headline{position:relative;font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-weight:400;font-size:76px;color:#F5C518;line-height:1.05;letter-spacing:-.02em;text-shadow:0 4px 28px rgba(245,197,24,.32)}
.sc-headline .em{color:var(--accent)}

/* 와이드 제품 이미지 */
.sc-product{width:100%;height:280px;object-fit:cover;display:block;margin:32px 0 0}
.sc-product.ph{height:280px;border:none;background:rgba(255,255,255,.06);color:rgba(255,255,255,.25)}

/* 3컬럼 하단 수치 영역 */
.sc-cols{display:flex;border-top:1px solid rgba(255,255,255,.12)}
.sc-col{flex:1;display:flex;flex-direction:column;align-items:center;padding:32px 16px 36px;gap:0}
.sc-col + .sc-col{border-left:1px solid rgba(255,255,255,.12)}

/* 트로피 이미지 */
.sc-trophy{width:80px;height:88px;object-fit:contain;display:block;margin:0 auto 14px;filter:drop-shadow(0 4px 14px rgba(245,197,24,.30))}
.sc-trophy.ph{background:transparent;border:none;color:rgba(255,255,255,.18);font-size:11px;width:80px;height:88px}

/* 컬럼 라벨 */
.sc-col-label{font-size:13px;font-weight:600;color:rgba(255,255,255,.60);letter-spacing:.04em;margin-bottom:8px}

/* 컬럼 수치 값 */
.sc-col-value{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-size:28px;color:#fff;line-height:1.15;letter-spacing:-.01em}
.sc-col-value .em{color:#F5C518}
`,
  render: (d, { esc, richSafe }) => {
    // Inline laurel wreath SVG (gold, left and right branches)
    const wreathSvg = `<svg class="sc-wreath-svg" viewBox="0 0 220 110" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Left branch -->
  <g stroke="#C8920A" stroke-width="1.6" fill="#C8920A" opacity="0.9">
    <ellipse cx="22" cy="80" rx="10" ry="5.5" transform="rotate(-30 22 80)"/>
    <ellipse cx="14" cy="65" rx="10" ry="5.5" transform="rotate(-45 14 65)"/>
    <ellipse cx="10" cy="48" rx="10" ry="5.5" transform="rotate(-55 10 48)"/>
    <ellipse cx="12" cy="32" rx="10" ry="5.5" transform="rotate(-65 12 32)"/>
    <ellipse cx="20" cy="19" rx="10" ry="5.5" transform="rotate(-72 20 19)"/>
    <ellipse cx="32" cy="11" rx="10" ry="5.5" transform="rotate(-80 32 11)"/>
    <ellipse cx="46" cy="7"  rx="10" ry="5.5" transform="rotate(-86 46 7)"/>
    <path d="M10 96 Q14 48 58 8" stroke="#C8920A" stroke-width="2" fill="none"/>
  </g>
  <!-- Right branch (mirrored) -->
  <g stroke="#C8920A" stroke-width="1.6" fill="#C8920A" opacity="0.9">
    <ellipse cx="198" cy="80" rx="10" ry="5.5" transform="rotate(30 198 80)"/>
    <ellipse cx="206" cy="65" rx="10" ry="5.5" transform="rotate(45 206 65)"/>
    <ellipse cx="210" cy="48" rx="10" ry="5.5" transform="rotate(55 210 48)"/>
    <ellipse cx="208" cy="32" rx="10" ry="5.5" transform="rotate(65 208 32)"/>
    <ellipse cx="200" cy="19" rx="10" ry="5.5" transform="rotate(72 200 19)"/>
    <ellipse cx="188" cy="11" rx="10" ry="5.5" transform="rotate(80 188 11)"/>
    <ellipse cx="174" cy="7"  rx="10" ry="5.5" transform="rotate(86 174 7)"/>
    <path d="M210 96 Q206 48 162 8" stroke="#C8920A" stroke-width="2" fill="none"/>
  </g>
  <!-- Bottom bow -->
  <path d="M68 100 Q110 108 152 100" stroke="#C8920A" stroke-width="2.4" fill="none"/>
</svg>`

    const colsHtml = d.columns.map((col) => `
  <div class="sc-col">
    ${media(col.trophyImage, 'sc-trophy', '트로피')}
    <div class="sc-col-label">${esc(col.label)}</div>
    <div class="sc-col-value">${richSafe(col.value)}</div>
  </div>`).join('')

    return `
<section class="sc">
  <div class="sc-wreath-wrap">
    <div class="sc-wreath">${wreathSvg}</div>
    ${d.eyebrow ? `<div class="sc-eyebrow">${esc(d.eyebrow)}</div>` : ''}
    <h2 class="sc-headline">${richSafe(d.headline)}</h2>
  </div>
  ${media(d.productImage, 'sc-product', '제품 이미지')}
  <div class="sc-cols">
    ${colsHtml}
  </div>
</section>`
  },
})
