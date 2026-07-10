/** REASON 아키타입: reason-bubble-stack
 *  피그마 185_제품소개_06 흡수 — 말풍선 서브타이틀 배지(검정 필+삼각 꼬리 SVG) + 대형 헤드라인
 *  → 라운드 사진 프레임 → 4개 흰색 행 카드(다크 원형 번호 배지 + 제목 + 부제) 수직 스택.
 *  라이트 배경. 신뢰 약속 포인트 강조용. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().min(1),                      // 말풍선 배지 텍스트 (순수 텍스트)
  title: z.string().min(1),                      // 대형 헤드라인 (em,br)
  image: z.string().optional(),                  // 라운드 사진 (url)
  imageAlt: z.string().optional(),               // 사진 대체 텍스트
  items: z
    .array(
      z.object({
        label: z.string().min(1),                // 행 카드 제목 (em 허용)
        desc: z.string().min(1),                 // 행 카드 부제 (순수 텍스트)
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const reasonBubbleStack = defineBlock<Data>({
  id: 'reason-bubble-stack',
  archetype: 'reason',
  styleTags: ['light', 'trust', 'numbered', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '신뢰 근거 제시 블록. 말풍선 모양 서브타이틀 배지(검정 필+삼각 꼬리) + 대형 헤드라인 + 라운드 사진 + 흰색 행 카드(다크 원형 번호·제목·부제) 수직 스택. 라이트 배경. 바디케어·뷰티·식품 등 약속/신뢰 소구에 적합.',
  schema,
  css: `
/* reason-bubble-stack — 접두 rydr */
.rydr{background:var(--bg);padding:60px var(--pad-x,56px) 70px;text-align:center;color:var(--ink)}

/* 말풍선 배지 영역 */
.rydr-bubble-wrap{display:inline-flex;flex-direction:column;align-items:center;margin-bottom:18px}
.rydr-bubble{display:inline-block;background:var(--ink);color:var(--paper,#fff);
  font-family:var(--font-display);font-weight:600;font-size:clamp(18px,calc(var(--r-scale,1)*20px),24px);
  line-height:1.2;padding:14px 28px;
  border-radius:calc(var(--r-scale,1)*42px);white-space:nowrap}
/* 삼각 꼬리: CSS 클립 경로 삼각형 (벡터 재현) */
.rydr-tail{width:30px;height:26px;background:var(--ink);
  clip-path:polygon(0 0,100% 0,50% 100%);margin-top:-1px}

/* 대형 헤드라인 */
.rydr-title{font-family:var(--font-display);font-weight:700;
  font-size:clamp(32px,calc(var(--r-scale,1)*44px),56px);
  line-height:1.22;color:var(--ink);margin:0 0 32px}
.rydr-title .em{color:var(--accent)}

/* 사진 프레임 */
.rydr-photo-wrap{margin:0 auto 36px;
  width:min(100%,760px);aspect-ratio:760/600;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*80px));
  overflow:hidden;background:var(--line)}
.rydr-photo-wrap img,.rydr-photo-wrap .ph{
  width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}
/* noimg-safe: 이미지 없으면 프레임 자체를 숨김 */
.rydr-photo-wrap:empty,.rydr-photo-wrap.rydr-no-img{display:none}

/* 행 카드 스택 */
.rydr-list{display:flex;flex-direction:column;gap:12px;max-width:760px;margin:0 auto}
.rydr-card{background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*18px);
  padding:26px 28px 24px;display:flex;flex-direction:column;align-items:center;
  gap:10px;position:relative}

/* 다크 원형 번호 배지 */
.rydr-num{width:48px;height:48px;border-radius:50%;
  background:var(--brand,var(--ink));color:var(--paper,#fff);
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(20px,calc(var(--r-scale,1)*24px),28px);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;margin-bottom:2px}

.rydr-card-body{text-align:center}
.rydr-card-label{font-family:var(--font-display);font-weight:600;
  font-size:clamp(17px,calc(var(--r-scale,1)*20px),24px);
  color:var(--ink);line-height:1.28;margin-bottom:6px}
.rydr-card-label .em{color:var(--accent)}
.rydr-card-desc{font-size:clamp(14px,calc(var(--r-scale,1)*16px),18px);
  color:var(--ink-2);line-height:1.6;font-weight:400}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 부재 시 photo-wrap을 rydr-no-img 클래스로 강등(CSS로 숨김)
    const photoHtml = (() => {
      if (!d.image) {
        return `<div class="rydr-photo-wrap rydr-no-img" aria-hidden="true"></div>`
      }
      return `<div class="rydr-photo-wrap">${media(d.image, '', esc(d.imageAlt ?? '제품 이미지'))}</div>`
    })()

    const cards = d.items
      .map(
        (item, i) => `
    <div class="rydr-card">
      <div class="rydr-num" aria-hidden="true">${i + 1}</div>
      <div class="rydr-card-body">
        <p class="rydr-card-label">${richSafe(item.label)}</p>
        <p class="rydr-card-desc">${esc(item.desc)}</p>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="rydr">
  <div class="rydr-bubble-wrap" aria-hidden="true">
    <span class="rydr-bubble">${esc(d.badge)}</span>
    <div class="rydr-tail"></div>
  </div>
  <h2 class="rydr-title">${richSafe(d.title)}</h2>
  ${photoHtml}
  <div class="rydr-list" role="list">
    ${cards}
  </div>
</section>`
  },
})
