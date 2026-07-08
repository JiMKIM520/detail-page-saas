/** EVENT 아키타입(템플릿 충실 재현): event-coupon-device-steps.
 *  와디즈 200섹션 "13_이벤트" _228:580(쿠폰 이벤트 — 디바이스 목업 + 번호형 스텝) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  pill 태그 + 이벤트 제목/서브카피 + 폰 디바이스 목업(쿠폰 금액 강조) + 01/02/03 번호형 스텝 카드 세로 스택. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  tag: z.string().min(1).optional(),              // pill 태그 (예: "Coupon Event")
  title: z.string().min(1),                       // 대형 이벤트 제목 (em,br 허용)
  subtitle: z.string().min(1).optional(),         // 제목 아래 서브카피 (em,br 허용)
  couponAmount: z.string().min(1),                // 쿠폰 금액 강조 텍스트 (예: "5,000원")
  couponLabel: z.string().min(1).optional(),      // 쿠폰 부제 (예: "NN 돌파 리뷰 이벤트")
  deviceImage: z.string().optional(),             // 폰/디바이스 목업 이미지 url
  steps: z
    .array(
      z.object({
        text: z.string().min(1),                  // 스텝 설명 (em,br 허용)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const eventCouponDeviceSteps = defineBlock<Data>({
  id: 'event-coupon-device-steps',
  archetype: 'event',
  styleTags: ['playful', 'light', 'coupon', 'template', 'step'],
  imageSlots: 1,
  describe:
    '쿠폰 이벤트(디바이스 목업 + 번호형 스텝). 라이트 배경 + pill 태그 + 대형 이벤트 제목 + 폰 목업(쿠폰 금액 강조) + 01/02/03 번호형 스텝 카드 세로 스택. 리뷰 이벤트·쿠폰 증정 안내 섹션에 최적.',
  schema,
  css: `
.ecds{background:var(--bg);color:var(--ink);padding:60px 0 56px;text-align:center;overflow:hidden}

/* pennant decoration */
.ecds-pennants{display:flex;justify-content:space-between;align-items:flex-start;padding:0 20px;margin-bottom:24px;pointer-events:none}
.ecds-pennant-left,.ecds-pennant-right{display:flex;gap:6px;align-items:flex-end}
.ecds-pennant-right{flex-direction:row-reverse}
.ecds-flag{width:14px;height:20px;clip-path:polygon(0 0,100% 0,50% 100%);opacity:.7}
.ecds-flag:nth-child(1){background:var(--accent);opacity:.9}
.ecds-flag:nth-child(2){background:color-mix(in srgb,var(--accent) 60%,#fff);margin-bottom:5px}
.ecds-flag:nth-child(3){background:color-mix(in srgb,var(--accent) 35%,#fff);opacity:.6}
.ecds-flag:nth-child(4){background:var(--accent);opacity:.45;margin-bottom:3px}
.ecds-rope{width:80px;height:2px;background:color-mix(in srgb,var(--ink) 20%,transparent);align-self:flex-start;margin-top:4px;border-radius:1px}

/* pill tag */
.ecds-tag{display:inline-block;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent);font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.04em;padding:7px 22px;border-radius:999px;margin-bottom:18px}

/* headline */
.ecds-title{font-family:var(--font-display);font-weight:800;font-size:54px;letter-spacing:-.03em;line-height:1.1;color:var(--ink);padding:0 40px}
.ecds-title .em{color:var(--accent)}
.ecds-subtitle{margin-top:12px;font-size:16px;color:var(--ink-2);line-height:1.6;padding:0 48px}
.ecds-subtitle .em{color:var(--accent);font-weight:700}

/* device mockup wrapper */
.ecds-device-wrap{position:relative;margin:36px auto 0;width:280px}
.ecds-phone-frame{position:relative;width:280px;height:500px;border-radius:calc(var(--r-scale,1)*44px);background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 70%,#fff),var(--accent));box-shadow:0 20px 60px color-mix(in srgb,var(--accent) 30%,transparent),0 4px 16px rgba(0,0,0,.12);overflow:hidden}
.ecds-phone-img{width:100%;height:100%;object-fit:cover;border-radius:calc(var(--r-scale,1)*44px);display:block}
.ecds-phone-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:40px 24px}
.ecds-coupon-amt{font-family:var(--font-display);font-weight:800;font-size:52px;color:#fff;letter-spacing:-.03em;line-height:1;text-shadow:0 2px 16px rgba(0,0,0,.18)}
.ecds-coupon-lbl{font-size:15px;color:rgba(255,255,255,.85);font-weight:500;letter-spacing:.02em}
/* notch */
.ecds-notch{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:72px;height:20px;background:rgba(0,0,0,.18);border-radius:calc(var(--r-scale,1)*10px);z-index:2}

/* steps section */
.ecds-steps{margin:36px 36px 0;display:flex;flex-direction:column;gap:14px}
.ecds-step{background:var(--paper);border-radius:calc(var(--r-scale,1)*18px);padding:24px 28px;display:flex;align-items:center;gap:18px;text-align:left;box-shadow:0 2px 12px rgba(0,0,0,.04)}
.ecds-step-no{flex-shrink:0;font-family:'Cafe24 ClassicType',serif;font-size:32px;font-weight:400;color:color-mix(in srgb,var(--accent) 55%,transparent);line-height:1;min-width:42px}
.ecds-step-text{font-size:17px;font-weight:600;color:var(--ink);line-height:1.5}
.ecds-step-text .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const pad2 = (n: number): string => String(n).padStart(2, '0')

    const pennantLeft = `
    <div class="ecds-pennant-left">
      <div class="ecds-flag"></div>
      <div class="ecds-flag"></div>
      <div class="ecds-flag"></div>
      <div class="ecds-flag"></div>
      <div class="ecds-rope"></div>
    </div>`

    const pennantRight = `
    <div class="ecds-pennant-right">
      <div class="ecds-flag"></div>
      <div class="ecds-flag"></div>
      <div class="ecds-flag"></div>
      <div class="ecds-flag"></div>
      <div class="ecds-rope"></div>
    </div>`

    const deviceContent = d.deviceImage
      ? media(d.deviceImage, 'ecds-phone-img', '디바이스 목업')
      : `<div class="ecds-phone-inner">
          <div class="ecds-coupon-amt">${esc(d.couponAmount)}</div>
          ${d.couponLabel ? `<div class="ecds-coupon-lbl">${esc(d.couponLabel)}</div>` : ''}
        </div>`

    return `
<section class="ecds">
  <div class="ecds-pennants">
    ${pennantLeft}
    ${pennantRight}
  </div>

  ${d.tag ? `<div class="ecds-tag">${esc(d.tag)}</div>` : ''}

  <h2 class="ecds-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="ecds-subtitle">${richSafe(d.subtitle)}</p>` : ''}

  <div class="ecds-device-wrap">
    <div class="ecds-phone-frame">
      <div class="ecds-notch"></div>
      ${deviceContent}
      ${d.deviceImage ? '' : ''}
    </div>
  </div>

  <div class="ecds-steps">
    ${d.steps
      .map(
        (s, i) => `
    <div class="ecds-step">
      <div class="ecds-step-no">${pad2(i + 1)}</div>
      <div class="ecds-step-text">${richSafe(s.text)}</div>
    </div>`,
      )
      .join('')}
  </div>
</section>`
  },
})
