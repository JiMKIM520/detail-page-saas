/** LINEUP 아키타입: lineup-persona-overlap.
 *  피그마 019_상품_구성_페이지_12 흡수.
 *  핵심 장치: 헤더 우측 원형 배경 위 인물 이미지가 아래 흰 카드 영역으로 오버랩되는 연속 플로우.
 *  좌측에 대형 타이틀·부제·날짜, 흰 카드 안 2~4행 상품 리스트(우 이미지 + 좌 카테고리/제품명/세부/할인율 pill).
 *  톤: light / noimg-safe 구현(인물 이미지 부재 시 원형 장식만, 상품 이미지 부재 시 이미지 컬럼 은닉).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  category: z.string().min(1),          // 카테고리 라벨 (pill)
  name: z.string().min(1),              // 제품명 (em 허용)
  detail: z.string().optional(),        // 세부 정보 줄 (em 허용)
  discountRate: z.string().optional(),  // 할인율 텍스트 예: "10% OFF"
  discountFill: z.boolean().optional(), // true → filled pill (강조 할인), false/없음 → outline pill
  image: z.string().optional(),         // 제품 이미지 (url)
})

const schema = z.object({
  title: z.string().min(1),            // 대형 타이틀 (em,br 허용)
  subtitle: z.string().optional(),     // 부제 한 줄 (순수 텍스트)
  date: z.string().optional(),         // 날짜/기간 텍스트
  personImage: z.string().optional(),  // 인물 누끼 이미지 (url) — 원형 배경 위 오버랩
  items: z.array(itemSchema).min(2).max(4),
})
type Data = z.infer<typeof schema>

export const lineupPersonaOverlap = defineBlock<Data>({
  id: 'lineup-persona-overlap',
  archetype: 'lineup',
  // noimg-safe: 인물 이미지 없으면 원형 장식만 렌더, 상품 이미지 전무 시 이미지 컬럼 은닉
  styleTags: ['light', 'lineup', 'persona', 'overlap', 'noimg-safe'],
  imageSlots: 5, // personImage 1 + items 최대 4
  describe:
    '상품 구성 라인업. 헤더 우측 원형 배경 위 인물 이미지가 흰 카드 영역으로 오버랩되는 연속 플로우. 좌 대형 타이틀·부제·날짜, 흰 카드 안 2~4행(우 상품이미지 + 좌 카테고리pill·제품명·세부·할인율pill). 이벤트 구성 소개·패키지 가격 안내에 적합.',
  schema,
  css: `
.lmjh{position:relative;background:var(--bg);padding-bottom:56px;overflow:hidden}

/* ── 헤더 존: grid 2열로 텍스트/이미지 완전 분리 ── */
.lmjh-hd{
  display:grid;
  grid-template-columns:1fr minmax(0,380px);
  align-items:end;
  padding:52px var(--pad-x,56px) 0;
  gap:0;
  position:relative
}

/* 원형 배경 버블 — 우측 열 뒤에 absolute */
.lmjh-bubble{
  position:absolute;
  top:0;right:calc(var(--pad-x,56px) - 20px);
  width:380px;height:380px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 18%,var(--bg));
  z-index:0;
  pointer-events:none
}

/* 텍스트 열 — 항상 좌측, 이미지와 독립 */
.lmjh-text{
  position:relative;
  z-index:2;
  padding:40px 0 0;
  /* 텍스트 배경 스크림으로 오버랩 구간 가독성 확보 */
  background:linear-gradient(to right,var(--bg) 85%,transparent 100%)
}
.lmjh-subtitle{
  font-family:var(--font-body);
  font-size:17px;font-weight:500;
  color:var(--ink-2);
  margin-bottom:14px;
  letter-spacing:.01em
}
.lmjh-title{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(34px,4.8vw,54px);
  line-height:1.12;
  letter-spacing:-.025em;
  color:var(--ink)
}
.lmjh-title .em{color:var(--accent-d)}
.lmjh-date{
  display:inline-flex;align-items:center;gap:8px;
  margin-top:20px;
  font-size:15px;font-weight:500;color:var(--ink-2)
}
.lmjh-date svg{width:16px;height:16px;stroke:var(--accent);flex-shrink:0}

/* 인물 이미지 열 — 우측, z-index 낮게 유지(텍스트 아래) */
.lmjh-persona-col{
  position:relative;
  z-index:1;
  align-self:end;
  /* 카드 위로만 침범: 하단을 -80px 밀어서 카드 상단에 겹침 */
  margin-bottom:-80px
}
.lmjh-persona{
  width:100%;
  max-width:380px;
  height:420px;
  margin-left:auto;
  pointer-events:none
}
.lmjh-persona img,.lmjh-persona .ph{
  width:100%;height:100%;
  object-fit:contain;
  display:block
}
/* 인물 이미지 없을 때 ph 은닉(noimg-safe) */
.lmjh-persona .ph{display:none!important}

/* ── 흰 카드 존 ── */
.lmjh-card{
  position:relative;z-index:3;
  margin:0 var(--pad-x,56px) 0;
  background:var(--paper,#fff);
  border-radius:calc(var(--r-scale,1)*20px);
  box-shadow:0 8px 40px -8px rgba(0,0,0,.10);
  overflow:hidden
}

/* 카드 행 */
.lmjh-row{
  display:flex;
  align-items:stretch;
  gap:0;
  border-bottom:1px solid var(--line)
}
.lmjh-row:last-child{border-bottom:none}

/* 좌 메타 영역 */
.lmjh-meta{
  flex:1;
  padding:26px 24px 26px 28px;
  display:flex;flex-direction:column;justify-content:center;gap:6px
}
/* 카테고리 pill (outline 스타일) */
.lmjh-cat{
  display:inline-flex;align-items:center;
  padding:4px 14px;
  border:1.5px solid var(--accent);
  border-radius:999px;
  font-size:13px;font-weight:700;
  color:var(--accent-d);
  letter-spacing:.04em;
  width:fit-content
}
/* 제품명 */
.lmjh-name{
  font-family:var(--font-display);
  font-size:18px;font-weight:700;
  color:var(--ink);line-height:1.35
}
.lmjh-name .em{color:var(--accent-d)}
/* 세부 정보 */
.lmjh-detail{
  font-size:13px;font-weight:400;
  color:var(--muted);line-height:1.55
}
.lmjh-detail .em{color:var(--ink-2);font-weight:600}
/* 할인율 pill 행 */
.lmjh-pill-row{margin-top:8px}
/* outline pill (낮은 할인) */
.lmjh-pill{
  display:inline-flex;align-items:center;
  padding:5px 16px;
  border:1.5px solid var(--accent);
  border-radius:999px;
  font-size:14px;font-weight:700;
  color:var(--accent-d);
  letter-spacing:.02em
}
/* filled pill (높은 할인, discountFill=true) */
.lmjh-pill.fill{
  background:var(--brand,var(--accent-d));
  border-color:var(--brand,var(--accent-d));
  color:#fff
}

/* 우 이미지 영역 */
.lmjh-img-wrap{
  flex:0 0 220px;width:220px;
  align-self:stretch;
  overflow:hidden;
  border-radius:0
}
.lmjh-img-wrap img,.lmjh-img-wrap .ph{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));
  display:block
}
/* 상품 이미지 없을 때 이미지 컬럼 은닉(noimg-safe) */
.lmjh-img-wrap.no-img{display:none}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 상품 이미지 존재 여부 판단 — 하나라도 있으면 이미지 컬럼 표시
    const hasAnyProductImg = d.items.some(
      (it) => typeof it.image === 'string' && /^(https?:\/\/|data:|\/)/.test(it.image.trim()),
    )

    const rows = d.items
      .map((it) => {
        const isUrl =
          typeof it.image === 'string' && /^(https?:\/\/|data:|\/)/.test(it.image.trim())
        const imgColClass = hasAnyProductImg ? 'lmjh-img-wrap' : 'lmjh-img-wrap no-img'
        return `
<div class="lmjh-row">
  <div class="lmjh-meta">
    <span class="lmjh-cat">${esc(it.category)}</span>
    <p class="lmjh-name">${richSafe(it.name)}</p>
    ${it.detail ? `<p class="lmjh-detail">${richSafe(it.detail)}</p>` : ''}
    ${
      it.discountRate
        ? `<div class="lmjh-pill-row">
      <span class="lmjh-pill${it.discountFill ? ' fill' : ''}">${esc(it.discountRate)}</span>
    </div>`
        : ''
    }
  </div>
  ${
    hasAnyProductImg
      ? `<div class="${isUrl ? 'lmjh-img-wrap' : 'lmjh-img-wrap no-img'}">
    ${isUrl ? media(it.image, '', '상품 이미지') : `<div class="ph" role="img" aria-label="${esc(it.category)} 상품 이미지"></div>`}
  </div>`
      : ''
  }
</div>`
      })
      .join('')

    return `
<section class="lmjh">
  <div class="lmjh-hd">
    <div class="lmjh-bubble" aria-hidden="true"></div>
    <div class="lmjh-text">
      ${d.subtitle ? `<p class="lmjh-subtitle">${esc(d.subtitle)}</p>` : ''}
      <h2 class="lmjh-title disp">${richSafe(d.title)}</h2>
      ${
        d.date
          ? `<p class="lmjh-date">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>
        ${esc(d.date)}
      </p>`
          : ''
      }
    </div>
    <div class="lmjh-persona-col" aria-hidden="true">
      <div class="lmjh-persona">
        ${media(d.personImage, '', '상품 소개 인물')}
      </div>
    </div>
  </div>
  <div class="lmjh-card">
    ${rows}
  </div>
</section>`
  },
})
