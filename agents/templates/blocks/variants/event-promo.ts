/** EVENT 아키타입(템플릿 충실 재현): event-promo.
 *  와디즈 200섹션 "13_이벤트" _05(리뷰 이벤트 다크 쿠폰) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  상단 marquee 스트립 + 3D 선물 이미지 슬롯 + 대형 이벤트 제목 + 혜택 강조 pill + 체크 포인트 카드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  strip: z.string().min(1).optional(),          // marquee 스트립 반복 문구 (예: "Special Event")
  title: z.string().min(1),                      // 대형 이벤트 제목 (예: "REVIEW EVENT")
  subtitle: z.string().min(1).optional(),        // 제목 아래 서브카피 (em/br 허용)
  benefit: z.string().min(1),                    // 강조 혜택 수치 텍스트 (예: "5,000원 쿠폰 증정!")
  image: z.string().optional(),                  // 3D 선물/제품 이미지 url
  sectionLabel: z.string().min(1).optional(),    // 포인트 섹션 라벨 pill (예: "EVENT")
  points: z
    .array(
      z.object({
        text: z.string().min(1),               // 혜택 포인트 텍스트
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const eventPromo = defineBlock<Data>({
  id: 'event-promo',
  archetype: 'event',
  styleTags: ['premium', 'template', 'dark', 'coupon', 'promo'],
  imageSlots: 1,
  describe:
    '이벤트/프로모션 안내. 다크 배경에 marquee 스트립 + 선물 이미지 + 대형 이벤트 제목 + 혜택 강조 pill(쿠폰·할인 수치) + 체크 포인트 카드. 리뷰 이벤트·쿠폰 증정·기간 한정 혜택 섹션에 최적.',
  schema,
  css: `
.ev{background:var(--brand);overflow:hidden;padding-bottom:60px}

/* marquee strip */
.ev-strip{background:var(--accent);padding:10px 0;overflow:hidden;white-space:nowrap}
.ev-strip-inner{display:inline-flex;gap:0;animation:ev-slide 18s linear infinite}
.ev-strip-item{font-family:var(--font-display);font-weight:800;font-size:15px;color:#fff;letter-spacing:.08em;padding:0 28px;display:inline-flex;align-items:center;gap:10px}
.ev-strip-item::after{content:'✦';opacity:.7}
@keyframes ev-slide{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* image */
.ev-img-wrap{display:flex;justify-content:center;padding:42px var(--pad-x,56px) 0;position:relative}
.ev-img{width:320px;height:320px;object-fit:contain;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}

/* title block */
.ev-title-block{text-align:center;padding:28px 40px 0}
.ev-title{font-family:var(--font-display);font-weight:800;font-size:72px;color:var(--accent);letter-spacing:-.03em;line-height:1.05}
.ev-sub{margin-top:14px;font-size:18px;font-weight:400;color:rgba(255,255,255,.82);line-height:1.55}
.ev-sub .em{color:var(--accent)}

/* benefit pill */
.ev-benefit-wrap{display:flex;justify-content:center;margin:28px 40px 0}
.ev-benefit{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:34px;letter-spacing:-.02em;padding:18px 48px;border-radius:999px;box-shadow:0 8px 28px rgba(0,0,0,.35);white-space:nowrap}

/* divider */
.ev-divider{display:flex;align-items:center;justify-content:center;gap:18px;margin:44px 40px 0}
.ev-divider::before,.ev-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.18)}
.ev-section-label{display:inline-block;border:2px solid var(--accent);color:var(--accent);font-family:var(--font-display);font-weight:800;font-size:16px;letter-spacing:.12em;padding:8px 28px;border-radius:999px}

/* points card */
.ev-card{margin:22px 36px 0;background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.15);border-radius:calc(var(--r-scale,1)*24px);padding:32px 36px;display:flex;flex-direction:column;gap:18px}
.ev-point{display:flex;align-items:center;gap:16px}
.ev-check{width:36px;height:36px;flex-shrink:0;border-radius:50%;background:var(--accent);display:grid;place-items:center;color:#fff}
.ev-check svg{width:18px;height:18px}
.ev-point-text{font-size:18px;font-weight:600;color:#fff;line-height:1.4}
`,
  render: (d, { esc, richSafe, icon }) => {
    const stripText = esc(d.strip ?? 'Special Event')
    // Duplicate strip items to create seamless loop
    const stripItems = Array.from({ length: 8 }, () =>
      `<span class="ev-strip-item">${stripText}</span>`
    ).join('')

    return `
<section class="ev">
  <div class="ev-strip">
    <div class="ev-strip-inner">
      ${stripItems}${stripItems}
    </div>
  </div>

  <div class="ev-img-wrap">
    ${media(d.image, 'ev-img', '이벤트 이미지')}
  </div>

  <div class="ev-title-block">
    <h2 class="ev-title">${esc(d.title)}</h2>
    ${d.subtitle ? `<p class="ev-sub">${richSafe(d.subtitle.replace(/\n/g, '<br>'))}</p>` : ''}
  </div>

  <div class="ev-benefit-wrap">
    <span class="ev-benefit">${esc(d.benefit)}</span>
  </div>

  <div class="ev-divider">
    <span class="ev-section-label">${esc(d.sectionLabel ?? 'EVENT')}</span>
  </div>

  <div class="ev-card">
    ${d.points
      .map(
        (p) => `
    <div class="ev-point">
      <span class="ev-check">${icon('check')}</span>
      <span class="ev-point-text">${esc(p.text)}</span>
    </div>`,
      )
      .join('')}
  </div>
</section>`
  },
})
