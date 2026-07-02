/** POINT 아키타입: feature-dark-tab-mosaic.
 *  [끝판왕] 포인트 구성 #26 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 상단(eyebrow + GRAND OPEN급 디스플레이 헤드라인 + 한글 서브카피 + 우측 블리드 hero 이미지)
 *            + 밝은 배경 하단(수평 4-탭 카테고리 Nav + 비대칭 3-이미지 모자이크(좌측 2열 스택, 우측 1열 tall)). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 최상단 소형 eyebrow 레이블 (예: "Outdoor wear store open") */
  eyebrow: z.string().min(1),
  /** 디스플레이 대형 헤드라인 — em 허용, 두 줄 가능 (예: "GRAND OPEN") */
  headline: z.string().min(1),
  /** 헤드라인 아래 한글 서브카피 — br/em 허용 (2줄 권장) */
  subcopy: z.string().min(1),
  /** 우측 블리드 hero 이미지 URL */
  heroImage: z.string().optional(),
  /** hero 이미지 alt */
  heroImageAlt: z.string().optional(),
  /** 카테고리 탭 (2~6개) */
  tabs: z
    .array(z.object({ label: z.string().min(1) }))
    .min(2)
    .max(6),
  /** 모자이크 이미지 3장 — [0] 좌상, [1] 좌하, [2] 우 tall */
  mosaicImages: z
    .array(
      z.object({
        url: z.string().optional(),
        alt: z.string().optional(),
      }),
    )
    .length(3),
})
type Data = z.infer<typeof schema>

export const featureDarkTabMosaic = defineBlock<Data>({
  id: 'feature-dark-tab-mosaic',
  archetype: 'point',
  styleTags: ['dark', 'grand-open', 'editorial', 'outdoor', 'mosaic', 'tab-nav', 'template'],
  imageSlots: 4,
  describe:
    '오픈/론칭 포인트 섹션. 다크 배경에 소형 eyebrow 레이블 + GRAND OPEN급 대형 디스플레이 헤드라인 + 한글 서브카피 + 우측 블리드 hero 이미지. 하단 밝은 배경에 수평 카테고리 탭(2~6개) + 비대칭 3-이미지 모자이크(좌측 2장 세로 스택, 우측 1장 tall). 아웃도어·스포츠·라이프스타일 브랜드 론칭에 적합.',
  schema,
  css: `
/* feature-dark-tab-mosaic — 접두사 fdtm- */
.fdtm{word-break:keep-all;overflow-wrap:break-word}

/* ── 상단: 다크 hero 존 ── */
.fdtm-top{position:relative;background:var(--ink);overflow:hidden;padding:36px 32px 32px}

/* eyebrow */
.fdtm-eyebrow{
  font-family:var(--font-body);
  font-size:12px;
  font-weight:500;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:rgba(255,255,255,.55);
  margin-bottom:14px;
  position:relative;z-index:2
}

/* headline */
.fdtm-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,13vw,80px);
  line-height:1.0;
  letter-spacing:-.03em;
  color:#fff;
  margin-bottom:18px;
  position:relative;z-index:2
}
/* 다크 배경 — .em은 밝은 accent로 override */
.fdtm-headline .em{color:var(--accent)}

/* subcopy */
.fdtm-sub{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:500;
  line-height:1.7;
  color:rgba(255,255,255,.72);
  position:relative;z-index:2;
  max-width:64%
}
.fdtm-sub .em{color:var(--accent);font-weight:700}

/* 우측 블리드 hero 이미지 */
.fdtm-hero-wrap{
  position:absolute;
  right:-4px;top:0;bottom:0;
  width:48%;
  z-index:1
}
.fdtm-hero-img{
  width:100%;height:100%;
  object-fit:cover;
  object-position:center top;
  display:block
}
.fdtm-hero-img.ph{
  width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.06);
  border:2px dashed rgba(255,255,255,.18);
  color:rgba(255,255,255,.35);
  font-size:12px
}
/* 좌측 콘텐츠가 hero 이미지 위에 올라가도록 그라데이션 베일 */
.fdtm-veil{
  position:absolute;
  right:0;top:0;bottom:0;
  width:60%;
  background:linear-gradient(to right, var(--ink) 0%, var(--ink) 40%, transparent 100%);
  z-index:1;
  pointer-events:none
}

/* ── 하단: 밝은 탭+모자이크 존 ── */
.fdtm-bottom{background:var(--paper);padding:0}

/* 탭 nav */
.fdtm-tabs{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px 24px;
  gap:0;
  border-bottom:1px solid var(--line)
}
.fdtm-tab{
  font-family:var(--font-body);
  font-size:12px;
  font-weight:600;
  letter-spacing:.06em;
  text-transform:uppercase;
  color:var(--muted);
  padding:4px 16px;
  white-space:nowrap
}
.fdtm-tab-sep{
  width:1px;height:12px;
  background:var(--line);
  flex-shrink:0
}

/* 모자이크 */
.fdtm-mosaic{
  display:grid;
  grid-template-columns:1fr 1fr;
  grid-template-rows:auto;
  gap:3px;
  padding:3px
}
/* 좌상 이미지 */
.fdtm-m0{
  grid-column:1;grid-row:1;
  aspect-ratio:1/1;
  object-fit:cover;width:100%;display:block
}
.fdtm-m0.ph{
  aspect-ratio:1/1;width:100%;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.05);border:2px dashed var(--line);
  color:var(--muted);font-size:12px
}
/* 좌하 이미지 */
.fdtm-m1{
  grid-column:1;grid-row:2;
  aspect-ratio:1/1;
  object-fit:cover;width:100%;display:block
}
.fdtm-m1.ph{
  aspect-ratio:1/1;width:100%;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.05);border:2px dashed var(--line);
  color:var(--muted);font-size:12px
}
/* 우측 tall 이미지 — 2행 span */
.fdtm-m2{
  grid-column:2;grid-row:1/3;
  width:100%;
  object-fit:cover;display:block;
  /* height는 2개의 좌측 정사각형 합 + gap과 동일하게 fill */
  height:100%
}
.fdtm-m2-wrap{
  grid-column:2;grid-row:1/3;
  overflow:hidden;
  position:relative
}
.fdtm-m2-wrap .fdtm-m2{
  position:absolute;top:0;left:0;
  width:100%;height:100%;
  object-fit:cover
}
.fdtm-m2-wrap .ph{
  position:absolute;top:0;left:0;
  width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,.05);border:2px dashed var(--line);
  color:var(--muted);font-size:12px
}
`,
  render: (d, { esc, richSafe }) => {
    // Tabs with separators
    const tabsHtml = d.tabs
      .map((t, i) => {
        const tab = `<span class="fdtm-tab">${esc(t.label)}</span>`
        const sep = i < d.tabs.length - 1 ? `<span class="fdtm-tab-sep" aria-hidden="true"></span>` : ''
        return tab + sep
      })
      .join('')

    // Mosaic images
    const m = d.mosaicImages
    const img0 = m[0].url
      ? `<img class="fdtm-m0" src="${attr(m[0].url)}" alt="${attr(m[0].alt ?? '이미지 1')}">`
      : `<div class="fdtm-m0 ph">${esc(m[0].alt ?? '이미지 1')}</div>`
    const img1 = m[1].url
      ? `<img class="fdtm-m1" src="${attr(m[1].url)}" alt="${attr(m[1].alt ?? '이미지 2')}">`
      : `<div class="fdtm-m1 ph">${esc(m[1].alt ?? '이미지 2')}</div>`
    const img2 = m[2].url
      ? `<img class="fdtm-m2" src="${attr(m[2].url)}" alt="${attr(m[2].alt ?? '이미지 3')}">`
      : `<div class="ph">${esc(m[2].alt ?? '이미지 3')}</div>`

    // Hero image (right-bleed, absolute)
    const heroHtml = d.heroImage
      ? `<img class="fdtm-hero-img" src="${attr(d.heroImage)}" alt="${attr(d.heroImageAlt ?? 'hero 이미지')}">`
      : `<div class="fdtm-hero-img ph">${esc(d.heroImageAlt ?? 'hero 이미지')}</div>`

    return `
<section class="fdtm">
  <!-- 상단: 다크 hero 존 -->
  <div class="fdtm-top">
    <div class="fdtm-veil"></div>
    <p class="fdtm-eyebrow">${esc(d.eyebrow)}</p>
    <h2 class="fdtm-headline">${richSafe(d.headline)}</h2>
    <p class="fdtm-sub">${richSafe(d.subcopy)}</p>
    <div class="fdtm-hero-wrap">${heroHtml}</div>
  </div>
  <!-- 하단: 탭 + 모자이크 -->
  <div class="fdtm-bottom">
    <nav class="fdtm-tabs" aria-label="카테고리">
      ${tabsHtml}
    </nav>
    <div class="fdtm-mosaic">
      ${img0}
      ${img1}
      <div class="fdtm-m2-wrap">${img2}</div>
    </div>
  </div>
</section>`
  },
})
