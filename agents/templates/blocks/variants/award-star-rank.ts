/** AWARD 아키타입: award-star-rank
 *
 * 구조: 그라디언트 다크 배경 / 우측 제품 목업 이미지 + 좌측 순위 선언 텍스트 /
 *       각 글자 위에 별표 SVG를 인라인 배치해 "1위 달성"을 장식하는 타이포 기법 /
 *       하단 쇼핑몰 카드 그리드(썸네일+상품명+가격) + 트로피 아이콘 배지 수상 띠.
 *
 * 원본: 137_어워드_구성_페이지_17.json  (피그마 템플릿 — 클론 금지)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 스키마 ──────────────────────────────────────────── */
const shopItemSchema = z.object({
  image: z.string().optional(),           // (url) 쇼핑몰 썸네일
  name: z.string().min(1),               // 상품명
  price: z.string().min(1),             // 가격 (예: "59,900원")
  desc: z.string().optional(),           // 한 줄 설명
})

const schema = z.object({
  categoryLabel: z.string().min(1),      // 예: "뷰티케어" — 카테고리 라벨
  countText: z.string().min(1),          // 예: "약 12만개 클렌저 중" — 제품 수 맥락
  rankDecl: z.string().min(1),          // 예: "1위 달성" — 별표 타이포 핵심 문구 (최대 6자 권장)
  headline: z.string().min(1),          // 예: "[브랜드]의 [제품명]이" (em 허용)
  subline: z.string().optional(),       // 예: "했습니다!" (em 허용)
  productImage: z.string().optional(),  // (url) 우측 제품 목업 이미지
  shopItems: z.array(shopItemSchema).min(1).max(4),  // 쇼핑몰 카드 목록
  awardCategory: z.string().min(1),     // 예: "스킨케어" — 수상 부문
  awardLabel: z.string().min(1),        // 예: "쇼핑몰 판매량 1위" — 수상 타이틀
})
type Data = z.infer<typeof schema>

/* ── 별표 SVG (인라인 · 그라디언트 금색) ─────────────── */
const STAR_SVG = `<svg class="anxb-star-glyph" viewBox="0 0 20 20" aria-hidden="true">
  <defs>
    <linearGradient id="anxb-sg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE168"/>
      <stop offset="100%" stop-color="#D8AC55"/>
    </linearGradient>
  </defs>
  <path fill="url(#anxb-sg)" d="M10 1l2.06 6.34H18.5l-5.28 3.84 2.02 6.22L10 13.42l-5.24 3.98 2.02-6.22L1.5 7.34h6.44z"/>
</svg>`

/* ── 트로피 burst 장식 SVG ──────────────────────────── */
const BURST_SVG = `<svg class="anxb-burst" viewBox="0 0 56 56" aria-hidden="true">
  <defs>
    <linearGradient id="anxb-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE168"/>
      <stop offset="100%" stop-color="#D8AC55"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="url(#anxb-bg)" stroke-width="2.4" stroke-linecap="round">
    <line x1="28" y1="4"  x2="28" y2="12"/>
    <line x1="28" y1="44" x2="28" y2="52"/>
    <line x1="4"  y1="28" x2="12" y2="28"/>
    <line x1="44" y1="28" x2="52" y2="28"/>
    <line x1="10" y1="10" x2="16" y2="16"/>
    <line x1="40" y1="40" x2="46" y2="46"/>
    <line x1="46" y1="10" x2="40" y2="16"/>
    <line x1="10" y1="46" x2="16" y2="40"/>
  </g>
  <circle cx="28" cy="28" r="10" fill="none" stroke="url(#anxb-bg)" stroke-width="2"/>
  <path fill="url(#anxb-bg)" d="M28 21l1.8 5.5H36l-4.6 3.3 1.8 5.4L28 31.9l-5.2 3.3 1.8-5.4-4.6-3.3h6.2z"/>
</svg>`

export const awardStarRank = defineBlock<Data>({
  id: 'award-star-rank',
  archetype: 'award',
  styleTags: ['dark', 'mixed', 'award', 'rank', 'gradient', 'editorial'],
  imageSlots: 2,
  describe:
    '수상/판매 1위 선언 블록. 다크 그라디언트 배경 위 우측 제품 목업 + 좌측 "1위 달성" 각 글자 위 별표 SVG 인라인 타이포 장식 + 쇼핑몰 카드 그리드 + 수상 배지 띠. 판매 1위·어워드 강조.',
  schema,
  css: `
/* ── 섹션 래퍼 ── */
.anxb{position:relative;background:linear-gradient(145deg,var(--brand) 0%,color-mix(in srgb,var(--brand) 55%,#000) 100%);padding:54px var(--pad-x,56px) 60px;overflow:hidden}
/* 다크 섹션 em 오버라이드 */
.anxb .em{color:var(--em-dark,#FFF7EA)}

/* ── 상단 2단 레이아웃 ── */
.anxb-top{display:flex;align-items:flex-start;gap:28px;margin-bottom:40px}
.anxb-left{flex:1;min-width:0}
.anxb-right{flex:0 0 210px;width:210px}

/* ── 카테고리 라벨 ── */
.anxb-cat{display:inline-block;font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.06em;
  background:linear-gradient(90deg,#FFE168,#D8AC55);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:10px}

/* ── 맥락 텍스트 ── */
.anxb-ctx{font-size:21px;font-weight:600;line-height:1.35;
  background:linear-gradient(90deg,#FFFFFF,#D8E4FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:18px}

/* ── 별표 타이포 행 ── */
.anxb-rank-row{display:flex;align-items:flex-end;gap:2px;flex-wrap:wrap;margin-bottom:10px}
.anxb-char-cell{display:flex;flex-direction:column;align-items:center;gap:2px}
.anxb-star-glyph{width:18px;height:18px;flex-shrink:0}
.anxb-rank-char{font-family:var(--font-display);font-size:72px;font-weight:800;line-height:1;
  background:linear-gradient(160deg,#FFE168 0%,#D8AC55 60%,#C89A30 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  letter-spacing:-.02em}

/* ── 서브라인 ── */
.anxb-subline{font-family:var(--font-display);font-size:46px;font-weight:700;line-height:1.1;
  color:#FFFFFF;margin-top:6px;letter-spacing:-.01em}
.anxb-subline .em{color:var(--em-dark,#FFF7EA)}

/* ── 헤드라인 (회사/제품명) ── */
.anxb-headline{font-family:var(--font-display);font-size:30px;font-weight:700;line-height:1.3;
  color:rgba(255,255,255,.82);margin-bottom:14px}
.anxb-headline .em{color:var(--em-dark,#FFF7EA)}

/* ── 제품 목업 ── */
.anxb-mock{width:100%;aspect-ratio:140/220;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));
  object-fit:contain;filter:drop-shadow(0 12px 28px rgba(0,0,0,.55))}
.anxb-mock.ph{display:none!important}

/* ── 쇼핑몰 카드 그리드 ── */
.anxb-cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px}
.anxb-card{flex:1 1 160px;max-width:220px;background:#FFFFFF;border-radius:calc(var(--r-scale,1)*12px);
  overflow:hidden;display:flex;flex-direction:column;position:relative}
.anxb-card-thumb{width:100%;aspect-ratio:1/0.75;object-fit:cover}
.anxb-card-thumb.ph{display:none!important}
.anxb-card-body{padding:10px 12px 14px}
.anxb-card-name{font-size:14px;font-weight:700;color:#111;line-height:1.35;margin-bottom:4px}
.anxb-card-desc{font-size:12px;color:#666;line-height:1.4;margin-bottom:6px}
.anxb-card-price{font-size:15px;font-weight:800;color:#111}
/* 카드 1위 뱃지 (첫 번째 카드) */
.anxb-card:first-child::before{content:'1위';position:absolute;top:8px;left:8px;
  background:linear-gradient(135deg,#FFE168,#C89A30);color:#1a1200;
  font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;letter-spacing:.04em}

/* ── 수상 배지 띠 ── */
.anxb-award-row{display:flex;align-items:center;justify-content:center;gap:16px;
  border-top:1px solid rgba(255,255,255,.12);padding-top:24px}
.anxb-burst{width:44px;height:44px;flex-shrink:0}
.anxb-award-text{text-align:center}
.anxb-award-cat{font-size:16px;font-weight:500;color:rgba(255,255,255,.7);letter-spacing:.04em;margin-bottom:2px}
.anxb-award-label{font-family:var(--font-display);font-size:28px;font-weight:800;
  background:linear-gradient(90deg,#FFE168,#D8AC55);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
`,
  render: (d, { esc, richSafe, icon }) => {
    /* 각 글자 위에 별표 인라인 배치 */
    const rankChars = [...d.rankDecl].map(
      (ch) => `<span class="anxb-char-cell">${STAR_SVG}<span class="anxb-rank-char">${esc(ch)}</span></span>`,
    ).join('')

    /* 쇼핑몰 카드 */
    const cards = d.shopItems.map((item) => `
<div class="anxb-card">
  ${item.image ? `<img class="anxb-card-thumb" src="${item.image}" alt="${esc(item.name)}">` : `<div class="anxb-card-thumb ph" aria-hidden="true"></div>`}
  <div class="anxb-card-body">
    <div class="anxb-card-name">${esc(item.name)}</div>
    ${item.desc ? `<div class="anxb-card-desc">${esc(item.desc)}</div>` : ''}
    <div class="anxb-card-price">${esc(item.price)}</div>
  </div>
</div>`).join('')

    return `
<section class="anxb">
  <div class="anxb-top">
    <div class="anxb-left">
      <div class="anxb-cat">${esc(d.categoryLabel)}</div>
      <div class="anxb-ctx">${esc(d.countText)}</div>
      <h2 class="anxb-headline">${richSafe(d.headline)}</h2>
      <div class="anxb-rank-row" role="text" aria-label="${esc(d.rankDecl)}">${rankChars}</div>
      ${d.subline ? `<div class="anxb-subline">${richSafe(d.subline)}</div>` : ''}
    </div>
    <div class="anxb-right">
      ${d.productImage
        ? `<img class="anxb-mock" src="${d.productImage}" alt="${esc(d.categoryLabel)} 제품">`
        : `<div class="anxb-mock ph" role="img" aria-label="제품 이미지"></div>`}
    </div>
  </div>

  <div class="anxb-cards">${cards}</div>

  <div class="anxb-award-row">
    ${BURST_SVG}
    <div class="anxb-award-text">
      <div class="anxb-award-cat">${esc(d.awardCategory)}</div>
      <div class="anxb-award-label">${icon('trophy')}&nbsp;${esc(d.awardLabel)}</div>
    </div>
    ${BURST_SVG}
  </div>
</section>`
  },
})
