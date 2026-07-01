/** FEATURE 아키타입: credentials-stat-bento.
 *  [끝판왕] 추천·B&A #14 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 헤더(대형 헤드라인 + 서브카피) +
 *  다크 타일 벤토 그리드(전폭 ↔ 반폭 교차) — 각 타일에 대형 KPI 숫자 + eyebrow 라벨 + 3D 이모지/이미지.
 *  레이아웃 순서: 전폭→반폭2개→전폭(이미지좌/텍스트우 역전). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 단일 stat 타일 */
const tileSchema = z.object({
  /** eyebrow 라벨 (예: "누적 신청자 수") */
  label: z.string().min(1),
  /** 대형 KPI 숫자·텍스트 (예: "1,500만", "1위", "3.4억 회") */
  kpi: z.string().min(1),
  /** 3D 이모지·이미지 URL (선택 — 없으면 placeholder) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /**
   * 타일 너비:
   *  'full'  → 전폭 (좌:텍스트 / 우:이미지)
   *  'full-rev' → 전폭 역전 (좌:이미지 / 우:텍스트)
   *  'half'  → 반폭 (상:텍스트 / 하:이미지)
   */
  span: z.enum(['full', 'full-rev', 'half']),
})

const schema = z.object({
  /** 대형 헤드라인 (em 허용) */
  title: z.string().min(1),
  /** 서브카피 (선택, em 허용) */
  subtitle: z.string().optional(),
  /** stat 타일 배열 (2~6개).
   *  full/full-rev 타일은 단독 행, half 타일은 2개씩 나란히. */
  tiles: z.array(tileSchema).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const credentialsStatBento = defineBlock<Data>({
  id: 'credentials-stat-bento',
  archetype: 'feature' as any,
  styleTags: ['dark', 'bento', 'stats', 'kpi', 'credential', 'template'],
  imageSlots: 4,
  describe:
    '실적·신뢰 지표(벤토 KPI). 라이트 헤더(대형 헤드라인+서브카피) + 다크 타일 벤토 그리드. 전폭 타일(좌텍스트/우이미지 또는 역전)과 반폭 타일(2개 나란히)을 교차 배치. 각 타일에 eyebrow 라벨 + 대형 KPI 숫자 + 3D 이모지/이미지. 누적 수치·순위·수상 실적 등 사회적 증거 강조.',
  schema,
  css: `
/* credentials-stat-bento — 접두사 csb- */

/* ── 라이트 헤더 ── */
.csb{background:var(--paper);color:var(--ink);padding:0 0 28px;word-break:keep-all;overflow-wrap:break-word}
.csb-header{padding:56px 40px 44px;text-align:center}
.csb-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,6vw,42px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:14px;
}
/* 라이트 배경 — .em은 --accent-d로 충분한 대비 확보 */
.csb-title .em{color:var(--accent-d)}
.csb-sub{
  font-family:var(--font-body);
  font-size:clamp(13px,2.8vw,16px);
  line-height:1.75;
  color:var(--muted);
  letter-spacing:-.005em;
}
.csb-sub .em{color:var(--accent-d);font-weight:700}

/* ── 벤토 그리드 컨테이너 ── */
.csb-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  padding:0 16px;
}

/* ── 공통 타일 ── */
.csb-tile{
  background:#1a1a1f;
  border-radius:18px;
  overflow:hidden;
  position:relative;
}
/* 전폭 타일 — 2열 스팬 */
.csb-tile.full,.csb-tile.full-rev{grid-column:span 2}
/* 반폭 타일 — 자연스럽게 1열 */
.csb-tile.half{grid-column:span 1}

/* ── 전폭 타일 내부 레이아웃 (좌:텍스트 / 우:이미지) ── */
.csb-full-inner{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  min-height:180px;
  padding:28px 28px 32px;
  gap:12px;
}
.csb-full-inner.rev{flex-direction:row-reverse}

/* ── 전폭 텍스트 영역 ── */
.csb-txt{flex:1;min-width:0}
.csb-label{
  font-family:var(--font-body);
  font-size:clamp(12px,2.4vw,15px);
  font-weight:500;
  color:rgba(255,255,255,.56);
  letter-spacing:.01em;
  margin-bottom:12px;
  line-height:1.4;
}
.csb-kpi{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(38px,9vw,68px);
  line-height:1.05;
  letter-spacing:-.035em;
  /* 다크 배경 — .em 및 KPI 자체를 밝은 accent로 override */
  color:#fff;
}
/* 다크 타일 내 강조 — 밝은 accent 사용 */
.csb-tile .csb-kpi.accent{color:var(--accent)}

/* ── 전폭 이미지 영역 ── */
.csb-emoji{
  flex:0 0 auto;
  width:clamp(90px,18vw,140px);
  height:clamp(90px,18vw,140px);
  object-fit:contain;
  display:block;
}
.csb-emoji.ph{
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(255,255,255,.06);
  border:2px dashed rgba(255,255,255,.2);
  border-radius:12px;
  color:rgba(255,255,255,.3);
  font-size:13px;
}

/* ── 반폭 타일 내부 레이아웃 (상:텍스트 / 하:이미지) ── */
.csb-half-inner{
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  min-height:180px;
  padding:24px 22px 20px;
}
.csb-half-foot{
  display:flex;
  justify-content:flex-end;
  margin-top:10px;
}
.csb-emoji-sm{
  width:clamp(60px,13vw,96px);
  height:clamp(60px,13vw,96px);
  object-fit:contain;
  display:block;
}
.csb-emoji-sm.ph{
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(255,255,255,.06);
  border:2px dashed rgba(255,255,255,.2);
  border-radius:10px;
  color:rgba(255,255,255,.3);
  font-size:12px;
}
`,
  render: (d, { esc, richSafe }) => {
    const tilesHtml = d.tiles
      .map((tile) => {
        const labelHtml = `<p class="csb-label">${esc(tile.label)}</p>`
        const kpiHtml = `<p class="csb-kpi">${esc(tile.kpi)}</p>`

        if (tile.span === 'full' || tile.span === 'full-rev') {
          const isRev = tile.span === 'full-rev'
          const emojiHtml = media(
            tile.image,
            'csb-emoji',
            esc(tile.imageAlt ?? tile.label),
          )
          return `
<div class="csb-tile ${isRev ? 'full-rev' : 'full'}">
  <div class="csb-full-inner${isRev ? ' rev' : ''}">
    <div class="csb-txt">
      ${labelHtml}
      ${kpiHtml}
    </div>
    ${emojiHtml}
  </div>
</div>`
        }

        // half
        const emojiSmHtml = media(
          tile.image,
          'csb-emoji-sm',
          esc(tile.imageAlt ?? tile.label),
        )
        return `
<div class="csb-tile half">
  <div class="csb-half-inner">
    <div class="csb-txt">
      ${labelHtml}
      ${kpiHtml}
    </div>
    <div class="csb-half-foot">
      ${emojiSmHtml}
    </div>
  </div>
</div>`
      })
      .join('')

    return `
<section class="csb">
  <div class="csb-header">
    <h2 class="csb-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="csb-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  <div class="csb-grid">
    ${tilesHtml}
  </div>
</section>`
  },
})
