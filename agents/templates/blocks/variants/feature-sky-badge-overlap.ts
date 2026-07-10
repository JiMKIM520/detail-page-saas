/** FEATURE 아키타입: feature-sky-badge-overlap.
 *  피그마 281_제품소개_28 흡수 — 하늘색 배경 + 브랜드 라벨/수평선 + 대형 타이틀 영역 위를
 *  제품 이미지가 침범(오버랩)하고, 하단에 원형 아이콘 배지 3열이 핵심 스펙을 나열하는 구조.
 *  이미지 미제공 시 배지 행 단독 렌더로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().optional(),           // 브랜드 라벨 (순수 텍스트)
  title: z.string().min(1),              // 대형 헤드라인 (em,br)
  subtitle: z.string().optional(),       // 헤드라인 아래 부제 (em,br)
  image: z.string().optional(),          // 제품 누끼/컷아웃 이미지 (url)
  items: z
    .array(
      z.object({
        icon: z.string().min(1),         // 아이콘 이름 (shared ICON_NAMES)
        label: z.string().min(1),        // 배지 하단 텍스트
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureSkyBadgeOverlap = defineBlock<Data>({
  id: 'feature-sky-badge-overlap',
  archetype: 'feature',
  // noimg-safe: 이미지 없을 때 오버랩 프레임을 생략하고 배지 행만 렌더
  styleTags: ['light', 'product', 'tech', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '하늘색 배경 단일 제품 피처 블록. 브랜드 라벨+수평선+대형 타이틀 상단 영역을 제품 이미지가 위로 침범(오버랩)하고, 하단 원형 흰색 아이콘 배지 2~4개가 핵심 스펙을 나열. 이미지 없을 때 배지 행 단독 강등.',
  schema,
  css: `
.fzmn{position:relative;background:#87cbf5;padding:0 0 56px;overflow:hidden}
.fzmn-header{padding:36px var(--pad-x,56px) 0;position:relative;z-index:2}
.fzmn-brand-row{display:flex;align-items:center;gap:18px;margin-bottom:28px}
.fzmn-brand{font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--ink);letter-spacing:.06em;white-space:nowrap}
.fzmn-rule{flex:1;height:1px;background:var(--ink);opacity:.3}
.fzmn-title{font-family:var(--font-display);font-weight:700;font-size:clamp(36px,5.6vw,56px);color:var(--ink);line-height:1.1;letter-spacing:-.02em}
.fzmn-title .em{color:var(--accent-d)}
.fzmn-subtitle{margin-top:12px;font-family:var(--font-body);font-weight:400;font-size:clamp(16px,2.2vw,22px);color:var(--ink);line-height:1.55;opacity:.8}
.fzmn-subtitle .em{opacity:1;font-weight:600;color:var(--ink)}
.fzmn-img-wrap{position:relative;z-index:1;margin-top:-60px;width:100%;display:flex;justify-content:center}
.fzmn-img-wrap img{width:88%;max-width:760px;aspect-ratio:4/3;object-fit:contain;border-radius:var(--shape-photo, calc(var(--r-scale,1)*24px));display:block}
/* 이미지 없을 때 오버랩 여백 유지 */
.fzmn-img-wrap.noimg{margin-top:0;height:0;overflow:hidden}
.fzmn-badges{display:flex;justify-content:center;gap:clamp(16px,3vw,40px);padding:40px var(--pad-x,56px) 0;flex-wrap:wrap}
.fzmn-badge{display:flex;flex-direction:column;align-items:center;gap:12px;min-width:100px}
.fzmn-badge-circle{width:clamp(72px,10vw,100px);height:clamp(72px,10vw,100px);border-radius:50%;background:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px -6px rgba(0,0,0,.18)}
.fzmn-badge-circle svg{width:44%;height:44%;stroke:var(--ink);color:var(--ink)}
.fzmn-badge-label{font-family:var(--font-body);font-weight:600;font-size:clamp(13px,1.6vw,16px);color:var(--ink);text-align:center;letter-spacing:.01em}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0
    return `
<section class="fzmn">
  <div class="fzmn-header">
    ${d.brand ? `<div class="fzmn-brand-row">
      <span class="fzmn-brand">${esc(d.brand)}</span>
      <span class="fzmn-rule"></span>
    </div>` : ''}
    <h2 class="fzmn-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fzmn-subtitle">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  <div class="fzmn-img-wrap${hasImg ? '' : ' noimg'}">
    ${hasImg ? media(d.image, '', '제품 이미지') : ''}
  </div>
  <div class="fzmn-badges">
    ${d.items.map(item => `
    <div class="fzmn-badge">
      <div class="fzmn-badge-circle">${icon(item.icon)}</div>
      <span class="fzmn-badge-label">${esc(item.label)}</span>
    </div>`).join('')}
  </div>
</section>`
  },
})
