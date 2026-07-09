/** STATS 아키타입: stats-decibel-overlay
 *  다크 배경 이미지 위 — check point 필 → 대형 타이틀 → 제품 이미지 공간 →
 *  반투명 검정 수평 데시벨 비교 바(3~5단계 도트+수치+라벨) 오버레이.
 *  소음·진동·온도·속도 등 "수치로 비교하는 제품 특장점" 섹션에 범용 적용.
 *  noimg-safe: 배경/제품 이미지 전부 없어도 다크 그라데이션 패널로 강등 렌더. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const stepSchema = z.object({
  value: z.string().min(1),          // 수치 표기 (예: "30dB", "25°C")
  label: z.string().min(1),          // 단계 라벨 (예: "도서관", "선풍기")
  highlight: z.boolean().optional(), // true → 이 단계를 accent 색으로 강조
})

const schema = z.object({
  badge: z.string().optional(),       // pill 텍스트 (기본 "check point")
  title: z.string().min(1),           // 대형 헤드라인 (em,br 허용)
  subtitle: z.string().optional(),    // 타이틀 아래 한 줄 (순수 텍스트)
  bgImage: z.string().optional(),     // 배경 이미지 (url)
  productImage: z.string().optional(),// 제품 이미지 (url)
  barLabel: z.string().optional(),    // 데시벨 바 상단 범례 텍스트 (예: "소음 레벨 비교")
  steps: z
    .array(stepSchema)
    .min(3)
    .max(5),
  highlightNote: z.string().optional(), // "브리프 근거 시만" — 강조 단계 아래 소주석
})
type Data = z.infer<typeof schema>

export const statsDecibelOverlay = defineBlock<Data>({
  id: 'stats-decibel-overlay',
  archetype: 'stats',
  styleTags: ['dark', 'photo', 'stats', 'overlay', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '다크 배경 이미지 위 수평 데시벨(수치) 비교 바 오버레이 섹션. check point 필 + 대형 타이틀 + 제품 이미지 공간 + 반투명 검정 5단계 수치 비교 바. 소음·온도·속도 등 수치 비교가 핵심 장점인 가전/전자제품 스탯 섹션에 적합.',
  schema,
  css: `
/* ── 루트 ── */
.swcs{
  position:relative;
  padding:0 0 56px;
  background:var(--brand, #111);
  color:#fff;
  overflow:hidden;
  min-height:480px;
}

/* 배경 이미지 */
.swcs-bg{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;
  object-position:center;
  border-radius:0;
  z-index:0;
}
/* 이미지 부재 시 그라데이션 강등 (noimg-safe) */
.swcs-bg.ph{display:none!important}
.swcs::before{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,.72) 100%);
  z-index:1;
}

/* ── 콘텐츠 레이어 ── */
.swcs-inner{
  position:relative;z-index:2;
  padding:48px var(--pad-x,56px) 0;
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
}

/* 다크 영역 .em 오버라이드 (Sprint 6 Directive 필수) */
.swcs .em{color:var(--em-dark,#FFF7EA)}

/* check point 필 */
.swcs-badge{
  display:inline-block;
  background:#000;
  color:#fff;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:18px;
  font-weight:500;
  letter-spacing:.05em;
  padding:10px 28px;
  border-radius:999px;
  margin-bottom:36px;
}

/* 대형 타이틀 */
.swcs-title{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:clamp(48px,7vw,76px);
  font-weight:600;
  line-height:1.12;
  color:#fff;
  white-space:pre-line;
  margin-bottom:16px;
}
.swcs-title .em{color:var(--em-dark,#FFF7EA)}

/* 서브타이틀 */
.swcs-sub{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:22px;
  font-weight:400;
  color:rgba(255,255,255,.80);
  margin-bottom:0;
}

/* 제품 이미지 공간 */
.swcs-product-wrap{
  width:100%;
  max-width:500px;
  margin:28px auto 0;
  aspect-ratio:500/410;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));
  overflow:hidden;
  background:rgba(217,217,217,.18);
}
.swcs-product{
  width:100%;height:100%;
  object-fit:contain;
  object-position:center;
  border-radius:inherit;
}
.swcs-product.ph{display:none!important}
/* 이미지 없으면 공간 자체를 숨겨 여백 붕괴 방지 */
.swcs-product-wrap:has(.ph){display:none}

/* ── 데시벨 비교 바 ── */
.swcs-bar-wrap{
  position:relative;z-index:2;
  margin:28px var(--pad-x,56px) 0;
}
.swcs-bar-label{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:14px;
  font-weight:500;
  color:rgba(255,255,255,.55);
  letter-spacing:.06em;
  text-align:left;
  margin-bottom:10px;
}
.swcs-bar{
  background:rgba(0,0,0,.50);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:20px 16px 18px;
}

/* 수평 기준선 */
.swcs-ruler{
  position:relative;
  display:flex;
  align-items:flex-start;
  gap:0;
}
.swcs-ruler::before{
  content:'';
  position:absolute;
  left:0;right:0;
  top:5px; /* 도트 중앙 정렬: 도트 높이 10px → 반값 5px */
  height:1px;
  background:rgba(255,255,255,.35);
}

/* 각 단계 셀 */
.swcs-step{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
  position:relative;
}

/* 도트 */
.swcs-dot{
  width:10px;height:10px;
  border-radius:50%;
  background:#fff;
  flex-shrink:0;
  position:relative;
  z-index:1;
  transition:transform .15s ease;
}
.swcs-step.hl .swcs-dot{
  background:var(--accent,#FFA500);
  box-shadow:0 0 0 3px rgba(255,255,255,.25);
  transform:scale(1.35);
}

/* 수치 */
.swcs-value{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:clamp(16px,3vw,26px);
  font-weight:700;
  color:rgba(255,255,255,.90);
  line-height:1.1;
  margin-top:10px;
  text-align:center;
}
.swcs-step.hl .swcs-value{
  color:#fff;
  font-size:clamp(18px,3.5vw,30px);
}

/* 라벨 */
.swcs-lbl{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:clamp(13px,2vw,20px);
  font-weight:400;
  color:rgba(255,255,255,.60);
  margin-top:5px;
  text-align:center;
}
.swcs-step.hl .swcs-lbl{
  color:rgba(255,255,255,.90);
  font-weight:600;
}

/* 강조 주석 */
.swcs-hl-note{
  margin-top:14px;
  text-align:center;
  font-size:13px;
  font-weight:500;
  color:var(--accent);
  letter-spacing:.03em;
}
`,
  render: (d, { esc, richSafe }) => {
    const badge = d.badge ?? 'check point'
    const steps = d.steps

    const stepsHtml = steps
      .map((s) => {
        const hlClass = s.highlight ? ' hl' : ''
        return `<div class="swcs-step${hlClass}">
        <span class="swcs-dot"></span>
        <span class="swcs-value">${esc(s.value)}</span>
        <span class="swcs-lbl">${esc(s.label)}</span>
      </div>`
      })
      .join('\n      ')

    return `<section class="swcs">
  ${media(d.bgImage, 'swcs-bg', '배경')}
  <div class="swcs-inner">
    <span class="swcs-badge">${esc(badge)}</span>
    <h2 class="swcs-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="swcs-sub">${esc(d.subtitle)}</p>` : ''}
    <div class="swcs-product-wrap">
      ${media(d.productImage, 'swcs-product', '제품 이미지')}
    </div>
  </div>
  <div class="swcs-bar-wrap">
    ${d.barLabel ? `<p class="swcs-bar-label">${esc(d.barLabel)}</p>` : ''}
    <div class="swcs-bar">
      <div class="swcs-ruler">
        ${stepsHtml}
      </div>
      ${d.highlightNote ? `<p class="swcs-hl-note">${esc(d.highlightNote)}</p>` : ''}
    </div>
  </div>
</section>`
  },
})
