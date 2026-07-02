/** DETAIL 아키타입(템플릿 충실 재현): spec-table-label-value.
 *  [끝판왕] FAQ 문의 구성 #21 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 대제목 + accent 서브텍스트 + 풀폭 구분선 후
 *  섹션 헤딩 → [풀폭 hr + 좌 라벨 / 우 멀티라인 텍스트 우정렬] 행 반복.
 *  채용공고·FAQ·제품 스펙·배송안내 등 구조형 정보 전달에 적합. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 최상단 대제목 (em 허용) */
  title: z.string().min(1),
  /** 대제목 아래 accent 색 서브 텍스트 (선택) */
  subtitle: z.string().optional(),
  /** 우측 상단 브랜드/로고명 (선택) */
  brand: z.string().optional(),
  /** 구분선 아래 섹션 헤딩 (예: "앱 개발 전반", em 허용, 선택) */
  sectionHeading: z.string().optional(),
  /** 라벨-값 행 목록 (2~8개) */
  rows: z
    .array(
      z.object({
        /** 좌측 짧은 라벨 (예: "담당업무", "지원자격") */
        label: z.string().min(1),
        /** 우측 멀티라인 텍스트 (br/em 허용). 여러 줄은 <br>로 구분. */
        value: z.string().min(1),
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const specTableLabelValue = defineBlock<Data>({
  id: 'spec-table-label-value',
  archetype: 'detail',
  styleTags: ['minimal', 'structured', 'spec', 'faq', 'editorial', 'template'],
  imageSlots: 0,
  describe:
    '구조형 라벨-값 테이블. 대제목+accent 서브+우측 브랜드명 + 풀폭 구분선 + 섹션 헤딩 + [풀폭 hr → 좌 라벨(고정폭) / 우 멀티라인 텍스트 우정렬] 행 반복. 채용공고·FAQ·제품 스펙·배송안내 등 구조형 정보 전달에 최적.',
  schema,
  css: `
/* spec-table-label-value — 접두사 stlv- */
.stlv{background:var(--paper);padding:48px 40px 60px;word-break:keep-all}
/* 헤더 영역 */
.stlv-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:4px}
.stlv-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.5vw,38px);color:var(--ink);line-height:1.18;letter-spacing:-.02em}
.stlv-title .em{color:var(--accent-d)}
.stlv-brand{font-family:var(--font-body);font-size:15px;font-weight:600;color:var(--muted);white-space:nowrap;padding-top:6px}
.stlv-subtitle{font-family:var(--font-body);font-size:15px;font-weight:600;color:var(--accent-d);margin-top:6px;line-height:1.5}
/* 최상단 풀폭 구분선 */
.stlv-divider{width:100%;height:1px;background:var(--ink);margin:20px 0 24px}
/* 섹션 헤딩 */
.stlv-section{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,4vw,28px);color:var(--ink);letter-spacing:-.015em;line-height:1.25;margin-bottom:4px}
.stlv-section .em{color:var(--accent-d)}
/* 행 목록 */
.stlv-rows{margin-top:0}
/* 각 행: 풀폭 hr + 라벨/값 2칸 레이아웃 */
.stlv-row{border-top:1px solid var(--line);padding:18px 0;display:grid;grid-template-columns:72px 1fr;gap:16px;align-items:start}
.stlv-label{font-family:var(--font-body);font-size:14px;font-weight:500;color:var(--ink);line-height:1.6;padding-top:2px}
.stlv-value{font-family:var(--font-body);font-size:15px;color:var(--ink);line-height:1.7;text-align:right}
.stlv-value .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.rows
      .map(
        (row) => `
    <div class="stlv-row">
      <span class="stlv-label">${esc(row.label)}</span>
      <span class="stlv-value">${richSafe(row.value)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="stlv">
  <div class="stlv-top">
    <h2 class="stlv-title">${richSafe(d.title)}</h2>
    ${d.brand ? `<span class="stlv-brand">${esc(d.brand)}</span>` : ''}
  </div>
  ${d.subtitle ? `<p class="stlv-subtitle">${esc(d.subtitle)}</p>` : ''}
  <div class="stlv-divider"></div>
  ${d.sectionHeading ? `<h3 class="stlv-section">${richSafe(d.sectionHeading)}</h3>` : ''}
  <div class="stlv-rows">${rows}
  </div>
</section>`
  },
})
