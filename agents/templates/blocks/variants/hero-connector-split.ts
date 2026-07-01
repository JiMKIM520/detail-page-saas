/** HERO 아키타입 변형: hero-connector-split (01_인트로 / 1278:190).
 *  상단 영문 제품명+설명+풀폭 이미지 → 수직 커넥터 라인 → 하단 브랜드+대형 제목+원형 썸네일 번호 목록.
 *  라이트 배경. 두 섹션을 수직 선으로 연결한 2-블록 분리 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  productName: z.string().min(1),          // 영문 대형 제품명 — 상단 헤더 (em,br)
  subtitle: z.string().min(1).optional(),  // 한국어 제품 한 줄 설명 (em,br)
  heroImage: z.string().optional(),        // 상단 풀폭 제품 이미지 (url)
  brand: z.string().min(1),               // 브랜드 로고명 — 하단 eyebrow (plain)
  title: z.string().min(1),              // 대형 제품명 — 하단 섹션 (em,br)
  items: z
    .array(
      z.object({
        image: z.string().optional(),      // 원형 썸네일 (url)
        desc: z.string().min(1),           // 항목 설명 2줄 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroConnectorSplit = defineBlock<Data>({
  id: 'hero-connector-split',
  archetype: 'hero',
  styleTags: ['editorial', 'light', 'template', 'numbered', 'connector'],
  imageSlots: 5,
  describe:
    '수직 커넥터 라인 연결 2섹션 히어로. 상단: 영문 대형 제목+한국어 부제+풀폭 이미지. 수직 선 구분. 하단: 브랜드 eyebrow+대형 제품명+원형 썸네일 번호 목록(01~04). 라이트 배경 구조.',
  schema,
  css: `
/* ── hcs = hero-connector-split 접두사 ── */
.hcs{background:var(--bg);color:var(--ink);overflow:hidden}

/* ─ 상단 섹션 ─ */
.hcs-top{padding:56px 48px 0}
.hcs-product-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:48px;
  letter-spacing:-.02em;
  line-height:1.1;
  color:var(--ink);
  text-transform:uppercase
}
.hcs-product-name .em{color:var(--accent)}
.hcs-subtitle{
  margin-top:10px;
  font-family:var(--font-body);
  font-size:16px;
  color:var(--ink-2);
  line-height:1.6
}
.hcs-subtitle .em{color:var(--accent)}
.hcs-hero-wrap{
  margin-top:32px;
  width:100%;
  overflow:hidden;
  border-radius:12px;
  background:color-mix(in srgb,var(--accent) 12%,transparent)
}
.hcs-hero-img{
  width:100%;
  height:340px;
  object-fit:cover;
  display:block
}

/* ─ 수직 커넥터 라인 ─ */
.hcs-connector{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
  padding:0;
  margin:0 auto
}
.hcs-connector-line{
  width:1px;
  height:60px;
  background:linear-gradient(180deg,var(--line) 0%,var(--accent) 100%)
}
.hcs-connector-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:var(--accent)
}

/* ─ 하단 섹션 ─ */
.hcs-bottom{padding:0 48px 60px}
.hcs-brand{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:800;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:10px
}
.hcs-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:46px;
  letter-spacing:-.02em;
  line-height:1.1;
  color:var(--ink);
  margin-bottom:32px
}
.hcs-title .em{color:var(--accent)}

/* ─ 번호 목록 ─ */
.hcs-list{display:flex;flex-direction:column;gap:0}
.hcs-item{
  display:flex;
  align-items:center;
  gap:20px;
  padding:18px 0
}
.hcs-item + .hcs-item{
  border-top:1px solid var(--line)
}
.hcs-thumb{
  flex:0 0 72px;
  width:72px;
  height:72px;
  border-radius:50%;
  object-fit:cover;
  overflow:hidden
}
.hcs-item-right{flex:1;min-width:0}
.hcs-num{
  font-family:'Cafe24 ClassicType',serif;
  font-size:22px;
  color:var(--accent);
  line-height:1;
  margin-bottom:6px
}
.hcs-desc{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.7;
  color:var(--ink-2)
}
.hcs-desc .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="hcs">
  <!-- 상단: 영문 제품명 + 부제 + 풀폭 이미지 -->
  <div class="hcs-top">
    <h1 class="hcs-product-name">${richSafe(d.productName)}</h1>
    ${d.subtitle ? `<p class="hcs-subtitle">${richSafe(d.subtitle)}</p>` : ''}
    <div class="hcs-hero-wrap">
      ${media(d.heroImage, 'hcs-hero-img', esc(d.productName))}
    </div>
  </div>

  <!-- 수직 커넥터 라인 -->
  <div class="hcs-connector">
    <div class="hcs-connector-line"></div>
    <div class="hcs-connector-dot"></div>
    <div class="hcs-connector-line" style="height:30px;background:linear-gradient(180deg,var(--accent) 0%,var(--line) 100%)"></div>
  </div>

  <!-- 하단: 브랜드 eyebrow + 대형 제목 + 원형 썸네일 번호 목록 -->
  <div class="hcs-bottom">
    <p class="hcs-brand">${esc(d.brand)}</p>
    <h2 class="hcs-title disp">${richSafe(d.title)}</h2>
    <div class="hcs-list">
      ${d.items
        .map(
          (it, i) => `
      <div class="hcs-item">
        ${media(it.image, 'hcs-thumb', `항목 ${i + 1}`)}
        <div class="hcs-item-right">
          <div class="hcs-num">${pad2(i + 1)}</div>
          <div class="hcs-desc">${richSafe(it.desc)}</div>
        </div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`,
})
