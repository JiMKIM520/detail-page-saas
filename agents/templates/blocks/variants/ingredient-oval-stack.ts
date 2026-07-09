/** INGREDIENT 아키타입: ingredient-oval-stack
 *  228_성분소개_10 패턴 재구성.
 *  타이틀 영역(강조 텍스트박스) + 반투명 타원 2~5개 수직 오버랩 적층(opacity 단계별)
 *  + 하단 전체폭 이미지(noimg-safe 강등). 성분 레이어를 쌓아 올리는 시각 장치.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 타이틀 앞 라인 (em/br 허용). 예: "두피 환경을 되살리는" */
  titlePre: z.string().min(1),
  /** 강조 텍스트박스 안에 들어가는 키워드. 예: "3중 두피 케어" */
  titleKey: z.string().min(1),
  /** 타이틀 아래 설명 한 줄 (순수 텍스트). 예: "탈모 증상 완화에 도움을 주는 주요 성분 3가지" */
  subtitle: z.string().optional(),
  /** 성분 목록 (2~5개). 타원 하나당 하나씩 아래로 쌓임. */
  items: z
    .array(
      z.object({
        /** 성분명 (em 허용). 예: "비오틴" */
        name: z.string().min(1),
        /** 성분 효능 설명 (em 허용). 예: "모발 강화 및 탄력 증진" */
        benefit: z.string().min(1),
      }),
    )
    .min(2)
    .max(5),
  /** 하단 전체폭 이미지 (url). 없으면 이미지 영역 숨김(noimg-safe). */
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 아이템 수 → 타원 불투명도 단계 (첫 번째가 가장 연하게, 마지막이 가장 진하게) */
function ellipseOpacity(index: number, total: number): number {
  if (total <= 1) return 0.8
  // 0.4 ~ 0.8 구간을 아이템 수에 따라 균등 분할
  const min = 0.35
  const max = 0.85
  return parseFloat((min + ((max - min) * index) / (total - 1)).toFixed(2))
}

export const ingredientOvalStack = defineBlock<Data>({
  id: 'ingredient-oval-stack',
  archetype: 'ingredient',
  // noimg-safe: 하단 이미지가 없으면 이미지 래퍼를 완전히 생략하고 패딩만 유지
  styleTags: ['mixed', 'gradient', 'ingredient', 'layered', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분 소개 블록. 그라디언트 배경 + 상단 타이틀(컬러 텍스트박스 강조 키워드) + 반투명 타원 2~5개 수직 오버랩 적층(opacity 단계별로 깊이감) + 하단 전체폭 이미지(이미지 없으면 안전 강등). 뷰티/건강 성분 신뢰 레이어 시각화에 적합.',
  schema,
  css: `
.ibom{
  position:relative;
  background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 18%,var(--bg)) 0%,var(--bg) 55%);
  padding:72px var(--pad-x,56px) 0;
  text-align:center;
  overflow:hidden
}
/* ── 타이틀 영역 ── */
.ibom-hd{margin-bottom:44px}
.ibom-pre{
  display:block;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(28px,4.2vw,42px);
  color:var(--ink);
  line-height:1.2;
  margin-bottom:10px
}
.ibom-kw{
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,5vw,52px);
  line-height:1.15;
  padding:6px 28px calc(6px + 4px);
  border-radius:calc(var(--r-scale,1)*8px);
  letter-spacing:-.01em;
  margin-top:4px
}
.ibom-sub{
  margin-top:18px;
  font-size:clamp(14px,1.8vw,18px);
  font-weight:400;
  color:var(--ink-2);
  line-height:1.6
}
/* ── 타원 적층 영역 ── */
.ibom-ovals{
  position:relative;
  /* 타원이 서로 겹치도록 래퍼에 패딩 없음, 마진으로 제어 */
  margin:0 auto;
  max-width:720px
}
.ibom-oval-wrap{
  position:relative
  /* 음수 margin-top은 인라인 style로 주입(아이템 수 의존) */
}
.ibom-oval{
  width:100%;
  /* 원본 비율 760×300 ≈ 2.53:1 → padding-top으로 유지. 최소 높이로 텍스트 잘림 방지 */
  padding-top:39.5%;
  min-height:96px;
  border-radius:50%;
  position:relative;
  /* opacity, background는 인라인 style로 주입 */
}
.ibom-oval-inner{
  position:absolute;
  inset:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:12px 18%;
  box-sizing:border-box
}
.ibom-name{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(18px,2.6vw,26px);
  color:var(--ink);
  line-height:1.2
}
.ibom-name .em{color:var(--accent-d);font-weight:800}
.ibom-benefit{
  font-size:clamp(13px,1.7vw,17px);
  font-weight:400;
  color:var(--ink-2);
  line-height:1.5
}
.ibom-benefit .em{color:var(--accent-d);font-weight:700}
/* ── 하단 이미지 (noimg-safe: .ibom-img-wrap이 없으면 섹션 하단 패딩으로 처리) ── */
.ibom-img-wrap{
  margin-top:48px;
  margin-left:calc(-1 * var(--pad-x,56px));
  margin-right:calc(-1 * var(--pad-x,56px));
  line-height:0
}
.ibom-photo{
  width:100%;
  aspect-ratio:860/550;
  object-fit:cover;
  border-radius:0;
  display:block
}
/* 이미지 없을 때 섹션 하단 여백 확보 */
.ibom-noimg-pad{padding-bottom:72px}
`,
  render: (d, { esc, richSafe }) => {
    const total = d.items.length
    // 첫 번째 타원 이후 겹침 오프셋 — 타원 높이의 약 45%를 겹침
    // 타원 padding-top=39.5% → 720px 기준 ≈ 284px 높이 → 겹침 ≈ 128px
    const overlapPct = 45 // 타원 전체 높이 대비 겹침 %
    const hasImage = typeof d.image === 'string' && d.image.length > 0

    const ovalsHtml = d.items
      .map((item, i) => {
        const opacity = ellipseOpacity(i, total)
        // 두 번째 타원부터 음수 margin-top으로 이전 타원과 겹침
        const overlapStyle =
          i > 0
            ? ` style="margin-top:calc(-${overlapPct}% * 0.395)"` // 래퍼 폭 기준 padding-top 역산
            : ''
        return `
    <div class="ibom-oval-wrap"${overlapStyle}>
      <div class="ibom-oval" style="background:color-mix(in srgb,var(--accent) ${Math.round(opacity * 100)}%,transparent);opacity:1">
        <div class="ibom-oval-inner">
          <span class="ibom-name">${richSafe(item.name)}</span>
          <span class="ibom-benefit">${richSafe(item.benefit)}</span>
        </div>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="ibom">
  <div class="ibom-hd">
    <span class="ibom-pre">${richSafe(d.titlePre)}</span>
    <span class="ibom-kw">${esc(d.titleKey)}</span>
    ${d.subtitle ? `<p class="ibom-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ibom-ovals">
    ${ovalsHtml}
  </div>
  ${
    hasImage
      ? `<div class="ibom-img-wrap">
    ${media(d.image, 'ibom-photo', '성분 대표 이미지')}
  </div>`
      : '<div class="ibom-noimg-pad"></div>'
  }
</section>`
  },
})
