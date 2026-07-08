/** CERT 아키타입: cert-rosette (로제트 인증 씰 + 카피 + 사진). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1), // em 허용
  desc: z.string().optional(), // em/br 허용
  rosetteLine1: z.string().optional(),
  rosetteLine2: z.string().optional(),
  rosetteSub: z.string().optional(),
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const certRosette = defineBlock<Data>({
  id: 'cert-rosette',
  archetype: 'cert',
  styleTags: ['warm', 'food', 'premium'],
  imageSlots: 1,
  describe: '인증/품질 씰 블록. 로제트(톱니 원형) 마크 + 2톤 제목 + 설명 + 사진. 위생/수제 신뢰.',
  schema,
  css: `
.ct{position:relative;padding:66px var(--pad-x,56px) 64px;background:var(--bg);text-align:center}
.ct-h{font-size:36px}
.ct-desc{max-width:600px;margin:22px auto 0;font-size:19px;font-weight:600;line-height:1.65;color:var(--ink-2)}
.ct-desc .em{color:var(--accent);font-weight:800}
.ct-rosette{width:150px;height:150px;margin:34px auto 0}
.ct-rosette g path,.ct-rosette g circle{stroke:var(--accent)}
.ct-rosette .r1,.ct-rosette .r2{fill:var(--accent-d);font-family:var(--font-display)}
.ct-rosette .rsub{fill:var(--muted);font-weight:800}
.ct-photo{margin:30px auto 0;width:480px;height:300px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*22px));box-shadow:0 18px 38px -20px rgba(42,33,24,.4)}
`,
  render: (d, { esc, richSafe }) => {
    // 로제트 안쪽 원(r=34)의 가용 폭 ~60유닛 — 긴 한글 라인이 고정 15px로 넘쳐 링 텍스트와
    // 겹치던 실사례(시각 감사 검출) 보정: 글자수 적응형 폰트 크기 (한글 폭 ≈ 폰트크기 × 글자수)
    const fit = (s: string, base: number, budget: number): number =>
      Math.max(7, Math.min(base, Math.floor(budget / Math.max(1, s.length))))
    const l1 = d.rosetteLine1 ?? 'HAND'
    const l2 = d.rosetteLine2 ?? 'MADE'
    const sub = d.rosetteSub ?? '수제 인증'
    const f1 = fit(l1, 15, 60)
    const f2 = fit(l2, 15, 60)
    const fs = fit(sub, 9, 66)
    return `
<section class="ct">
  <div class="wm"></div>
  <h2 class="disp ct-h">${richSafe(d.title)}</h2>
  ${d.desc ? `<p class="ct-desc">${richSafe(d.desc)}</p>` : ''}
  <svg class="ct-rosette" viewBox="0 0 120 120">
    <g fill="none" stroke-width="2.4" stroke-linejoin="round">
      <path d="M60 8 l9 9 12-3 4 12 12 4 -3 12 9 9 -9 9 3 12 -12 4 -4 12 -12 -3 -9 9 -9 -9 -12 3 -4 -12 -12 -4 3 -12 -9 -9 9 -9 -3 -12 12 -4 4 -12 12 3z"/>
      <circle cx="60" cy="60" r="34"/>
    </g>
    <text class="r1" x="60" y="52" text-anchor="middle" font-size="${f1}">${esc(l1)}</text>
    <text class="r2" x="60" y="70" text-anchor="middle" font-size="${f2}">${esc(l2)}</text>
    <text class="rsub" x="60" y="86" text-anchor="middle" font-size="${fs}"${fs >= 8 ? ' letter-spacing="1.5"' : ''}>${esc(sub)}</text>
  </svg>
  ${d.image ? media(d.image, 'ct-photo', '인증 컷') : ''}
</section>`
  },
})
