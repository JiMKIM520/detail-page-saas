/** USAGE 아키타입: feeding-guide-blocks.
 *  체중/용량 구간별 급여 가이드 그리드. 구간 라벨+대형 숫자+아이콘+설명 카드.
 *  펫푸드·영양제·의약품 복용량 안내 등 범용. noimg-safe — 이미지 슬롯 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(),       // 섹션 헤드라인 (기본: "급여 가이드")
  subtitle: z.string().min(1).optional(),    // 서브 카피 (em, br 허용)
  unitLabel: z.string().min(1).optional(),   // 단위 라벨 배지 (예: "1일 급여량 기준")
  blocks: z.array(z.object({
    range: z.string().min(1),               // 구간 라벨 (예: "5~10kg", "소형견")
    value: z.string().min(1),              // 대형 강조 수치 (예: "50g", "2정")
    icon: z.enum(ICON_NAMES),              // 구간 대표 아이콘
    desc: z.string().optional(),           // 보조 설명 (선택)
  })).min(2).max(6),
  disclaimer: z.string().optional(),        // 하단 면책 문구
})
type Data = z.infer<typeof schema>

export const feedingGuideBlocks = defineBlock<Data>({
  id: 'feeding-guide-blocks',
  archetype: 'usage',
  styleTags: ['light', 'grid', 'numeric', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '체중·용량 구간별 급여/복용 가이드 그리드(noimg-safe). 섹션 제목+단위 배지 + 구간 라벨·대형 숫자·아이콘·설명 카드 2~6개 그리드. 펫푸드 급여량·영양제 복용 안내 등. 이미지 없이 완결.',
  schema,
  css: `
/* ── feeding-guide-blocks (접두: fgb) ── */
.fgb{background:var(--bg);padding:56px var(--pad-x,56px) 60px}

/* 헤더 */
.fgb-hd{text-align:center;margin-bottom:36px}
.fgb-title{font-family:var(--font-display);font-weight:800;
  font-size:clamp(28px,4.5vw,44px);color:var(--accent-d);
  letter-spacing:-.01em;line-height:1.12}
.fgb-sub{margin-top:10px;font-size:16px;font-weight:600;color:var(--ink-2)}
.fgb-sub .em{color:var(--accent)}
.fgb-unit{display:inline-block;margin-top:16px;padding:7px 24px;
  border-radius:999px;background:var(--accent);color:#fff;
  font-size:13px;font-weight:700;letter-spacing:.06em}

/* 카드 그리드 */
.fgb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}

/* 카드 */
.fgb-card{
  position:relative;overflow:hidden;
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:24px 16px 20px;
  text-align:center;
  box-shadow:0 8px 22px -10px rgba(0,0,0,.14);
  border:1.5px solid var(--line)}
/* 상단 악센트 바 */
.fgb-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:4px;
  background:var(--accent)}

/* 구간 라벨 */
.fgb-range{
  font-size:12px;font-weight:700;letter-spacing:.08em;
  color:var(--accent-d);text-transform:uppercase;
  margin-bottom:12px;line-height:1}

/* 아이콘 */
.fgb-icon{width:36px;height:36px;margin:0 auto 10px;color:var(--accent)}
.fgb-icon svg{width:36px;height:36px}

/* 대형 수치 */
.fgb-value{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(30px,5vw,46px);color:var(--accent-d);
  line-height:1;letter-spacing:-.02em}

/* 보조 설명 */
.fgb-desc{margin-top:10px;font-size:13px;color:var(--muted);line-height:1.45}

/* 면책 */
.fgb-disclaimer{margin-top:28px;text-align:center;font-size:12px;color:var(--muted);line-height:1.6}
`,
  render: (d, { esc, richSafe, icon }) => {
    const cardsHtml = d.blocks.map((b) => `
<div class="fgb-card">
  <div class="fgb-range">${esc(b.range)}</div>
  <div class="fgb-icon">${icon(b.icon)}</div>
  <div class="fgb-value">${esc(b.value)}</div>
  ${b.desc ? `<p class="fgb-desc">${esc(b.desc)}</p>` : ''}
</div>`).join('')

    return `
<section class="fgb">
  <div class="fgb-hd">
    <h2 class="fgb-title">${esc(d.title ?? '급여 가이드')}</h2>
    ${d.subtitle ? `<p class="fgb-sub">${richSafe(d.subtitle)}</p>` : ''}
    ${d.unitLabel ? `<span class="fgb-unit">${esc(d.unitLabel)}</span>` : ''}
  </div>
  <div class="fgb-grid">${cardsHtml}
  </div>
  ${d.disclaimer ? `<p class="fgb-disclaimer">${esc(d.disclaimer)}</p>` : ''}
</section>`
  },
})
