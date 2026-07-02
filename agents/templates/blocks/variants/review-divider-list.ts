/** REVIEW 아키타입(템플릿 충실 재현): review-divider-list.
 *  와디즈 200섹션 06_고객리뷰 _624 패턴 재구성.
 *  부분 원형 이미지 블리드 + 뱃지·대제목 헤더 + 별점·텍스트 행·수평 구분선 미니멀 리스트 + 인정 카운트.
 *  기존 review-list(아바타 카드)와 달리 카드 없이 구분선만으로 리듬을 만드는 미니멀 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  image: z.string().optional(),            // 상단 반원 블리드 이미지 (원형)
  title: z.string().min(1),               // 예 "고객들의 극찬!" (em,br)
  subtitle: z.string().min(1).optional(), // 예 "고객들의 리뷰에 대해서 써주세요"
  reviews: z
    .array(
      z.object({
        rating: z.number().min(1).max(5).optional(), // 별점 개수 (기본 5)
        text: z.string().min(1),                      // 리뷰 본문 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),   // 마무리 인정 카운트 문구 (em,br)
})
type Data = z.infer<typeof schema>

const starN = (icon: (n: string) => string, n: number): string =>
  Array.from({ length: Math.max(1, Math.min(5, Math.round(n) || 5)) }, () => icon('star')).join('')

export const reviewDividerList = defineBlock<Data>({
  id: 'review-divider-list',
  archetype: 'review',
  styleTags: ['minimal', 'trust', 'template', 'light'],
  imageSlots: 1,
  describe:
    '고객 리뷰 미니멀 구분선 리스트. 반원 이미지 상단 블리드 + 대형 뱃지 제목 + 별점+텍스트 행·구분선 반복 + 인정 카운트 마무리. 카드 없이 구분선만 쓰는 가벼운 신뢰형.',
  schema,
  css: `
.rdl{background:var(--bg);color:var(--ink);overflow:hidden}
.rdl-hero{width:360px;height:180px;border-radius:180px 180px 0 0;object-fit:cover;display:block;margin:0 auto -1px}
.rdl-hero.ph{border-radius:180px 180px 0 0}
.rdl-body{padding:44px 52px 0}
.rdl-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:var(--accent);letter-spacing:-.02em;line-height:1.1;margin-bottom:10px}
.rdl-sub{font-size:15px;color:var(--ink-2);line-height:1.6;margin-bottom:32px}
.rdl-list{display:flex;flex-direction:column}
.rdl-row{padding:24px 0}
.rdl-row+.rdl-row{border-top:1px solid var(--line)}
.rdl-stars{display:inline-flex;gap:4px;color:var(--accent);margin-bottom:12px}
.rdl-stars svg{width:22px;height:22px}
.rdl-text{font-size:15px;color:var(--ink-2);line-height:1.7}
.rdl-text .em{color:var(--accent);font-weight:700}
.rdl-divider{height:1px;background:var(--accent);margin:36px 52px 0;opacity:.25}
.rdl-closer{padding:36px 52px 56px;font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--ink);line-height:1.35}
.rdl-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rdl">
  ${d.image
    ? media(d.image, 'rdl-hero', '리뷰 대표 이미지')
    : `<div class="rdl-hero ph">리뷰 이미지</div>`}
  <div class="rdl-body">
    <h2 class="rdl-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="rdl-sub">${esc(d.subtitle)}</p>` : ''}
    <div class="rdl-list">
      ${d.reviews
        .map(
          (r) => `
      <div class="rdl-row">
        <span class="rdl-stars">${starN(icon, r.rating ?? 5)}</span>
        <div class="rdl-text">${richSafe(r.text)}</div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
  <div class="rdl-divider"></div>
  ${d.closer ? `<div class="rdl-closer">${richSafe(d.closer)}</div>` : ''}
</section>`,
})
