/** CALLOUT 아키타입: callout-chat-dark-problem
 *  흑배경 + 따옴표 인용 헤드 + 전폭 사진 + 좌우 교대 채팅 말풍선 공감 리스트
 *  + 3열 원인 카드(번호+이미지+라벨) + 가로선 전환 텍스트.
 *  340_문제제기_17.json 구조를 872px 데스크톱으로 재구성. 톤: dark / noimg-safe 이중 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const bubbleSchema = z.object({
  text: z.string().min(1),   // 채팅 말풍선 한 줄 카피 (순수 텍스트)
  side: z.enum(['left', 'right']),
})

const causeSchema = z.object({
  num: z.string().min(1),         // "01" "02" "03" 등
  label: z.string().min(1),       // 원인 라벨 (em 허용)
  image: z.string().optional(),   // 원인 카드 작은 이미지 (url)
})

const schema = z.object({
  /** 따옴표 인용 헤드 첫 줄 – 연한 색 서브 (em,br 허용) */
  subhead: z.string().min(1),
  /** 따옴표 인용 헤드 메인 – 더 크고 진한 (em,br 허용) */
  headline: z.string().min(1),
  /** 사진 영역 이미지 (url) – 없어도 붕괴하지 않는 강등 */
  heroImage: z.string().optional(),
  /** 채팅 말풍선 목록 (2~5개) */
  bubbles: z.array(bubbleSchema).min(2).max(5),
  /** 3열 원인 카드 (2~3개) */
  causes: z.array(causeSchema).min(2).max(3),
  /** 전환 본문 (em,br 허용) */
  transition: z.string().min(1),
  /** 전환 CTA 강조문 (em,br 허용) – optional */
  cta: z.string().optional(),
})
type Data = z.infer<typeof schema>

// 따옴표 SVG (inline – 개방/폐쇄 한 쌍, fill=currentColor)
const QUOTE_OPEN =
  '<svg class="cnkp-q" viewBox="0 0 46 40" fill="currentColor" aria-hidden="true"><path d="M0 40V24.4C0 10.8 8.2 2.6 24.6 0L26.8 4.4C19 6 13.8 10 13.2 16.6H21.4V40H0ZM24.6 40V24.4C24.6 10.8 32.8 2.6 49.2 0L51.4 4.4C43.6 6 38.4 10 37.8 16.6H46V40H24.6Z" transform="scale(0.88)"/></svg>'
const QUOTE_CLOSE =
  '<svg class="cnkp-q cnkp-q--close" viewBox="0 0 46 40" fill="currentColor" aria-hidden="true"><path d="M21.4 0V15.6C21.4 29.2 13.2 37.4-3.2 40L-5.4 35.6C2.4 34 7.6 30 8.2 23.4H0V0H21.4ZM46 0V15.6C46 29.2 37.8 37.4 21.4 40L19.2 35.6C27 34 32.2 30 32.8 23.4H24.6V0H46Z" transform="scale(0.88)"/></svg>'

// 말풍선 꼬리 SVG (왼쪽 아래 / 오른쪽 아래)
const TAIL_LEFT =
  '<svg class="cnkp-tail" viewBox="0 0 28 18" fill="currentColor" aria-hidden="true"><path d="M28 0 L0 18 L28 18 Z"/></svg>'
const TAIL_RIGHT =
  '<svg class="cnkp-tail cnkp-tail--r" viewBox="0 0 28 18" fill="currentColor" aria-hidden="true"><path d="M0 0 L28 18 L0 18 Z"/></svg>'

export const calloutChatDarkProblem = defineBlock<Data>({
  id: 'callout-chat-dark-problem',
  archetype: 'callout',
  styleTags: ['dark', 'empathy', 'problem', 'chat', 'noimg-safe'],
  imageSlots: 4,   // heroImage(1) + cause images(최대 3)
  describe:
    '흑배경 공감형 문제제기. 따옴표 인용 헤드 + 전폭 사진(강등 안전) + 좌우 교대 채팅 말풍선(보호자/고객 공감 대화 연출) + 3열 원인 카드(번호+이미지+라벨) + 가로선 전환 카피. 펫·뷰티·식품 등 나이·상황 변화 문제제기에 범용.',
  schema,
  css: `
/* ── 섹션 기반 ── */
.cnkp{background:#000;color:var(--ink);padding:72px 0 64px;word-break:keep-all}
.cnkp .em{color:var(--em-dark,#FFF7EA)}

/* ── 따옴표 헤드 ── */
.cnkp-head{padding:0 var(--pad-x,56px);text-align:center;position:relative}
.cnkp-q{width:38px;height:34px;color:#686868;vertical-align:middle;flex-shrink:0}
.cnkp-q--close{transform:scaleX(-1) scaleY(-1)}
.cnkp-subhead{font-family:var(--font-display,'Pretendard',sans-serif);font-weight:600;font-size:clamp(22px,3vw,30px);color:#989898;line-height:1.5;margin-bottom:10px}
.cnkp-headline{font-family:var(--font-display,'Pretendard',sans-serif);font-weight:600;font-size:clamp(28px,4vw,40px);color:#d5d5d5;line-height:1.5;margin-bottom:0}
.cnkp-quote-row{display:flex;align-items:flex-start;justify-content:center;gap:10px;margin-bottom:6px}
.cnkp-quote-row-close{display:flex;align-items:flex-end;justify-content:center;gap:10px;margin-top:14px}

/* ── 사진 영역 ── */
.cnkp-hero{margin:40px var(--pad-x,56px) 0;position:relative}
.cnkp-hero-img{width:100%;aspect-ratio:760/440;border-radius:var(--shape-photo,calc(var(--r-scale,1)*20px));overflow:hidden;background:#222}
.cnkp-hero-img img{width:100%;height:100%;object-fit:cover;display:block}
/* noimg-safe: 이미지 없을 때 .ph는 display:none — 자리 자체를 숨겨 레이아웃 유지 */
.cnkp-hero-img .ph{display:none!important}
.cnkp-hero--empty{display:none}

/* ── 채팅 말풍선 목록 ── */
.cnkp-bubbles{margin:36px var(--pad-x,56px) 0;display:flex;flex-direction:column;gap:18px}
.cnkp-bubble-row{display:flex;align-items:flex-end}
.cnkp-bubble-row--r{justify-content:flex-end}
.cnkp-pill{position:relative;display:inline-flex;align-items:center;padding:0 28px;height:56px;border-radius:999px;font-family:var(--font-body,'Pretendard',sans-serif);font-weight:500;font-size:clamp(15px,2vw,18px);white-space:nowrap;max-width:88%;line-height:1}
.cnkp-pill--l{background:#fff;color:#000}
.cnkp-pill--r{background:#b9b9b9;color:#000}
/* 꼬리 */
.cnkp-tail{position:absolute;bottom:-16px;left:24px;width:24px;height:14px;color:#fff}
.cnkp-tail--r{left:auto;right:24px;color:#b9b9b9}

/* ── 원인 카드 3열 ── */
.cnkp-causes{margin:40px var(--pad-x,56px) 0;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.cnkp-cause{background:#343434;border-radius:calc(var(--r-scale,1)*20px);padding:14px 14px 18px;display:flex;flex-direction:column;align-items:center;gap:0}
.cnkp-cause-img{width:100%;aspect-ratio:1/0.75;border-radius:calc(var(--r-scale,1)*12px);overflow:hidden;background:#222;margin-bottom:12px;flex-shrink:0}
.cnkp-cause-img img{width:100%;height:100%;object-fit:cover;display:block}
.cnkp-cause-img .ph{display:none!important}
/* noimg-safe: 이미지 없을 때 카드 이미지 영역 자체 숨김 */
.cnkp-cause-img--empty{display:none}
.cnkp-cause-num{font-family:var(--font-display,'Pretendard',sans-serif);font-weight:600;font-size:20px;color:#b9b9b9;letter-spacing:.02em;margin-bottom:6px}
.cnkp-cause-label{font-family:var(--font-body,'Pretendard',sans-serif);font-weight:500;font-size:16px;color:rgba(255,255,255,0.80);text-align:center;line-height:1.45}
.cnkp-cause-label .em{color:var(--em-dark,#FFF7EA)}

/* ── 화살표 구분자 ── */
.cnkp-arrow{text-align:center;margin-top:32px;color:#686868;font-size:28px;line-height:1}

/* ── 전환 텍스트 영역 ── */
.cnkp-transition{padding:36px var(--pad-x,56px) 0;text-align:center}
.cnkp-divider{width:100%;height:1px;background:#333;margin-bottom:28px}
.cnkp-trans-body{font-family:var(--font-display,'Pretendard',sans-serif);font-weight:500;font-size:clamp(20px,2.8vw,28px);color:#989898;line-height:1.7}
.cnkp-trans-body .em{color:var(--em-dark,#FFF7EA)}
.cnkp-trans-cta{margin-top:20px;font-family:var(--font-display,'Pretendard',sans-serif);font-weight:500;font-size:clamp(20px,2.8vw,28px);color:#fff;line-height:1.7}
.cnkp-trans-cta .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    // 히어로 이미지: url 있을 때만 섹션 노출
    const hasHero = typeof d.heroImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.heroImage.trim())

    // 원인 카드: 전 카드에 이미지 있을 때만 이미지 영역 렌더 (균일화 가드)
    const allCauseImgs = d.causes.every(
      (c) => typeof c.image === 'string' && /^(https?:\/\/|data:|\/)/.test((c.image ?? '').trim()),
    )

    return `
<section class="cnkp">

  <!-- 따옴표 인용 헤드 -->
  <div class="cnkp-head">
    <div class="cnkp-quote-row">${QUOTE_OPEN}<p class="cnkp-subhead">${richSafe(d.subhead)}</p></div>
    <p class="cnkp-headline">${richSafe(d.headline)}</p>
    <div class="cnkp-quote-row-close">${QUOTE_CLOSE}</div>
  </div>

  <!-- 사진 영역 (noimg-safe: 이미지 없으면 섹션 전체 숨김) -->
  ${hasHero ? `
  <div class="cnkp-hero">
    <div class="cnkp-hero-img">
      ${media(d.heroImage, '', '제품/상황 대표 이미지')}
    </div>
  </div>` : ''}

  <!-- 채팅 말풍선 목록 -->
  <div class="cnkp-bubbles">
    ${d.bubbles.map((b) => {
      const isRight = b.side === 'right'
      return `
    <div class="cnkp-bubble-row${isRight ? ' cnkp-bubble-row--r' : ''}">
      <div class="cnkp-pill ${isRight ? 'cnkp-pill--r' : 'cnkp-pill--l'}">
        ${esc(b.text)}
        ${isRight ? TAIL_RIGHT : TAIL_LEFT}
      </div>
    </div>`
    }).join('')}
  </div>

  <!-- 원인 카드 3열 -->
  <div class="cnkp-causes">
    ${d.causes.map((c) => `
    <div class="cnkp-cause">
      ${allCauseImgs ? `
      <div class="cnkp-cause-img">
        ${media(c.image, '', esc(c.label))}
      </div>` : ''}
      <p class="cnkp-cause-num">${esc(c.num)}</p>
      <p class="cnkp-cause-label">${richSafe(c.label)}</p>
    </div>`).join('')}
  </div>

  <!-- 화살표 -->
  <div class="cnkp-arrow" aria-hidden="true">&#8595;</div>

  <!-- 전환 텍스트 -->
  <div class="cnkp-transition">
    <div class="cnkp-divider" role="separator"></div>
    <p class="cnkp-trans-body">${richSafe(d.transition)}</p>
    ${d.cta ? `<p class="cnkp-trans-cta">${richSafe(d.cta)}</p>` : ''}
  </div>

</section>`
  },
})
