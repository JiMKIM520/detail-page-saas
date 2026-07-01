/** DETAIL 아키타입: detail-image-caption-stack.
 *  [끝판왕] 내용전개 #2 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 솔리드 다크(--ink) 배경 + 원형 아이콘 배지 + 중앙정렬 대제목 →
 *  [풀폭 이미지 → 좌정렬 굵은 소제목 + 본문 3줄] 수직 반복(2~5회).
 *  좌우 교차 없는 순수 수직 스택. 상세 서술 스크롤형. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  /** 원형 배지 아이콘 이름 (ctx.icon 사용) */
  icon: z.enum(ICON_NAMES).optional(),
  /** 중앙정렬 대제목 (em, br 허용) */
  title: z.string().min(1),
  /** 이미지+캡션 반복 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 풀폭 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 굵은 좌정렬 소제목 (em, br 허용) */
        heading: z.string().min(1),
        /** 본문 줄 배열 (1~4줄) — 각 항목이 한 줄 */
        bodyLines: z.array(z.string().min(1)).min(1).max(4),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const detailImageCaptionStack = defineBlock<Data>({
  id: 'detail-image-caption-stack',
  archetype: 'detail' as any,
  styleTags: ['dark', 'narrative', 'scroll', 'caption', 'template'],
  imageSlots: 3,
  describe:
    '상세 서술(이미지+캡션 스택). 다크 배경 + 원형 아이콘 배지 + 중앙정렬 대제목 → [풀폭 이미지 → 좌정렬 굵은 소제목 + 본문 여러 줄] 수직 반복(2~5회). 제품 특장점/성분 스크롤 서사에 적합.',
  schema,
  css: `
/* detail-image-caption-stack — 접두사 dics- */
.dics{background:var(--ink);color:#fff;padding:64px 32px 72px;text-align:center}

/* 원형 아이콘 배지 */
.dics-badge{
  width:68px;height:68px;
  border-radius:50%;
  border:2px solid rgba(255,255,255,.55);
  display:inline-flex;align-items:center;justify-content:center;
  color:#fff;
  margin-bottom:28px;
}
.dics-badge svg{width:32px;height:32px;display:block}

/* 대제목 */
.dics-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,6.5vw,46px);
  line-height:1.22;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:0;
}
/* 다크 배경 — .em은 밝은 accent로 override(전역 accent-d는 다크에서 대비 낮음) */
.dics-title .em{color:var(--accent)}

/* 반복 유닛 */
.dics-item{margin-top:52px;text-align:left}
.dics-item:first-of-type{margin-top:40px}

/* 풀폭 이미지 */
.dics-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border-radius:4px;margin-bottom:28px}
.dics-img.ph{
  width:100%;aspect-ratio:4/3;
  border:2px dashed rgba(255,255,255,.2);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.4);
  border-radius:4px;
  margin-bottom:28px;
}

/* 소제목 */
.dics-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,4vw,24px);
  line-height:1.4;
  letter-spacing:-.015em;
  color:#fff;
  margin-bottom:14px;
}
.dics-heading .em{color:var(--accent)}

/* 본문 줄 */
.dics-line{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.75;
  color:rgba(255,255,255,.68);
  margin-bottom:4px;
}
.dics-line:last-child{margin-bottom:0}
.dics-line .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const badgeHtml = `
    <div class="dics-badge" aria-hidden="true">
      ${icon(d.icon ?? 'check')}
    </div>`

    const itemsHtml = d.items
      .map((it) => {
        const linesHtml = it.bodyLines
          .map((line) => `<p class="dics-line">${richSafe(line)}</p>`)
          .join('')

        return `
    <div class="dics-item">
      ${media(it.image, 'dics-img', esc(it.imageAlt ?? '상품 이미지'))}
      <h3 class="dics-heading">${richSafe(it.heading)}</h3>
      ${linesHtml}
    </div>`
      })
      .join('')

    return `
<section class="dics">
  ${badgeHtml}
  <h2 class="dics-title">${richSafe(d.title)}</h2>
  ${itemsHtml}
</section>`
  },
})
