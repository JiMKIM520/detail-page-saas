/** POINT/FEATURE 아키타입: point-bubble(헤더+말풍선 사진), feature-fullbleed(풀블리드 오버레이). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── point-bubble ──────────────────────────────────────────────
const pointSchema = z.object({
  label: z.string().optional(),
  title: z.string().min(1), // em 강조 허용
  image: z.string().optional(),
  bubbleTop: z.string().optional(),
  bubbleBottom: z.string().optional(),
  lead: z.string().optional(), // br/em 허용
})
type PointData = z.infer<typeof pointSchema>

export const pointBubble = defineBlock<PointData>({
  id: 'point-bubble',
  archetype: 'point',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 1,
  describe: '포인트 헤더(라벨+2톤 제목) + 사진 위 말풍선 2개 + 강조 본문. 핵심 특징을 사진으로 강조.',
  schema: pointSchema,
  css: `
.pb{position:relative;padding:72px var(--pad-x,56px) 56px;text-align:center;background:var(--bg)}
.pb-h{margin-top:18px;font-size:40px}
.pb-fig{position:relative;width:560px;margin:40px auto 0}
.pb-media{width:100%;height:380px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*24px));box-shadow:0 22px 44px -20px rgba(42,33,24,.45)}
.pb-bub{position:absolute;background:#fff;border:2.5px solid var(--brand);border-radius:calc(var(--r-scale,1)*22px);padding:11px 19px;font-size:25px;color:var(--accent);box-shadow:0 10px 20px rgba(42,33,24,.22);white-space:nowrap;font-weight:700}
.pb-bub.t{top:24px;right:-14px;transform:rotate(-4deg)}
.pb-bub.b{bottom:30px;left:-16px;transform:rotate(3deg)}
.pb-bub::after{content:"";position:absolute;width:24px;height:17px;background:#fff;border-right:2.5px solid var(--brand);border-bottom:2.5px solid var(--brand)}
.pb-bub.t::after{left:28px;bottom:-14px;transform:rotate(40deg)}
.pb-bub.b::after{right:28px;top:-14px;transform:rotate(220deg)}
.pb-lead{max-width:600px;margin:34px auto 0;font-size:20px;font-weight:600;line-height:1.6;color:var(--ink-2)}
`,
  render: (d, { esc, richSafe }) => `
<section class="pb">
  <div class="wm"></div>
  ${d.label ? `<span class="lab">${esc(d.label)}</span>` : ''}
  <h2 class="disp pb-h">${richSafe(d.title)}</h2>
  <figure class="pb-fig">
    ${media(d.image, 'pb-media', '강조 사진')}
    ${d.bubbleTop ? `<span class="pb-bub t hand">${esc(d.bubbleTop)}</span>` : ''}
    ${d.bubbleBottom ? `<span class="pb-bub b hand">${esc(d.bubbleBottom)}</span>` : ''}
  </figure>
  ${d.lead ? `<p class="pb-lead">${richSafe(d.lead)}</p>` : ''}
</section>`,
})

// ── feature-fullbleed ─────────────────────────────────────────
const featureSchema = z.object({
  image: z.string().optional(),
  kicker: z.string().optional(),
  title: z.string().min(1),
})
type FeatureData = z.infer<typeof featureSchema>

export const featureFullbleed = defineBlock<FeatureData>({
  id: 'feature-fullbleed',
  archetype: 'feature',
  // noimg-safe: 이미지 부재 시 다크 밴드로 강등 렌더 — 오버레이 붕괴 드롭 규칙에서 제외
  styleTags: ['editorial', 'premium', 'bold', 'noimg-safe'],
  imageSlots: 1,
  describe: '풀블리드 대형 사진 + 하단 그라데이션 위 명조 캡션. 한 장면을 강렬하게.',
  schema: featureSchema,
  css: `
.ff{position:relative}
.ff-media{width:100%;height:520px;object-fit:cover}
.ff-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(20,15,10,.72))}
.ff-cap{position:absolute;left:0;right:0;bottom:46px;text-align:center;color:#fff;padding:0 60px}
.ff-k{font-size:12px;letter-spacing:.4em;text-transform:uppercase;opacity:.85}
.ff-t{font-family:var(--font-serif);font-weight:700;font-size:40px;margin-top:14px;text-shadow:0 2px 16px rgba(0,0,0,.4)}
/* 이미지 부재 시 — absolute 캡션이 이웃 섹션 위로 떠오르는 높이 붕괴 방지: 일반 플로우 다크 밴드로 강등 */
.ff--noimg{background:var(--brand);padding:72px 60px}
.ff--noimg .ff-cap{position:static;padding:0}
`,
  render: (d, { esc }) =>
    d.image
      ? `
<section class="ff">
  ${media(d.image, 'ff-media', '풀블리드 이미지')}
  <div class="ff-ov"></div>
  <div class="ff-cap">
    ${d.kicker ? `<p class="ff-k">${esc(d.kicker)}</p>` : ''}
    <h2 class="ff-t">${esc(d.title)}</h2>
  </div>
</section>`
      : `
<section class="ff ff--noimg">
  <div class="ff-cap">
    ${d.kicker ? `<p class="ff-k">${esc(d.kicker)}</p>` : ''}
    <h2 class="ff-t">${esc(d.title)}</h2>
  </div>
</section>`,
})
