/** SPEC 아키타입: spec-foot-measure-grid
 *  원본: 330_제품정보_15 (신발 사이즈 안내 섹션)
 *  가로선 타이틀 밴드 + 발 측정 가이드 일러스트 영역 + 사이즈 그리드 표(3행×6열) + 팁 배너.
 *  핵심 장치: 발 측정 방법 인라인 SVG 도해(가로·세로 측정선 + 발 이미지)와
 *  좌측 레이블드 사이즈 표를 872px 데스크톱 화면에 결합.
 *  이미지 없을 시 SVG 크로스해치 placeholder로 강등(noimg-safe).
 *  톤: light / archetype: spec
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* ── 사이즈 표 행 스키마 ── */
const rowSchema = z.object({
  /** 행 레이블 (예: "사이즈", "추천 발 길이(cm)", "발 볼 넓이(cm)") */
  rowLabel: z.string().min(1),
  /** 6개 열 값. 브리프에 값 근거가 있을 때만 실수치 기입, 없으면 "-" 허용 */
  cells: z.array(z.string().min(1)).min(3).max(6),
})

const schema = z.object({
  /** 영문 라틴 대제목 (기본 "size info"). 라틴 폰트. */
  titleLat: z.string().optional(),
  /** 한국어 헤드라인 (em/br 허용) */
  titleKo: z.string().min(1),
  /** 헤드라인 아래 부제 (순수 텍스트) */
  subtitle: z.string().optional(),
  /** 측정 가이드 설명 문구 (em/br 허용). 없으면 기본 문구 사용. */
  guideDesc: z.string().optional(),
  /** 측정 단위 표기 (기본 "단위 : cm") */
  guideUnit: z.string().optional(),
  /** 발 이미지 URL (누끼 또는 단면 일러스트 권장). 없으면 SVG 도해로 강등. */
  footImage: z.string().optional(),
  /** 사이즈 표 열 헤더 (사이즈 번호 등). 3~6개. 브리프 근거 시에만. */
  colHeaders: z.array(z.string().min(1)).min(3).max(6),
  /** 사이즈 표 데이터 행 (2~4개). 첫 행이 사이즈 번호 행이면 rowLabel="사이즈" */
  rows: z.array(rowSchema).min(2).max(4),
  /** 팁 배너 문구 (순수 텍스트). 브리프 근거 시에만. */
  tip: z.string().optional(),
  /** 측정 오차 안내 (순수 텍스트). 브리프 근거 시에만. */
  notice: z.string().optional(),
})

type Data = z.infer<typeof schema>

export const specFootMeasureGrid = defineBlock<Data>({
  id: 'spec-foot-measure-grid',
  archetype: 'spec',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '신발·슬리퍼 사이즈 안내 블록. 라틴 대제목 가로선 밴드 + 한국어 헤드라인 + 발 측정 도해(인라인 SVG 측정선+발 이미지) + 3행×최대6열 사이즈 그리드 표 + 팁 배너. 이미지 없을 시 SVG 크로스해치로 강등(noimg-safe). 신발·양말·인솔 등 풋웨어 전용.',
  schema,
  css: `
/* ── 최상위 ── */
.sibw{background:var(--bg);color:var(--ink);padding:64px var(--pad-x,56px) 60px}

/* ── 타이틀 밴드 ── */
.sibw-band{display:flex;align-items:center;gap:0;margin-bottom:32px}
.sibw-band-line{flex:0 0 32px;height:1px;background:var(--accent,#836f57)}
.sibw-band-title{
  padding:0 14px;
  font-family:var(--font-lat);font-size:38px;font-weight:700;
  color:var(--accent,#836f57);letter-spacing:.01em;line-height:1;white-space:nowrap
}
.sibw-band-line-r{flex:1;height:1px;background:var(--accent,#836f57)}

/* ── 헤드라인 ── */
.sibw-headline{
  font-family:var(--font-body);font-size:40px;font-weight:400;
  color:var(--accent,#836f57);letter-spacing:-.01em;line-height:1.2;margin-bottom:8px
}
.sibw-subtitle{
  font-family:var(--font-body);font-size:26px;font-weight:300;
  color:var(--accent,#836f57);letter-spacing:-.01em;margin-bottom:40px
}

/* ── 구분선 ── */
.sibw-divider{width:100%;height:1px;background:var(--line);margin-bottom:32px}

/* ── 측정 가이드 컨테이너 (좌: 텍스트+단위 / 우: 도해 패널) ── */
.sibw-guide{
  display:flex;gap:48px;align-items:flex-start;
  background:color-mix(in srgb,var(--accent,#836f57) 5%,var(--bg));
  border-radius:calc(var(--r-scale,1)*16px);
  padding:40px 44px;margin-bottom:8px
}
.sibw-guide-text{flex:0 0 240px;display:flex;flex-direction:column;gap:24px}
.sibw-guide-label{
  font-family:var(--font-body);font-size:26px;font-weight:500;
  color:var(--accent,#836f57);line-height:1.35
}
.sibw-guide-desc{
  font-family:var(--font-body);font-size:24px;font-weight:300;
  color:var(--accent,#836f57);line-height:1.65;white-space:pre-line
}
.sibw-guide-unit{
  font-family:var(--font-body);font-size:20px;font-weight:300;
  color:var(--accent,#836f57)
}

/* ── 도해 패널 ── */
.sibw-diagram{position:relative;flex:1;min-height:280px}

/* 이미지 발 사진 */
.sibw-foot-img{
  width:120px;position:absolute;left:50%;top:50%;
  transform:translate(-50%,-50%);
  object-fit:contain;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px))
}
.sibw-foot-img.ph{display:none!important}

/* SVG 강등 placeholder (이미지 없을 때) */
.sibw-foot-svg{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:100px;height:250px
}

/* 측정선 SVG 오버레이 */
.sibw-measure-svg{
  position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none
}

/* ── 팁 배너 ── */
.sibw-tip{
  background:color-mix(in srgb,var(--accent,#836f57) 18%,var(--bg));
  border-radius:calc(var(--r-scale,1)*8px);
  padding:14px 24px;margin-top:0;
  font-family:var(--font-body);font-size:22px;font-weight:400;
  color:var(--accent,#836f57);text-align:center;line-height:1.5
}

/* ── 사이즈 표 ── */
.sibw-table-wrap{margin-top:32px;overflow-x:auto;width:100%}
.sibw-table{width:100%;border-collapse:collapse;table-layout:fixed}
.sibw-table th,.sibw-table td{
  padding:16px 8px;text-align:center;
  font-family:var(--font-body);font-size:16px;line-height:1.4;
  background:color-mix(in srgb,var(--accent,#836f57) 6%,var(--bg))
}
/* 헤더 열 (첫 번째 td/th — 행 레이블) */
.sibw-table .sibw-th-row{
  background:var(--accent,#836f57);color:var(--bg);
  font-weight:600;font-size:16px;width:160px
}
/* 헤더 행 (사이즈 번호) */
.sibw-table thead tr{background:color-mix(in srgb,var(--accent,#836f57) 6%,var(--bg))}
.sibw-table thead th{
  font-weight:400;font-size:16px;
  color:color-mix(in srgb,var(--ink) 55%,transparent);
  border-bottom:1px solid color-mix(in srgb,var(--accent,#836f57) 20%,transparent)
}
.sibw-table thead th.sibw-th-row{
  background:var(--accent,#836f57);color:var(--bg)
}
/* 데이터 행 값 */
.sibw-table tbody td{
  color:color-mix(in srgb,var(--ink) 60%,transparent);font-weight:400
}

/* ── 오차 안내 ── */
.sibw-notice{
  margin-top:18px;font-family:var(--font-body);font-size:17px;font-weight:300;
  color:var(--muted);text-align:center;letter-spacing:.01em
}
`,
  render: (d, { esc, richSafe }) => {
    const titleLat = d.titleLat ?? 'size info'
    const guideLabel = '발 길이 측정 방법'
    const guideDesc = d.guideDesc ?? '뒤꿈치 끝에서\n가장 긴 발가락 끝까지\n길이를 측정하세요.'
    const guideUnit = d.guideUnit ?? '단위 : cm'
    const hasFootImg = typeof d.footImage === 'string' && d.footImage.length > 0

    /* 열 헤더 셀 */
    const colHeaderCells = d.colHeaders
      .map((h) => `<th>${esc(h)}</th>`)
      .join('')

    /* 데이터 행 */
    const dataRows = d.rows
      .map((row) => {
        const valueCells = row.cells
          .slice(0, d.colHeaders.length)
          .map((v) => `<td>${esc(v)}</td>`)
          .join('')
        return `<tr><td class="sibw-th-row">${esc(row.rowLabel)}</td>${valueCells}</tr>`
      })
      .join('\n        ')

    return `
<section class="sibw">

  <!-- 타이틀 밴드 -->
  <div class="sibw-band">
    <span class="sibw-band-line"></span>
    <span class="sibw-band-title">${esc(titleLat)}</span>
    <span class="sibw-band-line-r"></span>
  </div>

  <!-- 헤드라인 -->
  <h2 class="sibw-headline">${richSafe(d.titleKo)}</h2>
  ${d.subtitle ? `<p class="sibw-subtitle">${esc(d.subtitle)}</p>` : ''}

  <div class="sibw-divider"></div>

  <!-- 발 측정 가이드 -->
  <div class="sibw-guide">
    <div class="sibw-guide-text">
      <span class="sibw-guide-label">${esc(guideLabel)}</span>
      <span class="sibw-guide-desc">${esc(guideDesc)}</span>
      <span class="sibw-guide-unit">${esc(guideUnit)}</span>
    </div>
    <div class="sibw-diagram">
      <!-- 발 이미지 또는 SVG 강등 placeholder -->
      ${hasFootImg
        ? media(d.footImage, 'sibw-foot-img', '발 길이 측정 도해')
        : `<svg class="sibw-foot-svg" viewBox="0 0 100 250" fill="none" aria-label="발 도해">
        <!-- 발 실루엣 (단순 둥근 사각) -->
        <rect x="20" y="10" width="60" height="220" rx="30" ry="30"
              fill="color-mix(in srgb,var(--accent,#836f57) 12%,transparent)"
              stroke="var(--accent,#836f57)" stroke-width="1.5" stroke-dasharray="4 3"/>
        <!-- 가장 긴 발가락 표시 -->
        <circle cx="48" cy="18" r="5"
                fill="var(--accent,#836f57)" opacity=".45"/>
      </svg>`
      }

      <!-- 측정선 SVG 오버레이 -->
      <svg class="sibw-measure-svg" viewBox="0 0 320 280" preserveAspectRatio="xMidYMid meet">
        <!-- 가로 측정선 (상단) — 발 폭 -->
        <line x1="60" y1="56" x2="260" y2="56"
              stroke="var(--accent,#836f57)" stroke-width="1.2" opacity=".55"/>
        <polygon points="60,52 60,60 52,56" fill="var(--accent,#836f57)" opacity=".55"/>
        <polygon points="260,52 260,60 268,56" fill="var(--accent,#836f57)" opacity=".55"/>

        <!-- 세로 측정선 (왼쪽) — 발 길이 -->
        <line x1="44" y1="56" x2="44" y2="224"
              stroke="var(--accent,#836f57)" stroke-width="1.2" opacity=".55"/>
        <polygon points="40,56 48,56 44,48" fill="var(--accent,#836f57)" opacity=".55"/>
        <polygon points="40,224 48,224 44,232" fill="var(--accent,#836f57)" opacity=".55"/>
      </svg>
    </div>
  </div>

  ${d.tip ? `<div class="sibw-tip">${esc(d.tip)}</div>` : ''}

  <!-- 사이즈 표 -->
  <div class="sibw-table-wrap">
    <table class="sibw-table">
      <thead>
        <tr>
          <th class="sibw-th-row">사이즈</th>
          ${colHeaderCells}
        </tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>
  </div>

  ${d.notice ? `<p class="sibw-notice">${esc(d.notice)}</p>` : ''}
</section>`
  },
})
