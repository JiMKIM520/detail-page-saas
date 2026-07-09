/** REVIEW 아키타입: review-stat-overlay
 *  피그마 097_후기_08 구조 흡수.
 *  상단 중앙 2단 타이틀 → 통계 3행(라벨+가로선+강조 숫자) → 전면 풀블리드 사진 오버레이
 *  → 하단 카드 리스트 3행(좌 썸네일+우 키워드뱃지+후기 본문+별점+작성자). 다크 배경.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statRowSchema = z.object({
  label: z.string().min(1),       // 통계 행 라벨 (예: "누적 리뷰수")
  value: z.string().min(1),       // 강조 숫자 (예: "1,234")
  suffix: z.string().optional(),  // 단위/기호 (예: "+", "점")
})

const reviewItemSchema = z.object({
  image: z.string().optional(),           // 썸네일 이미지 URL
  badge: z.string().min(1),              // 키워드 뱃지 (예: "20대 배낭여행객")
  text: z.string().min(1),               // 후기 본문 — 브리프 근거 시만 em 사용
  stars: z.number().int().min(1).max(5).default(5), // 별점
  reviewer: z.string().optional(),        // 작성자 표시명 (예: "김*현")
})

const schema = z.object({
  subtitle: z.string().optional(),        // 상단 보조 한 줄 (em/br)
  title: z.string().min(1),              // 상단 대제목 강조 (em/br)
  stats: z.array(statRowSchema).min(2).max(4),
  heroImage: z.string().optional(),       // 전면 풀블리드 사진 URL
  reviews: z.array(reviewItemSchema).min(1).max(4),
})

type Data = z.infer<typeof schema>

export const reviewStatOverlay = defineBlock<Data>({
  id: 'review-stat-overlay',
  archetype: 'review',
  // noimg-safe: heroImage 없으면 오버레이 영역 숨김, reviewItem 썸네일 없으면 카드 레이아웃 유지(텍스트 폭 확장)
  styleTags: ['dark', 'premium', 'stats', 'noimg-safe'],
  imageSlots: 4, // 풀블리드 1 + 카드 썸네일 최대 3
  describe:
    '다크 배경 복합 리뷰 블록. 중앙 2단 타이틀 + 누적 통계 3행(라벨—가로선—강조 숫자) + 전면 풀블리드 사진 오버레이 + 하단 썸네일+키워드뱃지+별점 카드 리스트. 실증 수치와 사진이 함께 있어 신뢰도 최대화.',
  schema,
  css: `
/* ── 외부 래퍼 ── */
.regy{background:var(--bg,#090801);color:var(--ink,#fff);padding:64px 0 0}

/* ── 헤더 ── */
.regy-hd{text-align:center;padding:0 var(--pad-x,56px) 48px}
.regy-sub{font-size:20px;font-weight:500;color:var(--ink-2,#ccc);margin-bottom:10px;line-height:1.5}
.regy-sub .em{color:var(--em-dark,#FFF7EA)}
.regy-title{font-family:var(--font-display);font-weight:700;font-size:clamp(44px,6vw,72px);line-height:1.1;color:var(--accent)}
.regy-title .em{color:var(--em-dark,#FFF7EA)}

/* ── 통계 행 ── */
.regy-stats{padding:0 calc(var(--pad-x,56px) + 20px) 40px}
.regy-stat{display:flex;align-items:center;gap:0;height:72px}
.regy-stat-label{font-size:clamp(18px,2.5vw,28px);font-weight:500;color:var(--ink,#fff);white-space:nowrap;flex:0 0 auto}
.regy-stat-line{flex:1;height:1px;background:currentColor;opacity:.35;margin:0 16px}
.regy-stat-num{display:flex;align-items:baseline;gap:2px;flex:0 0 auto}
.regy-stat-val{font-family:var(--font-display);font-weight:600;font-size:clamp(40px,5.5vw,64px);color:var(--accent);line-height:1;text-align:right}
.regy-stat-sfx{font-family:var(--font-display);font-weight:600;font-size:clamp(32px,4.5vw,54px);color:var(--accent);line-height:1}

/* ── 풀블리드 이미지 오버레이 ── */
.regy-hero{width:100%;aspect-ratio:860/820;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,#090801);border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
.regy-hero img,.regy-hero .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* noimg-safe: 이미지 없으면(.ph) display:none은 base CSS가 처리 — 래퍼 높이 0이 되므로 padding-top 대신 min-height로 붕괴 방지 */
.regy-hero:has(.ph){display:none}

/* ── 카드 리스트 ── */
.regy-list{padding:0}
.regy-card{display:flex;align-items:stretch;gap:0;background:var(--paper,#fff);border-bottom:1px solid var(--line,#eee)}
.regy-card:first-child{border-top:none}

/* 썸네일 영역 */
.regy-thumb-wrap{flex:0 0 220px;width:220px;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,#f5f5f5)}
.regy-thumb-wrap img,.regy-thumb-wrap .ph{width:100%;height:100%;object-fit:cover}
/* noimg-safe: 썸네일 없으면 텍스트 영역이 전체 폭을 차지 */
.regy-card:has(.regy-thumb-wrap .ph) .regy-thumb-wrap{display:none}
.regy-card:has(.regy-thumb-wrap .ph) .regy-body{padding-left:calc(var(--pad-x,56px) + 20px)}

/* 카드 텍스트 영역 */
.regy-body{flex:1;padding:24px 28px 24px 24px;display:flex;flex-direction:column;gap:10px;color:var(--ink,#111)}
.regy-badge{display:inline-block;background:var(--accent);color:var(--brand,#090801);font-weight:700;font-size:15px;padding:5px 14px;border-radius:calc(var(--r-scale,1)*5px);line-height:1.4;align-self:flex-start}
.regy-text{font-size:15px;line-height:1.68;color:var(--ink-2,#4b4b4b);flex:1}
.regy-text .em{color:var(--accent-d)}
.regy-meta{display:flex;align-items:center;gap:12px}
.regy-stars{color:var(--accent);font-size:15px;letter-spacing:1px}
.regy-reviewer{font-size:13px;color:var(--muted,#b7b7b7);font-weight:500}

/* ── 다크 영역 em 스코프 오버라이드 (규약 필수) ── */
.regy .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const starStr = (n: number): string => '★'.repeat(Math.max(1, Math.min(5, n)))

    const statsHtml = d.stats
      .map(
        (s) => `
    <div class="regy-stat">
      <span class="regy-stat-label">${esc(s.label)}</span>
      <span class="regy-stat-line" aria-hidden="true"></span>
      <div class="regy-stat-num">
        <span class="regy-stat-val">${esc(s.value)}</span>${s.suffix ? `<span class="regy-stat-sfx">${esc(s.suffix)}</span>` : ''}
      </div>
    </div>`,
      )
      .join('')

    const heroHtml = `
  <div class="regy-hero" aria-hidden="${d.heroImage ? 'false' : 'true'}">
    ${media(d.heroImage, '', '대표 후기 사진')}
  </div>`

    const cardsHtml = d.reviews
      .map(
        (r) => `
    <article class="regy-card">
      <div class="regy-thumb-wrap">
        ${media(r.image, '', '후기 사진')}
      </div>
      <div class="regy-body">
        <span class="regy-badge">${esc(r.badge)}</span>
        <p class="regy-text">${richSafe(r.text)}</p>
        <div class="regy-meta">
          <span class="regy-stars" aria-label="${r.stars}점">${starStr(r.stars)}</span>
          ${r.reviewer ? `<span class="regy-reviewer">${esc(r.reviewer)}</span>` : ''}
        </div>
      </div>
    </article>`,
      )
      .join('')

    return `
<section class="regy">
  <div class="regy-hd">
    ${d.subtitle ? `<p class="regy-sub">${richSafe(d.subtitle)}</p>` : ''}
    <h2 class="regy-title">${richSafe(d.title)}</h2>
  </div>
  <div class="regy-stats">${statsHtml}
  </div>${heroHtml}
  <div class="regy-list">${cardsHtml}
  </div>
</section>`
  },
})
