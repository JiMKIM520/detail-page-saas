/** CS 아키타입: shipping-speed-hero.
 *  [끝판왕] CS 구성 #17 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 브랜드 컬러 배경 + 박스 뱃지 포함 대형 헤드라인
 *  + 중앙 일러스트 이미지 + 강조 서브 텍스트 + 4단계 타임라인 진행 표시.
 *  "빠른배송" 섹션 히어로 전용. dark 배경이므로 .em override 필요. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 헤드라인 첫 줄 (예: "지금 결제하면") */
  headlineTop: z.string().min(1),
  /** 헤드라인 박스 뱃지 강조 문구 (예: "내일 도착!") */
  headlineBadge: z.string().min(1),
  /** 중앙 일러스트/이미지 URL (트럭+박스 등 배송 이미지) */
  heroImage: z.string().optional(),
  /** 이미지 alt */
  heroImageAlt: z.string().optional(),
  /** 서브 본문 (em 허용 — 조건+결과 문장, 예: "밤 11시 59분까지 결제하면 검수 합격한 보관 상품이 <span class=\"em\">내일 도착!</span>") */
  body: z.string().min(1),
  /** 4단계 타임라인 항목 (3~5개) */
  steps: z
    .array(
      z.object({
        /** 단계 레이블 (예: "검수 합격한\n보관 상품") */
        label: z.string().min(1),
        /** 이 단계가 핵심 강조 단계인지 (점 색상·굵기 차별) */
        highlight: z.boolean().optional(),
      }),
    )
    .min(3)
    .max(5),
})
type Data = z.infer<typeof schema>

export const shippingSpeedHero = defineBlock<Data>({
  id: 'shipping-speed-hero',
  archetype: 'shipping' as any,
  styleTags: ['brand-bg', 'centered', 'hero', 'fast-delivery', 'timeline', 'cs', 'vivid'],
  imageSlots: 1,
  describe:
    '빠른배송 히어로(대형). 풀블리드 브랜드 컬러 배경 + 아웃라인 박스 뱃지 강조 대형 헤드라인 + 중앙 배송 일러스트 이미지(1슬롯) + 조건부 강조 서브 본문 + 하단 3~5단계 도트 타임라인. "지금 결제하면 내일 도착!" 패턴.',
  schema,
  css: `
/* ── shipping-speed-hero — 접두사 ssph- ── */

/* 전체 섹션: 풀블리드 브랜드 배경 */
.ssph{
  background:var(--accent);
  color:#fff;
  padding:56px 40px 52px;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
}

/* 헤드라인 블록 */
.ssph-headline{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
  margin-bottom:36px;
}

/* 헤드라인 첫 줄 */
.ssph-head-top{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,7.6vw,54px);
  line-height:1.12;
  letter-spacing:-.025em;
  color:#fff;
}

/* 뱃지 라인: 아웃라인 박스 + 대형 텍스트 */
.ssph-head-badge{
  display:inline-block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(40px,8.6vw,62px);
  line-height:1.06;
  letter-spacing:-.03em;
  color:#fff;
  border:4px solid #fff;
  border-radius:12px;
  padding:6px 28px 8px;
}

/* 중앙 이미지 */
.ssph-img{
  width:clamp(220px,60%,340px);
  aspect-ratio:1/1;
  object-fit:contain;
  display:block;
  margin-bottom:28px;
}
.ssph-img.ph{
  width:clamp(220px,60%,340px);
  aspect-ratio:1/1;
  border:2px dashed rgba(255,255,255,.35);
  background:rgba(255,255,255,.10);
  color:rgba(255,255,255,.55);
  border-radius:12px;
  margin-bottom:28px;
}

/* 서브 본문 */
.ssph-body{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:clamp(16px,3.2vw,20px);
  font-weight:500;
  line-height:1.7;
  color:rgba(255,255,255,.9);
  margin-bottom:40px;
  max-width:520px;
}
/* 다크(브랜드) 배경: .em은 흰색으로 override — 전역 accent-d는 대비 낮음 */
.ssph-body .em{
  color:#fff;
  font-weight:800;
}

/* 타임라인 */
.ssph-timeline{
  display:flex;
  align-items:flex-start;
  justify-content:center;
  gap:0;
  width:100%;
  max-width:520px;
}

/* 각 단계 */
.ssph-step{
  display:flex;
  flex-direction:column;
  align-items:center;
  flex:1;
  position:relative;
}

/* 단계 연결 라인 (마지막 제외) */
.ssph-step:not(:last-child)::after{
  content:'';
  position:absolute;
  top:7px;
  left:calc(50% + 8px);
  right:calc(-50% + 8px);
  height:2px;
  background:rgba(255,255,255,.35);
}

/* 도트 */
.ssph-dot{
  width:16px;
  height:16px;
  border-radius:50%;
  background:rgba(255,255,255,.4);
  margin-bottom:10px;
  flex-shrink:0;
  position:relative;
  z-index:1;
}
.ssph-step.hi .ssph-dot{
  background:#fff;
  box-shadow:0 0 0 4px rgba(255,255,255,.25);
}

/* 단계 레이블 */
.ssph-step-label{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:12px;
  font-weight:500;
  line-height:1.45;
  color:rgba(255,255,255,.65);
  text-align:center;
  white-space:pre-line;
}
.ssph-step.hi .ssph-step-label{
  color:#fff;
  font-weight:800;
}
`,
  render: (d, { esc, richSafe }) => {
    const stepsHtml = d.steps
      .map(
        (s) =>
          `<div class="ssph-step${s.highlight ? ' hi' : ''}">
        <div class="ssph-dot"></div>
        <span class="ssph-step-label">${esc(s.label)}</span>
      </div>`,
      )
      .join('')

    return `
<section class="ssph">
  <div class="ssph-headline">
    <span class="ssph-head-top">${esc(d.headlineTop)}</span>
    <span class="ssph-head-badge">${esc(d.headlineBadge)}</span>
  </div>
  ${media(d.heroImage, 'ssph-img', esc(d.heroImageAlt ?? '빠른배송 일러스트'))}
  <p class="ssph-body">${richSafe(d.body)}</p>
  <div class="ssph-timeline">
    ${stepsHtml}
  </div>
</section>`
  },
})
