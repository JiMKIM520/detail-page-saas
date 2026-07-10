/** REASON 아키타입: reason-dot-connector
 *  피그마 058_포인트_구성_페이지_28 구조 흡수 재구성.
 *  회색 배경 / 좌측 제품 이미지 2장 레이어드 스택 / 우측 헤더 + 점(circle 뱃지)·가로선(connector line)·라벨·설명 4행 목록.
 *  핵심 장치: 흰 원형 도트와 수평 실선이 이미지 영역과 텍스트 행을 연결하는 커넥터 패턴. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 강조 캐치프레이즈 (em,br) */
  headline: z.string().min(1),
  /** 헤드라인 바로 아래 한 줄 부제 */
  subheading: z.string().optional(),
  /** 전면 제품 이미지 (url) — 좌측 스택의 앞에 위치 */
  imageFront: z.string().optional(),
  /** 후면/보조 제품 이미지 (url) — 좌측 스택의 뒤에 위치 */
  imageBack: z.string().optional(),
  /** 커넥터 행 목록 — 각 행: 점·선·라벨·설명 */
  points: z
    .array(
      z.object({
        /** 항목 라벨 (em 허용) */
        label: z.string().min(1),
        /** 항목 설명 (em,br 허용) */
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const reasonDotConnector = defineBlock<Data>({
  id: 'reason-dot-connector',
  archetype: 'reason',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '이유·포인트 설명 블록. 회색 섹션 배경 + 좌측 제품 이미지 2장 레이어드 스택 + 우측 헤드라인·부제 + 흰 원 도트-수평선 커넥터로 연결된 라벨·설명 행 목록(2~6개). 뷰티·생활용품 성분/효능 어필에 적합.',
  schema,
  css: `
.rmfp{background:var(--bg);padding:60px var(--pad-x,56px) 64px;position:relative}
/* 투-컬럼 레이아웃 */
.rmfp-inner{display:flex;align-items:flex-start;gap:48px}
/* 좌측: 이미지 스택 */
.rmfp-stack{position:relative;flex:0 0 46%;min-height:520px}
.rmfp-img-back{position:absolute;top:0;left:0;width:64%;aspect-ratio:5/7;border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));overflow:hidden;background:color-mix(in srgb,var(--ink) 8%,transparent);box-shadow:0 8px 28px -10px rgba(0,0,0,.18)}
.rmfp-img-back img,.rmfp-img-back .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.rmfp-img-front{position:absolute;bottom:0;right:0;width:70%;aspect-ratio:5/7;border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));overflow:hidden;background:color-mix(in srgb,var(--ink) 12%,transparent);box-shadow:0 16px 40px -14px rgba(0,0,0,.28)}
.rmfp-img-front img,.rmfp-img-front .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* 이미지 없을 때 스택 자체를 숨기고 우측 텍스트가 전체 너비 차지 */
.rmfp-stack.no-img{display:none}
.rmfp-stack.no-img ~ .rmfp-right{flex:1 1 100%}
/* 우측: 텍스트 영역 */
.rmfp-right{flex:1;display:flex;flex-direction:column;padding-top:4px}
.rmfp-headline{font-family:var(--font-display);font-weight:700;font-size:clamp(22px,3.2vw,38px);color:var(--ink);line-height:1.22;letter-spacing:-.015em}
.rmfp-headline .em{color:var(--accent)}
.rmfp-subheading{margin-top:10px;font-size:16px;font-weight:500;color:var(--ink-2);line-height:1.6}
/* 포인트 목록 */
.rmfp-points{margin-top:32px;display:flex;flex-direction:column;gap:0}
/* 커넥터 행 */
.rmfp-row{display:flex;align-items:flex-start;gap:0;padding:16px 0}
.rmfp-row+.rmfp-row{border-top:1px solid var(--line)}
/* 도트+선 영역 */
.rmfp-connector{display:flex;align-items:center;flex:0 0 auto;padding-top:3px;gap:0;margin-right:16px}
.rmfp-dot{width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid var(--line);flex-shrink:0;box-shadow:0 2px 6px -2px rgba(0,0,0,.14)}
.rmfp-line{width:56px;height:1px;background:var(--ink-2);opacity:.3;flex-shrink:0}
/* 텍스트 */
.rmfp-body{flex:1}
.rmfp-label{font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--ink);line-height:1.3;margin-bottom:5px}
.rmfp-label .em{color:var(--accent)}
.rmfp-text{font-size:15px;font-weight:400;color:var(--ink-2);line-height:1.7}
.rmfp-text .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    const hasFront = typeof d.imageFront === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageFront.trim())
    const hasBack  = typeof d.imageBack  === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageBack.trim())
    const hasAnyImg = hasFront || hasBack

    return `
<section class="rmfp">
  <div class="rmfp-inner">
    <div class="rmfp-stack${hasAnyImg ? '' : ' no-img'}">
      <div class="rmfp-img-back">${media(d.imageBack, '', '제품 후면 이미지')}</div>
      <div class="rmfp-img-front">${media(d.imageFront, '', '제품 전면 이미지')}</div>
    </div>
    <div class="rmfp-right">
      <h2 class="rmfp-headline">${richSafe(d.headline)}</h2>
      ${d.subheading ? `<p class="rmfp-subheading">${esc(d.subheading)}</p>` : ''}
      <div class="rmfp-points">
        ${d.points.map((p) => `
        <div class="rmfp-row">
          <div class="rmfp-connector">
            <span class="rmfp-dot"></span>
            <span class="rmfp-line"></span>
          </div>
          <div class="rmfp-body">
            <div class="rmfp-label">${richSafe(p.label)}</div>
            <div class="rmfp-text">${richSafe(p.text)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
  },
})
