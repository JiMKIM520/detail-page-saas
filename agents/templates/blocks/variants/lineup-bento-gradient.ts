/** LINEUP 아키타입: lineup-bento-gradient
 *  상품 구성 페이지_26 흡수 — 상단 제품 모크업 페어 + 상품명/설명 + 비대칭 벤토 그리드.
 *  좌측: 상단 대형 카드(제품 모크업 오버랩) + 하단 컬렉션 카드. 우측: 4행 컴팩트 카드 스택.
 *  하단: 와이드 풀행 카드 + 2개 절반 카드. 다크 다운 그라디언트 카드 + 제품 이미지 강등 안전. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 카드 슬롯 공통 ─────────────────────────────────────────────
const cardSlot = z.object({
  label: z.string().min(1),       // 카드 제목 (em,br)
  text: z.string().optional(),    // 카드 보조 설명
})

const schema = z.object({
  // ── 상단 헤더 ──
  productName: z.string().min(1),          // 상품명 (em,br)
  productDesc: z.string().optional(),      // 상품 한 줄 설명

  // ── 제품 이미지 (선택 — 없으면 그라디언트 배경으로 강등) ──
  heroImageA: z.string().optional(),       // 메인 모크업 A (url)
  heroImageB: z.string().optional(),       // 메인 모크업 B (url)

  // ── 좌측 대형 카드 (tall, 제품 이미지 오버랩) ──
  leftTall: cardSlot,
  leftTallImage: z.string().optional(),    // 카드 내부 제품 컷 (url)

  // ── 좌측 컬렉션 카드 (다수 모크업 scatter) ──
  leftCollection: cardSlot,
  collectionImages: z.array(z.string()).min(0).max(5).optional(), // 컬렉션 모크업들 (url[])

  // ── 우측 4행 컴팩트 카드 ──
  rightCards: z.array(cardSlot).min(2).max(4),

  // ── 하단 와이드 카드 (전폭 1개) ──
  bottomWide: cardSlot,

  // ── 하단 절반 카드 2개 ──
  bottomHalf: z.array(cardSlot).min(2).max(2),
})
type Data = z.infer<typeof schema>

export const lineupBentoGradient = defineBlock<Data>({
  id: 'lineup-bento-gradient',
  archetype: 'lineup',
  styleTags: ['dark', 'premium', 'bento', 'gradient', 'noimg-safe'],
  imageSlots: 7,
  describe:
    '상품 구성 다크 벤토. 상단 제품 모크업 페어 + 상품명/설명. 하단 비대칭 벤토: 좌(대형 모크업 오버랩 카드+컬렉션 카드) + 우(4행 컴팩트 카드 스택) + 하단 와이드+절반 카드 2개. 다크 그라디언트 라운드 카드. 이미지 없어도 카드가 붕괴하지 않음.',
  schema,
  css: `
/* ── lwxn: lineup-bento-gradient ── */
.lwxn{background:var(--bg);padding:52px 0 64px}

/* 상단 제품 페어 */
.lwxn-hero{display:flex;justify-content:center;align-items:flex-end;gap:0;padding:0 var(--pad-x,56px);min-height:220px}
.lwxn-hero-slot{flex:0 0 auto;width:160px;position:relative}
.lwxn-hero-slot:first-child{transform:rotate(-4deg) translateX(18px);z-index:2}
.lwxn-hero-slot:last-child{transform:rotate(4deg) translateX(-18px);z-index:1}
.lwxn-hero-slot img,.lwxn-hero-slot .ph{width:160px;height:340px;object-fit:contain;display:block}
.lwxn-hero-noimg{width:160px;height:340px;background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,var(--paper)),var(--paper));border-radius:calc(var(--r-scale,1)*28px);display:block}

/* 상품명/설명 */
.lwxn-meta{text-align:center;padding:28px var(--pad-x,56px) 0}
.lwxn-name{font-family:var(--font-display);font-weight:700;font-size:30px;line-height:1.3;color:var(--ink)}
.lwxn-name .em{color:var(--em-dark,#FFF7EA)}
.lwxn-desc{margin-top:8px;font-size:16px;color:var(--ink-2);font-weight:400}

/* 벤토 그리드 */
.lwxn-bento{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:24px var(--pad-x,56px) 0}

/* 좌 컬럼 */
.lwxn-left{display:flex;flex-direction:column;gap:10px}

/* 그라디언트 카드 공통 */
.lwxn-card{position:relative;border-radius:calc(var(--r-scale,1)*20px);background:linear-gradient(140deg,var(--brand) 0%,color-mix(in srgb,var(--brand) 60%,#000) 100%);overflow:hidden;padding:22px 22px 18px}
.lwxn-card .em{color:var(--em-dark,#FFF7EA)}

/* 카드 내부 텍스트 */
.lwxn-card-label{font-family:var(--font-display);font-weight:700;font-size:17px;color:#fff;line-height:1.3;position:relative;z-index:2}
.lwxn-card-text{margin-top:6px;font-size:13px;color:rgba(255,255,255,.7);line-height:1.55;position:relative;z-index:2}

/* 좌 대형 카드 (높이: 대략 좌측 절반 - gap) */
.lwxn-tall{min-height:260px}
.lwxn-tall-img{position:absolute;bottom:-10px;right:-8px;width:130px;height:auto;object-fit:contain;z-index:1;filter:drop-shadow(0 8px 20px rgba(0,0,0,.35))}
.lwxn-tall-img.ph{display:none!important}

/* 좌 컬렉션 카드 */
.lwxn-coll{min-height:200px}
.lwxn-coll-imgs{position:absolute;bottom:0;right:0;left:0;height:130px;display:flex;align-items:flex-end;justify-content:center;gap:-12px;overflow:hidden;padding:0 8px}
.lwxn-coll-thumb{width:54px;height:110px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 4px 10px rgba(0,0,0,.4))}
.lwxn-coll-thumb:nth-child(odd){transform:translateY(-12px)}
.lwxn-coll-thumb:nth-child(even){transform:translateY(6px)}
.lwxn-coll-thumb.ph{display:none!important}

/* 우 컬럼 — 4행 컴팩트 스택 */
.lwxn-right{display:flex;flex-direction:column;gap:10px}
.lwxn-compact{min-height:100px}

/* 하단 행: 와이드 + 절반 */
.lwxn-bottom{padding:10px var(--pad-x,56px) 0;display:flex;flex-direction:column;gap:10px}
.lwxn-wide{min-height:100px}
.lwxn-halves{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.lwxn-half{min-height:100px}

/* em-dark 스코프 오버라이드 (다크 카드 위 richSafe em) */
.lwxn .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    // 히어로 이미지 — 둘 다 없으면 그라디언트 div 강등
    const hasHeroA = typeof d.heroImageA === 'string' && d.heroImageA.length > 0
    const hasHeroB = typeof d.heroImageB === 'string' && d.heroImageB.length > 0
    const heroA = hasHeroA
      ? media(d.heroImageA, 'lwxn-hero-slot__img', '제품 A')
      : '<div class="lwxn-hero-noimg" aria-hidden="true"></div>'
    const heroB = hasHeroB
      ? media(d.heroImageB, 'lwxn-hero-slot__img', '제품 B')
      : '<div class="lwxn-hero-noimg" aria-hidden="true"></div>'

    // 좌 대형 카드 내부 이미지 (없으면 카드 텍스트만 렌더)
    const tallImg =
      typeof d.leftTallImage === 'string' && d.leftTallImage.length > 0
        ? `<img class="lwxn-tall-img" src="${d.leftTallImage}" alt="제품 상세">`
        : ''

    // 컬렉션 이미지 (없거나 배열 비면 이미지 행 생략)
    const collImgs =
      d.collectionImages && d.collectionImages.length > 0
        ? `<div class="lwxn-coll-imgs" aria-hidden="true">
        ${d.collectionImages
          .map(
            (url, i) =>
              `<img class="lwxn-coll-thumb" src="${url}" alt="구성품 ${i + 1}">`,
          )
          .join('')}
      </div>`
        : ''

    // 우측 컴팩트 카드 목록
    const rightCards = d.rightCards
      .map(
        (c) => `
      <div class="lwxn-card lwxn-compact">
        <p class="lwxn-card-label">${richSafe(c.label)}</p>
        ${c.text ? `<p class="lwxn-card-text">${esc(c.text)}</p>` : ''}
      </div>`,
      )
      .join('')

    // 하단 절반 카드
    const halfCards = d.bottomHalf
      .map(
        (c) => `
        <div class="lwxn-card lwxn-half">
          <p class="lwxn-card-label">${richSafe(c.label)}</p>
          ${c.text ? `<p class="lwxn-card-text">${esc(c.text)}</p>` : ''}
        </div>`,
      )
      .join('')

    return `
<section class="lwxn">
  <!-- 상단 제품 모크업 페어 -->
  <div class="lwxn-hero">
    <div class="lwxn-hero-slot">${heroA}</div>
    <div class="lwxn-hero-slot">${heroB}</div>
  </div>

  <!-- 상품명 / 설명 -->
  <div class="lwxn-meta">
    <h2 class="lwxn-name">${richSafe(d.productName)}</h2>
    ${d.productDesc ? `<p class="lwxn-desc">${esc(d.productDesc)}</p>` : ''}
  </div>

  <!-- 비대칭 벤토 그리드 -->
  <div class="lwxn-bento">
    <!-- 좌 컬럼 -->
    <div class="lwxn-left">
      <!-- 대형 카드 (모크업 이미지 오버랩) -->
      <div class="lwxn-card lwxn-tall">
        <p class="lwxn-card-label">${richSafe(d.leftTall.label)}</p>
        ${d.leftTall.text ? `<p class="lwxn-card-text">${esc(d.leftTall.text)}</p>` : ''}
        ${tallImg}
      </div>
      <!-- 컬렉션 카드 -->
      <div class="lwxn-card lwxn-coll">
        <p class="lwxn-card-label">${richSafe(d.leftCollection.label)}</p>
        ${d.leftCollection.text ? `<p class="lwxn-card-text">${esc(d.leftCollection.text)}</p>` : ''}
        ${collImgs}
      </div>
    </div>

    <!-- 우 컬럼: 4행 컴팩트 스택 -->
    <div class="lwxn-right">
      ${rightCards}
    </div>
  </div>

  <!-- 하단 와이드 + 절반 카드 -->
  <div class="lwxn-bottom">
    <div class="lwxn-card lwxn-wide">
      <p class="lwxn-card-label">${richSafe(d.bottomWide.label)}</p>
      ${d.bottomWide.text ? `<p class="lwxn-card-text">${esc(d.bottomWide.text)}</p>` : ''}
    </div>
    <div class="lwxn-halves">
      ${halfCards}
    </div>
  </div>
</section>`
  },
})
