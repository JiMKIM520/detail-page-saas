/** CALLOUT 아키타입: callout-chat-zigzag.
 *  피그마 "문제제기/16" 구조 흡수 재구성.
 *  따뜻한 베이지-브라운 전면 배경 + 상단 문제 타이틀(2줄) +
 *  SNS 채팅 스타일 좌우 교차 꼬리 말풍선 2~4개 스택 +
 *  하단 해결 질문 타이틀(2줄). 다크 섹션 em 오버라이드 적용. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 상단 보조 타이틀 (em/br 허용). 예: "예쁘지만 불편한 샌들" */
  problemLabel: z.string().min(1),
  /** 상단 주 타이틀 (em/br 허용). 예: "이런 점이 불편하셨죠?" */
  problemTitle: z.string().min(1),
  /** 좌우 교차 말풍선 고객 불만 2~4개. */
  bubbles: z
    .array(
      z.object({
        /** 말풍선 본문 (em/br 허용). 실제 고객 불만 어투 권장. */
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
  /** 하단 해결 보조 카피 (em/br 허용). 예: "하루 종일 걸어도 편안한 샌들," */
  solutionSub: z.string().optional(),
  /** 하단 해결 주 질문 (em/br 허용). 예: "찾고 있으신가요?" */
  solutionTitle: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const calloutChatZigzag = defineBlock<Data>({
  id: 'callout-chat-zigzag',
  archetype: 'callout',
  styleTags: ['dark', 'warm', 'food', 'beauty'],
  imageSlots: 0,
  describe:
    '따뜻한 베이지-브라운 전면 배경의 문제 공감 섹션. 상단 문제 타이틀(보조+주) → 좌우 교차 꼬리 SNS 채팅 말풍선 2~4개(실제 고객 불만 어투) → 하단 해결 질문 타이틀. 공감 유도 후 솔루션으로 브릿징.',
  schema,
  css: `
/* ── 섹션 래퍼 — 베이지-브라운 전면 다크 배경 ── */
.ciyz{
  background:color-mix(in srgb,var(--brand) 48%,var(--accent-d) 52%);
  padding:64px var(--pad-x,56px) 68px;
  font-family:var(--font-body,'Pretendard',sans-serif);
  color:#fff;
  text-align:center;
  overflow:hidden
}

/* ── 다크 배경 em 오버라이드 ── */
.ciyz .em{color:var(--em-dark,#FFF7EA)}

/* ── 상단 문제 타이틀 ── */
.ciyz-problem{margin-bottom:36px}
.ciyz-problem-label{
  font-size:clamp(22px,3vw,32px);
  font-weight:500;
  line-height:1.35;
  letter-spacing:-.01em;
  opacity:.92
}
.ciyz-problem-title{
  font-size:clamp(30px,4.5vw,48px);
  font-weight:700;
  line-height:1.25;
  letter-spacing:-.02em;
  margin-top:6px
}

/* ── 말풍선 스택 ── */
.ciyz-stack{
  display:flex;
  flex-direction:column;
  gap:18px;
  max-width:640px;
  margin:0 auto
}

/* ── 말풍선 행 — 꼬리 방향으로 좌/우 정렬 ── */
.ciyz-row{display:flex;align-items:flex-end}
.ciyz-row--left{justify-content:flex-start}
.ciyz-row--right{justify-content:flex-end}

/* ── 말풍선 본체 ── */
.ciyz-bubble{
  position:relative;
  background:#fff;
  color:var(--ink,#2A2118);
  border-radius:calc(var(--r-scale,1)*999px);
  padding:18px 32px;
  font-size:clamp(15px,2vw,19px);
  font-weight:500;
  line-height:1.6;
  word-break:keep-all;
  text-align:left;
  max-width:86%;
  box-shadow:0 8px 24px -8px rgba(0,0,0,.22)
}
.ciyz-bubble .em{color:var(--accent,#B85C38);font-weight:700}

/* ── 꼬리: 왼쪽(← 방향) — 왼쪽 행 말풍선 왼쪽 아래 ── */
.ciyz-row--left .ciyz-bubble::after{
  content:'';
  position:absolute;
  bottom:14px;
  left:-14px;
  width:0;height:0;
  border-top:10px solid transparent;
  border-bottom:10px solid transparent;
  border-right:14px solid #fff;
  filter:drop-shadow(-3px 2px 3px rgba(0,0,0,.10))
}

/* ── 꼬리: 오른쪽(→ 방향) — 오른쪽 행 말풍선 오른쪽 아래 ── */
.ciyz-row--right .ciyz-bubble::after{
  content:'';
  position:absolute;
  bottom:14px;
  right:-14px;
  width:0;height:0;
  border-top:10px solid transparent;
  border-bottom:10px solid transparent;
  border-left:14px solid #fff;
  filter:drop-shadow(3px 2px 3px rgba(0,0,0,.10))
}

/* ── 구분 장식: 물결 점 ── */
.ciyz-divider{
  display:flex;justify-content:center;align-items:center;
  gap:10px;
  margin:32px 0 28px
}
.ciyz-divider span{
  display:block;
  width:8px;height:8px;
  border-radius:50%;
  background:rgba(255,255,255,.5)
}
.ciyz-divider span:nth-child(2){
  width:5px;height:5px;
  opacity:.6
}
.ciyz-divider span:nth-child(3){
  width:8px;height:8px;
  opacity:.8
}

/* ── 하단 해결 타이틀 ── */
.ciyz-solution{}
.ciyz-solution-sub{
  font-size:clamp(18px,2.5vw,28px);
  font-weight:400;
  line-height:1.5;
  opacity:.9;
  word-break:keep-all
}
.ciyz-solution-title{
  font-size:clamp(30px,4.5vw,48px);
  font-weight:700;
  line-height:1.25;
  letter-spacing:-.02em;
  margin-top:6px;
  word-break:keep-all
}
`,
  render: (d, { richSafe }) => {
    // 홀수 인덱스(0,2,…) → 오른쪽 꼬리(오른쪽 정렬), 짝수 인덱스(1,3,…) → 왼쪽 꼬리(왼쪽 정렬)
    // 원본 프레임: 버블 1,3은 오른쪽 꼬리(x:79568), 버블 2,4는 왼쪽 꼬리(x:78984)
    const bubblesHtml = d.bubbles
      .map((b, i) => {
        const dir = i % 2 === 0 ? 'right' : 'left'
        return `
  <div class="ciyz-row ciyz-row--${dir}">
    <div class="ciyz-bubble">${richSafe(b.text)}</div>
  </div>`
      })
      .join('')

    return `
<section class="ciyz">
  <div class="ciyz-problem">
    <p class="ciyz-problem-label">${richSafe(d.problemLabel)}</p>
    <p class="ciyz-problem-title">${richSafe(d.problemTitle)}</p>
  </div>

  <div class="ciyz-stack">${bubblesHtml}
  </div>

  <div class="ciyz-divider">
    <span></span><span></span><span></span>
  </div>

  <div class="ciyz-solution">
    ${d.solutionSub ? `<p class="ciyz-solution-sub">${richSafe(d.solutionSub)}</p>` : ''}
    <p class="ciyz-solution-title">${richSafe(d.solutionTitle)}</p>
  </div>
</section>`
  },
})
