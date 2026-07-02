/** DETAIL 아키타입(템플릿 충실 재현): 17_제품 설명 _17.
 *  detail-package-faq: 상품 구성표(메인 이미지 2열 + 소구성품 그리드) + pill 안내 문구 + 카드형 Q&A 리스트.
 *  와디즈 200섹션 1284:2564 패턴 토큰 기반 재구성(클론 아님). 식품/생활 상품 패키지 구성+FAQ 목적. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 스키마 ────────────────────────────────────────────────────────────────────
const mainItemSchema = z.object({
  image: z.string().optional(),      // 메인 구성품 이미지 (url)
  name: z.string().min(1),           // 구성품명 (예: "생냉 2인분")
  weight: z.string().min(1).optional(), // 용량/중량 (예: "200g")
})

const componentSchema = z.object({
  image: z.string().optional(),      // 소구성품 이미지 (url)
  name: z.string().min(1),           // 소구성품명 (예: "애호박")
  weight: z.string().min(1).optional(), // 용량 (예: "80g")
})

const faqSchema = z.object({
  question: z.string().min(1),       // 질문 (em,br)
  answer: z.string().min(1),         // 답변 (em,br)
})

const schema = z.object({
  sectionTitle: z.string().min(1).optional(),    // 섹션 제목 (예: "상품 구성")
  mainItems: z.array(mainItemSchema).min(1).max(3), // 메인 구성품 1~3개 (이미지+이름+중량)
  components: z.array(componentSchema).min(2).max(6), // 소구성품 그리드 2~6개 (이미지+이름+중량)
  ctaText: z.string().min(1).optional(),         // pill 안내 문구 (예: "실제 구매 후 많이 묻는 질문들입니다.")
  qaTitle: z.string().min(1).optional(),         // Q&A 섹션 제목 (예: "Q&A")
  faqs: z.array(faqSchema).min(2).max(6),        // FAQ 카드 2~6개 (em,br)
})

type Data = z.infer<typeof schema>

// ── 변형 정의 ─────────────────────────────────────────────────────────────────
export const detailPackageFaq = defineBlock<Data>({
  id: 'detail-package-faq',
  archetype: 'detail',
  styleTags: ['light', 'template', 'food', 'package', 'faq'],
  imageSlots: 9,
  describe:
    '상품 구성표 + 카드형 Q&A. 섹션 제목 → 메인 구성품 2열 이미지+이름+중량 → 소구성품 그리드(이미지+이름+중량) → pill 안내 문구 → Q&A 카드 리스트(accent 질문헤더+흰 답변바디). 식품·생활용품 패키지 구성 설명에 적합.',
  schema,
  css: `
/* ── wrapper ── */
.dpfaq{background:var(--bg);color:var(--ink);padding:52px 0 60px}

/* ── 섹션 제목 ── */
.dpfaq-title{text-align:center;font-family:var(--font-display);font-weight:800;font-size:36px;letter-spacing:-.02em;line-height:1.15;color:var(--ink);margin-bottom:36px;padding:0 40px}

/* ── 메인 구성품 영역 ── */
.dpfaq-mains{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;padding:0 40px;margin-bottom:28px}
.dpfaq-main-card{display:flex;flex-direction:column;align-items:center;gap:10px}
.dpfaq-main-img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:14px;background:color-mix(in srgb,var(--ink) 5%,transparent)}
.dpfaq-main-img.ph{border-radius:14px}
.dpfaq-main-name{font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--ink);text-align:center;line-height:1.3}
.dpfaq-main-weight{font-size:13px;color:var(--ink-2);text-align:center;margin-top:2px}

/* ── 소구성품 그리드 ── */
.dpfaq-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 40px;margin-bottom:36px}
.dpfaq-comp{display:flex;flex-direction:column;align-items:center;gap:6px}
.dpfaq-comp-img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;background:color-mix(in srgb,var(--ink) 5%,transparent)}
.dpfaq-comp-img.ph{border-radius:10px;font-size:11px}
.dpfaq-comp-name{font-size:13px;font-weight:600;color:var(--ink);text-align:center;line-height:1.3}
.dpfaq-comp-weight{font-size:12px;color:var(--muted);text-align:center}

/* ── pill CTA ── */
.dpfaq-cta{display:flex;justify-content:center;margin-bottom:32px;padding:0 40px}
.dpfaq-cta-pill{background:color-mix(in srgb,var(--accent) 12%,transparent);border:1.5px solid color-mix(in srgb,var(--accent) 35%,transparent);border-radius:999px;padding:11px 28px;font-size:15px;font-weight:500;color:var(--ink-2);line-height:1.4;text-align:center}

/* ── Q&A 제목 ── */
.dpfaq-qa-title{text-align:center;font-family:var(--font-display);font-weight:800;font-size:34px;letter-spacing:-.01em;color:var(--ink);margin-bottom:6px;padding:0 40px}
.dpfaq-qa-intro{text-align:center;font-size:14px;color:var(--muted);margin-bottom:22px;padding:0 40px}

/* ── FAQ 카드 ── */
.dpfaq-list{display:flex;flex-direction:column;gap:14px;padding:0 40px}
.dpfaq-card{border-radius:12px;overflow:hidden;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent)}
.dpfaq-q{background:color-mix(in srgb,var(--accent) 15%,transparent);padding:14px 20px;font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--ink);line-height:1.5}
.dpfaq-q .em{color:var(--accent-d)}
.dpfaq-a{background:var(--paper);padding:14px 20px;font-size:14px;color:var(--ink-2);line-height:1.75}
.dpfaq-a .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="dpfaq">
  ${d.sectionTitle ? `<h2 class="dpfaq-title">${richSafe(d.sectionTitle)}</h2>` : ''}

  <div class="dpfaq-mains">
    ${d.mainItems
      .map(
        (it) => `
    <div class="dpfaq-main-card">
      ${media(it.image, 'dpfaq-main-img', esc(it.name))}
      <div class="dpfaq-main-name">${esc(it.name)}</div>
      ${it.weight ? `<div class="dpfaq-main-weight">${esc(it.weight)}</div>` : ''}
    </div>`,
      )
      .join('')}
  </div>

  <div class="dpfaq-grid">
    ${d.components
      .map(
        (c) => `
    <div class="dpfaq-comp">
      ${media(c.image, 'dpfaq-comp-img', esc(c.name))}
      <div class="dpfaq-comp-name">${esc(c.name)}</div>
      ${c.weight ? `<div class="dpfaq-comp-weight">${esc(c.weight)}</div>` : ''}
    </div>`,
      )
      .join('')}
  </div>

  ${
    d.ctaText
      ? `<div class="dpfaq-cta"><span class="dpfaq-cta-pill">${esc(d.ctaText)}</span></div>`
      : ''
  }

  ${d.qaTitle ? `<h3 class="dpfaq-qa-title">${esc(d.qaTitle)}</h3>` : ''}

  <div class="dpfaq-list">
    ${d.faqs
      .map(
        (faq, i) => `
    <div class="dpfaq-card">
      <div class="dpfaq-q">Q. ${richSafe(faq.question)}</div>
      <div class="dpfaq-a">${richSafe(faq.answer)}</div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
