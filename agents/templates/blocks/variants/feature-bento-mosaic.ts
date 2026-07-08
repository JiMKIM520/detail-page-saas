/** FEATURE 아키타입: feature-bento-mosaic.
 *  [끝판왕] 추천·B&A #21 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 스캐터 히어로 갤러리(제품 이미지 다수 분산 배치 + 중앙 헤드라인)
 *  → 비대칭 벤토 그리드(좌: 제품 대표 이미지 / 우: 불릿 텍스트 스택)
 *  → 3열 가격 라인업 카드(Basic·Delux·Premium 플레이스홀더). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 스캐터 히어로 헤드라인 (em·br 허용) */
  heroTitle: z.string().min(1),
  /** 헤드라인 하단 서브카피 (선택) */
  heroSub: z.string().optional(),
  /** 히어로 갤러리 이미지 (2~6장 — 분산 배치) */
  galleryImages: z
    .array(z.object({ url: z.string().optional(), alt: z.string().optional() }))
    .min(2)
    .max(6),
  /** 벤토 좌측 대표 이미지 */
  bentoImage: z.string().optional(),
  bentoImageAlt: z.string().optional(),
  /** 벤토 우측 불릿 항목 (2~6개) */
  bullets: z
    .array(
      z.object({
        /** 불릿 헤딩 (em 허용) */
        heading: z.string().min(1),
        /** 불릿 상세 (선택, em 허용) */
        detail: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
  /** 가격 라인업 카드 (2~4개) — 없으면 라인업 섹션 생략 */
  lineup: z
    .array(
      z.object({
        /** 플랜/티어명 (예: Basic) */
        name: z.string().min(1),
        /** 가격 문자열 (예: 799,900 원) */
        price: z.string().min(1),
        /** 플랜 설명 (선택) */
        description: z.string().optional(),
        /** 강조 여부 — true면 accent 배경 */
        highlight: z.boolean().optional(),
      }),
    )
    .min(2)
    .max(4)
    .optional(),
  /** 라인업 섹션 상단 레이블 (선택, 예: "상품을 한 눈에 살펴보세요.") */
  lineupLabel: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const featureBentoMosaic = defineBlock<Data>({
  id: 'feature-bento-mosaic',
  archetype: 'feature',
  styleTags: ['light', 'bento', 'gallery', 'mosaic', 'feature', 'template'],
  imageSlots: 7,
  describe:
    '비대칭 벤토 모자이크. 스캐터 히어로 갤러리(제품 이미지 다수 분산+중앙 헤드라인) → 좌:대표이미지/우:불릿텍스트 벤토 그리드 → 3열 가격 라인업 카드. 제품 핵심 특징 강조·스펙 비교 겸용.',
  schema,
  css: `
/* feature-bento-mosaic — 접두사 fbm- */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted */
.fbm{background:var(--bg);padding:0 0 64px;overflow:hidden;word-break:keep-all;overflow-wrap:break-word}

/* ── 1. 스캐터 히어로 갤러리 ──────────────────────── */
.fbm-hero{
  position:relative;
  background:var(--paper);
  padding:56px 20px 48px;
  overflow:hidden;
  min-height:280px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:10px;
}

/* 산포된 썸네일 컨테이너 */
.fbm-scatter{
  position:absolute;
  inset:0;
  pointer-events:none;
}

/* 개별 이미지 — nth 로 다른 위치/크기/회전 */
.fbm-scatter-img,
.fbm-scatter-img.ph{
  position:absolute;
  border-radius:calc(var(--r-scale,1)*10px);
  object-fit:cover;
  box-shadow:0 6px 18px -6px rgba(0,0,0,.22);
}
.fbm-scatter-img:nth-child(1),.fbm-scatter-img.ph:nth-child(1){width:88px;height:88px;top:14%;left:3%;transform:rotate(-6deg)}
.fbm-scatter-img:nth-child(2),.fbm-scatter-img.ph:nth-child(2){width:72px;height:72px;top:52%;left:8%;transform:rotate(4deg)}
.fbm-scatter-img:nth-child(3),.fbm-scatter-img.ph:nth-child(3){width:80px;height:80px;top:10%;right:4%;transform:rotate(5deg)}
.fbm-scatter-img:nth-child(4),.fbm-scatter-img.ph:nth-child(4){width:66px;height:66px;top:55%;right:6%;transform:rotate(-4deg)}
.fbm-scatter-img:nth-child(5),.fbm-scatter-img.ph:nth-child(5){width:60px;height:60px;top:22%;left:22%;transform:rotate(8deg);opacity:.85}
.fbm-scatter-img:nth-child(6),.fbm-scatter-img.ph:nth-child(6){width:58px;height:58px;bottom:12%;right:20%;transform:rotate(-7deg);opacity:.85}

/* 중앙 헤드라인 (z-index로 이미지 위) */
.fbm-hero-text{
  position:relative;
  z-index:1;
  text-align:center;
}
.fbm-hero-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,5.8vw,42px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:8px;
}
/* 라이트 배경 — .em은 --accent-d로 충분한 대비 */
.fbm-hero-title .em{color:var(--accent-d)}
.fbm-hero-sub{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.7;
  color:var(--muted);
  letter-spacing:-.005em;
}

/* ── 2. 비대칭 벤토 그리드 ──────────────────────── */
.fbm-bento{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  padding:24px 16px 0;
}

/* 좌: 대표 이미지 셀 */
.fbm-bento-img-cell{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*14px);
  overflow:hidden;
  /* 우측 불릿 스택 전체 높이에 맞게 늘어나도록 */
  display:flex;
  align-items:stretch;
}
.fbm-bento-img,
.fbm-bento-img.ph{
  width:100%;
  aspect-ratio:3/4;
  object-fit:cover;
  display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
}
.fbm-bento-img.ph{
  background:rgba(0,0,0,.04);
  border:2px dashed var(--line);
  color:var(--muted);
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
}

/* 우: 불릿 스택 컨테이너 */
.fbm-bento-bullets{
  display:flex;
  flex-direction:column;
  gap:10px;
}

/* 개별 불릿 셀 */
.fbm-bullet-cell{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*12px);
  padding:16px 16px 14px;
  flex:1;
  min-height:0;
}
.fbm-bullet-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,2.4vw,16px);
  line-height:1.45;
  letter-spacing:-.01em;
  color:var(--ink);
  margin-bottom:4px;
}
.fbm-bullet-heading .em{color:var(--accent-d)}
.fbm-bullet-detail{
  font-family:var(--font-body);
  font-size:12px;
  line-height:1.7;
  color:var(--muted);
  letter-spacing:-.005em;
}
.fbm-bullet-detail .em{color:var(--accent-d);font-weight:700}

/* ── 3. 가격 라인업 카드 ──────────────────────── */
.fbm-lineup-wrap{
  padding:40px 16px 0;
}
.fbm-lineup-label{
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(16px,3.2vw,20px);
  color:var(--ink);
  letter-spacing:-.01em;
  margin-bottom:18px;
}
.fbm-lineup-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
}
.fbm-lineup-card{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*14px);
  padding:20px 14px 18px;
  text-align:center;
  border:2px solid transparent;
  box-shadow:0 4px 14px -6px rgba(0,0,0,.14);
  display:flex;
  flex-direction:column;
  gap:6px;
}
/* 강조 카드 — accent 테두리 + 살짝 올림 */
.fbm-lineup-card.hl{
  border-color:var(--accent);
  box-shadow:0 8px 24px -8px rgba(0,0,0,.22);
  background:var(--paper);
}
.fbm-lineup-name{
  font-family:var(--font-display);
  font-weight:700;
  font-size:14px;
  letter-spacing:.04em;
  color:var(--muted);
  text-transform:uppercase;
}
.fbm-lineup-card.hl .fbm-lineup-name{color:var(--accent-d)}
.fbm-lineup-price{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(16px,3vw,20px);
  color:var(--ink);
  line-height:1.2;
  letter-spacing:-.02em;
}
.fbm-lineup-card.hl .fbm-lineup-price{color:var(--accent-d)}
.fbm-lineup-desc{
  font-family:var(--font-body);
  font-size:11px;
  line-height:1.6;
  color:var(--muted);
}
`,
  render: (d, { esc, richSafe }) => {
    // 1. 스캐터 갤러리 이미지들
    const scatterHtml = d.galleryImages
      .slice(0, 6)
      .map((img, i) =>
        media(img.url, 'fbm-scatter-img', esc(img.alt ?? `제품 이미지 ${i + 1}`)),
      )
      .join('\n    ')

    // 2. 벤토 불릿 스택
    const bulletsHtml = d.bullets
      .map(
        (b) => `
    <div class="fbm-bullet-cell">
      <p class="fbm-bullet-heading">${richSafe(b.heading)}</p>
      ${b.detail ? `<p class="fbm-bullet-detail">${richSafe(b.detail)}</p>` : ''}
    </div>`,
      )
      .join('')

    // 3. 가격 라인업 (선택)
    let lineupHtml = ''
    if (d.lineup && d.lineup.length > 0) {
      const cardsHtml = d.lineup
        .map(
          (lp) => `
        <div class="fbm-lineup-card${lp.highlight ? ' hl' : ''}">
          <span class="fbm-lineup-name">${esc(lp.name)}</span>
          <span class="fbm-lineup-price">${esc(lp.price)}</span>
          ${lp.description ? `<span class="fbm-lineup-desc">${esc(lp.description)}</span>` : ''}
        </div>`,
        )
        .join('')

      lineupHtml = `
  <div class="fbm-lineup-wrap">
    ${d.lineupLabel ? `<p class="fbm-lineup-label">${esc(d.lineupLabel)}</p>` : ''}
    <div class="fbm-lineup-grid">
      ${cardsHtml}
    </div>
  </div>`
    }

    return `
<section class="fbm">
  <!-- 스캐터 히어로 갤러리 -->
  <div class="fbm-hero">
    <div class="fbm-scatter">
      ${scatterHtml}
    </div>
    <div class="fbm-hero-text">
      <h2 class="fbm-hero-title">${richSafe(d.heroTitle)}</h2>
      ${d.heroSub ? `<p class="fbm-hero-sub">${esc(d.heroSub)}</p>` : ''}
    </div>
  </div>

  <!-- 비대칭 벤토 그리드 -->
  <div class="fbm-bento">
    <div class="fbm-bento-img-cell">
      ${media(d.bentoImage, 'fbm-bento-img', esc(d.bentoImageAlt ?? '제품 대표 이미지'))}
    </div>
    <div class="fbm-bento-bullets">
      ${bulletsHtml}
    </div>
  </div>

  <!-- 가격 라인업 카드 -->
  ${lineupHtml}
</section>`
  },
})
