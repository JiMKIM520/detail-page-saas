/** BANNER 아키타입: banner-kinetic-duoscale
 *
 *  원본: 산지직송_감홍_사과주스_ 피그마 프레임 흡수.
 *  구조 장치: 동일 문구를 좌(소형 — Stage1) / 우(대형 — Stage2) 두 컬럼에
 *  나란히 세로로 N행 반복 적층해 스크롤 타이밍 차이를 유도하는 키네틱 타이포.
 *
 *  재구성 포인트:
 *  - 원본 고정 문구를 `phrase` 슬롯(zod)으로 추상화.
 *  - 폰트·색 전부 토큰 변수. 행 수(rows)는 8~16 범위 조정 가능.
 *  - 애니메이션: CSS @keyframes scroll-up-sm / scroll-up-lg 로
 *    좌(소) 컬럼을 우(대) 컬럼보다 약간 빠르게 흘려 타이밍 차이 구현.
 *  - 이미지 슬롯 없음(순수 타이포그래피). noimg-safe 불필요.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  phrase: z.string().min(1),            // 반복 노출될 키네틱 문구 (순수 텍스트)
  rows: z.number().int().min(8).max(16).optional(), // 반복 행 수 (기본 13)
  label: z.string().optional(),         // 좌상단 소형 라벨 (예: "PRODUCT" / "신상품")
  subline: z.string().optional(),       // 섹션 아래 부가 한 줄 설명
})
type Data = z.infer<typeof schema>

export const bannerKineticDuoscale = defineBlock<Data>({
  id: 'banner-kinetic-duoscale',
  archetype: 'banner',
  styleTags: ['light', 'kinetic', 'editorial', 'typographic'],
  imageSlots: 0,
  describe:
    '키네틱 타이포그래피 배너. 동일 문구를 좌(소형 35px)·우(대형 70px) 두 컬럼에 N행 반복 적층하고 스크롤 속도 차이를 CSS 애니메이션으로 유도해 타이밍 차이 시각 효과를 만든다. 상품명·브랜드명·캐치프레이즈 반복 노출에 적합.',
  schema,
  css: `
.bpwh{position:relative;overflow:hidden;background:var(--bg);color:var(--ink);padding:0 0 0;user-select:none}
.bpwh-label{display:block;padding:20px var(--pad-x,56px) 12px;font-family:var(--font-display);font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;z-index:4}
.bpwh-stage{display:flex;width:100%;overflow:hidden;height:clamp(300px,40vw,580px)}
/* 페이드 마스크 (위/아래) */
.bpwh-stage::before,.bpwh-stage::after{content:'';position:absolute;left:0;width:100%;height:18%;z-index:3;pointer-events:none}
.bpwh-stage::before{top:0;background:linear-gradient(to bottom,var(--bg) 0%,transparent 100%)}
.bpwh-stage::after{bottom:0;background:linear-gradient(to top,var(--bg) 0%,transparent 100%)}
/* 두 컬럼: 좌 35% / 우 65% — 대형 텍스트가 충분한 폭을 확보 */
.bpwh-col{min-width:0;display:flex;flex-direction:column;overflow:hidden;position:relative}
.bpwh-col-sm{flex:0 0 35%;border-right:1px solid var(--line)}
.bpwh-col-lg{flex:0 0 65%}
/* 스크롤 트랙 — 2배 높이(무한 루프용) */
.bpwh-track{display:flex;flex-direction:column;width:100%}
.bpwh-track-sm{animation:bpwh-scroll-sm 14s linear infinite}
.bpwh-track-lg{animation:bpwh-scroll-lg 18s linear infinite}
/* 행 단위: 양 열 동일 높이로 베이스라인 통일 */
.bpwh-row{display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line);flex-shrink:0;height:clamp(70px,9vw,132px)}
.bpwh-row-sm{padding:0 calc(var(--r-scale,1)*16px)}
.bpwh-row-lg{padding:0 calc(var(--r-scale,1)*20px)}
/* 문구 */
.bpwh-text-sm{font-family:var(--font-display);font-size:clamp(13px,2.2vw,28px);font-weight:600;color:var(--ink);letter-spacing:-.01em;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;line-height:1.2}
.bpwh-text-lg{font-family:var(--font-display);font-size:clamp(22px,4.1vw,56px);font-weight:600;color:var(--ink);letter-spacing:-.02em;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;line-height:1.15}
/* 구분선 오버레이 — 수평 중앙 */
.bpwh-midline{position:absolute;top:50%;left:0;width:100%;height:1px;background:var(--accent);opacity:.4;z-index:4;pointer-events:none;transform:translateY(-50%)}
/* 서브라인 */
.bpwh-sub{text-align:center;padding:16px var(--pad-x,56px) 28px;font-size:13px;font-weight:500;color:var(--muted);letter-spacing:.06em}
/* 애니메이션: 소형 컬럼은 빠르게, 대형 컬럼은 느리게 */
@keyframes bpwh-scroll-sm{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}
@keyframes bpwh-scroll-lg{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}
/* 접근성: 모션 감소 설정 시 애니메이션 정지 */
@media(prefers-reduced-motion:reduce){
  .bpwh-track-sm,.bpwh-track-lg{animation:none}
}
`,
  render: (d, { esc }) => {
    const count = d.rows ?? 13
    // 무한 루프용: 동일 행 블록을 2배(×2) 연속 배치해 이음매 없이 순환
    const phrase = esc(d.phrase)

    const smRows = Array.from(
      { length: count * 2 },
      () => `<div class="bpwh-row bpwh-row-sm"><span class="bpwh-text-sm">${phrase}</span></div>`,
    ).join('')

    const lgRows = Array.from(
      { length: count * 2 },
      () => `<div class="bpwh-row bpwh-row-lg"><span class="bpwh-text-lg">${phrase}</span></div>`,
    ).join('')

    return `
<section class="bpwh">
  ${d.label ? `<div class="bpwh-label">${esc(d.label)}</div>` : ''}
  <div class="bpwh-stage">
    <div class="bpwh-col bpwh-col-sm">
      <div class="bpwh-track bpwh-track-sm">${smRows}</div>
    </div>
    <div class="bpwh-col bpwh-col-lg">
      <div class="bpwh-track bpwh-track-lg">${lgRows}</div>
    </div>
    <div class="bpwh-midline" aria-hidden="true"></div>
  </div>
  ${d.subline ? `<p class="bpwh-sub">${esc(d.subline)}</p>` : ''}
</section>`
  },
})
