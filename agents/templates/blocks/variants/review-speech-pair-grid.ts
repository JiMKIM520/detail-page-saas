/** REVIEW 아키타입(템플릿 충실 재현): review-speech-pair-grid.
 *  피그마 096_후기_07 패턴 재구성.
 *  다크 배경 + 상단 IMG 타이틀 배경(영문 수퍼+한글 대제목 오버레이) +
 *  좌우 2열 말풍선 카드(키워드 뱃지+사진+텍스트+별점) 4개 교차 배치.
 *  Subtract 꼬리 벡터: inline SVG clip-path + CSS로 재현. noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const reviewItemSchema = z.object({
  keyword: z.string().min(1),          // 상단 뱃지 키워드 (예: "신생아 피부 만족 후기")
  image: z.string().optional(),        // 카드 내 사진 (url)
  text: z.string().min(1),             // 리뷰 본문 (순수 텍스트)
  reviewer: z.string().min(1),         // 작성자 ID (예: "이*진")
  stars: z.number().int().min(1).max(5).optional(), // 별점 (기본 5)
})

const schema = z.object({
  eyebrow: z.string().optional(),      // 영문 수퍼 라벨 (예: "real review")
  title: z.string().min(1),            // 한글 대제목 (em,br 허용)
  heroImage: z.string().optional(),    // 타이틀 배경 이미지 (url)
  reviews: z
    .array(reviewItemSchema)
    .min(2)
    .max(4),                           // 2~4개, 2열로 자동 배치
})
type Data = z.infer<typeof schema>

/** 별점 SVG 인라인 렌더 (gradient fill 재현) */
function starsSvg(count: number): string {
  const filled = Math.min(5, Math.max(0, count))
  return Array.from({ length: 5 }, (_, i) => {
    const id = `sg${i}`
    const c = i < filled
    return `<svg width="16" height="16" viewBox="0 0 16 16" style="display:inline-block" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c ? '#FFD93D' : '#DDDDDD'}"/><stop offset="100%" stop-color="${c ? '#F6A621' : '#CCCCCC'}"/></linearGradient></defs><polygon points="8,1 10.2,6 15.5,6.5 11.5,10 12.8,15.5 8,12.5 3.2,15.5 4.5,10 0.5,6.5 5.8,6" fill="url(#${id})"/></svg>`
  }).join('')
}

/** 말풍선 꼬리 SVG: 좌열=꼬리 왼쪽 하단, 우열=꼬리 오른쪽 하단 */
function tailSvg(side: 'left' | 'right'): string {
  // 피그마 Subtract 벡터: 카드 하단에서 삼각형 꼬리가 돌출
  // 좌열: 왼쪽 하단, 우열: 오른쪽 하단
  const pts =
    side === 'left'
      ? 'M0,0 L36,0 L36,12 Z'
      : 'M0,0 L36,0 L0,12 Z'
  return `<svg class="rffe-tail" viewBox="0 0 36 12" width="36" height="12" aria-hidden="true"><path d="${pts}" fill="var(--paper,#ffffff)"/></svg>`
}

export const reviewSpeechPairGrid = defineBlock<Data>({
  id: 'review-speech-pair-grid',
  archetype: 'review',
  styleTags: ['dark', 'template', 'chat', 'grid', 'noimg-safe'],
  imageSlots: 5, // 타이틀 배경 1 + 카드 내 최대 4
  describe:
    '다크 배경 2열 말풍선 카드 리뷰. IMG 타이틀 배경+영문수퍼+한글 대제목 오버레이, 좌우 2열 흰색 라운드 카드(키워드 뱃지+사진+본문+별점)+Subtract 꼬리 SVG. 채팅 UI 연상. 4개 후기 최적.',
  schema,
  css: `
.rffe{background:var(--bg,#1f1f1f);color:var(--ink,#fff);padding:0 0 56px}
/* 타이틀 영역 */
.rffe-hd{position:relative;width:100%;height:280px;overflow:hidden;display:flex;align-items:flex-end}
.rffe-hd-bg{position:absolute;inset:0;object-fit:cover;width:100%;height:100%;border-radius:0}
.rffe-hd-bg.ph{position:absolute;inset:0;background:color-mix(in srgb,var(--brand,#327809) 60%,#000)}
.rffe-hd-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.18) 60%,transparent 100%)}
.rffe-hd-text{position:relative;z-index:1;padding:0 var(--pad-x,56px) 32px;flex:1}
.rffe-eyebrow{display:block;font-family:var(--font-lat,var(--font-display));font-weight:800;font-size:clamp(36px,5vw,80px);color:#fff;line-height:1;letter-spacing:-.01em;opacity:.92}
.rffe-title{display:block;font-family:var(--font-display);font-weight:600;font-size:clamp(22px,3vw,42px);color:#fff;line-height:1.25;margin-top:6px}
.rffe-title .em{color:var(--em-dark,#FFF7EA)}
/* em 다크 스코프 오버라이드 */
.rffe .em{color:var(--em-dark,#FFF7EA)}
/* 카드 그리드 */
.rffe-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:28px var(--pad-x,56px) 0}
/* 카드 셀 */
.rffe-cell{display:flex;flex-direction:column;align-items:flex-start}
/* 카드 본체 */
.rffe-card{background:var(--paper,#ffffff);border-radius:calc(var(--r-scale,1)*20px);padding:14px 14px 16px;width:100%;box-sizing:border-box;color:var(--ink,#1f1f1f)}
/* 키워드 뱃지 */
.rffe-badge{display:block;background:var(--brand,#327809);color:#fff;border-radius:calc(var(--r-scale,1)*8px);font-size:13px;font-weight:600;text-align:center;padding:6px 10px;line-height:1.3;margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* 카드 내 사진 */
.rffe-photo{width:100%;aspect-ratio:16/10;border-radius:calc(var(--r-scale,1)*8px);overflow:hidden;background:color-mix(in srgb,var(--accent,#327809) 10%,#f0f0f0);margin-bottom:10px}
.rffe-photo img,.rffe-photo .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}
/* 이미지 없을 때: 사진 프레임 숨김 (noimg-safe) */
.rffe-photo--hidden{display:none}
/* 본문 텍스트 */
.rffe-text{font-size:13px;color:var(--ink-2,#5e5e5e);line-height:1.65;flex:1}
/* 아이디+별점 */
.rffe-meta{margin-top:10px}
.rffe-reviewer{font-size:12px;color:var(--muted,#bbbbbb);margin-bottom:4px}
.rffe-stars{display:flex;gap:2px;align-items:center;line-height:1}
/* 말풍선 꼬리 */
.rffe-tail{display:block;margin-top:0;flex-shrink:0}
/* 좌열: 꼬리 왼쪽 정렬 */
.rffe-cell--left .rffe-tail{margin-left:24px}
/* 우열: 꼬리 오른쪽 정렬 */
.rffe-cell--right .rffe-tail{margin-left:auto;margin-right:24px}
/* 형태 토큰 */
.rffe-shape-photo{border-radius:var(--shape-photo,calc(var(--r-scale,1)*8px))}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 카드별로 이미지 유무에 따라 사진 프레임 토글
    const cols: string[][] = [[], []]
    d.reviews.forEach((r, i) => {
      const colIdx = i % 2 // 0=왼쪽열, 1=오른쪽열
      const side = colIdx === 0 ? 'left' : 'right'
      const hasImg = typeof r.image === 'string' && r.image.length > 0
      const stars = r.stars ?? 5

      const photoHtml = hasImg
        ? `<div class="rffe-photo">${media(r.image, '', '리뷰 사진')}</div>`
        : `<div class="rffe-photo rffe-photo--hidden" aria-hidden="true"></div>`

      const cardHtml = `
  <div class="rffe-cell rffe-cell--${side}">
    <div class="rffe-card">
      <span class="rffe-badge">${esc(r.keyword)}</span>
      ${photoHtml}
      <p class="rffe-text">${esc(r.text)}</p>
      <div class="rffe-meta">
        <div class="rffe-reviewer">${esc(r.reviewer)}</div>
        <div class="rffe-stars" aria-label="${stars}점 / 5점">${starsSvg(stars)}</div>
      </div>
    </div>
    ${tailSvg(side)}
  </div>`
      cols[colIdx].push(cardHtml)
    })

    // 두 열을 인터리브: 좌[0] 우[0] 좌[1] 우[1] ... 순으로 DOM에 배치
    // grid-template-columns:1fr 1fr 이므로 선언 순서 그대로 왼→오 배치됨
    const maxLen = Math.max(cols[0].length, cols[1].length)
    const cells: string[] = []
    for (let row = 0; row < maxLen; row++) {
      if (cols[0][row]) cells.push(cols[0][row])
      if (cols[1][row]) cells.push(cols[1][row])
    }

    const heroHtml = d.heroImage
      ? media(d.heroImage, 'rffe-hd-bg', '타이틀 배경')
      : `<div class="rffe-hd-bg ph" aria-hidden="true"></div>`

    return `
<section class="rffe">
  <div class="rffe-hd">
    ${heroHtml}
    <div class="rffe-hd-scrim"></div>
    <div class="rffe-hd-text">
      ${d.eyebrow ? `<span class="rffe-eyebrow">${esc(d.eyebrow)}</span>` : ''}
      <span class="rffe-title">${richSafe(d.title)}</span>
    </div>
  </div>
  <div class="rffe-grid">
    ${cells.join('')}
  </div>
</section>`
  },
})
