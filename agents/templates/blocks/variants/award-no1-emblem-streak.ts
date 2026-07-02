/** FEATURE 아키타입: award-no1-emblem-streak.
 *  [끝판왕] 어워드(수상·권위) 구성 #2 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처:
 *    - 블랙/딥브라운 골드 배경
 *    - 상단 별 5개 로우 + 로고 플레이스홀더
 *    - 수상명 헤드라인 (eyebrow)
 *    - 대형 "1" 숫자 엠블럼 — 좌우 인라인 SVG 월계관 날개(wheat branch) 대칭 장식
 *    - 원통형 포디움 (clip-path 스택 직사각형)
 *    - 하단 "N년 연속 수상" 대형 선언 + 서브카피
 *
 *  ⚠️  수상명·연도·기관은 반드시 사용자가 제공한 실제 값으로 채워야 한다.
 *      AI 컴포저는 지어낸 수상명·기관을 절대 삽입하지 않는다 — 모든 슬롯이 플레이스홀더.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 회사/브랜드 로고 URL (선택 — 없으면 점선 placeholder) */
  logoImage: z.string().optional(),
  logoAlt: z.string().optional(),
  /** 수상명 헤드라인 (예: "[연도] [기관] 1위" — em 허용)
   *  ⚠️  반드시 사용자가 제공한 실제 수상 정보를 사용할 것. 지어내기 금지. */
  awardHeadline: z.string().min(1),
  /** 숫자 "1" 아래 왼쪽 글자 강조용 추가 라벨 (선택, 예: "수상") */
  emblemSubLabel: z.string().optional(),
  /** 연속 수상 횟수 (예: "3", "5" — N년 연속 수상 선언에 삽입)
   *  ⚠️  반드시 실제 수상 이력에 근거할 것. */
  streakYears: z.string().min(1),
  /** "N년 연속 수상" 하단 서브카피 (예: "고객만족브랜드 [제품종류] 1위" — em 허용)
   *  ⚠️  제품종류 등 구체 정보는 사용자가 입력한 값을 사용. */
  subCopy: z.string().min(1),
  /** 별 개수 (1~5, 기본 5) */
  starCount: z.number().int().min(1).max(5).optional(),
  /** 포디움 위에 표시할 제품 이미지 (선택 — 있으면 "1" 뒤에 레이어링) */
  productImage: z.string().optional(),
  productImageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

/* ── 인라인 SVG: 월계관 왼쪽 날개 (wheat/laurel branch) ─────────────────────
   패턴 참조: point-award-credential.ts 로렐 리스 SVG
   픽셀 클론 금지 — 구조(중앙 줄기 + 좌우 타원 잎)만 차용, 각도·비율 독립 설계. */
const WHEAT_LEFT = `<svg class="anes-wheat anes-wheat-l" viewBox="0 0 72 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 중앙 줄기 -->
  <path d="M60 8 C44 28 22 58 14 90 C8 116 16 138 28 154" stroke="#C9A84C" stroke-width="2.6" stroke-linecap="round"/>
  <!-- 잎 쌍 — 상부에서 하부로 점진적으로 넓어지며 꺾임 -->
  <ellipse cx="50" cy="24" rx="12" ry="5.5" transform="rotate(-42 50 24)" fill="#C9A84C" opacity=".85"/>
  <ellipse cx="40" cy="43" rx="13" ry="6"   transform="rotate(-52 40 43)" fill="#C9A84C" opacity=".82"/>
  <ellipse cx="29" cy="62" rx="13" ry="6"   transform="rotate(-58 29 62)" fill="#C9A84C" opacity=".80"/>
  <ellipse cx="20" cy="82" rx="13" ry="6"   transform="rotate(-62 20 82)" fill="#C9A84C" opacity=".78"/>
  <ellipse cx="14" cy="103" rx="13" ry="6"  transform="rotate(-58 14 103)" fill="#C9A84C" opacity=".75"/>
  <ellipse cx="18" cy="123" rx="12" ry="5.5" transform="rotate(-50 18 123)" fill="#C9A84C" opacity=".70"/>
  <!-- 하단 곡선 줄기 끝 -->
  <path d="M28 154 C32 148 34 142 30 136" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"/>
</svg>`

const WHEAT_RIGHT = `<svg class="anes-wheat anes-wheat-r" viewBox="0 0 72 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 중앙 줄기 (좌우 대칭) -->
  <path d="M12 8 C28 28 50 58 58 90 C64 116 56 138 44 154" stroke="#C9A84C" stroke-width="2.6" stroke-linecap="round"/>
  <!-- 잎 쌍 -->
  <ellipse cx="22" cy="24" rx="12" ry="5.5" transform="rotate(42 22 24)" fill="#C9A84C" opacity=".85"/>
  <ellipse cx="32" cy="43" rx="13" ry="6"   transform="rotate(52 32 43)" fill="#C9A84C" opacity=".82"/>
  <ellipse cx="43" cy="62" rx="13" ry="6"   transform="rotate(58 43 62)" fill="#C9A84C" opacity=".80"/>
  <ellipse cx="52" cy="82" rx="13" ry="6"   transform="rotate(62 52 82)" fill="#C9A84C" opacity=".78"/>
  <ellipse cx="58" cy="103" rx="13" ry="6"  transform="rotate(58 58 103)" fill="#C9A84C" opacity=".75"/>
  <ellipse cx="54" cy="123" rx="12" ry="5.5" transform="rotate(50 54 123)" fill="#C9A84C" opacity=".70"/>
  <path d="M44 154 C40 148 38 142 42 136" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"/>
</svg>`

/* ── 인라인 SVG: 별 아이콘 (골드 filled) ─────────────────────────────────── */
const GOLD_STAR = `<svg class="anes-star" viewBox="0 0 20 20" fill="#F5D77E" xmlns="http://www.w3.org/2000/svg"><path d="M10 0l2.05 7.6L20 10l-7.95 2.4L10 20l-2.05-7.6L0 10l7.95-2.4z"/></svg>`

/* ── 별 로우 생성 헬퍼 ──────────────────────────────────────────────────── */
function starRow(count: number): string {
  return Array.from({ length: count }, () => GOLD_STAR).join('')
}

export const awardNo1EmblemStreak = defineBlock<Data>({
  id: 'award-no1-emblem-streak',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'emblem', 'streak', 'authority', 'premium', 'template'],
  imageSlots: 2,
  describe:
    '어워드 No.1 엠블럼 연속수상 선언. 블랙/딥브라운 골드 배경 + 5성 로우 + 로고 플레이스홀더 + 수상명 헤드라인 + 대형 황금 "1" 숫자 엠블럼을 좌우 SVG 월계관 날개가 대칭 감싸는 핵심 장식(프레임 면적 60% 이상 차지) + 원통형 클립 포디움 + 하단 "N년 연속 수상" 대형 선언 + 서브카피. 수상명·연도·기관은 모두 플레이스홀더 — AI가 지어내지 않는다.',
  schema,
  css: `
/* award-no1-emblem-streak — 접두사 anes- */
/* ⚠️  수상명·연도·기관은 사용자가 제공한 실제 값만 사용. AI 작성 금지. */

.anes{
  background:linear-gradient(170deg,#2C1E0A 0%,#4A320E 38%,#3A2608 70%,#1C1206 100%);
  color:#fff;
  padding:52px 32px 60px;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
  position:relative;
  overflow:hidden;
}

/* 배경 광택 오브 (좌우 후광) */
.anes::before{
  content:'';
  position:absolute;
  top:10%;left:50%;
  transform:translateX(-50%);
  width:520px;height:520px;
  border-radius:50%;
  background:radial-gradient(ellipse,rgba(197,160,60,.22) 0%,transparent 68%);
  pointer-events:none;
  z-index:0;
}

/* 모든 자식 z-index 상위 */
.anes > *{position:relative;z-index:1}

/* ── 별 로우 ──────────────────────────────────────── */
.anes-stars{
  display:flex;
  justify-content:center;
  gap:8px;
  margin-bottom:20px;
}
.anes-star{width:22px;height:22px}

/* ── 로고 ─────────────────────────────────────────── */
.anes-logo-wrap{margin-bottom:16px}
.anes-logo{
  width:72px;height:72px;
  object-fit:contain;
  display:inline-block;
  background:#fff;
  border-radius:8px;
}
.anes-logo.ph{
  display:inline-flex;align-items:center;justify-content:center;
  width:72px;height:72px;
  background:rgba(255,255,255,.92);
  color:rgba(0,0,0,.45);
  font-size:11px;letter-spacing:.04em;
  border-radius:8px;
  border:none;
  box-shadow:0 2px 12px rgba(0,0,0,.3);
}

/* ── 수상명 헤드라인 ───────────────────────────────── */
.anes-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(22px,5.5vw,32px);
  line-height:1.22;
  letter-spacing:-.01em;
  color:#F5D77E;
  margin-bottom:32px;
}
/* 다크 배경 — .em은 밝은 골드 */
.anes-headline .em{color:#fff}

/* ── 엠블럼 중앙 구역 (월계관 날개 + "1" + 포디움) ── */
.anes-emblem-zone{
  position:relative;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:0;
  margin:0 auto 0;
  /* 충분한 높이 — 프레임 면적 60% 이상 확보 */
  min-height:260px;
}

/* 월계관 날개 SVG */
.anes-wheat{
  width:68px;
  height:152px;
  flex-shrink:0;
  /* 하단 정렬 — 포디움 기준선 맞춤 */
  align-self:flex-end;
  margin-bottom:28px;
}
.anes-wheat-l{transform:none}
.anes-wheat-r{transform:scaleX(-1)}   /* 우측은 수평 반전 */

/* ── "1" 엠블럼 + 포디움 스택 ─────────────────────── */
.anes-no1-stack{
  display:flex;
  flex-direction:column;
  align-items:center;
  flex-shrink:0;
  position:relative;
}

/* 대형 황금 "1" 숫자 */
.anes-no1{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(110px,26vw,168px);
  line-height:1;
  letter-spacing:-.04em;
  /* 3D 골드 효과 — 커머스 권위 신호색 하드코딩 허용 */
  background:linear-gradient(170deg,#F9EC8A 0%,#E0B93C 30%,#C9A020 55%,#A87A10 80%,#F5D77E 100%);
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  text-shadow:none;
  filter:drop-shadow(0 6px 18px rgba(180,120,0,.55));
  position:relative;
  z-index:2;
}

/* 엠블럼 서브라벨 (선택) */
.anes-emblem-sub{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:700;
  color:#F5D77E;
  letter-spacing:.08em;
  margin-top:-8px;
  margin-bottom:4px;
  position:relative;z-index:2;
}

/* 원통형 포디움 — 3단 clip 스택 */
.anes-podium{
  position:relative;
  width:140px;
  z-index:1;
}
/* 포디움 상단 캡 */
.anes-podium-cap{
  height:16px;
  background:linear-gradient(180deg,#F5D77E 0%,#C9A020 100%);
  border-radius:6px 6px 0 0;
  margin:0 8px;
}
/* 포디움 바디 */
.anes-podium-body{
  height:52px;
  background:linear-gradient(180deg,#D4A830 0%,#8C6A10 60%,#5A4208 100%);
  clip-path:polygon(4% 0%,96% 0%,100% 100%,0% 100%);
}
/* 포디움 베이스 */
.anes-podium-base{
  height:14px;
  background:linear-gradient(180deg,#A87818 0%,#6A4A08 100%);
  border-radius:0 0 4px 4px;
  margin:0 -6px;
}

/* 제품 이미지 (있을 때 "1" 뒤 레이어) */
.anes-product{
  position:absolute;
  bottom:82px;   /* 포디움 위 */
  left:50%;
  transform:translateX(-50%);
  width:110px;
  height:140px;
  object-fit:contain;
  z-index:1;     /* "1" 숫자보다 뒤 */
  opacity:.85;
}
.anes-product.ph{
  display:flex;align-items:center;justify-content:center;
  width:110px;height:140px;
  background:rgba(255,255,255,.08);
  border:1.5px dashed rgba(255,255,255,.25);
  color:rgba(255,255,255,.3);
  font-size:11px;
  bottom:82px;left:50%;
  transform:translateX(-50%);
  position:absolute;z-index:1;
}

/* ── 연속 수상 선언 ────────────────────────────────── */
.anes-streak-zone{margin-top:36px}

.anes-streak-line{
  display:flex;
  align-items:baseline;
  justify-content:center;
  gap:0;
  line-height:1.05;
}
/* "N년" — 대형 골드 */
.anes-streak-n{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(54px,14vw,86px);
  letter-spacing:-.03em;
  /* 골드 그라데이션 텍스트 */
  background:linear-gradient(170deg,#F9EC8A 0%,#D4A830 50%,#A87818 100%);
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  filter:drop-shadow(0 3px 10px rgba(180,120,0,.5));
}
/* "연속 수상" — 일반 흰색, 살짝 작게 */
.anes-streak-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,8vw,52px);
  letter-spacing:-.02em;
  color:#fff;
  padding-left:6px;
}

/* 서브카피 */
.anes-subcopy{
  margin-top:14px;
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(16px,4vw,21px);
  color:rgba(255,255,255,.80);
  line-height:1.45;
  letter-spacing:.01em;
}
.anes-subcopy .em{color:#F5D77E;font-weight:800}
`,

  render: (d, { esc, richSafe }) => {
    const count = d.starCount ?? 5

    // 로고
    const logoHtml = d.logoImage
      ? `<img class="anes-logo" src="${esc(d.logoImage)}" alt="${esc(d.logoAlt ?? '회사 로고')}">`
      : `<div class="anes-logo ph">회사 로고</div>`

    // 제품 이미지 (선택)
    const productHtml = d.productImage
      ? `<img class="anes-product" src="${esc(d.productImage)}" alt="${esc(d.productImageAlt ?? '제품 이미지')}">`
      : ''

    // 엠블럼 서브라벨 (선택)
    const emblemSubHtml = d.emblemSubLabel
      ? `<div class="anes-emblem-sub">${esc(d.emblemSubLabel)}</div>`
      : ''

    return `
<section class="anes">
  <!-- 별 로우 -->
  <div class="anes-stars">
    ${starRow(count)}
  </div>

  <!-- 로고 플레이스홀더 -->
  <div class="anes-logo-wrap">
    ${logoHtml}
  </div>

  <!-- 수상명 헤드라인
       ⚠️ 수상명·연도·기관은 사용자가 제공한 실제 값만 사용 — AI 작성 금지 -->
  <h2 class="anes-headline">${richSafe(d.awardHeadline)}</h2>

  <!-- 엠블럼 중앙 구역: 월계관 날개 + "1" + 포디움 -->
  <div class="anes-emblem-zone">
    ${WHEAT_LEFT}

    <div class="anes-no1-stack">
      ${productHtml}
      <div class="anes-no1">1</div>
      ${emblemSubHtml}
      <div class="anes-podium">
        <div class="anes-podium-cap"></div>
        <div class="anes-podium-body"></div>
        <div class="anes-podium-base"></div>
      </div>
    </div>

    ${WHEAT_RIGHT}
  </div>

  <!-- N년 연속 수상 선언
       ⚠️ streakYears는 실제 수상 이력 기반 — AI가 임의로 지어내지 않는다 -->
  <div class="anes-streak-zone">
    <div class="anes-streak-line">
      <span class="anes-streak-n">${esc(d.streakYears)}년</span>
      <span class="anes-streak-label">연속 수상</span>
    </div>
    <p class="anes-subcopy">${richSafe(d.subCopy)}</p>
  </div>
</section>`
  },
})
