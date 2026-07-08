/** GALLERY 아키타입: gallery-options (옵션/갤러리 쇼케이스). Figma 200섹션 12_갤러리 패턴 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(), // 기본 "PRODUCT DETAIL"
  items: z
    .array(z.object({ label: z.string().min(1), caption: z.string().min(1).optional(), image: z.string().optional() }))
    .min(1)
    .max(6),
})
type Data = z.infer<typeof schema>

export const galleryOptions = defineBlock<Data>({
  id: 'gallery-options',
  archetype: 'gallery',
  styleTags: ['editorial', 'minimal', 'premium'],
  imageSlots: 6,
  describe: '옵션/갤러리. eyebrow + 다크 OPTION pill + 캡션 + 연결선 + 풀폭 이미지 (옵션별 반복).',
  schema,
  css: `
.gl{position:relative;padding:56px var(--pad-x,56px) 60px;background:var(--bg)}
.gl-item{text-align:center}
.gl-item + .gl-item{margin-top:48px}
.gl-eye{font-family:var(--font-serif);font-weight:700;font-size:18px;letter-spacing:.2em;color:var(--ink);text-transform:uppercase}
.gl-pill{display:inline-block;margin-top:14px;background:var(--brand);color:#fff;font-family:var(--font-display);font-size:26px;padding:8px 30px;border-radius:calc(var(--r-scale,1)*8px)}
.gl-cap{margin-top:12px;font-size:16px;color:var(--ink-2)}
.gl-line{width:1px;height:40px;background:var(--line);margin:18px auto 0}
.gl-media{width:100%;height:520px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));margin-top:18px}
`,
  render: (d, { esc }) => `
<section class="gl">
  <div class="wm"></div>
  ${d.items
    .map(
      (it) =>
        `<div class="gl-item"><div class="gl-eye">${esc(d.eyebrow ?? 'PRODUCT DETAIL')}</div><div class="gl-pill">${esc(it.label)}</div>${it.caption ? `<div class="gl-cap">${esc(it.caption)}</div>` : ''}<div class="gl-line"></div>${media(it.image, 'gl-media', '옵션 이미지')}</div>`,
    )
    .join('')}
</section>`,
})
