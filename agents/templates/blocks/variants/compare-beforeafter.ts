/** COMPARE 아키타입(템플릿 충실 재현): compare-beforeafter.
 *  와디즈 200섹션 07_차별화 비교 _02(2단 BEFORE/AFTER 카드) 패턴을 토큰 기반으로 재구성.
 *  BEFORE(그레이) vs AFTER(accent) 두 컬럼 + 행별 대비 + 마무리. 어떤 프리셋이든 적응. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1), // 예 "왜 특별할까요?"
  subtitle: z.string().min(1).optional(),
  beforeLabel: z.string().min(1).optional(), // 기본 BEFORE
  afterLabel: z.string().min(1).optional(), // 기본 AFTER
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
  rows: z
    .array(z.object({ before: z.string().min(1), after: z.string().min(1) })) // after: em 허용
    .min(2)
    .max(5),
  closer: z.string().min(1).optional(), // em,br
})
type Data = z.infer<typeof schema>

export const compareBeforeAfter = defineBlock<Data>({
  id: 'compare-beforeafter',
  archetype: 'compare',
  styleTags: ['premium', 'template', 'comparison'],
  imageSlots: 2,
  describe:
    '차별화 비교(비포/애프터). 대제목+서브 + BEFORE(그레이 카드)/AFTER(accent 카드) 2단 + 행별 대비(이미지+텍스트) + 마무리. 사용 전후 대조.',
  schema,
  css: `
.cba{background:var(--bg);padding:54px 56px 56px}
.cba-hd{margin-bottom:30px}
.cba-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:var(--ink);letter-spacing:-.02em;line-height:1.12}
.cba-sub{margin-top:10px;font-size:16px;font-weight:600;color:var(--ink-2)}
.cba-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.cba-col{border-radius:18px;overflow:hidden;background:var(--paper);box-shadow:0 16px 34px -22px rgba(0,0,0,.35)}
.cba-h{text-align:center;font-family:var(--font-display);font-weight:800;font-size:20px;padding:16px;letter-spacing:.06em}
.cba-h.b{background:#EAEAEE;color:#8A8A93}
.cba-h.a{background:var(--accent);color:#fff}
.cba-media{width:100%;height:172px;object-fit:cover}
.cba-rows{padding:6px 20px 18px}
.cba-r{text-align:center;font-size:15px;padding:18px 6px;line-height:1.5}
.cba-r.b{color:var(--muted)}
.cba-r.a{color:var(--ink);font-weight:700}
.cba-r.a .em{color:var(--accent)}
.cba-r + .cba-r{border-top:1px solid var(--line)}
.cba-closer{margin-top:40px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:32px;color:var(--ink);line-height:1.35}
.cba-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const bLabel = esc(d.beforeLabel ?? 'BEFORE')
    const aLabel = esc(d.afterLabel ?? 'AFTER')
    const beforeRows = d.rows.map((r) => `<div class="cba-r b">${richSafe(r.before)}</div>`).join('')
    const afterRows = d.rows.map((r) => `<div class="cba-r a">${richSafe(r.after)}</div>`).join('')
    return `
<section class="cba">
  <div class="cba-hd">
    <h2 class="cba-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="cba-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="cba-cols">
    <div class="cba-col">
      <div class="cba-h b">${bLabel}</div>
      ${media(d.beforeImage, 'cba-media', 'BEFORE')}
      <div class="cba-rows">${beforeRows}</div>
    </div>
    <div class="cba-col">
      <div class="cba-h a">${aLabel}</div>
      ${media(d.afterImage, 'cba-media', 'AFTER')}
      <div class="cba-rows">${afterRows}</div>
    </div>
  </div>
  ${d.closer ? `<p class="cba-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
