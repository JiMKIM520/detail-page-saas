/** HERO 아키타입: hero-wave-icons
 *  원본: 234_인트로_43.json (인트로/43)
 *  구조: 전체폭 제품 사진 → 커스텀 물결 SVG로 배경색 전환 → 파스텔 배경에 태그라인+대제목+부제 →
 *        3열 원형 아이콘 배너(accent 채움) → 하단 포인트 색 텍스트 바.
 *  톤: light / noimg-safe (이미지 없으면 이미지 존 축소 유지, 물결은 항상 렌더)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const iconNameEnum = z.enum([
  'check', 'clock', 'drop', 'snow', 'thermometer', 'shield',
  'leaf', 'bolt', 'star', 'heart', 'badge', 'truck',
  'gift', 'trophy', 'thumb', 'fire', 'gear', 'target',
])

const schema = z.object({
  /** 상단 제품 이미지 URL — 없어도 레이아웃 유지 (noimg-safe) */
  image: z.string().optional(),
  /** 이미지 위 대체 배경색 토큰 override (기본: var(--accent)) — 이미지 없을 때 틴트 패널 색조 */
  imgFallbackColor: z.string().optional(),
  /** 제품명 위 짧은 태그라인 (em 허용) */
  tagline: z.string().optional(),
  /** 대형 제품 이름 (em, br 허용) */
  title: z.string().min(1),
  /** 제품명 아래 한 줄 부제 */
  subtitle: z.string().optional(),
  /** 원형 아이콘 배너 항목 2~3개 */
  icons: z
    .array(
      z.object({
        icon: iconNameEnum,
        label: z.string().min(1),   // 2줄 가능, \n으로 줄바꿈
      }),
    )
    .min(2)
    .max(3),
  /** 하단 포인트 바 텍스트 (em 허용) */
  barText: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const heroWaveIcons = defineBlock<Data>({
  id: 'hero-wave-icons',
  archetype: 'hero',
  styleTags: ['light', 'pastel', 'product', 'icon-banner', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '파스텔 배경 히어로. 전체폭 제품 사진 하단에 커스텀 물결 SVG로 배경색 전환 후 태그라인+대제목+부제 → 3열 원형 아이콘 배너(핵심 기능 3가지) → 하단 포인트 색 강조 바. 음료/주방/생활용품 제품 첫 화면에 적합.',
  schema,
  css: `
/* ── hero-wave-icons (haxz) ── */
.haxz{background:var(--bg);color:var(--ink);font-family:var(--font-body),'Pretendard',sans-serif}

/* 이미지 존 */
.haxz-img-zone{position:relative;width:100%;background:var(--accent);overflow:hidden}
.haxz-img-zone.noimg{min-height:120px;background:color-mix(in srgb,var(--accent) 18%,var(--bg))}
.haxz-img-zone .haxz-prod{width:100%;display:block;object-fit:cover;border-radius:0}
/* noimg-safe: 이미지 없으면 ph=display:none (baseCss .ph 전역 규칙) → 존 높이는 min-height로 유지 */

/* 물결 SVG — 이미지 존 하단에 고정, 배경색과 동일 fill로 겹쳐서 전환 처리 */
.haxz-wave{position:absolute;bottom:-1px;left:0;width:100%;display:block;line-height:0;pointer-events:none}
.haxz-wave svg{display:block;width:100%;height:auto}

/* 타이틀 영역 — 파스텔 배경(var(--bg))에 흰 텍스트 */
.haxz-body{background:var(--bg);text-align:center;padding:28px var(--pad-x,56px) 24px}
.haxz-tagline{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:500;font-size:22px;color:#fff;letter-spacing:.02em;margin-bottom:10px}
.haxz-tagline{text-shadow:0 1px 8px rgba(0,0,0,.4)}
.haxz-tagline .em{color:var(--em-dark,#FFF7EA)}
.haxz-title{font-family:'Pretendard',var(--font-display),sans-serif;font-weight:800;font-size:clamp(52px,8vw,96px);color:#fff;line-height:1.05;letter-spacing:-.02em;text-shadow:0 2px 14px rgba(0,0,0,.4)}
.haxz-title .em{color:var(--em-dark,#FFF7EA)}
.haxz-subtitle{margin-top:10px;font-family:'Pretendard',var(--font-body),sans-serif;font-weight:500;font-size:20px;color:var(--ink);opacity:.72;letter-spacing:.01em}

/* 원형 아이콘 배너 */
.haxz-icons{display:flex;justify-content:center;gap:0;padding:24px var(--pad-x,56px) 20px;background:var(--bg)}
.haxz-icon-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:14px;max-width:260px}
.haxz-circle{width:clamp(100px,14vw,160px);height:clamp(100px,14vw,160px);border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.haxz-circle svg{width:46%;height:46%;color:#fff;stroke:#fff;fill:none}
.haxz-circle svg[fill="currentColor"]{fill:#fff;stroke:none}
.haxz-icon-label{font-family:'Pretendard',var(--font-body),sans-serif;font-weight:600;font-size:clamp(14px,2vw,20px);color:var(--ink);text-align:center;line-height:1.45;white-space:pre-line;min-height:calc(1.45em * 2);padding-bottom:4px;overflow:visible}

/* 하단 포인트 바 */
.haxz-bar{background:var(--accent-d);padding:14px var(--pad-x,56px);text-align:center}
.haxz-bar-text{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:500;font-size:clamp(16px,2.2vw,24px);color:#f7f6ee;letter-spacing:.02em}
.haxz-bar-text .em{color:var(--em-dark,#FFF7EA);font-weight:700}

/* 다크(배경=accent) 영역 em 스코프 오버라이드 — richSafe 텍스트 대비 보장 */
.haxz .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    // 물결 SVG — fill은 인라인으로 var(--bg) 색에 매핑.
    // 실제 렌더 시 배경색과 동일한 색으로 물결 경계를 채워 seamless 전환.
    const waveSvg = `<div class="haxz-wave">
  <svg viewBox="0 0 860 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 30 C140 0 280 60 430 30 C580 0 720 60 860 30 L860 90 L0 90 Z" fill="var(--bg)"/>
  </svg>
</div>`

    const iconItems = d.icons
      .map(
        (item) => `
  <div class="haxz-icon-item">
    <div class="haxz-circle">${icon(item.icon)}</div>
    <span class="haxz-icon-label">${esc(item.label)}</span>
  </div>`,
      )
      .join('')

    return `
<section class="haxz">
  <div class="haxz-img-zone${hasImg ? '' : ' noimg'}">
    ${media(d.image, 'haxz-prod', '제품 이미지')}
    ${waveSvg}
  </div>
  <div class="haxz-body">
    ${d.tagline ? `<p class="haxz-tagline">${richSafe(d.tagline)}</p>` : ''}
    <h1 class="haxz-title">${richSafe(d.title)}</h1>
    ${d.subtitle ? `<p class="haxz-subtitle">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="haxz-icons">
    ${iconItems}
  </div>
  <div class="haxz-bar">
    <p class="haxz-bar-text">${richSafe(d.barText)}</p>
  </div>
</section>`
  },
})
