/** FAQ/STATS 아키타입: faq-satisfaction-bar.
 *  [끝판왕] FAQ 문의 구성 #18 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--ink) 배경 + 골드 그라데이션 대형 헤드라인 + 전폭 골드 그라데이션 행(라벨 + 우측 대형 퍼센트 수치).
 *  데이터 시각화형 만족도 리스트 — 바 자체가 fill로 채워진 채도 있는 골드. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 대제목 — em 허용(퍼센트 숫자 강조 등) */
  title: z.string().min(1),
  /** 제목 아래 부제 (한 줄, em 없어도 됨) */
  subtitle: z.string().optional(),
  /** 만족도 행 (3~8개) */
  items: z
    .array(
      z.object({
        /** 만족도 항목 설명 */
        label: z.string().min(1),
        /** 퍼센트 수치 (숫자만, "%" 기호는 자동) */
        percent: z.number().int().min(0).max(100),
      }),
    )
    .min(3)
    .max(8),
  /** 하단 유의사항/주석 (줄바꿈은 배열 요소 단위) */
  notes: z.array(z.string().min(1)).max(5).optional(),
})
type Data = z.infer<typeof schema>

export const faqSatisfactionBar = defineBlock<Data>({
  id: 'faq-satisfaction-bar',
  archetype: 'stats',
  styleTags: ['dark', 'gold', 'satisfaction', 'review', 'data-viz', 'template'],
  imageSlots: 0,
  describe:
    '사용 후기 만족도 리스트(데이터 시각화). 다크 배경 + 골드 그라데이션 대형 헤드라인 + 전폭 골드 그라데이션 바 행(좌: 항목 설명, 우: 대형 퍼센트 수치) 반복 + 하단 유의사항. 커머스 후기 신뢰도 섹션.',
  schema,
  css: `
/* faq-satisfaction-bar — 접두사 fsb- */
.fsb{background:var(--ink);padding:60px 40px 56px;color:#fff;word-break:keep-all}
/* 헤드라인 — 골드 그라데이션 텍스트(다크 배경 위 가독성) */
.fsb-title{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,7.5vw,52px);line-height:1.18;letter-spacing:-.02em;text-align:center;margin-bottom:10px;
  background:linear-gradient(135deg,#f5c96e 0%,#e6a830 45%,#f5c96e 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
/* 다크 배경에서 .em은 밝은 accent(골드) override */
.fsb-title .em{color:var(--accent);-webkit-text-fill-color:var(--accent)}
.fsb-sub{text-align:center;font-family:var(--font-body);font-size:16px;color:rgba(255,255,255,.62);line-height:1.6;margin-bottom:44px}
/* 만족도 바 리스트 */
.fsb-list{display:flex;flex-direction:column;gap:14px}
.fsb-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 24px 18px 28px;border-radius:6px;
  background:linear-gradient(90deg,#c8962a 0%,#e8b84b 35%,#f5d070 70%,#e8b84b 100%);
  box-shadow:0 4px 18px -6px rgba(200,150,42,.45)}
.fsb-label{font-family:var(--font-body);font-size:clamp(15px,3.2vw,18px);font-weight:500;color:#1a1208;line-height:1.4;flex:1;padding-right:16px}
/* 퍼센트 수치 — 대형 타이포 */
.fsb-pct{display:flex;align-items:baseline;gap:0;flex-shrink:0}
.fsb-num{font-family:var(--font-display);font-weight:800;font-size:clamp(38px,8vw,54px);line-height:1;color:#1a1208;letter-spacing:-.03em}
.fsb-unit{font-family:var(--font-display);font-weight:700;font-size:clamp(14px,2.8vw,20px);color:#1a1208;margin-left:1px;align-self:flex-end;padding-bottom:6px}
/* 하단 유의사항 */
.fsb-notes{margin-top:32px;text-align:center}
.fsb-note{font-family:var(--font-body);font-size:13px;color:rgba(255,255,255,.42);line-height:1.7}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map(
        (it) => `
  <div class="fsb-row">
    <span class="fsb-label">${esc(it.label)}</span>
    <span class="fsb-pct">
      <span class="fsb-num">${it.percent}</span><span class="fsb-unit">%</span>
    </span>
  </div>`,
      )
      .join('')

    const noteLines =
      d.notes && d.notes.length > 0
        ? `<div class="fsb-notes">${d.notes.map((n) => `<p class="fsb-note">${esc(n)}</p>`).join('')}</div>`
        : ''

    return `
<section class="fsb">
  <h2 class="fsb-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="fsb-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="fsb-list">${rows}
  </div>
  ${noteLines}
</section>`
  },
})
