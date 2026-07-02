/** LINEUP 아키타입: package-image-rows-strike-price.
 *  [끝판왕] 상품 구성 #2 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 브랜드 로고 필 배지 + accent 대제목(2줄) + 해시태그 서브 +
 *  단일 회색 컨테이너 안에서 점선으로 구분된 [좌측 고정 이미지 + 우측 레드 뱃지·제품명·취소선→화살표→판매가] 행 반복 +
 *  하단 accent CTA 버튼. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드 로고 텍스트 또는 이미지 URL — 문자면 pill 배지, URL이면 img */
  brandLogo: z.string().optional(),
  /** 대제목 첫 줄 (accent 강조, em 허용) */
  titleAccent: z.string().min(1),
  /** 대제목 둘째 줄 (ink 다크, em 허용) */
  titleDark: z.string().min(1),
  /** 해시태그 서브 카피 (예: #제품에 #어울리는 #해시태그) */
  hashtags: z.string().optional(),
  /** 상품 행 목록 (2~5개) */
  items: z
    .array(
      z.object({
        /** 상품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 강점 뱃지 라벨 (예: "해당 제품의 강점") */
        badge: z.string().optional(),
        /** 제품 이름 (em, br 허용) */
        name: z.string().min(1),
        /** 취소선 원래 가격 (예: "24,500") */
        originalPrice: z.string().optional(),
        /** 강조 판매가 (예: "14,900") */
        salePrice: z.string().min(1),
        /** 가격 단위 (기본 "원") */
        unit: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
  /** 하단 CTA 버튼 텍스트 (선택) */
  ctaText: z.string().optional(),
  /** CTA 버튼 URL (선택) */
  ctaUrl: z.string().optional(),
})

type Data = z.infer<typeof schema>

export const packageImageRowsStrikePrice = defineBlock<Data>({
  id: 'package-image-rows-strike-price',
  archetype: 'lineup',
  styleTags: ['commerce', 'price', 'lineup', 'strikethrough', 'template'],
  imageSlots: 3,
  describe:
    '상품 구성(라인업) 가격 강조. 브랜드 로고 배지 + accent 2줄 대제목 + 해시태그 서브 + 단일 회색 컨테이너 안 점선 구분 [좌측 정사각 이미지 + 강점 뱃지·제품명·취소선→화살표→판매가] 행 반복 + 하단 CTA. 커머스 할인 임팩트.',
  schema,
  css: `
/* package-image-rows-strike-price — 접두사 pirsp- */
.pirsp{background:var(--paper);padding:52px 32px 56px;word-break:keep-all;overflow-wrap:break-word}
.pirsp-logo-wrap{text-align:center;margin-bottom:22px}
.pirsp-logo-badge{display:inline-block;background:var(--ink);color:var(--paper);font-family:var(--font-body);font-weight:700;font-size:15px;letter-spacing:.04em;padding:7px 22px;border-radius:999px}
.pirsp-logo-img{height:34px;width:auto;display:inline-block;vertical-align:middle}
.pirsp-title-wrap{text-align:center;margin-bottom:14px}
.pirsp-title-accent{display:block;font-family:var(--font-display);font-weight:800;font-size:clamp(30px,8vw,44px);line-height:1.18;letter-spacing:-.02em;color:var(--accent)}
.pirsp-title-accent .em{color:var(--accent-d)}
.pirsp-title-dark{display:block;font-family:var(--font-display);font-weight:800;font-size:clamp(30px,8vw,44px);line-height:1.18;letter-spacing:-.02em;color:var(--ink)}
.pirsp-title-dark .em{color:var(--accent-d)}
.pirsp-hashtags{text-align:center;font-size:15px;color:var(--muted);letter-spacing:.01em;margin-bottom:32px}
/* 회색 컨테이너 */
.pirsp-box{background:#f0f0f0;border-radius:14px;padding:10px 20px 4px;margin-bottom:36px}
/* 각 상품 행 */
.pirsp-row{display:grid;grid-template-columns:100px 1fr;gap:20px;align-items:center;padding:22px 0}
.pirsp-row+.pirsp-row{border-top:1.5px dashed #c8c8c8}
/* 이미지 */
.pirsp-img{width:100px;height:100px;object-fit:cover;border-radius:8px;display:block;flex-shrink:0}
.pirsp-img.ph{width:100px;height:100px;border-radius:8px;border:2px dashed #c0c0c0;background:#e0e0e0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#aaa}
/* 우측 텍스트 영역 */
.pirsp-info{display:flex;flex-direction:column;gap:6px;min-width:0}
.pirsp-badge{display:inline-block;background:var(--accent);color:#fff;font-size:13px;font-weight:700;padding:4px 12px;border-radius:999px;letter-spacing:.02em;align-self:flex-start}
.pirsp-name{font-family:var(--font-display);font-weight:800;font-size:17px;line-height:1.4;color:var(--ink)}
.pirsp-name .em{color:var(--accent-d)}
/* 가격 행: 취소선 → 화살표 → 판매가 */
.pirsp-price-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px}
.pirsp-original{font-size:15px;color:#aaaaaa;text-decoration:line-through;font-weight:400;letter-spacing:.01em}
.pirsp-arrow{font-size:15px;color:#aaaaaa;line-height:1}
.pirsp-sale{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5.5vw,30px);letter-spacing:-.02em;color:var(--accent);line-height:1}
.pirsp-unit{font-size:15px;font-weight:600;color:var(--accent);letter-spacing:.01em;align-self:flex-end;padding-bottom:2px}
/* CTA 버튼 */
.pirsp-cta-wrap{text-align:center}
.pirsp-cta{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:16px;letter-spacing:.04em;padding:14px 36px;border-radius:8px;text-decoration:none;cursor:pointer}
`,
  render: (d, { esc, richSafe }) => {
    // 브랜드 로고: URL이면 img, 아니면 text badge
    const isUrl = (s: string) => /^https?:\/\//.test(s) || s.startsWith('/')
    const logoHtml = d.brandLogo
      ? isUrl(d.brandLogo)
        ? `<img class="pirsp-logo-img" src="${esc(d.brandLogo)}" alt="브랜드 로고">`
        : `<span class="pirsp-logo-badge">${esc(d.brandLogo)}</span>`
      : ''

    const rows = d.items
      .map((it) => {
        const unit = esc(it.unit ?? '원')
        return `
    <div class="pirsp-row">
      ${media(it.image, 'pirsp-img', esc(it.imageAlt ?? it.name))}
      <div class="pirsp-info">
        ${it.badge ? `<span class="pirsp-badge">${esc(it.badge)}</span>` : ''}
        <div class="pirsp-name">${richSafe(it.name)}</div>
        <div class="pirsp-price-row">
          ${it.originalPrice ? `<span class="pirsp-original">${esc(it.originalPrice)}</span><span class="pirsp-arrow">&#8594;</span>` : ''}
          <span class="pirsp-sale">${esc(it.salePrice)}</span>
          <span class="pirsp-unit">${unit}</span>
        </div>
      </div>
    </div>`
      })
      .join('')

    const ctaHtml = d.ctaText
      ? `<div class="pirsp-cta-wrap"><a class="pirsp-cta" href="${esc(d.ctaUrl ?? '#')}">${esc(d.ctaText)} &#9658;</a></div>`
      : ''

    return `
<section class="pirsp">
  ${logoHtml ? `<div class="pirsp-logo-wrap">${logoHtml}</div>` : ''}
  <div class="pirsp-title-wrap">
    <span class="pirsp-title-accent">${richSafe(d.titleAccent)}</span>
    <span class="pirsp-title-dark">${richSafe(d.titleDark)}</span>
  </div>
  ${d.hashtags ? `<p class="pirsp-hashtags">${esc(d.hashtags)}</p>` : ''}
  <div class="pirsp-box">${rows}
  </div>
  ${ctaHtml}
</section>`
  },
})
