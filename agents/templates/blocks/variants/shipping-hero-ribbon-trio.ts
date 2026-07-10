/** SHIPPING 아키타입: shipping-hero-ribbon-trio
 *  CS 구성 페이지_12 (860×1423) 흡수 재구성.
 *  오렌지 배경 대형 헤드라인 + 우측 택배 이미지 오버랩 + 수평 구분 리본 +
 *  3열 원형 번호뱃지×아이콘×설명 혜택 행 + 하단 다크 오렌지 CTA 바.
 *  이미지 없을 때 오버랩 프레임 생략(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const benefitSchema = z.object({
  num: z.string().min(1),          // 번호 표시 (예: "01")
  icon: z.string().optional(),     // 아이콘 이미지 url (optional)
  label: z.string().min(1),        // 혜택 라벨 (em 허용)
})

const schema = z.object({
  headline: z.string().min(1),     // 대형 제목 (em,br 허용) — 예: "제품명\n정기배송"
  subCopy: z.string().optional(),  // 헤드라인 아래 서브 카피
  productImage: z.string().optional(), // 우측 오버랩 이미지 (택배·제품 컷)
  benefits: z.array(benefitSchema).min(2).max(4),
  ctaText: z.string().min(1),      // CTA 바 링크 텍스트
})
type Data = z.infer<typeof schema>

export const shippingHeroRibbonTrio = defineBlock<Data>({
  id: 'shipping-hero-ribbon-trio',
  archetype: 'shipping',
  styleTags: ['light', 'warm', 'food', 'subscription', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '정기배송 전환 템플릿. 오렌지 배경 대형 헤드라인 + 우측 택배 이미지 오버랩 + 수평 리본 구분선 + 3열 원형 번호뱃지·아이콘·혜택 라벨 행 + 하단 다크 CTA 바. 구독 혜택 3가지를 번호+아이콘으로 정렬하는 정기배송 섹션에 최적. 이미지 부재 시 이미지 프레임 생략 강등.',
  schema,
  css: `
.svzy{position:relative;background:var(--accent);color:#fff;overflow:visible}

/* ── 히어로 존 ── */
.svzy-hero{position:relative;padding:56px var(--pad-x,56px) 0;min-height:280px}
.svzy-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(56px,8vw,96px);line-height:1.0;letter-spacing:-.02em;white-space:pre-line}
.svzy-headline .em{color:rgba(255,255,255,.75)}
.svzy-subcopy{margin-top:18px;font-size:clamp(16px,2vw,20px);font-weight:500;line-height:1.65;color:rgba(255,255,255,.9);max-width:min(480px,44%);word-break:keep-all}

/* 우측 이미지 오버랩 — 이미지 없을 때 .ph가 display:none!important로 강등됨 */
.svzy-img-wrap{position:absolute;right:calc(var(--pad-x,56px) * -0.3);top:-24px;width:min(55%,460px);pointer-events:none}
.svzy-img-wrap img,.svzy-img-wrap .ph{
  width:100%;
  aspect-ratio:5/3;
  object-fit:contain;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));
  filter:drop-shadow(0 16px 28px rgba(0,0,0,.22))
}

/* ── 구분 리본 ── */
.svzy-ribbon{margin:32px var(--pad-x,56px) 0;height:2px;background:rgba(0,0,0,.18);border-radius:999px}

/* ── 혜택 열 ── */
.svzy-benefits{display:flex;justify-content:center;gap:0;padding:28px var(--pad-x,56px) 36px}
.svzy-benefit{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;position:relative}
.svzy-benefit+.svzy-benefit::before{
  content:'';
  position:absolute;left:0;top:20%;height:60%;
  width:1px;background:rgba(255,255,255,.25)
}

/* 원형 번호 뱃지 */
.svzy-num{
  width:52px;height:52px;border-radius:50%;
  background:#fff;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:800;
  font-size:22px;color:var(--accent);
  flex-shrink:0
}

/* 아이콘 마스크 프레임 (원형 클리핑) */
.svzy-icon-wrap{
  width:88px;height:88px;min-height:88px;margin-top:12px;
  border-radius:50%;
  overflow:hidden;
  flex-shrink:0;
  background:rgba(255,255,255,.15)
}
.svzy-icon-wrap img,.svzy-icon-wrap .ph{
  display:block;width:100%;height:100%;object-fit:cover;border-radius:0
}

/* 라벨 */
.svzy-label{
  margin-top:14px;
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(14px,1.6vw,18px);line-height:1.45;
  color:#fff
}
.svzy-label .em{color:rgba(255,255,255,.8)}

/* ── 하단 CTA 바 ── */
.svzy-cta{
  background:var(--accent-d);
  padding:22px var(--pad-x,56px);
  display:flex;align-items:center;justify-content:center;
  gap:10px;
  cursor:pointer
}
.svzy-cta-text{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(17px,2vw,22px);
  color:#fff;letter-spacing:.01em
}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.productImage === 'string' && d.productImage.length > 0

    const benefitCols = d.benefits
      .map(
        (b, i) => `
      <div class="svzy-benefit">
        <div class="svzy-num">${esc(b.num || String(i + 1).padStart(2, '0'))}</div>
        <div class="svzy-icon-wrap">${media(b.icon, '', '혜택 아이콘')}</div>
        <div class="svzy-label">${richSafe(b.label)}</div>
      </div>`,
      )
      .join('')

    return `
<section class="svzy">
  <div class="svzy-hero">
    <h2 class="svzy-headline">${richSafe(d.headline)}</h2>
    ${d.subCopy ? `<p class="svzy-subcopy">${esc(d.subCopy)}</p>` : ''}
    ${hasImg ? `<div class="svzy-img-wrap">${media(d.productImage, '', '정기배송 제품')}</div>` : ''}
  </div>
  <div class="svzy-ribbon"></div>
  <div class="svzy-benefits">
    ${benefitCols}
  </div>
  <div class="svzy-cta">
    <span class="svzy-cta-text">${esc(d.ctaText)}</span>
  </div>
</section>`
  },
})
