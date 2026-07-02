/** REVIEW/REASON 아키타입: ba-painpoint-bubbles.
 *  [끝판왕] 추천·B&A #1 — 구매자 페인포인트 말풍선 목록 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 보라계 accent 배경 + 중앙정렬 섹션 제목 + 점선 수직 커넥터 + 좌우 교차 말풍선(흰 카드)
 *  + 하단 고민하는 인물 사진(선택). 구매 전 공감 유발 / 문제 제기 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 제목 (em, br 허용). 예: "구매자가 겪는<br><span class=\"em\">문제점</span>에 대해 적어주세요" */
  title: z.string().min(1),
  /** 페인포인트 말풍선 목록 (2~6개). 홀수 인덱스는 오른쪽 정렬 */
  items: z
    .array(
      z.object({
        /** 말풍선 텍스트 (em 허용) */
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
  /** 하단 고민 인물 이미지 URL (선택) */
  personImage: z.string().optional(),
  /** 인물 이미지 alt */
  personImageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const baPainpointBubbles = defineBlock<Data>({
  id: 'ba-painpoint-bubbles',
  archetype: 'reason',
  styleTags: ['dark', 'empathy', 'painpoint', 'bubbles', 'alternating', 'template'],
  imageSlots: 1,
  describe:
    '구매 전 공감 유발(페인포인트). accent 다크 배경 + 중앙 섹션 제목 + 점선 수직 커넥터 + 좌우 교차 흰 말풍선 카드(2~6개) + 하단 고민 인물 사진(선택). B&A / 추천 섹션 앞 문제 제기용.',
  schema,
  css: `
/* ba-painpoint-bubbles — 접두사 bpb- */

/* 다크(accent) 배경 블록 */
.bpb{
  background:var(--brand);
  color:#fff;
  padding:56px 32px 0;
  text-align:center;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 섹션 제목 */
.bpb-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(22px,5vw,32px);
  line-height:1.45;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:32px;
}
/* 다크 배경 — .em은 var(--accent)(밝은 포인트)로 override */
.bpb-title .em{color:var(--accent)}

/* 점선 수직 커넥터 트랙 */
.bpb-track{
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
}
.bpb-track::before{
  content:'';
  position:absolute;
  top:0;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:2px;
  border-left:2px dashed rgba(255,255,255,.35);
  z-index:0;
}

/* 개별 말풍선 행 */
.bpb-row{
  position:relative;
  z-index:1;
  width:100%;
  display:flex;
  align-items:center;
  margin-bottom:16px;
}
/* 홀수(0-based: 짝수)는 왼쪽, 홀수 인덱스는 오른쪽 */
.bpb-row.left{ justify-content:flex-start; }
.bpb-row.right{ justify-content:flex-end; }

/* 말풍선 카드 */
.bpb-bubble{
  background:#fff;
  color:var(--ink);
  border-radius:999px;
  padding:14px 28px;
  max-width:72%;
  font-family:var(--font-body);
  font-size:clamp(14px,3.2vw,16px);
  font-weight:600;
  line-height:1.55;
  letter-spacing:-.01em;
  box-shadow:0 4px 18px -4px rgba(0,0,0,.22);
  position:relative;
}
.bpb-bubble .em{color:var(--accent-d);font-weight:800}

/* 말풍선 꼬리 — 왼쪽 버블: 오른쪽 하단 꼬리, 오른쪽 버블: 왼쪽 하단 꼬리 */
.bpb-row.left .bpb-bubble::after{
  content:'';
  position:absolute;
  bottom:-10px;
  right:24px;
  width:0;height:0;
  border-left:10px solid transparent;
  border-right:10px solid transparent;
  border-top:12px solid #fff;
}
.bpb-row.right .bpb-bubble::after{
  content:'';
  position:absolute;
  bottom:-10px;
  left:24px;
  width:0;height:0;
  border-left:10px solid transparent;
  border-right:10px solid transparent;
  border-top:12px solid #fff;
}

/* 마지막 아이템 아래 여백 (인물 이미지 없을 때 하단 여백) */
.bpb-track-end{height:40px}

/* 하단 인물 이미지 */
.bpb-person{
  width:100%;
  max-height:320px;
  object-fit:cover;
  object-position:top;
  display:block;
  margin-top:8px;
}
.bpb-person.ph{
  width:100%;
  height:220px;
  background:rgba(255,255,255,.08);
  border:2px dashed rgba(255,255,255,.25);
  color:rgba(255,255,255,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
  margin-top:8px;
}
`,
  render: (d, { esc, richSafe }) => {
    const bubblesHtml = d.items
      .map((it, i) => {
        const side = i % 2 === 0 ? 'left' : 'right'
        return `<div class="bpb-row ${side}"><div class="bpb-bubble">${richSafe(it.text)}</div></div>`
      })
      .join('\n    ')

    const personHtml = media(
      d.personImage,
      'bpb-person',
      esc(d.personImageAlt ?? '고민하는 구매자'),
    )

    return `
<section class="bpb">
  <h2 class="bpb-title">${richSafe(d.title)}</h2>
  <div class="bpb-track">
    ${bubblesHtml}
    <div class="bpb-track-end"></div>
  </div>
  ${personHtml}
</section>`
  },
})
