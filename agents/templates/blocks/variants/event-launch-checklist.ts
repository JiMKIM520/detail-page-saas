/** EVENT 아키타입(템플릿 충실 재현): event-launch-checklist.
 *  와디즈 200섹션 "13_이벤트" _04(Launch Event 투톤 히어로+체크리스트) 패턴을
 *  토큰 기반으로 재구성(클론 아님).
 *  다크 상단(Launch Event 배지+대형 제목+히어로 이미지+선착순 혜택 pill) /
 *  라이트 하단(추천 대상 체크리스트) 이분할 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().min(1).optional(),            // 상단 배지 라벨 (예: "Launch Event")
  title: z.string().min(1),                        // 다크 영역 대형 제목 (em,br 허용)
  image: z.string().optional(),                    // 히어로 상품/오브젝트 이미지 url
  limitLabel: z.string().min(1).optional(),        // 선착순 pill 라벨 (예: "선착순\n한정")
  benefitText: z.string().min(1),                  // 혜택 설명 텍스트 (em,br 허용)
  recommendTitle: z.string().min(1).optional(),    // 라이트 섹션 추천 헤딩 (예: "이런 분께 강력 추천!")
  checks: z
    .array(
      z.object({
        text: z.string().min(1),                 // 체크 항목 텍스트 (em,br 허용)
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const eventLaunchChecklist = defineBlock<Data>({
  id: 'event-launch-checklist',
  archetype: 'event' as any,
  styleTags: ['premium', 'template', 'dark', 'launch', 'checklist', 'twotone'],
  imageSlots: 1,
  describe:
    '이벤트 론치 투톤 레이아웃. 다크 상단(배지+대형 제목+히어로 이미지+선착순 혜택 pill) + 라이트 하단(타겟 추천 체크리스트). 론치 이벤트·선착순 한정·무료 체험 섹션에 최적.',
  schema,
  css: `
/* ── 다크 상단 ── */
.elc-dark{background:var(--brand);color:#fff;padding:36px 40px 44px;position:relative;overflow:hidden}

/* 배지 */
.elc-badge{display:inline-block;border:1.5px solid rgba(255,255,255,.55);border-radius:999px;font-size:13px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.9);padding:5px 16px;margin-bottom:22px}

/* 대형 제목 */
.elc-title{font-family:var(--font-display);font-weight:900;font-size:58px;letter-spacing:-.03em;line-height:1.08;color:#fff;margin-bottom:0}
.elc-title .em{color:var(--accent)}

/* 히어로 이미지 */
.elc-hero-wrap{display:flex;justify-content:center;margin:28px 0 0}
.elc-hero{width:100%;height:320px;object-fit:contain;border-radius:20px}

/* 선착순 혜택 pill */
.elc-pill-row{display:flex;align-items:stretch;gap:0;margin-top:24px;border-radius:14px;overflow:hidden;border:1.5px solid rgba(255,255,255,.22)}
.elc-limit{background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:900;font-size:20px;line-height:1.2;padding:18px 20px;white-space:pre-line;text-align:center;min-width:90px;display:flex;align-items:center;justify-content:center;letter-spacing:.01em}
.elc-benefit{flex:1;background:rgba(255,255,255,.09);padding:16px 20px;font-size:16px;font-weight:500;color:rgba(255,255,255,.92);line-height:1.6;display:flex;align-items:center}
.elc-benefit .em{color:var(--accent);font-weight:700}

/* ── 라이트 하단 ── */
.elc-light{background:var(--paper);color:var(--ink);padding:52px 40px 60px}

/* 추천 헤딩 */
.elc-rec-heading{font-family:var(--font-display);font-weight:900;font-size:34px;letter-spacing:-.02em;color:var(--ink);line-height:1.25;margin-bottom:36px;display:flex;align-items:center;gap:10px}
.elc-rec-heading .elc-icon{font-size:32px;line-height:1}

/* 체크 리스트 */
.elc-checks{display:flex;flex-direction:column;gap:0}
.elc-check-row{display:flex;align-items:flex-start;gap:16px;padding:18px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.elc-check-row:first-child{border-top:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.elc-tick{width:28px;height:28px;flex-shrink:0;color:var(--accent);margin-top:1px}
.elc-tick svg{width:100%;height:100%}
.elc-check-text{font-size:17px;font-weight:500;color:var(--ink);line-height:1.55}
.elc-check-text .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const badge = esc(d.badge ?? 'Launch Event')
    const limitLabel = esc(d.limitLabel ?? '선착순\n한정')
    const recTitle = esc(d.recommendTitle ?? '이런 분께 강력 추천!')

    return `
<section>
  <div class="elc-dark">
    <span class="elc-badge">${badge}</span>
    <h2 class="elc-title">${richSafe(d.title)}</h2>
    <div class="elc-hero-wrap">
      ${media(d.image, 'elc-hero', '론치 이벤트 이미지')}
    </div>
    <div class="elc-pill-row">
      <div class="elc-limit">${limitLabel}</div>
      <div class="elc-benefit">${richSafe(d.benefitText)}</div>
    </div>
  </div>

  <div class="elc-light">
    <h3 class="elc-rec-heading">
      <span class="elc-icon">⏰</span>
      ${recTitle}
    </h3>
    <div class="elc-checks">
      ${d.checks
        .map(
          (c) => `
      <div class="elc-check-row">
        <span class="elc-tick">${icon('check')}</span>
        <span class="elc-check-text">${richSafe(c.text)}</span>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`
  },
})
