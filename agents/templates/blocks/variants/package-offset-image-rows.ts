/** LINEUP 아키타입(템플릿 충실 재현): 08_상품구성 _571:580 이중룰 헤더 + 좌 오프셋 이미지 행.
 *  package-offset-image-rows: 이중 수평선 + 좌정렬 대형 디스플레이 제목 + 3개 패키지 행.
 *  각 행은 좌측 오프셋 이미지(큰 우하 라운드) + 우측 우정렬 이름/설명/가격 텍스트 블록.
 *  package-list(등분 flex 레이아웃)·package-band-rows(이미지 없음)와 다른 비대칭 오프셋 구성.
 *  와디즈 200섹션 08_상품구성 Figma 571:580 패턴을 토큰 기반 재구성(클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(),           // 대형 좌정렬 디스플레이 제목 (em,br 허용)
  subtitle: z.string().min(1).optional(),        // 제목 아래 소제목
  packages: z
    .array(
      z.object({
        image: z.string().optional(),            // 좌 오프셋 정사각형 이미지 (url)
        name: z.string().min(1),                 // 패키지명, 우정렬 (em,br 허용)
        desc: z.string().min(1).optional(),      // 패키지 설명 2행, 우정렬 (em,br 허용)
        priceOriginal: z.string().min(1).optional(), // 정가(취소선)
        price: z.string().min(1).optional(),     // 최종가 (bold)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageOffsetImageRows = defineBlock<Data>({
  id: 'package-offset-image-rows',
  archetype: 'lineup',
  styleTags: ['light', 'editorial', 'pricing', 'template', 'asymmetric'],
  imageSlots: 3,
  describe:
    '상품 구성(좌 오프셋 이미지 행). 이중 수평선 + 좌정렬 대형 제목/소제목 + 패키지 행마다 좌 오프셋 이미지(큰 우하 라운드)·우측 우정렬 이름/설명/가격. 비대칭 에디토리얼 가격표. 가격/구성은 brief 근거만.',
  schema,
  css: `
.poir{background:color-mix(in srgb,var(--accent) 18%,var(--bg));color:var(--ink);padding:0 0 56px}
.poir-rules{padding:28px 0 0}
.poir-rule{height:1px;background:var(--accent);opacity:.55;margin:0 40px}
.poir-rule+.poir-rule{margin-top:5px}
.poir-hd{padding:38px 44px 0}
.poir-title{font-family:var(--font-display);font-weight:800;font-size:68px;color:var(--accent);letter-spacing:-.02em;line-height:1.05}
.poir-title .em{color:var(--accent-d)}
.poir-sub{margin-top:10px;font-size:15px;color:var(--ink-2);line-height:1.55}
.poir-rows{margin-top:36px}
.poir-row{display:grid;grid-template-columns:46% 1fr;align-items:center;padding:0 0 0 40px;min-height:260px}
.poir-row+.poir-row{border-top:1px solid color-mix(in srgb,var(--accent) 30%,transparent);margin-top:2px;padding-top:2px}
.poir-img-wrap{position:relative;padding:16px 0 16px}
.poir-img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px 0 60px 12px;display:block}
.poir-body{padding:24px 36px 24px 20px;text-align:right;display:flex;flex-direction:column;gap:0;justify-content:center}
.poir-name{font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--accent);line-height:1.2}
.poir-name .em{color:var(--accent-d)}
.poir-desc{margin-top:8px;font-size:14px;color:var(--ink-2);line-height:1.6}
.poir-divider{height:1px;background:var(--line);margin:14px 0}
.poir-price{display:flex;align-items:baseline;justify-content:flex-end;gap:10px}
.poir-orig{font-size:14px;color:var(--muted);text-decoration:line-through}
.poir-final{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => `
<section class="poir">
  <div class="poir-rules">
    <div class="poir-rule"></div>
    <div class="poir-rule"></div>
  </div>
  <div class="poir-hd">
    <h2 class="poir-title">${richSafe(d.title ?? "WHAT'S FOR YOU?")}</h2>
    ${d.subtitle ? `<p class="poir-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="poir-rows">
    ${d.packages
      .map(
        (p) => `
    <div class="poir-row">
      <div class="poir-img-wrap">
        ${media(p.image, 'poir-img', '패키지 이미지')}
      </div>
      <div class="poir-body">
        <div class="poir-name">${richSafe(p.name)}</div>
        ${p.desc ? `<div class="poir-desc">${richSafe(p.desc)}</div>` : ''}
        ${p.price || p.priceOriginal ? `
        <div class="poir-divider"></div>
        <div class="poir-price">
          ${p.priceOriginal ? `<span class="poir-orig">${esc(p.priceOriginal)}</span>` : ''}
          ${p.price ? `<span class="poir-final">${esc(p.price)}</span>` : ''}
        </div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
