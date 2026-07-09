/** COMPARE 아키타입: compare-asym-panels.
 *  3열 비대칭 폭 비교 패널 — 자사 강조열(넓게) / 비교 기준열(중앙) / 경쟁사열(좁게).
 *  원본: 166_비교_08 (와디즈 200섹션). 구조·위계 흡수, 브랜드색·카피는 토큰+슬롯으로 일반화.
 *  VS 뱃지 없음 — 비대칭 폭 자체가 자사 우위를 시각적으로 전달. */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 스키마 ────────────────────────────────────────────────────────────────────

const rowSchema = z.object({
  criterion: z.string().min(1),       // 비교 항목명 (중앙열 라벨)
  ours: z.string().min(1),            // 자사 값 (em 허용)
  theirs: z.string().min(1),          // 경쟁사 값
})

const schema = z.object({
  // ── 헤더 영역
  badge: z.string().optional(),       // 상단 필 뱃지 텍스트 (예: "꼼꼼하게 비교하세요.")
  title: z.string().min(1),           // 대형 헤드라인 (em, br 허용)
  desc: z.string().optional(),        // 헤드라인 아래 보조 설명 (순수 텍스트)

  // ── 컬럼 제목
  ourLabel: z.string().min(1),        // 자사 열 제목 (예: 브랜드명)
  theirLabel: z.string().min(1),      // 경쟁사 열 제목 (예: "일반 제품")

  // ── 비교 행 (2~6개)
  rows: z.array(rowSchema).min(2).max(6),

  // ── 선택적 수치/후기 슬롯 (브리프에 근거 있을 때만 사용)
  footNote: z.string().optional(),    // 표 아래 작은 주석 (예: "* 제3자 시험 성적서 기준")
})

type Data = z.infer<typeof schema>

// ── 변형 정의 ─────────────────────────────────────────────────────────────────

export const compareAsymPanels = defineBlock<Data>({
  id: 'compare-asym-panels',
  archetype: 'compare',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '3열 비대칭 비교 패널. 자사 강조열(넓음·브랜드색 배경)·기준열(중앙·회색)·경쟁사열(좁음·중간회색) 순서. VS 뱃지 없이 폭 대비로 우위 표현. 헤더에 필 뱃지+대형 헤드라인+보조 설명. 수치·후기 슬롯은 브리프에 근거 있을 때만.',
  schema,
  css: `
.caps{background:var(--bg);padding:64px var(--pad-x,56px) 72px;color:var(--ink)}

/* ── 헤더 영역 */
.caps-hd{text-align:center;margin-bottom:48px}
.caps-badge{display:inline-block;background:var(--accent);color:var(--bg);
  font-family:var(--font-display);font-weight:700;font-size:15px;
  padding:9px 22px;border-radius:calc(var(--r-scale,1)*20px);
  letter-spacing:.04em;margin-bottom:20px}
.caps-title{font-family:var(--font-display);font-weight:800;font-size:42px;
  line-height:1.22;letter-spacing:-.02em;color:var(--ink)}
.caps-title .em{color:var(--accent)}
.caps-div{width:48px;height:2px;background:var(--line);margin:18px auto 0}
.caps-desc{margin-top:14px;font-size:15px;font-weight:400;line-height:1.7;color:var(--ink-2)}

/* ── 3열 패널 테이블 */
.caps-table{width:100%;border-collapse:separate;border-spacing:0}

/* 열 너비: 자사 37% / 기준 22% / 경쟁사 27% (나머지 14% = 좌우 여백 시각 조정) */
.caps-col-ours{width:37%}
.caps-col-crit{width:22%}
.caps-col-theirs{width:27%}
.caps-col-gap{width:7%}  /* 양쪽 외곽 여백 열 */

/* ── 헤더 셀 */
.caps-th{padding:18px 16px 16px;text-align:center;font-size:13px;font-weight:600;
  color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
.caps-th-ours{background:var(--accent);color:var(--bg);
  font-family:var(--font-display);font-size:17px;font-weight:800;
  letter-spacing:.01em;text-transform:none;
  border-radius:calc(var(--r-scale,1)*16px) calc(var(--r-scale,1)*16px) 0 0}
.caps-th-crit{background:var(--paper);color:var(--ink-2)}
.caps-th-theirs{background:var(--paper);color:var(--ink-2);
  border-radius:calc(var(--r-scale,1)*12px) calc(var(--r-scale,1)*12px) 0 0}

/* ── 데이터 셀 */
.caps-td{padding:14px 16px;text-align:center;vertical-align:middle;
  font-size:14px;line-height:1.5;border-bottom:1px solid var(--line)}
.caps-td:last-of-type{border-bottom:none}
.caps-td-ours{background:color-mix(in srgb,var(--accent) 10%,var(--bg));
  color:var(--ink);font-weight:700;font-size:15px}
.caps-td-ours .em{color:var(--accent-d);font-weight:800}
.caps-td-crit{background:var(--paper);color:var(--ink-2);font-size:13px;font-weight:500}
.caps-td-theirs{background:color-mix(in srgb,var(--line) 40%,var(--bg));
  color:var(--muted);font-size:14px}

/* ── 마지막 행 하단 라운드 */
.caps-last .caps-td-ours{border-bottom:none;
  border-radius:0 0 calc(var(--r-scale,1)*16px) calc(var(--r-scale,1)*16px)}
.caps-last .caps-td-theirs{border-bottom:none;
  border-radius:0 0 calc(var(--r-scale,1)*12px) calc(var(--r-scale,1)*12px)}
.caps-last .caps-td-crit{border-bottom:none}

/* ── 주석 */
.caps-footnote{margin-top:16px;text-align:center;font-size:12px;
  color:var(--muted);letter-spacing:.01em}
`,
  render: (d, { esc, richSafe }) => {
    const lastIdx = d.rows.length - 1

    const rows = d.rows
      .map(
        (r, i) => `
    <tr class="${i === lastIdx ? 'caps-last' : ''}">
      <td class="caps-td caps-td-gap" style="background:transparent;border:none"></td>
      <td class="caps-td caps-td-ours">${richSafe(r.ours)}</td>
      <td class="caps-td caps-td-crit">${esc(r.criterion)}</td>
      <td class="caps-td caps-td-theirs">${esc(r.theirs)}</td>
      <td class="caps-td caps-td-gap" style="background:transparent;border:none"></td>
    </tr>`,
      )
      .join('')

    return `
<section class="caps">
  <div class="caps-hd">
    ${d.badge ? `<div class="caps-badge">${esc(d.badge)}</div>` : ''}
    <h2 class="caps-title">${richSafe(d.title)}</h2>
    <div class="caps-div"></div>
    ${d.desc ? `<p class="caps-desc">${esc(d.desc)}</p>` : ''}
  </div>
  <table class="caps-table" role="table" aria-label="제품 비교표">
    <colgroup>
      <col class="caps-col-gap">
      <col class="caps-col-ours">
      <col class="caps-col-crit">
      <col class="caps-col-theirs">
      <col class="caps-col-gap">
    </colgroup>
    <thead>
      <tr>
        <th class="caps-th" style="background:transparent;border:none" scope="col"></th>
        <th class="caps-th caps-th-ours" scope="col">${esc(d.ourLabel)}</th>
        <th class="caps-th caps-th-crit" scope="col">비교 항목</th>
        <th class="caps-th caps-th-theirs" scope="col">${esc(d.theirLabel)}</th>
        <th class="caps-th" style="background:transparent;border:none" scope="col"></th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  ${d.footNote ? `<p class="caps-footnote">${esc(d.footNote)}</p>` : ''}
</section>`
  },
})
