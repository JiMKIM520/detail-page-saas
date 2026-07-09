/** EVENT 아키타입: event-darkbg-pricedrop
 *  전체 폭 배경사진 위 반투명 강조 타이포 + 다크 타이틀 영역 + 키워드 배지 3개
 *  + 흰 카드 2장(상품명 뱃지·이미지·블랙 가격 바·노란 할인가) 구조 재구성.
 *  원본 프레임: 212_이벤트_04.json (피그마 "이벤트/04")
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 스키마 ─────────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(1),           // 상품명 (상단 뱃지)
  tagline: z.string().min(1),        // 짧은 특징 설명 (em 허용)
  images: z.array(z.string()).min(1).max(3), // 제품 이미지 url 목록
  priceOriginal: z.string().optional(),      // 정가 표시 (예: "128,000원")  — optional: 증정품은 없을 수 있음
  priceLabel: z.string().min(1),     // 할인/무료 라벨 (예: "할인가 40%↓", "무료증정")
  priceValue: z.string().min(1),     // 금액 숫자만 (예: "76,900", "0")
  priceUnit: z.string().optional(),  // 단위, 기본 "원"
})

const schema = z.object({
  /** 배경 사진 (전체 폭 히어로). 없으면 브랜드색 배경으로 강등. */
  bgImage: z.string().optional(),

  /** 반투명 박스 위 대형 문구 (예: "오늘까지만"). 색·스타일은 기본 흰색. */
  headlineTop: z.string().min(1),

  /** 반투명 박스 안 강조 문구 — 점 간격 타이포 (em 허용). */
  headlineBox: z.string().min(1),

  /** 배경 사진 위 부연 설명 (예: "샴푸 3개 구입시 트리트먼트 추가증정!"). em 허용. */
  subCopy: z.string().optional(),

  /** 다크 영역 타이틀 1줄 (흰색). em 허용. */
  darkTitle1: z.string().min(1),

  /** 다크 영역 타이틀 2줄 (네온 강조색). em 허용. */
  darkTitle2: z.string().min(1),

  /** 배지 키워드 최대 3개 (무료배송, 30일 환불보장 등). */
  badges: z.array(z.string().min(1)).min(1).max(3),

  /** 제품 카드 — 정확히 2개 (메인 제품 + 증정/추가 제품). */
  products: z.tuple([productSchema, productSchema]),
})
type Data = z.infer<typeof schema>

// ── 변형 정의 ───────────────────────────────────────────────────────────────
export const eventDarkbgPricedrop = defineBlock<Data>({
  id: 'event-darkbg-pricedrop',
  archetype: 'event',
  styleTags: ['dark', 'promo', 'product', 'noimg-safe'],
  imageSlots: 4, // bgImage + 제품1 최대3장 + 제품2 최대3장 중 대표
  describe:
    '이벤트 프로모션 블록(다크). 전체 폭 배경사진 위 반투명 블랙박스 강조 타이포 → 다크 타이틀+뱃지 띠 → 흰 카드 2장(상품명 뱃지·세로 제품 이미지·블랙 가격 바·노란 할인가). 기간 한정 세트/증정 이벤트에 적합.',
  schema,
  css: `
/* ── 최상위 ─────────────────────────────────────── */
.esap{position:relative;background:var(--brand);color:var(--ink);font-family:var(--font-body),'Pretendard',sans-serif;word-break:keep-all}

/* ── 히어로 사진 영역 ──────────────────────────── */
.esap-hero{position:relative;width:100%;height:480px;overflow:hidden;background:var(--brand)}
.esap-hero-img{width:100%;height:100%;object-fit:cover;display:block}
.esap-hero .ph{display:none!important}

/* 배경사진 없을 때 강등: 브랜드색 배경에 그라디언트 오버레이 */
.esap-hero.noimg-safe{background:linear-gradient(160deg,var(--brand) 0%,color-mix(in srgb,var(--brand) 60%,#000) 100%)}

/* ── 오버레이 텍스트 박스 ─────────────────────── */
.esap-overlay{position:absolute;top:50%;left:var(--pad-x,56px);transform:translateY(-50%);max-width:calc(100% - var(--pad-x,56px)*2)}

.esap-top-line{
  font-size:64px;font-weight:500;line-height:1.1;
  color:#fff;
  text-shadow:0 2px 8px rgba(0,0,0,.45);
  letter-spacing:-.02em
}

.esap-hl-box{
  margin-top:6px;
  background:rgba(17,17,17,.88);
  display:inline-block;
  padding:10px 22px 10px 22px;
  border-radius:calc(var(--r-scale,1)*4px)
}
.esap-hl-box-text{
  font-size:64px;font-weight:800;line-height:1.1;
  color:#caae8c;
  letter-spacing:.18em
}
/* em 오버라이드 — 다크 박스 안 richSafe .em은 밝은 크림 */
.esap .esap-hl-box-text .em{color:var(--em-dark,#FFF7EA)}

.esap-sub{
  margin-top:14px;
  font-size:26px;font-weight:500;line-height:1.5;
  color:#272625;
  text-shadow:0 1px 4px rgba(255,255,255,.6)
}
.esap-sub .em{color:var(--em-dark,#FFF7EA)}

/* ── 다크 타이틀 + 뱃지 띠 ───────────────────── */
.esap-dark{
  background:var(--brand);
  padding:36px var(--pad-x,56px) 28px;
  text-align:center
}
.esap-dark-t1{
  font-size:52px;font-weight:800;line-height:1.15;
  color:#fff;letter-spacing:-.02em
}
.esap-dark-t1 .em{color:var(--em-dark,#FFF7EA)}
.esap-dark-t2{
  font-size:52px;font-weight:800;line-height:1.15;
  /* 네온 강조 — 토큰 accent 또는 기본 라임 */
  color:var(--accent,#d0ff01);letter-spacing:-.02em
}
.esap-dark-t2 .em{color:var(--em-dark,#FFF7EA)}

/* 구분선 */
.esap-rule{
  width:440px;max-width:80%;height:2px;
  background:rgba(255,255,255,.18);
  margin:16px auto 0;border-radius:999px
}

/* 뱃지 행 */
.esap-badges{
  display:flex;justify-content:center;gap:10px;
  margin-top:14px;flex-wrap:wrap
}
.esap-badge{
  background:var(--accent-d,#5a7020);
  color:#fff;
  font-size:20px;font-weight:600;
  padding:8px 22px;
  border-radius:calc(var(--r-scale,1)*5px)
}

/* ── 제품 카드 영역 ───────────────────────────── */
.esap-cards{
  background:var(--brand);
  padding:0 var(--pad-x,56px) 44px;
  display:flex;flex-direction:column;gap:0
}

/* 카드 간 "+" 연결 */
.esap-plus{
  position:relative;height:0;z-index:2;
  display:flex;justify-content:center
}
.esap-plus-dot{
  position:absolute;top:-28px;
  width:56px;height:56px;
  background:#ff5e00;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:28px;font-weight:700;line-height:1;
  box-shadow:0 4px 14px rgba(255,94,0,.45)
}

/* 개별 카드 */
.esap-card{
  background:#fff;
  border-radius:calc(var(--r-scale,1)*0px) calc(var(--r-scale,1)*0px) 0 0;
  overflow:hidden
}
.esap-card+.esap-card{margin-top:56px}

/* 상품명 뱃지 (카드 최상단 풀폭) */
.esap-card-name{
  background:var(--accent-d,#5a7020);
  padding:10px 28px;
  font-size:28px;font-weight:800;
  color:#fff;line-height:1.3
}

/* 특징 텍스트 */
.esap-card-tag{
  padding:10px 28px 0;
  font-size:22px;font-weight:500;
  color:#000;line-height:1.5
}
.esap-card-tag .em{color:var(--accent-d,#5a7020);font-weight:700}

/* 제품 이미지 행 */
.esap-card-imgs{
  display:flex;gap:0;justify-content:center;
  padding:18px 28px 0;gap:4px
}
.esap-card-img{
  flex:1;
  /* 세로 제품 누끼 프레임 */
  height:240px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 6%,#f5f5f5)
}
.esap-card-img img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
.esap-card-img .ph{display:none!important}

/* 블랙 가격 바 */
.esap-price-bar{
  background:#000;
  padding:14px 28px 18px;
  margin-top:14px
}
.esap-price-orig{
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:6px
}
.esap-price-orig-label{
  font-size:26px;font-weight:500;color:#c0c0c0
}
.esap-price-orig-val{
  font-size:26px;font-weight:500;color:#c0c0c0;text-decoration:line-through
}
.esap-price-disc{
  display:flex;justify-content:space-between;align-items:flex-end
}
.esap-price-disc-label{
  font-size:26px;font-weight:700;
  color:#d0ff01   /* 네온 라임 — 이벤트 강조 */
}
.esap-price-disc-val{display:flex;align-items:flex-end;gap:3px}
.esap-price-num{
  font-size:52px;font-weight:800;line-height:1;
  color:#d0ff01
}
.esap-price-unit{
  font-size:26px;font-weight:400;
  color:#fff;padding-bottom:4px
}
`,
  render: (d, { esc, richSafe }) => {
    const hasBg = typeof d.bgImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.bgImage.trim())

    // 제품 카드 렌더 함수
    const renderCard = (p: Data['products'][0]) => {
      const imgs = p.images.slice(0, 3)
      return `
<div class="esap-card">
  <div class="esap-card-name">${esc(p.name)}</div>
  <div class="esap-card-tag">${richSafe(p.tagline)}</div>
  <div class="esap-card-imgs">
    ${imgs.map((url) => `
    <div class="esap-card-img">
      ${media(url, '', p.name + ' 제품 이미지')}
    </div>`).join('')}
  </div>
  <div class="esap-price-bar">
    ${p.priceOriginal ? `
    <div class="esap-price-orig">
      <span class="esap-price-orig-label">정가</span>
      <span class="esap-price-orig-val">${esc(p.priceOriginal)}</span>
    </div>` : ''}
    <div class="esap-price-disc">
      <span class="esap-price-disc-label">${esc(p.priceLabel)}</span>
      <div class="esap-price-disc-val">
        <span class="esap-price-num">${esc(p.priceValue)}</span>
        <span class="esap-price-unit">${esc(p.priceUnit ?? '원')}</span>
      </div>
    </div>
  </div>
</div>`
    }

    return `
<section class="esap">
  <!-- 히어로 사진 영역 -->
  <div class="esap-hero${hasBg ? '' : ' noimg-safe'}">
    ${hasBg ? `<img class="esap-hero-img" src="${d.bgImage}" alt="이벤트 배경">` : ''}
    <div class="esap-overlay">
      <div class="esap-top-line">${esc(d.headlineTop)}</div>
      <div class="esap-hl-box">
        <div class="esap-hl-box-text">${richSafe(d.headlineBox)}</div>
      </div>
      ${d.subCopy ? `<div class="esap-sub">${richSafe(d.subCopy)}</div>` : ''}
    </div>
  </div>

  <!-- 다크 타이틀 + 뱃지 띠 -->
  <div class="esap-dark">
    <div class="esap-dark-t1">${richSafe(d.darkTitle1)}</div>
    <div class="esap-dark-t2">${richSafe(d.darkTitle2)}</div>
    <div class="esap-rule"></div>
    <div class="esap-badges">
      ${d.badges.map((b) => `<span class="esap-badge">${esc(b)}</span>`).join('')}
    </div>
  </div>

  <!-- 제품 카드 2장 -->
  <div class="esap-cards">
    ${renderCard(d.products[0])}
    <div class="esap-plus" aria-hidden="true">
      <div class="esap-plus-dot">+</div>
    </div>
    ${renderCard(d.products[1])}
  </div>
</section>`
  },
})
