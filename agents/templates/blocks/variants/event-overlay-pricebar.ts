/** EVENT 아키타입: event-overlay-pricebar.
 *  124_이벤트_01 패턴 재구성:
 *  전체폭 이미지 위 반투명 2행 타이틀 오버레이(상단) +
 *  색상 분기 할인 내역 리스트(흰 패널) +
 *  강조 최종가 블랙바(하단).
 *  이미지 부재 시 브랜드 틴트 배경으로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const priceItemSchema = z.object({
  label: z.string().min(1),
  amount: z.string().min(1),
  /** 'normal'=취소선+뮤트, 'sale'=다크, 'benefit'=accent 강조 */
  role: z.enum(['normal', 'sale', 'benefit']),
})

const schema = z.object({
  /** 이미지 위 오버레이 1행 (em,br) — 채널/브랜드명 등 */
  overlayLine1: z.string().min(1),
  /** 이미지 위 오버레이 2행 (em,br) — 이벤트 핵심 카피 */
  overlayLine2: z.string().min(1),
  /** 상품명 보조 한 줄 (순수 텍스트) */
  productSub: z.string().optional(),
  /** 상품명 메인 (em,br) */
  productName: z.string().min(1),
  /** 할인 내역 (2~5행) */
  priceItems: z.array(priceItemSchema).min(2).max(5),
  /** 최종가 레이블 (기본: "최종 혜택가") */
  finalLabel: z.string().optional(),
  /** 최종 금액 숫자 문자열 (ex. "290,000") */
  finalAmount: z.string().min(1),
  /** 최종가 단위 (기본: "원") */
  finalUnit: z.string().optional(),
  /** 전체폭 이미지 (url) */
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const eventOverlayPricebar = defineBlock<Data>({
  id: 'event-overlay-pricebar',
  archetype: 'event',
  styleTags: ['mixed', 'promo', 'dark-overlay', 'pricebar', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '이벤트/한정특가. 전체폭 이미지 위 반투명 블랙 2행 타이틀 오버레이 + 흰 패널 색상 분기 할인 내역 리스트(정상가·행사가·쿠폰/혜택) + 강조 최종가 블랙바. 이미지 없을 때 브랜드 틴트로 강등.',
  schema,
  css: `
/* ── eqkx: event-overlay-pricebar ── */
.eqkx{background:var(--bg);color:var(--ink);font-family:var(--font-body),'Pretendard',sans-serif}

/* 사진 영역 */
.eqkx-img-wrap{position:relative;width:100%;aspect-ratio:860/1015;overflow:hidden;background:color-mix(in srgb,var(--brand,#111) 14%,var(--bg))}
.eqkx-img-wrap img,.eqkx-img-wrap .ph{width:100%;height:100%;object-fit:cover;display:block;border-radius:0}
/* 이미지 부재 강등: 틴트 배경이 자연스럽게 노출되도록 .ph를 block으로 */
.eqkx-img-wrap .ph{display:block!important;background:color-mix(in srgb,var(--accent,#f87909) 8%,var(--brand,#111) 92%)}

/* 오버레이 타이틀 */
.eqkx-overlay{position:absolute;top:0;left:0;padding:var(--pad-x,56px) var(--pad-x,56px) 0}
.eqkx-ov-line{display:inline-block;background:rgba(17,17,17,.90);padding:0 20px}
.eqkx-ov-line + .eqkx-ov-line{margin-top:10px}
.eqkx-ov-l1{font-size:clamp(36px,5.5vw,72px);font-family:var(--font-display);font-weight:500;line-height:1.18;color:var(--accent)}
.eqkx-ov-l1 .em{color:var(--em-dark,#FFF7EA)}
.eqkx-ov-l2{font-size:clamp(36px,5.5vw,72px);font-family:var(--font-display);font-weight:800;line-height:1.18;color:#fff}
.eqkx-ov-l2 .em{color:var(--em-dark,#FFF7EA)}

/* 할인 내역 패널 */
.eqkx-detail{background:#fff;padding:40px var(--pad-x,56px) 0}
.eqkx-prod-sub{font-size:22px;font-weight:500;color:var(--muted);text-align:center;margin-bottom:6px}
.eqkx-prod-name{font-size:clamp(28px,4.2vw,54px);font-family:var(--font-display);font-weight:800;color:var(--ink);text-align:center;line-height:1.15;margin-bottom:28px}
.eqkx-prod-name .em{color:var(--accent)}
.eqkx-list{border-top:1px solid var(--line,#e8e8e8);padding-bottom:32px}
.eqkx-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--line,#e8e8e8)}
.eqkx-row-label{font-size:20px;font-weight:500}
.eqkx-row-amount{font-size:20px;font-weight:500;text-align:right}
/* 역할별 색 분기 */
.eqkx-row[data-role="normal"] .eqkx-row-label,
.eqkx-row[data-role="normal"] .eqkx-row-amount{color:var(--muted);text-decoration:line-through}
.eqkx-row[data-role="sale"] .eqkx-row-label,
.eqkx-row[data-role="sale"] .eqkx-row-amount{color:var(--ink)}
.eqkx-row[data-role="benefit"] .eqkx-row-label,
.eqkx-row[data-role="benefit"] .eqkx-row-amount{color:var(--accent);font-weight:700}

/* 최종가 블랙바 */
.eqkx-bar{display:flex;align-items:center;justify-content:space-between;background:#111;padding:20px var(--pad-x,56px)}
.eqkx-bar-label{font-size:22px;font-weight:600;color:#fff;font-family:var(--font-display)}
.eqkx-bar-price{display:flex;align-items:baseline;gap:6px}
.eqkx-bar-amount{font-size:clamp(36px,5.6vw,60px);font-family:var(--font-display);font-weight:800;color:var(--accent);line-height:1}
.eqkx-bar-unit{font-size:22px;font-weight:400;color:#fff;line-height:1}
`,
  render: (d, { esc, richSafe }) => {
    const finalLabel = esc(d.finalLabel ?? '최종 혜택가')
    const finalUnit = esc(d.finalUnit ?? '원')

    const rows = d.priceItems
      .map(
        (item) => `
    <div class="eqkx-row" data-role="${esc(item.role)}">
      <span class="eqkx-row-label">${esc(item.label)}</span>
      <span class="eqkx-row-amount">${esc(item.amount)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="eqkx">
  <div class="eqkx-img-wrap">
    ${media(d.image, 'eqkx-img', '이벤트 대표 이미지')}
    <div class="eqkx-overlay">
      <div class="eqkx-ov-line eqkx-ov-l1">${richSafe(d.overlayLine1)}</div>
      <div class="eqkx-ov-line eqkx-ov-l2">${richSafe(d.overlayLine2)}</div>
    </div>
  </div>
  <div class="eqkx-detail">
    ${d.productSub ? `<p class="eqkx-prod-sub">${esc(d.productSub)}</p>` : ''}
    <h2 class="eqkx-prod-name">${richSafe(d.productName)}</h2>
    <div class="eqkx-list">${rows}</div>
  </div>
  <div class="eqkx-bar">
    <span class="eqkx-bar-label">${finalLabel}</span>
    <div class="eqkx-bar-price">
      <span class="eqkx-bar-amount">${esc(d.finalAmount)}</span>
      <span class="eqkx-bar-unit">${finalUnit}</span>
    </div>
  </div>
</section>`
  },
})
