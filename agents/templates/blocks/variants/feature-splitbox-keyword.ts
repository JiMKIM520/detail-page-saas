/** FEATURE 아키타입: feature-splitbox-keyword
 *  피그마 087_문제해결_03 흡수.
 *  구조: 라이트 회색 배경 + 대형 중앙 헤드라인 + 2행 분할 키워드 타이포(좌 채움/우 윤곽) + 설명 텍스트 + 전폭 제품 이미지.
 *  핵심 장치: 같은 행 안에서 앞 단어는 짙은 남색 박스로 채우고 뒷 단어는 윤곽선만 — 필/아웃라인 대비로 시선 흡인.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const keywordRowSchema = z.object({
  filled: z.string().min(1),   // 채움(솔리드) 박스 단어
  outline: z.string().min(1),  // 윤곽선(아웃라인) 박스 단어
})

const schema = z.object({
  heading: z.string().min(1),                              // (em,br) 대형 헤드라인
  rows: z.array(keywordRowSchema).min(1).max(3),           // 분할 키워드 행 (권장 2행)
  desc: z.string().optional(),                             // (em,br) 설명 텍스트
  image: z.string().optional(),                            // (url) 전폭 제품 이미지
})

type Data = z.infer<typeof schema>

export const featureSplitboxKeyword = defineBlock<Data>({
  id: 'feature-splitbox-keyword',
  archetype: 'feature',
  styleTags: ['light', 'editorial', 'bold', 'product', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '라이트 회색 배경 + 대형 중앙 헤드라인 + 좌채움/우윤곽 2단 키워드 타이포 + 설명 + 전폭 제품 이미지. 합리적인 가격·강력한 성능처럼 두 속성을 한 행씩 대비로 강조할 때. 이미지 없어도 붕괴하지 않음(noimg-safe).',
  schema,
  css: `
.ffye{background:#ededed;padding:72px var(--pad-x,56px) 0;text-align:center;color:var(--brand,#020846)}
.ffye-heading{font-family:var(--font-display);font-size:clamp(42px,6vw,75px);font-weight:700;line-height:1.22;color:var(--brand,#020846)}
.ffye-heading .em{color:var(--accent)}
.ffye-rows{display:flex;flex-direction:column;align-items:center;gap:8px;margin:36px auto 0}
.ffye-row{display:flex;align-items:stretch;gap:0}
.ffye-filled{
  background:var(--brand,#020846);
  color:#ffffff;
  font-family:var(--font-display);
  font-size:clamp(36px,5.6vw,72px);
  font-weight:700;
  line-height:1;
  padding:.14em .32em .16em;
  border-radius:calc(var(--r-scale,1)*4px) 0 0 calc(var(--r-scale,1)*4px);
  white-space:nowrap;
}
.ffye-outline{
  background:transparent;
  color:var(--brand,#020846);
  font-family:var(--font-display);
  font-size:clamp(36px,5.6vw,72px);
  font-weight:700;
  line-height:1;
  padding:.14em .32em .16em;
  border:2.5px solid var(--brand,#020846);
  border-left:none;
  border-radius:0 calc(var(--r-scale,1)*4px) calc(var(--r-scale,1)*4px) 0;
  white-space:nowrap;
}
.ffye-desc{
  margin:36px auto 0;
  max-width:680px;
  font-size:clamp(17px,2vw,26px);
  font-weight:500;
  line-height:1.7;
  color:var(--brand,#020846);
}
.ffye-desc .em{color:var(--accent);font-weight:700}
.ffye-img-wrap{margin-top:40px;width:100%;overflow:hidden;border-radius:var(--shape-photo,0)}
.ffye-img-wrap img{width:100%;height:auto;display:block;object-fit:cover}
/* noimg-safe: 이미지 없을 때 하단 패딩으로 자연 마감 */
.ffye-noimg-pad{height:64px}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    const rowsHtml = d.rows
      .map(
        (r) => `
    <div class="ffye-row">
      <span class="ffye-filled">${esc(r.filled)}</span>
      <span class="ffye-outline">${esc(r.outline)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="ffye">
  <h2 class="ffye-heading">${richSafe(d.heading)}</h2>
  <div class="ffye-rows">${rowsHtml}
  </div>
  ${d.desc ? `<p class="ffye-desc">${richSafe(d.desc)}</p>` : ''}
  ${
    hasImage
      ? `<div class="ffye-img-wrap">${media(d.image, '', '제품 이미지')}</div>`
      : '<div class="ffye-noimg-pad"></div>'
  }
</section>`
  },
})
