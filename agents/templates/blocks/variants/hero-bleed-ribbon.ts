/** HERO 아키타입: hero-bleed-ribbon
 *  출처: 피그마 "인트로/30" (071_인트로_30.json) — 연파랑 배경 + 풀위드 반투명 리본 배너 +
 *  브랜드+2행 대형 타이틀 + 와이드 오버플로우 제품사진(860px 폭 초과 블리드) + 3원형 아이콘 행.
 *  핵심 장치: 제품 이미지를 섹션 폭(860) 대비 약 2.1× 와이드로 배치해 좌우 블리드를 연출하는
 *  오버플로우 구도. 이미지 없을 때는 틴트 패널로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 리본 배너에 표시할 상품 풀네임 (예: "더마퓨어 약산성 마일드 폼클렌저") */
  productName: z.string().min(1),
  /** 브랜드명 — 라틴/한글 모두 가능 (em 허용) */
  brand: z.string().min(1),
  /** 대형 타이틀 1행 — 작은 크기 (em,br) */
  titleLine1: z.string().min(1),
  /** 대형 타이틀 2행 — 큰 크기 ExtraBold (em,br) */
  titleLine2: z.string().min(1),
  /** 와이드 블리드 제품 이미지 (url) — 없으면 틴트 패널로 강등 */
  image: z.string().optional(),
  /** 원형 아이콘 배너 3개 */
  badges: z
    .array(
      z.object({
        icon: z.string().min(1), // ICON_NAMES 35종
        label: z.string().min(1), // 2행 가능 (br 허용)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroBleedRibbon = defineBlock<Data>({
  id: 'hero-bleed-ribbon',
  archetype: 'hero',
  styleTags: ['light', 'blue', 'beauty', 'wide', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '연파랑 배경 히어로. 최상단 풀위드 반투명 리본 배너에 상품명 표시, 브랜드+2행 대형 타이틀(소→대 크기 계단), 와이드 오버플로우 제품 사진(섹션 폭 초과 블리드), 하단 2~4개 원형 아이콘 뱃지 행. 뷰티/스킨케어 인트로에 최적.',
  schema,
  css: `
.hcpn{position:relative;background:var(--hcpn-bg,#dcedfd);overflow:hidden;padding-bottom:52px}

/* 리본 배너 — 풀위드 반투명 */
.hcpn-ribbon{
  width:100%;
  padding:10px var(--pad-x,56px);
  background:rgba(56,112,225,.82);
  text-align:center;
  backdrop-filter:blur(2px)
}
.hcpn-ribbon-text{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:18px;
  font-weight:400;
  color:#ffffff;
  letter-spacing:.01em;
  line-height:1.5;
  word-break:keep-all
}

/* 타이틀 영역 */
.hcpn-titles{
  padding:32px var(--pad-x,56px) 0;
  text-align:center
}
.hcpn-brand{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:30px;
  font-weight:600;
  color:var(--hcpn-ink,#1a52c2);
  letter-spacing:.04em;
  margin-bottom:10px
}
.hcpn-brand .em{color:var(--accent)}
.hcpn-t1{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:42px;
  font-weight:700;
  color:var(--hcpn-ink,#1a52c2);
  line-height:1.18;
  letter-spacing:-.01em
}
.hcpn-t1 .em{color:var(--accent)}
.hcpn-t2{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:52px;
  font-weight:800;
  color:var(--hcpn-ink,#1a52c2);
  line-height:1.12;
  letter-spacing:-.02em;
  margin-top:4px
}
.hcpn-t2 .em{color:var(--accent)}

/* 와이드 블리드 이미지 영역 — 섹션 폭(var or 860px) 초과 오버플로우 */
.hcpn-bleed-wrap{
  position:relative;
  margin-top:28px;
  /* 음수 마진으로 좌우 패딩 영역 돌파 */
  margin-left:calc(var(--pad-x,56px) * -1);
  margin-right:calc(var(--pad-x,56px) * -1);
  /* 블리드 폭 ≈ 섹션 폭의 2.1× — 원본 1828/860 비율 유지 */
  width:calc(100% + var(--pad-x,56px) * 2 + 190px);
  /* 초과분을 균등하게 오프셋 */
  transform:translateX(calc(-95px));
  aspect-ratio:1828/997
}
/* 이미지 있을 때 */
.hcpn-bleed-img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));
  display:block
}
/* 이미지 없을 때 강등 — noimg-safe: 틴트 패널 */
.hcpn-bleed-ph{
  width:100%;
  height:100%;
  background:color-mix(in srgb,var(--hcpn-ink,#1a52c2) 8%,transparent);
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));
  display:none
}
.hcpn-bleed-wrap:not(:has(img)) .hcpn-bleed-ph{display:block}

/* 원형 아이콘 배너 행 */
.hcpn-badges{
  display:flex;
  justify-content:center;
  gap:20px;
  margin-top:32px;
  padding:0 var(--pad-x,56px);
  flex-wrap:wrap
}
.hcpn-badge{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
  flex:0 0 auto;
  min-width:110px;
  max-width:140px
}
.hcpn-circle{
  width:110px;
  height:110px;
  border-radius:50%;
  background:#ffffff;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 4px 18px -6px rgba(56,112,225,.22)
}
.hcpn-circle svg{
  width:52px;
  height:52px;
  color:var(--hcpn-ink,#1a52c2)
}
.hcpn-badge-label{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:16px;
  font-weight:500;
  color:var(--ink);
  text-align:center;
  line-height:1.45;
  word-break:keep-all
}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="hcpn">
  <div class="hcpn-ribbon">
    <span class="hcpn-ribbon-text">${esc(d.productName)}</span>
  </div>

  <div class="hcpn-titles">
    <p class="hcpn-brand">${richSafe(d.brand)}</p>
    <p class="hcpn-t1">${richSafe(d.titleLine1)}</p>
    <p class="hcpn-t2">${richSafe(d.titleLine2)}</p>
  </div>

  <div class="hcpn-bleed-wrap">
    ${d.image
      ? `<img class="hcpn-bleed-img" src="${d.image.replace(/"/g, '&quot;')}" alt="${esc(d.productName)} 제품 이미지">`
      : '<div class="hcpn-bleed-ph" role="img" aria-label="제품 이미지 영역"></div>'
    }
  </div>

  <div class="hcpn-badges">
    ${d.badges
      .map(
        (b) => `
    <div class="hcpn-badge">
      <div class="hcpn-circle">${icon(b.icon)}</div>
      <span class="hcpn-badge-label">${richSafe(b.label)}</span>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
