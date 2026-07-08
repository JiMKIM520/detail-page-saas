/** DETAIL 아키타입: detail-numbered-point-stack.
 *  [끝판왕] 내용전개 #10 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + "PRODUCT POINT" 아치형 라벨 + 대형 순번(01/02…) + 밑줄 액센트 바
 *  + 굵은 KR 헤드라인 + 보조 본문 + 풀폭 이미지, 수직 반복(2~5회). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 라벨 ("PRODUCT POINT" 등, 생략 시 기본값 사용) */
  label: z.string().optional(),
  /** 포인트 반복 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 순번 표기 (예: "01", "02") */
        no: z.string().min(1),
        /** 굵은 KR 헤드라인 (em, br 허용) */
        heading: z.string().min(1),
        /** 보조 본문 (선택, em 허용) */
        body: z.string().optional(),
        /** 풀폭 이미지 URL (선택) */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const detailNumberedPointStack = defineBlock<Data>({
  id: 'detail-numbered-point-stack',
  archetype: 'detail',
  styleTags: ['light', 'numbered', 'scroll', 'narrative', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(순번 포인트 스택). 밝은 배경 + "PRODUCT POINT" 아치형 라벨 + 대형 순번(01/02…) + 밑줄 액센트 바 + 굵은 KR 헤드라인 + 보조 본문 + 풀폭 이미지 수직 반복(2~5회). detail-point-scroll-stack과 달리 순번 아치형 라벨이 각 유닛 상단에 위치.',
  schema,
  css: `
/* detail-numbered-point-stack — 접두사 dnps- */
.dnps{background:var(--bg);color:var(--ink);padding:64px 40px 72px;text-align:center}

/* 각 포인트 유닛 */
.dnps-item{margin-top:72px}
.dnps-item:first-of-type{margin-top:0}

/* "PRODUCT POINT" 아치형 라벨 — letter-spacing으로 간격 강조 */
.dnps-label{
  font-family:var(--font-body);
  font-weight:400;
  font-size:12px;
  letter-spacing:.22em;
  color:var(--accent-d);
  text-transform:uppercase;
  margin-bottom:4px;
}

/* 대형 순번 */
.dnps-no{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,10vw,76px);
  line-height:1.0;
  letter-spacing:-.02em;
  color:var(--accent-d);
  display:inline-block;
  /* 밑줄 액센트 바 */
  border-bottom:3px solid var(--accent-d);
  padding-bottom:6px;
  margin-bottom:28px;
}

/* KR 헤드라인 */
.dnps-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(22px,4.8vw,32px);
  line-height:1.38;
  letter-spacing:-.018em;
  color:var(--ink);
  margin-bottom:16px;
}
.dnps-heading .em{color:var(--accent-d)}

/* 보조 본문 */
.dnps-body{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.78;
  color:var(--muted);
  margin-bottom:28px;
}
.dnps-body .em{color:var(--accent-d);font-weight:700}

/* 풀폭 이미지 */
.dnps-img{
  width:100%;
  aspect-ratio:4/3;
  object-fit:cover;
  display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px));
}
.dnps-img.ph{
  width:100%;
  aspect-ratio:4/3;
  border:2px dashed var(--line);
  background:rgba(0,0,0,.03);
  color:var(--muted);
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px));
}
`,
  render: (d, { esc, richSafe }) => {
    const labelText = d.label ?? 'PRODUCT POINT'

    const items = d.items
      .map(
        (it) => `
    <div class="dnps-item">
      <p class="dnps-label">${esc(labelText)}</p>
      <p class="dnps-no">${esc(it.no)}</p>
      <h3 class="dnps-heading">${richSafe(it.heading)}</h3>
      ${it.body ? `<p class="dnps-body">${richSafe(it.body)}</p>` : ''}
      ${media(it.image, 'dnps-img', esc(it.imageAlt ?? '제품 이미지'))}
    </div>`,
      )
      .join('')

    return `
<section class="dnps">
  ${items}
</section>`
  },
})
