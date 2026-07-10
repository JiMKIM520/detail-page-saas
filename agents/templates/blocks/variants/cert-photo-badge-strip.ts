/** CERT 아키타입: cert-photo-badge-strip
 *  배경 사진 전면 위 pill 레이블 + 대형 타이틀 + 설명 오버레이,
 *  하단 80% 불투명 검정 라운드 박스 3열 인증 배지 행.
 *  와디즈 200섹션 294_제품특징_29 구조 흡수 재작성.
 *  noimg-safe: 사진 없을 때 다크 그라데이션 배경으로 강등(레이아웃 붕괴 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const ICON_NAMES = [
  'wheat','drop','clock','badge','snow','check','fryer','oven','star',
  'heart','gift','truck','shield','leaf','trophy','thumb','fire',
  'person','search','pin','box','calendar','card','won','bulb','gear',
  'camera','phone','bolt','thermometer','target','store','doc','sprout','bell',
] as const

const badgeSchema = z.object({
  icon:  z.enum(ICON_NAMES).optional(),
  label: z.string().min(1),           // 배지 텍스트 (예: KC인증, 과충전보호)
})

const schema = z.object({
  pill:   z.string().optional(),       // pill 레이블 (상단 라운드 박스 텍스트)
  title:  z.string().min(1),           // 대형 헤드라인 (em,br 허용)
  desc:   z.string().optional(),       // 부연 설명 (순수 텍스트)
  image:  z.string().optional(),       // 배경 사진 url
  badges: z.array(badgeSchema).min(2).max(4),  // 하단 인증 배지 2~4개
})
type Data = z.infer<typeof schema>

export const certPhotoBadgeStrip = defineBlock<Data>({
  id: 'cert-photo-badge-strip',
  archetype: 'cert',
  styleTags: ['dark', 'photo', 'premium', 'safety', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '배경 사진 전면 위 pill 레이블+대형 타이틀+설명 텍스트 오버레이, 하단 80% 불투명 검정 라운드 박스 2~4열 인증 배지 행. 전자제품·안전인증·프리미엄 제품에 적합. 사진 없을 시 다크 그라데이션으로 강등.',
  schema,
  css: `
/* ── cert-photo-badge-strip (cnmm) ── */
.cnmm{position:relative;overflow:hidden;min-height:480px;display:flex;flex-direction:column;justify-content:space-between;background:var(--brand,#111)}
/* 배경 사진 */
.cnmm-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0}
.cnmm-bg.ph{display:none!important}
/* 사진 없을 때 강등: 다크 그라데이션 */
.cnmm.noimg .cnmm-scrim{background:linear-gradient(160deg,color-mix(in srgb,var(--brand) 90%,#000) 0%,color-mix(in srgb,var(--accent-d) 60%,#000) 100%)}
/* 전체 스크림 (사진 위 가독성) */
.cnmm-scrim{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.32) 0%,rgba(0,0,0,.18) 40%,rgba(0,0,0,.55) 100%);z-index:1}
/* 콘텐츠 레이어 */
.cnmm-body{position:relative;z-index:2;padding:52px var(--pad-x,56px) 0;text-align:center}
/* pill 레이블 */
.cnmm-pill{display:inline-block;background:#000;color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:500;font-size:18px;padding:10px 28px;border-radius:999px;margin-bottom:24px;letter-spacing:.01em}
/* 구분선 */
.cnmm-rule{width:min(360px,60%);height:1px;background:rgba(217,217,217,.45);margin:0 auto 22px}
/* 헤드라인 */
.cnmm-title{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:clamp(38px,5.5vw,62px);color:#fff;line-height:1.18;letter-spacing:-.02em}
.cnmm .em{color:var(--em-dark,#FFF7EA)}
/* 설명 */
.cnmm-desc{margin:20px auto 0;max-width:600px;font-size:18px;font-weight:400;line-height:1.75;color:rgba(255,255,255,.88)}
/* 하단 배지 행 */
.cnmm-badges{position:relative;z-index:2;display:flex;justify-content:center;gap:20px;padding:40px var(--pad-x,56px) 48px}
.cnmm-badge{flex:1 1 0;max-width:220px;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(0,0,0,.80);border-radius:calc(var(--r-scale,1)*22px);padding:26px 16px 24px}
/* 배지 아이콘 */
.cnmm-icon{width:52px;height:52px;color:#fff;flex-shrink:0}
.cnmm-icon svg{width:100%;height:100%}
/* 배지 텍스트 */
.cnmm-badge-label{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:500;font-size:17px;color:#fff;text-align:center;line-height:1.35;word-break:keep-all}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="cnmm${hasImg ? '' : ' noimg'}">
  ${media(d.image, 'cnmm-bg', '인증 제품 배경')}
  <div class="cnmm-scrim"></div>
  <div class="cnmm-body">
    ${d.pill ? `<div class="cnmm-pill">${esc(d.pill)}</div>` : ''}
    ${d.pill ? `<div class="cnmm-rule"></div>` : ''}
    <h2 class="cnmm-title disp">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="cnmm-desc">${esc(d.desc)}</p>` : ''}
  </div>
  <div class="cnmm-badges">
    ${d.badges.map(b => `
    <div class="cnmm-badge">
      ${b.icon ? `<span class="cnmm-icon">${icon(b.icon)}</span>` : ''}
      <span class="cnmm-badge-label">${esc(b.label)}</span>
    </div>`).join('')}
  </div>
</section>`
  },
})
