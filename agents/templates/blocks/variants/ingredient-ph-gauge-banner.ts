/** INGREDIENT 아키타입: ingredient-ph-gauge-banner
 *  출처: 178_성분소개_07 (860×1843)
 *  구조: 중앙정렬 타이틀 + 3열 수치 배너(세로선 구분) + 풀폭 배경사진 위에
 *        원형 그라데이션 pH 게이지(화살표 포인터 + 산성/알칼리성 라벨) 오버랩.
 *  noimg-safe: 사진 없으면 게이지 전용 섹션으로 강등(배경색 유지). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statSchema = z.object({
  value: z.string().min(1),   // 예: "80", "ph5.5"
  unit:  z.string().min(1),   // 예: "gsm", "sheets", "약산성"
})

const schema = z.object({
  title:    z.string().min(1),             // (em,br) 중앙 타이틀
  subtitle: z.string().optional(),         // 타이틀 아래 한 줄 설명
  stats:    z.array(statSchema).min(2).max(4), // 수치 배너 칼럼 (2~4개)
  // pH 게이지 슬롯
  phValue:  z.string().optional(),         // 예: "5.5" — 게이지 중심 표시값
  phLabel:  z.string().optional(),         // 예: "약산성" — 포인터 아래 라벨
  phMin:    z.string().optional(),         // 좌측 라벨 (기본 "산성")
  phMax:    z.string().optional(),         // 우측 라벨 (기본 "알칼리성")
  image:    z.string().optional(),         // (url) 풀폭 배경 사진
})
type Data = z.infer<typeof schema>

export const ingredientPhGaugeBanner = defineBlock<Data>({
  id: 'ingredient-ph-gauge-banner',
  archetype: 'ingredient',
  styleTags: ['light', 'food', 'baby', 'mixed', 'noimg-safe', 'infographic'],
  imageSlots: 1,
  describe:
    '성분·품질 수치 블록. 중앙정렬 제목 + 2~4열 수치 배너(세로선 구분) + 풀폭 사진 위 원형 그라데이션 pH 게이지 오버랩. ' +
    '물티슈·스킨케어·식품 등 pH·무게·매수 등 규격 수치를 인포그래픽으로 전달. 이미지 없으면 배경색 패널로 강등.',
  schema,
  css: `
.iijs{background:var(--bg);color:var(--ink);padding:60px 0 0;text-align:center}
.iijs-hd{padding:0 var(--pad-x,56px) 40px}
.iijs-title{font-family:var(--font-display);font-weight:400;font-size:42px;line-height:1.25;color:var(--ink);letter-spacing:-.01em}
.iijs-title .em{color:var(--accent);font-weight:700}
.iijs-sub{margin-top:14px;font-size:20px;color:var(--ink-2);font-weight:400;line-height:1.5}
/* 수치 배너 */
.iijs-banner{display:flex;align-items:stretch;margin:0 var(--pad-x,56px);border:1.5px solid var(--line);border-radius:calc(var(--r-scale,1)*14px);overflow:hidden}
.iijs-stat{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px 12px}
.iijs-stat+.iijs-stat{border-left:1.5px solid var(--line)}
.iijs-val{font-family:var(--font-display);font-weight:700;font-size:54px;line-height:1;color:var(--accent-d);letter-spacing:-.03em}
.iijs-unit{margin-top:6px;font-size:22px;font-weight:500;color:var(--accent-d);letter-spacing:.02em}
/* 사진 + 게이지 래퍼 — overflow:clip 으로 사진은 가두되 게이지 텍스트는 clip-margin 만큼 허용 */
.iijs-photo-wrap{position:relative;margin-top:40px;width:100%;height:480px;overflow:clip;overflow-clip-margin:calc(var(--r-scale,1)*48px);line-height:0}
.iijs-photo-wrap img,.iijs-photo-wrap .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:0;display:block}
/* 이미지 없으면 배경 패널로 강등 — .ph는 baseCss에서 display:none!important로 숨겨지므로
   래퍼에 최소 높이를 두어 게이지만 표시 */
.iijs-photo-wrap.noimg{background:color-mix(in srgb,var(--accent) 8%,var(--bg));height:auto;min-height:320px;margin-top:40px}
/* pH 게이지 오버랩 — 수직 중심보다 약간 위(−46%)로 조정해 상단 수치 여백 확보 */
.iijs-gauge{position:absolute;top:50%;left:50%;transform:translate(-50%,-46%);width:min(55%,340px);aspect-ratio:1/1}
.iijs-gauge-ring{width:100%;height:100%}
.iijs-gauge-labels{position:absolute;bottom:12%;left:0;right:0;display:flex;justify-content:space-between;padding:0 8%}
.iijs-gauge-lbl{font-size:clamp(12px,1.8vw,18px);color:rgba(255,255,255,.85);text-shadow:0 1px 6px rgba(0,0,0,.6);font-weight:400}
.iijs-gauge-center{position:absolute;top:58%;left:50%;transform:translate(-50%,0);text-align:center;pointer-events:none}
.iijs-gauge-ph{display:block;font-family:var(--font-display);font-weight:700;font-size:clamp(20px,3.5vw,32px);color:#fff;line-height:1.1;text-shadow:0 2px 10px rgba(0,0,0,.65)}
.iijs-gauge-ph strong{font-weight:700;color:var(--accent-d)}
.iijs-gauge-type{display:block;margin-top:4px;font-size:clamp(11px,1.6vw,16px);color:var(--ink-2);font-weight:500}
/* 사진 없음 시 게이지 위치 재설정 */
.iijs-photo-wrap.noimg .iijs-gauge{position:relative;top:auto;left:auto;transform:none;margin:0 auto;padding:32px 0}
`,
  render: (d, { esc, richSafe }) => {
    const phValue = d.phValue ?? '5.5'
    const phLabel = d.phLabel ?? '약산성'
    const phMin   = d.phMin   ?? '산성'
    const phMax   = d.phMax   ?? '알칼리성'

    // 게이지 각도 계산: pH 0~14 → 게이지 반호 -90°(좌)~+90°(우) 매핑
    // 화살표 포인터는 반원 아래쪽 에서 값 위치를 가리킨다
    const numericPh = parseFloat(phValue.replace(/[^0-9.]/g, ''))
    const safePh    = isFinite(numericPh) ? Math.min(14, Math.max(0, numericPh)) : 5.5
    // -90deg(산성 끝) ~ +90deg(알칼리 끝) 범위. 5.5 → 약 -12.9deg
    const angleDeg  = ((safePh / 14) * 180) - 90
    const angleRad  = (angleDeg * Math.PI) / 180
    // 반경 44(SVG 100×100 기준, 중심 50,50)에서 화살표 기준점
    const r = 44
    const cx = 50 + r * Math.cos(angleRad - Math.PI / 2) // 반원 기준 보정
    const cy = 50 + r * Math.sin(angleRad - Math.PI / 2)
    // 화살표: 중심(50,50)에서 rim 방향으로 뻗는 선
    const ax2 = 50 + (r - 6) * Math.cos(angleRad - Math.PI / 2)
    const ay2 = 50 + (r - 6) * Math.sin(angleRad - Math.PI / 2)

    // 이미지 유무 판별
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    const gaugeBlock = `
  <div class="iijs-gauge" role="img" aria-label="pH ${esc(phValue)} ${esc(phLabel)} 게이지">
    <svg class="iijs-gauge-ring" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="iijs-g1" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%"   stop-color="var(--accent-d)" stop-opacity="0.9"/>
          <stop offset="35%"  stop-color="var(--accent)"   stop-opacity="0.85"/>
          <stop offset="65%"  stop-color="#b8d4a8"         stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#d0dfc8"         stop-opacity="0.5"/>
        </linearGradient>
        <clipPath id="iijs-half">
          <rect x="0" y="0" width="100" height="50"/>
        </clipPath>
      </defs>
      <!-- 반원 호: 상단 반원을 clipPath로 노출 -->
      <circle cx="50" cy="50" r="44" fill="url(#iijs-g1)" clip-path="url(#iijs-half)" opacity="0.22"/>
      <path d="M6,50 A44,44 0 0,1 94,50" fill="none" stroke="url(#iijs-g1)" stroke-width="8" stroke-linecap="round"/>
      <!-- 화살표 포인터 -->
      <line x1="50" y1="50" x2="${ax2.toFixed(2)}" y2="${ay2.toFixed(2)}"
            stroke="var(--accent-d)" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="3" fill="var(--accent-d)"/>
      <!-- 중앙 피벗 -->
      <circle cx="50" cy="50" r="3.6" fill="var(--accent-d)"/>
    </svg>
    <div class="iijs-gauge-labels">
      <span class="iijs-gauge-lbl">${esc(phMin)}</span>
      <span class="iijs-gauge-lbl">${esc(phMax)}</span>
    </div>
    <div class="iijs-gauge-center">
      <span class="iijs-gauge-ph">[<strong>${esc(phValue)}</strong>ph]</span>
      <span class="iijs-gauge-type">${esc(phLabel)}</span>
    </div>
  </div>`

    const statsHtml = d.stats
      .map(
        (s) => `
    <div class="iijs-stat">
      <span class="iijs-val">${esc(s.value)}</span>
      <span class="iijs-unit">${esc(s.unit)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="iijs">
  <div class="iijs-hd">
    <h2 class="iijs-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="iijs-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="iijs-banner">
    ${statsHtml}
  </div>
  <div class="iijs-photo-wrap${hasImg ? '' : ' noimg'}">
    ${media(d.image, 'iijs-photo', '성분 제품 사진')}
    ${gaugeBlock}
  </div>
</section>`
  },
})
