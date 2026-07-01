/** GALLERY 아키타입(템플릿 충실 재현): gallery-color-panel.
 *  Figma 12_갤러리 섹션 576:359 — 교대 풀폭 컬러블록 2패널.
 *  구조: 2개의 풀폭 컬러 패널 세로 스택.
 *  각 패널: 중앙 정렬 대형 영문 제목(OPTION) + 부제/설명 + 정사각 이미지.
 *  패널1은 진한 accent 배경, 패널2는 연한 accent 배경(color-mix 50%)로 교대.
 *  gallery-options(pill+라인), gallery-ribbon-card(흰카드+리본), gallery-numbered-badge(타원배지)와 다른
 *  "교대 컬러 풀블리드 패널 + 텍스트 위·이미지 아래" 옵션 쇼케이스. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  panels: z
    .array(
      z.object({
        heading: z.string().min(1),           // 패널 대형 영문 제목 (예: "OPTION")
        subtitle: z.string().min(1).optional(), // 패널 부제 / 제품 설명 (em,br)
        image: z.string().optional(),          // 정사각 이미지 (url)
        imageAlt: z.string().min(1).optional(), // 이미지 대체 텍스트
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const galleryColorPanel = defineBlock<Data>({
  id: 'gallery-color-panel',
  archetype: 'gallery',
  styleTags: ['colorblock', 'template', 'bold', 'centered'],
  imageSlots: 4,
  describe:
    '교대 컬러블록 패널 갤러리. 풀폭 진/연 accent 배경이 교대되는 패널(2–4개) 각각 중앙 대형 영문 제목 + 부제 + 정사각 이미지 구조. 강한 컬러 임팩트 옵션 쇼케이스.',
  schema,
  css: `
.gcp{padding:0}
/* ── 패널 공통 ── */
.gcp-panel{text-align:center;padding:52px 44px 56px;color:#fff}
.gcp-panel:nth-child(odd){background:var(--accent)}
.gcp-panel:nth-child(even){background:color-mix(in srgb,var(--accent) 50%,#fff)}
/* ── 헤딩 ── */
.gcp-heading{font-family:var(--font-display);font-weight:900;font-size:72px;letter-spacing:-.01em;line-height:1;color:#fff}
/* ── 부제 ── */
.gcp-sub{margin-top:14px;font-size:18px;font-weight:500;color:rgba(255,255,255,.88);line-height:1.6}
.gcp-sub .em{font-weight:800;color:#fff}
/* ── 정사각 이미지 ── */
.gcp-sq{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;margin-top:36px;border-radius:4px}
`,
  render: (d, { esc, richSafe }) => `
<section class="gcp">
  ${d.panels
    .map(
      (p, i) => `
  <div class="gcp-panel">
    <h2 class="gcp-heading">${esc(p.heading)}</h2>
    ${p.subtitle ? `<p class="gcp-sub">${richSafe(p.subtitle)}</p>` : ''}
    ${media(p.image, 'gcp-sq', p.imageAlt ?? `옵션 ${i + 1} 이미지`)}
  </div>`,
    )
    .join('')}
</section>`,
})
