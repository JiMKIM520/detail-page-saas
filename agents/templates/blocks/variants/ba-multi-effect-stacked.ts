/** COMPARE 아키타입: ba-multi-effect-stacked.
 *  [끝판왕] 추천·B&A #8 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트(--bg) 배경 대형 헤드라인 + accent 필 pill CTA
 *  → 라운드 카드(--paper) 내 [번호 효과 라벨 → 사용전(다크바)/사용후(accent바) 좌우 쌍 + 화살표] 수직 스택.
 *  2~4개 효과 반복, 커머스 사용 전후 전환 강조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 헤드라인 윗줄 — 문제 제기 (em, br 허용) */
  eyebrow: z.string().min(1),
  /** 대형 헤드라인 아랫줄 — 솔루션 선언 (em, br 허용) */
  title: z.string().min(1),
  /** accent pill CTA 문구 (선택) */
  cta: z.string().optional(),
  /** 사용 전 라벨 기본값 */
  beforeLabel: z.string().optional(),
  /** 사용 후 라벨 기본값 */
  afterLabel: z.string().optional(),
  /** 효과별 사용 전후 비교 유닛 (2~4개) */
  items: z
    .array(
      z.object({
        /** 효과 라벨 텍스트 — 예: "첫 번째 효과를 적어주세요" (em 허용) */
        effectLabel: z.string().min(1),
        /** 사용 전 이미지 URL */
        beforeImage: z.string().optional(),
        /** 사용 후 이미지 URL */
        afterImage: z.string().optional(),
        /** 사용 전 이미지 alt */
        beforeAlt: z.string().optional(),
        /** 사용 후 이미지 alt */
        afterAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const baMultiEffectStacked = defineBlock<Data>({
  id: 'ba-multi-effect-stacked',
  archetype: 'compare' as any,
  styleTags: ['light', 'comparison', 'before-after', 'stacked', 'template', 'commerce'],
  imageSlots: 6,
  describe:
    '번호별 효과 라벨 + 사용전(다크바)/사용후(accent바) 좌우 이미지 쌍 + 화살표 전환을 수직으로 반복하는 다중 B&A 블록. 라이트 배경 + 대형 헤드라인 + accent pill CTA + 라운드 카드 내 2~4개 효과 스택.',
  schema,
  css: `
/* ba-multi-effect-stacked — 접두사 bmes- */

/* 라이트 배경 블록: --bg, 본문 --ink, 보조 --muted */
.bmes{
  background:var(--bg);
  padding:52px 32px 60px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 헤드라인 영역 */
.bmes-hd{
  text-align:center;
  margin-bottom:36px;
}

.bmes-eyebrow{
  font-family:var(--font-body);
  font-size:clamp(16px,3.6vw,20px);
  font-weight:500;
  color:var(--ink);
  line-height:1.5;
  margin-bottom:6px;
}

.bmes-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,6.4vw,44px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:20px;
}
/* 라이트 배경 — .em은 --accent-d로 대비 확보 */
.bmes-title .em{color:var(--accent-d)}
.bmes-eyebrow .em{color:var(--accent-d)}

/* accent pill CTA */
.bmes-cta{
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(13px,2.8vw,16px);
  padding:10px 28px;
  border-radius:999px;
  letter-spacing:.01em;
  line-height:1;
}

/* 외부 카드 */
.bmes-card{
  background:var(--paper);
  border-radius:20px;
  padding:28px 20px 32px;
  display:flex;
  flex-direction:column;
  gap:40px;
}

/* 효과 유닛 */
.bmes-item{}

/* 효과 라벨 배지 */
.bmes-label-wrap{
  margin-bottom:14px;
}
.bmes-label{
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,2.6vw,15px);
  padding:6px 16px;
  border-radius:4px;
  letter-spacing:.01em;
  line-height:1.4;
}
.bmes-label .em{color:#fff;text-decoration:underline}

/* 사용 전후 이미지 행 */
.bmes-pair{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:0;
}

/* 사용 전/후 래퍼 */
.bmes-side{
  position:relative;
  overflow:hidden;
  border-radius:6px;
}

/* 이미지 */
.bmes-img{
  width:100%;
  aspect-ratio:3/4;
  object-fit:cover;
  display:block;
}
.bmes-img.ph{
  width:100%;
  aspect-ratio:3/4;
  border:2px dashed var(--line);
  background:rgba(0,0,0,.05);
  color:var(--muted);
  font-size:12px;
}

/* 하단 라벨 바 */
.bmes-bar{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  text-align:center;
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(12px,2.4vw,14px);
  letter-spacing:.04em;
  padding:9px 4px;
  line-height:1;
}
/* 사용 전: 다크(--ink) 바 */
.bmes-bar-before{
  background:var(--ink);
  color:#fff;
}
/* 사용 후: accent 바 */
.bmes-bar-after{
  background:var(--accent);
  color:#fff;
}

/* 화살표 전환 아이콘 */
.bmes-arrow{
  display:flex;
  align-items:center;
  justify-content:center;
  width:36px;
  flex-shrink:0;
  color:var(--accent);
}
.bmes-arrow svg{
  width:28px;
  height:28px;
  fill:var(--accent);
}

/* 유닛 간 구분선 */
.bmes-item + .bmes-item{
  padding-top:0;
}
.bmes-divider{
  border:none;
  border-top:1px solid var(--line);
  margin:0 0 40px;
}
`,
  render: (d, { esc, richSafe }) => {
    const bLabel = esc(d.beforeLabel ?? '사용 전')
    const aLabel = esc(d.afterLabel ?? '사용 후')

    // play/arrow SVG (inline — not in shared ICONS; right-pointing filled triangle)
    const arrowSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5l11 7-11 7V5z"/></svg>`

    const itemsHtml = d.items
      .map(
        (it, i) => `
    ${i > 0 ? '<hr class="bmes-divider">' : ''}
    <div class="bmes-item">
      <div class="bmes-label-wrap">
        <span class="bmes-label">${richSafe(it.effectLabel)}</span>
      </div>
      <div class="bmes-pair">
        <div class="bmes-side">
          ${media(it.beforeImage, 'bmes-img', esc(it.beforeAlt ?? '사용 전'))}
          <div class="bmes-bar bmes-bar-before">${bLabel}</div>
        </div>
        <div class="bmes-arrow">${arrowSvg}</div>
        <div class="bmes-side">
          ${media(it.afterImage, 'bmes-img', esc(it.afterAlt ?? '사용 후'))}
          <div class="bmes-bar bmes-bar-after">${aLabel}</div>
        </div>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="bmes">
  <div class="bmes-hd">
    <p class="bmes-eyebrow">${richSafe(d.eyebrow)}</p>
    <h2 class="bmes-title">${richSafe(d.title)}</h2>
    ${d.cta ? `<span class="bmes-cta">${esc(d.cta)}</span>` : ''}
  </div>
  <div class="bmes-card">
    ${itemsHtml}
  </div>
</section>`
  },
})
