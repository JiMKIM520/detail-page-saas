/** DETAIL 아키타입: faq-label-spec-table.
 *  [끝판왕] FAQ 문의 구성 #5 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 헤더(대형 카피 + 로고 자리) + 흰 배경 label-value-row 메타데이터 테이블.
 *  filled-black-badge 라벨 × 값(볼드)+보조텍스트 구조.
 *  채용공고/이벤트/상품 스펙처럼 항목명·값을 구조화한 단방향 정보 공시 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'

const rowSchema = z.object({
  /** 필드 라벨 (검은 배지 안 텍스트, 예: "모집기간") */
  label: z.string().min(1),
  /** 주 값 — em/br 허용. 수평 스텝(1차→2차)도 이 필드에 em으로 표현 */
  value: z.string().min(1),
  /** 보조 설명 (선택, br 허용) */
  sub: z.string().optional(),
})

const schema = z.object({
  /** 다크 헤더 eyebrow (작은 회색 상단 텍스트, 예: "로고 넣는 자리") */
  eyebrow: z.string().optional(),
  /** 다크 헤더 대형 타이틀 — em/br 허용. em 부분은 흰색으로 대비 강조 */
  title: z.string().min(1),
  /** 흰 테이블 섹션 제목 (선택) */
  tableTitle: z.string().optional(),
  /** 라벨-값 행 배열 (3~10개) */
  rows: z.array(rowSchema).min(3).max(10),
})
type Data = z.infer<typeof schema>

export const faqLabelSpecTable = defineBlock<Data>({
  id: 'faq-label-spec-table',
  archetype: 'detail',
  styleTags: ['dark-header', 'spec', 'table', 'label-badge', 'announcement', 'template'],
  imageSlots: 0,
  describe:
    '채용공고·이벤트·상품스펙 공시형. 다크 배경에 대형 헤드라인(eyebrow+타이틀) 뒤 흰 배경 라벨-값 테이블. ' +
    '각 행은 filled-black-badge 라벨 + 볼드 값 + 보조 텍스트(선택). 단방향 정보 공시 레이아웃.',
  schema,
  css: `
/* faq-label-spec-table — 접두사 flst- */
.flst{background:var(--paper);word-break:keep-all;overflow-wrap:break-word}

/* ── 다크 헤더 ── */
.flst-hd{
  background:var(--ink);
  padding:44px 40px 52px;
  position:relative;
  overflow:hidden;
}
/* 헤더 배경 텍스처 — 가벼운 노이즈 overlay */
.flst-hd::before{
  content:'';
  position:absolute;inset:0;
  background:repeating-linear-gradient(
    -55deg,
    transparent,transparent 3px,
    rgba(255,255,255,.025) 3px,rgba(255,255,255,.025) 4px
  );
  pointer-events:none;
}
.flst-eyebrow{
  position:relative;
  text-align:right;
  font-family:var(--font-body);
  font-size:13px;
  color:rgba(255,255,255,.42);
  letter-spacing:.04em;
  margin-bottom:24px;
}
.flst-hd-title{
  position:relative;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,8.4vw,56px);
  line-height:1.18;
  letter-spacing:-.025em;
  /* 기본 색: 불투명 회색(대형 shadow 텍스트처럼) */
  color:rgba(255,255,255,.38);
}
/* em 부분 = 흰색으로 완전 대비 강조 (다크 배경 override) */
.flst-hd-title .em{
  color:#fff;
}

/* ── 테이블 섹션 ── */
.flst-body{
  background:var(--paper);
  padding:40px 40px 48px;
}
.flst-table-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:20px;
  color:var(--ink);
  margin-bottom:20px;
  letter-spacing:-.01em;
}

/* ── 개별 행 ── */
.flst-row{
  display:grid;
  grid-template-columns:80px 1fr;
  gap:0 18px;
  align-items:start;
  padding:22px 0;
  border-bottom:1px solid var(--line);
}
.flst-row:first-of-type{
  border-top:1px solid var(--line);
}

/* filled-black-badge 라벨 */
.flst-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:var(--ink);
  color:#fff;
  font-family:var(--font-body);
  font-weight:700;
  font-size:13px;
  letter-spacing:.02em;
  border-radius:5px;
  padding:5px 0;
  width:80px;
  text-align:center;
  /* 배지 폭은 고정, 텍스트 길이 무관하게 균일 */
  flex-shrink:0;
  margin-top:2px;
  word-break:keep-all;
}

/* 값 영역 */
.flst-val-wrap{
  display:flex;
  flex-direction:column;
  gap:5px;
}
.flst-val{
  font-family:var(--font-body);
  font-weight:700;
  font-size:16px;
  line-height:1.5;
  color:var(--ink);
}
.flst-val .em{
  color:var(--accent-d);
}
.flst-sub{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.6;
  color:var(--muted);
}
.flst-sub .em{
  color:var(--accent-d);
  font-weight:600;
}

/* 수평 스텝 시퀀스(전형절차 등) — value 안에 <span class="flst-step">로 렌더 */
.flst-steps{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  align-items:center;
}
.flst-step-item{
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-family:var(--font-body);
  font-weight:700;
  font-size:15px;
  color:var(--ink);
}
.flst-step-item .flst-step-num{
  font-weight:800;
  color:var(--accent-d);
}
.flst-step-item + .flst-step-item::before{
  content:'';
  display:inline-block;
  width:14px;
  height:2px;
  background:var(--line);
  border-radius:2px;
  margin-right:0;
  flex-shrink:0;
}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrow = d.eyebrow
      ? `<div class="flst-eyebrow">${esc(d.eyebrow)}</div>`
      : ''

    const tableTitle = d.tableTitle
      ? `<div class="flst-table-title">${esc(d.tableTitle)}</div>`
      : ''

    const rows = d.rows
      .map(
        (row) => `
    <div class="flst-row">
      <span class="flst-badge">${esc(row.label)}</span>
      <div class="flst-val-wrap">
        <span class="flst-val">${richSafe(row.value)}</span>
        ${row.sub ? `<span class="flst-sub">${richSafe(row.sub)}</span>` : ''}
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="flst">
  <div class="flst-hd">
    ${eyebrow}
    <h2 class="flst-hd-title">${richSafe(d.title)}</h2>
  </div>
  <div class="flst-body">
    ${tableTitle}
    ${rows}
  </div>
</section>`
  },
})
