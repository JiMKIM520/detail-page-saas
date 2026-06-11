/** SPEC 아키타입: spec-table(에디토리얼 상세정보 테이블). */
import { z } from 'zod'
import { defineBlock } from '../types'

const specSchema = z.object({
  kicker: z.string().optional(),
  title: z.string().min(1),
  rows: z.array(z.object({ k: z.string().min(1), v: z.string().min(1) })).min(2).max(10), // v는 em 허용
})
type SpecData = z.infer<typeof specSchema>

export const specTable = defineBlock<SpecData>({
  id: 'spec-table',
  archetype: 'spec',
  styleTags: ['editorial', 'minimal', 'premium'],
  imageSlots: 0,
  describe: '제품 상세 정보 테이블. 헤어라인 행(라벨 | 값), 값 키워드 강조. 깔끔한 에디토리얼.',
  schema: specSchema,
  css: `
.st{padding:84px 64px}
.st-head{margin-bottom:36px}
.st-kick{font-size:13px;font-weight:700;letter-spacing:.42em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
.st-h{font-family:var(--font-serif);font-weight:700;font-size:34px}
.st-row{display:grid;grid-template-columns:180px 1fr;gap:24px;padding:22px 4px;border-top:1px solid var(--line);align-items:baseline}
.st-row:last-child{border-bottom:1px solid var(--line)}
.st-k{font-size:14px;letter-spacing:.04em;color:var(--muted);font-weight:600}
.st-v{font-size:18px;color:var(--ink);font-weight:500}
.st-v .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="st">
  <div class="st-head">
    ${d.kicker ? `<p class="st-kick">${esc(d.kicker)}</p>` : ''}
    <h2 class="st-h">${esc(d.title)}</h2>
  </div>
  <dl>
    ${d.rows.map((r) => `<div class="st-row"><dt class="st-k">${esc(r.k)}</dt><dd class="st-v">${richSafe(r.v)}</dd></div>`).join('')}
  </dl>
</section>`,
})
