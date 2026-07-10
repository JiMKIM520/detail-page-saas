/** AWARD 아키타입: award-stage-burst
 *  출처: 128_어워드_구성_페이지_13.json
 *  어두운 스테이지 배경 + 중앙 원형 별빛 파티클 폭발 그래픽 + 좌우 대칭 트로피 실루엣 + 하단 꽃다발.
 *  수상·권위 강조 섹션. CSS 파티클(방사형 점) + 인라인 SVG 트로피/꽃다발 장식으로 구현.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  eyebrow: z.string().optional(),          // 상단 소형 라벨 (예: "수상 이력")
  title: z.string().min(1),               // 메인 어워드 헤드라인 (em,br)
  subtitle: z.string().optional(),         // 수상명/설명 한 줄 (em)
  awards: z
    .array(
      z.object({
        year: z.string().min(1),           // 연도 (예: "2024")
        name: z.string().min(1),           // 어워드명 (예: "소비자가 선택한 브랜드")
        category: z.string().optional(),   // 카테고리/부문 (브리프 근거 시만)
      }),
    )
    .min(1)
    .max(5),
  badge: z.string().optional(),            // 원형 배지 중앙 텍스트 (예: "NO.1")
  badgeSub: z.string().optional(),         // 배지 아래 소형 텍스트 (예: "연속 3년")
})
type Data = z.infer<typeof schema>

export const awardStageBurst = defineBlock<Data>({
  id: 'award-stage-burst',
  archetype: 'award',
  styleTags: ['dark', 'premium', 'luxury', 'award', 'celebration'],
  imageSlots: 0,
  describe:
    '시상식 무대 어워드 배경. 짙은 다크 배경 위 중앙 원형 파티클 폭발 그래픽(CSS+SVG) + 좌우 대칭 트로피 실루엣 SVG + 하단 꽃다발 SVG. 수상 이력·No.1 권위 강조에 최적. 이미지 없이 완전 CSS/SVG로 구성.',
  schema,
  css: `
/* ── afwk: award-stage-burst ────────────────────────────────── */
.afwk{
  position:relative;overflow:hidden;
  background:#16130d;
  padding:64px var(--pad-x,56px) 72px;
  text-align:center;
  min-height:520px
}
/* 다크 배경 richSafe 스코프 오버라이드 */
.afwk .em{color:var(--em-dark,#FFF7EA)}

/* 중앙 방사형 글로우 */
.afwk-glow{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);
  width:520px;height:520px;
  border-radius:50%;
  background:radial-gradient(ellipse at center,
    rgba(212,172,88,.22) 0%,
    rgba(180,140,60,.10) 32%,
    transparent 68%);
  pointer-events:none;z-index:0
}

/* 파티클 SVG 캔버스 (원형 방사 점들) */
.afwk-burst{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-52%);
  width:480px;height:480px;
  pointer-events:none;z-index:1;
  opacity:.9
}

/* 좌우 트로피 실루엣 */
.afwk-trophies{
  position:absolute;bottom:0;left:0;right:0;
  height:300px;
  pointer-events:none;z-index:2;
  display:flex;align-items:flex-end;justify-content:space-between
}
.afwk-trophy-l,.afwk-trophy-r{
  width:220px;height:280px;
  opacity:.82
}
.afwk-trophy-r{transform:scaleX(-1)}

/* 하단 꽃다발 */
.afwk-bouquets{
  position:absolute;bottom:0;left:0;right:0;
  height:110px;
  pointer-events:none;z-index:3;
  display:flex;align-items:flex-end;justify-content:space-between
}
.afwk-bouquet-l,.afwk-bouquet-r{
  width:130px;height:110px;
  opacity:.78
}
.afwk-bouquet-r{transform:scaleX(-1)}

/* 콘텐츠 레이어 */
.afwk-inner{position:relative;z-index:10}

/* 배지 원형 */
.afwk-badge{
  display:inline-flex;flex-direction:column;align-items:center;justify-content:center;
  width:112px;height:112px;
  border-radius:50%;
  border:2px solid rgba(212,172,88,.6);
  background:radial-gradient(ellipse at center,rgba(212,172,88,.18) 0%,transparent 70%);
  margin:0 auto 28px;
  box-shadow:0 0 28px rgba(212,172,88,.18),inset 0 0 16px rgba(212,172,88,.08)
}
.afwk-badge-main{
  font-family:var(--font-display);
  font-weight:800;
  font-size:28px;
  line-height:1;
  color:#D4AC58;
  letter-spacing:-.01em
}
.afwk-badge-sub{
  margin-top:4px;
  font-size:11px;
  font-weight:600;
  color:rgba(212,172,88,.72);
  letter-spacing:.06em
}

/* 눈썹 라벨 */
.afwk-eyebrow{
  display:inline-block;
  font-size:12px;
  font-weight:700;
  letter-spacing:.16em;
  color:rgba(212,172,88,.7);
  text-transform:uppercase;
  margin-bottom:16px
}

/* 메인 타이틀 */
.afwk-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:38px;
  line-height:1.22;
  letter-spacing:-.02em;
  color:#F5ECDF;
  margin-bottom:14px
}
.afwk-title .em{color:#D4AC58}

/* 부제 */
.afwk-subtitle{
  font-size:16px;
  font-weight:500;
  color:rgba(245,236,223,.62);
  line-height:1.6;
  margin-bottom:36px
}
.afwk-subtitle .em{color:rgba(212,172,88,.9)}

/* 어워드 목록 */
.afwk-list{
  display:flex;flex-direction:column;gap:10px;
  max-width:520px;margin:0 auto
}
.afwk-item{
  display:flex;align-items:center;gap:14px;
  background:rgba(245,236,223,.04);
  border:1px solid rgba(212,172,88,.18);
  border-radius:calc(var(--r-scale,1)*10px);
  padding:14px 20px;
  text-align:left
}
.afwk-year{
  flex:0 0 46px;
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-size:14px;
  font-weight:600;
  color:#D4AC58;
  letter-spacing:.04em
}
.afwk-divider{
  flex:0 0 1px;
  align-self:stretch;
  background:rgba(212,172,88,.25)
}
.afwk-name{
  flex:1;
  font-size:14px;
  font-weight:600;
  color:#F5ECDF;
  line-height:1.45
}
.afwk-category{
  font-size:11px;
  font-weight:500;
  color:rgba(212,172,88,.6);
  margin-top:3px;
  letter-spacing:.04em
}
/* ── /afwk ─────────────────────────────────────────────────── */
`,
  render: (d, { esc, richSafe }) => {
    // 파티클 점: 반지름 r에 N개의 점을 균등 분산, 크기·투명도 변주
    function burstDots(): string {
      const dots: string[] = []
      // 3개 링: 내부(r=80, 16개), 중간(r=140, 24개), 외부(r=200, 30개)
      const rings: [number, number, number, number][] = [
        [80, 16, 3.5, 0.72],
        [140, 24, 2.8, 0.55],
        [200, 30, 2.0, 0.38],
      ]
      rings.forEach(([r, count, dotR, opacity]) => {
        for (let i = 0; i < count; i++) {
          const angle = (2 * Math.PI * i) / count + (r === 140 ? Math.PI / count : 0)
          const cx = (240 + r * Math.cos(angle)).toFixed(1)
          const cy = (240 + r * Math.sin(angle)).toFixed(1)
          const jitter = dotR * (0.7 + 0.6 * ((i * 7) % 10) / 10)
          const op = (opacity * (0.6 + 0.4 * ((i * 3 + 1) % 7) / 7)).toFixed(2)
          // 4점 별 모양 (밝은 점) vs 원형 (나머지)
          if (i % 5 === 0) {
            const s = (jitter * 2.8).toFixed(1)
            dots.push(
              `<polygon points="${cx},${(parseFloat(cy) - parseFloat(s)).toFixed(1)} ${(parseFloat(cx) + parseFloat(s) * 0.3).toFixed(1)},${cy} ${cx},${(parseFloat(cy) + parseFloat(s)).toFixed(1)} ${(parseFloat(cx) - parseFloat(s) * 0.3).toFixed(1)},${cy}" fill="#D4AC58" opacity="${op}"/>`,
            )
          } else {
            dots.push(
              `<circle cx="${cx}" cy="${cy}" r="${jitter.toFixed(1)}" fill="#D4AC58" opacity="${op}"/>`,
            )
          }
        }
      })
      // 랜덤-느낌 산발 파티클 (황금 + 흰색 혼합)
      const scatter: [number, number, number, number, string][] = [
        [180, 110, 1.8, 0.5, '#FFF7EA'],
        [300, 95, 2.2, 0.45, '#D4AC58'],
        [155, 195, 1.5, 0.55, '#D4AC58'],
        [325, 190, 1.8, 0.48, '#FFF7EA'],
        [200, 310, 1.6, 0.42, '#D4AC58'],
        [280, 308, 2.0, 0.5, '#D4AC58'],
        [128, 250, 1.4, 0.38, '#FFF7EA'],
        [355, 248, 1.7, 0.4, '#FFF7EA'],
        [240, 68, 2.4, 0.6, '#D4AC58'],
        [240, 410, 2.1, 0.45, '#D4AC58'],
        [108, 320, 1.3, 0.35, '#FFF7EA'],
        [372, 320, 1.5, 0.38, '#FFF7EA'],
      ]
      scatter.forEach(([cx, cy, r, op, fill]) => {
        dots.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"/>`)
      })
      return dots.join('')
    }

    // 트로피 실루엣 SVG (모피 텍스처 느낌: 세로 스트로크 다발)
    const trophySvg = (side: 'l' | 'r') => {
      const flip = side === 'r' ? 'transform="scale(-1,1) translate(-220,0)"' : ''
      return `<svg viewBox="0 0 220 280" fill="none" xmlns="http://www.w3.org/2000/svg" ${flip}>
  <defs>
    <linearGradient id="afwk-tg-${side}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2a2218" stop-opacity="0"/>
      <stop offset="35%" stop-color="#8B6914" stop-opacity=".7"/>
      <stop offset="60%" stop-color="#C49A22" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#A07A10" stop-opacity=".4"/>
    </linearGradient>
    <linearGradient id="afwk-tg2-${side}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D4AC58" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#5C3E08" stop-opacity=".3"/>
    </linearGradient>
  </defs>
  <!-- 트로피 컵 외형 -->
  <path d="M60 40 Q55 20 70 12 Q95 4 110 8 Q130 4 148 12 Q165 20 160 40 L148 120 Q140 148 110 155 Q80 148 72 120 Z"
    fill="url(#afwk-tg2-${side})" opacity=".82"/>
  <!-- 모피 스트로크: 세로 선 다발 -->
  ${[0,6,12,18,24,30,36,42,48,54,60,66,72,78,84,90].map((x, i) => {
    const baseX = 62 + x
    const h = 60 + (i % 3) * 18 + (i % 5) * 8
    const op = (0.28 + (i % 4) * 0.09).toFixed(2)
    return `<line x1="${baseX}" y1="38" x2="${baseX - 2 + (i % 3)}" y2="${38 + h}" stroke="#C49A22" stroke-width="${0.8 + (i % 3) * 0.4}" opacity="${op}"/>`
  }).join('')}
  <!-- 받침 기둥 -->
  <rect x="100" y="154" width="20" height="48" rx="4" fill="#8B6914" opacity=".6"/>
  <!-- 베이스 -->
  <rect x="75" y="198" width="70" height="14" rx="calc(var(--r-scale,1)*5px)" fill="#A07A10" opacity=".7"/>
  <rect x="68" y="208" width="84" height="10" rx="calc(var(--r-scale,1)*4px)" fill="#8B6914" opacity=".5"/>
  <!-- 컵 손잡이 왼쪽 -->
  <path d="M60 58 Q38 62 36 84 Q36 108 60 110" stroke="#C49A22" stroke-width="3" stroke-linecap="round" fill="none" opacity=".55"/>
  <!-- 별 상단 -->
  <polygon points="110,4 113,14 124,14 115,20 118,30 110,24 102,30 105,20 96,14 107,14"
    fill="#D4AC58" opacity=".72"/>
</svg>`
    }

    // 꽃다발 SVG (간략화 — 꽃잎 원형 + 줄기)
    const bouquetSvg = (side: 'l' | 'r') => {
      const flip = side === 'r' ? 'transform="scale(-1,1) translate(-130,0)"' : ''
      return `<svg viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg" ${flip}>
  <defs>
    <radialGradient id="afwk-bg-${side}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C49A22" stop-opacity=".7"/>
      <stop offset="100%" stop-color="#5C3E08" stop-opacity=".1"/>
    </radialGradient>
  </defs>
  <!-- 줄기 다발 -->
  <line x1="45" y1="100" x2="38" y2="60" stroke="#4A6B2A" stroke-width="2" opacity=".5"/>
  <line x1="55" y1="100" x2="55" y2="55" stroke="#4A6B2A" stroke-width="2.2" opacity=".55"/>
  <line x1="65" y1="100" x2="72" y2="58" stroke="#4A6B2A" stroke-width="2" opacity=".5"/>
  <!-- 리본 -->
  <path d="M38 98 Q55 90 72 98 Q64 106 46 106 Z" fill="#C49A22" opacity=".55"/>
  <!-- 꽃 원형들 -->
  <circle cx="55" cy="52" r="16" fill="url(#afwk-bg-${side})" opacity=".72"/>
  <circle cx="35" cy="62" r="12" fill="#A07A10" opacity=".5"/>
  <circle cx="75" cy="60" r="13" fill="#B08820" opacity=".52"/>
  <circle cx="46" cy="42" r="10" fill="#C49A22" opacity=".42"/>
  <circle cx="64" cy="44" r="9" fill="#D4AC58" opacity=".38"/>
  <!-- 꽃잎 소형 점 -->
  ${[38,50,62,74,42,56,68].map((cx, i) => {
    const cy = 30 + (i % 3) * 12
    const r = 3.5 + (i % 2) * 2
    const op = (0.3 + (i % 3) * 0.1).toFixed(2)
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#D4AC58" opacity="${op}"/>`
  }).join('')}
</svg>`
    }

    return `
<section class="afwk">
  <!-- 중앙 방사형 글로우 -->
  <div class="afwk-glow"></div>

  <!-- 파티클 버스트 SVG -->
  <svg class="afwk-burst" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- 중심 글로우 링 -->
    <circle cx="240" cy="240" r="42" fill="none" stroke="#D4AC58" stroke-width="1.2" opacity=".28"/>
    <circle cx="240" cy="240" r="28" fill="rgba(212,172,88,.08)"/>
    <circle cx="240" cy="240" r="16" fill="rgba(212,172,88,.14)"/>
    ${burstDots()}
    <!-- 방사선 라인 8방향 -->
    ${[0,45,90,135,180,225,270,315].map((deg, i) => {
      const rad = (deg * Math.PI) / 180
      const x1 = (240 + 48 * Math.cos(rad)).toFixed(1)
      const y1 = (240 + 48 * Math.sin(rad)).toFixed(1)
      const x2 = (240 + 192 * Math.cos(rad)).toFixed(1)
      const y2 = (240 + 192 * Math.sin(rad)).toFixed(1)
      const op = (0.14 + (i % 3) * 0.06).toFixed(2)
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#D4AC58" stroke-width="0.8" opacity="${op}"/>`
    }).join('')}
  </svg>

  <!-- 트로피 실루엣 -->
  <div class="afwk-trophies" aria-hidden="true">
    ${trophySvg('l')}
    ${trophySvg('r')}
  </div>

  <!-- 꽃다발 -->
  <div class="afwk-bouquets" aria-hidden="true">
    ${bouquetSvg('l')}
    ${bouquetSvg('r')}
  </div>

  <!-- 콘텐츠 -->
  <div class="afwk-inner">
    ${d.eyebrow ? `<p class="afwk-eyebrow">${esc(d.eyebrow)}</p>` : ''}

    ${(d.badge || d.badgeSub) ? `
    <div class="afwk-badge" aria-label="${esc(d.badge ?? '')}">
      ${d.badge ? `<span class="afwk-badge-main">${esc(d.badge)}</span>` : ''}
      ${d.badgeSub ? `<span class="afwk-badge-sub">${esc(d.badgeSub)}</span>` : ''}
    </div>` : ''}

    <h2 class="afwk-title">${richSafe(d.title)}</h2>

    ${d.subtitle ? `<p class="afwk-subtitle">${richSafe(d.subtitle)}</p>` : ''}

    <ul class="afwk-list" role="list">
      ${d.awards.map(a => `
      <li class="afwk-item">
        <span class="afwk-year">${esc(a.year)}</span>
        <span class="afwk-divider" aria-hidden="true"></span>
        <span class="afwk-name">
          ${esc(a.name)}
          ${a.category ? `<span class="afwk-category">${esc(a.category)}</span>` : ''}
        </span>
      </li>`).join('')}
    </ul>
  </div>
</section>`
  },
})
