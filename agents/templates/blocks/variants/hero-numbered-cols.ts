/** HERO 아키타입(템플릿 충실 재현): hero-numbered-cols.
 *  와디즈 200섹션 01_인트로 #1278:127 패턴 재구성.
 *  레이아웃: accent 풀배경 → 브랜드 로고 상단 바 →
 *  중앙정렬 부제목 + 대형 제품명 헤드라인 →
 *  풀폭 제품 이미지(정사각형) →
 *  01/02/03 세로 구분선 3열 숫자+설명. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandLogo: z.string().optional(),          // 상단 바 브랜드명 텍스트
  subtitle: z.string().optional(),           // 제품 부제목 (em,br)
  productName: z.string().min(1),            // 대형 제품명 헤드라인 (em,br)
  productImage: z.string().optional(),       // 풀폭 제품 이미지 (url)
  cols: z
    .array(
      z.object({
        desc: z.string().min(1),             // 숫자 아래 설명 텍스트 (em,br)
      }),
    )
    .min(2)
    .max(4),                                 // 구분선 컬럼 (기본 3개)
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const heroNumberedCols = defineBlock<Data>({
  id: 'hero-numbered-cols',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'colorblock', 'numbered', 'columns'],
  imageSlots: 1,
  describe:
    'accent 풀배경 히어로. 상단 브랜드 바 + 중앙 부제목+대형 제품명 + 풀폭 제품 이미지 + 01/02/03 세로 구분선 3열 숫자+설명. 인트로+차별화 포인트 복합형.',
  schema,
  css: `
/* ── hnc = hero-numbered-cols 접두사 ── */
.hnc{background:var(--accent);color:#fff;overflow:hidden;margin:0;padding:0}

/* ─ 상단 브랜드 로고 바 ─ */
.hnc-bar{
  background:#111;
  padding:14px 0;
  text-align:center
}
.hnc-bar-logo{
  font-family:var(--font-display);
  font-weight:700;
  font-size:15px;
  letter-spacing:.12em;
  color:#fff
}

/* ─ 헤드라인 존 ─ */
.hnc-hd{
  padding:52px 52px 40px;
  text-align:center
}
.hnc-subtitle{
  font-size:16px;
  font-weight:500;
  color:rgba(255,255,255,.82);
  margin-bottom:14px;
  letter-spacing:.02em;
  line-height:1.5
}
.hnc-subtitle .em{color:#fff;font-weight:700}
.hnc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:58px;
  letter-spacing:-.025em;
  line-height:1.1;
  color:#fff;
  text-shadow:0 2px 18px rgba(0,0,0,.18)
}
.hnc-title .em{color:color-mix(in srgb,var(--ink) 20%,#fff)}

/* ─ 제품 이미지 ─ */
.hnc-img-wrap{
  margin:0 32px 0;
  border-radius:18px;
  overflow:hidden;
  background:rgba(255,255,255,.18);
  border:2px solid rgba(255,255,255,.28)
}
.hnc-img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block
}

/* ─ 숫자 컬럼 존 ─ */
.hnc-cols{
  display:flex;
  align-items:stretch;
  margin:0;
  padding:36px 0 48px
}
.hnc-col{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:0 20px;
  text-align:center
}
.hnc-col + .hnc-col{
  border-left:1px solid rgba(255,255,255,.35)
}
.hnc-num{
  font-family:'Cafe24 ClassicType',var(--font-display),serif;
  font-size:40px;
  font-weight:400;
  color:rgba(255,255,255,.95);
  line-height:1;
  margin-bottom:14px;
  letter-spacing:.04em
}
.hnc-desc{
  font-size:14px;
  color:rgba(255,255,255,.88);
  line-height:1.65;
  font-weight:400
}
.hnc-desc .em{color:#fff;font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="hnc">
  <!-- 브랜드 로고 바 -->
  <div class="hnc-bar">
    <span class="hnc-bar-logo">${d.brandLogo ? esc(d.brandLogo) : ''}</span>
  </div>

  <!-- 헤드라인 -->
  <div class="hnc-hd">
    ${d.subtitle ? `<p class="hnc-subtitle">${richSafe(d.subtitle)}</p>` : ''}
    <h1 class="hnc-title">${richSafe(d.productName)}</h1>
  </div>

  <!-- 제품 이미지 -->
  <div class="hnc-img-wrap">
    ${media(d.productImage, 'hnc-img', esc(d.productName))}
  </div>

  <!-- 01/02/03 컬럼 -->
  <div class="hnc-cols">
    ${d.cols
      .map(
        (col, i) => `
    <div class="hnc-col">
      <div class="hnc-num">${pad2(i + 1)}</div>
      <div class="hnc-desc">${richSafe(col.desc)}</div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
