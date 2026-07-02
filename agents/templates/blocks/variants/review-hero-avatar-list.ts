/** REVIEW 아키타입: review-hero-avatar-list.
 *  [끝판왕] 리뷰·추천 #16 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 히어로 상품 이미지가 리뷰 섹션 헤더를 겸함 + 풀쿼트 대형 타이포그래피(사회적 증거) +
 *  아바타+텍스트 행의 순수 수직 반복(장식 없음). 복잡도 low. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 헤더 겸 히어로 상품 이미지 URL */
  heroImage: z.string().optional(),
  /** 히어로 이미지 alt */
  heroImageAlt: z.string().optional(),
  /** 풀쿼트 대형 헤드라인 (em 허용 — 강조 어절 accent) */
  quote: z.string().min(1),
  /** 쿼트 아래 보조 카피 (선택) */
  quoteCaption: z.string().optional(),
  /** 아바타+텍스트 반복 리뷰 행 (2~6개) */
  reviews: z
    .array(
      z.object({
        /** 아바타 이미지 URL (없으면 이니셜 placeholder) */
        avatar: z.string().optional(),
        /** 리뷰어 이름 또는 닉네임 */
        name: z.string().min(1),
        /** 리뷰 본문 (em/br 허용) */
        body: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const reviewHeroAvatarList = defineBlock<Data>({
  id: 'review-hero-avatar-list',
  archetype: 'review',
  styleTags: ['social-proof', 'clean', 'avatar', 'quote', 'template'],
  imageSlots: 3,
  describe:
    '리뷰/사회적 증거. 히어로 상품 이미지가 리뷰 섹션 헤더를 겸함 + 풀쿼트 대형 타이포그래피(accent-d 강조) + 아바타+이름+본문 행의 순수 수직 반복(장식 없음). 단순하고 신뢰감 있는 고객 후기 레이아웃.',
  schema,
  css: `
/* review-hero-avatar-list — 접두사 rhal- */
.rhal{background:var(--paper);word-break:keep-all;overflow-wrap:break-word}

/* 히어로 배너(섹션 헤더 겸) */
.rhal-hero{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.rhal-hero.ph{width:100%;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.06);border:2px dashed var(--line);color:var(--muted);font-size:13px}

/* 쿼트 영역 */
.rhal-quote-wrap{padding:36px 32px 20px;text-align:center}
.rhal-quote{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5.2vw,32px);line-height:1.35;letter-spacing:-.02em;color:var(--ink);position:relative}
.rhal-quote::before{content:'“';display:block;font-family:var(--font-lat);font-size:48px;line-height:.8;color:var(--accent-d);margin-bottom:4px;opacity:.7}
.rhal-quote .em{color:var(--accent-d)}
.rhal-caption{margin-top:10px;font-size:14px;color:var(--muted);line-height:1.6}

/* 리뷰 행 리스트 */
.rhal-list{padding:8px 0 40px}
.rhal-item{display:flex;align-items:flex-start;gap:14px;padding:20px 28px;border-top:1px solid var(--line)}
.rhal-item:last-child{border-bottom:1px solid var(--line)}

/* 아바타 */
.rhal-avatar{flex:0 0 48px;width:48px;height:48px;border-radius:50%;object-fit:cover;display:block;background:var(--bg);border:1px solid var(--line)}
.rhal-avatar.ph{flex:0 0 48px;width:48px;height:48px;border-radius:50%;background:var(--bg);border:1.5px dashed var(--line);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--muted)}

/* 텍스트 */
.rhal-text{flex:1;min-width:0}
.rhal-name{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:5px;letter-spacing:.01em}
.rhal-body{font-size:14px;color:var(--ink);line-height:1.65}
.rhal-body .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const hero = d.heroImage
      ? `<img class="rhal-hero" src="${attr(d.heroImage)}" alt="${attr(d.heroImageAlt ?? '상품 이미지')}">`
      : `<div class="rhal-hero ph">${esc(d.heroImageAlt ?? '상품 사진 기입')}</div>`

    const quoteWrap = `
<div class="rhal-quote-wrap">
  <p class="rhal-quote">${richSafe(d.quote)}</p>
  ${d.quoteCaption ? `<p class="rhal-caption">${esc(d.quoteCaption)}</p>` : ''}
</div>`

    const items = d.reviews
      .map((r) => {
        const avatarEl = r.avatar
          ? `<img class="rhal-avatar" src="${attr(r.avatar)}" alt="${attr(r.name)}">`
          : `<div class="rhal-avatar ph" aria-hidden="true">&#128100;</div>`
        return `
  <div class="rhal-item">
    ${avatarEl}
    <div class="rhal-text">
      <div class="rhal-name">${esc(r.name)}</div>
      <div class="rhal-body">${richSafe(r.body)}</div>
    </div>
  </div>`
      })
      .join('')

    return `
<section class="rhal">
  ${hero}
  ${quoteWrap}
  <div class="rhal-list">${items}
  </div>
</section>`
  },
})
