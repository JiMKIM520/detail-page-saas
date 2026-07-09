/** FEATURE 아키타입: feature-step-iconbox.
 *  피그마 224_문제해결_06 흡수 — 민트그린 배경 + 그라디언트 솔루션 대제목 + 스텝 번호 뱃지 카드
 *  (컬러 헤더바 + 2레이어 내용: 본문 단락 / 우측 고정 아이콘 패널+요약 박스텍스트) + 하단 풀블리드 이미지.
 *  이미지 없을 때 하단 블록 은닉(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const stepSchema = z.object({
  title: z.string().min(1),       // 스텝 제목 (헤더바)
  body: z.string().min(1),        // 본문 단락 (em 허용)
  boxLabel: z.string().min(1),    // 박스텍스트 강조 라벨 (em 허용)
  boxDesc: z.string().min(1),     // 박스텍스트 부연 (em 허용)
  icon: z.string().optional(),    // 아이콘 이름 (ICON_NAMES 35종)
})

const schema = z.object({
  eyebrow: z.string().optional(),        // 상단 소형 레이블 (예: "해결의 원리")
  headline: z.string().min(1),           // 대형 굵은 헤드라인 (em,br 허용)
  desc: z.string().optional(),           // 헤드라인 아래 설명 문장
  solutionLabel: z.string().optional(),  // 그라디언트 중간 대제목 (기본 "단계별 솔루션")
  steps: z.array(stepSchema).min(2).max(5),
  image: z.string().optional(),          // 하단 풀블리드 이미지 (url)
})
type Data = z.infer<typeof schema>

export const featureStepIconbox = defineBlock<Data>({
  id: 'feature-step-iconbox',
  archetype: 'feature',
  styleTags: ['light', 'mint', 'step', 'accordion', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '솔루션 단계 카드 블록. 민트그린 배경 + 상단 eyebrow+헤드라인+설명 + 그라디언트 대형 솔루션 레이블 + 2~5개 번호 뱃지 스텝 카드(컬러 헤더바+본문+우측 아이콘패널 박스텍스트 2레이어) + 하단 풀블리드 이미지(선택). 문제해결·성분·작동원리 섹션에 적합.',
  schema,
  css: `
.frrz{background:var(--frrz-bg,#eaf5f0);color:var(--ink);padding:72px 0 0}
.frrz-hd{padding:0 var(--pad-x,56px) 40px}
.frrz-eyebrow{font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--frrz-teal,#49beb2);letter-spacing:.06em;margin-bottom:14px}
.frrz-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5vw,60px);color:var(--ink);line-height:1.15;letter-spacing:-.02em}
.frrz-headline .em{color:var(--ink)}
.frrz-desc{margin-top:18px;font-size:clamp(16px,2vw,22px);font-weight:400;color:var(--ink-2);line-height:1.6}
.frrz-sol-wrap{text-align:center;padding:28px var(--pad-x,56px) 36px;display:flex;flex-direction:column;align-items:center;gap:14px}
.frrz-sol-label{font-family:var(--font-display);font-weight:800;font-size:clamp(44px,8vw,72px);letter-spacing:-.03em;line-height:1;background:linear-gradient(135deg,var(--frrz-teal,#49beb2) 0%,var(--frrz-teal2,#138478) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.frrz-dots{display:flex;gap:12px;align-items:center}
.frrz-dot{width:12px;height:12px;border-radius:50%;background:var(--frrz-gold,#f4c542)}
.frrz-arrow{width:24px;height:38px;opacity:.55}
.frrz-list{padding:0 var(--pad-x,56px) 48px;display:flex;flex-direction:column;gap:20px}
.frrz-card{border-radius:calc(var(--r-scale,1)*18px);overflow:hidden;box-shadow:0 4px 18px -4px rgba(0,0,0,.10)}
.frrz-card-hd{background:var(--frrz-teal2,#138478);display:flex;align-items:center;gap:0;padding:0 24px;height:72px}
.frrz-badge{width:50px;height:50px;border-radius:50%;background:var(--frrz-gold,#f4c542);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:24px;color:#fff;margin-right:18px}
.frrz-step-title{font-family:var(--font-display);font-weight:700;font-size:clamp(18px,2.5vw,26px);color:#fff;letter-spacing:-.01em}
.frrz-card-body{background:#fff;padding:22px 24px 24px}
.frrz-body-text{font-size:clamp(14px,1.8vw,18px);font-weight:300;color:var(--ink);line-height:1.72;margin-bottom:16px}
.frrz-body-text .em{color:var(--frrz-teal2,#138478);font-weight:600}
.frrz-box{background:#f5f5f5;border-radius:calc(var(--r-scale,1)*14px);display:flex;align-items:stretch;overflow:hidden;min-height:120px}
.frrz-box-text{flex:1;padding:18px 20px;display:flex;flex-direction:column;justify-content:center;gap:8px}
.frrz-box-label{font-family:var(--font-display);font-weight:700;font-size:clamp(15px,2vw,20px);color:var(--frrz-teal2,#138478);line-height:1.2}
.frrz-box-label .em{color:var(--frrz-teal2,#138478)}
.frrz-box-desc{font-size:clamp(13px,1.6vw,16px);font-weight:300;color:var(--ink);line-height:1.6}
.frrz-box-desc .em{color:var(--frrz-teal2,#138478);font-weight:600}
.frrz-icon-panel{flex-shrink:0;width:100px;background:var(--frrz-teal2,#138478);display:flex;align-items:center;justify-content:center;padding:16px}
.frrz-icon-panel svg{width:56px;height:56px;color:#fff;stroke:#fff}
.frrz-foot{width:100%;display:block;object-fit:cover;max-height:560px;border-radius:0}
.frrz-foot.ph{display:none!important}
`,
  render: (d, { esc, richSafe, icon }) => {
    const solLabel = d.solutionLabel ?? '단계별 솔루션'

    const cards = d.steps
      .map(
        (s, i) => `
<div class="frrz-card">
  <div class="frrz-card-hd">
    <div class="frrz-badge">${i + 1}</div>
    <span class="frrz-step-title">${esc(s.title)}</span>
  </div>
  <div class="frrz-card-body">
    <p class="frrz-body-text">${richSafe(s.body)}</p>
    <div class="frrz-box">
      <div class="frrz-box-text">
        <div class="frrz-box-label">${richSafe(s.boxLabel)}</div>
        <div class="frrz-box-desc">${richSafe(s.boxDesc)}</div>
      </div>
      <div class="frrz-icon-panel">${icon(s.icon ?? 'check')}</div>
    </div>
  </div>
</div>`,
      )
      .join('')

    return `
<section class="frrz">
  <div class="frrz-hd">
    ${d.eyebrow ? `<div class="frrz-eyebrow">${esc(d.eyebrow)}</div>` : ''}
    <h2 class="frrz-headline">${richSafe(d.headline)}</h2>
    ${d.desc ? `<p class="frrz-desc">${esc(d.desc)}</p>` : ''}
  </div>
  <div class="frrz-sol-wrap">
    <div class="frrz-dots"><span class="frrz-dot"></span><span class="frrz-dot"></span><span class="frrz-dot"></span></div>
    <div class="frrz-sol-label">${esc(solLabel)}</div>
    <svg class="frrz-arrow" viewBox="0 0 24 38" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v30M4 26l8 9 8-9"/>
    </svg>
  </div>
  <div class="frrz-list">${cards}</div>
  ${media(d.image, 'frrz-foot', '제품 이미지')}
</section>`
  },
})
