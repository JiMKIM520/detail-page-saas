/** FEATURE 아키타입: feature-hotspot-split.
 *  피그마 286_제품소개_33 패턴 재구성.
 *  상단: 컬러 배지 + 대형 제목 + 서브 카피.
 *  중단: 풀폭 제품 이미지에 SVG 선+레이블 핫스팟 오버레이(최대 3개).
 *  하단: 번호+제목+설명 ↔ 절반 이미지 교차 분할 리스트(홀수=텍스트오른쪽, 짝수=텍스트왼쪽).
 *  noimg-safe: 핫스팟 이미지 없을 때 핫스팟 영역 숨김, 리스트 이미지 없을 때 번호만 배치. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const hotspotSchema = z.object({
  label: z.string().min(1),          // 레이블 텍스트 (예: "풍량 조절")
  /** 핫스팟 앵커 위치 — 이미지 폭/높이 대비 0~1 비율 */
  anchorX: z.number().min(0).max(1).optional(), // 기본 0.3
  anchorY: z.number().min(0).max(1).optional(), // 기본 0.5
})

const itemSchema = z.object({
  image: z.string().optional(),          // 절반 폭 이미지 (url)
  title: z.string().min(1),             // 항목 제목 (em 허용)
  desc: z.string().min(1),              // 항목 설명 (em,br 허용)
})

const schema = z.object({
  badge: z.string().optional(),          // 상단 배지 텍스트 (예: "detail_03")
  title: z.string().min(1),             // 대형 제목 (em,br 허용)
  subtitle: z.string().optional(),       // 제목 아래 서브 카피 (em,br 허용)
  heroImage: z.string().optional(),      // 핫스팟 오버레이 기준 제품 이미지 (url)
  hotspots: z
    .array(hotspotSchema)
    .min(1)
    .max(3)
    .optional(),                         // 핫스팟 레이블 목록 (브리프에 기능 좌표 정보 있을 시만)
  items: z
    .array(itemSchema)
    .min(2)
    .max(4),                             // 교차 분할 리스트 항목
})
type Data = z.infer<typeof schema>

/** 핫스팟 한 개를 SVG 선+레이블로 렌더.
 *  - 앵커(cx,cy)에서 수평선을 긋고 끝에 레이블 배치
 *  - 홀수 인덱스는 오른쪽→왼쪽, 짝수는 왼쪽→오른쪽으로 선을 그어 충돌 최소화
 */
function renderHotspot(
  label: string,
  anchorX: number,
  anchorY: number,
  idx: number,
  totalW: number,
  totalH: number,
): string {
  const cx = Math.round(anchorX * totalW)
  const cy = Math.round(anchorY * totalH)
  const goRight = idx % 2 === 0
  const lineLen = 90
  const x2 = goRight ? cx + lineLen : cx - lineLen
  const labelX = goRight ? x2 + 6 : x2 - 6
  const anchor = goRight ? 'start' : 'end'
  return `
  <circle cx="${cx}" cy="${cy}" r="5" fill="#fff" stroke="#111" stroke-width="1.5"/>
  <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${cy}" stroke="#111" stroke-width="1.4"/>
  <text x="${labelX}" y="${cy + 5}" font-family="var(--font-body),'Pretendard',sans-serif"
    font-size="13" font-weight="600" fill="#111" text-anchor="${anchor}">${label}</text>`
}

export const featureHotspotSplit = defineBlock<Data>({
  id: 'feature-hotspot-split',
  archetype: 'feature',
  // noimg-safe: 이미지 부재 시 핫스팟 영역 숨김 + 리스트 텍스트 전폭으로 강등
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 4, // heroImage(1) + 리스트 이미지(최대 4)
  describe:
    '제품 기능 복합 소개. 상단 컬러 배지+대형 제목+서브 카피, 중단 풀폭 제품 이미지에 SVG 선+레이블 핫스팟 오버레이(최대 3개), 하단 번호+제목+설명 ↔ 절반 이미지 좌우 교차 분할 리스트. 전자기기·가전·IT 기기에 최적.',
  schema,
  css: `
.frqo{background:var(--bg);color:var(--ink);padding-bottom:64px}

/* ── 헤더 영역 ── */
.frqo-hd{padding:52px var(--pad-x,56px) 32px}
.frqo-badge{display:inline-block;background:var(--accent);color:#fff;
  font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.08em;
  padding:7px 22px;border-radius:999px;margin-bottom:20px}
.frqo-title{font-family:var(--font-display);font-weight:800;font-size:52px;
  line-height:1.15;color:var(--ink);letter-spacing:-.02em}
.frqo-title .em{color:var(--accent)}
.frqo-sub{margin-top:14px;font-size:18px;font-weight:500;
  line-height:1.6;color:var(--ink-2)}
.frqo-sub .em{color:var(--accent);font-weight:700}

/* ── 핫스팟 이미지 영역 ── */
.frqo-hero{position:relative;width:100%;margin-bottom:0}
.frqo-hero-img{width:100%;aspect-ratio:740/500;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));display:block}
.frqo-hero-img.ph{display:none!important}
.frqo-hotspot-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
/* 이미지 없을 때 핫스팟 전체 숨김 */
.frqo-hero:not(:has(img:not(.ph))){display:none}

/* ── 교차 분할 리스트 ── */
.frqo-list{margin-top:4px}
.frqo-item{display:flex;align-items:stretch;min-height:320px}
.frqo-item.rev{flex-direction:row-reverse}

/* 텍스트 패널 */
.frqo-text{flex:0 0 50%;display:flex;align-items:center;
  padding:40px var(--pad-x,56px) 40px calc(var(--pad-x,56px) * 0.7)}
.frqo-item.rev .frqo-text{padding:40px calc(var(--pad-x,56px) * 0.7) 40px var(--pad-x,56px)}
.frqo-inner{width:100%}
.frqo-num{font-family:var(--font-display);font-weight:200;font-size:48px;
  color:var(--ink);line-height:1;margin-bottom:12px;letter-spacing:-.01em}
.frqo-item-title{font-family:var(--font-display);font-weight:700;font-size:24px;
  line-height:1.25;color:var(--ink);margin-bottom:10px}
.frqo-item-title .em{color:var(--accent)}
.frqo-item-desc{font-size:15px;font-weight:400;line-height:1.72;color:var(--ink-2)}
.frqo-item-desc .em{color:var(--accent);font-weight:700}

/* 이미지 패널 */
.frqo-img-wrap{flex:0 0 50%;overflow:hidden;background:var(--paper)}
.frqo-item-img{width:100%;height:100%;object-fit:cover;display:block}
/* 이미지 없을 때 텍스트 전폭 강등 */
.frqo-img-wrap:has(.ph){display:none}
.frqo-img-wrap:has(.ph) + .frqo-text,
.frqo-text:has(~ .frqo-img-wrap .ph){flex:0 0 100%;padding:32px var(--pad-x,56px)}
/* 홀짝 짝수 행 배경 약변화로 교차 리듬 */
.frqo-item:nth-child(even){background:color-mix(in srgb,var(--paper) 60%,var(--bg))}

/* 구분선 */
.frqo-divider{height:1px;background:var(--line);margin:0 var(--pad-x,56px)}
`,
  render: (d, { esc, richSafe }) => {
    // 핫스팟 SVG 오버레이 (이미지 있을 때만)
    const W = 740
    const H = 500
    const defaultAnchors = [
      { x: 0.26, y: 0.52 },
      { x: 0.50, y: 0.52 },
      { x: 0.76, y: 0.52 },
    ]
    const hotspotSvg =
      d.heroImage && d.hotspots && d.hotspots.length > 0
        ? `<svg class="frqo-hotspot-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
${d.hotspots
  .map((h, i) => {
    const ax = h.anchorX ?? defaultAnchors[i]?.x ?? 0.5
    const ay = h.anchorY ?? defaultAnchors[i]?.y ?? 0.5
    return renderHotspot(esc(h.label), ax, ay, i, W, H)
  })
  .join('')}
</svg>`
        : ''

    // 리스트 항목: 전체 이미지가 있으면 교차 레이아웃, 하나도 없으면 텍스트 전폭
    const anyItemImg = d.items.some((it) => typeof it.image === 'string' && it.image.length > 0)

    const itemsHtml = d.items
      .map((item, i) => {
        const num = String(i + 1).padStart(2, '0')
        const isRev = i % 2 === 1  // 짝수 인덱스(0-base) = 홀수 행 = 텍스트 왼쪽/이미지 오른쪽
        const revClass = isRev ? ' rev' : ''
        const imgHtml = anyItemImg
          ? `<div class="frqo-img-wrap">${media(item.image, 'frqo-item-img', esc(item.title))}</div>`
          : ''
        return `
<div class="frqo-item${revClass}">
  <div class="frqo-text">
    <div class="frqo-inner">
      <div class="frqo-num">${num}</div>
      <h3 class="frqo-item-title">${richSafe(item.title)}</h3>
      <p class="frqo-item-desc">${richSafe(item.desc)}</p>
    </div>
  </div>
  ${imgHtml}
</div>${i < d.items.length - 1 ? '<div class="frqo-divider"></div>' : ''}`
      })
      .join('')

    return `
<section class="frqo">
  <div class="frqo-hd">
    ${d.badge ? `<div class="frqo-badge">${esc(d.badge)}</div>` : ''}
    <h2 class="frqo-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="frqo-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  ${
    d.heroImage
      ? `<div class="frqo-hero">
    ${media(d.heroImage, 'frqo-hero-img', esc(d.title))}
    ${hotspotSvg}
  </div>`
      : ''
  }
  <div class="frqo-list">${itemsHtml}
  </div>
</section>`
  },
})
