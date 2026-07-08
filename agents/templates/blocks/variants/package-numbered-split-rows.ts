/** PROMO/LINEUP 아키타입: package-numbered-split-rows.
 *  [끝판왕] 상품 구성 #5 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 메인 히어로 카드(이미지+제목) + 번호 붙은 분할 패널 행 반복.
 *  각 행 = [좌: 번호+상품 이미지 / 우: 따뜻한 배경 + 상품명+세부+가격표].
 *  할인 배지 색상이 첫→마지막 행으로 갈수록 단계적으로 강조(앰버→오렌지→레드). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 히어로 카드 — 대표 이미지 + 한 줄 설명 + 굵은 제품명 */
  hero: z.object({
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    eyebrow: z.string().optional(),
    title: z.string().min(1),
  }),
  /** 번호가 붙은 상품 행 (2~4개). 순서대로 01·02·03… 자동 부여. */
  items: z
    .array(
      z.object({
        /** 상품명 (em 허용) */
        name: z.string().min(1),
        /** 세부정보 한 줄 (em/br 허용, 선택) */
        detail: z.string().optional(),
        /** 상품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 정상가 (예: "31,000") */
        originalPrice: z.string().min(1),
        /** 할인율 표시 (예: "36%") */
        discountRate: z.string().min(1),
        /** 할인가 (예: "19,900") */
        salePrice: z.string().min(1),
        /** 할인가 단위 (기본 "원") */
        unit: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

/** 번호에 따라 배지 색상을 단계적으로 강조. 0→앰버, 1→오렌지, 2+→레드 */
function badgeBg(index: number, total: number): string {
  if (total <= 1) return '#F59E0B' // 단독일 때 앰버
  const step = index / (total - 1) // 0~1
  if (step < 0.4) return '#F59E0B' // 앰버
  if (step < 0.75) return '#F97316' // 오렌지
  return '#EF4444' // 레드
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const packageNumberedSplitRows = defineBlock<Data>({
  id: 'package-numbered-split-rows',
  archetype: 'lineup',
  styleTags: ['promo', 'package', 'pricing', 'warm', 'template'],
  imageSlots: 5,
  describe:
    '상품 구성 번호-분할 패널. 상단 히어로 카드(이미지+제품명) + 번호(01/02/03) 붙은 좌우 분할 행 반복. 좌=번호+상품 이미지, 우=따뜻한 배경+상품명+세부+가격표(정상가 취소선+할인배지+할인가). 배지 색상이 마지막 행으로 갈수록 앰버→오렌지→레드로 강조 단계 상승. 2~4개 상품 패키지 구성 소개에 최적.',
  schema,
  css: `
/* package-numbered-split-rows — 접두사 pnsr- */
.pnsr{background:var(--bg);padding:0 0 48px;word-break:keep-all}

/* ── 히어로 카드 ── */
.pnsr-hero{margin:0 16px 20px;border-radius:calc(var(--r-scale,1)*18px);overflow:hidden;background:var(--paper);box-shadow:0 4px 18px -6px rgba(0,0,0,.14)}
.pnsr-hero-img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
.pnsr-hero-img.ph{width:100%;aspect-ratio:16/9}
.pnsr-hero-body{padding:20px 24px 24px;text-align:center}
.pnsr-hero-eyebrow{font-family:var(--font-body);font-size:14px;color:var(--muted);margin-bottom:6px;letter-spacing:.02em}
.pnsr-hero-title{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5.5vw,32px);color:var(--ink);line-height:1.25;letter-spacing:-.02em}
.pnsr-hero-title .em{color:var(--accent-d)}

/* ── 번호 분할 행 ── */
.pnsr-row{margin:0 16px 14px;border-radius:calc(var(--r-scale,1)*18px);overflow:hidden;background:var(--paper);box-shadow:0 4px 14px -6px rgba(0,0,0,.12);display:grid;grid-template-columns:44% 56%}
.pnsr-row:last-of-type{margin-bottom:0}

/* 좌 패널: 번호 + 상품 이미지 */
.pnsr-left{position:relative;background:var(--paper);display:flex;align-items:center;justify-content:center;min-height:190px}
.pnsr-num{position:absolute;top:14px;left:16px;font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6vw,38px);color:var(--ink);line-height:1;letter-spacing:-.02em;opacity:.92}
.pnsr-prod-img{width:100%;height:190px;object-fit:cover;display:block}
.pnsr-prod-img.ph{width:100%;height:190px}

/* 우 패널: 따뜻한 배경 + 상품 정보 + 가격 */
.pnsr-right{background:color-mix(in srgb,var(--accent) 10%,var(--paper));padding:18px 18px 18px 16px;display:flex;flex-direction:column;justify-content:space-between;gap:10px}
.pnsr-name{font-family:var(--font-display);font-weight:800;font-size:clamp(15px,3.4vw,19px);color:var(--ink);line-height:1.3;letter-spacing:-.01em}
.pnsr-name .em{color:var(--accent-d)}
.pnsr-detail{font-family:var(--font-body);font-size:13px;color:var(--muted);line-height:1.55;margin-top:2px}
.pnsr-detail .em{color:var(--accent-d);font-weight:700}

/* 가격 블록 */
.pnsr-price-block{margin-top:auto}
.pnsr-orig{font-family:var(--font-body);font-size:13px;color:var(--muted);text-decoration:line-through;margin-bottom:4px}
.pnsr-sale-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pnsr-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:3px 10px;font-family:var(--font-display);font-weight:800;font-size:clamp(12px,3vw,15px);color:#fff;white-space:nowrap;line-height:1.2}
.pnsr-sale{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5.5vw,32px);color:var(--ink);letter-spacing:-.02em;line-height:1}
.pnsr-unit{font-family:var(--font-body);font-size:13px;color:var(--muted);align-self:flex-end;padding-bottom:2px}

/* 마지막 행 할인가 강조 — 레드 배지 시 가격도 레드로 */
.pnsr-row.pnsr-hot .pnsr-sale{color:#EF4444}
`,
  render: (d, { esc, richSafe }) => {
    const total = d.items.length

    const heroHtml = `
<div class="pnsr-hero">
  ${media(d.hero.image, 'pnsr-hero-img', esc(d.hero.imageAlt ?? '메인 상품 이미지'))}
  <div class="pnsr-hero-body">
    ${d.hero.eyebrow ? `<p class="pnsr-hero-eyebrow">${esc(d.hero.eyebrow)}</p>` : ''}
    <h2 class="pnsr-hero-title">${richSafe(d.hero.title)}</h2>
  </div>
</div>`

    const rowsHtml = d.items
      .map((it, i) => {
        const bg = badgeBg(i, total)
        const isHot = bg === '#EF4444'
        const unit = esc(it.unit ?? '원')
        return `
<div class="pnsr-row${isHot ? ' pnsr-hot' : ''}">
  <div class="pnsr-left">
    <span class="pnsr-num">${pad2(i + 1)}</span>
    ${media(it.image, 'pnsr-prod-img', esc(it.imageAlt ?? `상품 ${pad2(i + 1)} 이미지`))}
  </div>
  <div class="pnsr-right">
    <div>
      <p class="pnsr-name">${richSafe(it.name)}</p>
      ${it.detail ? `<p class="pnsr-detail">${richSafe(it.detail)}</p>` : ''}
    </div>
    <div class="pnsr-price-block">
      <p class="pnsr-orig">정상가 &nbsp;${esc(it.originalPrice)}원</p>
      <div class="pnsr-sale-row">
        <span class="pnsr-badge" style="background:${bg}">${esc(it.discountRate)}</span>
        <span class="pnsr-sale">${esc(it.salePrice)}</span>
        <span class="pnsr-unit">${unit}</span>
      </div>
    </div>
  </div>
</div>`
      })
      .join('')

    return `
<section class="pnsr">
  ${heroHtml}
  ${rowsHtml}
</section>`
  },
})
