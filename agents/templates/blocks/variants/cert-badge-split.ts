/** CERT 아키타입: cert-badge-split
 *  좌측 그라디언트 권위 배지(SVG 후광+로고+판매처 레이블) + 우측 정품 인증 카피 + 하단 경고 카드.
 *  다크(#151515) 배경. 피그마 CS 구성 페이지_23 구조 흡수.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 좌측 배지 상단 (em 허용) — 브랜드명 */
  badgeLine1: z.string().min(1),
  /** 좌측 배지 하단 고정 레이블 (em 허용) — "공식판매처" 등 */
  badgeLine2: z.string().min(1),
  /** 우측 메인 헤드라인 (em, br 허용) */
  headline: z.string().min(1),
  /** 우측 본문 (em, br 허용) — "본 제품은 [브랜드]를 통해 본사에서 출고되는 정품입니다." */
  body: z.string().min(1),
  /** 우측 서브 설명 — 순수 텍스트 */
  subDesc: z.string().optional(),
  /** 하단 경고 카드 타이틀 (em, br 허용) */
  warningTitle: z.string().min(1),
  /** 하단 경고 카드 본문 (em, br 허용) — 비공식 구매 시 불이익 안내 */
  warningBody: z.string().min(1),
  /** 최하단 법적 고지 — 순수 텍스트 (optional) */
  legalNote: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const certBadgeSplit = defineBlock<Data>({
  id: 'cert-badge-split',
  archetype: 'cert',
  styleTags: ['dark', 'premium', 'trust', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '다크 배경 분할형 정품 인증. 좌측에 그라디언트 후광 SVG 배지(브랜드명+공식판매처), 우측에 정품 안내 카피, 하단 흰 라운드 카드에 비공식 구매 경고를 분리 배치. 전자제품·뷰티·프리미엄 식품 신뢰 섹션에 적합.',
  schema,
  css: `
.cjuf{
  position:relative;
  padding:52px var(--pad-x,56px) 44px;
  background:#151515;
  color:#fff;
}
.cjuf .em{color:var(--em-dark,#FFF7EA)}
/* 상단 분할 레이아웃 */
.cjuf-top{
  display:flex;
  align-items:center;
  gap:48px;
  margin-bottom:32px;
}
/* 좌: 배지 영역 */
.cjuf-badge{
  flex:0 0 220px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.cjuf-badge-svg{
  width:200px;
  height:200px;
  display:block;
}
/* 배지 내부 텍스트 */
.cjuf-badge-line1{
  font-family:var(--font-display);
  font-size:22px;
  font-weight:700;
  fill:url(#cjuf-grad-txt);
  text-anchor:middle;
  dominant-baseline:middle;
}
.cjuf-badge-line2{
  font-family:var(--font-display);
  font-size:14px;
  font-weight:600;
  fill:url(#cjuf-grad-txt);
  text-anchor:middle;
  dominant-baseline:middle;
  letter-spacing:.06em;
}
/* 우: 카피 영역 */
.cjuf-copy{
  flex:1;
  min-width:0;
}
.cjuf-headline{
  font-family:var(--font-display);
  font-size:clamp(28px,3.2vw,40px);
  font-weight:700;
  line-height:1.22;
  background:linear-gradient(90deg,#fff 60%,rgba(255,247,234,.55));
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  margin-bottom:16px;
}
.cjuf-body{
  font-size:20px;
  font-weight:500;
  line-height:1.65;
  color:rgba(255,255,255,.92);
}
.cjuf-body .em{color:var(--em-dark,#FFF7EA);font-weight:700}
.cjuf-sub{
  margin-top:10px;
  font-size:14px;
  line-height:1.6;
  color:rgba(255,255,255,.42);
}
/* 하단 경고 카드 */
.cjuf-warn{
  background:#fff;
  border-radius:calc(var(--r-scale,1)*20px);
  padding:22px 32px;
  color:#1a1a1a;
}
.cjuf-warn-title{
  font-size:16px;
  font-weight:600;
  line-height:1.5;
  color:#1a1a1a;
  margin-bottom:6px;
}
.cjuf-warn-body{
  font-size:16px;
  font-weight:700;
  line-height:1.6;
  color:#1a1a1a;
}
.cjuf-warn-body .em{color:var(--accent-d);font-weight:800}
.cjuf-warn-line2{
  margin-top:4px;
  font-size:16px;
  font-weight:400;
  color:#444;
}
/* 최하단 법적 고지 */
.cjuf-legal{
  margin-top:22px;
  font-size:13px;
  line-height:1.65;
  color:rgba(255,255,255,.28);
}
`,
  render: (d, { esc, richSafe }) => {
    // 배지 라인 글자수 적응형 폰트 크기 (한글 폭 ≈ font-size × chars)
    const fit = (s: string, base: number, budget: number): number =>
      Math.max(9, Math.min(base, Math.floor(budget / Math.max(1, s.length))))

    const l1 = d.badgeLine1
    const l2 = d.badgeLine2
    const f1 = fit(l1, 22, 68)
    const f2 = fit(l2, 14, 72)

    return `
<section class="cjuf">
  <div class="cjuf-top">
    <!-- 좌: 그라디언트 후광 배지 SVG -->
    <div class="cjuf-badge" aria-label="${esc(l1)} ${esc(l2)}">
      <svg class="cjuf-badge-svg" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <!-- 후광 방사 그라디언트 -->
          <radialGradient id="cjuf-grad-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stop-color="rgba(255,247,200,.28)"/>
            <stop offset="55%" stop-color="rgba(220,180,80,.10)"/>
            <stop offset="100%" stop-color="rgba(180,140,40,0)"/>
          </radialGradient>
          <!-- 링 + 텍스트용 골드 그라디언트 -->
          <linearGradient id="cjuf-grad-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"  stop-color="#E8C96A"/>
            <stop offset="45%" stop-color="#FFF7C8"/>
            <stop offset="100%" stop-color="#C89F30"/>
          </linearGradient>
          <linearGradient id="cjuf-grad-txt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stop-color="#FFF7C8"/>
            <stop offset="100%" stop-color="#D4A830"/>
          </linearGradient>
          <!-- 내부 원 채움 -->
          <radialGradient id="cjuf-grad-inner" cx="50%" cy="35%" r="65%">
            <stop offset="0%"  stop-color="#2a2418"/>
            <stop offset="100%" stop-color="#111008"/>
          </radialGradient>
        </defs>

        <!-- 후광 원 -->
        <circle cx="100" cy="100" r="98" fill="url(#cjuf-grad-aura)"/>

        <!-- 외곽 광선(빔) 레이어 -->
        <g stroke="url(#cjuf-grad-ring)" stroke-width="1.2" opacity=".55">
          <line x1="100" y1="2"   x2="100" y2="30"/>
          <line x1="100" y1="170" x2="100" y2="198"/>
          <line x1="2"   y1="100" x2="30"  y2="100"/>
          <line x1="170" y1="100" x2="198" y2="100"/>
          <line x1="21"  y1="21"  x2="42"  y2="42"/>
          <line x1="158" y1="158" x2="179" y2="179"/>
          <line x1="179" y1="21"  x2="158" y2="42"/>
          <line x1="21"  y1="179" x2="42"  y2="158"/>
          <line x1="60"  y1="3"   x2="66"  y2="30"/>
          <line x1="140" y1="3"   x2="134" y2="30"/>
          <line x1="60"  y1="197" x2="66"  y2="170"/>
          <line x1="140" y1="197" x2="134" y2="170"/>
          <line x1="3"   y1="60"  x2="30"  y2="66"/>
          <line x1="3"   y1="140" x2="30"  y2="134"/>
          <line x1="197" y1="60"  x2="170" y2="66"/>
          <line x1="197" y1="140" x2="170" y2="134"/>
        </g>

        <!-- 외곽 링 2중 -->
        <circle cx="100" cy="100" r="86" fill="none" stroke="url(#cjuf-grad-ring)" stroke-width="1.8" opacity=".7"/>
        <circle cx="100" cy="100" r="78" fill="none" stroke="url(#cjuf-grad-ring)" stroke-width=".8" opacity=".4"/>

        <!-- 내부 원 채움 -->
        <circle cx="100" cy="100" r="76" fill="url(#cjuf-grad-inner)"/>

        <!-- 내부 테두리 링 -->
        <circle cx="100" cy="100" r="70" fill="none" stroke="url(#cjuf-grad-ring)" stroke-width="1.2" opacity=".55"/>

        <!-- 배지 라인1 -->
        <text
          x="100" y="${f1 <= 14 ? 94 : 97}"
          text-anchor="middle"
          font-size="${f1}"
          font-weight="700"
          fill="url(#cjuf-grad-txt)"
          font-family="var(--font-display,'Pretendard',sans-serif)"
        >${esc(l1)}</text>

        <!-- 구분선 -->
        <line x1="68" y1="108" x2="132" y2="108" stroke="url(#cjuf-grad-ring)" stroke-width=".8" opacity=".5"/>

        <!-- 배지 라인2 -->
        <text
          x="100" y="${f2 <= 10 ? 120 : 122}"
          text-anchor="middle"
          font-size="${f2}"
          font-weight="600"
          fill="url(#cjuf-grad-txt)"
          letter-spacing=".08em"
          font-family="var(--font-display,'Pretendard',sans-serif)"
        >${esc(l2)}</text>

        <!-- 하단 장식 점 3개 -->
        <circle cx="88"  cy="136" r="2.2" fill="url(#cjuf-grad-ring)" opacity=".6"/>
        <circle cx="100" cy="136" r="2.2" fill="url(#cjuf-grad-ring)" opacity=".9"/>
        <circle cx="112" cy="136" r="2.2" fill="url(#cjuf-grad-ring)" opacity=".6"/>
      </svg>
    </div>

    <!-- 우: 인증 카피 -->
    <div class="cjuf-copy">
      <h2 class="cjuf-headline">${richSafe(d.headline)}</h2>
      <p class="cjuf-body">${richSafe(d.body)}</p>
      ${d.subDesc ? `<p class="cjuf-sub">${esc(d.subDesc)}</p>` : ''}
    </div>
  </div>

  <!-- 하단 경고 카드 -->
  <div class="cjuf-warn" role="note" aria-label="비공식 구매 경고">
    <p class="cjuf-warn-title">${richSafe(d.warningTitle)}</p>
    <p class="cjuf-warn-body">${richSafe(d.warningBody)}</p>
  </div>

  ${d.legalNote ? `<p class="cjuf-legal">${esc(d.legalNote)}</p>` : ''}
</section>`
  },
})
