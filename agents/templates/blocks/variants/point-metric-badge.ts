/** POINT 아키타입: point-metric-badge.
 *  피그마 021_모바일_전환_15 흡수 — 흰 라운드 카드(타이틀+서브) + 원형 이미지 + 수치 원형 뱃지(이중 라인) 오버랩.
 *  데스크톱 872px 기준: 카드(좌)·원형 사진(우) 겹침 레이아웃. 수치 뱃지는 카드-사진 경계에 오버랩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  chip: z.string().optional(),          // 상단 라운드 태그 칩 (순수 텍스트)
  title: z.string().min(1),             // 대제목 (em,br 허용)
  desc: z.string().optional(),          // 소개 한 줄 (순수 텍스트)
  image: z.string().optional(),         // 원형 사진 (url)
  // 수치 뱃지 — 브리프에 근거(수치·인증·실험값)가 있을 때만 사용
  badgeValue: z.string().optional(),    // 수치 메인 (예: "11.5") — 브리프에 근거 있을 때만
  badgeUnit: z.string().optional(),     // 수치 단위/라벨 (예: "Brix", "mg") — badgeValue와 함께 사용
})
type Data = z.infer<typeof schema>

export const pointMetricBadge = defineBlock<Data>({
  id: 'point-metric-badge',
  archetype: 'point',
  styleTags: ['light', 'food', 'premium', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '흰 반투명 라운드 카드(타이틀+서브)가 원형 사진과 좌우 오버랩. 원형 이중-라인 뱃지가 카드-사진 경계에 겹쳐 수치를 강조. 수치 슬롯은 브리프에 근거(당도·성분·수율 등)가 있을 때만 채움.',
  schema,
  css: `
.pbxb{position:relative;padding:64px var(--pad-x,56px);background:var(--bg);overflow:hidden}
.pbxb-inner{position:relative;display:flex;align-items:center;gap:0;min-height:380px}

/* ── 원형 사진 영역 (우측) ── */
.pbxb-photo-wrap{position:absolute;right:0;top:50%;transform:translateY(-50%);width:400px;height:400px;flex:none}
.pbxb-photo{width:400px;height:400px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,transparent)}
.pbxb-photo img,.pbxb-photo .ph{width:100%;height:100%;object-fit:cover;border-radius:50%}

/* ── 카드 (좌측, z-index>사진) ── */
.pbxb-card{position:relative;z-index:2;width:62%;background:color-mix(in srgb,var(--paper) 92%,transparent);border-radius:calc(var(--r-scale,1)*22px);padding:40px 44px 40px 0;box-shadow:0 24px 56px -28px rgba(0,0,0,.18)}

/* 칩 */
.pbxb-chip{display:inline-block;background:var(--brand);color:var(--paper);border-radius:999px;padding:7px 22px;font-size:15px;font-weight:700;letter-spacing:.05em;margin-bottom:18px}

/* 제목 */
.pbxb-title{font-family:var(--font-display);font-weight:800;font-size:52px;line-height:1.12;color:var(--ink);letter-spacing:-.02em}
.pbxb-title .em{color:var(--accent-d)}

/* 설명 */
.pbxb-desc{margin-top:16px;font-size:17px;font-weight:500;color:var(--ink-2);line-height:1.65}

/* ── 수치 뱃지 (카드-사진 경계 오버랩) ── */
.pbxb-badge{position:absolute;z-index:3;right:calc(38% - 74px);top:50%;transform:translateY(-50%);width:148px;height:148px;pointer-events:none}
.pbxb-badge-bg{width:148px;height:148px;border-radius:50%;background:var(--accent)}
.pbxb-badge-ring{position:absolute;inset:8px;border-radius:50%;border:2.2px solid color-mix(in srgb,var(--paper) 55%,transparent)}
.pbxb-badge-body{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
.pbxb-badge-value{font-family:var(--font-display);font-weight:800;font-size:38px;line-height:1;color:var(--paper);letter-spacing:-.02em}
.pbxb-badge-unit{font-family:var(--font-display);font-weight:700;font-size:15px;line-height:1.3;color:color-mix(in srgb,var(--paper) 85%,transparent);letter-spacing:.05em;margin-top:3px}

/* ── noimg-safe 강등: 사진 없으면 카드 전폭 ── */
.pbxb.noimg .pbxb-photo-wrap{display:none}
.pbxb.noimg .pbxb-card{width:100%;padding:40px 44px}
.pbxb.noimg .pbxb-badge{right:32px;top:auto;bottom:32px;transform:none}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const hasBadge = d.badgeValue && d.badgeValue.trim().length > 0

    return `
<section class="pbxb${hasImg ? '' : ' noimg'}">
  <div class="pbxb-inner">
    ${hasImg ? `
    <div class="pbxb-photo-wrap">
      <div class="pbxb-photo">${media(d.image, '', '제품 사진')}</div>
    </div>` : ''}

    <div class="pbxb-card">
      ${d.chip ? `<span class="pbxb-chip">${esc(d.chip)}</span>` : ''}
      <h2 class="pbxb-title">${richSafe(d.title)}</h2>
      ${d.desc ? `<p class="pbxb-desc">${esc(d.desc)}</p>` : ''}
    </div>

    ${hasBadge ? `
    <div class="pbxb-badge" aria-label="${esc(d.badgeValue)}${d.badgeUnit ? ' ' + esc(d.badgeUnit) : ''}">
      <div class="pbxb-badge-bg"></div>
      <div class="pbxb-badge-ring"></div>
      <div class="pbxb-badge-body">
        <span class="pbxb-badge-value">${esc(d.badgeValue)}</span>
        ${d.badgeUnit ? `<span class="pbxb-badge-unit">${esc(d.badgeUnit)}</span>` : ''}
      </div>
    </div>` : ''}
  </div>
</section>`
  },
})
