/** FEATURE 아키타입: award-no1-emblem-hero.
 *  [끝판왕] 어워드(수상·권위) 구성 #4 패턴을 토큰 기반으로 재구성(픽셀 클론 아님).
 *
 *  시그니처:
 *   Zone A — 다크(블랙) 배경 + 작은 어워즈 아이브로우 + 골드 헤어라인 구분선
 *   Zone B — 브랜드×카테고리 "대상" 대형 헤드라인 (2줄, 골드 그라데이션 대형 디스플레이)
 *   Zone C — 대형 골드 원형 메달리온(상단 별 핀 + 별5개 + No.1 + 수상 라벨) + 좌우 골드 대형 로렐 가지
 *   Zone D — 3단 골드 포디움
 *
 *  ⚠️  수상명·연도·기관·브랜드명·카테고리는 반드시 플레이스홀더로 입력하십시오.
 *       brief에 근거 없는 실제 수상 내역·브랜드 무단 기재 금지(허위 광고 위험).
 *       아래 schema 필드 주석 및 describe 참고.
 *
 *  골드 계열(#C9A84C~#F5D77E)과 블랙은 커머스 권위 신호색으로 하드코딩 허용.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 인라인 SVG 상수 ───────────────────────────────────────────────────────────

/**
 * 대형 로렐 가지 — 좌측 (메달리온 옆 장식, 80×220 뷰박스).
 * 줄기 + 5쌍 타원 잎 + 선단 잎. 실제 月桂樹 실루엣 근사.
 */
const BIG_LAUREL_L =
  '<svg class="aneh-bl aneh-bl-l" viewBox="0 0 80 220" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M68 10 C48 40 24 70 16 110 C8 150 24 190 40 210" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
  /* leaf pair 1 */ '<ellipse cx="56" cy="28"  rx="14" ry="6" transform="rotate(-42 56 28)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="62" cy="22"  rx="10" ry="4" transform="rotate(-28 62 22)"  fill="currentColor" opacity=".6"/>' +
  /* leaf pair 2 */ '<ellipse cx="38" cy="55"  rx="14" ry="6" transform="rotate(-52 38 55)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="46" cy="46"  rx="10" ry="4" transform="rotate(-36 46 46)"  fill="currentColor" opacity=".6"/>' +
  /* leaf pair 3 */ '<ellipse cx="24" cy="88"  rx="14" ry="6" transform="rotate(-58 24 88)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="34" cy="78"  rx="10" ry="4" transform="rotate(-42 34 78)"  fill="currentColor" opacity=".6"/>' +
  /* leaf pair 4 */ '<ellipse cx="16" cy="122" rx="14" ry="6" transform="rotate(-62 16 122)" fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="26" cy="112" rx="10" ry="4" transform="rotate(-46 26 112)" fill="currentColor" opacity=".6"/>' +
  /* leaf pair 5 */ '<ellipse cx="24" cy="158" rx="14" ry="6" transform="rotate(-52 24 158)" fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="34" cy="148" rx="10" ry="4" transform="rotate(-36 34 148)" fill="currentColor" opacity=".6"/>' +
  /* tip leaf */    '<ellipse cx="38" cy="194" rx="10" ry="5" transform="rotate(-38 38 194)" fill="currentColor" opacity=".75"/>' +
  '</svg>'

/** 대형 로렐 가지 — 우측 (좌측 수평 미러). */
const BIG_LAUREL_R =
  '<svg class="aneh-bl aneh-bl-r" viewBox="0 0 80 220" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M12 10 C32 40 56 70 64 110 C72 150 56 190 40 210" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
  '<ellipse cx="24" cy="28"  rx="14" ry="6" transform="rotate(42 24 28)"   fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="18" cy="22"  rx="10" ry="4" transform="rotate(28 18 22)"   fill="currentColor" opacity=".6"/>' +
  '<ellipse cx="42" cy="55"  rx="14" ry="6" transform="rotate(52 42 55)"   fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="34" cy="46"  rx="10" ry="4" transform="rotate(36 34 46)"   fill="currentColor" opacity=".6"/>' +
  '<ellipse cx="56" cy="88"  rx="14" ry="6" transform="rotate(58 56 88)"   fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="46" cy="78"  rx="10" ry="4" transform="rotate(42 46 78)"   fill="currentColor" opacity=".6"/>' +
  '<ellipse cx="64" cy="122" rx="14" ry="6" transform="rotate(62 64 122)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="54" cy="112" rx="10" ry="4" transform="rotate(46 54 112)"  fill="currentColor" opacity=".6"/>' +
  '<ellipse cx="56" cy="158" rx="14" ry="6" transform="rotate(52 56 158)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="46" cy="148" rx="10" ry="4" transform="rotate(36 46 148)"  fill="currentColor" opacity=".6"/>' +
  '<ellipse cx="42" cy="194" rx="10" ry="5" transform="rotate(38 42 194)"  fill="currentColor" opacity=".75"/>' +
  '</svg>'

/**
 * 메달리온 상단 핀 별 — 골드 채움 별 (원 외부 꼭대기 장식).
 * 뷰박스 28×28, 중앙 기준.
 */
const PIN_STAR =
  '<svg class="aneh-pin-star" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<polygon points="14,2 16.9,10.1 25.5,10.1 18.8,15.4 21.2,23.8 14,18.8 6.8,23.8 9.2,15.4 2.5,10.1 11.1,10.1" fill="#E8C96A"/>' +
  '</svg>'

/** 별 5개 행 */
const STARS_5 = '<span class="aneh-stars" aria-hidden="true">★★★★★</span>'

// ── Zod 스키마 ────────────────────────────────────────────────────────────────

const schema = z.object({
  /**
   * 상단 아이브로우 줄 (예: "2026 [수상명] 어워즈").
   * ⚠️ 연도·수상명은 반드시 플레이스홀더 — 실제 수상 내역만 기재.
   */
  eyebrow: z.string().min(1).optional(),

  /**
   * 골드 헤어라인 구분선 표시 여부 (기본 true).
   * eyebrow 아래, 대형 헤드라인 위에 가로 골드 선.
   */
  showDivider: z.boolean().optional(),

  /**
   * 대형 브랜드×카테고리 헤드라인 1행 (예: "[브랜드명]").
   * ⚠️ 실제 브랜드명은 사업주가 직접 입력 — 임의 기재 금지.
   * em 허용.
   */
  headlineTop: z.string().min(1),

  /**
   * 대형 헤드라인 2행 (예: "메이크업뷰티 부문 대상").
   * ⚠️ 카테고리·수상명은 brief 기반 플레이스홀더만 허용.
   * em 허용.
   */
  headlineBottom: z.string().min(1),

  /**
   * 메달리온 내부 컨텍스트 라벨 (예: "2026 KOREA'S NO.1").
   * ⚠️ 실제 시상 주관처가 없는 경우 임의 기재 금지.
   */
  medallionContext: z.string().min(1).optional(),

  /**
   * 메달리온 중앙 대형 텍스트 (기본 "No.1").
   * 로마 숫자·텍스트 모두 가능 (예: "No.1", "1st", "BEST").
   */
  medallionMain: z.string().min(1),

  /**
   * 메달리온 하단 수상 라벨 (예: "[YEAR] Korea's No.1 Grand Prize").
   * ⚠️ 반드시 플레이스홀더로 기재. 허위 수상 내역 기재 금지.
   */
  awardLabel: z.string().min(1).optional(),

  /** 포디움(받침대) 표시 여부 (기본 true). */
  showPodium: z.boolean().optional(),
})

type Data = z.infer<typeof schema>

// ── defineBlock ───────────────────────────────────────────────────────────────

export const awardNo1EmblemHero = defineBlock<Data>({
  id: 'award-no1-emblem-hero',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'authority', 'medallion', 'hero-headline', 'premium', 'template'],
  imageSlots: 0,
  describe:
    '어워드 권위 히어로(No.1 메달리온+브랜드 대형 헤드라인). 블랙 배경 + 작은 어워즈 아이브로우 + 골드 헤어라인 구분 + 2줄 골드 그라데이션 대형 브랜드×카테고리 헤드라인("[브랜드명] / [카테고리] 부문 대상") + 대형 원형 메달리온(상단 핀별+별5개+No.1+수상라벨) + 좌우 골드 대형 로렐 가지 + 3단 골드 포디움. award_4 Figma 프레임 패턴. ⚠️ 수상명·연도·기관·브랜드명·카테고리는 반드시 플레이스홀더 — 허위 수상·브랜드 기재 절대 금지.',
  schema,
  css: `
/* award-no1-emblem-hero — 접두사 aneh- */
/* 골드(#C9A84C~#F5D77E)·블랙은 커머스 권위 신호색으로 하드코딩 허용 */

.aneh{
  background:#0d0c09;
  color:#fff;
  padding:44px 28px 0;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
  overflow:hidden;
  position:relative;
}

/* ── 배경 라이트 버스트 (메달리온 영역, 하단) ── */
.aneh::after{
  content:'';
  position:absolute;
  left:50%;bottom:60px;
  transform:translateX(-50%);
  width:520px;height:520px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(201,168,76,.20) 0%,rgba(201,168,76,.06) 42%,transparent 70%);
  pointer-events:none;
  z-index:0;
}

/* ── Zone A: 아이브로우 ── */
.aneh-eyebrow{
  display:block;
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  letter-spacing:.08em;
  color:rgba(255,255,255,.52);
  margin-bottom:14px;
}

/* ── 골드 헤어라인 구분선 ── */
.aneh-divider{
  width:100%;
  height:1px;
  background:linear-gradient(90deg,transparent 0%,#C9A84C 30%,#E8C96A 50%,#C9A84C 70%,transparent 100%);
  margin-bottom:28px;
  opacity:.6;
}

/* ── Zone B: 브랜드×카테고리 대형 헤드라인 ── */
.aneh-headline{
  font-family:var(--font-display);
  font-weight:800;
  line-height:1.12;
  letter-spacing:-.025em;
  /* 골드 그라데이션 텍스트 */
  background:linear-gradient(180deg,#F5D77E 0%,#C9A84C 55%,#A87C28 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  margin-bottom:36px;
  position:relative;
  z-index:1;
}
.aneh-hl-top{
  display:block;
  font-size:clamp(30px,7.5vw,52px);
  margin-bottom:4px;
}
.aneh-hl-bot{
  display:block;
  font-size:clamp(26px,6.5vw,44px);
}
/* em 은 골드 그라데이션 context에서 색 override 불필요 — 구조적 강조만 */
.aneh-headline .em{
  font-style:italic;
}

/* ── Zone C: 메달리온 존 ── */
.aneh-medallion-zone{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1;
}

/* 대형 로렐 가지 */
.aneh-bl{
  width:82px;
  height:210px;
  color:#C9A84C;
  flex-shrink:0;
  position:relative;
  z-index:2;
}
.aneh-bl-l{margin-right:-26px}
.aneh-bl-r{margin-left:-26px}

/* 메달리온 + 포디움 수직 스택 */
.aneh-medal-stack{
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  z-index:3;
}

/* 메달리온 상단 핀 별 — 원 외부 꼭대기 */
.aneh-pin-star{
  display:block;
  width:28px;
  height:28px;
  margin-bottom:-4px;
  position:relative;
  z-index:4;
  filter:drop-shadow(0 0 6px rgba(232,201,106,.7));
}

/* 원형 메달리온 외곽 링 (3중 골드 링) */
.aneh-medal{
  width:228px;
  height:228px;
  border-radius:50%;
  border:3px solid #E8C96A;
  box-shadow:
    0 0 0 6px #0d0c09,
    0 0 0 12px #C9A84C,
    0 0 0 14px #0d0c09,
    0 0 60px rgba(201,168,76,.38),
    inset 0 0 44px rgba(0,0,0,.52);
  background:radial-gradient(circle at 50% 36%,#2a2410 0%,#0d0c09 62%);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:4px;
  padding:20px 16px;
  position:relative;
  z-index:3;
}

/* 메달리온 내부 요소 */
.aneh-stars{
  font-size:11px;
  letter-spacing:3px;
  color:#E8C96A;
  display:block;
  line-height:1;
}
.aneh-medal-ctx{
  font-family:var(--font-body);
  font-size:10px;
  font-weight:700;
  letter-spacing:.16em;
  color:rgba(201,168,76,.75);
  text-transform:uppercase;
  line-height:1.2;
}
/* 필기체 스타일 No.1 — Cormorant Garamond latin 활용 */
.aneh-medal-main{
  font-family:'Cormorant Garamond','Georgia',serif;
  font-weight:700;
  font-size:clamp(50px,11.5vw,74px);
  line-height:.92;
  letter-spacing:-.03em;
  color:#F5D77E;
  text-shadow:0 2px 12px rgba(0,0,0,.6);
  /* 텍스트필 override — 메달리온 내부는 단색 */
  -webkit-text-fill-color:#F5D77E;
  background:none;
  background-clip:unset;
}
.aneh-medal-div{
  width:80px;height:1px;
  background:linear-gradient(90deg,transparent,#C9A84C,transparent);
  margin:4px 0;
}
.aneh-award-lbl{
  font-family:var(--font-body);
  font-size:9px;
  font-weight:700;
  letter-spacing:.10em;
  color:rgba(201,168,76,.70);
  text-align:center;
  line-height:1.4;
  text-transform:uppercase;
  max-width:160px;
  /* 텍스트필 override */
  -webkit-text-fill-color:rgba(201,168,76,.70);
  background:none;
  background-clip:unset;
}

/* ── Zone D: 3단 골드 포디움 ── */
.aneh-podium{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-top:-4px;
}
.aneh-podium-t1{
  width:188px;height:22px;
  background:linear-gradient(180deg,#E8C96A 0%,#9A6C1A 100%);
  border-radius:4px 4px 0 0;
  box-shadow:0 -2px 8px rgba(201,168,76,.4);
}
.aneh-podium-t2{
  width:218px;height:16px;
  background:linear-gradient(180deg,#C9A84C 0%,#7A5210 100%);
}
.aneh-podium-t3{
  width:256px;height:12px;
  background:linear-gradient(180deg,#A8881A 0%,#5A3A08 100%);
  border-radius:0 0 2px 2px;
}

/* ── 하단 여백 ── */
.aneh-footer-gap{height:44px;background:#0d0c09}
`,

  render: (d, { esc, richSafe }) => {
    /* Zone A: 아이브로우 */
    const eyebrowHtml = d.eyebrow
      ? `<span class="aneh-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    /* 헤어라인 구분선 */
    const dividerHtml = d.showDivider !== false
      ? `<div class="aneh-divider" aria-hidden="true"></div>`
      : ''

    /* Zone B: 대형 브랜드 헤드라인 */
    const headlineHtml = `
<h2 class="aneh-headline">
  <span class="aneh-hl-top">${richSafe(d.headlineTop)}</span>
  <span class="aneh-hl-bot">${richSafe(d.headlineBottom)}</span>
</h2>`

    /* Zone C: 메달리온 내부 */
    const medallionInner = [
      STARS_5,
      d.medallionContext
        ? `<span class="aneh-medal-ctx">${esc(d.medallionContext)}</span>`
        : '',
      `<span class="aneh-medal-main">${esc(d.medallionMain)}</span>`,
      d.awardLabel
        ? `<div class="aneh-medal-div"></div><span class="aneh-award-lbl">${esc(d.awardLabel)}</span>`
        : '',
    ]
      .filter(Boolean)
      .join('\n        ')

    /* Zone D: 포디움 */
    const showPodium = d.showPodium !== false
    const podiumHtml = showPodium
      ? `<div class="aneh-podium">
          <div class="aneh-podium-t1"></div>
          <div class="aneh-podium-t2"></div>
          <div class="aneh-podium-t3"></div>
        </div>`
      : ''

    return `
<section class="aneh">
  ${eyebrowHtml}
  ${dividerHtml}
  ${headlineHtml}

  <div class="aneh-medallion-zone">
    ${BIG_LAUREL_L}
    <div class="aneh-medal-stack">
      ${PIN_STAR}
      <div class="aneh-medal">
        ${medallionInner}
      </div>
      ${podiumHtml}
    </div>
    ${BIG_LAUREL_R}
  </div>

  <div class="aneh-footer-gap"></div>
</section>`
  },
})
