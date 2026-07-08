/** COMPARE 아키타입: compare-price-bar-chart.
 *  [끝판왕] 추천·B&A #6 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크네이비(--brand) 배경 + "Check Point" pill badge + 절감률 헤드라인
 *  → 라이트 카드 내 세로 바차트 2개(타사 vs 자사 단가) + 절약액 하이라이트 chip.
 *  CSS height %로 막대 높이 근사, 자사 막대에 제품 이미지 오버레이 허용. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 배지 텍스트 (기본 "Check Point") */
  badge: z.string().min(1).optional(),
  /** 절감 헤드라인 (em, br 허용 — 예: "타사 제품 대비<br><span class=\"em\">약 45%</span>의 비용을 절약할 수 있어요") */
  title: z.string().min(1),
  /** 제목 하단 보조 설명 (1~2줄, em 허용) */
  body: z.string().optional(),
  /** 타사 단가 표시 (예: "150원") */
  competitorPrice: z.string().min(1),
  /** 타사 단가 서브라벨 (예: "1회 평균") */
  competitorPriceLabel: z.string().min(1).optional(),
  /** 타사 막대 하단 레이블 (예: "[타사 제품]") */
  competitorLabel: z.string().min(1).optional(),
  /** 자사 단가 표시 (예: "100원") */
  ourPrice: z.string().min(1),
  /** 자사 단가 서브라벨 (예: "1회 평균") */
  ourPriceLabel: z.string().min(1).optional(),
  /** 자사 막대 하단 레이블 (예: "[자사 제품]") */
  ourLabel: z.string().min(1).optional(),
  /** 자사 막대 안 제품 이미지 URL (선택) */
  ourImage: z.string().optional(),
  /** 자사 이미지 alt */
  ourImageAlt: z.string().optional(),
  /** 타사 대비 자사 막대 높이 비율 0~1 (예: 0.67 ≈ 100/150). 기본 0.67 */
  ourBarRatio: z.number().min(0.2).max(0.95).optional(),
  /** 절약액 하이라이트 chip (예: "100회 사용 시 12,000원 절약") */
  savingsChip: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const comparePriceBarChart = defineBlock<Data>({
  id: 'compare-price-bar-chart',
  archetype: 'compare',
  styleTags: ['dark', 'compare', 'price', 'chart', 'savings', 'template'],
  imageSlots: 1,
  describe:
    '가격 비교 바차트. 다크 배경 + Check Point 배지 + 절감률 헤드라인 → 라이트 카드 내 타사/자사 세로 바차트 2개(CSS 높이% 근사) + 절약액 chip. 커머스 단가 절약 어필에 특화.',
  schema,
  css: `
/* compare-price-bar-chart — 접두사 cpbc- */

/* ── 외부 래퍼: 다크 네이비 배경 ── */
.cpbc{
  background:var(--brand);
  padding:52px 36px 56px;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* ── Check Point 배지 ── */
.cpbc-badge{
  display:inline-block;
  border:1.5px solid rgba(255,255,255,.55);
  border-radius:999px;
  padding:7px 20px;
  font-family:var(--font-body);
  font-size:14px;
  font-weight:500;
  letter-spacing:.04em;
  color:rgba(255,255,255,.9);
  margin-bottom:28px;
}

/* ── 절감 헤드라인 ── */
.cpbc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,5.8vw,38px);
  line-height:1.35;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:16px;
}
/* 다크 배경 — .em을 밝은 accent로 override */
.cpbc-title .em{color:var(--accent)}

/* ── 보조 본문 ── */
.cpbc-body{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.75;
  color:rgba(255,255,255,.65);
  margin-bottom:36px;
}
.cpbc-body .em{color:var(--accent);font-weight:700}

/* ── 차트 카드 ── */
.cpbc-card{
  background:rgba(255,255,255,.13);
  border-radius:calc(var(--r-scale,1)*16px);
  padding:28px 24px 20px;
}

/* 절약액 chip (카드 상단) */
.cpbc-chip{
  display:inline-flex;
  align-items:center;
  gap:4px;
  margin-bottom:28px;
  font-family:var(--font-body);
  font-size:15px;
  font-weight:400;
  color:rgba(255,255,255,.9);
}
.cpbc-chip-hl{
  display:inline-block;
  background:var(--ink);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:15px;
  padding:3px 10px;
  border-radius:calc(var(--r-scale,1)*4px);
  letter-spacing:-.01em;
}

/* ── 2단 바차트 그리드 ── */
.cpbc-bars{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
  align-items:end;
  /* 기준선 에뮬레이션: 그리드 높이 고정 */
  height:220px;
}

/* 개별 바 컬럼 */
.cpbc-col{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-end;
  height:100%;
}

/* 단가 수치 */
.cpbc-price{
  font-family:var(--font-display);
  font-weight:400;
  font-size:17px;
  color:rgba(255,255,255,.85);
  margin-bottom:4px;
  line-height:1.2;
}
.cpbc-col--ours .cpbc-price{
  font-weight:800;
  font-size:20px;
  color:#fff;
}

/* 단가 서브라벨 박스 */
.cpbc-price-label{
  display:inline-block;
  border:1px solid rgba(255,255,255,.4);
  border-radius:calc(var(--r-scale,1)*4px);
  padding:2px 8px;
  font-family:var(--font-body);
  font-size:12px;
  color:rgba(255,255,255,.75);
  margin-bottom:10px;
}

/* 막대 본체 */
.cpbc-bar{
  width:100%;
  border-radius:calc(var(--r-scale,1)*6px) calc(var(--r-scale,1)*6px) 0 0;
  background:rgba(200,200,220,.35);
  position:relative;
  overflow:hidden;
  /* 높이는 인라인 style로 주입 */
}
/* 자사 막대: accent 강조 */
.cpbc-col--ours .cpbc-bar{
  background:var(--accent);
  opacity:.82;
}

/* 막대 안 이미지 오버레이 */
.cpbc-bar-img{
  width:100%;
  height:100%;
  object-fit:cover;
  position:absolute;
  inset:0;
  mix-blend-mode:multiply;
  opacity:.55;
}
/* placeholder일 때 */
.cpbc-bar-img.ph{
  display:flex;
  align-items:center;
  justify-content:center;
  background:transparent;
  border:none;
  font-size:12px;
  color:rgba(255,255,255,.5);
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
}

/* 기준선 */
.cpbc-baseline{
  width:calc(100% + 48px);
  margin-left:-24px;
  height:1px;
  background:rgba(255,255,255,.3);
  margin-top:0;
}

/* 막대 하단 레이블 */
.cpbc-axis{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
  margin-top:10px;
}
.cpbc-axis-label{
  text-align:center;
  font-family:var(--font-body);
  font-size:13px;
  color:rgba(255,255,255,.6);
}
.cpbc-axis-label--ours{
  font-weight:800;
  color:#fff;
}
`,
  render: (d, { esc, richSafe }) => {
    const badge = esc(d.badge ?? 'Check Point')
    const competitorLabel = esc(d.competitorLabel ?? '[타사 제품]')
    const ourLabel = esc(d.ourLabel ?? '[자사 제품]')
    const competitorPriceLabel = d.competitorPriceLabel ? esc(d.competitorPriceLabel) : null
    const ourPriceLabel = d.ourPriceLabel ? esc(d.ourPriceLabel) : null

    // 막대 높이: 타사 = 100%, 자사 = ourBarRatio * 100%
    const ratio = d.ourBarRatio ?? 0.67
    const competitorBarH = 160 // px (기준)
    const ourBarH = Math.round(competitorBarH * ratio)

    // 절약액 chip
    const chipHtml = d.savingsChip
      ? (() => {
          // "N회 사용 시 M원 절약" 패턴에서 금액 부분만 .cpbc-chip-hl 처리 (단순 분할)
          const raw = esc(d.savingsChip)
          // "시 " 기준으로 앞/뒤 분할 시도
          const idx = raw.indexOf('시 ')
          if (idx !== -1) {
            const prefix = raw.slice(0, idx + 2)
            const rest = raw.slice(idx + 2)
            return `<div class="cpbc-chip">${prefix}<span class="cpbc-chip-hl">${rest}</span></div>`
          }
          return `<div class="cpbc-chip"><span class="cpbc-chip-hl">${raw}</span></div>`
        })()
      : ''

    // 자사 막대 이미지 (있으면 절대 오버레이 img, 없으면 텍스트 placeholder)
    const ourImageHtml = media(d.ourImage, 'cpbc-bar-img', esc(d.ourImageAlt ?? '자사 제품 이미지'))

    return `
<section class="cpbc">
  <div class="cpbc-badge">${badge}</div>

  <h2 class="cpbc-title">${richSafe(d.title)}</h2>
  ${d.body ? `<p class="cpbc-body">${richSafe(d.body)}</p>` : ''}

  <div class="cpbc-card">
    ${chipHtml}

    <div class="cpbc-bars">
      <!-- 타사 막대 -->
      <div class="cpbc-col cpbc-col--competitor">
        <p class="cpbc-price">${esc(d.competitorPrice)}</p>
        ${competitorPriceLabel ? `<span class="cpbc-price-label">${competitorPriceLabel}</span>` : ''}
        <div class="cpbc-bar" style="height:${competitorBarH}px"></div>
      </div>

      <!-- 자사 막대 -->
      <div class="cpbc-col cpbc-col--ours">
        <p class="cpbc-price">${esc(d.ourPrice)}</p>
        ${ourPriceLabel ? `<span class="cpbc-price-label">${ourPriceLabel}</span>` : ''}
        <div class="cpbc-bar" style="height:${ourBarH}px">
          ${ourImageHtml}
        </div>
      </div>
    </div>

    <div class="cpbc-baseline"></div>

    <div class="cpbc-axis">
      <span class="cpbc-axis-label">${competitorLabel}</span>
      <span class="cpbc-axis-label cpbc-axis-label--ours">${ourLabel}</span>
    </div>
  </div>
</section>`
  },
})
