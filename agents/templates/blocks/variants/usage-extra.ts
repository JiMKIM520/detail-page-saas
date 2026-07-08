/** USAGE 아키타입 추가 변형(템플릿 충실 재현): 05_사용법.
 *  usage-flow(_10 라이트 타원번호+풀폭이미지+중앙설명 세로 플로우),
 *  usage-dark(_03 다크 리본+좌썸네일·우STEP/설명·아이콘).
 *  와디즈 200섹션 패턴을 토큰 기반으로 재구성(클론 아님). 어떤 프리셋이든 적응. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

// ── usage-flow (_10: 라이트 중앙정렬 + 타원 번호배지 + 풀폭 이미지 밴드 + 중앙 설명) ──
const flowSchema = z.object({
  title: z.string().min(1).optional(), // 기본 "HOW TO USE"
  subtitle: z.string().min(1).optional(),
  steps: z
    .array(z.object({ image: z.string().optional(), text: z.string().min(1) }))
    .min(2)
    .max(5),
  closer: z.string().min(1).optional(), // em,br
})
type FlowData = z.infer<typeof flowSchema>

export const usageFlow = defineBlock<FlowData>({
  id: 'usage-flow',
  archetype: 'usage',
  styleTags: ['premium', 'light', 'template', 'howto', 'centered'],
  imageSlots: 5,
  describe:
    '사용법(라이트 세로 플로우). 중앙정렬 + 세리프 대제목(HOW TO USE) + 단계별 타원 번호배지·풀폭 이미지·2줄 중앙 설명 + 마무리. 이미지 중심 단계 가이드.',
  schema: flowSchema,
  css: `
.uf{background:var(--bg);color:var(--ink);padding:56px 0 60px;text-align:center}
.uf-title{font-family:var(--font-serif);font-weight:700;font-size:60px;color:var(--accent);letter-spacing:.02em;line-height:1.02}
.uf-sub{margin-top:10px;font-size:16px;font-weight:600;color:var(--ink)}
.uf-steps{margin-top:14px}
.uf-step{padding-top:42px}
.uf-step + .uf-step{margin-top:30px;border-top:1px solid var(--line)}
.uf-no{width:90px;height:56px;margin:0 auto;border:1.5px solid var(--ink);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-weight:700;font-size:26px;color:var(--ink)}
.uf-img{width:calc(100% - 48px);height:200px;object-fit:cover;margin:22px 24px 0;border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px))}
.uf-t{margin-top:20px;padding:0 var(--pad-x,56px);font-size:16px;color:var(--muted);line-height:1.7}
.uf-closer{margin-top:48px;padding:0 var(--pad-x,56px);font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.45}
.uf-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="uf">
  <h2 class="uf-title">${esc(d.title ?? 'HOW TO USE')}</h2>
  ${d.subtitle ? `<p class="uf-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="uf-steps">
    ${d.steps
      .map(
        (s, i) => `
    <div class="uf-step">
      <div class="uf-no">${pad2(i + 1)}</div>
      ${media(s.image, 'uf-img', '사용법 단계')}
      <p class="uf-t">${richSafe(s.text)}</p>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="uf-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})

// ── usage-dark (_03: 다크 + 상단 리본 + 좌측 썸네일·우측 STEP/설명·아이콘) ──
const darkSchema = z.object({
  title: z.string().min(1).optional(), // 기본 "HOW TO USE"
  subtitle: z.string().min(1).optional(),
  steps: z
    .array(
      z.object({
        image: z.string().optional(),
        label: z.string().min(1).optional(), // 기본 "STEP 0N"
        text: z.string().min(1),
        icon: z.enum(ICON_NAMES).optional(),
      }),
    )
    .min(2)
    .max(5),
  closer: z.string().min(1).optional(), // em,br
})
type DarkData = z.infer<typeof darkSchema>

export const usageDark = defineBlock<DarkData>({
  id: 'usage-dark',
  archetype: 'usage',
  styleTags: ['premium', 'dark', 'template', 'howto'],
  imageSlots: 5,
  describe:
    '사용법(다크 럭셔리). 상단 리본 + 흰 대제목 + 단계별 좌측 썸네일·우측 STEP 라벨/설명·아이콘 행 + 마무리. 다크 블록(명암 리듬용).',
  schema: darkSchema,
  css: `
.ud{background:var(--ink);color:#fff;padding:0 0 54px}
.ud-ribbon{background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.14em;padding:11px 0;text-align:center;overflow:hidden;white-space:nowrap}
.ud-hd{text-align:center;padding:38px var(--pad-x,56px) 4px}
.ud-title{font-family:var(--font-display);font-weight:800;font-size:60px;color:#fff;letter-spacing:-.01em;line-height:1.02}
.ud-sub{margin-top:10px;font-size:15px;color:rgba(255,255,255,.7)}
.ud-steps{margin-top:24px}
.ud-step{display:flex;align-items:center;border-top:1px solid rgba(255,255,255,.14)}
.ud-step:last-child{border-bottom:1px solid rgba(255,255,255,.14)}
.ud-thumb{flex:0 0 200px;width:200px;height:190px;object-fit:cover}
/* 썸네일 없는 구성(전 스텝 텍스트형) — 행 높이 보정 */
.ud-step--noimg .ud-body{padding:22px}
.ud-body{flex:1;padding:0 22px}
.ud-l{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--accent)}
.ud-t{margin-top:8px;font-size:14px;color:rgba(255,255,255,.72);line-height:1.6}
.ud-t .em{color:#fff;font-weight:700}
.ud-ic{flex:0 0 44px;padding-right:40px;color:var(--accent);display:grid;place-items:center}
.ud-ic svg{width:30px;height:30px}
.ud-closer{margin-top:44px;text-align:center;padding:0 var(--pad-x,56px);font-family:var(--font-display);font-weight:800;font-size:28px;color:#fff;line-height:1.45}
.ud-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 일부 스텝에만 이미지가 있으면 절름발이 레이아웃이 된다 — 전 스텝에 있을 때만 썸네일 렌더
    const withThumbs = d.steps.every((s) => Boolean(s.image))
    return `
<section class="ud">
  <div class="ud-ribbon">STEP BY STEP &nbsp;·&nbsp; HOW TO USE &nbsp;·&nbsp; STEP BY STEP &nbsp;·&nbsp; HOW TO USE &nbsp;·&nbsp; STEP BY STEP</div>
  <div class="ud-hd">
    <h2 class="ud-title">${esc(d.title ?? 'HOW TO USE')}</h2>
    ${d.subtitle ? `<p class="ud-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ud-steps">
    ${d.steps
      .map(
        (s, i) => `
    <div class="ud-step${withThumbs ? '' : ' ud-step--noimg'}">
      ${withThumbs ? media(s.image, 'ud-thumb', '사용법 단계') : ''}
      <div class="ud-body">
        <div class="ud-l">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</div>
        <div class="ud-t">${richSafe(s.text)}</div>
      </div>
      ${s.icon ? `<span class="ud-ic">${icon(s.icon)}</span>` : ''}
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="ud-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
