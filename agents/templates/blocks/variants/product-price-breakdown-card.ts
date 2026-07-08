/** LINEUP 아키타입: product-price-breakdown-card.
 *  [끝판왕] 상품 구성 #10 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처:
 *   ① 상단(흰 배경) — 제품 이미지 플레이스홀더 → 제품명+설명(센터) →
 *      3행 가격 분해 CSS grid(판매가/할인가 danger-red/적립가) + 헤어라인 →
 *      실제 구매 가격 bold 합산.
 *   ② 하단(연회색 배경) — 번호 pill 배지가 달린 흰색 카드들:
 *      첫 번째 혜택 카드 1-wide(전폭), 나머지는 2-column grid. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 제품 이미지 URL (없으면 placeholder) */
  productImage: z.string().optional(),
  /** 제품 이미지 alt */
  productImageAlt: z.string().optional(),
  /** 제품명 (em 허용) */
  productName: z.string().min(1),
  /** 제품 한 줄 설명 */
  productDesc: z.string().optional(),
  /** 가격 분해 행 — 3행 고정이 일반적이나 2~4행도 허용 */
  priceRows: z
    .array(
      z.object({
        /** 행 라벨 (예: 판매가, 할인가, 적립가) */
        label: z.string().min(1),
        /** 표시 금액 문자열 (예: 599,900원, - 159,900원, + 59,900원) */
        amount: z.string().min(1),
        /** danger(빨간 강조), positive(녹색/파랑), neutral(기본) */
        tone: z.enum(['danger', 'positive', 'neutral']).optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 합산 라벨 (기본 "실제 구매 가격") */
  totalLabel: z.string().optional(),
  /** 합산 금액 문자열 */
  totalAmount: z.string().min(1),
  /** 혜택 카드 목록 (2~6개). 첫 번째는 전폭, 나머지는 2열 그리드. */
  benefits: z
    .array(
      z.object({
        /** 혜택 번호 pill 텍스트 (예: 혜택 1번) */
        badgeLabel: z.string().min(1),
        /** 혜택 제목 (em, br 허용) */
        heading: z.string().min(1),
        /** 혜택 상세 설명 (선택) */
        desc: z.string().optional(),
        /** 혜택 대표 이미지 (선택) */
        image: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
})

type Data = z.infer<typeof schema>

export const productPriceBreakdownCard = defineBlock<Data>({
  id: 'product-price-breakdown-card',
  archetype: 'lineup',
  styleTags: ['commerce', 'price', 'benefit', 'card', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성(가격 분해+혜택 카드). 상단: 제품 이미지→제품명/설명(센터)→판매가/할인가(danger)/적립가 3행 CSS grid+헤어라인→실제구매가격 bold 합산. 하단 연회색 배경: 번호 pill 배지 흰 카드(첫째 전폭, 나머지 2열). 상품 구성·패키지 가격 설명에 적합.',
  schema,
  css: `
/* product-price-breakdown-card — 접두사 ppbc- */
.ppbc{word-break:keep-all;overflow-wrap:break-word}

/* ── 상단 영역 (흰 배경) ─────────────────────────────── */
.ppbc-top{background:var(--paper);padding:28px 24px 32px}

/* 제품 이미지 */
.ppbc-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));margin-bottom:24px}
.ppbc-img.ph{width:100%;aspect-ratio:4/3;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));margin-bottom:24px}

/* 제품명 + 설명 (센터 정렬) */
.ppbc-name-wrap{text-align:center;margin-bottom:24px}
.ppbc-name{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,4.8vw,26px);color:var(--ink);line-height:1.3;letter-spacing:-.01em}
.ppbc-name .em{color:var(--accent-d)}
.ppbc-desc{margin-top:6px;font-family:var(--font-body);font-size:14px;color:var(--muted);line-height:1.6}

/* 가격 분해 테이블 */
.ppbc-price-table{display:grid;grid-template-columns:auto 1fr;row-gap:0;margin-bottom:0}
.ppbc-price-row{display:contents}
.ppbc-price-label{font-family:var(--font-body);font-weight:700;font-size:16px;color:var(--ink);padding:9px 0;white-space:nowrap}
.ppbc-price-amount{font-family:var(--font-body);font-size:16px;color:var(--ink);padding:9px 0;text-align:right}
/* tone 변형 */
.ppbc-price-label.danger{color:#E0321C}
.ppbc-price-amount.danger{color:#E0321C;font-weight:700}
.ppbc-price-label.positive{color:#1a7a4a}
.ppbc-price-amount.positive{color:#1a7a4a}

/* 헤어라인 */
.ppbc-divider{border:none;border-top:1px solid var(--line);margin:12px 0}

/* 실제 구매 가격 합산 */
.ppbc-total-row{display:grid;grid-template-columns:auto 1fr;align-items:baseline;padding:4px 0}
.ppbc-total-label{font-family:var(--font-body);font-weight:700;font-size:17px;color:var(--ink)}
.ppbc-total-amount{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,28px);color:var(--ink);text-align:right;letter-spacing:-.01em}

/* ── 하단 영역 (연회색 배경) ─────────────────────────── */
.ppbc-bottom{background:var(--bg);padding:28px 20px 36px;display:flex;flex-direction:column;gap:16px}

/* 혜택 카드 공통 */
.ppbc-card{position:relative;background:var(--paper);border-radius:calc(var(--r-scale,1)*10px);padding:36px 20px 28px;box-shadow:0 2px 12px -4px rgba(0,0,0,.10);overflow:visible}

/* pill 배지 — 카드 상단 가운데 오버행 */
.ppbc-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--brand);color:#fff;font-family:var(--font-body);font-weight:700;font-size:12px;padding:4px 14px;border-radius:999px;white-space:nowrap;letter-spacing:.04em}

/* 카드 텍스트 (센터) */
.ppbc-card-text{text-align:center}
.ppbc-card-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(16px,3.8vw,20px);color:var(--ink);line-height:1.4;margin-bottom:6px}
.ppbc-card-heading .em{color:var(--accent-d)}
.ppbc-card-desc{font-family:var(--font-body);font-size:14px;color:var(--muted);line-height:1.65}

/* 카드 이미지 (선택) */
.ppbc-card-img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px));margin-bottom:16px}
.ppbc-card-img.ph{width:100%;aspect-ratio:16/9;border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px));margin-bottom:16px}

/* 2열 그리드 래퍼 */
.ppbc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
/* 2열 카드는 패딩 약간 줄임 */
.ppbc-grid .ppbc-card{padding:36px 14px 22px}
.ppbc-grid .ppbc-card-heading{font-size:clamp(14px,3.4vw,17px)}
.ppbc-grid .ppbc-card-img{aspect-ratio:1/1}
`,
  render: (d, { esc, richSafe }) => {
    /* ── 가격 분해 행 ── */
    const priceRows = d.priceRows
      .map((r) => {
        const tone = r.tone ?? 'neutral'
        return `
        <div class="ppbc-price-row">
          <span class="ppbc-price-label${tone !== 'neutral' ? ` ${esc(tone)}` : ''}">${esc(r.label)}</span>
          <span class="ppbc-price-amount${tone !== 'neutral' ? ` ${esc(tone)}` : ''}">${esc(r.amount)}</span>
        </div>`
      })
      .join('')

    /* ── 혜택 카드 렌더 헬퍼 ── */
    const renderCard = (b: (typeof d.benefits)[number], isWide: boolean): string => {
      const imgClass = isWide ? 'ppbc-card-img' : 'ppbc-card-img'
      return `
      <div class="ppbc-card">
        <span class="ppbc-badge">${esc(b.badgeLabel)}</span>
        ${b.image ? media(b.image, imgClass, esc(b.heading)) : ''}
        <div class="ppbc-card-text">
          <div class="ppbc-card-heading">${richSafe(b.heading)}</div>
          ${b.desc ? `<div class="ppbc-card-desc">${esc(b.desc)}</div>` : ''}
        </div>
      </div>`
    }

    /* ── 혜택 카드 레이아웃:
         첫 번째 → 전폭(단독),
         나머지 → 짝수만큼 2열 그리드, 홀수 나머지는 전폭 단독 추가 ── */
    const [first, ...rest] = d.benefits
    const firstCard = first ? renderCard(first, true) : ''

    let restHtml = ''
    if (rest.length > 0) {
      // 2개씩 짝지어 grid row 생성; 홀수 나머지는 전폭 단독
      const pairs: string[] = []
      for (let i = 0; i < rest.length; i += 2) {
        if (i + 1 < rest.length) {
          pairs.push(
            `<div class="ppbc-grid">${renderCard(rest[i], false)}${renderCard(rest[i + 1], false)}</div>`,
          )
        } else {
          // 홀수 마지막 — 전폭
          pairs.push(renderCard(rest[i], true))
        }
      }
      restHtml = pairs.join('')
    }

    return `
<section class="ppbc">
  <!-- 상단: 가격 분해 영역 -->
  <div class="ppbc-top">
    ${media(d.productImage, 'ppbc-img', esc(d.productImageAlt ?? '제품 사진 기입'))}
    <div class="ppbc-name-wrap">
      <h2 class="ppbc-name">${richSafe(d.productName)}</h2>
      ${d.productDesc ? `<p class="ppbc-desc">${esc(d.productDesc)}</p>` : ''}
    </div>
    <div class="ppbc-price-table">
      ${priceRows}
    </div>
    <hr class="ppbc-divider">
    <div class="ppbc-total-row">
      <span class="ppbc-total-label">${esc(d.totalLabel ?? '실제 구매 가격')}</span>
      <span class="ppbc-total-amount">${esc(d.totalAmount)}</span>
    </div>
  </div>
  <!-- 하단: 혜택 카드 영역 -->
  <div class="ppbc-bottom">
    ${firstCard}
    ${restHtml}
  </div>
</section>`
  },
})
