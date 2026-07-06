/** FEATURE/DETAIL 아키타입: painpoint-brand-research-trio.
 *  [끝판왕] 추천·B&A #15 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--brand) 배경 + 생각 이모지 앵커 + 브랜드 권위 카피(bracket 감싸기)
 *            + 번호형 고민 3행(아웃라인 박스) + 해결 브릿지 텍스트 + 제품 이미지 + 브랜드 라벨. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드명 — bracket [브랜드명] 자동 감쌈 */
  brand: z.string().min(1),
  /** 권위 카피 본문 — 브랜드명 mention 포함 가능. em, br 허용. */
  authorityCopy: z.string().min(1),
  /** 강조 어절 (authorityCopy 안에서 em으로 처리될 핵심 구절, 선택) */
  authorityEmphasis: z.string().optional(),
  /** 번호형 고민 3행 (정확히 3개). 아웃라인 박스로 렌더. */
  painpoints: z
    .array(
      z.object({
        /** "고민 N." 형식 레이블 (선택 — 기본: "고민 N.") */
        label: z.string().optional(),
        /** 고민 내용 (em, br 허용) */
        text: z.string().min(1),
      }),
    )
    .length(3),
  /** 해결 브릿지 텍스트 (em, br 허용) */
  bridge: z.string().min(1),
  /** 제품 이미지 URL */
  productImage: z.string().optional(),
  /** 제품 이미지 alt */
  productImageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const painpointBrandResearchTrio = defineBlock<Data>({
  id: 'painpoint-brand-research-trio',
  archetype: 'feature',
  styleTags: ['dark', 'painpoint', 'research', 'authority', 'narrative', 'template'],
  imageSlots: 1,
  describe:
    '고민 3행 브랜드 권위 섹션. 다크 배경 + 물음표 배지 앵커 + 브랜드 bracket 권위 카피 + 번호형 고민 3행(아웃라인 박스) + 해결 브릿지 + 중앙 제품 이미지 + 브랜드 라벨 마무리. 사용자 페인포인트 공감 후 브랜드 해결사 포지셔닝.',
  schema,
  css: `
/* painpoint-brand-research-trio — 접두사 pbrt- */
/* 다크 배경 블록: --brand, 본문 #fff, 보조 rgba(255,255,255,.6) */

.pbrt{
  background:var(--brand);
  color:#fff;
  padding:52px 36px 60px;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 물음표 앵커 배지 — 이모지 금지 정책(디자인 규칙)에 따라 타이포 배지로 대체 */
.pbrt-q{
  width:56px;
  height:56px;
  border-radius:50%;
  border:2px solid var(--accent);
  color:var(--accent);
  font-family:var(--font-display);
  font-weight:800;
  font-size:28px;
  line-height:52px;
  text-align:center;
  display:inline-block;
  margin-bottom:20px;
}

/* 권위 카피 */
.pbrt-authority{
  font-family:var(--font-body);
  font-size:clamp(14px,3vw,16px);
  line-height:1.85;
  color:rgba(255,255,255,.84);
  letter-spacing:-.005em;
  margin-bottom:36px;
}
/* 다크 배경 — .em은 var(--accent)(밝은 포인트)로 대비 확보 */
.pbrt-authority .em{
  color:var(--accent);
  font-weight:700;
}

/* 고민 번호 컨테이너 */
.pbrt-list{
  display:flex;
  flex-direction:column;
  gap:14px;
  margin-bottom:36px;
}

/* 고민 1행 아웃라인 박스 */
.pbrt-item{
  border:1.5px solid rgba(255,255,255,.38);
  border-radius:10px;
  padding:18px 20px;
  text-align:left;
  background:rgba(255,255,255,.05);
}
.pbrt-item-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  letter-spacing:.04em;
  color:var(--accent);
  margin-bottom:6px;
  display:block;
}
.pbrt-item-text{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.7;
  color:rgba(255,255,255,.9);
  letter-spacing:-.01em;
}
.pbrt-item-text .em{
  color:var(--accent);
  font-weight:700;
}

/* 해결 브릿지 */
.pbrt-bridge{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(17px,3.8vw,22px);
  line-height:1.55;
  letter-spacing:-.015em;
  color:#fff;
  margin-bottom:36px;
  white-space:pre-line;
}
.pbrt-bridge .em{
  color:var(--accent);
}

/* 제품 이미지 — 풀폭 cover는 세로 누끼를 괴물 확대로 만든다 → 중앙 카드형으로 제한 */
.pbrt-product{
  width:min(100%,420px);
  aspect-ratio:3/4;
  object-fit:cover;
  display:block;
  border-radius:8px;
  margin:0 auto 32px;
}
.pbrt-product.ph{
  width:min(100%,420px);
  aspect-ratio:3/4;
  border:2px dashed rgba(255,255,255,.22);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.36);
  border-radius:8px;
  margin-bottom:32px;
}

/* 브랜드 라벨 */
.pbrt-brand{
  display:inline-block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,4vw,24px);
  letter-spacing:.02em;
  color:#fff;
  border:2px solid rgba(255,255,255,.55);
  border-radius:6px;
  padding:10px 28px;
}
`,
  render: (d, { esc, richSafe }) => {
    const painpointItems = d.painpoints
      .map(
        (pp, i) => `
    <div class="pbrt-item">
      <span class="pbrt-item-label">${esc(pp.label ?? `고민 ${i + 1}.`)}</span>
      <p class="pbrt-item-text">${richSafe(pp.text)}</p>
    </div>`,
      )
      .join('')

    return `
<section class="pbrt">
  <span class="pbrt-q" aria-hidden="true">?</span>
  <p class="pbrt-authority">${richSafe(d.authorityCopy)}</p>
  <div class="pbrt-list">
    ${painpointItems}
  </div>
  <p class="pbrt-bridge">${richSafe(d.bridge)}</p>
  ${media(d.productImage, 'pbrt-product', esc(d.productImageAlt ?? '제품 이미지'))}
  <div class="pbrt-brand">${esc(d.brand)}</div>
</section>`
  },
})
