/** DISCOUNT 아키타입: discount-bolt-split
 *  피그마 041_포인트_구성_페이지_1 재구성.
 *  그라디언트 다크 배경 + 상단 이벤트 뱃지 + 브랜드명 초대형 + "파격 [번개] 할인" 타이포 분할
 *  + 마스크 제품 이미지(noimg-safe) + 가격 구조 행(소비자가/이벤트가/최대할인) + 3열 혜택 카드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const benefitItem = z.object({
  label: z.string().min(1),  // 혜택 소제목 (예: 리뷰 적립금)
  value: z.string().min(1),  // 혜택 금액/내용 (예: 2,000원)
})

const schema = z.object({
  eventBadge: z.string().optional(),          // 상단 이벤트 뱃지 문구 (예: 3주년 기념 특별 할인!)
  brandName: z.string().min(1),              // 초대형 브랜드명
  leftWord: z.string().min(1),               // 번개 왼쪽 단어 (예: 파격)
  rightWord: z.string().min(1),              // 번개 오른쪽 단어 (예: 할인)
  discountRate: z.string().optional(),       // 좌측 할인율 표기 (예: 60%)
  image: z.string().optional(),              // 제품 이미지 URL
  subCopy: z.string().optional(),            // 이미지 하단 서브 카피 (em 허용)
  originalPrice: z.string().optional(),      // 소비자가 (예: 299,000원)
  eventLabel: z.string().optional(),         // 이벤트가 라벨 (예: 3주년 특가)
  eventPrice: z.string().optional(),         // 이벤트가 (예: 199,000원)
  finalLabel: z.string().optional(),         // 최대 할인가 라벨
  finalPrice: z.string().optional(),         // 최대 할인가 (예: 119,600원)
  benefits: z.array(benefitItem).min(2).max(3),  // 하단 혜택 카드 2~3개
})
type Data = z.infer<typeof schema>

/** 인라인 SVG 번개 — 피그마 3-벡터 번개 재구성 (fill 기반, 원본 #07a6d3/#7ee3ff/#28c6f3 계열). */
const BOLT_SVG = `<svg class="dosg-bolt" viewBox="0 0 56 134" aria-hidden="true">
  <polygon points="28,0 56,0 22,67 44,67 0,134 10,72 0,72" fill="#07a6d3"/>
  <polygon points="10,0 28,0 8,60 20,60 4,120 8,64 0,64" fill="#7ee3ff" opacity=".85"/>
  <polygon points="30,67 44,67 24,110 28,90 18,90" fill="#28c6f3" opacity=".9"/>
</svg>`

export const discountBoltSplit = defineBlock<Data>({
  id: 'discount-bolt-split',
  archetype: 'discount',
  styleTags: ['dark', 'impact', 'promo', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '할인 임팩트 블록. 딥 네이비 그라디언트 배경 + 브랜드명 초대형 + "파격 [번개SVG] 할인" 타이포 분할 장치 + 마스크 제품 이미지 + 3단 가격(소비자가/이벤트가/최대할인) + 3열 혜택 카드. 주년 기념/특가 캠페인용.',
  schema,
  css: `
/* ── discount-bolt-split (dosg) ──────────────────────────────── */
.dosg{position:relative;background:linear-gradient(170deg,#0d1e35 0%,#0b2a44 40%,#062033 100%);color:var(--ink);padding:0 0 0;overflow:hidden}
/* 다크 영역 em 오버라이드 */
.dosg .em{color:var(--em-dark,#FFF7EA)}

/* 배경 광선 장식 */
.dosg-glow{position:absolute;top:0;left:50%;transform:translateX(-50%);width:800px;height:420px;background:radial-gradient(ellipse 60% 50% at 50% 0%,rgba(7,166,211,.18) 0%,transparent 70%);pointer-events:none}

/* 상단 헤더 영역 */
.dosg-hd{position:relative;padding:48px var(--pad-x,56px) 0;text-align:center}
.dosg-badge{display:inline-block;font-family:var(--font-body),'Pretendard',sans-serif;font-size:22px;font-weight:400;color:#d5e5ff;letter-spacing:.01em;margin-bottom:16px}

/* 브랜드명 */
.dosg-brand{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:clamp(64px,9vw,100px);line-height:1;color:#ffffff;letter-spacing:-.02em;text-align:center;word-break:keep-all}

/* 파격[번개]할인 분할 행 */
.dosg-split{display:flex;align-items:center;justify-content:center;gap:0;margin-top:4px}
.dosg-split-word{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:clamp(64px,9vw,100px);line-height:1;color:#ffffff;letter-spacing:-.02em}
.dosg-bolt{width:54px;height:auto;flex-shrink:0;margin:0 6px;filter:drop-shadow(0 0 12px rgba(40,198,243,.55))}

/* 제품 이미지 카드 */
.dosg-img-wrap{position:relative;margin:36px var(--pad-x,56px) 0;background:calc(var(--r-scale,1)*0px) /* dummy */}
.dosg-img-inner{position:relative;border-radius:var(--shape-photo, calc(var(--r-scale,1)*28px));overflow:hidden;background:#0b263a}
.dosg-img-inner img{width:100%;aspect-ratio:16/11;object-fit:cover;display:block}
/* noimg-safe: 이미지 없으면 frame 자체를 0높이로 수축 — 붕괴 방지 */
.dosg-img-inner .ph{display:none!important;height:0}
.dosg-img-inner:has(.ph){height:0;overflow:hidden}

/* 할인율 배지 (좌측 절대) */
.dosg-rate{position:absolute;left:0;top:50%;transform:translateY(-50%);font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:clamp(56px,8vw,90px);color:#92efff;line-height:1;text-shadow:0 0 24px rgba(146,239,255,.4);pointer-events:none;white-space:nowrap}

/* 서브 카피 */
.dosg-subcopy{margin:24px var(--pad-x,56px) 0;font-family:var(--font-body),'Pretendard',sans-serif;font-size:17px;font-weight:500;color:#ffffff;line-height:1.65;text-align:center}
.dosg-subcopy .em{color:var(--em-dark,#FFF7EA)}

/* 가격 섹션 */
.dosg-price-wrap{margin:20px var(--pad-x,56px) 0}
.dosg-divider{height:1px;background:rgba(217,217,217,.22);margin-bottom:18px}
.dosg-price-row{display:flex;align-items:flex-end;gap:24px}
/* 왼쪽: 할인율 숫자 (이미지 없을 때 노출) */
.dosg-price-rate{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:72px;color:#92efff;line-height:1;flex-shrink:0;display:none}
.dosg-price-rate.show{display:block}
/* 오른쪽 가격 스택 */
.dosg-price-stack{flex:1;display:flex;flex-direction:column;gap:4px}
.dosg-original{display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1px solid #244d6b}
.dosg-original-label,.dosg-original-val{font-size:17px;color:#244d6b}
.dosg-event{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
.dosg-event-label{font-size:19px;color:#73a8d0;font-weight:400}
.dosg-event-val{font-size:19px;color:#e0e0e0;font-weight:400}
.dosg-final{display:flex;justify-content:space-between;align-items:center;margin-top:4px}
.dosg-final-label{font-size:20px;color:#ffffff;font-weight:400}
.dosg-final-val{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:700;font-size:clamp(22px,3vw,28px);color:#92efff}

/* 혜택 카드 행 */
.dosg-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:22px var(--pad-x,56px) 48px}
.dosg-card{background:linear-gradient(135deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.06) 100%);border:1px solid rgba(255,255,255,.09);border-radius:calc(var(--r-scale,1)*10px);padding:16px 14px 18px;text-align:center}
.dosg-card-label{font-family:var(--font-body),'Pretendard',sans-serif;font-size:13px;color:rgba(255,255,255,.65);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dosg-card-val{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:700;font-size:clamp(20px,2.6vw,28px);color:#000000;letter-spacing:-.01em;background:linear-gradient(135deg,#d4f0ff 0%,#92efff 60%,#60d8f0 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    const priceBlock = (d.originalPrice || d.eventPrice || d.finalPrice) ? `
<div class="dosg-price-wrap">
  <div class="dosg-divider"></div>
  <div class="dosg-price-row">
    ${(!hasImage && d.discountRate) ? `<div class="dosg-price-rate show">${esc(d.discountRate)}</div>` : ''}
    <div class="dosg-price-stack">
      ${d.originalPrice ? `
      <div class="dosg-original">
        <span class="dosg-original-label">${esc(d.eventLabel ?? '소비자가')}</span>
        <span class="dosg-original-val">${esc(d.originalPrice)}</span>
      </div>` : ''}
      ${d.eventPrice ? `
      <div class="dosg-event">
        <span class="dosg-event-label">${esc(d.eventLabel ?? '이벤트 특가')}</span>
        <span class="dosg-event-val">${esc(d.eventPrice)}</span>
      </div>` : ''}
      ${d.finalPrice ? `
      <div class="dosg-final">
        <span class="dosg-final-label">${esc(d.finalLabel ?? '최대 할인가')}</span>
        <span class="dosg-final-val">${esc(d.finalPrice)}</span>
      </div>` : ''}
    </div>
  </div>
</div>` : ''

    return `
<section class="dosg">
  <div class="dosg-glow"></div>

  <div class="dosg-hd">
    ${d.eventBadge ? `<div class="dosg-badge">${esc(d.eventBadge)}</div>` : ''}
    <div class="dosg-brand">${esc(d.brandName)}</div>
    <div class="dosg-split">
      <span class="dosg-split-word">${esc(d.leftWord)}</span>
      ${BOLT_SVG}
      <span class="dosg-split-word">${esc(d.rightWord)}</span>
    </div>
  </div>

  ${hasImage ? `
  <div class="dosg-img-wrap">
    ${d.discountRate ? `<div class="dosg-rate">${esc(d.discountRate)}</div>` : ''}
    <div class="dosg-img-inner">
      ${media(d.image, '', '제품 이미지')}
    </div>
  </div>` : ''}

  ${d.subCopy ? `<p class="dosg-subcopy">${richSafe(d.subCopy)}</p>` : ''}

  ${priceBlock}

  <div class="dosg-benefits">
    ${d.benefits.map(b => `
    <div class="dosg-card">
      <div class="dosg-card-label">${esc(b.label)}</div>
      <div class="dosg-card-val">${esc(b.value)}</div>
    </div>`).join('')}
  </div>
</section>`
  },
})
