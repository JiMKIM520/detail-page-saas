/** REVIEW 아키타입: review-kpi-bubble-trio
 *  피그마 342_후기_15 재구성.
 *  구조: 라틴 레이블 + 슬로건 헤더 → 다크 KPI 평점박스(좌우 2분할 세로선) →
 *        말풍선 리뷰 카드 3행(핵심 인용 오버레이 프레임 중첩) → 하단 전폭 이미지.
 *  핵심 장치: 각 말풍선 상단에 '확대 인용 오버레이' (강조 한 줄 오렌지 + 결과 문장 세미볼드)를
 *             카드 바깥으로 돌출시켜 시선을 먼저 낚는다.
 *  noimg-safe: 하단 이미지 없어도 레이아웃 무너지지 않음.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 스키마 ────────────────────────────────────────────────────
const kpiSchema = z.object({
  label: z.string().min(1),       // "구매 평점" / "재구매 의사"
  value: z.string().min(1),       // "4.9점" / "98%"
  basis: z.string().optional(),   // "5점 만점" / "3,218개 리뷰 기준"
})

const reviewCardSchema = z.object({
  quoteHeadline: z.string().min(1),   // 확대 오버레이 상단: 핵심 인용 한 줄 (em 허용)
  quoteResult:   z.string().min(1),   // 확대 오버레이 하단: 결과/증거 문장
  fullText:      z.string().min(1),   // 말풍선 본문 전체 (em 허용)
  reviewer:      z.string().optional(), // "김**님 · 17살 말티즈 보호자"
})

const schema = z.object({
  latinLabel: z.string().optional(),   // 영문 소형 레이블 (예: "real review")
  title:      z.string().min(1),       // 슬로건 헤더 (em/br 허용)
  subtitle:   z.string().optional(),   // 헤더 아래 부제 (선택)
  kpiLeft:    kpiSchema,
  kpiRight:   kpiSchema,
  reviews:    z.array(reviewCardSchema).min(1).max(3),
  image:      z.string().optional(),   // 하단 전폭 이미지 (url)
  imageAlt:   z.string().optional(),
})

type Data = z.infer<typeof schema>

// ── 변형 ──────────────────────────────────────────────────────
export const reviewKpiBubbleTrio = defineBlock<Data>({
  id: 'review-kpi-bubble-trio',
  archetype: 'review',
  styleTags: ['light', 'warm', 'food', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '고객 리뷰 섹션. 다크 KPI 박스(좌우 평점/재구매율 2분할) + 말풍선 카드 최대 3개(각 카드 위에 확대 인용 오버레이 돌출) + 선택적 하단 전폭 이미지. 사회적 증거를 숫자+말풍선 이중 레이어로 강조.',

  schema,

  css: `
/* ── 섹션 래퍼 ─────────────────────────────────────────── */
.rzkg{background:var(--bg);padding:64px 0 0;color:var(--ink)}

/* ── 헤더 영역 ─────────────────────────────────────────── */
.rzkg-hd{padding:0 var(--pad-x,56px) 40px;text-align:center}
.rzkg-latin{display:block;font-family:var(--font-lat);font-size:52px;font-weight:600;color:var(--accent);letter-spacing:-.01em;line-height:1;margin-bottom:6px}
.rzkg-title{font-size:22px;font-weight:700;color:var(--accent);line-height:1.45}
.rzkg-title .em{color:var(--accent)}
.rzkg-sub{margin-top:10px;font-size:15px;font-weight:400;color:var(--ink-2);line-height:1.6}

/* ── KPI 평점박스 (다크) ───────────────────────────────── */
.rzkg-kpi{margin:0 var(--pad-x,56px);background:var(--brand);border-radius:calc(var(--r-scale,1)*20px);display:flex;align-items:stretch;position:relative;overflow:hidden}
.rzkg-kpi-half{flex:1;padding:28px 24px 24px;text-align:center}
.rzkg-kpi-half + .rzkg-kpi-half::before{content:'';position:absolute;left:50%;top:18%;bottom:18%;width:1px;background:rgba(255,255,255,.18)}
.rzkg-kpi-label{font-size:15px;font-weight:800;color:#ffffff;letter-spacing:.01em;margin-bottom:4px}
.rzkg-kpi-value{font-size:48px;font-weight:700;color:var(--accent);line-height:1.05;font-family:var(--font-display)}
.rzkg-kpi-basis{margin-top:4px;font-size:11px;font-weight:500;color:rgba(255,255,255,.55)}
/* 다크 섹션 em 오버라이드 */
.rzkg-kpi .em{color:var(--em-dark,#FFF7EA)}

/* ── 리뷰 카드 목록 ────────────────────────────────────── */
.rzkg-list{margin-top:36px;padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:44px}

/* ── 개별 카드 (오버레이 + 말풍선 + 꼬리) ─────────────── */
.rzkg-card{position:relative;padding-top:52px}

/* 확대 인용 오버레이: 말풍선 상단에 돌출 */
.rzkg-overlay{position:absolute;top:0;left:50%;transform:translateX(-50%);width:calc(100% - 16px);background:var(--paper);border-radius:calc(var(--r-scale,1)*10px);padding:10px 20px 12px;z-index:2;box-shadow:0 4px 14px -4px rgba(42,33,24,.12)}
.rzkg-overlay-q{font-size:15px;font-weight:700;color:var(--accent);text-align:center;line-height:1.3}
.rzkg-overlay-q .em{color:var(--accent)}
.rzkg-overlay-r{margin-top:3px;font-size:13px;font-weight:600;color:var(--ink);text-align:center;line-height:1.4}

/* 말풍선 본체 */
.rzkg-bubble{background:var(--paper);border-radius:calc(var(--r-scale,1)*18px);padding:54px 28px 22px;position:relative}
.rzkg-bubble-text{font-size:14px;color:var(--ink-2);line-height:1.75;text-align:center}
.rzkg-bubble-text .em{color:var(--accent);font-weight:700}
.rzkg-meta{margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:3px}
.rzkg-stars{color:#ffc935;font-size:15px;letter-spacing:1px}
.rzkg-reviewer{font-size:12px;color:var(--muted);font-weight:500}

/* 꼬리 삼각형 — 카드 1,3번(왼쪽), 2번(오른쪽) 교차 */
.rzkg-tail{height:28px;display:flex}
.rzkg-tail.left{justify-content:flex-start;padding-left:40px}
.rzkg-tail.right{justify-content:flex-end;padding-right:40px}
.rzkg-tail svg{display:block;width:28px;height:28px}

/* ── 하단 이미지 ────────────────────────────────────────── */
.rzkg-img-wrap{margin-top:44px}
.rzkg-img-wrap img,.rzkg-img-wrap .ph{width:100%;height:auto;aspect-ratio:860/460;object-fit:cover;display:block;border-radius:0;max-height:480px}
`,

  render: (d, { esc, richSafe }) => {
    // 꼬리 삼각형 SVG (fill 인라인 — CSS color 토큰 미도달 영역)
    const tailLeft = `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 0 L24 0 L4 28 Z" fill="var(--paper)"/></svg>`
    const tailRight = `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 0 L24 0 L24 28 Z" fill="var(--paper)"/></svg>`

    const cards = d.reviews.map((r, i) => {
      const tailSide = i % 2 === 1 ? 'right' : 'left'
      const tailSvg  = i % 2 === 1 ? tailRight : tailLeft
      return `
  <div class="rzkg-card">
    <div class="rzkg-overlay">
      <p class="rzkg-overlay-q">${richSafe(r.quoteHeadline)}</p>
      <p class="rzkg-overlay-r">${esc(r.quoteResult)}</p>
    </div>
    <div class="rzkg-bubble">
      <p class="rzkg-bubble-text">${richSafe(r.fullText)}</p>
      <div class="rzkg-meta">
        <span class="rzkg-stars">★★★★★</span>
        ${r.reviewer ? `<span class="rzkg-reviewer">${esc(r.reviewer)}</span>` : ''}
      </div>
    </div>
    <div class="rzkg-tail ${tailSide}">${tailSvg}</div>
  </div>`
    }).join('')

    return `
<section class="rzkg">
  <div class="rzkg-hd">
    ${d.latinLabel ? `<span class="rzkg-latin">${esc(d.latinLabel)}</span>` : ''}
    <h2 class="rzkg-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="rzkg-sub">${esc(d.subtitle)}</p>` : ''}
  </div>

  <div class="rzkg-kpi">
    <div class="rzkg-kpi-half">
      <p class="rzkg-kpi-label">${esc(d.kpiLeft.label)}</p>
      <p class="rzkg-kpi-value">${esc(d.kpiLeft.value)}</p>
      ${d.kpiLeft.basis ? `<p class="rzkg-kpi-basis">${esc(d.kpiLeft.basis)}</p>` : ''}
    </div>
    <div class="rzkg-kpi-half">
      <p class="rzkg-kpi-label">${esc(d.kpiRight.label)}</p>
      <p class="rzkg-kpi-value">${esc(d.kpiRight.value)}</p>
      ${d.kpiRight.basis ? `<p class="rzkg-kpi-basis">${esc(d.kpiRight.basis)}</p>` : ''}
    </div>
  </div>

  <div class="rzkg-list">
    ${cards}
  </div>

  ${d.image ? `
  <div class="rzkg-img-wrap">
    ${media(d.image, 'rzkg-photo', d.imageAlt ?? '리뷰 대표 이미지')}
  </div>` : ''}
</section>`
  },
})
