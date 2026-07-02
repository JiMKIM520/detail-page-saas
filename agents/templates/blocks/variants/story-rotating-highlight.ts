/** STORY 아키타입: story-rotating-highlight.
 *  [끝판왕] 내용전개 #1 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 솔리드 다크(--ink) 배경 + 혼합굵기 3줄 헤드라인(첫 어절 accent) +
 *  [3줄 볼드 소제목 중 1줄에 accent 하이라이트 밴드 + 선택 소형 본문 + 선택 풀폭 이미지·캡션] 반복.
 *  하이라이트 줄 위치(highlightLine 0|1|2)가 유닛마다 순환 — 스크롤 리듬감 부여. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 3줄 헤드라인 (em 허용 — 첫 어절 accent 강조 권장) */
  title: z.string().min(1),
  /** 텍스트+이미지 반복 유닛 (2~4개) */
  items: z
    .array(
      z.object({
        /** 3줄 볼드 소제목 — 줄 구분은 <br> 사용 (richSafe 허용). LLM이 배열로 보내면 <br>로 join. */
        lines: z.preprocess((v) => (Array.isArray(v) ? v.map(String).join('<br>') : v), z.string().min(1)),
        /** 하이라이트 밴드를 적용할 줄 인덱스 (0=첫째줄, 1=둘째줄, 2=셋째줄) */
        highlightLine: z.number().int().min(0).max(2),
        /** 하이라이트 줄 아래 소형 본문 (선택) */
        body: z.string().optional(),
        /** 풀폭 이미지 URL (선택) */
        image: z.string().optional(),
        /** 이미지 alt 텍스트 (선택) */
        imageAlt: z.string().optional(),
        /** 이미지 아래 캡션 (선택) */
        caption: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const storyRotatingHighlight = defineBlock<Data>({
  id: 'story-rotating-highlight',
  archetype: 'story',
  styleTags: ['dark', 'narrative', 'highlight', 'scroll', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(하이라이트 순환). 다크 배경 + accent 강조 대형 헤드라인 + [3줄 볼드 소제목(특정 줄에 accent 하이라이트 밴드) + 선택 본문 + 선택 풀폭 이미지·캡션] 반복(2~4회). 하이라이트 줄 위치가 유닛마다 달라 스크롤 리듬감을 만든다.',
  schema,
  css: `
/* story-rotating-highlight — 접두사 srh- */
.srh{background:var(--ink);color:#fff;padding:64px 32px 72px;text-align:center}

/* 대형 헤드라인 */
.srh-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,8.5vw,62px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:56px;
}
/* 다크 배경 — .em은 밝은 accent로 override (전역 accent-d는 다크에서 대비 낮음) */
.srh-title .em{color:var(--accent)}

/* 반복 유닛 */
.srh-item{margin-bottom:64px}
.srh-item:last-child{margin-bottom:0}

/* 3줄 소제목 래퍼 — highlightLine JS-free 구현을 위해 각 줄을 span으로 래핑 */
.srh-lines{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,4.8vw,30px);
  line-height:1.55;
  letter-spacing:-.015em;
  color:#fff;
  margin-bottom:16px;
  display:inline-block;
  text-align:center;
}
.srh-lines .em{color:var(--accent)}

/* 하이라이트 밴드 — 줄 전체를 감싸는 span.srh-hl */
.srh-hl{
  display:inline;
  background:var(--accent);
  color:var(--ink);
  padding:0 6px 2px;
  border-radius:2px;
  font-weight:800;
  /* accent 배경 위이므로 텍스트는 --ink(다크) */
  box-decoration-break:clone;
  -webkit-box-decoration-break:clone;
}

/* 소형 본문 */
.srh-body{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.75;
  color:rgba(255,255,255,.55);
  margin-bottom:24px;
  letter-spacing:-.01em;
}
.srh-body .em{color:var(--accent);font-weight:700}

/* 풀폭 이미지 */
.srh-img{
  width:100%;
  aspect-ratio:4/3;
  object-fit:cover;
  display:block;
  border-radius:4px;
}
.srh-img.ph{
  width:100%;
  aspect-ratio:4/3;
  border:2px dashed rgba(255,255,255,.2);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.38);
  border-radius:4px;
}

/* 이미지 캡션 */
.srh-caption{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.6;
  color:rgba(255,255,255,.4);
  margin-top:10px;
  letter-spacing:-.005em;
}
`,
  render: (d, { esc, richSafe }) => {
    /**
     * 3줄 소제목은 사용자가 <br>로 구분해 넘긴다.
     * highlightLine(0|1|2)에 해당하는 줄만 .srh-hl 래퍼로 감싼다.
     * richSafe() 후 <br>을 기준으로 분리 → 해당 인덱스에 srh-hl 삽입 → 재결합.
     */
    function renderLines(raw: string, hl: 0 | 1 | 2): string {
      const safe = richSafe(raw)
      // <br> 또는 <br/> 기준으로 분리
      const parts = safe.split(/<br\s*\/?>/i)
      const wrapped = parts.map((part, i) =>
        i === hl ? `<span class="srh-hl">${part}</span>` : part,
      )
      return wrapped.join('<br>')
    }

    const itemsHtml = d.items
      .map(
        (it) => `
  <div class="srh-item">
    <p class="srh-lines">${renderLines(it.lines, it.highlightLine)}</p>
    ${it.body ? `<p class="srh-body">${richSafe(it.body)}</p>` : ''}
    ${
      it.image !== undefined || it.caption !== undefined
        ? `<div class="srh-img-wrap">
      ${media(it.image, 'srh-img', esc(it.imageAlt ?? '설명 이미지'))}
      ${it.caption ? `<p class="srh-caption">${richSafe(it.caption)}</p>` : ''}
    </div>`
        : ''
    }
  </div>`,
      )
      .join('')

    return `
<section class="srh">
  <h2 class="srh-title">${richSafe(d.title)}</h2>
  ${itemsHtml}
</section>`
  },
})
