/** INGREDIENT 아키타입: ingredient-point-serif-list.
 *  피그마 243_제품소개_22 구조 흡수 —
 *  "point 01" 영문 세리프 넘버 헤더(좌 짧은 선 + 세리프 라벨 + 우 롱 선) +
 *  섹션 타이틀/부제 + 2열 나란히 대형 사진 + 중앙 텍스트 배지 캡션 +
 *  하단 번호형 리스트(좌 정사각 썸네일 + 우 세리프 번호 접두사·제목·설명) 3행 반복.
 *  라이트 톤. noimg-safe: 이미지 전부 없으면 사진 영역 제거 후 텍스트 전용으로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 스키마 ─────────────────────────────────────────────── */

const rowSchema = z.object({
  image: z.string().optional(),       // 정사각 썸네일 (url)
  title: z.string().min(1),           // 행 제목 (순수 텍스트)
  desc: z.string().min(1),            // 행 설명 (em,br 허용)
})

const schema = z.object({
  pointLabel: z.string().optional(),  // "point 01" 라벨 (기본값 제공)
  headline: z.string().min(1),        // 섹션 대제목 (em,br)
  subhead: z.string().optional(),     // 대제목 아래 부제 (em,br)
  photoA: z.string().optional(),      // 2열 좌 이미지 (url)
  photoB: z.string().optional(),      // 2열 우 이미지 (url)
  badgeOrigin: z.string().optional(), // 배지 원산지/서브라벨 (순수 텍스트, 예: "Tuscany, Italy")
  badgeDesc: z.string().optional(),   // 배지 본문 한 줄 (순수 텍스트, 예: "이탈리아 프리미엄 원사로 완성한 차이")
  badgeBody: z.string().optional(),   // 배지 아래 보조 설명 (em,br)
  rows: z
    .array(rowSchema)
    .min(2)
    .max(4),                          // 번호형 리스트 행 (2~4)
})

type Data = z.infer<typeof schema>

/* ── 변형 정의 ───────────────────────────────────────────── */

export const ingredientPointSerifList = defineBlock<Data>({
  id: 'ingredient-point-serif-list',
  archetype: 'ingredient',
  styleTags: ['light', 'warm', 'premium', 'editorial', 'serif', 'noimg-safe'],
  imageSlots: 6,  // photoA + photoB + rows(최대 4)
  describe:
    '원료/성분 소개 블록. 라이트 배경. 상단에 "point 01" 영문 세리프 넘버 + 가로선 분기 헤더 → 섹션 대제목·부제 → 2열 나란히 대형 사진 + 세리프 서브라벨·역색 배지 캡션 → 하단 번호형 리스트(정사각 썸네일 + 세리프 번호 접두·제목·설명) 3행 반복. 원산지·장인성·프리미엄 소재 강조에 최적.',
  schema,
  css: `
.ivmq{background:var(--bg);color:var(--ink);padding-bottom:72px}

/* ── point 헤더 ── */
.ivmq-pt{display:flex;align-items:center;padding:0 0 0 var(--pad-x,56px);gap:0;height:65px}
.ivmq-pt-line-l{width:40px;height:0;border-top:2px solid var(--line);flex-shrink:0}
.ivmq-pt-label{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:700;font-size:46px;color:var(--accent);white-space:nowrap;padding:0 18px;line-height:1}
.ivmq-pt-line-r{flex:1;height:0;border-top:2px solid var(--line)}

/* ── 섹션 타이틀 ── */
.ivmq-hd{padding:32px var(--pad-x,56px) 0}
.ivmq-headline{font-family:var(--font-body,'Pretendard',sans-serif);font-weight:500;font-size:52px;line-height:1.18;letter-spacing:-.02em;color:var(--ink)}
.ivmq-headline .em{color:var(--accent)}
.ivmq-subhead{margin-top:14px;font-family:var(--font-body,'Pretendard',sans-serif);font-weight:400;font-size:34px;line-height:1.5;color:var(--ink-2)}
.ivmq-subhead .em{color:var(--accent)}

/* ── 2열 사진 ── */
.ivmq-duo{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:40px var(--pad-x,56px) 0}
.ivmq-duo-img{width:100%;aspect-ratio:377/600;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));display:block}
.ivmq-duo-img.ph{display:none!important}

/* ── 배지 캡션 영역 ── */
.ivmq-cap{margin:32px var(--pad-x,56px) 0;text-align:center}
.ivmq-cap-origin{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:700;font-size:54px;color:var(--accent-d);line-height:1;letter-spacing:.02em}
.ivmq-cap-rule{width:72px;height:0;border-top:2px solid var(--accent);margin:12px auto}
.ivmq-cap-badge{display:inline-block;background:var(--accent-d);color:var(--bg);font-size:28px;font-weight:400;padding:10px 28px;border-radius:calc(var(--r-scale,1)*4px)}
.ivmq-cap-body{margin-top:16px;font-size:28px;line-height:1.6;color:var(--ink-2);max-width:680px;margin-left:auto;margin-right:auto}
.ivmq-cap-body .em{color:var(--accent);font-weight:700}

/* ── 번호형 리스트 ── */
.ivmq-list{margin-top:48px;display:flex;flex-direction:column}
.ivmq-row{display:flex;align-items:flex-start;gap:0;padding:0 var(--pad-x,56px);margin-bottom:24px}
.ivmq-row:last-child{margin-bottom:0}
.ivmq-thumb-wrap{flex-shrink:0;width:220px;height:220px;border-radius:calc(var(--r-scale,1)*8px);overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--bg))}
.ivmq-thumb{width:100%;height:100%;object-fit:cover}
.ivmq-thumb.ph{display:none!important}
/* noimg-safe: 썸네일 없으면 텍스트 영역이 전폭 차지 */
.ivmq-row--noimg .ivmq-thumb-wrap{display:none}
.ivmq-row-body{flex:1;padding:0 0 0 32px;display:flex;flex-direction:column;justify-content:center;min-height:220px}
.ivmq-row--noimg .ivmq-row-body{padding:16px 0;min-height:auto}
.ivmq-row-num{font-family:var(--font-lat,'Cormorant Garamond',serif);font-weight:700;font-size:44px;color:var(--muted);line-height:1;margin-bottom:6px}
.ivmq-row-title{font-family:var(--font-body,'Pretendard',sans-serif);font-weight:600;font-size:28px;color:var(--accent-d);line-height:1.3;margin-top:2px}
.ivmq-row-desc{margin-top:10px;font-size:22px;line-height:1.7;color:var(--ink-2)}
.ivmq-row-desc .em{color:var(--accent);font-weight:700}

/* ── 행간 구분선 ── */
.ivmq-divider{height:1px;background:var(--line);margin:0 var(--pad-x,56px) 24px;opacity:.5}
`,
  render: (d, { esc, richSafe }) => {
    const label = d.pointLabel ?? 'point 01'

    // noimg-safe: 전 행에 이미지가 하나도 없으면 썸네일 컬럼 제거
    const allRowsHaveImg = d.rows.every(
      (r) => typeof r.image === 'string' && r.image.trim().length > 0,
    )

    // 2열 사진 영역: 두 이미지 모두 없으면 영역 자체 숨김
    const showDuo = Boolean(d.photoA ?? d.photoB)

    const pad2 = (n: number) => String(n).padStart(2, '0')

    const rowsHtml = d.rows
      .map((row, i) => {
        const rowClass = allRowsHaveImg ? 'ivmq-row' : 'ivmq-row ivmq-row--noimg'
        const thumbHtml = allRowsHaveImg
          ? `<div class="ivmq-thumb-wrap">${media(row.image, 'ivmq-thumb', `${esc(row.title)} 이미지`)}</div>`
          : ''
        return `
    ${i > 0 ? '<div class="ivmq-divider"></div>' : ''}
    <div class="${rowClass}">
      ${thumbHtml}
      <div class="ivmq-row-body">
        <span class="ivmq-row-num">${pad2(i + 1)}.</span>
        <p class="ivmq-row-title">${esc(row.title)}</p>
        <p class="ivmq-row-desc">${richSafe(row.desc)}</p>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="ivmq">
  <!-- point 헤더 -->
  <div class="ivmq-pt">
    <span class="ivmq-pt-line-l"></span>
    <span class="ivmq-pt-label">${esc(label)}</span>
    <span class="ivmq-pt-line-r"></span>
  </div>

  <!-- 섹션 타이틀 -->
  <div class="ivmq-hd">
    <h2 class="ivmq-headline">${richSafe(d.headline)}</h2>
    ${d.subhead ? `<p class="ivmq-subhead">${richSafe(d.subhead)}</p>` : ''}
  </div>

  <!-- 2열 나란히 사진 -->
  ${showDuo ? `
  <div class="ivmq-duo">
    ${media(d.photoA, 'ivmq-duo-img', '소재 사진 A')}
    ${media(d.photoB, 'ivmq-duo-img', '소재 사진 B')}
  </div>` : ''}

  <!-- 배지 캡션 -->
  ${(d.badgeOrigin ?? d.badgeDesc ?? d.badgeBody) ? `
  <div class="ivmq-cap">
    ${d.badgeOrigin ? `<p class="ivmq-cap-origin">${esc(d.badgeOrigin)}</p>` : ''}
    ${d.badgeOrigin ? '<div class="ivmq-cap-rule"></div>' : ''}
    ${d.badgeDesc ? `<span class="ivmq-cap-badge">${esc(d.badgeDesc)}</span>` : ''}
    ${d.badgeBody ? `<p class="ivmq-cap-body">${richSafe(d.badgeBody)}</p>` : ''}
  </div>` : ''}

  <!-- 번호형 리스트 -->
  <div class="ivmq-list">
    ${rowsHtml}
  </div>
</section>`
  },
})
