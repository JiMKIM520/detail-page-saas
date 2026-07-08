/** BANNER 아키타입(템플릿 충실 재현): 18_시즈널배너 _상하 분할 + 쿠폰 2장.
 *  상단 포토 배경 + 대형 타이틀 + 기간 pill / 하단 바닥 패널에 쿠폰 카드 2장(할인율+무료배송) 가로 배치.
 *  와디즈 200섹션 패턴을 토큰 기반으로 재구성(클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const couponSchema = z.object({
  label: z.string().min(1).optional(),      // 쿠폰 상단 소제목 (예: "UP TO")
  value: z.string().min(1),                 // 강조 수치/텍스트 (예: "70%", "무료배송") (em,br)
  unit: z.string().min(1).optional(),       // 단위 (예: "OFF", "전 품목")
  note: z.string().min(1).optional(),       // 하단 소주석 (예: "쿠폰 적용 시")
})

const schema = z.object({
  bgImage: z.string().optional(),           // 상단 포토 배경 이미지 (url)
  eyebrow: z.string().min(1).optional(),    // 배너 상단 영문 라벨 (예: "HOT SUMMER")
  title: z.string().min(1),                 // 메인 타이틀 (em,br) 예: "시원한 여름 혜택!"
  period: z.string().min(1).optional(),     // 기간 pill (예: "7월 10일(목)~7월 30일(수)")
  coupons: z.array(couponSchema).min(2).max(2), // 쿠폰 2장 고정
  panelNote: z.string().min(1).optional(),  // 하단 패널 보조 문구 (예: "* 중복 적용 불가")
})
type Data = z.infer<typeof schema>

export const bannerSeasonalCouponSplit = defineBlock<Data>({
  id: 'banner-seasonal-coupon-split',
  archetype: 'banner',
  styleTags: ['premium', 'template', 'seasonal', 'playful', 'warm', 'coupon'],
  imageSlots: 1,
  describe:
    '시즌 배너 상하 분할 + 쿠폰 2장. 상단 포토 배경+대형 타이틀+기간 pill / 하단 텍스처 패널에 쿠폰 카드 2장(할인율+무료배송) 가로 나란히. 여름/시즌 프로모션 배너.',
  schema,
  css: `
/* bscs- : banner-seasonal-coupon-split 전용 접두사 */

/* ── 섹션 컨테이너 ── */
.bscs{display:flex;flex-direction:column;width:100%;overflow:hidden}

/* ── 상단 포토 패널 ── */
.bscs-top{position:relative;min-height:560px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 30%,var(--bg)) 0%,color-mix(in srgb,var(--accent) 12%,var(--bg)) 100%)}

/* 배경 이미지 */
.bscs-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.bscs-bg-shade{position:absolute;inset:0;background:rgba(0,0,0,.08);z-index:1}

/* 상단 콘텐츠 래퍼 */
.bscs-hero{position:relative;z-index:2;padding:60px 48px 56px;display:flex;flex-direction:column;align-items:center;gap:0}

/* 영문 눈썹 라벨 */
.bscs-eye{font-family:'Cafe24 Dangdanghae',var(--font-hand),sans-serif;font-size:72px;line-height:.96;color:#fff;letter-spacing:-.01em;text-shadow:0 4px 24px rgba(0,0,0,.22);margin:0}

/* 메인 타이틀 */
.bscs-title{font-family:var(--font-display);font-weight:800;font-size:48px;line-height:1.18;color:#fff;letter-spacing:-.02em;text-shadow:0 3px 18px rgba(0,0,0,.22);margin:4px 0 0}
.bscs-title .em{color:color-mix(in srgb,var(--accent) 60%,#fff)}

/* 기간 pill */
.bscs-period{display:inline-block;margin-top:24px;font-family:var(--font-body);font-weight:700;font-size:18px;color:var(--ink);letter-spacing:.01em;padding:10px 28px;background:rgba(255,255,255,.72);border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.10)}

/* ── 하단 패널 (나무결/텍스처 무드) ── */
.bscs-bot{background:color-mix(in srgb,var(--paper) 88%,var(--accent));padding:32px 36px 38px;display:flex;flex-direction:column;align-items:center;gap:20px}

/* 쿠폰 행 */
.bscs-coupons{display:flex;gap:20px;width:100%}

/* 개별 쿠폰 카드 — 티켓 노치 스타일 */
.bscs-coupon{flex:1;background:var(--paper);border:2.5px dashed color-mix(in srgb,var(--accent) 55%,var(--line));border-radius:calc(var(--r-scale,1)*16px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px 24px;position:relative;text-align:center;box-shadow:0 4px 18px rgba(0,0,0,.07)}

/* 쿠폰 노치 — 좌우 반원 절취선 */
.bscs-coupon::before,.bscs-coupon::after{content:"";position:absolute;top:50%;transform:translateY(-50%);width:18px;height:18px;border-radius:50%;background:color-mix(in srgb,var(--paper) 88%,var(--accent));border:2.5px dashed color-mix(in srgb,var(--accent) 55%,var(--line))}
.bscs-coupon::before{left:-11px}
.bscs-coupon::after{right:-11px}

/* 쿠폰 라벨 소제목 */
.bscs-c-label{font-family:var(--font-body);font-size:13px;font-weight:700;color:var(--ink-2);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}

/* 쿠폰 핵심 수치 */
.bscs-c-value{font-family:var(--font-display);font-weight:800;font-size:52px;line-height:1;color:var(--accent);letter-spacing:-.02em}
.bscs-c-value .em{color:var(--accent)}

/* 단위 */
.bscs-c-unit{font-family:var(--font-body);font-size:14px;font-weight:700;color:var(--ink-2);margin-top:4px;letter-spacing:.04em}

/* 쿠폰 소주석 */
.bscs-c-note{margin-top:10px;font-size:11px;color:var(--muted);line-height:1.5}

/* 하단 패널 보조 문구 */
.bscs-panel-note{font-size:12px;color:var(--muted);text-align:center;line-height:1.6}
`,
  render: (d, { esc, richSafe }) => `
<section class="bscs">
  <div class="bscs-top">
    ${d.bgImage ? media(d.bgImage, 'bscs-bg', '시즌 배경 이미지') : ''}
    ${d.bgImage ? `<div class="bscs-bg-shade"></div>` : ''}
    <div class="bscs-hero">
      ${d.eyebrow ? `<h2 class="bscs-eye">${esc(d.eyebrow)}</h2>` : ''}
      <p class="bscs-title">${richSafe(d.title)}</p>
      ${d.period ? `<span class="bscs-period">${esc(d.period)}</span>` : ''}
    </div>
  </div>
  <div class="bscs-bot">
    <div class="bscs-coupons">
      ${d.coupons
        .map(
          (c) => `
      <div class="bscs-coupon">
        ${c.label ? `<div class="bscs-c-label">${esc(c.label)}</div>` : ''}
        <div class="bscs-c-value">${richSafe(c.value)}</div>
        ${c.unit ? `<div class="bscs-c-unit">${esc(c.unit)}</div>` : ''}
        ${c.note ? `<div class="bscs-c-note">${esc(c.note)}</div>` : ''}
      </div>`,
        )
        .join('')}
    </div>
    ${d.panelNote ? `<p class="bscs-panel-note">${esc(d.panelNote)}</p>` : ''}
  </div>
</section>`,
})
