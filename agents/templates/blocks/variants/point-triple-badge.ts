/** POINT 아키타입: point-triple-badge
 *  피그마 100_포인트_01 재구성.
 *  세로 3파트(point 01~03) 순차 스택:
 *    파트 01 — 포인트 레이블 + 헤드라인 + 사진 + 사용전후 비교 패널
 *    파트 02 — 포인트 레이블 + 헤드라인 + 사진 + 체크리스트
 *    파트 03 — 포인트 레이블 + 헤드라인 + 사진 + 원형(TEXT_PATH 모사) 인증 뱃지 3연
 *  라이트 배경. 이미지 전무 시 사진 프레임 생략 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 스키마 ─────────────────────────────────────────────────── */

const pointBase = z.object({
  label: z.string().min(1),          // 예: "point 01." (슬롯 자유 기재)
  heading: z.string().min(1),        // 굵은 헤드라인 (em,br 허용)
  body: z.string().optional(),       // 서브 설명 (순수 텍스트)
  image: z.string().optional(),      // 대표 사진 (url)
})

const beforeAfter = z.object({
  duration: z.string().min(1),       // 예: "4주 사용 후"
  effect: z.string().min(1),         // 예: "세안 후에도 촉촉함 유지" (em 허용)
  beforeLabel: z.string().optional(), // 기본 "사용 전"
  afterLabel: z.string().optional(),  // 기본 "사용 후"
  beforeDesc: z.string().optional(),  // 예: "건조하고 칙칙한 피부"
  afterDesc: z.string().optional(),   // 예: "촉촉하고 깨끗한 피부"
  beforeImage: z.string().optional(), // (url)
  afterImage: z.string().optional(),  // (url)
})

const checkItem = z.object({
  text: z.string().min(1),
})

const badgeItem = z.object({
  outerText: z.string().min(1),      // 바깥 곡선 텍스트 (짧게 — 6자 이하 권장)
  innerText: z.string().min(1),      // 안쪽 곡선 텍스트 (짧게 — 6자 이하 권장)
  label: z.string().min(1),          // 뱃지 아래 캡션 (em 허용)
})

const schema = z.object({
  /* ── 섹션 공통 ── */
  sectionLabel: z.string().optional(), // 최상단 섹션 타이틀 예: "포인트"
  intro: z.string().optional(),        // 도입 대제목 (em,br 허용)

  /* ── 파트 01: 사용전후 비교 ── */
  p1: pointBase,
  ba: beforeAfter,

  /* ── 파트 02: 체크리스트 ── */
  p2: pointBase,
  checkHeading: z.string().optional(),  // 체크리스트 위 강조 문구 (em 허용)
  checks: z.array(checkItem).min(2).max(6),

  /* ── 파트 03: 인증 뱃지 ── */
  p3: pointBase,
  badges: z.array(badgeItem).min(2).max(4),
})

type Data = z.infer<typeof schema>

/* ── 헬퍼 ── */

/** 곡선 뱃지: 동심원 3개 + 상하 SVG textPath 모사 (CSS rotate 애니 없이 정적)
 *  viewBox=200×200, cx=cy=100. outerR=88(텍스트 경로), ringR=88/78/54.
 *  r < 100 이므로 viewBox 안에 완전 수용됨. */
function renderBadge(b: { outerText: string; innerText: string; label: string }, esc: (s: string | undefined) => string, richSafe: (s: string | undefined) => string): string {
  const cx = 100, cy = 100
  const outerR = 88   // 바깥 텍스트 경로 반지름 (viewBox 100 기준으로 여유)
  const innerR = 54   // 안쪽 텍스트 경로 반지름
  // textPath: 위쪽 호(outer top arc), 아래쪽 호(inner bottom arc)
  const topArcOuter = `M ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy}`
  const botArcInner = `M ${cx - innerR} ${cy} A ${innerR} ${innerR} 0 0 0 ${cx + innerR} ${cy}`
  return `
<div class="pgga-badge">
  <svg class="pgga-badge-svg" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <path id="pgga-arc-o" d="${topArcOuter}"/>
      <path id="pgga-arc-i" d="${botArcInner}"/>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="88" fill="none" stroke="var(--accent)" stroke-width="1.4" opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="78" fill="none" stroke="var(--accent)" stroke-width="1" opacity=".3"/>
    <circle cx="${cx}" cy="${cy}" r="54" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity=".7"/>
    <text class="pgga-badge-arc pgga-arc-top">
      <textPath href="#pgga-arc-o" startOffset="50%" text-anchor="middle">${esc(b.outerText)}</textPath>
    </text>
    <text class="pgga-badge-arc pgga-arc-bot">
      <textPath href="#pgga-arc-i" startOffset="50%" text-anchor="middle">${esc(b.innerText)}</textPath>
    </text>
  </svg>
  <p class="pgga-badge-cap">${richSafe(b.label)}</p>
</div>`
}

/* ── defineBlock ── */

export const pointTripleBadge = defineBlock<Data>({
  id: 'point-triple-badge',
  archetype: 'point',
  styleTags: ['light', 'editorial', 'before-after', 'checklist', 'cert-badge', 'noimg-safe'],
  imageSlots: 5, // p1.image + ba.beforeImage + ba.afterImage + p2.image + p3.image
  describe:
    '포인트 세로 3스택 블록. 파트1=사용전후 비교 패널, 파트2=체크리스트, 파트3=원형 곡선텍스트 인증뱃지 3연. 뷰티/스킨케어 상세페이지 포인트 섹션 전용. 라이트 배경, 파트별 대형 사진 + 동일 파란 레이블 반복 모듈.',
  schema,
  css: `
/* ── pgga: point-triple-badge ─────────────────────────── */
.pgga{background:var(--bg);color:var(--ink);padding:60px 0 72px}

/* 섹션 헤더 */
.pgga-hd{padding:0 var(--pad-x,56px) 0}
.pgga-section-label{font-family:var(--font-display);font-size:16px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.pgga-intro{font-family:var(--font-display);font-size:clamp(44px,5vw,90px);font-weight:800;line-height:1.06;color:var(--ink);margin-bottom:0}
.pgga-intro .em{color:var(--accent)}
.pgga-hd-rule{width:136px;height:1.5px;background:var(--line);margin:28px 0 0}

/* 파트 공통 */
.pgga-part{padding:48px var(--pad-x,56px) 0}
.pgga-part+.pgga-part{border-top:1px solid var(--line);margin-top:52px}

/* 포인트 레이블 바 */
.pgga-point-label{display:inline-flex;align-items:center;padding:12px 20px;background:var(--accent);margin-bottom:20px;border-radius:calc(var(--r-scale,1)*4px)}
.pgga-point-label span{font-family:var(--font-display);font-size:18px;font-weight:600;color:#fff;letter-spacing:.04em}

/* 파트 헤드라인 */
.pgga-pt-head{margin-bottom:6px}
.pgga-pt-head h3{font-family:var(--font-display);font-size:clamp(28px,3.8vw,60px);font-weight:800;line-height:1.18;color:var(--ink);margin:0}
.pgga-pt-head h3 .em{color:var(--accent)}
.pgga-pt-body{font-size:15px;font-weight:500;color:var(--ink-2);line-height:1.7;margin-top:10px}

/* 파트 사진 */
.pgga-photo{margin-top:24px}
.pgga-photo img,.pgga-photo .ph{width:100%;height:auto;aspect-ratio:760/800;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));display:block}

/* ── 파트 01: 사용전후 ── */
.pgga-ba{margin-top:28px}
.pgga-ba-title-row{text-align:center;margin-bottom:10px}
.pgga-ba-duration{font-size:22px;font-weight:600;color:var(--ink);letter-spacing:-.01em}
.pgga-ba-rule{width:80px;height:1.5px;background:var(--line);margin:8px auto}
.pgga-ba-effect{font-size:clamp(22px,3vw,44px);font-weight:800;color:var(--accent);line-height:1.2;text-align:center}
.pgga-ba-effect .em{color:var(--ink)}
.pgga-ba-panels{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:16px}
.pgga-ba-panel{display:flex;flex-direction:column}
.pgga-ba-tab{padding:14px 0;text-align:center;font-size:20px;font-weight:600;letter-spacing:.02em}
.pgga-ba-tab.before{background:color-mix(in srgb,var(--muted) 40%,var(--bg));color:var(--ink-2)}
.pgga-ba-tab.after{background:var(--accent);color:#fff;font-weight:800}
.pgga-ba-img{flex:1}
.pgga-ba-img img,.pgga-ba-img .ph{width:100%;aspect-ratio:380/500;object-fit:cover;display:block}
.pgga-ba-desc{padding:14px 8px;text-align:center;font-size:16px;font-weight:500;color:var(--ink-2);background:var(--paper)}
.pgga-ba-desc.after-desc{color:var(--ink);font-weight:600}

/* ── 파트 02: 체크리스트 ── */
.pgga-check-head{margin-top:24px;font-size:clamp(18px,2.5vw,32px);font-weight:700;color:var(--accent);line-height:1.35}
.pgga-check-head .em{color:var(--ink)}
.pgga-checklist{margin-top:16px;display:flex;flex-direction:column;gap:12px}
.pgga-check-item{display:flex;align-items:center;gap:14px;font-size:clamp(15px,2vw,28px);font-weight:500;color:var(--ink)}
.pgga-check-icon{flex:0 0 24px;width:24px;height:24px;fill:var(--accent)}

/* ── 파트 03: 인증 뱃지 ── */
.pgga-badges{margin-top:28px;display:flex;justify-content:space-around;align-items:flex-start;gap:8px;flex-wrap:wrap}
.pgga-badge{display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;min-width:160px;max-width:220px}
.pgga-badge-svg{width:100%;max-width:140px;height:auto;display:block;margin:0 auto}
.pgga-badge-arc{font-family:var(--font-display);fill:var(--accent);font-weight:600}
.pgga-arc-top{font-size:9px;letter-spacing:.06em}
.pgga-arc-bot{font-size:7.5px;letter-spacing:.08em}
.pgga-badge-cap{font-family:var(--font-display);font-size:clamp(12px,1.6vw,16px);font-weight:500;color:var(--ink);text-align:center;line-height:1.5;margin:0}
.pgga-badge-cap .em{color:var(--accent);font-weight:700}

/* noimg-safe: 이미지 없을 때 ph 대신 컬러 플레이스홀더 */
.pgga .ph{background:color-mix(in srgb,var(--accent) 8%,var(--paper));border-radius:inherit}
`,
  render: (d, { esc, richSafe, icon }) => {
    /* 파트별 이미지 존재 여부 */
    const hasP1Img = typeof d.p1.image === 'string' && d.p1.image.length > 0
    const hasP2Img = typeof d.p2.image === 'string' && d.p2.image.length > 0
    const hasP3Img = typeof d.p3.image === 'string' && d.p3.image.length > 0
    const hasBefore = typeof d.ba.beforeImage === 'string' && d.ba.beforeImage.length > 0
    const hasAfter  = typeof d.ba.afterImage  === 'string' && d.ba.afterImage.length > 0

    /* ── 파트 01: 사용전후 비교 ── */
    const part1 = `
<div class="pgga-part">
  <div class="pgga-point-label"><span>${esc(d.p1.label)}</span></div>
  <div class="pgga-pt-head">
    <h3>${richSafe(d.p1.heading)}</h3>
    ${d.p1.body ? `<p class="pgga-pt-body">${esc(d.p1.body)}</p>` : ''}
  </div>
  ${hasP1Img ? `<div class="pgga-photo">${media(d.p1.image, '', '포인트1 대표 사진')}</div>` : ''}
  <div class="pgga-ba">
    <div class="pgga-ba-title-row">
      <p class="pgga-ba-duration">${esc(d.ba.duration)}</p>
      <div class="pgga-ba-rule"></div>
      <p class="pgga-ba-effect">${richSafe(d.ba.effect)}</p>
    </div>
    <div class="pgga-ba-panels">
      <div class="pgga-ba-panel">
        <div class="pgga-ba-tab before">${esc(d.ba.beforeLabel ?? '사용 전')}</div>
        <div class="pgga-ba-img">${hasBefore ? media(d.ba.beforeImage, '', '사용 전') : '<div class="ph" style="width:100%;aspect-ratio:380/500"></div>'}</div>
        ${d.ba.beforeDesc ? `<p class="pgga-ba-desc">${esc(d.ba.beforeDesc)}</p>` : ''}
      </div>
      <div class="pgga-ba-panel">
        <div class="pgga-ba-tab after">${esc(d.ba.afterLabel ?? '사용 후')}</div>
        <div class="pgga-ba-img">${hasAfter ? media(d.ba.afterImage, '', '사용 후') : '<div class="ph" style="width:100%;aspect-ratio:380/500"></div>'}</div>
        ${d.ba.afterDesc ? `<p class="pgga-ba-desc after-desc">${esc(d.ba.afterDesc)}</p>` : ''}
      </div>
    </div>
  </div>
</div>`

    /* ── 파트 02: 체크리스트 ── */
    const checkIcon = `<svg class="pgga-check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`
    const part2 = `
<div class="pgga-part">
  <div class="pgga-point-label"><span>${esc(d.p2.label)}</span></div>
  <div class="pgga-pt-head">
    <h3>${richSafe(d.p2.heading)}</h3>
    ${d.p2.body ? `<p class="pgga-pt-body">${esc(d.p2.body)}</p>` : ''}
  </div>
  ${hasP2Img ? `<div class="pgga-photo">${media(d.p2.image, '', '포인트2 대표 사진')}</div>` : ''}
  ${d.checkHeading ? `<p class="pgga-check-head">${richSafe(d.checkHeading)}</p>` : ''}
  <ul class="pgga-checklist" role="list">
    ${d.checks.map(c => `
    <li class="pgga-check-item">
      ${checkIcon}
      <span>${esc(c.text)}</span>
    </li>`).join('')}
  </ul>
</div>`

    /* ── 파트 03: 인증 뱃지 ── */
    const part3 = `
<div class="pgga-part">
  <div class="pgga-point-label"><span>${esc(d.p3.label)}</span></div>
  <div class="pgga-pt-head">
    <h3>${richSafe(d.p3.heading)}</h3>
    ${d.p3.body ? `<p class="pgga-pt-body">${esc(d.p3.body)}</p>` : ''}
  </div>
  ${hasP3Img ? `<div class="pgga-photo">${media(d.p3.image, '', '포인트3 대표 사진')}</div>` : ''}
  <div class="pgga-badges" role="list">
    ${d.badges.map(b => `<div role="listitem">${renderBadge(b, esc, richSafe)}</div>`).join('')}
  </div>
</div>`

    return `
<section class="pgga">
  <div class="pgga-hd">
    ${d.sectionLabel ? `<p class="pgga-section-label">${esc(d.sectionLabel)}</p>` : ''}
    ${d.intro ? `<h2 class="pgga-intro disp">${richSafe(d.intro)}</h2>` : ''}
    ${d.intro ? '<div class="pgga-hd-rule"></div>' : ''}
  </div>
  ${part1}
  ${part2}
  ${part3}
</section>`
  },
})
