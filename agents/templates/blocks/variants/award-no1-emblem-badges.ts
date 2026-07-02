/** FEATURE 아키타입: award-no1-emblem-badges.
 *  [끝판왕] 어워드(수상·권위) #5 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 딥블랙/딥브라운 배경 + 골드 별 5개 헤더 + 아이브로우 카피 + 초대형 골드
 *  "1위" 헤드라인 + 가로 구분선 + 3연 로렐-뱃지 행 + 초대형 "1" 입체 엠블럼
 *  (좌우 월계관 인라인 SVG + 원통형 포디움 + 골드 방사광) + 선택 푸터 카피.
 *
 *  ⚠️  수상명·연도·기관·수치는 반드시 플레이스홀더로 채울 것.
 *      brief 근거 없이 실제 데이터를 지어내는 것은 시스템 규칙 위반이다.
 *      AI 컴포저도 이 필드를 실제 데이터 없이 임의로 채우지 않는다. */
import { z } from 'zod'
import { defineBlock } from '../types'

const badgeSchema = z.object({
  /** 뱃지 상단 작은 라벨 (예: "고객 만족도") — 플레이스홀더 필수 */
  label: z.string().min(1),
  /** 뱃지 중앙 굵은 수치/문구 (예: "4.8/5.0") — 플레이스홀더 필수 */
  value: z.string().min(1),
  /** 뱃지 하단 보조 라벨 (예: "네이버 쇼핑") — 선택, 플레이스홀더 필수 */
  subLabel: z.string().optional(),
})

const schema = z.object({
  /** 별 5개 위 아이브로우 카피 (예: "실제 후기만으로 증명해낸") */
  eyebrow: z.string().min(1).optional(),
  /** 초대형 헤드라인 (em 허용). 예: "1위 <span class=\"em\">[제품명]</span>"
   *  ⚠️ 수상 순위·제품명은 플레이스홀더. 근거 없이 지어내기 금지. */
  headline: z.string().min(1),
  /** 헤드라인 아래 수평 구분선 표시 여부 (기본 true) */
  showDivider: z.boolean().optional(),
  /** 로렐 뱃지 행 (1~3개). 각 뱃지는 좌우 월계수 아이콘 포함.
   *  ⚠️ value·label 모두 플레이스홀더로 작성. 허위 수치 금지. */
  badges: z.array(badgeSchema).min(1).max(3),
  /** 초대형 "1" 엠블럼 위 작은 텍스트 (예: "NO.1") — 선택 */
  emblemLabel: z.string().optional(),
  /** 섹션 하단 마무리 카피 (em/br 허용) — 선택 */
  closer: z.string().optional(),
})
type Data = z.infer<typeof schema>

/* ── 인라인 SVG: 좌측 로렐 브랜치 (월계수 가지 — best-effort 근사) ─── */
const BRANCH_L = `<svg class="aneb-branch aneb-branch-l" viewBox="0 0 70 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 중심 줄기 -->
  <path d="M54 8 C38 30 20 60 12 100 C6 130 14 162 28 188" stroke="url(#gl)" stroke-width="2.8" stroke-linecap="round" fill="none"/>
  <!-- 잎 6장 — 좌측 가지에서 왼쪽으로 뻗음 -->
  <ellipse cx="44" cy="28"  rx="13" ry="6" transform="rotate(-45 44 28)"  fill="url(#gl)" opacity=".9"/>
  <ellipse cx="32" cy="52"  rx="13" ry="6" transform="rotate(-52 32 52)"  fill="url(#gl)" opacity=".85"/>
  <ellipse cx="22" cy="78"  rx="13" ry="6" transform="rotate(-58 22 78)"  fill="url(#gl)" opacity=".88"/>
  <ellipse cx="14" cy="106" rx="13" ry="6" transform="rotate(-62 14 106)" fill="url(#gl)" opacity=".82"/>
  <ellipse cx="14" cy="134" rx="12" ry="5.5" transform="rotate(-55 14 134)" fill="url(#gl)" opacity=".78"/>
  <ellipse cx="20" cy="160" rx="11" ry="5" transform="rotate(-48 20 160)" fill="url(#gl)" opacity=".72"/>
  <defs>
    <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="55%"  stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
  </defs>
</svg>`

/* ── 인라인 SVG: 우측 로렐 브랜치 (좌측 mirror) ─────────────────── */
const BRANCH_R = `<svg class="aneb-branch aneb-branch-r" viewBox="0 0 70 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 8 C32 30 50 60 58 100 C64 130 56 162 42 188" stroke="url(#gr)" stroke-width="2.8" stroke-linecap="round" fill="none"/>
  <ellipse cx="26" cy="28"  rx="13" ry="6" transform="rotate(45 26 28)"   fill="url(#gr)" opacity=".9"/>
  <ellipse cx="38" cy="52"  rx="13" ry="6" transform="rotate(52 38 52)"   fill="url(#gr)" opacity=".85"/>
  <ellipse cx="48" cy="78"  rx="13" ry="6" transform="rotate(58 48 78)"   fill="url(#gr)" opacity=".88"/>
  <ellipse cx="56" cy="106" rx="13" ry="6" transform="rotate(62 56 106)"  fill="url(#gr)" opacity=".82"/>
  <ellipse cx="56" cy="134" rx="12" ry="5.5" transform="rotate(55 56 134)" fill="url(#gr)" opacity=".78"/>
  <ellipse cx="50" cy="160" rx="11" ry="5" transform="rotate(48 50 160)"  fill="url(#gr)" opacity=".72"/>
  <defs>
    <linearGradient id="gr" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="55%"  stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
  </defs>
</svg>`

/* ── 인라인 SVG: 로렐 뱃지용 소형 왼쪽 브랜치 (뱃지 좌우) ──────── */
const BADGE_LAUREL_L = `<svg class="aneb-bl" viewBox="0 0 30 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 4 C16 12 8 24 6 38 C4 50 10 58 18 62" stroke="#C9A84C" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <ellipse cx="19" cy="12" rx="7" ry="3.5" transform="rotate(-42 19 12)" fill="#C9A84C" opacity=".9"/>
  <ellipse cx="12" cy="24" rx="7" ry="3.5" transform="rotate(-50 12 24)" fill="#C9A84C" opacity=".85"/>
  <ellipse cx="8"  cy="38" rx="7" ry="3.5" transform="rotate(-56 8 38)"  fill="#C9A84C" opacity=".8"/>
  <ellipse cx="10" cy="52" rx="6" ry="3"   transform="rotate(-48 10 52)" fill="#C9A84C" opacity=".75"/>
</svg>`

const BADGE_LAUREL_R = `<svg class="aneb-br" viewBox="0 0 30 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 4 C14 12 22 24 24 38 C26 50 20 58 12 62" stroke="#C9A84C" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <ellipse cx="11" cy="12" rx="7" ry="3.5" transform="rotate(42 11 12)"  fill="#C9A84C" opacity=".9"/>
  <ellipse cx="18" cy="24" rx="7" ry="3.5" transform="rotate(50 18 24)"  fill="#C9A84C" opacity=".85"/>
  <ellipse cx="22" cy="38" rx="7" ry="3.5" transform="rotate(56 22 38)"  fill="#C9A84C" opacity=".8"/>
  <ellipse cx="20" cy="52" rx="6" ry="3"   transform="rotate(48 20 52)"  fill="#C9A84C" opacity=".75"/>
</svg>`

/* ── 인라인 SVG: 별 아이콘 (골드 하드코딩 — 커머스 권위 신호) ─── */
const GOLD_STAR = `<svg class="aneb-star" viewBox="0 0 20 20" fill="#F5D77E" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 1l2.2 6.6H19l-5.6 4 2.1 6.6L10 14.3l-5.5 3.9 2.1-6.6L1 7.6h6.8z"/>
</svg>`

export const awardNo1EmblemBadges = defineBlock<Data>({
  id: 'award-no1-emblem-badges',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'premium', 'authority', 'rank1', 'emblem', 'template'],
  imageSlots: 0,
  describe:
    '어워드 1위 엠블럼 뱃지. 딥블랙 배경 + 골드 별 5개 행 + 아이브로우 카피 + 초대형 골드 "1위" 헤드라인 + 구분선 + 1~3개 로렐 뱃지 행(좌우 월계수+중앙 수치) + 초대형 입체 "1" 엠블럼(좌우 월계관 SVG+원통 포디움+골드 방사광). 커머스 수상 권위 강조 섹션. ⚠️ 수치·수상명은 반드시 사용자 제공 플레이스홀더로 채울 것.',
  schema,
  css: `
/* award-no1-emblem-badges — 접두사 aneb- */
.aneb{background:#1a1206;color:#fff;padding:56px 32px 64px;text-align:center;word-break:keep-all;overflow-wrap:break-word;overflow:hidden;position:relative}

/* 배경 금빛 그라데이션 광원 (방사형) — 중앙 하단 */
.aneb::before{content:'';position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:680px;height:480px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(197,158,56,.18) 0%,rgba(197,158,56,.06) 40%,transparent 70%);pointer-events:none;z-index:0}

/* ── 별 행 ── */
.aneb-stars{display:flex;justify-content:center;gap:6px;margin-bottom:18px;position:relative;z-index:1}
.aneb-star{width:22px;height:22px}

/* ── 아이브로우 ── */
.aneb-eyebrow{font-family:var(--font-body);font-size:16px;font-weight:600;color:rgba(255,255,255,.80);letter-spacing:.02em;margin-bottom:10px;position:relative;z-index:1}

/* ── 초대형 헤드라인 ── */
.aneb-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(42px,10vw,72px);line-height:1.08;letter-spacing:-.03em;color:#F5D77E;margin-bottom:0;position:relative;z-index:1}
/* .em — 헤드라인 내 강조(밝은 흰색으로 product명 강조) */
.aneb-headline .em{color:#fff}

/* ── 헤드라인 하단 구분선 ── */
.aneb-divider{width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(197,158,56,.55) 30%,rgba(197,158,56,.55) 70%,transparent);margin:20px 0 28px;position:relative;z-index:1}

/* ── 로렐 뱃지 행 ── */
.aneb-badges{display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:40px;position:relative;z-index:1}
.aneb-badge-wrap{display:flex;align-items:center;gap:6px}
.aneb-bl,.aneb-br{width:22px;height:46px;flex-shrink:0}
.aneb-badge-inner{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:68px}
.aneb-badge-label{font-family:var(--font-body);font-size:11px;font-weight:700;color:rgba(255,255,255,.62);letter-spacing:.06em}
.aneb-badge-value{font-family:var(--font-display);font-weight:800;font-size:18px;line-height:1.15;color:#F5D77E;letter-spacing:-.01em}
.aneb-badge-sub{font-size:10px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.05em}
/* 뱃지 사이 구분 점 */
.aneb-sep{width:4px;height:4px;border-radius:50%;background:rgba(197,158,56,.45);flex-shrink:0}

/* ── 초대형 "1" 엠블럼 영역 ── */
.aneb-emblem-wrap{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:center;gap:0;margin:0 -16px}
.aneb-branch{flex-shrink:0;width:64px;height:182px;margin-bottom:20px}
.aneb-branch-l{transform-origin:right bottom}
.aneb-branch-r{transform-origin:left bottom}

/* 엠블럼 중앙 컬럼 (숫자 + 포디움) */
.aneb-emblem-col{display:flex;flex-direction:column;align-items:center;position:relative;flex:1;max-width:240px}

/* 엠블럼 상단 작은 라벨 */
.aneb-emblem-label{font-family:var(--font-body);font-size:12px;font-weight:800;letter-spacing:.18em;color:#C9A84C;margin-bottom:8px}

/* 입체 "1" 숫자 — 3D 그라데이션 + 그림자로 입체감 표현 */
.aneb-num{font-family:var(--font-display);font-weight:800;font-size:clamp(140px,36vw,210px);line-height:.9;letter-spacing:-.04em;
  background:linear-gradient(160deg,#FFF5C0 0%,#F5D77E 25%,#C9A84C 55%,#8B6914 80%,#C9A84C 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  filter:drop-shadow(0 6px 28px rgba(197,158,56,.55)) drop-shadow(0 2px 0 rgba(139,105,20,.7));
  position:relative;z-index:2}

/* 원통형 포디움 — clip-path 단순 원통 근사(사각형 스택) */
.aneb-podium{position:relative;width:160px;margin-top:-6px;z-index:1}
/* 포디움 원기둥 몸체 */
.aneb-pod-body{width:160px;height:44px;
  background:linear-gradient(90deg,#8B6914 0%,#C9A84C 30%,#F5D77E 50%,#C9A84C 70%,#8B6914 100%);
  border-radius:4px 4px 0 0}
/* 포디움 상단 타원 (원통 위 면) */
.aneb-pod-top{width:160px;height:24px;
  background:linear-gradient(180deg,#F5D77E 0%,#C9A84C 100%);
  border-radius:50%;margin-bottom:-12px;position:relative;z-index:2}
/* 포디움 하단 받침 */
.aneb-pod-base{width:188px;height:20px;
  background:linear-gradient(90deg,#6B4E0E 0%,#A8822C 30%,#D4A830 50%,#A8822C 70%,#6B4E0E 100%);
  border-radius:2px;margin-left:-14px}
/* 포디움 하단 최하단 넓은 받침 */
.aneb-pod-foot{width:220px;height:16px;
  background:linear-gradient(90deg,#4A3608 0%,#8B6914 30%,#C9A84C 50%,#8B6914 70%,#4A3608 100%);
  border-radius:2px;margin-left:-30px}

/* ── 마무리 카피 ── */
.aneb-closer{margin-top:44px;font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,32px);line-height:1.4;color:#fff;position:relative;z-index:1}
.aneb-closer .em{color:#F5D77E}
`,
  render: (d, { esc, richSafe }) => {
    /* 골드 별 5개 */
    const starsHtml = Array.from({ length: 5 }, () => GOLD_STAR).join('')

    /* 로렐 뱃지 행 */
    const badgesHtml = d.badges
      .map((b, i) => {
        const sep = i < d.badges.length - 1 ? '<div class="aneb-sep"></div>' : ''
        return `
      <div class="aneb-badge-wrap">
        ${BADGE_LAUREL_L}
        <div class="aneb-badge-inner">
          <div class="aneb-badge-label">${esc(b.label)}</div>
          <div class="aneb-badge-value">${esc(b.value)}</div>
          ${b.subLabel ? `<div class="aneb-badge-sub">${esc(b.subLabel)}</div>` : ''}
        </div>
        ${BADGE_LAUREL_R}
      </div>${sep}`
      })
      .join('')

    const divider =
      d.showDivider !== false ? '<div class="aneb-divider"></div>' : ''

    return `
<section class="aneb">
  <div class="aneb-stars">${starsHtml}</div>
  ${d.eyebrow ? `<div class="aneb-eyebrow">${esc(d.eyebrow)}</div>` : ''}
  <h2 class="aneb-headline">${richSafe(d.headline)}</h2>
  ${divider}
  <div class="aneb-badges">${badgesHtml}</div>

  <div class="aneb-emblem-wrap">
    ${BRANCH_L}
    <div class="aneb-emblem-col">
      ${d.emblemLabel ? `<div class="aneb-emblem-label">${esc(d.emblemLabel)}</div>` : ''}
      <div class="aneb-num">1</div>
      <div class="aneb-podium">
        <div class="aneb-pod-top"></div>
        <div class="aneb-pod-body"></div>
        <div class="aneb-pod-base"></div>
        <div class="aneb-pod-foot"></div>
      </div>
    </div>
    ${BRANCH_R}
  </div>

  ${d.closer ? `<p class="aneb-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
