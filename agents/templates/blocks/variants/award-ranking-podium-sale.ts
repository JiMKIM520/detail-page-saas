/** PROMO 아키타입: award-ranking-podium-sale.
 *  [끝판왕] 어워드(수상·권위) 구성 #11 패턴을 토큰 기반으로 재구성(픽셀 클론 아님).
 *
 *  시그니처:
 *   Zone A — 블랙 배경 + 좌측 대형 골드 "1" 엠블럼(월계관 포함) + 우측 이벤트 헤드라인/서브카피.
 *   Zone B — 3단 포디움 메달 배지: 1위(금·중앙·돌출), 2위(은·좌), 3위(동/로즈골드·우).
 *             각 배지는 원형 + 월계관 SVG + 순위·상품명·판매량/가격.
 *   Zone C — 2×2 상품 카드 그리드(명칭 + 가격, 금 테두리).
 *   Zone D — "[회사명] 대표 베스트 상품" 구분선 + 3열 대형 가격 카드.
 *   Footer  — 이벤트 기간/유의사항 작은 안내문.
 *
 *  ⚠️ 수상명·연도·기관·순위 근거는 반드시 플레이스홀더로 입력하십시오.
 *      brief에 근거 없는 실제 수상 내역·판매 수치 기재 금지(허위 광고 위험).
 *      아래 schema 필드 주석 및 describe 참고.
 *
 *  골드(#C9A84C~#F5D77E)·실버(#B8B8C8)·로즈골드(#C4956A)·블랙은
 *  커머스 권위 신호색으로 하드코딩 허용.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 인라인 SVG ────────────────────────────────────────────────────────────────

/** 대형 "1" 엠블럼용 로렐 리스 — 좌측 가지 (70×200 뷰박스, 채움 잎) */
const HERO_LAUREL_L =
  '<svg class="arps-hl arps-hl-l" viewBox="0 0 70 200" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M58 8 C40 36 18 68 12 106 C6 144 22 178 36 194" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
  '<ellipse cx="48" cy="24"  rx="13" ry="5.5" transform="rotate(-42 48 24)"  fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="54" cy="17"  rx="9"  ry="3.6" transform="rotate(-28 54 17)"  fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="34" cy="50"  rx="13" ry="5.5" transform="rotate(-52 34 50)"  fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="42" cy="42"  rx="9"  ry="3.6" transform="rotate(-36 42 42)"  fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="20" cy="82"  rx="13" ry="5.5" transform="rotate(-58 20 82)"  fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="30" cy="73"  rx="9"  ry="3.6" transform="rotate(-42 30 73)"  fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="12" cy="116" rx="13" ry="5.5" transform="rotate(-62 12 116)" fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="22" cy="107" rx="9"  ry="3.6" transform="rotate(-46 22 107)" fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="18" cy="152" rx="13" ry="5.5" transform="rotate(-52 18 152)" fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="28" cy="143" rx="9"  ry="3.6" transform="rotate(-36 28 143)" fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="34" cy="182" rx="9"  ry="4.5" transform="rotate(-38 34 182)" fill="currentColor" opacity=".72"/>' +
  '</svg>'

/** 대형 "1" 엠블럼용 로렐 리스 — 우측 가지 (수평 미러) */
const HERO_LAUREL_R =
  '<svg class="arps-hl arps-hl-r" viewBox="0 0 70 200" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M12 8 C30 36 52 68 58 106 C64 144 48 178 34 194" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
  '<ellipse cx="22" cy="24"  rx="13" ry="5.5" transform="rotate(42 22 24)"   fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="16" cy="17"  rx="9"  ry="3.6" transform="rotate(28 16 17)"   fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="36" cy="50"  rx="13" ry="5.5" transform="rotate(52 36 50)"   fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="28" cy="42"  rx="9"  ry="3.6" transform="rotate(36 28 42)"   fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="50" cy="82"  rx="13" ry="5.5" transform="rotate(58 50 82)"   fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="40" cy="73"  rx="9"  ry="3.6" transform="rotate(42 40 73)"   fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="58" cy="116" rx="13" ry="5.5" transform="rotate(62 58 116)"  fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="48" cy="107" rx="9"  ry="3.6" transform="rotate(46 48 107)"  fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="52" cy="152" rx="13" ry="5.5" transform="rotate(52 52 152)"  fill="currentColor" opacity=".92"/>' +
  '<ellipse cx="42" cy="143" rx="9"  ry="3.6" transform="rotate(36 42 143)"  fill="currentColor" opacity=".58"/>' +
  '<ellipse cx="36" cy="182" rx="9"  ry="4.5" transform="rotate(38 36 182)"  fill="currentColor" opacity=".72"/>' +
  '</svg>'

/** 포디움 메달 배지용 소형 로렐 — 좌측 (36×90 뷰박스) */
const MEDAL_LAUREL_L =
  '<svg class="arps-ml arps-ml-l" viewBox="0 0 36 90" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M29 4 C20 18 10 32 8 50 C6 68 14 80 22 88" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
  '<ellipse cx="24" cy="14" rx="7.5" ry="3.2" transform="rotate(-40 24 14)" fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="17" cy="30" rx="7.5" ry="3.2" transform="rotate(-50 17 30)" fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="11" cy="48" rx="7.5" ry="3.2" transform="rotate(-55 11 48)" fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="9"  cy="66" rx="7.5" ry="3.2" transform="rotate(-58 9 66)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="14" cy="82" rx="7"   ry="3"   transform="rotate(-44 14 82)" fill="currentColor" opacity=".75"/>' +
  '</svg>'

/** 포디움 메달 배지용 소형 로렐 — 우측 (수평 미러) */
const MEDAL_LAUREL_R =
  '<svg class="arps-ml arps-ml-r" viewBox="0 0 36 90" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M7 4 C16 18 26 32 28 50 C30 68 22 80 14 88" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
  '<ellipse cx="12" cy="14" rx="7.5" ry="3.2" transform="rotate(40 12 14)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="19" cy="30" rx="7.5" ry="3.2" transform="rotate(50 19 30)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="25" cy="48" rx="7.5" ry="3.2" transform="rotate(55 25 48)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="27" cy="66" rx="7.5" ry="3.2" transform="rotate(58 27 66)"  fill="currentColor" opacity=".9"/>' +
  '<ellipse cx="22" cy="82" rx="7"   ry="3"   transform="rotate(44 22 82)"  fill="currentColor" opacity=".75"/>' +
  '</svg>'

// ── 팔레트 상수 (커머스 권위 신호색 — 하드코딩 허용) ──────────────────────────
const GOLD = '#C9A84C'
const GOLD_LIGHT = '#F5D77E'
const GOLD_MID = '#E0C060'
const SILVER = '#B8B8C8'
const SILVER_LIGHT = '#E2E2EE'
const BRONZE = '#C4956A'
const BRONZE_LIGHT = '#E8B888'
const BLACK_BG = '#0d0c09'
const BLACK_CARD = '#181510'

// ── Zod 스키마 ────────────────────────────────────────────────────────────────

/** 포디움 배지 1개 (1위·2위·3위) */
const podiumItemSchema = z.object({
  /**
   * 순위 숫자 (예: "1", "2", "3").
   * ⚠️ 1~3 숫자만 권장. 순위 근거 없이 임의 기재 금지.
   */
  rank: z.string().min(1),
  /**
   * 상품명 — 반드시 플레이스홀더로 기재 (예: "[상품명]").
   * 실제 상품명은 사업주가 직접 입력.
   */
  productName: z.string().min(1),
  /**
   * 판매량·구매수·핵심 지표 (예: "2.9만", "[판매량]").
   * ⚠️ 근거 없는 수치 기재 금지 — 반드시 플레이스홀더 사용.
   */
  stat: z.string().min(1),
  /** 지표 단위 라벨 (예: "판매", "리뷰", "구매"). 짧게 */
  statUnit: z.string().min(1).optional(),
})

/** 상품 카드 (그리드 슬롯) */
const productCardSchema = z.object({
  /** 상품 설명 줄 (선택). 예: "상품에 대한 설명을 입력하세요." */
  desc: z.string().optional(),
  /**
   * 상품명 (예: "[상품명]").
   * ⚠️ 반드시 플레이스홀더.
   */
  name: z.string().min(1),
  /**
   * 가격 표시 문자열 (예: "19,900원", "[가격]원").
   * ⚠️ 반드시 플레이스홀더.
   */
  price: z.string().min(1),
})

const schema = z.object({
  /**
   * 이벤트 아이브로우/태그라인 (예: "2026년 새해").
   * 기간·시즌 컨텍스트 제공. ⚠️ 실제 날짜는 사업주가 입력.
   */
  eyebrow: z.string().min(1).optional(),

  /**
   * 이벤트 메인 헤드라인 (em 허용).
   * 예: "<span class=\"em\">신년 이벤트</span>!"
   * ⚠️ 과장·허위 수상 표현 금지.
   */
  headline: z.string().min(1),

  /**
   * 헤드라인 아래 서브카피 (선택, em·br 허용).
   * 예: "* 가장 인기 많았던 제품 3가지를 특가로 만나보세요."
   */
  subCopy: z.string().optional(),

  /**
   * 포디움 배지 (반드시 3개: index 0=1위, 1=2위, 2=3위).
   * ⚠️ 순위·판매량은 실제 데이터 기준. 플레이스홀더 필수.
   */
  podium: z.array(podiumItemSchema).min(3).max(3),

  /**
   * 2×2 상품 카드 그리드 (반드시 4개).
   * ⚠️ 가격·상품명은 반드시 플레이스홀더.
   */
  gridCards: z.array(productCardSchema).min(2).max(4),

  /**
   * 브랜드 베스트 섹션 구분선 텍스트 (em 허용).
   * 예: "<span class=\"em\">[회사명]</span>의 대표 베스트 상품"
   * ⚠️ [회사명]은 반드시 플레이스홀더.
   */
  brandSeparatorText: z.string().min(1),

  /**
   * 하단 3열 대형 가격 카드 (반드시 3개).
   * ⚠️ 가격·상품명은 반드시 플레이스홀더.
   */
  bottomCards: z.array(productCardSchema).min(2).max(3),

  /**
   * 푸터 유의사항 (선택). 이벤트 기간·금액·조건 안내.
   * 예: "* 본 배너는 이벤트 전용 금액으로 2026-02-01~2026-03-01까지 적용됩니다."
   * ⚠️ 실제 기간/금액은 사업주가 직접 확인 후 기재.
   */
  footerNote: z.string().optional(),
})

type Data = z.infer<typeof schema>

// ── defineBlock ───────────────────────────────────────────────────────────────

export const awardRankingPodiumSale = defineBlock<Data>({
  id: 'award-ranking-podium-sale',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'podium', 'ranking', 'sale', 'event', 'premium', 'template'],
  imageSlots: 0,
  describe:
    '어워드 랭킹 포디움 특가. 블랙 배경 + 좌측 대형 골드 "1" 엠블럼(월계관) + 우측 이벤트 헤드라인/서브카피(Zone A) + 1위(금·중앙·돌출)·2위(은·좌)·3위(동·우) 3단 원형 포디움 메달 배지(Zone B) + 2×2 금 테두리 상품 카드 그리드(Zone C) + "[회사명] 대표 베스트 상품" 골드 구분선(Zone D) + 3열 대형 가격 카드 + 푸터 유의사항. ⚠️ 수상·순위·가격·판매량은 반드시 플레이스홀더 — 허위 수상 기재 금지.',
  schema,
  css: `
/* award-ranking-podium-sale — 접두사 arps- */
/* 골드(#C9A84C~#F5D77E)·실버(#B8B8C8)·로즈골드(#C4956A)·블랙은 커머스 권위 신호색 하드코딩 허용 */

/* ── 루트 ── */
.arps{
  background:${BLACK_BG};
  color:#fff;
  word-break:keep-all;
  overflow-wrap:break-word;
  overflow:hidden;
}

/* ══════════════════════════════════════════
   Zone A — 대형 엠블럼 + 헤드라인
══════════════════════════════════════════ */
.arps-zone-a{
  position:relative;
  display:flex;
  align-items:center;
  min-height:320px;
  padding:40px 28px 36px;
  overflow:hidden;
}

/* 배경 빛 번짐 */
.arps-zone-a::before{
  content:'';
  position:absolute;
  inset:0;
  background:
    radial-gradient(ellipse 60% 70% at 28% 55%, rgba(201,168,76,.18) 0%, transparent 65%),
    radial-gradient(ellipse 40% 60% at 70% 40%, rgba(201,168,76,.07) 0%, transparent 65%);
  pointer-events:none;
}

/* 왼쪽: 대형 엠블럼 */
.arps-emblem{
  position:relative;
  flex:0 0 auto;
  width:188px;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1;
}

/* 대형 로렐 가지 */
.arps-hl{
  width:52px;
  height:164px;
  color:${GOLD};
  flex-shrink:0;
  position:absolute;
  top:50%;
  transform:translateY(-50%);
}
.arps-hl-l{left:0}
.arps-hl-r{right:0}

/* 대형 "1" 숫자 */
.arps-emblem-numbox{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:130px;
  height:164px;
}
.arps-emblem-num{
  font-family:'Cormorant Garamond','Georgia',serif;
  font-weight:700;
  font-size:clamp(96px,20vw,130px);
  line-height:.88;
  letter-spacing:-.04em;
  /* 3D 골드 그라데이션 */
  background:linear-gradient(170deg,${GOLD_LIGHT} 0%,${GOLD} 38%,#7a5210 62%,${GOLD_MID} 80%,${GOLD_LIGHT} 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  text-shadow:none;
  filter:drop-shadow(0 4px 12px rgba(201,168,76,.5));
  display:block;
}

/* 엠블럼 아래 받침대 */
.arps-emblem-base{
  width:72px;
  height:14px;
  margin-top:4px;
  background:linear-gradient(180deg,${GOLD_MID} 0%,#7a5210 100%);
  border-radius:calc(var(--r-scale,1)*2px) calc(var(--r-scale,1)*2px) 0 0;
  box-shadow:0 -2px 8px rgba(201,168,76,.3);
}
.arps-emblem-base2{
  width:90px;
  height:10px;
  background:linear-gradient(180deg,${GOLD} 0%,#5a3a08 100%);
  border-radius:0 0 calc(var(--r-scale,1)*2px) calc(var(--r-scale,1)*2px);
}

/* 오른쪽: 헤드라인 영역 */
.arps-headline-area{
  flex:1;
  padding-left:20px;
  position:relative;
  z-index:1;
}
.arps-eyebrow{
  display:block;
  font-family:var(--font-body);
  font-size:13px;
  font-weight:700;
  letter-spacing:.08em;
  color:${GOLD};
  margin-bottom:6px;
}
.arps-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,6.5vw,42px);
  line-height:1.16;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:10px;
}
/* 다크 배경 — .em은 골드 override */
.arps-headline .em{color:${GOLD_LIGHT}}
.arps-subcopy{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.65;
  color:rgba(255,255,255,.58);
}
.arps-subcopy .em{color:${GOLD};font-weight:700}

/* ══════════════════════════════════════════
   Zone B — 포디움 메달 배지
══════════════════════════════════════════ */
.arps-zone-b{
  position:relative;
  padding:8px 16px 0;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:0;
  min-height:220px;
  overflow:hidden;
}

/* 배경 골드 글로우 */
.arps-zone-b::before{
  content:'';
  position:absolute;
  inset:0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,168,76,.16) 0%, transparent 70%);
  pointer-events:none;
}

/* 배지 셀 공통 */
.arps-badge-cell{
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  z-index:1;
  flex:1;
}

/* 1위(가운데·돌출): flex 약간 크게, 아래 여백 없이 위로 돌출 */
.arps-badge-cell.rank1{
  flex:1.15;
  margin-bottom:0;
}
.arps-badge-cell.rank2,
.arps-badge-cell.rank3{
  flex:1;
  padding-top:40px; /* 1위보다 낮게 */
}

/* 소형 로렐 */
.arps-ml{
  width:26px;
  height:70px;
  flex-shrink:0;
}
.arps-ml-l,.arps-ml-r{position:absolute;top:14px}
.arps-ml-l{left:2px}
.arps-ml-r{right:2px}

/* 원형 메달 배지 */
.arps-medal{
  position:relative;
  width:130px;
  height:130px;
  border-radius:50%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  padding:14px 10px;
  z-index:2;
}

/* 금색 배지 (1위) */
.arps-medal.gold{
  background:radial-gradient(circle at 48% 38%, #2e2610 0%, ${BLACK_BG} 65%);
  border:2.5px solid ${GOLD_LIGHT};
  box-shadow:
    0 0 0 5px ${BLACK_BG},
    0 0 0 9px ${GOLD},
    0 0 0 11px ${BLACK_BG},
    0 0 36px rgba(201,168,76,.45),
    inset 0 0 24px rgba(0,0,0,.5);
}

/* 은색 배지 (2위) */
.arps-medal.silver{
  background:radial-gradient(circle at 48% 38%, #1e1e24 0%, ${BLACK_BG} 65%);
  border:2px solid ${SILVER_LIGHT};
  box-shadow:
    0 0 0 4px ${BLACK_BG},
    0 0 0 7px ${SILVER},
    0 0 0 9px ${BLACK_BG},
    0 0 24px rgba(184,184,200,.3),
    inset 0 0 20px rgba(0,0,0,.45);
}

/* 동/로즈골드 배지 (3위) */
.arps-medal.bronze{
  background:radial-gradient(circle at 48% 38%, #22160e 0%, ${BLACK_BG} 65%);
  border:2px solid ${BRONZE_LIGHT};
  box-shadow:
    0 0 0 4px ${BLACK_BG},
    0 0 0 7px ${BRONZE},
    0 0 0 9px ${BLACK_BG},
    0 0 24px rgba(196,149,106,.28),
    inset 0 0 20px rgba(0,0,0,.45);
}

/* 메달 내부 텍스트 */
.arps-medal-rank{
  font-family:var(--font-body);
  font-size:10px;
  font-weight:800;
  letter-spacing:.10em;
  line-height:1.2;
  text-transform:uppercase;
}
.gold .arps-medal-rank{color:rgba(245,215,126,.7)}
.silver .arps-medal-rank{color:rgba(226,226,238,.65)}
.bronze .arps-medal-rank{color:rgba(232,184,136,.65)}

.arps-medal-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(17px,3.8vw,22px);
  line-height:1.15;
  letter-spacing:-.01em;
  text-align:center;
  color:#fff;
}
.arps-medal-stat{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,2.8vw,16px);
  line-height:1.2;
  letter-spacing:-.01em;
  text-align:center;
}
.gold .arps-medal-stat{color:${GOLD_LIGHT}}
.silver .arps-medal-stat{color:${SILVER_LIGHT}}
.bronze .arps-medal-stat{color:${BRONZE_LIGHT}}

.arps-medal-unit{
  font-size:9px;
  font-weight:600;
  opacity:.7;
  letter-spacing:.04em;
}

/* 메달 아래 작은 받침대 라인 */
.arps-medal-stem{
  width:4px;
  height:22px;
  margin-top:4px;
}
.gold .arps-medal-stem{background:linear-gradient(180deg,${GOLD_MID} 0%,transparent 100%)}
.silver .arps-medal-stem{background:linear-gradient(180deg,${SILVER} 0%,transparent 100%)}
.bronze .arps-medal-stem{background:linear-gradient(180deg,${BRONZE} 0%,transparent 100%)}

/* ══════════════════════════════════════════
   존 간 구분선
══════════════════════════════════════════ */
.arps-div{
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent);
  margin:0 28px;
}

/* ══════════════════════════════════════════
   Zone C — 2×2 상품 카드 그리드
══════════════════════════════════════════ */
.arps-zone-c{
  padding:28px 20px 20px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}

.arps-grid-card{
  border:1px solid rgba(201,168,76,.45);
  border-radius:calc(var(--r-scale,1)*4px);
  background:${BLACK_CARD};
  padding:16px 18px 14px;
}
.arps-grid-card-desc{
  font-family:var(--font-body);
  font-size:11.5px;
  color:rgba(255,255,255,.44);
  line-height:1.5;
  margin-bottom:6px;
}
.arps-grid-card-row{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:8px;
}
.arps-grid-card-name{
  font-family:var(--font-display);
  font-weight:700;
  font-size:13.5px;
  color:rgba(255,255,255,.88);
  flex-shrink:0;
}
.arps-grid-card-price{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(15px,3.2vw,19px);
  color:${GOLD_LIGHT};
  letter-spacing:-.01em;
  text-align:right;
}

/* ══════════════════════════════════════════
   Zone D — 브랜드 구분선
══════════════════════════════════════════ */
.arps-zone-d{
  padding:20px 20px 0;
  display:flex;
  align-items:center;
  gap:12px;
}
.arps-brand-line{
  flex:1;
  height:1px;
  background:linear-gradient(90deg,transparent,${GOLD});
}
.arps-brand-line.r{
  background:linear-gradient(90deg,${GOLD},transparent);
}
.arps-brand-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,3vw,16px);
  color:#fff;
  white-space:nowrap;
  letter-spacing:-.01em;
}
.arps-brand-text .em{color:${GOLD_LIGHT}}

/* ══════════════════════════════════════════
   하단 3열 대형 가격 카드
══════════════════════════════════════════ */
.arps-zone-e{
  padding:16px 20px 24px;
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:10px;
}

.arps-bottom-card{
  border:1px solid rgba(201,168,76,.38);
  border-radius:calc(var(--r-scale,1)*4px);
  background:${BLACK_CARD};
  padding:16px 12px 14px;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:6px;
}
.arps-bottom-card-name{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(12px,2.5vw,14px);
  color:rgba(255,255,255,.82);
  line-height:1.3;
}
.arps-bottom-card-price{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(17px,3.8vw,24px);
  color:${GOLD_LIGHT};
  letter-spacing:-.02em;
  line-height:1.1;
}
.arps-bottom-card-won{
  font-size:.62em;
  font-weight:700;
  color:rgba(245,215,126,.72);
  vertical-align:baseline;
}

/* ══════════════════════════════════════════
   Footer
══════════════════════════════════════════ */
.arps-footer{
  padding:0 24px 28px;
  text-align:center;
}
.arps-footer-note{
  font-family:var(--font-body);
  font-size:11.5px;
  color:rgba(255,255,255,.38);
  line-height:1.6;
}
`,

  render: (d, { esc, richSafe }) => {
    /* ── Zone A 엠블럼 ── */
    const eyebrowHtml = d.eyebrow
      ? `<span class="arps-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    /* ── Zone B 포디움 ──
     * 원본 이미지 배치: 2위(좌) · 1위(중앙·돌출) · 3위(우)
     * podium array: index 0=1위, 1=2위, 2=3위
     * 렌더 순서: [1]=2위, [0]=1위, [2]=3위
     */
    const rankStyles: Array<{ cls: string; metal: string }> = [
      { cls: 'rank1', metal: 'gold' },
      { cls: 'rank2', metal: 'silver' },
      { cls: 'rank3', metal: 'bronze' },
    ]

    /** 포디움 배지 HTML 생성 */
    const makeBadge = (item: typeof d.podium[0], style: { cls: string; metal: string }) => {
      const color =
        style.metal === 'gold'
          ? GOLD
          : style.metal === 'silver'
            ? SILVER
            : BRONZE
      return `
      <div class="arps-badge-cell ${style.cls}">
        ${MEDAL_LAUREL_L.replace('arps-ml arps-ml-l', `arps-ml arps-ml-l`).replace('currentColor', color)}
        ${MEDAL_LAUREL_R.replace('arps-ml arps-ml-r', `arps-ml arps-ml-r`).replace('currentColor', color)}
        <div class="arps-medal ${style.metal}">
          <div class="arps-medal-rank">${esc(item.rank)}위</div>
          <div class="arps-medal-name">${esc(item.productName)}</div>
          <div class="arps-medal-stat">
            ${esc(item.stat)}${item.statUnit ? `<span class="arps-medal-unit"> ${esc(item.statUnit)}</span>` : ''}
          </div>
        </div>
        <div class="arps-medal-stem ${style.metal}"></div>
      </div>`
    }

    /* 렌더 순서: 2위(좌) · 1위(중) · 3위(우) */
    const podiumHtml = [
      makeBadge(d.podium[1], rankStyles[1]), // 2위(은)
      makeBadge(d.podium[0], rankStyles[0]), // 1위(금) 중앙 돌출
      makeBadge(d.podium[2], rankStyles[2]), // 3위(동)
    ].join('')

    /* ── Zone C 2×2 그리드 ── */
    const gridCardsHtml = d.gridCards
      .map(
        (c) => `
      <div class="arps-grid-card">
        ${c.desc ? `<div class="arps-grid-card-desc">${esc(c.desc)}</div>` : ''}
        <div class="arps-grid-card-row">
          <span class="arps-grid-card-name">${esc(c.name)}</span>
          <span class="arps-grid-card-price">${esc(c.price)}</span>
        </div>
      </div>`,
      )
      .join('')

    /* ── 하단 3열 카드 ── */
    const bottomCardsHtml = d.bottomCards
      .map(
        (c) => `
      <div class="arps-bottom-card">
        <div class="arps-bottom-card-name">${esc(c.name)}</div>
        <div class="arps-bottom-card-price">${esc(c.price)}</div>
      </div>`,
      )
      .join('')

    /* ── Footer ── */
    const footerHtml = d.footerNote
      ? `<div class="arps-footer"><p class="arps-footer-note">${esc(d.footerNote)}</p></div>`
      : ''

    return `
<section class="arps">

  <!-- Zone A: 대형 엠블럼 + 이벤트 헤드라인 -->
  <div class="arps-zone-a">
    <div class="arps-emblem" aria-hidden="true">
      ${HERO_LAUREL_L}
      <div class="arps-emblem-numbox">
        <span class="arps-emblem-num">1</span>
        <div class="arps-emblem-base"></div>
        <div class="arps-emblem-base2"></div>
      </div>
      ${HERO_LAUREL_R}
    </div>
    <div class="arps-headline-area">
      ${eyebrowHtml}
      <h2 class="arps-headline">${richSafe(d.headline)}</h2>
      ${d.subCopy ? `<p class="arps-subcopy">${richSafe(d.subCopy)}</p>` : ''}
    </div>
  </div>

  <!-- Zone B: 3단 포디움 메달 배지 -->
  <div class="arps-zone-b" role="list" aria-label="베스트 상품 순위">
    ${podiumHtml}
  </div>

  <div class="arps-div"></div>

  <!-- Zone C: 2×2 상품 카드 그리드 -->
  <div class="arps-zone-c">
    ${gridCardsHtml}
  </div>

  <!-- Zone D: 브랜드 베스트 구분선 -->
  <div class="arps-zone-d" aria-hidden="true">
    <div class="arps-brand-line"></div>
    <span class="arps-brand-text">${richSafe(d.brandSeparatorText)}</span>
    <div class="arps-brand-line r"></div>
  </div>

  <!-- Zone E: 하단 3열 대형 가격 카드 -->
  <div class="arps-zone-e">
    ${bottomCardsHtml}
  </div>

  <!-- Footer: 이벤트 유의사항 -->
  ${footerHtml}

</section>`
  },
})
