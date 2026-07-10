/** POINT 아키타입: point-spec-sandwich.
 *  피그마 088 재구성: 상하 말풍선 배너(삼각형 꼬리)가 중앙 제품 이미지를 샌드위치하고,
 *  좌측에 대형 스펙 수치(150kg 급)가 오버랩되는 포인트 섹션. 톤: light / warm. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 배너 짧은 레이블 (예: "내하중 최대") */
  specLabel: z.string().min(1),
  /** 대형 스펙 수치 (예: "150kg") — em 허용 */
  specValue: z.string().min(1),
  /** 스펙 수치 아래 보조 단위/설명 한 줄 (선택) */
  specUnit: z.string().optional(),
  /** 헤드라인 앞 줄 — 일반 강도 (예: "150kg의 무게도 거뜬하게") */
  headlinePlain: z.string().min(1),
  /** 헤드라인 뒷 줄 — 강조 강도, em 허용 (예: "강력한 내구성") */
  headlineEm: z.string().min(1),
  /** 본문 카피 — 줄바꿈 br 허용 */
  body: z.string().optional(),
  /** 제품 이미지 URL (없으면 배경색 영역으로 강등) */
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointSpecSandwich = defineBlock<Data>({
  id: 'point-spec-sandwich',
  archetype: 'point',
  // noimg-safe: 이미지 없을 시 배경색 플레이스홀더로 강등 렌더
  styleTags: ['light', 'warm', 'spec', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '상하 말풍선 배너(삼각형 꼬리)가 제품 이미지를 샌드위치하고, 좌측에 대형 스펙 수치가 이미지 위로 오버랩되는 포인트 섹션. 내구성·용량·하중 등 단일 핵심 수치를 임팩트 있게 강조. 워밍 베이지 계열.',
  schema,
  css: `
/* ── point-spec-sandwich (prefix: paum) ── */
.paum{
  position:relative;
  background:var(--bg);
  padding:0 0 0;
  overflow:hidden;
  max-width:872px;
  margin:0 auto;
  font-family:var(--font-body);
  color:var(--ink);
}

/* 상단 말풍선 배너 */
.paum-balloon-top{
  position:relative;
  background:color-mix(in srgb,var(--accent) 28%,var(--bg));
  width:100%;
  padding:28px var(--pad-x,56px) 32px;
  z-index:2;
}
/* 하향 삼각형 꼬리 */
.paum-balloon-top::after{
  content:'';
  position:absolute;
  bottom:-44px;
  left:50%;
  transform:translateX(-50%);
  width:0;height:0;
  border-left:108px solid transparent;
  border-right:108px solid transparent;
  border-top:44px solid color-mix(in srgb,var(--accent) 28%,var(--bg));
  z-index:2;
}

/* 헤드라인 블록 (상단 배너 안) */
.paum-headline-plain{
  font-size:clamp(28px,4vw,52px);
  font-weight:400;
  line-height:1.25;
  color:var(--ink);
  letter-spacing:-.01em;
}
.paum-headline-em{
  font-size:clamp(28px,4vw,52px);
  font-weight:700;
  line-height:1.25;
  color:var(--accent-d);
  letter-spacing:-.01em;
  margin-top:4px;
}
.paum-headline-em .em{color:var(--accent-d)}

.paum-body{
  margin-top:16px;
  font-size:clamp(14px,1.5vw,18px);
  font-weight:400;
  line-height:1.72;
  color:var(--ink-2);
  max-width:560px;
}
.paum-body .em{color:var(--accent-d);font-weight:600}

/* 중앙 이미지+스펙 영역 */
.paum-stage{
  position:relative;
  width:100%;
  /* 상단 배너 꼬리 44px + 제품 사진 영역 */
  padding-top:44px;
  z-index:1;
}

/* 제품 이미지 프레임 (누끼/투명 누끼 전용 — contain) */
.paum-img-frame{
  position:relative;
  width:54%;
  margin:0 auto;
  aspect-ratio:5/8;
  background:color-mix(in srgb,var(--accent) 8%,var(--bg));
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*20px));
  overflow:hidden;
}
.paum-img-frame img,.paum-img-frame .ph{
  width:100%;height:100%;
  object-fit:contain;
  border-radius:inherit;
}
/* noimg-safe: 이미지 없을 때 .ph는 배경색 유지, 텍스트 없음 */

/* 스펙 오버레이 — 이미지 좌측 절반 위 절대 배치 */
.paum-spec{
  position:absolute;
  top:50%;
  left:var(--pad-x,56px);
  transform:translateY(-58%);
  z-index:3;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
}
.paum-spec-label{
  font-size:clamp(13px,1.4vw,18px);
  font-weight:600;
  color:var(--accent-d);
  letter-spacing:.01em;
  line-height:1.2;
  margin-bottom:2px;
}
.paum-spec-value{
  font-family:var(--font-display);
  font-size:clamp(64px,11vw,120px);
  font-weight:900;
  line-height:.92;
  color:var(--accent-d);
  letter-spacing:-.03em;
}
.paum-spec-value .em{color:var(--accent)}
.paum-spec-div{
  width:clamp(80px,14vw,160px);
  height:2px;
  background:var(--accent-d);
  opacity:.55;
  margin-top:10px;
}
.paum-spec-unit{
  margin-top:6px;
  font-size:clamp(12px,1.2vw,15px);
  font-weight:500;
  color:var(--muted);
  letter-spacing:.02em;
}

/* 하단 말풍선 배너 */
.paum-balloon-bot{
  position:relative;
  background:color-mix(in srgb,var(--accent) 28%,var(--bg));
  width:100%;
  padding:32px var(--pad-x,56px) 28px;
  z-index:2;
  margin-top:0;
}
/* 상향 삼각형 꼬리 */
.paum-balloon-bot::before{
  content:'';
  position:absolute;
  top:-44px;
  left:50%;
  transform:translateX(-50%);
  width:0;height:0;
  border-left:108px solid transparent;
  border-right:108px solid transparent;
  border-bottom:44px solid color-mix(in srgb,var(--accent) 28%,var(--bg));
  z-index:2;
}
/* 하단 배너 안 보조 텍스트(없어도 무방 — 빈 배너도 구조 완성) */
.paum-balloon-bot-inner{
  min-height:24px;
  display:flex;
  align-items:center;
  justify-content:center;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="paum">

  <!-- 상단 말풍선 배너: 헤드라인 + 본문 -->
  <div class="paum-balloon-top">
    <p class="paum-headline-plain">${esc(d.headlinePlain)}</p>
    <p class="paum-headline-em">${richSafe(d.headlineEm)}</p>
    ${d.body ? `<p class="paum-body">${richSafe(d.body)}</p>` : ''}
  </div>

  <!-- 중앙 이미지 + 스펙 오버레이 -->
  <div class="paum-stage">
    <!-- 스펙 수치 오버레이 (좌측) -->
    <div class="paum-spec">
      <span class="paum-spec-label">${esc(d.specLabel)}</span>
      <span class="paum-spec-value">${richSafe(d.specValue)}</span>
      <span class="paum-spec-div"></span>
      ${d.specUnit ? `<span class="paum-spec-unit">${esc(d.specUnit)}</span>` : ''}
    </div>

    <!-- 제품 이미지 (누끼 전용 — contain) -->
    <div class="paum-img-frame">
      ${media(d.image, '', '제품 이미지')}
    </div>
  </div>

  <!-- 하단 말풍선 배너 -->
  <div class="paum-balloon-bot">
    <div class="paum-balloon-bot-inner"></div>
  </div>

</section>`,
})
