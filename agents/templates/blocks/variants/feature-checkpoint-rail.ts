/** FEATURE 아키타입: feature-checkpoint-rail
 *  피그마 292_제품특징_27 구조 흡수.
 *  그라데이션 배경 + 상단 pill 레이블 + 대형 중앙 타이틀(+ 부제) +
 *  풀너비 제품 이미지 위 좌측에 원형 썸네일 3개를 아래방향 화살표로 연결한
 *  수직 체크포인트 레일 오버레이 — 제품 단계 설명 장치.
 *  이미지 없을 때: 제품 이미지 영역을 accent 틴트 패널로 강등, 레일 오버레이 유지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const stepSchema = z.object({
  thumb: z.string().optional(),   // 원형 썸네일 이미지 url
  label: z.string().min(1),       // 단계 레이블 (예: "STEP 01")
  text: z.string().min(1),        // 단계 설명 (em 허용)
})

const schema = z.object({
  pill: z.string().optional(),          // pill 레이블 텍스트 (기본 "check point")
  title: z.string().min(1),            // 대형 타이틀 (em,br 허용)
  subtitle: z.string().optional(),     // 타이틀 아래 부제 (순수 텍스트)
  productImage: z.string().optional(), // 제품 전신 이미지 url
  steps: z.array(stepSchema).min(2).max(3),  // 체크포인트 레일 단계 (2~3개)
})
type Data = z.infer<typeof schema>

export const featureCheckpointRail = defineBlock<Data>({
  id: 'feature-checkpoint-rail',
  archetype: 'feature',
  // noimg-safe: 제품 이미지 없을 때 틴트 패널로 강등, 썸네일 없을 때 번호 원으로 대체
  styleTags: ['light', 'gradient', 'editorial', 'steps', 'noimg-safe'],
  imageSlots: 4, // 제품 이미지 1 + 썸네일 최대 3
  describe:
    '단계 강조 피처 블록. 그라데이션 배경 + pill 레이블 + 대형 타이틀 + 풀너비 제품 이미지 위에 좌측 수직 레일로 원형 썸네일 3개를 화살표로 연결한 체크포인트 오버레이. 제품 사용 단계·특징 순서 설명에 최적.',
  schema,
  css: `
.fwxx{
  position:relative;
  background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,var(--bg)) 0%,var(--bg) 60%,color-mix(in srgb,var(--accent-d) 10%,var(--bg)) 100%);
  padding:60px 0 0;
  overflow:hidden
}
/* ── pill 레이블 ── */
.fwxx-pill-wrap{
  text-align:center;
  margin-bottom:28px;
  padding:0 var(--pad-x,56px)
}
.fwxx-pill{
  display:inline-block;
  background:var(--ink);
  color:var(--bg);
  font-family:var(--font-display);
  font-weight:500;
  font-size:18px;
  letter-spacing:.08em;
  padding:10px 32px;
  border-radius:999px
}
/* ── 타이틀 영역 ── */
.fwxx-title-area{
  text-align:center;
  padding:0 var(--pad-x,56px);
  margin-bottom:40px
}
.fwxx-title{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(42px,6vw,72px);
  color:var(--ink);
  line-height:1.18;
  letter-spacing:-.02em
}
.fwxx-title .em{color:var(--accent-d);font-weight:800}
.fwxx-sub{
  margin-top:16px;
  font-size:19px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.5
}
/* ── 제품 이미지 + 레일 오버레이 영역 ── */
.fwxx-product-wrap{
  position:relative;
  width:100%;
  /* 원본 860×981 비율 ≈ 1:1.14 → 데스크톱 872px 기준 약 994px */
  aspect-ratio:860/981;
  /* 레일 최하단 썸네일 클리핑 방지:
     레일 top(36) + 3thumb(324) + 2arrow(96) + 반지름 여백(54) = 510px 최솟값 보장 */
  min-height:calc(var(--r-scale,1)*510px);
  background:color-mix(in srgb,var(--accent) 12%,var(--bg))
}
/* 강등 안전: productImage 없을 때 .ph는 전역으로 display:none — 부모 패널 배경색이 대신 노출 */
.fwxx-product{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));
  display:block
}
.fwxx-product.ph{display:none!important}
/* ── 수직 레일 오버레이 ── */
.fwxx-rail{
  position:absolute;
  top:36px;
  left:32px;
  width:108px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0
}
.fwxx-rail-step{
  display:flex;
  flex-direction:column;
  align-items:center
}
/* 원형 썸네일 */
.fwxx-thumb-ring{
  width:108px;
  height:108px;
  border-radius:50%;
  overflow:hidden;
  border:3px solid rgba(255,255,255,.85);
  box-shadow:0 4px 18px rgba(0,0,0,.22);
  background:color-mix(in srgb,var(--accent) 20%,var(--bg));
  flex-shrink:0
}
.fwxx-thumb-ring img,.fwxx-thumb-ring .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
  display:block
}
.fwxx-thumb-ring .ph{display:none!important}
/* 썸네일 없을 때 번호 폴백 원 */
.fwxx-thumb-num{
  width:108px;
  height:108px;
  border-radius:50%;
  background:var(--accent);
  border:3px solid rgba(255,255,255,.85);
  box-shadow:0 4px 18px rgba(0,0,0,.22);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0
}
.fwxx-thumb-num span{
  font-family:var(--font-display);
  font-weight:800;
  font-size:32px;
  color:#fff;
  line-height:1
}
/* 화살표 SVG (그라데이션 채색) */
.fwxx-arrow{
  width:36px;
  height:32px;
  flex-shrink:0;
  margin:4px 0
}
/* 이미지 위 스크림 — 레일 영역 가독성 확보 */
.fwxx-scrim{
  position:absolute;
  inset:0;
  background:linear-gradient(to right,rgba(0,0,0,.55) 0%,rgba(0,0,0,.18) 52%,rgba(0,0,0,0) 100%);
  pointer-events:none
}
/* 단계 텍스트 (레일 오른쪽 말풍선) */
.fwxx-step-bubble{
  position:absolute;
  left:156px;
  /* top은 JS 없이 CSS counter-based 대신 nth-child로 계산 */
  background:rgba(255,255,255,.95);
  backdrop-filter:blur(8px);
  border-radius:calc(var(--r-scale,1)*12px);
  padding:12px 18px;
  min-width:180px;
  max-width:240px;
  box-shadow:0 3px 16px rgba(0,0,0,.18)
}
.fwxx-step-bubble .fwxx-slabel{
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  letter-spacing:.1em;
  color:var(--accent-d);
  margin-bottom:6px
}
.fwxx-step-bubble .fwxx-stext{
  font-size:15px;
  font-weight:500;
  color:var(--ink);
  line-height:1.55
}
.fwxx-step-bubble .fwxx-stext .em{color:var(--accent-d);font-weight:700}
/* 말풍선 위치 — nth-child 기반 (레일 순서: 썸네일0, 화살표, 썸네일1, 화살표, 썸네일2) */
.fwxx-step-bubble-0{top:18px}
.fwxx-step-bubble-1{top:162px}
.fwxx-step-bubble-2{top:306px}
`,
  render: (d, { esc, richSafe }) => {
    const pill = d.pill ?? 'check point'
    const steps = d.steps

    // 화살표 SVG (그라데이션 방향: 위→아래, accent → accent-d)
    const arrowSvg = `<svg class="fwxx-arrow" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="fwxx-arr-g" x1="18" y1="0" x2="18" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="var(--accent)" stop-opacity=".7"/>
      <stop offset="100%" stop-color="var(--accent-d)" stop-opacity=".9"/>
    </linearGradient>
  </defs>
  <path d="M18 2 L18 24 M10 17 L18 26 L26 17" stroke="url(#fwxx-arr-g)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

    // 레일 아이템 조합 (썸네일 + 화살표, 마지막 화살표는 생략)
    const railItems = steps.map((s, i) => {
      const thumbHtml = `<div class="fwxx-thumb-ring">${media(s.thumb, '', `단계 ${i + 1} 썸네일`)}</div>`
      // thumb 없을 때 번호 폴백: media()는 .ph를 반환하고 전역 .ph{display:none}이 숨김
      // → 번호 원을 조건부로 병치해 항상 한 개는 보이게
      const numFallback = `<div class="fwxx-thumb-num" aria-hidden="true"><span>${String(i + 1).padStart(2, '0')}</span></div>`
      const arrow = i < steps.length - 1 ? arrowSvg : ''
      return `
    <div class="fwxx-rail-step">
      ${thumbHtml}
      ${numFallback}
      ${arrow}
    </div>`
    }).join('')

    // 말풍선 (절대 위치, 레일 오른쪽)
    const bubbles = steps.map((s, i) => `
    <div class="fwxx-step-bubble fwxx-step-bubble-${i}" aria-label="${esc(s.label)}">
      <div class="fwxx-slabel">${esc(s.label)}</div>
      <div class="fwxx-stext">${richSafe(s.text)}</div>
    </div>`).join('')

    return `
<section class="fwxx">
  <div class="fwxx-pill-wrap">
    <span class="fwxx-pill">${esc(pill)}</span>
  </div>
  <div class="fwxx-title-area">
    <h2 class="fwxx-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fwxx-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="fwxx-product-wrap">
    ${media(d.productImage, 'fwxx-product', '제품 이미지')}
    <div class="fwxx-scrim" aria-hidden="true"></div>
    <div class="fwxx-rail" role="list" aria-label="단계별 특징">
      ${railItems}
    </div>
    ${bubbles}
  </div>
</section>`
  },
})
