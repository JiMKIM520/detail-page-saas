/** LINEUP/PROMO 아키타입: package-discount-image-rows.
 *  [끝판왕] 상품 구성 #23 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 브랜드 다크 헤더(해시태그 eyebrow + 대제목 + 모델/제품 오버레이 이미지) +
 *  per-row 카드 반복(상품 이미지 좌 + 이름/설명/옵션 우 + 행 내 원형 할인% 배지 + 가격 그리드).
 *  커머스 패키지 라인업·번들 소개에 최적. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 해시태그 eyebrow (예: "#해시태그 #해시태그") */
  eyebrow: z.string().optional(),
  /** 섹션 대제목 (em 허용) */
  title: z.string().min(1),
  /** 헤더 오른쪽 모델/브랜드 이미지 URL (선택) */
  headerImage: z.string().optional(),
  /** 상품 행 (2~5개) */
  items: z
    .array(
      z.object({
        /** 상품 이미지 URL */
        image: z.string().optional(),
        /** 브랜드명 + 상품명 (em 허용) */
        name: z.string().min(1),
        /** 상품 설명 (em/br 허용, 선택) */
        desc: z.string().optional(),
        /** 옵션/규격 안내 (선택) */
        option: z.string().optional(),
        /** 할인율 숫자만 (예: 35 → 35%) */
        discountPct: z.number().int().min(1).max(99),
        /** 정가 표시 텍스트 (예: "22,000원") */
        originalPrice: z.string().min(1),
        /** 판매가 표시 텍스트 (예: "17,000원") */
        salePrice: z.string().min(1),
      }),
    )
    .min(2)
    .max(5),
  /** 하단 각주 텍스트 (선택) */
  footnote: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const packageDiscountImageRows = defineBlock<Data>({
  id: 'package-discount-image-rows',
  archetype: 'lineup',
  styleTags: ['commerce', 'package', 'discount', 'lineup', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성/패키지 라인업. 브랜드 다크 헤더(해시태그 eyebrow + 대제목 + 오버레이 이미지) + 상품 행 반복(상품 이미지 좌·이름/설명/옵션 우 + 행 내 원형 할인% 배지 + 정가 취소선 + 판매가 bold). 2~5개 상품 번들/구성 소개.',
  schema,
  css: `
/* package-discount-image-rows — 접두사 pdir- */
/* ── wrapper ─────────────────────────────── */
.pdir{background:var(--bg);word-break:keep-all;overflow-wrap:break-word}

/* ── header band ────────────────────────── */
.pdir-hd{position:relative;background:var(--brand);padding:48px 40px 52px;overflow:hidden;min-height:190px}
.pdir-hd-text{position:relative;z-index:1;max-width:68%}
.pdir-eyebrow{font-family:var(--font-body);font-size:14px;font-weight:500;color:rgba(255,255,255,.70);letter-spacing:.04em;margin-bottom:14px}
.pdir-title{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,7vw,52px);line-height:1.14;letter-spacing:-.02em;color:#fff}
.pdir-title .em{color:var(--accent)}
.pdir-hd-img{position:absolute;right:-8px;bottom:0;height:100%;max-height:220px;object-fit:cover;object-position:top center}
.pdir-hd-img.ph{position:absolute;right:16px;top:50%;transform:translateY(-50%);width:120px;height:140px;border-radius:calc(var(--r-scale,1)*8px)}

/* ── rows list ──────────────────────────── */
.pdir-rows{padding:0 20px 24px;display:flex;flex-direction:column;gap:0}

/* ── single row card ─────────────────────── */
.pdir-row{display:grid;grid-template-columns:130px 1fr;gap:0;background:var(--paper);border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));overflow:hidden;margin-top:16px;box-shadow:0 6px 20px -10px rgba(0,0,0,.18)}

/* product image cell */
.pdir-thumb{width:130px;height:130px;object-fit:cover;display:block;flex-shrink:0}
.pdir-thumb.ph{width:130px;height:130px;flex-shrink:0}

/* info cell */
.pdir-info{padding:18px 16px 14px;display:flex;flex-direction:column;gap:4px}
.pdir-name{font-family:var(--font-display);font-weight:800;font-size:17px;line-height:1.25;color:var(--ink)}
.pdir-name .em{color:var(--accent-d)}
.pdir-desc{font-size:14px;color:var(--muted);line-height:1.55}
.pdir-desc .em{color:var(--accent-d);font-weight:700}
.pdir-option{font-size:13px;color:var(--muted);margin-top:2px}

/* ── price row: badge + prices ───────────── */
.pdir-price-row{display:flex;align-items:center;gap:10px;margin-top:8px}

/* circular discount badge */
.pdir-badge{flex-shrink:0;width:48px;height:48px;border-radius:50%;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:14px;line-height:1;letter-spacing:-.01em}

/* price grid */
.pdir-prices{display:flex;flex-direction:column;gap:2px}
.pdir-original{font-size:13px;color:var(--muted);text-decoration:line-through;line-height:1.3}
.pdir-sale{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--ink);line-height:1.15}

/* ── footnote ───────────────────────────── */
.pdir-footnote{text-align:center;font-size:13px;color:var(--muted);padding:14px 24px 32px;line-height:1.6}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map(
        (it) => `
    <div class="pdir-row">
      ${media(it.image, 'pdir-thumb', esc(it.name))}
      <div class="pdir-info">
        <div class="pdir-name">${richSafe(it.name)}</div>
        ${it.desc ? `<div class="pdir-desc">${richSafe(it.desc)}</div>` : ''}
        ${it.option ? `<div class="pdir-option">${esc(it.option)}</div>` : ''}
        <div class="pdir-price-row">
          <div class="pdir-badge">${it.discountPct}%</div>
          <div class="pdir-prices">
            <span class="pdir-original">${esc(it.originalPrice)}</span>
            <span class="pdir-sale">${esc(it.salePrice)}</span>
          </div>
        </div>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="pdir">
  <div class="pdir-hd">
    <div class="pdir-hd-text">
      ${d.eyebrow ? `<p class="pdir-eyebrow">${esc(d.eyebrow)}</p>` : ''}
      <h2 class="pdir-title">${richSafe(d.title)}</h2>
    </div>
    ${media(d.headerImage, 'pdir-hd-img', '헤더 이미지')}
  </div>
  <div class="pdir-rows">${rows}
  </div>
  ${d.footnote ? `<p class="pdir-footnote">${esc(d.footnote)}</p>` : ''}
</section>`
  },
})
