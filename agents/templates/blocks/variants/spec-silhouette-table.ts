/** SPEC 아키타입: spec-silhouette-table.
 *  피그마 271_제품정보_10 패턴 재구성.
 *  실루엣 도해(SVG 의류 실루엣 + 치수 라벨선) 좌측 + 5열 사이즈 표 우측, size tip 하단.
 *  데스크톱 2단 레이아웃(872px 기준). 벡터 장식 전부 인라인 SVG/CSS — 이미지 에셋 참조 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 치수 라벨 컬럼 헤더 정의 (사이즈 열 제외 최대 5개) */
const dimSchema = z.object({
  key: z.string().min(1),   // 컬럼 키(고유, 영소문자 권장)
  label: z.string().min(1), // 표 헤더에 표시할 한글 라벨 (예: 어깨, 가슴, 소매, 총길이)
})

/** 사이즈 행 1개 */
const rowSchema = z.object({
  size: z.string().min(1),                      // 사이즈명 (예: S, M, L, XL)
  values: z.record(z.string(), z.string()),     // key → 수치 문자열 (예: { shoulder: "38cm" })
})

const schema = z.object({
  /** 섹션 상단 영문 데코 타이틀 (em 허용). 기본 "SIZE GUIDE". */
  decoTitle: z.string().optional(),
  /** 한국어 부제목. 기본 "사이즈를 확인하세요". */
  subtitle: z.string().optional(),
  /** 상품 이미지 (누끼/실루엣 용). URL 없으면 SVG 기본 의류 실루엣으로 강등. */
  image: z.string().optional(),
  /** 치수 라벨 목록 — 표 헤더 컬럼 순서도 이 배열 순서. min 1 max 5. */
  dims: z.array(dimSchema).min(1).max(5),
  /** 사이즈 행 목록 (S/M/L/XL 등). min 1 max 6. */
  rows: z.array(rowSchema).min(1).max(6),
  /** size tip 제목 (선택, em 허용). 브리프에 핏·소재 설명이 있을 때만. */
  tipTitle: z.string().optional(),
  /** size tip 본문 (선택). 브리프에 근거 있을 때만. */
  tipBody: z.string().optional(),
  /** 계측 허용 오차 안내 (선택). 예: "※ 신축성 있는 원단으로 ±2cm 오차 있을 수 있습니다". */
  toleranceNote: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const specSilhouetteTable = defineBlock<Data>({
  id: 'spec-silhouette-table',
  archetype: 'spec',
  styleTags: ['light', 'editorial', 'fashion', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '사이즈 가이드 블록. 상품 이미지(누끼) 또는 SVG 의류 실루엣 + 치수 라벨선 좌측, 5열 사이즈 표 우측 2단 배치. 하단 size tip + 오차 안내. 패션/의류 상세페이지 spec 섹션. 이미지 없을 때 SVG 실루엣으로 자동 강등.',
  schema,
  css: `
.sstb{background:var(--bg);color:var(--ink);padding:64px var(--pad-x,56px) 72px}
/* 섹션 헤더 */
.sstb-hd{text-align:center;margin-bottom:44px}
.sstb-deco{font-family:var(--font-lat);font-weight:600;font-size:52px;color:var(--accent);letter-spacing:.06em;line-height:1}
.sstb-deco .em{color:var(--ink)}
.sstb-sub{margin-top:10px;font-size:18px;font-weight:400;color:var(--ink-2);letter-spacing:.02em}
/* 2단 본문 */
.sstb-body{display:flex;gap:48px;align-items:flex-start}
/* 좌측: 실루엣 도해 */
.sstb-silhouette{flex:0 0 260px;width:260px;position:relative}
.sstb-diagram{position:relative;width:260px;height:320px}
/* 이미지 있을 때 */
.sstb-img{width:100%;height:100%;object-fit:contain;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px))}
.sstb-img.ph{display:none!important}
/* SVG 기본 실루엣 (이미지 없을 때 표시) */
.sstb-svg-wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.sstb-svg-wrap svg{width:160px;height:auto}
/* 치수 라벨 오버레이 (이미지/SVG 위에 겹침) */
.sstb-labels{position:absolute;inset:0;pointer-events:none}
.sstb-lbl{position:absolute;display:flex;align-items:center;gap:6px;white-space:nowrap}
.sstb-lbl-line{flex:0 0 28px;height:1px;background:var(--accent);opacity:.7}
.sstb-lbl-text{font-size:13px;font-weight:500;color:var(--accent);letter-spacing:.04em}
/* 라벨 위치 (4방향 배치 — CSS absolute로 실루엣 주변 고정) */
.sstb-lbl-shoulder{top:22%;left:0;transform:translateY(-50%)}
.sstb-lbl-shoulder .sstb-lbl-line{order:-1}
.sstb-lbl-chest{top:42%;left:0;transform:translateY(-50%)}
.sstb-lbl-chest .sstb-lbl-line{order:-1}
.sstb-lbl-sleeve{top:38%;right:0;transform:translateY(-50%);flex-direction:row-reverse}
.sstb-lbl-sleeve .sstb-lbl-line{order:-1}
.sstb-lbl-length{bottom:8%;left:50%;transform:translateX(-50%);flex-direction:column}
.sstb-lbl-length .sstb-lbl-line{width:1px;height:22px;flex:none}
.sstb-lbl-length .sstb-lbl-text{font-size:12px}
/* 우측: 표 영역 */
.sstb-table-wrap{flex:1;min-width:0}
.sstb-table{width:100%;border-collapse:collapse;table-layout:fixed}
.sstb-table th{background:var(--accent);color:var(--bg);font-size:14px;font-weight:600;padding:12px 8px;text-align:center;border-right:1px solid rgba(255,255,255,.2)}
.sstb-table th:last-child{border-right:none}
.sstb-table td{font-size:14px;font-weight:400;color:var(--accent);padding:11px 8px;text-align:center;border-bottom:1px solid var(--line);border-right:1px solid var(--line)}
.sstb-table td:last-child{border-right:none}
.sstb-table td:first-child{font-weight:600;color:var(--ink)}
.sstb-table tr:last-child td{border-bottom:none}
.sstb-table tr:nth-child(even) td{background:color-mix(in srgb,var(--accent) 5%,transparent)}
/* 하단 tip + 오차 */
.sstb-footer{margin-top:44px}
.sstb-tip-title{font-family:var(--font-lat);font-weight:600;font-size:30px;color:var(--accent);letter-spacing:.05em;margin-bottom:10px}
.sstb-tip-title .em{color:var(--ink)}
.sstb-tip-body{font-size:15px;line-height:1.75;color:var(--ink-2);max-width:680px}
.sstb-tolerance{margin-top:18px;font-size:13px;color:var(--muted);text-align:center}
/* 반응형: 좁은 폭에서 1단 수직 전환 */
@media(max-width:640px){
  .sstb-body{flex-direction:column}
  .sstb-silhouette{width:100%;flex:none}
  .sstb-diagram{width:100%;height:280px}
}
`,
  render: (d, { esc, richSafe }) => {
    const decoTitle = d.decoTitle ?? 'SIZE GUIDE'
    const subtitle = d.subtitle ?? '사이즈를 확인하세요'

    // 이미지 있으면 <img>, 없으면 SVG 기본 실루엣
    const hasImage = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    // 기본 SVG 의류 실루엣 (상의 티셔츠/니트 기준 — 이미지 에셋 없이 인라인 구성)
    const fallbackSvg = `
<div class="sstb-svg-wrap">
  <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- 몸통 -->
    <path d="M50 52 L20 80 L35 86 L35 178 L125 178 L125 86 L140 80 L110 52 Q95 62 80 62 Q65 62 50 52Z"
      fill="color-mix(in srgb,var(--accent) 14%,transparent)"
      stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
    <!-- 왼소매 -->
    <path d="M50 52 Q40 48 20 80 L35 86 Q44 70 48 60Z"
      fill="color-mix(in srgb,var(--accent) 10%,transparent)"
      stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
    <!-- 오른소매 -->
    <path d="M110 52 Q120 48 140 80 L125 86 Q116 70 112 60Z"
      fill="color-mix(in srgb,var(--accent) 10%,transparent)"
      stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
    <!-- 넥라인 -->
    <path d="M68 52 Q80 44 92 52" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
  </svg>
</div>`

    // 치수 라벨 오버레이: 처음 4개 dim에 CSS 클래스로 위치 매핑
    const labelClasses = [
      'sstb-lbl-shoulder',
      'sstb-lbl-chest',
      'sstb-lbl-sleeve',
      'sstb-lbl-length',
    ]
    const labelHtml = d.dims
      .slice(0, 4)
      .map((dim, i) => {
        const cls = labelClasses[i] ?? `sstb-lbl-shoulder`
        const isVertical = cls === 'sstb-lbl-length'
        return `<div class="sstb-lbl ${cls}">
          ${!isVertical ? `<span class="sstb-lbl-line"></span>` : ''}
          <span class="sstb-lbl-text">${esc(dim.label)}</span>
          ${isVertical ? `<span class="sstb-lbl-line"></span>` : ''}
        </div>`
      })
      .join('\n')

    // 표 헤더
    const thHtml = `<th>사이즈</th>` + d.dims.map((dim) => `<th>${esc(dim.label)}</th>`).join('')

    // 표 행
    const trHtml = d.rows
      .map((row) => {
        const tds = d.dims.map((dim) => `<td>${esc(row.values[dim.key] ?? '—')}</td>`).join('')
        return `<tr><td>${esc(row.size)}</td>${tds}</tr>`
      })
      .join('\n')

    return `
<section class="sstb">
  <div class="sstb-hd">
    <p class="lat sstb-deco">${richSafe(decoTitle)}</p>
    <p class="sstb-sub">${esc(subtitle)}</p>
  </div>
  <div class="sstb-body">
    <div class="sstb-silhouette">
      <div class="sstb-diagram">
        ${hasImage
          ? media(d.image, 'sstb-img', '상품 실루엣')
          : fallbackSvg
        }
        <div class="sstb-labels">
          ${labelHtml}
        </div>
      </div>
    </div>
    <div class="sstb-table-wrap">
      <table class="sstb-table">
        <thead><tr>${thHtml}</tr></thead>
        <tbody>${trHtml}</tbody>
      </table>
      ${d.toleranceNote ? `<p class="sstb-tolerance">${esc(d.toleranceNote)}</p>` : ''}
    </div>
  </div>
  ${d.tipTitle || d.tipBody ? `
  <div class="sstb-footer">
    ${d.tipTitle ? `<p class="lat sstb-tip-title">${richSafe(d.tipTitle)}</p>` : ''}
    ${d.tipBody ? `<p class="sstb-tip-body">${esc(d.tipBody)}</p>` : ''}
  </div>` : ''}
</section>`
  },
})
