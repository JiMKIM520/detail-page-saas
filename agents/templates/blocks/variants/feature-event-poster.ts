/** POINT 아키타입: feature-event-poster.
 *  [끝판왕] 포인트 구성 #22 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 풀블리드 배경 이미지 + ✦ sparkle 장식 대형 날짜/이벤트 헤드라인
 *  + 시간 pill 뱃지 + 날짜 확인 pill + 우하단 앵커 제품 콜아웃 카드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드/장소 eyebrow 라벨 (예: "Golden Hour") */
  eyebrow: z.string().min(1).optional(),
  /** 메인 날짜·이벤트명 1행 (em 허용 — 강조 어절) */
  dateHeadline: z.string().min(1),
  /** 메인 날짜·이벤트명 2행 (em 허용, br 허용) */
  eventHeadline: z.string().min(1),
  /** 시간 pill 텍스트 (예: "OPEN 20:00 PM - CLOSE 03:30 AM") */
  timePill: z.string().min(1).optional(),
  /** 날짜 확인 pill 텍스트 (예: "Coming To You Live on 11st July 2024") */
  datePill: z.string().min(1).optional(),
  /** 풀블리드 배경 이미지 URL */
  bgImage: z.string().optional(),
  /** 우하단 앵커 콜아웃 카드 — 제품명 */
  calloutTitle: z.string().min(1).optional(),
  /** 콜아웃 카드 — 서브 카피 (예: 영문 제품명) */
  calloutSub: z.string().min(1).optional(),
  /** 콜아웃 카드 — 가격 (예: "8,500원") */
  calloutPrice: z.string().min(1).optional(),
})
type Data = z.infer<typeof schema>

export const featureEventPoster = defineBlock<Data>({
  id: 'feature-event-poster',
  archetype: 'point',
  styleTags: ['dark', 'event', 'poster', 'sparkle', 'fullbleed', 'template'],
  imageSlots: 1,
  describe:
    '이벤트 포스터형 포인트. 다크 풀블리드 배경 이미지 위에 ✦ sparkle 장식 대형 날짜/이벤트 헤드라인 + 시간 pill 뱃지 + 날짜 확인 pill + 우하단 앵커 제품 콜아웃 카드. 바·식음료·팝업 오픈 공지, 시즌 이벤트에 적합.',
  schema,
  css: `
/* feature-event-poster — 접두사 fep- */
.fep{position:relative;width:100%;min-height:580px;overflow:hidden;background:var(--ink);display:flex;flex-direction:column;align-items:center;padding:52px 40px 96px;text-align:center;word-break:keep-all;overflow-wrap:break-word}
/* 풀블리드 배경 이미지 */
.fep-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:0;opacity:.55}
.fep-bg.ph{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:.18;border:none}
/* 스크림 — 아래로 갈수록 진해지는 그라데이션 오버레이 */
.fep-scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,.48) 55%,rgba(0,0,0,.72) 100%);pointer-events:none}
/* 콘텐츠 레이어 */
.fep-body{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:100%}
/* eyebrow */
.fep-eyebrow{font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.68);margin-bottom:20px}
/* ✦ sparkle 장식 행 */
.fep-sparkle-row{display:flex;align-items:center;gap:12px;margin-bottom:6px}
.fep-sparkle{font-size:22px;line-height:1;color:var(--accent);user-select:none;flex-shrink:0}
/* 날짜 대형 헤드라인 */
.fep-date{font-family:var(--font-display);font-weight:800;font-size:clamp(42px,9vw,64px);line-height:1.08;letter-spacing:-.02em;color:#fff}
.fep-date .em{color:var(--accent)}
/* 이벤트명 헤드라인 */
.fep-event{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5.5vw,38px);line-height:1.2;letter-spacing:-.015em;color:#fff;margin-top:6px;margin-bottom:24px}
.fep-event .em{color:var(--accent)}
/* pill 뱃지들 */
.fep-pills{display:flex;flex-direction:column;align-items:center;gap:10px}
.fep-pill-time{display:inline-block;border:1.5px solid rgba(255,255,255,.75);border-radius:999px;padding:8px 20px;font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:.06em;color:#fff;white-space:nowrap}
.fep-pill-date{display:inline-block;background:var(--accent);border-radius:999px;padding:8px 20px;font-family:var(--font-body);font-size:12px;font-weight:700;letter-spacing:.04em;color:#fff;white-space:nowrap}
/* 우하단 앵커 콜아웃 카드 */
.fep-callout{position:absolute;bottom:28px;right:28px;z-index:3;background:rgba(20,16,12,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:14px 18px;text-align:left;min-width:130px;max-width:180px}
.fep-callout-title{font-family:var(--font-display);font-weight:800;font-size:13px;color:#fff;line-height:1.35;margin-bottom:3px}
.fep-callout-sub{font-size:11px;color:rgba(255,255,255,.52);line-height:1.4;margin-bottom:6px}
.fep-callout-price{font-family:var(--font-display);font-weight:800;font-size:15px;color:var(--accent);letter-spacing:.01em}
`,
  render: (d, { esc, richSafe }) => {
    const callout =
      d.calloutTitle || d.calloutPrice
        ? `
  <div class="fep-callout">
    ${d.calloutTitle ? `<div class="fep-callout-title">${richSafe(d.calloutTitle)}</div>` : ''}
    ${d.calloutSub ? `<div class="fep-callout-sub">${esc(d.calloutSub)}</div>` : ''}
    ${d.calloutPrice ? `<div class="fep-callout-price">${esc(d.calloutPrice)}</div>` : ''}
  </div>`
        : ''

    return `
<section class="fep">
  ${media(d.bgImage, 'fep-bg', esc(d.eyebrow ?? '배경 이미지'))}
  <div class="fep-scrim"></div>
  <div class="fep-body">
    ${d.eyebrow ? `<p class="fep-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <div class="fep-sparkle-row">
      <span class="fep-sparkle">✦</span>
      <h2 class="fep-date">${richSafe(d.dateHeadline)}</h2>
      <span class="fep-sparkle">✦</span>
    </div>
    <h3 class="fep-event">${richSafe(d.eventHeadline)}</h3>
    <div class="fep-pills">
      ${d.timePill ? `<span class="fep-pill-time">${esc(d.timePill)}</span>` : ''}
      ${d.datePill ? `<span class="fep-pill-date">${esc(d.datePill)}</span>` : ''}
    </div>
  </div>${callout}
</section>`
  },
})
