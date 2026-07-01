/** COMPARE 아키타입(템플릿 충실 재현): compare-grid-table.
 *  와디즈 200섹션 07_차별화 비교 _01(순수 그리드/표) 패턴을 토큰 기반으로 재구성.
 *  카드/채움 없음; 풀폭 수직 중앙 구분선 + 수평 구분선만으로 그리드; 상단 pill 라벨 행;
 *  동일 이미지 쌍 행; 이후 3개 텍스트 행 쌍 열별 좌정렬. 어떤 프리셋이든 적응. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),           // 대제목 (em,br 허용)
  subtitle: z.string().min(1).optional(),
  beforeLabel: z.string().min(1).optional(), // 기본 Before
  afterLabel: z.string().min(1).optional(),  // 기본 After
  beforeImage: z.string().optional(),        // (url)
  afterImage: z.string().optional(),         // (url)
  rows: z
    .array(
      z.object({
        before: z.string().min(1),  // 좌 텍스트 (em,br)
        after: z.string().min(1),   // 우 텍스트 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(), // em,br
})
type Data = z.infer<typeof schema>

export const compareGridTable = defineBlock<Data>({
  id: 'compare-grid-table',
  archetype: 'compare' as any,
  styleTags: ['premium', 'light', 'template', 'comparison', 'minimal'],
  imageSlots: 2,
  describe:
    '차별화 비교(순수 그리드/표). 카드 없음; 풀폭 수직 중앙 구분선 + 수평 구분선만; 상단 pill 아웃라인 라벨; 이미지 쌍; 텍스트 비교 행(좌=뮤트, 우=accent 강조); 하단 클로저. 전후 대조에 깔끔한 표 레이아웃.',
  schema,
  css: `
.cgt{background:var(--bg);padding:52px 0 0}
.cgt-hd{padding:0 52px 36px}
.cgt-title{font-family:var(--font-display);font-weight:800;font-size:54px;color:var(--accent);letter-spacing:-.02em;line-height:1.1}
.cgt-sub{margin-top:10px;font-size:16px;color:var(--ink-2)}
/* 풀폭 그리드 영역 — 수직 중앙 구분선 + 수평 구분선으로만 구성 */
.cgt-grid{width:100%;border-top:1.5px solid var(--line)}
.cgt-row{display:grid;grid-template-columns:1fr 1fr;border-bottom:1.5px solid var(--line);position:relative}
/* 수직 중앙 구분선 */
.cgt-row::after{content:"";position:absolute;top:0;bottom:0;left:50%;width:1.5px;background:var(--accent);opacity:.35}
.cgt-cell{padding:22px 32px;display:flex;align-items:center;justify-content:center}
/* pill 라벨 행 */
.cgt-row--label .cgt-cell{padding:20px 32px}
.cgt-pill{display:inline-block;font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.04em;padding:8px 32px;border-radius:999px;border:2px solid var(--accent);color:var(--accent);background:transparent;line-height:1}
/* 이미지 행 */
.cgt-row--img .cgt-cell{padding:16px 20px}
.cgt-img{width:100%;height:220px;object-fit:cover;display:block;border-radius:4px}
/* 텍스트 비교 행 */
.cgt-row--text .cgt-cell{padding:26px 32px;text-align:center;font-size:16px;line-height:1.6}
.cgt-cell--before{color:var(--ink-2)}
.cgt-cell--after{color:var(--accent);font-weight:700}
.cgt-cell--after .em{color:var(--accent-d);font-weight:800}
/* 클로저 */
.cgt-closer{padding:44px 52px 52px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--ink);line-height:1.35}
.cgt-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const bLabel = esc(d.beforeLabel ?? 'Before')
    const aLabel = esc(d.afterLabel ?? 'After')
    return `
<section class="cgt">
  <div class="cgt-hd">
    <h2 class="cgt-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="cgt-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="cgt-grid">
    <div class="cgt-row cgt-row--label">
      <div class="cgt-cell"><span class="cgt-pill">${bLabel}</span></div>
      <div class="cgt-cell"><span class="cgt-pill">${aLabel}</span></div>
    </div>
    <div class="cgt-row cgt-row--img">
      <div class="cgt-cell">${media(d.beforeImage, 'cgt-img', 'Before 이미지')}</div>
      <div class="cgt-cell">${media(d.afterImage, 'cgt-img', 'After 이미지')}</div>
    </div>
    ${d.rows
      .map(
        (r) => `
    <div class="cgt-row cgt-row--text">
      <div class="cgt-cell cgt-cell--before">${richSafe(r.before)}</div>
      <div class="cgt-cell cgt-cell--after">${richSafe(r.after)}</div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="cgt-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
