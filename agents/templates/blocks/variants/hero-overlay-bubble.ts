/** HERO 아키타입(템플릿 충실 재현): hero-overlay-bubble.
 *  와디즈 200섹션 01_인트로 _359:932 패턴 재구성.
 *  구조: ① accent 풀배경 + 브랜드 로고 pill + 상품 이미지 + 제목 오버레이(이미지 하단~배경 영역)
 *        ② 말풍선(hand 폰트) + 서브 씬 이미지
 *        ③ 번호 텍스트 행 목록(01·02·03, hairline 구분)
 *  다른 히어로 변형과 차별화: 2존 분리(컬러블록/라이트), 말풍선 + 번호행 조합.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  brand: z.string().min(1),                           // 상단 pill 브랜드 로고 텍스트
  title: z.string().min(1),                           // 이미지 하단 오버레이 대제목 (em,br)
  heroImage: z.string().optional(),                   // 상단 상품 이미지 (url)
  bubble: z.string().min(1),                          // 말풍선 서브카피 (hand 폰트)
  sceneImage: z.string().optional(),                  // 말풍선 아래 씬/보조 이미지 (url)
  points: z
    .array(z.object({ text: z.string().min(1) }))    // 번호 행 목록 텍스트 (em,br)
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroOverlayBubble = defineBlock<Data>({
  id: 'hero-overlay-bubble',
  archetype: 'hero',
  styleTags: ['playful', 'colorblock', 'template', 'bubble'],
  imageSlots: 2,
  describe:
    '이미지 하단 제목 오버레이 히어로. accent 풀배경 + 브랜드 pill + 상품 이미지(제목이 이미지 아래로 걸쳐 오버레이) + 말풍선 서브카피(hand 폰트) + 씬 이미지 + 번호 텍스트 행 목록. 컬러블록 + 말풍선 조합.',
  schema,
  css: `
/* ── hob = hero-overlay-bubble 접두사 ── */

/* ─ 상단 컬러 존 ─ */
.hob-top{background:var(--accent);padding:28px 40px 0;text-align:center}

/* 브랜드 pill */
.hob-brand-pill{
  display:inline-block;
  background:#fff;
  color:var(--accent);
  font-family:var(--font-display);
  font-weight:800;
  font-size:15px;
  letter-spacing:.1em;
  padding:8px 28px;
  border-radius:999px;
  margin-bottom:24px;
  text-transform:uppercase
}

/* 상품 이미지 */
.hob-hero-img{
  width:calc(100% - 80px);
  height:480px;
  object-fit:cover;
  display:block;
  margin:0 auto;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px) calc(var(--r-scale,1)*16px) 0 0)
}

/* 이미지 없을 때 placeholder */
.hob-hero-ph{
  width:calc(100% - 80px);
  height:480px;
  margin:0 auto;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px) calc(var(--r-scale,1)*16px) 0 0)
}

/* ─ 제목 오버레이 영역(이미지 하단부 ~accent배경 위) ─ */
.hob-title-band{
  background:var(--accent);
  padding:0 40px 44px;
  text-align:left
}
.hob-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:72px;
  line-height:1.0;
  letter-spacing:-.03em;
  color:#fff;
  text-shadow:0 3px 18px rgba(0,0,0,.18)
}
.hob-title .em{color:color-mix(in srgb,#fff 55%,var(--accent))}

/* ─ 중간 라이트 존 ─ */
.hob-mid{background:var(--bg);padding:40px 40px 0}

/* 말풍선 */
.hob-bubble-wrap{position:relative;margin-bottom:0}
.hob-bubble{
  display:inline-block;
  background:color-mix(in srgb,var(--accent) 22%,var(--bg));
  color:var(--ink);
  font-family:var(--font-hand);
  font-size:20px;
  line-height:1.55;
  padding:18px 28px;
  border-radius:calc(var(--r-scale,1)*22px);
  position:relative;
  max-width:88%
}
/* 말풍선 꼬리 (하단 왼쪽) */
.hob-bubble::after{
  content:"";
  position:absolute;
  left:36px;
  bottom:-18px;
  width:0;height:0;
  border-left:12px solid transparent;
  border-right:12px solid transparent;
  border-top:20px solid color-mix(in srgb,var(--accent) 22%,var(--bg))
}

/* 씬 이미지 */
.hob-scene-img{
  width:100%;
  height:380px;
  object-fit:cover;
  display:block;
  margin-top:32px
}
.hob-scene-ph{
  width:100%;
  height:380px;
  margin-top:32px
}

/* ─ 번호 행 목록 ─ */
.hob-list{background:var(--bg);padding:0 40px 10px}
.hob-row{
  display:flex;
  align-items:center;
  gap:24px;
  padding:28px 0;
  border-top:1px solid var(--line)
}
.hob-num{
  flex:0 0 52px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:36px;
  color:var(--accent);
  line-height:1
}
.hob-text{
  flex:1;
  font-size:17px;
  font-weight:500;
  color:var(--ink);
  line-height:1.55
}
.hob-text .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="hob">
  <!-- ① 상단 accent 컬러 존 -->
  <div class="hob-top">
    <div class="hob-brand-pill">${esc(d.brand)}</div>
    ${d.heroImage
      ? media(d.heroImage, 'hob-hero-img', esc(d.brand))
      : `<div class="hob-hero-ph ph">제품 이미지</div>`}
  </div>

  <!-- 제목 오버레이 밴드 (이미지 아래 + accent 배경 위) -->
  <div class="hob-title-band">
    <h1 class="hob-title">${richSafe(d.title)}</h1>
  </div>

  <!-- ② 중간 라이트 존: 말풍선 + 씬 이미지 -->
  <div class="hob-mid">
    <div class="hob-bubble-wrap">
      <div class="hob-bubble hand">${esc(d.bubble)}</div>
    </div>
    ${d.sceneImage
      ? media(d.sceneImage, 'hob-scene-img', '씬 이미지')
      : `<div class="hob-scene-ph ph">씬 이미지</div>`}
  </div>

  <!-- ③ 번호 행 목록 -->
  <div class="hob-list">
    ${d.points
      .map(
        (pt, i) => `
    <div class="hob-row">
      <span class="hob-num">${pad2(i + 1)}</span>
      <span class="hob-text">${richSafe(pt.text)}</span>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
