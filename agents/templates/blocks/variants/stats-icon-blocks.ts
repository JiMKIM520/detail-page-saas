/** STATS 아키타입(템플릿 충실 재현): stats-icon-blocks.
 *  와디즈 200섹션 02_수치강조 1279:521 패턴 재구성.
 *  accent 풀폭 배경 + 헤드라인 + 풀폭 블록 3개(번호·라벨·이미지영역 + 흰 수치 밴드).
 *  기존 stats-highlight(아이콘 행)·stats-figures(다크 임팩트)와 다른 이미지 내장 블록 행 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const blockSchema = z.object({
  label: z.string().min(1),          // 항목명 (예: "만족도 평점")
  value: z.string().min(1),          // 수치 값 (예: "4.9점", em·br 허용)
  image: z.string().optional(),      // 블록 이미지 (선택)
})

const schema = z.object({
  eyebrow: z.string().optional(),    // 상단 소제목 (예: "누적 판매량")
  headline: z.string().min(1),       // 대형 헤드라인 (em·br 허용, 예: "10,000건!")
  blocks: z.array(blockSchema).min(2).max(4), // 풀폭 블록 2~4개
})
type Data = z.infer<typeof schema>

export const statsIconBlocks = defineBlock<Data>({
  id: 'stats-icon-blocks',
  archetype: 'stats',
  styleTags: ['bold', 'colorblock', 'template', 'impact'],
  imageSlots: 3,
  describe:
    '수치 강조(풀폭 이미지 블록 행). accent 풀배경 헤드라인 + 번호·라벨·이미지 내장 풀폭 블록(2~4개) 세로 나열 + 흰 수치 밴드. 누적 판매량·리뷰·매출 등 지표별 이미지와 수치를 카드 형태로 강조.',
  schema,
  css: `
/* sib = stats-icon-blocks 접두사 */
.sib{background:var(--accent);color:#fff}

/* 헤드라인 영역 */
.sib-hd{padding:52px 40px 44px;text-align:center}
.sib-eyebrow{display:block;font-size:18px;font-weight:600;color:rgba(255,255,255,.82);letter-spacing:.04em;margin-bottom:10px}
.sib-headline{font-family:var(--font-display);font-weight:800;font-size:72px;line-height:1.06;letter-spacing:-.025em}
.sib-headline .em{color:var(--ink)}

/* 블록 목록 */
.sib-list{display:flex;flex-direction:column;gap:16px;padding:0 16px 52px}

/* 개별 블록 */
.sib-block{background:var(--paper);border-radius:calc(var(--r-scale,1)*12px);overflow:hidden}

/* 이미지/번호 영역 */
.sib-top{position:relative;width:100%}
.sib-img{width:100%;height:260px;object-fit:cover;display:block}
.sib-badge{position:absolute;top:20px;left:22px}
.sib-num{font-family:var(--font-display);font-weight:800;font-size:14px;color:#fff;opacity:.9;letter-spacing:.04em;line-height:1}
.sib-label{margin-top:6px;font-family:var(--font-display);font-weight:700;font-size:18px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.35)}

/* 흰 수치 밴드 */
.sib-value{padding:20px 24px 22px;background:#fff}
.sib-value-text{font-family:var(--font-display);font-weight:800;font-size:34px;color:var(--accent);line-height:1.15}
.sib-value-text .em{color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => {
    const pad2 = (n: number) => String(n).padStart(2, '0')

    const blocksHtml = d.blocks
      .map(
        (b, i) => `
  <div class="sib-block">
    <div class="sib-top">
      ${media(b.image, 'sib-img', esc(b.label))}
      <div class="sib-badge">
        <div class="sib-num">${pad2(i + 1)}.</div>
        <div class="sib-label">${esc(b.label)}</div>
      </div>
    </div>
    <div class="sib-value">
      <div class="sib-value-text">${richSafe(b.value)}</div>
    </div>
  </div>`,
      )
      .join('')

    return `
<section class="sib">
  <div class="sib-hd">
    ${d.eyebrow ? `<span class="sib-eyebrow">${esc(d.eyebrow)}</span>` : ''}
    <h2 class="sib-headline">${richSafe(d.headline)}</h2>
  </div>
  <div class="sib-list">
    ${blocksHtml}
  </div>
</section>`
  },
})
