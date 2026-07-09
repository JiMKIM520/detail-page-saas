/** COMPARE 아키타입: compare-spec-trio
 *  피그마 130_비교_05 패턴 재구성.
 *  자사·A사·B사 3열 세로 스펙 카드 비교.
 *  각 카드 상단에 제품 이미지 + 브랜드명, 이하 항목 레이블 필 + 값 텍스트가 셀로 쌓인다.
 *  자사 카드는 accent 컬러, 경쟁사 카드는 muted(회색조). 하단 브랜드 철학 문구.
 *  noimg-safe: 이미지 전체 부재 시 이미지 영역 생략, 카드 높이 균일 유지.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const specRowSchema = z.object({
  label: z.string().min(1),  // 항목명 (레이블 필에 표시)
  own: z.string().min(1),    // 자사 값
  a: z.string().min(1),      // A사 값
  b: z.string().min(1),      // B사 값
})

const schema = z.object({
  title: z.string().min(1),          // 섹션 제목 (em/br 허용)
  desc: z.string().optional(),        // 제목 아래 설명 (em/br 허용)
  ownName: z.string().min(1),        // 자사 브랜드명
  aName: z.string().min(1),          // A사명
  bName: z.string().min(1),          // B사명
  ownImage: z.string().optional(),   // 자사 제품 이미지 (url)
  aImage: z.string().optional(),     // A사 제품 이미지 (url)
  bImage: z.string().optional(),     // B사 제품 이미지 (url)
  rows: z.array(specRowSchema).min(2).max(7),  // 스펙 비교 항목
  tagline: z.string().optional(),    // 하단 브랜드 문구 (순수 텍스트)
})

type Data = z.infer<typeof schema>

export const compareSpecTrio = defineBlock<Data>({
  id: 'compare-spec-trio',
  archetype: 'compare',
  styleTags: ['light', 'product', 'spec', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '3열 세로 스펙 비교 카드. 자사(accent 강조)·A사·B사 각 카드에 제품 이미지+브랜드명+항목별 레이블 필+값 셀 수직 나열. 라이트 배경. 하단 브랜드 문구 옵션. 전자제품·생활용품·식품 스펙 비교에 최적.',
  schema,
  css: `
/* ── 섹션 래퍼 ── */
.chbp{background:var(--bg);padding:64px var(--pad-x,56px) 72px}

/* ── 타이틀 블록 ── */
.chbp-hd{margin-bottom:40px}
.chbp-title{font-family:var(--font-display);font-size:44px;font-weight:700;line-height:1.22;color:var(--accent)}
.chbp-title .em{color:var(--ink)}
.chbp-desc{margin-top:16px;font-size:18px;font-weight:500;line-height:1.65;color:var(--ink);max-width:660px}
.chbp-desc .em{color:var(--accent);font-weight:700}

/* ── 3열 그리드 ── */
.chbp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}

/* ── 공통 카드 ── */
.chbp-card{border-radius:calc(var(--r-scale,1)*22px);overflow:hidden;display:flex;flex-direction:column}

/* 자사 카드 (accent) */
.chbp-card--own{background:var(--accent)}
.chbp-card--own .chbp-brand{color:#fff;font-weight:800}
.chbp-card--own .chbp-pill{background:var(--accent-d)}
.chbp-card--own .chbp-pill-text{color:#fff}
.chbp-card--own .chbp-val{color:#fff;font-weight:700}

/* 경쟁사 카드 (muted) */
.chbp-card--rival{background:var(--paper,#e8e8e8)}
.chbp-card--rival .chbp-brand{color:var(--muted);font-weight:600}
.chbp-card--rival .chbp-pill{background:color-mix(in srgb,var(--muted) 55%,transparent)}
.chbp-card--rival .chbp-pill-text{color:var(--paper,#e8e8e8)}
.chbp-card--rival .chbp-val{color:var(--ink-2);font-weight:500}

/* ── 카드 헤더 (브랜드명 + 이미지) ── */
.chbp-card-head{padding:22px 16px 0;text-align:center}
.chbp-brand{font-family:var(--font-display);font-size:26px;letter-spacing:-.01em;line-height:1.1;margin-bottom:14px}

/* 이미지 프레임 */
.chbp-img-wrap{width:var(--shape-photo, calc(var(--r-scale,1)*0px + 100%));/* 전체 폭 사용 */
  /* noimg-safe: media()가 .ph를 반환하면 display:none!important 가 적용돼 높이 0으로 수축 */
}
.chbp-prod{width:100%;height:180px;object-fit:contain;object-position:center bottom;background:transparent}
/* 이미지 없을 때 카드 공간 낭비 방지 — .ph는 baseCss에서 display:none!important */
.chbp-img-wrap .ph{height:0!important;min-height:0!important;padding:0!important}

/* ── 스펙 셀 목록 ── */
.chbp-rows{flex:1;padding:14px 10px 20px;display:flex;flex-direction:column;gap:8px}
.chbp-cell{display:flex;flex-direction:column;align-items:center;gap:6px}

/* 레이블 필 (둥근 배지) */
.chbp-pill{border-radius:999px;padding:5px 18px;display:inline-block;align-self:center}
.chbp-pill-text{font-size:13px;font-weight:700;letter-spacing:.04em;white-space:nowrap}

/* 값 텍스트 */
.chbp-val{font-size:16px;line-height:1.4;text-align:center;word-break:keep-all}

/* ── 구분선 ── */
.chbp-cell+.chbp-cell{border-top:1px solid rgba(255,255,255,.12)}
.chbp-card--rival .chbp-cell+.chbp-cell{border-top-color:rgba(0,0,0,.08)}

/* ── 하단 브랜드 문구 ── */
.chbp-tagline{margin-top:40px;text-align:center;font-size:18px;font-weight:300;line-height:1.65;color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 자사·A사·B사 이미지가 전부 없으면 이미지 영역 자체를 생략
    const hasAnyImg =
      (d.ownImage && d.ownImage.trim()) ||
      (d.aImage && d.aImage.trim()) ||
      (d.bImage && d.bImage.trim())

    const renderCard = (
      name: string,
      imgUrl: string | undefined,
      vals: string[],
      modifier: 'own' | 'rival',
    ) => `
<div class="chbp-card chbp-card--${modifier}">
  <div class="chbp-card-head">
    <p class="chbp-brand">${esc(name)}</p>
    ${hasAnyImg
      ? `<div class="chbp-img-wrap">${media(imgUrl, 'chbp-prod', `${esc(name)} 제품 이미지`)}</div>`
      : ''}
  </div>
  <div class="chbp-rows">
    ${d.rows.map((row, i) => `
    <div class="chbp-cell">
      <span class="chbp-pill"><span class="chbp-pill-text">${esc(row.label)}</span></span>
      <span class="chbp-val">${esc(vals[i])}</span>
    </div>`).join('')}
  </div>
</div>`

    return `
<section class="chbp">
  <div class="chbp-hd">
    <h2 class="chbp-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="chbp-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
  <div class="chbp-grid">
    ${renderCard(d.ownName, d.ownImage, d.rows.map(r => r.own), 'own')}
    ${renderCard(d.aName, d.aImage, d.rows.map(r => r.a), 'rival')}
    ${renderCard(d.bName, d.bImage, d.rows.map(r => r.b), 'rival')}
  </div>
  ${d.tagline ? `<p class="chbp-tagline">${esc(d.tagline)}</p>` : ''}
</section>`
  },
})
