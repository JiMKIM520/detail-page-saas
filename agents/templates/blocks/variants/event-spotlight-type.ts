/** EVENT 아키타입: event-spotlight-type
 *  피그마 033_포인트_구성_페이지_12 구조 흡수.
 *  검정 배경 + 스포트라이트 이미지 오버레이 + 3줄 200pt 초대형 타이포(핵심 장치) +
 *  하단 이벤트 날짜 행(수평선 사이) + 서브 헤드 + 설명 카피.
 *  이미지 없을 때: 스포트라이트 레이어 제거, CSS 방사형 그라데이션으로 조명 효과 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 초대형 3줄 타이포 — 줄바꿈은 <br> 허용. 예: "BLACK<br>FRIDAY<br>DAY" */
  heroText: z.string().min(1),
  /** 스포트라이트 오버레이 이미지 (url). 없으면 CSS 방사형 조명으로 강등. */
  image: z.string().optional(),
  /** 서브 헤드라인 — em 허용 */
  subhead: z.string().min(1),
  /** 이벤트 소개 한 줄 — 순수 텍스트 */
  desc: z.string().optional(),
  /** 이벤트 기간 텍스트. 예: "11월 29일 - 12월 2일" */
  dateRange: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const eventSpotlightType = defineBlock<Data>({
  id: 'event-spotlight-type',
  archetype: 'event',
  styleTags: ['dark', 'editorial', 'seasonal', 'typographic', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '블랙프라이데이·시즈널 이벤트 포인트 블록. 검정 배경 위 스포트라이트 이미지 오버레이, 3줄 초대형 라틴 디스플레이 타이포(핵심 장치), 하단 서브헤드·설명·날짜 행(수평선 사이). 이미지 없으면 CSS 방사형 그라데이션으로 조명 강등.',
  schema,
  css: `
/* ── 최상위 섹션 ── */
.eife{
  position:relative;
  background:#080808;
  color:#ffffff;
  overflow:hidden;
  padding:0 var(--pad-x,56px) 64px;
  min-height:640px;
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
}
/* ── 스포트라이트 이미지 레이어 ── */
.eife-spotlight{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center top;
  pointer-events:none;
  mix-blend-mode:screen;
  opacity:.72;
}
.eife-spotlight.ph{display:none}
/* ── 이미지 없을 때: CSS 방사형 조명(noimg-safe 강등) ── */
.eife::before{
  content:'';
  position:absolute;
  inset:0;
  background:radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,255,255,.13) 0%, transparent 70%);
  pointer-events:none;
  z-index:0;
}
/* 이미지 있을 때 CSS 조명 약화(이미지가 더 강함) */
.eife.eife--img::before{opacity:.4}
/* ── 스크림(이미지→텍스트 경계 그라데이션) ── */
.eife-scrim{
  position:absolute;
  inset:0;
  background:linear-gradient(to bottom, transparent 0%, rgba(8,8,8,.55) 50%, #080808 78%);
  pointer-events:none;
  z-index:1;
}
/* ── 히어로 타이포 ── */
.eife-hero{
  position:relative;
  z-index:2;
  font-family:var(--font-display,'Inter',sans-serif);
  font-weight:800;
  font-size:clamp(100px,18vw,200px);
  line-height:.92;
  letter-spacing:-.03em;
  color:#ffffff;
  margin:0 0 48px;
  padding-top:clamp(120px,22vw,240px);
  word-break:keep-all;
}
.eife-hero .em{color:var(--em-dark,#FFF7EA)}
/* ── 하단 콘텐츠 박스 ── */
.eife-body{
  position:relative;
  z-index:2;
}
/* ── 서브헤드 ── */
.eife-subhead{
  font-family:var(--font-display,'Inter',sans-serif);
  font-weight:800;
  font-size:clamp(28px,5vw,52px);
  line-height:1.1;
  color:#ffffff;
  margin:0 0 14px;
}
.eife-subhead .em{color:var(--em-dark,#FFF7EA)}
/* ── 설명 ── */
.eife-desc{
  font-family:var(--font-body,sans-serif);
  font-weight:400;
  font-size:clamp(15px,2.2vw,22px);
  color:rgba(202,194,194,.9);
  margin:0 0 32px;
  line-height:1.55;
}
/* ── 날짜 행 (수평선 사이) ── */
.eife-date-block{
  display:flex;
  flex-direction:column;
  gap:0;
}
.eife-rule{
  width:100%;
  height:1px;
  background:rgba(217,217,217,.45);
  border:none;
  margin:0;
}
.eife-date{
  font-family:var(--font-display,'Inter',sans-serif);
  font-weight:600;
  font-size:clamp(16px,2.8vw,28px);
  color:#ffffff;
  letter-spacing:.04em;
  padding:14px 0;
  margin:0;
}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0
    // heroText: (em,br) 허용 — richSafe 처리
    // subhead: (em) 허용 — richSafe 처리
    return `
<section class="eife${hasImg ? ' eife--img' : ''}">
  ${hasImg ? `<img class="eife-spotlight" src="${esc(d.image)}" alt="" aria-hidden="true" loading="lazy">` : `<div class="eife-spotlight ph" aria-hidden="true"></div>`}
  <div class="eife-scrim" aria-hidden="true"></div>
  <h2 class="eife-hero">${richSafe(d.heroText)}</h2>
  <div class="eife-body">
    <p class="eife-subhead">${richSafe(d.subhead)}</p>
    ${d.desc ? `<p class="eife-desc">${esc(d.desc)}</p>` : ''}
    <div class="eife-date-block">
      <hr class="eife-rule">
      <p class="eife-date">${esc(d.dateRange)}</p>
      <hr class="eife-rule">
    </div>
  </div>
</section>`
  },
})
