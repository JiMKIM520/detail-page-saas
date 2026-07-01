/** COMPARE 아키타입: compare-competitor-photo.
 *  피그마 "[끝판왕] 추천·B&A" 프레임 #9 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 대형 헤드라인 + 서브 → 2열 이미지 비교(타사 회색 캡션바 / 자사 accent 캡션바)
 *  + 하단 설명 텍스트. 이미지 하단 인셋 컬러 캡션바로 승자/패자를 시각 코딩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 헤드라인 아래 서브 설명 (선택) */
  subtitle: z.string().optional(),
  /** 타사(패자) 컬럼 라벨 */
  competitorLabel: z.string().min(1).optional(), // 기본 "타사 제품"
  /** 자사(승자) 컬럼 라벨 */
  ownLabel: z.string().min(1).optional(), // 기본 "자사 제품"
  /** 타사 이미지 URL */
  competitorImage: z.string().optional(),
  /** 자사 이미지 URL */
  ownImage: z.string().optional(),
  /** 타사 캡션바 텍스트 (em, br 허용) */
  competitorCaption: z.string().min(1),
  /** 자사 캡션바 텍스트 (em, br 허용) */
  ownCaption: z.string().min(1),
  /** 하단 설명 줄 (1~3줄, 각 em 허용) */
  footerLines: z.array(z.string().min(1)).min(1).max(3).optional(),
})
type Data = z.infer<typeof schema>

export const compareCompetitorPhoto = defineBlock<Data>({
  id: 'compare-competitor-photo',
  archetype: 'compare' as any,
  styleTags: ['light', 'comparison', 'photo', 'competitor', 'template'],
  imageSlots: 2,
  describe:
    '타사/자사 2열 사진 비교. 대형 헤드라인 + 서브 → 이미지 하단 인셋 캡션바(타사=회색·중립, 자사=accent·승자)로 컬러코딩. 하단 설명 텍스트 선택적 추가. 사용 효과·결과 비교에 최적.',
  schema,
  css: `
/* compare-competitor-photo — 접두사 ccp- */

/* 라이트 배경 블록 */
.ccp{
  background:var(--bg);
  padding:56px 32px 52px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 헤드라인 */
.ccp-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,7.2vw,52px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:var(--ink);
  text-align:center;
  margin-bottom:12px;
}
/* 라이트 배경 — .em은 --accent-d로 충분한 대비 확보 */
.ccp-title .em{color:var(--accent-d)}

/* 서브 설명 */
.ccp-sub{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.7;
  color:var(--muted);
  text-align:center;
  margin-bottom:32px;
}
.ccp-sub .em{color:var(--accent-d);font-weight:700}

/* 2열 비교 그리드 */
.ccp-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:0;
}

/* 개별 카드 — 이미지 + 하단 인셋 캡션바 */
.ccp-col{
  position:relative;
  overflow:hidden;
}

/* 패자(타사): 중립 회색 테두리 */
.ccp-col.rival{
  border:1.5px solid #CACACE;
}

/* 승자(자사): accent 테두리 */
.ccp-col.own{
  border:2px solid var(--accent);
}

/* 이미지 */
.ccp-img{
  width:100%;
  aspect-ratio:3/4;
  object-fit:cover;
  display:block;
}
.ccp-img.ph{
  width:100%;
  aspect-ratio:3/4;
  background:rgba(0,0,0,.04);
  border:none;
  color:var(--muted);
}

/* 하단 인셋 캡션바 */
.ccp-cap{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px 12px;
  text-align:center;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(13px,2.8vw,16px);
  line-height:1.5;
  letter-spacing:-.01em;
}

/* 타사 캡션바: 중립 회색 */
.ccp-cap.rival{
  background:#9A9AA3;
  color:#fff;
}
.ccp-cap.rival .em{color:#fff;opacity:.85}

/* 자사 캡션바: accent(브랜드 강조) */
.ccp-cap.own{
  background:var(--accent);
  color:#fff;
}
.ccp-cap.own .em{color:#fff;font-weight:800}

/* 하단 설명 텍스트 */
.ccp-footer{
  margin-top:24px;
  text-align:center;
}
.ccp-footer-line{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.8;
  color:var(--muted);
  letter-spacing:-.005em;
}
.ccp-footer-line .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const rivalLabel = esc(d.competitorLabel ?? '타사 제품')
    const ownLabel = esc(d.ownLabel ?? '자사 제품')

    const footerHtml = d.footerLines
      ? d.footerLines
          .map((line) => `<p class="ccp-footer-line">${richSafe(line)}</p>`)
          .join('')
      : ''

    return `
<section class="ccp">
  <h2 class="ccp-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="ccp-sub">${richSafe(d.subtitle)}</p>` : ''}
  <div class="ccp-grid">
    <div class="ccp-col rival" role="group" aria-label="${rivalLabel}">
      ${media(d.competitorImage, 'ccp-img', rivalLabel)}
      <div class="ccp-cap rival">${richSafe(d.competitorCaption)}</div>
    </div>
    <div class="ccp-col own" role="group" aria-label="${ownLabel}">
      ${media(d.ownImage, 'ccp-img', ownLabel)}
      <div class="ccp-cap own">${richSafe(d.ownCaption)}</div>
    </div>
  </div>
  ${footerHtml ? `<div class="ccp-footer">${footerHtml}</div>` : ''}
</section>`
  },
})
