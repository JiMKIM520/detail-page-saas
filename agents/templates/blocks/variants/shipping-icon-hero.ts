/** SHIPPING 아키타입(템플릿 충실 재현): shipping-icon-hero.
 *  와디즈 200섹션 16_배송 섹션_아이콘 히어로+다크푸터 패턴 재구성 (Figma 416:177).
 *  다크 배경 + 중앙 대형 트럭 아이콘 + 대형 흰 제목 + 굵은 부제 + 보조 텍스트 →
 *  라이트 배경 불릿 안내 목록 → 풀폭 다크 밴드 클로징 CTA.
 *  기존 shipping-info(좌측보더 행), shipping-notice(타원라벨+카드)와 완전히 다른 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const schema = z.object({
  /** 히어로 아이콘 이름 (기본 "truck") */
  heroIcon: z.enum(ICON_NAMES).optional(),
  /** 섹션 대제목 (예: "배송 안내") */
  title: z.string().min(1),
  /** 굵은 부제 — 핵심 배송 조건 (em/br 허용, 예: "평일 오후 4시 이전 결제 시, 당일 출고!") */
  subtitle: z.string().min(1),
  /** 부제 아래 보조 안내 (예: "월~금 기준 / 주말, 공휴일 제외") */
  caption: z.string().min(1).optional(),
  /** 불릿 안내 항목 (em/br 허용) */
  bullets: z.array(z.string().min(1)).min(1).max(6),
  /** 하단 풀폭 CTA 문구 (예: "빠르고 안전하게 보내드릴게요!") */
  closing: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const shippingIconHero = defineBlock<Data>({
  id: 'shipping-icon-hero',
  archetype: 'shipping' as any,
  styleTags: ['dark', 'centered', 'icon', 'template', 'structured'],
  imageSlots: 0,
  describe:
    '배송 안내(아이콘 히어로+다크 푸터). 다크 배경 중앙 대형 아이콘(트럭)+흰 대제목+굵은 부제+보조캡션 → 라이트 배경 불릿 안내 목록 → 풀폭 다크 밴드 클로징 CTA. 기존 shipping-info·shipping-notice와 구조 완전 차별화.',
  schema,
  css: `
/* ── shipping-icon-hero: sih prefix ── */

/* ─ 히어로 다크 구역 ─ */
.sih-hero{background:var(--ink);color:#fff;padding:64px 56px 72px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:0}
.sih-icon{width:120px;height:120px;color:var(--accent);margin-bottom:28px;display:flex;align-items:center;justify-content:center}
.sih-icon svg{width:100%;height:100%}
.sih-title{font-family:var(--font-display);font-weight:800;font-size:64px;color:#fff;letter-spacing:-.02em;line-height:1.05;margin-bottom:20px}
.sih-subtitle{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:800;font-size:24px;color:#fff;line-height:1.45;margin-bottom:10px}
.sih-subtitle .em{color:var(--accent)}
.sih-caption{font-size:16px;color:rgba(255,255,255,.5);line-height:1.5;letter-spacing:.01em}

/* ─ 라이트 불릿 구역 ─ */
.sih-body{background:var(--bg);padding:52px 56px 56px}
.sih-list{display:flex;flex-direction:column;gap:20px}
.sih-item{display:flex;align-items:flex-start;gap:14px;font-size:17px;color:var(--ink);line-height:1.7}
.sih-bullet{flex-shrink:0;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-top:10px}
.sih-text{flex:1}
.sih-text .em{color:var(--ink);font-weight:700}

/* ─ 풀폭 다크 CTA 밴드 ─ */
.sih-footer{background:var(--ink);padding:44px 56px;text-align:center}
.sih-closing{font-family:var(--font-display);font-weight:800;font-size:28px;color:#fff;letter-spacing:-.01em;line-height:1.3}
.sih-closing .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const heroIcon = d.heroIcon ?? 'truck'
    const bulletsHtml = d.bullets
      .map(
        (b) => `
    <div class="sih-item">
      <span class="sih-bullet"></span>
      <span class="sih-text">${richSafe(b)}</span>
    </div>`,
      )
      .join('')

    return `
<section>
  <div class="sih-hero">
    <div class="sih-icon">${icon(heroIcon)}</div>
    <h2 class="sih-title">${esc(d.title)}</h2>
    <p class="sih-subtitle">${richSafe(d.subtitle)}</p>
    ${d.caption ? `<p class="sih-caption">${esc(d.caption)}</p>` : ''}
  </div>
  <div class="sih-body">
    <div class="sih-list">
      ${bulletsHtml}
    </div>
  </div>
  <div class="sih-footer">
    <p class="sih-closing">${richSafe(d.closing)}</p>
  </div>
</section>`
  },
})
