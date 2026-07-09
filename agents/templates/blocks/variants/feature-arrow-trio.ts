/** FEATURE 아키타입: feature-arrow-trio
 *  원본: 088_문제해결_04 — 진청 배경 + 소제목·대제목 + r:150 대곡률 제품 이미지
 *  + 3개 흰 카드(좌 연파 썸네일 + 우 제목·설명) + 카드 사이 SVG 화살표 구분선.
 *  핵심 장치: 카드 간 화살표 벡터 인서트(구조적 순서감 강조), 대곡률 이미지 컨테이너(r:150).
 *  다크 섹션 — richSafe 텍스트에 .fnhk .em 스코프 오버라이드 필수.
 *  이미지(hero + 썸네일) 부재 시 붕괴 방지 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  thumb: z.string().optional(),   // 카드 좌측 소형 썸네일 (url)
  label: z.string().min(1),       // 카드 제목 (em 허용)
  text: z.string().min(1),        // 카드 설명 (em 허용)
})

const schema = z.object({
  eyebrow: z.string().optional(),   // 소제목 라벨 (순수 텍스트)
  title: z.string().min(1),         // 대제목 (em,br 허용)
  image: z.string().optional(),     // 대곡률 제품 대표 이미지 (url)
  items: z.array(itemSchema).min(2).max(3),
})
type Data = z.infer<typeof schema>

export const featureArrowTrio = defineBlock<Data>({
  id: 'feature-arrow-trio',
  archetype: 'feature',
  styleTags: ['dark', 'product', 'feature-list', 'noimg-safe'],
  imageSlots: 4, // 대표 1 + 카드 썸네일 3
  describe:
    '진청(브랜드 다크) 배경 + 소제목·대제목 헤더 + r:150 대곡률 제품 이미지 + 2~3개 흰 카드 기능 리스트(좌 연파 썸네일+우 제목·설명) + 카드 사이 SVG 화살표 구분선. 기능 문제 해결 / 제품 구조 설명에 최적.',
  schema,
  css: `
/* ── feature-arrow-trio (fnhk) ── */
.fnhk{background:var(--brand,#0b42a6);color:var(--ink);padding:60px 0 64px}
/* 다크 배경 위 em 강조색 오버라이드 */
.fnhk .em{color:var(--em-dark,#FFF7EA)}
.fnhk-inner{padding:0 var(--pad-x,56px)}
/* 헤더 영역 */
.fnhk-eyebrow{font-family:var(--font-body);font-size:18px;font-weight:600;
  color:color-mix(in srgb,var(--accent,#4da8ff) 90%,#fff);
  letter-spacing:.04em;margin-bottom:14px}
.fnhk-title{font-family:var(--font-display);font-size:42px;font-weight:800;
  color:#fff;line-height:1.22;letter-spacing:-.02em;margin-bottom:36px}
/* 대곡률 제품 이미지 */
.fnhk-hero-img{width:100%;aspect-ratio:760/600;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*150px));
  object-fit:cover;display:block;margin-bottom:36px;
  background:color-mix(in srgb,var(--accent,#4da8ff) 18%,var(--brand,#0b42a6))}
.fnhk-hero-img.ph{display:none!important}
/* 이미지 없을 때 여백 제거 */
.fnhk-hero-ph{display:none}
/* 리스트 래퍼 */
.fnhk-list{display:flex;flex-direction:column;gap:0}
/* 카드 */
.fnhk-card{display:flex;align-items:center;gap:20px;
  background:#fff;border-radius:calc(var(--r-scale,1)*20px);
  padding:20px 20px 20px 20px}
/* 썸네일 박스 */
.fnhk-thumb-wrap{flex:0 0 90px;width:90px;height:90px;
  border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;
  background:color-mix(in srgb,var(--accent,#4da8ff) 15%,#fff)}
.fnhk-thumb-wrap img{width:100%;height:100%;object-fit:cover;display:block;
  filter:brightness(1.08) contrast(1.05)}
.fnhk-thumb-wrap .ph{display:none!important}
/* 텍스트 열 */
.fnhk-body{flex:1;min-width:0}
.fnhk-label{font-family:var(--font-display);font-size:18px;font-weight:700;
  color:var(--accent-d,#0e52d0);line-height:1.25;margin-bottom:6px}
.fnhk-label .em{color:var(--accent-d,#0e52d0)}
.fnhk-desc{font-size:14px;font-weight:400;color:#202020;line-height:1.68}
.fnhk-desc .em{color:var(--accent-d,#0e52d0);font-weight:700}
/* 화살표 구분선 */
.fnhk-arrow{display:flex;align-items:center;justify-content:center;
  padding:6px 0;color:color-mix(in srgb,#fff 45%,transparent)}
.fnhk-arrow svg{width:28px;height:28px;display:block}
`,
  render: (d, { esc, richSafe }) => {
    // 모든 카드 썸네일이 있을 때만 썸네일 프레임 표시 (partial 이미지 → 빈 박스 방지)
    const withThumbs = d.items.every((it) => typeof it.thumb === 'string' && it.thumb.length > 0)

    // 화살표 SVG (카드 사이 삽입)
    const arrowSvg = `<div class="fnhk-arrow" aria-hidden="true">
  <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 6v16M7 15l7 7 7-7"/>
  </svg>
</div>`

    const cards = d.items
      .map(
        (it, i) => `${i > 0 ? arrowSvg : ''}
<div class="fnhk-card">
  ${
    withThumbs
      ? `<div class="fnhk-thumb-wrap">${media(it.thumb, '', '기능 이미지')}</div>`
      : ''
  }
  <div class="fnhk-body">
    <div class="fnhk-label">${richSafe(it.label)}</div>
    <div class="fnhk-desc">${richSafe(it.text)}</div>
  </div>
</div>`,
      )
      .join('')

    return `
<section class="fnhk">
  <div class="fnhk-inner">
    ${d.eyebrow ? `<p class="fnhk-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="fnhk-title">${richSafe(d.title)}</h2>
    ${d.image ? `${media(d.image, 'fnhk-hero-img', '제품 이미지')}` : ''}
    <div class="fnhk-list">
      ${cards}
    </div>
  </div>
</section>`
  },
})
