/** FEATURE 아키타입: award-no1-emblem.
 *  [끝판왕] 어워드(수상·권위) 구성 #1 패턴을 토큰 기반으로 재구성(픽셀 클론 아님).
 *
 *  시그니처:
 *   Zone A — 다크(블랙) 배경 + 골드 헤드라인 + 3개 미니 로렐 뱃지 행(소형 크리덴셜).
 *   Zone B — 대형 골드 원형 메달리온(월계관+No.1+수상명) + 좌우 골드 로렐 가지 + 3단 포디움.
 *
 *  ⚠️  수상명·연도·기관은 반드시 플레이스홀더로 입력하십시오.
 *       brief에 근거 없는 실제 수상 내역 기재 금지(허위 광고 위험).
 *       아래 schema 필드 주석 참고.
 *
 *  골드 계열(#C9A84C~#F5D77E)과 블랙은 커머스 권위 신호색으로 하드코딩 허용.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 인라인 SVG 상수 ───────────────────────────────────────────────────────────

/** 미니 로렐 리스 — 좌측 가지 (소형 뱃지용, 30×70) */
const MINI_LAUREL_L =
  '<svg class="ane-ml ane-ml-l" viewBox="0 0 30 70" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M24 4 C16 12 8 22 6 34 C4 46 12 58 18 66" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
  '<ellipse cx="20" cy="12" rx="6" ry="3.2" transform="rotate(-38 20 12)" stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="14" cy="24" rx="6" ry="3.2" transform="rotate(-48 14 24)" stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="9"  cy="36" rx="6" ry="3.2" transform="rotate(-54 9 36)"  stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="7"  cy="49" rx="6" ry="3.2" transform="rotate(-58 7 49)"  stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="11" cy="61" rx="6" ry="3.2" transform="rotate(-46 11 61)" stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '</svg>'

/** 미니 로렐 리스 — 우측 가지 (좌측 미러) */
const MINI_LAUREL_R =
  '<svg class="ane-ml ane-ml-r" viewBox="0 0 30 70" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M6 4 C14 12 22 22 24 34 C26 46 18 58 12 66" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
  '<ellipse cx="10" cy="12" rx="6" ry="3.2" transform="rotate(38 10 12)"  stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="16" cy="24" rx="6" ry="3.2" transform="rotate(48 16 24)"  stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="21" cy="36" rx="6" ry="3.2" transform="rotate(54 21 36)"  stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="23" cy="49" rx="6" ry="3.2" transform="rotate(58 23 49)"  stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '<ellipse cx="19" cy="61" rx="6" ry="3.2" transform="rotate(46 19 61)"  stroke="currentColor" stroke-width="1.4" fill="none"/>' +
  '</svg>'

/**
 * 대형 로렐 가지 — 좌측 (메달리온 옆 장식, 80×220 뷰박스).
 * 줄기 + 5쌍 타원 잎으로 구성. 실제 月桂樹 실루엣 근사.
 */
const BIG_LAUREL_L =
  '<svg class="ane-bl ane-bl-l" viewBox="0 0 80 220" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M68 10 C48 40 24 70 16 110 C8 150 24 190 40 210" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
  /* leaf pair 1 */'<ellipse cx="56" cy="28"  rx="14" ry="6" transform="rotate(-42 56 28)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="62" cy="22"  rx="10" ry="4" transform="rotate(-28 62 22)"  fill="currentColor" opacity=".6"/>' +
  /* leaf pair 2 */'<ellipse cx="38" cy="55"  rx="14" ry="6" transform="rotate(-52 38 55)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="46" cy="46"  rx="10" ry="4" transform="rotate(-36 46 46)"  fill="currentColor" opacity=".6"/>' +
  /* leaf pair 3 */'<ellipse cx="24" cy="88"  rx="14" ry="6" transform="rotate(-58 24 88)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="34" cy="78"  rx="10" ry="4" transform="rotate(-42 34 78)"  fill="currentColor" opacity=".6"/>' +
  /* leaf pair 4 */'<ellipse cx="16" cy="122" rx="14" ry="6" transform="rotate(-62 16 122)" fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="26" cy="112" rx="10" ry="4" transform="rotate(-46 26 112)" fill="currentColor" opacity=".6"/>' +
  /* leaf pair 5 */'<ellipse cx="24" cy="158" rx="14" ry="6" transform="rotate(-52 24 158)" fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="34" cy="148" rx="10" ry="4" transform="rotate(-36 34 148)" fill="currentColor" opacity=".6"/>' +
  /* tip leaf */'<ellipse cx="38" cy="194" rx="10" ry="5" transform="rotate(-38 38 194)" fill="currentColor" opacity=".75"/>' +
  '</svg>'

/** 대형 로렐 가지 — 우측 (좌측 수평 미러). */
const BIG_LAUREL_R =
  '<svg class="ane-bl ane-bl-r" viewBox="0 0 80 220" fill="none" xmlns="http://www.w3.org/2000/svg">' +
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

/** 별 5개 행 */
const STARS_5 =
  '<span class="ane-stars" aria-hidden="true">★★★★★</span>'

/** 별 3개 행 */
const STARS_3 =
  '<span class="ane-stars" aria-hidden="true">★★★</span>'

// ── Zod 스키마 ────────────────────────────────────────────────────────────────

const schema = z.object({
  /**
   * 상단 아이브로우 (예: "[회사명]에서 직접 개발한").
   * ⚠️ 실제 회사명을 기재할 때는 사업주가 직접 입력.
   */
  eyebrow: z.string().min(1).optional(),

  /**
   * 골드 대형 헤드라인 (em 허용).
   * 예: "대한민국이 선택한 <span class=\"em\">No.1</span> 브랜드"
   */
  headline: z.string().min(1),

  /**
   * 미니 로렐 뱃지 행 (2~3개).
   * 각 뱃지: 중앙 큰 숫자/텍스트 + 위아래 보조 라벨.
   * ⚠️ mainValue·topLabel·bottomLabel은 반드시 플레이스홀더로 기재.
   *    (예: "[카테고리] 1위" — 실제 수치는 사업주 확인 후 대입)
   */
  badges: z
    .array(
      z.object({
        /** 뱃지 큰 숫자/텍스트 (예: "1", "4.9", "N만") — ⚠️ 플레이스홀더 */
        mainValue: z.string().min(1),
        /** 뱃지 상단 작은 라벨 (예: "[카테고리] 1위") — ⚠️ 플레이스홀더 */
        topLabel: z.string().min(1).optional(),
        /** 뱃지 하단 보조 라벨 (예: "네이버 브랜드") — ⚠️ 플레이스홀더 */
        bottomLabel: z.string().min(1).optional(),
      }),
    )
    .min(2)
    .max(3),

  /**
   * 메달리온 내부 수상 컨텍스트 라벨 (예: "[YEAR] KOREA").
   * ⚠️ 실제 시상 주관처가 없는 경우 임의 기재 금지.
   */
  medallionContext: z.string().min(1).optional(),

  /**
   * 메달리온 중앙 대형 텍스트 (기본 "No.1").
   * 로마 숫자·텍스트 모두 가능 (예: "No.1", "1st", "BEST").
   */
  medallionMain: z.string().min(1),

  /**
   * 메달리온 하단 수상명 라벨 (예: "[YEAR] 대한민국 NO.1 대상").
   * ⚠️ 반드시 플레이스홀더로 기재. 실제 수상 내역만 입력.
   */
  awardLabel: z.string().min(1).optional(),

  /** 포디움(받침대) 표시 여부 (기본 true). */
  showPodium: z.boolean().optional(),
})

type Data = z.infer<typeof schema>

// ── defineBlock ───────────────────────────────────────────────────────────────

export const awardNo1Emblem = defineBlock<Data>({
  id: 'award-no1-emblem',
  archetype: 'feature' as any,
  styleTags: ['dark', 'award', 'gold', 'authority', 'medallion', 'premium', 'template'],
  imageSlots: 0,
  describe:
    '어워드 권위(No.1 메달리온). 블랙 배경 + 골드 헤드라인 + 2~3개 미니 로렐 뱃지 행(소형 크리덴셜) + 대형 원형 메달리온(월계관+대형 No.1+수상명 라벨+별5개) + 좌우 골드 대형 로렐 가지 + 3단 포디움. 수상·권위 신호 섹션. ⚠️ 수상명·연도·기관은 반드시 플레이스홀더 — 허위 수상 기재 금지.',
  schema,
  css: `
/* award-no1-emblem — 접두사 ane- */
/* 골드(#C9A84C~#F5D77E)·블랙은 커머스 권위 신호색으로 하드코딩 허용 */

.ane{
  background:#0d0c09;
  color:#fff;
  padding:52px 28px 0;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
  overflow:hidden;
  position:relative;
}

/* ── 배경 라이트 버스트 (메달리온 영역) ── */
.ane::after{
  content:'';
  position:absolute;
  left:50%;bottom:80px;
  transform:translateX(-50%);
  width:480px;height:480px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(201,168,76,.22) 0%,rgba(201,168,76,.06) 40%,transparent 70%);
  pointer-events:none;
  z-index:0;
}

/* ── 아이브로우 ── */
.ane-eyebrow{
  display:block;
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  letter-spacing:.08em;
  color:rgba(255,255,255,.52);
  margin-bottom:10px;
}

/* ── 골드 헤드라인 ── */
.ane-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7vw,46px);
  line-height:1.18;
  letter-spacing:-.02em;
  /* 다크 배경 — 화이트 기본, .em만 골드 강조 */
  color:#fff;
  margin-bottom:36px;
}
.ane-headline .em{color:#E8C96A}

/* ── 미니 뱃지 행 ── */
.ane-badge-row{
  display:flex;
  justify-content:center;
  gap:18px;
  margin-bottom:48px;
  position:relative;
  z-index:1;
}

/* 미니 뱃지 셀 */
.ane-badge-cell{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  flex:0 0 auto;
}

/* 미니 로렐 + 숫자 래퍼 */
.ane-mini-wreath{
  position:relative;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:0;
  color:#C9A84C;
}
.ane-ml{width:22px;height:52px;flex-shrink:0}
.ane-ml-l{transform:scaleX(1)}
/* 우측 가지는 뷰박스 내에서 이미 미러됨 — CSS transform 불필요 */
.ane-mini-val{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(24px,5vw,32px);
  line-height:1;
  letter-spacing:-.02em;
  color:#E8C96A;
  padding:0 4px;
  min-width:32px;
  text-align:center;
}

/* 미니 뱃지 라벨 */
.ane-badge-lbl{
  text-align:center;
  display:flex;
  flex-direction:column;
  gap:2px;
}
.ane-badge-top{
  font-family:var(--font-body);
  font-size:11px;
  font-weight:700;
  color:rgba(255,255,255,.82);
  letter-spacing:.02em;
  line-height:1.4;
}
.ane-badge-bot{
  font-family:var(--font-body);
  font-size:10px;
  font-weight:500;
  color:rgba(255,255,255,.48);
  letter-spacing:.02em;
  line-height:1.4;
}

/* ── 메달리온 존 ── */
.ane-medallion-zone{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  padding-bottom:0;
  z-index:1;
}

/* 대형 로렐 가지 */
.ane-bl{
  width:80px;
  height:200px;
  color:#C9A84C;
  flex-shrink:0;
  position:relative;
  z-index:2;
}
.ane-bl-l{margin-right:-24px}
.ane-bl-r{margin-left:-24px}

/* 메달리온 + 포디움 컨테이너 */
.ane-medal-stack{
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  z-index:3;
}

/* 원형 메달리온 외곽 링 */
.ane-medal{
  width:230px;
  height:230px;
  border-radius:50%;
  /* 3중 골드 링 */
  border:3px solid #E8C96A;
  box-shadow:
    0 0 0 6px #0d0c09,
    0 0 0 12px #C9A84C,
    0 0 0 14px #0d0c09,
    0 0 60px rgba(201,168,76,.35),
    inset 0 0 40px rgba(0,0,0,.5);
  background:radial-gradient(circle at 50% 38%,#2a2410 0%,#0d0c09 60%);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:4px;
  padding:20px 16px;
}

/* 메달리온 내부 요소 */
.ane-stars{
  font-size:11px;
  letter-spacing:3px;
  color:#E8C96A;
  display:block;
  line-height:1;
}
.ane-medal-ctx{
  font-family:var(--font-body);
  font-size:10px;
  font-weight:700;
  letter-spacing:.16em;
  color:rgba(201,168,76,.75);
  text-transform:uppercase;
  line-height:1.2;
}
.ane-medal-main{
  font-family:'Cormorant Garamond','Georgia',serif;
  font-weight:700;
  font-size:clamp(52px,12vw,78px);
  line-height:.92;
  letter-spacing:-.03em;
  color:#F5D77E;
  text-shadow:0 2px 12px rgba(0,0,0,.6);
}
.ane-medal-div{
  width:80px;height:1px;
  background:linear-gradient(90deg,transparent,#C9A84C,transparent);
  margin:4px 0;
}
.ane-award-lbl{
  font-family:var(--font-body);
  font-size:9px;
  font-weight:700;
  letter-spacing:.10em;
  color:rgba(201,168,76,.70);
  text-align:center;
  line-height:1.4;
  text-transform:uppercase;
  max-width:160px;
}

/* ── 포디움 ── */
.ane-podium{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-top:-4px;
}
/* 3단 계단 형태 */
.ane-podium-t1{
  width:190px;height:22px;
  background:linear-gradient(180deg,#E8C96A 0%,#9A6C1A 100%);
  border-radius:4px 4px 0 0;
  box-shadow:0 -2px 8px rgba(201,168,76,.4);
}
.ane-podium-t2{
  width:220px;height:16px;
  background:linear-gradient(180deg,#C9A84C 0%,#7A5210 100%);
}
.ane-podium-t3{
  width:260px;height:12px;
  background:linear-gradient(180deg,#A8881A 0%,#5A3A08 100%);
  border-radius:0 0 2px 2px;
}

/* ── 하단 여백(포디움 아래 공간) ── */
.ane-footer-gap{height:40px;background:#0d0c09}
`,

  render: (d, { esc, richSafe }) => {
    /* 아이브로우 */
    const eyebrowHtml = d.eyebrow
      ? `<span class="ane-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    /* 미니 뱃지 행 */
    const badgesHtml = d.badges
      .map(
        (b) => `
        <div class="ane-badge-cell">
          <div class="ane-mini-wreath">
            ${MINI_LAUREL_L}
            <span class="ane-mini-val">${esc(b.mainValue)}</span>
            ${MINI_LAUREL_R}
          </div>
          <div class="ane-badge-lbl">
            ${b.topLabel    ? `<span class="ane-badge-top">${esc(b.topLabel)}</span>`    : ''}
            ${b.bottomLabel ? `<span class="ane-badge-bot">${esc(b.bottomLabel)}</span>` : ''}
          </div>
        </div>`,
      )
      .join('')

    /* 메달리온 내부 */
    const medallionInner = [
      STARS_3,
      d.medallionContext ? `<span class="ane-medal-ctx">${esc(d.medallionContext)}</span>` : '',
      `<span class="ane-medal-main">${esc(d.medallionMain)}</span>`,
      d.awardLabel ? `<div class="ane-medal-div"></div><span class="ane-award-lbl">${esc(d.awardLabel)}</span>` : '',
      STARS_5,
    ]
      .filter(Boolean)
      .join('\n      ')

    /* 포디움 */
    const showPodium = d.showPodium !== false
    const podiumHtml = showPodium
      ? `<div class="ane-podium">
          <div class="ane-podium-t1"></div>
          <div class="ane-podium-t2"></div>
          <div class="ane-podium-t3"></div>
        </div>`
      : ''

    return `
<section class="ane">
  ${eyebrowHtml}
  <h2 class="ane-headline">${richSafe(d.headline)}</h2>

  <div class="ane-badge-row">
    ${badgesHtml}
  </div>

  <div class="ane-medallion-zone">
    ${BIG_LAUREL_L}
    <div class="ane-medal-stack">
      <div class="ane-medal">
        ${medallionInner}
      </div>
      ${podiumHtml}
    </div>
    ${BIG_LAUREL_R}
  </div>

  <div class="ane-footer-gap"></div>
</section>`
  },
})
