/** INGREDIENT 아키타입 추가 변형(템플릿 충실 재현): 04_원료소개 — 가로·세로 룰 2×2 아이콘 그리드.
 *  ingredient-rule-grid: 라이트 배경 + 중앙정렬 accent 대제목 + 헤어라인 룰로만
 *  나뉜 2×2 그리드(카드 배경 없음) + 각 셀 아이콘(상단)·라벨·설명(하단) + 2행 클로저.
 *  이미지 슬롯 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const schema = z.object({
  title: z.string().min(1),                    // 섹션 대제목 (em,br) — accent 색 대형 표시
  subtitle: z.string().min(1).optional(),      // 제목 아래 한 줄 설명
  items: z
    .array(
      z.object({
        icon: z.enum(ICON_NAMES).optional(),   // 셀 아이콘 이름 (기본: leaf)
        label: z.string().min(1),              // 원료명/특징명 (em,br)
        desc: z.string().min(1).optional(),    // 원료 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closerLight: z.string().min(1).optional(),   // 클로저 첫 줄 (보통 굵기)
  closerBold: z.string().min(1).optional(),    // 클로저 둘째 줄 (굵게, em,br)
})
type Data = z.infer<typeof schema>

export const ingredientRuleGrid = defineBlock<Data>({
  id: 'ingredient-rule-grid',
  archetype: 'ingredient' as any,
  styleTags: ['light', 'minimal', 'template', 'grid', 'icon', 'rule'],
  imageSlots: 0,
  describe:
    '원료 소개(룰 2×2 아이콘 그리드). 라이트 배경 + 중앙정렬 accent 대제목 + 헤어라인 룰로만 나뉜 2×2 격자 + 각 셀 대형 아이콘(상단)·룰·라벨·설명(하단) + 2행 클로저. 이미지 없음.',
  schema,
  css: `
.irg{background:var(--bg);color:var(--ink);padding:64px 0 0}
.irg-hd{text-align:center;padding:0 48px 0}
.irg-title{font-family:var(--font-display);font-weight:800;font-size:64px;letter-spacing:-.02em;line-height:1.1;color:var(--accent)}
.irg-title .em{color:var(--accent-dark)}
.irg-rule-top{width:100%;height:1px;background:var(--line);margin-top:36px}
.irg-sub{text-align:center;padding:22px 48px;font-size:17px;color:var(--ink-2);line-height:1.6}
.irg-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line)}
.irg-cell{display:flex;flex-direction:column;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.irg-cell:nth-child(2n){border-right:none}
.irg-icon-wrap{display:flex;align-items:center;justify-content:center;padding:44px 24px 40px;color:var(--accent)}
.irg-icon-wrap svg{width:88px;height:88px;stroke-width:1.5}
.irg-cell-rule{height:1px;background:var(--line);margin:0}
.irg-body{padding:28px 32px 38px}
.irg-label{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--accent);line-height:1.2}
.irg-label .em{color:var(--accent-dark)}
.irg-desc{margin-top:10px;font-size:14px;color:var(--ink-2);line-height:1.7}
.irg-desc .em{color:var(--accent);font-weight:700}
.irg-closer{padding:52px 48px 64px;text-align:center;background:var(--bg)}
.irg-closer-light{font-family:var(--font-display);font-size:34px;font-weight:400;color:var(--ink);line-height:1.35}
.irg-closer-bold{font-family:var(--font-display);font-size:38px;font-weight:800;color:var(--ink);line-height:1.25}
.irg-closer-bold .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="irg">
  <div class="irg-hd">
    <h2 class="irg-title">${richSafe(d.title)}</h2>
  </div>
  <div class="irg-rule-top"></div>
  ${d.subtitle ? `<p class="irg-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="irg-grid">
    ${d.items
      .map(
        (it) => `
    <div class="irg-cell">
      <div class="irg-icon-wrap">${icon(it.icon ?? 'leaf')}</div>
      <hr class="irg-cell-rule">
      <div class="irg-body">
        <div class="irg-label">${richSafe(it.label)}</div>
        ${it.desc ? `<div class="irg-desc">${richSafe(it.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${
    d.closerLight || d.closerBold
      ? `<div class="irg-closer">
    ${d.closerLight ? `<p class="irg-closer-light">${esc(d.closerLight)}</p>` : ''}
    ${d.closerBold ? `<p class="irg-closer-bold">${richSafe(d.closerBold)}</p>` : ''}
  </div>`
      : ''
  }
</section>`,
})
