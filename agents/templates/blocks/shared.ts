/**
 * 블록 시스템 공유 유틸 — escape, 아이콘, 폰트 링크, 베이스 CSS, RenderCtx 생성.
 */
import type { RenderCtx, Tokens } from './types'

/**
 * HTML 특수문자 이스케이프 (XSS 차단 기본) + 강조/줄바꿈 화이트리스트.
 * 텍스트 슬롯 전반에서 <span class="em">…</span> / <br> 만 복원하고 나머지 태그는 이스케이프 유지.
 * → (em)/(br) 계약 필드가 어느 variant에서 esc로 렌더되더라도 리터럴 태그 노출을 원천 차단.
 *   (속성값 렌더에는 span/br이 들어오지 않으므로 무해.)
 */
export const esc = (s: string | undefined): string => {
  // 큰따옴표도 이스케이프 — src/alt 등 속성 컨텍스트에서 attribute breakout(따옴표 탈출) 원천 차단
  let out = (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  out = out.replace(/&lt;br\s*\/?&gt;/g, '<br>')
  out = out.replace(/&lt;span class=&quot;em&quot;&gt;([\s\S]*?)&lt;\/span&gt;/g, (_m, inner) =>
    inner.trim() ? `<span class="em">${inner}</span>` : inner,
  )
  // 고아 태그 제거 — LLM이 짝 없는 여분 태그를 출력해도 화면에 노출되지 않게
  out = out.replace(/&lt;\/?span[^&]*&gt;/g, '')
  return out
}

/**
 * 제한 화이트리스트(<br>, <span class="em">)만 허용하고 나머지는 이스케이프.
 * 헤드라인 줄바꿈·강조에만 사용 (LLM raw 출력 직접 삽입 금지).
 */
export function richSafe(s: string | undefined): string {
  // esc()가 이스케이프+<br>/<span class="em"> 화이트리스트 복원+고아태그 제거를 모두 수행 — 동일 동작 위임
  return esc(s)
}

/**
 * 속성값 전용 이스케이프 — 화이트리스트 복원 없음(속성 안에서 따옴표/태그가 살아나면 attribute breakout).
 * 태그 유사 문자열은 제거해 alt 등에 깨끗한 텍스트만 남긴다.
 */
export const attr = (s: string | undefined): string =>
  (s ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** CSS 값 주입 방어 — <style> 탈출 문자 제거. 색(hex)·폰트('A', sans-serif) 값엔 영향 없음. */
export const cssSafe = (v: string | undefined): string => (v ?? '').replace(/[<>{}\\]/g, '')

/** 인라인 SVG 라인 아이콘 (stroke=currentColor). 변형에서 ctx.icon('name')으로 사용. */
const ICONS: Record<string, string> = {
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  wheat:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M12 7c-2-2-5-1-5-1s0 3 2 4M12 7c2-2 5-1 5-1s0 3-2 4M12 12c-2-2-5-1-5-1s0 3 2 4M12 12c2-2 5-1 5-1s0 3-2 4"/></svg>',
  drop:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-4 4-6 7-6 10a6 6 0 0 0 12 0c0-3-2-6-6-10z"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  badge:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="6"/><path d="M9 15l-2 6 5-3 5 3-2-6"/><path d="M9.5 10l1.7 1.7L15 8.5"/></svg>',
  snow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11a5 5 0 1 1 10 0a3 3 0 0 1 0 6H7a3 3 0 0 1 0-6z"/><path d="M9 17v3M12 17v3M15 17v3"/></svg>',
  fryer:
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="10" width="36" height="40" rx="9"/><circle cx="32" cy="26" r="9"/><path d="M28 26h8"/><rect x="20" y="50" width="24" height="6" rx="3"/></svg>',
  oven:
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="12" width="44" height="40" rx="6"/><path d="M10 24h44"/><circle cx="18" cy="18" r="1.6" fill="currentColor"/><circle cx="26" cy="18" r="1.6" fill="currentColor"/><rect x="18" y="30" width="28" height="16" rx="3"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20C12 20 4 15 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/></svg>',
  gift:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="11" width="15" height="9" rx="1"/><path d="M3.5 8.5h17v2.5h-17z"/><path d="M12 8.5V20"/><path d="M12 8.5C10.5 8.5 8 8 8 6.3 8 5.2 9 4.7 9.8 5.2c1 .6 2.2 2.2 2.2 3.3zM12 8.5c1.5 0 4-.5 4-2.2 0-1.1-1-1.6-1.8-1.1-1 .6-2.2 2.2-2.2 3.3z"/></svg>',
  truck:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3z"/><path d="M14 10h3.5l3 3v3H14z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17.5" cy="18" r="1.7"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  leaf:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-15 14z"/><path d="M5 19C9 13 13 11 17 9"/></svg>',
  trophy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 14v3M8.5 20h7M9.5 20c0-1.5.8-2.5 2.5-2.5s2.5 1 2.5 2.5"/></svg>',
  thumb:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v10H4V10z"/><path d="M7 10l4.5-6.5c1.2 0 2.2 1 2.2 2.2V9h4.6a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17 19H7"/></svg>',
  fire:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 3.5 5 6 5 9.5A5 5 0 0 1 7 12.5c0-1.5.6-2.8 1.5-4 .3 1 1 1.7 1.8 1.5C11 9.5 10 6.5 12 3z"/></svg>',
  person:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7.5" r="3.8"/><path d="M5 20c0-3.9 3.1-6.6 7-6.6s7 2.7 7 6.6"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20.5 20.5l-4.2-4.2"/></svg>',
  pin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  box:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>',
  card:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
  won:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M7.3 9l1.9 6 2.8-6 2.8 6 1.9-6"/><path d="M6.5 11.4h11M6.5 13.6h11"/></svg>',
  bulb:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.7.6 1.1 1.4 1.2 2.4h5.2c.1-1 .5-1.8 1.2-2.4A6 6 0 0 0 12 3z"/></svg>',
  gear:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.1 5.1l2.1 2.1M16.8 16.8l2.1 2.1M18.9 5.1l-2.1 2.1M7.2 16.8l-2.1 2.1"/></svg>',
  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7l1.3-2.5h4.4L15.5 7"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/></svg>',
  bolt:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L5 13.5h5.5L9 22l9-12h-6z"/></svg>',
  thermometer:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.8V6a2 2 0 1 0-4 0v8.8a4 4 0 1 0 4 0z"/><path d="M12 9v5.6"/></svg>',
  target:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
  store:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9l1.4-4.5h14.2L20.5 9M4.5 9.5V20h15V9.5M4 9.5h16"/><path d="M9.5 20v-5.5h5V20"/></svg>',
  doc:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3h7l4.5 4.5V21H6.5z"/><path d="M13 3v5h5M9.5 12.5h6M9.5 16h6"/></svg>',
  sprout:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-7.5"/><path d="M12 13.5C12 10.5 9.8 8.3 6.8 8.3c0 3 2.2 5.2 5.2 5.2z"/><path d="M12 13.5c0-3 2.2-5.2 5.2-5.2 0 3-2.2 5.2-5.2 5.2z"/></svg>',
  bell:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5h12l-1.6-2.2V10a4.4 4.4 0 0 0-8.8 0v4.3z"/><path d="M10.2 19.2a2 2 0 0 0 3.6 0"/></svg>',
}

export function getIcon(name: string): string {
  return ICONS[name] ?? ICONS.check
}

/** 사용 가능한 아이콘 이름 — 변형 스키마 z.enum 검증의 단일 출처(미검증 문자열 → getIcon silent fallback 방지). */
export const ICON_NAMES = [
  'wheat', 'drop', 'clock', 'badge', 'snow', 'check', 'fryer', 'oven', 'star',
  'heart', 'gift', 'truck', 'shield', 'leaf', 'trophy', 'thumb', 'fire',
  // 와디즈 아이콘팩(라인) 큐레이션 흡수 (자체 SVG)
  'person', 'search', 'pin', 'box', 'calendar', 'card', 'won', 'bulb', 'gear',
  'camera', 'phone', 'bolt', 'thermometer', 'target', 'store', 'doc', 'sprout', 'bell',
] as const

/** <head>에 로드할 웹폰트 링크. 모든 변형이 이 폰트들을 쓸 수 있다. */
export const FONT_LINKS: string = [
  '<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gaegu:wght@700&family=Gowun+Batang:wght@400;700&family=Cormorant+Garamond:wght@500;600&display=swap" rel="stylesheet">',
  // 와디즈 200섹션 템플릿 시그니처 폰트 (Paperlogy / Cafe24 ClassicType / Cafe24 Dangdanghae)
  `<style>
@font-face{font-family:'Paperlogy';font-weight:400;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy-4Regular.woff2') format('woff2')}
@font-face{font-family:'Paperlogy';font-weight:500;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy-5Medium.woff2') format('woff2')}
@font-face{font-family:'Paperlogy';font-weight:700;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy-7Bold.woff2') format('woff2')}
@font-face{font-family:'Paperlogy';font-weight:800;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy-8ExtraBold.woff2') format('woff2')}
@font-face{font-family:'Cafe24 ClassicType';font-weight:400;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/fonts-archive/Cafe24ClassicType/Cafe24ClassicType.woff2') format('woff2')}
@font-face{font-family:'Cafe24 Dangdanghae';font-weight:400;font-display:swap;src:url('https://cdn.jsdelivr.net/gh/fonts-archive/Cafe24Dangdanghae/Cafe24Dangdanghae.woff2') format('woff2')}
</style>`,
].join('\n')

/** 토큰 → :root CSS 변수 + 리셋 + 페이지 + 공유 유틸리티(워터마크/라벨/디스플레이). composer가 1회 주입. */
export function baseCss(tokens: Tokens, width: number): string {
  const t = { ...tokens }
  for (const k of Object.keys(t) as (keyof Tokens)[]) t[k] = cssSafe(t[k])
  return `
:root{
  --bg:${t.bg}; --paper:${t.paper}; --ink:${t.ink}; --ink-2:${t.ink2};
  --muted:${t.muted}; --accent:${t.accent}; --accent-d:${t.accentDark};
  --brand:${t.brand}; --line:${t.line};
  --font-display:${t.fontDisplay}; --font-body:${t.fontBody};
  --font-serif:${t.fontSerif}; --font-hand:${t.fontHand};
  --font-lat:'Cormorant Garamond',serif;
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body),'Pretendard',sans-serif;color:var(--ink);background:#cfc6ba;-webkit-font-smoothing:antialiased}
.dpg{width:${width}px;margin:0 auto;background:var(--bg);overflow:hidden;word-break:keep-all;overflow-wrap:break-word;font-synthesis:none}
.dpg img{display:block}
.disp{font-family:var(--font-display);font-weight:400;letter-spacing:-.01em;line-height:1.14}
.serif{font-family:var(--font-serif)}
.lat{font-family:var(--font-lat)}
.hand{font-family:var(--font-hand)}
.acc,.em{color:var(--accent-d)}
/* 빈 미디어 슬롯 — 어떤 변형의 .ph 오버라이드보다 우선(!important)해 '미완성 점선 박스'를 은은한 틴트 패널로 통일 */
.ph{display:none!important}
.wm{display:none}
.wm.light{display:none}
.lab{display:inline-block;background:var(--brand);color:#F5ECDF;font-weight:800;font-size:17px;padding:8px 26px;border-radius:999px;letter-spacing:.04em}
`.trim()
}

/**
 * 이미지 슬롯 렌더 — url 있으면 <img>, 없으면 같은 크기의 점선 placeholder.
 * sizeClass가 너비/높이/라운드를 정의하고, .ph가 점선 룩을 더한다.
 */
export function media(url: string | undefined, sizeClass: string, label: string): string {
  // URL 형태가 아니면(LLM이 이모지·설명 텍스트를 넣는 경우) 깨진 <img> 대신 placeholder로
  const isUrl = typeof url === 'string' && /^(https?:\/\/|data:|\/)/.test(url.trim())
  return isUrl
    ? `<img class="${sizeClass}" src="${attr(url)}" alt="${attr(label)}">`
    : `<div class="${sizeClass} ph" role="img" aria-label="${attr(label)}"></div>`
}

/** 변형 render에 넘길 컨텍스트 생성. */
export function makeCtx(tokens: Tokens): RenderCtx {
  return { tokens, esc, richSafe, icon: getIcon }
}
