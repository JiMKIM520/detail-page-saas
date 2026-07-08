/** HERO 아키타입(템플릿 충실 재현): hero-check-rows.
 *  와디즈 200섹션 01_인트로 _05 패턴 재구성 (Figma 1278:218).
 *  브랜드 컬러 풀배경 + 중앙 제목 존 → 전폭 체크마크 배지 행 3개 → 제품 이미지.
 *  다른 히어로 변형과의 차별화:
 *    hero-icon-rows    — 좌정렬 + SVG 아이콘(원형) + 구분선 행
 *    hero-circle-check — 원형 이미지 체크 레이아웃
 *    hero-check-rows   — brand 그라디언트 배경 + 흰 체크박스 카드 행 3개 + 하단 제품 이미지 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().min(1).optional(),        // 브랜드명 — 상단 중앙 로고 대체 텍스트
  sub: z.string().optional(),                  // 소제목 / 캐치프레이즈 (em, br 허용)
  title: z.string().min(1),                    // 대형 제품명 (em, br 허용)
  rows: z
    .array(
      z.object({
        text: z.string().min(1),               // 체크 배지 본문 — 2줄 가능 (em, br 허용)
      }),
    )
    .min(2)
    .max(4),
  productImage: z.string().optional(),         // 하단 제품 이미지 (url)
})
type Data = z.infer<typeof schema>

export const heroCheckRows = defineBlock<Data>({
  id: 'hero-check-rows',
  archetype: 'hero',
  styleTags: ['modern', 'commerce', 'template', 'colorblock', 'checklist'],
  imageSlots: 1,
  describe:
    '브랜드 컬러 풀배경 히어로. 중앙 브랜드명+구분선 → 소제목+대형 제목 → 전폭 흰 체크마크 배지 행 2~4개 → 하단 제품 이미지. 강한 컬러블록+리스트 구조. 차별화 포인트 강조에 적합.',
  schema,
  css: `
/* ── hcr = hero-check-rows 접두사 ── */
.hcr{
  background:linear-gradient(170deg,var(--brand) 0%,var(--accent) 100%);
  color:#fff;
  overflow:hidden
}

/* ─ 상단 헤더 존 ─ */
.hcr-hd{
  padding:52px 48px 36px;
  text-align:center
}
.hcr-brand{
  font-family:var(--font-body);
  font-size:13px;font-weight:800;
  letter-spacing:.26em;text-transform:uppercase;
  color:rgba(255,255,255,.9)
}
.hcr-divider{
  width:36px;height:2px;
  background:rgba(255,255,255,.45);
  margin:14px auto 22px
}
.hcr-sub{
  font-family:var(--font-body);
  font-size:18px;font-weight:500;
  color:rgba(255,255,255,.88);
  line-height:1.55;
  margin-bottom:10px
}
.hcr-sub .em{color:#fff;font-weight:700}
.hcr-title{
  font-family:var(--font-display);
  font-weight:800;font-size:52px;
  letter-spacing:-.025em;line-height:1.08;
  color:#fff
}
.hcr-title .em{color:color-mix(in srgb,#fff 70%,var(--accent))}

/* ─ 체크 배지 행 존 ─ */
.hcr-rows{
  padding:6px 32px 40px
}
.hcr-row{
  display:flex;
  align-items:center;
  gap:20px;
  background:rgba(255,255,255,.13);
  border:1px solid rgba(255,255,255,.22);
  border-radius:calc(var(--r-scale,1)*14px);
  padding:22px 28px;
  margin-bottom:12px
}
.hcr-row:last-child{margin-bottom:0}

/* 체크박스 아이콘 */
.hcr-chk{
  flex:0 0 36px;width:36px;height:36px;
  border-radius:calc(var(--r-scale,1)*8px);
  background:var(--accent);
  display:flex;align-items:center;justify-content:center;
  color:#fff;
  box-shadow:0 2px 8px rgba(0,0,0,.18)
}
.hcr-chk svg{
  width:20px;height:20px;
  stroke:#fff;stroke-width:3;
  fill:none;
  stroke-linecap:round;stroke-linejoin:round
}

/* 배지 텍스트 */
.hcr-txt{
  flex:1;min-width:0;
  font-family:var(--font-body);
  font-size:16px;font-weight:500;
  color:#fff;line-height:1.6
}
.hcr-txt .em{color:#fff;font-weight:700}

/* ─ 제품 이미지 존 ─ */
.hcr-img-wrap{
  padding:0 32px 0;
  background:rgba(255,255,255,.06)
}
.hcr-product{
  width:100%;
  height:480px;
  object-fit:cover;
  display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px) calc(var(--r-scale,1)*18px) 0 0)
}
`,
  render: (d, { esc, richSafe }) => `
<section class="hcr">
  <!-- 상단 헤더: 브랜드명 + 구분선 + 소제목 + 대형 제목 -->
  <div class="hcr-hd">
    ${d.brand ? `<p class="hcr-brand">${esc(d.brand)}</p><div class="hcr-divider"></div>` : ''}
    ${d.sub ? `<p class="hcr-sub">${richSafe(d.sub)}</p>` : ''}
    <h1 class="disp hcr-title">${richSafe(d.title)}</h1>
  </div>

  <!-- 전폭 체크마크 배지 행 -->
  <div class="hcr-rows">
    ${d.rows
      .map(
        (r) => `
    <div class="hcr-row">
      <span class="hcr-chk">
        <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      </span>
      <div class="hcr-txt">${richSafe(r.text)}</div>
    </div>`,
      )
      .join('')}
  </div>

  <!-- 하단 제품 이미지 (url 없으면 placeholder) -->
  <div class="hcr-img-wrap">
    ${media(d.productImage, 'hcr-product', esc(d.title))}
  </div>
</section>`,
})
