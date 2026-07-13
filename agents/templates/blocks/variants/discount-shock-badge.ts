/** DISCOUNT 아키타입: discount-shock-badge
 *  139_이벤트_05 구조 흡수 — 하늘색 배경 + 이벤트 라벨 + fs:150 초대형 헤드라인 +
 *  할인 슬로건 + 상품명 박스 + 제품 이미지 + 정상가/할인가 행 + 우측 원형 한정 뱃지 오버랩.
 *  이미지 부재 시 noimg-safe 강등(이미지 영역 은닉, 가격 행 단독 노출). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eventLabel: z.string().optional(),        // 상단 이벤트 라벨 (예: "special event")
  headline: z.string().min(1),              // 초대형 헤드라인 (em,br) — 예: "깜짝 세일"
  slogan: z.string().min(1),               // 할인 슬로건 (em,br) — 예: "단 하루 ! 오늘만 50% 할인"
  productName: z.string().min(1),          // 상품명 박스 텍스트
  image: z.string().optional(),            // 제품 이미지 url
  originalPrice: z.string().min(1),        // 정상가 표기 (예: "160,000원")
  salePrice: z.string().min(1),            // 할인가 표기 (예: "80,000원")
  badgeLines: z.array(z.string().min(1)).min(1).max(4).optional(), // 원형 뱃지 텍스트 줄들 (예: ["선착순","100명","한정"])
  originalLabel: z.string().optional(),    // 정가 레이블 (기본 "정상가")
  saleLabel: z.string().optional(),        // 할인가 레이블 (기본 "할인가")
})
type Data = z.infer<typeof schema>

export const discountShockBadge = defineBlock<Data>({
  id: 'discount-shock-badge',
  archetype: 'discount',
  styleTags: ['playful', 'bold', 'event', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '깜짝 할인 임팩트 블록. 하늘색(accent) 전면 배경 + 이벤트 라벨 + fs:150 초대형 헤드라인 + 할인 슬로건 + 상품명 박스 + 제품 이미지 + 정상가/할인가 행 + 우측 원형 한정 뱃지 오버랩. 선착순·기간 한정 긴급감 연출용. 이미지 없이도 붕괴하지 않는 noimg-safe 구현.',
  schema,
  css: `
/* ── discount-shock-badge (djpn) ── */
.djpn{background:var(--accent);color:#fff;padding:48px var(--pad-x,56px) 0;text-align:center;position:relative;overflow:visible}

/* 이벤트 라벨 */
.djpn-label-wrap{display:inline-block;padding:10px 32px;border:2.5px solid rgba(255,255,255,.55);border-radius:calc(var(--r-scale,1)*8px);margin-bottom:20px}
.djpn-label{font-size:18px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#fff;font-family:var(--font-lat,'Cormorant Garamond',serif)}

/* 초대형 헤드라인 */
.djpn-headline{font-family:var(--font-display);font-weight:900;font-size:clamp(56px,11vw,110px);line-height:1.06;letter-spacing:-.03em;color:#fff;word-break:keep-all}
.djpn-headline .em{color:rgba(255,255,255,.75)}

/* 할인 슬로건 */
.djpn-slogan{margin-top:12px;font-size:clamp(28px,4.5vw,50px);font-weight:700;line-height:1.2;color:#fff}
.djpn-slogan .em{color:rgba(255,255,255,.85);font-weight:900}

/* 제품 영역 */
.djpn-product{margin-top:32px;position:relative}

/* 상품명 박스 */
.djpn-name-box{background:#fff;border-radius:calc(var(--r-scale,1)*22px);padding:14px 24px;margin-bottom:0}
.djpn-name{font-family:var(--font-display);font-weight:900;font-size:clamp(22px,3.5vw,42px);color:var(--ink);letter-spacing:-.01em}

/* 제품 이미지 프레임 */
.djpn-img-frame{width:100%;aspect-ratio:680/480;border-radius:0;overflow:hidden;background:color-mix(in srgb,var(--accent) 15%,#fff)}
.djpn-img-frame img,.djpn-img-frame .ph{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0)}
/* noimg-safe: 이미지 없으면 프레임 자체를 숨김 */
.djpn-img-frame:has(.ph){display:none}

/* 가격 행 — position:relative로 뱃지 앵커 */
.djpn-price-row{position:relative;display:flex;justify-content:space-between;align-items:center;background:#fff;padding:22px 28px;padding-right:calc(clamp(120px,15vw,200px) + 24px)}
.djpn-price-labels{text-align:left;display:flex;flex-direction:column;gap:6px}
.djpn-price-values{text-align:right;display:flex;flex-direction:column;gap:6px}
.djpn-price-lbl{font-size:clamp(16px,2.2vw,28px);font-weight:700;color:var(--ink);line-height:1.2}
.djpn-price-val{font-size:clamp(16px,2.2vw,28px);font-weight:700;color:var(--ink);line-height:1.2}
.djpn-price-val.sale{color:var(--accent);font-weight:900}
.djpn-price-lbl.orig-lbl,.djpn-price-val.orig{opacity:.55}

/* 원형 한정 뱃지 — 가격 행 기준 absolute, 위로 오버랩 (섹션 overflow:visible 필수) */
.djpn-badge-wrap{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:clamp(120px,15vw,200px);height:clamp(120px,15vw,200px);z-index:10;pointer-events:none}
.djpn-badge-circle{width:100%;height:100%;border-radius:50%;overflow:hidden;background:var(--accent-d);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 8px 24px -8px rgba(0,0,0,.35)}
.djpn-badge-line{font-family:var(--font-display);font-weight:900;font-size:clamp(11px,1.8vw,22px);color:#fff;line-height:1.2;letter-spacing:-.01em;text-align:center}
`,
  render: (d, { esc, richSafe }) => {
    const badgeLines = d.badgeLines ?? ['선착순', '한정']
    const origLabel = d.originalLabel ?? '정상가'
    const saleLabel = d.saleLabel ?? '할인가'

    return `
<section class="djpn">
  ${d.eventLabel ? `<div class="djpn-label-wrap"><span class="djpn-label">${esc(d.eventLabel)}</span></div>` : ''}
  <h2 class="djpn-headline">${richSafe(d.headline)}</h2>
  <p class="djpn-slogan">${richSafe(d.slogan)}</p>

  <div class="djpn-product">
    <div class="djpn-name-box">
      <p class="djpn-name">${esc(d.productName)}</p>
    </div>

    <div class="djpn-img-frame">
      ${media(d.image, '', '제품 이미지')}
    </div>

    <div class="djpn-price-row">
      <div class="djpn-price-labels">
        <span class="djpn-price-lbl orig-lbl">${esc(origLabel)}</span>
        <span class="djpn-price-lbl">${esc(saleLabel)}</span>
      </div>
      <div class="djpn-price-values">
        <span class="djpn-price-val orig">${esc(d.originalPrice)}</span>
        <span class="djpn-price-val sale">${esc(d.salePrice)}</span>
      </div>
      <div class="djpn-badge-wrap">
        <div class="djpn-badge-circle">
          ${badgeLines.map((l) => `<span class="djpn-badge-line">${esc(l)}</span>`).join('\n          ')}
        </div>
      </div>
    </div>
  </div>
</section>`
  },
})
