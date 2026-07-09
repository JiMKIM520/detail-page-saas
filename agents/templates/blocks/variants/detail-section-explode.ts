/** DETAIL 아키타입: detail-section-explode.
 *  피그마 315_제품소개_34 패턴 재구성.
 *  대형 세리프 섹션번호(point 0N) 좌+타이틀 우 → 풀폭 히어로 이미지 →
 *  3열 정사각 썸네일 → 풀폭 서브 이미지 → 서브제목+설명 →
 *  제품 단면 이미지 위 인라인 SVG 방사선+레이블 분해도(callout). 라이트 배경. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const layerSchema = z.object({
  label: z.string().min(1), // 소재 레이어 이름 (예: "천연 코르크")
  /** 분해선 수직 오프셋 — 0~100 (퍼센트). 위에서 몇 % 지점에 선을 그을지. */
  offsetPct: z.number().min(5).max(95),
})

const schema = z.object({
  /** 섹션 번호 — "01" / "02" 형태 숫자 문자열 */
  sectionNum: z.string().min(1).max(4),
  /** 섹션 주제어 (대형 세리프 — em 허용) */
  sectionTitle: z.string().min(1),
  /** 섹션 부제 (em/br 허용) */
  sectionSub: z.string().optional(),
  /** 풀폭 히어로 이미지 URL */
  heroImage: z.string().optional(),
  /** 3열 정사각 썸네일 (2~3개) */
  thumbs: z
    .array(
      z.object({
        image: z.string().optional(),
        caption: z.string().optional(),
      }),
    )
    .min(2)
    .max(3),
  /** 풀폭 서브 이미지 URL */
  subImage: z.string().optional(),
  /** 서브제목 (em 허용) */
  featureTitle: z.string().optional(),
  /** 서브 설명 (em/br 허용) */
  featureDesc: z.string().optional(),
  /** 제품 단면 분해도 이미지 URL */
  explodeImage: z.string().optional(),
  /** 소재 레이어 레이블 (2~5개) — 이미지 오른쪽에 방사선+텍스트 */
  layers: z.array(layerSchema).min(2).max(5),
})
type Data = z.infer<typeof schema>

export const detailSectionExplode = defineBlock<Data>({
  id: 'detail-section-explode',
  archetype: 'detail',
  styleTags: ['light', 'editorial', 'warm', 'infographic', 'noimg-safe'],
  imageSlots: 6, // hero + 3 thumbs + sub + explode
  describe:
    '제품 상세 서술 + 분해도 callout 블록. 대형 세리프 섹션번호(point 0N) 좌+제목 우 헤더 → 풀폭 히어로 이미지 → 3열 정사각 썸네일 → 풀폭 서브 이미지 → 서브제목·설명 → 제품 단면 이미지 위 인라인 SVG 방사선·소재 레이블 분해도. 신발·가방·가구·식품 등 소재 구조를 시각적으로 해설할 때 사용.',
  schema,
  css: `
/* ── detail-section-explode (dnll 접두) ───────────────────────── */
.dnll{background:var(--bg);color:var(--ink);padding-bottom:64px}

/* 타이틀 행 */
.dnll-hd{display:flex;align-items:flex-start;gap:0;padding:52px var(--pad-x,56px) 0}
.dnll-num{flex:0 0 138px;text-align:center;line-height:1}
.dnll-num-label{font-family:var(--font-serif);font-weight:700;font-size:22px;color:var(--accent);letter-spacing:.18em;text-transform:uppercase}
.dnll-num-digit{font-family:var(--font-serif);font-weight:700;font-size:108px;color:var(--accent);line-height:.92;margin-top:2px}
.dnll-title-block{flex:1;padding-left:28px;border-left:2px solid var(--line);margin-top:4px}
.dnll-title{font-family:var(--font-serif);font-weight:700;font-size:52px;line-height:1.12;color:var(--accent-d)}
.dnll-title .em{color:var(--brand)}
.dnll-sub{margin-top:14px;font-size:22px;font-family:var(--font-serif);font-weight:400;color:var(--ink-2);line-height:1.5}
.dnll-sub .em{color:var(--accent-d);font-weight:700}

/* 풀폭 히어로 이미지 */
.dnll-hero{width:100%;aspect-ratio:860/540;object-fit:cover;display:block;margin-top:32px;background:color-mix(in srgb,var(--accent) 8%,var(--bg));border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
.dnll-hero.ph{display:none!important}

/* 3열 썸네일 */
.dnll-thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:18px var(--pad-x,56px) 0}
.dnll-thumb-wrap{position:relative;overflow:hidden;border-radius:calc(var(--r-scale,1)*10px);background:color-mix(in srgb,var(--accent) 6%,var(--bg))}
.dnll-thumb-wrap::before{content:'';display:block;padding-top:100%}
.dnll-thumb-wrap img,.dnll-thumb-wrap .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}
.dnll-thumb-wrap .ph{display:none!important}
.dnll-thumb-cap{position:absolute;bottom:0;left:0;right:0;padding:6px 10px;font-size:13px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.45));font-family:var(--font-body);font-weight:500;line-height:1.3}

/* 풀폭 서브 이미지 */
.dnll-sub-img{width:100%;aspect-ratio:860/480;object-fit:cover;display:block;margin-top:18px;background:color-mix(in srgb,var(--accent) 6%,var(--bg));border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
.dnll-sub-img.ph{display:none!important}

/* 서브제목 + 설명 */
.dnll-feat{padding:36px var(--pad-x,56px) 0}
.dnll-feat-title{font-family:var(--font-serif);font-weight:700;font-size:32px;color:var(--accent-d);line-height:1.25}
.dnll-feat-title .em{color:var(--accent)}
.dnll-feat-desc{margin-top:12px;font-size:18px;font-weight:300;color:var(--ink-2);line-height:1.75;max-width:720px}
.dnll-feat-desc .em{color:var(--accent-d);font-weight:600}

/* 분해도 영역 */
.dnll-explode{position:relative;margin-top:40px;width:100%;overflow:hidden;background:color-mix(in srgb,var(--ink) 3%,var(--bg))}
.dnll-explode img{width:100%;display:block;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
.dnll-explode img.ph{display:none!important}
/* SVG 오버레이 — 절대 좌표는 viewBox 기준 */
.dnll-explode-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
/* 이미지 없을 때 SVG만 남아 무너지는 것을 방지 — 최소 높이 보장 */
.dnll-explode:not(:has(img:not(.ph))){min-height:220px}
/* 분해선 색 */
.dnll-explode-svg line{stroke:var(--accent-d);stroke-width:1.6;opacity:.85}
.dnll-explode-svg circle{fill:var(--accent-d);opacity:.9}
/* 레이블 */
.dnll-layer-label{font-size:15px;font-family:var(--font-body);font-weight:500;fill:var(--ink);dominant-baseline:middle}
/* 레이블 배경 직사각형 */
.dnll-layer-bg{fill:var(--bg);rx:4;ry:4;opacity:.82}
`,
  render: (d, { esc, richSafe }) => {
    // 썸네일 — 이미지가 전혀 없으면 캡션 전용 심플 리스트로 강등
    const thumbsHaveAnyImg = d.thumbs.some(
      (t) => typeof t.image === 'string' && /^(https?:\/\/|data:|\/)/.test(t.image.trim()),
    )

    const thumbsHtml = d.thumbs
      .map(
        (t) => `
    <div class="dnll-thumb-wrap">
      ${media(t.image, '', '제품 썸네일')}
      ${t.caption ? `<span class="dnll-thumb-cap">${esc(t.caption)}</span>` : ''}
    </div>`,
      )
      .join('')

    // 분해도 SVG 오버레이 — viewBox 1000×500 기준 좌표계
    // 선: x=0(이미지 좌중간 기준점) → x=560(우측 레이블 연결점), y = offsetPct%
    // 레이블 패널: x=570 ~ x=980
    const VB_W = 1000
    const VB_H = 500
    const LINE_X1 = 40   // 이미지 내부 시작 (좌측 기준점)
    const LINE_X2 = 570  // 오른쪽 연결점
    const DOT_R = 4
    const LABEL_X = 582
    const LABEL_MAX_W = 360

    const layerOverlay = `
<svg class="dnll-explode-svg" viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="none" aria-hidden="true">
  ${d.layers
    .map((layer) => {
      const cy = Math.round((layer.offsetPct / 100) * VB_H)
      const labelText = esc(layer.label)
      // 가로선 + 점 + 레이블 배경 + 레이블 텍스트
      return `
  <g>
    <line x1="${LINE_X1}" y1="${cy}" x2="${LINE_X2}" y2="${cy}"/>
    <circle cx="${LINE_X1}" cy="${cy}" r="${DOT_R}"/>
    <circle cx="${LINE_X2}" cy="${cy}" r="${DOT_R}"/>
    <rect class="dnll-layer-bg" x="${LABEL_X}" y="${cy - 14}" width="${LABEL_MAX_W}" height="28" rx="4" ry="4"/>
    <text class="dnll-layer-label" x="${LABEL_X + 10}" y="${cy}">${labelText}</text>
  </g>`
    })
    .join('')}
</svg>`

    return `
<section class="dnll">
  <!-- 타이틀 행 -->
  <div class="dnll-hd">
    <div class="dnll-num">
      <div class="dnll-num-label">point</div>
      <div class="dnll-num-digit">${esc(d.sectionNum)}</div>
    </div>
    <div class="dnll-title-block">
      <h2 class="dnll-title">${richSafe(d.sectionTitle)}</h2>
      ${d.sectionSub ? `<p class="dnll-sub">${richSafe(d.sectionSub)}</p>` : ''}
    </div>
  </div>

  <!-- 풀폭 히어로 이미지 -->
  ${media(d.heroImage, 'dnll-hero', '제품 메인 이미지')}

  <!-- 3열 썸네일 -->
  ${thumbsHaveAnyImg || d.thumbs.some((t) => t.caption)
    ? `<div class="dnll-thumbs">${thumbsHtml}</div>`
    : ''}

  <!-- 풀폭 서브 이미지 -->
  ${media(d.subImage, 'dnll-sub-img', '제품 서브 이미지')}

  <!-- 서브제목 + 설명 -->
  ${d.featureTitle || d.featureDesc
    ? `<div class="dnll-feat">
    ${d.featureTitle ? `<h3 class="dnll-feat-title">${richSafe(d.featureTitle)}</h3>` : ''}
    ${d.featureDesc ? `<p class="dnll-feat-desc">${richSafe(d.featureDesc)}</p>` : ''}
  </div>`
    : ''}

  <!-- 제품 단면 분해도 -->
  <div class="dnll-explode">
    ${media(d.explodeImage, '', '제품 단면 분해도')}
    ${layerOverlay}
  </div>
</section>`
  },
})
