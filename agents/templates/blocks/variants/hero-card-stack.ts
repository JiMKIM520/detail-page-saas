/** HERO 아키타입 변형: hero-card-stack (01_인트로 536:142).
 *  장식 원형 도형 배경 위 대형 타이포 제목 → 전폭 히어로 이미지 → 전폭 카드 박스 3개 스택.
 *  와디즈 200섹션 패턴을 토큰 기반으로 재구성(클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().min(1),             // 상단 브랜드 로고 텍스트 (BRAND LOGO)
  subtitle: z.string().optional(),       // 브랜드 아래 보조 설명 (em,br)
  title: z.string().min(1),             // 원형 위에 올라오는 대형 제목 (em,br)
  heroImage: z.string().optional(),      // 원형+제목 아래 전폭 제품 사진 (url)
  cards: z
    .array(
      z.object({
        label: z.string().optional(),    // 카드 라벨 — 기본 "Point 01" (손글씨체)
        desc: z.string().min(1),         // 카드 본문 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroCardStack = defineBlock<Data>({
  id: 'hero-card-stack',
  archetype: 'hero',
  styleTags: ['playful', 'colorblock', 'commerce', 'template'],
  imageSlots: 1,
  describe:
    '전폭 카드형 박스 목록 히어로. 브랜드 로고 + 장식 원형 도형(accent) 위 대형 흰 타이포 제목 + 전폭 히어로 이미지 + 전폭 테두리 카드 2~4개 스택(손글씨 라벨+설명). 개성 있는 커머스 인트로.',
  schema,
  css: `
.hcs{background:var(--bg);color:var(--ink);padding-bottom:56px;overflow:hidden}

/* 브랜드 로고 */
.hcs-brand{text-align:center;padding:42px 40px 16px;font-size:15px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--accent)}

/* 보조 텍스트 */
.hcs-sub{text-align:center;padding:0 40px 10px;font-size:17px;font-weight:600;color:var(--ink-2);line-height:1.55}
.hcs-sub .em{color:var(--accent)}

/* 원형 장식 + 제목 영역 */
.hcs-circles{position:relative;height:280px;margin:0 -20px}
.hcs-circle-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-start;gap:0}
.hcs-circle{width:230px;height:230px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-left:-24px}
.hcs-circle:first-child{margin-left:0}
.hcs-title-layer{position:absolute;inset:0;display:flex;align-items:center;padding:0 28px;z-index:2}
.hcs-title{font-family:var(--font-display);font-weight:900;font-size:62px;line-height:1.08;letter-spacing:-.03em;color:#fff;word-break:keep-all}
.hcs-title .em{color:color-mix(in srgb,#fff 60%,var(--accent))}

/* 히어로 이미지 */
.hcs-hero{width:100%;height:420px;object-fit:cover;display:block;margin-top:0}

/* 카드 스택 */
.hcs-cards{padding:28px 24px 0;display:flex;flex-direction:column;gap:14px}
.hcs-card{border:1.5px solid var(--line);border-radius:calc(var(--r-scale,1)*14px);padding:26px 28px 22px;background:var(--paper)}
.hcs-card-label{font-family:var(--font-hand),'Gaegu',cursive;font-size:22px;font-weight:700;color:var(--accent);margin-bottom:10px;border-bottom:2px solid color-mix(in srgb,var(--accent) 25%,transparent);padding-bottom:8px;display:inline-block}
.hcs-card-desc{font-size:15px;line-height:1.75;color:var(--ink-2)}
.hcs-card-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const circleCount = 4
    const circles = Array.from({ length: circleCount })
      .map(() => `<div class="hcs-circle"></div>`)
      .join('')

    const cards = d.cards
      .map(
        (c, i) => `
<div class="hcs-card">
  <div class="hcs-card-label">${esc(c.label ?? `Point ${String(i + 1).padStart(2, '0')}`)}</div>
  <div class="hcs-card-desc">${richSafe(c.desc)}</div>
</div>`,
      )
      .join('')

    return `
<section class="hcs">
  <p class="hcs-brand">${esc(d.brand)}</p>
  ${d.subtitle ? `<p class="hcs-sub">${richSafe(d.subtitle)}</p>` : ''}
  <div class="hcs-circles">
    <div class="hcs-circle-wrap">${circles}</div>
    <div class="hcs-title-layer">
      <h1 class="hcs-title">${richSafe(d.title)}</h1>
    </div>
  </div>
  ${media(d.heroImage, 'hcs-hero', '히어로 이미지')}
  <div class="hcs-cards">${cards}</div>
</section>`
  },
})
