/** HERO 아키타입: hero-bubble-stack
 *  원본: 231_인트로_42.json (860×1345 모바일 → 872px 데스크톱으로 확장)
 *
 *  구조: 전체 배경 이미지 위에 상단 2줄 타이틀(첫 줄 텍스트 + 둘째 줄 솔리드컬러 텍스트박스)
 *        + 부제 + 우측 정렬 3개 원형 버블 카드(투명도 단계별) 세로 스택.
 *  핵심 장치:
 *    - 첫 줄: 순수 텍스트(대형, 다크)
 *    - 둘째 줄: accent 솔리드 배경 텍스트박스 위 흰 텍스트 (피그마 "텍스트박스" 프레임)
 *    - 원형 버블 3개 우측 세로 스택 — 위·아래 0.80, 중간 0.60 투명도
 *    - 다크 배경(사진) 위 richSafe: .em{color:var(--em-dark,#FFF7EA)} 스코프 오버라이드
 *    - noimg-safe: 배경 이미지 없을 시 brand 단색 강등
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const bubbleSchema = z.object({
  label: z.string().min(1),         // 버블 상단 라벨 (예: "가려움 감소")
  value: z.string().min(1),         // 큰 수치 또는 인증명 (예: "89%", "EWG")
  sublabel: z.string().optional(),  // 버블 하단 보조 라벨 (예: "그린 등급") — 브리프 근거 시만
})

const schema = z.object({
  titleLine1: z.string().min(1),              // 텍스트박스 위 첫 줄 (em,br 허용)
  titleLine2: z.string().min(1),              // 솔리드 텍스트박스 라인 (em 허용)
  subtitle: z.string().optional(),            // 타이틀 아래 부제
  bgImage: z.string().optional(),             // 전체 배경 이미지 (url)
  bubbles: z.array(bubbleSchema).min(1).max(4), // 우측 원형 버블 카드 1~4개
})
type Data = z.infer<typeof schema>

/** 버블별 투명도 — 원본 패턴: top=0.80, mid=0.60, rest=0.80 */
function bubbleOpacity(i: number, total: number): number {
  if (total === 1) return 0.8
  if (total === 2) return i === 0 ? 0.8 : 0.6
  // 3개 이상: 중간 인덱스가 0.60, 나머지 0.80
  const midIdx = Math.floor(total / 2)
  return i === midIdx ? 0.6 : 0.8
}

export const heroBubbleStack = defineBlock<Data>({
  id: 'hero-bubble-stack',
  archetype: 'hero',
  // noimg-safe: bgImage 없을 때 brand 단색으로 강등 렌더 (레이아웃 붕괴 없음)
  styleTags: ['dark', 'photo', 'stats', 'beauty', 'health', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크 전면 배경 이미지 히어로. 상단 2줄 타이틀(첫 줄 텍스트 + 둘째 줄 accent 솔리드 텍스트박스) + 부제 + 우측 원형 버블 카드 1~4개 세로 스택으로 핵심 수치/인증 강조. 뷰티·헬스·수치 임팩트에 적합.',
  schema,
  css: `
.hgyz{position:relative;width:100%;min-height:600px;padding:52px var(--pad-x,56px) 56px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-start;overflow:hidden;background:var(--brand)}
/* 배경 이미지 레이어 */
.hgyz-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;z-index:0;display:block}
.hgyz-bg.ph{background:var(--brand);display:block}
/* 오버레이 — 텍스트 가독성 */
.hgyz-overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,0,0,.38) 0%,rgba(0,0,0,.15) 60%,rgba(0,0,0,.55) 100%);z-index:1;pointer-events:none}
/* 컨텐츠 레이어 */
.hgyz-body{position:relative;z-index:2;display:flex;flex-direction:column;gap:0;max-width:56%}
/* 타이틀 영역 */
.hgyz-title-wrap{display:flex;flex-direction:column;gap:0;align-items:flex-start}
.hgyz-line1{font-family:var(--font-display);font-weight:600;font-size:clamp(36px,5.5vw,60px);color:#ffffff;line-height:1.18;letter-spacing:-.02em;text-shadow:0 2px 12px rgba(0,0,0,.35)}
.hgyz-line1 .em{color:var(--em-dark,#FFF7EA)}
.hgyz-textbox{display:inline-block;background:var(--accent);padding:6px 20px 8px;border-radius:calc(var(--r-scale,1)*6px);margin-top:6px}
.hgyz-line2{font-family:var(--font-display);font-weight:700;font-size:clamp(38px,5.8vw,64px);color:#ffffff;line-height:1.15;letter-spacing:-.025em}
.hgyz-line2 .em{color:var(--em-dark,#FFF7EA)}
.hgyz-subtitle{margin-top:18px;font-family:var(--font-body);font-weight:500;font-size:clamp(15px,1.9vw,20px);color:rgba(255,255,255,.88);line-height:1.55;text-shadow:0 1px 6px rgba(0,0,0,.3)}
/* 버블 스택 — 우측 절대 배치, 상하 중앙, 컨테이너 내 잘림 방지 */
.hgyz-bubbles{position:absolute;right:20px;top:50%;transform:translateY(-50%);z-index:2;display:flex;flex-direction:column;gap:10px;align-items:center;max-height:calc(100% - 40px);overflow:visible}
.hgyz-bubble{width:clamp(100px,12vw,140px);height:clamp(100px,12vw,140px);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;padding:10px;box-sizing:border-box;flex-shrink:0}
.hgyz-bubble-label{font-family:var(--font-body);font-weight:600;font-size:clamp(10px,1.2vw,13px);color:#ffffff;line-height:1.3;letter-spacing:.01em}
.hgyz-bubble-value{font-family:var(--font-display);font-weight:700;font-size:clamp(18px,2.6vw,32px);color:#ffffff;line-height:1.1;letter-spacing:-.02em}
.hgyz-bubble-sublabel{font-family:var(--font-body);font-weight:600;font-size:clamp(9px,1.1vw,12px);color:rgba(255,255,255,.92);line-height:1.3}
/* em 다크 스코프 오버라이드 (규약 필수) */
.hgyz .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const total = d.bubbles.length
    const bubbleHtml = d.bubbles
      .map((b, i) => {
        const opacity = bubbleOpacity(i, total)
        // accent 색 기반 rgba — CSS custom property는 rgba()에서 직접 연산 불가이므로
        // accent 대신 brand 계열 색상을 opacity로 표현 (원본: #0b79d6@opacity)
        const bg = `rgba(var(--accent-rgb,11,121,214),${opacity})`
        return `<div class="hgyz-bubble" style="background:${bg};backdrop-filter:blur(2px)">
          <span class="hgyz-bubble-label">${esc(b.label)}</span>
          <span class="hgyz-bubble-value">${esc(b.value)}</span>
          ${b.sublabel ? `<span class="hgyz-bubble-sublabel">${esc(b.sublabel)}</span>` : ''}
        </div>`
      })
      .join('\n')

    // bgImage 없을 때: .ph 클래스로 brand 단색 강등 (noimg-safe)
    const bgLayer = d.bgImage
      ? `<img class="hgyz-bg" src="${esc(d.bgImage)}" alt="" aria-hidden="true">`
      : `<div class="hgyz-bg ph" aria-hidden="true"></div>`

    return `
<section class="hgyz">
  ${bgLayer}
  <div class="hgyz-overlay" aria-hidden="true"></div>
  <div class="hgyz-body">
    <div class="hgyz-title-wrap">
      <span class="hgyz-line1">${richSafe(d.titleLine1)}</span>
      <span class="hgyz-textbox">
        <span class="hgyz-line2">${richSafe(d.titleLine2)}</span>
      </span>
    </div>
    ${d.subtitle ? `<p class="hgyz-subtitle">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="hgyz-bubbles" aria-label="주요 수치">
    ${bubbleHtml}
  </div>
</section>`
  },
})
