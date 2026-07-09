/** LINEUP 아키타입: lineup-dual-price-seal
 *  090_문제해결_08 패턴 재구성.
 *  베이지 배경 + 3단 헤드라인 + 전폭 대표 이미지 + 3개 흰 카드
 *  (카드마다 원형 제품 이미지 + 브랜드박스/취소가·할인가 이중 가격 뱃지) +
 *  좌상단 원형 '특별함' 인장 오버랩.
 *  noimg-safe: 대표 이미지 및 카드 이미지 전부 없을 때도 붕괴 없이 렌더.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  image: z.string().optional(),            // 원형 제품 이미지 (url)
  title: z.string().min(1),               // 상품명 2줄 (em,br 허용)
  desc: z.string().optional(),            // 짧은 보조 설명
  brandLabel: z.string().min(1),          // 브랜드 박스 문구 (취소가 행)
  regularPrice: z.string().min(1),        // 정상가 텍스트 (예: "39,000원")
  discountBrandLabel: z.string().min(1),  // 브랜드 박스 문구 (할인가 행)
  discountPrice: z.string().min(1),       // 할인가 텍스트 (예: "27,900원")
})

const schema = z.object({
  headTop: z.string().min(1),             // 헤드 소제목 (작은 글씨)
  headMain: z.string().min(1),            // 헤드 메인 (가장 큰 글씨, em/br 허용)
  headSub: z.string().optional(),         // 헤드 세번째 줄
  heroImage: z.string().optional(),       // 전폭 대표 이미지 (url)
  sealText: z.string().optional(),        // 원형 인장 문구 (기본: "특별함")
  items: z.array(itemSchema).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const lineupDualPriceSeal = defineBlock<Data>({
  id: 'lineup-dual-price-seal',
  archetype: 'lineup',
  styleTags: ['warm', 'food', 'template', 'mixed', 'noimg-safe'],
  imageSlots: 4, // 1 hero + 3 card (원형)
  describe:
    '상품 라인업(취소가+할인가 이중 가격 뱃지). 베이지 배경 + 3단 중앙 헤드라인 + 전폭 대표 사진 + 3개 흰 카드(좌 원형 이미지·우 제목/설명/브랜드박스-취소가-할인가) + 좌상단 원형 인장 오버랩. 할인 구성 강조 라인업에 적합.',
  schema,
  css: `
.lplk{background:var(--bg);padding-bottom:60px;position:relative}

/* 헤드라인 */
.lplk-hd{padding:50px var(--pad-x,56px) 40px;text-align:center}
.lplk-hd-top{font-family:var(--font-body);font-size:22px;font-weight:700;color:var(--ink-2,#6b4f35);letter-spacing:.02em;line-height:1.4}
.lplk-hd-main{font-family:var(--font-display);font-size:clamp(48px,7vw,80px);font-weight:800;color:var(--ink,#2a1c0c);letter-spacing:-.02em;line-height:1.08;margin-top:4px}
.lplk-hd-main .em{color:var(--accent-d,#8a4e1e)}
.lplk-hd-sub{font-family:var(--font-body);font-size:24px;font-weight:600;color:var(--ink-2,#6b4f35);opacity:.85;margin-top:8px;letter-spacing:.01em}

/* 전폭 대표 이미지 */
.lplk-hero{margin:0 var(--pad-x,56px) 28px;overflow:hidden;border-radius:var(--shape-photo,calc(var(--r-scale,1)*18px));position:relative}
.lplk-hero img,.lplk-hero .ph{width:100%;aspect-ratio:760/500;object-fit:cover;border-radius:inherit;display:block}

/* 카드 목록 */
.lplk-cards{display:flex;flex-direction:column;gap:16px;padding:0 var(--pad-x,56px)}

/* 개별 카드 */
.lplk-card{position:relative;background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*16px);display:flex;align-items:center;gap:0;padding:28px 28px 28px 28px;box-shadow:0 6px 24px -8px rgba(80,52,28,.18)}

/* 원형 이미지 (좌) */
.lplk-thumb-wrap{flex:0 0 auto;width:180px;height:180px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,#fff);flex-shrink:0}
.lplk-thumb-wrap img,.lplk-thumb-wrap .ph{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}

/* 콘텐츠 (우) */
.lplk-content{flex:1;min-width:0;padding-left:24px}

/* 상품명 + 설명 */
.lplk-title{font-family:var(--font-body);font-size:clamp(20px,2.8vw,28px);font-weight:800;color:var(--ink);line-height:1.32}
.lplk-title .em{color:var(--accent-d)}
.lplk-desc{font-size:15px;font-weight:500;color:var(--ink-2);margin-top:6px;opacity:.7}

/* 가격 그룹 */
.lplk-price-group{margin-top:14px;display:flex;flex-direction:column;gap:6px}

/* 취소가 행 */
.lplk-price-row{display:flex;align-items:center;gap:10px}
.lplk-brand-box{display:inline-flex;align-items:center;justify-content:center;background:#888;color:#fff;font-family:var(--font-body);font-size:14px;font-weight:700;padding:4px 12px;border-radius:calc(var(--r-scale,1)*6px);white-space:nowrap;flex-shrink:0}
.lplk-brand-box.accent{background:var(--accent)}
.lplk-regular-price{font-size:16px;font-weight:600;color:#888;text-decoration:line-through;letter-spacing:-.01em}

/* 할인가 행 */
.lplk-discount-price{font-size:clamp(22px,3.2vw,32px);font-weight:800;color:var(--accent);letter-spacing:-.02em;line-height:1}

/* 원형 인장 — 카드 좌상단 오버랩 */
.lplk-seal{position:absolute;top:-18px;left:-18px;width:72px;height:72px;border-radius:50%;background:var(--brand,#815e44);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px -4px rgba(42,28,12,.45);z-index:2}
.lplk-seal-text{font-family:var(--font-body);font-size:14px;font-weight:900;color:#fff;text-align:center;line-height:1.2;letter-spacing:.02em}

/* noimg-safe: 이미지 없을 때 원형 자리 유지 + 틴트 배경 */
.lplk-thumb-wrap.ph-mode{background:color-mix(in srgb,var(--accent) 15%,var(--paper,#fff))}
`,
  render: (d, { esc, richSafe }) => {
    const sealLabel = d.sealText ?? '특별함'

    const cards = d.items.map((item) => {
      const hasImg = typeof item.image === 'string' && /^(https?:\/\/|data:|\/)/.test(item.image.trim())
      const thumbInner = hasImg
        ? media(item.image, 'lplk-thumb-wrap', esc(item.title))
        : `<div class="lplk-thumb-wrap ph-mode" role="img" aria-label="${esc(item.title)}"></div>`

      return `
  <div class="lplk-card">
    <div class="lplk-seal" aria-label="${esc(sealLabel)}">
      <span class="lplk-seal-text">${esc(sealLabel)}</span>
    </div>
    ${hasImg ? thumbInner : `<div class="lplk-thumb-wrap ph-mode" role="img" aria-label="${esc(item.title)}"></div>`}
    <div class="lplk-content">
      <p class="lplk-title">${richSafe(item.title)}</p>
      ${item.desc ? `<p class="lplk-desc">${esc(item.desc)}</p>` : ''}
      <div class="lplk-price-group">
        <div class="lplk-price-row">
          <span class="lplk-brand-box">${esc(item.brandLabel)}</span>
          <span class="lplk-regular-price">${esc(item.regularPrice)}</span>
        </div>
        <div class="lplk-price-row">
          <span class="lplk-brand-box accent">${esc(item.discountBrandLabel)}</span>
          <span class="lplk-discount-price">${esc(item.discountPrice)}</span>
        </div>
      </div>
    </div>
  </div>`
    }).join('')

    // 대표 이미지 강등: URL 없으면 섹션 자체를 생략
    const hasHero = typeof d.heroImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.heroImage.trim())

    return `
<section class="lplk">
  <div class="lplk-hd">
    <p class="lplk-hd-top">${esc(d.headTop)}</p>
    <h2 class="lplk-hd-main">${richSafe(d.headMain)}</h2>
    ${d.headSub ? `<p class="lplk-hd-sub">${esc(d.headSub)}</p>` : ''}
  </div>
  ${hasHero ? `<div class="lplk-hero">${media(d.heroImage, '', '대표 제품 이미지')}</div>` : ''}
  <div class="lplk-cards">${cards}
  </div>
</section>`
  },
})
