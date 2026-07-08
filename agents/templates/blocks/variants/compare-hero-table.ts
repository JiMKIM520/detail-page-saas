/** COMPARE 아키타입(템플릿 충실 재현): compare-hero-table.
 *  와디즈 200섹션 07_차별화 비교 _02변형 (569:114)
 *  히어로 이미지(하단 원형 accent 배경) + "Before&After" 섹션 라벨 +
 *  비대칭 플랫 테이블(좁은 BEFORE 텍스트 vs 넓은 accent AFTER 박스) + 클로징.
 *  어떤 프리셋이든 적응; 색은 모두 토큰 변수. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),                        // 대제목 (em,br)
  subtitle: z.string().min(1).optional(),          // 서브 한 줄
  heroImage: z.string().optional(),                // (url) 원형 배경 위 히어로 이미지
  sectionLabel: z.string().min(1).optional(),      // 기본 "Before&After"
  beforeLabel: z.string().min(1).optional(),       // 기본 "BEFORE"
  afterLabel: z.string().min(1).optional(),        // 기본 "AFTER"
  rows: z
    .array(
      z.object({
        before: z.string().min(1),               // 좌 뮤트 텍스트 (em,br)
        after: z.string().min(1),                // 우 흰 볼드 텍스트 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),            // 마무리 강조 문구 (em,br)
})
type Data = z.infer<typeof schema>

export const compareHeroTable = defineBlock<Data>({
  id: 'compare-hero-table',
  archetype: 'compare',
  styleTags: ['premium', 'light', 'template', 'comparison', 'asymmetric'],
  imageSlots: 1,
  describe:
    '차별화 비교(히어로+비대칭 테이블). 대제목+서브 → 원형 accent 배경 위 히어로 이미지 → "Before&After" 라벨 → 좁은 BEFORE 텍스트 열 + 넓은 accent AFTER 박스 테이블(2~4행) → 클로징. 사용 전후 임팩트 대비.',
  schema,
  css: `
/* ── compare-hero-table ── */
.cht{background:var(--bg);color:var(--ink);padding:54px 0 0}
/* 헤더 */
.cht-hd{padding:0 52px 12px}
.cht-title{font-family:var(--font-display);font-weight:800;font-size:54px;color:var(--accent);letter-spacing:-.02em;line-height:1.1}
.cht-sub{margin-top:10px;font-size:16px;color:var(--ink-2);font-weight:500}
/* 히어로 이미지 — 원형 accent 배경(하단 반원) */
.cht-hero-wrap{position:relative;width:100%;display:flex;justify-content:center;padding:24px 52px 0;margin-bottom:18px}
.cht-hero-bg{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:460px;height:230px;background:color-mix(in srgb,var(--accent) 22%,transparent);border-radius:999px 999px 0 0}
.cht-hero-img{position:relative;width:420px;height:360px;object-fit:contain;display:block;z-index:1}
/* "Before&After" 섹션 라벨 */
.cht-label{text-align:center;font-family:var(--font-display);font-size:34px;font-weight:700;color:var(--accent);letter-spacing:.01em;padding:14px 52px 28px}
/* 비대칭 테이블 */
.cht-table{width:100%;border-collapse:collapse}
/* 헤더 행: BEFORE(좁음·플레인) + AFTER(넓음·accent 채움) */
.cht-th-wrap{display:grid;grid-template-columns:2fr 3fr;margin:0 52px;gap:0}
.cht-th{padding:14px 20px;font-family:var(--font-display);font-weight:800;font-size:18px;letter-spacing:.08em;text-align:center}
.cht-th-b{color:var(--ink-2)}
.cht-th-a{background:var(--accent);color:#fff;border-radius:calc(var(--r-scale,1)*10px) calc(var(--r-scale,1)*10px) 0 0}
/* 데이터 행 */
.cht-rows{margin:0 52px 0}
.cht-row{display:grid;grid-template-columns:2fr 3fr;border-top:1.5px solid var(--line)}
.cht-row:last-child{border-bottom:1.5px solid var(--line)}
.cht-cell{padding:22px 20px;font-size:15px;line-height:1.6;text-align:center;display:flex;align-items:center;justify-content:center}
.cht-cell-b{color:var(--muted)}
.cht-cell-a{background:color-mix(in srgb,var(--accent) 92%,#000);color:#fff;font-weight:700}
.cht-cell-a .em{font-weight:800;color:#fff;text-decoration:underline;text-underline-offset:3px}
.cht-cell-b .em{color:var(--accent)}
/* 클로징 */
.cht-closer{padding:44px 52px 56px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:38px;color:var(--ink);line-height:1.3}
.cht-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const secLabel = esc(d.sectionLabel ?? 'Before&After')
    const bLabel = esc(d.beforeLabel ?? 'BEFORE')
    const aLabel = esc(d.afterLabel ?? 'AFTER')
    return `
<section class="cht">
  <div class="cht-hd">
    <h2 class="cht-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="cht-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="cht-hero-wrap">
    <div class="cht-hero-bg"></div>
    ${media(d.heroImage, 'cht-hero-img', '히어로 이미지')}
  </div>
  <p class="cht-label">${secLabel}</p>
  <div class="cht-th-wrap">
    <div class="cht-th cht-th-b">${bLabel}</div>
    <div class="cht-th cht-th-a">${aLabel}</div>
  </div>
  <div class="cht-rows">
    ${d.rows
      .map(
        (r) => `
    <div class="cht-row">
      <div class="cht-cell cht-cell-b">${richSafe(r.before)}</div>
      <div class="cht-cell cht-cell-a">${richSafe(r.after)}</div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="cht-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
