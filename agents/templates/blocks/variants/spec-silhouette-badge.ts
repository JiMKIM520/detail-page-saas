/** SPEC 아키타입: spec-silhouette-badge.
 *  원본: 273_제품정보_12 (와디즈 제품정보 섹션)
 *  영문 라틴 대제목(size info) + 한국어 타이틀 + 용량 카피 →
 *  제품 실루엣(SVG 또는 누끼 이미지) 위에 가로 치수선 3개(상단·중단·하단)와
 *  브랜드 컬러 원형 배지(용량 강조)가 우상단에 오버랩.
 *  하단 치수 범례 행 + 오차 안내 푸터. 이미지 부재 시 CSS 실루엣으로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 영문 라틴 대제목 — 기본 "size info" */
  titleLat: z.string().optional(),
  /** 한국어 섹션 제목 (em 허용). 예: "사이즈를 확인하세요!" */
  titleKo: z.string().min(1),
  /** 용량·핏 강조 카피 (em 허용). 예: "벤티사이즈도 <em>넉넉하게!</em>" */
  headline: z.string().min(1),
  /** 보조 설명 (em,br 허용, 선택). 예: "900ml 용량으로 하루종일 즐기세요." */
  desc: z.string().optional(),
  /** 제품 누끼/실루엣 이미지 URL (선택). 없으면 CSS 실루엣으로 강등. */
  image: z.string().optional(),
  /** 치수선 3개 — 상단(입구)·중단(동체)·하단(바닥) 순. min 2, max 3. */
  dims: z
    .array(
      z.object({
        /** 위치 레이블. 예: "입구 지름" "최대 지름" "높이" */
        label: z.string().min(1),
        /** 수치. 예: "76mm" "100mm" "260mm" */
        value: z.string().min(1),
      }),
    )
    .min(2)
    .max(3),
  /** 원형 배지 첫 줄 텍스트. 예: "용량" */
  badgeTop: z.string().min(1),
  /** 원형 배지 두 번째 줄 텍스트(강조). 예: "900ml" */
  badgeMain: z.string().min(1),
  /** 오차 안내 문구 (선택). 브리프에 근거 시만. */
  notice: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const specSilhouetteBadge = defineBlock<Data>({
  id: 'spec-silhouette-badge',
  archetype: 'spec',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '용량·치수 인포그래픽. 라틴 대제목(size info) + 한국어 섹션 타이틀 + 용량 카피 → 제품 실루엣(이미지 또는 CSS 폴백) 위에 가로 치수선 3개와 브랜드 컬러 원형 용량 배지를 우상단 오버랩. 하단 치수 범례 행 + 오차 안내. 텀블러·보틀·통조림 등 용량·사이즈 강조 식품·생활용품에 적합.',
  schema,
  css: `
/* ── 최상위 래퍼 ── */
.swgh{background:var(--bg);color:var(--ink);padding:64px var(--pad-x,56px) 60px;text-align:center}

/* ── 헤더 ── */
.swgh-lat{font-family:var(--font-lat,'Cormorant Garamond',Georgia,serif);font-weight:700;font-size:70px;
  letter-spacing:-.02em;line-height:1;color:var(--ink);text-transform:lowercase}
.swgh-title-ko{margin-top:10px;font-family:var(--font-body);font-size:22px;font-weight:400;
  color:var(--ink-2);letter-spacing:-.01em}
.swgh-headline{margin-top:22px;font-family:var(--font-display);font-weight:700;font-size:38px;
  line-height:1.25;color:var(--ink);letter-spacing:-.02em}
.swgh-headline .em{color:var(--accent)}
.swgh-desc{margin-top:12px;font-family:var(--font-body);font-size:20px;font-weight:400;
  color:var(--ink-2);line-height:1.55;letter-spacing:-.01em}
.swgh-desc .em{color:var(--accent);font-weight:600}

/* ── 실루엣 영역 래퍼 ── */
.swgh-stage{position:relative;margin:40px auto 0;width:320px;max-width:100%}

/* ── 제품 이미지 (누끼/contain) ── */
.swgh-img{width:100%;height:520px;object-fit:contain;display:block}

/* ── CSS 실루엣 폴백 (이미지 없을 때) ── */
.swgh-sil{
  width:100%;height:520px;display:flex;align-items:center;justify-content:center
}
.swgh-sil svg{width:180px;height:100%;fill:color-mix(in srgb,var(--ink) 12%,transparent)}

/* ── 치수선 오버레이 ── */
.swgh-dimlines{position:absolute;inset:0;pointer-events:none}

/* 공통: 가로 치수선 행 (수평 라인 + 화살촉 + 레이블) */
.swgh-dline{
  position:absolute;left:0;right:0;
  display:flex;align-items:center;gap:0
}
/* 치수선 수평 규칙 — ::before(왼쪽 선) ::after(오른쪽 선) */
.swgh-dline::before,.swgh-dline::after{
  content:'';flex:1;height:1px;background:var(--ink);opacity:.5
}
.swgh-dline::before{margin-right:0}
.swgh-dline::after{margin-left:0}
/* 화살촉 */
.swgh-al,.swgh-ar{
  width:0;height:0;
  border-top:4px solid transparent;border-bottom:4px solid transparent;
  opacity:.5;flex-shrink:0
}
.swgh-al{border-right:6px solid var(--ink);margin-right:0}
.swgh-ar{border-left:6px solid var(--ink);margin-left:0}
/* 치수 레이블 텍스트 */
.swgh-dlbl{
  font-family:var(--font-body);font-size:12px;font-weight:300;
  color:var(--ink);white-space:nowrap;
  background:color-mix(in srgb,var(--bg) 88%,transparent);
  padding:2px 5px;border-radius:calc(var(--r-scale,1)*3px);
  letter-spacing:.01em
}
/* 3가지 치수선 위치 — 상(입구)·중(동체)·하(바닥) */
.swgh-dline--top{top:10%}
.swgh-dline--mid{top:38%}
.swgh-dline--bot{top:78%}

/* ── 원형 배지 (브랜드 컬러, 우상단 오버랩) ── */
.swgh-badge{
  position:absolute;top:-14px;right:-14px;
  width:110px;height:110px;border-radius:50%;
  background:var(--accent);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
  box-shadow:0 8px 24px -8px color-mix(in srgb,var(--accent) 55%,transparent)
}
.swgh-badge-top{
  font-family:var(--font-display);font-size:16px;font-weight:700;
  color:#fff;letter-spacing:.04em;line-height:1.15
}
.swgh-badge-main{
  font-family:var(--font-lat,'Cormorant Garamond',Georgia,serif);font-size:26px;font-weight:700;
  color:#fff;letter-spacing:-.01em;line-height:1.1
}

/* ── 치수 범례 행 ── */
.swgh-legend{
  display:flex;justify-content:center;gap:28px;flex-wrap:wrap;
  margin:32px auto 0;max-width:600px
}
.swgh-leg-item{display:flex;align-items:center;gap:8px}
.swgh-leg-line{
  width:28px;height:1px;background:var(--ink);opacity:.4;flex-shrink:0;
  position:relative
}
.swgh-leg-line::before,.swgh-leg-line::after{
  content:'';position:absolute;top:50%;
  width:0;height:0;border-top:3px solid transparent;border-bottom:3px solid transparent;
  opacity:.4;transform:translateY(-50%)
}
.swgh-leg-line::before{left:-1px;border-right:5px solid var(--ink)}
.swgh-leg-line::after{right:-1px;border-left:5px solid var(--ink)}
.swgh-leg-label{font-family:var(--font-body);font-size:13px;font-weight:400;color:var(--muted)}
.swgh-leg-val{font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--ink)}

/* ── 오차 안내 ── */
.swgh-notice{
  margin-top:20px;font-family:var(--font-body);font-size:12px;font-weight:300;
  color:var(--muted);letter-spacing:.01em
}
`,
  render: (d, { esc, richSafe }) => {
    const titleLat = d.titleLat ?? 'size info'

    // 치수선 위치 클래스: 최대 3개, 배열 순서대로 상·중·하
    const posClasses = ['swgh-dline--top', 'swgh-dline--mid', 'swgh-dline--bot'] as const

    const dimLines = d.dims
      .map(
        (dim, i) => `
      <div class="swgh-dline ${posClasses[i] ?? posClasses[2]}">
        <span class="swgh-al"></span>
        <span class="swgh-dlbl">${esc(dim.label)} ${esc(dim.value)}</span>
        <span class="swgh-ar"></span>
      </div>`,
      )
      .join('')

    // noimg-safe: 이미지 없을 때 CSS 실루엣(단순 병/텀블러 모양 SVG)으로 강등
    // — 이미지 슬롯이 contain 전용(누끼/실루엣)이므로 object-fit:contain 사용
    const hasImg = typeof d.image === 'string' && d.image.length > 0
    const stageContent = hasImg
      ? media(d.image, 'swgh-img', '제품 실루엣')
      : `<div class="swgh-sil" aria-label="제품 실루엣 아이콘">
        <svg viewBox="0 0 180 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- 병/텀블러 실루엣: 뚜껑 → 목 → 동체 → 바닥 -->
          <rect x="62" y="0" width="56" height="28" rx="10"/>
          <rect x="54" y="28" width="72" height="18" rx="6"/>
          <path d="M38 46 Q28 120 26 260 Q26 450 40 480 Q60 510 90 512 Q120 510 140 480 Q154 450 154 260 Q152 120 142 46 Z"/>
          <ellipse cx="90" cy="510" rx="50" ry="10"/>
        </svg>
      </div>`

    // 치수 범례 행
    const legendItems = d.dims
      .map(
        (dim) => `
      <div class="swgh-leg-item">
        <span class="swgh-leg-line" aria-hidden="true"></span>
        <span class="swgh-leg-label">${esc(dim.label)}</span>
        <span class="swgh-leg-val">${esc(dim.value)}</span>
      </div>`,
      )
      .join('')

    return `
<section class="swgh">
  <h2 class="swgh-lat">${esc(titleLat)}</h2>
  <p class="swgh-title-ko">${richSafe(d.titleKo)}</p>
  <p class="swgh-headline">${richSafe(d.headline)}</p>
  ${d.desc ? `<p class="swgh-desc">${richSafe(d.desc)}</p>` : ''}

  <div class="swgh-stage">
    ${stageContent}
    <div class="swgh-dimlines" aria-hidden="true">
      ${dimLines}
    </div>
    <div class="swgh-badge" aria-label="${esc(d.badgeTop)} ${esc(d.badgeMain)}">
      <span class="swgh-badge-top">${esc(d.badgeTop)}</span>
      <span class="swgh-badge-main">${esc(d.badgeMain)}</span>
    </div>
  </div>

  <div class="swgh-legend" aria-label="치수 범례">
    ${legendItems}
  </div>

  ${d.notice ? `<p class="swgh-notice">${esc(d.notice)}</p>` : ''}
</section>`
  },
})
