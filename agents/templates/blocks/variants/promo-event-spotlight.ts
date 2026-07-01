/** PROMO 아키타입: promo-event-spotlight.
 *  [끝판왕] 포인트 구성 #12 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + 상단 코닉 스포트라이트 빔 + 풀폭 3행 오버사이즈 이벤트명
 *  + accent 서브카피 + 구분선 테두리 날짜 범위 배지. 시즈널 프로모션/세일 이벤트 선언형. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 이벤트명 3줄 (예: ["BLACK","FRIDAY","DAY"]). 두 번째 줄에 accent 강조 적용됨. */
  eventLines: z
    .array(z.string().min(1))
    .length(3),
  /** accent 색으로 표시되는 서브 헤드라인 (em/br 허용) */
  headline: z.string().min(1),
  /** 본문 설명 (em/br 허용, 예: "1년에 딱 한번!<br>OO브랜드 레전드 할인 혜택") */
  body: z.string().optional(),
  /** 이벤트 시작 날짜 라벨 (예: "00월 00일") */
  dateStart: z.string().min(1),
  /** 이벤트 종료 날짜 라벨 (예: "00월 00일") */
  dateEnd: z.string().min(1),
  /** 스포트라이트 빔 색상 힌트 — 기본 accent. 다른 효과로 교체 시 사용자 override 가능. */
  spotlightColor: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const promoEventSpotlight = defineBlock<Data>({
  id: 'promo-event-spotlight',
  archetype: 'promo' as any,
  styleTags: ['dark', 'event', 'seasonal', 'oversized-type', 'spotlight', 'template'],
  imageSlots: 0,
  describe:
    '시즈널 이벤트 선언형 프로모 배너. 다크 배경 + 상단 코닉 스포트라이트 빔 + 3행 풀폭 오버사이즈 이벤트명(2번째 줄 accent) + accent 서브 헤드라인 + 본문 + 구분선 테두리 날짜 범위. 블랙프라이데이·시즌세일 등 임팩트 이벤트 오프닝.',
  schema,
  css: `
/* promo-event-spotlight — 접두사 pes- */
.pes{
  position:relative;
  background:var(--ink);
  color:#fff;
  text-align:center;
  padding:0 0 56px;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* ── 스포트라이트 빔 (상단 코닉 그라데이션) ── */
.pes-beam{
  position:absolute;
  top:-40px;
  left:50%;
  transform:translateX(-50%);
  width:480px;
  height:520px;
  pointer-events:none;
  z-index:0;
  background:conic-gradient(
    from 266deg at 50% 0%,
    transparent 0%,
    color-mix(in srgb, var(--accent) 22%, transparent) 12%,
    color-mix(in srgb, var(--accent) 38%, transparent) 17%,
    color-mix(in srgb, var(--accent) 22%, transparent) 22%,
    transparent 34%
  );
  /* 빔 하단으로 갈수록 페이드 */
  -webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  mask-image:linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
}

/* ── 이벤트명 3행 스택 ── */
.pes-display{
  position:relative;
  z-index:1;
  padding:52px 16px 0;
  line-height:.92;
}
.pes-line{
  display:block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(72px, 22vw, 120px);
  letter-spacing:-.03em;
  color:rgba(255,255,255,.18);
  text-transform:uppercase;
}
/* 두 번째 줄(인덱스 1) — accent 강조 */
.pes-line.pes-accent{
  color:var(--accent);
  text-shadow:0 0 60px color-mix(in srgb, var(--accent) 40%, transparent);
}
/* 세 번째 줄 — 흰색 medium */
.pes-line.pes-third{
  color:#fff;
}

/* ── 서브 헤드라인 ── */
.pes-headline{
  position:relative;
  z-index:1;
  margin-top:28px;
  padding:0 40px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px, 5vw, 24px);
  color:var(--accent);
  line-height:1.45;
  letter-spacing:-.01em;
}
.pes-headline .em{
  color:#fff;
}

/* ── 본문 ── */
.pes-body{
  position:relative;
  z-index:1;
  margin-top:12px;
  padding:0 48px;
  font-family:var(--font-body);
  font-size:14px;
  color:rgba(255,255,255,.56);
  line-height:1.7;
}
.pes-body .em{
  color:var(--accent);
  font-weight:700;
}

/* ── 날짜 범위 배지 ── */
.pes-date-wrap{
  position:relative;
  z-index:1;
  display:inline-flex;
  align-items:center;
  gap:0;
  margin-top:32px;
}
.pes-date-sep-line{
  width:40px;
  height:1px;
  background:rgba(255,255,255,.38);
}
.pes-date-box{
  display:inline-flex;
  align-items:center;
  gap:8px;
  border:1px solid rgba(255,255,255,.38);
  border-radius:2px;
  padding:10px 24px;
}
.pes-date-start,
.pes-date-end{
  font-family:var(--font-display);
  font-weight:700;
  font-size:15px;
  color:#fff;
  letter-spacing:.02em;
  white-space:nowrap;
}
.pes-date-divider{
  color:rgba(255,255,255,.46);
  font-size:15px;
  font-weight:400;
  padding:0 4px;
}
`,
  render: (d, { esc, richSafe }) => {
    const [line0, line1, line2] = d.eventLines
    return `
<section class="pes">
  <div class="pes-beam"></div>
  <div class="pes-display">
    <span class="pes-line">${esc(line0)}</span>
    <span class="pes-line pes-accent">${esc(line1)}</span>
    <span class="pes-line pes-third">${esc(line2)}</span>
  </div>
  <p class="pes-headline">${richSafe(d.headline)}</p>
  ${d.body ? `<p class="pes-body">${richSafe(d.body)}</p>` : ''}
  <div class="pes-date-wrap">
    <span class="pes-date-sep-line"></span>
    <div class="pes-date-box">
      <span class="pes-date-start">${esc(d.dateStart)}</span>
      <span class="pes-date-divider">-</span>
      <span class="pes-date-end">${esc(d.dateEnd)}</span>
    </div>
    <span class="pes-date-sep-line"></span>
  </div>
</section>`
  },
})
