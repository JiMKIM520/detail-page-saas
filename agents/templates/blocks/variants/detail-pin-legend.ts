/** DETAIL 아키타입: detail-pin-legend.
 *  132_제품정보_01 패턴 재구성.
 *  제품 사진 위에 번호 핀을 직접 배치하고 하단 2열 범례표와 연결하는 인포그래픽 구성품 안내.
 *  이미지 부재 시 핀 오버레이 영역 전체를 틴트 패널로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 핀 좌표: left/top 은 사진 프레임 기준 % (0~100). */
const pinSchema = z.object({
  n: z.number().int().min(1).max(20),       // 핀 번호
  left: z.number().min(0).max(100),         // 가로 위치 %
  top: z.number().min(0).max(100),          // 세로 위치 %
  label: z.string().min(1),                 // 범례 명칭
})

const schema = z.object({
  title: z.string().min(1),                 // (em,br) 섹션 헤드라인
  subtitle: z.string().optional(),          // 보조 설명 한 줄
  image: z.string().optional(),             // 제품 사진 url
  imageAlt: z.string().optional(),          // 이미지 대체 텍스트
  pins: z.array(pinSchema).min(2).max(20),  // 핀 목록 (번호 순 정렬 권장)
})
type Data = z.infer<typeof schema>

export const detailPinLegend = defineBlock<Data>({
  id: 'detail-pin-legend',
  archetype: 'detail',
  styleTags: ['light', 'editorial', 'infographic', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '구성품/부위 인포그래픽. 제품 사진 위에 번호 핀을 절대 좌표로 배치하고, 하단 2열 범례 그리드로 각 번호-명칭을 연결. 상단 타이틀+부제 + 사진+핀 레이어 + 하단 범례. 이미지 없으면 틴트 패널로 강등.',
  schema,
  css: `
.djvr{background:var(--bg);color:var(--ink);padding:60px 0 64px}
.djvr-hd{text-align:center;padding:0 var(--pad-x,56px) 44px}
.djvr-title{font-family:var(--font-display);font-weight:800;font-size:56px;line-height:1.1;letter-spacing:-.02em}
.djvr-title .em{color:var(--accent)}
.djvr-sub{margin-top:14px;font-size:18px;font-weight:500;color:var(--ink-2);line-height:1.65}
/* ── 사진 + 핀 레이어 ── */
.djvr-photo-wrap{position:relative;width:100%;overflow:hidden}
.djvr-photo{width:100%;aspect-ratio:860/1080;border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));object-fit:cover;display:block}
/* 이미지 없을 때 강등 패널 */
.djvr-photo.ph{display:block!important;width:100%;aspect-ratio:860/1080;background:color-mix(in srgb,var(--accent) 8%,var(--paper));border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
/* 핀 오버레이 컨테이너 — 사진 프레임과 동일 크기 절대 포지션 */
.djvr-pins{position:absolute;inset:0;pointer-events:none}
/* 개별 핀 */
.djvr-pin{position:absolute;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;background:var(--ink);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2.5px solid #fff}
.djvr-pin-n{font-family:var(--font-display);font-weight:700;font-size:15px;color:#fff;line-height:1;user-select:none}
/* ── 범례 그리드 ── */
.djvr-legend{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:0;border-top:1px solid var(--line);padding:0 var(--pad-x,56px)}
.djvr-legend-row{display:flex;align-items:center;gap:12px;padding:16px 20px 16px 0;border-bottom:1px solid var(--line)}
.djvr-legend-row:nth-child(odd){border-right:1px solid var(--line);padding-right:28px}
.djvr-legend-row:nth-child(even){padding-left:28px}
.djvr-legend-num{flex:0 0 32px;width:32px;height:32px;border-radius:50%;background:var(--ink);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:13px;color:#fff;line-height:1}
.djvr-legend-name{font-size:16px;font-weight:500;color:var(--ink);line-height:1.4}
`,
  render: (d, { esc, richSafe }) => {
    // 핀을 번호 순으로 정렬
    const pins = [...d.pins].sort((a, b) => a.n - b.n)

    // 핀 오버레이 HTML
    const pinHtml = pins
      .map(
        (p) =>
          `<div class="djvr-pin" style="left:${p.left}%;top:${p.top}%" aria-label="${esc(p.label)} 위치"><span class="djvr-pin-n">${p.n}</span></div>`,
      )
      .join('\n      ')

    // 범례 행 — 홀수 개면 마지막 짝수 셀을 빈 셀로 채워 그리드 정렬 유지
    const legendItems = [...pins]
    if (legendItems.length % 2 !== 0) {
      legendItems.push({ n: -1, left: 0, top: 0, label: '' })
    }
    const legendHtml = legendItems
      .map((p) =>
        p.n === -1
          ? `<div class="djvr-legend-row" aria-hidden="true"></div>`
          : `<div class="djvr-legend-row">
          <div class="djvr-legend-num" aria-hidden="true">${p.n}</div>
          <span class="djvr-legend-name">${esc(p.label)}</span>
        </div>`,
      )
      .join('\n        ')

    return `
<section class="djvr">
  <div class="djvr-hd">
    <h2 class="djvr-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="djvr-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="djvr-photo-wrap">
    ${media(d.image, 'djvr-photo', esc(d.imageAlt ?? '제품 구성품 사진'))}
    <div class="djvr-pins" aria-hidden="true">
      ${pinHtml}
    </div>
  </div>
  <div class="djvr-legend" role="list" aria-label="구성품 목록">
    ${legendHtml}
  </div>
</section>`
  },
})
