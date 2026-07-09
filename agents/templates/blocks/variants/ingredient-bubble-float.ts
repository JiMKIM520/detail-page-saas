/** INGREDIENT 아키타입: ingredient-bubble-float
 * 형광 뱃지 + 다크 대형 헤드라인 + 말풍선 꼬리 달린 플로팅 pill 성분 태그 3~5개.
 * 피그마 144_성분소개_02 구조 흡수 — 불규칙 좌우 배치와 세모 꼬리가 핵심 장치.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const bubbleSchema = z.object({
  badge: z.string().optional(),           // 상단 형광 뱃지 라벨 (기본: "성분안내")
  title: z.string().min(1),              // (em,br) 대형 헤드라인
  subtitle: z.string().optional(),        // 서브 카피 (순수 텍스트)
  bubbles: z.array(
    z.object({
      label: z.string().min(1),           // 성분명 (pill 내부 텍스트, em 허용)
      align: z.enum(['left', 'right', 'center']).optional(), // 배치 방향 힌트
    })
  ).min(2).max(5),
})
type BubbleData = z.infer<typeof bubbleSchema>

export const ingredientBubbleFloat = defineBlock<BubbleData>({
  id: 'ingredient-bubble-float',
  archetype: 'ingredient',
  styleTags: ['dark', 'food', 'health', 'premium'],
  imageSlots: 0,
  describe:
    '다크 배경 + 상단 형광 pill 뱃지 + 중앙 대형 헤드라인 + 말풍선 꼬리(세모)가 달린 흰색 pill 성분 태그 2~5개가 불규칙 좌우로 플로팅. 건강기능식품·뷰티 성분 소개에 최적. 이미지 없이 독립 동작(noimg-safe).',
  schema: bubbleSchema,
  css: `
/* ── ingredient-bubble-float (prefix: iehv) ── */
.iehv{
  position:relative;
  padding:72px var(--pad-x,56px) 80px;
  background:var(--brand);
  text-align:center;
  overflow:hidden;
}
/* 다크 섹션 em 스코프 오버라이드 */
.iehv .em{color:var(--em-dark,#FFF7EA)}

/* 형광 뱃지 */
.iehv-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#E4FF00;
  color:#0a0a0a;
  font-family:var(--font-display);
  font-weight:700;
  font-size:17px;
  line-height:1;
  padding:10px 22px;
  border-radius:999px;
  letter-spacing:.03em;
  margin-bottom:36px;
}

/* 타이틀 영역 */
.iehv-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:52px;
  line-height:1.2;
  color:#ffffff;
  margin-bottom:20px;
}
.iehv-sub{
  font-family:var(--font-body);
  font-size:20px;
  font-weight:500;
  line-height:1.65;
  color:rgba(255,255,255,.7);
  margin-bottom:52px;
}

/* 버블 컨테이너 — 세로 스택, 각 버블은 자체 x-오프셋으로 불규칙 배치 */
.iehv-bubbles{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:0;
  padding:0 0 4px;
}

/* 개별 버블 래퍼 — 꼬리 SVG를 pill 아래 붙임 */
.iehv-bwrap{
  display:inline-flex;
  flex-direction:column;
  align-items:center;
  margin-bottom:28px;
}
.iehv-bwrap:last-child{margin-bottom:0}

/* 불규칙 x-위치 (순서별 오프셋) */
.iehv-bwrap:nth-child(1){align-self:flex-start;margin-left:calc(var(--pad-x,56px)*0)}
.iehv-bwrap:nth-child(2){align-self:flex-end;margin-right:calc(var(--pad-x,56px)*0)}
.iehv-bwrap:nth-child(3){align-self:flex-start;margin-left:calc(var(--pad-x,56px)*.4)}
.iehv-bwrap:nth-child(4){align-self:flex-end;margin-right:calc(var(--pad-x,56px)*.2)}
.iehv-bwrap:nth-child(5){align-self:center}

/* 흰색 pill */
.iehv-pill{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#ffffff;
  border-radius:999px;
  padding:14px 32px;
  font-family:var(--font-display);
  font-weight:700;
  font-size:22px;
  line-height:1;
  color:var(--accent-d);
  white-space:nowrap;
}

/* 말풍선 꼬리 SVG (아래 방향 세모) */
.iehv-tail{
  display:block;
  width:24px;
  height:14px;
  flex-shrink:0;
}
`,
  render: (d, { esc, richSafe }) => {
    const badge = d.badge ?? '성분안내'

    const bubbleItems = d.bubbles.map((b, i) => `
    <div class="iehv-bwrap" style="--i:${i}">
      <div class="iehv-pill">${richSafe(b.label)}</div>
      <svg class="iehv-tail" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 0h16L12 14 4 0z" fill="#ffffff"/>
      </svg>
    </div>`).join('')

    return `
<section class="iehv">
  <div class="iehv-badge">${esc(badge)}</div>
  <h2 class="iehv-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="iehv-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="iehv-bubbles" role="list" aria-label="주요 성분">
${bubbleItems}
  </div>
</section>`
  },
})
