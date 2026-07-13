/** DETAIL 아키타입: detail-palette-card.
 *  피그마 065_제품소개_02 구조 흡수 — 검정 배경 + 보라/흰 2색 2단 헤드라인 +
 *  흰 라운드 카드(제품 이미지 → 5색 원형 팔레트 행 → 색상명 배지+설명) 패턴 재구성.
 *  핵심 장치: 카드 내부 이미지 하단에 원형 스와치 N개를 배치해 색상 선택지를 시각화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const swatchSchema = z.object({
  color: z.string().min(1),       // CSS 색상값 (hex / rgb / named)
  name: z.string().min(1),        // 색상명 (배지 텍스트)
  desc: z.string().optional(),    // 색상 설명 한 줄 (optional)
  selected: z.boolean().optional(), // 현재 선택된 스와치 여부 (링 표시)
})

const schema = z.object({
  eyebrow: z.string().optional(),   // 작은 영문 레이블 (em 허용)
  title: z.string().min(1),         // 헤드라인 1행 — 보라 강조 (em,br)
  titleSub: z.string().optional(),  // 헤드라인 2행 — 흰색 (em,br)
  image: z.string().optional(),     // 제품 이미지 (url)
  swatches: z.array(swatchSchema).min(1).max(7), // 색상 스와치 목록
  badgeColor: z.string().optional(), // 배지 배경색 토큰 — 기본 var(--muted)
})
type Data = z.infer<typeof schema>

export const detailPaletteCard = defineBlock<Data>({
  id: 'detail-palette-card',
  archetype: 'detail',
  styleTags: ['dark', 'premium', 'fashion', 'beauty', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '컬러 팔레트 상세. 검정 배경 + 보라/흰 2색 2단 대형 헤드라인 + 흰 라운드 카드(제품 이미지·원형 스와치 행·색상명 배지+설명). 패션·뷰티 색상 라인업 소개에 최적.',
  schema,
  css: `
/* ── detail-palette-card (dmhu) ── */
.dmhu{
  background:var(--brand,#101826);
  padding:64px var(--pad-x,56px) 72px;
  text-align:center;
  color:#fff;
}
/* 다크 배경 위 em 스코프 오버라이드 */
.dmhu .em{color:var(--em-dark,#FFF7EA)}

/* 헤드라인 */
.dmhu-eyebrow{
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  letter-spacing:.25em;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:18px;
  opacity:.85;
}
.dmhu-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,8vw,80px);
  line-height:1.05;
  letter-spacing:-.02em;
  color:var(--accent);
}
.dmhu-title-sub{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,8vw,80px);
  line-height:1.05;
  letter-spacing:-.02em;
  color:#fff !important;
  margin-top:2px;
}

/* 흰 라운드 카드 */
.dmhu-card{
  background:#fff;
  border-radius:calc(var(--r-scale,1)*44px);
  margin-top:40px;
  padding:36px 32px 40px;
  box-shadow:0 24px 56px -20px rgba(0,0,0,.55);
  overflow:hidden;
}

/* 제품 이미지 */
.dmhu-img-wrap{
  width:100%;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*24px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 6%,#f4f4f4);
  aspect-ratio:4/3;
}
.dmhu-img-wrap img,
.dmhu-img-wrap .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:inherit;
}
/* noimg-safe: 이미지 없으면 wrap 자체를 숨김 (ph가 display:none 이므로 빈 박스 잔존 방지) */
.dmhu-img-wrap:has(.ph){display:none}

/* 스와치 행 */
.dmhu-swatches{
  display:flex;
  justify-content:center;
  gap:12px;
  margin-top:28px;
  flex-wrap:wrap;
}
.dmhu-swatch{
  width:52px;
  height:52px;
  border-radius:50%;
  border:2.5px solid transparent;
  box-shadow:0 2px 6px rgba(0,0,0,.18);
  flex-shrink:0;
  position:relative;
  cursor:default;
  transition:transform .15s ease;
}
/* 선택된 스와치 — 외곽 링 */
.dmhu-swatch.sel{
  border-color:var(--accent);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent), 0 2px 8px rgba(0,0,0,.22);
}

/* 색상명 배지 + 설명 */
.dmhu-color-info{
  margin-top:22px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
}
.dmhu-badge{
  display:inline-block;
  background:var(--dmhu-badge-bg, var(--muted,#d9d9d9));
  color:var(--ink,#000);
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(18px,3vw,28px);
  letter-spacing:.04em;
  padding:10px 32px;
  border-radius:999px;
  line-height:1.2;
}
.dmhu-desc{
  font-family:var(--font-body);
  font-weight:500;
  font-size:clamp(14px,2vw,17px);
  color:var(--ink-2,#444);
  line-height:1.65;
  max-width:520px;
  text-align:center;
}
`,
  render: (d, { esc, richSafe }) => {
    // 선택된 스와치 — 기본은 첫 번째
    const selectedIdx = d.swatches.findIndex((s) => s.selected === true)
    const activeIdx = selectedIdx >= 0 ? selectedIdx : 0
    const active = d.swatches[activeIdx]

    const swatchDots = d.swatches
      .map(
        (s, i) =>
          `<span class="dmhu-swatch${i === activeIdx ? ' sel' : ''}" style="background:${esc(s.color)}" aria-label="${esc(s.name)}"></span>`,
      )
      .join('')

    // 배지 배경색: 슬롯 제공 시 인라인, 미제공 시 CSS 기본값 사용
    const badgeBgStyle = d.badgeColor
      ? ` style="background:${esc(d.badgeColor)}"`
      : ''

    return `
<section class="dmhu">
  ${d.eyebrow ? `<p class="dmhu-eyebrow">${richSafe(d.eyebrow)}</p>` : ''}
  <h2 class="dmhu-title">${richSafe(d.title)}</h2>
  ${d.titleSub ? `<p class="dmhu-title-sub">${richSafe(d.titleSub)}</p>` : ''}
  <div class="dmhu-card">
    <div class="dmhu-img-wrap">${media(d.image, '', '제품 색상 이미지')}</div>
    <div class="dmhu-swatches" role="list" aria-label="색상 선택">${swatchDots}</div>
    <div class="dmhu-color-info">
      <span class="dmhu-badge"${badgeBgStyle}>${esc(active.name)}</span>
      ${active.desc ? `<p class="dmhu-desc">${esc(active.desc)}</p>` : ''}
    </div>
  </div>
</section>`
  },
})
