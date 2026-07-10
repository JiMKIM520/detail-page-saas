/** LINEUP 아키타입: lineup-bento-compare
 *  피그마 "추천 및 B&A 구성 페이지_21" 흡수.
 *  그라디언트 배경 상단(상품명+히어로 이미지) → 중단 벤토 그리드(좌 2행 카드+아이콘 6개 / 우 3행 컬러칩+제품이미지) →
 *  하단 3열 Basic/Delux/Premium 라인업 비교 패널을 단일 프레임에 통합.
 *  이미지 없이도 그라디언트+아이콘+컬러칩 구조로 안전하게 강등 렌더(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 컬러칩 슬롯 ──────────────────────────────────────────────
const colorChipSchema = z.object({
  label: z.string().min(1),  // 예: "미드나잇 블랙"
  hex: z.string().min(1),    // 예: "#1C1C1E"
})

// ── 라인업(플랜) 슬롯 ────────────────────────────────────────
const planSchema = z.object({
  tier: z.string().min(1),     // 예: "Basic" / "Delux" / "Premium"
  price: z.string().min(1),    // 예: "799,900원"
  image: z.string().optional(), // 상품 정면 이미지 (url)
  highlight: z.boolean().optional(), // 추천 플랜이면 true → 강조 테두리
})

const schema = z.object({
  // 상단 헤더 영역
  productName: z.string().min(1),           // (em,br) 상품명
  productDesc: z.string().optional(),        // 상품 한 줄 설명

  // 히어로 이미지 (상단 풀 와이드 제품 컷)
  heroImage: z.string().optional(),          // (url)

  // 벤토 좌측 상단 카드 — 핵심 특징 A
  featureATitle: z.string().min(1),          // (em,br)
  featureABody: z.string().optional(),       // 보조 텍스트
  featureAImage: z.string().optional(),      // (url) 카드 이미지 오버레이

  // 벤토 좌측 하단 카드 — 아이콘 6개 특징 그리드
  featureBTitle: z.string().min(1),          // (em,br)
  featureBBody: z.string().optional(),
  icons: z.array(z.object({
    name: z.string().min(1),   // icon name (shared.ts ICON_NAMES)
    label: z.string().min(1),  // 아이콘 아래 라벨
  })).min(3).max(6),

  // 벤토 우측 컬러칩 카드 (상단 2개 카드 — 본체 색상 / 밴드 색상)
  colorCardTitle: z.string().min(1),         // 예: "다양한 컬러 선택"
  bodyColors: z.array(colorChipSchema).min(2).max(5),
  bandColors: z.array(colorChipSchema).min(2).max(4),

  // 벤토 우측 하단 카드 — 제품 이미지+텍스트
  specCardTitle: z.string().min(1),          // (em,br)
  specCardBody: z.string().optional(),
  specImage: z.string().optional(),          // (url) 누끼/사이드뷰

  // 하단 라인업 비교 패널
  lineupTitle: z.string().optional(),        // 기본 "한 눈에 살펴보세요"
  plans: z.array(planSchema).min(2).max(3),
})

type Data = z.infer<typeof schema>

export const lineupBentoCompare = defineBlock<Data>({
  id: 'lineup-bento-compare',
  archetype: 'lineup',
  styleTags: ['light', 'tech', 'gadget', 'bento', 'noimg-safe'],
  imageSlots: 5, // heroImage + featureAImage + specImage + plans(최대 3)
  describe:
    '전자제품/스마트워치 라인업용 벤토 그리드 비교 블록. 그라디언트 배경에 상품명+히어로 이미지 상단, 중단 비대칭 벤토(좌 2행 카드+6아이콘 / 우 3행 컬러칩+제품샷), 하단 Basic·Delux·Premium 3열 라인업 비교. 컬러·아이콘 위주라 이미지 없어도 안전 강등.',
  schema,
  css: `
/* ── 최상위 래퍼 ─────────────────────────────────────── */
.lyky{background:var(--bg);padding-bottom:56px}

/* ── 상단 헤더 그라디언트 영역 ──────────────────────── */
.lyky-hdr{
  background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,var(--bg)),var(--bg) 72%);
  padding:48px var(--pad-x,56px) 32px;
}
.lyky-hdr-text{margin-bottom:28px}
.lyky-pname{
  font-family:var(--font-display);font-weight:800;
  font-size:42px;line-height:1.12;letter-spacing:-.02em;color:var(--ink)
}
.lyky-pname .em{color:var(--accent)}
.lyky-pdesc{margin-top:10px;font-size:20px;font-weight:400;color:var(--ink-2)}

/* 히어로 이미지 프레임 */
.lyky-hero-wrap{width:100%;border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
.lyky-hero-img{width:100%;aspect-ratio:740/284;object-fit:cover;display:block}
.lyky-hero-img.ph{aspect-ratio:740/284;display:none!important}

/* ── 벤토 그리드 ─────────────────────────────────────── */
.lyky-bento{
  display:grid;
  grid-template-columns:5fr 7fr;
  grid-template-rows:auto auto;
  gap:12px;
  padding:20px var(--pad-x,56px) 0;
}

/* 벤토 공통 카드 */
.lyky-card{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:24px 24px 20px;
  overflow:hidden;
  position:relative;
}

/* 좌 상단 카드 — 특징 A */
.lyky-fa{grid-column:1;grid-row:1}
.lyky-fa-img-wrap{
  margin-top:14px;width:100%;
  border-radius:calc(var(--r-scale,1)*12px);
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 10%,transparent);
}
.lyky-fa-img{width:100%;aspect-ratio:261/162;object-fit:cover;display:block}
.lyky-fa-img.ph{display:none!important}

/* 좌 하단 카드 — 아이콘 6개 */
.lyky-fb{grid-column:1;grid-row:2}
.lyky-icons{
  display:grid;grid-template-columns:repeat(3,1fr);gap:8px 4px;
  margin-top:16px;
}
.lyky-icon-item{display:flex;flex-direction:column;align-items:center;gap:5px}
.lyky-icon-item svg{width:32px;height:32px;color:var(--accent)}
.lyky-icon-lbl{font-size:11px;font-weight:600;color:var(--ink-2);text-align:center;line-height:1.3}

/* 우측 열 — 3행 카드 */
.lyky-right{grid-column:2;grid-row:1/3;display:flex;flex-direction:column;gap:12px}

/* 컬러칩 공통 */
.lyky-chip-row{display:flex;flex-wrap:wrap;gap:10px 14px;margin-top:12px;align-items:center}
.lyky-chip{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink-2);font-weight:500}
.lyky-chip-dot{
  width:18px;height:18px;border-radius:50%;
  border:1.5px solid color-mix(in srgb,var(--ink) 14%,transparent);
  flex-shrink:0;
}

/* 우 컬러카드 이미지 */
.lyky-col-img-wrap{
  position:absolute;right:16px;top:50%;transform:translateY(-50%);
  width:80px;
}
.lyky-col-img{width:100%;height:auto;object-fit:contain;display:block}
.lyky-col-img.ph{display:none!important}

/* 우 스펙카드 이미지 */
.lyky-spec-img-wrap{
  position:absolute;right:12px;bottom:0;
  width:68px;
}
.lyky-spec-img{width:100%;height:auto;object-fit:contain;display:block;max-height:120px}
.lyky-spec-img.ph{display:none!important}

/* 카드 텍스트 공통 */
.lyky-card-ttl{
  font-family:var(--font-display);font-weight:700;
  font-size:16px;color:var(--ink);line-height:1.3
}
.lyky-card-ttl .em{color:var(--accent)}
.lyky-card-body{margin-top:4px;font-size:13px;color:var(--ink-2);line-height:1.55}

/* ── 하단 라인업 비교 패널 ──────────────────────────── */
.lyky-lineup{
  margin:20px var(--pad-x,56px) 0;
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:28px 28px 24px;
}
.lyky-lineup-ttl{
  font-family:var(--font-display);font-weight:700;
  font-size:18px;color:var(--ink);margin-bottom:20px
}
.lyky-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.lyky-plan{
  display:flex;flex-direction:column;align-items:center;
  padding:12px 8px 16px;
  border-radius:calc(var(--r-scale,1)*12px);
  position:relative;
}
.lyky-plan.hl{
  background:color-mix(in srgb,var(--accent) 9%,transparent);
  outline:2px solid var(--accent);
}
.lyky-plan-tier{
  font-size:15px;font-weight:600;color:var(--ink-2);
  margin-bottom:8px;
}
.lyky-plan.hl .lyky-plan-tier{color:var(--accent);font-weight:700}
.lyky-plan-img-wrap{width:72px;height:100px;display:flex;align-items:center;justify-content:center}
.lyky-plan-img{width:100%;height:100%;object-fit:contain;display:block}
.lyky-plan-img.ph{display:none!important}

/* 이미지 없을 때 자리표시 도형 */
.lyky-plan-noimg{
  width:52px;height:52px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 14%,var(--paper));
  border:2px dashed color-mix(in srgb,var(--accent) 40%,transparent);
}
.lyky-plan-price{
  margin-top:10px;
  font-family:var(--font-display);font-weight:800;
  font-size:16px;color:var(--ink);text-align:center;line-height:1.25
}
.lyky-plan.hl .lyky-plan-price{color:var(--accent)}

/* 2-플랜 레이아웃 폴백 */
.lyky-plans.two{grid-template-columns:repeat(2,1fr);max-width:480px;margin:0 auto}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasHero = typeof d.heroImage === 'string' && d.heroImage.length > 0
    const hasFeatureAImg = typeof d.featureAImage === 'string' && d.featureAImage.length > 0
    const hasSpecImg = typeof d.specImage === 'string' && d.specImage.length > 0
    const plansCount = d.plans.length

    // 아이콘 그리드 렌더 (최대 6개 — 3열 2행)
    const iconGrid = d.icons.map(ic => `
      <div class="lyky-icon-item">
        ${icon(ic.name)}
        <span class="lyky-icon-lbl">${esc(ic.label)}</span>
      </div>`).join('')

    // 컬러칩 렌더
    const renderChips = (chips: typeof d.bodyColors) =>
      chips.map(c => `
        <span class="lyky-chip">
          <span class="lyky-chip-dot" style="background:${esc(c.hex)}"></span>
          ${esc(c.label)}
        </span>`).join('')

    // 플랜 카드 렌더
    const planCards = d.plans.map(p => {
      const isUrl = typeof p.image === 'string' && /^(https?:\/\/|data:|\/)/.test(p.image.trim())
      const imgEl = isUrl
        ? `<div class="lyky-plan-img-wrap">${media(p.image, 'lyky-plan-img', esc(p.tier) + ' 상품')}</div>`
        : `<div class="lyky-plan-img-wrap"><div class="lyky-plan-noimg"></div></div>`
      return `
      <div class="lyky-plan${p.highlight ? ' hl' : ''}">
        <span class="lyky-plan-tier">${esc(p.tier)}</span>
        ${imgEl}
        <p class="lyky-plan-price">${esc(p.price)}</p>
      </div>`
    }).join('')

    return `
<section class="lyky">

  <!-- 상단 헤더 + 히어로 -->
  <div class="lyky-hdr">
    <div class="lyky-hdr-text">
      <h2 class="lyky-pname">${richSafe(d.productName)}</h2>
      ${d.productDesc ? `<p class="lyky-pdesc">${esc(d.productDesc)}</p>` : ''}
    </div>
    ${hasHero ? `<div class="lyky-hero-wrap">${media(d.heroImage, 'lyky-hero-img', '제품 대표 이미지')}</div>` : ''}
  </div>

  <!-- 벤토 그리드 -->
  <div class="lyky-bento">

    <!-- 좌 상단: 특징 A 카드 -->
    <div class="lyky-card lyky-fa">
      <h3 class="lyky-card-ttl">${richSafe(d.featureATitle)}</h3>
      ${d.featureABody ? `<p class="lyky-card-body">${esc(d.featureABody)}</p>` : ''}
      ${hasFeatureAImg ? `
      <div class="lyky-fa-img-wrap">
        ${media(d.featureAImage, 'lyky-fa-img', '특징 이미지')}
      </div>` : ''}
    </div>

    <!-- 좌 하단: 아이콘 그리드 카드 -->
    <div class="lyky-card lyky-fb">
      <h3 class="lyky-card-ttl">${richSafe(d.featureBTitle)}</h3>
      ${d.featureBBody ? `<p class="lyky-card-body">${esc(d.featureBBody)}</p>` : ''}
      <div class="lyky-icons">
        ${iconGrid}
      </div>
    </div>

    <!-- 우측: 3행 카드 묶음 -->
    <div class="lyky-right">

      <!-- 우 상단: 본체 컬러칩 카드 -->
      <div class="lyky-card" style="position:relative">
        <h3 class="lyky-card-ttl">${esc(d.colorCardTitle)}</h3>
        <div class="lyky-chip-row">
          ${renderChips(d.bodyColors)}
        </div>
      </div>

      <!-- 우 중단: 밴드 컬러칩 카드 -->
      <div class="lyky-card" style="position:relative">
        <h3 class="lyky-card-ttl">밴드 색상</h3>
        <div class="lyky-chip-row">
          ${renderChips(d.bandColors)}
        </div>
      </div>

      <!-- 우 하단: 스펙 + 제품 사이드샷 카드 -->
      <div class="lyky-card" style="position:relative;min-height:110px">
        <h3 class="lyky-card-ttl">${richSafe(d.specCardTitle)}</h3>
        ${d.specCardBody ? `<p class="lyky-card-body" style="padding-right:${hasSpecImg ? '80px' : '0'}">${esc(d.specCardBody)}</p>` : ''}
        ${hasSpecImg ? `
        <div class="lyky-spec-img-wrap">
          ${media(d.specImage, 'lyky-spec-img', '제품 측면 이미지')}
        </div>` : ''}
      </div>

    </div>
  </div>

  <!-- 하단 라인업 비교 패널 -->
  <div class="lyky-lineup">
    <p class="lyky-lineup-ttl">${esc(d.lineupTitle ?? '한 눈에 살펴보세요')}</p>
    <div class="lyky-plans${plansCount === 2 ? ' two' : ''}">
      ${planCards}
    </div>
  </div>

</section>`
  },
})
