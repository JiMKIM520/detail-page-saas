/** INGREDIENT 아키타입: ingredient-serif-ratio
 *  피그마 261_성분소개_11 흡수 — 라틴 세리프 악센트어(영문 소재명) + 한글 헤드라인 + 설명,
 *  전폭 소재 이미지, 성분명(한글 좌) vs 비율(대형 세리프 숫자 우) 대비 구성표 3~6행.
 *  이미지 부재 시 구성표 상단 여백 조정만으로 붕괴 없이 강등(noimg-safe).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 영문 소재·원료 악센트 (e.g. "fabric", "cotton", "retinol"). 라틴 세리프로 렌더. */
  accentWord: z.string().min(1),
  /** 한글 주 헤드라인 (em,br) */
  title: z.string().min(1),
  /** 부제/한 줄 설명 */
  desc: z.string().optional(),
  /** 소재 대표 이미지 (url) — 없으면 구성표만 노출 */
  image: z.string().optional(),
  /** 성분/원료 구성표 3~6행. label=한글 소재명, ratio=비율 문자열(e.g. "65%", "0.3g") */
  components: z
    .array(
      z.object({
        label: z.string().min(1),
        ratio: z.string().min(1),
      }),
    )
    .min(3)
    .max(6),
})
type Data = z.infer<typeof schema>

export const ingredientSerifRatio = defineBlock<Data>({
  id: 'ingredient-serif-ratio',
  archetype: 'ingredient',
  styleTags: ['light', 'editorial', 'premium', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '소재/성분 구성표 블록. 라틴 세리프 악센트어(영문 소재명) + 한글 헤드라인 + 전폭 소재 이미지 + 성분명(좌)/대형 세리프 비율 숫자(우) 대비 행 리스트(3~6행). 패션·뷰티·건강식품 원료 소개에 최적. 이미지 없어도 구성표만으로 완결 렌더(noimg-safe).',
  schema,
  css: `
.isr{background:var(--bg);color:var(--ink);padding:72px 0 64px}
.isr-text{padding:0 var(--pad-x,56px);text-align:center}
.isr-accent{font-family:var(--font-lat);font-weight:700;font-size:62px;line-height:1;
  color:var(--accent);letter-spacing:.04em;text-transform:lowercase}
.isr-title{margin-top:16px;font-family:var(--font-body);font-weight:600;font-size:28px;
  line-height:1.45;color:var(--ink)}
.isr-title .em{color:var(--accent)}
.isr-desc{margin-top:12px;font-size:15px;font-weight:400;line-height:1.72;
  color:var(--ink-2);max-width:560px;margin-left:auto;margin-right:auto}
.isr-photo{margin-top:40px;width:100%;aspect-ratio:860/750;overflow:hidden;
  border-radius:var(--shape-photo, 0px)}
.isr-photo img{width:100%;height:100%;object-fit:cover}
.isr-photo.isr-noimg{margin-top:0}
.isr-table{margin-top:0;padding:0 var(--pad-x,56px)}
.isr-row{display:flex;align-items:center;justify-content:space-between;
  padding:20px 0;border-bottom:1px solid var(--line)}
.isr-row:first-child{border-top:1px solid var(--line);margin-top:36px}
.isr-row:last-child{border-bottom:none}
.isr-label{font-family:var(--font-body);font-weight:500;font-size:17px;
  color:var(--ink);flex:1}
.isr-ratio{font-family:var(--font-lat);font-weight:700;font-size:28px;
  color:var(--ink);letter-spacing:.01em;text-align:right;flex:0 0 auto;margin-left:16px}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage =
      typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="isr">
  <div class="isr-text">
    <p class="isr-accent">${esc(d.accentWord)}</p>
    <h2 class="isr-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="isr-desc">${esc(d.desc)}</p>` : ''}
  </div>
  ${hasImage
    ? `<div class="isr-photo">${media(d.image, '', '소재 이미지')}</div>`
    : `<div class="isr-photo isr-noimg"></div>`}
  <div class="isr-table">
    ${d.components
      .map(
        (c) => `
    <div class="isr-row">
      <span class="isr-label">${esc(c.label)}</span>
      <span class="isr-ratio">${esc(c.ratio)}</span>
    </div>`,
      )
      .join('')}
  </div>
</section>`
  },
})
