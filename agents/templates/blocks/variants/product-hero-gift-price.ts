/** LINEUP 아키타입: product-hero-gift-price.
 *  [끝판왕] 상품 구성 #24 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 제품 이미지 우상단 플로팅 증정품 pill(아이콘+썸네일) + 소비자가(취소선 MSRP)·판매가(굵음) 가격 그리드 + 추가할인 배지 행.
 *  밝은 베이지/크림 배경 — 커머스 프리미엄 가격표 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 대제목 (em 허용) */
  title: z.string().min(1),
  /** 제목 아래 보조 설명 (선택) */
  subtitle: z.string().optional(),
  /** 메인 제품 이미지 URL */
  productImage: z.string().optional(),
  /** 메인 제품 이미지 alt */
  productImageAlt: z.string().optional(),
  /** 제품 분류/카테고리 라벨 (예: "중형볼") */
  categoryLabel: z.string().optional(),
  /** 제품명 입력 플레이스홀더 라벨 (예: "제품명을 입력해주세요") */
  productNameLabel: z.string().optional(),
  /** 플로팅 증정품 pill 텍스트 (예: "증정품") */
  giftLabel: z.string().optional(),
  /** 증정품 썸네일 이미지 URL */
  giftImage: z.string().optional(),
  /** 증정품 이미지 alt */
  giftImageAlt: z.string().optional(),
  /** 소비자가(MSRP) — 취소선 표시. 숫자+단위 문자열 (예: "599,000원") */
  msrp: z.string().optional(),
  /** 소비자가 라벨 (기본 "소비자가") */
  msrpLabel: z.string().optional(),
  /** 판매가 — 굵은 강조. 숫자+단위 문자열 (예: "399,000원") */
  salePrice: z.string().min(1),
  /** 판매가 라벨 (기본 "판매가") */
  salePriceLabel: z.string().optional(),
  /** 추가 할인 행 (선택, 예: 네이버페이 추가 할인) */
  extraDiscounts: z
    .array(
      z.object({
        /** 할인 설명 카피 (em,br 허용, 예: "네이버 페이 결제 시 <br>5,000원 추가 할인") */
        desc: z.string().min(1),
        /** 할인 금액 배지 (예: "-5,000원") */
        badge: z.string().min(1),
      }),
    )
    .max(3)
    .optional(),
})
type Data = z.infer<typeof schema>

export const productHeroGiftPrice = defineBlock<Data>({
  id: 'product-hero-gift-price',
  archetype: 'lineup',
  styleTags: ['commerce', 'price', 'gift', 'premium', 'warm', 'template'],
  imageSlots: 2,
  describe:
    '상품 구성·가격 제시. 제품 이미지 우상단 플로팅 증정품 pill(gift 아이콘+썸네일) + 소비자가(취소선 MSRP)/판매가(굵음) 가격 그리드 + 추가할인 배지 행(최대 3). 밝은 크림/베이지 배경 커머스 가격표 섹션.',
  schema,
  css: `
/* product-hero-gift-price — 접두사 phgp- */
.phgp{background:var(--paper);padding:48px 40px 52px;word-break:keep-all;overflow-wrap:break-word}

/* 헤더 */
.phgp-hd{margin-bottom:28px}
.phgp-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.8vw,36px);line-height:1.22;letter-spacing:-.02em;color:var(--ink)}
.phgp-title .em{color:var(--accent-d)}
.phgp-sub{margin-top:8px;font-family:var(--font-body);font-size:14px;line-height:1.6;color:var(--muted)}

/* 제품 이미지 영역 */
.phgp-fig{position:relative;margin-bottom:20px}
.phgp-product{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));display:block}
.phgp-product.ph{width:100%;aspect-ratio:1/1;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px))}

/* 플로팅 증정품 pill — 우상단 앵커 */
.phgp-gift-pill{
  position:absolute;top:14px;right:14px;
  display:flex;align-items:center;gap:8px;
  background:#fff;
  border:1.5px solid var(--line);
  border-radius:999px;
  padding:6px 12px 6px 8px;
  box-shadow:0 4px 14px -4px rgba(0,0,0,.18);
  z-index:2;
  max-width:160px;
}
.phgp-gift-icon{display:flex;align-items:center;justify-content:center;width:20px;height:20px;flex-shrink:0;color:var(--accent-d)}
.phgp-gift-icon svg{width:18px;height:18px}
.phgp-gift-label{font-family:var(--font-body);font-size:12px;font-weight:700;color:var(--ink);letter-spacing:.01em;white-space:nowrap}
.phgp-gift-thumb{width:36px;height:36px;object-fit:cover;border-radius:calc(var(--r-scale,1)*6px);flex-shrink:0}
.phgp-gift-thumb.ph{width:36px;height:36px;border-radius:calc(var(--r-scale,1)*6px);font-size:9px}

/* 카테고리 라벨 pill */
.phgp-cat-row{display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.phgp-cat-pill{display:inline-flex;align-items:center;background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:4px 14px;font-size:12px;font-weight:600;color:var(--ink);letter-spacing:.01em}
.phgp-name-hint{font-size:13px;color:var(--muted)}

/* 가격 그리드 */
.phgp-prices{display:grid;grid-template-columns:auto 1fr;gap:0;border-top:1px solid var(--line);margin-top:4px}
.phgp-price-row{display:contents}
.phgp-price-row > *{padding:12px 0}
.phgp-price-row + .phgp-price-row > *{border-top:1px solid var(--line)}
.phgp-price-lbl{font-size:14px;font-weight:500;color:var(--muted);padding-right:20px;white-space:nowrap;display:flex;align-items:center}
.phgp-price-val{font-size:16px;font-weight:500;color:var(--muted);text-decoration:line-through;display:flex;align-items:center}
.phgp-price-val.sale{font-family:var(--font-display);font-size:clamp(22px,5vw,28px);font-weight:800;color:var(--ink);text-decoration:none;letter-spacing:-.02em}

/* 추가할인 행 */
.phgp-discount-row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--bg);border-radius:calc(var(--r-scale,1)*10px);padding:12px 16px;margin-top:10px}
.phgp-discount-row + .phgp-discount-row{margin-top:6px}
.phgp-discount-desc{font-size:13px;line-height:1.5;color:var(--ink)}
.phgp-discount-desc .em{color:var(--accent-d);font-weight:700}
.phgp-discount-badge{flex-shrink:0;background:#e5343a;color:#fff;font-family:var(--font-display);font-size:14px;font-weight:800;border-radius:calc(var(--r-scale,1)*6px);padding:4px 10px;white-space:nowrap;letter-spacing:-.01em}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 플로팅 증정품 pill
    const giftPill =
      d.giftLabel || d.giftImage
        ? `<div class="phgp-gift-pill">
        <span class="phgp-gift-icon">${icon('gift')}</span>
        <span class="phgp-gift-label">${esc(d.giftLabel ?? '증정품')}</span>
        ${media(d.giftImage, 'phgp-gift-thumb', esc(d.giftImageAlt ?? '증정품 이미지'))}
      </div>`
        : ''

    // 카테고리 + 제품명 행
    const catRow =
      d.categoryLabel || d.productNameLabel
        ? `<div class="phgp-cat-row">
        ${d.categoryLabel ? `<span class="phgp-cat-pill">${esc(d.categoryLabel)}</span>` : ''}
        ${d.productNameLabel ? `<span class="phgp-name-hint">${esc(d.productNameLabel)}</span>` : ''}
      </div>`
        : ''

    // MSRP 행 (취소선)
    const msrpRow = d.msrp
      ? `<div class="phgp-price-row">
        <span class="phgp-price-lbl">${esc(d.msrpLabel ?? '소비자가')}</span>
        <span class="phgp-price-val">${esc(d.msrp)}</span>
      </div>`
      : ''

    // 판매가 행
    const salePriceRow = `<div class="phgp-price-row">
      <span class="phgp-price-lbl">${esc(d.salePriceLabel ?? '판매가')}</span>
      <span class="phgp-price-val sale">${esc(d.salePrice)}</span>
    </div>`

    // 추가할인 배지 행
    const discountRows = (d.extraDiscounts ?? [])
      .map(
        (row) =>
          `<div class="phgp-discount-row">
          <span class="phgp-discount-desc">${richSafe(row.desc)}</span>
          <span class="phgp-discount-badge">${esc(row.badge)}</span>
        </div>`,
      )
      .join('')

    return `
<section class="phgp">
  <div class="phgp-hd">
    <h2 class="phgp-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="phgp-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="phgp-fig">
    ${media(d.productImage, 'phgp-product', esc(d.productImageAlt ?? '제품 이미지'))}
    ${giftPill}
  </div>
  ${catRow}
  <div class="phgp-prices">
    ${msrpRow}
    ${salePriceRow}
  </div>
  ${discountRows}
</section>`
  },
})
