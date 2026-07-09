/** SPEC 아키타입: spec-dim-blueprint
 *  피그마 135_제품정보_03 구조 재구성 (클론 금지 — 위계·장치 흡수, 카피·이미지·브랜드는 슬롯).
 *
 *  구조:
 *    ① 상단 중앙 정렬 타이틀 + 부제
 *    ② 제품 전폭 사진 위에 mm 단위 치수선(가로 전폭 + 세로 높이 + 선택 추가선)을
 *       SVG로 직접 오버레이 — 도면/캘리퍼 스타일.
 *    ③ 이미지 없을 때 틴트 패널 + 치수 수치만 텍스트로 강등(noimg-safe).
 *
 *  핵심 장치: 치수선 SVG가 사진을 "도면"처럼 읽히게 만드는 엔지니어링 어휘.
 *  전자제품·가전·가구·생활용품 등 수치 스펙 신뢰가 중요한 카테고리에 적합.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 제목 (em·br 허용). 예: "제품 <span class=\"em\">사이즈</span>" */
  title: z.string().min(1),
  /** 제목 아래 부연 한 줄. 예: "다양한 구성품으로 상황에 맞는 청소가 가능합니다." */
  subtitle: z.string().optional(),
  /** 제품 측면/정면 사진 URL (세로형 권장 — 원본 비율 860×1291). 없으면 틴트 패널 강등. */
  image: z.string().optional(),
  /** 이미지 접근성 대체 텍스트 */
  imageAlt: z.string().optional(),
  /** 가로(너비) 치수. 예: "250mm" */
  dimWidth: z.string().min(1),
  /** 세로(높이) 치수. 예: "1080mm" */
  dimHeight: z.string().min(1),
  /**
   * 추가 치수 (선택). 예: "240mm" (깊이·두께·지름 등).
   * 브리프 근거 시만: 원본 프레임에 세 번째 치수 "240mm" 존재.
   */
  dimExtra: z.string().optional(),
  /**
   * 추가 치수 축 레이블 (선택). 예: "Depth". dimExtra 지정 시만 노출.
   * 브리프 근거 시만.
   */
  dimExtraAxis: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const specDimBlueprint = defineBlock<Data>({
  id: 'spec-dim-blueprint',
  archetype: 'spec',
  styleTags: ['light', 'technical', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 사이즈 도면 블록. 상단 중앙 볼드 타이틀 + 부제 + 제품 전폭 사진 위에 가로·세로(·선택 추가) mm 치수선을 SVG로 직접 오버레이. 도면/캘리퍼 스타일. 이미지 없으면 틴트 패널 + 치수 수치 텍스트로 강등.',
  schema,
  css: `
/* ── spec-dim-blueprint ── */
.sdbl{background:var(--bg);color:var(--ink);padding:64px var(--pad-x,56px) 60px;text-align:center}
/* 헤더 */
.sdbl-hd{margin-bottom:36px}
.sdbl-title{font-family:var(--font-display);font-weight:800;font-size:58px;line-height:1.08;letter-spacing:-.025em;color:var(--ink)}
.sdbl-title .em{color:var(--accent)}
.sdbl-sub{margin-top:18px;font-size:19px;font-weight:500;line-height:1.62;color:var(--ink-2)}
/* 이미지 + SVG 오버레이 래퍼 */
.sdbl-frame{position:relative;width:100%;max-width:720px;margin:0 auto;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));overflow:hidden;
  background:color-mix(in srgb,var(--accent) 7%,var(--paper))}
/* 제품 이미지 (세로형 원본 비율 ~860:1291 ≈ 2:3) */
.sdbl-img{width:100%;aspect-ratio:2/3;object-fit:contain;display:block;border-radius:inherit}
/* noimg-safe: 이미지 없을 때 틴트 패널로 강등 */
.sdbl-img.ph{display:block!important;aspect-ratio:2/3;
  background:color-mix(in srgb,var(--accent) 9%,var(--paper))}
/* SVG 오버레이: 이미지 영역 전체를 덮음 */
.sdbl-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
/* 치수선 공통 */
.sdbl-svg .dl{stroke:var(--ink-2);stroke-width:.55;fill:none;opacity:.7}
.sdbl-svg .dtick{stroke:var(--ink-2);stroke-width:.7;fill:none;opacity:.7}
/* 치수 수치 텍스트 배경 필 */
.sdbl-svg .dbg{fill:var(--bg);opacity:.84}
/* 치수 수치 텍스트 */
.sdbl-svg .dlabel{font-family:'Pretendard',sans-serif;font-weight:600;fill:var(--ink-2);opacity:.85}
/* 하단 치수 요약 행 */
.sdbl-dimrow{display:flex;justify-content:center;align-items:center;gap:0;margin-top:30px}
.sdbl-dimcell{padding:0 28px;text-align:center}
.sdbl-dimcell+.sdbl-dimcell{border-left:1.5px solid var(--line)}
.sdbl-daxis{font-family:'Pretendard',sans-serif;font-size:12px;font-weight:600;
  color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
.sdbl-dval{font-family:var(--font-display);font-size:26px;font-weight:800;
  color:var(--ink);letter-spacing:-.02em;line-height:1}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage =
      typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    // ── SVG 치수선 (viewBox "0 0 100 150" — 2:3 비율에 맞춤, 퍼센트 기반 상대 배치)
    // 원본 피그마 프레임 관찰:
    //   라인3 (전폭 가로선): 이미지 상단 약 7%
    //   라인1 (가로 짧은선 하부): 이미지 약 70% 지점
    //   라인2 (가로 짧은선 하부2): 이미지 약 76% 지점
    //   높이 치수: 세로선은 오른쪽 여백 x≈88%
    const tickH = 1.6   // 가로선 tick 반높이 (viewBox 단위)
    const tickW = 1.4   // 세로선 tick 반너비
    const labelFs = 3.8 // 라벨 폰트 크기
    const labelFsV = 3.4

    // 가로 전폭 치수선 (상단 y=7)
    const widthLine = `
<line class="dl" x1="6" y1="7" x2="94" y2="7"/>
<line class="dtick" x1="6" y1="${7 - tickH}" x2="6" y2="${7 + tickH}"/>
<line class="dtick" x1="94" y1="${7 - tickH}" x2="94" y2="${7 + tickH}"/>
<rect class="dbg" x="41" y="3.5" width="18" height="6" rx="1.2"/>
<text class="dlabel" x="50" y="8.4" text-anchor="middle" font-size="${labelFs}">${esc(d.dimWidth)}</text>`

    // 세로 높이 치수선 (우측 x=90)
    const heightLine = `
<line class="dl" x1="90" y1="10" x2="90" y2="140"/>
<line class="dtick" x1="${90 - tickW}" y1="10" x2="${90 + tickW}" y2="10"/>
<line class="dtick" x1="${90 - tickW}" y1="140" x2="${90 + tickW}" y2="140"/>
<rect class="dbg" x="84.5" y="71" width="11" height="6" rx="1.2" transform="rotate(-90 90 74)"/>
<text class="dlabel" x="90" y="75.5" text-anchor="middle" font-size="${labelFsV}"
  transform="rotate(-90 90 74)">${esc(d.dimHeight)}</text>`

    // 추가 치수선 (선택 — 하부 가로 짧은 선 x:18~60, y=72)
    const extraLine = d.dimExtra ? `
<line class="dl" x1="18" y1="72" x2="60" y2="72"/>
<line class="dtick" x1="18" y1="${72 - tickH}" x2="18" y2="${72 + tickH}"/>
<line class="dtick" x1="60" y1="${72 - tickH}" x2="60" y2="${72 + tickH}"/>
<rect class="dbg" x="30" y="68.5" width="18" height="6" rx="1.2"/>
<text class="dlabel" x="39" y="73.4" text-anchor="middle" font-size="${labelFs}">${esc(d.dimExtra)}</text>` : ''

    // 가이드 수직선 (치수선 시작·끝 포인트에서 이미지 단선으로 연결)
    const guides = `
<line stroke="var(--ink-2)" stroke-width=".3" stroke-dasharray="1.8 1.8" opacity=".32"
  x1="6" y1="3" x2="6" y2="9"/>
<line stroke="var(--ink-2)" stroke-width=".3" stroke-dasharray="1.8 1.8" opacity=".32"
  x1="94" y1="3" x2="94" y2="9"/>
<line stroke="var(--ink-2)" stroke-width=".3" stroke-dasharray="1.8 1.8" opacity=".32"
  x1="86" y1="10" x2="94" y2="10"/>
<line stroke="var(--ink-2)" stroke-width=".3" stroke-dasharray="1.8 1.8" opacity=".32"
  x1="86" y1="140" x2="94" y2="140"/>
${d.dimExtra ? `<line stroke="var(--ink-2)" stroke-width=".3" stroke-dasharray="1.8 1.8" opacity=".32"
  x1="18" y1="68" x2="18" y2="74"/>
<line stroke="var(--ink-2)" stroke-width=".3" stroke-dasharray="1.8 1.8" opacity=".32"
  x1="60" y1="68" x2="60" y2="74"/>` : ''}`

    const dimSvg = `
<svg class="sdbl-svg" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true"
  xmlns="http://www.w3.org/2000/svg">
  ${guides}
  ${widthLine}
  ${heightLine}
  ${extraLine}
</svg>`

    // 하단 치수 요약 행 (이미지 유무 무관하게 노출)
    const dimRow = `
<div class="sdbl-dimrow" aria-label="제품 치수 요약">
  <div class="sdbl-dimcell">
    <p class="sdbl-daxis">Width</p>
    <p class="sdbl-dval">${esc(d.dimWidth)}</p>
  </div>
  <div class="sdbl-dimcell">
    <p class="sdbl-daxis">Height</p>
    <p class="sdbl-dval">${esc(d.dimHeight)}</p>
  </div>
  ${d.dimExtra ? `<div class="sdbl-dimcell">
    <p class="sdbl-daxis">${esc(d.dimExtraAxis ?? 'Depth')}</p>
    <p class="sdbl-dval">${esc(d.dimExtra)}</p>
  </div>` : ''}
</div>`

    return `
<section class="sdbl">
  <div class="sdbl-hd">
    <h2 class="sdbl-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="sdbl-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="sdbl-frame">
    ${hasImage
      ? media(d.image, 'sdbl-img', esc(d.imageAlt ?? '제품 사이즈 이미지'))
      : `<div class="sdbl-img ph" role="img" aria-label="${esc(d.imageAlt ?? '제품 사이즈 이미지')}"></div>`}
    ${dimSvg}
  </div>
  ${dimRow}
</section>`
  },
})
