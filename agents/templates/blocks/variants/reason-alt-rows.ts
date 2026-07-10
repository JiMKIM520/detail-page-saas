/** REASON 아키타입: reason-alt-rows
 *  피그마 110_CS_구성_페이지_5 흡수 — 좌측 대형 번호+헤드라인, 우측 4행 교차 배경(흰/크림) 번호 리스트.
 *  민트그린 배경 + 세로 구분선 + 01~04 파란 번호 + 교차 행 — 사용 이유를 구조적으로 나열. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 순번 레이블 (예: "01"). (em) 허용. */
  sectionNum: z.string().min(1).default('01'),
  /** 좌측 대제목 (em,br 허용). */
  headline: z.string().min(1),
  /** 보조 설명 (선택). 순수 텍스트. */
  desc: z.string().optional(),
  /** 이유 항목 2~4개. */
  items: z
    .array(
      z.object({
        /** 표시 번호 (예: "01"). */
        num: z.string().min(1),
        /** 항목 설명 (em 허용). */
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const reasonAltRows = defineBlock<Data>({
  id: 'reason-alt-rows',
  archetype: 'reason',
  styleTags: ['light', 'structured', 'numbered', 'minimal'],
  imageSlots: 0,
  describe:
    '사용 이유 나열 블록. 민트그린 배경 + 좌열 대형 순번·헤드라인 + 우열 2~4행 번호 리스트(흰/크림 교차 배경). 세로 구분선으로 좌우 영역 분리. 파란 번호 강조, 구조적·설득력 있는 레이아웃.',
  schema,
  css: `
.rcle{
  background:#d4e3e1;
  padding:64px var(--pad-x,56px);
  display:flex;
  align-items:flex-start;
  gap:0;
  min-height:400px;
}
/* 좌열: 대형 순번 + 헤드라인 */
.rcle-left{
  flex:0 0 42%;
  width:42%;
  padding-right:40px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  min-height:280px;
}
.rcle-num{
  font-family:var(--font-display);
  font-weight:800;
  font-size:52px;
  line-height:1;
  color:var(--accent,#1d6cc7);
  letter-spacing:-.02em;
  margin-bottom:10px;
}
.rcle-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:36px;
  line-height:1.28;
  color:var(--ink,#111);
  word-break:keep-all;
}
.rcle-headline .em{
  color:var(--accent,#1d6cc7);
}
.rcle-desc{
  margin-top:18px;
  font-size:15px;
  font-weight:500;
  color:var(--ink-2,#555);
  line-height:1.7;
}
/* 세로 구분선 */
.rcle-divider{
  flex:0 0 1px;
  width:1px;
  background:rgba(86,84,84,.35);
  align-self:stretch;
  margin:0 2px;
}
/* 우열: 교차 배경 행 리스트 */
.rcle-right{
  flex:1;
  padding-left:36px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:0;
}
.rcle-row{
  display:flex;
  align-items:center;
  gap:20px;
  padding:18px 24px;
  border-radius:calc(var(--r-scale,1)*10px);
  margin-bottom:6px;
}
.rcle-row:last-child{
  margin-bottom:0;
}
/* 홀수(1,3) = 흰 배경, 짝수(2,4) = 크림 배경 */
.rcle-row:nth-child(odd){
  background:#ffffff;
}
.rcle-row:nth-child(even){
  background:#fff3d2;
}
.rcle-row-num{
  font-family:var(--font-display);
  font-weight:800;
  font-size:22px;
  color:var(--accent,#1d6cc7);
  letter-spacing:.01em;
  flex:0 0 36px;
  line-height:1;
}
.rcle-row-text{
  font-size:17px;
  font-weight:500;
  color:var(--ink,#111);
  line-height:1.55;
  flex:1;
  word-break:keep-all;
}
.rcle-row-text .em{
  color:var(--accent,#1d6cc7);
  font-weight:700;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="rcle">
  <div class="rcle-left">
    <span class="rcle-num">${esc(d.sectionNum)}</span>
    <h2 class="rcle-headline">${richSafe(d.headline)}</h2>
    ${d.desc ? `<p class="rcle-desc">${esc(d.desc)}</p>` : ''}
  </div>
  <div class="rcle-divider" aria-hidden="true"></div>
  <div class="rcle-right">
    ${d.items
      .map(
        (item) => `
    <div class="rcle-row">
      <span class="rcle-row-num">${esc(item.num)}</span>
      <span class="rcle-row-text">${richSafe(item.text)}</span>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
