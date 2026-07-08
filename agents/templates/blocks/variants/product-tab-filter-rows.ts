/** LINEUP 아키타입: product-tab-filter-rows.
 *  [끝판왕] 상품 구성 #6 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 대형 제목 + 서브 카피 → 카테고리 탭 필터(pill) → 이미지-좌 카드 행 반복
 *  (할인% 버스트 배지 오버레이 + 쿠폰 pill + 취소선 원가 + 강조 최종가 + 화살표 CTA). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

/** 개별 상품 카드 */
const itemSchema = z.object({
  /** 카드가 속하는 탭 키 (tabs[].key 값과 일치 — 미입력 시 모든 탭에 표시) */
  tabKey: z.string().optional(),
  /** 상품 이미지 URL */
  image: z.string().optional(),
  /** 상품 이미지 alt */
  imageAlt: z.string().optional(),
  /** 할인율 숫자(예: 34). 0이면 배지 숨김 */
  discountPct: z.number().int().min(0).max(99).optional(),
  /** 상품명 (em 허용) */
  name: z.string().min(1),
  /** 세부 설명 한 줄 */
  detail: z.string().optional(),
  /** 쿠폰/프로모션 라벨 (예: "이달의 쿠폰"). 없으면 숨김 */
  coupon: z.string().optional(),
  /** 취소선 원가 (예: "45,800원"). 없으면 숨김 */
  originalPrice: z.string().optional(),
  /** 최종 가격 강조 표시 (예: "30,240원") */
  finalPrice: z.string().min(1),
  /** CTA 링크 href. 없으면 화살표 버튼 숨김 */
  ctaHref: z.string().optional(),
})

const schema = z.object({
  /** 섹션 대제목 */
  title: z.string().min(1),
  /** 섹션 서브 카피 (선택) */
  subtitle: z.string().optional(),
  /** 카테고리 탭 목록 (1~5개). 첫 번째가 기본 활성 탭. key는 JS 식별자 안전 문자로. */
  tabs: z
    .array(z.object({ key: z.string().min(1), label: z.string().min(1) }))
    .min(1)
    .max(5),
  /** 상품 카드 목록 (2~8개) */
  items: z.array(itemSchema).min(2).max(8),
})
type Data = z.infer<typeof schema>

export const productTabFilterRows = defineBlock<Data>({
  id: 'product-tab-filter-rows',
  archetype: 'lineup',
  styleTags: ['commerce', 'filter', 'card', 'price', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성(탭 필터+카드 행). 대제목+서브 → 카테고리 pill 탭(클릭 시 해당 탭 상품만 표시) → 이미지-좌 상품 카드 행(할인% 오버레이 배지 + 쿠폰 pill + 취소선 원가 + 강조 최종가 + 화살표 CTA). 커머스 상품 라인업 소개에 최적.',
  schema,
  css: `
/* product-tab-filter-rows — prefix ptfr- */
.ptfr{background:var(--bg);padding:60px 32px 72px;word-break:keep-all}
.ptfr-hd{text-align:center;margin-bottom:32px}
.ptfr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,7vw,52px);letter-spacing:-.025em;line-height:1.15;color:var(--ink)}
.ptfr-title .em{color:var(--accent-d)}
.ptfr-sub{margin-top:10px;font-size:16px;color:var(--muted);line-height:1.6}
/* ── 탭 필터 ── */
.ptfr-tabs{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:28px}
.ptfr-tab{border:1.5px solid var(--line);background:transparent;color:var(--muted);font-family:var(--font-body);font-size:15px;font-weight:600;padding:9px 22px;border-radius:999px;cursor:pointer;transition:background .18s,color .18s,border-color .18s;line-height:1}
.ptfr-tab.active,.ptfr-tab:focus{background:var(--accent-d);border-color:var(--accent-d);color:#fff;outline:none}
/* ── 카드 목록 ── */
.ptfr-list{display:flex;flex-direction:column;gap:16px}
.ptfr-card{display:grid;grid-template-columns:160px 1fr;gap:0;background:var(--paper);border-radius:calc(var(--r-scale,1)*18px);overflow:hidden;position:relative}
/* 이미지 영역 */
.ptfr-img-wrap{position:relative;flex-shrink:0}
.ptfr-img{width:160px;height:160px;object-fit:cover;display:block}
.ptfr-img.ph{width:160px;height:160px}
/* 할인 배지 — 흑색 pill, 이미지 좌하단 오버레이 */
.ptfr-badge{position:absolute;bottom:12px;left:12px;background:#111;color:#fff;font-size:15px;font-weight:800;padding:5px 11px;border-radius:999px;line-height:1;letter-spacing:.01em;pointer-events:none}
/* 정보 영역 */
.ptfr-info{padding:20px 16px 20px 18px;display:flex;flex-direction:column;justify-content:center;gap:0;min-width:0}
.ptfr-name{font-family:var(--font-display);font-weight:800;font-size:17px;color:var(--ink);line-height:1.35;margin-bottom:4px}
.ptfr-name .em{color:var(--accent-d)}
.ptfr-detail{font-size:14px;color:var(--muted);line-height:1.5;margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* 쿠폰 pill */
.ptfr-coupon{display:inline-block;background:#e8e6e0;color:#666;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;margin-bottom:6px;letter-spacing:.01em;width:fit-content}
/* 가격 행 */
.ptfr-price-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:2px}
.ptfr-orig{font-size:13px;color:var(--muted);text-decoration:line-through;letter-spacing:-.01em}
.ptfr-final{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--accent-d);letter-spacing:-.02em;line-height:1}
/* CTA 화살표 버튼 — 우하단 절대 */
.ptfr-cta{position:absolute;bottom:14px;right:14px;width:40px;height:40px;border-radius:50%;background:var(--accent-d);display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0}
.ptfr-cta svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
/* 숨김 유틸 */
.ptfr-card.ptfr-hidden{display:none}
`,
  render: (d, { esc, richSafe }) => {
    const firstTabKey = d.tabs[0]?.key ?? ''

    const tabs = d.tabs
      .map(
        (t, i) =>
          `<button class="ptfr-tab${i === 0 ? ' active' : ''}" data-tab="${attr(t.key)}" onclick="(function(btn){var p=btn.closest('.ptfr');p.querySelectorAll('.ptfr-tab').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');var key=btn.dataset.tab;p.querySelectorAll('.ptfr-card').forEach(function(c){c.classList.toggle('ptfr-hidden',c.dataset.tab!==key&&c.dataset.tab!=='')});} )(this)">${esc(t.label)}</button>`,
      )
      .join('')

    const arrowSvg = `<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

    const cards = d.items
      .map((it) => {
        const tab = it.tabKey ?? ''
        // 최초 탭 소속이 아닌 카드는 초기 hidden
        const hiddenClass = tab && tab !== firstTabKey ? ' ptfr-hidden' : ''
        const badgeHtml =
          it.discountPct && it.discountPct > 0
            ? `<span class="ptfr-badge">${it.discountPct}%</span>`
            : ''
        const couponHtml = it.coupon
          ? `<span class="ptfr-coupon">${esc(it.coupon)}</span>`
          : ''
        const origHtml = it.originalPrice
          ? `<span class="ptfr-orig">${esc(it.originalPrice)}</span>`
          : ''
        const ctaHtml = it.ctaHref
          ? `<a class="ptfr-cta" href="${attr(it.ctaHref)}" aria-label="상품 보기">${arrowSvg}</a>`
          : ''

        return `
<div class="ptfr-card${hiddenClass}" data-tab="${attr(tab)}">
  <div class="ptfr-img-wrap">
    ${media(it.image, 'ptfr-img', esc(it.imageAlt ?? it.name))}
    ${badgeHtml}
  </div>
  <div class="ptfr-info">
    <p class="ptfr-name">${richSafe(it.name)}</p>
    ${it.detail ? `<p class="ptfr-detail">${esc(it.detail)}</p>` : ''}
    ${couponHtml}
    <div class="ptfr-price-row">
      ${origHtml}
      <span class="ptfr-final">${esc(it.finalPrice)}</span>
    </div>
  </div>
  ${ctaHtml}
</div>`
      })
      .join('')

    return `
<section class="ptfr">
  <div class="ptfr-hd">
    <h2 class="ptfr-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ptfr-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ptfr-tabs" role="tablist">${tabs}</div>
  <div class="ptfr-list">${cards}</div>
</section>`
  },
})
