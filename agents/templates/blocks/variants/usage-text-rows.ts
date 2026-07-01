/** USAGE 아키타입(템플릿 충실 재현): usage-text-rows.
 *  와디즈 200섹션 05_사용법 _01(HOW TO USE 텍스트 행+인용부호) 패턴 재구성.
 *  좌대형 디스플레이 타이틀 + 우상단 히어로 이미지 + 구분선 + STEP행(라벨·설명·우측 인용부호) × N.
 *  이미지 없는 텍스트 전용 스텝 행, 가로 헤어라인 구분선, 우측 닫는 따옴표 장식이 특징. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(),      // 기본 "HOW TO USE" — em,br 가능
  tagline: z.string().min(1).optional(),    // 히어로 소제목 (예: "제품의 사용법에 대해서 알려주세요!")
  heroImage: z.string().optional(),         // 우상단 제품 히어로 이미지 (url)
  steps: z
    .array(
      z.object({
        label: z.string().min(1).optional(), // 기본 "STEP 0N"
        desc: z.string().min(1),             // 단계 설명 — em,br 가능
      }),
    )
    .min(2)
    .max(6),
  closer: z.string().min(1).optional(),     // 하단 마무리 카피 — em,br 가능
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const usageTextRows = defineBlock<Data>({
  id: 'usage-text-rows',
  archetype: 'usage',
  styleTags: ['light', 'editorial', 'minimal', 'template', 'howto', 'text-only'],
  imageSlots: 1,
  describe:
    '사용법(텍스트 전용 구분선 행). 좌 대형 HOW TO USE 타이틀 + 우 히어로 이미지 + 헤어라인 + STEP N 라벨·설명 텍스트 행 × 2~6 (우측 큰따옴표 장식, 가로 구분선). 이미지 없는 깔끔 라이트 스타일.',
  schema,
  css: `
.utr{background:var(--bg);color:var(--ink);padding:0 0 0}
/* ── 상단 히어로 ── */
.utr-hero{position:relative;display:flex;align-items:flex-start;padding:52px 48px 0;gap:16px;min-height:220px}
.utr-title-col{flex:1;z-index:1}
.utr-title{font-family:var(--font-display);font-weight:800;font-size:82px;color:var(--accent);letter-spacing:-.03em;line-height:0.96}
.utr-tagline{margin-top:14px;font-size:14px;font-weight:500;color:var(--ink-2);line-height:1.55}
.utr-img-wrap{flex:0 0 200px;width:200px;align-self:flex-end}
.utr-hero-img{width:200px;height:260px;object-fit:cover;border-radius:120px 120px 0 0;display:block}
/* ── 헤어라인 (히어로 하단) ── */
.utr-divider-top{margin:28px 48px 0;border:none;border-top:2px solid var(--ink);opacity:.8}
/* ── 스텝 행 리스트 ── */
.utr-rows{padding:0 48px}
.utr-row{position:relative;padding:30px 0 28px;border-bottom:1px solid color-mix(in srgb,var(--ink) 18%,transparent)}
.utr-label{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--accent);letter-spacing:.06em;line-height:1}
.utr-desc{margin-top:12px;font-size:16px;color:var(--ink);line-height:1.65;max-width:72%}
.utr-desc .em{color:var(--accent);font-weight:700}
/* 우측 인용부호 장식 */
.utr-quote{position:absolute;right:0;top:50%;transform:translateY(-50%);font-family:var(--font-display);font-weight:800;font-size:56px;line-height:1;color:color-mix(in srgb,var(--accent) 28%,transparent);user-select:none;pointer-events:none}
/* ── 마무리 ── */
.utr-closer{padding:36px 48px 52px;font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--ink);line-height:1.4;text-align:center}
.utr-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="utr">
  <div class="utr-hero">
    <div class="utr-title-col">
      <h2 class="utr-title">${richSafe(d.title ?? 'HOW TO<br>USE')}</h2>
      ${d.tagline ? `<p class="utr-tagline">${esc(d.tagline)}</p>` : ''}
    </div>
    <div class="utr-img-wrap">
      ${media(d.heroImage, 'utr-hero-img', '제품 이미지')}
    </div>
  </div>
  <hr class="utr-divider-top">
  <div class="utr-rows">
    ${d.steps
      .map(
        (s, i) => `
    <div class="utr-row">
      <div class="utr-label">${esc(s.label ?? `STEP  ${pad2(i + 1)}`)}</div>
      <div class="utr-desc">${richSafe(s.desc)}</div>
      <span class="utr-quote">&rdquo;</span>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="utr-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
