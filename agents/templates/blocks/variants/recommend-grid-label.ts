/** RECOMMEND 아키타입: recommend-grid-label
 *  피그마 118_추천_03 패턴 재구성:
 *  증상 질문 2줄 헤더 + 2×2 카드 그리드(라운드 사진 + 컬러 채움 텍스트 레이블).
 *  이미지 부재 시 카드 상단을 accent 틴트 패널로 강등(noimg-safe).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  image: z.string().optional(),   // (url) 추천 대상 이미지
  label: z.string().min(1),       // 컬러 채움 레이블 텍스트 (em,br)
})

const schema = z.object({
  question: z.string().min(1),    // 증상 질문 라인 (em,br) — accent 색
  answer: z.string().min(1),      // 제품 권장 라인 (em,br) — ink 색
  cards: z.array(cardSchema).min(2).max(4),
})
type Data = z.infer<typeof schema>

export const recommendGridLabel = defineBlock<Data>({
  id: 'recommend-grid-label',
  archetype: 'recommend',
  styleTags: ['light', 'grid', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '추천 대상 2×2 카드 그리드. 증상 질문(accent)+권장 답변(ink) 2줄 헤더 아래, 라운드 사진 위에 컬러 채움 레이블을 붙인 카드 4개. 건강기능식품·뷰티·식품 추천 대상 소구에 적합.',
  schema,
  css: `
.rfvb{background:var(--bg);padding:60px var(--pad-x,56px) 72px;text-align:center}
.rfvb-hd{margin-bottom:40px}
.rfvb-q{font-size:clamp(26px,3.6vw,40px);font-weight:800;line-height:1.28;color:var(--accent);font-family:var(--font-display)}
.rfvb-q .em{color:var(--accent-d)}
.rfvb-a{margin-top:8px;font-size:clamp(22px,3vw,34px);font-weight:500;line-height:1.3;color:var(--ink)}
.rfvb-a .em{color:var(--accent);font-weight:700}
.rfvb-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:780px;margin:0 auto}
.rfvb-card{display:flex;flex-direction:column;border-radius:calc(var(--r-scale,1)*18px);overflow:hidden}
.rfvb-img-wrap{position:relative;flex:0 0 auto;border-radius:calc(var(--r-scale,1)*18px) calc(var(--r-scale,1)*18px) 0 0;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--paper))}
.rfvb-img-wrap img,.rfvb-img-wrap .ph{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border-radius:0}
.rfvb-img-wrap .ph{display:block!important;aspect-ratio:3/2;background:color-mix(in srgb,var(--accent) 12%,var(--paper))}
.rfvb-lbl{background:var(--accent);padding:18px 14px;min-height:88px;display:flex;align-items:center;justify-content:center}
.rfvb-lbl-txt{color:#ffffff;font-size:clamp(15px,1.8vw,20px);font-weight:600;line-height:1.45;white-space:pre-line}
.rfvb-lbl-txt .em{color:var(--em-dark,#FFF7EA);font-weight:800}
`,
  render: (d, { richSafe }) => `
<section class="rfvb">
  <div class="rfvb-hd">
    <p class="rfvb-q">${richSafe(d.question)}</p>
    <p class="rfvb-a">${richSafe(d.answer)}</p>
  </div>
  <div class="rfvb-grid">
    ${d.cards.map((c) => `
    <div class="rfvb-card">
      <div class="rfvb-img-wrap">${media(c.image, '', '추천 대상')}</div>
      <div class="rfvb-lbl">
        <span class="rfvb-lbl-txt">${richSafe(c.label)}</span>
      </div>
    </div>`).join('')}
  </div>
</section>`,
})
