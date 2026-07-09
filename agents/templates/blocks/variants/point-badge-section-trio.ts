/** POINT 아키타입: point-badge-section-trio
 *  원본: 184_포인트_06 — 3포인트 섹션 수직 나열.
 *  각 섹션: "#point 0N." 해시 넘버 태그 → 섹션 제목+서브 → 전체폭 메인이미지 →
 *  배지헤드라인(브랜드색 필+흰 체크원+흰 제목) 위에 특징 서브섹션 반복.
 *  포인트02는 베이지 배경+좌우 교대 카드, 포인트03은 2×2 이미지 카드 그리드.
 *  섹션별 배경색 교체로 시각적 챕터 분리.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 서브 스키마 ── */
const featureItem = z.object({
  image: z.string().optional(),    // 특징 이미지 (url)
  badge: z.string().min(1),        // 배지 헤드라인 (ex. "충격에 강한 100% PC 소재")
  desc: z.string().min(1),         // 배지 아래 설명 (순수 텍스트)
})

const altCardItem = z.object({
  image: z.string().optional(),    // 좌측 또는 우측 이미지
  tag: z.string().min(1),          // 소형 색상 태그 (ex. "detail_01")
  label: z.string().min(1),        // 카드 제목
  text: z.string().min(1),         // 카드 설명
})

const gridCardItem = z.object({
  image: z.string().optional(),    // 카드 상단 이미지
  label: z.string().min(1),        // 카드 제목
  text: z.string().min(1),         // 카드 설명 (2줄 이내)
})

const pointSection = z.discriminatedUnion('layout', [
  z.object({
    layout: z.literal('feature-stack'),   // 포인트01/03형: 배지+이미지 특징 수직 반복
    num: z.string().min(1),               // "01"
    title: z.string().min(1),             // 섹션 대제목 (em,br)
    sub: z.string().min(1),               // 섹션 서브텍스트
    image: z.string().optional(),         // 섹션 전체폭 메인이미지
    features: z.array(featureItem).min(1).max(4),
    bg: z.enum(['white', 'paper']).default('white'),
  }),
  z.object({
    layout: z.literal('altcard'),         // 포인트02형: 베이지 배경+좌우 교대 카드
    num: z.string().min(1),
    title: z.string().min(1),             // (em,br)
    sub: z.string().min(1),
    image: z.string().optional(),
    badgeHead: z.string().min(1),         // 섹션 배지 헤드라인
    badgeSub: z.string().min(1),          // 배지 아래 서브
    cards: z.array(altCardItem).min(2).max(4),
    bg: z.enum(['beige', 'paper']).default('beige'),
  }),
  z.object({
    layout: z.literal('grid-cards'),      // 포인트03형: 2×N 이미지 카드 그리드
    num: z.string().min(1),
    title: z.string().min(1),             // (em,br)
    sub: z.string().min(1),
    image: z.string().optional(),
    badgeHead: z.string().min(1),
    badgeSub: z.string().min(1),
    cards: z.array(gridCardItem).min(2).max(4),
    bg: z.enum(['white', 'paper']).default('white'),
  }),
])

const schema = z.object({
  sections: z.array(pointSection).min(1).max(3),
})
type Data = z.infer<typeof schema>

/* ── CSS ── */
const css = `
/* === point-badge-section-trio (pbst) === */
.pbst{--pbst-brand:var(--accent,#777066);--pbst-brand-d:var(--accent-d,#5a5450);--pbst-beige:#dad6ca}
.pbst-sec{background:var(--bg);padding-bottom:72px}
.pbst-sec--beige{background:var(--pbst-beige,#dad6ca)}
.pbst-sec--paper{background:var(--paper)}

/* 섹션 헤더 */
.pbst-tag{padding:var(--pad-x,56px) var(--pad-x,56px) 0;font-family:var(--font-display);font-size:28px;font-weight:600;color:var(--pbst-brand);letter-spacing:.02em}
.pbst-title{padding:10px var(--pad-x,56px) 0;font-family:var(--font-display);font-size:42px;font-weight:700;color:var(--ink);line-height:1.3}
.pbst-sub{padding:10px var(--pad-x,56px) 24px;font-size:22px;font-weight:400;color:var(--ink-2);line-height:1.55}

/* 전체폭 메인 이미지 */
.pbst-main-img-wrap{width:100%;aspect-ratio:860/580;overflow:hidden;background:var(--muted)}
.pbst-main-img-wrap img,.pbst-main-img-wrap .ph{width:100%;height:100%;object-fit:cover}
/* noimg-safe: 이미지 없으면 최소 높이 4px 구분선으로 강등 */
.pbst-main-img-wrap:not(:has(img)):not(:has(.ph)){min-height:4px;background:var(--line)}

/* 배지 헤드라인 (브랜드색 필 + 흰 원형 체크 + 흰 텍스트) */
.pbst-badge{display:flex;align-items:center;gap:12px;background:var(--pbst-brand);padding:10px 24px 10px 16px;margin:0 var(--pad-x,56px)}
.pbst-badge-check{flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center}
.pbst-badge-check svg{width:20px;height:14px;display:block}
.pbst-badge-text{font-family:var(--font-display);font-size:28px;font-weight:700;color:#fff;line-height:1.2}

/* 특징 설명 (배지 아래 회색 박스) */
.pbst-feat-desc{background:#e7e7e7;margin:0 var(--pad-x,56px);padding:16px 20px;font-size:22px;color:var(--ink);line-height:1.6;text-align:center}

/* 특징 이미지 */
.pbst-feat-img{width:100%;aspect-ratio:760/380;overflow:hidden;background:var(--muted);margin:0}
.pbst-feat-img img,.pbst-feat-img .ph{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
/* noimg-safe */
.pbst-feat-img:not(:has(img)):not(:has(.ph)){display:none}

.pbst-feat-unit{margin-top:28px}

/* 배지 섹션용 헤드 (altcard/grid-cards형) */
.pbst-sec-badge-wrap{padding:0 var(--pad-x,56px);margin-top:28px}
.pbst-sec-badge{display:inline-flex;align-items:center;gap:10px;background:var(--pbst-brand);padding:8px 22px 8px 14px}
.pbst-sec-badge .pbst-badge-check{flex:0 0 32px;width:32px;height:32px}
.pbst-sec-badge .pbst-badge-text{font-size:26px}
.pbst-sec-badge-sub{margin-top:10px;padding:0 var(--pad-x,56px);font-size:22px;color:var(--ink-2);line-height:1.55;text-align:center}

/* 좌우 교대 카드 (altcard) */
.pbst-altcards{display:flex;flex-direction:column;gap:0;margin-top:24px;padding:0 var(--pad-x,56px)}
.pbst-altcard{display:flex;align-items:stretch;border-radius:calc(var(--r-scale,1)*20px);overflow:hidden;background:#fff;margin-bottom:10px}
.pbst-altcard.rev{flex-direction:row-reverse}
.pbst-altcard-img{flex:0 0 50%;aspect-ratio:380/350;overflow:hidden;background:var(--muted)}
.pbst-altcard-img img,.pbst-altcard-img .ph{width:100%;height:100%;object-fit:cover}
/* noimg-safe: 이미지 없으면 카드 이미지 영역 숨김 */
.pbst-altcard-img:not(:has(img)):not(:has(.ph)){display:none}
.pbst-altcard-body{flex:1;padding:24px 20px;display:flex;flex-direction:column;justify-content:center;gap:6px}
.pbst-altcard-tag{font-size:16px;font-weight:600;color:var(--pbst-brand);letter-spacing:.02em}
.pbst-altcard-label{font-size:22px;font-weight:700;color:var(--ink);line-height:1.3}
.pbst-altcard-text{font-size:18px;color:var(--ink-2);line-height:1.6}

/* 2×N 그리드 카드 (grid-cards) */
.pbst-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:24px var(--pad-x,56px) 0;margin-top:0}
.pbst-grid-card{border-radius:calc(var(--r-scale,1)*12px);overflow:hidden;background:var(--pbst-brand)}
.pbst-grid-card-img{width:100%;aspect-ratio:370/300;overflow:hidden;background:var(--muted)}
.pbst-grid-card-img img,.pbst-grid-card-img .ph{width:100%;height:100%;object-fit:cover}
/* noimg-safe */
.pbst-grid-card-img:not(:has(img)):not(:has(.ph)){min-height:100px;background:color-mix(in srgb,var(--pbst-brand) 60%,#000)}
.pbst-grid-card-body{padding:12px 16px 16px;display:flex;flex-direction:column;gap:4px}
.pbst-grid-card-label{font-size:20px;font-weight:700;color:#fff;line-height:1.25}
.pbst-grid-card-text{font-size:16px;color:rgba(255,255,255,.88);line-height:1.55}
`

/* ── 체크 SVG (인라인) ── */
const checkSvg = `<svg viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M1 7L7 13L19 1" stroke="var(--pbst-brand,#777066)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

/* ── 렌더 헬퍼 ── */
function renderBadge(badge: string, _esc: (s: string) => string): string {
  return `<div class="pbst-badge" role="heading" aria-level="3">
  <span class="pbst-badge-check" aria-hidden="true">${checkSvg}</span>
  <span class="pbst-badge-text">${_esc(badge)}</span>
</div>`
}

function renderSecBadge(badge: string, _esc: (s: string) => string): string {
  return `<div class="pbst-sec-badge-wrap">
  <div class="pbst-sec-badge">
    <span class="pbst-badge-check" aria-hidden="true">${checkSvg}</span>
    <span class="pbst-badge-text">${_esc(badge)}</span>
  </div>
</div>`
}

/* ── defineBlock ── */
export const pointBadgeSectionTrio = defineBlock<Data>({
  id: 'point-badge-section-trio',
  archetype: 'point',
  styleTags: ['light', 'template', 'editorial', 'noimg-safe'],
  imageSlots: 9,
  describe:
    '포인트 3섹션 수직 나열. 각 섹션: #point 해시넘버 태그 + 대제목·서브 + 전체폭 메인이미지 + 브랜드색 배지헤드라인(흰 체크원+흰 제목). 레이아웃별 3종: feature-stack(배지+특징이미지+설명 반복), altcard(베이지배경+좌우교대 카드), grid-cards(2×N 이미지카드 그리드). 섹션별 배경색 교체로 챕터 분리.',
  schema,
  css,
  render: (d, { esc, richSafe }) => {
    const sections = d.sections
      .map((sec) => {
        const bgClass =
          sec.layout === 'altcard'
            ? 'pbst-sec--beige'
            : sec.bg === 'paper'
              ? 'pbst-sec--paper'
              : ''

        const mainImg = sec.image
          ? `<div class="pbst-main-img-wrap">${media(sec.image, '', '포인트 메인 이미지')}</div>`
          : `<div class="pbst-main-img-wrap"></div>`

        const header = `
<p class="pbst-tag"># point ${esc(sec.num)}.</p>
<h2 class="pbst-title">${richSafe(sec.title)}</h2>
<p class="pbst-sub">${esc(sec.sub)}</p>
${mainImg}`

        let body = ''

        if (sec.layout === 'feature-stack') {
          body = sec.features
            .map(
              (f) => `
<div class="pbst-feat-unit">
  ${f.image ? `<div class="pbst-feat-img">${media(f.image, '', '특징 이미지')}</div>` : ''}
  ${renderBadge(f.badge, esc)}
  <p class="pbst-feat-desc">${esc(f.desc)}</p>
</div>`,
            )
            .join('')
        } else if (sec.layout === 'altcard') {
          body = `
${renderSecBadge(sec.badgeHead, esc)}
<p class="pbst-sec-badge-sub">${esc(sec.badgeSub)}</p>
<div class="pbst-altcards">
  ${sec.cards
    .map(
      (c, i) => `
  <div class="pbst-altcard${i % 2 === 1 ? ' rev' : ''}">
    <div class="pbst-altcard-img">${media(c.image, '', esc(c.label))}</div>
    <div class="pbst-altcard-body">
      <span class="pbst-altcard-tag">${esc(c.tag)}</span>
      <strong class="pbst-altcard-label">${esc(c.label)}</strong>
      <p class="pbst-altcard-text">${esc(c.text)}</p>
    </div>
  </div>`,
    )
    .join('')}
</div>`
        } else {
          // grid-cards
          body = `
${renderSecBadge(sec.badgeHead, esc)}
<p class="pbst-sec-badge-sub">${esc(sec.badgeSub)}</p>
<div class="pbst-grid" role="list">
  ${sec.cards
    .map(
      (c) => `
  <div class="pbst-grid-card" role="listitem">
    <div class="pbst-grid-card-img">${media(c.image, '', esc(c.label))}</div>
    <div class="pbst-grid-card-body">
      <strong class="pbst-grid-card-label">${esc(c.label)}</strong>
      <p class="pbst-grid-card-text">${esc(c.text)}</p>
    </div>
  </div>`,
    )
    .join('')}
</div>`
        }

        return `<section class="pbst-sec ${bgClass}" aria-label="포인트 ${esc(sec.num)}">${header}${body}</section>`
      })
      .join('')

    return `<div class="pbst">${sections}</div>`
  },
})
