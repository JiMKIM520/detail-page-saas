/** LINEUP 아키타입: lineup-dark-gauge
 *  002_상품_구성_페이지_1 흡수.
 *  검정 배경 + 그라디언트 원형 3개 분위기 장식 + 상단 타이틀/부제 + 흰 라운드 카드 안에
 *  4행 상품 리스트(좌 섬네일·우 이름+정상가·할인가 취소선·이벤트가 오렌지 게이지 바).
 *  핵심 장치: 이벤트가 행에 가득 찬 트랙 위 오렌지 fill 슬라이더가 할인 비율을 길이로 암시. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  name: z.string().min(1),               // 상품명 (em 허용)
  image: z.string().optional(),          // 섬네일 (url)
  priceOriginal: z.string().min(1),      // 정상가 표시 문자열 (예: "399,900원")
  priceDiscount: z.string().min(1),      // 할인가 표시 문자열 (예: "259,900원")
  priceEvent: z.string().min(1),         // 이벤트가 표시 문자열 (예: "179,900원")
  discountRatio: z.number().min(1).max(99), // 오렌지 게이지 채움 비율 (%, 1~99)
  discountLabel: z.string().optional(),  // 게이지 내 할인율 텍스트 (예: "55%") — 브리프 근거 시만
})

const schema = z.object({
  subtitle: z.string().optional(),       // 상단 부제 한 줄 (em/br 허용)
  title: z.string().min(1),             // 상단 대제목 (em/br 허용)
  items: z.array(itemSchema).min(1).max(4),
})

type ItemData = z.infer<typeof itemSchema>
type Data = z.infer<typeof schema>

/** 오렌지 게이지 fill 비율 → 안전한 CSS 백분율 문자열 */
const gaugeWidth = (ratio: number): string => `${Math.max(1, Math.min(99, Math.round(ratio)))}%`

const renderItem = (item: ItemData, idx: number, { esc, richSafe }: { esc: (s: string | undefined) => string; richSafe: (s: string | undefined) => string }): string => `
  <div class="ljcj-row" style="--row-delay:${idx * 60}ms">
    <div class="ljcj-thumb">
      ${media(item.image, 'ljcj-thumb-img', esc(item.name) + ' 이미지')}
    </div>
    <div class="ljcj-info">
      <p class="ljcj-name">${richSafe(item.name)}</p>
      <div class="ljcj-price-line ljcj-price-orig">
        <span class="ljcj-pl-label">${esc('정상가')}</span>
        <span class="ljcj-pl-val ljcj-striked">${esc(item.priceOriginal)}</span>
      </div>
      <div class="ljcj-price-line ljcj-price-disc">
        <span class="ljcj-pl-label">${esc('할인가')}</span>
        <span class="ljcj-pl-val ljcj-striked">${esc(item.priceDiscount)}</span>
      </div>
      <div class="ljcj-gauge-wrap">
        <div class="ljcj-gauge-track">
          <div class="ljcj-gauge-fill" style="width:${gaugeWidth(item.discountRatio)}">
            <span class="ljcj-gauge-tag">${esc('이벤트가')}</span>
          </div>
          <span class="ljcj-gauge-price">${esc(item.priceEvent)}${item.discountLabel ? `<em class="ljcj-discount-pct">${esc(item.discountLabel)}</em>` : ''}</span>
        </div>
      </div>
    </div>
  </div>`

export const lineupDarkGauge = defineBlock<Data>({
  id: 'lineup-dark-gauge',
  archetype: 'lineup',
  styleTags: ['dark', 'price', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '상품 구성 다크 게이지 바 블록. 검정 배경 + 그라디언트 원형 장식 + 흰 라운드 카드에 1~4개 상품 행 나열. 각 행: 좌 섬네일(이미지 없어도 강등 안전) + 우 이름/정상가·할인가 취소선/이벤트가 오렌지 게이지 바(할인 비율 길이로 시각화). 최종가 타격감 강조에 적합.',
  schema,
  css: `
/* ── lineup-dark-gauge (ljcj) ── */
.ljcj{
  position:relative;
  background:#0f0f0f;
  color:#fff;
  padding:64px var(--pad-x,56px) 80px;
  overflow:hidden;
}
/* 분위기 장식: 그라디언트 원형 3개 */
.ljcj::before,.ljcj::after,.ljcj-orb{
  content:"";
  position:absolute;
  border-radius:50%;
  pointer-events:none;
}
.ljcj::before{
  width:520px;height:520px;
  top:-140px;right:-60px;
  background:radial-gradient(circle,color-mix(in srgb,var(--accent) 28%,transparent) 0%,transparent 72%);
}
.ljcj::after{
  width:520px;height:520px;
  bottom:-180px;left:-80px;
  background:radial-gradient(circle,color-mix(in srgb,var(--accent) 20%,transparent) 0%,transparent 70%);
}
.ljcj-orb{
  width:520px;height:520px;
  top:-120px;left:-40px;
  background:radial-gradient(circle,color-mix(in srgb,var(--accent) 16%,transparent) 0%,transparent 68%);
}
/* 헤더 */
.ljcj-hd{
  position:relative;z-index:1;
  text-align:center;
  margin-bottom:36px;
}
.ljcj-sub{
  font-size:16px;
  font-weight:500;
  color:color-mix(in srgb,#fff 60%,transparent);
  letter-spacing:.04em;
  margin-bottom:10px;
}
.ljcj-hd .em{color:var(--em-dark,#FFF7EA)}
.ljcj-title{
  font-family:var(--font-display);
  font-size:clamp(26px,4vw,48px);
  font-weight:800;
  line-height:1.18;
  letter-spacing:-.02em;
  color:#fff;
}
.ljcj-title .em{color:var(--em-dark,#FFF7EA)}
/* 흰 카드 */
.ljcj-card{
  position:relative;z-index:1;
  background:#ffffff;
  border-radius:calc(var(--r-scale,1)*28px);
  overflow:hidden;
  padding:12px 0;
}
/* 상품 행 */
.ljcj-row{
  display:flex;
  align-items:center;
  gap:20px;
  padding:18px 28px;
  border-bottom:1px solid var(--line,#f0ece8);
}
.ljcj-row:last-child{border-bottom:none}
/* 섬네일 */
.ljcj-thumb{
  flex:0 0 96px;
  width:96px;height:96px;
  border-radius:calc(var(--r-scale,1)*10px);
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 8%,#f5f5f5);
}
.ljcj-thumb-img{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:inherit;
}
/* 이미지 없으면 섬네일 영역 최소화(noimg-safe) */
.ljcj-thumb:has(.ph){
  flex:0 0 0;
  width:0;
  overflow:hidden;
  padding:0;
}
/* 우측 정보 영역 */
.ljcj-info{
  flex:1;
  min-width:0;
}
.ljcj-name{
  font-family:var(--font-display);
  font-size:18px;
  font-weight:700;
  color:#111;
  margin-bottom:8px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.ljcj-name .em{color:var(--accent-d,#b34500)}
/* 가격 줄 */
.ljcj-price-line{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:6px;
  margin-bottom:4px;
}
.ljcj-pl-label{
  font-size:13px;
  font-weight:500;
  color:#555;
  flex:0 0 44px;
}
.ljcj-pl-val{
  font-size:14px;
  font-weight:500;
  color:#444;
}
.ljcj-striked{text-decoration:line-through}
/* 게이지 바 영역 */
.ljcj-gauge-wrap{margin-top:6px}
.ljcj-gauge-track{
  position:relative;
  width:100%;
  height:44px;
  background:#ebebeb;
  border-radius:calc(var(--r-scale,1)*8px);
  overflow:hidden;
  display:flex;
  align-items:center;
}
.ljcj-gauge-fill{
  position:absolute;
  left:0;top:0;bottom:0;
  background:var(--accent,#ff6200);
  border-radius:inherit;
  display:flex;
  align-items:center;
  padding-left:12px;
  min-width:80px;
  transition:width .5s ease;
}
.ljcj-gauge-tag{
  font-size:13px;
  font-weight:900;
  color:#fff;
  white-space:nowrap;
  letter-spacing:.01em;
}
.ljcj-gauge-price{
  position:absolute;
  right:12px;
  font-size:17px;
  font-weight:700;
  color:#161616;
  white-space:nowrap;
  display:flex;
  align-items:center;
  gap:6px;
}
.ljcj-discount-pct{
  font-style:normal;
  font-size:15px;
  font-weight:700;
  color:#555;
}
`,
  render: (d, ctx) => {
    const { esc, richSafe } = ctx
    return `
<section class="ljcj">
  <div class="ljcj-orb"></div>
  <div class="ljcj-hd">
    ${d.subtitle ? `<p class="ljcj-sub">${richSafe(d.subtitle)}</p>` : ''}
    <h2 class="ljcj-title">${richSafe(d.title)}</h2>
  </div>
  <div class="ljcj-card">
    ${d.items.map((item, idx) => renderItem(item, idx, { esc, richSafe })).join('')}
  </div>
</section>`
  },
})
