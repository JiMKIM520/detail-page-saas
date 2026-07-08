/** HERO 아키타입 추가 변형(템플릿 충실 재현): 01_인트로 다크 스택.
 *  hero-dark-stack: 다크 배경 + 원형 이미지 + 대제목 + 테두리 박스 3개 수직 스택.
 *  다크 테마 전용. 와디즈 200섹션 패턴을 토큰 기반으로 재구성(클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subtitle: z.string().optional(),                  // 원형 이미지 아래 소제목 (plain)
  title: z.string().min(1),                         // 대형 제품명 헤드라인 (em,br)
  heroImage: z.string().optional(),                 // 원형 프레임 이미지 (url)
  points: z
    .array(
      z.object({
        label: z.string().optional(),               // 예: "Point 01" (기본 자동 생성)
        desc: z.string().min(1),                    // 포인트 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroDarkStack = defineBlock<Data>({
  id: 'hero-dark-stack',
  archetype: 'hero',
  styleTags: ['dark', 'premium', 'commerce', 'template'],
  imageSlots: 1,
  describe:
    '다크 히어로 + 수직 포인트 박스 스택. 다크 배경 + 원형 이미지 + 흰 대제목(액센트 배경 하이라이트) + 테두리 박스 2~4개 수직 스택. 다크 테마 전용.',
  schema,
  css: `
.hds{background:var(--ink);color:#fff;padding:0 0 64px;overflow:hidden;text-align:center;position:relative}
/* 코너 장식 — 좌상·우하 트라이앵글 띠 */
.hds::before,.hds::after{content:"";position:absolute;width:180px;height:180px;pointer-events:none}
.hds::before{top:0;left:0;background:linear-gradient(135deg,var(--accent) 0%,transparent 55%);opacity:.55}
.hds::after{bottom:100px;right:0;background:linear-gradient(315deg,var(--accent) 0%,transparent 55%);opacity:.35}
/* 원형 이미지 */
.hds-circle-wrap{position:relative;display:inline-block;margin:52px auto 0}
.hds-circle{width:320px;height:320px;border-radius:50%;border:3px solid rgba(255,255,255,.22);overflow:hidden;display:flex;align-items:center;justify-content:center}
.hds-circle img,.hds-circle.ph{width:100%;height:100%;object-fit:cover}
/* 스파클 장식 (순수 CSS 다이아몬드 별) */
.hds-spark{position:absolute;color:rgba(255,255,255,.78)}
.hds-spark-tl{top:-10px;left:-18px;font-size:28px;transform:rotate(-15deg)}
.hds-spark-br{bottom:-12px;right:-22px;font-size:22px;transform:rotate(12deg)}
/* 텍스트 헤더 */
.hds-sub{margin-top:28px;font-size:16px;color:rgba(255,255,255,.62);letter-spacing:.04em}
.hds-title{margin:10px 36px 0;font-family:var(--font-display);font-weight:800;font-size:48px;line-height:1.15;letter-spacing:-.01em;background:var(--accent);display:inline-block;padding:6px 24px;border-radius:calc(var(--r-scale,1)*6px);color:#fff}
.hds-title .em{color:var(--ink)}
/* 포인트 박스 스택 */
.hds-stack{margin:40px 36px 0;display:flex;flex-direction:column;gap:16px}
.hds-box{border:1.5px solid color-mix(in srgb,var(--accent) 55%,rgba(255,255,255,.18));border-radius:calc(var(--r-scale,1)*12px);padding:22px 28px 24px;background:rgba(255,255,255,.03)}
.hds-pt-label{font-family:var(--font-display);font-weight:800;font-size:18px;letter-spacing:.06em;color:var(--accent);margin-bottom:10px}
.hds-pt-desc{font-size:15px;line-height:1.7;color:rgba(255,255,255,.75)}
.hds-pt-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="hds">
  <div class="hds-circle-wrap">
    <div class="hds-circle">
      ${media(d.heroImage, 'hds-circle-img', '제품 이미지')}
    </div>
    <span class="hds-spark hds-spark-tl">✦</span>
    <span class="hds-spark hds-spark-br">✦</span>
  </div>
  ${d.subtitle ? `<p class="hds-sub">${esc(d.subtitle)}</p>` : ''}
  <h1 class="disp hds-title">${richSafe(d.title)}</h1>
  <div class="hds-stack">
    ${d.points
      .map(
        (p, i) => `
    <div class="hds-box">
      <div class="hds-pt-label">${esc(p.label ?? `Point ${String(i + 1).padStart(2, '0')}`)}</div>
      <div class="hds-pt-desc">${richSafe(p.desc)}</div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
