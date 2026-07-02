/** USAGE 아키타입(템플릿 충실 재현): usage-pill-steps.
 *  와디즈 200섹션 05_사용법 _01(HOW TO USE 헤더 배경이미지 + 타원 pill 아웃라인 배지 세로 스텝) 패턴 재구성.
 *  중앙정렬 + 영문 대제목 + 배경이미지 헤더 + 타원 outline pill 안에 STEP 번호·설명 세로 적층 + 하단 강조 마무리 배너. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  title: z.string().min(1).optional(),    // 기본 "HOW TO USE" (em,br 가능)
  subtitle: z.string().min(1).optional(), // 헤더 부제목 (em,br 가능)
  headerImage: z.string().optional(),     // 헤더 배경 이미지 (url)
  steps: z
    .array(
      z.object({
        label: z.string().min(1).optional(), // 기본 "STEP 0N"
        text: z.string().min(1),             // 스텝 설명 (em,br 가능)
      }),
    )
    .min(2)
    .max(6),
  closer: z.string().min(1).optional(),   // 하단 마무리 카피 (em,br 가능)
})
type Data = z.infer<typeof schema>

export const usagePillSteps = defineBlock<Data>({
  id: 'usage-pill-steps',
  archetype: 'usage',
  styleTags: ['light', 'centered', 'template', 'howto', 'pill', 'minimal'],
  imageSlots: 1,
  describe:
    '사용법(타원 pill 세로 스텝). 배경이미지 헤더 + 영문 대제목 + 중앙정렬 타원 outline pill 안에 STEP 번호·설명 세로 적층 + 하단 강조 마무리 배너. 심플하고 읽기 쉬운 단계 가이드.',
  schema,
  css: `
.ups{background:var(--bg);color:var(--ink)}
/* ── 헤더 영역 ── */
.ups-hdr{position:relative;text-align:center;padding:54px 40px 44px;overflow:hidden;background:var(--paper)}
.ups-hdr-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.18;display:block}
.ups-hdr.has-bg{background:var(--paper)}
.ups-hdr-inner{position:relative;z-index:1}
.ups-title{font-family:var(--font-display);font-weight:800;font-size:64px;letter-spacing:-.01em;line-height:1.04;color:var(--accent)}
.ups-sub{margin-top:14px;font-size:16px;font-weight:500;color:var(--ink-2);line-height:1.6}
.ups-sub .em{color:var(--accent);font-weight:700}
/* ── pill 스텝 목록 ── */
.ups-list{display:flex;flex-direction:column;align-items:center;gap:18px;padding:44px 40px 52px}
.ups-pill{width:100%;max-width:600px;border:2px solid var(--accent);border-radius:999px;padding:24px 40px;text-align:center;background:color-mix(in srgb,var(--accent) 5%,transparent)}
.ups-label{font-family:var(--font-display);font-weight:800;font-size:20px;letter-spacing:.06em;color:var(--accent);line-height:1}
.ups-text{margin-top:8px;font-size:15px;color:var(--ink-2);line-height:1.65}
.ups-text .em{color:var(--accent);font-weight:700}
/* ── 하단 마무리 배너 ── */
.ups-banner{background:var(--paper);border-top:1px solid var(--line);padding:36px 40px;text-align:center}
.ups-closer{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--ink);line-height:1.45}
.ups-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ups">
  <div class="ups-hdr${d.headerImage ? ' has-bg' : ''}">
    ${d.headerImage ? media(d.headerImage, 'ups-hdr-bg', '헤더 배경') : ''}
    <div class="ups-hdr-inner">
      <h2 class="ups-title">${richSafe(d.title ?? 'HOW TO USE')}</h2>
      ${d.subtitle ? `<p class="ups-sub">${richSafe(d.subtitle)}</p>` : ''}
    </div>
  </div>
  <div class="ups-list">
    ${d.steps
      .map(
        (s, i) => `
    <div class="ups-pill">
      <div class="ups-label">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</div>
      <div class="ups-text">${richSafe(s.text)}</div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<div class="ups-banner"><p class="ups-closer">${richSafe(d.closer)}</p></div>` : ''}
</section>`,
})
