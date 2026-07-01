/** DETAIL 아키타입 추가 변형(템플릿 충실 재현): 17_제품 설명 _11.
 *  detail-points: 다크 + POINT별 사진 오버레이(이미지 위 POINT N + 흰 헤드라인) + 흰 설명밴드.
 *  detail-showcase(단일 히어로+스펙+씬)와 다른 포인트형 사진 내러티브. 다크 블록(명암 리듬용). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  points: z
    .array(
      z.object({
        image: z.string().optional(),
        label: z.string().min(1).optional(), // 기본 "POINT N"
        title: z.string().min(1), // 사진 위 헤드라인 (em,br)
        desc: z.string().min(1), // 흰 밴드 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const detailPoints = defineBlock<Data>({
  id: 'detail-points',
  archetype: 'detail' as any,
  styleTags: ['premium', 'dark', 'editorial', 'template'],
  imageSlots: 4,
  describe:
    '제품 설명(다크 포인트형). POINT별 풀폭 사진 위 라벨+헤드라인 오버레이 + 흰 설명밴드 반복. 이미지 중심 내러티브. 다크 블록(명암 리듬용).',
  schema,
  css: `
.dp{background:var(--ink);color:#fff}
.dp-fig{position:relative;width:100%;height:360px;overflow:hidden}
.dp-fig-img{width:100%;height:100%;object-fit:cover;display:block}
.dp-fig::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.05) 55%,rgba(0,0,0,0) 100%)}
.dp-cap{position:absolute;left:0;top:0;z-index:2;padding:40px 40px 0}
.dp-label{font-family:var(--font-display);font-weight:800;font-size:15px;letter-spacing:.1em;color:var(--accent);margin-bottom:14px}
.dp-title{font-family:var(--font-display);font-weight:800;font-size:34px;color:#fff;line-height:1.25;text-shadow:0 2px 14px rgba(0,0,0,.45)}
.dp-desc{background:var(--paper);color:var(--ink);padding:30px 40px;font-size:15px;line-height:1.75}
.dp-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="dp">
  ${d.points
    .map(
      (p, i) => `
  <div class="dp-pt">
    <div class="dp-fig">
      ${media(p.image, 'dp-fig-img', 'POINT 사진')}
      <div class="dp-cap">
        <div class="dp-label">${esc(p.label ?? `POINT ${i + 1}`)}</div>
        <div class="dp-title">${richSafe(p.title)}</div>
      </div>
    </div>
    <div class="dp-desc">${richSafe(p.desc)}</div>
  </div>`,
    )
    .join('')}
</section>`,
})
