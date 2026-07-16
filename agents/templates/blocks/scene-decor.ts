/**
 * 씬 장식 레이어 v2 — 결정적 변주 + 마커 희소성
 *
 * decorateSection()이 각 섹션 HTML의 <section> 여는 태그 직후에
 * <div class="dL" aria-hidden="true"> 를 주입한다.
 *
 * 핵심 보장: sceneId가 undefined이면 원본 HTML 그대로 반환 — 데모·스모크 경로 출력 불변.
 *
 * v2 변경:
 *  - 마커 희소성: 씬당 최대 2개 .em만 em-mk로 승격. 나머지 .em은 색 강조만 유지.
 *    (모듈 레벨 Map — indexInScene===0 도달 시 씬 리셋, 렌더가 동기 직렬이므로 안전)
 *  - 결정적 변주(sceneId 기반, 랜덤 없음):
 *    고스트  홀수 씬 우상단 140px / 짝수 씬 좌상단 180px
 *    세로 라벨  고스트 반대측(홀수→좌, 짝수→우)
 *    화살표  3종 로테이션(손그림 곡선 / 직선+삼각 / 루프), sceneId 기반
 *    텍스처  도트 22px↔26px / 그리드 30px↔34px 교대
 *    스포트라이트  중심 50%/38%/62% 로테이션
 *
 * 배치 원칙:
 *  - 풀블리드 워시(도트·그리드·그레인·스포트라이트)는 opacity 상한 CSS에 하드코딩(변수 노출 금지)
 *  - 솔리드 액센트(화살표·씰·스파클·고스트·세로 라벨)는 코너·가장자리 안전 지대에만 절대배치
 *  - 색은 전부 var() 참조: var(--accent) / var(--ink) / var(--line) / var(--accent-d)
 *  - SVG에 vw 단위 금지 — px만 사용 (vw→px 치환 통과 후에도 렌더 일관성 보장)
 */

export interface DecorMeta {
  /** 씬 번호(1~7). undefined = 스모크·데모 경로 → 원본 반환. */
  sceneId?: number
  /** 씬 내 0-based 인덱스 */
  indexInScene: number
  /** 해당 씬의 총 섹션 수 */
  sceneSize: number
  /** 이 씬이 페이지의 마지막 씬인지 */
  isLastScene: boolean
  /** 변형 아키타입 */
  archetype: string
  /** 페이지 내 전역 0-based 인덱스 (SVG filter id dedup용) */
  globalIndex: number
  /** 변형 톤(variant-meta 사전 계산값). 지정 시 isDark() 재계산 대신 사용 — 플래너·감사기와 판정 단일화 */
  tone?: 'dark' | 'light'
}

/** 장식 레이어 전용 CSS — composer가 styles 조립에 1회 주입한다. */
export const DECOR_CSS = [
  '.dL{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
  /* 풀블리드 워시 — opacity는 CSS에 고정(변수화 금지). background-size는 결정적 변주를 위해 인라인 지정. */
  '.dL-dot{position:absolute;inset:0;background-image:radial-gradient(var(--ink) 1.8px,transparent 1.8px);opacity:.05}',
  '.dL-grid{position:absolute;inset:0;background-image:linear-gradient(var(--ink) 1px,transparent 1px),linear-gradient(90deg,var(--ink) 1px,transparent 1px);opacity:.04}',
  '.dL-grain{position:absolute;inset:0;opacity:.07}',
  /* 스포트라이트 중심은 결정적 변주를 위해 인라인 지정 */
  '.dL-spot{position:absolute;inset:0;opacity:.12}',
  /* 솔리드 액센트 — 안전 지대 절대배치 */
  /* 홀수 씬: 고스트 우상단 140px */
  '.dL-ghost{position:absolute;top:24px;right:32px;font-family:var(--font-display);font-size:140px;line-height:1;color:transparent;-webkit-text-stroke:1px var(--ink);opacity:.07;white-space:nowrap;user-select:none;pointer-events:none}',
  /* 짝수 씬: 고스트 좌상단 180px */
  '.dL-ghost-l{position:absolute;top:24px;left:32px;font-family:var(--font-display);font-size:180px;line-height:1;color:transparent;-webkit-text-stroke:1px var(--ink);opacity:.07;white-space:nowrap;user-select:none;pointer-events:none}',
  /* 세로 라벨 — 홀수 씬(고스트 우): 좌측, 짝수 씬(고스트 좌): 우측 */
  '.dL-vlabel{position:absolute;left:8px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:mixed;font-size:11px;letter-spacing:.35em;opacity:.25;color:var(--ink);text-transform:uppercase;white-space:nowrap;user-select:none;pointer-events:none}',
  '.dL-vlabel-r{position:absolute;right:8px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;text-orientation:mixed;font-size:11px;letter-spacing:.35em;opacity:.25;color:var(--ink);text-transform:uppercase;white-space:nowrap;user-select:none;pointer-events:none}',
  '.dL-arrow{position:absolute;bottom:8px;left:50%;transform:translateX(-50%)}',
  '.dL-seal{position:absolute;top:20px;right:20px}',
  '.dL-spark{position:absolute}',
  '.dL-spark-a{top:24px;left:24px}',
  '.dL-spark-b{bottom:24px;right:24px}',
  '.dL-wave{position:absolute;top:0;left:0;width:100%;height:12px;opacity:.35}',
  /* 형광 마커 — .em-mk에만 적용(씬당 최대 2개). .em은 색 강조만 유지. */
  '.dpg section[data-tone="light"] .em{color:var(--accent)}',
  '.dpg section[data-tone="light"] .em-mk{background:linear-gradient(transparent 62%,color-mix(in srgb,var(--accent) 30%,transparent) 62% 94%,transparent 94%);padding:0 .06em;border-radius:2px}',
  /* 다크 톤 강조 대비 보정 — 어두운 배경에서 --accent-d(.em 기본색)가 침몰하는 결함 봉쇄 (룰 7-7) */
  '.dpg section[data-tone="dark"] .em{color:var(--em-dark,#fff)}',
].join('\n')

// ── 마커 희소성 상태 ─────────────────────────────────────────────────────────
// decorateSection은 renderPage 내부에서 동기 직렬 호출 — 싱글스레드 Node.js에서 안전.
// indexInScene===0 도달 시 해당 씬의 카운터를 리셋, 렌더 간 오염 없음.

const sceneEmUsed = new Map<number, number>()

/** 씬당 em-mk 승격 상한 */
const EM_BUDGET = 2

// ── 내부 상수 ────────────────────────────────────────────────────────────────

/** 아키타입 → 세로 라벨 짧은 단어 */
const VLABELS: Record<string, string> = {
  hero: 'INTRO',
  story: 'STORY',
  ingredient: 'ORIGIN',
  usage: 'HOW TO',
  cert: 'QUALITY',
  review: 'VOICE',
  compare: 'VS',
  closing: 'CLOSE',
  stats: 'DATA',
  feature: 'FEATURE',
  checklist: 'CHECK',
  checkpoint: 'POINT',
  callout: 'NOTE',
  spec: 'SPEC',
  shipping: 'SHIP',
  faq: 'FAQ',
  gallery: 'GALLERY',
  lineup: 'LINE',
  banner: 'EVENT',
  discount: 'DEAL',
  award: 'AWARD',
  promo: 'PROMO',
  recommend: 'FOR',
  reason: 'WHY',
  event: 'EVENT',
  detail: 'DETAIL',
  cs: 'SERVICE',
  point: 'POINT',
  equation: 'FORMULA',
  strip: 'BAND',
}

/** 체크 씰을 받는 "신뢰" 아키타입 */
const TRUST_ARCHETYPES = new Set(['review', 'cert', 'spec', 'compare', 'stats'])

// ── 결정적 변주 룩업 테이블 ───────────────────────────────────────────────────

/**
 * 스포트라이트 중심 X 위치 — sceneId 기반 3종 로테이션(결정적).
 * 씬 1 → 50%, 씬 2 → 38%, 씬 3 → 62%, 씬 4 → 50% …
 */
const SPOT_X = [50, 38, 62] as const

/**
 * 도트 배경 사이즈 — 홀수 씬 내 교대(씬 1→22px, 씬 3→26px, 씬 5→22px, 씬 7→26px).
 * Math.floor(sceneId/2) 의 홀짝으로 구분.
 */
function dotSize(sceneId: number): number {
  return Math.floor(sceneId / 2) % 2 === 0 ? 22 : 26
}

/**
 * 그리드 배경 사이즈 — 짝수 씬 내 교대(씬 2→30px, 씬 4→34px, 씬 6→30px).
 */
function gridSize(sceneId: number): number {
  return Math.floor(sceneId / 2) % 2 === 0 ? 34 : 30
}

// ── 내부 헬퍼 ────────────────────────────────────────────────────────────────

/** 섹션 HTML에 다크 배경 마커가 있으면 true */
function isDark(html: string): boolean {
  // background: var(--brand) 또는 background: var(--ink) 인라인 스타일
  if (/background[^;>'"]{0,30}var\(--(?:brand|ink)\)/i.test(html)) return true
  // background: #0... 어두운 hex (6자리)
  if (/background[^;>'"]{0,12}#0[0-9a-fA-F]{5}/i.test(html)) return true
  return false
}

/** sceneId → 제로패딩 두 자리 문자열 ("01"~"07") */
function ghostNum(sceneId: number): string {
  return String(sceneId).padStart(2, '0')
}

/** feTurbulence 그레인 SVG — filter id는 전역 고유 */
function grainSvg(filterId: string): string {
  return (
    `<div class="dL-grain">` +
    `<svg width="100%" height="100%" aria-hidden="true">` +
    `<filter id="${filterId}">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.72 0.68" numOctaves="4" stitchTiles="stitch"/>` +
    `<feColorMatrix type="saturate" values="0"/>` +
    `</filter>` +
    `<rect width="100%" height="100%" filter="url(#${filterId})"/>` +
    `</svg>` +
    `</div>`
  )
}

/**
 * 화살표 SVG — sceneId 기반 3종 결정적 로테이션.
 *  (sceneId-1) % 3 === 0: 손그림 곡선(현행, density-grammar §5 화살표 A)
 *  (sceneId-1) % 3 === 1: 직선 + 삼각(화살표 B)
 *  (sceneId-1) % 3 === 2: 루프형(화살표 D)
 */
function arrowSvg(sceneId: number): string {
  const variant = (sceneId - 1) % 3
  if (variant === 0) {
    // A: 손그림 곡선
    return (
      `<svg class="dL-arrow" width="44" height="30" viewBox="0 0 44 30" fill="none" aria-hidden="true">` +
      `<path d="M4 6 C 18 26 30 26 40 14" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M34 9 L40 14 L35 19" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</svg>`
    )
  }
  if (variant === 1) {
    // B: 직선 + 삼각
    return (
      `<svg class="dL-arrow" width="50" height="20" viewBox="0 0 50 20" fill="none" aria-hidden="true">` +
      `<line x1="0" y1="10" x2="38" y2="10" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>` +
      `<polygon points="36,3 50,10 36,17" fill="var(--accent)"/>` +
      `</svg>`
    )
  }
  // variant === 2: 루프형
  return (
    `<svg class="dL-arrow" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">` +
    `<path d="M18 4 A14 14 0 1 1 4 18" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
    `<polygon points="2,13 8,21 14,13" fill="var(--accent)"/>` +
    `</svg>`
  )
}

/** 원형 체크 씰 (36px) */
function sealSvg(): string {
  return (
    `<svg class="dL-seal" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">` +
    `<circle cx="18" cy="18" r="17" fill="var(--accent)"/>` +
    `<polyline points="9,18 15,24 27,12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `</svg>`
  )
}

/** 씬 경계 물결 디바이더 — 씬 첫 섹션 상단 전폭 (px·% 단위만) */
function waveSvg(): string {
  return (
    `<svg class="dL-wave" viewBox="0 0 872 12" preserveAspectRatio="none" fill="none" aria-hidden="true">` +
    `<path d="M0 6 C 36 -2 73 -2 109 6 C 145 14 182 14 218 6 C 254 -2 291 -2 327 6 C 363 14 400 14 436 6 C 472 -2 509 -2 545 6 C 581 14 618 14 654 6 C 690 -2 727 -2 763 6 C 799 14 836 14 872 6" stroke="var(--accent)" stroke-width="2"/>` +
    `</svg>`
  )
}

/** 스파클 별 SVG (24px) */
function sparkleSvg(extraClass: string): string {
  return (
    `<svg class="dL-spark ${extraClass}" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">` +
    `<path d="M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z" fill="var(--accent)"/>` +
    `</svg>`
  )
}

/**
 * 라이트 톤 섹션의 class="em" 중 budget 개까지만 class="em em-mk"로 승격.
 * 나머지는 그대로(class="em" → 색 강조만).
 * 마커 CSS(.em-mk)는 DECOR_CSS에 선언됨.
 */
function applyEmMarkers(html: string, budget: number): { html: string; used: number } {
  if (budget <= 0) return { html, used: 0 }
  let used = 0
  const result = html.replace(/class="em"/g, () => {
    if (used < budget) {
      used++
      return 'class="em em-mk"'
    }
    return 'class="em"'
  })
  return { html: result, used }
}

// ── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * 섹션 HTML에 .dL 장식 레이어를 주입한다.
 *
 * @param html      variant.render() 반환값 (완성된 <section> HTML)
 * @param meta      씬 메타데이터. sceneId가 undefined이면 원본 그대로 반환.
 * @returns         .dL 주입된 HTML (또는 sceneId 없을 때 원본 html)
 */
export function decorateSection(html: string, meta: DecorMeta): string {
  const { sceneId, indexInScene, sceneSize, isLastScene, archetype, globalIndex, tone } = meta

  // ── 스모크·데모 경로 보호 — sceneId 없으면 원본 불변 ──────────────────
  if (sceneId === undefined) return html

  // ── 씬 첫 블록에서 em 카운터 리셋 ────────────────────────────────────
  if (indexInScene === 0) sceneEmUsed.set(sceneId, 0)

  // variant-meta 사전 계산 톤 우선 — 플래너(variantTone)·감사기와 판정 단일화. 미지정 시 정적 감지 폴백.
  const dark = tone ? tone === 'dark' : isDark(html)
  const isFirst = indexInScene === 0
  const isLast = indexInScene === sceneSize - 1
  const oddScene = sceneId % 2 !== 0

  const parts: string[] = []

  // ── 1) 배경 텍스처 ────────────────────────────────────────────────────────
  if (dark) {
    // 다크 섹션: 그레인 + radial 스포트라이트(중심 3종 로테이션)
    const spotX = SPOT_X[(sceneId - 1) % 3]
    parts.push(grainSvg(`dLgf${globalIndex}`))
    parts.push(
      `<div class="dL-spot" style="background:radial-gradient(ellipse 55% 45% at ${spotX}% 50%,var(--accent) 0%,transparent 70%)"></div>`,
    )
  } else {
    // 라이트 섹션: 홀수 씬 → 도트, 짝수 씬 → 그리드 (스케일 교대)
    if (oddScene) {
      const sz = dotSize(sceneId)
      parts.push(`<div class="dL-dot" style="background-size:${sz}px ${sz}px"></div>`)
    } else {
      const sz = gridSize(sceneId)
      parts.push(`<div class="dL-grid" style="background-size:${sz}px ${sz}px"></div>`)
    }
  }

  // ── 2) 씬 첫 섹션 전용 장식 ──────────────────────────────────────────────
  if (isFirst) {
    // 씬 경계 물결 디바이더 (첫 씬 제외 — 페이지 최상단에는 경계가 없다)
    if (sceneId > 1) parts.push(waveSvg())

    // 세로 영문 라벨: 홀수 씬(고스트 우상단) → 좌측, 짝수 씬(고스트 좌상단) → 우측.
    // 사전 미등재 아키타입은 라벨 생략 — 절단어(RECOMME 등) 노출 방지.
    const vlabel = VLABELS[archetype]
    if (vlabel) {
      const vlabelClass = oddScene ? 'dL-vlabel' : 'dL-vlabel-r'
      parts.push(`<span class="${vlabelClass}">${vlabel}</span>`)
    }

    // 고스트 씬 번호: 홀수 씬 우상단 140px / 짝수 씬 좌상단 180px
    // hero 아키타입(씬1 첫 섹션)은 이미 밀도 높으므로 생략
    if (archetype !== 'hero') {
      const ghostClass = oddScene ? 'dL-ghost' : 'dL-ghost-l'
      parts.push(`<span class="${ghostClass}">${ghostNum(sceneId)}</span>`)
    }
  }

  // ── 3) 씬 마지막 섹션 → 다음 씬 암시 화살표 (마지막 씬 제외) ────────────
  // 화살표: sceneId 기반 3종 결정적 로테이션
  if (isLast && !isLastScene) {
    parts.push(arrowSvg(sceneId))
  }

  // ── 4) 신뢰 아키타입 → 체크 씰 (우상단) ─────────────────────────────────
  if (TRUST_ARCHETYPES.has(archetype)) {
    parts.push(sealSvg())
  }

  // ── 5) 마지막 씬 마지막 섹션(closing) → 스파클 2개 ──────────────────────
  if (isLast && isLastScene) {
    parts.push(sparkleSvg('dL-spark-a'))
    parts.push(sparkleSvg('dL-spark-b'))
  }

  const dL = `<div class="dL" aria-hidden="true">${parts.join('')}</div>`

  // <section ...> 여는 태그에 data-tone 부여 + 태그 직후 .dL 삽입
  const secIdx = html.indexOf('<section')
  if (secIdx === -1) return html
  const tagEnd = html.indexOf('>', secIdx)
  if (tagEnd === -1) return html

  const toneAttr = ` data-tone="${dark ? 'dark' : 'light'}"`
  const withTone = html.slice(0, secIdx + 8) + toneAttr + html.slice(secIdx + 8)
  const tagEnd2 = tagEnd + toneAttr.length

  const decorated = withTone.slice(0, tagEnd2 + 1) + dL + withTone.slice(tagEnd2 + 1)

  // ── 마커 희소성: 씬당 최대 2개 .em만 em-mk로 승격 ─────────────────────────
  // 다크 섹션은 .em이 색 변환만 하므로 마커 적용 불필요
  if (!dark) {
    const used = sceneEmUsed.get(sceneId) ?? 0
    const budget = EM_BUDGET - used
    const { html: markedHtml, used: newlyUsed } = applyEmMarkers(decorated, budget)
    sceneEmUsed.set(sceneId, used + newlyUsed)
    return markedHtml
  }

  return decorated
}
