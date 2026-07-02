/** CS/DETAIL 아키타입: reason-zebra-rows.
 *  [끝판왕] CS 구성 #5 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 청회색(--bg) 배경 + 좌측 accent 세로선이 있는 챕터 번호 헤더
 *  + 우하단 오프셋 흰카드 + 번호·설명 zebra 교번 행(흰/크림) 3~5개.
 *  "제품을 사용해야 하는 이유" 같은 근거 나열형 CS 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 챕터 번호 레이블 (예: "01", "CHAPTER 01") */
  chapterNumber: z.string().min(1),
  /** 섹션 제목 — 2줄 지원 (em/br 허용) */
  title: z.string().min(1),
  /** zebra 행 항목 (3~5개). 홀수=흰색, 짝수=크림색 */
  items: z
    .array(
      z.object({
        /** 행 번호 레이블 (예: "01", "02") */
        num: z.string().min(1),
        /** 설명 텍스트 (em 허용) */
        desc: z.string().min(1),
      }),
    )
    .min(3)
    .max(5),
})
type Data = z.infer<typeof schema>

export const reasonZebraRows = defineBlock<Data>({
  id: 'reason-zebra-rows',
  archetype: 'detail',
  styleTags: ['light', 'cs', 'reason', 'zebra', 'chapter', 'template'],
  imageSlots: 0,
  describe:
    'CS 근거 나열형. 밝은 청회색(--bg) 배경 + accent 세로선 챕터번호 헤더(좌) + 우하단 오프셋 흰카드 안에 번호·설명 zebra 교번 행(흰/크림) 3~5개. 제품 사용 이유·효과·포인트 열거에 적합.',
  schema,
  css: `
/* reason-zebra-rows — 접두사 rzr- */

/* 라이트 배경 블록: --bg, 본문 --ink, 보조 --muted, 번호 --accent-d */
.rzr{
  background:var(--bg);
  color:var(--ink);
  padding:56px 40px 64px;
  position:relative;
}

/* 챕터 헤더 (좌): accent 세로선 + 번호 + 제목 */
.rzr-header{
  position:relative;
  padding-left:20px;
  margin-bottom:40px;
  max-width:52%;
}
.rzr-header::before{
  content:'';
  position:absolute;
  left:0;
  top:4px;
  bottom:4px;
  width:4px;
  background:var(--accent-d);
  border-radius:2px;
}
.rzr-chapter{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,6vw,44px);
  line-height:1.1;
  letter-spacing:-.01em;
  color:var(--accent-d);
  margin-bottom:4px;
}
.rzr-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,4vw,28px);
  line-height:1.35;
  letter-spacing:-.015em;
  color:var(--ink);
}
.rzr-title .em{color:var(--accent-d)}

/* 오프셋 흰카드 (우하단으로 시작, 좌측 여백으로 오프셋 느낌) */
.rzr-card{
  background:#fff;
  border-radius:4px;
  overflow:hidden;
  margin-left:16px;
  box-shadow:0 2px 12px rgba(0,0,0,.06);
}

/* zebra 행 */
.rzr-row{
  display:flex;
  align-items:center;
  gap:20px;
  padding:18px 28px;
  background:#fff;
}
/* 짝수 행(0-indexed): 크림색 */
.rzr-row:nth-child(even){
  background:#fdf6e3;
}
/* 행 구분선 */
.rzr-row+.rzr-row{
  border-top:1px solid rgba(0,0,0,.06);
}

/* 번호 레이블 */
.rzr-num{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(15px,3vw,20px);
  letter-spacing:.01em;
  color:var(--accent-d);
  min-width:36px;
  flex-shrink:0;
}

/* 설명 텍스트 */
.rzr-desc{
  font-family:var(--font-body);
  font-weight:600;
  font-size:clamp(14px,2.8vw,17px);
  line-height:1.55;
  color:var(--ink);
  letter-spacing:-.005em;
}
.rzr-desc .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map(
        (it) => `
    <div class="rzr-row">
      <span class="rzr-num">${esc(it.num)}</span>
      <span class="rzr-desc">${richSafe(it.desc)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="rzr">
  <div class="rzr-header">
    <p class="rzr-chapter">${esc(d.chapterNumber)}</p>
    <h2 class="rzr-title">${richSafe(d.title)}</h2>
  </div>
  <div class="rzr-card">
    ${rows}
  </div>
</section>`
  },
})
