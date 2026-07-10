/** INGREDIENT 아키타입: ingredient-badge-arc
 *  원본: 143_성분소개_03 (피그마 성분소개 시리즈)
 *  구조: 상단 라운드 칩 레이블 + 대형 타이틀 + 부제
 *        → 그린 아웃라인 원형 무첨가 인증 뱃지 5개 (3+2 아크 배열)
 *        → 라운드 코너 제품 이미지
 *  핵심 장치: 그린 아웃라인 원(200px) 5개를 2열 집중 배열하고 각 원 내부에
 *             인증 카테고리 + "무첨가" 2줄 텍스트를 SemiBold로 배치.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const badgeSchema = z.object({
  label: z.string().min(1), // 예: "착색료" — 뱃지 첫째 줄
})

const schema = z.object({
  chip: z.string().optional(),   // 상단 칩 레이블 (예: "5가지 무첨가")
  title: z.string().min(1),      // (em,br) 대형 타이틀
  subtitle: z.string().optional(), // 부제 텍스트
  badges: z
    .array(badgeSchema)
    .min(1)
    .max(6),                      // 무첨가 인증 뱃지 목록
  badgeSuffix: z.string().optional(), // 각 뱃지에 공통으로 붙는 접미 (기본 "무첨가")
  image: z.string().optional(),  // 하단 제품 이미지 (url)
  imageAlt: z.string().optional(), // 이미지 대체 텍스트
})
type Data = z.infer<typeof schema>

export const ingredientBadgeArc = defineBlock<Data>({
  id: 'ingredient-badge-arc',
  archetype: 'ingredient',
  styleTags: ['light', 'food', 'clean', 'trust', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분 무첨가 인증 뱃지 블록. 라운드 칩 레이블 + 대형 타이틀 + 부제 → 그린 아웃라인 원형 뱃지 N개(3+2 아크 배열) → 라운드 코너 제품 이미지. 라이트 배경, 식품/뷰티 신뢰 강조.',
  schema,
  css: `
/* ── ingredient-badge-arc (ihnh) ── */
.ihnh{background:var(--bg);color:var(--ink);padding:60px var(--pad-x,56px) 56px;text-align:center}

/* 상단 칩 */
.ihnh-chip{display:inline-block;padding:10px 28px;border-radius:999px;background:var(--accent);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:17px;line-height:1.3;letter-spacing:.02em;margin-bottom:22px}

/* 타이틀 영역 */
.ihnh-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5.5vw,60px);line-height:1.12;letter-spacing:-.02em;color:var(--ink);margin:0}
.ihnh-title .em{color:var(--accent)}
.ihnh-sub{margin:14px auto 0;max-width:620px;font-size:17px;font-weight:500;color:var(--ink-2);line-height:1.6}

/* 뱃지 그리드 */
.ihnh-badges{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin:40px auto 0;max-width:740px}
.ihnh-badge{position:relative;width:160px;height:160px;flex:0 0 160px}

/* 그린 아웃라인 원 */
.ihnh-badge svg{position:absolute;inset:0;width:100%;height:100%}

/* 뱃지 텍스트 레이아웃 */
.ihnh-badge-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.ihnh-badge-cat{font-family:var(--font-body);font-weight:700;font-size:clamp(13px,2vw,17px);color:#158044;line-height:1.25;text-align:center;word-break:keep-all}
.ihnh-badge-sfx{font-family:var(--font-body);font-weight:700;font-size:clamp(13px,2vw,17px);color:#158044;line-height:1.25;text-align:center}

/* 하단 제품 이미지 */
.ihnh-photo-wrap{margin:42px auto 0;max-width:740px;width:100%}
.ihnh-photo-wrap img,.ihnh-photo-wrap .ph{width:100%;aspect-ratio:740/559;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*40px));display:block}
.ihnh-photo-wrap.ph-wrap{aspect-ratio:740/559;border-radius:var(--shape-photo, calc(var(--r-scale,1)*40px));background:color-mix(in srgb,var(--accent) 8%,var(--paper));display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:14px}
`,
  render: (d, { esc, richSafe }) => {
    const suffix = d.badgeSuffix ?? '무첨가'

    const badgeHtml = d.badges
      .map(
        (b) => `
    <div class="ihnh-badge">
      <!-- 그린 아웃라인 원 (벡터 재구성) -->
      <svg viewBox="0 0 160 160" fill="none" aria-hidden="true">
        <circle cx="80" cy="80" r="74" stroke="#158044" stroke-width="3"/>
      </svg>
      <div class="ihnh-badge-inner">
        <span class="ihnh-badge-cat">${esc(b.label)}</span>
        <span class="ihnh-badge-sfx">${esc(suffix)}</span>
      </div>
    </div>`,
      )
      .join('')

    // 이미지 없을 때 강등: ph-wrap 컨테이너로 표시(붕괴 방지)
    const photoHtml = d.image
      ? `<div class="ihnh-photo-wrap">${media(d.image, 'ihnh-photo', d.imageAlt ?? '제품 이미지')}</div>`
      : ''

    return `
<section class="ihnh">
  ${d.chip ? `<span class="ihnh-chip">${esc(d.chip)}</span>` : ''}
  <h2 class="ihnh-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="ihnh-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="ihnh-badges">
    ${badgeHtml}
  </div>
  ${photoHtml}
</section>`
  },
})
