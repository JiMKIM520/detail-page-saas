/** EVENT 아키타입: event-poly-price-list
 *  다크 이벤트 헤더(그라디언트+제품컷) + 흰 카드 3행 가격 목록.
 *  각 행 우측에 삼각형 폴리곤 할인율 뱃지가 돌출되어 가격을 강조하는 구조.
 *  출처: 014_상품_구성_페이지_20 (w:860 h:1530, category:상품) */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const priceRowSchema = z.object({
  image: z.string().optional(),           // 행 좌측 제품 이미지 (url)
  name: z.string().min(1),               // 제품명 (em 허용)
  regularPrice: z.string().min(1),       // 정상가 표시 문자열 (예: "17,000원")
  salePrice: z.string().min(1),          // 행사가 표시 문자열 (예: "9,900원")
  discountRate: z.string().min(1),       // 할인율 뱃지 텍스트 (예: "42%")
})

const schema = z.object({
  eventName: z.string().min(1),          // 이벤트명 (em,br 허용) — 헤더 대형 텍스트
  period: z.string().optional(),         // 이벤트 기간 문자열 (예: "7/1 ~ 7/31")
  headerImage: z.string().optional(),    // 헤더 우측 제품 이미지 (url)
  items: z.array(priceRowSchema).min(1).max(6),
})
type Data = z.infer<typeof schema>

export const eventPolyPriceList = defineBlock<Data>({
  id: 'event-poly-price-list',
  archetype: 'event',
  styleTags: ['dark', 'promo', 'price', 'noimg-safe'],
  imageSlots: 4, // 헤더 1 + 행당 최대 3
  describe:
    '이벤트 상품 구성 가격표. 다크 그라디언트 헤더(이벤트명+기간 버튼+제품컷) + 흰 카드 안 1~6행(좌측 이미지·제품명·정상가/행사가·삼각형 폴리곤 할인율 뱃지). 삼각형 뱃지가 각 행 우측에 돌출되어 가격 임팩트를 강조. 이벤트/기획전/구성 세트 상세에 적합.',
  schema,
  css: `
/* ── event-poly-price-list ── */
.ehjc{position:relative;background:var(--bg);font-family:var(--font-body)}

/* 헤더 영역: 다크 그라디언트 + 오버레이 이미지 */
.ehjc-hdr{
  position:relative;
  background:linear-gradient(135deg,var(--brand,#111) 0%,color-mix(in srgb,var(--brand,#111) 60%,var(--accent)) 100%);
  min-height:260px;
  padding:36px var(--pad-x,56px) 40px;
  overflow:hidden;
}
/* 다크 헤더 위 richSafe em 스코프 오버라이드 — Sprint 6 Directive */
.ehjc-hdr .em{color:var(--em-dark,#FFF7EA)}

/* 헤더 배경 이미지 (우측 반투명 오버레이) */
.ehjc-hdr-img{
  position:absolute;
  right:0;top:0;bottom:0;
  width:52%;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px)) 0 0 calc(var(--r-scale,1)*18px);
  opacity:.82;
  pointer-events:none;
}
/* 이미지 위 스크림: 좌측 텍스트 영역 저대비 방지 */
.ehjc-hdr::after{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(to right,rgba(0,0,0,.55) 0%,rgba(0,0,0,.15) 52%,rgba(0,0,0,0) 100%);
  pointer-events:none;
  z-index:0;
}
.ehjc-hdr-img.ph{
  background:color-mix(in srgb,var(--accent) 18%,transparent);
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px)) 0 0 calc(var(--r-scale,1)*18px);
}

/* 헤더 텍스트 레이어 */
.ehjc-hdr-content{position:relative;z-index:1;max-width:52%}
.ehjc-event-name{
  font-family:var(--font-display);
  font-size:clamp(32px,5vw,52px);
  font-weight:900;
  line-height:1.15;
  color:var(--accent);
  letter-spacing:-.02em;
  margin:0 0 18px;
}
.ehjc-period-pill{
  display:inline-flex;
  align-items:center;
  gap:6px;
  background:var(--accent);
  color:#fff;
  font-size:15px;
  font-weight:700;
  padding:7px 18px;
  border-radius:999px;
  letter-spacing:.02em;
  white-space:nowrap;
}

/* 가격 카드 */
.ehjc-card{
  background:var(--paper,#fff);
  margin:0 0 0;
  border-radius:0 0 calc(var(--r-scale,1)*16px) calc(var(--r-scale,1)*16px);
  overflow:visible; /* 뱃지 돌출 허용 */
  position:relative;
}

/* 가격 행 */
.ehjc-row{
  display:flex;
  align-items:stretch;
  gap:0;
  /* 우측 64px: 뱃지 돌출(right:-52px + 여백) 공간 확보 */
  padding:20px 64px 20px calc(var(--pad-x,56px) - 4px);
  position:relative;
  overflow:visible;
}
.ehjc-row+.ehjc-row{
  border-top:1px solid var(--line,#e8e8e8);
}

/* 행 좌측 이미지 */
.ehjc-row-img-wrap{
  flex:0 0 140px;
  width:140px;
  height:128px;
  border-radius:calc(var(--r-scale,1)*10px);
  overflow:hidden;
  background:var(--line,#f0f0f0);
  flex-shrink:0;
}
.ehjc-row-img-wrap img,
.ehjc-row-img-wrap .ph{
  display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit;
}
/* noimg-safe: 이미지 없으면 래퍼 자체 제거(빈 회색 박스 노출 방지 — 3라운드 잔존 실사례) */
.ehjc-row-img-wrap:has(.ph){display:none}
/* noimg-safe: 이미지 없으면 플레이스홀더가 작은 색상 블록으로 강등 */
.ehjc-row-img-wrap.ph-block{
  background:color-mix(in srgb,var(--accent) 12%,var(--line,#f0f0f0));
}

/* 행 텍스트 영역 */
.ehjc-row-body{
  flex:1;
  min-width:0;
  padding:4px 0 4px 20px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:8px;
}
.ehjc-name{
  font-size:clamp(16px,2.2vw,22px);
  font-weight:700;
  color:var(--ink);
  line-height:1.35;
}
.ehjc-name .em{color:var(--accent);font-weight:800}

.ehjc-price-grid{
  display:grid;
  grid-template-columns:auto 1fr;
  column-gap:12px;
  row-gap:2px;
  font-size:15px;
  line-height:1.6;
}
.ehjc-label-reg{color:var(--muted,#aaa);font-weight:400}
.ehjc-label-sale{color:var(--ink-2,#555);font-weight:400}
.ehjc-val-reg{
  color:var(--muted,#aaa);
  font-weight:400;
  text-decoration:line-through;
  text-decoration-color:var(--muted,#aaa);
}
.ehjc-val-sale{
  color:var(--ink-2,#444);
  font-weight:600;
  font-size:16px;
}
.ehjc-sale-price{
  font-family:var(--font-display);
  font-size:clamp(20px,3vw,28px);
  font-weight:900;
  color:var(--accent);
  line-height:1.1;
  margin-top:4px;
}

/* 삼각형 폴리곤 할인율 뱃지 — CSS polygon clip으로 구현 */
.ehjc-badge-wrap{
  flex:0 0 0;
  width:0;
  position:relative;
  align-self:stretch;
  display:flex;
  align-items:center;
}
.ehjc-badge{
  position:absolute;
  right:-52px; /* 카드 우측 밖으로 돌출 */
  width:90px;
  height:72px;
  background:var(--accent);
  clip-path:polygon(18% 0%,100% 50%,18% 100%,0% 100%,0% 0%);
  display:flex;
  align-items:center;
  justify-content:flex-end;
  padding-right:10px;
  box-sizing:border-box;
}
.ehjc-badge-text{
  font-family:var(--font-display);
  font-size:17px;
  font-weight:900;
  color:#fff;
  letter-spacing:-.01em;
  line-height:1;
  white-space:nowrap;
}

/* 뱃지 돌출 허용: overflow:visible, 우측만 clip 안 함 */
.ehjc-card-inner{overflow:visible;border-radius:0 0 calc(var(--r-scale,1)*16px) calc(var(--r-scale,1)*16px)}
`,
  render: (d, { esc, richSafe }) => {
    // 전체 행에 이미지가 하나라도 있으면 이미지 레이아웃, 전무면 노이미지 강등
    const hasAnyImg = d.items.some((it) => typeof it.image === 'string' && it.image.length > 0)

    const rows = d.items
      .map(
        (item) => {
          // onerror: 이미지 로드 실패 시 썸네일 랩을 ph-block으로 강등(이미지 숨김)
          const imgBlock = hasAnyImg
            ? `<div class="ehjc-row-img-wrap${(!item.image) ? ' ph-block' : ''}" data-img-wrap>
              ${item.image
                ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" width="140" height="128" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('ph-block')">`
                : '<span class="ph"></span>'}
            </div>`
            : ''

          return `
  <div class="ehjc-row">
    ${imgBlock}
    <div class="ehjc-row-body">
      <p class="ehjc-name">${richSafe(item.name)}</p>
      <div class="ehjc-price-grid">
        <span class="ehjc-label-reg">정상가</span>
        <span class="ehjc-val-reg">${esc(item.regularPrice)}</span>
        <span class="ehjc-label-sale">행사가</span>
        <span class="ehjc-val-sale">${esc(item.salePrice)}</span>
      </div>
      <p class="ehjc-sale-price">${esc(item.salePrice)}</p>
    </div>
    <div class="ehjc-badge-wrap">
      <div class="ehjc-badge">
        <span class="ehjc-badge-text">${esc(item.discountRate)}</span>
      </div>
    </div>
  </div>`
        },
      )
      .join('')

    const headerImg = d.headerImage
      ? `<img class="ehjc-hdr-img" src="${esc(d.headerImage)}" alt="" aria-hidden="true" loading="eager">`
      : '<span class="ehjc-hdr-img ph" aria-hidden="true"></span>'

    return `
<section class="ehjc">
  <div class="ehjc-hdr">
    ${headerImg}
    <div class="ehjc-hdr-content">
      <h2 class="ehjc-event-name">${richSafe(d.eventName)}</h2>
      ${d.period ? `<span class="ehjc-period-pill">${esc(d.period)}</span>` : ''}
    </div>
  </div>
  <div class="ehjc-card">
    <div class="ehjc-card-inner">
      ${rows}
    </div>
  </div>
</section>`
  },
})
