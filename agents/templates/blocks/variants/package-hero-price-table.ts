/** LINEUP 아키타입: package-hero-price-table.
 *  [끝판왕] 상품 구성 #25 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 공식몰 eyebrow + 대형 헤드라인 + 제품 그룹샷(복수 제품 플랫레이/연출) +
 *  3행 가격 투명성 테이블(신제품 특가/소비자가/판매가 병기) + 다크 CTA 스트립. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** eyebrow 라벨 (예: "공식몰 보증 &amp; 단독") */
  eyebrow: z.string().min(1).optional(),
  /** 섹션 대제목 (em 허용 — 제품명/특가 어절 강조) */
  title: z.string().min(1),
  /** 제품 그룹샷 이미지 URL (플랫레이 또는 연출 단체컷) */
  groupImage: z.string().optional(),
  /** 그룹샷 alt */
  groupImageAlt: z.string().optional(),
  /** 특가(강조) 가격 레이블 */
  specialLabel: z.string().min(1),
  /** 특가 가격 (예: "179,000원") */
  specialPrice: z.string().min(1),
  /** 소비자가 레이블 */
  listLabel: z.string().min(1).optional(),
  /** 소비자가 (예: "599,000원") — 취소선 표시 */
  listPrice: z.string().optional(),
  /** 판매가 레이블 */
  saleLabel: z.string().min(1).optional(),
  /** 판매가 (예: "399,000원") */
  salePrice: z.string().optional(),
  /** 하단 CTA 버튼 텍스트 (em 허용) */
  ctaText: z.string().min(1).optional(),
})
type Data = z.infer<typeof schema>

export const packageHeroPriceTable = defineBlock<Data>({
  id: 'package-hero-price-table',
  archetype: 'lineup',
  styleTags: ['price', 'package', 'commerce', 'group-shot', 'template'],
  imageSlots: 1,
  describe:
    '상품 구성 패키지 히어로. eyebrow(공식몰 보증) + 대형 헤드라인 + 제품 그룹샷(플랫레이/연출) + 3행 가격 투명성 테이블(신제품 특가/소비자가/판매가 병기) + 다크 CTA 스트립. 뷰티/스킨케어 패키지 구성 소개에 적합.',
  schema,
  css: `
/* package-hero-price-table — 접두사 phpt- */
.phpt{background:var(--paper);padding:48px 40px 0;text-align:center;word-break:keep-all;overflow-wrap:break-word}
.phpt-eyebrow{font-family:var(--font-body);font-size:13px;font-weight:500;color:var(--muted);letter-spacing:.06em;margin-bottom:10px}
.phpt-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,6.2vw,38px);line-height:1.2;letter-spacing:-.02em;color:var(--ink);margin-bottom:30px}
.phpt-title .em{color:var(--accent-d)}
.phpt-img{width:100%;aspect-ratio:3/2;object-fit:contain;display:block;margin-bottom:0}
.phpt-img.ph{width:100%;aspect-ratio:3/2;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.035);border:2px dashed var(--line);color:var(--muted);font-size:13px;margin-bottom:0}
/* 가격 테이블 */
.phpt-table{width:100%;border-collapse:collapse;margin-top:0}
.phpt-table tr{display:grid;grid-template-columns:1fr auto;align-items:center;padding:14px 0;border-top:1px solid var(--line)}
.phpt-table tr:first-child{border-top:2px solid var(--line)}
.phpt-label{font-family:var(--font-body);font-size:14px;font-weight:500;color:var(--muted);text-align:left}
.phpt-price{font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--ink);text-align:right;white-space:nowrap}
/* 특가 행 — 커머스 위험/강조 신호색 */
.phpt-row-special .phpt-label{font-size:13px;font-weight:600;color:#555}
.phpt-row-special .phpt-price{font-size:clamp(22px,5.2vw,30px);color:#e03e2d;letter-spacing:-.01em}
/* 소비자가 행 — 취소선 */
.phpt-row-list .phpt-label{color:var(--muted)}
.phpt-row-list .phpt-price{color:var(--muted);text-decoration:line-through;font-weight:500;font-size:14px}
/* 판매가 행 */
.phpt-row-sale .phpt-label{color:var(--ink);font-weight:600}
.phpt-row-sale .phpt-price{color:var(--ink);font-size:16px}
/* CTA 스트립 */
.phpt-cta{display:block;width:calc(100% + 80px);margin-left:-40px;background:var(--ink);color:#fff;font-family:var(--font-body);font-size:15px;font-weight:700;text-align:center;padding:18px 24px;letter-spacing:.02em;border:none;cursor:pointer;margin-top:20px;text-decoration:none;word-break:keep-all}
.phpt-cta .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const listRow =
      d.listPrice
        ? `<tr class="phpt-row-list">
        <td class="phpt-label">${esc(d.listLabel ?? '소비자가')}</td>
        <td class="phpt-price">${esc(d.listPrice)}</td>
      </tr>`
        : ''

    const saleRow =
      d.salePrice
        ? `<tr class="phpt-row-sale">
        <td class="phpt-label">${esc(d.saleLabel ?? '판매가')}</td>
        <td class="phpt-price">${esc(d.salePrice)}</td>
      </tr>`
        : ''

    const ctaStrip =
      d.ctaText
        ? `<div class="phpt-cta">${richSafe(d.ctaText)}</div>`
        : ''

    return `
<section class="phpt">
  ${d.eyebrow ? `<p class="phpt-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  <h2 class="phpt-title">${richSafe(d.title)}</h2>
  ${media(d.groupImage, 'phpt-img', esc(d.groupImageAlt ?? '제품 구성 이미지'))}
  <table class="phpt-table" role="presentation">
    <tr class="phpt-row-special">
      <td class="phpt-label">${esc(d.specialLabel)}</td>
      <td class="phpt-price">${esc(d.specialPrice)}</td>
    </tr>
    ${listRow}
    ${saleRow}
  </table>
  ${ctaStrip}
</section>`
  },
})
