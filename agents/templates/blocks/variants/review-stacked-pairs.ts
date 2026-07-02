/** REVIEW 아키타입(템플릿 충실 재현): review-stacked-pairs.
 *  와디즈 200섹션 06_고객리뷰 1279:1014 — 중앙정렬 헤더 + [좌정렬 별점 행 + 전체폭 텍스트 카드] 4쌍
 *  + accent 풀폭 CTA 배너. 아바타/이미지 없음. 텍스트 전용 리뷰 쌍 반복 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'

const STAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.2 6.8.8-5 4.6 1.3 6.7-6-3.4-6 3.4 1.3-6.7-5-4.6 6.8-.8z"/></svg>'
const star5 = (_icon: (n: string) => string): string => Array.from({ length: 5 }, () => STAR).join('')

const schema = z.object({
  eyebrow: z.string().min(1).optional(),   // 예 "Customer Review"
  subtitle: z.string().min(1).optional(),  // 소제목 (em,br)
  title: z.string().min(1),                // 대제목 (em,br)
  reviews: z
    .array(
      z.object({
        body: z.string().min(1),           // 리뷰 본문 (em,br)
      }),
    )
    .min(2)
    .max(4),
  cta: z.string().min(1).optional(),       // 하단 배너 문구 (em,br) 예 "우리 상품은 NN명의 고객들이 인정했습니다."
})
type Data = z.infer<typeof schema>

export const reviewStackedPairs = defineBlock<Data>({
  id: 'review-stacked-pairs',
  archetype: 'review',
  styleTags: ['light', 'trust', 'template', 'centered', 'minimal'],
  imageSlots: 0,
  describe:
    '고객 리뷰(별점+텍스트 카드 쌍). 중앙정렬 헤더(영문 아이브로+소제목+대제목) + [좌정렬 5별 행 + 전체폭 텍스트 카드] 2~4쌍 반복 + accent 풀폭 CTA 배너. 이미지 없음. 텍스트 전용 사회적 증거.',
  schema,
  css: `
.rsp{background:var(--bg);color:var(--ink)}

/* 헤더 */
.rsp-hd{padding:52px 56px 12px;text-align:center}
.rsp-eye-wrap{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:14px}
.rsp-eye-line{flex:0 0 56px;height:1px;background:var(--accent)}
.rsp-eye{font-size:15px;font-weight:700;letter-spacing:.1em;color:var(--accent);padding:0 12px}
.rsp-sub{font-size:16px;color:var(--ink-2);margin-bottom:8px;line-height:1.6}
.rsp-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:var(--accent)}
.rsp .em{color:var(--accent);font-weight:800}

/* 리뷰 목록 */
.rsp-list{padding:32px 40px 40px;display:flex;flex-direction:column;gap:28px}

/* 별점 행 */
.rsp-stars{display:flex;gap:5px;color:var(--accent);margin-bottom:10px}
.rsp-stars svg{width:22px;height:22px}

/* 텍스트 카드 */
.rsp-card{width:100%;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:20px 24px}
.rsp-body{font-size:15px;color:var(--ink-2);line-height:1.75}
.rsp-body .em{color:var(--accent);font-weight:700}

/* CTA 배너 */
.rsp-cta{background:var(--accent);color:#fff;padding:44px 40px;text-align:center}
.rsp-cta-text{font-family:var(--font-display);font-weight:800;font-size:38px;letter-spacing:-.02em;line-height:1.25;color:#fff}
.rsp-cta-text .em{color:#fff;opacity:.85}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rsp">
  <div class="rsp-hd">
    ${d.eyebrow ? `<div class="rsp-eye-wrap"><span class="rsp-eye-line"></span><span class="rsp-eye">${esc(d.eyebrow)}</span><span class="rsp-eye-line"></span></div>` : ''}
    ${d.subtitle ? `<p class="rsp-sub">${richSafe(d.subtitle)}</p>` : ''}
    <h2 class="rsp-title">${richSafe(d.title)}</h2>
  </div>
  <div class="rsp-list">
    ${d.reviews
      .map(
        (r) => `
    <div class="rsp-pair">
      <div class="rsp-stars">${star5(icon)}</div>
      <div class="rsp-card"><p class="rsp-body">${richSafe(r.body)}</p></div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.cta ? `<div class="rsp-cta"><p class="rsp-cta-text">${richSafe(d.cta)}</p></div>` : ''}
</section>`,
})
