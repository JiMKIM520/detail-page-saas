/** POINT 아키타입: point-fullbg-oval-stats
 *  원본: 099_문제해결_01.json
 *  구조: 전면 IMG 배경 위 상단 대형 Bold 타이틀 2단 + 하단 반투명 타원 뱃지 3개 가로 행.
 *  핵심 장치: 30% 불투명 흰색 타원(pill) 뱃지 3개에 라벨+수치를 오버레이.
 *  noimg-safe: 이미지 없을 때 배경색 강등(그라데이션 패널)으로 레이아웃 유지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statSchema = z.object({
  label: z.string().min(1),   // 항목명 (예: "세정력 개선")
  value: z.string().min(1),   // 수치/결과 (예: "98%") — em 허용
})

const schema = z.object({
  titleBig: z.string().min(1),   // 대형 2단 헤드라인 (em,br 허용) — <br>로 줄바꿈
  titleSub: z.string().optional(), // 대제목 아래 보조 한 줄 (em,br 허용)
  image: z.string().optional(),  // 전면 배경 이미지 (url)
  stats: z.array(statSchema).min(2).max(4), // 타원 뱃지 2~4개 (브리프 근거 시만)
})
type Data = z.infer<typeof schema>

export const pointFullbgOvalStats = defineBlock<Data>({
  id: 'point-fullbg-oval-stats',
  archetype: 'point',
  styleTags: ['light', 'editorial', 'mixed', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '전면 IMG 배경(없으면 그라데이션 강등) + 상단 대형 Bold 타이틀 2단 + 하단 반투명 흰색 타원 뱃지 3~4개 가로 행으로 개선율·수치를 오버레이. 뷰티·헬스케어 성과 강조 섹션.',
  schema,
  css: `
.pife{position:relative;overflow:hidden;min-height:520px;display:flex;flex-direction:column;justify-content:space-between;padding:52px var(--pad-x,56px) 48px}

/* 배경 이미지 레이어 */
.pife-bg{position:absolute;inset:0;z-index:0}
.pife-bg img,.pife-bg .ph{width:100%;height:100%;object-fit:cover;border-radius:0}
/* noimg-safe: 이미지 부재 시 브랜드 그라데이션 패널로 강등 */
.pife-bg .ph{display:block!important;background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,var(--bg)),var(--bg) 70%)!important}

/* 스크림: 배경 이미지 위 텍스트 가독성 보장 */
.pife-scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.38) 0%,rgba(0,0,0,.08) 55%,rgba(0,0,0,.55) 100%)}
/* noimg-safe: 이미지 없을 때 스크림 제거 */
.pife:not(.pife--img) .pife-scrim{display:none}

/* 콘텐츠 레이어 */
.pife-body{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:space-between;min-height:420px;gap:32px}

/* 타이틀 영역 */
.pife-titles{flex:1}
.pife-big{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,7vw,80px);line-height:1.1;letter-spacing:-.02em;color:#ffffff;text-shadow:0 2px 16px rgba(0,0,0,.35)}
.pife-big .em{color:var(--em-dark,#FFF7EA)}
/* noimg-safe: 이미지 없으면 ink 색으로 */
.pife:not(.pife--img) .pife-big{color:var(--ink);text-shadow:none}
.pife:not(.pife--img) .pife-big .em{color:var(--accent)}
.pife-sub{margin-top:16px;font-size:clamp(18px,2.4vw,26px);font-weight:600;line-height:1.45;color:rgba(255,255,255,.92);text-shadow:0 1px 8px rgba(0,0,0,.3)}
.pife-sub .em{color:var(--em-dark,#FFF7EA)}
.pife:not(.pife--img) .pife-sub{color:var(--ink-2);text-shadow:none}
.pife:not(.pife--img) .pife-sub .em{color:var(--accent)}

/* 타원 뱃지 행 */
.pife-row{display:flex;gap:16px;flex-wrap:nowrap;justify-content:center}
.pife-oval{flex:1;min-width:0;background:rgba(255,255,255,.30);border-radius:999px;padding:18px 12px;text-align:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.22)}
/* noimg-safe: 이미지 없으면 배경 색 강등 */
.pife:not(.pife--img) .pife-oval{background:color-mix(in srgb,var(--accent) 10%,var(--paper));border-color:var(--line);backdrop-filter:none;-webkit-backdrop-filter:none}
.pife-oval-label{font-size:clamp(13px,1.6vw,17px);font-weight:700;color:rgba(255,255,255,.82);line-height:1.3}
.pife:not(.pife--img) .pife-oval-label{color:var(--accent-d)}
.pife-oval-value{margin-top:4px;font-size:clamp(22px,3.2vw,32px);font-weight:800;color:#ffffff;line-height:1.2;font-family:var(--font-display)}
.pife-oval-value .em{color:#ffffff}
.pife:not(.pife--img) .pife-oval-value{color:var(--accent-d)}
.pife:not(.pife--img) .pife-oval-value .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const imgClass = hasImg ? ' pife--img' : ''
    return `
<section class="pife${imgClass}">
  <div class="pife-bg">${media(d.image, '', '섹션 배경')}</div>
  ${hasImg ? '<div class="pife-scrim"></div>' : ''}
  <div class="pife-body">
    <div class="pife-titles">
      <h2 class="pife-big">${richSafe(d.titleBig)}</h2>
      ${d.titleSub ? `<p class="pife-sub">${richSafe(d.titleSub)}</p>` : ''}
    </div>
    <div class="pife-row">
      ${d.stats.map((s) => `
      <div class="pife-oval">
        <div class="pife-oval-label">${esc(s.label)}</div>
        <div class="pife-oval-value">${richSafe(s.value)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
  },
})
