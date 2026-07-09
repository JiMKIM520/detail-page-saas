/** SPEC 아키타입: spec-battery-progress
 *  원본: 285_제품소개_31.json (제품소개/31)
 *  구조: 상단 블루 뱃지 + 대형 볼드 제목 + 설명 + 제품 사진,
 *        배터리 잔량 시각 오버레이, 하단 2개 스펙 항목(레이블+부제+대형 파란 숫자+진행률 바).
 *  핵심 장치: 사용 시간 스펙을 블루 프로그레스 바 + 대형 숫자 쌍으로 시각화하는 배터리 지속시간 비교 섹션.
 *  noimg-safe: 제품 이미지 없을 때 배터리 오버레이 포함 사진 영역을 blue-tint 플레이스홀더로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const specRowSchema = z.object({
  label: z.string().min(1),      // 스펙 항목 레이블 (예: "1단 기준")
  sub: z.string().min(1),        // 부제/설명 (예: "48시간 이상 사용가능")
  value: z.string().min(1),      // 대형 숫자+단위 (예: "48시간 이상")
  fillPct: z.number().min(0).max(100), // 프로그레스 바 채움 비율 0~100
})

const schema = z.object({
  badge: z.string().optional(),        // 상단 뱃지 텍스트 (예: "SPEC 01")
  title: z.string().min(1),            // 대형 볼드 제목 (em,br)
  desc: z.string().optional(),         // 제목 아래 설명 (em,br)
  image: z.string().optional(),        // 제품 사진 url
  batteryCaption: z.string().optional(), // 배터리 오버레이 캡션 (예: "12,000mAh × 3")
  rows: z.array(specRowSchema).min(1).max(4), // 스펙 비교 행 (1~4)
})
type Data = z.infer<typeof schema>

export const specBatteryProgress = defineBlock<Data>({
  id: 'spec-battery-progress',
  archetype: 'spec',
  styleTags: ['light', 'tech', 'infographic', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '배터리/지속시간 스펙 비교 블록. 라이트 배경 + 블루 뱃지 알약 + 대형 볼드 제목 + 제품 사진(배터리 잔량 스택 오버레이) + 하단 N행 스펙(레이블·부제·우측 파란 대형 숫자·블루 프로그레스 바). 전자제품·가전·배터리 지속시간 강조에 최적. 브리프 근거: 항목별 fillPct는 성능 비율 데이터가 있을 때만.',
  schema,
  css: `
.sbp{background:var(--bg);color:var(--ink);padding:60px var(--pad-x,56px) 64px}

/* ── 상단 헤더 영역 ── */
.sbp-badge{display:inline-flex;align-items:center;justify-content:center;
  padding:6px 22px;border-radius:calc(var(--r-scale,1)*999px);
  background:var(--accent);color:#fff;
  font-family:var(--font-display);font-weight:600;font-size:18px;letter-spacing:.04em;
  margin-bottom:18px}
.sbp-title{font-family:var(--font-display);font-weight:800;font-size:52px;
  line-height:1.15;color:var(--ink);letter-spacing:-.02em}
.sbp-title .em{color:var(--accent)}
.sbp-desc{margin-top:16px;font-size:20px;font-weight:500;line-height:1.6;color:var(--ink-2)}
.sbp-desc .em{color:var(--accent);font-weight:700}

/* ── 사진 + 배터리 오버레이 ── */
.sbp-photo-wrap{position:relative;margin-top:32px;border-radius:calc(var(--r-scale,1)*16px);overflow:hidden;
  width:100%;aspect-ratio:740/500}
.sbp-photo-wrap img,.sbp-photo-wrap .ph{
  width:100%;height:100%;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px))}
/* 이미지 없을 때 파란 틴트 플레이스홀더 */
.sbp-photo-wrap .ph{background:color-mix(in srgb,var(--accent) 12%,var(--bg));display:block}
/* 배터리 오버레이 스택 — 우하단 */
.sbp-batt-stack{position:absolute;right:24px;bottom:24px;display:flex;flex-direction:column;gap:6px;
  pointer-events:none}
.sbp-batt-cell{height:28px;border-radius:calc(var(--r-scale,1)*7px);
  background:var(--accent);opacity:.88;
  box-shadow:0 2px 8px rgba(0,0,0,.18)}
.sbp-batt-cell:nth-child(1){width:88px}
.sbp-batt-cell:nth-child(2){width:68px;opacity:.65}
.sbp-batt-cell:nth-child(3){width:50px;opacity:.42}
.sbp-batt-caption{position:absolute;right:28px;bottom:80px;
  font-family:var(--font-display);font-weight:700;font-size:13px;
  color:#fff;letter-spacing:.06em;text-shadow:0 1px 4px rgba(0,0,0,.35)}

/* ── 하단 스펙 비교 행 ── */
.sbp-rows{margin-top:36px;display:flex;flex-direction:column;gap:28px}
.sbp-row{}
.sbp-row-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:10px}
.sbp-row-left{display:flex;flex-direction:column;gap:4px}
.sbp-row-label{font-size:22px;font-weight:700;color:var(--ink);line-height:1.2}
.sbp-row-sub{font-size:15px;font-weight:400;color:var(--muted);line-height:1.3}
.sbp-row-value{font-family:var(--font-display);font-weight:800;font-size:38px;
  color:var(--accent);line-height:1;white-space:nowrap;flex-shrink:0}
/* 프로그레스 바 트랙 */
.sbp-bar-track{width:100%;height:14px;border-radius:calc(var(--r-scale,1)*999px);
  background:color-mix(in srgb,var(--accent) 15%,transparent);overflow:hidden}
/* 프로그레스 바 채움 — width는 인라인 style로 주입 */
.sbp-bar-fill{height:100%;border-radius:calc(var(--r-scale,1)*999px);
  background:var(--accent);transition:width .4s ease}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0

    const rows = d.rows.map((r) => {
      const pct = Math.max(0, Math.min(100, r.fillPct))
      return `
  <div class="sbp-row">
    <div class="sbp-row-head">
      <div class="sbp-row-left">
        <span class="sbp-row-label">${esc(r.label)}</span>
        <span class="sbp-row-sub">${esc(r.sub)}</span>
      </div>
      <span class="sbp-row-value">${esc(r.value)}</span>
    </div>
    <div class="sbp-bar-track">
      <div class="sbp-bar-fill" style="width:${pct}%"></div>
    </div>
  </div>`
    }).join('')

    return `
<section class="sbp">
  ${d.badge ? `<div class="sbp-badge">${esc(d.badge)}</div>` : ''}
  <h2 class="sbp-title">${richSafe(d.title)}</h2>
  ${d.desc ? `<p class="sbp-desc">${richSafe(d.desc)}</p>` : ''}

  <div class="sbp-photo-wrap">
    ${media(d.image, '', '제품 사진')}
    <div class="sbp-batt-stack" aria-hidden="true">
      <div class="sbp-batt-cell"></div>
      <div class="sbp-batt-cell"></div>
      <div class="sbp-batt-cell"></div>
    </div>
    ${d.batteryCaption && hasImg ? `<span class="sbp-batt-caption">${esc(d.batteryCaption)}</span>` : ''}
  </div>

  <div class="sbp-rows">
    ${rows}
  </div>
</section>`
  },
})
