/** SPEC 아키타입: spec-height-gauge
 *  피그마 295_제품특징_30 흡수 — 그라데이션 배경 + 번호 pill + 타이틀/설명 + 높낮이 화살표 연출 제품 이미지
 *  + 하단 4칸 검정 바 수치 비교표. 조절·확장 가능한 높이 사양을 직관적으로 시각화하는 스펙 블록. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 순번 레이블 (기본 "01"). 브리프에 순번이 명시될 때만 채움. */
  step: z.string().optional(),
  /** 블록 헤드라인 — em/br 허용 */
  title: z.string().min(1),
  /** 헤드라인 아래 보조 설명 (순수 텍스트) */
  desc: z.string().optional(),
  /** 제품 이미지 (url). 없으면 텍스트+수치 표만 표시되는 noimg-safe 강등 렌더. */
  image: z.string().optional(),
  /** 높이 단계 수치. 2~6개. label = 표시 단위(예: "30cm"), sub = 짧은 설명(예: "탁상형", optional) */
  measures: z
    .array(
      z.object({
        label: z.string().min(1),
        sub: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const specHeightGauge = defineBlock<Data>({
  id: 'spec-height-gauge',
  archetype: 'spec',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '높낮이 조절 제품 스펙 시각화. 라이트 그라데이션 배경 + 번호 pill + 중앙 정렬 타이틀/설명 + 높이 단계 화살표 연출 제품 사진 + 하단 검정 바 4칸(최대 6칸) 수치 비교표. 조절 범위가 핵심인 가구·가전·운동기구에 적합.',
  schema,
  css: `
/* ── spec-height-gauge (suoo) ── */
.suoo{
  position:relative;
  padding:60px var(--pad-x,56px) 64px;
  background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 8%,var(--bg)) 0%,var(--bg) 60%,color-mix(in srgb,var(--accent) 5%,var(--paper)) 100%);
  text-align:center;
  overflow:hidden
}

/* 번호 pill */
.suoo-pill{
  display:inline-flex;align-items:center;justify-content:center;
  width:72px;height:40px;
  background:var(--ink);color:#fff;
  font-family:var(--font-display);font-weight:600;font-size:20px;letter-spacing:.04em;
  border-radius:999px;
  margin-bottom:28px
}

/* 구분 여백 선 */
.suoo-div{
  width:120px;height:2px;
  background:color-mix(in srgb,var(--ink) 14%,transparent);
  border-radius:999px;
  margin:0 auto 32px
}

/* 타이틀 영역 */
.suoo-title{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(36px,5.5vw,62px);
  line-height:1.18;letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:16px
}
.suoo-title .em{color:var(--accent-d)}

.suoo-desc{
  font-size:17px;font-weight:400;line-height:1.72;
  color:var(--ink-2);
  max-width:560px;margin:0 auto 40px
}

/* 이미지 + 화살표 영역 */
.suoo-vis{
  position:relative;
  width:100%;max-width:680px;
  margin:0 auto 36px;
}

/* 제품 사진 */
.suoo-img{
  width:100%;
  aspect-ratio:4/3;
  object-fit:contain;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));
  display:block
}

/* noimg-safe: 이미지 없을 때 .ph는 전역 display:none!important — 비주얼 영역 자체를 숨겨 붕괴 방지 */
.suoo-vis:has(.ph){display:none}

/* 높이 단계 화살표 열 — 이미지 우측 바깥에 세로로 배치 */
.suoo-arrows{
  position:absolute;
  right:-72px;top:10%;
  display:flex;flex-direction:column;
  align-items:flex-start;
  gap:0;
  height:78%;
  justify-content:space-between;
  pointer-events:none
}
.suoo-arrow{
  display:flex;flex-direction:row;align-items:center;gap:4px;
  opacity:.75
}
.suoo-arrow svg{
  width:22px;height:30px;
  fill:none;stroke:var(--accent-d);stroke-width:2.2;
  stroke-linecap:round;stroke-linejoin:round;
  flex-shrink:0
}
.suoo-arrow-label{
  font-family:var(--font-display);font-weight:600;
  font-size:12px;letter-spacing:.02em;
  color:var(--accent-d);
  white-space:nowrap
}
/* 각 화살표를 계단식으로 좌측 오프셋 — 원본의 높낮이 위치 표현 */
.suoo-arrow:nth-child(1){transform:translateX(0px)}
.suoo-arrow:nth-child(2){transform:translateX(-8px)}
.suoo-arrow:nth-child(3){transform:translateX(-16px)}
.suoo-arrow:nth-child(4){transform:translateX(-24px)}
.suoo-arrow:nth-child(5){transform:translateX(-32px)}
.suoo-arrow:nth-child(6){transform:translateX(-40px)}

/* 수치 비교 바 */
.suoo-bar{
  display:flex;
  width:100%;max-width:680px;
  margin:0 auto;
  background:var(--ink);
  border-radius:calc(var(--r-scale,1)*14px);
  overflow:hidden
}
.suoo-cell{
  flex:1;
  padding:14px 8px;
  text-align:center;
  border-right:1px solid color-mix(in srgb,#fff 15%,transparent);
  transition:background .18s
}
.suoo-cell:last-child{border-right:none}
.suoo-cell-label{
  font-family:var(--font-display);font-weight:600;
  font-size:clamp(14px,2.2vw,22px);
  color:#fff;
  letter-spacing:.01em;
  line-height:1.1
}
.suoo-cell-sub{
  margin-top:4px;
  font-size:11px;font-weight:400;
  color:color-mix(in srgb,#fff 60%,transparent);
  letter-spacing:.04em
}
`,
  render: (d, { esc, richSafe }) => {
    // 화살표 SVG (다운 포인팅 셰브론)
    const arrowSvg = `<svg viewBox="0 0 22 30" aria-hidden="true"><polyline points="4,8 11,20 18,8"/></svg>`

    // 화살표 수 = measures 수 (최대 4개까지만 표시해 과밀 방지)
    const arrowCount = Math.min(d.measures.length, 4)
    const arrows = d.measures.slice(0, arrowCount).map((m, i) =>
      `<span class="suoo-arrow" style="opacity:${0.35 + i * 0.18}">${arrowSvg}<span class="suoo-arrow-label">${esc(m.label)}</span></span>`,
    ).join('\n      ')

    const cells = d.measures
      .map(
        (m) =>
          `<div class="suoo-cell">` +
          `<div class="suoo-cell-label">${esc(m.label)}</div>` +
          (m.sub ? `<div class="suoo-cell-sub">${esc(m.sub)}</div>` : '') +
          `</div>`,
      )
      .join('\n      ')

    return `
<section class="suoo">
  ${d.step ? `<div class="suoo-pill">${esc(d.step)}</div>` : ''}
  <div class="suoo-div"></div>
  <h2 class="suoo-title">${richSafe(d.title)}</h2>
  ${d.desc ? `<p class="suoo-desc">${esc(d.desc)}</p>` : ''}
  <div class="suoo-vis">
    ${media(d.image, 'suoo-img', '제품 높이 조절 이미지')}
    <div class="suoo-arrows" aria-hidden="true">
      ${arrows}
    </div>
  </div>
  <div class="suoo-bar">
    ${cells}
  </div>
</section>`
  },
})
