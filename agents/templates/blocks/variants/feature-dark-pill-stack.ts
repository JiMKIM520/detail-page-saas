/** FEATURE 아키타입: feature-dark-pill-stack.
 *  피그마 141_제품특징_06 구조 흡수:
 *  블랙 배경 + 상단 대제목·부제 + 2~4개 반투명 필 카드(pill) 수직 스택.
 *  각 카드 = 좌측 그라데이션 원 아이콘(CSS radial-gradient) + 우측 2줄 특징 텍스트.
 *  이미지 슬롯 없음. 텍스트·토큰만으로 완성되는 다크 특징 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  title: z.string().min(1),           // (em,br) 대제목 — 히어로 스케일
  subtitle: z.string().optional(),    // 부제 한 줄 (em 불필요 — esc)
  items: z
    .array(
      z.object({
        icon: z.enum([
          'check','bolt','shield','star','leaf','fire','heart','badge',
          'drop','gear','target','bulb','sprout','thumb','trophy','bell',
          'wheat','clock','snow','gift','truck','person','search','pin',
          'box','calendar','card','won','camera','phone','thermometer',
          'store','doc','fryer','oven',
        ]),
        label: z.string().min(1),     // 카드 상단 짧은 키워드 (em,br)
        text: z.string().min(1),      // 카드 하단 보조 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  // 그라데이션 원 — 색이 없으면 accent 계열로 자동 처리
  gradientFrom: z.string().optional(), // CSS color 값 (hex/#oklch 등)
  gradientTo: z.string().optional(),   // CSS color 값
})
type Data = z.infer<typeof schema>

export const featureDarkPillStack = defineBlock<Data>({
  id: 'feature-dark-pill-stack',
  archetype: 'feature',
  styleTags: ['dark', 'premium', 'minimal', 'tech', 'electronics'],
  imageSlots: 0,
  describe:
    '블랙 배경 다크 특징 리스트. 대제목+부제(상단) + 2~4개 반투명 흰 pill 카드 수직 스택. '
    + '각 카드는 좌측 그라데이션 원형 아이콘 + 우측 특징명·설명 2줄. 이미지 슬롯 없음. '
    + '전자제품·프리미엄·테크 무드. 어두운 배경 위 부유하는 카드 장치.',
  schema,
  css: `
.febr{
  background:#000;
  padding:72px var(--pad-x,56px) 80px;
  color:#fff
}
.febr .em{color:var(--em-dark,#FFF7EA)}
.febr-hd{margin-bottom:48px}
.febr-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:64px;
  line-height:1.08;
  letter-spacing:-.02em;
  color:#fff
}
.febr-title .em{color:var(--em-dark,#FFF7EA)}
.febr-sub{
  margin-top:16px;
  font-size:18px;
  font-weight:500;
  color:rgba(255,255,255,.6);
  line-height:1.6
}
.febr-list{
  display:flex;
  flex-direction:column;
  gap:16px;
  max-width:520px
}
.febr-card{
  display:flex;
  align-items:center;
  gap:0;
  background:rgba(255,255,255,.80);
  border-radius:999px;
  padding:0;
  overflow:hidden;
  box-shadow:0 8px 32px -8px rgba(0,0,0,.45)
}
.febr-orb{
  flex:0 0 120px;
  width:120px;
  height:120px;
  border-radius:50%;
  background:var(--febr-g, radial-gradient(135deg at 30% 30%, var(--accent) 0%, var(--accent-d) 100%));
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff
}
.febr-orb svg{
  width:52px;
  height:52px;
  stroke-width:2;
  flex-shrink:0
}
.febr-body{
  flex:1;
  padding:0 28px 0 20px
}
.febr-label{
  font-family:var(--font-display);
  font-weight:700;
  font-size:22px;
  line-height:1.2;
  color:#111;
  letter-spacing:-.01em
}
.febr-label .em{color:var(--accent-d)}
.febr-text{
  margin-top:5px;
  font-size:14px;
  font-weight:500;
  color:rgba(0,0,0,.55);
  line-height:1.55
}
.febr-text .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 그라데이션 — 슬롯 지정 우선, 없으면 토큰 기반 CSS var 폴백
    const gFrom = d.gradientFrom ?? ''
    const gTo   = d.gradientTo   ?? ''
    const gradStyle = (gFrom && gTo)
      ? ` style="--febr-g:radial-gradient(135deg at 30% 30%,${esc(gFrom)} 0%,${esc(gTo)} 100%)"`
      : ''

    const cards = d.items.map(item => `
    <div class="febr-card">
      <div class="febr-orb"${gradStyle}>${icon(item.icon)}</div>
      <div class="febr-body">
        <p class="febr-label">${richSafe(item.label)}</p>
        <p class="febr-text">${richSafe(item.text)}</p>
      </div>
    </div>`).join('')

    return `
<section class="febr">
  <div class="febr-hd">
    <h2 class="febr-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="febr-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="febr-list">
    ${cards}
  </div>
</section>`
  },
})
