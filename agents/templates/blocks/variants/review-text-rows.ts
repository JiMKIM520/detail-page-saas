/** REVIEW 아키타입(템플릿 충실 재현): review-text-rows.
 *  와디즈 200섹션 06_고객리뷰 _트로피 어워드 텍스트 행 패턴 재구성.
 *  다크 방사 배경 + 트로피 제품 이미지 + 대형 제목 + 카드 없는 텍스트 행 4개 + 대형 따옴표 stat. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  productImage: z.string().optional(),             // 트로피/시상대 씬 제품 이미지 (url)
  title: z.string().min(1),                        // 예 "고객들의 극찬!" (em,br)
  subtitle: z.string().min(1).optional(),          // 서브 안내 텍스트
  rows: z
    .array(
      z.object({
        line1: z.string().min(1),                  // 첫 번째 줄 (em,br)
        line2: z.string().min(1).optional(),       // 두 번째 줄 (em,br)
      }),
    )
    .min(2)
    .max(4),
  statQuote: z.string().min(1).optional(),         // 대형 따옴표 뒤 인정 문구 (em,br)
})
type Data = z.infer<typeof schema>

export const reviewTextRows = defineBlock<Data>({
  id: 'review-text-rows',
  archetype: 'review' as any,
  styleTags: ['premium', 'dark', 'trust', 'award', 'template'],
  imageSlots: 1,
  describe:
    '고객 리뷰(트로피 텍스트 행). 다크 방사 배경 + 중앙 제품 이미지(트로피/시상대) + 대형 제목 + 카드 없는 텍스트 pill 행 2~4개 + 대형 따옴표+인정 stat. 어워드 신뢰형.',
  schema,
  css: `
.rtr{
  background:var(--ink);
  color:#fff;
  padding:0 0 60px;
  text-align:center;
  position:relative;
  overflow:hidden;
}
.rtr::before{
  content:"";
  position:absolute;
  top:-60px;left:50%;
  transform:translateX(-50%);
  width:680px;height:600px;
  background:radial-gradient(ellipse at 50% 30%,color-mix(in srgb,var(--accent) 22%,transparent) 0%,transparent 70%);
  pointer-events:none;
}
.rtr-img-wrap{
  position:relative;
  z-index:1;
  padding:52px 80px 24px;
}
.rtr-img{
  width:260px;
  height:340px;
  object-fit:cover;
  display:block;
  margin:0 auto;
  border-radius:6px;
}
.rtr-hd{
  position:relative;
  z-index:1;
  padding:0 40px 32px;
}
.rtr-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:52px;
  color:#fff;
  letter-spacing:-.02em;
  line-height:1.1;
}
.rtr-title .em{color:var(--accent)}
.rtr-sub{
  margin-top:12px;
  font-size:15px;
  color:rgba(255,255,255,.6);
  line-height:1.6;
}
.rtr-rows{
  display:flex;
  flex-direction:column;
  gap:12px;
  padding:0 40px;
  position:relative;
  z-index:1;
}
.rtr-row{
  background:rgba(255,255,255,.07);
  border-radius:14px;
  padding:18px 28px;
  text-align:center;
}
.rtr-row-l1{
  font-size:17px;
  font-weight:600;
  color:#fff;
  line-height:1.5;
}
.rtr-row-l1 .em{color:var(--accent)}
.rtr-row-l2{
  margin-top:4px;
  font-size:15px;
  color:rgba(255,255,255,.6);
  line-height:1.5;
}
.rtr-row-l2 .em{color:var(--accent)}
.rtr-stat{
  position:relative;
  z-index:1;
  margin-top:44px;
  padding:0 32px;
  text-align:left;
}
.rtr-quote{
  font-family:var(--font-display);
  font-size:80px;
  line-height:.7;
  color:var(--accent);
  display:block;
  margin-bottom:10px;
  opacity:.9;
}
.rtr-stat-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:38px;
  color:#fff;
  line-height:1.3;
}
.rtr-stat-text .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="rtr">
  <div class="rtr-img-wrap">
    ${media(d.productImage, 'rtr-img', '제품 이미지')}
  </div>
  <div class="rtr-hd">
    <h2 class="rtr-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="rtr-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="rtr-rows">
    ${d.rows
      .map(
        (r) => `
    <div class="rtr-row">
      <div class="rtr-row-l1">${richSafe(r.line1)}</div>
      ${r.line2 ? `<div class="rtr-row-l2">${richSafe(r.line2)}</div>` : ''}
    </div>`,
      )
      .join('')}
  </div>
  ${d.statQuote ? `
  <div class="rtr-stat">
    <span class="rtr-quote">"</span>
    <div class="rtr-stat-text">${richSafe(d.statQuote)}</div>
  </div>` : ''}
</section>`,
})
