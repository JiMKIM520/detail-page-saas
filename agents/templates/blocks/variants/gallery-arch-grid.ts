/** GALLERY 아키타입: gallery-arch-grid (2×2 아치 이미지 그리드).
 *  Figma 12_갤러리 359:668 충실 재현.
 *  히어로 이미지 → 타원 Option 라벨 → 2×2 아치 그리드 (헤딩 존 없음, 셀 캡션 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  heroImage: z.string().optional(),             // (url) 히어로 풀폭 이미지
  optionLabel: z.string().min(1).optional(),    // 타원 라벨 텍스트 (기본 "Option")
  images: z
    .array(
      z.object({
        image: z.string().optional(),           // (url) 아치 셀 이미지
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const galleryArchGrid = defineBlock<Data>({
  id: 'gallery-arch-grid',
  archetype: 'gallery',
  styleTags: ['editorial', 'soft', 'premium', 'template', 'arch'],
  imageSlots: 5,
  describe:
    '갤러리(2×2 아치 그리드). 히어로 이미지 → 연보라 배경 + 타원 Option 라벨 → 2×2 아치형(상단 둥근) 이미지 그리드. 헤딩 존 없음, 셀 캡션 없음. 소프트 프리미엄.',
  schema,
  css: `
.gag{background:var(--bg);color:var(--ink)}

/* ── 히어로 영역 ── */
.gag-hero{width:100%}
.gag-hero-img{width:100%;height:480px;object-fit:cover;display:block}

/* ── 옵션 그리드 영역 ── */
.gag-panel{background:color-mix(in srgb,var(--accent) 14%,var(--paper));padding:40px 28px 52px}

/* 타원 Option 라벨 */
.gag-option{text-align:center;margin-bottom:32px}
.gag-oval{display:inline-block;padding:11px 52px;border:1.5px solid var(--ink);border-radius:999px;font-size:18px;font-weight:500;color:var(--ink);letter-spacing:.04em;background:transparent}

/* 2×2 아치 그리드 */
.gag-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.gag-cell{display:block}
.gag-arch{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:999px 999px 0 0;display:block;background:color-mix(in srgb,var(--paper) 80%,transparent)}
`,
  render: (d, { esc }) => `
<section class="gag">
  <div class="gag-hero">
    ${d.heroImage
      ? media(d.heroImage, 'gag-hero-img', '제품 이미지')
      : `<div class="gag-hero-img ph"></div>`}
  </div>
  <div class="gag-panel">
    <div class="gag-option">
      <span class="gag-oval">${esc(d.optionLabel ?? 'Option')}</span>
    </div>
    <div class="gag-grid">
      ${d.images
        .map(
          (it) => `
      <div class="gag-cell">
        ${media(it.image, 'gag-arch', '옵션 이미지')}
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`,
})
