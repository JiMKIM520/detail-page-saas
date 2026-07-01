/** POINT 아키타입: point-ingredient-overlay.
 *  [끝판왕] 포인트 구성 #25 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 제품 이미지를 캔버스 삼아 성분·기능 필 태그를 좌우에 부유 배치.
 *  연결선 없이 위치만으로 제품과의 연관성 암시.
 *  태그 내부: +아이콘 · 카테고리(eyebrow) · 성분명(bold) 3-tier 수직 스택.
 *  primary 태그(filled accent) vs secondary 태그(outline muted) 두 레벨. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 개별 성분·기능 태그 */
const tagSchema = z.object({
  /** 카테고리 라벨 (eyebrow, 예: "진정" / "자외선 차단") */
  category: z.string().min(1),
  /** 성분명 또는 기능명 (bold 큰 텍스트, 예: "병풀추출물" / "UV Filter") */
  name: z.string().min(1),
  /** filled accent 태그(primary) vs outline 태그(secondary). 기본 primary */
  variant: z.enum(['primary', 'secondary']).optional(),
  /** 좌측(left) 또는 우측(right) 배치. AI가 좌우 균형 고려해 배분 */
  side: z.enum(['left', 'right']),
})

const schema = z.object({
  /** 섹션 헤드라인 (em 허용 — 일부 어절 accent 강조) */
  headline: z.string().min(1),
  /** 헤드라인 서브카피 (예: "SPF50+ PA++++") */
  subline: z.string().optional(),
  /** 우상단 브랜드/인증 라벨 (예: "본인 브랜드") */
  brandLabel: z.string().optional(),
  /** 제품 이미지 URL */
  productImage: z.string().optional(),
  /** 제품 이미지 alt */
  productImageAlt: z.string().optional(),
  /** 부유 성분·기능 태그 (3~8개) */
  tags: z.array(tagSchema).min(3).max(8),
  /** 하단 면책 주석 (예: "* 원료적 특성에 한함") */
  disclaimer: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointIngredientOverlay = defineBlock<Data>({
  id: 'point-ingredient-overlay',
  archetype: 'point' as any,
  styleTags: ['ingredient', 'overlay', 'floating-tag', 'beauty', 'product-canvas', 'template'],
  imageSlots: 1,
  describe:
    '성분 오버레이 포인트. 제품 이미지를 캔버스 삼아 성분·기능 필 태그를 좌우에 연결선 없이 부유 배치. 태그 내부: +아이콘·카테고리(eyebrow)·성분명 3-tier 수직 스택. primary(accent 채움)와 secondary(아웃라인) 두 레벨. 뷰티·스킨케어 성분 강조에 적합.',
  schema,
  css: `
/* point-ingredient-overlay — 접두사 pio- */
.pio{background:var(--paper);padding:0;overflow:hidden;word-break:keep-all}
.pio-top{display:flex;justify-content:space-between;align-items:flex-start;padding:28px 32px 0}
.pio-headline-wrap{flex:1;padding-right:16px}
.pio-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,4.8vw,30px);color:var(--ink);line-height:1.36;letter-spacing:-.02em}
.pio-headline .em{color:var(--accent-d)}
.pio-subline{margin-top:6px;font-family:var(--font-body);font-size:14px;color:var(--muted);letter-spacing:.01em}
.pio-brand{flex-shrink:0;text-align:right;font-family:var(--font-body);font-size:13px;color:var(--muted);line-height:1.5;border-left:1px solid var(--line);padding-left:18px}
/* 제품 이미지 캔버스 + 오버레이 태그 래퍼 */
.pio-canvas{position:relative;margin:24px 0 0;width:100%;aspect-ratio:3/4;max-height:620px;overflow:visible}
.pio-product{width:100%;height:100%;object-fit:contain;display:block}
.pio-product.ph{width:100%;height:100%;border:none;background:rgba(0,0,0,.04)}
/* 좌우 태그 컬럼 — absolute로 product 이미지 좌우에 배치 */
.pio-tags-left{position:absolute;left:0;top:0;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:14px;padding:20px 0 20px 14px;pointer-events:none}
.pio-tags-right{position:absolute;right:0;top:0;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;gap:14px;padding:20px 14px 20px 0;pointer-events:none}
/* 개별 태그 — primary(accent 채움) */
.pio-tag{display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:10px 16px 12px;border-radius:999px;min-width:80px;text-align:center}
.pio-tag.primary{background:var(--accent);color:#fff}
.pio-tag.primary .pio-tag-icon{color:#fff}
.pio-tag.primary .pio-tag-cat{color:rgba(255,255,255,.82)}
.pio-tag.primary .pio-tag-name{color:#fff}
/* secondary(아웃라인, paper 배경) */
.pio-tag.secondary{background:var(--paper);border:1.5px solid var(--line);color:var(--ink)}
.pio-tag.secondary .pio-tag-icon{color:var(--accent-d)}
.pio-tag.secondary .pio-tag-cat{color:var(--muted)}
.pio-tag.secondary .pio-tag-name{color:var(--ink)}
/* 태그 내부 3-tier */
.pio-tag-icon{font-size:16px;font-weight:800;line-height:1;margin-bottom:1px}
.pio-tag-cat{font-family:var(--font-body);font-size:11px;font-weight:500;line-height:1.3;letter-spacing:.02em}
.pio-tag-name{font-family:var(--font-display);font-size:15px;font-weight:800;line-height:1.2;letter-spacing:-.01em}
/* 면책 주석 */
.pio-disclaimer{padding:14px 32px 26px;font-family:var(--font-body);font-size:12px;color:var(--muted);line-height:1.6}
`,
  render: (d, { esc, richSafe }) => {
    const leftTags = d.tags.filter((t) => t.side === 'left')
    const rightTags = d.tags.filter((t) => t.side === 'right')

    const renderTag = (t: (typeof d.tags)[number]): string => {
      const v = t.variant ?? 'primary'
      return `<div class="pio-tag ${v}">
  <span class="pio-tag-icon">+</span>
  <span class="pio-tag-cat">${esc(t.category)}</span>
  <span class="pio-tag-name">${esc(t.name)}</span>
</div>`
    }

    const leftHtml = leftTags.map(renderTag).join('\n      ')
    const rightHtml = rightTags.map(renderTag).join('\n      ')

    return `
<section class="pio">
  <div class="pio-top">
    <div class="pio-headline-wrap">
      <h2 class="pio-headline">${richSafe(d.headline)}</h2>
      ${d.subline ? `<p class="pio-subline">${esc(d.subline)}</p>` : ''}
    </div>
    ${d.brandLabel ? `<div class="pio-brand">${esc(d.brandLabel)}</div>` : ''}
  </div>
  <div class="pio-canvas">
    ${media(d.productImage, 'pio-product', esc(d.productImageAlt ?? '제품 이미지'))}
    ${leftTags.length > 0 ? `<div class="pio-tags-left">\n      ${leftHtml}\n    </div>` : ''}
    ${rightTags.length > 0 ? `<div class="pio-tags-right">\n      ${rightHtml}\n    </div>` : ''}
  </div>
  ${d.disclaimer ? `<p class="pio-disclaimer">${esc(d.disclaimer)}</p>` : ''}
</section>`
  },
})
