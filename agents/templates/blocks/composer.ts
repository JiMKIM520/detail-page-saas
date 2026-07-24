/**
 * 컴포저 — PageSpec(토큰 + 정렬된 블록) → 완성 HTML 문자열.
 *
 * 흐름:
 *  1) 각 블록의 변형을 레지스트리에서 조회 (없으면 에러)
 *  2) 슬롯 데이터를 변형 schema로 검증 (실패 시 에러 — fail fast)
 *  3) 사용된 변형의 CSS를 id로 dedup 해 1회씩 수집
 *  4) baseCss(토큰) + 변형 CSS + 폰트링크 + 렌더된 섹션들로 문서 조립
 */
import { z } from 'zod'
import { baseCss, buildFontLinks, esc, makeCtx } from './shared'
import { getVariant } from './registry'
import { decorateSection, DECOR_CSS } from './scene-decor'
import { variantTone } from './variant-meta'
import type { PageSpec } from './types'

const DEFAULT_WIDTH = 872

// ── 폰트 스케일 재매핑 ─────────────────────────────────────────────────────────
// 클라이언트 룰 v2: 본문 ≥23px · 서브 ≥30px (872px 캔버스 기준).
// 원본 디자인 파일의 font-size·line-height px 값을 선형 보간 앵커 테이블로 상향.
// baseCss(토큰)·DECOR_CSS는 불변 — 변형 CSS 문자열에만 적용한다.

/** 앵커 테이블 [원본px, 출력px] — 단조 연속, 10 이하·64 이상은 그대로. */
const FONT_ANCHORS: [number, number][] = [
  // 10px 이하는 장식(워터마크·세로 라벨)만 — 그대로 둔다.
  // 11px부터는 읽는 텍스트로 보고 본문 하한 23px을 보장한다(F4). 12~13px 원본이
  // 보간으로 18~20px에 머물러 하한을 못 넘던 실측(2026-07-20 채점) 반영.
  [10, 10],
  [11, 23],
  [14, 25],
  [17, 30],
  [24, 34],
  [34, 40],
  [48, 52],
  [64, 64],
]

/** 단일 px 값을 앵커 테이블로 선형 보간 후 반올림한다. */
function mapFontPx(n: number): number {
  if (n <= FONT_ANCHORS[0][0]) return n
  if (n >= FONT_ANCHORS[FONT_ANCHORS.length - 1][0]) return n
  for (let i = 0; i < FONT_ANCHORS.length - 1; i++) {
    const [x0, y0] = FONT_ANCHORS[i]
    const [x1, y1] = FONT_ANCHORS[i + 1]
    if (n >= x0 && n <= x1) {
      const t = (n - x0) / (x1 - x0)
      const mapped = Math.round(y0 + t * (y1 - y0))
      // 10px 초과 = 읽는 텍스트 → 본문 하한 23px 보장(앵커 보간 사각지대 봉쇄)
      return mapped < 23 ? 23 : mapped
    }
  }
  return n
}

/**
 * 절대 좌표로 배치된 요소용 완화 매핑.
 *
 * 왜 분리하는가: 흐름(flow) 텍스트는 커지면 아래로 밀리며 재배치되지만, `position:absolute`로
 * 좌표가 고정된 라벨·배지는 커져도 자리를 못 옮겨 서로 겹친다. 16px 기준으로 좌표를 설계한
 * 오버레이에 본문 하한(23px)을 그대로 적용하자 알약 태그가 28px가 되며 충돌한 실측
 * (2026-07-21 동원 씬2 '가다랑어 흰살'↔'휴먼그레이드 원료' 겹침) 반영.
 * 읽는 텍스트인 건 같으므로 하한 20px은 유지하되, 원본 대비 1.25배까지만 키운다.
 */
function mapFontPxPositioned(n: number): number {
  if (n <= 10) return n
  return Math.min(mapFontPx(n), Math.max(20, Math.round(n * 1.25)))
}

/**
 * 변형 CSS 문자열의 font-size·line-height px 값을 앵커 테이블로 재매핑한다.
 * - `font-size:Npx` / `font-size: Npx` 형태만 대상 (clamp/em/rem 불변).
 * - `line-height:Npx` / `line-height: Npx` px 명시형만 대상 (숫자단리·em 불변).
 * - 다른 속성(letter-spacing 등)은 불변.
 * - `position:absolute`를 선언한 규칙 블록은 완화 매핑 — 좌표 고정 요소는 확대가 곧 겹침이다.
 * 순수 함수 — 입력 문자열을 변경하지 않는다.
 */
export function remapFontScale(css: string): string {
  // 선언 값 전체를 잡아 그 안의 모든 px를 재매핑한다 — clamp()/min()/max() 안에 든 px가
  // 단순 패턴을 빠져나가 하한 미달로 남던 실측(clamp(15px,3.2vw,18px) → 18px) 봉쇄.
  const remapDecls = (body: string, positioned: boolean): string => {
    const mapper = positioned ? mapFontPxPositioned : mapFontPx
    const remapDecl = (prop: 'font-size' | 'line-height') => (css2: string) =>
      css2.replace(new RegExp(`${prop}\\s*:\\s*([^;}]+)`, 'g'), (_m, val: string) => {
        const mapped = val.replace(/([\d.]+)px/g, (_p, n: string) => `${mapper(parseFloat(n))}px`)
        return `${prop}:${mapped}`
      })
    return remapDecl('line-height')(remapDecl('font-size')(body))
  }
  // 최내곽 중괄호 = 선언 블록. @media 등 중첩 규칙도 안쪽 블록만 잡히므로 그대로 동작한다.
  return css.replace(/\{([^{}]*)\}/g, (_whole, body: string) => {
    const positioned = /position\s*:\s*absolute/.test(body)
    return `{${remapDecls(body, positioned)}}`
  })
}

/**
 * 다크 씬 accent 텍스트 대비 보정 — `color:var(--accent)`를 `--accent-fg` 참조로 바꾼다.
 *
 * 왜: cobaltPremium처럼 accent와 ink(다크 배경)가 둘 다 어두운 프리셋에서, accent를 텍스트로
 * 쓰는 곳(제목·강조·영양 배지)이 다크 배경 위에서 대비 1.1로 안 읽혔다(2026-07-21 실측, 씬5).
 * 80개 변형이 같은 패턴이라 개별 수정은 불가능하다.
 *
 * 핵심: accent는 텍스트일 땐 다크 배경에서 밝아야 하고, 배경일 땐 그대로여야 한다(그 위 흰 텍스트
 * 대비 때문). 그래서 `color:` 선언만 --accent-fg로 돌리고 `background:var(--accent)`는 손대지 않는다.
 * --accent-fg는 라이트 씬에서 원본 accent, 다크 씬에서 밝은 버전(ACCENT_CONTRAST가 정의).
 *
 * `background-color:`는 'color' 앞 문자가 '-'라 `[{;]color` 패턴에 걸리지 않는다.
 */
export function liftAccentText(css: string): string {
  return css.replace(
    /([{;]\s*)color(\s*):(\s*)var\(--accent\)/g,
    '$1color$2:$3var(--accent-fg,var(--accent))',
  )
}

/** --accent-fg 정의 — 라이트=원본, 다크 씬=흰색과 섞어 밝게(대비 확보). 배경 accent는 불변.
 *  --on-accent — accent를 '배경'으로 쓰는 요소(하이라이트 밴드·배지)의 글자색을 accent 명도로
 *  자동 선택(어두우면 흰색, 밝으면 검정). 동원처럼 브랜드 accent가 다크 네이비(#00295B)면
 *  기존 'accent 배경+ink 글자' 패턴이 네이비 위 네이비로 뭉개지던 실사례의 근본 해소.
 *  CSS relative color(lch from) — 렌더 chromium 실증 완료, 미지원 환경은 var() 폴백으로 현행 유지. */
const ACCENT_CONTRAST = [
  '.dpg{--accent-fg:var(--accent)}',
  '.dpg [data-tone="dark"]{--accent-fg:color-mix(in srgb,var(--accent) 45%,#fff)}',
  '.dpg{--on-accent:lch(from var(--accent) calc((49.44 - l) * 999) 0 0)}',
].join('\n')

/**
 * 히어로 이미지 프레임 세로화 — 히어로 변형 CSS에만 적용한다(I1 제품 완전 노출).
 *
 * 왜: 히어로 샷은 3:4 세로로 생성되는데 히어로 변형의 이미지 프레임은 대부분 가로 고정
 * (height:420~620px + object-fit:cover)이라, cover가 세로 사진의 상하를 잘라 제품(주로 하단)이
 * 사라진다(2026-07-21 실측 59% 잘림 → 제품 소멸). 변형이 60개가 넘어 개별 수정으로는 놓친다.
 *
 * 방법: object-fit:cover를 쓰는 선언에서 고정 height(3자리 px)를 aspect-ratio:3/4로 바꿔
 * 3:4 샷과 정합시킨다 → crop 0. 이미 aspect-ratio가 있거나(수정 완료), height:100%(풀블리드
 * inset:0 배경)이거나, 2자리 이하 px(썸네일 아이콘)는 대상이 아니다.
 * 순수 함수 — 히어로 변형(첫 블록)의 CSS에만 호출한다. 다른 아키타입 이미지는 건드리지 않는다.
 */
export function liftHeroImageFrame(css: string): string {
  return css.replace(/\{([^{}]*)\}/g, (whole, body: string) => {
    if (!/object-fit\s*:\s*cover/.test(body)) return whole
    if (/aspect-ratio/.test(body)) return whole
    if (!/height\s*:\s*\d{3,}px/.test(body)) return whole
    // 첫 고정 height만 교체(대개 이미지 프레임 하나) — 나머지 선언은 불변
    const fixed = body.replace(/height\s*:\s*\d{3,}px/, 'aspect-ratio:3/4')
    return `{${fixed}}`
  })
}

export interface RenderResult {
  html: string
  usedVariants: string[]
  blockCount: number
}

/** PageSpec → HTML. 잘못된 변형 id나 슬롯 데이터는 에러를 던진다(조용한 실패 금지). */
export function renderPage(spec: PageSpec): RenderResult {
  const width = spec.width ?? DEFAULT_WIDTH
  const ctx = makeCtx(spec.tokens)

  const cssById = new Map<string, string>()
  const sections: string[] = []
  const usedVariants: string[] = []

  // ── 씬별 메타 선-계산 (decorateSection에 indexInScene·sceneSize·isLastScene 공급) ──
  const sceneSizes = new Map<number, number>() // sceneId → 해당 씬의 총 섹션 수
  for (const b of spec.blocks) {
    if (b.sceneId !== undefined) {
      sceneSizes.set(b.sceneId, (sceneSizes.get(b.sceneId) ?? 0) + 1)
    }
  }
  const lastSceneId: number | undefined =
    sceneSizes.size > 0 ? Math.max(...sceneSizes.keys()) : undefined
  const sceneCounters = new Map<number, number>() // sceneId → 현재 처리한 인덱스

  // 씬 경계 추적 — sceneId가 정의된 블록은 <div class="scene"> 래퍼로 묶는다.
  // 전부 undefined이면 래퍼가 하나도 생성되지 않아 출력이 현행과 100% 동일하다.
  let prevSceneId: number | undefined = undefined
  let sceneOpen = false

  spec.blocks.forEach((block, i) => {
    const variant = getVariant(block.variantId)
    if (!variant) throw new Error(`[composer] unknown variant id at block ${i}: ${block.variantId}`)

    const parsed = variant.schema.safeParse(block.data)
    if (!parsed.success) {
      throw new Error(`[composer] invalid slot data for ${block.variantId} (block ${i}): ${parsed.error.message}`)
    }

    if (!cssById.has(variant.id)) cssById.set(variant.id, variant.css)
    usedVariants.push(variant.id)

    // ── 장식 레이어 주입 — sceneId 없으면 decorateSection이 원본 그대로 반환 ──
    const sectionHtml = variant.render(parsed.data, ctx)
    const sid = block.sceneId
    const indexInScene = sid !== undefined ? (sceneCounters.get(sid) ?? 0) : 0
    const sceneSize = sid !== undefined ? (sceneSizes.get(sid) ?? 1) : 1
    const decorated = decorateSection(sectionHtml, {
      sceneId: sid,
      indexInScene,
      sceneSize,
      isLastScene: sid !== undefined && sid === lastSceneId,
      archetype: variant.archetype,
      globalIndex: i,
      tone: variantTone(variant.id),
    })
    if (sid !== undefined) sceneCounters.set(sid, indexInScene + 1)

    if (sid !== undefined) {
      if (sid !== prevSceneId) {
        if (sceneOpen) sections.push('</div>')
        const tintN = ((sid - 1) % 3) + 1
        sections.push(`<div class="scene" data-scene="${sid}" style="--bg:var(--scene-bg-${tintN})">`)
        sceneOpen = true
        prevSceneId = sid
      }
    } else if (sceneOpen) {
      // sceneId 없는 블록은 씬 래퍼 밖에 배치
      sections.push('</div>')
      sceneOpen = false
      prevSceneId = undefined
    }

    // Figma 임포트(html.to.design) 레이어 식별용 — sN-{variantId} 형태
    const dataName = sid !== undefined ? `s${sid}-${variant.id}` : variant.id
    // data-arch = 아키타입 — 변형 이름에 'spec'이 들어갔다고 표계열로 오판하던 채점 오탐 봉쇄
    const taggedSection = decorated.replace(
      /(<section)(\s|>)/,
      `$1 data-name="${dataName}" data-arch="${variant.archetype}"$2`,
    )
    sections.push(taggedSection)
  })

  if (sceneOpen) sections.push('</div>')

  // vw 단위를 페이지 고정폭 기준 px로 결정적 치환 — 데스크톱 브라우저는 viewport meta를
  // 무시하므로 vw가 실제 창 폭을 따라 커져 872px 설계가 와이드 화면에서 붕괴한다
  // (로모노소프 선물 타이틀-이미지 겹침 실사례). 모바일은 meta로 이미 872 가상폭 = 동일 결과.
  // 변형 CSS에만 폰트 스케일 재매핑 적용 — baseCss·DECOR_CSS는 불변.
  // baseCss도 재매핑 대상 — .lab 같은 공용 라벨이 17px로 남아 본문 하한을 깨뜨렸다(2026-07-20 채점).
  // DECOR_CSS만 제외한다(장식 워터마크·세로 라벨은 읽는 텍스트가 아니다).
  // 순서가 중요하다: vw→px를 먼저 하고 그다음 폰트 재매핑.
  // 반대로 하면 vw로 선언된 폰트(2.2vw 등)가 재매핑을 통과해 19.18px 같은 하한 미달로 남는다
  // (2026-07-20 채점에서 실측된 잔존 3건의 원인).
  const vwToPx = (css: string) =>
    css.replace(/([\d.]+)vw/g, (_, n: string) => `${Math.round(parseFloat(n) * width) / 100}px`)
  // 폰트 역할 고정(F2·F4) — 변형마다 타이틀에 display/serif/body를 제각각 써서
  // 한 페이지에 타이틀 3계열·본문 2계열이 섞였다(2026-07-20 실측). 룰은 각 1종이므로
  // 렌더 계층에서 못박는다. 마지막에 붙이고 !important로 변형 선택자를 이긴다.
  const FONT_ROLE_LOCK = [
    // 타이틀 폰트 씬 톤별 2종 배분(F2 완화, 2026-07-21 클라이언트 승인) —
    // 라이트 씬=display(임팩트), 다크 씬=serif(명조·프리미엄). 씬 톤이 교차 설계(S4)라
    // 타이틀 폰트도 톤 따라 교차하며 리듬을 만든다. "제각각"이 아니라 "규칙 있는 변화".
    // 폰트 총 3종(display+serif+body)이라 5종 이내(F1) 유지.
    '.dpg h1,.dpg h2,.dpg .disp{font-family:var(--font-display)!important}',
    '.dpg [data-tone="dark"] h1,.dpg [data-tone="dark"] h2,.dpg [data-tone="dark"] .disp{font-family:var(--font-serif)!important}',
    '.dpg p,.dpg li,.dpg dd,.dpg dt,.dpg th,.dpg td{font-family:var(--font-body)!important}',
    // 서브타이틀 하한 30px(F3) — 부제 성격 클래스만. eyebrow·kicker는 라벨이라 본문 하한(23px) 적용.
    // SVG 내부 텍스트는 제외 — 로제트 배지의 .rsub(7px 설계)가 "sub" 매칭에 걸려 30px로 강제돼
    // 배지 밖으로 넘쳐 겹치던 실사례(럽앤 'SKIN TESTED' 세그6 시각감사 검출).
    '.dpg [class*="sub"]:not(svg *),.dpg [class*="lead"]:not(svg *){font-size:max(30px,1rem)!important}',
  ].join('\n')
  // 히어로 아키타입 변형의 CSS만 이미지 프레임 세로화(I1) — 다른 아키타입 이미지는 불변.
  const variantCssJoined = [...cssById.entries()]
    .map(([id, css]) => (getVariant(id)?.archetype === 'hero' ? liftHeroImageFrame(css) : css))
    .join('\n')
  const styles = [
    remapFontScale(vwToPx(baseCss(spec.tokens, width))),
    vwToPx(DECOR_CSS), // 장식은 크기 불변 — 워터마크·세로 라벨은 읽는 텍스트가 아니다
    // liftAccentText: 변형 CSS의 accent 텍스트를 --accent-fg 참조로 — 다크 씬 대비 확보
    remapFontScale(liftAccentText(vwToPx(variantCssJoined))),
    FONT_ROLE_LOCK,
    ACCENT_CONTRAST,
    deriveGridBalanceCss(variantCssJoined),
  ].join('\n')
  const title = `${spec.meta.product}`.trim() || 'Detail'

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${width}">
<title>${esc(title)}</title>
${buildFontLinks(spec.tokens)}
<style>
${styles}
</style>
</head>
<body>
<div class="dpg">
${sections.join('\n')}
</div>
</body>
</html>`

  return { html, usedVariants, blockCount: spec.blocks.length }
}

/**
 * 홀수 아이템 그리드의 빈 셀 방지 — 사용 변형 CSS에서 대칭 그리드 컨테이너를 찾아
 * "마지막 남는 셀 풀스팬" 파생 규칙을 자동 생성한다(럽앤 checkpoint-grid 3아이템
 * 우하단 빈 칸 실사례, 2026-07-24). 개별 변형 수정이 아닌 조립 계층 가드 —
 * 2열 대칭 변형 80여 개 전체 커버. 조건부 셀렉터라 아이템이 배수로 맞으면 발동하지 않는다.
 * 비대칭 2열(56px 1fr 등)은 아이콘+본문 레이아웃형이라 제외. 3열은 1개 남는 케이스(3n+1)만 —
 * 2개 남는 케이스는 풀스팬하면 비대칭이 더 어색해 손대지 않는다(시각감사 영역).
 */
export function deriveGridBalanceCss(css: string): string {
  const rules: string[] = []
  const seen = new Set<string>()
  const re = /([^{}]+)\{[^{}]*?grid-template-columns\s*:\s*([^;{}]+)[;}]/g
  for (const m of css.matchAll(re)) {
    const cols = m[2].trim()
    // repeat(N, …)는 minmax 등 중첩 괄호가 흔해 닫힘 괄호로 끝을 판정하지 않는다(시작 매치).
    // 1fr 나열형은 $ 앵커 필수 — "1fr 1fr 340px" 같은 비대칭 3열의 오분류 방지.
    // 한계: "repeat(2,1fr) 300px"처럼 repeat 뒤 추가 트랙은 오탐이나 변형 CSS에 실사례 없음.
    const three = /^(1fr\s+1fr\s+1fr$|repeat\(\s*3\s*,)/.test(cols)
    const two = !three && /^(1fr\s+1fr$|repeat\(\s*2\s*,)/.test(cols)
    if (!two && !three) continue
    for (const rawSel of m[1].split(',')) {
      const sel = rawSel.trim()
      if (!sel || sel.startsWith('@') || seen.has(sel)) continue
      seen.add(sel)
      const nth = two ? 'odd' : '3n+1'
      rules.push(`${sel}>:last-child:nth-child(${nth}){grid-column:1/-1}`)
    }
  }
  return rules.join('\n')
}

/** CSS 토큰 값 — <style> 탈출 문자(<>{}) 금지. 색(hex)·폰트('A', sans-serif) 값은 통과. */
const cssToken = z.string().regex(/^[^<>{}]*$/, 'CSS 토큰에 <>{} 문자 금지')

/** PageSpec 형태 검증용 zod 스키마 (AI 컴포저 출력 1차 검증; 슬롯 데이터는 변형별로 2차 검증). */
export const pageSpecSchema = z.object({
  meta: z.object({
    product: z.string().min(1),
    category: z.string().min(1),
    styleDirection: z.string().optional(),
  }),
  tokens: z.object({
    bg: cssToken,
    paper: cssToken,
    ink: cssToken,
    ink2: cssToken,
    muted: cssToken,
    accent: cssToken,
    accentDark: cssToken,
    brand: cssToken,
    line: cssToken,
    fontDisplay: cssToken,
    fontBody: cssToken,
    fontSerif: cssToken,
    fontHand: cssToken,
  }),
  width: z.number().optional(),
  blocks: z
    .array(z.object({ variantId: z.string().min(1), data: z.unknown(), sceneId: z.number().optional() }))
    .min(1),
})
