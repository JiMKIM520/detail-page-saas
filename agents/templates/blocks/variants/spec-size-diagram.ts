/** SPEC 아키타입: spec-size-diagram
 *  원본: 195_제품정보_08 (와디즈 제품정보 섹션)
 *  제품 사진 위 CSS 치수선(가로/세로/폭) 오버레이 + 하단 4열 사이즈 비교표.
 *  치수선은 CSS border + 의사요소 화살촉으로 재구성 — 이미지 에셋 참조 없음.
 *  데스크톱 872px 기준 레이아웃 (원본 860px 모바일을 데스크톱으로 재구성).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 치수선 슬롯 (단일 제품) ── */
const dimSchema = z.object({
  label: z.string().min(1),   // 축 이름 예: "가로" "세로" "폭"
  value: z.string().min(1),   // 수치 예: "37cm"
})

/* ── 사이즈 표: 행 1개 ── */
const rowSchema = z.object({
  metric: z.string().min(1),  // 행 이름 예: "가로" "세로" "높이" "무게"
  values: z.array(z.string().min(1)).min(1).max(4),  // 각 사이즈 옵션 값
})

const schema = z.object({
  /** 섹션 영문 대제목 (라틴 디스플레이). 기본 "size info" */
  titleLat: z.string().optional(),
  /** 한국어 소제목 */
  titleKo: z.string().min(1),
  /** 제품 사진 URL */
  image: z.string().optional(),
  /** 치수선 레이블 목록 (2~3개). 브리프에 치수 근거가 있을 때만 사용. */
  dims: z.array(dimSchema).min(2).max(3).optional(),
  /** 사이즈 표 헤더 셀 (옵션명): 첫 번째는 행 이름 열이므로 2번째부터 = 실제 사이즈 옵션. 2~4개. */
  colHeaders: z.array(z.string().min(1)).min(2).max(4),
  /** 사이즈 표 데이터 행 (2~5개) */
  rows: z.array(rowSchema).min(2).max(5),
  /** 측정 오차 안내 문구 (옵션). 브리프에 근거 있을 때만. */
  notice: z.string().optional(),
})

type Data = z.infer<typeof schema>

export const specSizeDiagram = defineBlock<Data>({
  id: 'spec-size-diagram',
  archetype: 'spec',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '사이즈/치수 정보 블록. 라틴 대제목(size info) + 한국어 소제목 + 제품 사진 위 CSS 치수선(가로·세로·폭) 오버레이 + 하단 4열 사이즈 비교표. 전자제품·가방·가구 등 치수 명시 제품에 적합. 치수선(dims) 및 오차 안내(notice)는 브리프에 근거 있을 때만 활성화.',
  schema,
  css: `
/* ── 최상위 래퍼 ── */
.ssdg{background:var(--bg);color:var(--ink);padding:64px var(--pad-x,56px) 60px;text-align:center}

/* ── 헤더 ── */
.ssdg-title-lat{font-family:var(--font-lat);font-weight:600;font-size:68px;letter-spacing:-.02em;line-height:1;color:var(--ink);text-transform:lowercase}
.ssdg-title-ko{margin-top:10px;font-family:var(--font-body);font-size:22px;font-weight:400;color:var(--ink-2);letter-spacing:-.01em}

/* ── 사진 + 치수선 영역 ── */
.ssdg-photo-wrap{position:relative;margin:40px auto 0;width:600px;max-width:100%}
.ssdg-photo{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
.ssdg-photo.ph{display:none!important}

/* ── 치수선 오버레이 ── */
.ssdg-dims{position:absolute;inset:0;pointer-events:none}

/* 가로 치수선 (상단 — 사진 상단 약 15% 지점 수평) */
.ssdg-dim-h{
  position:absolute;top:15%;left:6%;right:6%;
  display:flex;align-items:center;gap:0
}
.ssdg-dim-h::before,.ssdg-dim-h::after{
  content:'';flex:1;height:1px;background:var(--ink);opacity:.55
}
.ssdg-dim-h::before{margin-right:6px}
.ssdg-dim-h::after{margin-left:6px}
/* 화살촉 */
.ssdg-dim-h .ssdg-arr-l,.ssdg-dim-h .ssdg-arr-r{
  width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;opacity:.55;flex-shrink:0
}
.ssdg-dim-h .ssdg-arr-l{border-right:6px solid var(--ink);margin-right:-1px}
.ssdg-dim-h .ssdg-arr-r{border-left:6px solid var(--ink);margin-left:-1px}

/* 세로 치수선 (왼쪽 수직) */
.ssdg-dim-v{
  position:absolute;left:4%;top:8%;bottom:8%;
  display:flex;flex-direction:column;align-items:center;gap:0
}
.ssdg-dim-v::before,.ssdg-dim-v::after{
  content:'';flex:1;width:1px;background:var(--ink);opacity:.55
}
.ssdg-dim-v::before{margin-bottom:4px}
.ssdg-dim-v::after{margin-top:4px}
.ssdg-dim-v .ssdg-arr-t,.ssdg-dim-v .ssdg-arr-b{
  width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;opacity:.55;flex-shrink:0
}
.ssdg-dim-v .ssdg-arr-t{border-bottom:6px solid var(--ink);margin-bottom:-1px}
.ssdg-dim-v .ssdg-arr-b{border-top:6px solid var(--ink);margin-top:-1px}

/* 폭 치수선 (오른쪽 하단 수평 짧은 선) */
.ssdg-dim-w{
  position:absolute;bottom:22%;right:4%;left:50%;
  display:flex;align-items:center;gap:0
}
.ssdg-dim-w::before,.ssdg-dim-w::after{
  content:'';flex:1;height:1px;background:var(--ink);opacity:.55
}
.ssdg-dim-w::before{margin-right:6px}
.ssdg-dim-w::after{margin-left:6px}
.ssdg-dim-w .ssdg-arr-l,.ssdg-dim-w .ssdg-arr-r{
  width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;opacity:.55;flex-shrink:0
}
.ssdg-dim-w .ssdg-arr-l{border-right:6px solid var(--ink);margin-right:-1px}
.ssdg-dim-w .ssdg-arr-r{border-left:6px solid var(--ink);margin-left:-1px}

/* ── 치수선 레이블 텍스트 ── */
.ssdg-dlabel{
  font-family:var(--font-body);font-size:13px;font-weight:300;
  color:var(--ink);white-space:nowrap;line-height:1.2;
  background:rgba(255,255,255,.72);padding:1px 4px;
  border-radius:calc(var(--r-scale,1)*3px)
}

/* ── 사이즈 표 ── */
.ssdg-table-wrap{margin:36px auto 0;width:100%;overflow-x:auto}
.ssdg-table{width:100%;border-collapse:collapse;table-layout:fixed}
.ssdg-table th,.ssdg-table td{
  padding:12px 8px;text-align:center;
  font-family:var(--font-body);font-size:15px;line-height:1.4;
  border-bottom:1px solid var(--line)
}
/* 헤더 행 — 다크 배경 */
.ssdg-table thead tr{background:var(--ink)}
.ssdg-table th{
  color:var(--bg);font-weight:600;font-size:15px;letter-spacing:.01em
}
/* 첫 번째 열 (행 이름) — 약간 강조 */
.ssdg-table td:first-child{
  font-weight:500;color:var(--ink-2)
}
/* 짝수 행 배경 */
.ssdg-table tbody tr:nth-child(even){background:color-mix(in srgb,var(--ink) 4%,transparent)}

/* ── 오차 안내 ── */
.ssdg-notice{
  margin-top:20px;font-family:var(--font-body);font-size:13px;font-weight:300;
  color:var(--muted);letter-spacing:.01em
}
`,
  render: (d, { esc, richSafe }) => {
    const titleLat = d.titleLat ?? 'size info'
    const hasDims = Array.isArray(d.dims) && d.dims.length >= 2

    /* 치수선 레이블: 0=가로(상단 수평), 1=세로(좌측 수직), 2=폭(우하단) */
    const dimH = hasDims ? d.dims![0] : null
    const dimV = hasDims ? d.dims![1] : null
    const dimW = hasDims && d.dims!.length >= 3 ? d.dims![2] : null

    /* 사이즈 표 헤더 — 첫 셀은 빈 행 이름 열 */
    const colHeaderCells = d.colHeaders
      .map((h) => `<th>${esc(h)}</th>`)
      .join('')

    /* 사이즈 표 데이터 행 */
    const dataRows = d.rows
      .map((row) => {
        const valueCells = row.values
          .slice(0, d.colHeaders.length)
          .map((v) => `<td>${esc(v)}</td>`)
          .join('')
        return `<tr><td>${esc(row.metric)}</td>${valueCells}</tr>`
      })
      .join('\n        ')

    return `
<section class="ssdg">
  <h2 class="ssdg-title-lat">${esc(titleLat)}</h2>
  <p class="ssdg-title-ko">${richSafe(d.titleKo)}</p>

  <div class="ssdg-photo-wrap">
    ${media(d.image, 'ssdg-photo', '제품 사이즈 사진')}
    ${hasDims ? `
    <div class="ssdg-dims">
      ${dimH ? `
      <div class="ssdg-dim-h">
        <span class="ssdg-arr-l"></span>
        <span class="ssdg-dlabel">${esc(dimH.label)} ${esc(dimH.value)}</span>
        <span class="ssdg-arr-r"></span>
      </div>` : ''}
      ${dimV ? `
      <div class="ssdg-dim-v">
        <span class="ssdg-arr-t"></span>
        <span class="ssdg-dlabel">${esc(dimV.label)} ${esc(dimV.value)}</span>
        <span class="ssdg-arr-b"></span>
      </div>` : ''}
      ${dimW ? `
      <div class="ssdg-dim-w">
        <span class="ssdg-arr-l"></span>
        <span class="ssdg-dlabel">${esc(dimW.label)} ${esc(dimW.value)}</span>
        <span class="ssdg-arr-r"></span>
      </div>` : ''}
    </div>` : ''}
  </div>

  <div class="ssdg-table-wrap">
    <table class="ssdg-table">
      <thead>
        <tr>
          <th></th>
          ${colHeaderCells}
        </tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>
  </div>

  ${d.notice ? `<p class="ssdg-notice">${esc(d.notice)}</p>` : ''}
</section>`
  },
})
