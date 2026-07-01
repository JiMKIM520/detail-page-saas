/** STATS 아키타입(템플릿 충실 재현): stats-figures.
 *  와디즈 200섹션 02_수치 강조 섹션_01 패턴 재구성.
 *  어두운 브랜드 배경 + 별 장식 + 대형 숫자(Cafe24 ClassicType) 헤드라인
 *  + 중앙 심볼 이미지 + 수평 구분선 기반 수치 행 3개.
 *  기존 stats-highlight(아이콘+라벨+값 카드행)와 다른 임팩트형 숫자 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statRowSchema = z.object({
  label: z.string().min(1),   // 수치 항목명 (예: "누적 판매량")
  value: z.string().min(1),   // 수치 값 (예: "10,000건")
  sub: z.string().optional(), // 보조 설명 (예: "2024년 기준")
})

const schema = z.object({
  eyebrow: z.string().optional(),         // 상단 소제목 레이블 (예: "누적 판매량")
  headline: z.string().min(1),            // 대형 숫자 헤드라인 (예: "10,000건!")
  symbolImage: z.string().optional(),     // 중앙 심볼/제품 이미지 (왕관, 트로피 등)
  stars: z.number().int().min(0).max(5).optional(), // 별 개수 (0~5, 기본 3)
  rows: z.array(statRowSchema).min(1).max(4), // 수치 행 1~4개
})
type Data = z.infer<typeof schema>

export const statsFigures = defineBlock<Data>({
  id: 'stats-figures',
  archetype: 'stats',
  styleTags: ['premium', 'template', 'dark', 'impact', 'cobalt'],
  imageSlots: 1,
  describe:
    '대형 숫자 임팩트형 수치 강조. 어두운 브랜드 배경 + 별 장식 + Cafe24 ClassicType 대형 숫자 헤드라인 + 중앙 심볼 이미지(선택) + 수평 구분선 수치 행(1~4개). 기존 stats-highlight(아이콘 카드행)와 다른 임팩트형 수치 레이아웃. 누적 판매량·리뷰수·매출 등 핵심 성과 수치 강조에 적합.',
  schema,
  css: `
/* sf = stats-figures 접두사 */
.sf{background:var(--brand);padding:60px 0 56px;text-align:center;position:relative;overflow:hidden}

/* 배경 광채 효과 */
.sf::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:700px;background:radial-gradient(ellipse at center,rgba(255,210,80,.12) 0%,transparent 68%);pointer-events:none}

/* 별 장식 */
.sf-stars{display:flex;justify-content:center;gap:10px;margin-bottom:18px}
.sf-star{width:28px;height:28px;color:#F5C518}
.sf-star svg{width:28px;height:28px}

/* eyebrow 레이블 */
.sf-eyebrow{display:inline-block;font-family:var(--font-display);font-weight:800;font-size:18px;color:rgba(255,255,255,.72);letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px}

/* 대형 숫자 헤드라인 */
.sf-headline{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-weight:400;font-size:80px;color:#F5C518;line-height:1.05;letter-spacing:-.02em;text-shadow:0 4px 32px rgba(245,197,24,.35)}
.sf-headline .em{color:var(--accent)}

/* 심볼 이미지 */
.sf-symbol{width:200px;height:200px;object-fit:contain;display:block;margin:28px auto 24px;filter:drop-shadow(0 8px 24px rgba(245,197,24,.28))}
.sf-symbol.ph{background:transparent;border:none;color:rgba(255,255,255,.2);font-size:12px}

/* 구분선 */
.sf-divider{width:80%;height:1px;background:rgba(255,255,255,.18);margin:0 auto 0}

/* 수치 행 목록 */
.sf-rows{margin-top:0;padding:0 48px}

/* 개별 수치 행 */
.sf-row{display:flex;align-items:center;gap:20px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,.12);text-align:left}
.sf-row:last-child{border-bottom:none}

/* 황금 원형 뱃지 */
.sf-badge{flex:0 0 48px;width:48px;height:48px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#ffe47a 0%,#c8920a 100%);display:grid;place-items:center;box-shadow:0 4px 14px rgba(200,146,10,.4)}
.sf-badge-num{font-family:'Cafe24 ClassicType',sans-serif;font-weight:400;font-size:20px;color:#fff;line-height:1}

/* 행 텍스트 */
.sf-row-body{flex:1;min-width:0}
.sf-row-label{font-size:14px;font-weight:600;color:rgba(255,255,255,.6);letter-spacing:.03em;margin-bottom:4px}
.sf-row-value{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-size:32px;color:#ffffff;line-height:1.1;letter-spacing:-.01em}
.sf-row-sub{font-size:12px;color:rgba(255,255,255,.4);margin-top:4px}
`,
  render: (d, { esc, richSafe }) => {
    const starCount = d.stars ?? 3
    const starsHtml = starCount > 0
      ? `<div class="sf-stars">${Array(starCount).fill(0).map(() =>
          `<span class="sf-star"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg></span>`
        ).join('')}</div>`
      : ''

    const symbolHtml = d.symbolImage
      ? media(d.symbolImage, 'sf-symbol', '브랜드 심볼')
      : ''

    const rowsHtml = d.rows.map((row, i) => `
    <div class="sf-row">
      <div class="sf-badge"><span class="sf-badge-num">${i + 1}</span></div>
      <div class="sf-row-body">
        <div class="sf-row-label">${esc(row.label)}</div>
        <div class="sf-row-value">${richSafe(row.value)}</div>
        ${row.sub ? `<div class="sf-row-sub">${richSafe(row.sub)}</div>` : ''}
      </div>
    </div>`).join('')

    return `
<section class="sf">
  ${starsHtml}
  ${d.eyebrow ? `<div class="sf-eyebrow">${esc(d.eyebrow)}</div>` : ''}
  <h2 class="sf-headline">${richSafe(d.headline)}</h2>
  ${symbolHtml}
  <div class="sf-divider"></div>
  <div class="sf-rows">
    ${rowsHtml}
  </div>
</section>`
  },
})
