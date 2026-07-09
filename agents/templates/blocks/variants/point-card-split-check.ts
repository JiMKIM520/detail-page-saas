/** POINT 아키타입: point-card-split-check
 *  출처: 피그마 061_인트로_26 — 라벤더 배경 위 흰 라운드 카드, 카드 내부 상단(흰)↔하단(보라) 이중 배경 분할.
 *  구조: 소제목 + 2단 대제목(잉크/액센트) → 제품 사진 → 보라 하단: 대형 흰 헤드 + 원형 체크배지 리스트(2~5항).
 *  이미지 없을 때: 사진 프레임을 숨기고 하단 구역이 카드 전체를 채우도록 noimg-safe 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().optional(),            // 소제목 한 줄 (순수 텍스트)
  titleLine1: z.string().min(1),             // 대제목 1행 — 잉크색 (em,br)
  titleLine2: z.string().min(1),             // 대제목 2행 — 액센트색 (em,br)
  image: z.string().optional(),              // 제품 사진 (url) — 없으면 노이미지 강등
  panelHead: z.string().min(1),             // 하단 보라 패널 대형 헤드라인 (em,br)
  items: z
    .array(z.object({ label: z.string().min(1) }))
    .min(2)
    .max(5),                                 // 원형 체크배지 항목 (2~5개)
})
type Data = z.infer<typeof schema>

export const pointCardSplitCheck = defineBlock<Data>({
  id: 'point-card-split-check',
  archetype: 'point',
  styleTags: ['light', 'bold', 'tech', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '라벤더 배경 위 흰 라운드 카드, 카드 내부 흰↔보라 이중 배경 분할. 상단: 소제목+2단 대제목(잉크/액센트)+제품사진. 하단 보라 패널: 대형 흰 헤드라인+원형 체크배지 리스트(2~5). 전자제품·파워/배터리·테크 카테고리 특징 소개에 적합. 이미지 없으면 사진 프레임 은닉, 보라 패널이 카드 전체 하반부 점유.',
  schema,
  css: `
.polz{background:var(--accent,#6829ec);background:color-mix(in srgb,var(--accent) 14%,#e8e7ff);padding:48px var(--pad-x,56px) 56px}
.polz-card{background:#fff;border-radius:calc(var(--r-scale,1)*48px);overflow:hidden}

/* ── 타이틀 영역 ── */
.polz-top{padding:40px 48px 32px}
.polz-eyebrow{font-family:var(--font-display);font-weight:600;font-size:17px;color:var(--ink-2);letter-spacing:.06em;margin-bottom:10px}
.polz-title1{font-family:var(--font-display);font-weight:500;font-size:38px;line-height:1.18;color:var(--ink)}
.polz-title1 .em{color:var(--ink)}
.polz-title2{font-family:var(--font-display);font-weight:800;font-size:48px;line-height:1.12;color:var(--accent);margin-top:4px}
.polz-title2 .em{color:var(--accent)}

/* ── 제품 사진 ── */
.polz-photo-wrap{width:100%;overflow:hidden;background:color-mix(in srgb,var(--accent) 7%,#f5f4ff)}
.polz-photo{width:100%;height:400px;object-fit:cover;border-radius:var(--shape-photo, 0px);display:block}
.polz-photo-wrap .ph{display:none!important}

/* 이미지 없을 때: 사진 구역 완전 은닉 */
.polz-card.noimg .polz-photo-wrap{display:none}

/* ── 하단 보라 패널 ── */
.polz-panel{background:var(--accent);padding:40px 48px 44px}
.polz-panel-head{font-family:var(--font-display);font-weight:800;font-size:44px;line-height:1.14;color:#fff;text-align:center;letter-spacing:-.01em}
.polz-panel-head .em{color:color-mix(in srgb,#fff 70%,var(--accent))}
.polz-divider{width:48px;height:3px;background:rgba(255,255,255,.4);border-radius:999px;margin:22px auto 28px}

/* 원형 체크배지 리스트 */
.polz-list{display:flex;flex-direction:column;gap:12px}
.polz-item{display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.08);border-radius:calc(var(--r-scale,1)*48px);padding:14px 20px}
.polz-badge{flex:0 0 40px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;color:#fff}
.polz-badge svg{width:20px;height:20px}
.polz-item-label{font-family:var(--font-body);font-weight:600;font-size:20px;color:#fff;line-height:1.3;flex:1;min-width:0}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="polz">
  <div class="polz-card${hasImg ? '' : ' noimg'}">

    <div class="polz-top">
      ${d.eyebrow ? `<p class="polz-eyebrow">${esc(d.eyebrow)}</p>` : ''}
      <p class="polz-title1">${richSafe(d.titleLine1)}</p>
      <p class="polz-title2">${richSafe(d.titleLine2)}</p>
    </div>

    <div class="polz-photo-wrap">
      ${media(d.image, 'polz-photo', '제품 사진')}
    </div>

    <div class="polz-panel">
      <p class="polz-panel-head">${richSafe(d.panelHead)}</p>
      <div class="polz-divider"></div>
      <ul class="polz-list">
        ${d.items
          .map(
            (it) => `
        <li class="polz-item">
          <span class="polz-badge">${icon('check')}</span>
          <span class="polz-item-label">${esc(it.label)}</span>
        </li>`,
          )
          .join('')}
      </ul>
    </div>

  </div>
</section>`
  },
})
