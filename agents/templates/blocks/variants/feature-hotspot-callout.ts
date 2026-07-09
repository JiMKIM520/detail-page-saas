/** FEATURE 아키타입: feature-hotspot-callout
 *  피그마 280_제품소개_27 흡수.
 *  풀블리드 배경 이미지 위에 브랜드+제목을 상단 중앙 배치하고,
 *  반투명 흰 필 배지(2~4개)를 선(SVG line)으로 제품 이미지 각 부위에 연결하는
 *  핫스팟 콜아웃 레이아웃. 배지는 절대좌표 % 기반으로 이미지 위에 부유.
 *  이미지 부재 시 배지 그리드 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'

const hotspotSchema = z.object({
  brand: z.string().optional(),          // 브랜드명 (상단 소제목)
  title: z.string().min(1),             // 제품 헤드라인 (em,br)
  subtitle: z.string().optional(),      // 헤드라인 아래 보조 문장
  image: z.string().optional(),         // 제품 풀블리드 배경 이미지 (url)
  badges: z
    .array(
      z.object({
        text: z.string().min(1),        // 배지 표시 문구
        // 배지 위치: 이미지 컨테이너 기준 % (0~100)
        top: z.number().min(0).max(100),
        left: z.number().min(0).max(100),
        // 선의 반대쪽 끝점 (이미지 내 연결 부위 좌표 %)
        lineToTop: z.number().min(0).max(100),
        lineToLeft: z.number().min(0).max(100),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof hotspotSchema>

export const featureHotspotCallout = defineBlock<Data>({
  id: 'feature-hotspot-callout',
  archetype: 'feature',
  styleTags: ['light', 'mixed', 'editorial', 'product', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '풀블리드 배경 이미지 위에 브랜드+제품명을 상단 중앙 배치하고, 반투명 흰 배지(2~4개)를 SVG 선으로 제품 각 부위와 연결하는 핫스팟 콜아웃. 가전/패션/뷰티 단일 제품 특징 강조에 최적. 이미지 없을 때 배지 2열 그리드로 강등.',
  schema: hotspotSchema,
  css: `
/* ── feature-hotspot-callout (fqlp) ── */
.fqlp{position:relative;width:100%;background:var(--ink);color:var(--bg);overflow:hidden;font-family:var(--font-body,'Pretendard',sans-serif)}
/* 풀블리드 배경 */
.fqlp-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.fqlp-bg.ph{background:color-mix(in srgb,var(--brand) 70%,#000);display:block}
/* 오버레이: 상단 텍스트 가독성 확보 */
.fqlp-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,.08) 45%,rgba(0,0,0,.08) 100%)}
/* 내부 콘텐츠 컨테이너 */
.fqlp-inner{position:relative;z-index:1;width:100%;min-height:520px;display:flex;flex-direction:column;padding:0 var(--pad-x,56px)}
/* 상단 헤더 */
.fqlp-header{text-align:center;padding-top:48px;padding-bottom:0}
.fqlp-brand{font-size:18px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:10px}
.fqlp-title{font-family:var(--font-display,inherit);font-weight:700;font-size:clamp(24px,3.2vw,40px);line-height:1.35;color:#ffffff;margin:0}
.fqlp-title .em{color:var(--em-dark,#FFF7EA)}
.fqlp-subtitle{margin-top:10px;font-size:16px;font-weight:400;color:rgba(255,255,255,.72);line-height:1.55}
/* 핫스팟 이미지 영역 */
.fqlp-stage{position:relative;flex:1;width:100%;min-height:380px;margin-top:24px;margin-bottom:0}
/* 배지 공통 */
.fqlp-badge{position:absolute;display:flex;align-items:center;background:rgba(255,255,255,.92);color:var(--ink);border-radius:999px;padding:8px 18px;font-size:15px;font-weight:500;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.18);transform:translateX(-50%);line-height:1.2}
/* SVG 오버레이 (선) */
.fqlp-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.fqlp-line{stroke:rgba(255,255,255,.70);stroke-width:1.5;fill:none;stroke-dasharray:4 3}
/* ── noimg 강등: 배지 그리드 ── */
.fqlp--noimg{min-height:auto;background:var(--paper)}
.fqlp--noimg .fqlp-overlay{display:none}
.fqlp--noimg .fqlp-title{color:var(--ink)}
.fqlp--noimg .fqlp-brand{color:var(--muted)}
.fqlp--noimg .fqlp-subtitle{color:var(--ink-2)}
.fqlp--noimg .fqlp-header{padding-top:52px}
.fqlp-badge-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;padding:28px 0 52px}
.fqlp-badge-grid-item{background:var(--bg);border:1.5px solid var(--line);border-radius:calc(var(--r-scale,1)*14px);padding:18px 20px;font-size:15px;font-weight:500;color:var(--ink);text-align:center;line-height:1.4}
/* 다크 배경 em 오버라이드 */
.fqlp .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0

    const header = `
  <div class="fqlp-header">
    ${d.brand ? `<p class="fqlp-brand">${esc(d.brand)}</p>` : ''}
    <h2 class="fqlp-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fqlp-subtitle">${esc(d.subtitle)}</p>` : ''}
  </div>`

    if (!hasImg) {
      // ── noimg 강등: 배지 그리드 레이아웃 ──
      const gridItems = d.badges
        .map((b) => `<div class="fqlp-badge-grid-item">${esc(b.text)}</div>`)
        .join('\n    ')
      return `
<section class="fqlp fqlp--noimg">
  <div class="fqlp-inner">
    ${header}
    <div class="fqlp-badge-grid">
      ${gridItems}
    </div>
  </div>
</section>`
    }

    // ── 풀블리드 핫스팟 레이아웃 ──
    // 배지와 선은 .fqlp-stage 기준 % 좌표로 절대 배치.
    // SVG viewBox는 "0 0 100 100" (preserveAspectRatio=none)으로 % 단위 좌표 그대로 사용.
    const svgLines = d.badges
      .map((b) => {
        // 배지 anchor: 배지 중앙 하단 or 상단 (lineToTop > top 이면 아래로, 아니면 위로)
        const bCx = b.left
        const bCy = b.top
        const tCx = b.lineToLeft
        const tCy = b.lineToTop
        return `<line class="fqlp-line" x1="${bCx}" y1="${bCy}" x2="${tCx}" y2="${tCy}" vector-effect="non-scaling-stroke"/>`
      })
      .join('\n      ')

    const badges = d.badges
      .map(
        (b) =>
          `<div class="fqlp-badge" style="top:${b.top}%;left:${b.left}%">${esc(b.text)}</div>`,
      )
      .join('\n    ')

    return `
<section class="fqlp">
  <img class="fqlp-bg" src="${esc(d.image!)}" alt="${esc(d.title)}" loading="eager" fetchpriority="high" style="border-radius:var(--shape-photo,0%)">
  <div class="fqlp-overlay"></div>
  <div class="fqlp-inner">
    ${header}
    <div class="fqlp-stage">
      <svg class="fqlp-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${svgLines}
      </svg>
      ${badges}
    </div>
  </div>
</section>`
  },
})
