/** INGREDIENT 아키타입: ingredient-badge-tile-grid
 *  원본 구조 흡수: 335_제품소개_38.json
 *  타이틀(포인트 타원 배지) + 대형 라운드 이미지 + 6가지 성분 2×3 교차색 타일 그리드.
 *  각 타일: 원형 번호 배지(01~06) + 성분명 + 한 줄 설명. 홀수열=엑센트틴트, 짝수열=페이퍼 배경.
 *  이미지 부재 시 타일 그리드만 렌더 (noimg-safe 강등). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().optional(),          // 타원 배지 라벨 (예: "point 01")
  title: z.string().min(1),             // 메인 헤드라인 (em,br) — 포인트 컬러 강조
  titleSub: z.string().optional(),      // 헤드라인 위 2차 제목 (순수 텍스트)
  desc: z.string().optional(),          // 헤드라인 아래 설명 (em,br)
  image: z.string().optional(),         // 대형 라운드 제품 사진 (url)
  sectionTitle: z.string().optional(),  // 그리드 상단 타이틀 (em,br) — 기본 생략 가능
  sectionDesc: z.string().optional(),   // 그리드 상단 설명 (em,br)
  items: z
    .array(
      z.object({
        num: z.string().optional(),     // 번호 라벨 (기본: "01"~"06")
        label: z.string().min(1),       // 성분명 / 항목명
        text: z.string().min(1),        // 한 줄~두 줄 설명 (em,br)
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const ingredientBadgeTileGrid = defineBlock<Data>({
  id: 'ingredient-badge-tile-grid',
  archetype: 'ingredient',
  styleTags: ['light', 'food', 'warm', 'grid', 'numbered', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분/영양 소개 (원형 번호 배지 + 2열 교차색 타일 그리드). 상단 포인트 타원 배지+헤드라인+대형 라운드 사진 뒤, 2×N 타일 그리드가 이어짐. 홀수 타일=엑센트 틴트, 짝수=페이퍼. 각 타일: 녹색 원형 번호 배지+성분명+설명. 사진 없으면 타일 그리드만 강등 렌더(noimg-safe). 식품·건강기능식품에 최적.',
  schema,
  css: `
.impj{background:var(--bg);color:var(--ink);padding:0 0 64px}

/* ── 헤더 영역 ── */
.impj-hd{padding:56px var(--pad-x,56px) 0;text-align:center}
.impj-badge-wrap{display:flex;justify-content:center;margin-bottom:24px}
.impj-badge{display:inline-block;background:var(--accent);color:var(--ink);
  font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.06em;
  padding:10px 32px;border-radius:999px;line-height:1}
.impj-title-sub{font-size:18px;font-weight:500;color:var(--ink-2);margin-bottom:10px;line-height:1.5}
.impj-title{font-family:var(--font-display);font-weight:700;font-size:42px;
  color:var(--accent-d);line-height:1.2;letter-spacing:-.02em}
.impj-title .em{color:var(--accent)}
.impj-desc{margin-top:18px;font-size:16px;font-weight:400;color:var(--ink-2);line-height:1.72}
.impj-desc .em{color:var(--accent-d);font-weight:700}

/* ── 대형 제품 이미지 ── */
.impj-img-wrap{margin:36px var(--pad-x,56px) 0}
.impj-img{width:100%;aspect-ratio:760/560;object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*40px));display:block}
.impj-img.ph{display:none!important}

/* ── 그리드 타이틀 ── */
.impj-sec{padding:48px var(--pad-x,56px) 0;text-align:center}
.impj-sec-title{font-family:var(--font-display);font-weight:700;font-size:28px;
  color:var(--accent-d);line-height:1.35}
.impj-sec-title .em{color:var(--accent)}
.impj-sec-desc{margin-top:12px;font-size:15px;color:var(--ink-2);line-height:1.7}
.impj-sec-desc .em{color:var(--accent-d);font-weight:700}

/* ── 2열 타일 그리드 ── */
.impj-grid{display:grid;grid-template-columns:1fr 1fr;margin-top:24px}
.impj-tile{padding:32px 24px 28px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:0}
.impj-tile:nth-child(odd){background:color-mix(in srgb,var(--accent) 18%,var(--bg))}
.impj-tile:nth-child(even){background:var(--paper)}

/* 원형 번호 배지 */
.impj-num{width:52px;height:52px;border-radius:50%;background:var(--brand);
  color:#fff;font-family:var(--font-display);font-weight:700;font-size:20px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  margin-bottom:14px;line-height:1}

/* 타일 텍스트 */
.impj-tile-label{font-weight:700;font-size:17px;color:var(--ink);line-height:1.3;margin-bottom:8px}
.impj-tile-text{font-size:14px;color:var(--ink-2);line-height:1.65}
.impj-tile-text .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg =
      typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    const tiles = d.items
      .map(
        (item, i) => `
    <div class="impj-tile">
      <div class="impj-num">${esc(item.num ?? pad2(i + 1))}</div>
      <div class="impj-tile-label">${esc(item.label)}</div>
      <div class="impj-tile-text">${richSafe(item.text)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="impj">
  <div class="impj-hd">
    ${d.badge ? `<div class="impj-badge-wrap"><span class="impj-badge">${esc(d.badge)}</span></div>` : ''}
    ${d.titleSub ? `<p class="impj-title-sub">${esc(d.titleSub)}</p>` : ''}
    <h2 class="impj-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="impj-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
  ${hasImg ? `<div class="impj-img-wrap">${media(d.image, 'impj-img', '제품 사진')}</div>` : ''}
  ${d.sectionTitle || d.sectionDesc ? `
  <div class="impj-sec">
    ${d.sectionTitle ? `<h3 class="impj-sec-title">${richSafe(d.sectionTitle)}</h3>` : ''}
    ${d.sectionDesc ? `<p class="impj-sec-desc">${richSafe(d.sectionDesc)}</p>` : ''}
  </div>` : ''}
  <div class="impj-grid">
    ${tiles}
  </div>
</section>`
  },
})
