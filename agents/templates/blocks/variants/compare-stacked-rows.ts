/** COMPARE 아키타입(템플릿 충실 재현): compare-stacked-rows.
 *  와디즈 200섹션 07_차별화 비교 _07(3단 풀폭 행) 패턴을 토큰 기반으로 재구성.
 *  상단 대제목 헤더 → 수평 밴드 세로 스택(좌=BEFORE이미지+라벨오버레이+텍스트, 우=AFTER이미지+라벨오버레이+텍스트) → 하단 다크 클로저.
 *  행마다 BEFORE(좌)/AFTER(우) 이미지 2열, 라벨 오버레이, 헤어라인 구분선, 모든 색은 토큰 기반. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const rowSchema = z.object({
  beforeText: z.string().min(1),        // BEFORE 설명 (em,br)
  afterText: z.string().min(1),         // AFTER 설명 (em,br)
  beforeImage: z.string().optional(),   // 좌측 BEFORE 이미지 (url)
  afterImage: z.string().optional(),    // 우측 AFTER 이미지 (url)
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(), // 상단 작은 설명 텍스트
  title: z.string().min(1),             // 대제목 (em,br)
  beforeLabel: z.string().min(1).optional(), // 기본 BEFORE
  afterLabel: z.string().min(1).optional(),  // 기본 AFTER
  rows: rowSchema.array().min(2).max(4),     // 비교 행 (2~4)
  closer: z.string().min(1).optional(),      // 하단 클로저 (em,br)
})
type Data = z.infer<typeof schema>

export const compareStackedRows = defineBlock<Data>({
  id: 'compare-stacked-rows',
  archetype: 'compare',
  styleTags: ['premium', 'template', 'comparison', 'light', 'stacked'],
  imageSlots: 6,
  describe:
    '차별화 비교(3단 풀폭 행). 헤더(아이브로+대제목) → 수평 밴드 반복(좌=BEFORE이미지+라벨오버레이+설명, 우=AFTER이미지+라벨오버레이+설명) → 다크 클로저. 행마다 BEFORE/AFTER 이미지 2열, 헤어라인 구분.',
  schema,
  css: `
.csr{background:var(--bg);color:var(--ink)}
.csr-hd{padding:48px 52px 36px}
.csr-eye{font-size:15px;font-weight:600;color:var(--ink-2);margin-bottom:10px}
.csr-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:var(--ink)}
.csr-title .em{color:var(--accent)}
.csr-rows{}
.csr-band{display:flex;align-items:stretch;border-top:1px solid var(--line);min-height:0}
.csr-band:last-child{border-bottom:1px solid var(--line)}
.csr-left{flex:0 0 50%;min-width:0;box-sizing:border-box;position:relative;padding:20px 10px 20px 20px;display:flex;flex-direction:column;gap:12px;border-right:1px solid var(--line)}
.csr-right{flex:0 0 50%;min-width:0;box-sizing:border-box;position:relative;padding:20px 20px 20px 10px;display:flex;flex-direction:column;gap:12px}
.csr-img-wrap{position:relative;width:100%;flex-shrink:0;overflow:hidden;border-radius:10px}
.csr-thumb{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;display:block;max-width:100%}
.csr-bl{position:absolute;bottom:10px;left:10px;display:inline-block;font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.1em;color:#fff;background:rgba(0,0,0,.52);padding:4px 12px;border-radius:4px}
.csr-al{position:absolute;top:10px;left:10px;display:inline-block;font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.1em;color:#fff;background:color-mix(in srgb,var(--accent) 85%,#000);padding:4px 12px;border-radius:4px}
.csr-btext{font-size:14px;color:var(--muted);line-height:1.65}
.csr-btext .em{color:var(--accent);font-weight:700}
.csr-atext{font-size:15px;font-weight:600;color:var(--ink);line-height:1.65}
.csr-atext .em{color:var(--accent);font-weight:800}
.csr-closer{background:var(--brand);padding:52px 52px;text-align:center}
.csr-closer-text{font-family:var(--font-display);font-weight:800;font-size:44px;color:#fff;line-height:1.25;letter-spacing:-.02em}
.csr-closer-text .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const bLabel = esc(d.beforeLabel ?? 'BEFORE')
    const aLabel = esc(d.afterLabel ?? 'AFTER')
    const bands = d.rows
      .map(
        (row) => `
  <div class="csr-band">
    <div class="csr-left">
      <div class="csr-img-wrap">
        ${media(row.beforeImage, 'csr-thumb', 'BEFORE 이미지')}
        <span class="csr-bl">${bLabel}</span>
      </div>
      <p class="csr-btext">${richSafe(row.beforeText)}</p>
    </div>
    <div class="csr-right">
      <div class="csr-img-wrap">
        ${media(row.afterImage, 'csr-thumb', 'AFTER 이미지')}
        <span class="csr-al">${aLabel}</span>
      </div>
      <p class="csr-atext">${richSafe(row.afterText)}</p>
    </div>
  </div>`,
      )
      .join('')
    return `
<section class="csr">
  <div class="csr-hd">
    ${d.eyebrow ? `<p class="csr-eye">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="csr-title">${richSafe(d.title)}</h2>
  </div>
  <div class="csr-rows">${bands}
  </div>
  ${d.closer ? `<div class="csr-closer"><p class="csr-closer-text">${richSafe(d.closer)}</p></div>` : ''}
</section>`
  },
})
