/** GALLERY 아키타입: gallery-hero-hashtag-grid.
 *  전체폭 히어로 이미지 위 브랜드명 + 구분선 + 해시태그 배지 2행 오버레이 →
 *  하단 2열 3행 라운드 갤러리 그리드(6장) 조합. 라이트 배경.
 *  noimg-safe: 히어로·그리드 이미지 전부 없어도 배지+카피 레이아웃으로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subcopy: z.string().min(1),                 // 히어로 위 서브 캡션 (em,br 허용)
  brand: z.string().min(1),                   // 대형 브랜드명 / 제품명 (순수 텍스트)
  tags: z.array(z.string().min(1)).min(2).max(6), // 해시태그 문자열 ("# 포함 or 미포함" 모두 허용)
  hero: z.string().optional(),                // 히어로 배경 이미지 (url)
  images: z                                   // 갤러리 그리드 이미지 6장
    .array(z.object({ url: z.string().optional(), alt: z.string().min(1) }))
    .min(1)
    .max(6),
})
type Data = z.infer<typeof schema>

/** 해시태그 정규화: '#' 없으면 자동 추가 */
const normalizeTag = (t: string): string =>
  t.startsWith('#') ? t : `#${t}`

/** 배지 2행 분배: 절반씩 나눠 행 구성 (홀수면 첫 행이 1개 더) */
const splitRows = (tags: string[]): [string[], string[]] => {
  const mid = Math.ceil(tags.length / 2)
  return [tags.slice(0, mid), tags.slice(mid)]
}

export const galleryHeroHashtagGrid = defineBlock<Data>({
  id: 'gallery-hero-hashtag-grid',
  archetype: 'gallery',
  // noimg-safe: 히어로 미지정 시 그라디언트 배경으로 강등, 그리드 이미지 없으면 셀 숨김
  styleTags: ['light', 'editorial', 'product', 'noimg-safe'],
  imageSlots: 7,  // hero 1 + grid 6
  describe:
    '전체폭 히어로 이미지 위 서브카피+브랜드명+구분선+해시태그 배지 2행 오버레이, 하단 2열 3행 라운드 갤러리 그리드(최대 6장). 제품 갤러리/옵션 쇼케이스에 적합.',
  schema,
  css: `
.gheg{background:var(--bg);color:var(--ink)}

/* ── 히어로 영역 ── */
.gheg-hero{position:relative;width:100%;aspect-ratio:860/1300;overflow:hidden;background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,var(--bg)) 0%,var(--bg) 100%)}
.gheg-hero img,.gheg-hero .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.gheg-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.52) 0%,rgba(0,0,0,.12) 55%,rgba(0,0,0,0) 100%);display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding:0 var(--pad-x,56px) 48px}

/* 서브카피 */
.gheg-sub{font-size:22px;font-weight:500;color:rgba(255,255,255,.88);letter-spacing:.01em;text-align:center;margin-bottom:14px}
.gheg-sub .em{color:var(--em-dark,#FFF7EA)}

/* 브랜드명 */
.gheg-brand{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,9vw,90px);color:#fff;letter-spacing:-.02em;line-height:1.0;text-align:center}

/* 구분선 */
.gheg-div{width:min(600px,70%);height:2px;background:rgba(255,255,255,.4);margin:18px 0 20px}

/* 해시태그 배지 행 */
.gheg-tagrows{display:flex;flex-direction:column;gap:10px;align-items:center;width:100%}
.gheg-tagrow{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.gheg-tag{background:var(--brand);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-size:clamp(14px,1.8vw,18px);font-weight:600;padding:8px 20px;border-radius:calc(var(--r-scale,1)*8px);letter-spacing:.01em;white-space:nowrap}

/* ── 갤러리 그리드 ── */
.gheg-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(10px,1.8vw,20px);padding:clamp(20px,3vw,40px) var(--pad-x,56px) clamp(28px,4vw,56px)}
.gheg-cell{aspect-ratio:360/500;border-radius:var(--shape-photo,calc(var(--r-scale,1)*20px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--bg))}
.gheg-cell img,.gheg-cell .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
`,
  render: (d, { esc, richSafe }) => {
    const tags = d.tags.map(normalizeTag)
    const [row1, row2] = splitRows(tags)

    // 히어로 이미지 부재 시: overlay는 유지(배지+카피), hero 배경은 그라디언트 강등
    const heroImg = media(d.hero, 'gheg-heroimg', esc(d.brand))

    // 그리드: 있는 이미지만 렌더 (최대 6셀). 이미지 없는 슬롯은 .ph → display:none
    const cells = d.images.map((img) =>
      `<div class="gheg-cell">${media(img.url, 'gheg-cellimg', esc(img.alt))}</div>`
    ).join('')

    const renderRow = (row: string[]): string =>
      row.map(t => `<span class="gheg-tag">${esc(t)}</span>`).join('')

    return `
<section class="gheg">
  <div class="gheg-hero">
    ${heroImg}
    <div class="gheg-hero-overlay">
      <p class="gheg-sub">${richSafe(d.subcopy)}</p>
      <h2 class="gheg-brand">${esc(d.brand)}</h2>
      <div class="gheg-div"></div>
      <div class="gheg-tagrows">
        <div class="gheg-tagrow">${renderRow(row1)}</div>
        ${row2.length ? `<div class="gheg-tagrow">${renderRow(row2)}</div>` : ''}
      </div>
    </div>
  </div>
  <div class="gheg-grid">${cells}</div>
</section>`
  },
})
