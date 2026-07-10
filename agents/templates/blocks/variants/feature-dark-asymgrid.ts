/** FEATURE 아키타입: feature-dark-asymgrid.
 *  피그마 '추천 및 B&A 구성 페이지_18' 패턴 재구성.
 *  상단 전체폭 히어로 이미지 + 제목/가격 오버레이 →
 *  다크 섹션(좌: 이미지 카드 2행 + 우: 텍스트 피처 4행 비대칭 그리드) →
 *  최하단 와이드 이미지 카드. 다크 배경에 richSafe em 스코프 오버라이드 적용. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 제품명 헤드라인 (em,br) */
  title: z.string().min(1),
  /** 히어로 이미지 아래 한 줄 설명 */
  subtitle: z.string().optional(),
  /** 가격 표시 (원 단위 등) */
  price: z.string().optional(),
  /** 전체폭 히어로 이미지 (url) */
  heroImage: z.string().optional(),
  /** 좌측 이미지 카드 2개 */
  cards: z
    .array(
      z.object({
        image: z.string().optional(),   // (url)
        heading: z.string().min(1),     // (em,br)
        body: z.string().min(1),
      }),
    )
    .min(2)
    .max(2),
  /** 우측 텍스트 피처 4개 */
  features: z
    .array(
      z.object({
        label: z.string().min(1),
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
  /** 최하단 와이드 이미지 카드 */
  wideImage: z.string().optional(),     // (url)
  /** 와이드 카드 제목 (em,br) */
  wideHeading: z.string().min(1),
  /** 와이드 카드 설명 */
  wideBody: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const featureDarkAsymgrid = defineBlock<Data>({
  id: 'feature-dark-asymgrid',
  archetype: 'feature',
  // noimg-safe: 이미지 부재 시 히어로·카드·와이드 영역 모두 틴트 패널(.ph)로 은닉 강등
  styleTags: ['dark', 'mixed', 'product', 'asymgrid', 'editorial', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '제품 핵심 기능 섹션. 상단 전체폭 히어로(제목+가격 오버레이) → 다크 배경 비대칭 그리드(좌 이미지 카드 2행 + 우 텍스트 피처 최대 4행) → 하단 와이드 이미지 카드. 전자제품·가전 등 기능 강조에 최적.',
  schema,
  css: `
.fdag{background:var(--bg);color:var(--ink)}

/* ── 히어로 존 ── */
.fdag-hero{position:relative;width:100%;aspect-ratio:860/586;overflow:hidden;background:color-mix(in srgb,var(--brand) 60%,#000)}
.fdag-hero img,.fdag-hero .ph{width:100%;height:100%;object-fit:cover;border-radius:0}
.fdag-hero-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.18) 55%,transparent 100%);pointer-events:none}
.fdag-hero-body{position:absolute;bottom:0;left:0;right:0;padding:0 var(--pad-x,56px) 36px}
.fdag-hero-title{font-family:var(--font-display);font-weight:700;font-size:clamp(28px,4vw,45px);color:#fff;line-height:1.25;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.fdag-hero-title .em{color:var(--em-dark,#FFF7EA)}
.fdag-hero-sub{margin-top:8px;font-size:clamp(14px,1.8vw,18px);color:rgba(255,255,255,.82);font-weight:400;text-shadow:0 1px 6px rgba(0,0,0,.45)}
.fdag-hero-price{margin-top:14px;font-family:var(--font-display);font-weight:800;font-size:clamp(26px,3.5vw,40px);color:var(--em-dark,#FFF7EA);text-shadow:0 2px 10px rgba(0,0,0,.5);letter-spacing:-.02em}

/* ── 다크 섹션 ── */
.fdag-dark{background:var(--brand);padding:40px var(--pad-x,56px)}
/* richSafe em 스코프 오버라이드 — 다크 배경 대비 보장 */
.fdag-dark .em{color:var(--em-dark,#FFF7EA)}

/* ── 비대칭 그리드 ── */
.fdag-grid{display:grid;grid-template-columns:1fr calc(var(--pad-x,56px)*2 + 312px - (100% - (100% - var(--pad-x,56px)*2)));gap:20px}
/* 간결 수치 버전: 좌 448, 우 312, 패딩 제외 872 기준 */
.fdag-grid{grid-template-columns:minmax(0,1.44fr) minmax(0,1fr)}

/* 좌 이미지 카드 열 */
.fdag-img-col{display:flex;flex-direction:column;gap:20px}
.fdag-card{position:relative;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;background:color-mix(in srgb,var(--brand) 80%,#000)}
.fdag-card img,.fdag-card .ph{width:100%;height:220px;object-fit:cover;border-radius:inherit;display:block}
.fdag-card-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.68) 0%,rgba(0,0,0,.12) 55%,transparent 100%);border-radius:inherit;pointer-events:none}
.fdag-card-body{position:absolute;bottom:0;left:0;right:0;padding:16px 20px}
.fdag-card-heading{font-family:var(--font-display);font-weight:700;font-size:clamp(16px,2vw,24px);color:#fff;line-height:1.3;text-shadow:0 1px 8px rgba(0,0,0,.5)}
.fdag-card-heading .em{color:var(--em-dark,#FFF7EA)}
.fdag-card-desc{margin-top:6px;font-size:clamp(12px,1.4vw,16px);color:rgba(255,255,255,.8);line-height:1.6;font-weight:400}

/* 우 피처 목록 열 */
.fdag-feat-col{display:flex;flex-direction:column;gap:0}
.fdag-feat{padding:18px 0 16px;border-bottom:1px solid rgba(255,255,255,.10)}
.fdag-feat:first-child{padding-top:4px}
.fdag-feat:last-child{border-bottom:none;padding-bottom:4px}
.fdag-feat-label{font-family:var(--font-display);font-weight:700;font-size:clamp(14px,1.8vw,20px);color:#fff;margin-bottom:6px}
.fdag-feat-text{font-size:clamp(12px,1.3vw,15px);color:rgba(255,255,255,.72);line-height:1.65;font-weight:400}

/* ── 와이드 카드 ── */
.fdag-wide{margin-top:20px;position:relative;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;background:color-mix(in srgb,var(--brand) 80%,#000)}
.fdag-wide-img{width:100%;height:clamp(180px,25vw,270px);object-fit:cover;display:block;border-radius:inherit}
.fdag-wide .ph{width:100%;height:clamp(180px,25vw,270px);border-radius:inherit}
.fdag-wide-scrim{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.62) 0%,rgba(0,0,0,.12) 60%,transparent 100%);border-radius:inherit;pointer-events:none}
.fdag-wide-body{position:absolute;top:50%;left:var(--pad-x,56px);transform:translateY(-50%);max-width:55%}
.fdag-wide-heading{font-family:var(--font-display);font-weight:700;font-size:clamp(18px,2.4vw,30px);color:#fff;line-height:1.3;text-shadow:0 1px 8px rgba(0,0,0,.5)}
.fdag-wide-heading .em{color:var(--em-dark,#FFF7EA)}
.fdag-wide-desc{margin-top:8px;font-size:clamp(12px,1.3vw,16px);color:rgba(255,255,255,.8);line-height:1.65;font-weight:400}

/* 이미지 부재 강등: 히어로·와이드의 .ph는 section 배경과 동화 */
.fdag-hero .ph{height:100%;background:color-mix(in srgb,var(--brand) 55%,#000)}
.fdag-wide .ph{background:color-mix(in srgb,var(--brand) 55%,#000)}
.fdag-card .ph{background:color-mix(in srgb,var(--brand) 45%,#000)}
`,
  render: (d, { esc, richSafe }) => `
<section class="fdag">
  <!-- 히어로 존 -->
  <div class="fdag-hero">
    ${media(d.heroImage, 'fdag-hero-bg', '제품 대표 이미지')}
    <div class="fdag-hero-scrim"></div>
    <div class="fdag-hero-body">
      <h2 class="fdag-hero-title">${richSafe(d.title)}</h2>
      ${d.subtitle ? `<p class="fdag-hero-sub">${esc(d.subtitle)}</p>` : ''}
      ${d.price ? `<p class="fdag-hero-price">${esc(d.price)}</p>` : ''}
    </div>
  </div>

  <!-- 다크 비대칭 그리드 섹션 -->
  <div class="fdag-dark">
    <div class="fdag-grid">
      <!-- 좌: 이미지 카드 2개 -->
      <div class="fdag-img-col">
        ${d.cards
          .map(
            (c) => `
        <div class="fdag-card">
          ${media(c.image, 'fdag-card-img', richSafe(c.heading))}
          <div class="fdag-card-scrim"></div>
          <div class="fdag-card-body">
            <p class="fdag-card-heading">${richSafe(c.heading)}</p>
            <p class="fdag-card-desc">${esc(c.body)}</p>
          </div>
        </div>`,
          )
          .join('')}
      </div>

      <!-- 우: 텍스트 피처 목록 -->
      <div class="fdag-feat-col">
        ${d.features
          .map(
            (f) => `
        <div class="fdag-feat">
          <p class="fdag-feat-label">${esc(f.label)}</p>
          <p class="fdag-feat-text">${esc(f.text)}</p>
        </div>`,
          )
          .join('')}
      </div>
    </div>

    <!-- 와이드 이미지 카드 -->
    <div class="fdag-wide">
      ${media(d.wideImage, 'fdag-wide-img', esc(d.wideHeading))}
      <div class="fdag-wide-scrim"></div>
      <div class="fdag-wide-body">
        <p class="fdag-wide-heading">${richSafe(d.wideHeading)}</p>
        ${d.wideBody ? `<p class="fdag-wide-desc">${esc(d.wideBody)}</p>` : ''}
      </div>
    </div>
  </div>
</section>`,
})
