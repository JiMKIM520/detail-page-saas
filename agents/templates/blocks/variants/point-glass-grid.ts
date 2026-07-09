/** POINT 아키타입: point-glass-grid
 *  피그마 040_제품소개_01 재구성.
 *  구조: 전폭 배경사진 + 제품명 오버레이 → 하단 2×2 반투명 글라스 카드 그리드.
 *  각 카드: 번호 레이블("point 0N.") + 원형 대표 이미지 + 키워드 제목 + 설명 2줄.
 *  noimg-safe: 배경 이미지 없으면 브랜드 딥톤 그라데이션으로 강등, 카드 이미지 없으면 원형 틴트 패널.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pointCardSchema = z.object({
  label: z.string().min(1),         // "point 01." 형식 or 사용자 정의
  image: z.string().optional(),     // (url) 원형 대표 이미지
  keyword: z.string().min(1),       // 카드 키워드 제목 (em 허용)
  text: z.string().min(1),          // 2줄 이내 설명 (em 허용)
})

const schema = z.object({
  bgImage: z.string().optional(),   // (url) 상단 전폭 배경 이미지
  title: z.string().min(1),         // 배경 위 제품명 오버레이 (br 허용)
  points: z
    .array(pointCardSchema)
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const pointGlassGrid = defineBlock<Data>({
  id: 'point-glass-grid',
  archetype: 'point',
  styleTags: ['light', 'warm', 'food', 'noimg-safe'],
  imageSlots: 5,  // 배경 1 + 카드 최대 4
  describe:
    '제품 포인트 2×2 글라스 카드 그리드. 상단 전폭 배경사진+제품명 오버레이, 하단 4개 반투명 라운드 카드(번호레이블·원형이미지·키워드·설명). 식품/건강/뷰티 포인트 강조에 적합.',
  schema,
  css: `
.pcgc{background:var(--bg);color:var(--ink)}

/* ── 히어로 영역 ── */
.pcgc-hero{
  position:relative;
  width:100%;
  aspect-ratio:860/1200;
  overflow:hidden;
  background:var(--brand);
  display:flex;align-items:center;justify-content:center
}
.pcgc-hero-bg{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;
  display:block
}
/* noimg-safe: 배경 이미지 없을 때 브랜드 그라데이션 폴백 */
.pcgc-hero.no-bg{
  background:linear-gradient(160deg,var(--brand) 0%,var(--accent-d) 100%)
}
.pcgc-hero-overlay{
  position:relative;z-index:2;
  text-align:center;
  padding:0 var(--pad-x,56px);
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(48px,8vw,100px);
  line-height:1.15;
  color:var(--bg);
  text-shadow:0 4px 24px rgba(42,33,24,.28)
}
.pcgc-hero-overlay .em{color:var(--em-dark,#FFF7EA)}

/* ── 카드 그리드 ── */
.pcgc-grid{
  padding:48px var(--pad-x,56px) 60px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px
}
.pcgc-card{
  background:rgba(255,255,255,0.30);
  border-radius:calc(var(--r-scale,1)*30px);
  padding:28px 24px 32px;
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  gap:0;
  backdrop-filter:blur(4px);
  -webkit-backdrop-filter:blur(4px);
  border:1px solid rgba(255,255,255,0.45)
}
.pcgc-label{
  font-family:var(--font-hand,'Cafe24 Dangdanghae',cursive);
  font-size:18px;
  font-weight:400;
  color:var(--accent);
  letter-spacing:.02em;
  margin-bottom:14px
}
/* 원형 이미지 프레임 */
.pcgc-thumb{
  width:120px;height:120px;
  border-radius:50%;
  object-fit:cover;
  display:block;
  background:color-mix(in srgb,var(--accent) 12%,transparent);
  /* shape-photo는 원형 전용이라 var(--shape-photo) 미사용 — 50% 고정 */
  flex-shrink:0
}
.pcgc-thumb.ph{
  display:block!important;
  width:120px;height:120px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 10%,var(--bg) 90%);
  border:none
}
.pcgc-keyword{
  margin-top:16px;
  font-family:var(--font-display);
  font-size:22px;
  font-weight:700;
  line-height:1.3;
  color:var(--accent-d)
}
.pcgc-keyword .em{color:var(--accent)}
.pcgc-text{
  margin-top:8px;
  font-size:15px;
  font-weight:500;
  line-height:1.65;
  color:var(--accent-d);
  opacity:.85
}
.pcgc-text .em{color:var(--accent);font-weight:700;opacity:1}
`,
  render: (d, { esc, richSafe }) => {
    const hasBg = typeof d.bgImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.bgImage.trim())

    const cards = d.points
      .slice(0, 4)
      .map(
        (p) => `
    <div class="pcgc-card">
      <span class="pcgc-label">${esc(p.label)}</span>
      ${media(p.image, 'pcgc-thumb', esc(p.keyword))}
      <p class="pcgc-keyword">${richSafe(p.keyword)}</p>
      <p class="pcgc-text">${richSafe(p.text)}</p>
    </div>`,
      )
      .join('')

    return `
<section class="pcgc">
  <div class="pcgc-hero${hasBg ? '' : ' no-bg'}">
    ${hasBg ? media(d.bgImage, 'pcgc-hero-bg', '제품 배경') : ''}
    <h2 class="pcgc-hero-overlay">${richSafe(d.title)}</h2>
  </div>
  <div class="pcgc-grid">
    ${cards}
  </div>
</section>`
  },
})
