/** REVIEW 아키타입: review-bubble-grid
 *  피그마 258_후기_11 구조 흡수 — 2열 말풍선 카드(사진+컬러 타이틀 바+리뷰+별+ID) + 하단 전폭 라이프스타일 이미지.
 *  말풍선 꼬리(하단 향하는 CSS 삼각)로 리뷰 카드를 대화체로 연출.
 *  noimg-safe: 카드 이미지 전무 시 사진 영역 숨기고 텍스트 전용 카드로 강등,
 *              하단 전폭 이미지 없으면 해당 영역 통째 생략. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const reviewItem = z.object({
  photo: z.string().optional(),        // 카드 상단 사진 (url)
  titleBar: z.string().min(1),         // 컬러 타이틀 바 텍스트 (순수 텍스트)
  body: z.string().min(1),             // 리뷰 본문 텍스트 (em,br 허용)
  stars: z.number().int().min(1).max(5).default(5),
  reviewer: z.string().min(1),         // 마스킹 ID (예: 이*진)
})

const schema = z.object({
  headline: z.string().min(1),         // 영문 대형 라틴 헤드라인 (em,br 허용)
  subheadline: z.string().optional(),  // 한글 세미볼드 부제 (순수 텍스트)
  desc: z.string().optional(),         // 헤더 하단 설명 (순수 텍스트)
  reviews: z.array(reviewItem).min(2).max(4),  // 2~4개 (2열 배치)
  lifestyleImage: z.string().optional(),       // 하단 전폭 라이프스타일 사진 (url)
  accentBar: z.string().optional(),    // 타이틀 바 색상 오버라이드 (CSS color 값)
})

type Data = z.infer<typeof schema>

export const reviewBubbleGrid = defineBlock<Data>({
  id: 'review-bubble-grid',
  archetype: 'review',
  styleTags: ['warm', 'lifestyle', 'mixed', 'noimg-safe'],
  imageSlots: 5,  // 최대 카드 4장 사진 + 하단 전폭 1장
  describe:
    '실구매 후기 2열 말풍선 카드 + 하단 전폭 라이프스타일 이미지. 각 카드 = 상단 사진(옵션)·컬러 타이틀 바·후기 본문·별점·익명 ID·하향 꼬리. 따뜻한 웜 베이지 배경. 패션/라이프스타일 제품 후기 섹션에 적합.',
  schema,
  css: `
.rlym{background:var(--bg);padding:64px var(--pad-x,56px) 0;color:var(--ink)}
.rlym-hd{text-align:center;margin-bottom:44px}
.rlym-lat{font-family:var(--font-lat);font-size:72px;font-weight:600;line-height:1;letter-spacing:-.01em;color:var(--ink)}
.rlym-sub{font-family:var(--font-body);font-size:30px;font-weight:600;color:var(--accent-d);margin-top:14px}
.rlym-desc{font-family:var(--font-body);font-size:18px;font-weight:300;color:var(--ink-2);margin-top:16px;line-height:1.72;max-width:640px;margin-left:auto;margin-right:auto}
.rlym-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.rlym-col{display:flex;flex-direction:column;gap:24px}
/* 말풍선 카드 */
.rlym-card{position:relative;background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*12px);overflow:visible}
.rlym-card-inner{border-radius:calc(var(--r-scale,1)*12px);overflow:hidden}
/* 카드 상단 사진 */
.rlym-photo{width:100%;aspect-ratio:317/200;object-fit:cover;display:block;background:color-mix(in srgb,var(--accent) 8%,var(--paper,#fff))}
.rlym-photo.ph{display:none!important}
/* 컬러 타이틀 바 */
.rlym-bar{background:var(--rlym-bar-color,var(--accent-d));padding:10px 16px;text-align:center}
.rlym-bar-text{font-family:var(--font-body);font-size:15px;font-weight:500;color:#fff;line-height:1.4}
/* 리뷰 본문 */
.rlym-body{padding:14px 16px 12px;font-family:var(--font-body);font-size:14px;color:var(--ink-2);line-height:1.72}
.rlym-body .em{color:var(--accent-d);font-weight:700}
/* 별점 + ID 행 */
.rlym-meta{display:flex;align-items:center;justify-content:space-between;padding:0 16px 14px}
.rlym-stars{display:flex;gap:3px;color:var(--accent)}
.rlym-star{width:15px;height:15px;fill:currentColor;flex-shrink:0}
.rlym-star-empty{opacity:.22}
.rlym-id{font-family:var(--font-body);font-size:13px;color:var(--muted);font-weight:400}
/* 말풍선 꼬리 — 하향 삼각, 카드 좌측에서 1/4 위치 */
.rlym-tail{position:absolute;bottom:-18px;left:40px;width:0;height:0;border-left:14px solid transparent;border-right:8px solid transparent;border-top:18px solid var(--paper,#fff);filter:drop-shadow(0 3px 4px rgba(0,0,0,.07))}
/* 하단 전폭 라이프스타일 이미지 */
.rlym-life{margin-top:48px;margin-left:calc(-1*var(--pad-x,56px));margin-right:calc(-1*var(--pad-x,56px));width:calc(100% + 2*var(--pad-x,56px));display:block}
.rlym-life img{width:100%;aspect-ratio:860/1280;object-fit:cover;display:block;background:color-mix(in srgb,var(--accent) 6%,var(--bg))}
.rlym-life img.ph{display:none!important}
`,
  render: (d, { esc, richSafe }) => {
    // 모든 카드에 사진이 있어야만 사진 영역 표시 (올오어낫싱 — noimg-safe)
    const withPhotos = d.reviews.every(
      (r) => typeof r.photo === 'string' && /^(https?:\/\/|data:|\/)/.test(r.photo.trim()),
    )

    // 별점 SVG 렌더
    const renderStars = (count: number): string => {
      const starPath = 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z'
      return Array.from({ length: 5 }, (_, i) =>
        `<svg class="rlym-star${i < count ? '' : ' rlym-star-empty'}" viewBox="0 0 24 24"><path d="${starPath}"/></svg>`,
      ).join('')
    }

    // 리뷰 카드 렌더
    const renderCard = (r: Data['reviews'][number]): string => `
<div class="rlym-card">
  <div class="rlym-card-inner">
    ${withPhotos ? media(r.photo, 'rlym-photo', esc(r.titleBar)) : ''}
    <div class="rlym-bar"><span class="rlym-bar-text">${esc(r.titleBar)}</span></div>
    <div class="rlym-body">${richSafe(r.body)}</div>
    <div class="rlym-meta">
      <div class="rlym-stars">${renderStars(r.stars)}</div>
      <span class="rlym-id">${esc(r.reviewer)}</span>
    </div>
  </div>
  <div class="rlym-tail"></div>
</div>`

    // 2열 분배: 짝수 인덱스 → 좌, 홀수 인덱스 → 우
    const left = d.reviews.filter((_, i) => i % 2 === 0)
    const right = d.reviews.filter((_, i) => i % 2 === 1)

    const barColor = d.accentBar ? `style="--rlym-bar-color:${d.accentBar}"` : ''

    // 하단 전폭 이미지
    const hasLifeImg =
      typeof d.lifestyleImage === 'string' &&
      /^(https?:\/\/|data:|\/)/.test(d.lifestyleImage.trim())
    const lifeSection = hasLifeImg
      ? `<div class="rlym-life">${media(d.lifestyleImage, '', '라이프스타일')}</div>`
      : ''

    return `
<section class="rlym"${barColor ? ` ${barColor}` : ''}>
  <div class="rlym-hd">
    <div class="rlym-lat">${richSafe(d.headline)}</div>
    ${d.subheadline ? `<div class="rlym-sub">${esc(d.subheadline)}</div>` : ''}
    ${d.desc ? `<p class="rlym-desc">${esc(d.desc)}</p>` : ''}
  </div>
  <div class="rlym-grid">
    <div class="rlym-col">${left.map(renderCard).join('')}</div>
    <div class="rlym-col">${right.map(renderCard).join('')}</div>
  </div>
  ${lifeSection}
</section>`
  },
})
