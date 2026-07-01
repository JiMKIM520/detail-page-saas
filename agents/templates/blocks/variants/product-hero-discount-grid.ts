/** PROMO 아키타입(패턴 재구성): product-hero-discount-grid.
 *  [끝판왕] 상품구성 #21 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이프스타일 히어로(모델 풀폭) + eyebrow 필 라벨 + 대형 이벤트 헤드라인,
 *  이어서 [sky-blue 섹션 헤딩 밴드 + 3열 퍼센트배지-이중가격 카드 그리드] 블록 1~2회 반복. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 개별 상품 카드 슬롯 */
const cardSchema = z.object({
  /** 상단 좌측 할인률 배지 (예: "10%") */
  discountPercent: z.string().min(1),
  /** 상품 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 상품 소제목/설명 (em/br 허용) */
  heading: z.string().min(1),
  /** 정가 (취소선 표시, 예: "22,000원") */
  originalPrice: z.string().optional(),
  /** 할인가 (대형 강조, 예: "17,000원") */
  salePrice: z.string().min(1),
})

/** 섹션 헤딩 밴드 + 3열 카드 그리드 묶음 */
const groupSchema = z.object({
  /** 섹션 헤딩 밴드 텍스트 (em/br 허용) */
  bandHeading: z.string().min(1),
  /** 3열 상품 카드 (정확히 3개) */
  cards: z.array(cardSchema).min(1).max(3),
})

const schema = z.object({
  /** eyebrow 필 라벨 (예: "기간 한정 특가!") */
  eyebrow: z.string().optional(),
  /** 히어로 대형 이벤트 타이틀 (em/br 허용, 예: "<span class=\"em\">여름 세일</span><br>지금 바로!") */
  heroTitle: z.string().min(1),
  /** 히어로 라이프스타일 이미지 URL (모델/분위기컷) */
  heroImage: z.string().optional(),
  /** 히어로 이미지 alt */
  heroImageAlt: z.string().optional(),
  /** 헤딩밴드+카드그리드 반복 그룹 (1~2개) */
  groups: z.array(groupSchema).min(1).max(2),
})
type Data = z.infer<typeof schema>

export const productHeroDiscountGrid = defineBlock<Data>({
  id: 'product-hero-discount-grid',
  archetype: 'promo' as any,
  styleTags: ['commerce', 'discount', 'grid', 'event', 'template'],
  imageSlots: 7,
  describe:
    '상품 구성 이벤트 히어로+할인 그리드. 라이프스타일 히어로 이미지 + eyebrow 필 라벨 + 대형 이벤트 헤드라인, 이어서 [sky-blue 섹션 헤딩 밴드 + 3열 퍼센트배지-이중가격 카드 그리드] 블록 1~2회 반복. 커머스 시즌 이벤트/특가 구성 선언용.',
  schema,
  css: `
/* product-hero-discount-grid — 접두사 phdg- */
.phdg{background:var(--paper);word-break:keep-all;overflow-wrap:break-word}

/* ── 히어로 존 ─────────────────────────────── */
.phdg-hero{position:relative;width:100%;overflow:hidden}
.phdg-hero-img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.phdg-hero-img.ph{width:100%;aspect-ratio:3/4}
.phdg-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 35%,rgba(0,0,0,.55) 100%);pointer-events:none}
.phdg-hero-body{position:absolute;bottom:0;left:0;right:0;padding:28px 28px 36px;text-align:left}
.phdg-eyebrow{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-body);font-size:13px;font-weight:700;letter-spacing:.06em;padding:5px 16px;border-radius:999px;margin-bottom:12px}
.phdg-hero-title{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,7.5vw,52px);line-height:1.16;letter-spacing:-.02em;color:#fff}
.phdg-hero-title .em{color:var(--accent)}

/* ── 섹션 헤딩 밴드 ─────────────────────────── */
.phdg-band{width:100%;padding:18px 20px;background:#DAEEFF;text-align:center}
.phdg-band-text{font-family:var(--font-display);font-weight:700;font-size:clamp(15px,3.5vw,18px);color:var(--ink);line-height:1.45}
.phdg-band-text .em{color:var(--accent-d)}

/* ── 3열 카드 그리드 ────────────────────────── */
.phdg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px 12px 20px;background:var(--paper)}
.phdg-card{position:relative;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px -4px rgba(0,0,0,.18)}

/* 퍼센트 배지 — 좌상단 burst 근사 (사다리꼴 클립) */
.phdg-badge{position:absolute;top:0;left:0;min-width:40px;padding:4px 8px 4px 6px;background:#FF3B30;color:#fff;font-family:var(--font-display);font-weight:800;font-size:clamp(11px,2.2vw,14px);line-height:1.1;border-radius:0 0 8px 0;z-index:2;text-align:center}

/* 카드 이미지 */
.phdg-card-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.phdg-card-img.ph{width:100%;aspect-ratio:1/1}

/* 카드 텍스트 영역 */
.phdg-card-body{padding:8px 10px 12px}
.phdg-card-heading{font-family:var(--font-body);font-weight:600;font-size:clamp(11px,2.2vw,13px);color:var(--ink);line-height:1.45;margin-bottom:6px}
.phdg-card-heading .em{color:var(--accent-d)}

/* 가격 그리드: 정가(취소선) + 할인가(강조) */
.phdg-price-wrap{display:flex;flex-direction:column;gap:2px}
.phdg-price-orig{font-size:clamp(10px,2vw,12px);color:var(--muted);text-decoration:line-through;font-family:var(--font-body)}
.phdg-price-sale{font-family:var(--font-display);font-weight:800;font-size:clamp(14px,3vw,18px);color:#FF3B30;letter-spacing:-.01em;line-height:1.1}
`,
  render: (d, { esc, richSafe }) => {
    const heroImgEl = media(
      d.heroImage,
      'phdg-hero-img',
      esc(d.heroImageAlt ?? '이벤트 히어로 이미지'),
    )

    const eyebrowEl = d.eyebrow
      ? `<span class="phdg-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    const groupsHtml = d.groups
      .map((g) => {
        const cardsHtml = g.cards
          .map((c) => {
            const cardImgEl = media(
              c.image,
              'phdg-card-img',
              esc(c.imageAlt ?? '상품 이미지'),
            )
            const origPriceEl = c.originalPrice
              ? `<span class="phdg-price-orig">${esc(c.originalPrice)}</span>`
              : ''
            return `
    <div class="phdg-card">
      <div class="phdg-badge">${esc(c.discountPercent)}</div>
      ${cardImgEl}
      <div class="phdg-card-body">
        <p class="phdg-card-heading">${richSafe(c.heading)}</p>
        <div class="phdg-price-wrap">
          ${origPriceEl}
          <span class="phdg-price-sale">${esc(c.salePrice)}</span>
        </div>
      </div>
    </div>`
          })
          .join('')

        return `
  <div class="phdg-band">
    <p class="phdg-band-text">${richSafe(g.bandHeading)}</p>
  </div>
  <div class="phdg-grid">
    ${cardsHtml}
  </div>`
      })
      .join('')

    return `
<section class="phdg">
  <div class="phdg-hero">
    ${heroImgEl}
    <div class="phdg-hero-overlay"></div>
    <div class="phdg-hero-body">
      ${eyebrowEl}
      <h2 class="phdg-hero-title">${richSafe(d.heroTitle)}</h2>
    </div>
  </div>
  ${groupsHtml}
</section>`
  },
})
