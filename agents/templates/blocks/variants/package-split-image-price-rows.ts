/** LINEUP 아키타입: package-split-image-price-rows.
 *  [끝판왕] 상품구성 #3 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 브랜드 헤더(로고+대제목+서브) + [좌텍스트-우이미지 수평 분할 카드] 반복 +
 *  우측 플로팅 원형 할인율 배지 + 이중 가격행(취소선 정상가 / 볼드 최대혜택가). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 다크 헤더 브랜드 로고 텍스트 (선택) */
  brandLabel: z.string().optional(),
  /** 섹션 대제목 (em 허용 — 일부 어절 accent 강조) */
  title: z.string().min(1),
  /** 헤더 서브카피 (선택) */
  subtitle: z.string().optional(),
  /** 상품 구성 카드 (1~4개) */
  items: z
    .array(
      z.object({
        /** 상품명 (em 허용) */
        name: z.string().min(1),
        /** 상품 설명 본문 (em/br 허용, 선택) */
        desc: z.string().optional(),
        /** 정상가 라벨 (기본 "정상가") */
        regularLabel: z.string().optional(),
        /** 취소선 정상가 (예: "499,999원") */
        regularPrice: z.string().min(1),
        /** 최대혜택가 라벨 (기본 "최대혜택가") */
        benefitLabel: z.string().optional(),
        /** 볼드 최대혜택가 (예: "399,999원") */
        benefitPrice: z.string().min(1),
        /** 할인율 배지 숫자 (예: "39" → "39%"). 없으면 배지 숨김 */
        discountRate: z.string().optional(),
        /** 상품 이미지 URL (선택) */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(1)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageSplitImagePriceRows = defineBlock<Data>({
  id: 'package-split-image-price-rows',
  archetype: 'lineup',
  styleTags: ['dark-header', 'commerce', 'price', 'package', 'split', 'template'],
  imageSlots: 2,
  describe:
    '상품구성(가격표). 다크 브랜드 헤더(로고+대제목+서브) + [좌텍스트(상품명/설명/이중가격행)-우이미지+플로팅 원형 할인배지] 수평 분할 카드 1~4개 반복. 취소선 정상가 + 볼드 최대혜택가.',
  schema,
  css: `
/* package-split-image-price-rows — 접두사 psipr- */
.psipr{background:var(--bg);word-break:keep-all;overflow-wrap:break-word}
/* ── 다크 헤더 ── */
.psipr-hd{background:var(--brand);padding:40px 32px 44px;text-align:center}
.psipr-brand-lbl{display:inline-block;font-family:var(--font-body);font-size:13px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.55);text-transform:uppercase;margin-bottom:18px;border:1px solid rgba(255,255,255,.22);padding:4px 14px;border-radius:999px}
.psipr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,7.5vw,52px);line-height:1.18;letter-spacing:-.02em;color:#fff;margin-bottom:10px}
.psipr-title .em{color:var(--accent)}
.psipr-sub{font-family:var(--font-body);font-size:15px;line-height:1.6;color:rgba(255,255,255,.62)}
/* ── 카드 목록 ── */
.psipr-list{display:flex;flex-direction:column;gap:0;padding:28px 20px 32px}
/* ── 개별 카드 ── */
.psipr-card{position:relative;display:grid;grid-template-columns:1fr auto;align-items:stretch;background:var(--paper);border-radius:16px;overflow:visible;box-shadow:0 6px 24px -8px rgba(0,0,0,.18);margin-bottom:18px}
.psipr-card:last-child{margin-bottom:0}
/* ── 카드 — 좌텍스트 영역 ── */
.psipr-txt{padding:22px 16px 22px 22px;display:flex;flex-direction:column;justify-content:center;gap:0;overflow:hidden}
.psipr-name{font-family:var(--font-display);font-weight:800;font-size:clamp(17px,4vw,22px);line-height:1.3;letter-spacing:-.01em;color:var(--ink);margin-bottom:8px}
.psipr-name .em{color:var(--accent-d)}
.psipr-desc{font-family:var(--font-body);font-size:13px;line-height:1.65;color:var(--muted);margin-bottom:14px}
.psipr-desc .em{color:var(--accent-d);font-weight:700}
/* ── 가격 테이블 ── */
.psipr-prices{display:grid;grid-template-columns:auto 1fr;row-gap:4px;column-gap:10px;align-items:baseline}
.psipr-lbl-reg{font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--muted);white-space:nowrap}
.psipr-price-reg{font-size:13px;color:var(--muted);text-decoration:line-through;white-space:nowrap}
.psipr-lbl-best{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--accent-d);white-space:nowrap}
.psipr-price-best{font-family:var(--font-display);font-weight:800;font-size:clamp(18px,4.2vw,24px);color:var(--ink);letter-spacing:-.02em;white-space:nowrap}
/* ── 카드 — 우이미지 영역 ── */
.psipr-img-wrap{position:relative;width:140px;flex-shrink:0;border-radius:0 16px 16px 0;overflow:hidden}
.psipr-img{width:140px;height:100%;min-height:160px;object-fit:cover;display:block}
.psipr-img.ph{width:140px;min-height:160px;height:100%;border-radius:0 16px 16px 0}
/* ── 플로팅 원형 할인 배지 ── */
.psipr-badge{position:absolute;top:50%;right:-18px;transform:translateY(-50%);width:54px;height:54px;border-radius:50%;background:var(--accent);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 12px -3px rgba(0,0,0,.28);z-index:10;gap:0;line-height:1}
.psipr-badge-num{font-family:var(--font-display);font-weight:800;font-size:17px;color:#fff;letter-spacing:-.02em}
.psipr-badge-pct{font-size:10px;font-weight:700;color:rgba(255,255,255,.85);letter-spacing:.02em;margin-top:-1px}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.items
      .map((it) => {
        const regLabel = esc(it.regularLabel ?? '정상가')
        const bestLabel = esc(it.benefitLabel ?? '최대혜택가')
        const badge = it.discountRate
          ? `<div class="psipr-badge">
          <span class="psipr-badge-num">${esc(it.discountRate)}</span>
          <span class="psipr-badge-pct">%</span>
        </div>`
          : ''
        return `
  <div class="psipr-card">
    <div class="psipr-txt">
      <h3 class="psipr-name">${richSafe(it.name)}</h3>
      ${it.desc ? `<p class="psipr-desc">${richSafe(it.desc)}</p>` : ''}
      <div class="psipr-prices">
        <span class="psipr-lbl-reg">${regLabel}</span>
        <span class="psipr-price-reg">${esc(it.regularPrice)}</span>
        <span class="psipr-lbl-best">${bestLabel}</span>
        <span class="psipr-price-best">${esc(it.benefitPrice)}</span>
      </div>
    </div>
    <div class="psipr-img-wrap">
      ${media(it.image, 'psipr-img', esc(it.imageAlt ?? it.name))}
    </div>
    ${badge}
  </div>`
      })
      .join('')

    return `
<section class="psipr">
  <div class="psipr-hd">
    ${d.brandLabel ? `<div class="psipr-brand-lbl">${esc(d.brandLabel)}</div>` : ''}
    <h2 class="psipr-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="psipr-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="psipr-list">
    ${cards}
  </div>
</section>`
  },
})
