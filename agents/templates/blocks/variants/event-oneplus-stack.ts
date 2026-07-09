/** EVENT 아키타입: event-oneplus-stack
 *  피그마 140_이벤트_06 재구성 — 웜브라운 풀배경 + 아이콘·라운드 라벨·대형 디스플레이 타이틀 +
 *  제품 풀이미지 + 흰 박스(내부 제품 이미지·혜택 태그 3종) + 다크 가격 바 + 환불 보장 뱃지
 *  의 다단 복합 레이아웃. 1+1 런칭 이벤트처럼 강한 구매 유인이 필요한 프로모션 섹션에 적합. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const benefitTagSchema = z.object({
  label: z.string().min(1), // 혜택 태그 텍스트 (예: 무료배송, 포인트 적립)
})

const schema = z.object({
  // ── 섹션 상단 타이틀 영역
  eventLabel: z.string().optional(),    // 라운드 필 안 이벤트 라벨 (예: 신제품 출시 이벤트)
  headline: z.string().min(1),          // 대형 디스플레이 헤드라인 (em,br 허용)
  // ── 제품 영역 (풀폭 커버 이미지)
  heroImage: z.string().optional(),     // 상단 제품 대표 사진 (url)
  // ── 프로모션 콘텐츠
  brandName: z.string().min(1),         // 브랜드/제품명 (상단 타이틀)
  eventName: z.string().min(1),         // 이벤트명 (하단 서브 타이틀)
  promoKey: z.string().min(1),          // 핵심 프로모션 키워드 (예: 1+1, 50%)
  subtagline: z.string().min(1),        // 다크 필 서브태그라인 (예: 하나 사면 두 개를 드립니다)
  // ── 흰 박스 내부
  boxImage: z.string().optional(),      // 흰 박스 안 제품 사진 (url)
  boxLabel: z.string().min(1),          // 흰 박스 상단 강조 라벨 (em 허용)
  benefitTags: z.array(benefitTagSchema).min(1).max(5), // 혜택 태그 목록
  // ── 가격 바
  originalPrice: z.string().optional(), // 정가 표시 (예: 300,000원)
  discountLabel: z.string().optional(), // 할인율 라벨 (예: 할인가 50%↓)
  salePrice: z.string().min(1),         // 할인가 숫자 (예: 150,000)
  salePriceUnit: z.string().optional(), // 단위 (기본 '원')
  // ── 보증 뱃지
  guaranteeBadge: z.string().optional(), // 보증 텍스트 (예: 30일 환불보장)
})

type Data = z.infer<typeof schema>

export const eventOneplusStack = defineBlock<Data>({
  id: 'event-oneplus-stack',
  archetype: 'event',
  styleTags: ['warm', 'promo', 'launch', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '1+1 런칭 이벤트형 다단 복합 레이아웃. 웜브라운 전체 배경 + 아이콘·라운드 라벨·대형 헤드라인 + 제품 풀이미지 + 흰 박스(내부 이미지·혜택 태그·가격 다크 바·환불 보장 뱃지). 강한 구매 유인이 필요한 1+1/런칭/특가 이벤트 섹션.',
  schema,
  css: `
/* ─── event-oneplus-stack ─── */
.eos{background:var(--brand,#af9671);color:#ffffff;padding:60px 0 0}
.eos .em{color:var(--em-dark,#FFF7EA)}

/* 섹션 상단 타이틀 */
.eos-top{display:flex;flex-direction:column;align-items:center;gap:18px;padding:0 var(--pad-x,56px) 48px}

/* 아이콘 */
.eos-icon{width:64px;height:64px;color:#ffffff;opacity:.92}
.eos-icon svg{width:100%;height:100%}

/* 라운드 이벤트 라벨 필 */
.eos-pill{background:#ffffff;color:#3b2e2b;border-radius:999px;font-family:var(--font-display);font-weight:700;font-size:18px;padding:10px 32px;letter-spacing:.04em;white-space:nowrap}

/* 대형 헤드라인 */
.eos-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,8vw,90px);line-height:1.1;text-align:center;color:#ffffff;letter-spacing:-.02em}

/* 제품 대표 이미지 (풀폭) */
.eos-hero-wrap{width:100%;padding:0 var(--pad-x,56px) 0}
.eos-hero-img{width:100%;aspect-ratio:680/616;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));background:color-mix(in srgb,var(--brand,#af9671) 80%,#fff)}
.eos-hero-img.ph{display:none!important}

/* 제품명+이벤트명 타이틀 영역 */
.eos-brand-area{padding:40px var(--pad-x,56px) 0;text-align:center;display:flex;flex-direction:column;gap:8px}
.eos-brand-name{font-family:var(--font-body);font-weight:700;font-size:clamp(32px,5vw,56px);color:#ffffff;line-height:1.2}
.eos-event-name{font-family:var(--font-body);font-weight:700;font-size:clamp(36px,6vw,70px);color:#ffffff;line-height:1.15;letter-spacing:-.01em}

/* 핵심 프로모션 키워드 (초대형) */
.eos-promo-key{font-family:var(--font-body);font-weight:900;font-size:clamp(80px,14vw,140px);color:#ffffff;text-align:center;line-height:1;padding:8px var(--pad-x,56px) 0;letter-spacing:-.03em}

/* 서브태그라인 다크 필 */
.eos-subtag{margin:20px var(--pad-x,56px) 0;background:#5a4d40;border-radius:calc(var(--r-scale,1)*10px);padding:14px 20px;text-align:center}
.eos-subtag-text{font-family:var(--font-body);font-weight:500;font-size:clamp(16px,2.5vw,24px);color:#ffffff;line-height:1.4}

/* 흰 박스 래퍼 */
.eos-white-box{background:#ffffff;margin:40px 0 0;padding:32px var(--pad-x,56px) 0}

/* 흰 박스 상단 강조 라벨 */
.eos-box-label{background:#5a4d40;border-radius:calc(var(--r-scale,1)*6px);padding:12px 20px;text-align:center;margin-bottom:24px}
.eos-box-label-text{font-family:var(--font-body);font-weight:900;font-size:clamp(18px,3vw,34px);color:#ffffff;line-height:1.35}
.eos-box-label-text .em{color:var(--em-dark,#FFF7EA)}

/* 흰 박스 내부 제품 이미지 */
.eos-box-img-wrap{display:flex;justify-content:center;margin-bottom:24px}
.eos-box-img{width:74%;aspect-ratio:500/423;object-fit:contain;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px))}
.eos-box-img.ph{display:none!important}

/* 혜택 태그 목록 */
.eos-tags{display:flex;flex-direction:column;gap:10px;margin-bottom:0}
.eos-tag{background:#70665d;border-radius:calc(var(--r-scale,1)*6px);padding:12px 20px;text-align:center}
.eos-tag-text{font-family:var(--font-body);font-weight:600;font-size:clamp(15px,2.2vw,26px);color:#ffffff;line-height:1.3}

/* 가격 다크 바 */
.eos-price-bar{background:#342d21;padding:22px var(--pad-x,56px);margin-top:0}
.eos-price-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.eos-price-row+.eos-price-row{margin-top:10px}
.eos-price-label{font-family:var(--font-body);font-weight:500;font-size:clamp(16px,2.4vw,32px);color:#c0c0c0;white-space:nowrap}
.eos-price-orig{font-family:var(--font-body);font-weight:500;font-size:clamp(16px,2.4vw,32px);color:#c0c0c0;text-decoration:line-through;text-align:right}
.eos-disc-label{font-family:var(--font-body);font-weight:600;font-size:clamp(16px,2.4vw,32px);color:#f3d42a;white-space:nowrap}
.eos-sale-price-wrap{display:flex;align-items:baseline;gap:4px;text-align:right}
.eos-sale-price{font-family:var(--font-body);font-weight:700;font-size:clamp(32px,6vw,64px);color:#f3d42a;line-height:1}
.eos-sale-unit{font-family:var(--font-body);font-weight:400;font-size:clamp(16px,2.4vw,32px);color:#ffffff}

/* 환불 보장 뱃지 */
.eos-guarantee{background:#70665d;border-radius:calc(var(--r-scale,1)*6px);padding:14px 20px;text-align:center;margin:0 var(--pad-x,56px) 0}
.eos-guarantee-text{font-family:var(--font-body);font-weight:600;font-size:clamp(15px,2.2vw,26px);color:#ffffff;line-height:1.3}

/* 하단 여백 */
.eos-footer-pad{height:48px;background:#342d21}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="eos">

  <!-- 섹션 상단: 아이콘 + 라운드 라벨 + 대형 헤드라인 -->
  <div class="eos-top">
    <div class="eos-icon">${icon('gift')}</div>
    ${d.eventLabel ? `<span class="eos-pill">${esc(d.eventLabel)}</span>` : ''}
    <h2 class="eos-headline">${richSafe(d.headline)}</h2>
  </div>

  <!-- 제품 대표 이미지 (풀폭) -->
  <div class="eos-hero-wrap">
    ${media(d.heroImage, 'eos-hero-img', '제품 대표 이미지')}
  </div>

  <!-- 브랜드명 + 이벤트명 -->
  <div class="eos-brand-area">
    <p class="eos-brand-name">${esc(d.brandName)}</p>
    <p class="eos-event-name">${esc(d.eventName)}</p>
  </div>

  <!-- 핵심 프로모션 키워드 -->
  <p class="eos-promo-key">${esc(d.promoKey)}</p>

  <!-- 서브태그라인 다크 필 -->
  <div class="eos-subtag">
    <p class="eos-subtag-text">${esc(d.subtagline)}</p>
  </div>

  <!-- 흰 박스 시작 -->
  <div class="eos-white-box">

    <!-- 흰 박스 상단 강조 라벨 -->
    <div class="eos-box-label">
      <p class="eos-box-label-text">${richSafe(d.boxLabel)}</p>
    </div>

    <!-- 흰 박스 내부 제품 이미지 -->
    <div class="eos-box-img-wrap">
      ${media(d.boxImage, 'eos-box-img', '제품 상세 이미지')}
    </div>

    <!-- 혜택 태그 목록 -->
    <div class="eos-tags">
      ${d.benefitTags.map(t => `
      <div class="eos-tag">
        <span class="eos-tag-text">${esc(t.label)}</span>
      </div>`).join('')}
    </div>

  </div>
  <!-- /흰 박스 -->

  <!-- 가격 다크 바 -->
  <div class="eos-price-bar">
    ${(d.originalPrice || d.discountLabel) ? `
    <div class="eos-price-row">
      ${d.discountLabel ? `<span class="eos-disc-label">${esc(d.discountLabel)}</span>` : `<span class="eos-price-label">정가</span>`}
      ${d.originalPrice ? `<span class="eos-price-orig">${esc(d.originalPrice)}</span>` : ''}
    </div>` : ''}
    <div class="eos-price-row">
      ${!d.discountLabel ? `<span class="eos-price-label">판매가</span>` : ''}
      <div class="eos-sale-price-wrap">
        <span class="eos-sale-price">${esc(d.salePrice)}</span>
        <span class="eos-sale-unit">${esc(d.salePriceUnit ?? '원')}</span>
      </div>
    </div>
  </div>

  <!-- 환불 보장 뱃지 -->
  ${d.guaranteeBadge ? `
  <div class="eos-guarantee">
    <span class="eos-guarantee-text">${esc(d.guaranteeBadge)}</span>
  </div>` : ''}

  <div class="eos-footer-pad"></div>
</section>`,
})
