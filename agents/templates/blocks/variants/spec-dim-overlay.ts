/** SPEC 아키타입: spec-dim-overlay.
 *  제품 실물 이미지 위에 SVG 치수선(가로·세로·깊이)과 mm 수치를 직접 오버레이한
 *  사이즈 인포그래픽 블록. 세로형 메인 이미지 좌측 + 소형 보조 이미지 우측 배치.
 *  이미지 부재 시 치수 텍스트 패널로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 레이블 (em 허용). 예: "제품 사이즈" */
  label: z.string().min(1),
  /** 섹션 영문 서브레이블. 예: "size info" */
  labelEn: z.string().optional(),
  /** 세로형 메인 제품 이미지 URL */
  image: z.string().optional(),
  /** 우측 소형 보조/디테일 이미지 URL */
  imageSub: z.string().optional(),
  /** 가로 치수 (예: "280mm") — 이미지 상단 가로선 오버레이 */
  dimWidth: z.string().min(1),
  /** 세로 치수 (예: "900mm") — 이미지 좌측 세로선 오버레이 */
  dimHeight: z.string().min(1),
  /** 깊이/두께 치수 (예: "150mm") — 이미지 하단 대각선 오버레이 */
  dimDepth: z.string().optional(),
  /** 보조 치수 레이블 (브리프 근거 시만). 예: "무게: 1.2kg" */
  dimExtra: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const specDimOverlay = defineBlock<Data>({
  id: 'spec-dim-overlay',
  archetype: 'spec',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '제품 사이즈 인포그래픽. 세로형 실물 이미지에 SVG 치수선(가로·세로·깊이)과 mm 수치를 직접 오버레이. 우측에 소형 보조 이미지 배치. 이미지 없을 때 치수 수치 카드 레이아웃으로 강등.',
  schema,
  css: `
.sfcj{background:var(--bg);padding:54px var(--pad-x,56px) 60px;color:var(--ink)}
/* 헤더 */
.sfcj-hd{display:flex;align-items:baseline;gap:16px;margin-bottom:36px}
.sfcj-label{font-family:var(--font-display);font-weight:700;font-size:38px;letter-spacing:-.02em;line-height:1.1;color:var(--ink)}
.sfcj-label .em{color:var(--accent)}
.sfcj-label-en{font-family:var(--font-lat,'Cormorant Garamond',serif);font-size:26px;font-weight:400;color:var(--ink);opacity:.38;letter-spacing:.02em}
/* 콘텐츠 행 */
.sfcj-row{display:flex;align-items:flex-start;gap:20px}
/* 메인 이미지 + 오버레이 래퍼 */
.sfcj-main{position:relative;flex:0 0 auto;width:316px}
.sfcj-main-img{width:316px;height:780px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));display:block}
.sfcj-main-img.ph{width:316px;height:780px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px))}
/* SVG 오버레이 — 이미지와 동일 크기로 절대 배치 */
.sfcj-svg{position:absolute;top:0;left:0;width:316px;height:780px;overflow:visible;pointer-events:none}
/* 우측 사이드바 */
.sfcj-side{flex:1;display:flex;flex-direction:column;gap:16px;padding-top:4px}
.sfcj-sub-img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:calc(var(--r-scale,1)*8px);display:block}
.sfcj-sub-img.ph{aspect-ratio:4/3;width:100%;border-radius:calc(var(--r-scale,1)*8px)}
/* 치수 카드 리스트 (이미지 있을 때도 사이드바 하단에 배치) */
.sfcj-dims{display:flex;flex-direction:column;gap:10px;margin-top:4px}
.sfcj-dim-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*8px);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;border:1.5px solid var(--line)}
.sfcj-dim-axis{font-family:var(--font-lat,'Cormorant Garamond',serif);font-size:13px;font-weight:500;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
.sfcj-dim-val{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--accent);letter-spacing:-.01em}
.sfcj-dim-extra{font-size:13px;color:var(--muted);margin-top:8px;padding:0 2px}
/* noimg-safe 강등: 이미지 없으면 메인 영역을 치수 텍스트 패널로 대체 */
.sfcj-fallback{width:316px;min-height:420px;background:var(--paper);border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));border:1.5px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:36px 24px}
.sfcj-fallback-dim{text-align:center}
.sfcj-fallback-axis{font-family:var(--font-lat,'Cormorant Garamond',serif);font-size:12px;font-weight:500;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
.sfcj-fallback-val{font-family:var(--font-display);font-size:40px;font-weight:800;color:var(--ink);letter-spacing:-.02em;line-height:1}
.sfcj-fallback-div{width:40px;height:1.5px;background:var(--line)}
`,
  render: (d, { esc, richSafe }) => {
    const hasMain = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const hasSub = typeof d.imageSub === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageSub.trim())

    // SVG 치수선 — 이미지(316×780) 기준 좌표
    // 가로선: 상단 근처 (y=80). 세로선: 좌측 (x=28). 깊이선: 우하단 대각
    const dimSvg = `
<svg class="sfcj-svg" viewBox="0 0 316 780" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <marker id="sfcj-arr-start" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M6 1 L1 3 L6 5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    </marker>
    <marker id="sfcj-arr-end" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
      <path d="M6 1 L1 3 L6 5" fill="none" stroke="currentColor" stroke-width="1.4"/>
    </marker>
  </defs>
  <g fill="none" stroke="var(--ink)" stroke-width="1.2" opacity="0.55"
     marker-start="url(#sfcj-arr-start)" marker-end="url(#sfcj-arr-end)">
    <!-- 가로(너비) 치수선: 상단 y=68 -->
    <line x1="52" y1="68" x2="264" y2="68"/>
    <!-- 세로(높이) 치수선: 좌측 x=28 -->
    <line x1="28" y1="90" x2="28" y2="690"/>
    ${d.dimDepth ? `<!-- 깊이 치수선: 우하단 짧은 대각 -->
    <line x1="234" y1="670" x2="272" y2="630"/>` : ''}
  </g>
  <!-- 가이드 단선(마커 없음) -->
  <g fill="none" stroke="var(--ink)" stroke-width="0.8" opacity="0.28" stroke-dasharray="3 3">
    <line x1="52" y1="40" x2="52" y2="80"/>
    <line x1="264" y1="40" x2="264" y2="80"/>
    <line x1="16" y1="90" x2="42" y2="90"/>
    <line x1="16" y1="690" x2="42" y2="690"/>
    ${d.dimDepth ? `<line x1="270" y1="680" x2="282" y2="668"/>` : ''}
  </g>
  <!-- 치수 텍스트 배경 필 -->
  <rect x="100" y="52" width="116" height="32" rx="4" fill="var(--bg)" opacity="0.82"/>
  <rect x="2" y="360" width="52" height="32" rx="4" fill="var(--bg)" opacity="0.82"/>
  ${d.dimDepth ? `<rect x="240" y="625" width="70" height="28" rx="4" fill="var(--bg)" opacity="0.82"/>` : ''}
  <!-- 치수 수치 텍스트 -->
  <text x="158" y="73" text-anchor="middle" font-family="'Pretendard',sans-serif" font-size="20" font-weight="600" fill="var(--ink)" opacity="0.75">${esc(d.dimWidth)}</text>
  <text x="28" y="380" text-anchor="middle" dominant-baseline="middle" font-family="'Pretendard',sans-serif" font-size="20" font-weight="600" fill="var(--ink)" opacity="0.75" transform="rotate(-90,28,376)">${esc(d.dimHeight)}</text>
  ${d.dimDepth ? `<text x="275" y="647" text-anchor="middle" font-family="'Pretendard',sans-serif" font-size="17" font-weight="600" fill="var(--ink)" opacity="0.75">${esc(d.dimDepth)}</text>` : ''}
</svg>`

    // 사이드바 치수 카드 (이미지 유무와 무관하게 노출)
    const dimCards = `
<div class="sfcj-dims">
  <div class="sfcj-dim-card">
    <span class="sfcj-dim-axis">Width</span>
    <span class="sfcj-dim-val">${esc(d.dimWidth)}</span>
  </div>
  <div class="sfcj-dim-card">
    <span class="sfcj-dim-axis">Height</span>
    <span class="sfcj-dim-val">${esc(d.dimHeight)}</span>
  </div>
  ${d.dimDepth ? `<div class="sfcj-dim-card">
    <span class="sfcj-dim-axis">Depth</span>
    <span class="sfcj-dim-val">${esc(d.dimDepth)}</span>
  </div>` : ''}
</div>
${d.dimExtra ? `<p class="sfcj-dim-extra">${esc(d.dimExtra)}</p>` : ''}`

    // 이미지 없을 때 메인 영역 강등 — 치수 3개를 세로 나열한 텍스트 패널
    const fallbackMain = `
<div class="sfcj-fallback" aria-label="제품 치수 요약">
  <div class="sfcj-fallback-dim">
    <p class="sfcj-fallback-axis">Width</p>
    <p class="sfcj-fallback-val">${esc(d.dimWidth)}</p>
  </div>
  <div class="sfcj-fallback-div" role="separator"></div>
  <div class="sfcj-fallback-dim">
    <p class="sfcj-fallback-axis">Height</p>
    <p class="sfcj-fallback-val">${esc(d.dimHeight)}</p>
  </div>
  ${d.dimDepth ? `<div class="sfcj-fallback-div" role="separator"></div>
  <div class="sfcj-fallback-dim">
    <p class="sfcj-fallback-axis">Depth</p>
    <p class="sfcj-fallback-val">${esc(d.dimDepth)}</p>
  </div>` : ''}
</div>`

    return `
<section class="sfcj">
  <div class="sfcj-hd">
    <h2 class="sfcj-label">${richSafe(d.label)}</h2>
    ${d.labelEn ? `<span class="sfcj-label-en">${esc(d.labelEn)}</span>` : ''}
  </div>
  <div class="sfcj-row">
    <div class="sfcj-main">
      ${hasMain
        ? `${media(d.image, 'sfcj-main-img', '제품 사이즈 실물')}${dimSvg}`
        : fallbackMain}
    </div>
    <div class="sfcj-side">
      ${hasSub ? media(d.imageSub, 'sfcj-sub-img', '제품 디테일') : ''}
      ${dimCards}
    </div>
  </div>
</section>`
  },
})
