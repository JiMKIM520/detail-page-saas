/** DETAIL 아키타입: feature-numbered-callout-scroll.
 *  [끝판왕] 내용전개 #8 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경(--paper/--bg) + 순번 말풍선 배지(01, 02…) 중앙 배치
 *  → eyebrow 소제목 → 대형 볼드 헤드라인 → 본문 설명 → 풀폭 이미지.
 *  2~5개 아이템 수직 반복(스크롤 서사 전개). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 섹션 최상단 타이틀 (선택). em, br 허용 */
  sectionTitle: z.string().optional(),
  /** 텍스트+이미지 반복 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 순번 레이블 (예: "01", "02"). 말풍선 배지에 표시. */
        no: z.string().min(1),
        /** 배지 위 작은 eyebrow 문구 (선택, em 허용) */
        eyebrow: z.string().optional(),
        /** 대형 볼드 헤드라인 (em, br 허용) */
        heading: z.string().min(1),
        /** 중앙정렬 본문 설명 (선택, em 허용) */
        body: z.string().optional(),
        /** 풀폭 이미지 URL (선택) */
        image: z.string().optional(),
        /** 이미지 alt 텍스트 */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const featureNumberedCalloutScroll = defineBlock<Data>({
  id: 'feature-numbered-callout-scroll',
  archetype: 'detail',
  styleTags: ['light', 'numbered', 'scroll', 'narrative', 'feature', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(순번 말풍선 스크롤). 밝은 배경 + 순번 배지(01, 02…) 중앙 배치 → eyebrow → 대형 헤드라인 → 본문 → 풀폭 이미지. 2~5회 수직 반복. 제품 특장점 순서 서술에 적합.',
  schema,
  css: `
/* feature-numbered-callout-scroll — 접두사 fncs- */
.fncs{background:var(--paper);color:var(--ink);padding:56px 36px 64px;text-align:center}
.fncs-section-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.8vw,38px);line-height:1.28;letter-spacing:-.02em;color:var(--ink);margin-bottom:40px}
.fncs-section-title .em{color:var(--accent-d)}

/* 아이템 블록 */
.fncs-item{margin-top:52px}
.fncs-item:first-of-type{margin-top:0}

/* 말풍선 배지 — 둥근 사각형 + 아래 삼각형 꼬리 */
.fncs-badge-wrap{display:inline-flex;flex-direction:column;align-items:center;margin-bottom:18px}
.fncs-badge{
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--ink);color:var(--paper);
  font-family:var(--font-display);font-weight:800;
  font-size:16px;letter-spacing:.04em;
  width:48px;height:40px;border-radius:calc(var(--r-scale,1)*8px);
  position:relative;
}
/* 말풍선 꼬리(아래 삼각형) */
.fncs-badge::after{
  content:"";
  position:absolute;
  bottom:-9px;left:50%;transform:translateX(-50%);
  width:0;height:0;
  border-left:7px solid transparent;
  border-right:7px solid transparent;
  border-top:9px solid var(--ink);
}

/* eyebrow */
.fncs-eyebrow{font-family:var(--font-body);font-size:13px;font-weight:400;color:var(--muted);letter-spacing:.02em;margin-bottom:8px;line-height:1.5}
.fncs-eyebrow .em{color:var(--accent-d);font-weight:700}

/* 헤드라인 */
.fncs-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5.5vw,34px);line-height:1.3;letter-spacing:-.02em;color:var(--ink);margin-bottom:14px}
.fncs-heading .em{color:var(--accent-d)}

/* 본문 */
.fncs-body{font-family:var(--font-body);font-size:15px;line-height:1.8;color:var(--muted);margin-bottom:24px;letter-spacing:-.01em}
.fncs-body .em{color:var(--accent-d);font-weight:700}

/* 풀폭 이미지 */
.fncs-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px))}
.fncs-img.ph{width:100%;aspect-ratio:4/3;border:2px dashed var(--line);background:rgba(0,0,0,.03);color:var(--muted);border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px))}
`,
  render: (d, { esc, richSafe }) => {
    const sectionTitleHtml = d.sectionTitle
      ? `<h2 class="fncs-section-title">${richSafe(d.sectionTitle)}</h2>`
      : ''

    const items = d.items
      .map(
        (it) => `
    <div class="fncs-item">
      <div class="fncs-badge-wrap">
        ${it.eyebrow ? `<p class="fncs-eyebrow">${richSafe(it.eyebrow)}</p>` : ''}
        <div class="fncs-badge" aria-label="${attr(it.no)}번째 특징">${esc(it.no)}</div>
      </div>
      <h3 class="fncs-heading">${richSafe(it.heading)}</h3>
      ${it.body ? `<p class="fncs-body">${richSafe(it.body)}</p>` : ''}
      ${media(it.image, 'fncs-img', esc(it.imageAlt ?? '제품 이미지'))}
    </div>`,
      )
      .join('')

    return `
<section class="fncs">
  ${sectionTitleHtml}
  ${items}
</section>`
  },
})
