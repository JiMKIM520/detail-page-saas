/** SHIPPING 아키타입: shipping-numeral-schedule
 *  CS 구성_페이지_19 흡수 — 80pt 대형 숫자 2행 타임라인(정상·지연 날짜 대비) +
 *  하단 창고·택배 일러스트 전경 배치. 흰 배경, 라이트 톤. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 상단 안내 제목 (em,br) */
  title: z.string().min(1),
  /** 정상 출고 행: 날짜 숫자 (예: "19") — 브리프에 날짜 명시 시만 */
  normalDate: z.string().optional(),
  /** 정상 출고 행: 날짜 단위/조건 설명 (예: "일(목)까지 주문건") */
  normalLabel: z.string().optional(),
  /** 정상 출고 행: 결과 설명 (예: "정상출고") */
  normalResult: z.string().optional(),
  /** 지연 출고 행: 대형 숫자 A — 사유 시작 (예: "20") — 브리프에 날짜 명시 시만 */
  delayDateA: z.string().optional(),
  /** 지연 출고 행: 대형 숫자 B — 마감 (예: "30") — 브리프에 날짜 명시 시만 */
  delayDateB: z.string().optional(),
  /** 지연 사유 설명 (예: "일(월)까지 창고이전으로") */
  delayReason: z.string().optional(),
  /** 지연 출고 재개 설명 (예: "일(화)부터 순차적으로 출고됩니다.") */
  delayResume: z.string().optional(),
  /** 하단 보충 안내 (em,br) */
  footer: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const shippingNumeralSchedule = defineBlock<Data>({
  id: 'shipping-numeral-schedule',
  archetype: 'shipping',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '출고 일정 타임라인 블록. 80pt 대형 숫자로 정상·지연 날짜를 2행으로 대비 강조, 하단에 창고·택배 인물 일러스트(인라인 SVG/CSS)를 전경 배치. 흰 배경 라이트 톤. 창고 이전·명절 등 출고 지연 안내에 최적.',
  schema,
  css: `
.symo{position:relative;background:var(--bg);padding:60px var(--pad-x,56px) 0;overflow:hidden}
.symo-title{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--ink);letter-spacing:-.01em;line-height:1.4;margin-bottom:36px}
.symo-title .em{color:var(--accent)}

/* 타임라인 래퍼 */
.symo-tl{display:flex;flex-direction:column;gap:0;position:relative;z-index:1}

/* 공통 행 */
.symo-row{display:flex;align-items:center;gap:0;position:relative;padding-bottom:18px}
.symo-row + .symo-row{border-top:2px solid var(--line);padding-top:20px}

/* 대형 숫자 */
.symo-num{font-family:var(--font-display);font-weight:800;font-size:80px;line-height:.9;letter-spacing:-.04em;min-width:96px;flex:0 0 96px}
.symo-row--normal .symo-num{color:var(--ink)}
.symo-row--delay .symo-num{color:var(--accent)}

/* 날짜 B — 지연 행 두 번째 숫자 */
.symo-num-b{font-family:var(--font-display);font-weight:800;font-size:80px;line-height:.9;letter-spacing:-.04em;color:var(--accent);min-width:96px;flex:0 0 96px}

/* 연결 룰 바 — flow에서 제거해 symo-body 위치에 영향 없도록 */
.symo-rule{position:absolute;top:50%;left:100px;width:calc(100% - 192px + 8px);height:3px;background:var(--accent);opacity:.22;border-radius:999px;transform:translateY(-50%);pointer-events:none}
.symo-row--normal .symo-rule{background:var(--ink);opacity:.15}

/* 텍스트 블록 */
.symo-body{display:flex;flex-direction:column;justify-content:center;gap:4px;padding-left:18px;padding-top:0}
.symo-label{font-size:20px;font-weight:600;color:var(--ink-2);line-height:1.45}
.symo-result{font-size:20px;font-weight:700;color:var(--ink);line-height:1.45}
.symo-row--delay .symo-result{color:var(--accent);font-weight:700}

/* 지연 행 듀얼 숫자 래퍼 */
.symo-dual{display:flex;align-items:flex-start;gap:8px}
.symo-tilde{font-family:var(--font-display);font-weight:800;font-size:48px;line-height:1;color:var(--accent);padding-top:18px}

/* 일러스트 전경 */
.symo-scene{position:relative;width:100%;height:220px;margin-top:24px;overflow:hidden}

/* 지면 선 */
.symo-ground{position:absolute;bottom:48px;left:0;right:0;height:2px;background:var(--line);opacity:.35}

/* 창고 건물 (CSS) */
.symo-warehouse{position:absolute;bottom:50px;left:var(--pad-x,56px)}
.symo-wh-body{width:140px;height:90px;background:var(--paper,#F5F0EA);border:2px solid var(--line);border-radius:calc(var(--r-scale,1)*4px) calc(var(--r-scale,1)*4px) 0 0;position:relative}
.symo-wh-roof{position:absolute;top:-28px;left:-6px;width:152px;height:32px;background:var(--ink-2);clip-path:polygon(6px 100%,calc(100% - 6px) 100%,calc(100% - 6px - 20px) 0,calc(6px + 20px) 0);border-radius:calc(var(--r-scale,1)*2px)}
.symo-wh-door{width:42px;height:54px;background:var(--ink);opacity:.12;border-radius:calc(var(--r-scale,1)*2px) calc(var(--r-scale,1)*2px) 0 0;position:absolute;bottom:0;left:50%;transform:translateX(-50%)}
.symo-wh-win{width:24px;height:20px;background:var(--accent);opacity:.35;border-radius:calc(var(--r-scale,1)*2px);position:absolute;top:18px;left:16px}
.symo-wh-win2{width:24px;height:20px;background:var(--accent);opacity:.35;border-radius:calc(var(--r-scale,1)*2px);position:absolute;top:18px;right:16px}
.symo-wh-sign{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:56px;height:14px;background:var(--accent);border-radius:999px;opacity:.7}

/* 박스 스택 (창고 앞) */
.symo-boxes{position:absolute;bottom:50px;left:calc(var(--pad-x,56px) + 150px);display:flex;gap:4px;align-items:flex-end}
.symo-box{border-radius:calc(var(--r-scale,1)*3px);border:1.5px solid var(--line)}
.symo-box--lg{width:38px;height:34px;background:#DFB06A}
.symo-box--md{width:30px;height:28px;background:#CC9545}
.symo-box--sm{width:26px;height:22px;background:#E8C27A}
.symo-box-tape{position:absolute;top:50%;left:0;right:0;height:3px;background:var(--accent);opacity:.5;transform:translateY(-50%)}

/* 배달 인물 — 오른쪽 */
.symo-person{position:absolute;bottom:50px;right:calc(var(--pad-x,56px) + 30px)}
.symo-person svg{display:block}

/* 트럭 — 중간 */
.symo-truck{position:absolute;bottom:50px;right:calc(var(--pad-x,56px) + 180px)}
.symo-truck svg{display:block}

/* 꾸밈 점선 화살표 */
.symo-arrow{position:absolute;bottom:56px;right:calc(var(--pad-x,56px) + 290px);font-size:0}
.symo-arrow svg{display:block;opacity:.28}

/* 푸터 */
.symo-footer{background:color-mix(in srgb,var(--accent) 6%,transparent);margin:0 calc(-1 * var(--pad-x,56px));padding:18px var(--pad-x,56px) 28px;margin-top:24px;font-size:15px;color:var(--ink-2);line-height:1.6}
.symo-footer .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const normalDate   = d.normalDate   ?? '19'
    const normalLabel  = d.normalLabel  ?? '일(목)까지 주문건'
    const normalResult = d.normalResult ?? '정상출고'
    const delayDateA   = d.delayDateA   ?? '20'
    const delayDateB   = d.delayDateB   ?? '30'
    const delayReason  = d.delayReason  ?? '일(월)까지 창고이전으로'
    const delayResume  = d.delayResume  ?? '일(화)부터 순차적으로 출고됩니다.'

    return `
<section class="symo">
  <h2 class="symo-title">${richSafe(d.title)}</h2>

  <div class="symo-tl">
    <!-- 정상 출고 행 -->
    <div class="symo-row symo-row--normal">
      <span class="symo-num">${esc(normalDate)}</span>
      <span class="symo-rule"></span>
      <div class="symo-body">
        <span class="symo-label">${esc(normalLabel)}</span>
        <span class="symo-result">${esc(normalResult)}</span>
      </div>
    </div>

    <!-- 지연 출고 행 -->
    <div class="symo-row symo-row--delay">
      <div class="symo-dual">
        <span class="symo-num">${esc(delayDateA)}</span>
        <span class="symo-tilde">~</span>
        <span class="symo-num-b">${esc(delayDateB)}</span>
      </div>
      <span class="symo-rule"></span>
      <div class="symo-body">
        <span class="symo-label">${esc(delayReason)}</span>
        <span class="symo-result">${esc(delayResume)}</span>
      </div>
    </div>
  </div>

  <!-- 일러스트 전경 -->
  <div class="symo-scene">
    <div class="symo-ground"></div>

    <!-- 창고 -->
    <div class="symo-warehouse">
      <div class="symo-wh-body">
        <div class="symo-wh-roof"></div>
        <div class="symo-wh-win"></div>
        <div class="symo-wh-win2"></div>
        <div class="symo-wh-sign"></div>
        <div class="symo-wh-door"></div>
      </div>
    </div>

    <!-- 박스 스택 -->
    <div class="symo-boxes">
      <div class="symo-box symo-box--lg" style="position:relative">
        <div class="symo-box-tape"></div>
      </div>
      <div class="symo-box symo-box--sm" style="position:relative">
        <div class="symo-box-tape"></div>
      </div>
      <div class="symo-box symo-box--md" style="position:relative">
        <div class="symo-box-tape"></div>
      </div>
    </div>

    <!-- 점선 화살표 -->
    <div class="symo-arrow">
      <svg width="80" height="16" viewBox="0 0 80 16" fill="none">
        <path d="M2 8 Q40 2 70 8" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
        <path d="M70 8l-6-4M70 8l-6 4" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- 택배 트럭 -->
    <div class="symo-truck">
      <svg width="100" height="62" viewBox="0 0 100 62" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 트럭 몸체 -->
        <rect x="2" y="14" width="62" height="34" rx="3" fill="#606E7A"/>
        <rect x="4" y="16" width="58" height="30" rx="2" fill="#464B51"/>
        <!-- 트럭 적재함 도어 선 -->
        <line x1="33" y1="16" x2="33" y2="46" stroke="#606E7A" stroke-width="1.5"/>
        <!-- 캡 -->
        <rect x="64" y="22" width="32" height="26" rx="3" fill="#464B51"/>
        <rect x="66" y="24" width="26" height="14" rx="2" fill="#7A9EB5" opacity=".7"/>
        <!-- 바퀴 -->
        <circle cx="18" cy="50" r="8" fill="#1D1D1B"/>
        <circle cx="18" cy="50" r="4" fill="#606E7A"/>
        <circle cx="52" cy="50" r="8" fill="#1D1D1B"/>
        <circle cx="52" cy="50" r="4" fill="#606E7A"/>
        <circle cx="82" cy="50" r="8" fill="#1D1D1B"/>
        <circle cx="82" cy="50" r="4" fill="#606E7A"/>
        <!-- 브랜드 스트라이프 -->
        <rect x="4" y="28" width="58" height="5" fill="var(--accent)" opacity=".55"/>
      </svg>
    </div>

    <!-- 배달 인물 (배달부 + 박스) -->
    <div class="symo-person">
      <svg width="56" height="100" viewBox="0 0 56 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 머리 -->
        <ellipse cx="28" cy="13" rx="10" ry="11" fill="#FFCEA1"/>
        <!-- 모자 -->
        <rect x="17" y="5" width="22" height="6" rx="3" fill="#186FD9"/>
        <rect x="14" y="9" width="28" height="4" rx="2" fill="#186FD9"/>
        <!-- 몸통 -->
        <rect x="16" y="24" width="24" height="30" rx="4" fill="#186FD9"/>
        <!-- 팔 왼 -->
        <rect x="6" y="24" width="10" height="22" rx="4" fill="#186FD9"/>
        <ellipse cx="11" cy="47" rx="5" ry="6" fill="#FFCEA1"/>
        <!-- 팔 오 -->
        <rect x="40" y="24" width="10" height="22" rx="4" fill="#186FD9"/>
        <ellipse cx="45" cy="47" rx="5" ry="6" fill="#FFCEA1"/>
        <!-- 다리 왼 -->
        <rect x="18" y="54" width="10" height="28" rx="4" fill="#1D1D1B"/>
        <!-- 다리 오 -->
        <rect x="28" y="54" width="10" height="28" rx="4" fill="#1D1D1B"/>
        <!-- 신발 왼 -->
        <ellipse cx="23" cy="83" rx="8" ry="5" fill="#432918"/>
        <!-- 신발 오 -->
        <ellipse cx="33" cy="83" rx="8" ry="5" fill="#432918"/>
        <!-- 들고 있는 박스 -->
        <rect x="7" y="36" width="40" height="30" rx="3" fill="#DFB06A" stroke="#CC9545" stroke-width="1.2"/>
        <line x1="7" y1="51" x2="47" y2="51" stroke="#CC9545" stroke-width="1.5"/>
        <line x1="27" y1="36" x2="27" y2="66" stroke="#CC9545" stroke-width="1.5"/>
        <!-- 테이프 -->
        <rect x="7" y="49" width="40" height="4" fill="var(--accent)" opacity=".5"/>
        <!-- 배지 -->
        <circle cx="28" cy="30" r="5" fill="var(--accent)" opacity=".7"/>
      </svg>
    </div>
  </div>

  ${d.footer ? `<div class="symo-footer">${richSafe(d.footer)}</div>` : ''}
</section>`
  },
})
