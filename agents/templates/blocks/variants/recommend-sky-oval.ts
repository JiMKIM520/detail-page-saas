/** RECOMMEND 아키타입: recommend-sky-oval
 *  피그마 068_추천_01 구조 흡수 재구성.
 *  하늘색 배경 대형 질문 타이틀 + 타원 2중 아웃라인+별 장식 인물 사진 + 원형 키워드 배너(오버랩) +
 *  하단 흰 패널에 서브타이틀 배지 + 아이콘+추천 대상 리스트(2~6개).
 *  이미지 없을 때: 타원 프레임+배너 영역을 숨기고 질문 타이틀+리스트만 표시(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 질문 타이틀 (em, br 허용). 예: "왜 피부는\n계속 건조할까요?" */
  question: z.string().min(1),
  /** 인물/제품 사진 URL (optional — 없으면 사진 영역 생략) */
  image: z.string().optional(),
  /** 원형 배너 강조 문구 (2줄 권장, br 허용). 브리프 근거 시만 노출. */
  badgeText: z.string().optional(),
  /** 추천 패널 섹션 제목 */
  panelTitle: z.string().min(1),
  /** 패널 타이틀 아래 배지(띠) 문구 */
  panelBadge: z.string().optional(),
  /** 추천 대상 리스트 (2~6개) */
  items: z
    .array(
      z.object({
        icon: z.string().min(1), // ICON_NAMES 35종 중 하나
        text: z.string().min(1), // 추천 대상 설명
      }),
    )
    .min(2)
    .max(6),
})

type Data = z.infer<typeof schema>

export const recommendSkyOval = defineBlock<Data>({
  id: 'recommend-sky-oval',
  archetype: 'recommend',
  styleTags: ['light', 'beauty', 'soft', 'question-hook', 'oval-photo', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '추천 대상 소개 블록. 하늘색 배경 위 대형 질문 카피 + 타원 2중 아웃라인+별 장식 인물 사진 + 원형 키워드 배너 오버랩 + 하단 흰 패널 추천 리스트. 뷰티/스킨케어 제품에 적합. 이미지 없으면 질문+리스트만 표시.',
  schema,
  css: `
/* ── rfij: recommend-sky-oval ─────────────────────────────── */
.rfij{
  background:var(--bg);
  color:var(--ink);
  padding:0 0 0;
  overflow:hidden;
}

/* 1. 질문 타이틀 영역 */
.rfij-sky{
  background:color-mix(in srgb,var(--accent) 18%,#b0e0ff 82%);
  padding:52px var(--pad-x,56px) 0;
  text-align:center;
}
.rfij-q{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,8vw,88px);
  line-height:1.12;
  color:var(--accent);
  white-space:pre-line;
}
.rfij-q .em{color:var(--accent-d)}

/* 2. 사진 영역 */
.rfij-photo-wrap{
  position:relative;
  display:flex;
  justify-content:center;
  padding:24px var(--pad-x,56px) 0;
  background:color-mix(in srgb,var(--accent) 18%,#b0e0ff 82%);
}
.rfij-oval-stage{
  position:relative;
  width:min(500px,78%);
}

/* 타원 2중 아웃라인 (SVG overlay) */
.rfij-oval-frame{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  pointer-events:none;
  z-index:2;
}

/* 인물 사진: 타원 클리핑 마스크 */
.rfij-photo{
  display:block;
  width:100%;
  aspect-ratio:4/4.6;
  object-fit:cover;
  clip-path:ellipse(46% 49% at 50% 50%);
  border-radius:var(--shape-photo, 50%/50%);
  position:relative;
  z-index:1;
}

/* noimg-safe: .ph는 공통 display:none!important — 사진 없으면 .rfij-photo-wrap 전체 숨김 */
.rfij-photo.ph{display:none!important}
.rfij-photo-wrap:has(.rfij-photo.ph){display:none}

/* 원형 배너 (우하단 오버랩) */
.rfij-circle-badge{
  position:absolute;
  right:-2%;
  bottom:10%;
  width:clamp(110px,18%,170px);
  aspect-ratio:1/1;
  border-radius:50%;
  background:var(--accent);
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  z-index:3;
  box-shadow:0 6px 24px -6px rgba(0,0,0,.25);
}
.rfij-circle-badge span{
  font-family:var(--font-display);
  font-weight:300;
  font-size:clamp(18px,2.8vw,36px);
  color:#ffffff;
  line-height:1.25;
  white-space:pre-line;
}

/* 별 장식 (SVG 인라인, accent 색) */
.rfij-star{
  position:absolute;
  fill:var(--accent);
  pointer-events:none;
  z-index:4;
}
.rfij-star-lg{ width:clamp(36px,5.5%,56px); aspect-ratio:1/1; left:4%; bottom:28%; }
.rfij-star-md{ width:clamp(22px,3.5%,38px); aspect-ratio:1/1; right:30%; bottom:3%; }
.rfij-star-sm{ width:clamp(16px,2.5%,28px); aspect-ratio:1/1; left:22%; bottom:4%; }

/* 3. 하단 흰 패널 */
.rfij-panel{
  background:var(--paper, #ffffff);
  padding:48px var(--pad-x,56px) 56px;
  text-align:center;
}
.rfij-panel-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,4.5vw,58px);
  color:var(--accent);
  line-height:1.18;
}
.rfij-panel-badge{
  display:inline-block;
  margin-top:18px;
  background:var(--accent);
  color:#ffffff;
  font-family:var(--font-display);
  font-weight:500;
  font-size:clamp(14px,2vw,32px);
  padding:10px 28px;
  border-radius:calc(var(--r-scale,1)*6px);
}

/* 추천 리스트 */
.rfij-list{
  margin-top:32px;
  display:flex;
  flex-direction:column;
  gap:0;
  text-align:left;
  max-width:620px;
  margin-left:auto;
  margin-right:auto;
}
.rfij-item{
  display:flex;
  align-items:center;
  gap:18px;
  padding:16px 0;
  border-bottom:1px solid var(--line, #eee);
}
.rfij-item:last-child{border-bottom:none}
.rfij-icon{
  flex:0 0 36px;
  width:36px;
  height:36px;
  color:var(--accent);
}
.rfij-icon svg{width:100%;height:100%}
.rfij-item-text{
  font-size:clamp(15px,2.2vw,30px);
  font-weight:400;
  color:var(--ink);
  line-height:1.5;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0

    // 4-뾰족 별 SVG 헬퍼
    const starSvg = `<svg viewBox="0 0 32 32"><path d="M16 0l3.2 12.8L32 16l-12.8 3.2L16 32l-3.2-12.8L0 16l12.8-3.2z"/></svg>`

    // 타원 2중 아웃라인 SVG (viewBox에 맞게 비율 조정)
    const ovalFrame = `<svg class="rfij-oval-frame" viewBox="0 0 500 575" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="250" cy="287" rx="230" ry="270" stroke="var(--accent)" stroke-width="2.2" opacity=".5"/>
  <ellipse cx="250" cy="287" rx="215" ry="254" stroke="var(--accent)" stroke-width="1.4" opacity=".35"/>
</svg>`

    return `
<section class="rfij">
  <div class="rfij-sky">
    <h2 class="rfij-q">${richSafe(d.question)}</h2>
  </div>

  ${hasImg ? `
  <div class="rfij-photo-wrap">
    <div class="rfij-oval-stage">
      ${media(d.image, 'rfij-photo', '추천 대상 인물')}
      ${ovalFrame}
      ${d.badgeText ? `
      <div class="rfij-circle-badge">
        <span>${richSafe(d.badgeText)}</span>
      </div>` : ''}
      <svg class="rfij-star rfij-star-lg" viewBox="0 0 32 32">${starSvg.replace('<svg viewBox="0 0 32 32">', '').replace('</svg>', '')}</svg>
      <svg class="rfij-star rfij-star-md" viewBox="0 0 32 32">${starSvg.replace('<svg viewBox="0 0 32 32">', '').replace('</svg>', '')}</svg>
      <svg class="rfij-star rfij-star-sm" viewBox="0 0 32 32">${starSvg.replace('<svg viewBox="0 0 32 32">', '').replace('</svg>', '')}</svg>
    </div>
  </div>` : ''}

  <div class="rfij-panel">
    <h3 class="rfij-panel-title">${richSafe(d.panelTitle)}</h3>
    ${d.panelBadge ? `<div class="rfij-panel-badge">${esc(d.panelBadge)}</div>` : ''}
    <ul class="rfij-list">
      ${d.items.map(item => `
      <li class="rfij-item">
        <span class="rfij-icon">${icon(item.icon)}</span>
        <span class="rfij-item-text">${esc(item.text)}</span>
      </li>`).join('')}
    </ul>
  </div>
</section>`
  },
})
