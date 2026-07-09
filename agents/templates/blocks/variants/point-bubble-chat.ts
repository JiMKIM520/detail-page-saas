/** POINT 아키타입: point-bubble-chat.
 *  201_문제제기_07 패턴 흡수.
 *  크림 베이지 배경 + 서브타이틀·대형 문제 헤드라인 + 꼬리 달린 말풍선 카드 4개(좌우 교차)
 *  + 대형 라운드 사진 + 따옴표 강조 인용 블록. 고객 고민을 채팅 형식으로 시각화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subtitle: z.string().min(1),             // 상단 서브타이틀 (em 허용)
  headline: z.string().min(1),             // 대형 문제 헤드라인 (em,br 허용)
  bubbles: z
    .array(z.object({ text: z.string().min(1) }))
    .min(2)
    .max(6),                               // 말풍선 리스트 아이템 (순서대로 좌→우 교차)
  image: z.string().optional(),            // 대형 라운드 사진 (url)
  quoteMain: z.string().min(1),            // 따옴표 강조 대형 텍스트 (em,br 허용)
  quoteSub: z.string().optional(),         // 따옴표 블록 아래 보조 문장 (em,br 허용)
})
type Data = z.infer<typeof schema>

export const pointBubbleChat = defineBlock<Data>({
  id: 'point-bubble-chat',
  archetype: 'point',
  // noimg-safe: 이미지 없을 때 사진 프레임을 숨겨 레이아웃 붕괴 방지
  styleTags: ['light', 'editorial', 'warm', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '고객 고민 문제제기 블록. 크림 베이지 배경 + 올리브 서브타이틀 + 대형 헤드라인 + 말풍선 꼬리(좌우 교차) 채팅 카드 리스트 + 라운드 사진 + 대형 따옴표 인용. 뷰티·헤어·건강 카테고리 공감형 섹션.',
  schema,
  css: `
.pbc{background:var(--bg,#ebeadd);padding:64px 0 72px;color:var(--ink)}
.pbc-hd{padding:0 var(--pad-x,56px) 48px}
.pbc-sub{font-family:var(--font-display);font-weight:600;font-size:clamp(18px,2.6vw,22px);color:var(--accent-d,#656640);letter-spacing:.01em;margin-bottom:16px}
.pbc-sub .em{color:var(--accent)}
.pbc-hl{font-family:var(--font-display);font-weight:700;font-size:clamp(36px,5.2vw,56px);line-height:1.18;letter-spacing:-.02em}
.pbc-hl .em{color:var(--accent)}
.pbc-bubbles{padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:0}
.pbc-row{display:flex;flex-direction:column;margin-bottom:4px}
/* 짝수(right) 정렬 */
.pbc-row.right{align-items:flex-end}
.pbc-row.left{align-items:flex-start}
/* 말풍선 카드 본체 */
.pbc-card{
  display:inline-flex;align-items:center;
  padding:18px 26px;
  border-radius:calc(var(--r-scale,1)*16px);
  font-family:var(--font-body);font-weight:500;font-size:clamp(15px,2vw,19px);
  line-height:1.45;color:var(--ink);
  max-width:84%;
}
.pbc-card.c-a{background:#abb393}
.pbc-card.c-b{background:#cec5b6}
/* 꼬리 삼각형 — 인라인 SVG로 제거 가능한 독립 요소 */
.pbc-tail{width:28px;height:20px;display:block;margin-top:-2px}
.pbc-row.left  .pbc-tail{margin-left:20px}
.pbc-row.right .pbc-tail{margin-right:20px}
/* 이미지 영역 */
.pbc-img-wrap{padding:52px var(--pad-x,56px) 0}
.pbc-img{
  width:100%;
  aspect-ratio:16/9;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*48px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent,#656640) 8%,transparent);
}
.pbc-img img,.pbc-img .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* 따옴표 블록 */
.pbc-quote-wrap{padding:56px var(--pad-x,56px) 0;text-align:center}
.pbc-qdeco{display:flex;justify-content:center;gap:4px;margin-bottom:20px}
.pbc-qdeco svg{width:22px;height:15px;fill:var(--ink)}
.pbc-qline{width:60px;height:1.5px;background:var(--ink,#111);opacity:.25;margin:18px auto 0}
.pbc-qmain{font-family:var(--font-display);font-weight:700;font-size:clamp(28px,4.2vw,46px);line-height:1.35;letter-spacing:-.02em}
.pbc-qmain .em{color:var(--accent)}
.pbc-qsub{margin-top:18px;font-family:var(--font-display);font-weight:400;font-size:clamp(20px,2.8vw,30px);line-height:1.45;color:var(--ink-2,#444)}
.pbc-qsub .em{color:var(--accent)}
`,
  render: (d, { richSafe }) => {
    // 좌우 교차 색상: 홀수 인덱스 → c-a(sage), 짝수 → c-b(taupe)
    // 꼬리 방향: left 카드는 왼쪽 아래, right 카드는 오른쪽 아래
    const bubbleRows = d.bubbles
      .map((b, i) => {
        const side = i % 2 === 0 ? 'left' : 'right'
        const colorCls = i % 2 === 0 ? 'c-a' : 'c-b'
        const tailFill = i % 2 === 0 ? '#abb393' : '#cec5b6'
        // 꼬리 삼각형: left = 왼쪽 정렬(▼ 왼쪽), right = 오른쪽 정렬(▼ 오른쪽)
        const tailSvg =
          side === 'left'
            ? `<svg class="pbc-tail" viewBox="0 0 28 20" fill="none"><polygon points="6,0 28,0 6,20" fill="${tailFill}"/></svg>`
            : `<svg class="pbc-tail" viewBox="0 0 28 20" fill="none"><polygon points="0,0 22,0 22,20" fill="${tailFill}"/></svg>`
        return `
  <div class="pbc-row ${side}">
    <div class="pbc-card ${colorCls}">${richSafe(b.text)}</div>
    ${tailSvg}
  </div>`
      })
      .join('')

    // 이미지: 없으면 wrapper 자체를 숨겨 레이아웃 보존 (noimg-safe)
    const imgBlock = `
  <div class="pbc-img-wrap"${!d.image ? ' style="display:none"' : ''}>
    <div class="pbc-img">${media(d.image, '', '제품 이미지')}</div>
  </div>`

    return `
<section class="pbc">
  <div class="pbc-hd">
    <p class="pbc-sub">${richSafe(d.subtitle)}</p>
    <h2 class="pbc-hl">${richSafe(d.headline)}</h2>
  </div>
  <div class="pbc-bubbles">${bubbleRows}
  </div>${imgBlock}
  <div class="pbc-quote-wrap">
    <div class="pbc-qdeco">
      <svg viewBox="0 0 22 16"><path d="M0 10C0 5 2.5 1.5 8 0L9.5 2C6.5 3.2 5 5.5 5 8h4v8H0zM12 10C12 5 14.5 1.5 20 0L21.5 2C18.5 3.2 17 5.5 17 8h4v8H12z"/></svg>
    </div>
    <p class="pbc-qmain">${richSafe(d.quoteMain)}</p>
    ${d.quoteSub ? `<div class="pbc-qline"></div><p class="pbc-qsub">${richSafe(d.quoteSub)}</p>` : ''}
  </div>
</section>`
  },
})
