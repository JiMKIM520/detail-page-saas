/** FEATURE 아키타입(템플릿 충실 재현): feature-zigzag-circle.
 *  와디즈 200섹션 "03_특장점" 지그재그 원형이미지(_629) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(서브타이틀+대제목) + 3행 지그재그(행별 원형이미지·텍스트카드 좌우 교대) + 닫힘 카피. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subtitle: z.string().min(1).optional(),   // 헤더 서브 카피 (예: "우리 제품이 특별한 이유를")
  title: z.string().min(1),                 // 섹션 대제목 (em,br 허용)
  rows: z
    .array(
      z.object({
        image: z.string().optional(),         // 원형 크롭 이미지 (url)
        heading: z.string().min(1),           // 굵은 소제목 (em,br 허용)
        desc: z.string().min(1).optional(),   // 본문 설명 (em,br 허용)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),     // 하단 마무리 카피 (em,br 허용)
})
type Data = z.infer<typeof schema>

export const featureZigzagCircle = defineBlock<Data>({
  id: 'feature-zigzag-circle',
  archetype: 'feature',
  styleTags: ['premium', 'cobalt', 'rounded', 'template', 'zigzag'],
  imageSlots: 3,
  describe:
    '특장점 지그재그 원형이미지. 서브타이틀+대형 대제목 헤더 + 라운드 카드 내 원형이미지·텍스트(소제목+설명)를 좌우 교대로 쌓은 3행 지그재그 + 마무리 카피. 밝고 부드러운 코발트 라이트 톤.',
  schema,
  css: `
.fzc{background:var(--bg);padding:54px 32px 58px}
.fzc-hd{padding:0 8px;margin-bottom:36px}
.fzc-sub{font-size:16px;font-weight:500;color:var(--ink-2);line-height:1.5}
.fzc-title{margin-top:10px;font-family:var(--font-display);font-weight:800;font-size:62px;color:var(--accent);letter-spacing:-.02em;line-height:1.1}
.fzc-title .em{color:var(--ink)}
.fzc-rows{display:flex;flex-direction:column;gap:0}
.fzc-row{background:var(--paper);border-radius:28px;padding:28px 24px;display:flex;align-items:center;gap:22px}
.fzc-row+.fzc-row{margin-top:0;border-top:none}
.fzc-sep{height:1px;margin:0 24px;border:none;border-top:2px dashed color-mix(in srgb,var(--accent) 28%,transparent)}
.fzc-row.reverse{flex-direction:row-reverse}
.fzc-circle{flex:0 0 148px;width:148px;height:148px;border-radius:50%;object-fit:cover;overflow:hidden}
.fzc-circle.ph{border-radius:50%}
.fzc-tx{flex:1;min-width:0}
.fzc-heading{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--accent);line-height:1.25}
.fzc-heading .em{color:var(--ink)}
.fzc-desc{margin-top:10px;font-size:14px;color:var(--ink-2);line-height:1.7}
.fzc-desc .em{color:var(--accent);font-weight:700}
.fzc-closer{margin-top:48px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--ink);line-height:1.4;padding:0 8px}
.fzc-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="fzc">
  <div class="fzc-hd">
    ${d.subtitle ? `<p class="fzc-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="fzc-title">${richSafe(d.title)}</h2>
  </div>
  <div class="fzc-rows">
    ${d.rows
      .map((row, i) => {
        const isReverse = i % 2 === 1
        const rowClass = isReverse ? 'fzc-row reverse' : 'fzc-row'
        const sep = i > 0 ? '<hr class="fzc-sep">' : ''
        return `${sep}
    <div class="${rowClass}">
      ${media(row.image, 'fzc-circle', '특장점 이미지')}
      <div class="fzc-tx">
        <div class="fzc-heading">${richSafe(row.heading)}</div>
        ${row.desc ? `<div class="fzc-desc">${richSafe(row.desc)}</div>` : ''}
      </div>
    </div>`
      })
      .join('')}
  </div>
  ${d.closer ? `<p class="fzc-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
