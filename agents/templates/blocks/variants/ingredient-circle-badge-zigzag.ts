/** INGREDIENT 아키타입: ingredient-circle-badge-zigzag.
 *  217_제품소개_20 흡수 — 포인트 레이블 + 대형 풀폭 사진 + 따옴표 인용 + 투명도 차등 3원형 오버랩
 *  성분 배지 + 번호-이미지 교차 리스트 3행. 라이트 배경, 뷰티/건강 카테고리에 최적. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const badgeSchema = z.object({
  latin: z.string().min(1),   // 영문 성분명 (e.g. "Niacinamide")
  korean: z.string().min(1),  // 한글 성분명 (e.g. "나이아신아마이드")
})

const itemSchema = z.object({
  latin: z.string().min(1),      // 영문 성분명 (번호 뱃지 헤더)
  name: z.string().min(1),       // 한글 성분명 (accent색)
  subtitle: z.string().min(1),   // 효능 소제목 (em 허용)
  desc: z.string().min(1),       // 상세 설명 (순수 텍스트)
  image: z.string().optional(),  // 성분 이미지 url
})

const schema = z.object({
  pointLabel: z.string().optional(),   // 좌측 포인트 레이블 (예: "제품소개.")
  productName: z.string().optional(),  // 우측 제품명 (예: "# 스칼프 리셋 샴푸")
  title: z.string().min(1),            // 대형 타이틀 (br 허용)
  heroImage: z.string().optional(),    // 풀폭 대표 이미지 url
  quote: z.string().min(1),           // 따옴표 인용 문구 (em/br 허용)
  badges: z.array(badgeSchema).min(2).max(4),  // 원형 오버랩 성분 배지 (2~4개)
  items: z.array(itemSchema).min(2).max(4),    // 번호-이미지 교차 리스트 (2~4행)
})
type Data = z.infer<typeof schema>

export const ingredientCircleBadgeZigzag = defineBlock<Data>({
  id: 'ingredient-circle-badge-zigzag',
  archetype: 'ingredient',
  styleTags: ['light', 'beauty', 'editorial', 'noimg-safe'],
  imageSlots: 4,   // heroImage + items[0..2].image
  describe:
    '성분 소개(오버랩 원형 배지+교차 리스트). 포인트 레이블 + 대형 풀폭 제품사진 + 따옴표 인용 + 투명도 차등 3원형 오버랩 성분 배지(삼각형 군집) + 번호-이미지 교차 3행 리스트. 뷰티/건강식품 성분 상세 섹션.',
  schema,
  css: `
/* ── 섹션 래퍼 ───────────────────────────────────────── */
.icbz{background:var(--bg);color:var(--ink);padding:0 0 72px}

/* ── 포인트 레이블 행 ───────────────────────────────── */
.icbz-point{display:flex;align-items:baseline;justify-content:space-between;padding:28px var(--pad-x,56px) 0}
.icbz-point-lbl{font-family:var(--font-display);font-size:28px;font-weight:400;color:var(--accent-d);letter-spacing:.01em}
.icbz-point-name{font-family:var(--font-body),'Pretendard',sans-serif;font-size:17px;font-weight:400;color:var(--accent-d);letter-spacing:.01em}

/* ── 타이틀 ─────────────────────────────────────────── */
.icbz-title{padding:18px var(--pad-x,56px) 24px;font-family:var(--font-display);font-weight:700;font-size:42px;line-height:1.25;color:var(--ink);letter-spacing:-.02em}

/* ── 풀폭 대표 사진 ─────────────────────────────────── */
.icbz-hero{margin:0 var(--pad-x,56px);border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.icbz-hero img,.icbz-hero .ph{width:100%;aspect-ratio:760/480;object-fit:cover;display:block;border-radius:inherit}

/* ── 따옴표 인용 ─────────────────────────────────────── */
.icbz-quote-wrap{padding:48px var(--pad-x,56px) 36px;text-align:center;position:relative}
.icbz-quote-mark{display:block;color:var(--accent);line-height:1;margin-bottom:14px}
.icbz-quote-mark svg{width:32px;height:21px;fill:var(--accent)}
.icbz-quote-mark.close{margin-top:14px;margin-bottom:0;transform:rotate(180deg)}
.icbz-quote-text{font-family:var(--font-body),'Pretendard',sans-serif;font-size:26px;font-weight:600;line-height:1.6;color:var(--ink);word-break:keep-all}
.icbz-quote-text .em{color:var(--accent-d);font-weight:800}

/* ── 원형 오버랩 배지 군 ─────────────────────────────── */
.icbz-badges{position:relative;margin:0 auto;padding:0 var(--pad-x,56px) 0;overflow:visible}
.icbz-badge-grid{position:relative;height:340px}
/* 배지 공통 — 원형(r=999) + 투명도는 인라인 스타일로 차등 */
.icbz-badge{position:absolute;width:240px;height:240px;border-radius:999px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;color:#fff}
.icbz-badge-lat{font-family:var(--font-body),'Pretendard',sans-serif;font-size:21px;font-weight:600;text-align:center;line-height:1.3;padding:0 12px}
.icbz-badge-div{width:70%;height:1px;background:rgba(255,255,255,.55);margin:8px 0}
.icbz-badge-kr{font-family:var(--font-body),'Pretendard',sans-serif;font-size:18px;font-weight:700;text-align:center;line-height:1.3}
/* 배지 1: 우상단 기준점 */
.icbz-badge:nth-child(1){top:0;left:calc(50% - 60px)}
/* 배지 2: 좌하단 */
.icbz-badge:nth-child(2){top:100px;left:calc(50% - 220px)}
/* 배지 3: 우하단 */
.icbz-badge:nth-child(3){top:100px;left:calc(50% + 20px)}
/* 배지 4 (선택): 하단 중앙 — 4번째 있을 때 높이 확장 */
.icbz-badge:nth-child(4){top:220px;left:calc(50% - 100px)}
.icbz-badge-grid.n4{height:500px}

/* ── 헤어라인 구분 ───────────────────────────────────── */
.icbz-divider{margin:36px var(--pad-x,56px) 0;height:1px;background:var(--line)}

/* ── 번호-이미지 교차 리스트 ──────────────────────────── */
.icbz-list{padding:0 var(--pad-x,56px);margin-top:0}
.icbz-row{display:flex;align-items:center;gap:32px;padding:36px 0;border-bottom:1px solid var(--line)}
.icbz-row:last-child{border-bottom:none}
/* 홀수 행: 텍스트 왼쪽 / 이미지 오른쪽 */
.icbz-row.rev{flex-direction:row-reverse}
/* noimg 강등: 이미지 전무 시 텍스트 전폭 */
.icbz-row.noimg .icbz-img-slot{display:none}
.icbz-row.noimg .icbz-text-col{flex:1}

.icbz-text-col{flex:0 0 calc(50% - 16px);display:flex;flex-direction:column;gap:0}
.icbz-num-badge{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:var(--accent-d);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-size:22px;font-weight:800;border-radius:calc(var(--r-scale,1)*6px);margin-bottom:14px;flex-shrink:0}
.icbz-item-latin{font-family:var(--font-body),'Pretendard',sans-serif;font-size:13px;font-weight:600;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.icbz-item-name{font-family:var(--font-body),'Pretendard',sans-serif;font-size:24px;font-weight:700;color:var(--accent-d);line-height:1.25;margin-bottom:4px}
.icbz-item-sub{font-family:var(--font-body),'Pretendard',sans-serif;font-size:18px;font-weight:700;color:var(--ink);line-height:1.35;margin-bottom:12px}
.icbz-item-sub .em{color:var(--accent-d)}
.icbz-item-desc{font-family:var(--font-body),'Pretendard',sans-serif;font-size:15px;font-weight:400;color:var(--ink-2);line-height:1.78}

.icbz-img-slot{flex:0 0 calc(50% - 16px)}
.icbz-img-slot img,.icbz-img-slot .ph{width:100%;aspect-ratio:1/0.9;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));display:block}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 강등 가드 — 아이템 전부 이미지 없으면 noimg 모드
    const withItemImgs = d.items.every((it) => typeof it.image === 'string' && it.image.length > 0)

    // 원형 배지 — accent 색상에 투명도 차등 (첫 배지 0.92 → 마지막 0.65)
    const opacities = [0.92, 0.78, 0.65, 0.55]
    const badgeItems = d.badges.map((b, i) => `
    <div class="icbz-badge" style="background:color-mix(in srgb,var(--accent-d) ${Math.round(opacities[Math.min(i, opacities.length - 1)] * 100)}%,transparent)">
      <span class="icbz-badge-lat">${esc(b.latin)}</span>
      <span class="icbz-badge-div"></span>
      <span class="icbz-badge-kr">${esc(b.korean)}</span>
    </div>`).join('')

    const gridClass = `icbz-badge-grid${d.badges.length >= 4 ? ' n4' : ''}`

    // 교차 리스트
    const listRows = d.items.map((it, i) => {
      const isRev = i % 2 === 1  // 짝수 인덱스(홀수 행)=정방향, 홀수 인덱스(짝수 행)=reverse
      const rowClass = `icbz-row${isRev ? ' rev' : ''}${!withItemImgs ? ' noimg' : ''}`
      return `
    <div class="${rowClass}">
      <div class="icbz-text-col">
        <span class="icbz-num-badge">${i + 1}</span>
        <p class="icbz-item-latin">${esc(it.latin)}</p>
        <p class="icbz-item-name">${esc(it.name)}</p>
        <p class="icbz-item-sub">${richSafe(it.subtitle)}</p>
        <p class="icbz-item-desc">${esc(it.desc)}</p>
      </div>
      <div class="icbz-img-slot">
        ${media(it.image, '', `${esc(it.name)} 이미지`)}
      </div>
    </div>`
    }).join('')

    return `
<section class="icbz">
  ${d.pointLabel || d.productName ? `
  <div class="icbz-point">
    <span class="icbz-point-lbl">${esc(d.pointLabel ?? '')}</span>
    <span class="icbz-point-name">${esc(d.productName ?? '')}</span>
  </div>` : ''}
  <h2 class="icbz-title">${richSafe(d.title)}</h2>
  <div class="icbz-hero">
    ${media(d.heroImage, '', '제품 대표 이미지')}
  </div>
  <div class="icbz-quote-wrap">
    <span class="icbz-quote-mark" aria-hidden="true">
      <svg viewBox="0 0 38 25"><path d="M0 25V14.1C0 5.3 5.4.6 16.1 0l1.4 3.1C10.2 4.5 6.4 8.1 6.2 14H12V25H0zm20 0V14.1C20 5.3 25.4.6 36.1 0l1.4 3.1C30.2 4.5 26.4 8.1 26.2 14H32V25H20z"/></svg>
    </span>
    <p class="icbz-quote-text">${richSafe(d.quote)}</p>
    <span class="icbz-quote-mark close" aria-hidden="true">
      <svg viewBox="0 0 38 25"><path d="M0 25V14.1C0 5.3 5.4.6 16.1 0l1.4 3.1C10.2 4.5 6.4 8.1 6.2 14H12V25H0zm20 0V14.1C20 5.3 25.4.6 36.1 0l1.4 3.1C30.2 4.5 26.4 8.1 26.2 14H32V25H20z"/></svg>
    </span>
  </div>
  <div class="icbz-badges">
    <div class="${gridClass}">
      ${badgeItems}
    </div>
  </div>
  <div class="icbz-divider"></div>
  <div class="icbz-list">
    ${listRows}
  </div>
</section>`
  },
})
