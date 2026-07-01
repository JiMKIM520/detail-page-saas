/** DETAIL 아키타입 변형(템플릿 충실 재현): 17_제품설명 _번호형 단계 + 지원 정보.
 *  detail-steps-support: 번호 배지 2열 단계 사진 + 헤드라인 + 라벨+본문 divider 행 + 아이콘 프로세스.
 *  라이트 섹션. 단계별 설치/사용법 시각화 + 구매 후 지원 정보를 한 블록에 통합. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  // ── 단계 영역 ──
  stepsEyebrow: z.string().min(1).optional(), // 예 "교체 방법"
  stepsTitle: z.string().min(1),              // em,br
  stepsSubtitle: z.string().min(1).optional(),
  steps: z
    .array(
      z.object({
        label: z.string().min(1),  // 단계 이름 (예: "기존 필터 분리")
        image: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),

  // ── 지원 정보 영역 ──
  supportTitle: z.string().min(1),    // em,br
  supportSubtitle: z.string().min(1).optional(),
  supports: z
    .array(
      z.object({
        label: z.string().min(1),   // 브래킷 라벨 (예: "고객센터", "무상보증")
        body: z.string().min(1),    // em,br 허용 본문
      }),
    )
    .min(1)
    .max(6),

  // ── AS 프로세스 영역 ──
  processTitle: z.string().min(1).optional(), // 예 "AS 접수 및 처리 프로세스"
  processSteps: z
    .array(
      z.object({
        icon: z.enum(ICON_NAMES).optional(),
        label: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})

type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const detailStepsSupport = defineBlock<Data>({
  id: 'detail-steps-support',
  archetype: 'detail' as any,
  styleTags: ['light', 'editorial', 'premium', 'template', 'process'],
  imageSlots: 4,
  describe:
    '제품 설명(단계+지원). 번호 배지 2열 단계 사진(교체법/사용법) + 구매 후 지원 헤드라인 + 브래킷 라벨·본문 divider 행 + 아이콘 AS 프로세스. 라이트 블록.',
  schema,
  css: `
.dss{background:var(--bg);color:var(--ink)}

/* ── 단계 헤더 ── */
.dss-steps-hd{padding:56px 44px 32px;text-align:center}
.dss-steps-eye{font-size:13px;font-weight:700;letter-spacing:.18em;color:var(--accent);text-transform:uppercase;margin-bottom:10px}
.dss-steps-title{font-family:var(--font-display);font-weight:800;font-size:36px;letter-spacing:-.02em;line-height:1.2;color:var(--ink)}
.dss-steps-title .em{color:var(--accent)}
.dss-steps-sub{margin-top:12px;font-size:15px;color:var(--ink-2);line-height:1.65}

/* ── 단계 그리드 (2열) ── */
.dss-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:0 44px 56px}
.dss-step{position:relative}
.dss-badge{position:absolute;top:12px;left:12px;z-index:2;width:34px;height:34px;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center;border-radius:4px}
.dss-step-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:8px}
.dss-step-label{margin-top:10px;font-size:14px;font-weight:600;color:var(--ink-2);text-align:center;letter-spacing:.01em}

/* ── 지원 정보 영역 ── */
.dss-sup{background:var(--paper);padding:54px 44px 50px}
.dss-sup-title{font-family:var(--font-display);font-weight:800;font-size:40px;letter-spacing:-.02em;line-height:1.2;color:var(--ink);margin-bottom:10px}
.dss-sup-title .em{color:var(--accent)}
.dss-sup-sub{font-size:15px;color:var(--ink-2);line-height:1.65;margin-bottom:32px}

/* divider 행 */
.dss-row{display:grid;grid-template-columns:120px 1fr;gap:20px;padding:20px 0;border-top:1px solid var(--line)}
.dss-row:last-child{border-bottom:1px solid var(--line)}
.dss-rlabel{font-size:14px;font-weight:700;color:var(--ink);white-space:nowrap}
.dss-rlabel::before{content:"["}
.dss-rlabel::after{content:"]"}
.dss-rbody{font-size:14px;color:var(--ink-2);line-height:1.72}
.dss-rbody .em{color:var(--accent);font-weight:700}

/* ── AS 프로세스 ── */
.dss-proc{background:var(--bg);padding:40px 44px 54px}
.dss-proc-title{font-size:14px;font-weight:700;color:var(--ink-2);letter-spacing:.05em;margin-bottom:28px}
.dss-proc-row{display:flex;align-items:flex-start;justify-content:center;gap:0}
.dss-proc-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative}
.dss-proc-step:not(:last-child)::after{content:"";position:absolute;top:20px;right:0;width:50%;height:1px;background:color-mix(in srgb,var(--ink) 18%,transparent)}
.dss-proc-step:not(:first-child)::before{content:"";position:absolute;top:20px;left:0;width:50%;height:1px;background:color-mix(in srgb,var(--ink) 18%,transparent)}
.dss-proc-ico{width:40px;height:40px;color:var(--accent);margin-bottom:8px}
.dss-proc-num{font-family:var(--font-display);font-weight:800;font-size:11px;letter-spacing:.1em;color:var(--muted);margin-bottom:4px}
.dss-proc-lbl{font-size:12px;font-weight:600;color:var(--ink);text-align:center;line-height:1.35}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="dss">

  <!-- 단계 헤더 -->
  <div class="dss-steps-hd">
    ${d.stepsEyebrow ? `<p class="dss-steps-eye">${esc(d.stepsEyebrow)}</p>` : ''}
    <h2 class="dss-steps-title">${richSafe(d.stepsTitle)}</h2>
    ${d.stepsSubtitle ? `<p class="dss-steps-sub">${richSafe(d.stepsSubtitle)}</p>` : ''}
  </div>

  <!-- 단계 그리드 -->
  <div class="dss-grid">
    ${d.steps
      .map(
        (s, i) => `
    <div class="dss-step">
      <span class="dss-badge">${i + 1}</span>
      ${media(s.image, 'dss-step-img', esc(s.label))}
      <p class="dss-step-label">${esc(s.label)}</p>
    </div>`,
      )
      .join('')}
  </div>

  <!-- 지원 정보 -->
  <div class="dss-sup">
    <h2 class="dss-sup-title">${richSafe(d.supportTitle)}</h2>
    ${d.supportSubtitle ? `<p class="dss-sup-sub">${richSafe(d.supportSubtitle)}</p>` : ''}
    <div class="dss-rows">
      ${d.supports
        .map(
          (r) => `
      <div class="dss-row">
        <span class="dss-rlabel">${esc(r.label)}</span>
        <span class="dss-rbody">${richSafe(r.body)}</span>
      </div>`,
        )
        .join('')}
    </div>
  </div>

  <!-- AS 프로세스 -->
  <div class="dss-proc">
    ${d.processTitle ? `<p class="dss-proc-title">${esc(d.processTitle)}</p>` : ''}
    <div class="dss-proc-row">
      ${d.processSteps
        .map(
          (ps, i) => `
      <div class="dss-proc-step">
        <div class="dss-proc-ico">${icon(ps.icon ?? 'check')}</div>
        <div class="dss-proc-num">${pad2(i + 1)}</div>
        <div class="dss-proc-lbl">${esc(ps.label)}</div>
      </div>`,
        )
        .join('')}
    </div>
  </div>

</section>`,
})
