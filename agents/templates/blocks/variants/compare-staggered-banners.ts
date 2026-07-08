/** COMPARE 아키타입(템플릿 충실 재현): compare-staggered-banners.
 *  와디즈 200섹션 07_차별화 비교 _엇갈림 배너 패턴을 토큰 기반으로 재구성.
 *  대제목+서브 → 3쌍 BEFORE/AFTER 스트립(좌 오프셋 BEFORE·우 오프셋 AFTER·중앙 VS 원) → 하단 클로저.
 *  이미지 없음, 순수 텍스트 레이아웃. 어떤 프리셋이든 적응. */
import { z } from 'zod'
import { defineBlock } from '../types'

const pairSchema = z.object({
  beforeText: z.string().min(1), // BEFORE 설명 (em,br)
  afterText: z.string().min(1),  // AFTER 강조 설명 (em,br)
})

const schema = z.object({
  title: z.string().min(1),                    // 대제목 (em,br)
  subtitle: z.string().min(1).optional(),      // 서브타이틀
  beforeLabel: z.string().min(1).optional(),   // 기본 "Before"
  afterLabel: z.string().min(1).optional(),    // 기본 "After"
  vsLabel: z.string().min(1).optional(),       // VS 원 텍스트, 기본 "VS"
  pairs: pairSchema.array().min(2).max(4),     // BEFORE/AFTER 쌍 (2~4)
  closer: z.string().min(1).optional(),        // 하단 마무리 (em,br)
})
type Data = z.infer<typeof schema>

export const compareStaggeredBanners = defineBlock<Data>({
  id: 'compare-staggered-banners',
  archetype: 'compare',
  styleTags: ['premium', 'template', 'comparison', 'light', 'zigzag'],
  imageSlots: 0,
  describe:
    '차별화 비교(엇갈림 배너). 대제목+서브 → BEFORE(좌 오프셋 카드)+VS 원+AFTER(우 오프셋 카드) 쌍 반복(2~4개) → 하단 클로저. 지그재그 엇갈림 레이아웃, 이미지 없음.',
  schema,
  css: `
.csb{background:color-mix(in srgb,var(--accent) 14%,var(--bg));padding:52px 0 60px;color:var(--ink)}
.csb-hd{padding:0 52px 40px}
.csb-title{font-family:var(--font-display);font-weight:800;font-size:60px;letter-spacing:-.02em;line-height:1.08;color:var(--ink)}
.csb-title .em{color:var(--accent)}
.csb-sub{margin-top:12px;font-size:17px;color:var(--ink-2);font-weight:500}
.csb-pairs{display:flex;flex-direction:column;gap:0;position:relative}
.csb-pair{position:relative;display:flex;flex-direction:column;margin-bottom:8px}
.csb-before{width:78%;background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);padding:28px 32px 30px;margin-left:0;box-shadow:0 2px 12px -4px rgba(0,0,0,.10)}
.csb-before-lbl{font-family:var(--font-display);font-weight:700;font-size:19px;color:var(--muted);letter-spacing:.06em;margin-bottom:10px}
.csb-before-txt{font-size:15px;color:var(--muted);line-height:1.7}
.csb-before-txt .em{color:var(--accent);font-weight:700}
.csb-vs{position:absolute;left:50%;transform:translateX(-50%);width:54px;height:54px;border-radius:50%;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:17px;letter-spacing:.04em;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px -4px color-mix(in srgb,var(--accent) 60%,transparent);z-index:2;top:50%;margin-top:-27px}
.csb-after{width:78%;background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);padding:28px 32px 30px;margin-left:auto;margin-right:0;box-shadow:0 4px 20px -6px rgba(0,0,0,.15);border:2px solid color-mix(in srgb,var(--accent) 22%,transparent)}
.csb-after-lbl{font-family:var(--font-display);font-weight:800;font-size:19px;color:var(--accent);letter-spacing:.06em;margin-bottom:10px}
.csb-after-txt{font-size:15px;font-weight:700;color:var(--ink);line-height:1.7}
.csb-after-txt .em{color:var(--accent);font-weight:800}
.csb-closer{margin-top:44px;padding:0 52px;text-align:center}
.csb-closer-txt{font-family:var(--font-display);font-weight:800;font-size:44px;color:var(--ink);line-height:1.25;letter-spacing:-.02em}
.csb-closer-txt .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const bLabel = esc(d.beforeLabel ?? 'Before')
    const aLabel = esc(d.afterLabel ?? 'After')
    const vsText = esc(d.vsLabel ?? 'VS')
    const pairs = d.pairs
      .map(
        (pair) => `
  <div class="csb-pair">
    <div class="csb-before">
      <div class="csb-before-lbl">${bLabel}</div>
      <div class="csb-before-txt">${richSafe(pair.beforeText)}</div>
    </div>
    <div class="csb-vs">${vsText}</div>
    <div class="csb-after">
      <div class="csb-after-lbl">${aLabel}</div>
      <div class="csb-after-txt">${richSafe(pair.afterText)}</div>
    </div>
  </div>`,
      )
      .join('')
    return `
<section class="csb">
  <div class="csb-hd">
    <h2 class="csb-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="csb-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="csb-pairs">${pairs}
  </div>
  ${d.closer ? `<div class="csb-closer"><p class="csb-closer-txt">${richSafe(d.closer)}</p></div>` : ''}
</section>`
  },
})
