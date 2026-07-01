/** COMPARE 아키타입(템플릿 충실 재현): compare-hero-panels.
 *  와디즈 200섹션 07_차별화 비교 _01(1284:1527)
 *  풀배경 섹션 + 아이브로 필 뱃지 + 대제목/서브 + 좌 AFTER 패널(강조·높음)·우 BEFORE 패널(뮤트·오프셋) + VS 원형 뱃지 + 클로징.
 *  AFTER: accent-tint 카드, 이미지, 볼드 불릿 리스트.
 *  BEFORE: 무채색 카드, 이미지, 뮤트 불릿 리스트.
 *  어떤 프리셋이든 토큰 기반으로 적응. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),        // 아이브로 필 뱃지 (예: "WHY?")
  title: z.string().min(1),                     // 대제목 (em,br)
  subtitle: z.string().min(1).optional(),       // 서브 한 줄
  afterLabel: z.string().min(1).optional(),     // AFTER 패널 라벨 (기본 "After")
  beforeLabel: z.string().min(1).optional(),    // BEFORE 패널 라벨 (기본 "Before")
  afterImage: z.string().optional(),            // (url) AFTER 패널 이미지
  beforeImage: z.string().optional(),           // (url) BEFORE 패널 이미지
  vsLabel: z.string().min(1).optional(),        // VS 뱃지 텍스트 (기본 "VS")
  afterRows: z
    .array(z.object({ text: z.string().min(1) }))  // AFTER 불릿 항목 (em,br)
    .min(2)
    .max(5),
  beforeRows: z
    .array(z.object({ text: z.string().min(1) }))  // BEFORE 불릿 항목 (em,br)
    .min(2)
    .max(5),
  closer: z.string().min(1).optional(),         // 클로징 강조 문구 (em,br)
})
type Data = z.infer<typeof schema>

export const compareHeroPanels = defineBlock<Data>({
  id: 'compare-hero-panels',
  archetype: 'compare' as any,
  styleTags: ['premium', 'light', 'template', 'comparison', 'hero', 'offset'],
  imageSlots: 2,
  describe:
    '차별화 비교(풀배경 히어로 + 오프셋 패널). 아이브로 필 뱃지 + 대제목/서브 → 좌 AFTER 패널(accent-tint 강조·이미지·볼드 불릿)·우 BEFORE 패널(무채색·이미지·뮤트 불릿) 오프셋 배치 + VS 원형 뱃지 → 클로징. 사용 전후 임팩트 대비.',
  schema,
  css: `
/* ── compare-hero-panels ── */
.chp{background:var(--bg);color:var(--ink);padding:56px 0 60px}
/* 헤더 */
.chp-hd{text-align:center;padding:0 48px 36px}
.chp-eye{display:inline-block;font-family:var(--font-display);font-weight:800;font-size:14px;letter-spacing:.12em;color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent);padding:6px 20px;border-radius:999px;margin-bottom:18px}
.chp-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:var(--ink);letter-spacing:-.02em;line-height:1.12}
.chp-title .em{color:var(--accent)}
.chp-sub{margin-top:12px;font-size:16px;color:var(--ink-2);font-weight:500}
/* 패널 컨테이너 — 오프셋 배치 */
.chp-stage{position:relative;display:flex;align-items:flex-start;gap:0;padding:0 28px;justify-content:center}
/* AFTER 패널 (좌·강조·높음) */
.chp-after{flex:0 0 44%;background:color-mix(in srgb,var(--accent) 12%,var(--paper));border:2px solid color-mix(in srgb,var(--accent) 28%,transparent);border-radius:18px;overflow:hidden;box-shadow:0 20px 44px -16px rgba(0,0,0,.22);z-index:2;position:relative}
/* BEFORE 패널 (우·무채색·오프셋 아래) */
.chp-before{flex:0 0 44%;background:var(--paper);border:1.5px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 10px 28px -14px rgba(0,0,0,.12);margin-top:48px;z-index:1;position:relative}
/* VS 원형 뱃지 */
.chp-vs{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;width:56px;height:56px;border-radius:50%;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.22);letter-spacing:.04em;border:3px solid #fff}
/* 패널 공통 */
.chp-plabel{padding:14px 20px 10px;font-family:var(--font-display);font-weight:800;font-size:18px;letter-spacing:.06em}
.chp-after .chp-plabel{color:var(--accent)}
.chp-before .chp-plabel{color:var(--muted)}
.chp-pimg{width:100%;height:178px;object-fit:cover;display:block}
.chp-rows{padding:8px 18px 18px}
.chp-row{padding:13px 6px;font-size:14px;line-height:1.55}
.chp-row+.chp-row{border-top:1px solid var(--line)}
.chp-after .chp-row{color:var(--ink);font-weight:600}
.chp-after .chp-row .em{color:var(--accent)}
.chp-before .chp-row{color:var(--muted);font-weight:400}
.chp-before .chp-row .em{color:var(--ink-2)}
/* 클로징 */
.chp-closer{margin-top:48px;text-align:center;padding:0 48px;font-family:var(--font-display);font-weight:800;font-size:34px;color:var(--ink);line-height:1.35}
.chp-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const aLabel = esc(d.afterLabel ?? 'After')
    const bLabel = esc(d.beforeLabel ?? 'Before')
    const vsText = esc(d.vsLabel ?? 'VS')

    const afterRowsHtml = d.afterRows
      .map((r) => `<div class="chp-row">${richSafe(r.text)}</div>`)
      .join('')

    const beforeRowsHtml = d.beforeRows
      .map((r) => `<div class="chp-row">${richSafe(r.text)}</div>`)
      .join('')

    return `
<section class="chp">
  <div class="chp-hd">
    ${d.eyebrow ? `<div class="chp-eye">${esc(d.eyebrow)}</div>` : ''}
    <h2 class="chp-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="chp-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="chp-stage">
    <div class="chp-after">
      <div class="chp-plabel">${aLabel}</div>
      ${media(d.afterImage, 'chp-pimg', 'After 이미지')}
      <div class="chp-rows">${afterRowsHtml}</div>
    </div>
    <div class="chp-vs">${vsText}</div>
    <div class="chp-before">
      <div class="chp-plabel">${bLabel}</div>
      ${media(d.beforeImage, 'chp-pimg', 'Before 이미지')}
      <div class="chp-rows">${beforeRowsHtml}</div>
    </div>
  </div>
  ${d.closer ? `<p class="chp-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
