/** STORY 아키타입: story-vertical-repeat.
 *  [끝판왕] 내용전개 #3 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 솔리드 다크(--ink) 배경 + accent 강조 대형 헤드라인 + [중앙정렬 소제목·본문 → 풀폭 이미지] 수직 교번 반복.
 *  스크롤 서사 전개형 — 좌우 교차 없이 순수 수직 스택. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 헤드라인 (em 허용 — 일부 어절 accent 강조) */
  title: z.string().min(1),
  /** 텍스트+이미지 반복 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 굵은 소제목 (em, br 허용) */
        heading: z.string().min(1),
        /** 가는 본문 1줄 (선택) */
        body: z.string().optional(),
        /** 풀폭 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const storyVerticalRepeat = defineBlock<Data>({
  id: 'story-vertical-repeat',
  archetype: 'story' as any,
  styleTags: ['dark', 'narrative', 'scroll', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(스크롤 서사). 다크 배경 + accent 강조 대형 헤드라인 + [중앙정렬 소제목·본문 → 풀폭 이미지] 수직 교번 반복(2~5회). 좌우 교차 없는 순수 수직 스택.',
  schema,
  css: `
/* story-vertical-repeat — 접두사 svr- */
.svr{background:var(--ink);color:#fff;padding:64px 40px 72px;text-align:center}
.svr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(38px,8vw,60px);line-height:1.16;letter-spacing:-.02em;color:#fff;margin-bottom:8px}
/* 다크 배경 — .em은 밝은 accent로 override(전역 accent-d는 다크에서 대비 낮음) */
.svr-title .em{color:var(--accent)}
.svr-item{margin-top:56px}
.svr-item:first-of-type{margin-top:40px}
.svr-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(21px,4.6vw,29px);line-height:1.4;letter-spacing:-.01em;color:#fff;margin-bottom:12px}
.svr-heading .em{color:var(--accent)}
.svr-body{font-family:var(--font-body);font-size:16px;line-height:1.7;color:rgba(255,255,255,.64);margin-bottom:26px}
.svr-body .em{color:var(--accent);font-weight:700}
.svr-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border-radius:4px}
.svr-img.ph{width:100%;aspect-ratio:4/3;border:2px dashed rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border-radius:4px}
`,
  render: (d, { esc, richSafe }) => {
    const items = d.items
      .map(
        (it) => `
    <div class="svr-item">
      <h3 class="svr-heading">${richSafe(it.heading)}</h3>
      ${it.body ? `<p class="svr-body">${richSafe(it.body)}</p>` : ''}
      ${media(it.image, 'svr-img', esc(it.imageAlt ?? '설명 이미지'))}
    </div>`,
      )
      .join('')

    return `
<section class="svr">
  <h2 class="svr-title">${richSafe(d.title)}</h2>
  ${items}
</section>`
  },
})
