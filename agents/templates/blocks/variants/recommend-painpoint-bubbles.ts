/** RECOMMEND 아키타입: recommend-painpoint-bubbles.
 *  [끝판왕] 추천·B&A #11 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 배경 + eyebrow + 대형 추천 헤드라인
 *  + 우정렬 채팅버블 pill 3행(pain point) + 소구점 chip 행
 *  + 대형 제품명 + 전폭 히어로 이미지(텍스트 오버레이).
 *  복잡도: medium. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 제품명 eyebrow (소형, 상단 중앙) */
  eyebrow: z.string().min(1),
  /** 추천 헤드라인 (em 허용) — 예: "이럴 때 <span class="em">추천드려요</span>" */
  title: z.string().min(1),
  /** 우정렬 채팅버블 pain point 3개 (em 허용) */
  bubbles: z
    .array(z.object({ text: z.string().min(1) }))
    .min(2)
    .max(4),
  /** 소구점 chip 배열 (2~4개) */
  chips: z
    .array(z.object({ label: z.string().min(1) }))
    .min(1)
    .max(4),
  /** 대형 제품명 (em 허용) */
  productName: z.string().min(1),
  /** 제품명 아래 서브카피 (선택) */
  productSub: z.string().optional(),
  /** 전폭 히어로 이미지 URL */
  heroImage: z.string().optional(),
  /** 히어로 이미지 alt */
  heroAlt: z.string().optional(),
  /** 히어로 이미지 위 오버레이 텍스트 (선택, em 허용) */
  heroOverlay: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const recommendPainpointBubbles = defineBlock<Data>({
  id: 'recommend-painpoint-bubbles',
  archetype: 'recommend',
  styleTags: ['light', 'chat', 'recommend', 'painpoint', 'template'],
  imageSlots: 1,
  describe:
    '추천 대상(페인포인트). 라이트 배경 + eyebrow + 대형 추천 헤드라인 + 우정렬 채팅버블 pill 2~4행(pain point) + 소구점 chip 행 + 대형 제품명+서브 + 전폭 히어로 이미지(오버레이). 타겟 공감→제품 소개 흐름.',
  schema,
  css: `
/* recommend-painpoint-bubbles — 접두사 rpb- */

/* 라이트 배경 블록 */
.rpb{
  background:var(--paper);
  color:var(--ink);
  padding:48px 32px 0;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* eyebrow */
.rpb-eyebrow{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:500;
  letter-spacing:.04em;
  color:var(--muted);
  margin-bottom:10px;
}

/* 추천 헤드라인 */
.rpb-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7vw,44px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:32px;
}
/* 라이트 배경: .em → --accent-d (저대비 방지) */
.rpb-title .em{color:var(--accent-d)}

/* 채팅버블 영역 — 우정렬 */
.rpb-bubbles{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:10px;
  margin-bottom:28px;
}

/* 개별 채팅버블 pill */
.rpb-bubble{
  display:inline-block;
  background:var(--bg);
  border:1.5px solid var(--line);
  border-radius:20px 20px 4px 20px;
  padding:11px 18px;
  font-family:var(--font-body);
  font-size:14px;
  font-weight:500;
  line-height:1.5;
  color:var(--ink);
  max-width:88%;
  text-align:right;
}
.rpb-bubble .em{color:var(--accent-d);font-weight:700}

/* 소구점 chip 행 — 중앙 정렬 */
.rpb-chips{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:8px;
  margin-bottom:32px;
}

/* 개별 chip */
.rpb-chip{
  display:inline-flex;
  align-items:center;
  gap:6px;
  background:var(--paper);
  border:1.5px solid var(--line);
  border-radius:999px;
  padding:7px 16px;
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  color:var(--ink);
  letter-spacing:.01em;
}

/* 대형 제품명 */
.rpb-product-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,8vw,52px);
  line-height:1.15;
  letter-spacing:-.03em;
  color:var(--ink);
  margin-bottom:6px;
}
.rpb-product-name .em{color:var(--accent-d)}

/* 제품명 서브카피 */
.rpb-product-sub{
  font-family:var(--font-body);
  font-size:14px;
  font-weight:400;
  color:var(--muted);
  margin-bottom:24px;
}
.rpb-product-sub .em{color:var(--accent-d);font-weight:600}

/* 히어로 이미지 래퍼 — 전폭, 오버레이 가능 */
.rpb-hero-wrap{
  position:relative;
  width:calc(100% + 64px);
  margin-left:-32px;
  margin-right:-32px;
  overflow:hidden;
}

/* 히어로 이미지 */
.rpb-hero{
  width:100%;
  aspect-ratio:3/2;
  object-fit:cover;
  display:block;
}
.rpb-hero.ph{
  width:100%;
  aspect-ratio:3/2;
  border:none;
  background:rgba(0,0,0,.07);
  border-top:2px dashed var(--line);
  color:var(--muted);
  font-size:14px;
}

/* 히어로 오버레이 텍스트 (다크 오버레이 위 밝은 텍스트) */
.rpb-hero-overlay{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  padding:24px 28px;
  background:linear-gradient(to top,rgba(0,0,0,.52) 0%,rgba(0,0,0,0) 100%);
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,4.5vw,28px);
  color:#fff;
  letter-spacing:-.02em;
  text-align:left;
  line-height:1.3;
}
/* 다크 오버레이 위 — .em은 밝은 --accent (저대비 우려 없음) */
.rpb-hero-overlay .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const bubblesHtml = d.bubbles
      .map((b) => `<div class="rpb-bubble">${richSafe(b.text)}</div>`)
      .join('')

    const chipsHtml = d.chips
      .map((c) => `<span class="rpb-chip">${esc(c.label)}</span>`)
      .join('')

    const heroHtml = media(d.heroImage, 'rpb-hero', esc(d.heroAlt ?? '제품 히어로 이미지'))

    const overlayHtml = d.heroOverlay
      ? `<div class="rpb-hero-overlay">${richSafe(d.heroOverlay)}</div>`
      : ''

    return `
<section class="rpb">
  <p class="rpb-eyebrow">${esc(d.eyebrow)}</p>
  <h2 class="rpb-title">${richSafe(d.title)}</h2>
  <div class="rpb-bubbles">${bubblesHtml}</div>
  <div class="rpb-chips">${chipsHtml}</div>
  <h3 class="rpb-product-name">${richSafe(d.productName)}</h3>
  ${d.productSub ? `<p class="rpb-product-sub">${richSafe(d.productSub)}</p>` : ''}
  <div class="rpb-hero-wrap">
    ${heroHtml}
    ${overlayHtml}
  </div>
</section>`
  },
})
