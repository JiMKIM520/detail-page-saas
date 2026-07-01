/** FEATURE 아키타입(템플릿 충실 재현): feature-why-iconlist.
 *  와디즈 200섹션 "03_특장점" 영문 히어로 헤드라인 + 아이콘 리스트(_1279:3790) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  대형 영문 질문 헤드라인(WHY THIS PRODUCT?) + 와이드 이미지 + 아이브로/대제목 + 흰 패널 안 아이콘 행 3개. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  headline: z.string().min(1),                        // 대형 영문 질문 헤드라인 (em,br) — 예: "WHY<br>THIS PRODUCT?"
  image: z.string().optional(),                        // 와이드 제품 이미지 (url)
  eyebrow: z.string().min(1).optional(),               // 이미지 아래 작은 서브카피
  title: z.string().min(1),                            // 섹션 대제목 (em,br) — 예: "제품 특장점"
  badgeIcon: z.enum(ICON_NAMES).optional(),            // 리스트 상단 중앙 배지 아이콘 (기본: check)
  items: z
    .array(
      z.object({
        icon: z.enum(ICON_NAMES),                      // 행 아이콘
        subtitle: z.string().min(1),                   // 행 소제목 (em,br)
        desc: z.string().min(1).optional(),            // 행 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureWhyIconlist = defineBlock<Data>({
  id: 'feature-why-iconlist',
  archetype: 'feature',
  styleTags: ['premium', 'cobalt', 'template', 'iconlist', 'light'],
  imageSlots: 1,
  describe:
    '특장점 영문 헤드라인+아이콘 리스트. accent 배경에 대형 영문 질문 헤드라인(WHY THIS PRODUCT?) + 와이드 이미지 밴드 + 아이브로/대제목 + 흰 패널 안 배지 아이콘 + 아이콘·소제목·설명 카드 행 2~4개. 밝고 구조적인 특장점 섹션.',
  schema,
  css: `
.fwi{background:color-mix(in srgb,var(--accent) 18%,var(--bg));padding:0 0 60px}
/* ── 영문 헤드라인 영역 ── */
.fwi-hero{padding:60px 40px 0;text-align:center}
.fwi-headline{font-family:var(--font-display);font-weight:900;font-size:72px;letter-spacing:-.01em;line-height:1.08;color:var(--accent);text-transform:uppercase}
.fwi-headline .em{color:var(--ink)}
/* ── 와이드 이미지 밴드 ── */
.fwi-band{width:calc(100% - 48px);margin:28px auto 0;border-radius:14px;overflow:hidden;display:block}
.fwi-band img,.fwi-band .fwi-ph{width:100%;height:260px;object-fit:cover;display:block}
/* ── 아이브로 + 대제목 ── */
.fwi-intro{padding:36px 44px 0;text-align:center}
.fwi-eyebrow{font-size:15px;font-weight:500;color:var(--ink-2);letter-spacing:.01em}
.fwi-title{margin-top:8px;font-family:var(--font-display);font-weight:800;font-size:48px;letter-spacing:-.02em;color:var(--ink);line-height:1.12}
.fwi-title .em{color:var(--accent)}
/* ── 흰 패널(badge + 카드 리스트) ── */
.fwi-panel{margin:30px 24px 0;background:var(--paper);border-radius:20px;padding:32px 24px 28px;box-shadow:0 2px 16px rgba(0,0,0,.06)}
/* 상단 배지 */
.fwi-badge{width:52px;height:52px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;margin:0 auto 22px}
.fwi-badge svg{width:26px;height:26px}
/* 카드 행 */
.fwi-list{display:flex;flex-direction:column;gap:16px}
.fwi-card{display:flex;align-items:flex-start;gap:20px;background:color-mix(in srgb,var(--accent) 10%,var(--bg));border:1.5px solid color-mix(in srgb,var(--accent) 20%,transparent);border-radius:14px;padding:20px 22px}
/* 아이콘 박스 */
.fwi-icon{flex:0 0 52px;width:52px;height:52px;border-radius:12px;background:color-mix(in srgb,var(--accent) 18%,var(--paper));display:flex;align-items:center;justify-content:center;color:var(--accent)}
.fwi-icon svg{width:28px;height:28px}
/* 텍스트 */
.fwi-tx{flex:1;min-width:0}
.fwi-sub{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--ink);line-height:1.25}
.fwi-sub .em{color:var(--accent)}
.fwi-desc{margin-top:6px;font-size:14px;color:var(--ink-2);line-height:1.65}
.fwi-desc .em{font-weight:700;color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="fwi">
  <div class="fwi-hero">
    <h2 class="fwi-headline">${richSafe(d.headline)}</h2>
  </div>
  <div class="fwi-band">
    ${media(d.image, 'fwi-ph', '제품 대표 이미지')}
  </div>
  <div class="fwi-intro">
    ${d.eyebrow ? `<p class="fwi-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h3 class="fwi-title">${richSafe(d.title)}</h3>
  </div>
  <div class="fwi-panel">
    <div class="fwi-badge">${icon(d.badgeIcon ?? 'check')}</div>
    <ul class="fwi-list" style="list-style:none">
      ${d.items
        .map(
          (it) => `
      <li class="fwi-card">
        <div class="fwi-icon">${icon(it.icon)}</div>
        <div class="fwi-tx">
          <div class="fwi-sub">${richSafe(it.subtitle)}</div>
          ${it.desc ? `<div class="fwi-desc">${richSafe(it.desc)}</div>` : ''}
        </div>
      </li>`,
        )
        .join('')}
    </ul>
  </div>
</section>`,
})
