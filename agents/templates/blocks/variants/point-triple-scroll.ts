/** POINT 아키타입: point-triple-scroll
 *  원본: 167_포인트_05.json (포인트/05, 860×11684)
 *
 *  3개의 번호 붙은 포인트 섹션(point 01/02/03)을 세로로 연속 배치.
 *  각 섹션은 독립 구조를 가진다:
 *    - 섹션 헤더: 좌측 "point NN." 라벨 + 우측 부제 (라인 장식 포함)
 *    - 대형 히어로 사진
 *    - 타이틀 블록 (Bold 대제목 + Medium 부제)
 *    - 혼합 콘텐츠 슬롯:
 *        section 1 → 체크리스트 2열 아이콘 카드 그리드
 *        section 2 → 인증/안전 행(원형 텍스트패스 스탬프 + 사진 + 검증 텍스트)
 *        section 3 → 성분 성격 좌우 교차 행 (컬러 키워드 pill + 굵은 성분명 + 설명)
 *  장치: 좌측 바 강조 타이틀, 컬러 pill 라벨, 원형 텍스트패스 스탬프(CSS 애니), 둥근 아이콘 카드
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 섹션별 서브 스키마 ─────────────────────────────────────────── */

const checkItem = z.object({
  text: z.string().min(1), // (em,br) 허용
})

const iconCard = z.object({
  icon: z.string().min(1),   // ICON_NAMES 중 하나 (렌더에서 icon() 호출)
  label: z.string().min(1),  // 카드 하단 라벨
})

const certRow = z.object({
  image: z.string().optional(),   // (url) 인증서 또는 테스트 사진
  keyword: z.string().min(1),     // 원형 스탬프 outer ring 텍스트
  stamp: z.string().min(1),       // 원형 스탬프 inner 짧은 값 (예: "0.00", "ZERO", "OK")
  heading: z.string().min(1),     // 행 제목 (강조)
  desc: z.string().min(1),        // 설명 (em,br)
  refNo: z.string().optional(),   // 시험번호·인증번호 (선택)
})

const ingredientRow = z.object({
  image: z.string().optional(),   // (url) 성분 사진
  keyword: z.string().min(1),     // 컬러 pill 키워드
  name: z.string().min(1),        // 굵은 성분명
  desc: z.string().min(1),        // 성분 설명 (em,br)
})

const schema = z.object({
  // ── 전역 ──
  productName: z.string().optional(), // 우측 헤더 부제 (3섹션 공통 기본값)

  // ── Section 1: 체크리스트 + 아이콘 카드 ──
  s1Label: z.string().optional(),     // "point 01." 대체 문자열
  s1Image: z.string().optional(),     // 히어로 사진 (url)
  s1Title: z.string().min(1),         // 대제목 (em,br)
  s1Sub: z.string().optional(),       // 대제목 아래 설명
  s1CheckTitle: z.string().optional(), // 체크리스트 섹션 타이틀 (좌측 바 강조)
  s1Checks: z.array(checkItem).min(1).max(4),
  s1Image2: z.string().optional(),    // 체크리스트 아래 두 번째 사진 (url)
  s1PillLabel: z.string().optional(), // 그라디언트 pill 텍스트
  s1PillSub: z.string().optional(),   // pill 아래 소텍스트
  s1Cards: z.array(iconCard).min(2).max(4), // 아이콘 카드 그리드

  // ── Section 2: 인증/안전 행 ──
  s2Label: z.string().optional(),
  s2Image: z.string().optional(),     // 대표 인증서 사진 (url)
  s2CertBadge: z.string().optional(), // 인증서 위 원형 마크 오버레이 텍스트 (짧게)
  s2Title: z.string().min(1),
  s2Sub: z.string().optional(),
  s2Heading: z.string().optional(),   // 인증 영역 대표 타이틀
  s2HeadingSub: z.string().optional(),// 인증 영역 부제
  s2Rows: z.array(certRow).min(1).max(4),

  // ── Section 3: 성분 좌우 교차 ──
  s3Label: z.string().optional(),
  s3Image: z.string().optional(),     // 히어로 사진 (url)
  s3Title: z.string().min(1),
  s3Sub: z.string().optional(),
  s3Rows: z.array(ingredientRow).min(1).max(4),
})

type Data = z.infer<typeof schema>

/* ── 텍스트패스 원형 스탬프 SVG ────────────────────────────────── */
function circleStamp(keyword: string, stamp: string, idx: number): string {
  const id = `pvii-arc-${idx}`
  // 원형 텍스트패스: outer ring (r=70) + inner fill (r=46) + stamp value 중앙
  // textPath startOffset 50% + text-anchor middle → 상단 호에 자동 정렬
  const kw = keyword.substring(0, 18) // 너무 길면 잘림 방지
  return `
<div class="pvii-stamp" aria-label="${kw}">
  <svg viewBox="0 0 160 160" class="pvii-stamp-svg">
    <defs>
      <path id="${id}-o" d="M80,80 m-68,0 a68,68 0 1,1 136,0 a68,68 0 1,1 -136,0"/>
      <path id="${id}-i" d="M80,80 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"/>
    </defs>
    <!-- outer ring border -->
    <circle cx="80" cy="80" r="74" fill="none" stroke="var(--accent)" stroke-width="2" opacity=".35"/>
    <circle cx="80" cy="80" r="68" fill="none" stroke="var(--accent)" stroke-width="1.4" opacity=".6"/>
    <!-- inner fill -->
    <circle cx="80" cy="80" r="50" fill="var(--accent)"/>
    <!-- outer text path -->
    <text font-size="11.5" font-weight="700" fill="var(--accent)" font-family="Pretendard,sans-serif" letter-spacing="2.2">
      <textPath href="#${id}-o" startOffset="50%" text-anchor="middle">${kw}</textPath>
    </text>
    <!-- inner text path (반대 방향: 하단 호) -->
    <text font-size="10" font-weight="600" fill="#ffffffbb" font-family="Pretendard,sans-serif" letter-spacing="1.6">
      <textPath href="#${id}-i" startOffset="50%" text-anchor="middle">${kw}</textPath>
    </text>
    <!-- center stamp value -->
    <text x="80" y="86" text-anchor="middle" font-size="22" font-weight="800"
      fill="#ffffff" font-family="Pretendard,sans-serif">${stamp}</text>
  </svg>
</div>`
}

/* ── defineBlock ────────────────────────────────────────────────── */
export const pointTripleScroll = defineBlock<Data>({
  id: 'point-triple-scroll',
  archetype: 'point',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 8,
  describe:
    '포인트 3섹션 세로 연속 스크롤. 각 섹션은 번호 라벨+대형 사진+타이틀 뒤에 고유 구조(①체크리스트+아이콘 카드 그리드 ②원형 텍스트패스 스탬프+인증 행 ③좌우 교차 성분 행)를 담는다. 소재/인증/성분 3단계 서술에 최적.',
  schema,
  css: `
/* ── 전체 래퍼 ──────────────────────────────────────────── */
.pvii{background:var(--bg);color:var(--ink)}

/* ── 섹션 단위 ──────────────────────────────────────────── */
.pvii-sec{padding:60px 0 0}

/* ── 섹션 헤더 (번호 라벨 + 우측 부제) ──────────────────── */
.pvii-hd{display:flex;align-items:center;justify-content:space-between;padding:0 var(--pad-x,56px) 24px}
.pvii-pt-label{font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--accent);letter-spacing:-.01em}
.pvii-pt-name{font-size:16px;color:var(--ink-2);font-weight:400;letter-spacing:.01em}

/* ── 히어로 사진 ──────────────────────────────────────────── */
.pvii-hero{width:100%;aspect-ratio:760/850;object-fit:cover;display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));
  margin:0 var(--pad-x,56px);
  width:calc(100% - var(--pad-x,56px)*2)}
.pvii-hero.ph{aspect-ratio:760/850;background:color-mix(in srgb,var(--accent) 8%,var(--paper));
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}

/* ── 타이틀 블록 ──────────────────────────────────────────── */
.pvii-tb{padding:28px var(--pad-x,56px) 0}
.pvii-tb-h{font-family:var(--font-display);font-size:48px;font-weight:800;line-height:1.15;color:var(--ink)}
.pvii-tb-h .em{color:var(--accent)}
.pvii-tb-s{margin-top:12px;font-size:22px;font-weight:500;line-height:1.5;color:var(--ink);opacity:.88}

/* ── S1: 체크리스트 ──────────────────────────────────────── */
.pvii-chk-hd{display:flex;align-items:center;gap:14px;padding:28px var(--pad-x,56px) 0}
.pvii-chk-bar{width:8px;height:52px;background:var(--accent);border-radius:calc(var(--r-scale,1)*4px);flex-shrink:0}
.pvii-chk-title{font-family:var(--font-display);font-size:34px;font-weight:800;color:var(--accent);line-height:1.2}
.pvii-chk-list{padding:16px var(--pad-x,56px) 0;display:flex;flex-direction:column;gap:14px}
.pvii-chk-row{display:flex;align-items:flex-start;gap:16px}
.pvii-chk-icon{flex-shrink:0;width:28px;height:28px;margin-top:3px;color:var(--accent)}
.pvii-chk-icon svg{width:100%;height:100%}
.pvii-chk-text{font-size:22px;font-weight:500;line-height:1.55;color:var(--ink)}
.pvii-chk-text .em{color:var(--accent);font-weight:700}

/* ── S1: 두 번째 사진 ──────────────────────────────────────── */
.pvii-img2{display:block;margin:28px var(--pad-x,56px) 0;
  width:calc(100% - var(--pad-x,56px)*2);aspect-ratio:760/850;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}
.pvii-img2.ph{aspect-ratio:760/850;background:color-mix(in srgb,var(--accent) 6%,var(--paper))}

/* ── S1: 그라디언트 pill + 텍스트 ──────────────────────────── */
.pvii-pill-wrap{padding:24px var(--pad-x,56px) 0;display:flex;flex-direction:column;align-items:center;gap:10px}
.pvii-pill{display:inline-block;padding:12px 48px;border-radius:999px;
  background:linear-gradient(90deg,var(--accent-d),var(--accent));
  font-size:28px;font-weight:700;color:#fff;letter-spacing:.02em}
.pvii-pill-div{width:calc(100% - var(--pad-x,56px)*2 + 56px);height:3px;background:var(--line);border-radius:calc(var(--r-scale,1)*2px)}
.pvii-pill-sub{font-size:14px;font-weight:500;color:var(--accent);text-align:center;letter-spacing:.04em}
.pvii-pill-body{font-size:18px;line-height:1.6;color:var(--ink-2);text-align:center;margin-top:4px}

/* ── S1: 아이콘 카드 그리드 ─────────────────────────────────── */
.pvii-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;
  padding:22px var(--pad-x,56px) 60px}
/* 홀수 3개: 1행 3칸 (빈 칸 없음) */
.pvii-cards[data-count="3"]{grid-template-columns:repeat(3,1fr)}
.pvii-card{background:color-mix(in srgb,var(--accent) 12%,var(--paper));
  border-radius:calc(var(--r-scale,1)*28px);
  padding:28px 18px 22px;display:flex;flex-direction:column;align-items:center;gap:14px}
.pvii-card-circle{width:100px;height:100px;border-radius:50%;background:var(--bg);
  display:flex;align-items:center;justify-content:center}
.pvii-card-circle svg{width:52px;height:52px;color:var(--accent)}
.pvii-card-label{font-size:18px;font-weight:700;color:var(--accent);text-align:center;line-height:1.4}

/* ── S2: 인증서 영역 (사진 + 원형 마크 오버레이) ─────────────── */
.pvii-cert-wrap{position:relative;margin:28px var(--pad-x,56px) 0;
  width:calc(100% - var(--pad-x,56px)*2)}
.pvii-cert-img{display:block;width:100%;aspect-ratio:532/836;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}
.pvii-cert-img.ph{aspect-ratio:532/836;background:color-mix(in srgb,var(--accent) 6%,var(--paper));
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}
.pvii-cert-badge{position:absolute;right:-12px;top:16px;
  width:110px;height:110px;border-radius:50%;
  background:var(--accent-d);display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:800;color:#fff;text-align:center;line-height:1.3;
  box-shadow:0 6px 20px rgba(0,0,0,.22);padding:8px}

/* ── S2: 인증 영역 배경 ─────────────────────────────────────── */
.pvii-cert-bg{background:color-mix(in srgb,var(--accent) 10%,var(--paper));
  padding:36px var(--pad-x,56px) 48px;margin-top:28px}
.pvii-cert-bg-h{font-family:var(--font-display);font-size:36px;font-weight:800;
  color:var(--ink);text-align:center;line-height:1.3}
.pvii-cert-bg-s{font-size:18px;font-weight:400;color:var(--ink-2);text-align:center;
  margin-top:8px;line-height:1.55}

/* ── S2: 인증 행 ──────────────────────────────────────────── */
.pvii-cert-rows{display:flex;flex-direction:column;gap:32px;margin-top:28px}
.pvii-cert-row{display:flex;align-items:center;gap:18px}
.pvii-cert-row.rev{flex-direction:row-reverse}
.pvii-cert-row-img-wrap{position:relative;flex:0 0 200px}
.pvii-cert-row-img{display:block;width:200px;height:220px;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
.pvii-cert-row-img.ph{background:color-mix(in srgb,var(--accent) 8%,var(--bg));
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
/* 원형 스탬프: 사진 모서리 오버레이 */
.pvii-stamp{position:absolute;bottom:-24px;left:-24px;width:96px;height:96px}
.pvii-cert-row.rev .pvii-stamp{left:auto;right:-24px}
.pvii-stamp-svg{width:100%;height:100%;filter:drop-shadow(0 4px 10px rgba(0,0,0,.18))}

/* 이미지 없을 때 스탬프는 텍스트 옆 인라인으로 보여줌 */
.pvii-cert-row--noimg .pvii-stamp{position:static;width:80px;height:80px;flex-shrink:0}

.pvii-cert-row-body{flex:1;padding:0 8px}
.pvii-cert-row-heading{font-size:24px;font-weight:800;color:var(--ink);line-height:1.3}
.pvii-cert-row-desc{margin-top:8px;font-size:16px;color:var(--ink-2);line-height:1.65}
.pvii-cert-row-desc .em{color:var(--accent);font-weight:700}
.pvii-cert-row-ref{margin-top:8px;font-size:13px;color:var(--muted);letter-spacing:.03em}

/* ── S3: 성분 좌우 교차 ──────────────────────────────────────── */
.pvii-ing-rows{display:flex;flex-direction:column;gap:0;padding:28px 0 60px}
.pvii-ing-row{display:flex;align-items:center;gap:0;padding:24px var(--pad-x,56px)}
.pvii-ing-row.rev{flex-direction:row-reverse}
.pvii-ing-img{flex:0 0 200px;width:200px;height:230px;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
.pvii-ing-img.ph{background:color-mix(in srgb,var(--accent) 7%,var(--paper));
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
.pvii-ing-body{flex:1;padding:0 24px}
.pvii-ing-row.rev .pvii-ing-body{padding:0 24px 0 0}
.pvii-ing-pill{display:inline-block;padding:6px 20px;border-radius:calc(var(--r-scale,1)*8px);
  background:var(--accent);color:#fff;font-size:16px;font-weight:600;margin-bottom:10px}
.pvii-ing-name{font-size:26px;font-weight:800;color:var(--accent);line-height:1.25;margin-bottom:10px}
.pvii-ing-desc{font-size:16px;color:var(--ink-2);line-height:1.65}
.pvii-ing-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const productName = d.productName ? esc(d.productName) : ''

    /* ── Section 1 ─────────────────────────────────────────── */
    const s1 = `
<div class="pvii-sec">
  <div class="pvii-hd">
    <span class="pvii-pt-label">${esc(d.s1Label ?? 'point 01.')}</span>
    ${productName ? `<span class="pvii-pt-name">${productName}</span>` : ''}
  </div>
  ${media(d.s1Image, 'pvii-hero', '포인트 01 사진')}
  <div class="pvii-tb">
    <h2 class="pvii-tb-h">${richSafe(d.s1Title)}</h2>
    ${d.s1Sub ? `<p class="pvii-tb-s">${richSafe(d.s1Sub)}</p>` : ''}
  </div>
  ${d.s1CheckTitle ? `
  <div class="pvii-chk-hd">
    <div class="pvii-chk-bar"></div>
    <span class="pvii-chk-title">${esc(d.s1CheckTitle)}</span>
  </div>` : ''}
  <ul class="pvii-chk-list" role="list">
    ${d.s1Checks.map(c => `
    <li class="pvii-chk-row">
      <span class="pvii-chk-icon">${icon('check')}</span>
      <span class="pvii-chk-text">${richSafe(c.text)}</span>
    </li>`).join('')}
  </ul>
  ${media(d.s1Image2, 'pvii-img2', '포인트 01 두번째 사진')}
  ${d.s1PillLabel ? `
  <div class="pvii-pill-wrap">
    <span class="pvii-pill">${esc(d.s1PillLabel)}</span>
    <div class="pvii-pill-div"></div>
    ${d.s1PillSub ? `<p class="pvii-pill-sub">${esc(d.s1PillSub)}</p>` : ''}
  </div>` : ''}
  <div class="pvii-cards" data-count="${d.s1Cards.length}">
    ${d.s1Cards.map(c => `
    <div class="pvii-card">
      <div class="pvii-card-circle">${icon(c.icon)}</div>
      <span class="pvii-card-label">${esc(c.label)}</span>
    </div>`).join('')}
  </div>
</div>`

    /* ── Section 2 ─────────────────────────────────────────── */
    const s2Rows = d.s2Rows.map((r, i) => {
      const hasImg = typeof r.image === 'string' && r.image.trim().length > 0
      const rowClass = `pvii-cert-row${i % 2 === 1 ? ' rev' : ''}${hasImg ? '' : ' pvii-cert-row--noimg'}`
      const stampEl = circleStamp(r.keyword, r.stamp, i)
      if (hasImg) {
        return `
      <div class="${rowClass}">
        <div class="pvii-cert-row-img-wrap">
          ${media(r.image, 'pvii-cert-row-img', r.heading)}
          ${stampEl}
        </div>
        <div class="pvii-cert-row-body">
          <div class="pvii-cert-row-heading">${esc(r.heading)}</div>
          <div class="pvii-cert-row-desc">${richSafe(r.desc)}</div>
          ${r.refNo ? `<div class="pvii-cert-row-ref">${esc(r.refNo)}</div>` : ''}
        </div>
      </div>`
      }
      // noimg-safe: 스탬프를 인라인으로 배치
      return `
      <div class="${rowClass}">
        ${stampEl}
        <div class="pvii-cert-row-body">
          <div class="pvii-cert-row-heading">${esc(r.heading)}</div>
          <div class="pvii-cert-row-desc">${richSafe(r.desc)}</div>
          ${r.refNo ? `<div class="pvii-cert-row-ref">${esc(r.refNo)}</div>` : ''}
        </div>
      </div>`
    }).join('')

    const s2 = `
<div class="pvii-sec">
  <div class="pvii-hd">
    <span class="pvii-pt-label">${esc(d.s2Label ?? 'point 02.')}</span>
    ${productName ? `<span class="pvii-pt-name">${productName}</span>` : ''}
  </div>
  <div class="pvii-tb">
    <h2 class="pvii-tb-h">${richSafe(d.s2Title)}</h2>
    ${d.s2Sub ? `<p class="pvii-tb-s">${richSafe(d.s2Sub)}</p>` : ''}
  </div>
  ${d.s2Image ? `
  <div class="pvii-cert-wrap">
    ${media(d.s2Image, 'pvii-cert-img', '대표 인증서')}
    ${d.s2CertBadge ? `<div class="pvii-cert-badge">${esc(d.s2CertBadge)}</div>` : ''}
  </div>` : ''}
  <div class="pvii-cert-bg">
    ${d.s2Heading ? `<h3 class="pvii-cert-bg-h">${richSafe(d.s2Heading)}</h3>` : ''}
    ${d.s2HeadingSub ? `<p class="pvii-cert-bg-s">${esc(d.s2HeadingSub)}</p>` : ''}
    <div class="pvii-cert-rows">
      ${s2Rows}
    </div>
  </div>
</div>`

    /* ── Section 3 ─────────────────────────────────────────── */
    const s3Rows = d.s3Rows.map((r, i) => {
      const rowClass = `pvii-ing-row${i % 2 === 1 ? ' rev' : ''}`
      return `
    <div class="${rowClass}">
      ${media(r.image, 'pvii-ing-img', r.name)}
      <div class="pvii-ing-body">
        <span class="pvii-ing-pill">${esc(r.keyword)}</span>
        <div class="pvii-ing-name">${esc(r.name)}</div>
        <div class="pvii-ing-desc">${richSafe(r.desc)}</div>
      </div>
    </div>`
    }).join('')

    const s3 = `
<div class="pvii-sec">
  <div class="pvii-hd">
    <span class="pvii-pt-label">${esc(d.s3Label ?? 'point 03.')}</span>
    ${productName ? `<span class="pvii-pt-name">${productName}</span>` : ''}
  </div>
  ${media(d.s3Image, 'pvii-hero', '포인트 03 사진')}
  <div class="pvii-tb">
    <h2 class="pvii-tb-h">${richSafe(d.s3Title)}</h2>
    ${d.s3Sub ? `<p class="pvii-tb-s">${richSafe(d.s3Sub)}</p>` : ''}
  </div>
  <div class="pvii-ing-rows">
    ${s3Rows}
  </div>
</div>`

    return `<section class="pvii">${s1}${s2}${s3}</section>`
  },
})
