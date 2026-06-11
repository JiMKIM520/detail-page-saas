/**
 * 블록 시스템 공유 유틸 — escape, 아이콘, 폰트 링크, 베이스 CSS, RenderCtx 생성.
 */
import type { RenderCtx, Tokens } from './types'

/** HTML 특수문자 이스케이프 (XSS 차단 기본). */
export const esc = (s: string | undefined): string =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * 제한 화이트리스트(<br>, <span class="em">)만 허용하고 나머지는 이스케이프.
 * 헤드라인 줄바꿈·강조에만 사용 (LLM raw 출력 직접 삽입 금지).
 */
export function richSafe(s: string | undefined): string {
  let out = esc(s ?? '')
  out = out.replace(/&lt;br\s*\/?&gt;/g, '<br>')
  // 매칭된 <span class="em">...</span> 쌍만 복원. 고아 </span>/중첩은 이스케이프 유지(구조적 화이트리스트).
  out = out.replace(/&lt;span class="em"&gt;([\s\S]*?)&lt;\/span&gt;/g, '<span class="em">$1</span>')
  return out
}

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
}

export function getIcon(name: string): string {
  return ICONS[name] ?? ICONS.check
}

/** 사용 가능한 아이콘 이름 — 변형 스키마 z.enum 검증의 단일 출처(미검증 문자열 → getIcon silent fallback 방지). */
export const ICON_NAMES = ['wheat', 'drop', 'clock', 'badge', 'snow', 'check', 'fryer', 'oven', 'star'] as const

/** <head>에 로드할 웹폰트 링크. 모든 변형이 이 폰트들을 쓸 수 있다. */
export const FONT_LINKS: string = [
  '<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gaegu:wght@700&family=Gowun+Batang:wght@400;700&family=Cormorant+Garamond:wght@500;600&display=swap" rel="stylesheet">',
].join('\n')

/** 음식 라인아트 워터마크 (은은한 배경). stroke 색은 고정(어두운 잉크). */
const WATERMARK_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320'><g fill='none' stroke='%232A2118' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M44 96 q34 -40 86 -26 q-10 30 -38 38 q22 4 40 -2 q-18 26 -52 20 q12 18 4 36 q-30 -10 -36 -42 q-26 6 -42 -10 q26 -18 56 -16 q-24 -16 -18 -34 Z'/><path d='M214 54 l0 72 M214 70 q-16 -8 -22 2 q14 6 22 -2 M214 70 q16 -8 22 2 q-14 6 -22 -2 M214 92 q-16 -8 -22 2 q14 6 22 -2 M214 92 q16 -8 22 2 q-14 6 -22 -2'/><path d='M70 224 q34 -26 84 0 q-4 40 -42 44 q-38 -4 -42 -44 Z'/><path d='M92 224 l8 -14 M118 224 l8 -14 M144 224 l8 -14'/><path d='M236 214 q24 -22 48 0 q24 22 0 44 q-24 22 -48 0 q-24 -22 0 -44 Z'/><path d='M250 230 l0 28 M270 230 l0 28'/></g></svg>\")"

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
.dpg{width:${width}px;margin:0 auto;background:var(--bg);overflow:hidden}
.dpg img{display:block}
.disp{font-family:var(--font-display);font-weight:400;letter-spacing:-.01em;line-height:1.14}
.serif{font-family:var(--font-serif)}
.lat{font-family:var(--font-lat)}
.hand{font-family:var(--font-hand)}
.acc,.em{color:var(--accent)}
.ph{display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.035);border:2px dashed var(--line);color:var(--muted);font-size:13px;letter-spacing:.02em;box-shadow:none!important}
.wm{position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:${WATERMARK_BG};background-size:320px 320px}
.wm.light{opacity:.07;filter:invert(1)}
.lab{display:inline-block;background:var(--brand);color:#F5ECDF;font-weight:800;font-size:17px;padding:8px 26px;border-radius:999px;letter-spacing:.04em}
`.trim()
}

/**
 * 이미지 슬롯 렌더 — url 있으면 <img>, 없으면 같은 크기의 점선 placeholder.
 * sizeClass가 너비/높이/라운드를 정의하고, .ph가 점선 룩을 더한다.
 */
export function media(url: string | undefined, sizeClass: string, label: string): string {
  return url
    ? `<img class="${sizeClass}" src="${esc(url)}" alt="${esc(label)}">`
    : `<div class="${sizeClass} ph">${esc(label)}</div>`
}

/** 변형 render에 넘길 컨텍스트 생성. */
export function makeCtx(tokens: Tokens): RenderCtx {
  return { tokens, esc, richSafe, icon: getIcon }
}
