/** USAGE 아키타입(템플릿 충실 재현): usage-accent-hero.
 *  와디즈 200섹션 05_사용법 _08(HOW TO USE 강조색 배경 + 히어로 우상단 제품이미지 + 교차 스텝 카드) 패턴 재구성.
 *  솔리드 accent 배경 전체 + 좌 대형 디스플레이 타이틀/우 소제목+제품이미지 + 4개 교차(홀=텍스트좌/이미지우, 짝=이미지좌/텍스트우) paper 카드 + 흰 마무리. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  title: z.string().min(1).optional(),        // 기본 "HOW TO USE" (em,br 가능)
  heroTagline: z.string().min(1).optional(),  // 우상단 소제목 (예: "제품의 사용법에\n대해서 알려주세요!")
  heroImage: z.string().optional(),           // 우상단 제품/아이콘 이미지 (url)
  steps: z
    .array(
      z.object({
        image: z.string().optional(),         // 카드 내 이미지 (url)
        label: z.string().min(1).optional(),  // 기본 "STEP 0N"
        title: z.string().min(1),             // 스텝 제목 (em,br)
        desc: z.string().min(1).optional(),   // 스텝 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),       // 하단 마무리 카피 (em,br)
})
type Data = z.infer<typeof schema>

export const usageAccentHero = defineBlock<Data>({
  id: 'usage-accent-hero',
  archetype: 'usage',
  styleTags: ['premium', 'colorblock', 'accent', 'template', 'howto', 'crosslayout'],
  imageSlots: 5,
  describe:
    '사용법(강조색 배경+히어로+교차 스텝 카드). 솔리드 accent 풀배경 + 좌 대형 HOW TO USE 타이틀·우 소제목+제품이미지 상단 히어로 + 교차(홀=텍스트좌/이미지우, 짝=이미지좌/텍스트우) paper 스텝 카드 4개 + 흰 마무리 카피.',
  schema,
  css: `
.uah{background:var(--accent);color:#fff;padding:0 0 54px}
.uah .em{color:#fff;text-decoration:underline}
/* ── 상단 히어로 영역 ── */
.uah-hero{display:flex;align-items:flex-end;padding:52px 48px 36px;gap:20px;min-height:200px}
.uah-title-col{flex:1;display:flex;flex-direction:column;justify-content:flex-end}
.uah-title{font-family:var(--font-display);font-weight:800;font-size:80px;color:#fff;letter-spacing:-.02em;line-height:0.98}
.uah-right{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:14px;text-align:right;max-width:220px}
.uah-tagline{font-size:15px;font-weight:600;color:rgba(255,255,255,.92);line-height:1.6;white-space:pre-line}
.uah-hero-img{width:120px;height:120px;object-fit:contain}
/* ── 스텝 카드 ── */
.uah-cards{display:flex;flex-direction:column;gap:14px;padding:0 24px}
.uah-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*18px);display:flex;align-items:center;overflow:hidden;position:relative;min-height:130px}
/* 홀수(0-indexed 짝수): 텍스트 왼쪽 / 이미지 오른쪽 */
.uah-card .uah-body{flex:1;padding:24px 20px 24px 28px}
.uah-card .uah-thumb{flex:0 0 150px;width:150px;height:130px;object-fit:cover}
/* 짝수(0-indexed 홀수): 이미지 왼쪽 / 텍스트 오른쪽 */
.uah-card.rev{flex-direction:row-reverse}
.uah-card.rev .uah-body{padding:24px 28px 24px 20px}
/* 번호 배지 (우상단 고정) */
.uah-badge{position:absolute;top:12px;right:16px;font-family:var(--font-display);font-weight:800;font-size:28px;color:color-mix(in srgb,var(--accent) 18%,transparent);line-height:1;pointer-events:none;user-select:none}
.uah-card.rev .uah-badge{left:16px;right:auto}
.uah-label{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--accent);letter-spacing:.04em;margin-bottom:8px}
.uah-card-title{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--ink);line-height:1.3}
.uah-card-title .em{color:var(--accent)}
.uah-card-desc{margin-top:8px;font-size:14px;color:var(--ink-2);line-height:1.65}
.uah-card-desc .em{color:var(--accent);font-weight:700}
/* ── 하단 마무리 ── */
.uah-closer{margin-top:46px;padding:0 48px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:34px;color:#fff;line-height:1.35}
.uah-closer .em{color:color-mix(in srgb,#fff 70%,var(--accent-d))}
`,
  render: (d, { esc, richSafe }) => `
<section class="uah">
  <div class="uah-hero">
    <div class="uah-title-col">
      <h2 class="uah-title">${richSafe(d.title ?? 'HOW<br>TO USE')}</h2>
    </div>
    <div class="uah-right">
      ${d.heroTagline ? `<p class="uah-tagline">${esc(d.heroTagline)}</p>` : ''}
      ${media(d.heroImage, 'uah-hero-img', '제품 이미지')}
    </div>
  </div>
  <div class="uah-cards">
    ${d.steps
      .map(
        (s, i) => `
    <div class="uah-card${i % 2 === 1 ? ' rev' : ''}">
      <div class="uah-badge">${pad2(i + 1)}</div>
      <div class="uah-body">
        <div class="uah-label">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</div>
        <div class="uah-card-title">${richSafe(s.title)}</div>
        ${s.desc ? `<div class="uah-card-desc">${richSafe(s.desc)}</div>` : ''}
      </div>
      ${media(s.image, 'uah-thumb', '사용법 단계')}
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="uah-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
