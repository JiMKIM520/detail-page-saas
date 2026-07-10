/** REVIEW 아키타입: review-fillbar-before-after
 *  101_후기_02 패턴 흡수.
 *  상단 화이트 영역: 섹션 제목 + 4행 수평 채움 바 그래프(만족 문장 + 퍼센트).
 *  하단 그린 틴트 영역: 감성 헤드라인 + 비포/애프터 이미지+라벨+설명 카드 2열.
 *  데이터→감성 전환 구조. 이미지 없이도 noimg-safe 강등 렌더. 톤: light. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const barSchema = z.object({
  text: z.string().min(1),                   // 만족 문장 (바 안 흰 텍스트)
  pct: z.number().int().min(1).max(100),     // 채움 퍼센트 (1~100)
})

const schema = z.object({
  // ── 상단 그래프 영역
  sectionLabel: z.string().min(1).optional(),  // 섹션 상단 라벨 (예: "체험단 후기")
  subtitle: z.string().min(1).optional(),      // 라벨 아래 부제 (예: "300명 4주 복용 후 실제 후기")
  bars: z.array(barSchema).min(2).max(6),      // 만족도 항목 (최소 2, 최대 6행)

  // ── 하단 비포/애프터 영역
  transitionHead: z.string().min(1),           // 전환 헤드라인 (em,br) — 그린 배경 대형 문구
  transitionSub: z.string().min(1).optional(), // 헤드라인 아래 보조 문구 (예: "4주 복용 후")

  beforeImage: z.string().optional(),          // 비포 이미지 url
  beforeLabel: z.string().min(1).optional(),   // 비포 라벨 (기본: "복용 전")
  beforeDesc: z.string().min(1).optional(),    // 비포 설명

  afterImage: z.string().optional(),           // 애프터 이미지 url
  afterLabel: z.string().min(1).optional(),    // 애프터 라벨 (기본: "복용 후")
  afterDesc: z.string().min(1),               // 애프터 설명 (em,br)
})
type Data = z.infer<typeof schema>

export const reviewFillbarBeforeAfter = defineBlock<Data>({
  id: 'review-fillbar-before-after',
  archetype: 'review',
  // noimg-safe: 이미지 전무 시 카드 이미지 프레임을 숨기고 라벨+설명만 렌더
  styleTags: ['light', 'health', 'before-after', 'graph', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '체험단 만족도 채움 바 그래프(4행) + 그린 배경 비포/애프터 카드 2열 구조. '
    + '수평 pill형 바에 만족 문장을 흰 텍스트로 인쇄하고 퍼센트 수치를 바 오른쪽에 강조. '
    + '하단 그린 틴트 구역에서 데이터 설득을 감성 비포/애프터 비교로 전환. '
    + '건강식품·뷰티·보충제 리뷰 섹션에 적합. 이미지 부재 시 텍스트 카드로 강등.',
  schema,
  css: `
/* ── 전체 래퍼 ── */
.rawh{background:var(--bg);color:var(--ink);font-family:var(--font-body),'Pretendard',sans-serif}

/* ── 상단 그래프 영역 ── */
.rawh-top{padding:60px var(--pad-x,56px) 56px;background:var(--bg)}
.rawh-section-label{font-family:var(--font-display);font-weight:800;font-size:52px;text-align:center;letter-spacing:-.02em;line-height:1.1;color:var(--ink);margin-bottom:14px}
.rawh-subtitle{font-size:18px;font-weight:400;text-align:center;color:var(--ink-2);margin-bottom:44px;line-height:1.5}

/* 바 목록 */
.rawh-bars{display:flex;flex-direction:column;gap:16px}
/* overflow:visible — 퍼센트 라벨이 행 오른쪽 바깥에 렌더됨. 채움 fill은 border-radius로 모양 유지 */
.rawh-bar-row{position:relative;height:62px;background:color-mix(in srgb,var(--accent) 12%,transparent);border-radius:999px;overflow:visible;margin-right:80px}
/* 채움 부분 — width는 인라인 style로 주입 */
.rawh-bar-fill{position:absolute;inset:0 auto 0 0;background:var(--accent);border-radius:999px;overflow:hidden;display:flex;align-items:center;padding-left:22px}
.rawh-bar-text{font-size:18px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 8px)}
/* 퍼센트 수치 — 바 행 오른쪽 끝, overflow:hidden 바깥에 렌더되도록 row는 overflow:visible로 변경 */
.rawh-bar-pct{position:absolute;right:-72px;top:50%;transform:translateY(-50%);display:flex;align-items:baseline;gap:2px;width:68px;justify-content:flex-end}
.rawh-bar-pct-num{font-size:28px;font-weight:700;color:var(--accent);line-height:1}
.rawh-bar-pct-unit{font-size:22px;font-weight:500;color:var(--accent);line-height:1}

/* ── 하단 비포/애프터 영역 ── */
.rawh-bot{background:color-mix(in srgb,var(--accent) 14%,#fff);padding:64px var(--pad-x,56px) 72px}
.rawh-trans-head{font-family:var(--font-display);font-weight:800;font-size:46px;text-align:center;color:var(--accent);letter-spacing:-.02em;line-height:1.2;margin-bottom:10px}
.rawh-trans-head .em{color:var(--accent-d)}
.rawh-trans-sub{font-size:22px;font-weight:600;text-align:center;color:var(--ink);margin-bottom:48px}

/* 카드 2열 */
.rawh-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.rawh-card{display:flex;flex-direction:column}

/* 이미지 프레임 */
.rawh-img{width:100%;aspect-ratio:7/8;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}
/* noimg-safe: 이미지 없을 때 프레임 자체를 숨긴다 (.ph는 shared.ts에서 display:none!important) */
.rawh-img.ph{display:none!important}

/* 라벨 바 */
.rawh-card-label{margin-top:0;padding:14px 16px;text-align:center;font-size:18px;font-weight:600;border-radius:calc(var(--r-scale,1)*6px)}
.rawh-card--before .rawh-card-label{background:var(--muted);color:var(--ink-2)}
.rawh-card--after  .rawh-card-label{background:var(--accent);color:#fff;font-weight:800}

/* 설명 */
.rawh-card-desc{margin-top:14px;font-size:15px;font-weight:500;color:var(--ink-2);line-height:1.7;text-align:center;padding:0 6px}
.rawh-card--after .rawh-card-desc{color:var(--ink)}
.rawh-card--after .rawh-card-desc .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 유무 판별 — 하나라도 있으면 이미지 프레임 렌더 (없으면 ph로 자동 숨김)
    const hasAnyImg =
      (typeof d.beforeImage === 'string' && d.beforeImage.length > 0) ||
      (typeof d.afterImage  === 'string' && d.afterImage.length  > 0)

    return `
<section class="rawh">

  <!-- 상단: 그래프 영역 -->
  <div class="rawh-top">
    ${d.sectionLabel ? `<h2 class="rawh-section-label">${esc(d.sectionLabel)}</h2>` : ''}
    ${d.subtitle ? `<p class="rawh-subtitle">${esc(d.subtitle)}</p>` : ''}
    <div class="rawh-bars" role="list">
      ${d.bars.map((b) => {
        const fillPct = Math.min(100, Math.max(1, b.pct))
        return `
      <div class="rawh-bar-row" role="listitem" aria-label="${esc(b.text)} ${esc(String(b.pct))}%">
        <div class="rawh-bar-fill" style="width:${fillPct}%">
          <span class="rawh-bar-text">${esc(b.text)}</span>
        </div>
        <div class="rawh-bar-pct" aria-hidden="true">
          <span class="rawh-bar-pct-num">${esc(String(b.pct))}</span><span class="rawh-bar-pct-unit">%</span>
        </div>
      </div>`
      }).join('')}
    </div>
  </div>

  <!-- 하단: 비포/애프터 영역 -->
  <div class="rawh-bot">
    <p class="rawh-trans-head">${richSafe(d.transitionHead)}</p>
    ${d.transitionSub ? `<p class="rawh-trans-sub">${esc(d.transitionSub)}</p>` : ''}
    <div class="rawh-cards">

      <!-- 비포 카드 -->
      <div class="rawh-card rawh-card--before">
        ${hasAnyImg ? media(d.beforeImage, 'rawh-img', '복용 전') : ''}
        <div class="rawh-card-label">${esc(d.beforeLabel ?? '복용 전')}</div>
        ${d.beforeDesc ? `<p class="rawh-card-desc">${esc(d.beforeDesc)}</p>` : ''}
      </div>

      <!-- 애프터 카드 -->
      <div class="rawh-card rawh-card--after">
        ${hasAnyImg ? media(d.afterImage, 'rawh-img', '복용 후') : ''}
        <div class="rawh-card-label">${esc(d.afterLabel ?? '복용 후')}</div>
        <p class="rawh-card-desc">${richSafe(d.afterDesc)}</p>
      </div>

    </div>
  </div>

</section>`
  },
})
