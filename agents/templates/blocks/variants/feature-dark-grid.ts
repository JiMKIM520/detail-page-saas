/** FEATURE 아키타입: feature-dark-grid.
 *  [끝판왕] 추천·B&A #18 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 가격 히어로(eyebrow + 제품명 + 가격 뱃지) + 다크(--ink) 2열 USP 피처 그리드.
 *  아이콘 없이 텍스트 계층(소제목·본문)만 사용. 마지막 아이템은 전폭 강조 가능. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 라이트 히어로: 상단 eyebrow 레이블 (예: "[브랜드명] 공기청정기") */
  eyebrow: z.string().min(1),
  /** 제품명 / 대형 헤드라인 (br 허용) */
  productName: z.string().min(1),
  /** 가격 텍스트 (예: "1,190,000원") */
  price: z.string().min(1),
  /** 가격 아래 보조 텍스트 (선택, 예: "특별 할인가 적용") */
  priceSub: z.string().optional(),
  /** 다크 그리드 상단 섹션 제목 (선택, em 허용) */
  gridTitle: z.string().optional(),
  /** USP 피처 셀 (2~8개; 짝수면 균등 2열, 홀수 마지막은 full-span) */
  items: z
    .array(
      z.object({
        /** 셀 소제목 (em 허용, br 허용) */
        heading: z.string().min(1),
        /** 셀 본문 (선택, em 허용) */
        body: z.string().optional(),
        /** true면 강제 full-span (기본: 홀수 마지막만 자동 full-span) */
        fullSpan: z.boolean().optional(),
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const featureDarkGrid = defineBlock<Data>({
  id: 'feature-dark-grid',
  archetype: 'feature',
  styleTags: ['dark', 'grid', 'usp', 'text-only', 'premium', 'template'],
  imageSlots: 0,
  describe:
    'USP 피처 그리드(다크). 라이트 배경 가격 히어로(eyebrow+제품명+가격 뱃지) + 다크(--ink) 2열 텍스트 전용 USP 피처 그리드. 아이콘 없이 소제목·본문 계층만 사용. 마지막 홀수 셀은 전폭 강조. 가전/전자제품 카테고리에 적합.',
  schema,
  css: `
/* feature-dark-grid — 접두사 fdg- */

/* ── 라이트 가격 히어로 ── */
.fdg{background:var(--bg);word-break:keep-all;overflow-wrap:break-word}

.fdg-hero{
  background:var(--paper);
  padding:52px 44px 48px;
  text-align:center;
  border-bottom:1px solid var(--line);
}
.fdg-eyebrow{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  letter-spacing:.06em;
  color:var(--muted);
  margin-bottom:14px;
  text-transform:uppercase;
}
.fdg-product{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,6.5vw,46px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:28px;
}
/* 라이트 배경 — .em은 --accent-d(저대비 방지) */
.fdg-product .em{color:var(--accent-d)}

.fdg-price-wrap{
  display:inline-block;
  background:var(--ink);
  color:#fff;
  border-radius:calc(var(--r-scale,1)*12px);
  padding:14px 36px 16px;
}
.fdg-price{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(24px,5vw,36px);
  letter-spacing:-.02em;
  line-height:1.1;
}
/* 가격 뱃지 안은 다크 배경 — accent(밝은 색) 사용 가능 */
.fdg-price .em{color:var(--accent)}

.fdg-price-sub{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:500;
  color:rgba(255,255,255,.6);
  margin-top:6px;
  letter-spacing:.01em;
}

/* ── 다크 USP 피처 그리드 ── */
.fdg-grid-wrap{
  background:var(--ink);
  padding:40px 20px 40px;
}
.fdg-grid-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(19px,4vw,26px);
  line-height:1.35;
  letter-spacing:-.015em;
  color:#fff;
  text-align:center;
  margin-bottom:28px;
  padding:0 12px;
}
/* 다크 배경 — .em은 --accent(밝은 포인트) */
.fdg-grid-title .em{color:var(--accent)}

.fdg-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:2px;
}

.fdg-cell{
  background:rgba(255,255,255,.05);
  padding:26px 22px 24px;
  position:relative;
}
.fdg-cell.fdg-full{
  grid-column:1/-1;
  background:rgba(255,255,255,.09);
}

.fdg-cell-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(15px,3.2vw,18px);
  line-height:1.45;
  letter-spacing:-.01em;
  color:#fff;
  margin-bottom:8px;
}
/* 다크 배경 — .em을 --accent override */
.fdg-cell-heading .em{color:var(--accent)}

.fdg-cell-body{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.75;
  color:rgba(255,255,255,.55);
  letter-spacing:-.005em;
}
.fdg-cell-body .em{color:var(--accent);font-weight:700}

/* 전폭 셀은 좌우 패딩 더 넉넉 + 소제목 약간 크게 */
.fdg-full .fdg-cell-heading{
  font-size:clamp(16px,3.6vw,20px);
}
.fdg-full .fdg-cell-body{
  font-size:14px;
}
`,
  render: (d, { esc, richSafe }) => {
    const lastIdx = d.items.length - 1
    const isOddCount = d.items.length % 2 !== 0

    const cells = d.items
      .map((it, i) => {
        const autoFull = isOddCount && i === lastIdx
        const isFull = it.fullSpan === true || autoFull
        return `
    <div class="fdg-cell${isFull ? ' fdg-full' : ''}">
      <p class="fdg-cell-heading">${richSafe(it.heading)}</p>
      ${it.body ? `<p class="fdg-cell-body">${richSafe(it.body)}</p>` : ''}
    </div>`
      })
      .join('')

    return `
<section class="fdg">
  <div class="fdg-hero">
    <p class="fdg-eyebrow">${esc(d.eyebrow)}</p>
    <h2 class="fdg-product">${richSafe(d.productName)}</h2>
    <div class="fdg-price-wrap">
      <p class="fdg-price">${esc(d.price)}</p>
      ${d.priceSub ? `<p class="fdg-price-sub">${esc(d.priceSub)}</p>` : ''}
    </div>
  </div>
  <div class="fdg-grid-wrap">
    ${d.gridTitle ? `<h3 class="fdg-grid-title">${richSafe(d.gridTitle)}</h3>` : ''}
    <div class="fdg-grid">${cells}
    </div>
  </div>
</section>`
  },
})
