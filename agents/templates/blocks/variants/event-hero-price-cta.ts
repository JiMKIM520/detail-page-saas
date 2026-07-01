/** EVENT 아키타입(템플릿 충실 재현): event-hero-price-cta.
 *  와디즈 200섹션 "13_이벤트" 1284:2528 패턴을 토큰 기반으로 재구성(클론 아님).
 *  풀스크린 그라디언트 배경 + 중앙 거대 3D 가격(0원) + 단일 헤드라인 + 약관 밴드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),       // 상단 소문구 (예: "2천 명이 먼저 경험한")
  headline: z.string().min(1),                  // 메인 헤드라인 (em,br) (예: "레전드 영어 클래스")
  priceNumber: z.string().min(1),               // 거대 3D 가격 숫자 (예: "0")
  priceUnit: z.string().min(1).optional(),      // 가격 단위 (예: "원")
  ctaText: z.string().min(1),                   // CTA 강조 문구 (em,br) (예: "오직 여기서만!")
  ctaSub: z.string().min(1).optional(),         // CTA 서브 문구 (예: "하루 0원 체험가")
  image: z.string().optional(),                 // 3D 가격/제품 이미지 url (url)
  disclaimers: z
    .array(z.object({ text: z.string().min(1) }))
    .min(1)
    .max(4)
    .optional(),                                // 약관/유의사항 목록 (2~4)
})
type Data = z.infer<typeof schema>

export const eventHeroPriceCta = defineBlock<Data>({
  id: 'event-hero-price-cta',
  archetype: 'event' as any,
  styleTags: ['premium', 'template', 'dark', 'hero', 'promo', 'fullscreen'],
  imageSlots: 1,
  describe:
    '이벤트 풀스크린 가격 히어로. 다크 그라디언트 배경 + 상단 소문구 + 메인 헤드라인 + 거대 3D 가격(0원) + 단일 CTA 문구 + 하단 약관 밴드. 무료 체험·0원 이벤트·기간 한정 특가 섹션에 최적.',
  schema,
  css: `
.ehpc{
  position:relative;
  background:linear-gradient(175deg,
    color-mix(in srgb,var(--brand) 80%,#000) 0%,
    color-mix(in srgb,var(--accent) 55%,var(--brand)) 55%,
    color-mix(in srgb,var(--accent-d) 70%,#000) 100%
  );
  overflow:hidden;
  padding:0;
  color:#fff;
}

/* sparkle / confetti deco (pure CSS, no remote assets) */
.ehpc-deco{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ehpc-deco::before,.ehpc-deco::after{
  content:'✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦';
  position:absolute;font-size:11px;
  color:rgba(255,255,255,.22);letter-spacing:18px;white-space:nowrap;
}
.ehpc-deco::before{top:9%;left:-4%;transform:rotate(-28deg)}
.ehpc-deco::after{bottom:28%;right:-6%;transform:rotate(14deg)}

/* body content */
.ehpc-body{
  position:relative;z-index:1;
  display:flex;flex-direction:column;align-items:center;
  text-align:center;
  padding:72px 40px 0;
}

/* eyebrow */
.ehpc-eyebrow{
  font-size:18px;font-weight:600;
  color:rgba(255,255,255,.88);
  letter-spacing:-.01em;line-height:1.45;
  margin-bottom:10px;
}

/* main headline */
.ehpc-headline{
  font-family:var(--font-display);font-weight:800;
  font-size:54px;letter-spacing:-.025em;line-height:1.12;
  color:#fff;
}
.ehpc-headline .em{color:var(--accent)}

/* price visual */
.ehpc-price-wrap{
  display:flex;align-items:flex-end;justify-content:center;
  gap:4px;
  margin:36px 0 10px;
  line-height:1;
}
.ehpc-price-img{
  width:260px;height:260px;
  object-fit:contain;
}
.ehpc-price-num{
  font-family:var(--font-display);font-weight:800;
  font-size:220px;letter-spacing:-.04em;line-height:1;
  /* 3D teal effect via text-shadow stack when no image provided */
  background:linear-gradient(170deg,
    color-mix(in srgb,var(--accent) 40%,#fff) 0%,
    color-mix(in srgb,var(--accent) 90%,#0ff) 50%,
    color-mix(in srgb,var(--accent-d) 90%,#000) 100%
  );
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  filter:drop-shadow(0 8px 18px rgba(0,0,0,.55));
}
.ehpc-price-unit{
  font-family:var(--font-display);font-weight:800;
  font-size:64px;color:#fff;
  padding-bottom:28px;
  letter-spacing:-.02em;
}

/* CTA block */
.ehpc-cta-text{
  font-family:var(--font-display);font-weight:800;
  font-size:56px;letter-spacing:-.03em;line-height:1.1;
  color:#fff;
}
.ehpc-cta-text .em{color:var(--accent)}

.ehpc-cta-sub{
  margin-top:14px;
  font-family:var(--font-display);font-weight:700;
  font-size:26px;color:rgba(255,255,255,.9);
  letter-spacing:-.01em;
}

/* disclaimer band */
.ehpc-disclaimer{
  position:relative;z-index:1;
  margin-top:60px;
  background:#fff;
  padding:28px 40px 32px;
  color:color-mix(in srgb,var(--ink) 55%,transparent);
  font-size:13px;line-height:1.75;
  text-align:left;
}
.ehpc-disclaimer p+p{margin-top:2px}
`,
  render: (d, { esc, richSafe }) => {
    // price visual: prefer image slot, else pure CSS 3D numeral
    const priceVisual = d.image
      ? media(d.image, 'ehpc-price-img', '3D 가격 이미지')
      : `<span class="ehpc-price-num">${esc(d.priceNumber)}</span>`

    return `
<section class="ehpc">
  <div class="ehpc-deco" aria-hidden="true"></div>

  <div class="ehpc-body">
    ${d.eyebrow ? `<p class="ehpc-eyebrow">${esc(d.eyebrow)}</p>` : ''}

    <h2 class="ehpc-headline">${richSafe(d.headline)}</h2>

    <div class="ehpc-price-wrap">
      ${priceVisual}
      ${!d.image ? `<span class="ehpc-price-unit">${esc(d.priceUnit ?? '원')}</span>` : ''}
    </div>

    <p class="ehpc-cta-text">${richSafe(d.ctaText)}</p>
    ${d.ctaSub ? `<p class="ehpc-cta-sub">${esc(d.ctaSub)}</p>` : ''}
  </div>

  ${
    d.disclaimers && d.disclaimers.length > 0
      ? `<div class="ehpc-disclaimer">
    ${d.disclaimers.map((dl) => `<p>${esc(dl.text)}</p>`).join('')}
  </div>`
      : ''
  }
</section>`
  },
})
