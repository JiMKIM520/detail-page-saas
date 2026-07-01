/** POINT 아키타입: point-timing-banner.
 *  [끝판왕] 포인트 구성 #15 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + 상단 pill 뱃지 2종(질문+답) + 풀폭 검정 하이라이트 밴드 위 대형 헤드라인
 *  + 날짜/기간 텍스트 + 풀폭 상품 이미지. 타이밍·당일도착 등 긴급 포인트 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 왼쪽 pill 라벨 (예: "오늘 주문하면?") */
  badgeQuestion: z.string().min(1),
  /** 오른쪽 pill 라벨 (예: "당일 도착") */
  badgeAnswer: z.string().min(1),
  /** 풀폭 검정 밴드 위 대형 헤드라인 (em, br 허용) */
  headline: z.string().min(1),
  /** 날짜·기간 텍스트 (예: "2025. 00. 00 ~ 00. 00.") — 선택 */
  dateRange: z.string().optional(),
  /** 헤드라인 아래 풀폭 상품/분위기 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointTimingBanner = defineBlock<Data>({
  id: 'point-timing-banner',
  archetype: 'point',
  styleTags: ['light', 'urgency', 'timing', 'highlight-band', 'template'],
  imageSlots: 1,
  describe:
    '타이밍 포인트 배너. 밝은 배경 + 상단 pill 2종(질문|답) + 풀폭 검정 하이라이트 밴드 위 대형 헤드라인 + 날짜/기간 + 풀폭 이미지. 당일도착·한정수량 등 긴급 강조 섹션.',
  schema,
  css: `
/* point-timing-banner — 접두사 ptb- */
.ptb{background:var(--paper);padding:36px 0 0;text-align:center;word-break:keep-all;overflow-wrap:break-word}
/* pill 뱃지 행 */
.ptb-pills{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:22px;padding:0 40px}
.ptb-pill{display:inline-flex;align-items:center;height:34px;padding:0 18px;border-radius:999px;font-family:var(--font-body);font-size:14px;font-weight:600;letter-spacing:.01em;white-space:nowrap}
.ptb-pill.q{background:var(--bg);color:var(--ink);border:1.5px solid var(--line)}
.ptb-pill.a{background:var(--ink);color:#fff;border:1.5px solid var(--ink)}
.ptb-sep{width:1px;height:20px;background:var(--line);margin:0 12px;flex-shrink:0}
/* 풀폭 검정 하이라이트 밴드 */
.ptb-band{background:var(--ink);padding:18px 40px 20px;margin:0}
.ptb-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,7.5vw,46px);line-height:1.22;letter-spacing:-.025em;color:#fff}
/* 다크 밴드 위 .em → accent(밝은 포인트색)으로 override */
.ptb-headline .em{color:var(--accent)}
/* 날짜/기간 */
.ptb-date{padding:14px 40px 18px;font-family:var(--font-body);font-size:14px;color:var(--muted);letter-spacing:.02em;line-height:1.5}
/* 풀폭 이미지 */
.ptb-img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.ptb-img.ph{width:100%;aspect-ratio:3/4;border:2px dashed var(--line);background:var(--bg);color:var(--muted);font-size:13px}
`,
  render: (d, { esc, richSafe }) => `
<section class="ptb">
  <div class="ptb-pills">
    <span class="ptb-pill q">${esc(d.badgeQuestion)}</span>
    <span class="ptb-sep" role="separator" aria-hidden="true"></span>
    <span class="ptb-pill a">${esc(d.badgeAnswer)}</span>
  </div>
  <div class="ptb-band">
    <h2 class="ptb-headline">${richSafe(d.headline)}</h2>
  </div>
  ${d.dateRange ? `<p class="ptb-date">${esc(d.dateRange)}</p>` : ''}
  ${media(d.image, 'ptb-img', esc(d.imageAlt ?? '타이밍 이미지'))}
</section>`,
})
