/** HERO 아키타입(템플릿 충실 재현): intro-cover.
 *  와디즈 200섹션 01_인트로 섹션_01 패턴 재구성.
 *  상단 그라디언트 헤더(브랜드 + 소제목 + 대제목) → 풀폭 제품 이미지 슬롯 →
 *  하단 대비 패널(원형 아이콘 3포인트 행). 기존 hero-points/arch와 달리
 *  이미지가 텍스트와 별도 레이어로 분리되고 하단 패널이 뚜렷하게 구분된다. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const pointSchema = z.object({
  icon: z.enum(ICON_NAMES),           // 원형 아이콘 // icon ∈ ICON_NAMES
  label: z.string().min(1),           // "Point 01" 형태 라벨
  desc: z.string().min(1),            // 포인트 설명 (2줄 이내)
})

const schema = z.object({
  brand: z.string().min(1),           // 브랜드 로고/이름 (상단 중앙)
  sub: z.string().min(1).optional(),  // 소제목 (제품 설명 1줄)
  title: z.string().min(1),           // 대제목 (제품명, em 강조 허용)
  heroImage: z.string().optional(),   // 풀폭 제품 이미지
  points: z
    .array(pointSchema)
    .min(2)
    .max(3),                          // 하단 패널 포인트 2~3개
})

type Data = z.infer<typeof schema>

export const introCover = defineBlock<Data>({
  id: 'intro-cover',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'commerce', 'cobalt'],
  imageSlots: 1,
  describe:
    '상세페이지 첫 화면 커버. 상단 그라디언트 헤더(브랜드명+소제목+대제목) → 풀폭 제품 이미지 → 하단 대비 패널(원형 아이콘 2~3포인트). 와디즈 01_인트로 섹션 대표 패턴. hero-points·arch와 달리 텍스트 헤더 영역과 이미지가 명확히 분리된 2존 구조.',
  schema,
  css: `
/* ic = intro-cover */
.ic{background:var(--bg);overflow:hidden}

/* ── 상단 헤더 영역 ── */
.ic-hd{
  padding:54px 52px 44px;
  text-align:center;
  background:linear-gradient(170deg,var(--brand) 0%,var(--accent) 60%,var(--bg) 100%);
  position:relative;
  overflow:hidden;
}
.ic-hd::after{
  content:"";position:absolute;inset:0;
  background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(255,255,255,.18) 0%,transparent 70%);
  pointer-events:none;
}
.ic-brand{
  font-family:var(--font-display);font-weight:800;
  font-size:14px;letter-spacing:.28em;text-transform:uppercase;
  color:rgba(255,255,255,.82);margin-bottom:14px;
}
.ic-sub{
  font-size:17px;font-weight:500;
  color:rgba(255,255,255,.78);margin-bottom:10px;line-height:1.55;
}
.ic-title{
  font-family:var(--font-display);font-weight:800;
  font-size:52px;line-height:1.1;letter-spacing:-.02em;
  color:#fff;
}
.ic-title .em{color:rgba(255,255,255,.68);text-shadow:0 0 32px rgba(255,255,255,.5)}

/* ── 이미지 슬롯 ── */
.ic-img-wrap{width:100%;line-height:0;position:relative}
.ic-hero{width:100%;height:440px;object-fit:cover;display:block}
.ic-hero-empty{width:100%;height:340px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 10%,#fff) 0%,var(--bg) 100%);display:grid;place-items:center;color:var(--muted);font-size:14px;letter-spacing:.04em;line-height:1.4}

/* ── 하단 포인트 패널 ── */
.ic-panel{
  background:var(--paper);
  padding:48px 40px 52px;
  display:flex;justify-content:center;
  gap:0;
}
.ic-pt{
  flex:1 1 0;max-width:220px;
  text-align:center;
  padding:0 12px;
  border-right:1px solid var(--line);
}
.ic-pt:last-child{border-right:none}
.ic-ic{
  width:80px;height:80px;
  margin:0 auto 16px;
  border-radius:50%;
  background:var(--bg);
  box-shadow:0 8px 24px -8px rgba(0,0,0,.12);
  display:grid;place-items:center;
  color:var(--accent);
}
.ic-ic svg{width:36px;height:36px}
.ic-pl{
  font-family:var(--font-display);font-weight:800;
  font-size:16px;color:var(--accent);
  margin-bottom:10px;letter-spacing:.04em;
}
.ic-pd{
  font-size:14px;line-height:1.65;
  color:var(--ink-2);
}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="ic">
  <div class="ic-hd">
    <p class="ic-brand">${esc(d.brand)}</p>
    ${d.sub ? `<p class="ic-sub">${esc(d.sub)}</p>` : ''}
    <h1 class="ic-title">${richSafe(d.title)}</h1>
  </div>
  <div class="ic-img-wrap">${d.heroImage ? media(d.heroImage, 'ic-hero', '제품 대표 이미지') : '<div class="ic-hero-empty">제품 대표 이미지 영역</div>'}</div>
  <div class="ic-panel">
    ${d.points
      .map(
        (p) => `
    <div class="ic-pt">
      <div class="ic-ic">${icon(p.icon)}</div>
      <p class="ic-pl">${esc(p.label)}</p>
      <p class="ic-pd">${esc(p.desc)}</p>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
