/** CHECKLIST 아키타입: checklist-checks (체크 아이콘 + 키워드 강조 + 별 데코).
 *  밀도 문법 §4 체크마크 시스템(V획 인라인, currentColor·var(--accent)) 업그레이드. */
import { z } from 'zod'
import { defineBlock } from '../types'

// V획 인라인 체크 SVG (20px, stroke=currentColor, 문법 사전 recipe)
const SVG_CHECK_V =
  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5l4.5 4.5 8.5-9"/></svg>'

const schema = z.object({
  title: z.string().min(1), // em 강조 허용
  items: z
    .array(z.object({ text: z.string().min(1), star: z.boolean().optional() }))
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const checklistChecks = defineBlock<Data>({
  id: 'checklist-checks',
  archetype: 'checklist',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe: '추천 대상/특징 체크리스트. 원형 체크 아이콘(V획 SVG, currentColor) + 키워드 강조 + 점선 구분, 마지막 항목 별 데코.',
  schema,
  css: `
.cl{position:relative;background:var(--bg);padding:60px 70px 64px}
.cl-h{text-align:center;font-size:34px;margin-bottom:34px}
.cl-item{display:flex;align-items:center;gap:18px;padding:20px 0}
.cl-item + .cl-item{border-top:1.5px dashed var(--line)}
/* V획 체크 불릿 — 밀도 문법 §4 원형 배지 변형:
   아웃라인 원 + currentColor(=var(--accent)) 스트로크 V획 (20px 인라인). */
.cl-ck{
  flex:0 0 38px;width:38px;height:38px;border-radius:50%;
  border:2px solid var(--accent);
  background:color-mix(in srgb,var(--accent) 10%,var(--paper));
  display:grid;place-items:center;
  color:var(--accent)}
.cl-ck svg{width:20px;height:20px}
.cl-item p{font-size:22px;font-weight:700;color:var(--ink-2)}
.cl-star{margin-left:6px;color:var(--accent);font-size:20px}
`,
  render: (d, { richSafe }) => `
<section class="cl">
  <div class="wm"></div>
  <h2 class="disp cl-h">${richSafe(d.title)}</h2>
  ${d.items
    .map((it) => `<div class="cl-item"><span class="cl-ck">${SVG_CHECK_V}</span><p>${richSafe(it.text)}${it.star ? `<span class="cl-star">✦</span>` : ''}</p></div>`)
    .join('')}
</section>`,
})
