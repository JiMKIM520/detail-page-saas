/** REVIEW 아키타입: review-photo-bg-dashed-cards.
 *  [끝판왕] 리뷰·추천 #15 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 배경 사진 + eyebrow "Real Review" 라벨 + 대형 헤드라인 +
 *  반투명 점선 보더 카드 3장 수직 스택 (각 카드: 원형 아바타 좌 + 다줄 리뷰 텍스트 우). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 배경 사진 URL (풀블리드) */
  bgImage: z.string().optional(),
  /** eyebrow 라벨 — 기본 "Real Review" */
  eyebrow: z.string().optional(),
  /** 섹션 대제목 (em 허용) */
  title: z.string().min(1),
  /** 리뷰 카드 (2~5개) */
  items: z
    .array(
      z.object({
        /** 아바타 이미지 URL (없으면 원형 placeholder) */
        avatar: z.string().optional(),
        /** 아바타 alt / 리뷰어 이름 */
        name: z.string().optional(),
        /** 굵은 리뷰 제목 (em 허용) */
        heading: z.string().min(1),
        /** 본문 리뷰 텍스트 (em, br 허용) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const reviewPhotoBgDashedCards = defineBlock<Data>({
  id: 'review-photo-bg-dashed-cards',
  archetype: 'review',
  styleTags: ['photo-bg', 'dashed', 'card', 'social-proof', 'template'],
  imageSlots: 4,
  describe:
    '리얼 리뷰(배경사진+점선카드). 풀블리드 배경 사진 위에 eyebrow 라벨 + 대형 헤드라인 + 반투명 점선 보더 카드(원형 아바타+리뷰 텍스트) 2~5장 수직 스택. 사회적 증거 강조.',
  schema,
  css: `
/* review-photo-bg-dashed-cards — 접두사 rpbdc- */
.rpbdc{position:relative;padding:56px 24px 64px;overflow:hidden;word-break:keep-all;overflow-wrap:break-word}
.rpbdc-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.rpbdc-bg.ph{position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:0;background:rgba(60,80,60,.7)}
/* 배경이 없을 때 폴백 그라데이션 */
.rpbdc::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,50,30,.55) 0%,rgba(20,40,20,.72) 100%);z-index:1}
.rpbdc-inner{position:relative;z-index:2}
.rpbdc-eyebrow{font-family:var(--font-body),'Pretendard',sans-serif;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.82);margin-bottom:10px}
.rpbdc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,6.5vw,38px);line-height:1.22;letter-spacing:-.02em;color:#fff;margin-bottom:28px}
/* 다크 배경 — .em은 밝은 accent로 override */
.rpbdc-title .em{color:var(--accent)}
.rpbdc-cards{display:flex;flex-direction:column;gap:14px}
.rpbdc-card{display:flex;align-items:flex-start;gap:14px;background:rgba(255,255,255,.18);border:1.5px dashed rgba(255,255,255,.55);border-radius:12px;padding:16px 18px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.rpbdc-avatar{flex:0 0 52px;width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.45)}
.rpbdc-avatar.ph{flex:0 0 52px;width:52px;height:52px;border-radius:50%;border:2px dashed rgba(255,255,255,.45);background:rgba(255,255,255,.12);font-size:11px;color:rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;box-shadow:none}
.rpbdc-text{flex:1;min-width:0}
.rpbdc-heading{font-family:var(--font-display);font-weight:800;font-size:15px;line-height:1.4;color:#fff;margin-bottom:5px}
.rpbdc-heading .em{color:var(--accent)}
.rpbdc-body{font-family:var(--font-body),'Pretendard',sans-serif;font-size:13px;line-height:1.65;color:rgba(255,255,255,.80)}
.rpbdc-body .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrow = esc(d.eyebrow ?? 'Real Review')

    const cards = d.items
      .map((it) => {
        const avatarHtml = it.avatar
          ? `<img class="rpbdc-avatar" src="${esc(it.avatar)}" alt="${esc(it.name ?? '리뷰어')}">`
          : `<div class="rpbdc-avatar ph">${esc(it.name ? it.name.slice(0, 2) : '리뷰')}</div>`

        return `
    <div class="rpbdc-card">
      ${avatarHtml}
      <div class="rpbdc-text">
        <div class="rpbdc-heading">${richSafe(it.heading)}</div>
        ${it.body ? `<div class="rpbdc-body">${richSafe(it.body)}</div>` : ''}
      </div>
    </div>`
      })
      .join('')

    return `
<section class="rpbdc">
  ${media(d.bgImage, 'rpbdc-bg', '배경 이미지')}
  <div class="rpbdc-inner">
    <p class="rpbdc-eyebrow">${eyebrow}</p>
    <h2 class="rpbdc-title">${richSafe(d.title)}</h2>
    <div class="rpbdc-cards">${cards}
    </div>
  </div>
</section>`
  },
})
