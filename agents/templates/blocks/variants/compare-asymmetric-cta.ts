/** COMPARE 아키타입(템플릿 충실 재현): compare-asymmetric-cta.
 *  와디즈 200섹션 07_차별화 비교 _01(비대칭 BEFORE/AFTER + 공유 이미지 + CTA 바) 패턴을 토큰 기반으로 재구성.
 *  상단 대제목+서브 → 풀폭 공유 이미지 → 비대칭 BEFORE(좁은 회색)/AFTER(넓은 흰 카드) → 풀폭 다크 CTA 바. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),              // 예 "왜 특별할까요?" (em,br)
  subtitle: z.string().min(1).optional(), // 부제목
  sharedImage: z.string().optional(),    // 풀폭 공유 이미지 (url)
  beforeLabel: z.string().min(1).optional(), // 기본 BEFORE
  afterLabel: z.string().min(1).optional(),  // 기본 AFTER
  beforeItems: z
    .array(z.object({ text: z.string().min(1) })) // (em,br)
    .min(2)
    .max(4),
  afterItems: z
    .array(z.object({ text: z.string().min(1) })) // (em,br)
    .min(2)
    .max(4),
  cta: z.string().min(1), // 풀폭 다크 CTA 텍스트 (em,br)
})
type Data = z.infer<typeof schema>

export const compareAsymmetricCta = defineBlock<Data>({
  id: 'compare-asymmetric-cta',
  archetype: 'compare',
  styleTags: ['premium', 'template', 'comparison', 'light', 'cta'],
  imageSlots: 1,
  describe:
    '차별화 비교(비대칭 카드+CTA). 대제목+서브 → 풀폭 공유 이미지 → 좁은 BEFORE(회색)/넓은 AFTER(흰 카드) 비대칭 배치 → 풀폭 다크 CTA 바. 선택 촉구형 비포/애프터.',
  schema,
  css: `
.cac{background:var(--bg);padding:54px 0 0}
.cac-hd{text-align:center;padding:0 52px 36px}
.cac-title{font-family:var(--font-display);font-weight:800;font-size:56px;color:var(--accent);letter-spacing:-.02em;line-height:1.1}
.cac-sub{margin-top:12px;font-size:17px;color:var(--ink-2)}
.cac-shared-img{width:100%;height:260px;object-fit:cover;display:block}
.cac-cols{display:flex;align-items:stretch;gap:0}
.cac-before{flex:0 0 38%;background:#EBEBEE;padding:24px 20px 28px}
.cac-after{flex:1;background:var(--paper);padding:24px 24px 28px;box-shadow:0 12px 32px -10px rgba(0,0,0,.22)}
.cac-badge{display:inline-block;font-family:var(--font-display);font-weight:800;font-size:16px;letter-spacing:.1em;padding:8px 20px;border:2px solid currentColor;border-radius:4px;margin-bottom:20px}
.cac-before .cac-badge{color:#9A9AA3;border-color:#CACACE}
.cac-after .cac-badge{color:var(--accent);border-color:var(--accent)}
.cac-brow{font-size:14px;color:#9A9AA3;line-height:1.55;text-align:center;padding:12px 0}
.cac-brow + .cac-brow{border-top:1px solid #DADADD}
.cac-arow{font-size:15px;font-weight:700;color:var(--ink);line-height:1.55;text-align:center;padding:13px 0}
.cac-arow + .cac-arow{border-top:1px solid var(--line)}
.cac-arow .em{color:var(--accent)}
.cac-cta{background:var(--ink);padding:42px 40px;text-align:center}
.cac-cta-text{font-family:var(--font-display);font-weight:800;font-size:40px;color:#fff;line-height:1.3}
.cac-cta-text .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const bLabel = esc(d.beforeLabel ?? 'BEFORE')
    const aLabel = esc(d.afterLabel ?? 'AFTER')
    const beforeRows = d.beforeItems
      .map((it) => `<div class="cac-brow">${richSafe(it.text)}</div>`)
      .join('')
    const afterRows = d.afterItems
      .map((it) => `<div class="cac-arow">${richSafe(it.text)}</div>`)
      .join('')
    return `
<section class="cac">
  <div class="cac-hd">
    <h2 class="cac-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="cac-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${media(d.sharedImage, 'cac-shared-img', '비포&애프터 이미지')}
  <div class="cac-cols">
    <div class="cac-before">
      <div class="cac-badge">${bLabel}</div>
      ${beforeRows}
    </div>
    <div class="cac-after">
      <div class="cac-badge">${aLabel}</div>
      ${afterRows}
    </div>
  </div>
  <div class="cac-cta">
    <p class="cac-cta-text">${richSafe(d.cta)}</p>
  </div>
</section>`
  },
})
