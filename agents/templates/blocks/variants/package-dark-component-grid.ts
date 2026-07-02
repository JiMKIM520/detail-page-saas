/** LINEUP 아키타입: package-dark-component-grid.
 *  [끝판왕] 상품 구성 #26 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + 원형 페데스탈 스포트라이트 히어로(제품 1~2개) + 대제목/서브
 *  + 아이템별 소형 이미지 2열 그리드 카드. 럭셔리 다크 뷰티/케어 전형적 구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 대제목 (em 허용) */
  title: z.string().min(1),
  /** 섹션 서브카피 (선택) */
  subtitle: z.string().optional(),
  /** 페데스탈 위 히어로 제품 이미지 URL (1~2개) */
  heroImage: z.string().optional(),
  /** 히어로 이미지 alt */
  heroImageAlt: z.string().optional(),
  /** 구성 아이템 (2~8개, 2열 그리드) */
  items: z
    .array(
      z.object({
        /** 아이템 썸네일 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 아이템 제목 (em 허용) */
        heading: z.string().min(1),
        /** 아이템 설명 (선택, em 허용) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const packageDarkComponentGrid = defineBlock<Data>({
  id: 'package-dark-component-grid',
  archetype: 'lineup',
  styleTags: ['dark', 'luxury', 'beauty', 'care', 'grid', 'pedestal', 'template'],
  imageSlots: 5,
  describe:
    '상품 구성 — 다크 럭셔리. 다크 배경 + 원형 페데스탈 스포트라이트 히어로(제품 이미지) + 대제목/서브 + 아이템별 소형 이미지 2열 그리드 카드. 뷰티·케어·코스메틱 구성품 소개에 적합.',
  schema,
  css: `
/* package-dark-component-grid — 접두사 pdcg- */
.pdcg{background:var(--ink);color:#fff;padding:0 0 64px;text-align:center;word-break:keep-all;overflow-wrap:break-word}

/* ── 페데스탈 히어로 영역 ── */
.pdcg-stage{position:relative;width:100%;padding:56px 0 0;display:flex;flex-direction:column;align-items:center}
/* 스포트라이트 후광 — radial gradient 원 */
.pdcg-glow{position:absolute;top:30px;left:50%;transform:translateX(-50%);width:340px;height:340px;border-radius:50%;background:radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.13) 0%,rgba(255,255,255,.04) 50%,transparent 75%);pointer-events:none;z-index:0}
/* 원형 페데스탈 받침 */
.pdcg-pedestal{position:relative;z-index:1;width:260px;height:260px;border-radius:50%;background:radial-gradient(ellipse at 48% 60%,rgba(255,255,255,.11) 0%,rgba(180,180,180,.06) 45%,transparent 72%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px}
/* 페데스탈 하단 타원 그림자(무대 느낌) */
.pdcg-pedestal::after{content:'';position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:180px;height:22px;border-radius:50%;background:radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.12) 0%,transparent 70%)}
/* 히어로 제품 이미지 */
.pdcg-hero-img{position:relative;z-index:1;width:220px;height:220px;object-fit:contain;display:block}
.pdcg-hero-img.ph{width:220px;height:220px;border:2px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:rgba(255,255,255,.35);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px}

/* ── 텍스트 헤더 ── */
.pdcg-hd{padding:28px 48px 32px}
.pdcg-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.8vw,38px);line-height:1.25;letter-spacing:-.02em;color:#fff}
.pdcg-title .em{color:var(--accent)}
.pdcg-sub{margin-top:10px;font-family:var(--font-body);font-size:14px;line-height:1.6;color:rgba(255,255,255,.55)}

/* ── 2열 그리드 ── */
.pdcg-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 20px}
.pdcg-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:14px 14px 16px;display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:10px}
/* 카드 썸네일 */
.pdcg-thumb{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:6px;display:block}
.pdcg-thumb.ph{width:100%;aspect-ratio:1/1;border:1.5px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:rgba(255,255,255,.3);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px}
/* 카드 텍스트 */
.pdcg-card-body{width:100%}
.pdcg-card-h{font-family:var(--font-display);font-weight:700;font-size:clamp(13px,3.2vw,15px);line-height:1.4;color:#fff;letter-spacing:-.01em}
.pdcg-card-h .em{color:var(--accent)}
.pdcg-card-p{margin-top:5px;font-family:var(--font-body);font-size:12px;line-height:1.6;color:rgba(255,255,255,.52)}
.pdcg-card-p .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    const heroSlot = media(d.heroImage, 'pdcg-hero-img', esc(d.heroImageAlt ?? '제품 이미지'))

    const cards = d.items
      .map(
        (it) => `
    <div class="pdcg-card">
      ${media(it.image, 'pdcg-thumb', esc(it.imageAlt ?? it.heading))}
      <div class="pdcg-card-body">
        <div class="pdcg-card-h">${richSafe(it.heading)}</div>
        ${it.body ? `<div class="pdcg-card-p">${richSafe(it.body)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="pdcg">
  <div class="pdcg-stage">
    <div class="pdcg-glow"></div>
    <div class="pdcg-pedestal">
      ${heroSlot}
    </div>
  </div>
  <div class="pdcg-hd">
    <h2 class="pdcg-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="pdcg-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="pdcg-grid">
    ${cards}
  </div>
</section>`
  },
})
