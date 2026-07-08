/** STATS 아키타입 추가 변형(템플릿 충실 재현): 02_수치 강조 _07.
 *  stats-zigzag: 상단 accent 밴드(이브로우+숫자 알약+심볼) → 라이트 지그재그 수치행(텍스트/이미지 교차).
 *  statsFigures(다크 대형숫자)·statsHighlight(아이콘 카드)와 다른 라이트 지그재그 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(), // 상단 레이블 (예: "누적 판매량")
  headline: z.string().min(1), // 숫자 알약 (em 허용)
  symbolImage: z.string().optional(), // 상단 심볼/제품 이미지
  rows: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1), image: z.string().optional() }))
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const statsZigzag = defineBlock<Data>({
  id: 'stats-zigzag',
  archetype: 'stats',
  styleTags: ['premium', 'template', 'colorblock'],
  imageSlots: 5,
  describe:
    '수치 강조(라이트 지그재그). 상단 accent 밴드(이브로우+숫자 알약+심볼 이미지) + 하단 지그재그 수치행(라벨·대형 값·이미지 교차). statsFigures(다크 대형숫자)와 다른 라이트 임팩트. 핵심 성과 수치는 brief 근거만.',
  schema,
  css: `
.sz{background:var(--bg);color:var(--ink)}
.sz-top{background:var(--accent);padding:46px 40px 40px;text-align:center}
.sz-eye{font-family:var(--font-display);font-weight:800;font-size:18px;color:rgba(255,255,255,.85);letter-spacing:.04em;margin-bottom:14px}
.sz-headline{display:inline-block;background:var(--paper);color:var(--accent);font-family:var(--font-display);font-weight:800;font-size:46px;line-height:1;border-radius:999px;padding:14px 34px;box-shadow:0 10px 26px rgba(0,0,0,.16)}
.sz-headline .em{color:var(--ink)}
.sz-symbol{width:210px;height:210px;object-fit:contain;display:block;margin:30px auto 0}
.sz-rows{padding:44px 40px 12px;display:flex;flex-direction:column;gap:30px}
.sz-row{display:flex;align-items:center;gap:24px}
.sz-row:nth-child(even){flex-direction:row-reverse}
.sz-row:nth-child(even) .sz-body{text-align:right}
.sz-img{flex:0 0 150px;width:150px;height:150px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
.sz-body{flex:1;min-width:0}
.sz-label{font-family:var(--font-display);font-weight:800;font-size:15px;color:var(--accent);margin-bottom:8px;letter-spacing:.02em}
.sz-value{font-family:var(--font-display);font-weight:800;font-size:34px;color:var(--ink);line-height:1.12}
.sz-value .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="sz">
  <div class="sz-top">
    ${d.eyebrow ? `<div class="sz-eye">${esc(d.eyebrow)}</div>` : ''}
    <span class="sz-headline">${richSafe(d.headline)}</span>
    ${d.symbolImage ? media(d.symbolImage, 'sz-symbol', '브랜드 심볼') : ''}
  </div>
  <div class="sz-rows">
    ${d.rows
      .map(
        (r) => `
    <div class="sz-row">
      ${media(r.image, 'sz-img', '수치 이미지')}
      <div class="sz-body">
        <div class="sz-label">${esc(r.label)}</div>
        <div class="sz-value">${richSafe(r.value)}</div>
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
