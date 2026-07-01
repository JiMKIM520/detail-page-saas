/** STATS 아키타입 추가 변형(템플릿 충실 재현): 02_수치강조 Figma 1279:522.
 *  stats-text-only: 다크 배경 + 상단 심볼 아이콘/이미지 + 4개 순수 타이포 수치 행
 *  (pill 라벨 + 대형 Cafe24 숫자) + 수평 구분선 + 하단 받침대 이미지(선택).
 *  statsGlassCards(글래스 카드), statsFigures(금배지 행), statsHighlight(아이콘 카드행)과
 *  다른 텍스트 전용 순수 타이포그래피 수치 스택. 이미지 슬롯 없음(0). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 수치 행 스키마 ──────────────────────────────────────────────────────────────
const rowSchema = z.object({
  label: z.string().min(1),   // 수치 항목명 pill (예: "누적 판매량")
  value: z.string().min(1),   // 대형 수치 텍스트 (em, br 허용)
})

const schema = z.object({
  symbolImage: z.string().optional(),   // 상단 심볼 이미지 (왕관·트로피 등, URL)
  rows: z.array(rowSchema).min(2).max(4), // 수치 행 2~4개
  podiumImage: z.string().optional(),   // 하단 받침대/무대 이미지 (URL)
})
type Data = z.infer<typeof schema>

export const statsTextOnly = defineBlock<Data>({
  id: 'stats-text-only',
  archetype: 'stats' as any,
  styleTags: ['premium', 'dark', 'template', 'impact', 'typography'],
  imageSlots: 0,
  describe:
    '수치 강조(순수 타이포 스택). 다크 배경 + 상단 심볼 이미지(왕관·트로피 등, 선택) + pill 라벨 + Cafe24 대형 숫자 행(2~4개) + 수평 구분선 + 하단 받침대 이미지(선택). 이미지 없이 텍스트만으로 수치 임팩트를 주는 다크 럭셔리 레이아웃.',
  schema,
  css: `
/* sto = stats-text-only 접두사 */
.sto{background:var(--ink);color:#fff;padding:56px 0 0;text-align:center;position:relative;overflow:hidden}

/* 배경 은은한 광원 */
.sto::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:800px;height:400px;background:radial-gradient(ellipse at center top,rgba(255,255,255,.06) 0%,transparent 65%);pointer-events:none}

/* 상단 심볼 이미지 */
.sto-symbol{width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 28px;filter:drop-shadow(0 4px 16px rgba(255,210,80,.30))}
.sto-symbol.ph{background:rgba(255,255,255,.06);border:none;border-radius:50%;color:rgba(255,255,255,.25);font-size:11px}

/* 수치 행 목록 */
.sto-rows{display:flex;flex-direction:column;width:100%}

/* 개별 수치 행 */
.sto-row{padding:28px 48px 26px;border-bottom:1px solid rgba(255,255,255,.12)}
.sto-row:last-child{border-bottom:none}

/* pill 라벨 */
.sto-pill{display:inline-block;font-family:var(--font-display);font-weight:800;font-size:16px;color:rgba(255,255,255,.80);background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:6px 20px;letter-spacing:.04em;margin-bottom:14px}

/* 대형 수치 */
.sto-value{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-weight:400;font-size:64px;color:#fff;line-height:1.05;letter-spacing:-.02em;text-shadow:0 2px 24px rgba(255,255,255,.12)}
.sto-value .em{color:#F5C518}

/* 하단 받침대 이미지 */
.sto-podium{width:100%;display:block;margin-top:0;object-fit:cover;object-position:top}
.sto-podium.ph{height:160px;background:rgba(255,255,255,.04);border:none;color:rgba(255,255,255,.2);font-size:11px;margin-top:8px}
`,
  render: (d, { richSafe }) => {
    const rowsHtml = d.rows
      .map(
        (row) => `
  <div class="sto-row">
    <div class="sto-pill">${richSafe(row.label)}</div>
    <div class="sto-value">${richSafe(row.value)}</div>
  </div>`,
      )
      .join('')

    return `
<section class="sto">
  ${d.symbolImage ? media(d.symbolImage, 'sto-symbol', '브랜드 심볼') : ''}
  <div class="sto-rows">
    ${rowsHtml}
  </div>
  ${d.podiumImage ? media(d.podiumImage, 'sto-podium', '받침대 이미지') : ''}
</section>`
  },
})
