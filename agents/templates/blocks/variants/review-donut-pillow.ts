/** REVIEW 아키타입: review-donut-pillow
 *  원본 프레임: 098_후기_06.json
 *  구조: 상단 타이틀 + 그라디언트 필로우 배지(총 만족도) + 원형 도넛 그래프 3개 행 + 전면 IMG
 *  핵심 장치: SVG conic-gradient 도넛 3개로 항목별 만족도 수치를 시각화하고,
 *            그라디언트 필 캡슐 배지로 종합 만족도를 1차 임팩트로 강조하는 데이터 후기 섹션.
 *  이미지 강등(noimg-safe): 하단 전면 이미지 부재 시 이미지 영역을 숨기고 레이아웃 붕괴 없이 렌더. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const donutItem = z.object({
  pct: z.number().int().min(1).max(100),        // 도넛 채움 비율 (1~100)
  label: z.string().min(1),                      // 항목명 (예: "저자극 만족도")
  color: z.string().optional(),                  // 도넛 색 — 미지정 시 accent 토큰
})

const schema = z.object({
  title: z.string().min(1),                      // 섹션 타이틀 (em/br 허용)
  badgeText: z.string().min(1),                  // 필로우 배지 문구 (예: "실 사용 만족도 98%")
  subtitle: z.string().optional(),               // 배지 아래 보조 설명
  donuts: z.array(donutItem).min(2).max(4),      // 도넛 항목 2~4개 (브리프 근거 시만)
  disclaimer: z.string().optional(),             // 하단 주의문 (* 개인 차이 등)
  image: z.string().optional(),                  // 하단 전면 이미지 (url)
})
type Data = z.infer<typeof schema>

/** SVG 도넛: var(--line) 트랙 위 var(--accent) 호를 pct% 채움.
 *  linearGradient는 SVG defs 내에서 CSS 변수를 해석 못해 투명 렌더 발생 →
 *  stroke 속성에 CSS 변수를 직접 기재해 토큰이 항상 정상 해석되도록 수정. */
function donutSvg(pct: number, color: string, _idx: number): string {
  const circ = 2 * Math.PI * 44 // r=44, circumference ≈ 276.46
  const dash = (pct / 100) * circ
  const gap = circ - dash
  // color가 hex/rgb 리터럴이면 그대로, CSS 변수(var(--*))면 직접 stroke에 기재해야 해석 보장
  const arcStroke = color
  return `
<svg class="rpqh-donut-svg" viewBox="0 0 100 100" aria-hidden="true">
  <!-- 트랙: var(--line)으로 명시해 배경 대비 확보 -->
  <circle cx="50" cy="50" r="44" fill="none" stroke="var(--line)" stroke-width="10"/>
  <!-- 진행 호: CSS 변수는 linearGradient defs 안에서 해석 불가 → stroke 직접 적용 -->
  <circle cx="50" cy="50" r="44" fill="none"
    stroke="${arcStroke}"
    stroke-width="10"
    stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
    stroke-linecap="round"
    transform="rotate(-90 50 50)"/>
</svg>`.trim()
}

export const reviewDonutPillow = defineBlock<Data>({
  id: 'review-donut-pillow',
  archetype: 'review',
  styleTags: ['light', 'data', 'stats', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '체험단 만족도 데이터 후기 섹션. 그라디언트 필로우 배지로 종합 만족도를 크게 선언하고, SVG 도넛 그래프 2~4개 행으로 항목별 수치를 시각화. 하단 전체폭 사진 슬롯(선택). 라이트 배경, 뷰티·식품·헬스케어에 적합.',
  schema,
  css: `
.rpqh{background:var(--bg);color:var(--ink);padding:60px 0 0;text-align:center}
/* ── 타이틀 영역 ── */
.rpqh-title-wrap{padding:0 var(--pad-x,56px) 32px}
.rpqh-title{font-family:var(--font-display);font-weight:800;font-size:54px;line-height:1.1;letter-spacing:-.02em;color:var(--ink)}
.rpqh-title .em{color:var(--accent-d)}
/* ── 그라디언트 필로우 배지 ── */
.rpqh-badge{display:inline-block;background:linear-gradient(105deg,var(--accent-d),var(--accent));border-radius:999px;padding:14px 40px;margin-bottom:16px}
.rpqh-badge-text{font-family:var(--font-display);font-weight:800;font-size:32px;color:#fff;letter-spacing:-.01em;line-height:1}
/* ── 구분선 + 소제목 ── */
.rpqh-divider{width:120px;height:1px;background:var(--line);margin:0 auto 14px}
.rpqh-subtitle{font-family:var(--font-body);font-size:17px;font-weight:400;color:var(--ink-2);line-height:1.55}
/* ── 도넛 행 ── */
.rpqh-donuts{display:flex;justify-content:center;gap:0;padding:36px var(--pad-x,56px) 0;flex-wrap:wrap}
.rpqh-donut-item{flex:1 1 0;min-width:140px;max-width:240px;display:flex;flex-direction:column;align-items:center;gap:0}
.rpqh-donut-ring{position:relative;width:min(100%,180px);aspect-ratio:1/1}
.rpqh-donut-svg{width:100%;height:100%;display:block}
/* 도넛 중앙 수치 — cqw 대신 고정 단위로 클리핑 방지 */
.rpqh-donut-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.rpqh-donut-val{font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--accent-d);line-height:1;letter-spacing:-.03em}
.rpqh-donut-pct{font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--accent-d);align-self:flex-start;margin-top:6px}
/* 도넛 라벨 */
.rpqh-donut-label{margin-top:14px;font-family:var(--font-body);font-weight:600;font-size:17px;color:var(--ink);line-height:1.4;white-space:pre-line;text-align:center}
/* ── 주의문 ── */
.rpqh-disclaimer{margin-top:20px;padding:0 var(--pad-x,56px) 0;font-size:13px;color:var(--muted);font-weight:300;line-height:1.5}
/* ── 하단 전면 이미지 ── */
.rpqh-photo-wrap{margin-top:40px;width:100%}
.rpqh-photo{width:100%;aspect-ratio:860/640;object-fit:cover;border-radius:var(--shape-photo, 0px);display:block}
/* noimg-safe: 이미지 없으면 wrap 자체를 숨겨 여백 방지 */
.rpqh-photo-wrap:has(.ph){display:none}
`,
  render: (d, { esc, richSafe }) => {
    // 도넛 색: 슬롯 color → accent 토큰 (CSS 변수 기본값)
    const donutColor = (item: { color?: string }) =>
      item.color ? item.color : 'var(--accent)'

    const donutsHtml = d.donuts
      .map((item, i) => {
        const numStr = String(item.pct)
        return `
    <div class="rpqh-donut-item">
      <div class="rpqh-donut-ring">
        ${donutSvg(item.pct, donutColor(item), i)}
        <div class="rpqh-donut-num">
          <span class="rpqh-donut-val">${esc(numStr)}</span><span class="rpqh-donut-pct">%</span>
        </div>
      </div>
      <p class="rpqh-donut-label">${esc(item.label)}</p>
    </div>`
      })
      .join('')

    return `
<section class="rpqh">
  <div class="rpqh-title-wrap">
    <h2 class="disp rpqh-title">${richSafe(d.title)}</h2>
    <div class="rpqh-badge"><span class="rpqh-badge-text">${esc(d.badgeText)}</span></div>
    <div class="rpqh-divider"></div>
    ${d.subtitle ? `<p class="rpqh-subtitle">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="rpqh-donuts">${donutsHtml}
  </div>
  ${d.disclaimer ? `<p class="rpqh-disclaimer">${esc(d.disclaimer)}</p>` : ''}
  <div class="rpqh-photo-wrap">${media(d.image, 'rpqh-photo', '체험단 후기 이미지')}</div>
</section>`
  },
})
