/** POINT 아키타입: point-pill-flow.
 *  084_문제제기_06 피그마 프레임 흡수.
 *  다크 배경 + 상단 중앙 제목 + 3개 좌이미지-우텍스트 r:999 필 카드 리스트 +
 *  화살표 전환 벡터 + 중앙 결론 텍스트(대제목+구분선+보조문) + 하단 전폭 사진.
 *  이미지 부재 시 필 카드를 텍스트 전폭 레이아웃으로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),           // 상단 중앙 질문/제목 (em,br)
  cards: z
    .array(
      z.object({
        image: z.string().optional(), // 필 카드 좌측 사진 (url)
        label: z.string().min(1),     // 카드 강조 라벨
        text: z.string().min(1),      // 카드 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closerHeading: z.string().min(1),   // 결론 대제목 (em,br)
  closerBody: z.string().min(1),      // 결론 보조 문구 (em,br)
  heroImage: z.string().optional(),   // 하단 전폭 사진 (url)
})
type Data = z.infer<typeof schema>

export const pointPillFlow = defineBlock<Data>({
  id: 'point-pill-flow',
  archetype: 'point',
  styleTags: ['dark', 'editorial', 'problem', 'noimg-safe'],
  imageSlots: 4,   // 카드당 1 (최대 4) + 하단 전폭 1 (heroImage)
  describe:
    '문제 제기 다크 블록. 상단 중앙 질문 제목 + r:999 필 카드(좌이미지+우텍스트) 2~4개 + 화살표 흐름 전환 + 결론 대제목/구분선/보조문 + 하단 전폭 사진. 이미지 없으면 텍스트 전폭 강등.',
  schema,
  css: `
.ppf{background:var(--bg);color:var(--ink);padding:72px 0 0}
/* 다크 배경 richSafe em 오버라이드 */
.ppf .em{color:var(--em-dark,#FFF7EA)}

/* ── 제목 영역 ── */
.ppf-hd{text-align:center;padding:0 var(--pad-x,56px) 56px}
.ppf-title{font-family:var(--font-display);font-weight:700;font-size:clamp(32px,5vw,60px);line-height:1.35;color:#b7b7b7}

/* ── 카드 리스트 ── */
.ppf-list{display:flex;flex-direction:column;gap:16px;padding:0 var(--pad-x,56px)}

/* 필 카드 — 이미지 있는 경우 */
.ppf-card{display:flex;align-items:stretch;background:#363636;border-radius:999px;overflow:hidden;min-height:200px}
.ppf-card-img-wrap{flex:0 0 38%;max-width:310px;position:relative}
.ppf-card-img-wrap img,.ppf-card-img-wrap .ph{width:100%;height:100%;object-fit:cover;border-radius:calc(var(--r-scale,1)*20px) 0 0 calc(var(--r-scale,1)*20px)}
.ppf-card-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:28px 36px 28px 28px}
.ppf-card-label{font-family:var(--font-display);font-weight:600;font-size:clamp(17px,2.2vw,28px);color:#d2d2d2;margin-bottom:8px}
.ppf-card-text{font-size:clamp(14px,1.8vw,22px);color:#a1a1a1;line-height:1.6}
.ppf-card-text .em{color:var(--em-dark,#FFF7EA)}

/* 이미지 없는 강등 레이아웃 */
.ppf-card--noimg{border-radius:calc(var(--r-scale,1)*20px)}
.ppf-card--noimg .ppf-card-body{padding:28px 40px}

/* ── 화살표 전환 ── */
.ppf-arrow{display:flex;justify-content:center;align-items:center;padding:28px 0}
.ppf-arrow svg{width:40px;height:56px;opacity:.55;color:#d9d9d9}

/* ── 결론 영역 ── */
.ppf-closer{text-align:center;padding:0 var(--pad-x,56px) 56px}
.ppf-closer-heading{font-family:var(--font-display);font-weight:500;font-size:clamp(26px,4vw,50px);color:#d9d9d9;line-height:1.4;margin-bottom:24px}
.ppf-closer-heading .em{color:var(--em-dark,#FFF7EA)}
.ppf-closer-rule{width:100%;height:1px;background:rgba(255,255,255,.15);margin-bottom:24px}
.ppf-closer-body{font-family:var(--font-body);font-weight:400;font-size:clamp(16px,2.4vw,34px);color:#bebebe;line-height:1.7}
.ppf-closer-body .em{color:var(--em-dark,#FFF7EA)}

/* ── 하단 전폭 사진 ── */
.ppf-hero{width:100%;aspect-ratio:860/800;position:relative;overflow:hidden;border-radius:var(--shape-photo, 0px)}
.ppf-hero img{width:100%;height:100%;object-fit:cover;display:block}
.ppf-hero .ph{width:100%;height:100%;display:none!important}
`,
  render: (d, { esc, richSafe }) => {
    // 전 카드에 이미지가 있을 때만 이미지 레이아웃 사용 — 하나라도 빠지면 텍스트 전폭 강등
    const withImgs = d.cards.every((c) => typeof c.image === 'string' && c.image.trim().length > 0)

    const cardHtml = d.cards
      .map((c) => {
        if (withImgs) {
          return `<div class="ppf-card">
  <div class="ppf-card-img-wrap">${media(c.image, '', esc(c.label))}</div>
  <div class="ppf-card-body">
    <p class="ppf-card-label">${esc(c.label)}</p>
    <p class="ppf-card-text">${richSafe(c.text)}</p>
  </div>
</div>`
        }
        return `<div class="ppf-card ppf-card--noimg">
  <div class="ppf-card-body">
    <p class="ppf-card-label">${esc(c.label)}</p>
    <p class="ppf-card-text">${richSafe(c.text)}</p>
  </div>
</div>`
      })
      .join('\n')

    const heroHtml = d.heroImage
      ? `<div class="ppf-hero">${media(d.heroImage, '', '결론 이미지')}</div>`
      : ''

    return `<section class="ppf">
  <div class="ppf-hd">
    <h2 class="ppf-title">${richSafe(d.title)}</h2>
  </div>
  <div class="ppf-list">
    ${cardHtml}
  </div>
  <div class="ppf-arrow">
    <svg viewBox="0 0 40 56" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="20" y1="2" x2="20" y2="46"/>
      <polyline points="8,36 20,50 32,36"/>
    </svg>
  </div>
  <div class="ppf-closer">
    <h3 class="ppf-closer-heading">${richSafe(d.closerHeading)}</h3>
    <div class="ppf-closer-rule"></div>
    <p class="ppf-closer-body">${richSafe(d.closerBody)}</p>
  </div>
  ${heroHtml}
</section>`
  },
})
