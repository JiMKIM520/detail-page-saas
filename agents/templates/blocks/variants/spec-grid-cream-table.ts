/** SPEC 아키타입: spec-grid-cream-table.
 *  피그마 349_상품정보안내_14 재구성 —
 *  중앙 타이틀(아이콘+Paperlogy 대형) → 2×2 정방형 사진 그리드 → 좌측 크림 제목셀+우측 본문셀 6행 테이블.
 *  이중 레이아웃(사진 갤러리 + 스펙 테이블)이 한 섹션에 결합된 상품정보 안내형 변형. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),           // 섹션 타이틀 (em,br) — 예: "상품 정보 안내"
  iconName: z.string().optional(),    // 타이틀 상단 아이콘 이름 (ICON_NAMES 중 하나, 기본 doc)
  photos: z
    .array(z.string())
    .min(1)
    .max(4)
    .optional(),                      // 2×2 그리드 사진 url 배열 (1~4개, 부재 시 그리드 섹션 생략)
  rows: z
    .array(
      z.object({
        label: z.string().min(1),     // 크림 배경 제목 셀
        text: z.string().min(1),      // 본문 셀 (em,br)
      }),
    )
    .min(1)
    .max(10),                         // 스펙 테이블 행 (최소 1, 최대 10)
})
type Data = z.infer<typeof schema>

export const specGridCreamTable = defineBlock<Data>({
  id: 'spec-grid-cream-table',
  archetype: 'spec',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '상품정보 안내 이중 레이아웃. 중앙 대형 타이틀(아이콘 포함) + 2×2 정방형 사진 그리드(이미지 없으면 그리드 생략) + 좌측 크림 제목셀·우측 본문셀 분리 테이블. 식품·뷰티·생활용품 스펙 안내에 적합.',
  schema,
  css: `
.sqhy{background:var(--bg);color:var(--ink);padding:60px 0 72px}

/* ── 타이틀 ── */
.sqhy-hd{text-align:center;padding:0 var(--pad-x,56px) 0}
.sqhy-icon{width:56px;height:56px;margin:0 auto 14px;color:var(--ink)}
.sqhy-icon svg{width:100%;height:100%}
.sqhy-title{font-family:var(--font-display);font-weight:700;font-size:clamp(40px,5.5vw,72px);color:var(--ink);letter-spacing:-.02em;line-height:1.1;text-align:center}
.sqhy-title .em{color:var(--accent-d)}

/* ── 2×2 사진 그리드 ── */
.sqhy-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:40px var(--pad-x,56px) 0;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden}
.sqhy-cell{aspect-ratio:1/1;overflow:hidden;background:color-mix(in srgb,var(--muted) 40%,transparent)}
.sqhy-cell img,.sqhy-cell .ph{width:100%;height:100%;object-fit:cover;display:block}

/* ── 스펙 테이블 ── */
.sqhy-table{margin:28px var(--pad-x,56px) 0;border-top:1px solid var(--line)}
.sqhy-row{display:flex;align-items:stretch;border-bottom:1px solid var(--line)}
.sqhy-lbl{
  flex:0 0 29%;min-width:160px;
  background:color-mix(in srgb,#fbf7ee 90%,var(--paper));
  font-family:var(--font-body);font-weight:600;font-size:15px;
  color:var(--ink);
  padding:16px 18px;
  display:flex;align-items:center;
  line-height:1.55;
  border-right:1px solid var(--line)
}
.sqhy-val{
  flex:1;
  padding:16px 20px;
  font-family:var(--font-body);font-size:15px;font-weight:400;
  color:var(--ink-2);line-height:1.7
}
.sqhy-val .em{color:var(--accent-d);font-weight:700}

/* ── 사진 없을 때 테이블만 상단 여백 ── */
.sqhy-table--solo{margin-top:40px}
`,
  render: (d, { esc, richSafe, icon }) => {
    // noimg-safe: photos 배열이 없거나 모든 항목이 빈 문자열이면 그리드를 통째로 생략
    const hasPhotos =
      Array.isArray(d.photos) &&
      d.photos.length > 0 &&
      d.photos.some((p) => typeof p === 'string' && /^(https?:\/\/|data:|\/)/.test(p.trim()))

    const gridHtml = hasPhotos
      ? `
<div class="sqhy-grid">
  ${(d.photos ?? [])
    .slice(0, 4)
    .map((url, i) => `<div class="sqhy-cell">${media(url, '', `상품 사진 ${i + 1}`)}</div>`)
    .join('\n  ')}
</div>`
      : ''

    const rowsHtml = d.rows
      .map(
        (r) => `
<div class="sqhy-row">
  <div class="sqhy-lbl">${esc(r.label)}</div>
  <div class="sqhy-val">${richSafe(r.text)}</div>
</div>`,
      )
      .join('')

    const tableClass = hasPhotos ? 'sqhy-table' : 'sqhy-table sqhy-table--solo'
    const iconName = d.iconName ?? 'doc'

    return `
<section class="sqhy">
  <div class="sqhy-hd">
    <div class="sqhy-icon">${icon(iconName)}</div>
    <h2 class="sqhy-title">${richSafe(d.title)}</h2>
  </div>
  ${gridHtml}
  <div class="${tableClass}">
    ${rowsHtml}
  </div>
</section>`
  },
})
