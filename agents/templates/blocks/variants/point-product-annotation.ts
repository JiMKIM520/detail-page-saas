/** POINT 아키타입: point-product-annotation.
 *  [끝판왕] 포인트 구성 #29 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + 대형 헤드라인 + 제품 이미지 중앙 + 우측 텍스트 annotation callout 4개(점선 커넥터).
 *  기술 다이어그램/설명서 스타일 — 제품 세부 특징을 시각적으로 연결해 설명. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 대제목 (em 허용 — 일부 어절 accent 강조) */
  title: z.string().min(1),
  /** 헤드라인 아래 소제목 / 구매 이유 카피 (선택) */
  subtitle: z.string().optional(),
  /** 제품 이미지 URL */
  productImage: z.string().optional(),
  /** 제품 이미지 alt */
  productImageAlt: z.string().optional(),
  /** annotation callout 항목 (2~4개). 위→아래 순서로 우측에 배치. */
  annotations: z
    .array(
      z.object({
        /** callout 소제목 (em 허용) */
        heading: z.string().min(1),
        /** callout 본문 설명 (선택, em 허용) */
        desc: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const pointProductAnnotation = defineBlock<Data>({
  id: 'point-product-annotation',
  archetype: 'point',
  styleTags: ['annotation', 'diagram', 'clean', 'technical', 'template'],
  imageSlots: 1,
  describe:
    '포인트 어노테이션. 밝은 배경 + 대형 헤드라인 + 제품 이미지 중앙 고정 + 우측 텍스트 callout 2~4개를 점선 커넥터로 연결. 기술 다이어그램/설명서 스타일로 제품 특장점을 시각적으로 강조.',
  schema,
  css: `
/* point-product-annotation — 접두사 ppa- */
.ppa{background:var(--paper);padding:56px 40px 64px;word-break:keep-all;overflow-wrap:break-word}
.ppa-hd{text-align:center;margin-bottom:40px}
.ppa-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,6vw,40px);color:var(--ink);letter-spacing:-.02em;line-height:1.22}
.ppa-title .em{color:var(--accent-d)}
.ppa-sub{margin-top:8px;font-family:var(--font-body);font-size:14px;color:var(--muted);letter-spacing:.02em}
/* 다이어그램 본체: 제품 이미지(좌/중) + 어노테이션 열(우) */
.ppa-diagram{position:relative;display:flex;align-items:stretch;gap:0;min-height:420px}
/* 제품 영역: 좌측 공간(작은 여백) + 중앙 제품 */
.ppa-product{flex:0 0 52%;position:relative;display:flex;align-items:center;justify-content:center}
.ppa-img{width:72%;max-width:220px;aspect-ratio:2/5;object-fit:contain;display:block;position:relative;z-index:1}
.ppa-img.ph{width:72%;max-width:220px;aspect-ratio:2/5;border:2px dashed var(--line);background:var(--bg);color:var(--muted);font-size:12px;display:flex;align-items:center;justify-content:center;border-radius:8px}
/* 어노테이션 열 */
.ppa-annots{flex:1 1 0;display:flex;flex-direction:column;justify-content:space-around;gap:8px;padding-left:0;position:relative}
/* 각 callout 행 — 점선 커넥터(::before) + 불릿(::after) + 텍스트 */
.ppa-row{display:flex;align-items:flex-start;gap:0;position:relative;padding-left:22px}
/* 점선 가로 커넥터 — 오른쪽 어노테이션에서 제품 방향으로 뻗어나감 */
.ppa-row::before{
  content:'';
  position:absolute;
  left:-30px;top:10px;
  width:30px;height:0;
  border-top:1.5px dashed var(--muted);
  opacity:.55;
}
/* 커넥터 끝 원형 불릿 */
.ppa-row::after{
  content:'';
  position:absolute;
  left:-36px;top:6px;
  width:8px;height:8px;
  border-radius:50%;
  background:var(--accent-d);
  opacity:.75;
}
.ppa-callout{flex:1}
.ppa-ch{font-family:var(--font-display);font-weight:800;font-size:14px;color:var(--ink);line-height:1.3;letter-spacing:-.01em}
.ppa-ch .em{color:var(--accent-d)}
.ppa-cd{margin-top:3px;font-family:var(--font-body);font-size:12px;color:var(--muted);line-height:1.55}
.ppa-cd .em{color:var(--accent-d);font-weight:700}
/* 다크 배경 변형(--ink bg): .em을 accent(밝은 포인트)로 override */
.ppa[data-theme="dark"] .ppa-title .em,
.ppa[data-theme="dark"] .ppa-ch .em,
.ppa[data-theme="dark"] .ppa-cd .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const imgHtml = d.productImage
      ? `<img class="ppa-img" src="${esc(d.productImage)}" alt="${esc(d.productImageAlt ?? '제품 이미지')}">`
      : `<div class="ppa-img ph">${esc(d.productImageAlt ?? '제품 이미지')}</div>`

    const annotRows = d.annotations
      .map(
        (a) => `
    <div class="ppa-row">
      <div class="ppa-callout">
        <div class="ppa-ch">${richSafe(a.heading)}</div>
        ${a.desc ? `<div class="ppa-cd">${richSafe(a.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="ppa">
  <div class="ppa-hd">
    <h2 class="ppa-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ppa-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ppa-diagram">
    <div class="ppa-product">
      ${imgHtml}
    </div>
    <div class="ppa-annots">
      ${annotRows}
    </div>
  </div>
</section>`
  },
})
