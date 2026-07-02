/** HERO 아키타입(템플릿 충실 재현): hero-bubble-points.
 *  피그마 1278:221 — 01_인트로 / 3개 버블 원형 이미지 주변 배치.
 *  레이아웃:
 *    ① 상단 라이트 존 — 영문 제품명(소) + 2줄 제품명 헤드라인.
 *    ② 버블 비주얼 존 — 좌·상·우에 배치된 3개 accent 원형 버블(포인트 텍스트)
 *       + 중앙 하단 제품 이미지.
 *    ③ 하단 브랜드 로고 띠.
 *  배경: 라벤더 그라데이션 + 대각 광선 장식(순수 CSS). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),       // 영문 제품명 소형 레이블 (plain)
  subtitle: z.string().min(1).optional(),       // 부제목 한 줄 (em,br)
  productName: z.string().min(1),              // 대형 제품명 헤드라인 (em,br)
  bubbles: z
    .array(
      z.object({
        text: z.string().min(1),               // 버블 포인트 텍스트 (em,br)
      }),
    )
    .min(2)
    .max(4),                                   // 기본 3개 권장
  productImage: z.string().optional(),         // 중앙 제품 이미지 (url)
  brandLogo: z.string().min(1).optional(),     // 하단 브랜드 로고 텍스트
})
type Data = z.infer<typeof schema>

export const heroBubblePoints = defineBlock<Data>({
  id: 'hero-bubble-points',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'colorblock', 'bubble', 'light', 'centered'],
  imageSlots: 1,
  describe:
    '포인트 텍스트 담은 3개 accent 원형 버블이 중앙 제품 이미지 주변(좌·상·우)에 배치된 인트로. ' +
    '라벤더 그라데이션 배경 + 광선 장식 + 하단 브랜드 로고. 인트로+차별화포인트 복합형.',
  schema,
  css: `
/* ── hbp = hero-bubble-points 접두사 ── */
.hbp{
  background:linear-gradient(160deg,
    color-mix(in srgb,var(--accent) 18%,#fff) 0%,
    color-mix(in srgb,var(--accent) 8%,#fff) 55%,
    color-mix(in srgb,var(--accent) 4%,#fff) 100%
  );
  overflow:hidden;
  position:relative
}

/* 대각 광선 장식 */
.hbp::before,.hbp::after{
  content:"";
  position:absolute;
  pointer-events:none
}
.hbp::before{
  top:-60px;right:-80px;
  width:520px;height:520px;
  background:linear-gradient(135deg,
    color-mix(in srgb,var(--accent) 20%,transparent) 0%,
    transparent 55%
  );
  transform:rotate(-10deg);
  border-radius:50%
}
.hbp::after{
  top:20px;left:-60px;
  width:380px;height:380px;
  background:linear-gradient(45deg,
    color-mix(in srgb,var(--accent) 12%,transparent) 0%,
    transparent 60%
  );
  transform:rotate(15deg);
  border-radius:50%
}

/* ─ 상단 헤드라인 존 ─ */
.hbp-hd{
  position:relative;
  z-index:1;
  padding:52px 48px 0
}
.hbp-eyebrow{
  font-family:var(--font-display);
  font-weight:700;
  font-size:14px;
  letter-spacing:.18em;
  color:var(--accent);
  margin-bottom:18px;
  line-height:1
}
.hbp-subtitle{
  font-size:18px;
  font-weight:500;
  color:var(--ink-2);
  line-height:1.5;
  margin-bottom:6px
}
.hbp-subtitle .em{color:var(--accent);font-weight:700}
.hbp-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:52px;
  letter-spacing:-.025em;
  line-height:1.1;
  color:var(--ink)
}
.hbp-title .em{color:var(--accent)}

/* ─ 버블 + 이미지 비주얼 존 ─ */
.hbp-visual{
  position:relative;
  z-index:1;
  width:100%;
  /* 3개 버블(좌·상·우) + 이미지 아래 → 충분한 높이 확보 */
  height:440px;
  margin-top:32px
}

/* 버블 공통 */
.hbp-bubble{
  position:absolute;
  width:148px;
  height:148px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 38%,#fff);
  border:2.5px solid color-mix(in srgb,var(--accent) 55%,#fff);
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:20px 16px;
  box-shadow:0 4px 20px color-mix(in srgb,var(--accent) 22%,transparent)
}
.hbp-bubble-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:16px;
  line-height:1.4;
  color:#fff;
  word-break:keep-all
}
.hbp-bubble-text .em{
  color:color-mix(in srgb,#fff 80%,var(--accent))
}

/* 버블 위치: 좌(01) · 상중앙(02) · 우(03) */
/* 좌 버블 — 이미지 왼쪽에 걸침 */
.hbp-bubble:nth-child(1){
  left:28px;
  top:120px
}
/* 상 버블 — 이미지 상단 중앙 */
.hbp-bubble:nth-child(2){
  left:50%;
  transform:translateX(-50%);
  top:8px
}
/* 우 버블 — 이미지 오른쪽에 걸침 */
.hbp-bubble:nth-child(3){
  right:28px;
  top:120px
}
/* 4번째 버블이 있을 경우: 하단 중앙 */
.hbp-bubble:nth-child(4){
  left:50%;
  transform:translateX(-50%);
  bottom:16px
}

/* 제품 이미지 — 버블들과 겹치는 중앙 하단 영역 */
.hbp-product-wrap{
  position:absolute;
  left:50%;
  top:128px;
  transform:translateX(-50%);
  width:260px;
  height:280px;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 6px 32px rgba(0,0,0,.08)
}
.hbp-product-img{
  width:100%;
  height:100%;
  object-fit:cover
}

/* ─ 브랜드 로고 띠 ─ */
.hbp-logo{
  position:relative;
  z-index:1;
  text-align:center;
  padding:36px 48px 52px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:48px;
  letter-spacing:.04em;
  color:color-mix(in srgb,var(--accent) 55%,var(--ink))
}
`,
  render: (d, { esc, richSafe }) => `
<section class="hbp">

  <!-- 상단 헤드라인 존 -->
  <div class="hbp-hd">
    ${d.eyebrow ? `<p class="hbp-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    ${d.subtitle ? `<p class="hbp-subtitle">${richSafe(d.subtitle)}</p>` : ''}
    <h1 class="hbp-title">${richSafe(d.productName)}</h1>
  </div>

  <!-- 버블 + 이미지 비주얼 존 -->
  <div class="hbp-visual">
    ${d.bubbles
      .map(
        (b) => `
    <div class="hbp-bubble">
      <span class="hbp-bubble-text">${richSafe(b.text)}</span>
    </div>`,
      )
      .join('')}
    <!-- 중앙 제품 이미지 -->
    <div class="hbp-product-wrap">
      ${media(d.productImage, 'hbp-product-img', esc(d.productName))}
    </div>
  </div>

  <!-- 하단 브랜드 로고 -->
  ${d.brandLogo ? `<div class="hbp-logo">${esc(d.brandLogo)}</div>` : ''}

</section>`,
})
