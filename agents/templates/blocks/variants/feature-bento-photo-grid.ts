/** FEATURE 아키타입: feature-bento-photo-grid.
 *  [끝판왕] 추천·B&A #19 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이프스타일 풀블리드 카드 배경 + 아이콘·헤드라인 흰 오버레이 + 불균일 벤토 그리드.
 *  헤더(eyebrow + 제품 헤드라인) → 가격 배지 → 2열 벤토(메인 1칸 높이 2배 + 보조 3칸) 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const iconEnum = z.enum(ICON_NAMES)

const schema = z.object({
  /** 상단 eyebrow 레이블 (브랜드명·제품명 등) */
  eyebrow: z.string().min(1),
  /** 제품 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 가격 텍스트 (예: "1,190,000원"). 없으면 숨김. */
  price: z.string().optional(),
  /** 벤토 카드 목록 (4~5개 권장).
   *  첫 번째 카드가 왼쪽 메인(세로 2배 높이)으로 배치된다. */
  items: z
    .array(
      z.object({
        /** 카드 배경 라이프스타일 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 카드 아이콘 (ICONS 목록 내) */
        icon: iconEnum.optional(),
        /** 카드 헤드라인 (em, br 허용) */
        heading: z.string().min(1),
        /** 보조 설명 (선택, em 허용) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const featureBentoPhotoGrid = defineBlock<Data>({
  id: 'feature-bento-photo-grid',
  archetype: 'feature' as any,
  styleTags: ['bento', 'photo', 'lifestyle', 'overlay', 'dark', 'grid', 'template'],
  imageSlots: 5,
  describe:
    '기능 벤토(라이프스타일 풀블리드). 헤더(eyebrow+헤드라인)+가격 배지 → 불균일 2열 벤토 그리드. 각 카드=라이프스타일 사진 풀블리드 배경+아이콘+흰 헤드라인 오버레이. 첫 카드(메인)가 세로 2배. 전자제품·가전·라이프스타일 제품 기능 강조에 적합.',
  schema,
  css: `
/* feature-bento-photo-grid — 접두사 fbpg- */

/* 라이트 배경: var(--paper)/var(--bg), 본문 var(--ink), eyebrow var(--accent-d) */
.fbpg{background:var(--bg);padding:52px 28px 60px;word-break:keep-all;overflow-wrap:break-word}

/* ── 헤더 영역 ── */
.fbpg-header{margin-bottom:24px}
.fbpg-eyebrow{
  font-family:var(--font-body);
  font-size:12px;
  font-weight:700;
  letter-spacing:.1em;
  text-transform:uppercase;
  color:var(--accent-d);
  margin-bottom:8px;
}
.fbpg-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(24px,5.4vw,36px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:var(--ink);
}
/* 라이트 배경 강조: accent-d */
.fbpg-title .em{color:var(--accent-d)}

/* ── 가격 배지 ── */
.fbpg-price-wrap{
  display:flex;
  justify-content:flex-end;
  margin-bottom:22px;
}
.fbpg-price{
  display:inline-block;
  background:var(--ink);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,4.2vw,28px);
  letter-spacing:-.02em;
  padding:10px 22px 10px 20px;
  border-radius:8px;
}

/* ── 벤토 그리드 ── */
/* 2열 그리드. 첫 카드(메인)는 row-span 2로 세로 2배. */
.fbpg-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

/* 카드 공통 */
.fbpg-card{
  position:relative;
  border-radius:14px;
  overflow:hidden;
  background:var(--ink);
  min-height:180px;
}

/* 메인 카드(첫 번째): 세로 2배 */
.fbpg-card:first-child{
  grid-row:span 2;
  min-height:380px;
}

/* 풀블리드 배경 이미지 */
.fbpg-bg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.fbpg-bg.ph{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(0,0,0,.15);
  border:2px dashed rgba(255,255,255,.2);
  color:rgba(255,255,255,.4);
  font-size:12px;
  border-radius:0;
}

/* 어두운 그라디언트 오버레이 — 텍스트 가독성 */
.fbpg-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(
    180deg,
    rgba(0,0,0,.18) 0%,
    rgba(0,0,0,.08) 35%,
    rgba(0,0,0,.55) 100%
  );
  pointer-events:none;
}

/* 카드 콘텐츠 (아이콘 + 텍스트) */
.fbpg-content{
  position:relative;
  z-index:1;
  height:100%;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  padding:16px;
  min-height:inherit;
}

/* 아이콘 wrap */
.fbpg-icon{
  width:32px;
  height:32px;
  color:#fff;
  flex-shrink:0;
}
.fbpg-icon svg{
  width:100%;
  height:100%;
}

/* 텍스트 하단 블록 */
.fbpg-text{margin-top:auto}
.fbpg-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(15px,3.2vw,19px);
  line-height:1.38;
  letter-spacing:-.015em;
  color:#fff;
  margin-bottom:4px;
}
/* 다크 카드 배경 위 — .em은 밝은 accent override */
.fbpg-heading .em{color:var(--accent)}
.fbpg-body{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.7;
  color:rgba(255,255,255,.72);
  letter-spacing:-.005em;
}
.fbpg-body .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const priceHtml = d.price
      ? `<div class="fbpg-price-wrap">
          <span class="fbpg-price">${esc(d.price)}</span>
        </div>`
      : ''

    const cardsHtml = d.items
      .map((it) => {
        const iconHtml = it.icon
          ? `<div class="fbpg-icon">${icon(it.icon)}</div>`
          : ''
        const bodyHtml = it.body
          ? `<p class="fbpg-body">${richSafe(it.body)}</p>`
          : ''
        // media() returns <img> or <div class="ph"> — we need absolute positioning so we inline the class
        const bgHtml = it.image
          ? `<img class="fbpg-bg" src="${esc(it.image)}" alt="${esc(it.imageAlt ?? '')}">`
          : `<div class="fbpg-bg ph">${esc(it.imageAlt ?? '이미지')}</div>`

        return `
    <div class="fbpg-card">
      ${bgHtml}
      <div class="fbpg-overlay"></div>
      <div class="fbpg-content">
        ${iconHtml}
        <div class="fbpg-text">
          <p class="fbpg-heading">${richSafe(it.heading)}</p>
          ${bodyHtml}
        </div>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="fbpg">
  <div class="fbpg-header">
    <p class="fbpg-eyebrow">${esc(d.eyebrow)}</p>
    <h2 class="fbpg-title">${richSafe(d.title)}</h2>
  </div>
  ${priceHtml}
  <div class="fbpg-grid">
    ${cardsHtml}
  </div>
</section>`
  },
})
