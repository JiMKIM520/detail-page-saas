/** STATS 아키타입: stats-hero-anchor-card-grid.
 *  [끝판왕] 포인트 구성 #33 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 섹션 eyebrow(small) + 히어로 수치(display, accent) + 좌측 body copy + 우측 제품이미지 군집(오버랩)
 *  하단: 2열 균등 카드 그리드(3행), 각 카드 category label(xs) + 수치(md-lg, accent) + 설명(2-3줄). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 eyebrow 라벨 (예: "소비자 만족도") */
  eyebrow: z.string().min(1),
  /** 히어로 수치 (예: "99.8%") — em 허용 */
  heroStat: z.string().min(1),
  /** 히어로 수치 아래 body copy (em/br 허용) */
  heroCopy: z.string().min(1),
  /** 우측 오버랩 제품이미지 (1~3장) */
  images: z
    .array(
      z.object({
        url: z.string().optional(),
        alt: z.string().optional(),
      }),
    )
    .min(1)
    .max(3),
  /** 하단 2열 카드 그리드 (짝수 2~6개 권장, 최대 6) */
  cards: z
    .array(
      z.object({
        /** 카드 category label (xs, muted) */
        label: z.string().min(1),
        /** 카드 수치 강조 (예: "99.8%") — em 허용 */
        stat: z.string().min(1),
        /** 카드 설명 (2-3줄, em/br 허용) */
        desc: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const statsHeroAnchorCardGrid = defineBlock<Data>({
  id: 'stats-hero-anchor-card-grid',
  archetype: 'stats' as any,
  styleTags: ['stats', 'hero-stat', 'card-grid', 'light', 'template'],
  imageSlots: 4,
  describe:
    '소비자 만족도·성과 수치 강조 섹션. 상단: eyebrow 라벨 + 디스플레이급 히어로 수치(accent) + 좌측 body copy + 우측 제품이미지 오버랩 군집. 하단: 2열 카드 그리드(3행), 각 카드에 category label(xs) + 수치(accent) + 설명문(2-3줄). 뷰티/식품/소비재 사회적 증거 강조용.',
  schema,
  css: `
/* stats-hero-anchor-card-grid — 접두사 shacg- */
.shacg{background:var(--paper);padding:56px 40px 60px;word-break:keep-all;overflow-wrap:break-word}
/* ── 히어로 상단 영역 ── */
.shacg-top{display:grid;grid-template-columns:1fr auto;align-items:flex-start;gap:0;margin-bottom:40px}
.shacg-left{padding-right:16px}
.shacg-eyebrow{font-family:var(--font-body);font-weight:700;font-size:15px;color:var(--ink);letter-spacing:.04em;margin-bottom:6px}
.shacg-hero-stat{font-family:var(--font-display);font-weight:800;font-size:clamp(54px,13vw,80px);line-height:1.0;letter-spacing:-.03em;color:var(--accent-d);margin-bottom:16px}
.shacg-hero-stat .em{color:var(--accent)}
.shacg-copy{font-family:var(--font-body);font-size:13.5px;line-height:1.75;color:var(--muted)}
.shacg-copy .em{color:var(--accent-d);font-weight:700}
/* ── 우측 제품 이미지 군집(오버랩) ── */
.shacg-imgs{position:relative;width:160px;flex-shrink:0;height:220px}
.shacg-img-0,.shacg-img-1,.shacg-img-2{position:absolute;object-fit:cover;border-radius:10px;box-shadow:0 8px 24px -8px rgba(0,0,0,.22)}
.shacg-img-0{width:96px;height:120px;top:0;right:0;z-index:3}
.shacg-img-1{width:82px;height:104px;top:50px;right:88px;z-index:2}
.shacg-img-2{width:76px;height:96px;top:110px;right:30px;z-index:1;opacity:.85}
/* placeholder 크기 맞춤 */
.shacg-img-0.ph,.shacg-img-1.ph,.shacg-img-2.ph{display:flex;align-items:center;justify-content:center;font-size:11px}
/* ── 하단 카드 그리드 ── */
.shacg-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.shacg-card{background:var(--bg);border-radius:14px;padding:18px 16px 20px;position:relative}
.shacg-card-label{font-family:var(--font-body);font-size:11px;font-weight:600;letter-spacing:.05em;color:var(--muted);text-transform:uppercase;margin-bottom:6px}
.shacg-card-stat{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,7vw,36px);line-height:1.1;letter-spacing:-.025em;color:var(--accent-d);margin-bottom:8px}
.shacg-card-stat .em{color:var(--accent)}
.shacg-card-desc{font-family:var(--font-body);font-size:12.5px;line-height:1.65;color:var(--ink);word-break:keep-all}
.shacg-card-desc .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 군집 — 최대 3장, 각 위치 클래스 고정
    const imgSlots = d.images.slice(0, 3)
    const imgHtml = imgSlots
      .map((img, i) =>
        media(img.url, `shacg-img-${i}`, esc(img.alt ?? `제품 이미지 ${i + 1}`)),
      )
      .join('\n        ')

    // 카드 그리드
    const cardsHtml = d.cards
      .map(
        (card) => `
      <div class="shacg-card">
        <div class="shacg-card-label">${esc(card.label)}</div>
        <div class="shacg-card-stat">${richSafe(card.stat)}</div>
        <div class="shacg-card-desc">${richSafe(card.desc)}</div>
      </div>`,
      )
      .join('')

    return `
<section class="shacg">
  <div class="shacg-top">
    <div class="shacg-left">
      <p class="shacg-eyebrow">${esc(d.eyebrow)}</p>
      <div class="shacg-hero-stat">${richSafe(d.heroStat)}</div>
      <p class="shacg-copy">${richSafe(d.heroCopy)}</p>
    </div>
    <div class="shacg-imgs">
      ${imgHtml}
    </div>
  </div>
  <div class="shacg-grid">
    ${cardsHtml}
  </div>
</section>`
  },
})
