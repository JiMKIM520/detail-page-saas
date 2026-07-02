/** DISCOUNT 아키타입(템플릿 충실 재현): discount-coupon-stack.
 *  와디즈 200섹션 15_할인 299:476 패턴을 토큰 기반으로 재구성(클론 아님).
 *  포토/다크 BG + pill 뱃지(긴급 문구) + 대형 흰 헤드라인 +
 *  2장 풀폭 쿠폰 티켓(빨강 탭 + 라벨 + 대형 % 숫자) 세로 스택 + 사용기간 풋노트.
 *  쿠폰 이벤트 표준 레이아웃. 세일 레드(#E02020)는 커머스 신호색 → 시맨틱 하드코딩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  bgImage: z.string().optional(),                // 배경 포토 URL (없으면 다크 그라데이션)
  badge: z.string().min(1).optional(),           // pill 뱃지 문구  예: "딱, 이번주 까지만!"
  headline: z.string().min(1),                   // 메인 헤드라인 (em,br 허용)  예: "신규고객<br>쿠폰 이벤트!"
  coupons: z
    .array(
      z.object({
        couponLabel: z.string().min(1).optional(), // 쿠폰 상단 라벨  예: "Coupon"
        rate: z.string().min(1),                   // 할인율 문자열   예: "30%"
      }),
    )
    .min(2)
    .max(2),
  period: z.string().min(1).optional(),          // 사용 기간 문구  예: "~ 6.30 (일)까지"
  periodLabel: z.string().min(1).optional(),     // 기간 앞 라벨    예: "사용 기간"
})
type Data = z.infer<typeof schema>

export const discountCouponStack = defineBlock<Data>({
  id: 'discount-coupon-stack',
  archetype: 'discount',
  styleTags: ['premium', 'dark', 'template', 'coupon', 'event'],
  imageSlots: 1,
  describe:
    '쿠폰 이벤트(다크 스택형). 포토/다크 BG + 중앙정렬 pill 긴급 뱃지 + 중앙정렬 대형 흰 헤드라인 + 풀폭 쿠폰 티켓 정확히 2장 세로 스택(빨강 탭·라벨·대형 할인율) + 사용기간 풋노트. 신규 쿠폰·할인 이벤트 표준.',
  schema,
  css: `
/* ── 래퍼: 포토 BG ── */
.dcs{position:relative;overflow:hidden;padding:0;min-height:400px;background:var(--brand)}
.dcs-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:0}
.dcs-bg.ph{border:none;background:transparent}
.dcs-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,6,36,.55) 0%,rgba(10,6,36,.38) 50%,rgba(10,6,36,.72) 100%);z-index:1}
.dcs-inner{position:relative;z-index:2;padding:60px 40px 0}

/* ── pill 뱃지 ── */
.dcs-badge-wrap{text-align:center;margin-bottom:22px}
.dcs-badge{display:inline-block;border:1.5px solid rgba(255,255,255,.70);border-radius:999px;padding:7px 22px;font-size:16px;font-weight:600;color:#fff;letter-spacing:-.01em;font-family:var(--font-body)}

/* ── 헤드라인 ── */
.dcs-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,11vw,88px);line-height:1.10;letter-spacing:-.03em;color:#fff;margin-bottom:40px;text-align:center}
.dcs-headline .em{color:var(--accent)}

/* ── 쿠폰 티켓 리스트 ── */
.dcs-coupons{display:flex;flex-direction:column;gap:16px;padding:0 0 0 0}

/* 티켓 카드 */
.dcs-ticket{
  display:flex;align-items:stretch;
  background:#fff;
  border-radius:14px;
  overflow:hidden;
  box-shadow:0 8px 32px rgba(0,0,0,.32);
  min-height:108px;
}

/* 왼쪽 빨강 탭 */
.dcs-tab{
  flex:0 0 36px;width:36px;
  background:#E02020;
  display:flex;align-items:center;justify-content:center;
  position:relative;
}

/* 왼쪽 탭 상·하 반원 노치 (perforated feel) */
.dcs-tab::before,.dcs-tab::after{
  content:"";position:absolute;left:-14px;
  width:28px;height:28px;
  border-radius:50%;
  background:transparent;
  border:none;
  box-shadow:14px 0 0 0 rgba(10,6,36,.55);
}
.dcs-tab::before{top:-14px}
.dcs-tab::after{bottom:-14px}

/* 티켓 점선 구분선 */
.dcs-sep{
  flex:0 0 2px;width:2px;
  border-left:2.5px dashed rgba(0,0,0,.14);
  margin:14px 0;
}

/* 티켓 본문 */
.dcs-body{
  flex:1;padding:18px 28px;
  display:flex;flex-direction:column;justify-content:center;
}
.dcs-clabel{font-size:15px;font-weight:500;color:#888;letter-spacing:.06em;font-family:var(--font-body);margin-bottom:2px}
.dcs-rate{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-size:clamp(58px,11vw,86px);font-weight:400;color:#E02020;line-height:1;letter-spacing:-.02em}

/* ── 사용 기간 풋노트 ── */
.dcs-footer{
  position:relative;z-index:2;
  display:flex;align-items:center;gap:16px;
  padding:28px 40px 44px;
  border-top:1px solid rgba(255,255,255,.18);
  margin-top:28px;
}
.dcs-period-label{font-size:15px;font-weight:600;color:rgba(255,255,255,.70);letter-spacing:.02em;font-family:var(--font-body);white-space:nowrap}
.dcs-period-divider{width:1px;height:18px;background:rgba(255,255,255,.35);flex-shrink:0}
.dcs-period-val{font-size:16px;font-weight:500;color:#fff;letter-spacing:-.01em;font-family:var(--font-body)}
`,
  render: (d, { esc, richSafe }) => {
    const hasBg = !!d.bgImage

    const ticketsHtml = d.coupons
      .map(
        (c) => `
  <div class="dcs-ticket">
    <div class="dcs-tab"></div>
    <div class="dcs-sep"></div>
    <div class="dcs-body">
      <div class="dcs-clabel">${esc(c.couponLabel ?? 'Coupon')}</div>
      <div class="dcs-rate">${esc(c.rate)}</div>
    </div>
  </div>`,
      )
      .join('')

    const footerHtml =
      d.period
        ? `<div class="dcs-footer">
    <span class="dcs-period-label">${esc(d.periodLabel ?? '사용 기간')}</span>
    <span class="dcs-period-divider"></span>
    <span class="dcs-period-val">${esc(d.period)}</span>
  </div>`
        : ''

    return `
<section class="dcs">
  ${hasBg
    ? media(d.bgImage, 'dcs-bg', '배경 이미지')
    : '<div class="dcs-bg" style="background:radial-gradient(ellipse at 50% 20%,#2a1a6e 0%,#0d0820 60%,#060310 100%)"></div>'}
  <div class="dcs-overlay"></div>
  <div class="dcs-inner">
    ${d.badge ? `<div class="dcs-badge-wrap"><span class="dcs-badge">${esc(d.badge)}</span></div>` : ''}
    <h2 class="dcs-headline">${richSafe(d.headline)}</h2>
    <div class="dcs-coupons">
      ${ticketsHtml}
    </div>
  </div>
  ${footerHtml}
</section>`
  },
})
