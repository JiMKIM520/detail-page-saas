/** HERO 아키타입(템플릿 충실 재현): hero-icon-rows.
 *  와디즈 200섹션 01_인트로 _02 패턴 재구성.
 *  좌정렬 브랜드+소제목+대형 표시 제목 → 풀이미지(edge-to-edge) →
 *  원형 아이콘+레이블+설명 행이 수평 헤어라인 구분선으로 쌓인 구조.
 *  다른 히어로 변형과의 차별화:
 *    hero-points / hero-arch  — 중앙정렬 + 아이콘 그리드(가로)/아치 프레임
 *    hero-photo               — 풀블리드 사진 위 텍스트 오버레이 + 컬러 패널
 *    hero-icon-rows           — 좌정렬 헤더 + 풀이미지 + 아이콘-텍스트 세로 행(구분선) */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  brand: z.string().min(1),            // 브랜드명 — 좌상단 accent 컬러 레이블
  sub: z.string().optional(),          // 소제목 / 캐치프레이즈 (br 허용)
  title: z.string().min(1),           // 대형 표시 제품명 (em, br 허용)
  heroImage: z.string().optional(),   // 풀폭 제품 이미지 (url)
  rows: z
    .array(
      z.object({
        icon: z.enum(ICON_NAMES),       // 원형 아이콘 — ICON_NAMES 제한
        label: z.string().min(1),       // 포인트 제목 (em 허용)
        desc: z.string().min(1),        // 2줄 설명 (em, br 허용)
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const heroIconRows = defineBlock<Data>({
  id: 'hero-icon-rows',
  archetype: 'hero',
  styleTags: ['modern', 'commerce', 'template', 'icon-list'],
  imageSlots: 1,
  describe:
    '좌정렬 브랜드+대제목 히어로 + 풀이미지 + 아이콘 행 리스트. accent 컬러 브랜드 레이블 → 소제목 → 대형 표시 제품명 → 풀폭 제품 사진 → 원형 아이콘+레이블+설명 행이 헤어라인 구분선으로 반복. 좌정렬 구조. 포인트 3~5개 상품에 적합.',
  schema,
  css: `
/* ── hir = hero-icon-rows 접두사 ── */
.hir{background:var(--bg);overflow:hidden}

/* ─ 헤더 존 ─ */
.hir-hd{padding:52px 44px 36px}
.hir-brand{
  font-family:var(--font-body);
  font-size:13px;font-weight:800;
  letter-spacing:.22em;text-transform:uppercase;
  color:var(--accent)
}
.hir-sub{
  margin-top:12px;
  font-family:var(--font-body);
  font-size:18px;font-weight:500;
  color:var(--ink);line-height:1.55
}
.hir-title{
  margin-top:6px;
  font-family:var(--font-display);
  font-weight:800;font-size:52px;
  letter-spacing:-.025em;line-height:1.08;
  color:var(--ink)
}
.hir-title .em{color:var(--accent)}

/* ─ 풀이미지 존 ─ */
.hir-media-wrap{width:100%;overflow:hidden;background:color-mix(in srgb,var(--accent) 10%,transparent)}
.hir-img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}

/* ─ 아이콘 행 존 ─ */
.hir-rows{padding:8px 44px 48px;background:var(--bg)}

.hir-row{
  display:flex;
  align-items:center;
  gap:28px;
  padding:28px 0
}
.hir-row + .hir-row{
  border-top:1px solid var(--line)
}

/* 원형 아이콘 */
.hir-ic{
  flex:0 0 88px;width:88px;height:88px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 14%,transparent);
  display:flex;align-items:center;justify-content:center;
  color:var(--accent)
}
.hir-ic svg{width:40px;height:40px}

/* 텍스트 */
.hir-tx{flex:1;min-width:0}
.hir-label{
  font-family:var(--font-display);
  font-weight:800;font-size:18px;
  color:var(--ink);line-height:1.25
}
.hir-label .em{color:var(--accent)}
.hir-desc{
  margin-top:6px;
  font-family:var(--font-body);
  font-size:14px;line-height:1.7;
  color:var(--ink-2)
}
.hir-desc .em{color:var(--accent);font-weight:600}

/* 마지막 행 아래 구분선 */
.hir-rows-end{border-top:1px solid var(--line)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="hir">
  <!-- 헤더 존: 좌정렬 브랜드 + 소제목 + 대형 제목 -->
  <div class="hir-hd">
    <p class="hir-brand">${esc(d.brand)}</p>
    ${d.sub ? `<p class="hir-sub">${richSafe(d.sub)}</p>` : ''}
    <h1 class="disp hir-title">${richSafe(d.title)}</h1>
  </div>

  <!-- 풀폭 제품 이미지 -->
  <div class="hir-media-wrap">
    ${media(d.heroImage, 'hir-img', esc(d.title))}
  </div>

  <!-- 아이콘+레이블+설명 행 리스트 (헤어라인 구분선) -->
  <div class="hir-rows">
    ${d.rows
      .map(
        (r) => `
    <div class="hir-row">
      <span class="hir-ic">${icon(r.icon)}</span>
      <div class="hir-tx">
        <div class="hir-label">${richSafe(r.label)}</div>
        <div class="hir-desc">${richSafe(r.desc)}</div>
      </div>
    </div>`,
      )
      .join('')}
    <div class="hir-rows-end"></div>
  </div>
</section>`,
})
