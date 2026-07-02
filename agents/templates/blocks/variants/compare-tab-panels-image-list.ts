/** COMPARE 아키타입: compare-tab-panels-image-list.
 *  [끝판왕] 추천·B&A #12 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 중앙 헤드라인(accent 강조 + 수직 구분선) + 서브 eyebrow·제품명
 *  + 탭형 2열 헤더(회색 타사 vs accent 자사) + 각 열 이미지 + 항목 목록(hr 구분).
 *  라이트 배경(--bg/--paper), 타사=중립 회색, 자사=accent 포인트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 대제목 (em으로 accent 강조 가능, br 허용) */
  title: z.string().min(1),
  /** 제품 eyebrow 라벨 (예: "제품에 대한 부연 설명") */
  eyebrow: z.string().min(1).optional(),
  /** 제품 이름 또는 서브 헤드라인 (em 허용) */
  productName: z.string().min(1).optional(),
  /** 타사(패자) 탭 라벨 — 기본 "타사 제품" */
  rivalLabel: z.string().min(1).optional(),
  /** 자사(승자) 탭 라벨 — 기본 "자사 제품" */
  ownLabel: z.string().min(1).optional(),
  /** 타사 이미지 URL */
  rivalImage: z.string().optional(),
  /** 자사 이미지 URL */
  ownImage: z.string().optional(),
  /** 타사 항목 목록 (단점·한계 등, em 허용, 2~6개) */
  rivalItems: z.array(z.string().min(1)).min(2).max(6),
  /** 자사 항목 목록 (장점·특장점 등, em 허용, 2~6개, rivalItems와 같은 수 권장) */
  ownItems: z.array(z.string().min(1)).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const compareTabPanelsImageList = defineBlock<Data>({
  id: 'compare-tab-panels-image-list',
  archetype: 'compare',
  styleTags: ['light', 'comparison', 'tab', 'template', 'competitor'],
  imageSlots: 2,
  describe:
    '탭형 2열 비교(타사 vs 자사). 라이트 배경 + 중앙 헤드라인(수직 구분선 데코) + eyebrow·제품명 서브 + 회색 타사탭/accent 자사탭 헤더 + 각 열 이미지 + 항목 목록(hr 구분). 타사 단점 vs 자사 장점 대조.',
  schema,
  css: `
/* compare-tab-panels-image-list — 접두사 ctpil- */

/* 라이트 배경 블록: --bg/--paper, 본문 --ink, 보조 --muted */
.ctpil{
  background:var(--bg);
  padding:56px 28px 64px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* ── 헤드라인 영역 ── */
.ctpil-hd{
  text-align:center;
  margin-bottom:32px;
}
.ctpil-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,6vw,44px);
  line-height:1.22;
  letter-spacing:-.02em;
  color:var(--ink);
}
/* 라이트 배경: em → --accent-d (충분한 명도 대비) */
.ctpil-title .em{
  background:var(--accent);
  color:#fff;
  padding:0 6px 2px;
  border-radius:4px;
  display:inline;
}

/* 수직 구분선 데코 (헤드라인 하단) */
.ctpil-div{
  width:1px;
  height:56px;
  background:var(--line);
  margin:20px auto 0;
}

/* ── 서브 제품명 영역 ── */
.ctpil-sub{
  text-align:center;
  margin-bottom:32px;
}
.ctpil-eyebrow{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  letter-spacing:.04em;
  color:var(--muted);
  margin-bottom:6px;
}
.ctpil-product{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(22px,4.5vw,32px);
  line-height:1.28;
  letter-spacing:-.015em;
  color:var(--ink);
}
.ctpil-product .em{color:var(--accent-d)}

/* ── 2열 비교 패널 ── */
.ctpil-cols{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}
.ctpil-col{
  background:var(--paper);
  border-radius:14px;
  overflow:hidden;
  box-shadow:0 8px 24px -12px rgba(0,0,0,.18);
}

/* 탭 헤더 */
.ctpil-tab{
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,2.6vw,18px);
  letter-spacing:.04em;
  padding:14px 8px;
}
/* 타사(패자): 중립 회색 */
.ctpil-tab.rival{
  background:#D6D6D8;
  color:#5A5A62;
}
/* 자사(승자): accent 포인트 */
.ctpil-tab.own{
  background:var(--accent);
  color:#fff;
}

/* 이미지 */
.ctpil-img{
  width:calc(100% - 20px);
  margin:12px 10px 0;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block;
  border-radius:8px;
}
.ctpil-img.ph{
  width:calc(100% - 20px);
  margin:12px 10px 0;
  aspect-ratio:1/1;
  border:2px dashed var(--line);
  background:rgba(0,0,0,.03);
  color:var(--muted);
  font-size:13px;
  border-radius:8px;
}

/* 항목 목록 */
.ctpil-list{
  padding:10px 14px 16px;
}
.ctpil-item{
  font-family:var(--font-body);
  font-size:clamp(12px,2.4vw,15px);
  line-height:1.6;
  text-align:center;
  padding:14px 4px;
  color:var(--ink);
}
/* 타사 항목: muted(회색 흐리게) */
.ctpil-col.rival-col .ctpil-item{
  color:var(--muted);
}
/* 자사 항목: ink 기본, em → accent-d */
.ctpil-col.own-col .ctpil-item{
  color:var(--ink);
  font-weight:600;
}
.ctpil-item .em{color:var(--accent-d)}
.ctpil-col.own-col .ctpil-item .em{color:var(--accent-d)}
.ctpil-item + .ctpil-item{
  border-top:1px solid var(--line);
}
`,
  render: (d, { esc, richSafe }) => {
    const rivalLabel = esc(d.rivalLabel ?? '타사 제품')
    const ownLabel = esc(d.ownLabel ?? '자사 제품')

    const rivalItems = d.rivalItems
      .map((it) => `<div class="ctpil-item">${richSafe(it)}</div>`)
      .join('')

    const ownItems = d.ownItems
      .map((it) => `<div class="ctpil-item">${richSafe(it)}</div>`)
      .join('')

    return `
<section class="ctpil">
  <div class="ctpil-hd">
    <h2 class="ctpil-title">${richSafe(d.title)}</h2>
    <div class="ctpil-div" aria-hidden="true"></div>
  </div>
  ${d.eyebrow || d.productName ? `
  <div class="ctpil-sub">
    ${d.eyebrow ? `<p class="ctpil-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    ${d.productName ? `<p class="ctpil-product">${richSafe(d.productName)}</p>` : ''}
  </div>` : ''}
  <div class="ctpil-cols">
    <div class="ctpil-col rival-col">
      <div class="ctpil-tab rival">${rivalLabel}</div>
      ${media(d.rivalImage, 'ctpil-img', '타사 제품 이미지')}
      <div class="ctpil-list">${rivalItems}</div>
    </div>
    <div class="ctpil-col own-col">
      <div class="ctpil-tab own">${ownLabel}</div>
      ${media(d.ownImage, 'ctpil-img', '자사 제품 이미지')}
      <div class="ctpil-list">${ownItems}</div>
    </div>
  </div>
</section>`
  },
})
