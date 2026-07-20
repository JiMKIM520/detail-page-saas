/** USAGE 아키타입: usage-steps-photo.
 *  usage-steps 업그레이드 변형 — 스텝별 이미지 슬롯(선택) + 대형 넘버링(고스트 숫자+악센트 원).
 *  이미지 없는 스텝 → 아이콘 강등(부분 결손 규칙). noimg-safe: 전체 이미지 없으면 아이콘 전용 모드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(),   // 기본 "HOW TO USE"
  subtitle: z.string().min(1).optional(),
  steps: z.array(z.object({
    icon: z.enum(ICON_NAMES),            // 이미지 없을 때 폴백 아이콘
    text: z.string().min(1),             // 단계 설명 (em, br 허용)
    label: z.string().min(1).optional(), // 기본 "STEP 0N"
    image: z.string().optional(),        // 스텝 대표 이미지 URL (선택)
  })).min(2).max(5),
  closer: z.string().min(1).optional(),  // 하단 마무리 카피 (em, br 허용)
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')
const isValidUrl = (s: string | undefined): boolean =>
  typeof s === 'string' && /^(https?:\/\/|data:|\/)/.test(s.trim())

export const usageStepsPhoto = defineBlock<Data>({
  id: 'usage-steps-photo',
  archetype: 'usage',
  styleTags: ['premium', 'photo', 'howto', 'numbered', 'noimg-safe'],
  imageSlots: 5,
  describe:
    '사용법 스텝(이미지+넘버링). HOW TO USE 타이틀 + 스텝별 이미지(선택·없으면 아이콘 강등) + 대형 고스트 숫자 배경 + 악센트 원형 번호. 이미지 있는 스텝은 정사각 썸네일+번호 오버레이, 없으면 아이콘+원 강등.',
  schema,
  css: `
/* ── usage-steps-photo (접두: usp) ── */
.usp{background:var(--bg);padding:52px 0 56px}
.usp-hd{text-align:center;padding:0 var(--pad-x,56px) 30px}
.usp-title{font-family:var(--font-display);font-weight:800;
  font-size:clamp(40px,6vw,64px);color:var(--accent-d);
  letter-spacing:-.01em;line-height:1.04}
.usp-sub{margin-top:12px;font-size:16px;font-weight:600;color:var(--ink-2)}

/* 스텝 컨테이너 */
.usp-steps{padding:0 var(--pad-x,56px)}
.usp-step{position:relative;display:flex;align-items:center;gap:22px;padding:22px 0;overflow:hidden}
.usp-step+.usp-step{border-top:1px solid var(--line)}

/* 대형 고스트 번호 — z:0 배경 장식 */
.usp-ghost{
  position:absolute;right:-2px;top:50%;transform:translateY(-50%);
  font-family:var(--font-display);font-weight:800;font-size:100px;
  color:var(--accent);opacity:.07;line-height:1;
  pointer-events:none;user-select:none;z-index:0}

/* 이미지 모드: 사각 썸네일 + 번호 오버레이 */
.usp-thumb{position:relative;flex:0 0 80px;width:80px;height:80px;z-index:1}
.usp-thumb-img{width:80px;height:80px;object-fit:cover;
  border-radius:calc(var(--r-scale,1)*12px);display:block}
.usp-thumb .ph{display:none!important}
.usp-thumb-num{
  position:absolute;bottom:4px;right:4px;
  width:24px;height:24px;border-radius:50%;
  background:var(--accent);color:#fff;
  display:grid;place-items:center;
  font-family:var(--font-display);font-weight:800;font-size:12px;
  box-shadow:0 2px 6px rgba(0,0,0,.22)}

/* 아이콘 강등 모드: 아이콘 원 + 번호 원 */
.usp-icon-wrap{flex:0 0 70px;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:1}
.usp-ic{width:70px;height:70px;border-radius:50%;background:var(--paper);
  box-shadow:0 8px 20px rgba(0,0,0,.08);display:grid;place-items:center;color:var(--accent-d)}
.usp-ic svg{width:34px;height:34px}
.usp-num{width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;
  display:grid;place-items:center;
  font-family:var(--font-display);font-weight:800;font-size:12px}

/* 우측 텍스트 */
.usp-tx{flex:1;z-index:1}
.usp-l{font-family:var(--font-display);font-weight:800;font-size:16px;
  color:var(--accent-d);letter-spacing:.04em}
.usp-t{margin-top:6px;font-size:16px;color:var(--ink-2);line-height:1.5}
.usp-t .em{color:var(--accent);font-weight:700}

/* 마무리 */
.usp-closer{margin-top:38px;padding:0 var(--pad-x,56px);text-align:center;
  font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.4}
.usp-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const stepsHtml = d.steps.map((s, i) => {
      const n = i + 1
      const label = esc(s.label ?? `STEP ${pad2(n)}`)
      const hasImg = isValidUrl(s.image)
      const lhs = hasImg
        ? `<div class="usp-thumb">
            ${media(s.image, 'usp-thumb-img', label)}
            <span class="usp-thumb-num">${n}</span>
           </div>`
        : `<div class="usp-icon-wrap">
            <span class="usp-ic">${icon(s.icon)}</span>
            <span class="usp-num">${n}</span>
           </div>`
      return `
<div class="usp-step">
  <span class="usp-ghost" aria-hidden="true">${n}</span>
  ${lhs}
  <div class="usp-tx">
    <div class="usp-l">${label}</div>
    <div class="usp-t">${richSafe(s.text)}</div>
  </div>
</div>`
    }).join('')

    return `
<section class="usp">
  <div class="usp-hd">
    <h2 class="usp-title">${esc(d.title ?? 'HOW TO USE')}</h2>
    ${d.subtitle ? `<p class="usp-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="usp-steps">${stepsHtml}
  </div>
  ${d.closer ? `<p class="usp-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
