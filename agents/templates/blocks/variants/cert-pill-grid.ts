/** CERT 아키타입: cert-pill-grid
 *  그라디언트 배경 + 상단 GMP 뱃지 텍스트 + 디스플레이 타이틀 + 원형 로고가 삽입된 흰 pill 텍스트박스
 *  + 2×2 라운드 이미지 그리드로 인증 신뢰 메시지를 전달하는 프리미엄 cert 블록.
 *  (117_인증서_02 피그마 프레임 구조 흡수 — 카피/브랜드 전부 슬롯으로 재구성) */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().min(1),                // 상단 뱃지 한 줄 (예: "식약처 인정 GMP 제조시설")
  title: z.string().min(1),               // 대형 디스플레이 타이틀 (em,br)
  subtitle: z.string().optional(),        // 타이틀 아래 부제 (em,br)
  logo: z.string().optional(),            // 원형 로고 이미지 (url)
  trust: z.string().min(1),              // pill 안 신뢰 카피 3줄 이내 (em,br)
  gridImages: z
    .array(z.string())
    .min(2)
    .max(4),                               // 2×2 그리드 이미지 url 배열 (2~4개)
  gradientFrom: z.string().optional(),   // 그라디언트 시작 색 토큰 오버라이드 (예: "#F4EFE8")
  gradientTo: z.string().optional(),     // 그라디언트 끝 색 토큰 오버라이드 (예: "#E8DDD0")
})
type Data = z.infer<typeof schema>

export const certPillGrid = defineBlock<Data>({
  id: 'cert-pill-grid',
  archetype: 'cert',
  // noimg-safe: 그리드 이미지 부재 시 이미지 프레임을 placeholder(.ph)로 렌더해 레이아웃 붕괴 방지
  styleTags: ['warm', 'food', 'premium', 'gradient', 'noimg-safe'],
  imageSlots: 5,  // logo(1) + grid(4)
  describe:
    '인증 신뢰 블록. 그라디언트 배경 + 상단 GMP/인증 뱃지 + 대형 타이틀 + 원형 로고가 내장된 흰 pill 텍스트박스 + 2×2 라운드 이미지 그리드. 식품/건강기능식품 GMP 인증 강조에 최적.',
  schema,
  css: `
/* ── cert-pill-grid (cakp) ─────────────────────────────────────────── */
.cakp{
  position:relative;
  padding:60px var(--pad-x,56px) 64px;
  background:linear-gradient(160deg, var(--cakp-from, color-mix(in srgb,var(--accent) 12%,var(--bg))), var(--cakp-to, color-mix(in srgb,var(--accent) 4%,var(--bg))));
  text-align:center;
  box-sizing:border-box;
}

/* 상단 뱃지 */
.cakp-badge-wrap{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:2px solid var(--accent);
  border-radius:calc(var(--r-scale,1)*6px);
  padding:6px 22px;
  margin-bottom:18px;
}
.cakp-badge{
  font-family:var(--font-body);
  font-size:17px;
  font-weight:700;
  color:var(--accent-d);
  letter-spacing:.03em;
}

/* 헤어라인 */
.cakp-line{
  width:clamp(160px,60%,520px);
  height:1px;
  background:var(--line);
  margin:0 auto 18px;
  opacity:.45;
}

/* 타이틀 + 부제 */
.cakp-title{
  font-family:var(--font-display);
  font-size:clamp(42px,6vw,72px);
  font-weight:700;
  color:var(--ink);
  line-height:1.1;
  margin-bottom:10px;
}
.cakp-title .em{color:var(--accent)}
.cakp-subtitle{
  font-family:var(--font-body);
  font-size:20px;
  font-weight:500;
  color:var(--ink-2);
  line-height:1.55;
  margin-bottom:28px;
}
.cakp-subtitle .em{color:var(--accent);font-weight:700}

/* Pill 텍스트박스 */
.cakp-pill{
  display:flex;
  align-items:center;
  gap:20px;
  background:#ffffff;
  border-radius:999px;
  padding:14px 32px 14px 14px;
  max-width:680px;
  margin:0 auto 32px;
  box-shadow:0 6px 28px -8px rgba(0,0,0,.12);
  text-align:left;
}

/* 원형 로고 */
.cakp-logo-wrap{
  flex:0 0 88px;
  width:88px;
  height:88px;
  border-radius:50%;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 10%,transparent);
  position:relative;
}
.cakp-logo-wrap img,.cakp-logo-wrap .ph{
  width:100%;height:100%;
  object-fit:contain;
  border-radius:50%;
}

/* 로고 없을 때 폴백 원형 씰 */
.cakp-logo-wrap.cakp-logo--noimg{
  display:flex;align-items:center;justify-content:center;
}
.cakp-logo-seal{
  width:56px;height:56px;
  color:var(--accent);
  opacity:.7;
}

/* Pill 신뢰 카피 */
.cakp-trust{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:500;
  color:var(--ink);
  line-height:1.65;
}
.cakp-trust .em{color:var(--accent-d);font-weight:700}

/* 2×2 이미지 그리드 */
.cakp-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  max-width:720px;
  margin:0 auto;
}
.cakp-cell{
  aspect-ratio:3/2;
  border-radius:calc(var(--r-scale,1)*18px);
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 8%,var(--bg));
  position:relative;
}
.cakp-cell img,.cakp-cell .ph{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:inherit;
  display:block;
}
/* 이미지 오버레이 스크림 (텍스트 없음이지만 레이어 일관성) */
.cakp-cell::after{
  content:'';
  position:absolute;inset:0;
  border-radius:inherit;
  background:linear-gradient(to bottom,transparent 60%,rgba(0,0,0,.08));
  pointer-events:none;
}
`,
  render: (d, { esc, richSafe }) => {
    // 그라디언트 오버라이드 인라인 스타일 (선택적)
    const gradStyle =
      d.gradientFrom || d.gradientTo
        ? ` style="${d.gradientFrom ? `--cakp-from:${esc(d.gradientFrom)};` : ''}${d.gradientTo ? `--cakp-to:${esc(d.gradientTo)};` : ''}"`
        : ''

    // 원형 로고: 이미지 있으면 media(), 없으면 SVG 씰 폴백
    const logoInner = d.logo
      ? media(d.logo, '', '인증 로고')
      : `<svg class="cakp-logo-seal" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <path d="M28 4 l4 4 6-1.5 2 6 6 2-1.5 6 4 4-4 4 1.5 6-6 2-2 6-6-1.5-4 4-4-4-6 1.5-2-6-6-2 1.5-6-4-4 4-4-1.5-6 6-2 2-6 6 1.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="28" cy="28" r="11" stroke="currentColor" stroke-width="2"/>
          <text x="28" y="32" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" font-family="sans-serif">GMP</text>
        </svg>`
    const logoWrapClass = d.logo ? 'cakp-logo-wrap' : 'cakp-logo-wrap cakp-logo--noimg'

    // 2×2 그리드 셀 (2~4개, 나머지는 .ph 강등)
    const cells = Array.from({ length: 4 }, (_, i) => {
      const url = d.gridImages[i]
      return `<div class="cakp-cell">${url ? media(url, '', `인증 사진 ${i + 1}`) : '<div class="ph" aria-hidden="true"></div>'}</div>`
    }).join('')

    return `
<section class="cakp"${gradStyle}>
  <div class="cakp-badge-wrap">
    <span class="cakp-badge">${esc(d.badge)}</span>
  </div>
  <h2 class="cakp-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="cakp-subtitle">${richSafe(d.subtitle)}</p>` : ''}
  <div class="cakp-line" aria-hidden="true"></div>
  <div class="cakp-pill">
    <div class="${logoWrapClass}">${logoInner}</div>
    <p class="cakp-trust">${richSafe(d.trust)}</p>
  </div>
  <div class="cakp-grid">${cells}</div>
</section>`
  },
})
