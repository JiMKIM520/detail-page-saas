/** CHECKLIST 아키타입: checklist-colorbar-diag
 *  원본: 221_문제제기_09 (두피케어 셀프진단 체크리스트)
 *  구조: 섹션 라벨 + 대형 질문 헤드라인 + 4개 체크카드(컬러 헤더바+흰 원형 체크+부연) + 진단 결론 텍스트 + 원형 이미지.
 *  핵심 장치: 각 카드 상단 브랜드색 가득 채운 헤더 바 위에 흰 원형 체크 아이콘+라벨 → 셀프진단 UX.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  label: z.string().min(1),   // 헤더 바 안 짧은 진단 항목 텍스트
  text: z.string().min(1),    // 카드 하단 부연 설명 (순수 텍스트)
})

const schema = z.object({
  eyebrow: z.string().optional(),       // 섹션 상단 소형 레이블 (예: "같은 고민중이신가요?")
  title: z.string().min(1),             // (em,br) 대형 질문 헤드라인
  items: z.array(itemSchema).min(2).max(4),
  diagLabel: z.string().optional(),     // 진단 결론 상단 소형 문구 (예: "2개 이상 해당된다면?")
  diagResult: z.string().min(1),        // (em,br) 진단 결론 강조 텍스트
  image: z.string().optional(),         // (url) 원형 사진
})
type Data = z.infer<typeof schema>

export const checklistColorbarDiag = defineBlock<Data>({
  id: 'checklist-colorbar-diag',
  archetype: 'checklist',
  styleTags: ['light', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '셀프진단 체크리스트. 섹션 레이블 + 대형 질문 헤드라인 + 2~4개 체크카드(브랜드색 헤더바+흰 원형 체크 아이콘+항목명+부연) + 진단 결론 텍스트 + 원형 사진(선택). 문제 제기·통증 유발 섹션에 최적.',
  schema,
  css: `
.cxwa{background:var(--bg,#f8fffe);padding:64px var(--pad-x,56px) 72px;color:var(--ink)}

/* ── 헤더 ── */
.cxwa-eyebrow{font-size:18px;font-weight:700;color:var(--accent);letter-spacing:.02em;margin-bottom:12px}
.cxwa-title{font-size:clamp(32px,4.5vw,52px);font-weight:900;line-height:1.25;margin-bottom:48px;max-width:720px}
.cxwa-title .em{color:var(--accent)}

/* ── 체크카드 리스트 ── */
.cxwa-list{display:flex;flex-direction:column;gap:16px;margin-bottom:56px}

.cxwa-card{
  background:color-mix(in srgb,var(--accent) 8%,var(--bg,#fff));
  border-radius:calc(var(--r-scale,1)*14px);
  overflow:hidden;
}

/* 카드 상단 컬러 헤더 바 */
.cxwa-bar{
  display:flex;
  align-items:center;
  gap:14px;
  background:var(--accent);
  padding:10px 20px;
  border-radius:calc(var(--r-scale,1)*10px) calc(var(--r-scale,1)*10px) 0 0;
}

/* 흰 원형 체크 아이콘 */
.cxwa-chk{
  flex:0 0 38px;
  width:38px;height:38px;
  border-radius:50%;
  background:#ffffff;
  display:flex;align-items:center;justify-content:center;
}
.cxwa-chk svg{display:block}

.cxwa-bar-label{
  font-size:clamp(15px,2vw,20px);
  font-weight:600;
  color:#ffffff;
  line-height:1.3;
}

/* 카드 하단 부연 텍스트 */
.cxwa-sub{
  padding:10px 20px 14px;
  font-size:clamp(13px,1.6vw,16px);
  color:var(--ink-2);
  line-height:1.6;
  text-align:center;
}

/* ── 진단 결론 ── */
.cxwa-diag{text-align:center;margin-bottom:40px}
.cxwa-diag-label{
  font-size:clamp(18px,2.5vw,26px);
  font-weight:700;
  color:var(--ink);
  margin-bottom:10px;
}
.cxwa-diag-result{
  font-size:clamp(22px,3.5vw,40px);
  font-weight:800;
  line-height:1.35;
  color:var(--accent);
}
.cxwa-diag-result .em{color:var(--ink)}

/* ── 원형 이미지 ── */
.cxwa-img-wrap{
  display:flex;
  justify-content:center;
}
.cxwa-img{
  width:clamp(200px,45vw,380px);
  aspect-ratio:1/1;
  border-radius:50%;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg,#fff));
  box-shadow:0 18px 40px -16px color-mix(in srgb,var(--accent) 40%,transparent);
}
.cxwa-img img,.cxwa-img .ph{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:inherit;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const checkSvg = `<svg width="22" height="15" viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 7L8.5 13L20 2" stroke="var(--accent)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

    const cards = d.items.map((item) => `
  <div class="cxwa-card">
    <div class="cxwa-bar">
      <span class="cxwa-chk">${checkSvg}</span>
      <span class="cxwa-bar-label">${esc(item.label)}</span>
    </div>
    <p class="cxwa-sub">${esc(item.text)}</p>
  </div>`).join('')

    const diagBlock = `
  <div class="cxwa-diag">
    ${d.diagLabel ? `<p class="cxwa-diag-label">${esc(d.diagLabel)}</p>` : ''}
    <p class="cxwa-diag-result">${richSafe(d.diagResult)}</p>
  </div>`

    const imgBlock = d.image ? `
  <div class="cxwa-img-wrap">
    <div class="cxwa-img">${media(d.image, '', '진단 이미지')}</div>
  </div>` : ''

    return `
<section class="cxwa">
  ${d.eyebrow ? `<p class="cxwa-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  <h2 class="cxwa-title">${richSafe(d.title)}</h2>
  <div class="cxwa-list">${cards}
  </div>
  ${diagBlock}
  ${imgBlock}
</section>`
  },
})
