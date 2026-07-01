/** POINT 아키타입: point-step-timeline-bleed.
 *  [끝판왕] 포인트 구성 #20 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 수평 numbered-dot 타임라인(도트+연결선+번호 레이블) +
 *  대형 split-weight 헤드카피(첫 어절 씬/후반 볼드) +
 *  배경→이미지 영역 vertical overflow bleed (이미지가 섹션 경계를 넘어 아래로 bleed).
 *  복잡도: medium. 뷰티/스킨케어/식품 3스텝 사용순서·효과 강조에 최적. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 eyebrow — 제품명·짧은 태그라인 */
  eyebrow: z.string().min(1),
  /** eyebrow 아래 1줄 보조 설명 (선택) */
  eyebrowSub: z.string().optional(),
  /** 타임라인 스텝 (2~4개). label은 도트 아래 표기 */
  steps: z
    .array(
      z.object({
        /** 스텝 번호 레이블 (예: "1. Teatree") */
        label: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
  /** 대형 헤드카피 — 줄1: 씬 웨이트 어절 (em 허용) */
  headThin: z.string().min(1),
  /** 대형 헤드카피 — 줄2: 볼드 핵심 어절 (em 허용) */
  headBold: z.string().min(1),
  /** 헤드 아래 bleed 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 이미지 아래 보조 카피 (em, br 허용, 선택) */
  caption: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointStepTimelineBleed = defineBlock<Data>({
  id: 'point-step-timeline-bleed',
  archetype: 'point' as any,
  styleTags: ['timeline', 'bleed', 'split-weight', 'beauty', 'step', 'template'],
  imageSlots: 1,
  describe:
    '포인트 스텝 타임라인+블리드. 수평 numbered-dot 타임라인(2~4스텝, 도트+연결선+번호 레이블) + 대형 split-weight 헤드카피(씬 줄/볼드 줄) + 배경→이미지 vertical overflow bleed. 뷰티·스킨케어·식품 사용순서/효과 강조에 최적.',
  schema,
  css: `
/* point-step-timeline-bleed — 접두사 pstb- */
.pstb{background:var(--paper);padding:52px 40px 0;text-align:center;word-break:keep-all;overflow-wrap:break-word;overflow:hidden}
/* ── eyebrow ── */
.pstb-ey{font-family:var(--font-body);font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-d);margin-bottom:6px}
.pstb-eysub{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:22px}
/* ── horizontal dot timeline ── */
.pstb-tl{position:relative;display:flex;justify-content:center;align-items:flex-start;gap:0;margin:0 auto 36px;max-width:340px}
/* connector line: behind dots, full-width stretch */
.pstb-tl::before{content:'';position:absolute;top:9px;left:calc(50% - 120px);right:calc(50% - 120px);height:1px;background:var(--line);z-index:0}
.pstb-step{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;flex:1}
.pstb-dot{width:19px;height:19px;border-radius:50%;border:2px solid var(--accent);background:var(--paper);box-sizing:border-box;margin-bottom:9px;transition:background .2s}
/* active (first) dot filled */
.pstb-step:first-child .pstb-dot{background:var(--accent)}
.pstb-lbl{font-family:var(--font-body);font-size:11.5px;font-weight:600;color:var(--ink);letter-spacing:.01em;line-height:1.3;text-align:center;white-space:pre-line}
/* ── split-weight headline ── */
.pstb-head{margin-bottom:0}
.pstb-thin{font-family:var(--font-display);font-weight:400;font-size:clamp(28px,6.5vw,42px);color:var(--ink);line-height:1.22;letter-spacing:-.01em;display:block}
.pstb-thin .em{color:var(--accent-d)}
.pstb-bold{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,8vw,52px);color:var(--ink);line-height:1.14;letter-spacing:-.025em;display:block;margin-top:2px}
.pstb-bold .em{color:var(--accent-d)}
/* ── bleed image area ── */
/* negative margin pulls image into bleed; extra bottom padding compensates */
.pstb-bleed{position:relative;margin:36px -40px 0;overflow:hidden}
.pstb-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.pstb-img.ph{width:100%;aspect-ratio:4/3;border:2px dashed var(--line);background:rgba(0,0,0,.035);color:var(--muted);border-radius:0}
/* ── caption below bleed ── */
.pstb-cap{background:var(--bg);padding:28px 40px 44px;text-align:center}
.pstb-cap-txt{font-family:var(--font-body);font-size:14px;line-height:1.7;color:var(--ink)}
.pstb-cap-txt .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    /* numbered dot timeline */
    const steps = d.steps
      .map(
        (s) =>
          `<div class="pstb-step"><div class="pstb-dot"></div><span class="pstb-lbl">${esc(s.label)}</span></div>`,
      )
      .join('')

    const caption = d.caption
      ? `<div class="pstb-cap"><p class="pstb-cap-txt">${richSafe(d.caption)}</p></div>`
      : ''

    return `
<section class="pstb">
  <p class="pstb-ey">${esc(d.eyebrow)}</p>
  ${d.eyebrowSub ? `<p class="pstb-eysub">${esc(d.eyebrowSub)}</p>` : ''}
  <div class="pstb-tl">${steps}</div>
  <div class="pstb-head">
    <span class="pstb-thin">${richSafe(d.headThin)}</span>
    <span class="pstb-bold">${richSafe(d.headBold)}</span>
  </div>
  <div class="pstb-bleed">
    ${media(d.image, 'pstb-img', esc(d.imageAlt ?? '제품 이미지'))}
  </div>
  ${caption}
</section>`
  },
})
