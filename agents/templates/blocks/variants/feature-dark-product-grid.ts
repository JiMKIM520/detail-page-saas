/** POINT/PROMO 아키타입: feature-dark-product-grid.
 *  [끝판왕] 포인트 구성 #3 패턴을 토큰 기반으로 재구성 (클론 아님).
 *  시그니처: 다크 배경(--ink) + 상단 캠페인 헤딩(브랜드명 + 할인율 accent 강조) +
 *  하단 2-col 제품 이미지 카드 그리드. 각 카드: 상단 pill 배지 2개(카테고리 + 세일명) +
 *  이미지 풀 채움 + 하단-좌 "▶ NEXT" 인라인 CTA. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 브랜드/캠페인 대형 헤드라인 (em 허용 — 할인율 등 강조 어절) */
  heading: z.string().min(1),
  /** 헤드라인 아래 서브 카피 (em 허용) */
  subheading: z.string().optional(),
  /** 제품 카드 (2~6개, 짝수 권장) */
  items: z
    .array(
      z.object({
        /** 카테고리 pill 레이블 (예: "All product") */
        categoryLabel: z.string().min(1),
        /** 세일명 pill 레이블 (예: "Flowerdance Sale") */
        saleLabel: z.string().min(1),
        /** 제품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 인라인 CTA 텍스트 (기본 "NEXT") */
        ctaText: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const featureDarkProductGrid = defineBlock<Data>({
  id: 'feature-dark-product-grid',
  archetype: 'point',
  styleTags: ['dark', 'promo', 'grid', 'campaign', 'commerce', 'template'],
  imageSlots: 4,
  describe:
    '캠페인 다크 제품 그리드. 다크(--ink) 배경 + 상단 브랜드/할인율 대형 헤딩 + 2-col 제품 카드 그리드. 각 카드: 카테고리·세일명 pill 배지 2개, 풀채움 제품 이미지, 하단-좌 ▶ NEXT CTA. 패션·뷰티·리빙 시즌 세일 포인트 구성.',
  schema,
  css: `
/* feature-dark-product-grid — 접두사 fdpg- */
.fdpg{background:var(--ink);padding:52px 20px 40px;word-break:keep-all}
/* ── 헤더 ── */
.fdpg-hd{text-align:center;margin-bottom:36px;padding:0 12px}
.fdpg-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,9vw,56px);line-height:1.14;letter-spacing:-.025em;color:#fff}
/* 다크 배경 — .em을 밝은 accent로 override (전역 accent-d는 다크에서 대비 부족) */
.fdpg-title .em{color:var(--accent)}
.fdpg-sub{margin-top:10px;font-family:var(--font-body);font-size:clamp(14px,3.6vw,17px);font-weight:500;color:rgba(255,255,255,.72);line-height:1.55}
.fdpg-sub .em{color:var(--accent);font-weight:700}
/* ── 2-col 그리드 ── */
.fdpg-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
/* ── 카드 ── */
.fdpg-card{position:relative;border-radius:calc(var(--r-scale,1)*16px);overflow:hidden;background:#1a1a1a;aspect-ratio:3/4;display:flex;flex-direction:column}
/* 이미지 풀채움 */
.fdpg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}
.fdpg-img.ph{position:absolute;inset:0;width:100%;height:100%;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));border:2px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:rgba(255,255,255,.35);font-size:12px;display:flex;align-items:center;justify-content:center}
/* 카드 위 그라데이션 오버레이 — 배지와 CTA 가독성 */
.fdpg-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,.0) 38%,rgba(0,0,0,.0) 62%,rgba(0,0,0,.52) 100%);border-radius:calc(var(--r-scale,1)*16px);z-index:1}
/* ── 카드 내부 레이아웃 ── */
.fdpg-top{position:relative;z-index:2;padding:10px 10px 0;display:flex;flex-wrap:wrap;gap:5px}
.fdpg-bottom{position:relative;z-index:2;margin-top:auto;padding:0 10px 10px;display:flex;align-items:center}
/* ── pill 배지 ── */
.fdpg-pill{display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.03em;line-height:1.5;white-space:nowrap}
/* 카테고리 pill — 반투명 흰 */
.fdpg-pill-cat{background:rgba(255,255,255,.22);color:#fff;border:1px solid rgba(255,255,255,.30);backdrop-filter:blur(4px)}
/* 세일 pill — accent */
.fdpg-pill-sale{background:var(--accent);color:#fff;border:1px solid transparent}
/* ── ▶ NEXT CTA ── */
.fdpg-cta{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;letter-spacing:.06em;color:#fff;text-transform:uppercase;cursor:pointer;line-height:1}
.fdpg-cta-arrow{display:inline-block;width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:7px solid var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.items
      .map((it) => {
        const cta = esc(it.ctaText ?? 'NEXT')
        const imgEl = it.image
          ? `<img class="fdpg-img" src="${attr(it.image)}" alt="${attr(it.imageAlt ?? it.saleLabel)}">`
          : `<div class="fdpg-img ph">${esc(it.imageAlt ?? '제품 이미지')}</div>`
        return `
    <div class="fdpg-card">
      ${imgEl}
      <div class="fdpg-overlay"></div>
      <div class="fdpg-top">
        <span class="fdpg-pill fdpg-pill-cat">${esc(it.categoryLabel)}</span>
        <span class="fdpg-pill fdpg-pill-sale">${esc(it.saleLabel)}</span>
      </div>
      <div class="fdpg-bottom">
        <span class="fdpg-cta">
          <span class="fdpg-cta-arrow"></span>
          ${cta}
        </span>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="fdpg">
  <div class="fdpg-hd">
    <h2 class="fdpg-title">${richSafe(d.heading)}</h2>
    ${d.subheading ? `<p class="fdpg-sub">${richSafe(d.subheading)}</p>` : ''}
  </div>
  <div class="fdpg-grid">
    ${cards}
  </div>
</section>`
  },
})
