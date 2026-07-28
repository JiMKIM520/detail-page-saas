/**
 * 스타일 언어 풀 (design-system.md §2.4, 2026-07-28)
 * "템플릿 조립 천장" 해소 실험(씬 자유 설계)의 스타일 축 — 기업 인테이크의 디자인 키워드
 * 선택(design_preference)이 1차 결정자, 아트디렉터가 후보 내 최종 확정.
 * 원칙: 언어끼리 상호 배타적 어휘를 가질 것(수렴 방지). 바이블은 씬 디자이너의 구속 규칙.
 * 검증 이력: editorial-split·type-as-graphic은 동원 전체 페이지 프로토(2026-07-28)로 실증.
 */

export interface StyleLanguage {
  id: string
  name: string
  /** 한 줄 정체성 — 아트디렉터 후보 제시용 */
  identity: string
  /** 인테이크 키워드(26종) 매칭 — 스코어링 근거 */
  keywords: string[]
  /** 적합 카테고리 힌트(참고용, 강제 아님) */
  fitHint: string
  /** 씬 디자이너 구속 바이블 — 전 씬 일관 적용 */
  bible: string
}

export const STYLE_LANGUAGES: readonly StyleLanguage[] = [
  {
    id: 'editorial-split',
    name: '에디토리얼 스플릿',
    identity: '라이트 베이스 위 대형 좌정렬 타이포와 마스킹 이미지가 겹치는 잡지 조판',
    keywords: ['심플한', '깔끔한', '가독성이 좋은', '고급스러운', '차분한', '뉴트럴'],
    fitHint: '식품·리빙·프리미엄 잡화 등 폭넓게 안전',
    bible: `STYLE "EDITORIAL SPLIT":
- Light editorial base; large LEFT-ALIGNED display type; generous asymmetric whitespace.
- Images bleed to one edge or sit in soft arch/rounded masks; type may overlap image edges.
- One oversized outline latin word per scene max, low contrast, as background graphic.
- Lists as hairline-ruled editorial rows (01/02…), NEVER uniform rounded cards.
- Accent used surgically: one highlight sweep, thin rules, small pills.`,
  },
  {
    id: 'type-as-graphic',
    name: '타이포 그래픽',
    identity: '초대형 타이포 자체가 그래픽이 되는 대담한 존 분할',
    keywords: ['강렬한', '트렌디한', '화려한', '비비드한', '시원시원한'],
    fitHint: '가전·테크·스포츠·이벤트성 프로모션',
    bible: `STYLE "TYPE-AS-GRAPHIC":
- Bold zone splits (dark vs light panels, diagonal cuts) — the layout IS the graphic.
- Headline typography as hero element: oversized, mixed fill/outline, partial accent coloring.
- Circular stat/claim badges overlapping image corners; staggered list rhythm with dot markers.
- Images in strong geometric frames (arch, circle, offset rect) with hard shadows or borders.
- Decisive tonal drama between zones.`,
  },
  {
    id: 'soft-organic',
    name: '소프트 오가닉',
    identity: '둥근 블롭·파스텔 면·포근한 곡선의 아기자기한 조판',
    keywords: ['아기자기한', '귀여운', '따뜻한', '부드러운', '파스텔톤', '친근한', '밝은'],
    fitHint: '펫·키즈·디저트·소형 생활잡화',
    bible: `STYLE "SOFT ORGANIC":
- Rounded everything: blob shapes, pill containers, wavy section dividers, generous corner radii.
- Pastel tint fields derived from brand color (color-mix with white 70~85%) as scene zoning.
- Playful scale: one oversized rounded number or sticker-like circle per scene; soft drop shadows.
- Images in organic blob/squircle masks; small doodle-like accents (dots, sparkles) via CSS only.
- Type friendly and rounded-feeling; short line lengths; airy line-height.`,
  },
  {
    id: 'natural-analog',
    name: '내추럴 아날로그',
    identity: '크라프트지·수제 감성·따뜻한 질감의 자연주의 조판',
    keywords: ['자연스러운', '친환경적인', '아날로그', '편안한'],
    fitHint: '농수산·수제 식품·친환경 생활용품',
    bible: `STYLE "NATURAL ANALOG":
- Warm paper-like base (brand color mixed heavily toward cream); muted earth accents.
- Hand-crafted cues via CSS: dashed/stitched borders, stamp-like labels, slightly rotated tags.
- Serif for story passages; letterpress feel via tight tracking on labels.
- Images in simple rectangular frames with generous paper margin (polaroid feel allowed once).
- Rhythm calm and vertical; no hard geometric drama; dividers as thin double rules.`,
  },
  {
    id: 'dark-luxury',
    name: '다크 럭셔리',
    identity: '딥 다크 배경·세리프·금속 디테일의 절제된 프리미엄',
    keywords: ['고급스러운', '모노톤', '차분한'],
    fitHint: '프리미엄 뷰티·주류·주얼리·선물세트',
    bible: `STYLE "DARK LUXURY":
- Deep dark base scenes dominate (brand color mixed toward near-black); light scenes as rare relief.
- Serif display type, wide letter-spacing on latin eyebrows; thin 1px metallic-feel rules via accent.
- Massive negative space; single centered or golden-ratio-offset compositions; no clutter.
- Images large and cinematic, edge-to-edge or in thin-bordered frames; subtle vignettes.
- Ornament minimal: one hairline frame or small emblem per scene at most.`,
  },
  {
    id: 'swiss-minimal',
    name: '스위스 미니멀',
    identity: '정직한 그리드·기능주의 타이포·인포그래픽 강점의 국제주의',
    keywords: ['심플한', '깔끔한', '가독성이 좋은', '뉴트럴', '시원시원한'],
    fitHint: '가전·테크·사무·기능성 제품',
    bible: `STYLE "SWISS MINIMAL":
- Strict visible grid: aligned columns, exposed structure, flush-left rag-right type.
- Big functional numerals (specs, stats) as design elements; tabular data celebrated, not hidden.
- Color: mostly neutral surfaces + brand color as functional marker (rules, active states).
- Images cropped rationally in grid cells; no decorative masking; generous but systematic spacing.
- No ornament. Hierarchy through size/weight/position only.`,
  },
  {
    id: 'magazine-lifestyle',
    name: '매거진 라이프스타일',
    identity: '큰 화보 사진 중심·캡션 조판·여백 호흡의 라이프스타일 무드',
    keywords: ['감성적인', '편안한', '따뜻한', '부드러운'],
    fitHint: '리빙·패션잡화·카페·라이프스타일 식품',
    bible: `STYLE "MAGAZINE LIFESTYLE":
- Photography leads: full-bleed or 80%-width images open most scenes; copy follows as captions.
- Caption typography: small serif/sans mix, tight column widths (~20 chars), italic-feel accents.
- Scenes breathe: tall whitespace bands between image and text; page number-like small labels.
- Pull-quote treatment for key claims (large serif line with hairline rules above/below).
- Color minimal — let photos carry color; brand color only in fine details.`,
  },
  {
    id: 'pop-retro',
    name: '팝 레트로',
    identity: '고채도 색면·스티커 배지·굵은 아웃라인의 유쾌한 레트로 팝',
    keywords: ['컬러풀한', '활기찬', '트렌디한', '밝은', '화려한'],
    fitHint: '스낵·음료·영타깃 뷰티·굿즈',
    bible: `STYLE "POP RETRO":
- High-chroma color blocking: alternating saturated tint fields (derived from brand+accent).
- Thick outlines (2~3px) on frames, buttons, badges; sticker-style rotated labels; starbursts via CSS.
- Chunky rounded display type with hard offset shadows (no blur); marquee-like repeated word strips allowed once.
- Images in bold outlined frames or circle crops; checkerboard/stripe pattern bands as dividers.
- Energy high but ordered: repeatable rhythm, consistent outline weight everywhere.`,
  },
  {
    id: 'clean-clinical',
    name: '클린 클리니컬',
    identity: '화이트·데이터 시각화·인증 중심의 임상적 신뢰 조판',
    keywords: ['깔끔한', '차분한', '가독성이 좋은', '심플한'],
    fitHint: '건강기능식품·더마 뷰티·유아·의료기기 인접',
    bible: `STYLE "CLEAN CLINICAL":
- Near-white base; single calm brand-tint zone per scene; abundant clinical whitespace.
- Data visualized: percentage bars, dosage scales, comparison tables as designed elements (thin strokes, precise labels).
- Certification/test elements in bordered "document-like" cards with mono-spaced feel numerals.
- Images clean-cut on white or soft gradient; no decorative masking; soft single shadow max.
- Tone: precise, unhurried; emphasis via brand-color underlines, never loud color fields.`,
  },
] as const

export type StyleLanguageId = (typeof STYLE_LANGUAGES)[number]['id']

/** 기업 인테이크 키워드(design_preference, 콤마 분리) → 언어 후보 스코어링.
 *  반환: 점수 내림차순 상위 후보(동점 포함 최대 3). 무매칭 시 빈 배열(아트디렉터 자유 판단). */
export function rankStyleLanguages(styleDirections: string[]): Array<{ id: string; name: string; score: number; matched: string[] }> {
  const picks = styleDirections.map((s) => s.trim()).filter(Boolean)
  if (!picks.length) return []
  const scored = STYLE_LANGUAGES.map((lang) => {
    const matched = picks.filter((p) => lang.keywords.some((k) => k === p || p.includes(k) || k.includes(p)))
    return { id: lang.id, name: lang.name, score: matched.length, matched }
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, 3)
}

export function getStyleLanguage(id: string): StyleLanguage | undefined {
  return STYLE_LANGUAGES.find((l) => l.id === id)
}
