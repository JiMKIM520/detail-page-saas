/** POINT 아키타입: point-pill-cascade-review
 *  피그마 238_문제제기_11 흡수 — 다크 그라디언트 배경 위 밑줄 강조 헤드라인 + 대형 제품 사진 +
 *  계단식 알약 리스트(3개, 폭 단계적 확장) + 붓글씨체 감성 인용 + 설명 텍스트 +
 *  썸네일+키워드칩+별점 리뷰 카드 3열 구조.
 *  noimg-safe: 제품 사진 없으면 사진 영역 숨김 처리(레이아웃 붕괴 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pillSchema = z.object({
  text: z.string().min(1),
})

const reviewCardSchema = z.object({
  image: z.string().optional(),       // 썸네일 (url)
  keyword: z.string().min(1),         // 키워드 칩 텍스트
  desc: z.string().min(1),            // 리뷰 설명
  stars: z.number().int().min(1).max(5).optional(), // 별점 (브리프 근거 시만)
})

const schema = z.object({
  subTitle: z.string().min(1),        // 상단 소제목 (밑줄 강조 라인 위)
  title: z.string().min(1),           // 대형 주제목 (em/br 허용)
  productImage: z.string().optional(), // 대형 제품 이미지 (url)
  pills: z.array(pillSchema).min(2).max(4), // 계단식 알약 리스트 (2~4개)
  quote: z.string().min(1),           // 붓글씨체 감성 문구 (예: "속상해요!!")
  desc: z.string().min(1),            // 설명 본문 (em/br 허용)
  reviews: z.array(reviewCardSchema).min(2).max(4), // 리뷰 카드 (브리프 근거 시만)
})
type Data = z.infer<typeof schema>

/** 별점 → SVG 별 렌더 (filled/empty) */
function starRow(count: number): string {
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < count
      ? `<svg class="pudt-star filled" viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>`
      : `<svg class="pudt-star" viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>`,
  )
  return `<div class="pudt-stars">${stars.join('')}</div>`
}

/** 계단식 알약 너비 계산 — 2~4개일 때 첫 번째가 가장 좁고 마지막이 가장 넓음 */
function pillWidth(index: number, total: number): string {
  // 가장 좁음(55%) → 가장 넓음(90%), total개 균등 분포
  const min = 55
  const max = 90
  const step = total > 1 ? (max - min) / (total - 1) : 0
  const pct = Math.round(min + step * index)
  return `${pct}%`
}

export const pointPillCascadeReview = defineBlock<Data>({
  id: 'point-pill-cascade-review',
  archetype: 'point',
  styleTags: ['dark', 'emotional', 'review', 'noimg-safe'],
  imageSlots: 4, // 제품 이미지 1 + 리뷰 썸네일 최대 3
  describe:
    '다크 그라디언트 배경 위 밑줄 강조 헤드라인 + 대형 제품 사진 + 계단식 알약 리스트 + 붓글씨 감성 인용 + 설명 + 썸네일·키워드칩·별점 리뷰 카드. 문제제기/공감 유도 섹션.',
  schema,
  css: `
/* ── point-pill-cascade-review ─────────────────────────────────── */
.pudt{
  background:linear-gradient(175deg,var(--brand,#1a1208) 0%,color-mix(in srgb,var(--brand,#1a1208) 60%,#000) 100%);
  color:#fff;
  padding:64px 0 72px;
  text-align:center
}
/* 헤드라인 영역 */
.pudt-hd{padding:0 var(--pad-x,56px)}
.pudt-sub{
  font-size:18px;font-weight:600;
  color:rgba(255,255,255,.72);
  margin-bottom:10px;
  letter-spacing:.04em
}
.pudt-underline-wrap{position:relative;display:inline-block}
.pudt-underline-wrap::after{
  content:'';
  position:absolute;
  left:8%;right:8%;bottom:-6px;
  height:4px;
  background:var(--accent);
  border-radius:999px
}
.pudt-main{
  font-size:clamp(36px,5.5vw,62px);
  font-weight:800;
  line-height:1.18;
  letter-spacing:-.02em;
  margin-bottom:4px
}
.pudt .em{color:var(--em-dark,#FFF7EA)}
/* 제품 사진 */
.pudt-photo-wrap{
  margin:40px auto 0;
  width:calc(100% - var(--pad-x,56px)*2);
  max-width:800px
}
.pudt-photo{
  width:100%;
  aspect-ratio:800/720;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*20px));
  display:block
}
/* 이미지 없을 때 완전 숨김 (noimg-safe) */
.pudt-photo.ph{display:none!important}
.pudt-photo-wrap:has(.ph){display:none}
/* 알약 리스트 */
.pudt-pills{
  margin:44px auto 0;
  padding:0 var(--pad-x,56px);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px
}
.pudt-pill{
  display:flex;
  align-items:center;
  justify-content:center;
  background:var(--accent);
  border-radius:999px;
  padding:14px 28px;
  font-size:18px;
  font-weight:700;
  color:#fff;
  letter-spacing:.01em;
  line-height:1.3
}
/* 감성 인용 */
.pudt-quote-wrap{
  margin:48px auto 0;
  padding:0 var(--pad-x,56px);
  display:flex;
  align-items:baseline;
  justify-content:center;
  gap:4px
}
.pudt-qmark{
  font-family:var(--font-hand,'Nanum Brush Script',cursive);
  font-size:clamp(72px,12vw,130px);
  line-height:1;
  color:#fff;
  opacity:.85
}
.pudt-quote{
  font-family:var(--font-hand,'Nanum Brush Script',cursive);
  font-size:clamp(56px,9vw,110px);
  line-height:1.08;
  color:#fff;
  letter-spacing:.01em
}
/* 설명 텍스트 */
.pudt-desc{
  margin:36px auto 0;
  padding:0 var(--pad-x,56px);
  max-width:720px;
  font-size:clamp(16px,2.4vw,22px);
  font-weight:600;
  line-height:1.68;
  color:rgba(255,255,255,.9)
}
.pudt-desc .em{color:var(--em-dark,#FFF7EA)}
/* 리뷰 카드 */
.pudt-reviews{
  margin:52px auto 0;
  padding:0 var(--pad-x,56px);
  display:flex;
  flex-direction:column;
  gap:16px
}
.pudt-card{
  display:flex;
  align-items:flex-start;
  gap:0;
  background:#fff;
  border-radius:calc(var(--r-scale,1)*14px);
  overflow:hidden
}
.pudt-card-thumb{
  flex:0 0 30%;
  width:30%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block
}
.pudt-card-thumb.ph{display:none!important}
/* 썸네일 없으면 텍스트 영역 전체 사용 */
.pudt-card:has(.ph) .pudt-card-body{padding-left:24px}
.pudt-card-body{
  flex:1;
  padding:18px 20px 18px 20px;
  display:flex;
  flex-direction:column;
  gap:8px;
  text-align:left
}
.pudt-chip{
  display:inline-block;
  background:#ffc935;
  color:#090801;
  font-size:13px;
  font-weight:700;
  border-radius:calc(var(--r-scale,1)*4px);
  padding:4px 10px;
  align-self:flex-start
}
.pudt-card-desc{
  font-size:14px;
  color:#4b4b4b;
  line-height:1.62;
  font-weight:400
}
.pudt-stars{
  display:flex;
  gap:2px
}
.pudt-star{
  width:14px;height:14px;
  fill:rgba(0,0,0,.15);
  stroke:none
}
.pudt-star.filled{fill:#ffc935}
`,
  render: (d, { esc, richSafe }) => {
    const pillsHtml = d.pills
      .map(
        (p, i) =>
          `<div class="pudt-pill" style="width:${pillWidth(i, d.pills.length)};max-width:680px">${esc(p.text)}</div>`,
      )
      .join('\n    ')

    const reviewsHtml = d.reviews
      .map(
        (r) => `
    <div class="pudt-card">
      ${media(r.image, 'pudt-card-thumb', r.keyword)}
      <div class="pudt-card-body">
        <span class="pudt-chip">${esc(r.keyword)}</span>
        <p class="pudt-card-desc">${esc(r.desc)}</p>
        ${r.stars ? starRow(r.stars) : ''}
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="pudt">
  <div class="pudt-hd">
    <p class="pudt-sub">${esc(d.subTitle)}</p>
    <div class="pudt-underline-wrap">
      <h2 class="pudt-main">${richSafe(d.title)}</h2>
    </div>
  </div>
  <div class="pudt-photo-wrap">
    ${media(d.productImage, 'pudt-photo', esc(d.subTitle) + ' 제품 이미지')}
  </div>
  <div class="pudt-pills">
    ${pillsHtml}
  </div>
  <div class="pudt-quote-wrap">
    <span class="pudt-qmark">"</span>
    <span class="pudt-quote">${esc(d.quote)}</span>
    <span class="pudt-qmark">"</span>
  </div>
  <p class="pudt-desc">${richSafe(d.desc)}</p>
  <div class="pudt-reviews">
    ${reviewsHtml}
  </div>
</section>`
  },
})
