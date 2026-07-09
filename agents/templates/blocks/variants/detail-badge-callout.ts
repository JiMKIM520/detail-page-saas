/** DETAIL 아키타입: detail-badge-callout.
 *  125_제품소개_05 패턴 재구성.
 *  컬러 대형 헤드라인 + 서브타이틀(상단) → 전체폭 제품 이미지 위에
 *  좌측 원형 컬러 배지 3개를 수직 나열하고 수직 라인으로 서로 연결하는 콜아웃 장치.
 *  이미지 부재 시 배지 패널을 단독으로 표출하는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const badgeSchema = z.object({
  label: z.string().min(1),  // 배지 상단 한 줄 (em 허용)
  sub:   z.string().min(1),  // 배지 하단 한 줄 (em 허용)
})

const schema = z.object({
  headline: z.string().min(1),          // 대형 컬러 헤드라인 (em,br 허용)
  subline:  z.string().optional(),      // 헤드라인 아래 서브타이틀
  image:    z.string().optional(),      // 전체폭 제품 이미지 (url)
  badges:   z.array(badgeSchema).min(2).max(4), // 좌측 수직 배지 (2~4개)
  imageAlt: z.string().optional(),      // 이미지 대체 텍스트 (브리프에 근거 있을 때)
})

type Data = z.infer<typeof schema>

export const detailBadgeCallout = defineBlock<Data>({
  id: 'detail-badge-callout',
  archetype: 'detail',
  styleTags: ['light', 'editorial', 'callout', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 상세(라이트). 상단 컬러 대형 헤드라인+서브타이틀 → 전체폭 제품 이미지에 좌측 원형 배지 2~4개를 수직 오버레이하고 수직 라인으로 연결하는 콜아웃 장치. 이미지 없으면 배지 패널만 표출.',
  schema,
  css: `
/* ── detail-badge-callout (dvhz) ── */
.dvhz{background:var(--bg);color:var(--ink);padding-bottom:0}
/* 타이틀 영역 */
.dvhz-hd{padding:52px var(--pad-x,56px) 36px;text-align:center}
.dvhz-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(52px,7.5vw,80px);color:var(--accent);letter-spacing:-.025em;line-height:1.1}
.dvhz-headline .em{color:var(--ink)}
.dvhz-subline{margin-top:14px;font-family:var(--font-body);font-size:clamp(18px,2.2vw,22px);font-weight:400;color:var(--ink);line-height:1.5;opacity:.85}
/* 이미지+배지 복합 영역 */
.dvhz-body{position:relative;width:100%}
/* 제품 이미지 */
.dvhz-img-wrap{width:100%;aspect-ratio:860/1100;overflow:hidden;background:color-mix(in srgb,var(--accent) 6%,var(--bg))}
.dvhz-img-wrap img{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0px)}
/* noimg-safe 강등: 이미지 없을 때 배지 영역만 라이트 배경 패널로 */
.dvhz-body.noimg .dvhz-img-wrap{display:none}
.dvhz-body.noimg .dvhz-badges{position:static;transform:none;padding:48px 0 52px}
.dvhz-body.noimg .dvhz-badge-connector{background:var(--line)}
/* 배지 오버레이 컬럼 */
.dvhz-badges{
  position:absolute;
  left:var(--pad-x,56px);
  top:50%;
  transform:translateY(-50%);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
  z-index:2;
}
/* 배지 간 수직 연결 라인 */
.dvhz-badge-connector{
  width:2px;
  height:32px;
  background:#fff;
  opacity:.7;
}
/* 원형 배지 */
.dvhz-badge{
  width:clamp(140px,18vw,190px);
  height:clamp(140px,18vw,190px);
  border-radius:50%;
  background:var(--accent);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:4px;
  flex-shrink:0;
  box-shadow:0 4px 24px -8px rgba(0,0,0,.32);
  position:relative;
}
/* 배지 내부 데코 링 */
.dvhz-badge::after{
  content:'';
  position:absolute;
  inset:8px;
  border-radius:50%;
  border:1.5px solid rgba(255,255,255,.35);
  pointer-events:none;
}
.dvhz-badge-label{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(15px,2vw,20px);
  color:#fff;
  text-align:center;
  line-height:1.25;
  letter-spacing:-.01em;
  padding:0 12px;
}
.dvhz-badge-label .em{color:rgba(255,255,255,.75)}
.dvhz-badge-sub{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(13px,1.8vw,18px);
  color:rgba(255,255,255,.82);
  text-align:center;
  line-height:1.25;
  padding:0 12px;
}
.dvhz-badge-sub .em{color:#fff}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const altText = d.imageAlt ? esc(d.imageAlt) : '제품 이미지'

    const connectorHtml = '<div class="dvhz-badge-connector" aria-hidden="true"></div>'

    const badgesHtml = d.badges
      .map(
        (b, i) => `${i > 0 ? connectorHtml : ''}<div class="dvhz-badge" role="img" aria-label="${esc(b.label)} ${esc(b.sub)}">
          <span class="dvhz-badge-label">${richSafe(b.label)}</span>
          <span class="dvhz-badge-sub">${richSafe(b.sub)}</span>
        </div>`,
      )
      .join('')

    return `
<section class="dvhz">
  <div class="dvhz-hd">
    <h2 class="dvhz-headline">${richSafe(d.headline)}</h2>
    ${d.subline ? `<p class="dvhz-subline">${esc(d.subline)}</p>` : ''}
  </div>
  <div class="dvhz-body${hasImage ? '' : ' noimg'}">
    <div class="dvhz-img-wrap">
      ${media(d.image, '', altText)}
    </div>
    <div class="dvhz-badges" aria-label="제품 특징">
      ${badgesHtml}
    </div>
  </div>
</section>`
  },
})
