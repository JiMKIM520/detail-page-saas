/** HERO 아키타입(템플릿 충실 재현): hero-thumb-list.
 *  피그마 01_인트로 359:1030 — 포인트별 썸네일 이미지 목록.
 *  레이아웃: 브랜드 로고 필 → 대형 헤드라인 → 메인 제품 이미지(accent 원형 배경) →
 *  제품명 배너(accent 풀배경) → Point별 행(번호+설명 좌, 소형 썸네일 우) + 구분선 반복. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  brand: z.string().min(1).optional(),        // 브랜드 로고 레이블 (상단 필)
  headline: z.string().min(1),               // 대형 헤드라인 (em,br)
  heroImage: z.string().optional(),          // 메인 제품 이미지 (url)
  productName: z.string().min(1),            // 제품명 배너 텍스트 (em,br)
  points: z
    .array(
      z.object({
        label: z.string().min(1).optional(), // 포인트 라벨 (예: "Point 01", 생략 시 자동)
        desc: z.string().min(1),             // 포인트 설명 (em,br)
        image: z.string().optional(),        // 썸네일 이미지 (url)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroThumbList = defineBlock<Data>({
  id: 'hero-thumb-list',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'colorblock', 'list', 'thumbnail'],
  imageSlots: 4,
  describe:
    '인트로(포인트별 썸네일 목록). 브랜드 필 + 대형 헤드라인 + 메인 제품 이미지(accent 원형 배경) + 제품명 배너 + Point별 번호·설명·소형 썸네일 행 반복. 제품 특장점을 시각적으로 열거하는 인트로.',
  schema,
  css: `
/* ── htl = hero-thumb-list 접두사 ── */
.htl{background:var(--bg);color:var(--ink);overflow:hidden}

/* ─ 브랜드 로고 필 ─ */
.htl-top{padding:32px 40px 0;text-align:center}
.htl-brand{
  display:inline-block;
  border:1.5px solid var(--accent);
  border-radius:999px;
  padding:7px 28px;
  font-size:13px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;
  color:var(--accent)
}

/* ─ 대형 헤드라인 ─ */
.htl-headline{
  padding:28px 44px 0;
  font-family:var(--font-display);
  font-weight:800;font-size:54px;
  letter-spacing:-.02em;line-height:1.15;
  color:var(--ink)
}
.htl-headline .em{color:var(--accent)}

/* ─ 메인 히어로 이미지 존 (accent 원형 배경) ─ */
.htl-hero-zone{
  position:relative;
  margin:32px 0 0;
  padding:0 40px 0;
  min-height:380px;
  display:flex;
  align-items:flex-end;
  justify-content:center
}
.htl-hero-blob{
  position:absolute;
  bottom:0;left:50%;
  transform:translateX(-50%);
  width:720px;height:300px;
  border-radius:50% 50% 0 0;
  background:var(--accent);
  z-index:0
}
.htl-hero-img{
  position:relative;z-index:1;
  width:380px;height:380px;
  object-fit:cover;
  display:block;
  margin:0 auto;
  border-radius:16px
}
.htl-hero-img.ph{
  width:380px;height:380px;
  border-radius:16px
}

/* ─ 제품명 배너 (accent 풀배경) ─ */
.htl-name-band{
  background:var(--accent);
  padding:24px 44px;
  text-align:left
}
.htl-product-name{
  font-family:var(--font-display);
  font-weight:800;font-size:44px;
  letter-spacing:-.02em;line-height:1.15;
  color:#fff
}
.htl-product-name .em{color:color-mix(in srgb,var(--accent) 30%,#fff)}

/* ─ 포인트 리스트 ─ */
.htl-list{padding:0 0 8px}
.htl-row{
  display:flex;
  align-items:center;
  gap:20px;
  padding:22px 40px;
  border-top:1px solid var(--line)
}
.htl-row:last-child{border-bottom:1px solid var(--line)}
.htl-info{flex:1;min-width:0}
.htl-point-label{
  font-family:var(--font-display);
  font-weight:800;font-size:15px;
  letter-spacing:.06em;
  color:var(--accent);
  margin-bottom:8px
}
.htl-desc{
  font-size:14px;
  line-height:1.7;
  color:var(--ink-2)
}
.htl-desc .em{color:var(--accent);font-weight:700}
.htl-thumb{
  flex:0 0 140px;
  width:140px;height:140px;
  border-radius:10px;
  object-fit:cover
}
.htl-thumb.ph{
  flex:0 0 140px;
  width:140px;height:140px;
  border-radius:10px
}
`,
  render: (d, { esc, richSafe }) => {
    const heroImg = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    return `
<section class="htl">
  <!-- 브랜드 로고 필 -->
  <div class="htl-top">
    ${d.brand ? `<span class="htl-brand">${esc(d.brand)}</span>` : ''}
  </div>

  <!-- 대형 헤드라인 -->
  <h1 class="htl-headline">${richSafe(d.headline)}</h1>

  <!-- 메인 히어로 이미지 (accent 원형 배경 위) -->
  <div class="htl-hero-zone">
    <div class="htl-hero-blob"></div>
    ${media(heroImg, 'htl-hero-img', esc(d.productName ?? '제품 이미지'))}
  </div>

  <!-- 제품명 배너 -->
  <div class="htl-name-band">
    <div class="htl-product-name">${richSafe(d.productName)}</div>
  </div>

  <!-- 포인트별 썸네일 리스트 -->
  <div class="htl-list">
    ${d.points
      .map(
        (p, i) => `
    <div class="htl-row">
      <div class="htl-info">
        <div class="htl-point-label">${esc(p.label ?? `Point ${pad2(i + 1)}`)}</div>
        <div class="htl-desc">${richSafe(p.desc)}</div>
      </div>
      ${media(p.image, 'htl-thumb', esc(p.label ?? `Point ${pad2(i + 1)}`))}
    </div>`,
      )
      .join('')}
  </div>
</section>`
  },
})
