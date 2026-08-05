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

import { getFontFaceByFile } from './fonts/index'

/** <head>에 로드할 웹폰트 링크 (외부 CDN).
 * 드라이브 35종은 전부 woff2 데이터 URI로 임베딩되므로 외부 CDN 링크 불필요.
 * buildFontLinks가 FONT_WHITELIST의 client 항목을 @font-face 인라인으로 변환한다. */
export const FONT_LINKS: string = ''

/** 폰트 화이트리스트 — 드라이브 제공 36종 전용.
 *  client: woff2 파일경로 (fonts/ 디렉토리 기준), buildFontLinks가 @font-face 데이터 URI로 주입.
 *  이 목록 외 폰트(Helvetica·Arial·Noto Sans KR 등)는 gateStyleGuide가 throw로 차단. */
export const FONT_WHITELIST: Record<string, { gf?: string; client?: string; clientFamily?: string; clientWeight?: number }> = {
  // ── 범용 (title+sub+info) ──────────────────────────────────────────────────
  '프리텐다드':           { client: 'drive/f01.woff2', clientFamily: '프리텐다드',           clientWeight: 700 },
  '페이퍼로지':           { client: 'drive/f03.woff2', clientFamily: '페이퍼로지',           clientWeight: 700 },
  '지마켓 산스':           { client: 'drive/f12.woff2', clientFamily: '지마켓 산스',           clientWeight: 700 },
  '마루 부리':            { client: 'drive/f27.woff2', clientFamily: '마루 부리',            clientWeight: 700 },
  '나눔스퀘어':           { client: 'drive/f29.woff2', clientFamily: '나눔스퀘어',           clientWeight: 700 },
  '나눔명조':             { client: 'drive/f33.woff2', clientFamily: '나눔명조',             clientWeight: 700 },
  'suit':                 { client: 'drive/f35.woff2', clientFamily: 'SUIT',                 clientWeight: 700 },
  // ── 제목+소제목 (title+sub) ────────────────────────────────────────────────
  '평창평화체':           { client: 'drive/f02.woff2', clientFamily: '평창평화체',           clientWeight: 400 },
  '카페24 당당해':         { client: 'drive/f08.woff2', clientFamily: '카페24 당당해',         clientWeight: 400 },
  '카페24 써라운드':       { client: 'drive/f09.woff2', clientFamily: '카페24 써라운드',       clientWeight: 400 },
  '창원단감아삭체':        { client: 'drive/f10.woff2', clientFamily: '창원단감아삭체',        clientWeight: 400 },
  '카페24 단정해':         { client: 'drive/f11.woff2', clientFamily: '카페24 단정해',         clientWeight: 400 },
  'rufina':               { client: 'drive/f14.woff2', clientFamily: 'Rufina',               clientWeight: 400 },
  'apollo':               { client: 'drive/f15.woff2', clientFamily: 'Apollo',               clientWeight: 400 },
  'high summit':          { client: 'drive/f16.woff2', clientFamily: 'High Summit',          clientWeight: 400 },
  'gontserrat':           { client: 'drive/f17.woff2', clientFamily: 'Gontserrat',           clientWeight: 400 },
  'quentin':              { client: 'drive/f18.woff2', clientFamily: 'Quentin',              clientWeight: 400 },
  'belgiano':             { client: 'drive/f21.woff2', clientFamily: 'Belgiano',             clientWeight: 400 },
  '어그로체':             { client: 'drive/f22.woff2', clientFamily: '어그로체',             clientWeight: 700 },
  '빛고을광주체':         { client: 'drive/f26.woff2', clientFamily: '빛고을광주체',         clientWeight: 400 },
  '티몬몬소리체':          { client: 'drive/f04.woff2', clientFamily: '티몬몬소리체',          clientWeight: 700 },
  // ── 디스플레이 · 제목 전용 (title only) ────────────────────────────────────
  '카페24 클래식타입':     { client: 'drive/f05.woff2', clientFamily: '카페24 클래식타입',     clientWeight: 400 },
  '카페24 빛나는별':       { client: 'drive/f06.woff2', clientFamily: '카페24 빛나는별',       clientWeight: 400 },
  '카페24 아네모네':       { client: 'drive/f07.woff2', clientFamily: '카페24 아네모네',       clientWeight: 400 },
  '영양군 음식디미방체':    { client: 'drive/f13.woff2', clientFamily: '영양군 음식디미방체',    clientWeight: 400 },
  '영도체':               { client: 'drive/f19.woff2', clientFamily: '영도체',               clientWeight: 400 },
  '여기어때 잘난체':       { client: 'drive/f20.woff2', clientFamily: '여기어때 잘난체',       clientWeight: 700 },
  '안성탕면체':           { client: 'drive/f23.woff2', clientFamily: '안성탕면체',           clientWeight: 400 },
  '수성혜정체':           { client: 'drive/f24.woff2', clientFamily: '수성혜정체',           clientWeight: 400 },
  '상주곶감체':           { client: 'drive/f25.woff2', clientFamily: '상주곶감체',           clientWeight: 400 },
  '문경감홍사과체':        { client: 'drive/f28.woff2', clientFamily: '문경감홍사과체',        clientWeight: 400 },
  '땅스부대찌개체':        { client: 'drive/f30.woff2', clientFamily: '땅스부대찌개체',        clientWeight: 400 },
  'tvn 즐거운이야기':      { client: 'drive/f34.woff2', clientFamily: 'tvN 즐거운이야기',      clientWeight: 700 },
  '가나초콜릿체':          { client: 'drive/f36.woff2', clientFamily: '가나초콜릿체',          clientWeight: 400 },
  // ── 손글씨 · 제목 전용 ──────────────────────────────────────────────────────
  '나눔 부장님 눈치체':    { client: 'drive/f31.woff2', clientFamily: '나눔 부장님 눈치체',    clientWeight: 400 },
  '나눔브러쉬':           { client: 'drive/f32.woff2', clientFamily: '나눔브러쉬',           clientWeight: 400 },
}

/** 표기 변형 → 정식 패밀리명 별칭 (AI가 영문명·구 CSS명·원본 mapping키를 사용할 때 흡수) */
const FONT_ALIASES: Record<string, string> = {
  // 영문/변형명 → 정규화명
  'pretendard': '프리텐다드',
  'pretendard variable': '프리텐다드',
  'gmarket sans': '지마켓 산스',
  'gmarketsans': '지마켓 산스',
  // 구 CSS family명 → 새 정규화명
  'nanumsquare': '나눔스퀘어',
  'nanum square': '나눔스퀘어',
  'maruburi': '마루 부리',
  'maru buri': '마루 부리',
  'nanum myeongjo': '나눔명조',
  'nanumbrushscript': '나눔브러쉬',
  'nanum brush script': '나눔브러쉬',
  // 원본 mapping.json 키 → 정규화명 (저장된 값 호환)
  '영문 rufina': 'Rufina',
  '영문 apollo': 'Apollo',
  '영문 high_summit': 'High Summit',
  '영문 gontserrat': 'Gontserrat',
  '영문 quentin': 'Quentin',
  '영문 belgiano': 'Belgiano',
  '수성혜정체_윈도우용': '수성혜정체',
  '평창평화체(windows)': '평창평화체',
  '나눔손글씨 부장님 눈치체': '나눔 부장님 눈치체',
  '문경감홍사과체폰트파일': '문경감홍사과체',
  // lowercase → 정식 대소문자
  'tvn 즐거운이야기': 'tvN 즐거운이야기',
}

/** 화이트리스트 폰트면 정식 패밀리명 반환, 아니면 null */
export function resolveWhitelistFont(family: string): string | null {
  const key = family.trim().toLowerCase()
  const canonical = FONT_ALIASES[key] ?? family.trim()
  return FONT_WHITELIST[canonical.toLowerCase()] !== undefined ? canonical : null
}

export function isWhitelistedFont(family: string): boolean {
  return resolveWhitelistFont(family) !== null
}

/** bodyFont 슬롯에 허용되지 않는 세리프·손글씨·디스플레이 폰트 (소문자 정식명 및 alias key).
 *  art-director 규칙: "bodyFont — choose from [산세리프 · 범용/모던] group only". */
const BODY_BLOCKED_FONTS = new Set([
  // 세리프·명조 (storyFont/fontSerif 전용)
  'gowun batang', 'noto serif kr', 'nanum myeongjo', 'hahmlet', 'song myung', 'maruburi',
  // 한글명 alias
  '나눔명조', '마루 부리', 'maru buri',
  // 손글씨 (본문 사용 금지)
  'gaegu', 'nanum pen script', 'nanum brush script', 'gamja flower', 'poor story',
  // 디스플레이·특수 (본문 사용 금지)
  'yeon sung', 'gugi', 'hi melody', 'cute font', 'single day', 'east sea dokdo', 'kirang haerang',
  '가나초콜릿체', 'tvn 즐거운이야기', 'nanum gothic',
])

/** bodyFont 슬롯에 안전한 산세리프 폰트인지 확인. 빈 문자열·undefined는 true 반환(setFont 내부에서 skip). */
export function isBodySafeFont(family: string | undefined): boolean {
  if (!family?.trim()) return true
  const key = family.trim().toLowerCase()
  const canonical = (FONT_ALIASES[key] ?? key).toLowerCase()
  return !BODY_BLOCKED_FONTS.has(key) && !BODY_BLOCKED_FONTS.has(canonical)
}

/**
 * 토큰의 폰트 패밀리에서 웹폰트 로드 태그 생성.
 * 1. 클라이언트 제공 폰트(client 속성): woff2 → base64 데이터 URI @font-face 주입 (CDN 불필요)
 * 2. Google Fonts 폰트(gf 속성): <link> 동적 로드 (기본 FONT_LINKS 미포함 폰트만)
 */
export function buildFontLinks(tokens: Tokens): string {
  const fams = new Set<string>()
  for (const v of [tokens.fontDisplay, tokens.fontBody, tokens.fontSerif, tokens.fontHand]) {
    const m = String(v).match(/^'([^']+)'/)
    if (m) fams.add(m[1].trim().toLowerCase())
  }

  // ① 클라이언트 폰트 @font-face 블록 (데이터 URI — 독립 HTML에서 외부 CDN 없이 렌더)
  const clientFaces = [...fams]
    .map((f) => {
      const entry = FONT_WHITELIST[f]
      if (!entry?.client || !entry.clientFamily) return null
      return getFontFaceByFile(entry.clientFamily, entry.client, entry.clientWeight ?? 700)
    })
    .filter((x): x is string => x !== null)

  // ② Google Fonts — client 폰트가 있어도 GF 폴백 링크는 유지 (로드 경합은 CSS specificity로 처리)
  const gfParams = [...fams]
    .map((f) => FONT_WHITELIST[f]?.gf)
    .filter((x): x is string => Boolean(x))
    .map((p) => `family=${p}`)
  const gfLink = gfParams.length
    ? `\n<link href="https://fonts.googleapis.com/css2?${gfParams.join('&')}&display=swap" rel="stylesheet">`
    : ''

  const clientStyle = clientFaces.length
    ? `\n<style>\n${clientFaces.join('\n')}\n</style>`
    : ''

  // 클라이언트 @font-face를 마지막에 배치 → GF 동명 선언보다 나중에 파싱돼 우선 적용
  return FONT_LINKS + gfLink + clientStyle
}

/** 토큰 → :root CSS 변수 + 리셋 + 페이지 + 공유 유틸리티(워터마크/라벨/디스플레이). composer가 1회 주입. */
export function baseCss(tokens: Tokens, width: number): string {
  const t = { ...tokens }
  for (const k of Object.keys(t) as (keyof Tokens)[]) {
    const v = t[k]
    if (typeof v === 'string') (t as Record<string, unknown>)[k] = cssSafe(v)
  }
  // 형태 토큰 (Sprint 6) — rScale·padX는 상시 방출(기본 = 현행), photoShape는 지정 시만
  // (미지정이면 변형 CSS의 var(--shape-photo, <고유값>) fallback이 살아 변형 정체성 유지)
  const rScale = typeof t.rScale === 'number' && isFinite(t.rScale) ? Math.max(0, Math.min(3, t.rScale)) : 1
  const padX = typeof t.padX === 'number' && isFinite(t.padX) ? Math.max(24, Math.min(96, Math.round(t.padX))) : 56
  const shapePhoto = typeof t.photoShape === 'string' && t.photoShape.trim() ? `\n  --shape-photo:${cssSafe(t.photoShape)};` : ''
  const emDark = typeof t.emDark === 'string' && t.emDark.trim() ? cssSafe(t.emDark) : '#FFF7EA'
  return `
:root{
  --bg:${t.bg}; --paper:${t.paper}; --ink:${t.ink}; --ink-2:${t.ink2};
  --muted:${t.muted}; --accent:${t.accent}; --accent-d:${t.accentDark};
  --brand:${t.brand}; --line:${t.line};
  --font-display:${t.fontDisplay}; --font-body:${t.fontBody};
  --font-serif:${t.fontSerif}; --font-hand:${t.fontHand};
  --font-lat:'Cormorant Garamond',serif;
  --r-scale:${rScale}; --pad-x:${padX}px; --em-dark:${emDark};${shapePhoto}
  --scene-bg-1:var(--bg);
  --scene-bg-2:color-mix(in srgb,var(--accent) 5%,var(--bg));
  --scene-bg-3:color-mix(in srgb,var(--ink) 3%,var(--bg));
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body),'Pretendard',sans-serif;color:var(--ink);background:#cfc6ba;-webkit-font-smoothing:antialiased}
.dpg{width:${width}px;margin:0 auto;background:var(--bg);overflow:hidden;word-break:keep-all;overflow-wrap:break-word;font-synthesis:none}
.dpg img{display:block}
.dpg section{position:relative}
.disp{font-family:var(--font-display);font-weight:400;letter-spacing:-.01em;line-height:1.14}
.serif{font-family:var(--font-serif)}
.lat{font-family:var(--font-lat)}
.hand{font-family:var(--font-hand)}
.acc,.em{color:var(--accent-d)}
/* 빈 미디어 슬롯 — 어떤 변형의 .ph 오버라이드보다 우선(!important)해 '미완성 점선 박스'를 은은한 틴트 패널로 통일 */
.ph{display:none!important}
.dpg :has(> .ph:only-child){display:none!important}
.wm{display:none}
.wm.light{display:none}
.lab{display:inline-block;background:var(--brand);color:#F5ECDF;font-weight:800;font-size:17px;padding:8px 26px;border-radius:999px;letter-spacing:.04em}
.scene{position:relative}
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
