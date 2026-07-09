/** HERO 아키타입: hero-stamp-grid
 *  피그마 077_인트로_36 흡수 재구성.
 *  구조: 상단 풀블리드 제품사진(텍스트 오버레이 + 별형 공식판매처 스탬프 배지) +
 *        중단 타이틀 블록(영문 라벨·브랜드명·서브카피) +
 *        하단 2행×3열 아이콘 피처 그리드.
 *  톤: dark (다크 웜 브라운 배경). noimg-safe: 이미지 부재 시 사진 프레임을 브랜드색 틴트 패널로 강등.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const featureSchema = z.object({
  icon: z.string().min(1),      // SVG inline string 또는 ctx.icon() 이름 — 렌더에서 직접 사용
  label: z.string().min(1),    // 2줄 이내 한국어 라벨 (순수 텍스트)
})

const schema = z.object({
  /** 제품 이미지 URL (optional — 없으면 노이미지 강등) */
  image: z.string().optional(),
  /** 사진 위 대형 오버레이 카피 (em 허용) */
  overlayCopy: z.string().min(1),
  /** 배지 중앙 1행 (공식판매처명 등, 순수 텍스트) */
  badgeLine1: z.string().min(1),
  /** 배지 중앙 2행 (순수 텍스트) */
  badgeLine2: z.string().min(1),
  /** 배지 원호 회전 텍스트 (반복되는 짧은 영문/한글 문구) */
  badgeArc: z.string().min(1),
  /** 영문 서브 라벨 (ExtraLight 스타일, 선택적) */
  labelLat: z.string().optional(),
  /** 브랜드/제품명 대제목 (em 허용) */
  title: z.string().min(1),
  /** 제품 서브카피 (순수 텍스트, 선택적) */
  subtitle: z.string().optional(),
  /** 피처 그리드 (2행×3열 = 정확히 6개) */
  features: z.array(featureSchema).length(6),
})
type Data = z.infer<typeof schema>

export const heroStampGrid = defineBlock<Data>({
  id: 'hero-stamp-grid',
  archetype: 'hero',
  styleTags: ['dark', 'premium', 'travel', 'lifestyle', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크 웜 배경 히어로. 상단 제품 사진 위에 대형 오버레이 카피 + 별형 원호회전 공식판매처 스탬프 배지. 중단 브랜드 대제목 + 영문 라벨 + 서브카피. 하단 2행×3열 아이콘 피처 그리드(세로선 구분). 여행·가전·프리미엄 소비재에 적합.',
  schema,
  css: `
/* ── hero-stamp-grid (hsvr) ─────────────────────────────────────── */
.hsvr{background:var(--brand);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif}
/* dark 배경 em 오버라이드 */
.hsvr .em{color:var(--em-dark,#FFF7EA)}

/* 1. 사진 영역 */
.hsvr-photo-wrap{position:relative;width:100%;aspect-ratio:760/974;overflow:hidden;background:color-mix(in srgb,var(--brand) 60%,#2a2a2a)}
.hsvr-photo-wrap img,.hsvr-photo-wrap .ph{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0%);display:block}
/* noimg-safe: .ph는 baseCss가 display:none!important — 여기서 명시 override */
.hsvr-photo-wrap .ph{display:block!important;background:color-mix(in srgb,var(--brand) 55%,#1a1512);opacity:1}

/* 오버레이 카피 */
.hsvr-overlay{position:absolute;top:0;left:0;right:0;bottom:0;padding:40px var(--pad-x,56px);display:flex;flex-direction:column;justify-content:flex-start;pointer-events:none}
.hsvr-overlay-copy{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:300;font-size:clamp(48px,8.5vw,80px);line-height:1.15;color:#fff;max-width:55%}
.hsvr-overlay-copy .em{color:var(--em-dark,#FFF7EA)}

/* 스탬프 배지 */
.hsvr-stamp{position:absolute;top:30px;right:calc(var(--pad-x,56px) - 10px);width:clamp(160px,22%,220px);height:clamp(160px,22%,220px);display:flex;align-items:center;justify-content:center}
/* 별형(8각 뾰족 서클): CSS clip-path로 구현 — 벡터 클론 금지 */
.hsvr-stamp-star{position:absolute;inset:0;background:conic-gradient(from 0deg,
  color-mix(in srgb,var(--accent) 80%,#c8a96a) 0%,
  color-mix(in srgb,var(--accent-d) 90%,#8a6030) 50%,
  color-mix(in srgb,var(--accent) 80%,#c8a96a) 100%
);clip-path:polygon(
  50% 0%,58% 16%,75% 7%,72% 26%,93% 26%,82% 41%,100% 50%,
  82% 59%,93% 74%,72% 74%,75% 93%,58% 84%,50% 100%,
  42% 84%,25% 93%,28% 74%,7% 74%,18% 59%,0% 50%,
  18% 41%,7% 26%,28% 26%,25% 7%,42% 16%
);border-radius:0}
/* 내부 원 */
.hsvr-stamp-inner{position:absolute;inset:18%;background:color-mix(in srgb,var(--accent-d) 95%,#111);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
.hsvr-stamp-l1,.hsvr-stamp-l2{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:clamp(11px,1.6vw,15px);color:#1a1512;line-height:1.25;text-align:center}
/* 회전 원호 텍스트 (SVG textPath) */
.hsvr-stamp-arc{position:absolute;inset:0;animation:hsvr-spin 14s linear infinite;transform-origin:center}
@keyframes hsvr-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.hsvr-stamp-arc text{font-size:9.5px;font-family:var(--font-lat),'Cormorant Garamond',serif;fill:#1a1512;font-weight:700;letter-spacing:3.5px;text-transform:uppercase}

/* 2. 타이틀 블록 */
.hsvr-title-block{padding:44px var(--pad-x,56px) 36px;background:var(--brand)}
.hsvr-label-lat{font-family:var(--font-lat),'Cormorant Garamond',serif;font-weight:300;font-size:clamp(20px,2.8vw,34px);color:rgba(255,255,255,.5);letter-spacing:.04em;margin-bottom:10px;display:block}
.hsvr-brand-name{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:clamp(42px,7vw,80px);line-height:1.08;color:#fff;letter-spacing:-.02em}
.hsvr-brand-name .em{color:var(--em-dark,#FFF7EA)}
.hsvr-subtitle{margin-top:18px;font-size:clamp(16px,2.5vw,36px);font-weight:400;color:rgba(255,255,255,.6);line-height:1.55;font-family:var(--font-body),'Pretendard',sans-serif}

/* 3. 피처 그리드 (2행×3열) */
.hsvr-grid{padding:4px 0 54px;background:var(--brand)}
.hsvr-grid-row{display:flex;align-items:flex-start}
.hsvr-grid-divider{width:100%;height:1px;background:rgba(255,255,255,.18);margin:0 var(--pad-x,56px)}
.hsvr-cell{flex:1;display:flex;flex-direction:column;align-items:center;padding:32px 12px 16px;position:relative;gap:16px}
/* 세로 구분선 */
.hsvr-cell:not(:last-child)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:rgba(255,255,255,.18)}
.hsvr-icon{width:clamp(44px,7vw,80px);height:clamp(44px,7vw,80px);color:#fff;flex-shrink:0}
.hsvr-icon svg{width:100%;height:100%;stroke:currentColor}
.hsvr-feat-label{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:600;font-size:clamp(13px,1.8vw,28px);color:#fff;text-align:center;line-height:1.4;word-break:keep-all}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 배지 원호 — textPath 기준원 r=45 → 둘레≈283px, 문자수×letter-spacing(12.5px) 예산 ≈ 22자
    // 브리프 없이 고정값; arcText가 길면 CSS letter-spacing이 줄어 자동 조정됨
    const arcText = esc(d.badgeArc)

    const cells = d.features.map((f, i) => `
      <div class="hsvr-cell">
        <span class="hsvr-icon" aria-hidden="true">${icon(f.icon)}</span>
        <span class="hsvr-feat-label">${esc(f.label)}</span>
      </div>${i < d.features.length - 1 ? '' : ''}`)

    const row1 = cells.slice(0, 3).join('')
    const row2 = cells.slice(3, 6).join('')

    return `
<section class="hsvr">

  <!-- 1. 사진 영역 -->
  <div class="hsvr-photo-wrap">
    ${media(d.image, 'hsvr-photo', '제품 사진')}

    <!-- 오버레이 카피 -->
    <div class="hsvr-overlay">
      <p class="hsvr-overlay-copy">${richSafe(d.overlayCopy)}</p>
    </div>

    <!-- 공식판매처 스탬프 배지 -->
    <div class="hsvr-stamp" aria-label="${esc(d.badgeLine1)} ${esc(d.badgeLine2)}">
      <div class="hsvr-stamp-star"></div>
      <div class="hsvr-stamp-inner">
        <span class="hsvr-stamp-l1">${esc(d.badgeLine1)}</span>
        <span class="hsvr-stamp-l2">${esc(d.badgeLine2)}</span>
      </div>
      <!-- 원호 회전 텍스트 -->
      <svg class="hsvr-stamp-arc" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id="hsvr-arc-path" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"/>
        </defs>
        <text>
          <textPath href="#hsvr-arc-path" startOffset="0%">${arcText}</textPath>
        </text>
      </svg>
    </div>
  </div>

  <!-- 2. 타이틀 블록 -->
  <div class="hsvr-title-block">
    ${d.labelLat ? `<span class="hsvr-label-lat">${esc(d.labelLat)}</span>` : ''}
    <h1 class="hsvr-brand-name">${richSafe(d.title)}</h1>
    ${d.subtitle ? `<p class="hsvr-subtitle">${esc(d.subtitle)}</p>` : ''}
  </div>

  <!-- 3. 피처 그리드 -->
  <div class="hsvr-grid">
    <div class="hsvr-grid-row">${row1}</div>
    <div class="hsvr-grid-divider"></div>
    <div class="hsvr-grid-row">${row2}</div>
  </div>

</section>`
  },
})
