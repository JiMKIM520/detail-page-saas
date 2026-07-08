/** POINT 아키타입: point-list-image-bleed.
 *  [끝판왕] 포인트 구성 #32 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 전폭 저채도 워터마크 타이포 레이어(상·하) + 좌측 텍스트 영역(인트로 + 다이아몬드/이중 쉐브론 아웃라인 배지 pill + 포인트 리스트) + 우측 블리드 이미지.
 *  warm 배경(bg)에 coral/peachy 분위기, 포인트 번호 pill은 이중 아웃라인 다이아형 쉐브론 SVG. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 아이사이 캐치카피 (보조 eyebrow, optional) */
  eyebrow: z.string().optional(),
  /** 섹션 메인 헤드라인 (em, br 허용) */
  headline: z.string().min(1),
  /** 헤드라인 아래 서브카피 (optional) */
  sub: z.string().optional(),
  /** 워터마크 텍스트 — 영문 대문자 장식용 (기본: "POINT EFFECT") */
  watermark: z.string().optional(),
  /** 포인트 아이템 (2~5개) */
  items: z
    .array(
      z.object({
        /** 포인트 번호 레이블 (예: "Point 01") */
        label: z.string().min(1),
        /** 소제목 (em 허용) */
        heading: z.string().min(1),
        /** 보조 설명 (optional, em 허용) */
        desc: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
  /** 우측 블리드 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const pointListImageBleed = defineBlock<Data>({
  id: 'point-list-image-bleed',
  archetype: 'point',
  styleTags: ['warm', 'editorial', 'badge', 'bleed', 'template'],
  imageSlots: 1,
  describe:
    '포인트 리스트 + 이미지 블리드. 전폭 저채도 워터마크 타이포(상·하) + 좌측 인트로/다이아몬드 쉐브론 아웃라인 배지 pill(Point 0X) + 소제목/설명 반복 리스트 + 우측 풀블리드 제품 이미지. 뷰티/스킨케어 warm 톤. 2~5 포인트.',
  schema,
  css: `
/* point-list-image-bleed — 접두사 plib- */
.plib{position:relative;background:var(--paper);overflow:hidden;padding:0;word-break:keep-all}
/* 워터마크 띠 (상단) */
.plib-wm{
  width:100%;padding:10px 0 8px;
  font-family:var(--font-display);font-size:clamp(28px,5.8vw,42px);font-weight:800;
  letter-spacing:.18em;text-transform:uppercase;text-align:center;
  color:var(--muted);opacity:.22;line-height:1;
  user-select:none;pointer-events:none;
  white-space:nowrap;overflow:hidden;text-overflow:clip
}
.plib-wm.bot{margin-top:0;opacity:.18}
/* 메인 레이아웃: 좌 텍스트 + 우 이미지 */
.plib-body{display:flex;align-items:stretch;min-height:480px}
/* 좌측 텍스트 컬럼 */
.plib-left{flex:1 1 52%;padding:40px 36px 40px 44px;display:flex;flex-direction:column;justify-content:center;gap:0}
/* 인트로 eyebrow */
.plib-eyebrow{font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;margin-bottom:8px}
/* 메인 헤드라인 */
.plib-headline{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(22px,4.2vw,30px);line-height:1.32;letter-spacing:-.01em;
  color:var(--ink);margin-bottom:6px
}
.plib-headline .em{color:var(--accent-d)}
/* 서브카피 */
.plib-sub{font-family:var(--font-body);font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:30px}
/* 포인트 리스트 */
.plib-list{display:flex;flex-direction:column;gap:20px}
/* 개별 포인트 아이템 */
.plib-item{display:flex;flex-direction:column;gap:4px}
/* 다이아몬드/이중 쉐브론 아웃라인 배지 pill */
.plib-pill{
  display:inline-flex;align-items:center;gap:6px;
  width:fit-content;
  font-family:var(--font-display);font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent-d);
  padding:3px 12px 3px 6px;
  position:relative
}
/* 이중 아웃라인 쉐브론 pill — clip-path 근사 */
.plib-pill::before,.plib-pill::after{
  content:'';position:absolute;inset:0;
  border:1.5px solid var(--accent-d);
  border-radius:calc(var(--r-scale,1)*2px)
}
.plib-pill::before{
  clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 50%,100% 100%,10px 100%,0% 50%);
  opacity:1
}
.plib-pill::after{
  clip-path:polygon(14px 0%,100% 0%,calc(100% - 14px) 50%,100% 100%,14px 100%,0% 50%);
  opacity:.45
}
/* 배지 번호 SVG 다이아 레이어 */
.plib-pill-svg{flex-shrink:0;width:18px;height:18px;display:block}
.plib-pill-txt{position:relative;z-index:1;padding-left:4px}
/* 포인트 소제목 */
.plib-h{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(15px,2.8vw,18px);line-height:1.38;letter-spacing:-.01em;
  color:var(--ink)
}
.plib-h .em{color:var(--accent-d)}
/* 포인트 설명 */
.plib-d{font-family:var(--font-body);font-size:12px;line-height:1.6;color:var(--muted)}
.plib-d .em{color:var(--accent-d);font-weight:700}
/* 우측 이미지 블리드 */
.plib-right{flex:0 0 44%;position:relative;overflow:hidden;min-height:480px}
.plib-img{
  position:absolute;inset:0;width:100%;height:100%;
  object-fit:cover;object-position:center
}
.plib-img.ph{
  position:absolute;inset:0;width:100%;height:100%;
  border:none;border-left:2px dashed var(--line);
  background:rgba(0,0,0,.04);
  display:flex;align-items:center;justify-content:center;
  font-size:13px;color:var(--muted)
}
`,
  render: (d, { esc, richSafe }) => {
    const wm = esc(d.watermark ?? 'POINT EFFECT')

    const itemsHtml = d.items
      .map((it, i) => {
        // 다이아몬드 아웃라인 SVG (작은 45° 회전 사각형 이중 테두리)
        const diamondSvg = `<svg class="plib-pill-svg" viewBox="0 0 18 18" fill="none">
  <rect x="3.5" y="3.5" width="11" height="11" rx="1.2" transform="rotate(45 9 9)"
    stroke="currentColor" stroke-width="1.4" fill="none"/>
  <rect x="5.2" y="5.2" width="7.6" height="7.6" rx=".8" transform="rotate(45 9 9)"
    stroke="currentColor" stroke-width=".8" fill="none" opacity=".5"/>
</svg>`

        return `<div class="plib-item">
  <div class="plib-pill" aria-label="${attr(it.label)}">
    ${diamondSvg}
    <span class="plib-pill-txt">${esc(it.label.toUpperCase() || `POINT ${pad2(i + 1)}`)}</span>
  </div>
  <h3 class="plib-h">${richSafe(it.heading)}</h3>
  ${it.desc ? `<p class="plib-d">${richSafe(it.desc)}</p>` : ''}
</div>`
      })
      .join('\n')

    // 우측 이미지: media()는 ph div를 반환하지만 블리드 레이아웃은 position:absolute 필요
    const imgHtml = d.image
      ? `<img class="plib-img" src="${attr(d.image)}" alt="${attr(d.imageAlt ?? '포인트 이미지')}">`
      : `<div class="plib-img ph">${esc(d.imageAlt ?? '제품 이미지')}</div>`

    return `
<section class="plib">
  <div class="plib-wm" aria-hidden="true">${wm}</div>
  <div class="plib-body">
    <div class="plib-left">
      ${d.eyebrow ? `<p class="plib-eyebrow">${esc(d.eyebrow)}</p>` : ''}
      <h2 class="plib-headline">${richSafe(d.headline)}</h2>
      ${d.sub ? `<p class="plib-sub">${esc(d.sub)}</p>` : ''}
      <div class="plib-list">${itemsHtml}</div>
    </div>
    <div class="plib-right">${imgHtml}</div>
  </div>
  <div class="plib-wm bot" aria-hidden="true">${wm}</div>
</section>`
  },
})
