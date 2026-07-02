/** DETAIL 아키타입(템플릿 충실 재현): detail-showcase.
 *  와디즈 200섹션 17_제품 설명 섹션_06 에디토리얼 패턴 재구성.
 *  eyebrow + 제목 헤더 → 풀폭 제품 이미지 → 스펙 하이라이트 미니표 → 에디토리얼 인용 카피
 *  → 풀폭 서술 헤드라인 → 2열 사용 씬 이미지 + 캡션. 서술형 제품 설명 (spec-table과 다른 내러티브 디자인). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const specRowSchema = z.object({
  label: z.string().min(1),  // 스펙 항목명 (예: "ANC 성능")
  value: z.string().min(1),  // 스펙 값 (예: "최대 45dB")
})

const sceneSchema = z.object({
  image: z.string().optional(),    // 사용 씬 이미지
  caption: z.string().min(1),      // 씬 캡션 (예: "카페에서 업무할 때")
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(),       // 섹션 상단 소제목 (예: "PRODUCT DETAIL")
  title: z.string().min(1),                    // 섹션 대제목 (예: "AUREN AIR 만의 기준")
  productImage: z.string().optional(),          // 풀폭 제품 대표 이미지
  specs: z.array(specRowSchema).min(2).max(6), // 스펙 하이라이트 2~6행
  quote: z.string().min(1).optional(),         // 에디토리얼 인용 카피 (em, br 허용)
  headline: z.string().min(1).optional(),      // 풀폭 서술 헤드라인 (em 허용)
  scenes: z.array(sceneSchema).min(2).max(2),  // 사용 씬 2장 (고정 2열)
})
type Data = z.infer<typeof schema>

export const detailShowcase = defineBlock<Data>({
  id: 'detail-showcase',
  archetype: 'detail',
  styleTags: ['premium', 'editorial', 'template', 'cobalt'],
  imageSlots: 3,
  describe:
    '제품 설명 에디토리얼. eyebrow+대제목 헤더 → 풀폭 제품 이미지 → 스펙 하이라이트 미니표(2~6행) → 에디토리얼 인용 카피 → 서술 헤드라인 → 2열 사용 씬 이미지+캡션. 서술형 내러티브 제품 설명 (스펙 표와 다른 스토리 중심 디자인).',
  schema,
  css: `
.ds{background:var(--bg);padding:0 0 64px}

/* ─ 헤더 ─ */
.ds-hd{text-align:center;padding:54px 56px 40px}
.ds-eyebrow{font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.ds-title{font-family:var(--font-display);font-weight:800;font-size:42px;color:var(--ink);letter-spacing:-.02em;line-height:1.15}

/* ─ 풀폭 제품 이미지 ─ */
.ds-hero{width:100%;height:440px;object-fit:cover;display:block}

/* ─ 스펙 미니표 ─ */
.ds-specs{margin:0 40px;border-top:2px solid var(--line);border-bottom:2px solid var(--line)}
.ds-spec-row{display:grid;grid-template-columns:148px 1fr;align-items:center;border-bottom:1px solid var(--line)}
.ds-spec-row:last-child{border-bottom:none}
.ds-spec-label{padding:16px 18px;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.02em;text-align:center;line-height:1.3}
.ds-spec-val{padding:16px 22px;font-size:15px;font-weight:500;color:var(--ink);line-height:1.5}

/* ─ 에디토리얼 인용 ─ */
.ds-quote{text-align:center;padding:48px 56px 0}
.ds-quote-text{font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.45;letter-spacing:-.01em}
.ds-quote-text .em{color:var(--accent)}

/* ─ 풀폭 헤드라인 ─ */
.ds-hl{text-align:center;padding:44px 56px 0}
.ds-hl-text{font-size:18px;font-weight:600;color:var(--ink-2);line-height:1.65;letter-spacing:-.01em}
.ds-hl-text .em{color:var(--accent)}

/* ─ 2열 씬 이미지 ─ */
.ds-scenes{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:44px 40px 0}
.ds-scene{}
.ds-scene-img{width:100%;height:240px;object-fit:cover;border-radius:10px;display:block}
.ds-scene-cap{margin-top:12px;text-align:center;font-size:13px;font-weight:600;color:var(--ink-2);letter-spacing:.01em}
`,
  render: (d, { esc, richSafe }) => `
<section class="ds">
  <div class="ds-hd">
    ${d.eyebrow ? `<p class="ds-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="ds-title">${richSafe(d.title)}</h2>
  </div>
  ${media(d.productImage, 'ds-hero', '제품 대표 이미지')}
  <div class="ds-specs">
    ${d.specs.map(s => `
    <div class="ds-spec-row">
      <span class="ds-spec-label">${esc(s.label)}</span>
      <span class="ds-spec-val">${esc(s.value)}</span>
    </div>`).join('')}
  </div>
  ${d.quote ? `
  <div class="ds-quote">
    <p class="ds-quote-text">${richSafe(d.quote)}</p>
  </div>` : ''}
  ${d.headline ? `
  <div class="ds-hl">
    <p class="ds-hl-text">${richSafe(d.headline)}</p>
  </div>` : ''}
  <div class="ds-scenes">
    ${d.scenes.map(sc => `
    <div class="ds-scene">
      ${media(sc.image, 'ds-scene-img', esc(sc.caption))}
      <p class="ds-scene-cap">${esc(sc.caption)}</p>
    </div>`).join('')}
  </div>
</section>`,
})
