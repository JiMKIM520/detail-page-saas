/** FEATURE 아키타입: feature-honeycomb-badge
 *  다크 네이비 배경 중앙 타이틀 + 2×3 원형 뱃지 그리드(아이콘+레이블).
 *  원본 피그마: 123_제품특징_04 — 구조·위계 흡수, 카피·브랜드 전면 슬롯화.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const badgeSchema = z.object({
  icon: z.enum(ICON_NAMES),
  label: z.string().min(1), // em/br 허용
})

const schema = z.object({
  eyebrow: z.string().optional(),          // "check point" 류 소제목 (순수 텍스트)
  title: z.string().min(1),               // 대형 헤드라인 (em/br 허용)
  badges: z.array(badgeSchema).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const featureHoneycombBadge = defineBlock<Data>({
  id: 'feature-honeycomb-badge',
  archetype: 'feature',
  styleTags: ['dark', 'checkpoint', 'grid', 'icon'],
  imageSlots: 0,
  describe:
    '다크 네이비 전면 배경 위 중앙 타이틀 + 2열 최대 3행 원형 아이콘 뱃지 그리드. 제품 핵심 특징 6개를 체크포인트 스타일로 제시. 전자제품·가전·장비 카테고리에 적합.',
  schema,
  css: `
.fier{
  position:relative;
  padding:72px var(--pad-x,56px) 80px;
  background:var(--brand);
  text-align:center;
  overflow:hidden;
}
/* 다크 배경 안 .em 오버라이드 */
.fier .em{color:var(--em-dark,#FFF7EA)}

/* 배경 글로우 장식 — 인라인 CSS circle */
.fier-glow{
  position:absolute;
  inset:0;
  pointer-events:none;
  overflow:hidden;
}
.fier-glow::before,
.fier-glow::after{
  content:'';
  position:absolute;
  border-radius:50%;
  filter:blur(72px);
  opacity:.18;
}
.fier-glow::before{
  width:420px;height:420px;
  top:-80px;left:50%;transform:translateX(-50%);
  background:var(--accent);
}
.fier-glow::after{
  width:280px;height:280px;
  bottom:-60px;left:50%;transform:translateX(-50%);
  background:var(--accent-d);
}

/* 소제목 */
.fier-eyebrow{
  display:inline-block;
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-size:15px;
  font-weight:600;
  letter-spacing:.25em;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:20px;
}

/* 대형 타이틀 */
.fier-title{
  font-family:var(--font-display);
  font-size:clamp(40px,5vw,68px);
  font-weight:800;
  line-height:1.18;
  color:#ffffff;
  margin-bottom:52px;
}

/* 뱃지 그리드 — 2열 고정, 최대 3행 */
.fier-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:28px 24px;
  max-width:620px;
  margin:0 auto;
}

/* 뱃지 단위 */
.fier-badge{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
}

/* 원형 아이콘 서클 */
.fier-circle{
  width:120px;height:120px;
  border-radius:50%;
  background:#ffffff;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  box-shadow:0 8px 24px -8px rgba(0,0,0,.35);
}
.fier-circle svg{
  width:52px;height:52px;
  color:var(--brand);
  stroke:var(--brand);
}

/* 뱃지 레이블 */
.fier-label{
  font-family:var(--font-body);
  font-size:18px;
  font-weight:600;
  line-height:1.5;
  color:#ffffff;
  white-space:pre-line;
  margin-top:12px;
}
.fier-label .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const eyebrowHtml = d.eyebrow
      ? `<p class="fier-eyebrow">${esc(d.eyebrow)}</p>`
      : ''

    const badgesHtml = d.badges
      .map(
        (b) => `
    <div class="fier-badge">
      <div class="fier-circle">${icon(b.icon)}</div>
      <p class="fier-label">${richSafe(b.label)}</p>
    </div>`,
      )
      .join('')

    return `
<section class="fier">
  <div class="fier-glow" aria-hidden="true"></div>
  ${eyebrowHtml}
  <h2 class="fier-title">${richSafe(d.title)}</h2>
  <div class="fier-grid">
    ${badgesHtml}
  </div>
</section>`
  },
})
