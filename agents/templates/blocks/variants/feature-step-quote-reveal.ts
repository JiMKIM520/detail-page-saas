/** FEATURE 아키타입: feature-step-quote-reveal
 *  피그마 203_문제해결_05 구조 흡수.
 *  올리브 그린 번호 뱃지 + 세로 구분선으로 3단계 케어 스텝을 수평 3열 분할하고,
 *  하단에 3색 계층 인용 텍스트(회색·중간·진한)로 솔루션 메시지를 드라마틱하게 전달.
 *  전체 폭 이미지(선택)가 인용 블록 아래 배치되며 이미지 부재 시 레이아웃 붕괴 없음(noimg-safe).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const stepSchema = z.object({
  label: z.string().min(1),   // 단계 제목 (예: "세정 단계")
  text: z.string().min(1),    // 단계 설명 (순수 텍스트)
})

const schema = z.object({
  eyebrow: z.string().min(1),                // 상단 소형 레이블 (예: "더스칼프의 접근법")
  title: z.string().min(1),                  // 대형 슬로건 (em,br 허용)
  steps: z.array(stepSchema).min(2).max(3),  // 2~3단계 (원본 3열)
  quoteTop: z.string().min(1),               // 인용 1행 — 회색 (muted)
  quoteMid: z.string().min(1),               // 인용 2행 — 중간 강조 (em,br 허용)
  quoteBottom: z.string().min(1),            // 인용 3행 — 진한 강조 (em,br 허용)
  image: z.string().optional(),              // 전체 폭 하단 이미지 (url)
})
type Data = z.infer<typeof schema>

export const featureStepQuoteReveal = defineBlock<Data>({
  id: 'feature-step-quote-reveal',
  archetype: 'feature',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '브랜드 접근법 섹션. 소형 레이블 + 대형 슬로건 / 올리브 번호 뱃지+세로선 3열 케어 스텝 / 3색 계층 인용 텍스트(회색→중간→진한) / 전체 폭 이미지(선택). 두피·뷰티·전문 케어 브랜드에 적합.',
  schema,
  css: `
.fsqr{background:var(--bg);color:var(--ink);padding:60px 0 0}
/* ── 타이틀 영역 ── */
.fsqr-hd{padding:0 var(--pad-x,56px) 32px}
.fsqr-eyebrow{font-size:18px;font-weight:700;color:var(--ink-2);letter-spacing:.04em;margin-bottom:14px}
.fsqr-title{font-family:var(--font-display);font-weight:800;font-size:54px;line-height:1.1;letter-spacing:-.02em;color:var(--ink)}
.fsqr-title .em{color:var(--accent)}
.fsqr-rule{width:100%;height:1px;background:var(--line);margin:0 0 0 0;border:none}
/* ── 3열 스텝 그리드 ── */
.fsqr-steps{display:grid;padding:0 var(--pad-x,56px);gap:0}
.fsqr-steps[data-cols="2"]{grid-template-columns:repeat(2,1fr)}
.fsqr-steps[data-cols="3"]{grid-template-columns:repeat(3,1fr)}
.fsqr-step{padding:36px 0 36px;position:relative}
.fsqr-step+.fsqr-step::before{content:'';position:absolute;left:0;top:20%;height:60%;width:1px;background:var(--line)}
.fsqr-badge{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:color-mix(in srgb,var(--accent) 12%,transparent);border-radius:calc(var(--r-scale,1)*10px);margin-bottom:20px}
.fsqr-badge-num{font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--accent);letter-spacing:.04em}
.fsqr-step:not(:first-child) .fsqr-badge{margin-left:28px}
.fsqr-step:not(:first-child) .fsqr-step-label,.fsqr-step:not(:first-child) .fsqr-step-text{padding-left:28px}
.fsqr-step-label{font-size:22px;font-weight:800;color:var(--ink);margin-bottom:10px;line-height:1.25}
.fsqr-step-text{font-size:15px;font-weight:400;color:var(--ink-2);line-height:1.75}
/* ── 인용 블록 ── */
.fsqr-quote-wrap{position:relative;padding:52px var(--pad-x,56px) 52px;text-align:center}
.fsqr-quote-mark{display:block;width:28px;height:18px;margin:0 auto 24px;color:var(--accent);opacity:.7}
.fsqr-quote-mark.close{margin:24px auto 0;transform:rotate(180deg)}
.fsqr-qt{font-family:var(--font-display);font-weight:700;font-size:38px;line-height:1.28;letter-spacing:-.01em}
.fsqr-qt.top{color:var(--muted)}
.fsqr-qt.mid{color:color-mix(in srgb,var(--accent) 70%,var(--ink))}
.fsqr-qt.bot{color:var(--accent-d)}
.fsqr-qt.mid .em,.fsqr-qt.bot .em{font-style:normal}
/* ── 전체 폭 이미지 ── */
.fsqr-img{display:block;width:100%;aspect-ratio:860/580;object-fit:cover;border-radius:var(--shape-photo, 0px)}
.fsqr-img.ph{display:none!important}
`,
  render: (d, { esc, richSafe }) => {
    const cols = Math.min(3, Math.max(2, d.steps.length))
    const padStep = (i: number) => i > 0 ? ' style="padding-left:28px"' : ''

    const stepsHtml = d.steps
      .map(
        (s, i) => `
      <div class="fsqr-step">
        <div class="fsqr-badge"${i > 0 ? ' style="margin-left:28px"' : ''}>
          <span class="fsqr-badge-num">${String(i + 1).padStart(2, '0')}</span>
        </div>
        <div class="fsqr-step-label"${padStep(i)}>${esc(s.label)}</div>
        <div class="fsqr-step-text"${padStep(i)}>${esc(s.text)}</div>
      </div>`,
      )
      .join('')

    const quoteMarkSvg = `<svg class="fsqr-quote-mark" viewBox="0 0 28 18" fill="none" aria-hidden="true">
      <path d="M0 18V10.8C0 4.6 3.4 1.2 10.2 0l1.4 2.4C7.8 3.4 6 5.6 5.6 9.2H11V18H0zm17 0V10.8C17 4.6 20.4 1.2 27.2 0l1.4 2.4c-3.8 1-5.6 3.2-6 6.8H28V18H17z" fill="currentColor"/>
    </svg>`
    const quoteMarkCloseSvg = `<svg class="fsqr-quote-mark close" viewBox="0 0 28 18" fill="none" aria-hidden="true">
      <path d="M0 18V10.8C0 4.6 3.4 1.2 10.2 0l1.4 2.4C7.8 3.4 6 5.6 5.6 9.2H11V18H0zm17 0V10.8C17 4.6 20.4 1.2 27.2 0l1.4 2.4c-3.8 1-5.6 3.2-6 6.8H28V18H17z" fill="currentColor"/>
    </svg>`

    return `
<section class="fsqr">
  <div class="fsqr-hd">
    <p class="fsqr-eyebrow">${esc(d.eyebrow)}</p>
    <h2 class="fsqr-title">${richSafe(d.title)}</h2>
  </div>
  <hr class="fsqr-rule">
  <div class="fsqr-steps" data-cols="${cols}">
    ${stepsHtml}
  </div>
  <hr class="fsqr-rule">
  <div class="fsqr-quote-wrap">
    ${quoteMarkSvg}
    <p class="fsqr-qt top">${esc(d.quoteTop)}</p>
    <p class="fsqr-qt mid">${richSafe(d.quoteMid)}</p>
    <p class="fsqr-qt bot">${richSafe(d.quoteBottom)}</p>
    ${quoteMarkCloseSvg}
  </div>
  ${media(d.image, 'fsqr-img', '브랜드 비주얼')}
</section>`
  },
})
