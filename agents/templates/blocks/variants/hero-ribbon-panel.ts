/** HERO 아키타입: hero-ribbon-panel
 *  피그마 050_인트로_15 구조 흡수.
 *  전체 배경 이미지 위 하단부 r=250 대형 둥근 컬러 패널 오버레이,
 *  패널 상단에 좌우 벡터+채색 바 리본 서브타이틀 장치,
 *  대형 디스플레이 제목 + 보조 헤드라인 + 2~4열 키워드 카드 배너 내장.
 *  이미지 부재 시 패널 단독(solid bg) 강등 — noimg-safe.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  keyword: z.string().min(1),  // 굵은 키워드 (em 허용)
  detail:  z.string().min(1),  // 보조 설명 텍스트
})

const schema = z.object({
  bgImage:    z.string().optional(),       // 배경 전체 이미지 (url)
  panelColor: z.string().optional(),       // 패널 색 — 'accent'|'brand'|'paper'|'bg'|hex, 미지정=var(--accent)
  ribbon:     z.string().min(1),           // 리본 장치 텍스트 (em 허용)
  title:      z.string().min(1),           // 대형 디스플레이 제목 (em,br 허용)
  subtitle:   z.string().optional(),       // 제목 아래 서브 헤드라인 (em 허용)
  cards:      z.array(cardSchema).min(2).max(4), // 하단 카드 배너 (2~4열)
})

type Data = z.infer<typeof schema>

/** panelColor 슬롯 키워드 → CSS 색값 */
function resolvePanelColor(val: string | undefined): string {
  if (!val) return 'var(--accent)'
  const map: Record<string, string> = {
    accent: 'var(--accent)',
    brand:  'var(--brand)',
    paper:  'var(--paper)',
    bg:     'var(--bg)',
  }
  const key = val.trim().toLowerCase()
  if (map[key]) return map[key]
  if (/^#[0-9a-fA-F]{3,8}$/.test(val.trim())) return val.trim()
  return 'var(--accent)'
}

export const heroRibbonPanel = defineBlock<Data>({
  id:         'hero-ribbon-panel',
  archetype:  'hero',
  styleTags:  ['mixed', 'food', 'playful', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '히어로 블록 — 전체 배경 이미지 위 하단부 대형 둥근(r=250) 컬러 패널 오버레이. 패널 상단 좌우 삼각 벡터+채색 바 리본 서브타이틀 장치, 대형 디스플레이 제목, 서브 헤드라인, 2~4열 키워드+설명 카드 배너. 이미지 없을 때 패널만으로 강등 렌더(noimg-safe). 식품·유아 등 밝고 경쾌한 제품에 적합.',
  schema,
  css: `
/* ── hero-ribbon-panel (접두: hlet) ── */
.hlet{position:relative;overflow:hidden;width:100%;background:var(--bg)}

/* 배경 이미지 */
.hlet-bg{position:relative;width:100%;aspect-ratio:860/800;overflow:hidden}
.hlet-bg img{width:100%;height:100%;object-fit:cover;display:block}
.hlet-bg .ph{display:none!important}
/* noimg-safe: 이미지 없으면 높이 0 — 패널이 상단부터 시작 */
.hlet-bg.hlet-noimg{aspect-ratio:unset;height:0}

/* 대형 둥근 패널 오버레이 */
.hlet-panel{
  position:relative;
  z-index:2;
  margin-top:calc(var(--r-scale,1)*-200px);
  border-radius:calc(var(--r-scale,1)*250px) calc(var(--r-scale,1)*250px) 0 0;
  padding-bottom:56px;
  overflow:hidden
}
/* noimg-safe: 이미지 없으면 마진·라운드 제거 */
.hlet-noimg~.hlet-panel{margin-top:0;border-radius:0}

/* 리본 장치 — 좌우 삼각 벡터 + 채색 바 */
.hlet-ribbon-wrap{
  display:flex;
  align-items:stretch;
  width:fit-content;
  max-width:86%;
  margin:0 auto;
  padding-top:38px
}
.hlet-ribbon-tri{flex:0 0 auto;width:40px;display:block}
.hlet-ribbon-tri svg{display:block;width:40px;height:100%}
.hlet-ribbon-bar{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:10px 22px;
  min-height:52px
}
.hlet-ribbon-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,2.4vw,34px);
  color:var(--ink);
  text-align:center;
  white-space:nowrap;
  letter-spacing:-.01em
}
.hlet-ribbon-text .em{color:var(--ink);font-weight:900;font-style:italic}

/* 제목·서브 */
.hlet-title-area{
  padding:22px var(--pad-x,56px) 0;
  text-align:center
}
.hlet-title{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(50px,8.6vw,88px);
  color:var(--ink);
  line-height:1.08;
  letter-spacing:-.025em
}
.hlet-title .em{color:var(--accent-d)}
.hlet-sub{
  margin-top:12px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:600;
  font-size:clamp(16px,2.2vw,34px);
  color:var(--ink);
  letter-spacing:-.01em;
  opacity:.88
}
.hlet-sub .em{color:var(--accent-d)}

/* 카드 배너 */
.hlet-banner{
  display:grid;
  gap:14px;
  padding:26px var(--pad-x,56px) 0
}
.hlet-card{
  background:rgba(255,255,255,.2);
  border-radius:calc(var(--r-scale,1)*24px);
  padding:20px 14px 18px;
  text-align:center;
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px)
}
.hlet-card-kw{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(16px,2vw,28px);
  color:var(--ink);
  line-height:1.2
}
.hlet-card-kw .em{color:var(--accent-d)}
.hlet-card-dt{
  margin-top:8px;
  font-size:clamp(12px,1.5vw,20px);
  font-weight:500;
  color:var(--ink);
  line-height:1.5;
  opacity:.78
}
`,
  render: (d, { esc, richSafe }) => {
    const panelColor = resolvePanelColor(d.panelColor)
    const hasImg = typeof d.bgImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.bgImage.trim())
    const colCount = d.cards.length

    // 리본 삼각형 벡터 — 패널색 대비 약간 어두운 셰이드로 표현
    const triL = `<svg viewBox="0 0 40 52" preserveAspectRatio="none" aria-hidden="true"><polygon points="40,0 40,52 0,26" fill="${panelColor}" style="filter:brightness(.82)"/></svg>`
    const triR = `<svg viewBox="0 0 40 52" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,0 0,52 40,26" fill="${panelColor}" style="filter:brightness(.82)"/></svg>`

    return `
<section class="hlet">
  <div class="hlet-bg${hasImg ? '' : ' hlet-noimg'}" aria-hidden="${hasImg ? 'false' : 'true'}">
    ${hasImg ? media(d.bgImage, '', '히어로 배경') : ''}
  </div>
  <div class="hlet-panel" style="background:${panelColor}">
    <div class="hlet-ribbon-wrap">
      <span class="hlet-ribbon-tri">${triL}</span>
      <span class="hlet-ribbon-bar" style="background:${panelColor};filter:brightness(.84)">
        <span class="hlet-ribbon-text">${richSafe(d.ribbon)}</span>
      </span>
      <span class="hlet-ribbon-tri">${triR}</span>
    </div>
    <div class="hlet-title-area">
      <h1 class="hlet-title">${richSafe(d.title)}</h1>
      ${d.subtitle ? `<p class="hlet-sub">${richSafe(d.subtitle)}</p>` : ''}
    </div>
    <div class="hlet-banner" style="grid-template-columns:repeat(${colCount},1fr)">
      ${d.cards.map(c => `
      <div class="hlet-card">
        <p class="hlet-card-kw">${richSafe(c.keyword)}</p>
        <p class="hlet-card-dt">${esc(c.detail)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`
  },
})
