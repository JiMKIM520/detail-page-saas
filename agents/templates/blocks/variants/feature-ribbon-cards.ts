/** FEATURE 아키타입(템플릿 충실 재현): feature-ribbon-cards.
 *  와디즈 200섹션 "03_특장점" 리본 뱃지 카드 스택(1279:3791) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(아이콘+대제목+설명) + 카드 3장 세로 스택(각 카드 상단에 리본 배지 오버랩 + 이미지 + 소제목 + 설명). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  eyebrow: z.string().min(1).optional(),   // 헤더 상단 소제목 (예: "우리 제품이 특별한 이유를 직접 체험해보세요")
  title: z.string().min(1),                // 섹션 대제목 (em,br)
  cards: z
    .array(
      z.object({
        badge: z.string().min(1).optional(), // 리본 배지 텍스트 (기본 "01", "02", "03")
        subtitle: z.string().min(1),         // 카드 소제목 (em,br)
        image: z.string().optional(),        // 카드 이미지 슬롯 (url)
        desc: z.string().min(1).optional(),  // 카드 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureRibbonCards = defineBlock<Data>({
  id: 'feature-ribbon-cards',
  archetype: 'feature',
  styleTags: ['playful', 'light', 'template', 'card', 'ribbon'],
  imageSlots: 3,
  describe:
    '특장점(리본 배지 카드 스택). 상단 아이콘+대제목+설명 헤더 + 번호 리본 배지가 카드 상단에 오버랩된 세로 카드 스택(이미지+소제목+설명). 라이트 배경, 플레이풀.',
  schema,
  css: `
.frc{background:var(--bg);color:var(--ink);padding:52px 40px 60px;text-align:center}
.frc-hd{margin-bottom:36px}
.frc-icon{width:48px;height:48px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px}
.frc-icon svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.frc-title{font-family:var(--font-display);font-weight:800;font-size:44px;letter-spacing:-.02em;line-height:1.15;color:var(--ink)}
.frc-title .em{color:var(--accent)}
.frc-eyebrow{margin-top:12px;font-size:16px;color:var(--ink-2);line-height:1.6}
.frc-stack{display:flex;flex-direction:column;gap:24px}
.frc-card{position:relative;background:var(--paper);border-radius:20px;padding-top:30px;overflow:visible;text-align:left;border:1.5px solid color-mix(in srgb,var(--line) 60%,transparent)}
.frc-ribbon{position:absolute;top:-18px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center}
.frc-ribbon-body{background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:15px;letter-spacing:.08em;padding:6px 28px;clip-path:polygon(8px 0%,calc(100% - 8px) 0%,100% 50%,calc(100% - 8px) 100%,8px 100%,0% 50%);white-space:nowrap}
.frc-ribbon-tail-l{width:0;height:0;border-left:10px solid transparent;border-right:0 solid transparent;border-top:7px solid var(--accent-dark);position:absolute;top:100%;left:calc(50% - 54px)}
.frc-ribbon-tail-r{width:0;height:0;border-right:10px solid transparent;border-left:0 solid transparent;border-top:7px solid var(--accent-dark);position:absolute;top:100%;right:calc(50% - 54px)}
.frc-subtitle{font-family:var(--font-hand);font-size:26px;color:var(--accent);text-align:center;padding:20px 24px 16px;line-height:1.4}
.frc-subtitle .em{color:var(--ink)}
.frc-img{width:calc(100% - 32px);margin:0 16px;height:200px;object-fit:cover;border-radius:12px;overflow:hidden}
.frc-desc{padding:18px 24px 24px;font-size:15px;color:var(--ink-2);line-height:1.75;text-align:center}
.frc-desc .em{color:var(--accent);font-weight:700}
.frc-divider{border:none;border-top:1.5px dashed color-mix(in srgb,var(--line) 50%,transparent);margin:0 24px}
`,
  render: (d, { esc, richSafe }) => `
<section class="frc">
  <div class="frc-hd">
    <div class="frc-icon">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
    </div>
    <h2 class="frc-title">${richSafe(d.title)}</h2>
    ${d.eyebrow ? `<p class="frc-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  </div>
  <div class="frc-stack">
    ${d.cards
      .map(
        (c, i) => `
    <div class="frc-card">
      <div class="frc-ribbon">
        <div class="frc-ribbon-body">${esc(c.badge ?? pad2(i + 1))}</div>
        <div class="frc-ribbon-tail-l"></div>
        <div class="frc-ribbon-tail-r"></div>
      </div>
      <p class="frc-subtitle">${richSafe(c.subtitle)}</p>
      ${media(c.image, 'frc-img', `특장점 ${pad2(i + 1)} 이미지`)}
      ${c.desc ? `<hr class="frc-divider"><p class="frc-desc">${richSafe(c.desc)}</p>` : ''}
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
