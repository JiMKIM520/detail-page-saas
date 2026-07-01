/** GALLERY 아키타입(템플릿 충실 재현): gallery-numbered-strip.
 *  Figma 12_갤러리 섹션 1284:2711 — 번호 풀폭 스트립 갤러리.
 *  솔리드 accent 배경 헤더(대형 display 제목 + 소형 부제) +
 *  4개 풀폭 이미지 스트립 스택, 각 스트립 상단에 accent 컬러 밴드 +
 *  좌측 가장자리에 큰 장식 디스플레이 숫자(01–04) 오버레이.
 *  gallery-options(pill+라인), gallery-numbered-badge(타원 배지+헤어라인),
 *  gallery-grid(액자 그리드), gallery-caption-stack(캡션 중앙)과 모두 다른
 *  "솔리드 컬러 헤더 + 번호 밴드 스트립" 디자인. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  title: z.string().min(1),               // 헤더 대형 display 제목 (em,br 가능)
  subtitle: z.string().min(1).optional(), // 헤더 소형 부제 (plain)
  images: z
    .array(z.string().optional())
    .min(2)
    .max(4),                             // 각 스트립 풀폭 이미지 (url), 2~4개
})
type Data = z.infer<typeof schema>

export const galleryNumberedStrip = defineBlock<Data>({
  id: 'gallery-numbered-strip',
  archetype: 'gallery' as any,
  styleTags: ['premium', 'editorial', 'colorblock', 'template', 'dark'],
  imageSlots: 4,
  describe:
    '번호 풀폭 스트립 갤러리. accent 솔리드 배경 헤더(대형 display 제목+소형 부제) + 풀폭 이미지 스트립 2–4개 스택, 각 스트립 상단 accent 밴드에 대형 장식 숫자(01–04) 좌측 오버레이. 캡션 없는 임팩트 컷 쇼케이스.',
  schema,
  css: `
.gns{background:var(--accent);color:#fff}
/* ── 헤더 ── */
.gns-hd{padding:56px 56px 64px}
.gns-title{font-family:var(--font-display);font-weight:800;font-size:80px;letter-spacing:-.03em;line-height:1;color:#fff}
.gns-title .em{color:color-mix(in srgb,#fff 60%,var(--accent-d))}
.gns-sub{margin-top:14px;font-size:16px;font-weight:400;color:rgba(255,255,255,.78);letter-spacing:.01em}
/* ── 스트립 ── */
.gns-strip{position:relative;background:var(--accent)}
/* accent 번호 밴드 */
.gns-band{position:relative;background:var(--accent);height:72px;display:flex;align-items:flex-end;padding:0 48px 0}
/* 대형 장식 숫자 */
.gns-num{font-family:'Cormorant Garamond',var(--font-serif),serif;font-weight:500;font-size:64px;line-height:1;color:rgba(255,255,255,.55);letter-spacing:-.01em;user-select:none;pointer-events:none}
/* 풀폭 이미지 */
.gns-img{width:100%;height:420px;object-fit:cover;display:block}
`,
  render: (d, { esc, richSafe }) => `
<section class="gns">
  <div class="gns-hd">
    <h2 class="gns-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="gns-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${d.images
    .map(
      (url, i) => `
  <div class="gns-strip">
    <div class="gns-band">
      <span class="gns-num">${pad2(i + 1)}</span>
    </div>
    ${media(url, 'gns-img', `디테일 컷 ${pad2(i + 1)}`)}
  </div>`,
    )
    .join('')}
</section>`,
})
