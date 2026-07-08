/** BANNER 아키타입(템플릿 충실 재현): 18_시즈널배너 _어두운 배경 + 원형 후광 + 쿠폰 티켓.
 *  짙은 배경 + 중앙 원형 후광(글로우 원) 위 소제목 + 대형 2줄 타이틀 + 하단 단일 쿠폰 티켓(센터) + CSS 눈송이 장식.
 *  와디즈 200섹션 패턴을 토큰 기반으로 재구성(클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  subtitle: z.string().min(1).optional(),       // 원형 후광 위 소제목 (예: "겨울맞이 대이벤트")
  titleLine1: z.string().min(1),                // 대제목 첫째 줄 (em,br) 예: "Winter"
  titleLine2: z.string().min(1).optional(),     // 대제목 둘째 줄 (em,br) 예: "Festival"
  couponValue: z.string().min(1),               // 쿠폰 핵심 수치 (예: "30%", "최대 50%")
  couponUnit: z.string().min(1).optional(),     // 쿠폰 단위/라벨 (예: "COUPON", "할인")
  couponNote: z.string().min(1).optional(),     // 쿠폰 하단 소주석 (예: "쿠폰 적용 시")
  period: z.string().min(1).optional(),         // 행사 기간 (예: "12.1(일) ~ 12.31(화)")
})
type Data = z.infer<typeof schema>

export const bannerSeasonalDarkCoupon = defineBlock<Data>({
  id: 'banner-seasonal-dark-coupon',
  archetype: 'banner',
  styleTags: ['premium', 'template', 'seasonal', 'dark', 'coupon', 'winter'],
  imageSlots: 0,
  describe:
    '시즌 배너(다크 + 원형 후광 + 쿠폰). 짙은 배경 + CSS 원형 글로우 후광 + 소제목 + 대형 2줄 타이틀 + 하단 단일 쿠폰 티켓(센터, 절취선). CSS 눈송이 장식. 이미지 슬롯 없이 완결되는 겨울/다크 시즌 배너.',
  schema,
  css: `
/* bsdc- : banner-seasonal-dark-coupon 전용 접두사 */

/* ── 섹션 컨테이너 ── */
.bsdc{position:relative;overflow:hidden;background:var(--brand);color:#fff;text-align:center;padding:60px 48px 64px;display:flex;flex-direction:column;align-items:center;gap:0;min-height:480px}

/* ── 배경 그라데이션 심화 ── */
.bsdc::before{content:"";position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 80% 90% at 50% 38%,color-mix(in srgb,var(--accent) 10%,transparent) 0%,transparent 72%)}

/* ── CSS 장식 눈송이(라이선스 세이프 도형) ── */
.bsdc-flake{position:absolute;z-index:1;pointer-events:none;width:0;height:0}
.bsdc-flake::before,.bsdc-flake::after{content:"✻";position:absolute;font-size:inherit;color:rgba(255,255,255,.55);line-height:1;transform:translate(-50%,-50%)}
.bsdc-flake::after{transform:translate(-50%,-50%) rotate(45deg);color:rgba(255,255,255,.30)}

.bsdc-f1{top:6%;left:4%;font-size:38px}
.bsdc-f2{top:3%;left:22%;font-size:24px}
.bsdc-f3{top:8%;right:10%;font-size:44px}
.bsdc-f4{top:18%;right:3%;font-size:28px}
.bsdc-f5{top:22%;left:10%;font-size:32px}
.bsdc-f6{bottom:32%;left:2%;font-size:20px}
.bsdc-f7{bottom:28%;right:4%;font-size:26px}
.bsdc-f8{top:14%;left:38%;font-size:18px}

/* ── 원형 후광(글로우 서클 + 달빛 무드) ── */
.bsdc-halo{position:relative;z-index:2;width:300px;height:300px;border-radius:50%;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:radial-gradient(circle at 50% 44%,rgba(255,255,255,.96) 0%,rgba(230,240,255,.88) 42%,rgba(190,215,255,.60) 62%,rgba(140,180,255,.24) 76%,transparent 100%);box-shadow:0 0 80px 30px rgba(200,220,255,.22),0 0 140px 60px rgba(160,200,255,.12)}

/* ── 소제목 (후광 내부 상단) ── */
.bsdc-sub{font-family:var(--font-body);font-size:14px;font-weight:700;letter-spacing:.06em;color:var(--brand);opacity:.85;line-height:1}

/* ── 대형 타이틀 (후광 내부) ── */
.bsdc-t1{font-family:var(--font-display);font-weight:800;font-size:54px;line-height:1.0;color:var(--brand);letter-spacing:-.02em;margin:2px 0 0}
.bsdc-t2{font-family:var(--font-display);font-weight:800;font-size:54px;line-height:1.0;color:var(--brand);letter-spacing:-.02em;margin:0}
.bsdc-halo .em{color:var(--accent)}

/* ── 단일 쿠폰 티켓 ── */
.bsdc-coupon-wrap{position:relative;z-index:2;margin-top:36px;width:100%;max-width:440px}
.bsdc-coupon{display:flex;align-items:stretch;background:color-mix(in srgb,var(--brand) 80%,#000);border:2px dashed rgba(255,255,255,.38);border-radius:calc(var(--r-scale,1)*14px);overflow:visible;position:relative}

/* 좌우 노치(절취선) */
.bsdc-coupon::before,.bsdc-coupon::after{content:"";position:absolute;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;background:var(--brand)}
.bsdc-coupon::before{left:-12px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.38)}
.bsdc-coupon::after{right:-12px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.38)}

/* 쿠폰 왼쪽 메인 영역 */
.bsdc-c-main{flex:1;display:flex;align-items:center;justify-content:center;padding:28px 24px 28px 32px;gap:6px}

/* 쿠폰 핵심 수치 */
.bsdc-c-value{font-family:var(--font-display);font-weight:800;font-size:64px;line-height:1;color:#fff;letter-spacing:-.03em}

/* 쿠폰 단위 */
.bsdc-c-unit{font-family:var(--font-body);font-size:13px;font-weight:700;color:rgba(255,255,255,.65);align-self:flex-end;padding-bottom:8px;letter-spacing:.04em}

/* 쿠폰 소주석 */
.bsdc-c-note{font-size:11px;color:rgba(255,255,255,.45);margin-top:6px;letter-spacing:.02em}

/* 쿠폰 오른쪽 세로 라벨 */
.bsdc-c-side{width:36px;flex-shrink:0;border-left:2px dashed rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;padding:16px 0}
.bsdc-c-side-label{writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);font-family:var(--font-body);font-size:11px;font-weight:800;letter-spacing:.22em;color:rgba(255,255,255,.55);text-transform:uppercase}

/* ── 기간 pill ── */
.bsdc-period{position:relative;z-index:2;margin-top:20px;display:inline-block;font-family:var(--font-body);font-weight:600;font-size:14px;color:rgba(255,255,255,.70);letter-spacing:.04em;padding:7px 22px;border:1px solid rgba(255,255,255,.22);border-radius:999px}
`,
  render: (d, { esc, richSafe }) => `
<section class="bsdc">
  <!-- 배경 오버레이 (::before via CSS) -->

  <!-- CSS 눈송이 장식 -->
  <span class="bsdc-flake bsdc-f1" aria-hidden="true"></span>
  <span class="bsdc-flake bsdc-f2" aria-hidden="true"></span>
  <span class="bsdc-flake bsdc-f3" aria-hidden="true"></span>
  <span class="bsdc-flake bsdc-f4" aria-hidden="true"></span>
  <span class="bsdc-flake bsdc-f5" aria-hidden="true"></span>
  <span class="bsdc-flake bsdc-f6" aria-hidden="true"></span>
  <span class="bsdc-flake bsdc-f7" aria-hidden="true"></span>
  <span class="bsdc-flake bsdc-f8" aria-hidden="true"></span>

  <!-- 원형 후광 + 타이틀 -->
  <div class="bsdc-halo">
    ${d.subtitle ? `<p class="bsdc-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="bsdc-t1">${richSafe(d.titleLine1)}</h2>
    ${d.titleLine2 ? `<h2 class="bsdc-t2">${richSafe(d.titleLine2)}</h2>` : ''}
  </div>

  <!-- 쿠폰 티켓 -->
  <div class="bsdc-coupon-wrap">
    <div class="bsdc-coupon">
      <div class="bsdc-c-main">
        <div>
          <div class="bsdc-c-value">${esc(d.couponValue)}</div>
          ${d.couponNote ? `<div class="bsdc-c-note">${esc(d.couponNote)}</div>` : ''}
        </div>
        ${d.couponUnit ? `<div class="bsdc-c-unit">${esc(d.couponUnit)}</div>` : ''}
      </div>
      <div class="bsdc-c-side">
        <span class="bsdc-c-side-label">${esc(d.couponUnit ?? 'COUPON')}</span>
      </div>
    </div>
  </div>

  ${d.period ? `<p class="bsdc-period">${esc(d.period)}</p>` : ''}
</section>`,
})
