/** CHECKPOINT 아키타입 변형: checkpoint-rows(아이콘 행 카드), checkpoint-grid(2×2 넘버 그리드). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

// ── checkpoint-rows ───────────────────────────────────────────
const rowsSchema = z.object({
  title: z.string().min(1), // em 강조 허용
  pill: z.string().optional(),
  items: z
    .array(z.object({ icon: z.enum(ICON_NAMES), text: z.string().min(1) }))
    .min(3)
    .max(6),
  photo: z.string().optional(),
})
type RowsData = z.infer<typeof rowsSchema>

export const checkpointRows = defineBlock<RowsData>({
  id: 'checkpoint-rows',
  archetype: 'checkpoint',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 1,
  describe: '체크포인트 카드. 원형 라인 아이콘 + 키워드 강조 텍스트 5행, 점선 구분. 아래 연출 사진. 따뜻한 톤.',
  schema: rowsSchema,
  css: `
.cpr{position:relative;padding:70px var(--pad-x,56px) 64px;background:var(--bg)}
.cpr-head{text-align:center}
.cpr-h{font-size:38px}
.cpr-pill{display:inline-block;margin-top:20px;background:var(--accent);color:#fff;font-weight:800;font-size:20px;padding:11px 34px;border-radius:999px;letter-spacing:.06em;box-shadow:0 8px 18px rgba(232,128,31,.35)}
.cpr-card{margin-top:30px;background:var(--paper);border:1.5px solid var(--line);border-radius:calc(var(--r-scale,1)*24px);padding:14px 36px;box-shadow:0 18px 40px -22px rgba(42,33,24,.35)}
.cpr-row{display:flex;align-items:center;gap:22px;padding:24px 4px}
.cpr-row + .cpr-row{border-top:2px dashed var(--line)}
.cpr-ico{flex:0 0 60px;width:60px;height:60px;border-radius:50%;border:2.5px solid var(--accent);display:grid;place-items:center;background:#FFF8F0;color:var(--accent)}
.cpr-ico svg{width:32px;height:32px}
.cpr-row p{font-size:21px;font-weight:600;color:var(--ink-2)}
.cpr-row p .em{font-weight:800}
.cpr-photo{margin-top:30px;width:100%;height:330px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*22px));box-shadow:0 18px 38px -20px rgba(42,33,24,.4)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="cpr">
  <div class="wm"></div>
  <div class="cpr-head">
    <h2 class="disp cpr-h">${richSafe(d.title)}</h2>
    ${d.pill ? `<span class="cpr-pill">${esc(d.pill)}</span>` : ''}
  </div>
  <div class="cpr-card">
    ${d.items
      .map((it) => `<div class="cpr-row"><span class="cpr-ico">${icon(it.icon)}</span><p>${richSafe(it.text)}</p></div>`)
      .join('')}
  </div>
  ${media(d.photo, 'cpr-photo', '연출 사진')}
</section>`,
})

// ── checkpoint-grid ───────────────────────────────────────────
const gridSchema = z.object({
  kicker: z.string().optional(),
  title: z.string().min(1),
  items: z
    .array(z.object({ no: z.string().min(1), title: z.string().min(1), desc: z.string().min(1) }))
    .min(2)
    .max(6),
})
type GridData = z.infer<typeof gridSchema>

export const checkpointGrid = defineBlock<GridData>({
  id: 'checkpoint-grid',
  archetype: 'checkpoint',
  styleTags: ['editorial', 'minimal', 'premium'],
  imageSlots: 0,
  describe: '체크포인트 2×2 넘버 그리드. 세리프 넘버 + 제목 + 설명, 헤어라인 셀. 미니멀/에디토리얼.',
  schema: gridSchema,
  css: `
.cpg{padding:84px 64px}
.cpg-head{text-align:center;margin-bottom:48px}
.cpg-kick{font-size:13px;font-weight:700;letter-spacing:.42em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
.cpg-rule{width:48px;height:1.5px;background:var(--accent);margin:0 auto 22px}
.cpg-h{font-family:var(--font-serif);font-weight:700;font-size:38px}
.cpg-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1.5px solid var(--ink)}
.cpg-cell{padding:34px 30px;border-bottom:1.5px solid var(--line)}
.cpg-cell:nth-child(odd){border-right:1.5px solid var(--line)}
/* 홀수 아이템 시 마지막 셀 풀스팬(조립 계층 파생 규칙과 짝) — 중앙 분할선 잔재 제거 */
.cpg-cell:last-child:nth-child(odd){border-right:none;text-align:center}
.cpg-no{font-family:var(--font-lat);font-size:30px;font-weight:600;color:var(--accent);line-height:1}
.cpg-t{margin-top:16px;font-size:21px;font-weight:700}
.cpg-d{margin-top:10px;font-size:15px;line-height:1.7;color:var(--ink-2)}
`,
  render: (d, { esc }) => `
<section class="cpg">
  <div class="cpg-head">
    ${d.kicker ? `<p class="cpg-kick">${esc(d.kicker)}</p>` : ''}
    <div class="cpg-rule"></div>
    <h2 class="cpg-h">${esc(d.title)}</h2>
  </div>
  <div class="cpg-grid">
    ${d.items
      .map((it) => `<div class="cpg-cell"><div class="cpg-no">${esc(it.no)}</div><h3 class="cpg-t">${esc(it.title)}</h3><p class="cpg-d">${esc(it.desc)}</p></div>`)
      .join('')}
  </div>
</section>`,
})
