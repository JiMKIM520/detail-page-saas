/** LINEUP 아키타입: lineup-swatch-zigzag.
 *  피그마 331_제품정보_16 (color info) 흡수 — 가로선 브랜드 타이틀 + 4개 컬러 카드 좌우 교차.
 *  핵심 장치: 카드 배경색 자체가 해당 컬러 스와치. 홀수 카드=이미지 왼쪽, 짝수=이미지 오른쪽.
 *  noimg-safe: 이미지 부재 시 컬러 스와치 배경 영역만 남기고 텍스트 패널 단독 렌더로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const colorCard = z.object({
  colorName: z.string().min(1),           // 컬러 영문명 (예: TAN / IVORY)
  colorDesc: z.string().min(1),           // 컬러 설명 한 두 줄 (em,br)
  swatchBg: z.string().min(1),            // 카드 배경 hex 또는 CSS 색값 (예: #c79e71)
  textOnDark: z.boolean().optional(),     // true면 텍스트를 밝은 색으로 (기본 false)
  image: z.string().optional(),           // 컬러별 제품 이미지 (url)
})

const schema = z.object({
  brand: z.string().optional(),           // 브랜드명 or 섹션 라벨 (예: color info) — 가로선 중앙
  title: z.string().min(1),              // 상단 대형 헤드라인 (em,br)
  subtitle: z.string().optional(),        // 헤드라인 아래 보조 설명
  cards: z.array(colorCard).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const lineupSwatchZigzag = defineBlock<Data>({
  id: 'lineup-swatch-zigzag',
  archetype: 'lineup',
  styleTags: ['light', 'editorial', 'color-lineup', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '컬러 라인업 교차 배치. 가로선 브랜드 라벨 + 대형 타이틀 + 2~6개 컬러 카드(카드 배경색=컬러 스와치, 이미지 절반/텍스트 절반 좌우 교차). 패션·신발·가방 등 컬러 옵션 소개에 최적.',
  schema,
  css: `
.lnsz{background:var(--bg);color:var(--ink);padding-bottom:0}

/* ── 브랜드 라벨 (가로선 + 텍스트 + 가로선) ── */
.lnsz-brand-row{display:flex;align-items:center;gap:0;padding:52px var(--pad-x,56px) 0}
.lnsz-brand-line{flex:1;height:1.5px;background:var(--accent);opacity:.55}
.lnsz-brand-label{
  font-family:var(--font-lat),'Cormorant Garamond',serif;
  font-weight:600;font-size:28px;letter-spacing:.08em;
  color:var(--accent);white-space:nowrap;padding:0 18px;line-height:1
}

/* ── 타이틀 영역 ── */
.lnsz-hd{padding:32px var(--pad-x,56px) 0}
.lnsz-title{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:400;font-size:40px;color:var(--accent);line-height:1.3;letter-spacing:-.01em
}
.lnsz-title .em{color:var(--ink);font-weight:700}
.lnsz-sub{
  margin-top:10px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:300;font-size:26px;color:var(--accent);line-height:1.5
}

/* ── 카드 목록 ── */
.lnsz-cards{margin-top:32px}

/* ── 단일 컬러 카드 ── */
.lnsz-card{
  display:flex;align-items:stretch;
  width:100%;min-height:360px
}
.lnsz-card.rev{flex-direction:row-reverse}

/* 이미지 절반 */
.lnsz-img-half{flex:0 0 50%;position:relative;overflow:hidden;min-height:360px}
.lnsz-img-half img,.lnsz-img-half .ph{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:var(--shape-photo, 0px);
  display:block
}

/* 이미지 없을 때 강등: 이미지 절반을 숨기고 텍스트 패널이 전체 폭 차지 */
.lnsz-card.noimg .lnsz-img-half{display:none}
.lnsz-card.noimg .lnsz-text-half{flex:1 1 100%}

/* 텍스트 절반 */
.lnsz-text-half{
  flex:1;
  display:flex;flex-direction:column;justify-content:center;
  padding:40px 44px
}
.lnsz-card.noimg .lnsz-text-half{padding:48px var(--pad-x,56px)}

/* 컬러명 */
.lnsz-color-name{
  font-family:var(--font-serif),'Gowun Batang',serif;
  font-weight:700;font-size:34px;line-height:1;letter-spacing:.04em;
  color:var(--lnsz-text,var(--ink))
}

/* 설명 */
.lnsz-color-desc{
  margin-top:16px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:400;font-size:22px;line-height:1.7;
  color:var(--lnsz-text,var(--ink));opacity:.88
}
.lnsz-color-desc .em{opacity:1;font-weight:700;color:var(--lnsz-text,var(--ink))}

/* 다크 텍스트 스코프 오버라이드 (textOnDark=true 카드에 인라인 스타일로 설정) */
.lnsz-card.dark-text .lnsz-color-name,
.lnsz-card.dark-text .lnsz-color-desc{color:#f1ede7;opacity:1}
.lnsz-card.dark-text .em{color:#f1ede7}
`,
  render: (d, { esc, richSafe }) => {
    const brandRow = `
<div class="lnsz-brand-row">
  <span class="lnsz-brand-line"></span>
  <span class="lnsz-brand-label">${esc(d.brand ?? 'color info')}</span>
  <span class="lnsz-brand-line"></span>
</div>`

    const hdBlock = `
<div class="lnsz-hd">
  <p class="lnsz-title">${richSafe(d.title)}</p>
  ${d.subtitle ? `<p class="lnsz-sub">${esc(d.subtitle)}</p>` : ''}
</div>`

    const cards = d.cards
      .map((c, i) => {
        const isRev = i % 2 === 1          // 짝수 인덱스=정방향(이미지 왼), 홀수=역방향(이미지 오른)
        const hasImg = typeof c.image === 'string' && c.image.length > 0
        const darkCls = c.textOnDark ? ' dark-text' : ''
        const revCls = isRev ? ' rev' : ''
        const noImgCls = hasImg ? '' : ' noimg'
        return `
<div class="lnsz-card${revCls}${darkCls}${noImgCls}" style="background:${esc(c.swatchBg)}">
  <div class="lnsz-img-half">
    ${media(c.image, '', `${esc(c.colorName)} 컬러 제품`)}
  </div>
  <div class="lnsz-text-half">
    <div class="lnsz-color-name">${esc(c.colorName)}</div>
    <div class="lnsz-color-desc">${richSafe(c.colorDesc)}</div>
  </div>
</div>`
      })
      .join('')

    return `
<section class="lnsz">
  ${brandRow}
  ${hdBlock}
  <div class="lnsz-cards">${cards}
  </div>
</section>`
  },
})
