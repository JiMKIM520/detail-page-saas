/** STATS 아키타입 추가 변형(템플릿 충실 재현): 02_수치강조 _184:662.
 *  stats-bento-grid: 상단 accent 밴드(이브로우+대형숫자) + 3셀 체커보드 카드(텍스트↔이미지 교차 + BEST 뱃지).
 *  statsZigzag(행방향 교차)·statsFigures(다크 대형숫자)와 다른 카드형 벤토 체커보드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),     // 상단 레이블 (예: "누적 판매량")
  headline: z.string().min(1),               // 대형 숫자 헤드라인 (em,br)
  badge: z.string().min(1).optional(),       // 뱃지 텍스트 기본값 "BEST!" (모든 카드 공통)
  cards: z
    .array(
      z.object({
        label: z.string().min(1),            // 수치 레이블 (예: "만족도 평점")
        value: z.string().min(1),            // 수치 값 (em,br)
        image: z.string().optional(),        // 카드 내 이미지 (url)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const statsBentoGrid = defineBlock<Data>({
  id: 'stats-bento-grid',
  archetype: 'stats',
  styleTags: ['premium', 'template', 'colorblock', 'bento'],
  imageSlots: 3,
  describe:
    '수치 강조(벤토 체커보드). 상단 accent 밴드(이브로우+대형숫자 헤드라인) + 2~4개 카드 체커보드(홀수=텍스트좌·이미지우, 짝수=이미지좌·텍스트우) + 각 카드 우상단/좌상단 BEST 뱃지. statsZigzag(행 교차)와 다른 벤토 카드 구조.',
  schema,
  css: `
.sbg{background:color-mix(in srgb,var(--accent) 18%,#fff);color:var(--ink)}
.sbg-top{background:var(--accent);padding:52px 40px 50px;text-align:center;position:relative;overflow:hidden}
.sbg-eye{font-family:var(--font-display);font-weight:800;font-size:20px;color:rgba(255,255,255,.88);letter-spacing:.05em;margin-bottom:14px}
.sbg-headline{font-family:var(--font-display);font-weight:800;font-size:58px;color:#fff;line-height:1.1;letter-spacing:-.02em}
.sbg-headline .em{color:color-mix(in srgb,#fff 70%,var(--accent))}
.sbg-cards{padding:28px 28px 36px;display:flex;flex-direction:column;gap:20px}
.sbg-card{background:#fff;border-radius:22px;box-shadow:0 4px 20px rgba(0,0,0,.07);overflow:hidden;display:flex;align-items:stretch;min-height:170px;position:relative}
.sbg-card:nth-child(even){flex-direction:row-reverse}
.sbg-card-body{flex:1;padding:30px 28px;display:flex;flex-direction:column;justify-content:center;gap:10px;min-width:0}
.sbg-label{font-family:var(--font-body);font-size:16px;color:var(--ink-2);font-weight:500;line-height:1.3}
.sbg-value{font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--accent);line-height:1.25}
.sbg-value .em{color:var(--ink)}
.sbg-media{flex:0 0 42%;width:42%;height:170px;object-fit:cover;display:block}
.sbg-badge{position:absolute;top:14px;right:14px;background:color-mix(in srgb,var(--accent) 90%,#000);color:#fff;font-family:var(--font-display);font-weight:800;font-size:13px;padding:5px 13px;border-radius:999px;letter-spacing:.04em;box-shadow:0 2px 8px rgba(0,0,0,.18)}
.sbg-card:nth-child(even) .sbg-badge{right:auto;left:14px}
`,
  render: (d, { esc, richSafe }) => `
<section class="sbg">
  <div class="sbg-top">
    ${d.eyebrow ? `<div class="sbg-eye">${esc(d.eyebrow)}</div>` : ''}
    <h2 class="sbg-headline">${richSafe(d.headline)}</h2>
  </div>
  <div class="sbg-cards">
    ${d.cards
      .map(
        (c) => `
    <div class="sbg-card">
      <div class="sbg-card-body">
        <div class="sbg-label">${esc(c.label)}</div>
        <div class="sbg-value">${richSafe(c.value)}</div>
      </div>
      ${media(c.image, 'sbg-media', esc(c.label))}
      <span class="sbg-badge">${esc(d.badge ?? 'BEST!')}</span>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
