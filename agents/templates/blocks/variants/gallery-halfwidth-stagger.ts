/** GALLERY 아키타입: gallery-halfwidth-stagger (반폭 엇갈림 + 플로팅 라벨).
 *  Figma 12_갤러리 섹션 1284:2820 충실 재현.
 *  히어로 풀폭(그라데이션 오버레이+대형 제목) + 반폭 이미지 2개 좌/우 교대 배치 + 옆 플로팅 라벨/제목.
 *  gallery-stagger-rounded(라운드+오프셋만), gallery-caption-stack(풀폭+캡션)과 구조적으로 다름. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  heroImage: z.string().optional(),           // (url) 풀폭 히어로 이미지 (그라데이션 오버레이 배경)
  heroTitle: z.string().min(1),              // 히어로 대형 제목 (예: "DETAIL CUT") (em,br)
  heroSub: z.string().min(1).optional(),     // 히어로 부제목 (예: "제품 이미지 디테일 컷")
  panels: z
    .array(
      z.object({
        image: z.string().optional(),        // (url) 반폭 이미지
        alt: z.string().min(1).optional(),   // 이미지 접근성 설명
        label: z.string().min(1).optional(), // 플로팅 작은 라벨 (예: "01", "DETAIL") (em,br)
        title: z.string().min(1),           // 플로팅 제목 (em,br)
        desc: z.string().min(1).optional(), // 플로팅 보조 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const galleryHalfwidthStagger = defineBlock<Data>({
  id: 'gallery-halfwidth-stagger',
  archetype: 'gallery',
  styleTags: ['editorial', 'light', 'stagger', 'floating-label', 'premium'],
  imageSlots: 3,
  describe:
    '반폭 엇갈림 갤러리(플로팅 라벨). 히어로 풀폭(그라데이션+대형 제목) + 반폭 이미지 2–4장 좌/우 교대 + 옆 플로팅 라벨·제목·설명. 에디토리얼 갤러리 섹션.',
  schema,
  css: `
.ghws{background:var(--bg);color:var(--ink)}

/* ── 히어로: 풀폭 이미지 + 그라데이션 오버레이 + 중앙 제목 ── */
.ghws-hero{position:relative;width:100%;height:580px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.ghws-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.ghws-hero-grad{position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 72%,#000) 0%,color-mix(in srgb,var(--accent) 30%,transparent) 60%,transparent 100%)}
.ghws-hero-body{position:relative;z-index:2;text-align:center;padding:0 40px}
.ghws-hero-title{font-family:var(--font-display);font-weight:900;font-size:80px;letter-spacing:-.03em;line-height:1;color:#fff}
.ghws-hero-title .em{color:color-mix(in srgb,#fff 70%,var(--accent))}
.ghws-hero-sub{margin-top:14px;font-size:18px;color:rgba(255,255,255,.82);letter-spacing:.04em}

/* ── 반폭 패널 공통 ── */
.ghws-panels{display:flex;flex-direction:column;gap:0}

/* 패널 행: 이미지(~58%) + 플로팅 텍스트 사이드(~42%) */
.ghws-row{display:flex;align-items:stretch;min-height:380px}

/* 짝수 행: 이미지 왼쪽 */
.ghws-row-left .ghws-img-wrap{order:0}
.ghws-row-left .ghws-txt{order:1}

/* 홀수 행: 이미지 오른쪽 */
.ghws-row-right .ghws-img-wrap{order:1}
.ghws-row-right .ghws-txt{order:0}

/* 이미지 래퍼 */
.ghws-img-wrap{flex:0 0 58%;position:relative;overflow:hidden}
.ghws-panel-img{width:100%;height:100%;object-fit:cover;display:block}

/* 플로팅 텍스트 사이드 */
.ghws-txt{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 44px}
.ghws-txt-label{font-size:13px;font-weight:800;letter-spacing:.18em;color:var(--accent);text-transform:uppercase;margin-bottom:14px}
.ghws-txt-label .em{color:var(--accent-d)}
.ghws-txt-title{font-family:var(--font-display);font-weight:800;font-size:30px;letter-spacing:-.02em;line-height:1.25;color:var(--ink)}
.ghws-txt-title .em{color:var(--accent)}
.ghws-txt-desc{margin-top:16px;font-size:15px;line-height:1.75;color:var(--ink-2)}
.ghws-txt-desc .em{color:var(--accent);font-weight:600}

/* 행 사이 구분선 */
.ghws-row + .ghws-row{border-top:1px solid var(--line)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ghws">
  <!-- 히어로 풀폭 -->
  <div class="ghws-hero">
    ${d.heroImage ? media(d.heroImage, 'ghws-hero-img', esc(d.heroSub ?? 'hero')) : `<div class="ghws-hero-img ph">${esc(d.heroSub ?? 'hero image')}</div>`}
    <div class="ghws-hero-grad"></div>
    <div class="ghws-hero-body">
      <h2 class="ghws-hero-title">${richSafe(d.heroTitle)}</h2>
      ${d.heroSub ? `<p class="ghws-hero-sub">${esc(d.heroSub)}</p>` : ''}
    </div>
  </div>
  <!-- 반폭 엇갈림 패널 -->
  <div class="ghws-panels">
    ${d.panels
      .map(
        (p, i) => `
    <div class="ghws-row ${i % 2 === 0 ? 'ghws-row-right' : 'ghws-row-left'}">
      <div class="ghws-img-wrap">
        ${media(p.image, 'ghws-panel-img', esc(p.alt ?? `갤러리 이미지 ${i + 1}`))}
      </div>
      <div class="ghws-txt">
        ${p.label ? `<p class="ghws-txt-label">${richSafe(p.label)}</p>` : ''}
        <div class="ghws-txt-title">${richSafe(p.title)}</div>
        ${p.desc ? `<p class="ghws-txt-desc">${richSafe(p.desc)}</p>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
