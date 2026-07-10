/** HERO 아키타입: hero-catalog-slide
 *  피그마 073_인트로_32 흡수 — 전면 다크 IMG 배경 위 중앙 텍스트 스택.
 *  구조: 컬러 배지박스(브랜드 레이블) → 대제목 → 가로선 → 도트 페이지네이터(좌2·우3) →
 *       슬로건 → 헤어라인 → 하단 제품 이미지 프레임.
 *  카탈로그 슬라이드 느낌의 페이지네이터·구분선 장치가 핵심 아이덴티티.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandLabel: z.string().min(1),          // 배지박스 텍스트 (순수 텍스트)
  title: z.string().min(1),               // (em,br) 대제목 — ExtraBold 디스플레이
  slogan: z.string().min(1),              // (em,br) 슬로건 — 도트 페이지네이터 바로 아래
  image: z.string().optional(),           // (url) 하단 제품 대표 이미지
  pageTotal: z.number().int().min(1).max(9).optional(),  // 우측 도트 수 (기본 3)
  pageCurrent: z.number().int().min(1).max(9).optional(), // 현재 페이지 = 좌측 도트 수 (기본 2)
})
type Data = z.infer<typeof schema>

export const heroCatalogSlide = defineBlock<Data>({
  id: 'hero-catalog-slide',
  archetype: 'hero',
  styleTags: ['dark', 'editorial', 'catalog', 'fullbleed', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '카탈로그 슬라이드 히어로. 전면 다크 배경(또는 제품 사진 배경) 위에 중앙 정렬 텍스트 스택 — 컬러 배지박스·ExtraBold 대제목·도트 페이지네이터·슬로건·헤어라인·하단 제품 이미지. 무선청소기·전자기기·패션 등 프리미엄 제품 첫 화면에 적합.',
  schema,
  css: `
.hxzc{position:relative;overflow:hidden;background:var(--brand);min-height:760px;display:flex;flex-direction:column;align-items:center}
/* 배경 이미지 레이어 — 이미지 없으면 브랜드 단색으로 강등(noimg-safe) */
.hxzc-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;z-index:0;display:block}
.hxzc-bg.ph{display:none!important}
/* 스크림: 배경 이미지 위 텍스트 가독성 보장 */
.hxzc-scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(2,8,70,.72) 0%,rgba(2,8,70,.55) 48%,rgba(2,8,70,.82) 100%)}
/* 콘텐츠 스택 */
.hxzc-body{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center;padding:64px var(--pad-x,56px) 0}
/* 배지박스 */
.hxzc-badge{background:var(--brand);border:2px solid rgba(255,255,255,.18);padding:10px 28px;border-radius:calc(var(--r-scale,1)*6px);margin-bottom:0}
.hxzc-badge-text{font-family:var(--font-display);font-weight:600;font-size:18px;color:#fff;letter-spacing:.04em;line-height:1}
/* 구분선(배지↔대제목 사이) */
.hxzc-sep{width:100%;max-width:600px;height:1px;background:rgba(217,217,217,.35);margin:18px 0 0}
/* 대제목 */
.hxzc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,8vw,80px);color:var(--brand);text-align:center;line-height:1.08;margin-top:18px;letter-spacing:-.02em}
.hxzc-title .em{color:var(--em-dark,#FFF7EA)}
/* 도트 페이지네이터 */
.hxzc-paginator{display:flex;align-items:center;gap:28px;margin-top:26px}
.hxzc-dots{display:flex;gap:10px}
.hxzc-dot{width:10px;height:10px;border-radius:50%;background:var(--brand)}
.hxzc-dot.filled{background:#fff;opacity:.9}
.hxzc-dot.hollow{background:transparent;border:2px solid rgba(255,255,255,.45)}
/* 슬로건 */
.hxzc-slogan{font-family:var(--font-display);font-weight:500;font-size:clamp(28px,4.5vw,46px);color:#fff;text-align:center;line-height:1.22;margin-top:14px;letter-spacing:-.01em}
.hxzc-slogan .em{color:var(--em-dark,#FFF7EA)}
/* 헤어라인 */
.hxzc-hr{width:calc(100% - 64px);max-width:680px;height:1px;background:rgba(255,255,255,.25);margin:24px 0 0}
/* 하단 이미지 프레임 */
.hxzc-img-wrap{position:relative;z-index:2;width:100%;display:flex;justify-content:center;padding:0 var(--pad-x,56px);margin-top:32px}
.hxzc-img{width:calc(100% - 112px);max-width:340px;aspect-ratio:276/520;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));display:block}
.hxzc-img.ph{display:none!important}
/* 이미지 없는 강등 — 하단 여백으로 대체 */
.hxzc-noimg-pad{height:48px}
`,
  render: (d, { esc, richSafe }) => {
    const total = d.pageTotal ?? 3
    const current = Math.min(d.pageCurrent ?? 2, total)

    // 좌측 그룹: current개 점 (채워진 흰 점 = 현재 위치까지)
    const leftDots = Array.from({ length: current }, (_, i) =>
      `<span class="hxzc-dot ${i === current - 1 ? 'filled' : 'hollow'}"></span>`
    ).join('')

    // 우측 그룹: (total - current)개 점 (hollow — 남은 페이지)
    const rightCount = total - current
    const rightDots = rightCount > 0
      ? Array.from({ length: rightCount }, () =>
          `<span class="hxzc-dot hollow"></span>`
        ).join('')
      : ''

    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    return `
<section class="hxzc">
  ${hasImg ? `<img class="hxzc-bg" src="${d.image}" alt="">` : '<div class="hxzc-bg ph"></div>'}
  <div class="hxzc-scrim"></div>
  <div class="hxzc-body">
    <div class="hxzc-badge">
      <span class="hxzc-badge-text">${esc(d.brandLabel)}</span>
    </div>
    <div class="hxzc-sep"></div>
    <h1 class="hxzc-title">${richSafe(d.title)}</h1>
    <div class="hxzc-paginator">
      ${leftDots ? `<div class="hxzc-dots">${leftDots}</div>` : ''}
      ${rightDots ? `<div class="hxzc-dots">${rightDots}</div>` : ''}
    </div>
    <p class="hxzc-slogan">${richSafe(d.slogan)}</p>
    <div class="hxzc-hr"></div>
  </div>
  <div class="hxzc-img-wrap">
    ${hasImg
      ? `<img class="hxzc-img" src="${d.image}" alt="${esc(d.brandLabel)} 제품 이미지">`
      : '<div class="hxzc-noimg-pad"></div>'
    }
  </div>
</section>`
  },
})
