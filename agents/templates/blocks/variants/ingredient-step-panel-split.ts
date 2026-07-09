/** INGREDIENT 아키타입: ingredient-step-panel-split
 *  피그마 179_성분소개_08 재구성.
 *  라운드 pill 배너 + 중앙정렬 타이틀 + 다크 2열 패널(좌 N단계 번호 리스트 / 우 세로 이미지).
 *  원형 번호 뱃지(1~9)와 단계명이 세로로 나열되는 정수 프로세스를 우측 세로 이미지와 병렬 배치.
 *  이미지 부재 시 우측 컬럼 숨김 → 리스트 풀폭 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const stepSchema = z.object({
  label: z.string().min(1), // 단계 라벨 (예: "step 1")
  name: z.string().min(1),  // 단계명 (예: "원수 유입 및 거대 필터링")
})

const schema = z.object({
  badge: z.string().optional(),       // pill 배너 텍스트 (예: "99.9% 순도 높은 물")
  title: z.string().min(1),           // 대제목 (em,br 허용)
  subtitle: z.string().optional(),    // 부제목 순수 텍스트
  steps: z.array(stepSchema).min(2).max(9), // 2~9단계
  image: z.string().optional(),       // 우측 세로 이미지 (url)
})
type Data = z.infer<typeof schema>

export const ingredientStepPanelSplit = defineBlock<Data>({
  id: 'ingredient-step-panel-split',
  archetype: 'ingredient',
  styleTags: ['dark', 'process', 'technical', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분/원료 정제 프로세스 블록. 라운드 pill 배너 + 중앙 대제목 + 다크 2열 패널: 좌측에 원형 번호 뱃지(accent 원)와 단계명이 세로 나열(최대 9단계), 우측에 세로 이미지. 이미지 없으면 리스트 풀폭으로 강등. 초순수 정제·공정 순서 등 단계 많은 기술 성분 섹션에 적합.',
  schema,
  css: `
.ihil{background:var(--bg);padding:64px var(--pad-x,56px) 72px;text-align:center}
/* pill 배너 */
.ihil-badge{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:700;font-size:15px;letter-spacing:.06em;padding:9px 28px;border-radius:999px;margin-bottom:28px}
/* 타이틀 */
.ihil-title{font-family:var(--font-display);font-weight:400;font-size:46px;line-height:1.2;color:var(--ink);letter-spacing:-.02em}
.ihil-title .em{color:var(--accent)}
.ihil-sub{margin-top:14px;font-size:17px;color:var(--ink-2);line-height:1.65;font-weight:400}
/* 다크 패널 */
.ihil-panel{display:flex;gap:0;margin-top:36px;border-radius:calc(var(--r-scale,1)*20px);overflow:hidden;background:var(--brand)}
/* 좌: 리스트 */
.ihil-list{flex:0 0 58%;padding:36px 32px;display:flex;flex-direction:column;gap:0}
.ihil-list--full{flex:0 0 100%}
/* 구분선 */
.ihil-list-hr{width:100%;height:1px;background:rgba(255,255,255,.15);margin:0 0 4px}
/* 스텝 행 */
.ihil-step{display:flex;align-items:center;gap:16px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.10)}
.ihil-step:last-child{border-bottom:none}
/* 원형 뱃지 */
.ihil-num{flex:0 0 44px;width:44px;height:44px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:18px;color:#fff;letter-spacing:-.01em}
/* 텍스트 */
.ihil-step-body{text-align:left}
.ihil-step-label{font-size:11px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.55);text-transform:uppercase;line-height:1;margin-bottom:4px}
.ihil-step-name{font-size:15px;font-weight:500;color:#fff;line-height:1.35}
.ihil .em{color:var(--em-dark,#FFF7EA)}
/* 우: 이미지 */
.ihil-img-col{flex:1;min-width:0;position:relative}
.ihil-img-col img,.ihil-img-col .ph{width:100%;height:100%;object-fit:cover;display:block;border-radius:0}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="ihil">
  ${d.badge ? `<div class="ihil-badge">${esc(d.badge)}</div>` : ''}
  <h2 class="ihil-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="ihil-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="ihil-panel">
    <div class="ihil-list${hasImg ? '' : ' ihil-list--full'}">
      <div class="ihil-list-hr"></div>
      ${d.steps.map((s, i) => `
      <div class="ihil-step">
        <div class="ihil-num">${i + 1}</div>
        <div class="ihil-step-body">
          <div class="ihil-step-label">${esc(s.label)}</div>
          <div class="ihil-step-name">${esc(s.name)}</div>
        </div>
      </div>`).join('')}
    </div>
    ${hasImg ? `<div class="ihil-img-col">${media(d.image, '', '정제 공정 이미지')}</div>` : ''}
  </div>
</section>`
  },
})
