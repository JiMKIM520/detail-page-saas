/** INGREDIENT 아키타입: ingredient-orbit-badge-trio
 *  원본: 145_성분소개_04.json (성분소개/04, 860px 모바일)
 *  구조: 상단 포인트 라벨 띠 + 타이틀/설명 블록 + 풀폭 사진 프레임
 *        + 하단 3열 동심원 뱃지 행.
 *  핵심 장치: 3중 동심원 SVG 안에 곡선 TEXT_PATH 2줄이 회전 배치되는
 *             원형 인증/성분 아이콘 뱃지. 이미지 없으면 noimg-safe 강등.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const badgeSchema = z.object({
  outerArc: z.string().min(1),        // 바깥 곡선 텍스트 (12자 이내 권장)
  innerArc: z.string().min(1),        // 안쪽 곡선 텍스트 (10자 이내 권장)
  iconName: z.string().min(1),        // 뱃지 중앙 단어/기호 (2~4자)
  label: z.string().min(1),           // 뱃지 하단 라벨 (em,br 허용)
})

const schema = z.object({
  pointTag: z.string().optional(),    // 상단 포인트 라벨 (예: "피부 저자극 테스트 완료")
  title: z.string().min(1),           // 대제목 (em,br 허용)
  desc: z.string().optional(),        // 부제/설명 (em,br 허용)
  image: z.string().optional(),       // 풀폭 제품/성분 사진 (url)
  badges: z.array(badgeSchema).min(2).max(3), // 2~3개 동심원 뱃지
})
type Data = z.infer<typeof schema>

/** 동심원 + 곡선 텍스트 + 중앙 기호 SVG 뱃지 */
function orbitBadgeSvg(
  outerArc: string,
  innerArc: string,
  iconText: string,
  esc: (s: string | undefined) => string,
): string {
  // 글자 간격을 띄어 곡선 텍스트 효과 구현 (피그마 TEXT_PATH 재현)
  const spacedOuter = outerArc.split('').join(' ')
  const spacedInner = innerArc.split('').join(' ')
  // 바깥 호(반지름 80) → 텍스트 경로 id 충돌 방지를 위해 iconText 해시 사용
  const uid = Math.abs(
    (outerArc + innerArc + iconText)
      .split('')
      .reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0),
  )
    .toString(36)
    .slice(0, 6)
  return `
<svg class="iwbj-badge-svg" viewBox="0 0 200 200" aria-hidden="true">
  <defs>
    <path id="op${uid}" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"/>
    <path id="ip${uid}" d="M 100,100 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"/>
  </defs>
  <!-- 동심원 3중 링 -->
  <circle cx="100" cy="100" r="96" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity=".35"/>
  <circle cx="100" cy="100" r="80" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity=".5"/>
  <circle cx="100" cy="100" r="50" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity=".7"/>
  <!-- 바깥 곡선 텍스트 -->
  <text font-family="var(--font-body),'Pretendard',sans-serif" font-size="10.5" font-weight="600" fill="var(--accent)" letter-spacing="1">
    <textPath href="#op${uid}" startOffset="8%">${esc(spacedOuter)}</textPath>
  </text>
  <!-- 안쪽 곡선 텍스트 -->
  <text font-family="var(--font-body),'Pretendard',sans-serif" font-size="9.5" font-weight="600" fill="var(--accent)" letter-spacing="2">
    <textPath href="#ip${uid}" startOffset="12%">${esc(spacedInner)}</textPath>
  </text>
  <!-- 중앙 기호/아이콘 텍스트 -->
  <text
    x="100" y="108"
    text-anchor="middle"
    font-family="var(--font-display),'Pretendard',sans-serif"
    font-size="22" font-weight="800"
    fill="var(--accent)"
  >${esc(iconText)}</text>
</svg>`
}

export const ingredientOrbitBadgeTrio = defineBlock<Data>({
  id: 'ingredient-orbit-badge-trio',
  archetype: 'ingredient',
  styleTags: ['light', 'cert', 'beauty', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분/인증 원형 뱃지 3열 블록. 상단 포인트 라벨 + 대제목/설명 + 풀폭 사진 + 하단 동심원 3중링 SVG 뱃지(곡선 텍스트 2줄+중앙기호) 2~3개 수평 배열. 뷰티·건강 성분 인증 강조에 최적.',
  schema,
  css: `
.iwbj{background:var(--bg);color:var(--ink);padding:0 0 64px}
/* 상단 포인트 라벨 띠 */
.iwbj-pt{padding:18px var(--pad-x,56px) 16px;background:color-mix(in srgb,var(--accent) 10%,transparent)}
.iwbj-pt-text{font-family:var(--font-body),'Pretendard',sans-serif;font-size:clamp(14px,1.6vw,18px);font-weight:700;color:var(--accent);letter-spacing:.04em}
/* 타이틀 블록 */
.iwbj-hd{padding:36px var(--pad-x,56px) 0}
.iwbj-title{font-family:var(--font-display),'Pretendard',sans-serif;font-size:clamp(28px,3.8vw,50px);font-weight:800;line-height:1.18;letter-spacing:-.02em;color:var(--ink)}
.iwbj-title .em{color:var(--accent)}
.iwbj-desc{margin-top:14px;font-size:clamp(15px,1.8vw,20px);font-weight:500;line-height:1.7;color:var(--ink-2)}
.iwbj-desc .em{color:var(--accent);font-weight:700}
/* 풀폭 이미지 슬롯 */
.iwbj-img-wrap{margin:32px var(--pad-x,56px) 0;border-radius:var(--shape-photo,calc(var(--r-scale,1)*18px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
.iwbj-img{width:100%;aspect-ratio:760/640;object-fit:cover;display:block;border-radius:inherit}
/* noimg-safe: 이미지 없으면 이미지 영역 자체를 숨겨 레이아웃 붕괴 방지 */
.iwbj-img-wrap:has(.ph){display:none}
/* 뱃지 행 */
.iwbj-badges{display:flex;justify-content:center;gap:0;padding:40px var(--pad-x,56px) 0}
.iwbj-badge{flex:1;display:flex;flex-direction:column;align-items:center;gap:14px;min-width:0}
.iwbj-badge-svg{width:100%;max-width:180px;height:auto;display:block}
.iwbj-badge-label{font-size:clamp(13px,1.5vw,17px);font-weight:600;color:var(--ink);text-align:center;line-height:1.45}
.iwbj-badge-label .em{color:var(--accent);font-weight:800}
/* 2개 뱃지일 때 최대폭 제한 */
.iwbj-badges.ct2 .iwbj-badge{max-width:260px}
`,
  render: (d, { esc, richSafe }) => {
    const badgeCount = d.badges.length
    return `
<section class="iwbj">
  ${d.pointTag ? `<div class="iwbj-pt"><span class="iwbj-pt-text">${esc(d.pointTag)}</span></div>` : ''}
  <div class="iwbj-hd">
    <h2 class="iwbj-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="iwbj-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
  <div class="iwbj-img-wrap">
    ${media(d.image, 'iwbj-img', '성분 이미지')}
  </div>
  <div class="iwbj-badges${badgeCount === 2 ? ' ct2' : ''}">
    ${d.badges
      .map(
        (b) => `
    <div class="iwbj-badge">
      ${orbitBadgeSvg(b.outerArc, b.innerArc, b.iconName, esc)}
      <div class="iwbj-badge-label">${richSafe(b.label)}</div>
    </div>`,
      )
      .join('')}
  </div>
</section>`
  },
})
