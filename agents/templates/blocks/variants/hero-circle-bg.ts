/** HERO 아키타입(템플릿 충실 재현): hero-circle-bg.
 *  와디즈 200섹션 01_인트로 패턴 재구성.
 *  구조: 브랜드 레이블(우상단) → 대형 원형 배경 + 제품 이미지 오버랩 →
 *        제품명(대형 컬러 디스플레이) + 설명 텍스트 →
 *        얇은 구분선 → 번호형 포인트 리스트(01/02/03) → 하단 accent 그라데이션.
 *  다른 히어로 변형과의 차별화: 이미지가 단색 원 도형 위에 오버랩되어
 *  배경이 사진이 아닌 컬러 도형(accent circle)으로 구성된 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  brand: z.string().min(1).optional(),         // 우상단 브랜드 레이블
  productImage: z.string().optional(),          // 원형 배경 위 오버랩 제품 이미지 (url)
  productName: z.string().min(1),              // 대형 제품명 (em,br)
  description: z.string().min(1).optional(),   // 제품 설명 한 줄 (em,br)
  points: z
    .array(
      z.object({
        desc: z.string().min(1), // 포인트 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroCircleBg = defineBlock<Data>({
  id: 'hero-circle-bg',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'colorblock', 'centered', 'light'],
  imageSlots: 1,
  describe:
    '대형 단색 원 배경 + 제품 이미지 오버랩 인트로. 우상단 브랜드 레이블, accent 원 위에 세로형 제품 사진 오버랩, 대형 컬러 제품명+설명 텍스트, 구분선, 번호(01/02/03)+설명 포인트 리스트, 하단 accent 그라데이션. 단색 원형 도형이 배경 역할을 하는 인트로 레이아웃.',
  schema,
  css: `
/* ── hcb = hero-circle-bg 접두사 ── */
.hcb{background:var(--bg);overflow:hidden;position:relative}

/* ─ 브랜드 레이블 (우상단) ─ */
.hcb-brand-wrap{display:flex;justify-content:flex-end;padding:20px 28px 0}
.hcb-brand{
  display:inline-block;
  border:2px solid var(--ink);
  color:var(--ink);
  font-family:var(--font-body);
  font-size:12px;font-weight:800;
  letter-spacing:.12em;text-transform:uppercase;
  padding:6px 16px;
  line-height:1
}

/* ─ 원형 배경 + 이미지 존 ─ */
.hcb-visual{
  position:relative;
  display:flex;justify-content:center;align-items:flex-end;
  padding:24px 0 0;
  min-height:440px
}
.hcb-circle{
  position:absolute;
  width:420px;height:420px;
  border-radius:50%;
  background:var(--accent);
  left:50%;transform:translateX(-50%);
  top:20px;
  z-index:0
}
.hcb-img{
  position:relative;z-index:1;
  width:300px;height:400px;
  object-fit:cover;
  display:block
}

/* ─ 제품명 + 설명 ─ */
.hcb-text{
  padding:36px 48px 0;
  text-align:center
}
.hcb-name{
  font-family:var(--font-display);
  font-weight:800;font-size:58px;
  letter-spacing:-.02em;line-height:1.08;
  color:var(--accent)
}
.hcb-name .em{color:var(--ink)}
.hcb-desc{
  margin-top:14px;
  font-family:var(--font-body);
  font-size:18px;font-weight:400;
  color:var(--ink-2);line-height:1.6
}
.hcb-desc .em{color:var(--accent);font-weight:700}

/* ─ 구분선 ─ */
.hcb-divider{
  width:1px;height:60px;
  background:var(--line);
  margin:32px auto 0
}

/* ─ 번호형 포인트 리스트 ─ */
.hcb-points{padding:8px 56px 0}
.hcb-pt{
  padding:32px 0 0;
  text-align:center
}
.hcb-pt-num{
  font-family:'Cafe24 ClassicType',serif;
  font-size:42px;font-weight:400;
  color:var(--accent);
  line-height:1
}
.hcb-pt-desc{
  margin-top:12px;
  font-family:var(--font-body);
  font-size:16px;font-weight:400;
  color:var(--ink-2);line-height:1.7
}
.hcb-pt-desc .em{color:var(--accent);font-weight:700}

/* ─ 하단 그라데이션 ─ */
.hcb-footer-grad{
  margin-top:48px;
  height:220px;
  background:linear-gradient(180deg,var(--bg) 0%,color-mix(in srgb,var(--accent) 22%,transparent) 100%)
}
`,
  render: (d, { esc, richSafe }) => `
<section class="hcb">
  <!-- 브랜드 레이블 -->
  ${d.brand ? `<div class="hcb-brand-wrap"><span class="hcb-brand">${esc(d.brand)}</span></div>` : ''}

  <!-- 원형 배경 + 제품 이미지 오버랩 -->
  <div class="hcb-visual">
    <div class="hcb-circle"></div>
    ${media(d.productImage, 'hcb-img', esc(d.productName))}
  </div>

  <!-- 제품명 + 설명 -->
  <div class="hcb-text">
    <h1 class="hcb-name">${richSafe(d.productName)}</h1>
    ${d.description ? `<p class="hcb-desc">${richSafe(d.description)}</p>` : ''}
  </div>

  <!-- 구분선 -->
  <div class="hcb-divider"></div>

  <!-- 번호형 포인트 리스트 -->
  <div class="hcb-points">
    ${d.points
      .map(
        (pt, i) => `
    <div class="hcb-pt">
      <div class="hcb-pt-num">${pad2(i + 1)}</div>
      <p class="hcb-pt-desc">${richSafe(pt.desc)}</p>
    </div>`,
      )
      .join('')}
  </div>

  <!-- 하단 그라데이션 -->
  <div class="hcb-footer-grad"></div>
</section>`,
})
