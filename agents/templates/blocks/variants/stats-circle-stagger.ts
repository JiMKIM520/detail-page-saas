/** STATS 아키타입 추가 변형(템플릿 충실 재현): 02_수치강조 _원형 사진 스태거드.
 *  stats-circle-stagger: 다크 배경 + 상단 pill 라벨 + 대형 숫자 헤드라인 +
 *  라이트 카드 3개 엇갈림(원형 사진이 카드 좌/우로 돌출) + 하단 트로피/심볼.
 *  statsZigzag(라이트+지그재그 행)·statsHighlight(아이콘 카드)와 다른 다크 스태거드 카드 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  label: z.string().min(1).optional(), // pill 라벨 (예: "누적 판매량")
  headline: z.string().min(1), // 대형 숫자 (em,br 허용)
  items: z
    .array(
      z.object({
        eyebrow: z.string().min(1).optional(), // 카드 상단 소제목 (예: "만족도 평점")
        value: z.string().min(1), // 수치 또는 짧은 강조 문구 (em,br 허용)
        image: z.string().optional(), // 원형 사진 (url)
      }),
    )
    .min(2)
    .max(4),
  symbolImage: z.string().optional(), // 하단 트로피/뱃지 이미지 (url)
})
type Data = z.infer<typeof schema>

export const statsCircleStagger = defineBlock<Data>({
  id: 'stats-circle-stagger',
  archetype: 'stats',
  styleTags: ['dark', 'bold', 'premium', 'template', 'stagger'],
  imageSlots: 4,
  describe:
    '수치 강조(다크 원형 스태거드). 다크 배경 + pill 라벨 + 대형 숫자 헤드라인 + 라이트 카드 2~4개 엇갈림(원형 사진이 카드 좌/우로 돌출) + 하단 트로피 심볼. 핵심 3수치 임팩트 강조.',
  schema,
  css: `
.scs{background:var(--ink);color:#fff;padding:56px 0 0;position:relative;overflow:hidden}
.scs-top{text-align:left;padding:0 44px 40px}
.scs-pill{display:inline-block;background:var(--accent);color:#fff;font-weight:800;font-size:17px;padding:8px 24px;border-radius:999px;letter-spacing:.02em;margin-bottom:16px}
.scs-head{font-family:var(--font-display);font-weight:800;font-size:68px;letter-spacing:-.02em;line-height:1.08;color:#fff}
.scs-head .em{color:var(--accent)}
.scs-cards{display:flex;flex-direction:column;gap:0;padding:0 0 0 0}
.scs-card{position:relative;background:var(--paper);border-radius:24px;margin:0 24px 18px;padding:26px 28px 26px 150px;min-height:130px;display:flex;flex-direction:column;justify-content:center;overflow:visible}
.scs-card:nth-child(even){padding:26px 150px 26px 28px;text-align:right;margin-left:24px;margin-right:24px}
.scs-circle{position:absolute;top:50%;transform:translateY(-50%);left:-36px;width:130px;height:130px;border-radius:50%;overflow:hidden;flex-shrink:0;box-shadow:0 4px 18px rgba(0,0,0,.22)}
.scs-card:nth-child(even) .scs-circle{left:auto;right:-36px}
.scs-circle-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:50%}
.scs-eyebrow{font-size:14px;font-weight:600;color:var(--ink-2);margin-bottom:8px;letter-spacing:.01em}
.scs-value{font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--accent);line-height:1.2}
.scs-value .em{color:var(--ink)}
.scs-symbol{display:block;width:160px;height:160px;object-fit:contain;margin:8px 0 0 auto;position:relative;z-index:2}
.scs-foot{height:72px;position:relative}
`,
  render: (d, { esc, richSafe }) => `
<section class="scs">
  <div class="scs-top">
    ${d.label ? `<span class="scs-pill">${esc(d.label)}</span>` : ''}
    <h2 class="scs-head">${richSafe(d.headline)}</h2>
  </div>
  <div class="scs-cards">
    ${d.items
      .map(
        (it) => `
    <div class="scs-card">
      <div class="scs-circle">
        ${media(it.image, 'scs-circle-img', esc(it.eyebrow ?? '수치 이미지'))}
      </div>
      ${it.eyebrow ? `<div class="scs-eyebrow">${esc(it.eyebrow)}</div>` : ''}
      <div class="scs-value">${richSafe(it.value)}</div>
    </div>`,
      )
      .join('')}
  </div>
  <div class="scs-foot">
    ${d.symbolImage ? media(d.symbolImage, 'scs-symbol', '트로피') : ''}
  </div>
</section>`,
})
