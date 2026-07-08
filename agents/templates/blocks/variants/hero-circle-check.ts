/** HERO 아키타입(템플릿 충실 재현): hero-circle-check.
 *  와디즈 200섹션 01_인트로_체크리스트/말풍선+원형이미지(563:110) 패턴 재구성.
 *  레이아웃: 다크 그라데이션 상단(손글씨 부제 + 대형 제품명) →
 *  라벤더 중간존(말풍선 브랜드 로고 + 원형 클립 제품 이미지) →
 *  라벤더 하단(accent 원형 체크마크 아이콘 + 특징 텍스트 리스트). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subtitle: z.string().optional(),          // 손글씨 부제목 (em,br) — 예: "제품에 대한 설명을 써주세요!"
  productName: z.string().min(1),           // 대형 제품명 헤드라인 (em,br)
  brandLogo: z.string().optional(),         // 말풍선 브랜드 로고 텍스트
  productImage: z.string().optional(),      // 원형 클립 제품 이미지 (url)
  points: z
    .array(z.object({ text: z.string().min(1) }))
    .min(2)
    .max(4),                                // 체크리스트 항목 (em,br)
})
type Data = z.infer<typeof schema>

export const heroCircleCheck = defineBlock<Data>({
  id: 'hero-circle-check',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'colorblock', 'checklist', 'gradient'],
  imageSlots: 1,
  describe:
    '다크 그라데이션 상단(손글씨 부제+대형 제품명) + 라벤더 중간존(말풍선 브랜드명+원형 제품이미지) + accent 원형 체크마크 리스트. 인트로+특징 요약 복합형.',
  schema,
  css: `
/* ── hcc = hero-circle-check 접두사 ── */
.hcc{background:var(--bg);overflow:hidden;margin:0;padding:0}

/* ─ 상단 다크 그라데이션 존 ─ */
.hcc-dark{
  background:linear-gradient(
    180deg,
    color-mix(in srgb,var(--ink) 92%,#000) 0%,
    color-mix(in srgb,var(--ink) 60%,var(--bg)) 70%,
    color-mix(in srgb,var(--ink) 24%,var(--bg)) 100%
  );
  padding:64px 52px 48px;
  text-align:center;
  position:relative
}
.hcc-subtitle{
  font-family:var(--font-hand);
  font-size:18px;
  color:rgba(255,255,255,.72);
  margin-bottom:16px;
  line-height:1.5
}
.hcc-subtitle .em{color:var(--accent)}
.hcc-product-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:64px;
  letter-spacing:-.025em;
  line-height:1.08;
  color:#fff;
  text-shadow:0 2px 20px rgba(0,0,0,.28)
}
.hcc-product-name .em{color:color-mix(in srgb,var(--accent) 55%,#fff)}

/* ─ 라벤더 중간존 ─ */
.hcc-mid{
  background:color-mix(in srgb,var(--accent) 14%,#fff);
  padding:48px 52px 0;
  display:flex;
  flex-direction:column;
  align-items:center
}

/* 말풍선 */
.hcc-bubble{
  background:#fff;
  border-radius:calc(var(--r-scale,1)*20px);
  padding:14px 36px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:18px;
  letter-spacing:.04em;
  color:var(--ink);
  box-shadow:0 2px 16px rgba(0,0,0,.10);
  position:relative;
  text-align:center;
  margin-bottom:0
}
/* 말풍선 꼬리 (아래 방향 삼각형) */
.hcc-bubble::after{
  content:"";
  position:absolute;
  bottom:-14px;
  left:50%;
  transform:translateX(-50%);
  border:7px solid transparent;
  border-top-color:#fff;
  border-bottom:0
}

/* 원형 이미지 */
.hcc-circle-wrap{
  width:260px;
  height:260px;
  border-radius:50%;
  overflow:hidden;
  margin-top:28px;
  background:color-mix(in srgb,var(--accent) 18%,#fff);
  display:flex;
  align-items:center;
  justify-content:center
}
.hcc-circle-img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%
}

/* ─ 라벤더 하단 체크리스트 존 ─ */
.hcc-list{
  background:color-mix(in srgb,var(--accent) 14%,#fff);
  padding:32px 40px 56px
}
.hcc-item{
  display:flex;
  align-items:center;
  gap:18px;
  background:#fff;
  border-radius:calc(var(--r-scale,1)*16px);
  padding:18px 24px;
  margin-bottom:14px;
  box-shadow:0 2px 12px rgba(0,0,0,.07)
}
.hcc-item:last-child{margin-bottom:0}
.hcc-icon{
  flex:0 0 36px;
  width:36px;
  height:36px;
  border-radius:50%;
  background:var(--accent);
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff
}
.hcc-icon svg{width:18px;height:18px;display:block}
.hcc-point-text{
  font-family:var(--font-body);
  font-weight:700;
  font-size:17px;
  color:var(--ink);
  line-height:1.45;
  flex:1
}
.hcc-point-text .em{color:var(--accent);font-weight:800}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="hcc">
  <!-- 상단 다크 그라데이션 존 -->
  <div class="hcc-dark">
    ${d.subtitle ? `<p class="hcc-subtitle">${richSafe(d.subtitle)}</p>` : ''}
    <h1 class="hcc-product-name">${richSafe(d.productName)}</h1>
  </div>

  <!-- 라벤더 중간존: 말풍선 + 원형 이미지 -->
  <div class="hcc-mid">
    ${d.brandLogo ? `<div class="hcc-bubble">${esc(d.brandLogo)}</div>` : ''}
    <div class="hcc-circle-wrap">
      ${media(d.productImage, 'hcc-circle-img', esc(d.productName))}
    </div>
  </div>

  <!-- 라벤더 하단 체크리스트 -->
  <div class="hcc-list">
    ${d.points
      .map(
        (p) => `
    <div class="hcc-item">
      <span class="hcc-icon">${icon('check')}</span>
      <span class="hcc-point-text">${richSafe(p.text)}</span>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
