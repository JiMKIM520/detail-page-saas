/** DETAIL 아키타입(템플릿 충실 재현): 17_제품설명 Figma 1284:2630.
 *  detail-hero-info-table: 풀블리드 히어로(배경이미지+오버레이+대형헤드라인+태그라인)
 *  → 섹션 전환(제품 이미지 오버랩) → 라벨|값 2열 정보표.
 *  향수/뷰티 스펙 시트 패턴. 기존 detail-spec-table(이미지 없음)과 달리 히어로+이미지 오버랩 포함. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 정보 행 스키마 ─────────────────────────────────────────────────────────────
// 각 행은 왼쪽 라벨+값 쌍이 기본. label2/value2 있으면 오른쪽 쌍도 렌더링(2쌍 행).
const rowSchema = z.object({
  label: z.string().min(1),                   // 항목명 (예: "제품명")
  value: z.string().min(1),                   // 값 (em, br 허용)
  label2: z.string().min(1).optional(),       // 오른쪽 항목명 (없으면 단독 행)
  value2: z.string().min(1).optional(),       // 오른쪽 값 (em, br 허용)
})

const schema = z.object({
  heroBg: z.string().optional(),              // 풀블리드 배경 이미지 (url)
  heroHeadline: z.string().min(1),            // 대형 영문 헤드라인 (em, br)
  heroTagline: z.string().min(1).optional(),  // 히어로 소개 카피 (em, br)
  productImage: z.string().optional(),        // 섹션 전환 오버랩 제품 이미지 (url)
  sectionLabel: z.string().min(1).optional(), // 정보표 섹션 제목 (예: "제품정보")
  rows: z.array(rowSchema).min(2).max(12),    // 정보 행 (2~12)
})
type Data = z.infer<typeof schema>

export const detailHeroInfoTable = defineBlock<Data>({
  id: 'detail-hero-info-table',
  archetype: 'detail',
  styleTags: ['premium', 'editorial', 'template', 'beauty', 'hero'],
  imageSlots: 2,
  describe:
    '제품 설명(히어로+정보표). 풀블리드 배경이미지+오버레이 위 대형 영문 헤드라인+한국어 태그라인 → 흰 영역 전환 시 제품 이미지 오버랩 → 제품정보 라벨|값 2열 표. 향수·뷰티 상세정보 패턴.',
  schema,
  css: `
/* ── 히어로 존 ── */
.dhit{background:var(--bg);color:var(--ink)}
.dhit-hero{position:relative;width:100%;min-height:480px;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:72px 56px 96px}
.dhit-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.dhit-hero-bg.ph{position:absolute;inset:0;width:100%;height:100%;font-size:0;color:transparent;border:none;background:rgba(0,0,0,.18)}
.dhit-overlay{position:absolute;inset:0;background:rgba(0,0,0,.28)}
.dhit-hero-inner{position:relative;z-index:2;text-align:center}
.dhit-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(44px,7vw,72px);color:#fff;letter-spacing:-.01em;line-height:1.1;text-transform:uppercase}
.dhit-headline .em{color:var(--accent)}
.dhit-tagline{margin-top:28px;font-size:17px;color:rgba(255,255,255,.88);line-height:1.9;font-weight:400;letter-spacing:-.01em}
.dhit-tagline .em{color:var(--accent);font-weight:700}

/* ── 섹션 전환: 제품 이미지 오버랩 ── */
.dhit-transition{position:relative;background:var(--paper);padding-top:0}
.dhit-product-wrap{display:flex;justify-content:flex-end;padding:0 32px;margin-top:-120px;position:relative;z-index:3}
.dhit-product-img{width:240px;height:300px;object-fit:contain;display:block;filter:drop-shadow(0 12px 32px rgba(0,0,0,.18))}

/* ── 제품정보 표 ── */
.dhit-info{padding:0 40px 64px}
.dhit-section-label{padding:32px 0 20px;font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);letter-spacing:-.01em}
.dhit-tbl{border-top:1.5px solid var(--ink);width:100%}
.dhit-row{display:grid;border-bottom:1px solid var(--line)}
.dhit-row.dhit-row-pair{grid-template-columns:1fr 1fr}
.dhit-row.dhit-row-single{grid-template-columns:1fr}
.dhit-half{display:grid;grid-template-columns:120px 1fr;align-items:start}
.dhit-half+.dhit-half{border-left:1px solid var(--line)}
.dhit-label{padding:18px 16px 18px 0;font-family:var(--font-display);font-weight:800;font-size:14px;color:var(--ink);line-height:1.4;white-space:nowrap}
.dhit-val{padding:18px 16px;font-size:14px;color:var(--ink);line-height:1.7;border-left:1px solid var(--line)}
.dhit-val .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="dhit">

  <!-- 풀블리드 히어로 -->
  <div class="dhit-hero">
    ${media(d.heroBg, 'dhit-hero-bg', '')}
    <div class="dhit-overlay"></div>
    <div class="dhit-hero-inner">
      <h2 class="dhit-headline">${richSafe(d.heroHeadline)}</h2>
      ${d.heroTagline ? `<p class="dhit-tagline">${richSafe(d.heroTagline)}</p>` : ''}
    </div>
  </div>

  <!-- 섹션 전환 + 제품 이미지 오버랩 -->
  <div class="dhit-transition">
    ${d.productImage ? `<div class="dhit-product-wrap">${media(d.productImage, 'dhit-product-img', '제품 이미지')}</div>` : ''}

    <!-- 제품정보 표 -->
    <div class="dhit-info">
      ${d.sectionLabel ? `<div class="dhit-section-label">${esc(d.sectionLabel)}</div>` : ''}
      <div class="dhit-tbl">
        ${d.rows
          .map((r) => {
            if (r.label2) {
              return `
        <div class="dhit-row dhit-row-pair">
          <div class="dhit-half">
            <div class="dhit-label">${esc(r.label)}</div>
            <div class="dhit-val">${richSafe(r.value)}</div>
          </div>
          <div class="dhit-half">
            <div class="dhit-label">${esc(r.label2)}</div>
            <div class="dhit-val">${richSafe(r.value2 ?? '')}</div>
          </div>
        </div>`
            }
            return `
        <div class="dhit-row dhit-row-single">
          <div class="dhit-half">
            <div class="dhit-label">${esc(r.label)}</div>
            <div class="dhit-val">${richSafe(r.value)}</div>
          </div>
        </div>`
          })
          .join('')}
      </div>
    </div>
  </div>

</section>`,
})
