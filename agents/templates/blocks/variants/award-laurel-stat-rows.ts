/** STATS 아키타입: award-laurel-stat-rows.
 *  [끝판왕] 어워드(수상·권위) 구성 #10 패턴을 토큰 기반으로 재구성(클론 아님).
 *
 *  시그니처:
 *    - 블랙/딥브라운 배경 전체 금빛 파티클 산포 + 하단 보케 조명 효과 (CSS radial-gradient)
 *    - 상단 대형 제품명 헤드라인 (흰색) + 골드 서브카피
 *    - 실적 행(2~5개) 각각: 좌우 골드 월계관 SVG + 라벨(소) + 대형 수치 텍스트 (흰색)
 *    - 제품 목업 이미지 하단 우측 배치 (선택)
 *    - 하단 면책 각주 (선택)
 *
 *  ※ 수상명·연도·기관은 반드시 플레이스홀더로 입력하세요.
 *     브리프(실제 데이터) 없이 구체적 수치/기관명을 지어내는 것은 금지입니다.
 *     예시값(N건, N%, N개월 등)은 AI 컴포저가 실데이터로 교체해야 합니다.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 최상단 대형 헤드라인 (em 허용 — accent 강조 어절). 예: "제품명을 입력하세요." */
  headline: z.string().min(1),
  /** 헤드라인 아래 골드 서브카피 (선택). 예: "국내 제일 [제품명] 전문 브랜드" */
  subCopy: z.string().optional(),
  /** 실적/수상 행 (2~5개).
   *  ⚠ label·stat 값은 반드시 실제 데이터 기반 플레이스홀더로 작성. 지어내기 금지. */
  rows: z
    .array(
      z.object({
        /** 수치 위 작은 설명 라벨. 예: "단독 판매 단 N개월 만에" */
        label: z.string().min(1),
        /** 대형 수치/문구 (em 허용). 예: "N건 판매 돌파" */
        stat: z.string().min(1),
      }),
    )
    .min(2)
    .max(5),
  /** 제품 목업 이미지 URL (선택 — 하단 우측 배치) */
  productImage: z.string().optional(),
  /** 이미지 alt */
  productImageAlt: z.string().optional(),
  /** 하단 면책 각주. 예: "* 2026년 2월 기준 자료" */
  footnote: z.string().optional(),
})
type Data = z.infer<typeof schema>

/* ── 인라인 SVG: 골드 월계관 (좌/우) ─────────────────────────────────────────
   point-award-credential.ts의 로렐 SVG를 참고해 어워드 행 전용으로 재구성.
   행 높이에 맞게 폭을 넓히고(viewBox 60×110), 잎 5장, 색은 currentColor(골드 하드코딩).
   픽셀 클론 금지 — 패턴 근사. */
const LAUREL_LEFT = `<svg class="alsr-laurel alsr-laurel-l" viewBox="0 0 60 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M50 8 C34 18 14 32 10 54 C6 76 20 94 32 108" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <ellipse cx="42" cy="20" rx="10" ry="5.5" transform="rotate(-42 42 20)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="31" cy="36" rx="10" ry="5.5" transform="rotate(-50 31 36)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="22" cy="53" rx="10" ry="5.5" transform="rotate(-56 22 53)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="15" cy="71" rx="10" ry="5.5" transform="rotate(-62 15 71)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="19" cy="90" rx="10" ry="5.5" transform="rotate(-50 19 90)" stroke="currentColor" stroke-width="1.9" fill="none"/>
</svg>`

const LAUREL_RIGHT = `<svg class="alsr-laurel alsr-laurel-r" viewBox="0 0 60 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M10 8 C26 18 46 32 50 54 C54 76 40 94 28 108" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <ellipse cx="18" cy="20" rx="10" ry="5.5" transform="rotate(42 18 20)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="29" cy="36" rx="10" ry="5.5" transform="rotate(50 29 36)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="38" cy="53" rx="10" ry="5.5" transform="rotate(56 38 53)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="45" cy="71" rx="10" ry="5.5" transform="rotate(62 45 71)" stroke="currentColor" stroke-width="1.9" fill="none"/>
  <ellipse cx="41" cy="90" rx="10" ry="5.5" transform="rotate(50 41 90)" stroke="currentColor" stroke-width="1.9" fill="none"/>
</svg>`

export const awardLaurelStatRows = defineBlock<Data>({
  id: 'award-laurel-stat-rows',
  archetype: 'stats' as any,
  styleTags: ['dark', 'award', 'gold', 'stats', 'laurel', 'premium', 'credential', 'template'],
  imageSlots: 1,
  describe:
    '어워드 골드 파티클 실적 행. 블랙 배경 + 금빛 파티클 산포 + 보케 조명 + 대형 헤드라인 + [좌우 골드 월계관 SVG — 소 라벨 + 대형 수치] 행 반복(2~5) + 제품 목업 이미지 하단 우측 + 각주. 수상·권위·매출 실적 강조 섹션. ⚠ 수치·기관은 반드시 실데이터 플레이스홀더(N건, N% 등)로 — 지어내기 금지.',
  schema,
  css: `
/* award-laurel-stat-rows — 접두사 alsr- */
/* 어워드 골드 팔레트: #C9A84C(어두운 골드) ~ #F5D77E(밝은 골드) — 커머스 권위 신호색, 하드코딩 허용 */

.alsr{
  position:relative;
  background:#0d0b07;
  color:#fff;
  padding:56px 36px 0;
  text-align:center;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* ── 배경: 금빛 파티클 산포 (radial dots + 노이즈 근사) ── */
.alsr::before{
  content:'';
  position:absolute;
  inset:0;
  /* 다수의 작은 radial 원을 scattered gradient로 시뮬레이션 */
  background:
    radial-gradient(ellipse 1px 1px at 12% 8%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 1.5px 1.5px at 28% 5%, #E8C46A 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 45% 12%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 2px 2px at 62% 4%, #C9A84C 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 78% 9%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 1.5px 1.5px at 90% 6%, #E8C46A 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 5% 18%, #C9A84C 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 35% 22%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 2px 2px at 55% 17%, #E8C46A 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 72% 20%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 1.5px 1.5px at 88% 25%, #C9A84C 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 18% 30%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 40% 35%, #E8C46A 0%, transparent 100%),
    radial-gradient(ellipse 2px 2px at 65% 28%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 82% 33%, #C9A84C 0%, transparent 100%),
    radial-gradient(ellipse 1.5px 1.5px at 8% 42%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 30% 48%, #E8C46A 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 50% 44%, #F5D77E 0%, transparent 100%),
    radial-gradient(ellipse 2px 2px at 70% 40%, #C9A84C 0%, transparent 100%),
    radial-gradient(ellipse 1px 1px at 92% 46%, #F5D77E 0%, transparent 100%);
  pointer-events:none;
  z-index:0;
}

/* ── 배경: 하단 보케 조명 (따뜻한 황금빛 원형 블러) ── */
.alsr::after{
  content:'';
  position:absolute;
  left:50%;
  bottom:-60px;
  transform:translateX(-50%);
  width:140%;
  height:340px;
  background:
    radial-gradient(ellipse 44% 55% at 35% 80%, rgba(201,168,76,.38) 0%, transparent 70%),
    radial-gradient(ellipse 30% 40% at 70% 85%, rgba(245,215,126,.22) 0%, transparent 65%),
    radial-gradient(ellipse 20% 30% at 55% 90%, rgba(180,130,40,.28) 0%, transparent 60%);
  pointer-events:none;
  z-index:0;
}

/* 모든 내부 요소는 z-index:1 이상 */
.alsr-inner{position:relative;z-index:1}

/* ── 헤드라인 영역 ── */
.alsr-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,7.5vw,52px);
  line-height:1.15;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:8px;
}
/* 다크 배경 — .em은 밝은 골드(커머스 권위 신호색) */
.alsr-headline .em{color:#F5D77E}

.alsr-sub{
  font-family:var(--font-body);
  font-size:clamp(14px,3.5vw,18px);
  font-weight:700;
  color:#C9A84C;
  letter-spacing:.01em;
  margin-bottom:36px;
}

/* ── 실적 행 리스트 ── */
.alsr-rows{
  display:flex;
  flex-direction:column;
  gap:0;
  margin-bottom:0;
}

.alsr-row{
  padding:18px 0 16px;
  border-bottom:1px solid rgba(201,168,76,.18);
}
.alsr-row:first-child{border-top:1px solid rgba(201,168,76,.18)}

/* 라벨 (소형, 골드 톤) */
.alsr-label{
  font-family:var(--font-body);
  font-size:clamp(12px,3vw,15px);
  font-weight:500;
  color:rgba(245,215,126,.7);
  letter-spacing:.02em;
  margin-bottom:6px;
}

/* 월계관 + 수치 래퍼 */
.alsr-wreath-row{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:4px;
}

/* 인라인 SVG 월계관 */
.alsr-laurel{
  width:38px;
  height:86px;
  color:#C9A84C;   /* 골드 — 커머스 신호색 하드코딩 허용 */
  flex-shrink:0;
}
/* 우측 월계관은 좌우 반전 */
.alsr-laurel-r{transform:scaleX(-1)}

/* 대형 수치 */
.alsr-stat{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7vw,46px);
  line-height:1.12;
  letter-spacing:-.02em;
  color:#fff;
  padding:0 8px;
  flex:1;
  min-width:0;
}
/* 다크 배경 — .em은 밝은 골드 override */
.alsr-stat .em{color:#F5D77E}

/* ── 제품 목업 이미지 (하단 우측) ── */
.alsr-product-wrap{
  position:relative;
  margin:0 -36px;
  margin-top:24px;
  height:300px;
  overflow:hidden;
}
.alsr-product-img{
  position:absolute;
  right:0;
  bottom:0;
  width:72%;
  height:100%;
  object-fit:cover;
  object-position:top center;
  display:block;
}
.alsr-product-img.ph{
  position:absolute;
  right:0;
  bottom:0;
  width:72%;
  height:100%;
}

/* ── 각주 ── */
.alsr-footnote{
  position:relative;
  z-index:1;
  font-family:var(--font-body);
  font-size:11px;
  color:rgba(255,255,255,.38);
  text-align:center;
  padding:14px 0 20px;
  letter-spacing:.02em;
}
`,
  render: (d, { esc, richSafe }) => {
    // 헤드라인
    const headlineHtml = `<h2 class="alsr-headline">${richSafe(d.headline)}</h2>`
    const subHtml = d.subCopy ? `<p class="alsr-sub">${esc(d.subCopy)}</p>` : ''

    // 실적 행 반복
    const rowsHtml = d.rows
      .map(
        (row) => `
      <div class="alsr-row">
        <div class="alsr-label">${esc(row.label)}</div>
        <div class="alsr-wreath-row">
          ${LAUREL_LEFT}
          <div class="alsr-stat">${richSafe(row.stat)}</div>
          ${LAUREL_RIGHT}
        </div>
      </div>`,
      )
      .join('')

    // 제품 이미지 (선택)
    const productHtml = d.productImage || !d.productImage
      ? `<div class="alsr-product-wrap">${media(d.productImage, 'alsr-product-img', esc(d.productImageAlt ?? '제품 이미지'))}</div>`
      : ''

    // 각주 (선택)
    const footnoteHtml = d.footnote
      ? `<p class="alsr-footnote">${esc(d.footnote)}</p>`
      : ''

    return `
<section class="alsr">
  <div class="alsr-inner">
    ${headlineHtml}
    ${subHtml}
    <div class="alsr-rows">
      ${rowsHtml}
    </div>
    ${productHtml}
  </div>
  ${footnoteHtml}
</section>`
  },
})
