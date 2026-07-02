/** COMPARE 아키타입: compare-overlap-cards.
 *  [끝판왕] 추천·B&A #7 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 배경 + 대형 헤드라인 + 3줄 부연 설명
 *  → z-index 오버랩 2카드(타사 중립회색 뒤/자사 다크네이비 앞)
 *  각 카드: 라벨 + 제품 이미지 + 4행(X/체크 아이콘+텍스트) 비교 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 타이틀 하단 3줄 부연 설명 (각 1줄) */
  subtitles: z.array(z.string().min(1)).min(1).max(3),
  /** 타사(패자) 카드 라벨 — 예: "타사 제품" */
  competitorLabel: z.string().min(1).optional(),
  /** 타사 제품 이미지 URL */
  competitorImage: z.string().optional(),
  /** 타사 비교 행 — X 아이콘 (2~4개) */
  competitorItems: z.array(z.string().min(1)).min(2).max(4),
  /** 자사(승자) 카드 라벨 — 예: "자사 제품" */
  ownLabel: z.string().min(1).optional(),
  /** 자사 제품 이미지 URL */
  ownImage: z.string().optional(),
  /** 자사 비교 행 — 체크 아이콘 (em 허용, competitorItems와 같은 수) */
  ownItems: z.array(z.string().min(1)).min(2).max(4),
})
type Data = z.infer<typeof schema>

export const compareOverlapCards = defineBlock<Data>({
  id: 'compare-overlap-cards',
  archetype: 'compare',
  styleTags: ['light', 'comparison', 'overlap', 'competitive', 'template'],
  imageSlots: 2,
  describe:
    '경쟁사 비교(오버랩 카드). 라이트 배경 + 대형 헤드라인 + 3줄 부연 → 타사(중립회색, 뒤) / 자사(다크네이비, 앞) z-index 오버랩 2카드. 각 카드: 라벨 + 제품 이미지 + X/체크 아이콘 행 비교(2~4행). 자사 카드가 타사 카드 위에 겹쳐 승리감 연출.',
  schema,
  css: `
/* compare-overlap-cards — 접두사 coc- */

/* 라이트 배경 블록 */
.coc{
  background:var(--bg);
  padding:56px 32px 64px;
  word-break:keep-all;
  overflow-wrap:break-word;
  overflow:hidden;
}

/* 헤드라인 */
.coc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,7.2vw,48px);
  line-height:1.2;
  letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:16px;
}
/* 라이트 배경 — .em은 accent-d(어두운 포인트, 충분한 대비) */
.coc-title .em{color:var(--accent-d)}

/* 3줄 부연 설명 */
.coc-subs{
  margin-bottom:40px;
}
.coc-sub{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.75;
  color:var(--muted);
  letter-spacing:-.005em;
}
.coc-sub .em{color:var(--accent-d);font-weight:700}

/* 카드 스택 컨테이너 — 상대 위치로 오버랩 연출 */
.coc-stack{
  position:relative;
  /* 타사 카드 너비 + 오버랩 여백 확보 */
  min-height:440px;
  margin:0 -4px;
}

/* 공통 카드 */
.coc-card{
  position:absolute;
  width:58%;
  border-radius:20px;
  overflow:hidden;
  display:flex;
  flex-direction:column;
}

/* 타사(패자) 카드 — 중립 회색, 뒤 */
.coc-card-comp{
  top:28px;
  left:0;
  z-index:1;
  background:#B0B8C4;
  box-shadow:0 8px 24px -8px rgba(0,0,0,.18);
}

/* 자사(승자) 카드 — 다크 네이비, 앞 */
.coc-card-own{
  top:0;
  right:0;
  z-index:2;
  background:#2B3A52;
  box-shadow:0 16px 40px -12px rgba(0,0,0,.45);
}

/* 카드 라벨 헤더 */
.coc-label{
  text-align:center;
  font-family:var(--font-display);
  font-weight:700;
  font-size:16px;
  letter-spacing:.02em;
  padding:16px 12px 12px;
}
.coc-card-comp .coc-label{
  color:rgba(255,255,255,.80);
}
.coc-card-own .coc-label{
  color:#fff;
  font-weight:800;
  font-size:18px;
}

/* 제품 이미지 */
.coc-img{
  width:calc(100% - 24px);
  margin:0 12px;
  aspect-ratio:4/3;
  object-fit:cover;
  border-radius:10px;
  display:block;
}
.coc-img.ph{
  width:calc(100% - 24px);
  margin:0 12px;
  aspect-ratio:4/3;
  border-radius:10px;
}
/* 타사 placeholder */
.coc-card-comp .coc-img.ph{
  background:rgba(255,255,255,.18);
  border:2px dashed rgba(255,255,255,.35);
  color:rgba(255,255,255,.5);
}
/* 자사 placeholder */
.coc-card-own .coc-img.ph{
  background:rgba(255,255,255,.10);
  border:2px dashed rgba(255,255,255,.25);
  color:rgba(255,255,255,.45);
}

/* 구분선 */
.coc-divider{
  border:none;
  border-top:1px solid rgba(255,255,255,.15);
  margin:14px 12px 0;
}

/* 비교 행 리스트 */
.coc-rows{
  padding:4px 12px 16px;
  display:flex;
  flex-direction:column;
}

/* 단일 비교 행 */
.coc-row{
  display:flex;
  align-items:center;
  gap:8px;
  padding:12px 0;
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.5;
  letter-spacing:-.01em;
}
.coc-row + .coc-row{
  border-top:1px solid rgba(255,255,255,.10);
}

/* 아이콘 배지 */
.coc-icon{
  flex-shrink:0;
  width:22px;
  height:22px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
}
.coc-icon svg{
  width:13px;
  height:13px;
}

/* 타사 행 — X 아이콘, 중립 */
.coc-row-comp .coc-icon{
  background:rgba(255,255,255,.22);
  color:rgba(255,255,255,.70);
}
.coc-row-comp .coc-row-text{
  color:rgba(255,255,255,.65);
}

/* 자사 행 — 체크 아이콘, accent(밝은 포인트, 다크 배경 대비 확보) */
.coc-row-own .coc-icon{
  background:var(--accent);
  color:#fff;
}
.coc-row-own .coc-row-text{
  color:#fff;
  font-weight:700;
}
.coc-row-own .coc-row-text .em{color:var(--accent)}
`,

  render: (d, { esc, richSafe, icon }) => {
    const compLabel = esc(d.competitorLabel ?? '타사 제품')
    const ownLabel = esc(d.ownLabel ?? '자사 제품')

    // X 아이콘 인라인 SVG (ICONS에 없으므로 인라인)
    const xIconSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    const checkIconSvg = icon('check')

    const subtitlesHtml = d.subtitles
      .map((s) => `<p class="coc-sub">${richSafe(s)}</p>`)
      .join('')

    const compRows = d.competitorItems
      .map(
        (text) => `
      <div class="coc-row coc-row-comp">
        <span class="coc-icon">${xIconSvg}</span>
        <span class="coc-row-text">${esc(text)}</span>
      </div>`,
      )
      .join('')

    const ownRows = d.ownItems
      .map(
        (text) => `
      <div class="coc-row coc-row-own">
        <span class="coc-icon">${checkIconSvg}</span>
        <span class="coc-row-text">${richSafe(text)}</span>
      </div>`,
      )
      .join('')

    return `
<section class="coc">
  <h2 class="coc-title">${richSafe(d.title)}</h2>
  <div class="coc-subs">${subtitlesHtml}</div>

  <div class="coc-stack">
    <!-- 타사(패자): 중립 회색, z-index 낮음 -->
    <div class="coc-card coc-card-comp">
      <div class="coc-label">${compLabel}</div>
      ${media(d.competitorImage, 'coc-img', '타사 제품 이미지')}
      <hr class="coc-divider">
      <div class="coc-rows">${compRows}</div>
    </div>

    <!-- 자사(승자): 다크 네이비, z-index 높음, 앞으로 겹침 -->
    <div class="coc-card coc-card-own">
      <div class="coc-label">${ownLabel}</div>
      ${media(d.ownImage, 'coc-img', '자사 제품 이미지')}
      <hr class="coc-divider">
      <div class="coc-rows">${ownRows}</div>
    </div>
  </div>
</section>`
  },
})
