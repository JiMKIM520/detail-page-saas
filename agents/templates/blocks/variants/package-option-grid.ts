/** PROMO 아키타입: package-option-grid.
 *  [끝판왕] 상품 구성 #8 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: accent 솔리드 헤더(eyebrow + 대제목 + 하향 쐐기) → 2×2 카드 그리드.
 *  카드 구조: 상단 이미지(~60%) + 좌하 옵션 번호 배지 + 상품명/설명 + 가격행(원형 할인율·취소선 원가·화살표·최종가). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** eyebrow 문구 (예: "여기에서만 단독 세일!") */
  eyebrow: z.string().min(1).optional(),
  /** 섹션 대제목 (em 허용) */
  title: z.string().min(1),
  /** 옵션 카드 목록 (2~4개, 2×2 그리드) */
  options: z
    .array(
      z.object({
        /** 옵션 번호 라벨 (예: "옵션 1") */
        optionLabel: z.string().min(1),
        /** 카드 상단 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 상품명 (em 허용) */
        name: z.string().min(1),
        /** 보조 설명 (선택) */
        desc: z.string().optional(),
        /** 할인율 표시 문자열 (예: "39%") */
        discountRate: z.string().min(1),
        /** 취소선 원가 (예: "89,000원") */
        originalPrice: z.string().min(1),
        /** 최종 판매가 (예: "49,000원") */
        finalPrice: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageOptionGrid = defineBlock<Data>({
  id: 'package-option-grid',
  archetype: 'promo',
  styleTags: ['commerce', 'grid', 'pricing', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성/패키지 옵션 그리드. accent 솔리드 헤더(eyebrow+대제목+하향 쐐기) + 2×2 카드 그리드(이미지 상단+옵션 번호 배지+상품명/설명+가격행[원형 할인율·취소선 원가·화살표·최종가]). 커머스 단독 세일·패키지 구성 소개에 최적.',
  schema,
  css: `
/* package-option-grid — 접두사 pog- */
.pog{background:var(--bg);word-break:keep-all;overflow-wrap:break-word}

/* ── 헤더 (accent 솔리드 배경) ── */
.pog-hd{background:var(--accent);padding:36px 32px 0;text-align:center;position:relative}
.pog-eyebrow{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px}
.pog-eyebrow-line{flex:1;height:1.5px;background:rgba(255,255,255,.55);max-width:60px}
.pog-eyebrow-text{font-family:var(--font-body);font-size:13px;font-weight:700;color:#fff;letter-spacing:.06em;white-space:nowrap}
.pog-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,6vw,36px);color:#fff;letter-spacing:-.02em;line-height:1.18;padding-bottom:28px}
.pog-title .em{color:rgba(255,255,255,.82)}

/* 하향 쐐기(V 모양 구분자) */
.pog-chevron{width:100%;overflow:hidden;line-height:0;margin-top:-1px}
.pog-chevron svg{display:block;width:100%;height:28px}

/* ── 그리드 ── */
.pog-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px 12px 32px}

/* ── 카드 ── */
.pog-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*10px);overflow:hidden;box-shadow:0 6px 20px -8px rgba(0,0,0,.22);display:flex;flex-direction:column}

/* 카드 이미지 영역 (상단 ~60%) */
.pog-card-img{width:100%;aspect-ratio:4/3.2;object-fit:cover;display:block;position:relative}
.pog-card-img.ph{aspect-ratio:4/3.2;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.07);border:none;font-size:12px;color:var(--muted);text-align:center;line-height:1.5;padding:8px}

/* 옵션 번호 배지 — 이미지 좌하단에 겹침 */
.pog-card-fig{position:relative;flex-shrink:0}
.pog-opt-badge{position:absolute;bottom:0;left:0;background:var(--accent);color:#fff;font-family:var(--font-body);font-size:11px;font-weight:800;padding:4px 10px;border-radius:0 calc(var(--r-scale,1)*6px) 0 0;letter-spacing:.04em;line-height:1.3}

/* 카드 본문 */
.pog-card-body{padding:12px 12px 0;flex:1;display:flex;flex-direction:column;gap:4px}
.pog-card-name{font-family:var(--font-display);font-weight:800;font-size:clamp(13px,3.2vw,15px);color:var(--ink);text-align:center;line-height:1.3}
.pog-card-name .em{color:var(--accent-d)}
.pog-card-desc{font-family:var(--font-body);font-size:11px;color:var(--muted);text-align:center;line-height:1.5}

/* 가격행 */
.pog-price-row{display:flex;align-items:center;gap:5px;padding:10px 10px 12px;flex-wrap:nowrap;min-width:0}
.pog-discount-badge{flex-shrink:0;width:36px;height:36px;border-radius:50%;border:1.5px solid var(--accent-d);background:var(--paper);display:flex;align-items:center;justify-content:center;font-family:var(--font-body);font-size:10px;font-weight:800;color:var(--accent-d);line-height:1;text-align:center}
.pog-orig-price{font-family:var(--font-body);font-size:10px;color:var(--muted);text-decoration:line-through;white-space:nowrap;flex-shrink:0}
.pog-arrow{flex-shrink:0;color:var(--muted);font-size:11px;line-height:1}
.pog-final-price{font-family:var(--font-display);font-weight:800;font-size:clamp(13px,3.6vw,17px);color:var(--ink);white-space:nowrap;flex:1;text-align:right}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.options
      .map(
        (opt) => `
    <div class="pog-card">
      <div class="pog-card-fig">
        ${media(opt.image, 'pog-card-img', esc(opt.imageAlt ?? '상품 이미지'))}
        <span class="pog-opt-badge">${esc(opt.optionLabel)}</span>
      </div>
      <div class="pog-card-body">
        <p class="pog-card-name">${richSafe(opt.name)}</p>
        ${opt.desc ? `<p class="pog-card-desc">${esc(opt.desc)}</p>` : ''}
      </div>
      <div class="pog-price-row">
        <span class="pog-discount-badge">${esc(opt.discountRate)}</span>
        <span class="pog-orig-price">${esc(opt.originalPrice)}</span>
        <span class="pog-arrow">&#8594;</span>
        <span class="pog-final-price">${esc(opt.finalPrice)}</span>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="pog">
  <div class="pog-hd">
    ${
      d.eyebrow
        ? `<div class="pog-eyebrow">
      <span class="pog-eyebrow-line"></span>
      <span class="pog-eyebrow-text">${esc(d.eyebrow)}</span>
      <span class="pog-eyebrow-line"></span>
    </div>`
        : ''
    }
    <h2 class="pog-title">${richSafe(d.title)}</h2>
  </div>
  <div class="pog-chevron">
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,0 100,0 50,28" fill="var(--accent)"/>
    </svg>
  </div>
  <div class="pog-grid">
    ${cards}
  </div>
</section>`
  },
})
