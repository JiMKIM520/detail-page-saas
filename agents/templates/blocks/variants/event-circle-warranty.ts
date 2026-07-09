/** EVENT 아키타입: event-circle-warranty
 *  138_이벤트_03 패턴 재구성.
 *  다크 네이비 배경 + 좌측 인디고 강조 헤드라인/본문/주석 텍스트 블록
 *  + 하단 원형 제품 사진 위에 그라데이션 원형 배지가 겹치는 AS 보증 이벤트 레이아웃.
 *  noimg-safe: 이미지 없을 때 원형 프레임을 다크 틴트 패널로 강등해 레이아웃 붕괴 방지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  headline: z.string().min(1),       // (em,br) — 큰 인디고 강조 헤드라인
  body: z.string().min(1),           // (em,br) — 흰색 본문
  footnote: z.string().optional(),   // 순수 텍스트 — 소형 회색 주석 (* 단서 등)
  badgeLine1: z.string().min(1),     // 배지 1행 (보증 연도 등)
  badgeLine2: z.string().min(1),     // 배지 2행 (보증 레이블)
  image: z.string().optional(),      // 원형 제품 사진 (url)
})
type Data = z.infer<typeof schema>

export const eventCircleWarranty = defineBlock<Data>({
  id: 'event-circle-warranty',
  archetype: 'event',
  styleTags: ['dark', 'tech', 'electronics', 'warranty', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크 네이비 배경 AS·보증 이벤트 블록. 상단 좌측 인디고 대형 헤드라인 + 흰색 본문 + 회색 주석, 하단 원형 제품 사진에 그라데이션 뱃지 원이 우하단에 겹치는 구조. 전자제품·가전·AS 이벤트에 적합.',
  schema,
  css: `
.eoei{background:#020846;padding:60px var(--pad-x,56px) 0;color:#fff;position:relative;overflow:hidden}
.eoei .em{color:var(--em-dark,#FFF7EA)}
.eoei-txt{padding-bottom:48px}
.eoei-hl{font-family:var(--font-display);font-weight:700;font-size:clamp(52px,7.5vw,85px);line-height:1.12;color:#4752c2;word-break:keep-all}
.eoei-body{margin-top:28px;font-size:clamp(18px,2.5vw,22px);font-weight:500;line-height:1.72;color:#fff}
.eoei-note{margin-top:18px;font-size:clamp(13px,1.6vw,16px);font-weight:300;color:#b8b8c8;line-height:1.6}
.eoei-photo-wrap{position:relative;width:100%;padding-bottom:56px}
.eoei-circle-frame{position:relative;width:calc(var(--r-scale,1)*0 + 75.6%);aspect-ratio:1/1;border-radius:50%;overflow:hidden;background:color-mix(in srgb,#4752c2 18%,#020846);margin:0 auto}
.eoei-circle-frame img,.eoei-circle-frame .ph{width:100%;height:100%;object-fit:cover;border-radius:50%}
/* noimg-safe: .ph는 공유 baseCss에서 display:none!important — 원형 틴트 배경 자체가 폴백 역할 */
.eoei-badge{position:absolute;right:calc(var(--pad-x,56px) - 10px);bottom:0;width:clamp(140px,22%,220px);height:clamp(140px,22%,220px);border-radius:50%;background:conic-gradient(from 135deg,#c2c9f5 0%,#4752c2 40%,#fff 60%,#c2c9f5 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 8px 28px -6px rgba(71,82,194,.55)}
.eoei-badge-inner{position:absolute;inset:8px;border-radius:50%;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.35)}
.eoei-badge-l1{font-family:var(--font-display);font-weight:700;font-size:clamp(22px,3.6vw,42px);color:#1a1f5e;text-align:center;line-height:1.05;position:relative;z-index:1}
.eoei-badge-l2{font-family:var(--font-display);font-weight:700;font-size:clamp(11px,1.8vw,18px);color:#1a1f5e;text-align:center;letter-spacing:.02em;position:relative;z-index:1}
`,
  render: (d, { esc, richSafe }) => `
<section class="eoei">
  <div class="eoei-txt">
    <h2 class="eoei-hl">${richSafe(d.headline)}</h2>
    <p class="eoei-body">${richSafe(d.body)}</p>
    ${d.footnote ? `<p class="eoei-note">${esc(d.footnote)}</p>` : ''}
  </div>
  <div class="eoei-photo-wrap">
    <div class="eoei-circle-frame">${media(d.image, '', '제품 이미지')}</div>
    <div class="eoei-badge">
      <div class="eoei-badge-inner"></div>
      <span class="eoei-badge-l1">${esc(d.badgeLine1)}</span>
      <span class="eoei-badge-l2">${esc(d.badgeLine2)}</span>
    </div>
  </div>
</section>`,
})
