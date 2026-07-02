/** FEATURE 아키타입(어워드 특화): award-laurel-emblem-grid.
 *  [끝판왕] 어워드(수상·권위) 구성 #15 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처:
 *    ① 상단 골드 컬러바 (설립연도 + 슬로건)
 *    ② 블랙 배경 + 대형 골드 월계관 SVG가 브랜드명 + 주요 수치를 원형으로 포위하는 중앙 엠블럼 히어로
 *    ③ 블랙 배경 + 대형 왼쪽 정렬 누적 수치(숫자 accent) + 우측 각주
 *    ④ 2×2(~2×3) 황금 카드 그리드 — 카드마다 미니 원형 로렐 엠블럼 + 수상명 + 기관
 *
 *  ⚠️  수상명·수상기관·연도는 반드시 사용자 입력 플레이스홀더로 처리.
 *       brief 근거 없이 지어내기 금지. schema describe/주석에도 명기.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 대형 골드 월계관 SVG (채운 잎사귀, 그라디언트 골드 근사) ─────────────────
// 왼쪽 가지(포물선 줄기 + 타원 잎 6장). 오른쪽은 CSS scaleX(-1) 반전 재사용.
// 골드 계열(#C9A84C~#F5D77E)은 커머스 권위 신호색 — 하드코딩 허용(규칙 §어워드특화).
const LAUREL_BIG_LEFT = `<svg class="aleg-lrl" viewBox="0 0 70 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="aleg-gl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="50%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#A07828"/>
    </linearGradient>
  </defs>
  <!-- 줄기 -->
  <path d="M52 8 C36 30 14 60 10 100 C6 138 20 166 36 192" stroke="url(#aleg-gl)" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- 잎 1 -->
  <ellipse cx="46" cy="24" rx="14" ry="7" transform="rotate(-42 46 24)" fill="url(#aleg-gl)" opacity=".95"/>
  <!-- 잎 2 -->
  <ellipse cx="32" cy="46" rx="14" ry="7" transform="rotate(-52 32 46)" fill="url(#aleg-gl)" opacity=".92"/>
  <!-- 잎 3 -->
  <ellipse cx="20" cy="70" rx="14" ry="7" transform="rotate(-58 20 70)" fill="url(#aleg-gl)" opacity=".90"/>
  <!-- 잎 4 -->
  <ellipse cx="12" cy="96" rx="14" ry="7" transform="rotate(-62 12 96)" fill="url(#aleg-gl)" opacity=".88"/>
  <!-- 잎 5 -->
  <ellipse cx="12" cy="124" rx="13" ry="6.5" transform="rotate(-58 12 124)" fill="url(#aleg-gl)" opacity=".86"/>
  <!-- 잎 6 -->
  <ellipse cx="20" cy="150" rx="13" ry="6.5" transform="rotate(-50 20 150)" fill="url(#aleg-gl)" opacity=".84"/>
  <!-- 잎 7 -->
  <ellipse cx="30" cy="173" rx="12" ry="6" transform="rotate(-42 30 173)" fill="url(#aleg-gl)" opacity=".82"/>
</svg>`

// 오른쪽 가지 (대칭 독립 SVG — scaleX 반전 시 그라디언트 방향도 자연스럽게 역전)
const LAUREL_BIG_RIGHT = `<svg class="aleg-lrr" viewBox="0 0 70 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="aleg-gr" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="50%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#A07828"/>
    </linearGradient>
  </defs>
  <path d="M18 8 C34 30 56 60 60 100 C64 138 50 166 34 192" stroke="url(#aleg-gr)" stroke-width="3" stroke-linecap="round" fill="none"/>
  <ellipse cx="24" cy="24" rx="14" ry="7" transform="rotate(42 24 24)" fill="url(#aleg-gr)" opacity=".95"/>
  <ellipse cx="38" cy="46" rx="14" ry="7" transform="rotate(52 38 46)" fill="url(#aleg-gr)" opacity=".92"/>
  <ellipse cx="50" cy="70" rx="14" ry="7" transform="rotate(58 50 70)" fill="url(#aleg-gr)" opacity=".90"/>
  <ellipse cx="58" cy="96" rx="14" ry="7" transform="rotate(62 58 96)" fill="url(#aleg-gr)" opacity=".88"/>
  <ellipse cx="58" cy="124" rx="13" ry="6.5" transform="rotate(58 58 124)" fill="url(#aleg-gr)" opacity=".86"/>
  <ellipse cx="50" cy="150" rx="13" ry="6.5" transform="rotate(50 50 150)" fill="url(#aleg-gr)" opacity=".84"/>
  <ellipse cx="40" cy="173" rx="12" ry="6" transform="rotate(42 40 173)" fill="url(#aleg-gr)" opacity=".82"/>
</svg>`

// 별 아이콘 — 엠블럼 중앙 구분선 위
const STAR_GOLD = `<svg class="aleg-star" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 0l1.96 7.84L20 10l-8.04 2.16L10 20l-1.96-7.84L0 10l8.04-2.16z" fill="#C9A84C"/></svg>`

// 미니 로렐 원형 엠블럼 (카드용 — 단일 SVG, fill 골드)
const MINI_LAUREL_EMBLEM = (label: string): string =>
  `<svg class="aleg-mini-emb" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="aleg-mg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#A07828"/>
    </linearGradient>
  </defs>
  <!-- 외곽 원 -->
  <circle cx="40" cy="40" r="37" stroke="url(#aleg-mg)" stroke-width="2.5" fill="none"/>
  <circle cx="40" cy="40" r="31" stroke="url(#aleg-mg)" stroke-width="1.2" fill="none" opacity=".6"/>
  <!-- 왼쪽 미니 가지 -->
  <path d="M22 28 C18 38 16 50 20 60" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <ellipse cx="19" cy="34" rx="6" ry="3" transform="rotate(-40 19 34)" fill="#C9A84C" opacity=".9"/>
  <ellipse cx="16" cy="44" rx="6" ry="3" transform="rotate(-50 16 44)" fill="#C9A84C" opacity=".85"/>
  <ellipse cx="17" cy="54" rx="5.5" ry="2.8" transform="rotate(-42 17 54)" fill="#C9A84C" opacity=".80"/>
  <!-- 오른쪽 미니 가지 -->
  <path d="M58 28 C62 38 64 50 60 60" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <ellipse cx="61" cy="34" rx="6" ry="3" transform="rotate(40 61 34)" fill="#C9A84C" opacity=".9"/>
  <ellipse cx="64" cy="44" rx="6" ry="3" transform="rotate(50 64 44)" fill="#C9A84C" opacity=".85"/>
  <ellipse cx="63" cy="54" rx="5.5" ry="2.8" transform="rotate(42 63 54)" fill="#C9A84C" opacity=".80"/>
  <!-- 라벨 텍스트 -->
  <text x="40" y="44" text-anchor="middle" dominant-baseline="middle"
    font-size="10" font-weight="800" fill="#F5D77E" font-family="sans-serif">${label}</text>
</svg>`

// ── Zod 스키마 ─────────────────────────────────────────────────────────────────
const schema = z.object({
  /** 상단 컬러바: 설립연도 표기 (예: "SINCE 2012") — 플레이스홀더 권장 */
  since: z.string().min(1).optional(),
  /** 상단 컬러바: 슬로건/태그라인 (옵션) */
  slogan: z.string().min(1).optional(),

  /** 엠블럼 히어로: 브랜드 카테고리 레이블 (로렐 내부 상단, 예: "건강기능식품 전문기업") */
  categoryLabel: z.string().min(1).optional(),
  /** 엠블럼 히어로: 브랜드명 (로렐 내부 대형, 예: "[회사명]") */
  brandName: z.string().min(1),
  /** 엠블럼 히어로: 주요 수치 숫자 (골드 강조, 예: "25,283") */
  statNumber: z.string().min(1).optional(),
  /** 엠블럼 히어로: 수치 단위+설명 (예: "건 이상 돌파!") */
  statSuffix: z.string().min(1).optional(),

  /** 누적 수치 섹션: 수치 레이블 (예: "누적판매") */
  cumLabel: z.string().min(1).optional(),
  /** 누적 수치 섹션: 대형 수치 (em 허용, 예: "<span class=\"em\">2억 5</span>천만") */
  cumStat: z.string().min(1).optional(),
  /** 누적 수치 섹션: 각주 라인 배열 (최대 4줄, 선택) */
  cumNotes: z.array(z.string().min(1)).max(4).optional(),

  /**
   * 수상 카드 그리드 (2~6개, 2열 배치)
   * ⚠️  수상명·수상기관·연도는 반드시 실제 수상 정보만 입력 — 지어내기 금지.
   */
  awards: z
    .array(
      z.object({
        /** 미니 엠블럼 중앙 라벨 (짧게, 예: "대상" / "1위") */
        emblemLabel: z.string().min(1),
        /** 수상 기관/부문 설명 (예: "대한민국소비자대상위원회 수상") — 실제 정보만 */
        org: z.string().min(1),
        /** 수상명 (예: "올해의 최고 브랜드") — 실제 정보만 */
        awardName: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

// ── defineBlock ────────────────────────────────────────────────────────────────
export const awardLaurelEmblemGrid = defineBlock<Data>({
  id: 'award-laurel-emblem-grid',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'emblem', 'laurel', 'grid', 'premium', 'credential'],
  imageSlots: 0,
  describe:
    '어워드 엠블럼 히어로 + 그리드. ① 황금 컬러바(설립연도+슬로건) ② 블랙 배경 대형 골드 월계관 SVG가 브랜드명+주요수치를 원형 포위하는 중앙 엠블럼 히어로 ③ 블랙 배경 대형 좌정렬 누적수치+우측각주 ④ 2열 황금 카드 그리드(카드당 미니 원형 로렐 엠블럼+수상명+기관). 수상·권위 신뢰 섹션 최적. ⚠️ 수상명·기관·연도는 사용자 실제 정보 입력 필수 — 지어내기 금지.',
  schema,
  css: `
/* award-laurel-emblem-grid — 접두사 aleg- */
.aleg{background:#111;color:#fff;word-break:keep-all;overflow-wrap:break-word}

/* ① 상단 골드 컬러바 */
.aleg-topbar{background:#C9A84C;display:flex;justify-content:space-between;align-items:center;padding:10px 20px;gap:8px}
.aleg-topbar-since{font-size:13px;font-weight:800;color:#111;letter-spacing:.08em}
.aleg-topbar-slogan{font-size:12px;font-weight:700;color:#111;letter-spacing:.04em;text-align:right;line-height:1.4}

/* ② 엠블럼 히어로 섹션 */
.aleg-hero{background:#111;padding:48px 24px 40px;text-align:center;overflow:hidden}
.aleg-wreath-outer{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:0}
/* 대형 로렐 가지 */
.aleg-lrl,.aleg-lrr{width:62px;height:176px;flex-shrink:0}
/* 엠블럼 내부 콘텐츠 박스 */
.aleg-emblem-inner{padding:0 8px;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0}
.aleg-cat-label{font-size:13px;font-weight:600;color:rgba(255,255,255,.70);letter-spacing:.04em;line-height:1.4;margin-bottom:4px}
.aleg-brand{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5.5vw,34px);line-height:1.2;color:#fff;letter-spacing:-.01em}
/* 골드 구분선 + 별 */
.aleg-div{display:flex;align-items:center;gap:6px;margin:8px 0}
.aleg-divline{flex:1;height:1px;background:linear-gradient(90deg,transparent,#C9A84C,transparent)}
.aleg-star{width:16px;height:16px;flex-shrink:0}
/* 수치 강조 */
.aleg-stat-num{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,7vw,46px);line-height:1.15;color:#F5D77E;letter-spacing:-.02em}
.aleg-stat-suf{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,5vw,30px);line-height:1.2;color:#fff;letter-spacing:-.01em;margin-top:2px}

/* ③ 누적 수치 섹션 */
.aleg-cum{background:#111;padding:32px 24px 36px;border-top:1px solid rgba(255,255,255,.08)}
.aleg-cum-inner{display:flex;align-items:flex-start;gap:16px}
.aleg-cum-left{flex:1;min-width:0}
.aleg-cum-label{font-size:14px;font-weight:700;color:rgba(255,255,255,.55);letter-spacing:.04em;margin-bottom:4px}
.aleg-cum-stat{font-family:var(--font-display);font-weight:800;font-size:clamp(42px,10vw,68px);line-height:1.1;letter-spacing:-.03em;color:#fff}
/* 다크 배경 — .em은 골드(커머스 권위 신호색) */
.aleg-cum-stat .em{color:#F5D77E}
.aleg-cum-notes{flex:0 0 auto;max-width:48%;padding-top:6px;display:flex;flex-direction:column;gap:6px}
.aleg-cum-note{font-size:11px;line-height:1.55;color:rgba(255,255,255,.45)}

/* ④ 수상 카드 그리드 */
.aleg-grid{background:#111;padding:0 16px 36px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.aleg-card{background:linear-gradient(145deg,#3A2A0A,#2A1E06);border:1px solid #C9A84C33;border-radius:10px;padding:20px 14px 18px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
/* 미니 원형 로렐 엠블럼 */
.aleg-mini-emb{width:60px;height:60px;flex-shrink:0}
.aleg-card-org{font-size:11px;font-weight:600;color:rgba(255,255,255,.55);line-height:1.45;letter-spacing:.02em}
.aleg-card-name{font-family:var(--font-display);font-weight:800;font-size:clamp(14px,3.5vw,17px);line-height:1.3;color:#fff;letter-spacing:-.01em}
`,
  render: (d, { esc, richSafe }) => {
    // ① 상단 컬러바
    const topBar =
      d.since || d.slogan
        ? `<div class="aleg-topbar">
        <span class="aleg-topbar-since">${esc(d.since ?? '')}</span>
        ${d.slogan ? `<span class="aleg-topbar-slogan">${esc(d.slogan)}</span>` : ''}
      </div>`
        : ''

    // ② 엠블럼 히어로
    const catLabel = d.categoryLabel
      ? `<div class="aleg-cat-label">${esc(d.categoryLabel)}</div>`
      : ''
    const statNum = d.statNumber
      ? `<div class="aleg-stat-num">${esc(d.statNumber)}</div>`
      : ''
    const statSuf = d.statSuffix
      ? `<div class="aleg-stat-suf">${esc(d.statSuffix)}</div>`
      : ''

    const hero = `<div class="aleg-hero">
      <div class="aleg-wreath-outer">
        ${LAUREL_BIG_LEFT}
        <div class="aleg-emblem-inner">
          ${catLabel}
          <div class="aleg-brand">${esc(d.brandName)}</div>
          ${(d.statNumber || d.statSuffix)
            ? `<div class="aleg-div">
              <div class="aleg-divline"></div>
              ${STAR_GOLD}
              <div class="aleg-divline"></div>
            </div>
            ${statNum}
            ${statSuf}`
            : ''}
        </div>
        ${LAUREL_BIG_RIGHT}
      </div>
    </div>`

    // ③ 누적 수치 섹션
    const cumSection =
      d.cumLabel || d.cumStat
        ? `<div class="aleg-cum">
        <div class="aleg-cum-inner">
          <div class="aleg-cum-left">
            ${d.cumLabel ? `<div class="aleg-cum-label">${esc(d.cumLabel)}</div>` : ''}
            ${d.cumStat ? `<div class="aleg-cum-stat">${richSafe(d.cumStat)}</div>` : ''}
          </div>
          ${d.cumNotes && d.cumNotes.length > 0
            ? `<div class="aleg-cum-notes">
              ${d.cumNotes.map((n) => `<p class="aleg-cum-note">${esc(n)}</p>`).join('')}
            </div>`
            : ''}
        </div>
      </div>`
        : ''

    // ④ 수상 카드 그리드
    const cards = d.awards
      .map(
        (a) => `<div class="aleg-card">
        ${MINI_LAUREL_EMBLEM(esc(a.emblemLabel))}
        <div class="aleg-card-org">${esc(a.org)}</div>
        <div class="aleg-card-name">${esc(a.awardName)}</div>
      </div>`,
      )
      .join('')

    const grid = `<div class="aleg-grid">${cards}</div>`

    return `<section class="aleg">
  ${topBar}
  ${hero}
  ${cumSection}
  ${grid}
</section>`
  },
})
