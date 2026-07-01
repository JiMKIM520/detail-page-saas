/** LINEUP 아키타입: package-numbered-band-rows.
 *  [끝판왕] 상품 구성 #14 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + 섹션 헤드 + 번호 뱃지(01-N) + 한 행에
 *  상품명·설명·취소선가격·강조가격 수평 배치 + 마지막(또는 지정) 행 레드 액센트 처리. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 대제목 (em 허용 — 일부 어절 accent 강조) */
  title: z.string().min(1),
  /** 대제목 아래 서브 상품명 1줄 */
  subtitle: z.string().optional(),
  /** 기간 표시 예: "N월 N일 ~ N월 N일" — 대괄호로 감싸서 렌더 */
  period: z.string().optional(),
  /** 상품 행 (2~6개) */
  items: z
    .array(
      z.object({
        /** 상품명 (굵은 대형 텍스트) */
        name: z.string().min(1),
        /** 한 줄 설명 (소형) */
        desc: z.string().optional(),
        /** 취소선 원가 예: "21만원" */
        originalPrice: z.string().optional(),
        /** 강조 최종가 예: "13만원" */
        price: z.string().min(1),
        /** 이 행에 레드 액센트 강조 적용 여부 (마지막 행 기본값 true) */
        highlight: z.boolean().optional(),
      }),
    )
    .min(2)
    .max(6),
  /** 하단 주석 예: "* 모든 상품은 VAT 별도입니다." */
  footnote: z.string().optional(),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const packageNumberedBandRows = defineBlock<Data>({
  id: 'package-numbered-band-rows',
  archetype: 'lineup' as any,
  styleTags: ['dark', 'premium', 'pricing', 'numbered', 'template'],
  imageSlots: 0,
  describe:
    '상품 구성/패키지 가격표. 다크 배경 + 대제목·서브·기간 헤더 + 번호 뱃지(01-N) 행마다 상품명·설명·취소선가격·강조가격 수평 배치. 마지막(또는 지정) 행 레드 액센트로 시선 앵커. 이미지 불필요.',
  schema,
  css: `
/* package-numbered-band-rows — 접두사 pnbr- */
.pnbr{background:var(--ink);color:#fff;padding:60px 40px 56px;word-break:keep-all}

/* 헤더 */
.pnbr-hd{text-align:center;margin-bottom:40px}
.pnbr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,7vw,52px);line-height:1.18;letter-spacing:-.02em;color:#fff}
.pnbr-title .em{color:var(--accent)}
.pnbr-sub{margin-top:10px;font-family:var(--font-body);font-size:18px;font-weight:500;color:rgba(255,255,255,.72)}
.pnbr-period{display:inline-block;margin-top:14px;font-size:14px;color:rgba(255,255,255,.5);letter-spacing:.02em}

/* 행 리스트 */
.pnbr-list{display:flex;flex-direction:column;gap:10px}

/* 단일 행 밴드 */
.pnbr-row{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:10px;overflow:hidden}
.pnbr-row.pnbr-hl{background:rgba(255,255,255,.08);border-color:rgba(220,40,40,.55)}

/* 상단 뱃지 줄 */
.pnbr-badge-line{display:flex;align-items:center;gap:10px;padding:10px 18px 8px}
.pnbr-badge{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:22px;padding:0 8px;border-radius:4px;font-size:12px;font-weight:800;letter-spacing:.04em;font-family:var(--font-display)}
.pnbr-badge.pnbr-badge-default{background:#fff;color:var(--ink)}
.pnbr-badge.pnbr-badge-accent{background:#DC2828;color:#fff}
.pnbr-badge-label{font-size:13px;color:rgba(255,255,255,.55)}

/* 상품 정보 줄 — CSS grid로 좌측(이름+설명) / 우측(가격) 수평 배치 */
.pnbr-info{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px 16px;padding:0 18px 16px}
.pnbr-name{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,4.5vw,28px);line-height:1.2;color:#fff}
.pnbr-row.pnbr-hl .pnbr-name{color:#fff}
.pnbr-desc{font-size:13px;color:rgba(255,255,255,.45);margin-top:3px;grid-column:1}
.pnbr-prices{display:flex;align-items:baseline;gap:6px;white-space:nowrap;grid-row:1/span 2;grid-column:2;align-self:center}
.pnbr-orig{font-size:13px;color:rgba(255,255,255,.35);text-decoration:line-through}
.pnbr-price{font-family:var(--font-display);font-weight:800;font-size:clamp(18px,4vw,24px);color:rgba(255,255,255,.90)}
.pnbr-row.pnbr-hl .pnbr-price{color:#FF4444}

/* 각주 */
.pnbr-foot{margin-top:22px;text-align:center;font-size:13px;color:rgba(255,255,255,.35)}
`,
  render: (d, { esc, richSafe }) => {
    const lastIdx = d.items.length - 1

    const rows = d.items
      .map((it, i) => {
        // highlight: 명시적 true면 강조, 명시적 false면 비강조, 미지정이면 마지막 행만 강조
        const isHl =
          it.highlight !== undefined ? it.highlight : i === lastIdx

        const badgeCls = isHl ? 'pnbr-badge pnbr-badge-accent' : 'pnbr-badge pnbr-badge-default'
        const rowCls = isHl ? 'pnbr-row pnbr-hl' : 'pnbr-row'

        const origHtml = it.originalPrice
          ? `<span class="pnbr-orig">${esc(it.originalPrice)}</span>`
          : ''

        const descHtml = it.desc
          ? `<div class="pnbr-desc">${esc(it.desc)}</div>`
          : ''

        return `
    <div class="${rowCls}">
      <div class="pnbr-badge-line">
        <span class="${badgeCls}">${esc(pad2(i + 1))}</span>
        <span class="pnbr-badge-label">${esc(it.desc ?? '')}</span>
      </div>
      <div class="pnbr-info">
        <div class="pnbr-name">${esc(it.name)}</div>
        ${it.desc ? `<div class="pnbr-desc" style="visibility:hidden;height:0;margin:0"></div>` : ''}
        <div class="pnbr-prices">
          ${origHtml}
          <span class="pnbr-price">${esc(it.price)}</span>
        </div>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="pnbr">
  <div class="pnbr-hd">
    <h2 class="pnbr-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="pnbr-sub">${esc(d.subtitle)}</p>` : ''}
    ${d.period ? `<span class="pnbr-period">[ ${esc(d.period)} ]</span>` : ''}
  </div>
  <div class="pnbr-list">
    ${rows}
  </div>
  ${d.footnote ? `<p class="pnbr-foot">${esc(d.footnote)}</p>` : ''}
</section>`
  },
})
