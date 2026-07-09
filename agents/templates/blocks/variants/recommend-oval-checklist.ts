/** RECOMMEND 아키타입: recommend-oval-checklist.
 *  피그마 085_추천_02 구조 흡수.
 *  타원 이중 라인 프레임 원형 이미지 + 별 장식 + 강조 배지 → 하단 아이콘 체크 카드 5행.
 *  '이런 분께 추천드려요' 클리셰를 타겟-고민 맞춤 소구로 대체. 라이트 배경. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 소제목 — 악센트 필 배너 안에 들어감 (순수 텍스트) */
  tagline: z.string().optional(),
  /** 섹션 주 타이틀 (em, br 허용) */
  title: z.string().min(1),
  /** 원형 이미지 (url) — 없으면 타원 프레임만 렌더 */
  image: z.string().optional(),
  /** 타원 우상단 배지 텍스트 — 브리프에 키워드/수치 근거 있을 때만 사용 (순수 텍스트) */
  badgeText: z.string().optional(),
  /** 체크 항목 2~5행. label=아이콘 식별자(ICON_NAMES 35종), text=항목 설명 */
  items: z
    .array(
      z.object({
        icon: z.enum([
          'check','wheat','drop','clock','badge','snow','fryer','oven','star',
          'heart','gift','truck','shield','leaf','trophy','thumb','fire',
          'person','search','pin','box','calendar','card','won','bulb','gear',
          'camera','phone','bolt','thermometer','target','store','doc','sprout','bell',
        ]).default('check'),
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const recommendOvalChecklist = defineBlock<Data>({
  id: 'recommend-oval-checklist',
  archetype: 'recommend',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '추천 대상 블록. 라이트 배경 + 악센트 필 태그라인 배너 + 대형 볼드 타이틀 + 타원 이중 라인 원형 이미지(별 장식·우하단 배지) + 하단 아이콘 체크 카드 2~5행. 이미지 없으면 타원 SVG 프레임 빈 채로 강등 렌더(noimg-safe). 배지·태그라인은 브리프에 근거 있을 때만.',
  schema,
  css: `
/* ── recommend-oval-checklist (접두: rvoc) ── */
.rvoc{background:var(--bg);color:var(--ink);padding:60px var(--pad-x,56px) 68px;text-align:center}

/* 태그라인 배너 */
.rvoc-tag{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-body);font-weight:600;font-size:15px;letter-spacing:.06em;padding:7px 22px;border-radius:calc(var(--r-scale,1)*6px);margin-bottom:18px}

/* 주 타이틀 */
.rvoc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,5vw,60px);line-height:1.18;color:var(--ink);letter-spacing:-.02em;margin-bottom:40px}
.rvoc-title .em{color:var(--accent)}

/* 타원 이중 라인 이미지 영역 */
.rvoc-oval-wrap{position:relative;width:480px;max-width:100%;margin:0 auto 48px}
.rvoc-oval-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.rvoc-oval-svg .ov-outer{fill:none;stroke:var(--accent);stroke-width:2;opacity:.55}
.rvoc-oval-svg .ov-inner{fill:none;stroke:var(--accent);stroke-width:1.4;opacity:.35}

/* 원형 이미지 */
.rvoc-img{display:block;width:360px;max-width:80%;aspect-ratio:1/1;object-fit:cover;border-radius:50%;margin:28px auto;position:relative;z-index:1;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.rvoc-img.ph{display:none!important}

/* 별 장식 (CSS 생성) */
.rvoc-star{position:absolute;background:var(--accent);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);z-index:2}
.rvoc-star.s1{width:26px;height:26px;top:4px;left:50px}
.rvoc-star.s2{width:48px;height:48px;bottom:30px;left:16px}
.rvoc-star.s3{width:32px;height:32px;bottom:16px;right:20px}

/* 우하단 배지 (원형) */
.rvoc-badge{position:absolute;right:8px;bottom:56px;z-index:3;width:96px;height:96px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;text-align:center;padding:10px}
.rvoc-badge span{font-family:var(--font-body);font-weight:600;font-size:13px;line-height:1.4;color:#fff;white-space:pre-line}

/* 체크 카드 */
.rvoc-card{background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*20px);padding:10px 28px 18px;box-shadow:0 8px 28px -12px rgba(0,0,0,.10)}
.rvoc-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--line)}
.rvoc-item:last-child{border-bottom:none}
.rvoc-icon{flex:0 0 36px;width:36px;height:36px;color:var(--accent);display:flex;align-items:center;justify-content:center}
.rvoc-icon svg{width:28px;height:28px;stroke:var(--accent)}
.rvoc-text{font-size:17px;font-weight:500;color:var(--ink);line-height:1.5;text-align:left}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 타원 SVG: 480×480 뷰박스 기준, 외곽/내곽 두 타원 라인
    const ovalSvg = `
<svg class="rvoc-oval-svg" viewBox="0 0 480 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <ellipse class="ov-outer" cx="240" cy="240" rx="236" ry="236"/>
  <ellipse class="ov-inner" cx="240" cy="240" rx="208" ry="208"/>
</svg>`

    const badgeHtml = d.badgeText
      ? `<div class="rvoc-badge"><span>${esc(d.badgeText)}</span></div>`
      : ''

    const itemsHtml = d.items
      .map(
        (item) => `
    <div class="rvoc-item">
      <span class="rvoc-icon">${icon(item.icon)}</span>
      <span class="rvoc-text">${esc(item.text)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="rvoc">
  ${d.tagline ? `<div class="rvoc-tag">${esc(d.tagline)}</div>` : ''}
  <h2 class="disp rvoc-title">${richSafe(d.title)}</h2>

  <div class="rvoc-oval-wrap">
    ${ovalSvg}
    <span class="rvoc-star s1" aria-hidden="true"></span>
    <span class="rvoc-star s2" aria-hidden="true"></span>
    <span class="rvoc-star s3" aria-hidden="true"></span>
    ${media(d.image, 'rvoc-img', '추천 대상 이미지')}
    ${badgeHtml}
  </div>

  <div class="rvoc-card">
    ${itemsHtml}
  </div>
</section>`
  },
})
