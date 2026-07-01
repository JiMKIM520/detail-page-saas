/** STORY 아키타입: story-stacked-image-narrative.
 *  [끝판왕] 내용전개 #6 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은(--paper) 배경 + 다크 뱃지 eyebrow + 2색 대형 헤드라인(accent 첫 줄 + ink 둘째 줄)
 *  + [굵은 소제목·본문 → 풀폭 이미지] 수직 스택 반복(2~4회). 순수 수직 서사 전개형. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 작은 배지 eyebrow 텍스트 (예: "여기에다가 설명을 자세하게") */
  eyebrow: z.string().min(1).optional(),
  /** 대형 헤드라인 첫 줄 — accent 색으로 표시 (em 허용) */
  titleAccent: z.string().min(1),
  /** 대형 헤드라인 둘째 줄 — 진한 ink 색 굵은 텍스트 (em 허용) */
  titleDark: z.string().min(1),
  /** 섹션 리드 서브텍스트 (굵음, 선택) */
  lead: z.string().optional(),
  /** 섹션 리드 보조 설명 (가늘음, 선택) */
  leadSub: z.string().optional(),
  /** 이미지+캡션 반복 유닛 (2~4개) */
  items: z
    .array(
      z.object({
        /** 굵은 소제목 (em, br 허용) */
        heading: z.string().min(1),
        /** 가는 본문 (선택) */
        body: z.string().optional(),
        /** 풀폭 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt 텍스트 */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const storyStackedImageNarrative = defineBlock<Data>({
  id: 'story-stacked-image-narrative',
  archetype: 'story' as any,
  styleTags: ['light', 'narrative', 'scroll', 'detail', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(스택 이미지 서사). 밝은 배경 + 다크 배지 eyebrow + 2색 대형 헤드라인(accent 첫 줄·ink 둘째 줄) + 리드 텍스트 + [굵은 소제목·본문 → 풀폭 이미지] 수직 스택 반복(2~4회). 제품 특장점 서술에 적합.',
  schema,
  css: `
/* story-stacked-image-narrative — 접두사 ssin- */
.ssin{
  background:var(--paper);
  color:var(--ink);
  padding:64px 40px 72px;
  text-align:center;
}

/* 상단 배지 eyebrow */
.ssin-eyebrow{
  display:inline-block;
  background:var(--ink);
  color:var(--paper);
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  letter-spacing:.04em;
  padding:6px 18px;
  border-radius:3px;
  margin-bottom:22px;
}

/* 2색 헤드라인 */
.ssin-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,8vw,58px);
  line-height:1.18;
  letter-spacing:-.025em;
  margin-bottom:24px;
}
/* 밝은 배경이므로 accent-d 그대로 (전역 .acc/.em과 동일 방향) */
.ssin-title-accent{
  display:block;
  color:var(--accent-d);
}
.ssin-title-accent .em{color:var(--accent-d)}
.ssin-title-dark{
  display:block;
  color:var(--ink);
}
.ssin-title-dark .em{color:var(--accent-d)}

/* 리드 텍스트 */
.ssin-lead{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(16px,3.2vw,20px);
  line-height:1.5;
  color:var(--ink);
  margin-bottom:6px;
}
.ssin-lead .em{color:var(--accent-d)}
.ssin-lead-sub{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.75;
  color:var(--muted);
  margin-bottom:0;
}
.ssin-lead-sub .em{color:var(--accent-d);font-weight:700}

/* 반복 유닛 */
.ssin-item{
  margin-top:52px;
}
.ssin-item:first-of-type{
  margin-top:40px;
}
.ssin-item-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,4vw,24px);
  line-height:1.45;
  letter-spacing:-.015em;
  color:var(--ink);
  margin-bottom:10px;
}
.ssin-item-heading .em{color:var(--accent-d)}
.ssin-item-body{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.75;
  color:var(--muted);
  margin-bottom:20px;
}
.ssin-item-body .em{color:var(--accent-d);font-weight:700}

/* 풀폭 이미지 */
.ssin-img{
  width:100%;
  aspect-ratio:4/3;
  object-fit:cover;
  display:block;
  border-radius:4px;
}
.ssin-img.ph{
  width:100%;
  aspect-ratio:4/3;
  border:2px dashed var(--line);
  background:var(--bg);
  color:var(--muted);
  border-radius:4px;
}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrowHtml = d.eyebrow
      ? `<span class="ssin-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    const leadHtml = d.lead
      ? `<p class="ssin-lead">${richSafe(d.lead)}</p>`
      : ''

    const leadSubHtml = d.leadSub
      ? `<p class="ssin-lead-sub">${richSafe(d.leadSub)}</p>`
      : ''

    const itemsHtml = d.items
      .map(
        (it) => `
    <div class="ssin-item">
      <h3 class="ssin-item-heading">${richSafe(it.heading)}</h3>
      ${it.body ? `<p class="ssin-item-body">${richSafe(it.body)}</p>` : ''}
      ${media(it.image, 'ssin-img', esc(it.imageAlt ?? '설명 이미지'))}
    </div>`,
      )
      .join('')

    return `
<section class="ssin">
  ${eyebrowHtml}
  <h2 class="ssin-title">
    <span class="ssin-title-accent">${richSafe(d.titleAccent)}</span>
    <span class="ssin-title-dark">${richSafe(d.titleDark)}</span>
  </h2>
  ${leadHtml}
  ${leadSubHtml}
  ${itemsHtml}
</section>`
  },
})
