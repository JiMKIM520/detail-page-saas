/** LINEUP 아키타입: package-option-rows-panel.
 *  [끝판왕] 상품 구성 #4 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 웜 accent 배경 + 중앙 대제목 + 해시태그 아웃라인 배지 → 흰 둥근 패널 안
 *  점선 divider로 나뉜 [이미지 | 옵션번호배지 + 제품명 + 효과 + 2단 가격표] 행 반복. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 대제목 (em 허용 — 굵게 강조 어절) */
  title: z.string().min(1),
  /** 해시태그 아웃라인 배지 문자열 (예: "#제품에 #어울리는 #해시태그") */
  hashtags: z.string().min(1).optional(),
  /** 옵션 행 (2~4개) */
  items: z
    .array(
      z.object({
        /** 옵션 레이블 (예: "옵션1", "옵션A") */
        optionLabel: z.string().min(1),
        /** 제품 이름 — 굵은 대제목 */
        name: z.string().min(1),
        /** 혜택/효과 설명 (점 구분 한 줄 권장, br 허용) */
        desc: z.string().optional(),
        /** 정상가 표시 문자열 (예: "399,999원") */
        originalPrice: z.string().optional(),
        /** 최대혜택가 표시 문자열 (예: "299,999원") */
        salePrice: z.string().min(1),
        /** 제품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageOptionRowsPanel = defineBlock<Data>({
  id: 'package-option-rows-panel',
  archetype: 'lineup',
  styleTags: ['warm', 'commerce', 'pricing', 'package', 'template'],
  imageSlots: 2,
  describe:
    '상품 구성(패키지 옵션 행). 웜 accent 배경 + 중앙 대제목 + 해시태그 아웃라인 배지 → 흰 둥근 패널 안 점선 divider로 나뉜 [이미지 | 옵션배지+제품명+효과+2단가격(정상가취소선·최대혜택가)] 행 반복(2~4). 커머스 상품 구성 소개.',
  schema,
  css: `
/* package-option-rows-panel — 접두사 porp- */
*{word-break:keep-all;overflow-wrap:break-word}
.porp{background:var(--accent);padding:56px 32px 48px;text-align:center}
.porp-title{font-family:var(--font-display);font-weight:800;font-size:clamp(30px,7.2vw,48px);line-height:1.22;letter-spacing:-.02em;color:#fff;margin-bottom:20px}
.porp-title .em{color:var(--paper)}
/* 해시태그 아웃라인 배지 — 흰 테두리, 투명 배경 */
.porp-tags{display:inline-block;border:2.5px solid #fff;border-radius:999px;padding:10px 28px;font-family:var(--font-body);font-size:16px;font-weight:600;color:#fff;letter-spacing:.01em;margin-bottom:36px}
/* 흰 패널 */
.porp-panel{background:var(--paper);border-radius:calc(var(--r-scale,1)*20px);overflow:hidden;padding:0 0 4px}
/* 각 옵션 행 */
.porp-row{display:grid;grid-template-columns:140px 1fr;gap:0;padding:28px 24px 24px;align-items:flex-start}
/* 점선 divider */
.porp-row + .porp-row{border-top:1.5px dashed #d8d0c8}
/* 이미지 슬롯 */
.porp-img{width:140px;height:164px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px));display:block;flex-shrink:0}
.porp-img.ph{width:140px;height:164px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px));background:#ebebeb;border:none;color:#aaa;font-size:12px}
/* 오른쪽 텍스트 블록 */
.porp-info{padding-left:20px;display:flex;flex-direction:column;gap:8px}
/* 옵션번호 배지 — 아웃라인 박스 */
.porp-opt{display:inline-block;border:1.5px solid var(--ink);border-radius:calc(var(--r-scale,1)*5px);padding:2px 10px;font-size:13px;font-weight:700;color:var(--ink);letter-spacing:.04em;width:fit-content}
/* 제품명 */
.porp-name{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,4.8vw,28px);line-height:1.22;color:var(--ink);letter-spacing:-.01em}
.porp-name .em{color:var(--accent-d)}
/* 효과/혜택 설명 */
.porp-desc{font-size:14px;color:var(--muted);line-height:1.6}
.porp-desc .em{color:var(--accent-d);font-weight:700}
/* 2단 가격 그리드 */
.porp-price{display:grid;grid-template-columns:auto 1fr;column-gap:8px;row-gap:2px;align-items:baseline;margin-top:6px}
.porp-price-label{font-size:13px;color:var(--muted);font-weight:500}
.porp-original{font-size:14px;color:var(--muted);text-decoration:line-through;text-align:right}
.porp-sale-label{font-size:13px;color:var(--ink);font-weight:700}
.porp-sale{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,30px);color:#e84040;text-align:right;letter-spacing:-.02em;line-height:1.1}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map(
        (it) => `
    <div class="porp-row">
      ${media(it.image, 'porp-img', esc(it.imageAlt ?? it.name))}
      <div class="porp-info">
        <span class="porp-opt">${esc(it.optionLabel)}</span>
        <h3 class="porp-name">${richSafe(it.name)}</h3>
        ${it.desc ? `<p class="porp-desc">${richSafe(it.desc)}</p>` : ''}
        <div class="porp-price">
          ${
            it.originalPrice
              ? `<span class="porp-price-label">정상가</span><span class="porp-original">${esc(it.originalPrice)}</span>`
              : '<span></span><span></span>'
          }
          <span class="porp-sale-label">최대혜택가</span>
          <span class="porp-sale">${esc(it.salePrice)}</span>
        </div>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="porp">
  <h2 class="porp-title">${richSafe(d.title)}</h2>
  ${d.hashtags ? `<div class="porp-tags">${esc(d.hashtags)}</div>` : ''}
  <div class="porp-panel">
    ${rows}
  </div>
</section>`
  },
})
