/** BANNER 아키타입(템플릿 충실 재현): banner-image-dominant.
 *  와디즈 200섹션 19_기념일배너 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 파스텔 배경 + 상품/선물 이미지 중앙 지배 + 할인 뱃지 오버레이 +
 *  상단 곡선형 서브라벨 pill + 하단 대형 한국어 타이틀 + 기간 pill.
 *  가정의달·생일·기념일·시즌 선물 배너에 적합. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subLabel: z.string().min(1).optional(),       // 상단 곡선 서브라벨 (예: "가정의달 5월 패밀리데이")
  image: z.string().optional(),                  // 중앙 상품/선물 이미지 (url)
  imageAlt: z.string().min(1).optional(),        // 이미지 alt 텍스트
  badgePrefix: z.string().min(1).optional(),     // 뱃지 상단 소문자 (예: "UP TO")
  badgeNumber: z.string().min(1).optional(),     // 뱃지 대형 숫자 (예: "60")
  badgeSuffix: z.string().min(1).optional(),     // 뱃지 단위 (예: "%OFF")
  title: z.string().min(1),                      // 하단 대형 한국어 타이틀 (em,br)
  period: z.string().min(1).optional(),          // 기간 텍스트 (예: "5.1 ~ 5.31")
  decoCount: z.number().int().min(0).max(8).optional(), // 배경 소형 꽃/별 데코 개수 (기본 6)
})
type Data = z.infer<typeof schema>

export const bannerImageDominant = defineBlock<Data>({
  id: 'banner-image-dominant',
  archetype: 'banner',
  styleTags: ['seasonal', 'playful', 'warm', 'template', 'gift'],
  imageSlots: 1,
  describe:
    '이미지 도미넌트 기념일 배너. 파스텔 배경 + 상품/선물 이미지 중앙 지배 + 할인 뱃지 오버레이(숫자+단위) + 상단 곡선 서브라벨 pill + 하단 대형 한국어 타이틀 + 기간 pill. 가정의달·생일·기념일 선물 배너.',
  schema,
  css: `
/* bid- : banner-image-dominant 전용 접두사 */
.bid{
  position:relative;
  overflow:hidden;
  text-align:center;
  min-height:560px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  background:color-mix(in srgb,var(--bg) 72%,#fffbe8);
  padding:0 0 52px;
}

/* 배경 소형 꽃/별 데코 (CSS 원형, 이미지 없이 분위기 채움) */
.bid-deco-wrap{position:absolute;inset:0;pointer-events:none;z-index:0}
.bid-dot{
  position:absolute;
  border-radius:50%;
  opacity:.55;
}
.bid-dot.d1{width:18px;height:18px;top:8%;left:6%;
  background:color-mix(in srgb,var(--accent) 55%,#fff);
  box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 18%,transparent)}
.bid-dot.d2{width:12px;height:12px;top:6%;right:10%;
  background:color-mix(in srgb,var(--accent) 50%,#fff);
  box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 14%,transparent)}
.bid-dot.d3{width:22px;height:22px;top:22%;left:3%;
  background:color-mix(in srgb,var(--accent) 40%,#fff);
  box-shadow:0 0 0 6px color-mix(in srgb,var(--accent) 12%,transparent)}
.bid-dot.d4{width:10px;height:10px;top:28%;right:5%;
  background:color-mix(in srgb,var(--accent) 45%,#fff)}
.bid-dot.d5{width:16px;height:16px;bottom:28%;left:5%;
  background:color-mix(in srgb,var(--accent) 50%,#fff);
  box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 16%,transparent)}
.bid-dot.d6{width:14px;height:14px;bottom:22%;right:7%;
  background:color-mix(in srgb,var(--accent) 42%,#fff);
  box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 13%,transparent)}
.bid-dot.d7{width:8px;height:8px;bottom:36%;left:12%;
  background:color-mix(in srgb,var(--accent) 38%,#fff)}
.bid-dot.d8{width:10px;height:10px;bottom:32%;right:12%;
  background:color-mix(in srgb,var(--accent) 48%,#fff)}

/* 상단 곡선 서브라벨 pill */
.bid-sublabel{
  position:relative;
  z-index:2;
  display:inline-block;
  margin-top:30px;
  padding:8px 24px 8px 22px;
  background:color-mix(in srgb,var(--accent) 22%,#fff);
  border:1.5px solid color-mix(in srgb,var(--accent) 38%,transparent);
  border-radius:999px;
  font-size:14px;
  font-weight:700;
  color:color-mix(in srgb,var(--accent-d) 90%,var(--ink));
  letter-spacing:.04em;
}
/* 상단의 살짝 곡선 느낌 — 상단 border를 약하게 */
.bid-sublabel::before{
  content:"";
  display:inline-block;
  width:8px;height:8px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 70%,#fff);
  margin-right:8px;
  vertical-align:middle;
}

/* 중앙 이미지 영역 */
.bid-img-wrap{
  position:relative;
  z-index:2;
  margin:18px auto 0;
  width:360px;
  height:340px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.bid-hero{
  width:100%;
  height:100%;
  object-fit:contain;
  filter:drop-shadow(0 16px 32px rgba(0,0,0,.14));
  display:block;
}

/* 할인 뱃지 — 쿠폰 티켓 모양(오른쪽 기울어진 직사각형) */
.bid-badge{
  position:absolute;
  top:22px;
  right:-6px;
  z-index:3;
  background:#fff;
  border:2px dashed rgba(0,0,0,.13);
  border-radius:calc(var(--r-scale,1)*10px);
  padding:10px 16px 12px;
  min-width:100px;
  text-align:center;
  box-shadow:2px 4px 16px rgba(0,0,0,.12);
  transform:rotate(6deg);
}
/* 쿠폰 왼쪽 반원 노치 */
.bid-badge::before{
  content:"";
  position:absolute;
  left:-9px;
  top:50%;
  transform:translateY(-50%);
  width:16px;height:16px;
  border-radius:50%;
  background:color-mix(in srgb,var(--bg) 72%,#fffbe8);
  border:2px dashed rgba(0,0,0,.13);
  clip-path:inset(0 0 0 50%);
}
.bid-badge::after{
  content:"";
  position:absolute;
  right:-9px;
  top:50%;
  transform:translateY(-50%);
  width:16px;height:16px;
  border-radius:50%;
  background:color-mix(in srgb,var(--bg) 72%,#fffbe8);
  border:2px dashed rgba(0,0,0,.13);
  clip-path:inset(0 50% 0 0);
}
.bid-badge-prefix{
  display:block;
  font-size:11px;
  font-weight:700;
  letter-spacing:.1em;
  color:var(--ink-2);
  line-height:1;
  margin-bottom:2px;
}
.bid-badge-num{
  display:block;
  font-family:var(--font-display);
  font-weight:900;
  font-size:42px;
  line-height:1;
  color:#e32a2a;
  letter-spacing:-.03em;
}
.bid-badge-suffix{
  display:block;
  font-size:13px;
  font-weight:800;
  color:#e32a2a;
  letter-spacing:.04em;
  margin-top:1px;
}

/* 하단 대형 한국어 타이틀 */
.bid-title{
  position:relative;
  z-index:2;
  margin-top:6px;
  font-family:var(--font-hand);
  font-weight:400;
  font-size:72px;
  line-height:1.08;
  color:var(--ink);
  letter-spacing:-.01em;
}
.bid-title .em{color:var(--accent)}

/* 기간 pill */
.bid-period{
  position:relative;
  z-index:2;
  display:inline-block;
  margin-top:16px;
  padding:8px 26px;
  background:rgba(255,255,255,.7);
  border-radius:999px;
  font-size:16px;
  font-weight:600;
  color:var(--ink-2);
  letter-spacing:.04em;
  box-shadow:0 4px 12px rgba(0,0,0,.06);
}
`,
  render: (d, { esc, richSafe }) => {
    const count = d.decoCount ?? 6
    const dots = Array.from({ length: Math.min(count, 8) }, (_, i) => `<span class="bid-dot d${i + 1}"></span>`).join('')

    const hasBadge = d.badgeNumber
    const badgeHtml = hasBadge
      ? `
  <div class="bid-badge">
    ${d.badgePrefix ? `<span class="bid-badge-prefix">${esc(d.badgePrefix)}</span>` : ''}
    <span class="bid-badge-num">${esc(d.badgeNumber)}</span>
    ${d.badgeSuffix ? `<span class="bid-badge-suffix">${esc(d.badgeSuffix)}</span>` : ''}
  </div>`
      : ''

    return `
<section class="bid">
  <div class="bid-deco-wrap">${dots}</div>
  ${d.subLabel ? `<p class="bid-sublabel">${esc(d.subLabel)}</p>` : ''}
  <div class="bid-img-wrap">
    ${media(d.image, 'bid-hero', esc(d.imageAlt ?? '상품 이미지'))}
    ${badgeHtml}
  </div>
  <h2 class="bid-title">${richSafe(d.title)}</h2>
  ${d.period ? `<p class="bid-period">${esc(d.period)}</p>` : ''}
</section>`
  },
})
