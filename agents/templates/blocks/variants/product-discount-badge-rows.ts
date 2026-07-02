/** PROMO 아키타입(템플릿 충실 재현): product-discount-badge-rows.
 *  [끝판왕] 상품 구성 #12 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + 헤더(아이웨이/제목) + 썸네일 좌상단 % OFF pill 배지가 인라인 배치된
 *  카탈로그형 행 반복. 가격 숫자 없이 할인 강도만 시각화하는 상품 구성 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 eyebrow (선택, 예: "이벤트 진행 날짜를 입력해주세요") */
  eyebrow: z.string().optional(),
  /** 섹션 대제목 (em 허용, 예: "여기에 뭘<br>입력할까나") */
  title: z.string().min(1),
  /** 카탈로그 행 (2~5개) */
  items: z
    .array(
      z.object({
        /** 할인율 숫자(%) — pill 배지에 표시 (1~99) */
        discountPct: z.number().int().min(1).max(99),
        /** 썸네일 이미지 URL (선택) */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 카테고리/상품명 레이블 (예: "카테고리명") */
        label: z.string().min(1),
        /** 주 설명 카피 (em/br 허용) */
        description: z.string().min(1),
        /** 보조 텍스트 줄 (선택, 예: 세부사항 1·2행) */
        subLines: z.array(z.string()).max(3).optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const productDiscountBadgeRows = defineBlock<Data>({
  id: 'product-discount-badge-rows',
  archetype: 'promo',
  styleTags: ['catalog', 'discount', 'badge', 'light', 'template'],
  imageSlots: 3,
  describe:
    '상품 구성 카탈로그(할인 배지 행). 밝은 배경 + 섹션 헤더(eyebrow+대제목) + [썸네일 좌상단 % OFF pill + 카테고리 레이블 + 설명] 행 반복(2~5개). 가격 없이 할인 강도만 시각화하는 커머스 이벤트/구성 섹션.',
  schema,
  css: `
/* product-discount-badge-rows — 접두사 pdbr- */
.pdbr{background:var(--paper);padding:52px 40px 60px;word-break:keep-all;overflow-wrap:break-word}
/* 헤더 */
.pdbr-hd{margin-bottom:32px}
.pdbr-eyebrow{font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--accent-d);text-transform:uppercase;margin-bottom:10px}
.pdbr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6.4vw,40px);color:var(--ink);line-height:1.22;letter-spacing:-.02em}
.pdbr-title .em{color:var(--accent-d)}
/* 행 레이아웃 */
.pdbr-list{display:flex;flex-direction:column;gap:16px}
.pdbr-row{display:grid;grid-template-columns:120px 1fr;gap:16px;align-items:flex-start;background:var(--bg);border-radius:12px;padding:14px;box-shadow:0 2px 8px -4px rgba(0,0,0,.10)}
/* 썸네일 래퍼 — 배지 절대 위치 기준 */
.pdbr-thumb-wrap{position:relative;flex-shrink:0}
.pdbr-thumb{width:120px;height:120px;object-fit:cover;border-radius:8px;display:block}
.pdbr-thumb.ph{width:120px;height:120px;border-radius:8px}
/* % OFF pill 배지 */
.pdbr-badge{position:absolute;top:6px;left:6px;background:#E63946;color:#fff;font-family:var(--font-display);font-weight:800;font-size:12px;line-height:1;letter-spacing:.01em;padding:4px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(230,57,70,.35)}
/* 텍스트 영역 */
.pdbr-content{display:flex;flex-direction:column;justify-content:center;min-width:0}
.pdbr-label{font-family:var(--font-display);font-weight:800;font-size:15px;color:var(--ink);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdbr-desc{font-family:var(--font-body);font-size:14px;line-height:1.55;color:var(--ink);margin-bottom:6px}
.pdbr-desc .em{color:var(--accent-d);font-weight:700}
.pdbr-sub{font-family:var(--font-body);font-size:12px;line-height:1.5;color:var(--muted)}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map((it) => {
        const subHtml = it.subLines && it.subLines.length > 0
          ? `<p class="pdbr-sub">${it.subLines.map((l) => esc(l)).join('<br>')}</p>`
          : ''
        return `
    <div class="pdbr-row">
      <div class="pdbr-thumb-wrap">
        ${media(it.image, 'pdbr-thumb', esc(it.imageAlt ?? it.label))}
        <span class="pdbr-badge">${it.discountPct}% OFF</span>
      </div>
      <div class="pdbr-content">
        <div class="pdbr-label">${esc(it.label)}</div>
        <p class="pdbr-desc">${richSafe(it.description)}</p>
        ${subHtml}
      </div>
    </div>`
      })
      .join('')

    return `
<section class="pdbr">
  <div class="pdbr-hd">
    ${d.eyebrow ? `<p class="pdbr-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="pdbr-title">${richSafe(d.title)}</h2>
  </div>
  <div class="pdbr-list">
    ${rows}
  </div>
</section>`
  },
})
