/** GALLERY 아키타입: gallery-stagger-rounded (엇갈림 대형 라운드 이미지).
 *  Figma 12_갤러리 섹션 407:211 충실 재현.
 *  좌정렬 섹션 헤더 + 대형 라운드(반경 큰) 이미지 3개 좌/우 오프셋 엇갈림. 캡션 없음.
 *  gallery-caption-stack(풀폭+캡션), gallery-grid(번호+액자)와 구조적으로 다름. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  sectionSub: z.string().min(1).optional(),  // 섹션 제목 위 작은 부제 (예: "제품 이미지 디테일 컷")
  sectionTitle: z.string().min(1),           // 좌정렬 대형 섹션 제목 (예: "DETAIL")
  images: z
    .array(
      z.object({
        image: z.string().optional(),        // (url) 라운드 이미지
        alt: z.string().min(1).optional(),   // 이미지 설명 (접근성)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const galleryStaggerRounded = defineBlock<Data>({
  id: 'gallery-stagger-rounded',
  archetype: 'gallery',
  styleTags: ['editorial', 'light', 'rounded', 'stagger', 'minimal'],
  imageSlots: 3,
  describe:
    '엇갈림 대형 라운드 갤러리. 좌정렬 섹션 헤더 + 큰 라운드 이미지 2–4장 좌/우 오프셋 엇갈림. 캡션 없음. 여백·리듬감 중심.',
  schema,
  css: `
.gsr{background:var(--bg);padding:52px 0 64px}
/* ── 섹션 헤더 ── */
.gsr-hd{padding:0 48px 44px}
.gsr-sub{font-size:15px;color:var(--ink-2);margin-bottom:8px;letter-spacing:.01em}
.gsr-title{font-family:var(--font-display);font-weight:900;font-size:68px;letter-spacing:-.03em;line-height:1;color:var(--ink)}
/* ── 이미지 스택 ── */
.gsr-stack{display:flex;flex-direction:column;gap:28px}
/* 이미지 공통: 큰 라운드 */
.gsr-img{width:100%;height:420px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*40px));display:block}
/* 홀수(1,3번째): 왼쪽 고정, 오른쪽만 여백 */
.gsr-slot-left{padding:0 80px 0 0}
/* 짝수(2번째): 오른쪽 고정, 왼쪽만 여백 */
.gsr-slot-right{padding:0 0 0 80px}
`,
  render: (d, { esc }) => `
<section class="gsr">
  <div class="gsr-hd">
    ${d.sectionSub ? `<p class="gsr-sub">${esc(d.sectionSub)}</p>` : ''}
    <h2 class="gsr-title">${esc(d.sectionTitle)}</h2>
  </div>
  <div class="gsr-stack">
    ${d.images
      .map(
        (it, i) => `
    <div class="${i % 2 === 0 ? 'gsr-slot-left' : 'gsr-slot-right'}">
      ${media(it.image, 'gsr-img', esc(it.alt ?? `갤러리 이미지 ${i + 1}`))}
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
