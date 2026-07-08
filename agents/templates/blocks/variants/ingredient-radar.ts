/** INGREDIENT 아키타입 변형: ingredient-radar (04_원료소개 567:1516)
 *  레이아웃: 영문 필 뱃지(아이브로) + 대형 컬러 제목 + 서브텍스트
 *             → 인라인 SVG 오각형 레이더 차트(점선 외곽 오각형 + 반투명 accent 내부 오각형)
 *             → 흰 카드: check 아이콘·라벨·설명 최대 4행(구분선 포함).
 *  라이트 배경(--bg), 카드 표면(--paper). 다른 ingredient 변형과 겹치지 않는 레이더+체크리스트 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),                // 예 "INGREDIENTS"
  title: z.string().min(1),                              // 대형 컬러 헤드라인 (em,br)
  subtitle: z.string().min(1).optional(),                // 서브텍스트 한 줄
  items: z
    .array(
      z.object({
        label: z.string().min(1),                        // 원료명 (em,br)
        desc: z.string().min(1).optional(),              // 원료 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

/* Pentagon SVG points (viewBox 0 0 320 300):
   outer dashed border, inner filled semi-transparent accent shape.
   Pentagon vertices (top→right→bottom-right→bottom-left→left), r_outer=140, r_inner=100,
   centre (160,155), starting angle -90° (top).
   outer: (160,15) (293,116) (240,271) (80,271) (27,116)
   inner: (160,55) (251,128) (214,237) (106,237) (69,128) */
const RADAR_SVG = `<svg class="irdr-radar" viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <polygon class="irdr-radar-outer" points="160,15 293,116 240,271 80,271 27,116"/>
  <polygon class="irdr-radar-inner" points="160,55 251,128 214,237 106,237 69,128"/>
</svg>`

export const ingredientRadar = defineBlock<Data>({
  id: 'ingredient-radar',
  archetype: 'ingredient',
  styleTags: ['light', 'checklist', 'template', 'minimal'],
  imageSlots: 0,
  describe:
    '원료 소개(레이더차트+체크리스트). 라이트 배경 + 영문 뱃지 + 대형 컬러 제목 + 인라인 SVG 오각형 레이더 차트(점선 외곽+반투명 내부) + 흰 카드 check 아이콘·라벨·설명 최대 4행. 다른 ingredient 변형과 보색 대비.',
  schema,
  css: `
.irdr{background:var(--bg);padding:56px 0 0}
.irdr-hd{text-align:center;padding:0 44px 0}
.irdr-badge{display:inline-block;background:var(--accent);color:#fff;font-size:13px;font-weight:800;letter-spacing:.15em;padding:7px 22px;border-radius:999px;line-height:1}
.irdr-title{margin-top:20px;font-family:var(--font-display);font-weight:800;font-size:64px;color:var(--accent);letter-spacing:-.02em;line-height:1.05}
.irdr-title .em{color:var(--accent-d)}
.irdr-sub{margin-top:14px;font-size:17px;color:var(--ink-2);line-height:1.6}
.irdr-chart{display:flex;justify-content:center;align-items:center;padding:36px 44px 40px}
.irdr-radar{width:260px;height:244px;overflow:visible}
.irdr-radar-wrap{position:relative;display:inline-block}
.irdr-vertex{position:absolute;transform:translate(-50%,-50%);background:var(--paper);border:1.5px solid var(--accent);color:var(--accent-d);font-weight:800;font-size:12px;padding:5px 12px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.irdr-v0{left:50%;top:2%}
.irdr-v1{left:99%;top:38%}
.irdr-v2{left:82%;top:96%}
.irdr-v3{left:18%;top:96%}
.irdr-v4{left:1%;top:38%}
.irdr-radar-outer{fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:6 4;opacity:.55}
.irdr-radar-inner{fill:var(--accent);fill-opacity:.18;stroke:var(--accent);stroke-width:1.5;opacity:.8}
.irdr-card{margin:0 32px 56px;background:var(--paper);border-radius:calc(var(--r-scale,1)*20px);overflow:hidden}
.irdr-row{display:flex;align-items:flex-start;gap:18px;padding:26px 32px}
.irdr-row+.irdr-row{border-top:1px solid var(--line)}
.irdr-icon{flex:0 0 36px;width:36px;height:36px;color:var(--accent)}
.irdr-icon svg{width:100%;height:100%}
.irdr-body{flex:1;min-width:0}
.irdr-label{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--ink);line-height:1.2}
.irdr-label .em{color:var(--accent)}
.irdr-desc{margin-top:5px;font-size:14px;color:var(--ink-2);line-height:1.65}
.irdr-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="irdr">
  <div class="irdr-hd">
    ${d.eyebrow ? `<span class="irdr-badge">${esc(d.eyebrow)}</span>` : ''}
    <h2 class="irdr-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="irdr-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="irdr-chart">
    <div class="irdr-radar-wrap">
      ${RADAR_SVG}
      ${d.items.slice(0, 5).map((it, i) => `<span class="irdr-vertex irdr-v${i}">${richSafe(it.label)}</span>`).join('')}
    </div>
  </div>
  <div class="irdr-card">
    ${d.items
      .map(
        (it) => `
    <div class="irdr-row">
      <span class="irdr-icon">${icon('check')}</span>
      <div class="irdr-body">
        <div class="irdr-label">${richSafe(it.label)}</div>
        ${it.desc ? `<div class="irdr-desc">${richSafe(it.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
