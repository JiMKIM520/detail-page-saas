/** LINEUP 아키타입: lineup-hero-tier-bar
 *  원본: 022_상품_구성_페이지_21 (피그마 860px 모바일 템플릿)
 *  구조: 상단 히어로(전폭 배경 이미지 + 인물 누끼 오버랩 + 이벤트명 + 기간 pill) +
 *        2개 티어 섹션 (각 섹션: 컬러 상단 바 + 흰 바디 + 3열 제품 카드,
 *        각 카드 좌상단에 원형 할인율 뱃지 부유).
 *  CSS 접두: lbvb  (lineup-hero-tier-bar → lbvb)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  image: z.string().optional(),          // 제품 이미지 url
  name: z.string().min(1),              // 제품명 (em,br)
  discountPct: z.string().min(1),       // 할인율 표기 (예: "45%")
  originalPrice: z.string().min(1),     // 정가 (예: "22,000원")
  salePrice: z.string().min(1),         // 판매가 (예: "17,000원") (em,br)
})

const tierSchema = z.object({
  barColor: z.string().optional(),      // 상단 바 색 (CSS 색값, 기본 --accent)
  badgeColor: z.string().optional(),    // 원형 뱃지 색 (미지정 시 barColor 상속)
  tagline: z.string().min(1),           // 바 위 한 줄 설명 (em,br)
  cards: z.array(cardSchema).min(1).max(3),
})

const schema = z.object({
  // 히어로 영역
  heroBg: z.string().optional(),        // 전폭 배경 이미지 url
  heroFigure: z.string().optional(),    // 인물/제품 누끼 이미지 url (오른쪽 오버랩)
  eventName: z.string().min(1),         // 이벤트명 (em,br)
  periodLabel: z.string().optional(),   // 기간 pill 텍스트
  // 티어 섹션 (1~2개)
  tiers: z.array(tierSchema).min(1).max(2),
})
type Data = z.infer<typeof schema>

export const lineupHeroTierBar = defineBlock<Data>({
  id: 'lineup-hero-tier-bar',
  archetype: 'lineup',
  styleTags: ['light', 'event', 'package', 'noimg-safe'],
  imageSlots: 8, // heroBg + heroFigure + 최대 2×3 카드
  describe:
    '2티어 패키지 라인업. 상단에 전폭 배경+인물 오버랩 히어로(이벤트명+기간 pill), ' +
    '그 아래 컬러 상단 바로 구분되는 1~2개 섹션에 각각 3열 제품 카드+원형 할인율 뱃지 배치. ' +
    '라이트 톤, 이벤트/프로모션 구성 안내에 적합.',
  schema,
  css: `
.lbvb{background:var(--bg);color:var(--ink);font-family:var(--font-body)}

/* ── 히어로 ── */
.lbvb-hero{position:relative;width:100%;height:340px;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--bg))}
.lbvb-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top}
.lbvb-hero-bg.ph{display:none!important}
.lbvb-hero-scrim{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.52) 42%,transparent 78%)}
.lbvb-hero-text{position:absolute;left:var(--pad-x,56px);bottom:48px;z-index:2}
.lbvb-hero-period{display:inline-block;background:#fff;color:var(--accent);font-size:15px;font-weight:800;padding:7px 18px;border-radius:999px;margin-bottom:14px;letter-spacing:.02em}
.lbvb-hero-name{font-family:var(--font-display);font-size:46px;font-weight:900;color:#fff;line-height:1.15;text-shadow:0 2px 12px rgba(0,0,0,.35)}
.lbvb-hero-name .em{color:var(--accent)}
.lbvb-hero-figure{position:absolute;right:0;bottom:0;height:110%;width:auto;max-width:52%;object-fit:contain;object-position:bottom right;z-index:1;pointer-events:none}
.lbvb-hero-figure.ph{display:none!important}

/* ── 티어 섹션 ── */
.lbvb-tier{width:100%}
.lbvb-tier-bar{width:100%;padding:0 var(--pad-x,56px);height:72px;display:flex;align-items:center;background:var(--lbvb-bar,var(--accent))}
.lbvb-tier-tagline{font-size:22px;font-weight:700;color:#fff;line-height:1.3}
.lbvb-tier-tagline .em{color:rgba(255,255,255,.75);font-weight:900}
.lbvb-tier-body{background:#fff;padding:28px var(--pad-x,56px) 36px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}

/* ── 카드 ── */
.lbvb-card{position:relative;display:flex;flex-direction:column;gap:0}
.lbvb-card-img-wrap{position:relative;width:100%;aspect-ratio:4/5;border-radius:calc(var(--r-scale,1)*10px);overflow:visible}
.lbvb-card-img{width:100%;height:100%;object-fit:cover;border-radius:calc(var(--r-scale,1)*10px);background:var(--line)}
.lbvb-card-img.ph{display:none!important}
/* 이미지 없을 때: 배경 틴트 패널 */
.lbvb-card-img-wrap:has(.ph)::after{content:'';display:block;position:absolute;inset:0;border-radius:calc(var(--r-scale,1)*10px);background:color-mix(in srgb,var(--lbvb-badge,var(--accent)) 8%,#f5f5f5);border:1.5px dashed var(--line)}
.lbvb-badge{position:absolute;top:-10px;left:-10px;z-index:3;width:68px;height:68px;border-radius:50%;background:var(--lbvb-badge,var(--accent));display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:20px;font-weight:900;color:#fff;line-height:1;text-align:center;box-shadow:0 4px 12px -2px rgba(0,0,0,.22)}
.lbvb-card-info{padding:14px 2px 0}
.lbvb-card-name{font-size:16px;font-weight:700;color:var(--ink);line-height:1.45;margin-bottom:10px}
.lbvb-card-name .em{color:var(--lbvb-badge,var(--accent))}
.lbvb-price-row{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.lbvb-orig{font-size:13px;font-weight:500;color:var(--muted);text-decoration:line-through}
.lbvb-sale{font-size:22px;font-weight:900;color:var(--ink)}
.lbvb-sale .em{color:var(--lbvb-badge,var(--accent))}
`,
  render: (d, { esc, richSafe }) => {
    const tierHtml = d.tiers
      .map((tier) => {
        const barCol = tier.barColor ?? 'var(--accent)'
        const badgeCol = tier.badgeColor ?? barCol

        const cardsHtml = tier.cards
          .map(
            (c) => `
<div class="lbvb-card">
  <div class="lbvb-card-img-wrap">
    ${media(c.image, 'lbvb-card-img', esc(c.name))}
    <div class="lbvb-badge">${esc(c.discountPct)}</div>
  </div>
  <div class="lbvb-card-info">
    <div class="lbvb-card-name">${richSafe(c.name)}</div>
    <div class="lbvb-price-row">
      <span class="lbvb-orig">${esc(c.originalPrice)}</span>
      <span class="lbvb-sale">${richSafe(c.salePrice)}</span>
    </div>
  </div>
</div>`,
          )
          .join('')

        return `
<div class="lbvb-tier" style="--lbvb-bar:${esc(barCol)};--lbvb-badge:${esc(badgeCol)}">
  <div class="lbvb-tier-bar">
    <span class="lbvb-tier-tagline">${richSafe(tier.tagline)}</span>
  </div>
  <div class="lbvb-tier-body">
    ${cardsHtml}
  </div>
</div>`
      })
      .join('')

    return `
<section class="lbvb">
  <div class="lbvb-hero">
    ${media(d.heroBg, 'lbvb-hero-bg', '이벤트 배경')}
    ${d.heroBg ? '<div class="lbvb-hero-scrim"></div>' : ''}
    <div class="lbvb-hero-text">
      ${d.periodLabel ? `<div class="lbvb-hero-period">${esc(d.periodLabel)}</div>` : ''}
      <h2 class="lbvb-hero-name">${richSafe(d.eventName)}</h2>
    </div>
    ${media(d.heroFigure, 'lbvb-hero-figure', '이벤트 인물')}
  </div>
  ${tierHtml}
</section>`
  },
})
