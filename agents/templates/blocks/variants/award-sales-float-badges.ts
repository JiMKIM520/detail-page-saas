/** AWARD 아키타입: award-sales-float-badges.
 *  035_포인트_구성_페이지_6 패턴을 토큰 기반으로 재구성(클론 아님).
 *
 *  시그니처:
 *   - 검정 배경 + 상단 중앙 제품명(gold 틴트) + 그라디언트 "N개 판매 돌파" 초대형 헤드라인
 *   - 헤드라인 좌우 인라인 SVG 플래시 장식 벡터
 *   - 중앙 제품 이미지(1~3컷) 가로 배치 — 이미지 없으면 강등(noimg-safe)
 *   - 오른쪽 플로팅 영역: 메달/트로피 스타일 수상 배지 CSS 일러스트 2개
 *   - 하단 수상 이력 리스트(2~6줄) + 좌우 장식 SVG 버티컬 라인
 *   - 다크 영역 .em → --em-dark 오버라이드 필수
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  productName: z.string().min(1),           // 제품명 (em 허용)
  milestoneText: z.string().min(1),         // "N개 판매 돌파" 등 그라디언트 강조 문구 (em,br)
  image1: z.string().optional(),            // 제품 이미지 1 (url)
  image2: z.string().optional(),            // 제품 이미지 2 (url) — 선택
  image3: z.string().optional(),            // 제품 이미지 3 (url) — 선택
  badge1Label: z.string().optional(),       // 수상 배지 1 대표 문구 (예: "BEST SELLER")
  badge1Sub: z.string().optional(),         // 수상 배지 1 부제 (예: "2024")
  badge2Label: z.string().optional(),       // 수상 배지 2 대표 문구 (예: "NO.1")
  badge2Sub: z.string().optional(),         // 수상 배지 2 부제 (예: "AWARD")
  awards: z
    .array(z.string().min(1))
    .min(2)
    .max(6),                                // 수상 이력 텍스트 리스트 (em 허용)
  starCount: z.number().int().min(3).max(7).optional(), // 헤더 장식 별 개수 (기본 5)
})
type Data = z.infer<typeof schema>

export const awardSalesFloatBadges = defineBlock<Data>({
  id: 'award-sales-float-badges',
  archetype: 'award',
  styleTags: ['dark', 'premium', 'gradient', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '판매 돌파+수상 실적 강조 다크 블록. 검정 배경 + 제품명/그라디언트 판매수량 돌파 헤드라인 + 제품 이미지 1~3컷(없으면 강등) + 우측 플로팅 CSS 수상 배지 2종 + 하단 수상 이력 리스트. 뷰티/식품/생활용품 수상 인증 섹션.',
  schema,
  css: `
/* ── 래퍼 ── */
.asfb{
  position:relative;
  background:#000;
  color:#fff;
  padding:64px var(--pad-x,56px) 56px;
  overflow:hidden;
  text-align:center;
}
.asfb .em{color:var(--em-dark,#FFF7EA)}

/* ── 배경 그라디언트 패널(하단 보강) ── */
.asfb-bg-glow{
  position:absolute;
  bottom:0;left:0;right:0;
  height:55%;
  background:linear-gradient(to top, color-mix(in srgb,var(--accent) 18%,transparent), transparent);
  pointer-events:none;
}

/* ── 헤더 영역 ── */
.asfb-header{
  position:relative;
  z-index:2;
  margin-bottom:32px;
}
.asfb-stars{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:6px;
  margin-bottom:14px;
}
.asfb-stars svg{
  width:20px;height:20px;
  fill:var(--accent);
  flex-shrink:0;
}
.asfb-stars svg.lg{width:28px;height:28px}
.asfb-product-name{
  font-family:var(--font-display);
  font-weight:400;
  font-size:18px;
  letter-spacing:.1em;
  color:#fff4b3;
  margin-bottom:8px;
}
.asfb-milestone{
  position:relative;
  display:inline-block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,8vw,80px);
  line-height:1.05;
  background:linear-gradient(135deg, var(--accent) 0%, #fffbe0 45%, var(--accent) 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  letter-spacing:-.02em;
}
/* 플래시 장식 — 헤드라인 좌우 */
.asfb-flash{
  display:inline-flex;
  vertical-align:middle;
  margin:0 8px;
  opacity:.85;
}
.asfb-flash svg{width:36px;height:56px;fill:var(--accent)}

/* ── 제품 이미지+배지 래퍼 ── */
.asfb-imgs-wrap{
  position:relative;
  z-index:2;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:16px;
  margin:0 auto 36px;
  max-width:760px;
  overflow:hidden;
}
/* ── 제품 이미지 행 ── */
.asfb-imgs{
  display:flex;
  justify-content:center;
  align-items:flex-end;
  gap:12px;
  flex-shrink:0;
}
.asfb-imgs img,
.asfb-imgs .ph{
  width:180px;height:180px;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));
  box-shadow:0 16px 40px -12px rgba(0,0,0,.7);
  flex-shrink:0;
}
/* 중앙 이미지는 크게 */
.asfb-imgs img:nth-child(2),
.asfb-imgs .ph:nth-child(2){
  width:220px;height:220px;
}
/* noimg-safe 강등: 이미지 없으면 래퍼가 배지만 중앙 배치 */
.asfb-imgs:empty{display:none}
.asfb-imgs-wrap:not(:has(.asfb-imgs *)) .asfb-badges-col{margin:0 auto}

/* ── 플로팅 배지 블록(이미지 행 우측 인라인) ── */
.asfb-badges-col{
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:20px;
  z-index:3;
  flex-shrink:0;
}
/* CSS 트로피/메달 배지 공통 */
.asfb-badge{
  width:90px;
  background:linear-gradient(145deg,#c9a84c,#f0d060,#a07830);
  border-radius:50% 50% 40% 40%;
  aspect-ratio:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  box-shadow:0 6px 24px -6px rgba(180,140,30,.7), inset 0 2px 4px rgba(255,255,220,.4);
  border:2px solid rgba(255,240,160,.35);
  padding:10px 6px 8px;
  text-align:center;
}
.asfb-badge-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:11px;
  color:#1a1200;
  line-height:1.2;
  letter-spacing:.06em;
  word-break:break-all;
}
.asfb-badge-sub{
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-weight:600;
  font-size:9px;
  color:#3d2900;
  letter-spacing:.1em;
  margin-top:2px;
}
/* 배지 안 미니 트로피 SVG */
.asfb-badge svg{
  width:24px;height:24px;
  stroke:#1a1200;
  fill:none;
  flex-shrink:0;
  margin-bottom:3px;
}

/* ── 수상 이력 리스트 ── */
.asfb-award-section{
  position:relative;
  z-index:2;
  display:inline-flex;
  align-items:stretch;
  gap:16px;
  max-width:640px;
  margin:0 auto;
}
.asfb-award-deco{
  flex-shrink:0;
  display:flex;
  align-items:center;
}
.asfb-award-deco svg{
  width:16px;
  height:100%;
  stroke:#fff;
  stroke-width:1.4;
  fill:none;
  opacity:.45;
}
.asfb-award-list{
  list-style:none;
  text-align:left;
}
.asfb-award-list li{
  font-size:16px;
  font-weight:400;
  color:#fff;
  line-height:1.75;
  letter-spacing:.01em;
}
.asfb-award-list li .em{color:var(--em-dark,#FFF7EA);font-weight:600}
`,
  render: (d, { esc, richSafe, icon }) => {
    const stars = d.starCount ?? 5
    const mid = Math.floor(stars / 2)

    // 별 행 — 중앙이 가장 큼
    const starRow = Array.from({ length: stars }, (_, i) => {
      const isCenter = i === mid
      return `<svg class="${isCenter ? 'lg' : ''}" viewBox="0 0 24 24"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>`
    }).join('')

    // 플래시 벡터 SVG (좌우 동일, 우측은 반전)
    const flash = `<span class="asfb-flash"><svg viewBox="0 0 36 56"><path d="M18 0 L36 28 L22 28 L22 56 L0 28 L14 28 Z"/></svg></span>`
    const flashR = `<span class="asfb-flash" style="transform:scaleX(-1)"><svg viewBox="0 0 36 56"><path d="M18 0 L36 28 L22 28 L22 56 L0 28 L14 28 Z"/></svg></span>`

    // 이미지 렌더 — 있는 것만 (noimg-safe: 전부 없으면 .asfb-imgs가 비어 display:none)
    const imgs = [d.image1, d.image2, d.image3]
      .map((url) => (url ? media(url, 'asfb-img', '제품 이미지') : null))
      .filter(Boolean)
    const imgBlock = imgs.length > 0
      ? `<div class="asfb-imgs">${imgs.join('')}</div>`
      : ''

    // 배지 렌더 헬퍼
    const badgeSvg = icon('trophy')
    const renderBadge = (label?: string, sub?: string) => {
      if (!label) return ''
      return `
<div class="asfb-badge">
  ${badgeSvg}
  <span class="asfb-badge-label">${esc(label)}</span>
  ${sub ? `<span class="asfb-badge-sub">${esc(sub)}</span>` : ''}
</div>`
    }

    const hasBadge = d.badge1Label || d.badge2Label
    const badgesCol = hasBadge
      ? `<div class="asfb-badges-col">
  ${renderBadge(d.badge1Label, d.badge1Sub)}
  ${renderBadge(d.badge2Label, d.badge2Sub)}
</div>`
      : ''

    // 수상 이력 데코 SVG (수직 물결선)
    const decoSvg = `<svg viewBox="0 0 16 120" preserveAspectRatio="none"><path d="M8 0 Q12 20 8 40 Q4 60 8 80 Q12 100 8 120" stroke-dasharray="4 3"/></svg>`

    const awardItems = d.awards
      .map((a) => `<li>${richSafe(a)}</li>`)
      .join('')

    return `
<section class="asfb">
  <div class="asfb-bg-glow"></div>

  <div class="asfb-header">
    <div class="asfb-stars">${starRow}</div>
    <p class="asfb-product-name">${richSafe(d.productName)}</p>
    <div>
      ${flash}
      <span class="asfb-milestone">${richSafe(d.milestoneText)}</span>
      ${flashR}
    </div>
  </div>

  <div class="asfb-imgs-wrap">
    ${imgBlock}
    ${badgesCol}
  </div>

  <div class="asfb-award-section">
    <div class="asfb-award-deco">${decoSvg}</div>
    <ul class="asfb-award-list">${awardItems}</ul>
    <div class="asfb-award-deco" style="transform:scaleX(-1)">${decoSvg}</div>
  </div>
</section>`
  },
})
