/** DETAIL 아키타입(템플릿 충실 재현): 17_제품 설명 _1269:124.
 *  detail-dimension-faq: 라이트 사이즈 도면(2개 치수선 이미지) + 라벤더 FAQ(워터마크+아코디언).
 *  위쪽 섹션: 섹션 제목 + 치수선 레이블이 달린 2개 제품 이미지.
 *  아래쪽 섹션: 연한 accent 배경, 우측 "FAQ" 대형 워터마크, 2줄 헤드라인, Q&A 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 스키마 ────────────────────────────────────────────────────────────────────
const dimSchema = z.object({
  image: z.string().optional(),        // 제품 도면 이미지 (url)
  widthLabel: z.string().min(1).optional(),  // 예: "180mm"
  heightLabel: z.string().min(1).optional(), // 예: "400mm"
})

const faqItemSchema = z.object({
  question: z.string().min(1),  // Q. 질문 텍스트
  answer: z.string().min(1),    // 답변 텍스트 (em, br 허용)
})

const schema = z.object({
  sectionTitle: z.string().min(1).optional(), // 예: "제품사이즈"
  dims: z.array(dimSchema).min(2).max(2),    // 도면 이미지 2개 고정
  faqHeadingTop: z.string().min(1).optional(), // 예: "구매 전 궁금한 내용을"
  faqHeadingBottom: z.string().min(1),         // 예: "미리 확인해보세요." (em, br 허용)
  faqs: z.array(faqItemSchema).min(2).max(8),  // Q&A 아이템 2~8개
})

type Data = z.infer<typeof schema>

// ── 블록 정의 ─────────────────────────────────────────────────────────────────
export const detailDimensionFaq = defineBlock<Data>({
  id: 'detail-dimension-faq',
  archetype: 'detail',
  styleTags: ['light', 'editorial', 'template', 'premium'],
  imageSlots: 2,
  describe:
    '제품 사이즈 도면(치수선 2개) + FAQ 섹션. 상단: 중앙 섹션 제목 + 치수선 레이블 달린 제품 이미지 2개. 하단: 연한 accent 배경 + 우측 대형 FAQ 워터마크 + 2줄 헤드라인 + Q&A 아코디언 리스트. 사이즈 안내와 FAQ를 하나의 블록으로 묶을 때 사용.',
  schema,
  css: `
/* ─ 공통 ─ */
.ddf{background:var(--bg);font-family:var(--font-body),'Pretendard',sans-serif}

/* ─ 상단: 사이즈 도면 ─ */
.ddf-dim{padding:52px var(--pad-x,56px) 60px;background:var(--bg)}
.ddf-dim-title{text-align:center;font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);letter-spacing:-.01em;margin-bottom:42px}
.ddf-dim-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}

/* 각 도면 아이템 */
.ddf-dim-item{position:relative;display:flex;flex-direction:column}

/* 가로 치수선: 이미지 위 */
.ddf-width-ruler{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:8px;padding-left:2px}
.ddf-width-label{font-size:13px;font-weight:500;color:var(--ink);letter-spacing:.01em;line-height:1;margin-bottom:4px}
.ddf-width-line{height:2px;background:var(--ink);width:100%;position:relative}
.ddf-width-line::before{content:"";position:absolute;left:0;top:-4px;width:2px;height:10px;background:var(--ink)}
.ddf-width-line::after{content:"";position:absolute;right:0;top:-4px;width:2px;height:10px;background:var(--ink)}

/* 이미지 + 세로 치수선 래퍼 */
.ddf-img-row{display:flex;flex-direction:row;align-items:stretch;gap:0}

/* 세로 치수선: 이미지 왼쪽 */
.ddf-height-ruler{display:flex;flex-direction:row;align-items:center;gap:6px;margin-right:6px;flex-shrink:0}
.ddf-height-line{width:2px;background:var(--ink);flex:1;position:relative;align-self:stretch}
.ddf-height-line::before{content:"";position:absolute;top:0;left:-4px;height:2px;width:10px;background:var(--ink)}
.ddf-height-line::after{content:"";position:absolute;bottom:0;left:-4px;height:2px;width:10px;background:var(--ink)}
.ddf-height-label{font-size:13px;font-weight:500;color:var(--ink);writing-mode:horizontal-tb;white-space:nowrap;align-self:flex-end;padding-bottom:2px;letter-spacing:.01em}

/* 이미지 */
.ddf-img-wrap{flex:1;min-height:0}
.ddf-dim-img{width:100%;height:260px;object-fit:cover;display:block}

/* ─ 하단: FAQ 섹션 ─ */
.ddf-faq{position:relative;background:color-mix(in srgb,var(--accent) 14%,white);padding:56px var(--pad-x,56px) 64px;overflow:hidden}

/* FAQ 워터마크 */
.ddf-faq-wm{position:absolute;right:-24px;top:50%;transform:translateY(-50%);font-family:var(--font-display);font-weight:800;font-size:200px;color:color-mix(in srgb,var(--accent) 22%,transparent);line-height:1;letter-spacing:-.04em;pointer-events:none;user-select:none;white-space:nowrap}

/* FAQ 헤드라인 */
.ddf-faq-hd{position:relative;z-index:1;margin-bottom:38px;max-width:72%}
.ddf-faq-hd-top{font-size:26px;font-weight:500;color:var(--ink);line-height:1.35;letter-spacing:-.01em}
.ddf-faq-hd-bot{font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.2;letter-spacing:-.02em}
.ddf-faq-hd-bot .em{color:var(--accent)}

/* FAQ 리스트 */
.ddf-faq-list{position:relative;z-index:1}
.ddf-faq-item{padding:18px 0}
.ddf-faq-item + .ddf-faq-item{border-top:1px solid color-mix(in srgb,var(--ink) 14%,transparent)}
.ddf-faq-q{font-size:15px;font-weight:700;color:var(--ink);line-height:1.5;margin-bottom:8px}
.ddf-faq-a{font-size:14px;font-weight:400;color:var(--ink-2);line-height:1.7;padding-left:14px;border-left:2px solid color-mix(in srgb,var(--accent) 40%,transparent)}
.ddf-faq-a .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="ddf">

  <!-- 상단: 사이즈 도면 -->
  <div class="ddf-dim">
    ${d.sectionTitle ? `<h2 class="ddf-dim-title">${esc(d.sectionTitle)}</h2>` : ''}
    <div class="ddf-dim-grid">
      ${d.dims.map((dim) => `
      <div class="ddf-dim-item">
        ${dim.widthLabel ? `
        <div class="ddf-width-ruler">
          <span class="ddf-width-label">${esc(dim.widthLabel)}</span>
          <div class="ddf-width-line"></div>
        </div>` : ''}
        <div class="ddf-img-row">
          ${dim.heightLabel ? `
          <div class="ddf-height-ruler">
            <div class="ddf-height-line"></div>
            <span class="ddf-height-label">${esc(dim.heightLabel)}</span>
          </div>` : ''}
          <div class="ddf-img-wrap">
            ${media(dim.image, 'ddf-dim-img', '제품 도면')}
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <!-- 하단: FAQ -->
  <div class="ddf-faq">
    <div class="ddf-faq-wm" aria-hidden="true">FAQ</div>
    <div class="ddf-faq-hd">
      ${d.faqHeadingTop ? `<p class="ddf-faq-hd-top">${esc(d.faqHeadingTop)}</p>` : ''}
      <p class="ddf-faq-hd-bot">${richSafe(d.faqHeadingBottom)}</p>
    </div>
    <div class="ddf-faq-list">
      ${d.faqs.map((faq) => `
      <div class="ddf-faq-item">
        <p class="ddf-faq-q">Q. ${esc(faq.question)}</p>
        <p class="ddf-faq-a">${richSafe(faq.answer)}</p>
      </div>`).join('')}
    </div>
  </div>

</section>`,
})
