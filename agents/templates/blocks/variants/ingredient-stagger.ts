/** INGREDIENT 아키타입 추가 변형: 04_원료소개 지그재그 스태거 카드.
 *  ingredient-stagger: 라이트 배경 + 4개 카드 교대 좌/우 들여쓰기 +
 *  측면 NO.숫자 세로 태그 + 원형 아이콘. 스텝 감 있는 원료 순서 표현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),          // 상단 소제목 (예: "제품 원료")
  title: z.string().min(1),                        // 섹션 헤드라인 (em,br)
  subtitle: z.string().min(1).optional(),          // 헤드라인 아래 한 줄 설명
  items: z
    .array(
      z.object({
        label: z.string().min(1),                  // 원료 설명 한 줄 (em,br)
        name: z.string().min(1),                   // 원료 이름 굵게 (em,br)
        icon: z.enum(ICON_NAMES).optional(),       // 원형 아이콘 이름
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),            // 하단 마무리 문구 (em,br)
})
type Data = z.infer<typeof schema>

export const ingredientStagger = defineBlock<Data>({
  id: 'ingredient-stagger',
  archetype: 'ingredient',
  styleTags: ['light', 'step', 'template', 'stagger', 'icon'],
  imageSlots: 0,
  describe:
    '원료 소개(지그재그 스태거). 라이트 배경 + 대제목 + 4개 카드 교대 좌/우 들여쓰기 + 측면 NO.숫자 세로 태그 + 원형 아이콘. 스텝 감 있는 원료 순서 표현.',
  schema,
  css: `
.istag{background:color-mix(in srgb,var(--accent) 14%,var(--bg));padding:0 0 60px}
.istag-top{padding:40px 44px 0}
.istag-rule{width:100%;height:1px;background:color-mix(in srgb,var(--ink) 18%,transparent);margin-bottom:40px}
.istag-eyebrow{font-size:15px;font-weight:700;color:var(--accent);letter-spacing:.04em;margin-bottom:10px}
.istag-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;color:var(--accent);line-height:1.1}
.istag-sub{margin-top:12px;font-size:16px;color:var(--ink-2);line-height:1.6}
.istag-list{margin-top:38px;display:flex;flex-direction:column;gap:12px}
.istag-slot{position:relative;display:flex;align-items:stretch}
/* 홀수(0-idx): 카드 왼쪽 정렬, NO 태그 오른쪽 바깥 */
.istag-slot--odd{padding-right:40px}
.istag-slot--odd .istag-card{margin-right:0;width:74%}
.istag-slot--odd .istag-no{right:0;left:auto}
/* 짝수(0-idx): 카드 오른쪽 정렬, NO 태그 왼쪽 바깥 */
.istag-slot--even{padding-left:40px;justify-content:flex-end}
.istag-slot--even .istag-card{margin-left:0;width:80%}
.istag-slot--even .istag-no{left:0;right:auto}
/* 카드 */
.istag-card{background:var(--paper);border-radius:16px;padding:28px 28px 28px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;box-shadow:0 2px 16px rgba(0,0,0,.06)}
.istag-tx{flex:1;min-width:0}
.istag-label{font-size:14px;color:var(--ink-2);line-height:1.5;margin-bottom:6px}
.istag-label .em{color:var(--accent)}
.istag-name{font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--ink);letter-spacing:-.01em;line-height:1.2}
.istag-name .em{color:var(--accent)}
/* 원형 아이콘 */
.istag-icon{flex:0 0 76px;width:76px;height:76px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff}
.istag-icon svg{width:34px;height:34px}
/* NO 측면 세로 태그 */
.istag-no{position:absolute;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:mixed;font-family:var(--font-display);font-weight:800;font-size:11px;letter-spacing:.18em;color:var(--accent);opacity:.9;white-space:nowrap;line-height:1}
/* 하단 마무리 */
.istag-closer{padding:48px 44px 0;font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--ink);line-height:1.4;text-align:center}
.istag-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="istag">
  <div class="istag-top">
    <div class="istag-rule"></div>
    ${d.eyebrow ? `<p class="istag-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="istag-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="istag-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="istag-list">
    ${d.items
      .map(
        (it, i) => {
          const isEven = i % 2 === 1
          const slotClass = isEven ? 'istag-slot--even' : 'istag-slot--odd'
          const noLabel = `NO.${i + 1}`
          return `
    <div class="istag-slot ${slotClass}">
      <div class="istag-no">${esc(noLabel)}</div>
      <div class="istag-card">
        <div class="istag-tx">
          <div class="istag-label">${richSafe(it.label)}</div>
          <div class="istag-name">${richSafe(it.name)}</div>
        </div>
        <div class="istag-icon">${icon(it.icon ?? 'leaf')}</div>
      </div>
    </div>`
        },
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="istag-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
