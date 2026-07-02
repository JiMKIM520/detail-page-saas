/** COMPARE 아키타입: compare-product-spec-matrix.
 *  [끝판왕] 추천·B&A #16 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 제품 이미지 열헤더(N제품) + 속성(특징/사용감/제형/추천 등) 풀폭 띠행 +
 *  각 제품별 셀 텍스트 — N제품 × M속성 스펙 매트릭스.
 *  브랜드 자사(첫 번째) 강조 컬럼 vs 경쟁사 중립 컬럼. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 eyebrow 라벨 (선택) */
  eyebrow: z.string().optional(),
  /** 대제목 (em, br 허용) */
  title: z.string().min(1),
  /** 비교 제품 목록 (2~4개). 첫 번째가 자사 강조 컬럼. */
  products: z
    .array(
      z.object({
        /** 제품명 */
        name: z.string().min(1),
        /** 제품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 자사 제품 여부 — true면 accent 강조 컬럼 */
        highlight: z.boolean().optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 속성 행 목록 (2~6개). 각 행은 라벨 + 제품별 설명 배열 */
  attributes: z
    .array(
      z.object({
        /** 속성 라벨 (예: "피부결 케어", "사용감", "제형", "추천") */
        label: z.string().min(1),
        /** 제품별 설명 (products 순서 일치, em 허용, 해시태그 포함 가능) */
        cells: z.array(z.string().min(1)).min(2).max(4),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const compareProductSpecMatrix = defineBlock<Data>({
  id: 'compare-product-spec-matrix',
  archetype: 'compare',
  styleTags: ['light', 'comparison', 'matrix', 'table', 'spec', 'template'],
  imageSlots: 3,
  describe:
    '제품 스펙 매트릭스 비교. 제품 이미지 열헤더(2~4개) + 속성(특징/사용감/제형/추천 등) 풀폭 띠행 + 셀 텍스트(해시태그 포함 가능). 자사 첫 컬럼 accent 강조, 경쟁사 중립 회색. 뷰티/스킨케어 제품 라인업 비교에 최적.',
  schema,
  css: `
/* compare-product-spec-matrix — 접두사 cpsm- */

/* 라이트 배경 */
.cpsm{
  background:var(--bg);
  padding:52px 32px 60px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 헤더 텍스트 */
.cpsm-eyebrow{
  text-align:center;
  font-family:var(--font-body);
  font-size:13px;
  font-weight:700;
  letter-spacing:.08em;
  color:var(--accent-d);
  margin-bottom:10px;
  text-transform:uppercase;
}
.cpsm-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,5.5vw,40px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:var(--ink);
  text-align:center;
  margin-bottom:36px;
}
.cpsm-title .em{color:var(--accent-d)}

/* 매트릭스 래퍼 */
.cpsm-table{
  width:100%;
  border-radius:16px;
  overflow:hidden;
  border:1.5px solid var(--line);
  background:var(--paper);
}

/* 열헤더 행 — 제품 이미지 + 이름 */
.cpsm-header-row{
  display:grid;
  /* JS에서 grid-template-columns 인라인으로 주입 */
  background:var(--paper);
}

/* 빈 좌측 라벨 셀 */
.cpsm-header-row .cpsm-label-ph{
  background:var(--bg);
  border-right:1.5px solid var(--line);
  border-bottom:1.5px solid var(--line);
}

/* 각 제품 헤더 셀 */
.cpsm-prod-hd{
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:20px 12px 16px;
  border-bottom:1.5px solid var(--line);
  background:var(--paper);
  gap:10px;
}
.cpsm-prod-hd + .cpsm-prod-hd{
  border-left:1.5px solid var(--line);
}

/* 자사 강조 컬럼 헤더 */
.cpsm-prod-hd.hl{
  background:var(--accent);
}

/* 제품 이미지 */
.cpsm-prod-img{
  width:72px;
  height:96px;
  object-fit:contain;
  display:block;
  border-radius:6px;
}
.cpsm-prod-img.ph{
  width:72px;
  height:96px;
  border-radius:6px;
  border:1.5px dashed var(--line);
  background:rgba(0,0,0,.04);
  color:var(--muted);
  font-size:11px;
  display:flex;
  align-items:center;
  justify-content:center;
}

/* 자사 강조 컬럼 — 이미지 placeholder 배경 조정 */
.cpsm-prod-hd.hl .cpsm-prod-img.ph{
  background:rgba(255,255,255,.25);
  border-color:rgba(255,255,255,.4);
  color:rgba(255,255,255,.7);
}

/* 제품명 레이블 */
.cpsm-prod-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  line-height:1.35;
  letter-spacing:-.01em;
  text-align:center;
  color:var(--ink);
}
.cpsm-prod-hd.hl .cpsm-prod-name{
  color:#fff;
}

/* 속성 띠행(라벨) */
.cpsm-attr-band{
  display:grid;
  /* grid-template-columns 인라인 주입 */
  border-top:1.5px solid var(--line);
}
.cpsm-attr-band:first-of-type{
  border-top:none;
}

/* 속성 라벨 띠 */
.cpsm-attr-label{
  background:var(--ink);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:14px;
  letter-spacing:.01em;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:14px 10px;
  border-right:1.5px solid var(--line);
  line-height:1.4;
}

/* 각 제품 속성 셀 */
.cpsm-attr-cell{
  padding:16px 14px;
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.7;
  color:var(--muted);
  text-align:center;
  background:var(--paper);
  border-left:1.5px solid var(--line);
}
.cpsm-attr-cell:first-of-type{
  border-left:none;
}
.cpsm-attr-cell .em{color:var(--accent-d);font-weight:700}

/* 자사 강조 컬럼 셀 */
.cpsm-attr-cell.hl{
  background:#f0f5ff;
  color:var(--ink);
  font-weight:600;
}
/* 다크 배경 대응: .em override는 필요 없음(라이트 전용 블록) */

/* 해시태그 스타일 행들 */
.cpsm-attr-cell .tag{
  display:inline-block;
  color:var(--muted);
  font-size:12px;
  line-height:1.6;
}
.cpsm-attr-cell.hl .tag{
  color:var(--ink);
}
`,
  render: (d, { esc, richSafe }) => {
    const n = d.products.length
    // 첫 열: 속성 라벨 (좁게), 나머지: 제품 컬럼 (균등)
    const colDef = `80px repeat(${n}, 1fr)`

    // 열헤더 행
    const prodHeaders = d.products
      .map((p) => {
        const hlClass = p.highlight ? ' hl' : ''
        const imgHtml = p.image
          ? `<img class="cpsm-prod-img" src="${esc(p.image)}" alt="${esc(p.imageAlt ?? p.name)}">`
          : `<div class="cpsm-prod-img ph">${esc(p.name)}</div>`
        return `<div class="cpsm-prod-hd${hlClass}">
        ${imgHtml}
        <span class="cpsm-prod-name">${esc(p.name)}</span>
      </div>`
      })
      .join('')

    // 속성 띠행들
    const attrBands = d.attributes
      .map((attr) => {
        const cells = attr.cells
          .map((cell, ci) => {
            const hlClass = d.products[ci]?.highlight ? ' hl' : ''
            return `<div class="cpsm-attr-cell${hlClass}">${richSafe(cell)}</div>`
          })
          .join('')
        return `<div class="cpsm-attr-band" style="grid-template-columns:${colDef}">
        <div class="cpsm-attr-label">${esc(attr.label)}</div>
        ${cells}
      </div>`
      })
      .join('')

    return `
<section class="cpsm">
  ${d.eyebrow ? `<p class="cpsm-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  <h2 class="cpsm-title">${richSafe(d.title)}</h2>
  <div class="cpsm-table">
    <div class="cpsm-header-row" style="grid-template-columns:${colDef}">
      <div class="cpsm-label-ph"></div>
      ${prodHeaders}
    </div>
    ${attrBands}
  </div>
</section>`
  },
})
