/** COMPARE 아키타입(템플릿 충실 재현): compare-phone-mockup.
 *  와디즈 200섹션 07_차별화 비교 _184:3416(폰 목업 오버랩 + 3D 아이콘) 패턴을 토큰 기반으로 재구성.
 *  세로 오프셋 폰 카드 2개: BEFORE(X+불릿) / AFTER(하트+불릿+CTA버튼) + 다크 마무리 배너. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const bulletSchema = z.object({
  text: z.string().min(1), // (em,br)
})

const schema = z.object({
  badge: z.string().min(1).optional(),          // 상단 pill 뱃지 (예: "Before&After")
  title: z.string().min(1),                     // 대제목 (em,br)
  subtitle: z.string().min(1).optional(),        // 부제목
  beforeLabel: z.string().min(1).optional(),     // 기본 "BEFORE"
  beforeIcon: z.enum(ICON_NAMES).optional(),     // BEFORE 카드 위 아이콘 (기본 X 아이콘)
  beforeItems: z.array(bulletSchema).min(2).max(4), // BEFORE 불릿 목록 (em,br)
  afterLabel: z.string().min(1).optional(),      // 기본 "AFTER"
  afterIcon: z.enum(ICON_NAMES).optional(),      // AFTER 카드 위 아이콘 (기본 heart)
  afterItems: z.array(bulletSchema).min(2).max(4), // AFTER 불릿 목록 (em,br)
  afterCta: z.string().min(1).optional(),        // AFTER 카드 내 버튼 텍스트
  closer: z.string().min(1).optional(),          // 하단 다크 배너 텍스트 (em,br)
})
type Data = z.infer<typeof schema>

export const comparePhoneMockup = defineBlock<Data>({
  id: 'compare-phone-mockup',
  archetype: 'compare',
  styleTags: ['premium', 'template', 'comparison', 'playful', 'mockup'],
  imageSlots: 0,
  describe:
    '차별화 비교(폰 목업 오버랩). 상단 pill뱃지+대제목+서브 → 세로 오프셋 폰 카드 2개(BEFORE:X아이콘·그레이 / AFTER:하트아이콘·accent·CTA버튼) → 다크 마무리 배너. 아이콘만 사용, 이미지 슬롯 없음.',
  schema,
  css: `
.cpm{background:var(--bg);padding:54px 0 0;overflow:hidden}
.cpm-hd{text-align:center;padding:0 52px 0}
.cpm-badge{display:inline-block;font-size:14px;font-weight:700;letter-spacing:.06em;color:var(--ink-2);border:1.5px solid var(--line);border-radius:999px;padding:6px 20px;margin-bottom:20px}
.cpm-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:var(--ink);letter-spacing:-.02em;line-height:1.12}
.cpm-sub{margin-top:12px;font-size:15px;color:var(--ink-2)}
.cpm-stage{position:relative;padding:60px 44px 0;min-height:520px;display:flex;align-items:flex-start;justify-content:center;gap:16px}
.cpm-card{flex:1;max-width:380px;border-radius:28px;overflow:visible;position:relative}
.cpm-card-before{margin-top:0;z-index:1}
.cpm-card-after{margin-top:40px;z-index:2}
.cpm-icon-wrap{position:absolute;top:-44px;left:50%;transform:translateX(-50%);width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--paper);box-shadow:0 8px 24px -6px rgba(0,0,0,.22)}
.cpm-card-before .cpm-icon-wrap{background:#EBEBEE}
.cpm-card-after .cpm-icon-wrap{background:color-mix(in srgb,var(--accent) 15%,#fff);top:-48px}
.cpm-icon-wrap svg{width:40px;height:40px}
.cpm-card-before .cpm-icon-wrap svg{color:#9A9AA8}
.cpm-card-after .cpm-icon-wrap svg{color:var(--accent)}
.cpm-inner{border-radius:28px;overflow:hidden;box-shadow:0 16px 40px -12px rgba(0,0,0,.28)}
.cpm-head{text-align:center;font-family:var(--font-display);font-weight:800;font-size:18px;letter-spacing:.1em;padding:18px 20px}
.cpm-head-b{background:#DADADF;color:#8A8A96}
.cpm-head-a{background:var(--accent);color:#fff}
.cpm-body{background:var(--paper);padding:20px 24px 24px}
.cpm-item{display:flex;align-items:flex-start;gap:12px;padding:14px 0;font-size:15px;line-height:1.6;color:var(--ink-2)}
.cpm-item + .cpm-item{border-top:1px solid var(--line)}
.cpm-bullet-b{flex:0 0 20px;width:20px;height:20px;border-radius:50%;background:#DADADF;display:flex;align-items:center;justify-content:center;margin-top:2px}
.cpm-bullet-b svg{width:11px;height:11px;color:#8A8A96}
.cpm-bullet-a{flex:0 0 20px;width:20px;height:20px;border-radius:50%;background:color-mix(in srgb,var(--accent) 18%,transparent);display:flex;align-items:center;justify-content:center;margin-top:2px}
.cpm-bullet-a svg{width:11px;height:11px;color:var(--accent)}
.cpm-card-after .cpm-item{color:var(--ink);font-weight:500}
.cpm-cta-btn{display:block;width:100%;margin-top:20px;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:16px;letter-spacing:.04em;text-align:center;padding:16px 20px;border-radius:14px;border:none;cursor:pointer}
.cpm-footer{background:var(--brand);color:#fff;text-align:center;padding:48px 44px 52px;margin-top:52px}
.cpm-footer-text{font-family:var(--font-display);font-weight:800;font-size:40px;line-height:1.3;letter-spacing:-.01em}
.cpm-footer-text .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const bLabel = esc(d.beforeLabel ?? 'BEFORE')
    const aLabel = esc(d.afterLabel ?? 'AFTER')

    // X mark SVG for BEFORE (not in ICON_NAMES — inline custom)
    const xIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    const beforeIconSvg = d.beforeIcon ? icon(d.beforeIcon) : xIcon
    const afterIconSvg = d.afterIcon ? icon(d.afterIcon) : icon('heart')

    // check bullet for AFTER, x-small bullet for BEFORE
    const xBullet = `<span class="cpm-bullet-b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>`
    const checkBullet = `<span class="cpm-bullet-a">${icon('check')}</span>`

    const beforeItems = d.beforeItems
      .map((it) => `<div class="cpm-item">${xBullet}<span>${richSafe(it.text)}</span></div>`)
      .join('')

    const afterItems = d.afterItems
      .map((it) => `<div class="cpm-item">${checkBullet}<span>${richSafe(it.text)}</span></div>`)
      .join('')

    return `
<section class="cpm">
  <div class="cpm-hd">
    ${d.badge ? `<div class="cpm-badge">${esc(d.badge)}</div>` : ''}
    <h2 class="cpm-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="cpm-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="cpm-stage">
    <div class="cpm-card cpm-card-before">
      <div class="cpm-icon-wrap">${beforeIconSvg}</div>
      <div class="cpm-inner">
        <div class="cpm-head cpm-head-b">${bLabel}</div>
        <div class="cpm-body">${beforeItems}</div>
      </div>
    </div>
    <div class="cpm-card cpm-card-after">
      <div class="cpm-icon-wrap">${afterIconSvg}</div>
      <div class="cpm-inner">
        <div class="cpm-head cpm-head-a">${aLabel}</div>
        <div class="cpm-body">
          ${afterItems}
          ${d.afterCta ? `<button class="cpm-cta-btn">${esc(d.afterCta)}</button>` : ''}
        </div>
      </div>
    </div>
  </div>
  ${d.closer ? `<div class="cpm-footer"><p class="cpm-footer-text">${richSafe(d.closer)}</p></div>` : ''}
</section>`
  },
})
