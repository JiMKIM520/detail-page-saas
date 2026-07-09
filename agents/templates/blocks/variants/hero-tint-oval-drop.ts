/** HERO 아키타입: hero-tint-oval-drop.
 *  057_인트로_22 패턴 재구성 —
 *  브랜드 컬러 단색 배경 + 상단 흰 하이라이트 박스 서브카피 + 대형 제품 타이틀 +
 *  r=400 초대형 타원 제품 이미지 + 우측 검정 원형 배지 오버랩 +
 *  하단 대형 영문 배경 타이포 + 브랜드라인.
 *  872px 데스크톱 기준. 톤=dark. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 흰 하이라이트 박스 안 서브카피 (순수 텍스트) */
  highlight: z.string().min(1),
  /** 메인 제품명/타이틀 (em,br 허용) */
  title: z.string().min(1),
  /** 타이틀 아래 보조 문구 (em,br 허용) */
  subtitle: z.string().optional(),
  /** 제품 이미지 URL — 없으면 타원 프레임 숨김(noimg-safe 강등) */
  image: z.string().optional(),
  /** 원형 배지 상단 텍스트 (예: "NEW", "UP") — 기본 "NEW" */
  badgeLine1: z.string().optional(),
  /** 원형 배지 하단 텍스트 (예: "ARRIVAL", "GRADE") — 기본 "ARRIVAL" */
  badgeLine2: z.string().optional(),
  /** 하단 대형 영문 배경 타이포 (예: "Foam cleansing") — 브리프 근거 시만 */
  bgWord: z.string().optional(),
  /** 하단 브랜드명 */
  brand: z.string().optional(),
  /** 브랜드 우측 구분선 다음 제품 전체명 */
  brandSub: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const heroTintOvalDrop = defineBlock<Data>({
  id: 'hero-tint-oval-drop',
  archetype: 'hero',
  // noimg-safe: image 미제공 시 타원 프레임을 숨기고 텍스트+배지+배경타이포만으로 렌더
  styleTags: ['dark', 'brand', 'beauty', 'bold', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '브랜드 단색(accent) 배경 히어로. 상단 흰 하이라이트 박스 서브카피 → 대형 제품 타이틀 → r=400 초대형 타원 제품 이미지 위에 검정 원형 배지(2줄 텍스트) 우측 오버랩 → 하단 대형 영문 배경 타이포 + 브랜드라인. 뷰티·스킨케어 신제품 런치에 최적. 톤=dark, em은 em-dark(#FFF7EA) 스코프.',
  schema,
  css: `
/* ── 루트 섹션 ── */
.hioz{
  position:relative;
  background:var(--accent);
  color:#fff;
  padding:52px var(--pad-x,56px) 0;
  overflow:hidden;
  text-align:center
}

/* 다크(accent) 배경 위 em 강조 — Sprint 6 Directive 필수 스코프 */
.hioz .em{color:var(--em-dark,#FFF7EA)}

/* ── 상단 흰 하이라이트 박스 ── */
.hioz-hl-wrap{display:flex;justify-content:center;margin-bottom:30px}
.hioz-hl{
  display:inline-block;
  background:#ffffff;
  color:var(--accent);
  font-family:var(--font-body);
  font-weight:700;
  font-size:18px;
  line-height:1.4;
  padding:10px 32px;
  border-radius:calc(var(--r-scale,1)*6px);
  letter-spacing:-.01em;
  max-width:700px
}

/* ── 타이틀 ── */
.hioz-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(44px,6.5vw,68px);
  line-height:1.1;
  letter-spacing:-.025em;
  color:#ffffff;
  margin-bottom:18px
}

/* ── 서브타이틀 ── */
.hioz-subtitle{
  font-size:clamp(17px,2.2vw,22px);
  font-weight:500;
  line-height:1.62;
  color:rgba(255,255,255,.86);
  max-width:600px;
  margin:0 auto 44px
}
.hioz-subtitle .em{color:var(--em-dark,#FFF7EA);font-weight:700}

/* ── 제품 이미지 + 배지 컨테이너 ── */
.hioz-product{
  position:relative;
  width:100%;
  display:flex;
  justify-content:center
}

/* r=400 초대형 타원 프레임 —
   원본 750×1000(3:4)을 데스크톱 가로 폭에 맞춰 3:2.6 비율로 재구성.
   var(--shape-photo) 주입 시 페이지 형태 언어 통일, 미주입 시 고유 타원값 사용. */
.hioz-oval{
  display:block;
  width:calc(100% - 64px);
  max-width:660px;
  aspect-ratio:3/2.6;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*180px) / calc(var(--r-scale,1)*160px))
}
/* 이미지 미제공(강등): 타원 프레임 자체를 숨겨 빈 점선 박스 노출 방지 */
.hioz-oval.ph{display:none!important}

/* ── 우측 검정 원형 배지 오버랩 ── */
.hioz-badge{
  position:absolute;
  right:24px;
  top:22px;
  width:clamp(108px,14vw,148px);
  height:clamp(108px,14vw,148px);
  background:#0b0b0b;
  border-radius:50%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  z-index:2;
  flex-shrink:0
}
.hioz-badge-l1{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(32px,5.5vw,48px);
  line-height:1;
  color:#ffffff;
  letter-spacing:-.01em
}
.hioz-badge-l2{
  font-family:var(--font-display);
  font-weight:300;
  font-size:clamp(13px,1.8vw,18px);
  line-height:1.2;
  color:#ffffff;
  letter-spacing:.08em;
  text-transform:uppercase
}

/* ── 하단 대형 영문 배경 타이포 ── */
.hioz-bgword{
  pointer-events:none;
  margin-top:-14px;
  font-family:var(--font-lat);
  font-weight:400;
  font-size:clamp(68px,13.5vw,128px);
  line-height:1;
  color:rgba(255,255,255,.2);
  letter-spacing:-.01em;
  white-space:nowrap;
  overflow:hidden;
  text-align:center;
  padding-bottom:2px
}

/* ── 하단 브랜드 라인 ── */
.hioz-brand-row{
  display:flex;
  align-items:center;
  padding:20px var(--pad-x,56px) 34px;
  gap:0
}
.hioz-brand-name{
  font-family:var(--font-display);
  font-weight:700;
  font-size:22px;
  color:#ffffff;
  flex-shrink:0;
  letter-spacing:.01em
}
.hioz-brand-hr{
  flex:1;
  height:1px;
  background:rgba(255,255,255,.32);
  margin:0 16px
}
.hioz-brand-sub{
  font-size:13px;
  font-weight:500;
  color:rgba(255,255,255,.72);
  flex-shrink:0;
  max-width:360px;
  text-align:right;
  line-height:1.5
}
`,
  render: (d, { esc, richSafe }) => {
    const l1 = d.badgeLine1 ?? 'NEW'
    const l2 = d.badgeLine2 ?? 'ARRIVAL'
    const hasBrand = d.brand || d.brandSub

    return `
<section class="hioz">

  <div class="hioz-hl-wrap">
    <span class="hioz-hl">${esc(d.highlight)}</span>
  </div>

  <h2 class="hioz-title disp">${richSafe(d.title)}</h2>

  ${d.subtitle ? `<p class="hioz-subtitle">${richSafe(d.subtitle)}</p>` : ''}

  <div class="hioz-product">
    ${media(d.image, 'hioz-oval', '제품 이미지')}
    <div class="hioz-badge" aria-label="${esc(l1)} ${esc(l2)}">
      <span class="hioz-badge-l1">${esc(l1)}</span>
      <span class="hioz-badge-l2">${esc(l2)}</span>
    </div>
  </div>

  ${d.bgWord ? `<div class="hioz-bgword" aria-hidden="true">${esc(d.bgWord)}</div>` : ''}

  ${hasBrand ? `
  <div class="hioz-brand-row">
    ${d.brand ? `<span class="hioz-brand-name">${esc(d.brand)}</span>` : ''}
    ${d.brand && d.brandSub ? `<span class="hioz-brand-hr"></span>` : ''}
    ${d.brandSub ? `<span class="hioz-brand-sub">${esc(d.brandSub)}</span>` : ''}
  </div>` : ''}

</section>`
  },
})
