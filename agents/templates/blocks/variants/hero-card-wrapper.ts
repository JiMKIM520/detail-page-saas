/** HERO 아키타입(템플릿 충실 재현): hero-card-wrapper.
 *  피그마 01_인트로 1270:1161 — 단일 라운드 컬러 카드 래퍼.
 *  구조: ① 상단 브랜드 로고 텍스트(외부, 흰 배경) →
 *        ② accent 배경 대형 라운드 카드 안에:
 *           헤드라인 → 서브 설명 → 풀폭 제품 이미지 → 불릿 리스트 →
 *        ③ 카드 하단 장식 화살표.
 *  다른 히어로 변형과의 차별화: 콘텐츠 전체가 하나의 둥근 컬러 카드 안에 포함되는 컨테이너 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandLogo: z.string().optional(),          // 브랜드 로고 텍스트(카드 외부 상단, em 허용)
  headline: z.string().min(1),               // 제품명/헤드라인 (em,br 허용)
  subtitle: z.string().optional(),           // 부제목/설명 (em,br 허용, 1~2줄)
  productImage: z.string().optional(),       // 제품 대표 이미지 (url)
  bullets: z
    .array(z.object({ text: z.string().min(1) }))
    .min(2)
    .max(4),                                 // 차별화 포인트 불릿 리스트 (2~4개)
})
type Data = z.infer<typeof schema>

export const heroCardWrapper = defineBlock<Data>({
  id: 'hero-card-wrapper',
  archetype: 'hero',
  styleTags: ['colorblock', 'template', 'centered', 'light'],
  imageSlots: 1,
  describe:
    '단일 라운드 컬러 카드 래퍼 인트로. 브랜드 로고(외부 상단) + accent 배경 대형 라운드 카드 안에 헤드라인·부제목·제품 이미지·불릿 리스트를 모두 담는 컨테이너 구조. 강한 컬러블록.',
  schema,
  css: `
/* ── hcw = hero-card-wrapper 접두사 ── */
.hcw{background:var(--bg);padding:48px 40px 0}

/* ─ 브랜드 로고 (카드 외부 상단) ─ */
.hcw-brand{
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:36px;
  letter-spacing:.04em;
  color:var(--accent);
  margin-bottom:32px
}
.hcw-brand .em{color:var(--accent)}

/* ─ 메인 라운드 카드 ─ */
.hcw-card{
  background:var(--accent);
  border-radius:calc(var(--r-scale,1)*32px) calc(var(--r-scale,1)*32px) 0 0;
  padding:44px 40px 0;
  overflow:hidden;
  position:relative
}

/* ─ 헤드라인 ─ */
.hcw-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:52px;
  letter-spacing:-.01em;
  line-height:1.1;
  color:#fff;
  text-align:center;
  margin-bottom:20px
}
.hcw-headline .em{color:var(--ink)}

/* ─ 부제목 ─ */
.hcw-subtitle{
  font-family:var(--font-body);
  font-size:18px;
  font-weight:500;
  line-height:1.65;
  color:rgba(255,255,255,.9);
  text-align:center;
  margin-bottom:32px
}
.hcw-subtitle .em{color:#fff;font-weight:700}

/* ─ 제품 이미지 ─ */
.hcw-img{
  width:84%;
  margin:0 auto;
  aspect-ratio:3/4;
  object-fit:contain;
  display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))
}

/* ─ 불릿 리스트 ─ */
.hcw-bullets{
  padding:32px 16px 40px;
  list-style:none
}
.hcw-bullet{
  display:flex;
  align-items:flex-start;
  gap:12px;
  font-family:var(--font-body);
  font-size:17px;
  font-weight:500;
  color:rgba(255,255,255,.92);
  line-height:1.6;
  margin-bottom:0
}
.hcw-bullet+.hcw-bullet{margin-top:20px}
.hcw-bullet::before{
  content:"•";
  color:#fff;
  font-size:20px;
  line-height:1.4;
  flex-shrink:0
}

/* ─ 하단 화살표 장식 ─ */
.hcw-arrow{
  display:flex;
  justify-content:center;
  padding:0 0 32px;
  color:rgba(255,255,255,.7)
}
.hcw-arrow svg{
  width:28px;
  height:28px
}
`,
  render: (d, { esc, richSafe }) => `
<section class="hcw">
  <!-- 브랜드 로고 (카드 외부 상단) -->
  ${d.brandLogo ? `<p class="hcw-brand">${richSafe(d.brandLogo)}</p>` : ''}

  <!-- 메인 라운드 컬러 카드 -->
  <div class="hcw-card">

    <!-- 헤드라인 -->
    <h1 class="hcw-headline">${richSafe(d.headline)}</h1>

    <!-- 부제목 -->
    ${d.subtitle ? `<p class="hcw-subtitle">${richSafe(d.subtitle)}</p>` : ''}

    <!-- 제품 이미지 -->
    ${media(d.productImage, 'hcw-img', esc(d.headline))}

    <!-- 불릿 리스트 -->
    <ul class="hcw-bullets">
      ${d.bullets.map((b) => `<li class="hcw-bullet">${esc(b.text)}</li>`).join('\n      ')}
    </ul>

    <!-- 하단 화살표 장식 -->
    <div class="hcw-arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>

  </div>
</section>`,
})
