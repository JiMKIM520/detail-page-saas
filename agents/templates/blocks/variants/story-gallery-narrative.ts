/** STORY 아키타입: story-gallery-narrative.
 *  [끝판왕] 내용전개 #4 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 웜그레이(--paper/--bg) 배경 + 브랜드 헤더바(brand 좌 / tagline 우, border-bottom)
 *  + 대형 혼합굵기 헤드라인 + 인트로 텍스트 → [전폭 이미지 → 볼드 캡션 + 본문] 반복.
 *  미니멀, 장식 없음. 스크롤 서사 전개형 — 라이트 배경판. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 헤더바 좌측: 브랜드명 */
  brand: z.string().min(1),
  /** 헤더바 우측: 태그라인 / 카테고리 */
  tagline: z.string().min(1),
  /** 대형 헤드라인 (em 허용 — 일부 어절 accent 강조, br 허용) */
  title: z.string().min(1),
  /** 인트로 강조 캡션 (볼드 한 줄, em 허용) */
  introCaption: z.string().min(1),
  /** 인트로 본문 (1~2줄, em 허용) */
  introBody: z.string().min(1),
  /** 이미지+캡션 반복 유닛 (2~4개) */
  items: z
    .array(
      z.object({
        /** 전폭 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 볼드 캡션 (em 허용) */
        caption: z.string().min(1),
        /** 보조 본문 (선택, em 허용) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const storyGalleryNarrative = defineBlock<Data>({
  id: 'story-gallery-narrative',
  archetype: 'story' as any,
  styleTags: ['light', 'warm', 'minimal', 'narrative', 'scroll', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(라이트 서사). 라이트 웜그레이 배경 + 브랜드 헤더바(좌:브랜드명/우:태그라인, border-bottom) + 대형 혼합굵기 헤드라인 + 인트로 캡션·본문 → [전폭 이미지 → 볼드 캡션+본문] 2~4회 반복. 미니멀, 장식 없음.',
  schema,
  css: `
/* story-gallery-narrative — 접두사 sgn- */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted, eyebrow --accent-d */
.sgn{
  background:var(--paper);
  color:var(--ink);
  padding-bottom:64px;
  overflow:hidden;
}

/* 헤더바 */
.sgn-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:20px 36px 18px;
  border-bottom:1px solid var(--line);
  margin-bottom:0;
}
.sgn-brand{
  font-family:var(--font-display);
  font-weight:800;
  font-size:14px;
  letter-spacing:.04em;
  color:var(--ink);
}
.sgn-tagline{
  font-family:var(--font-body);
  font-size:12px;
  letter-spacing:.02em;
  color:var(--muted);
}

/* 대형 헤드라인 */
.sgn-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,7.4vw,56px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:var(--ink);
  text-align:center;
  padding:52px 36px 0;
  margin-bottom:32px;
}
/* 라이트 배경 — .em은 --accent-d(어두운 포인트)로 충분한 대비 확보 */
.sgn-title .em{color:var(--accent-d)}

/* 인트로 텍스트 블록 */
.sgn-intro{
  text-align:center;
  padding:0 36px 52px;
}
.sgn-intro-cap{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(17px,3.2vw,22px);
  line-height:1.5;
  letter-spacing:-.01em;
  color:var(--ink);
  margin-bottom:10px;
}
.sgn-intro-cap .em{color:var(--accent-d)}
.sgn-intro-body{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.8;
  color:var(--muted);
  letter-spacing:-.005em;
}
.sgn-intro-body .em{color:var(--accent-d);font-weight:700}

/* 구분 헤어라인 (인트로 하단) */
.sgn-divider{
  border:none;
  border-top:1px solid var(--line);
  margin:0;
}

/* 반복 이미지+캡션 유닛 */
.sgn-item{
  padding-top:0;
}

/* 전폭 이미지 (좌우 작은 여백으로 배경 노출) */
.sgn-img{
  width:calc(100% - 72px);
  margin:0 36px;
  aspect-ratio:4/3;
  object-fit:cover;
  display:block;
}
.sgn-img.ph{
  width:calc(100% - 72px);
  margin:0 36px;
  aspect-ratio:4/3;
  border:2px dashed var(--line);
  background:rgba(0,0,0,.04);
  color:var(--muted);
}

/* 캡션 + 본문 영역 */
.sgn-cap-wrap{
  padding:20px 36px 44px;
}
.sgn-caption{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(16px,3vw,20px);
  line-height:1.5;
  letter-spacing:-.01em;
  color:var(--ink);
  margin-bottom:8px;
}
.sgn-caption .em{color:var(--accent-d)}
.sgn-body{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.8;
  color:var(--muted);
  letter-spacing:-.005em;
}
.sgn-body .em{color:var(--accent-d);font-weight:700}

/* 아이템 사이 구분선 */
.sgn-item-div{
  border:none;
  border-top:1px solid var(--line);
  margin:0 36px;
  margin-bottom:40px;
}
`,
  render: (d, { esc, richSafe }) => {
    const itemsHtml = d.items
      .map(
        (it, i) => `
    ${i > 0 ? '<hr class="sgn-item-div">' : ''}
    <div class="sgn-item">
      ${media(it.image, 'sgn-img', esc(it.imageAlt ?? '제품 이미지'))}
      <div class="sgn-cap-wrap">
        <p class="sgn-caption">${richSafe(it.caption)}</p>
        ${it.body ? `<p class="sgn-body">${richSafe(it.body)}</p>` : ''}
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="sgn">
  <div class="sgn-header">
    <span class="sgn-brand">${esc(d.brand)}</span>
    <span class="sgn-tagline">${esc(d.tagline)}</span>
  </div>
  <h2 class="sgn-title">${richSafe(d.title)}</h2>
  <div class="sgn-intro">
    <p class="sgn-intro-cap">${richSafe(d.introCaption)}</p>
    <p class="sgn-intro-body">${richSafe(d.introBody)}</p>
  </div>
  <hr class="sgn-divider">
  ${itemsHtml}
</section>`
  },
})
