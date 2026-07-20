/** CALLOUT 아키타입: callout-icon-box.
 *  컬러 박스 + 아이콘 + 두꺼운 좌측 보더 강조 callout.
 *  밀도 문법 §4 체크마크 시스템(V획 인라인·도트 궤적) 적용, currentColor·var(--accent) 바인딩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

// V획 인라인 체크 SVG (16px, stroke=currentColor, 문법 사전 recipe)
const SVG_CHECK =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5 7-7"/></svg>'

// 원형 도트 SVG (8px, fill=currentColor, 문법 사전 recipe)
const SVG_DOT =
  '<svg viewBox="0 0 8 8" fill="currentColor" aria-hidden="true"><circle cx="4" cy="4" r="3.2"/></svg>'

const itemSchema = z.object({
  text: z.string().min(1),
  dot: z.boolean().optional(), // true → 도트 불릿, 기본값 false → 체크 불릿
})

const schema = z.object({
  icon: z.enum(ICON_NAMES).optional(),      // 박스 좌측 아이콘 (선택)
  title: z.string().min(1),                 // 강조 제목 (em 허용)
  body: z.string().min(1),                  // 본문 (em, br 허용)
  items: z.array(itemSchema).max(5).optional(), // 체크/도트 불릿 아이템 목록
})
type Data = z.infer<typeof schema>

export const calloutIconBox = defineBlock<Data>({
  id: 'callout-icon-box',
  archetype: 'callout',
  styleTags: ['light', 'accent', 'highlight', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '강조 인포박스(두꺼운 좌측 악센트 보더+연한 배경+아이콘). 아이콘(선택) + 제목 + 본문 + 선택형 체크/도트 SVG 불릿 리스트. 팁·주의사항·핵심 메시지 강조. 밀도 문법 체크마크 시스템(currentColor·var(--accent)) 적용.',
  schema,
  css: `
/* ── callout-icon-box (접두: cib) ── */
.cib{background:var(--bg);padding:28px var(--pad-x,56px) 36px}
.cib-box{
  border-left:5px solid var(--accent);
  background:color-mix(in srgb,var(--accent) 8%,var(--paper));
  border-radius:0 calc(var(--r-scale,1)*14px) calc(var(--r-scale,1)*14px) 0;
  padding:24px 28px;
  display:flex;gap:18px;align-items:flex-start}

/* 좌측 아이콘 */
.cib-icon{flex:0 0 40px;width:40px;height:40px;color:var(--accent);margin-top:2px}
.cib-icon svg{width:40px;height:40px}

/* 콘텐츠 */
.cib-content{flex:1;min-width:0}
.cib-title{
  font-family:var(--font-display);font-weight:800;font-size:20px;
  color:var(--ink);line-height:1.3}
.cib-title .em{color:var(--accent)}
.cib-body{
  margin-top:10px;font-size:16px;color:var(--ink-2);line-height:1.65}
.cib-body .em{color:var(--accent);font-weight:700}

/* 아이템 리스트 — 체크/도트 SVG 불릿 (문법 사전 §4 체크마크 시스템) */
.cib-items{margin-top:14px;display:flex;flex-direction:column;gap:8px}
.cib-item{display:flex;align-items:center;gap:10px;font-size:15px;
  color:var(--ink-2);line-height:1.5}

/* 체크 불릿 — V획 인라인 (16px, currentColor=var(--accent)) */
.cib-check{
  flex:0 0 16px;width:16px;height:16px;
  color:var(--accent);display:flex;align-items:center;justify-content:center}
.cib-check svg{width:16px;height:16px}

/* 도트 불릿 — 원형 (8px, currentColor=var(--accent)) */
.cib-dot{
  flex:0 0 8px;width:8px;height:8px;
  color:var(--accent);display:flex;align-items:center;justify-content:center;
  margin-left:4px}
.cib-dot svg{width:8px;height:8px}
`,
  render: (d, { esc, richSafe, icon: iconFn }) => {
    const iconHtml = d.icon
      ? `<span class="cib-icon">${iconFn(d.icon)}</span>`
      : ''

    const itemsHtml =
      d.items && d.items.length > 0
        ? `<div class="cib-items">${d.items
            .map((it) =>
              it.dot
                ? `<div class="cib-item"><span class="cib-dot">${SVG_DOT}</span><span>${esc(it.text)}</span></div>`
                : `<div class="cib-item"><span class="cib-check">${SVG_CHECK}</span><span>${esc(it.text)}</span></div>`,
            )
            .join('')}</div>`
        : ''

    return `
<section class="cib">
  <div class="cib-box">
    ${iconHtml}
    <div class="cib-content">
      <h3 class="cib-title">${richSafe(d.title)}</h3>
      <p class="cib-body">${richSafe(d.body)}</p>
      ${itemsHtml}
    </div>
  </div>
</section>`
  },
})
