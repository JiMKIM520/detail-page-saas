/** HERO 아키타입: hero-oval-mascot
 *  원본: 064_인트로_29 (인트로/29, 860×1413, 핑크 배경)
 *  구조: 핑크 배경 + 워터마크 대형 브랜드명 + 핑크 배지 + 2단 타이틀,
 *        3겹 타원 BOOLEAN 클리핑 마스크 제품 사진 + 별 장식 3개,
 *        하단 상품 설명 + 플레이버 해시태그 풀위드 핑크 배너.
 *  noimg-safe: 이미지 부재 시 타원 프레임을 틴트 패널로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().min(1),           // 워터마크 대형 브랜드 레터링 (영문 권장)
  badge: z.string().min(1),           // 핑크 배지 한 줄 카피
  tagline: z.string().min(1),         // 타이틀 위 소형 카피 (em,br)
  title: z.string().min(1),           // 메인 대형 타이틀 (em,br)
  image: z.string().optional(),       // 제품 사진 (url) — 3겹 타원 클리핑 마스크
  desc: z.string().optional(),        // 하단 상품 설명 1~2줄 (em,br)
  tags: z.array(z.string().min(1)).min(1).max(8), // 플레이버/해시태그 배열
})
type Data = z.infer<typeof schema>

export const heroOvalMascot = defineBlock<Data>({
  id: 'hero-oval-mascot',
  archetype: 'hero',
  styleTags: ['light', 'cute', 'food', 'pink', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '큐트 핑크 히어로. 풀배경 핑크 + 워터마크 대형 브랜드 레터링 + 핑크 배지 + 2단 타이틀 + 3겹 타원 클리핑 마스크 제품 사진 + 별 장식 + 하단 설명 + 플레이버 해시태그 배너. 식품/디저트/뷰티 큐트 무드.',
  schema,
  css: `
/* ── hero-oval-mascot (haor) ── */
.haor{position:relative;background:var(--accent);overflow:hidden;padding-bottom:0;text-align:center}

/* 워터마크 */
.haor-wm{
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  font-family:var(--font-display);font-weight:400;
  font-size:clamp(90px,17vw,160px);white-space:nowrap;
  color:#fff;opacity:.45;line-height:1;pointer-events:none;user-select:none;
  letter-spacing:-.02em
}

/* 배지 */
.haor-badge{
  display:inline-block;
  background:color-mix(in srgb,var(--brand) 60%,#ff86bc);
  color:#fff;font-family:var(--font-body);font-weight:700;
  font-size:clamp(16px,3vw,26px);padding:10px 28px;
  border-radius:999px;margin-top:clamp(36px,6vw,64px);
  position:relative;z-index:2
}

/* 타이틀 영역 */
.haor-hd{
  position:relative;z-index:2;
  padding:0 var(--pad-x,56px);
  margin-top:clamp(10px,2vw,18px)
}
.haor-tagline{
  font-family:var(--font-body);font-weight:500;
  font-size:clamp(20px,3.5vw,38px);color:var(--ink);
  line-height:1.25;letter-spacing:-.01em
}
.haor-tagline .em{color:var(--brand);font-weight:800}
.haor-title{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(32px,7vw,72px);color:var(--brand);
  line-height:1.1;letter-spacing:-.02em;margin-top:4px
}
.haor-title .em{color:var(--ink)}

/* 제품 영역 — 별 + 타원 마스크 */
.haor-product{
  position:relative;z-index:2;
  margin:clamp(20px,4vw,36px) auto 0;
  width:clamp(260px,72%,560px);aspect-ratio:1/0.95
}

/* 3겹 타원 클리핑 마스크 (BOOLEAN 오프셋 재현) */
.haor-oval-wrap{
  position:absolute;inset:0;
  clip-path:var(--shape-photo,
    ellipse(50% 42% at 50% 35%)
  );
  overflow:hidden
}
/* 이미지 또는 강등 틴트 패널 */
.haor-oval-wrap img,
.haor-oval-wrap .ph{
  width:100%;height:100%;object-fit:cover;
  display:block
}
.haor-oval-wrap .ph{
  display:block!important;
  background:color-mix(in srgb,var(--accent) 40%,#fff);
  border-radius:inherit
}

/* 별 장식 SVG (인라인 절대 배치) */
.haor-star-tl{
  position:absolute;top:52%;left:2%;
  width:clamp(28px,5%,52px);height:auto;
  fill:var(--brand);pointer-events:none
}
.haor-star-tr{
  position:absolute;top:4%;right:4%;
  width:clamp(36px,6%,62px);height:auto;
  fill:var(--brand);pointer-events:none
}
.haor-star-br{
  position:absolute;top:10%;right:10%;
  width:clamp(20px,3.8%,42px);height:auto;
  fill:var(--brand);pointer-events:none
}

/* 하단 텍스트 */
.haor-desc{
  position:relative;z-index:2;
  margin:clamp(16px,3vw,28px) auto 0;
  padding:0 var(--pad-x,56px);
  font-family:var(--font-body);font-weight:600;
  font-size:clamp(15px,2.2vw,22px);color:var(--ink);
  line-height:1.6
}
.haor-desc .em{color:var(--brand);font-weight:800}

/* 플레이버 해시태그 배너 — 풀위드 핑크 */
.haor-tags{
  position:relative;z-index:2;
  margin-top:clamp(18px,3.5vw,32px);
  width:100%;
  background:color-mix(in srgb,var(--brand) 55%,#ff86bc);
  padding:clamp(10px,1.8vw,18px) var(--pad-x,56px);
  display:flex;gap:clamp(10px,2vw,22px);justify-content:center;
  flex-wrap:wrap
}
.haor-tag{
  font-family:var(--font-body);font-weight:500;
  font-size:clamp(14px,2vw,20px);color:#fff;
  white-space:nowrap
}
`,
  render: (d, { esc, richSafe }) => {
    // 별 SVG (4-포인트 별 — 원본 STAR 노드 재현)
    const starSvg = (cls: string) =>
      `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/>
      </svg>`

    const tagsHtml = d.tags
      .map((t) => `<span class="haor-tag">#${esc(t)}</span>`)
      .join('')

    return `
<section class="haor">
  <span class="haor-wm" aria-hidden="true">${esc(d.brand)}</span>
  <div class="haor-badge">${esc(d.badge)}</div>
  <div class="haor-hd">
    <p class="haor-tagline">${richSafe(d.tagline)}</p>
    <h1 class="haor-title disp">${richSafe(d.title)}</h1>
  </div>
  <div class="haor-product">
    ${starSvg('haor-star-tl')}
    ${starSvg('haor-star-tr')}
    ${starSvg('haor-star-br')}
    <div class="haor-oval-wrap">
      ${media(d.image, '', '제품 사진')}
    </div>
  </div>
  ${d.desc ? `<p class="haor-desc">${richSafe(d.desc)}</p>` : ''}
  <div class="haor-tags">${tagsHtml}</div>
</section>`
  },
})
