/** STATS 아키타입(템플릿 충실 재현): stats-emoji-stack.
 *  Figma 02_수치강조 / 1279:517
 *  다크 그라디언트 배경 + pill 라벨 + 대형 숫자 헤드라인
 *  + 3D 이모지/일러스트 아이콘 3개를 각 수치 위 중앙에 쌓은 스택 구조.
 *  제품 이미지 없음. 기존 stats-highlight(아이콘 카드행)·stats-figures(심볼+구분선)와
 *  다른 3D 이모지 센터 스택 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statItemSchema = z.object({
  emoji: z.string().optional(),    // 3D 이모지/일러스트 이미지 URL
  label: z.string().min(1),        // 수치 항목명 (예: "만족도 평점")
  value: z.string().min(1),        // 수치 값 헤드라인 (em, br)
})

const schema = z.object({
  pill: z.string().optional(),     // pill 라벨 텍스트 (예: "누적 판매량")
  headline: z.string().min(1),     // 대형 숫자 헤드라인 (em, br)  예: "10,000건!"
  items: z.array(statItemSchema).min(2).max(4),
})
type Data = z.infer<typeof schema>

export const statsEmojiStack = defineBlock<Data>({
  id: 'stats-emoji-stack',
  archetype: 'stats' as any,
  styleTags: ['dark', 'impact', 'cobalt', 'template', 'bold'],
  imageSlots: 3,
  describe:
    '3D 이모지 센터 스택형 수치 강조. 다크 그라디언트 배경 + pill 라벨 + 대형 숫자 헤드라인 + 3D 이모지/일러스트 이미지 아이콘 각 수치 위 중앙 배치(2~4개). 제품 이미지 없음. 누적 판매량·리뷰·매출 등 주요 수치 나열에 적합.',
  schema,
  css: `
/* ses = stats-emoji-stack 접두사 */
.ses{
  background:var(--brand);
  color:#fff;
  padding:56px 0 64px;
  text-align:center;
  position:relative;
  overflow:hidden;
}

/* 배경 광채 */
.ses::before{
  content:'';
  position:absolute;
  top:38%;
  left:50%;
  transform:translate(-50%,-50%);
  width:600px;
  height:400px;
  background:radial-gradient(ellipse at center,color-mix(in srgb,var(--accent) 18%,transparent) 0%,transparent 70%);
  pointer-events:none;
}

/* pill 라벨 */
.ses-pill{
  display:inline-block;
  border:2px solid var(--accent);
  color:var(--accent);
  font-size:17px;
  font-weight:800;
  padding:8px 26px;
  border-radius:999px;
  letter-spacing:.04em;
  margin-bottom:22px;
}

/* 대형 숫자 헤드라인 */
.ses-head{
  font-family:var(--font-display);
  font-weight:800;
  font-size:72px;
  line-height:1.08;
  letter-spacing:-.02em;
  color:#fff;
  padding:0 40px;
}
.ses-head .em{color:var(--accent)}

/* 구분선 */
.ses-divider{
  width:60%;
  height:1px;
  background:rgba(255,255,255,.14);
  margin:40px auto 0;
}

/* 수치 아이템 스택 */
.ses-stack{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
  margin-top:0;
  padding:0 48px;
}

/* 개별 수치 아이템 */
.ses-item{
  width:100%;
  padding:36px 0 28px;
  border-bottom:1px solid rgba(255,255,255,.1);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
}
.ses-item:last-child{border-bottom:none}

/* 3D 이모지 이미지 */
.ses-emoji{
  width:100px;
  height:100px;
  object-fit:contain;
  display:block;
  margin:0 auto 18px;
  filter:drop-shadow(0 8px 20px rgba(0,0,0,.45));
}
.ses-emoji.ph{
  background:rgba(255,255,255,.06);
  border:2px dashed rgba(255,255,255,.2);
  border-radius:50%;
  color:rgba(255,255,255,.3);
  font-size:12px;
}

/* 수치 라벨 */
.ses-label{
  font-size:15px;
  font-weight:600;
  color:rgba(255,255,255,.6);
  letter-spacing:.03em;
  margin-bottom:10px;
}

/* 수치 값 헤드라인 */
.ses-value{
  font-family:var(--font-display);
  font-weight:800;
  font-size:34px;
  line-height:1.18;
  color:#fff;
  letter-spacing:-.01em;
}
.ses-value .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ses">
  ${d.pill ? `<div><span class="ses-pill">${esc(d.pill)}</span></div>` : ''}
  <h2 class="disp ses-head">${richSafe(d.headline)}</h2>
  <div class="ses-divider"></div>
  <div class="ses-stack">
    ${d.items
      .map(
        (it) => `
    <div class="ses-item">
      ${media(it.emoji, 'ses-emoji', esc(it.label))}
      <div class="ses-label">${esc(it.label)}</div>
      <div class="ses-value">${richSafe(it.value)}</div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
