/** PROMO 아키타입: point-discount-price-reveal.
 *  [끝판왕] 포인트 구성 #1 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + eyebrow/대형 헤드라인(아이콘 포함) + 풀폭 제품 이미지
 *  + 좌측 oversized 할인% 타이포 × 우측 가격 breakdown grid(정가취소선/이벤트가/최종가)
 *  + 하단 소형 혜택 배지 행. 커머스 임팩트 특가 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const priceRowSchema = z.object({
  /** 가격 행 라벨 (예: "3주년 특가", "최대 할인가") */
  label: z.string().min(1),
  /** 가격 값 문자열 (예: "119,600원") */
  value: z.string().min(1),
  /** 취소선 적용 여부 (정가 표시용) */
  strikethrough: z.boolean().optional(),
  /** 이 행을 강조 (이벤트/최종 가격) */
  highlight: z.boolean().optional(),
})

const badgeSchema = z.object({
  /** 배지 라벨 (예: "사전 적립금", "최대 할인가", "신규 가입 쿠폰") */
  label: z.string().min(1),
  /** 배지 값 (예: "2,000원") */
  value: z.string().min(1),
})

const schema = z.object({
  /** 소형 eyebrow 카피 (예: "3주년 기념 특별 할인!") */
  eyebrow: z.string().min(1).optional(),
  /** 대형 섹션 헤드라인 (em 허용) */
  title: z.string().min(1),
  /** 헤드라인 우측/인라인 아이콘 (ICONS 키 — 없으면 기본 bolt) */
  titleIcon: z.string().optional(),
  /** 제품 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 이미지 아래 보조 캡션 (브랜드 수상·인증 등 짧은 한 줄, em 허용) */
  caption: z.string().optional(),
  /** 좌측 oversized 할인 수치 (예: "60%", "50%") — 플레이스홀더 */
  discountLabel: z.string().min(1),
  /** 우측 가격 breakdown 행 (2~4개) */
  priceRows: z.array(priceRowSchema).min(2).max(4),
  /** 하단 소형 혜택 배지 행 (0~4개) */
  badges: z.array(badgeSchema).min(0).max(4).optional(),
})

type Data = z.infer<typeof schema>

export const pointDiscountPriceReveal = defineBlock<Data>({
  id: 'point-discount-price-reveal',
  archetype: 'promo',
  styleTags: ['dark', 'discount', 'price', 'impact', 'commerce', 'template'],
  imageSlots: 1,
  describe:
    '특가 할인 포인트 섹션. 다크 배경 + eyebrow + 대형 헤드라인(아이콘) + 풀폭 제품 이미지 + 캡션 + 좌측 oversized 할인%(60% 등) × 우측 가격 breakdown grid(정가취소선/이벤트가/최종가) + 하단 소형 혜택 배지 행. 커머스 임팩트 특가 섹션.',
  schema,
  css: `
/* point-discount-price-reveal — 접두사 pdpr- */
.pdpr{background:var(--ink);color:#fff;padding:52px 0 56px;word-break:keep-all}
/* ── 헤더 ── */
.pdpr-hd{text-align:center;padding:0 40px 32px}
.pdpr-eyebrow{font-family:var(--font-body);font-size:15px;font-weight:600;color:rgba(255,255,255,.62);letter-spacing:.04em;margin-bottom:10px}
.pdpr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,8.5vw,58px);line-height:1.14;letter-spacing:-.025em;color:#fff}
.pdpr-title .em{color:var(--accent)}
.pdpr-title-icon{display:inline-flex;vertical-align:middle;width:clamp(30px,7vw,48px);height:clamp(30px,7vw,48px);color:var(--accent);margin-left:6px;position:relative;top:-.06em}
.pdpr-title-icon svg{width:100%;height:100%}
/* ── 이미지 ── */
.pdpr-img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block}
.pdpr-img.ph{width:100%;aspect-ratio:3/2}
/* ── 캡션 ── */
.pdpr-caption{padding:14px 40px 0;font-family:var(--font-body);font-size:14px;line-height:1.65;color:rgba(255,255,255,.55);text-align:center}
.pdpr-caption .em{color:var(--accent);font-weight:700}
/* ── 가격 영역 — discount + breakdown grid ── */
.pdpr-price-zone{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:0;margin:28px 24px 0;background:rgba(255,255,255,.05);border-radius:calc(var(--r-scale,1)*16px);overflow:hidden}
/* 좌측: oversized 할인% */
.pdpr-pct{padding:28px 20px 28px 28px;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(255,255,255,.08)}
.pdpr-pct-num{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,13vw,88px);line-height:1;letter-spacing:-.04em;color:#ff4444;white-space:nowrap}
/* 우측: 가격 행 테이블 */
.pdpr-rows{padding:16px 20px;display:flex;flex-direction:column;gap:0}
.pdpr-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 0}
.pdpr-row+.pdpr-row{border-top:1px solid rgba(255,255,255,.07)}
.pdpr-row-label{font-family:var(--font-body);font-size:13px;color:rgba(255,255,255,.55);flex-shrink:0;white-space:nowrap}
.pdpr-row-value{font-family:var(--font-display);font-weight:700;font-size:16px;color:rgba(255,255,255,.75);white-space:nowrap}
.pdpr-row.strike .pdpr-row-value{text-decoration:line-through;color:rgba(255,255,255,.38);font-weight:400;font-size:14px}
.pdpr-row.hl .pdpr-row-label{color:rgba(255,255,255,.82);font-weight:700}
.pdpr-row.hl .pdpr-row-value{color:#fff;font-size:19px;font-weight:800}
/* ── 하단 배지 행 ── */
.pdpr-badges{display:grid;gap:10px;padding:16px 24px 0;grid-template-columns:repeat(auto-fit,minmax(80px,1fr))}
.pdpr-badge{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);border-radius:calc(var(--r-scale,1)*10px);padding:12px 8px;text-align:center}
.pdpr-badge-label{font-size:11px;color:rgba(255,255,255,.52);margin-bottom:4px;line-height:1.3}
.pdpr-badge-value{font-family:var(--font-display);font-weight:800;font-size:15px;color:#fff}
`,
  render: (d, { esc, richSafe, icon }) => {
    const titleIconName = d.titleIcon ?? 'bolt'
    const iconSvg = icon(titleIconName)

    const priceRows = d.priceRows
      .map((row) => {
        const cls = [
          'pdpr-row',
          row.strikethrough ? 'strike' : '',
          row.highlight ? 'hl' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return `<div class="${cls}">
        <span class="pdpr-row-label">${esc(row.label)}</span>
        <span class="pdpr-row-value">${esc(row.value)}</span>
      </div>`
      })
      .join('')

    const badges =
      d.badges && d.badges.length > 0
        ? `<div class="pdpr-badges">${d.badges
            .map(
              (b) =>
                `<div class="pdpr-badge">
            <div class="pdpr-badge-label">${esc(b.label)}</div>
            <div class="pdpr-badge-value">${esc(b.value)}</div>
          </div>`,
            )
            .join('')}</div>`
        : ''

    return `
<section class="pdpr">
  <div class="pdpr-hd">
    ${d.eyebrow ? `<p class="pdpr-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="pdpr-title">${richSafe(d.title)}<span class="pdpr-title-icon">${iconSvg}</span></h2>
  </div>
  ${media(d.image, 'pdpr-img', esc(d.imageAlt ?? '제품 이미지'))}
  ${d.caption ? `<p class="pdpr-caption">${richSafe(d.caption)}</p>` : ''}
  <div class="pdpr-price-zone">
    <div class="pdpr-pct">
      <span class="pdpr-pct-num">${esc(d.discountLabel)}</span>
    </div>
    <div class="pdpr-rows">${priceRows}</div>
  </div>
  ${badges}
</section>`
  },
})
