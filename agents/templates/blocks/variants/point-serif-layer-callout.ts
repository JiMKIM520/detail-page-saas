/** POINT 아키타입: point-serif-layer-callout
 *  피그마 327_포인트_11 흡수 재구성.
 *  130pt 세리프 대형 번호(01/02/03) + 전폭 히어로 이미지 + 썸네일 3장·대형 이미지 레이어 + 소재 callout 도해.
 *  라이트 배경, 워머 세리프 번호 톤. 이미지 미제공 시 프레임 생략(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const calloutItemSchema = z.object({
  label: z.string().min(1),   // 소재·특성 레이블 (순수 텍스트)
})

const pointSectionSchema = z.object({
  num: z.string().min(1).max(2),        // "01" | "02" | "03" 등
  keyword: z.string().min(1),           // 상단 영문/한글 키워드 (em 허용)
  heading: z.string().min(1),           // 큰 제목 (em,br 허용)
  subHeading: z.string().optional(),    // 소제목 한 줄 (em 허용)
  body: z.string().optional(),          // 본문 (em,br 허용)
  heroImage: z.string().optional(),     // 전폭 히어로 이미지 url
  thumbs: z.array(z.string()).min(0).max(3).optional(),  // 썸네일 최대 3장
  layerImage: z.string().optional(),    // 썸네일 아래 대형 레이어 이미지
  callouts: z.array(calloutItemSchema).min(0).max(5).optional(), // 소재 callout 레이블 목록
})

const schema = z.object({
  sections: z.array(pointSectionSchema).min(1).max(4),
})
type Data = z.infer<typeof schema>

export const pointSerifLayerCallout = defineBlock<Data>({
  id: 'point-serif-layer-callout',
  archetype: 'point',
  styleTags: ['light', 'editorial', 'premium', 'noimg-safe'],
  imageSlots: 8,
  describe:
    '세리프 대형 번호(01/02/03) + 전폭 히어로 이미지 + 3열 썸네일·레이어 대형 이미지 + 소재 callout 선 도해. ' +
    '포인트 섹션을 최대 4개 수직 반복. 라이트 워머 배경. 패션·라이프스타일·핸드크래프트 상세페이지에 적합.',
  schema,
  css: `
/* ── 최상위 ── */
.prrq{background:var(--bg);color:var(--ink)}

/* ── 섹션 구분 ── */
.prrq-sec{padding:0 0 72px}
.prrq-sec+.prrq-sec{border-top:1px solid var(--line)}

/* ── 타이틀 영역 ── */
.prrq-title{display:flex;align-items:flex-start;gap:28px;padding:48px var(--pad-x,56px) 36px}
.prrq-num-col{display:flex;flex-direction:column;align-items:center;min-width:100px;flex-shrink:0}
.prrq-kw{font-family:var(--font-serif);font-weight:700;font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);line-height:1}
.prrq-num{font-family:var(--font-serif);font-weight:700;font-size:clamp(80px,13vw,130px);line-height:.85;color:var(--accent);letter-spacing:-.03em}
.prrq-head-col{display:flex;flex-direction:column;justify-content:center;padding-top:6px}
.prrq-heading{font-family:var(--font-serif);font-weight:700;font-size:clamp(34px,5.5vw,56px);line-height:1.18;color:var(--ink)}
.prrq-heading .em{color:var(--accent)}
.prrq-subheading{margin-top:10px;font-family:var(--font-body);font-size:clamp(15px,2vw,20px);font-weight:400;color:var(--ink-2);line-height:1.5}
.prrq-subheading .em{color:var(--accent);font-weight:600}

/* ── 전폭 히어로 이미지 ── */
.prrq-hero{width:100%;aspect-ratio:860/480;overflow:hidden;background:var(--paper)}
.prrq-hero img{width:100%;height:100%;object-fit:cover;display:block}
.prrq-hero.ph-fallback{display:none}

/* ── 썸네일 3장 ── */
.prrq-thumbs{display:flex;gap:10px;padding:20px var(--pad-x,56px) 0}
.prrq-thumb{flex:1 1 0;aspect-ratio:1/1;overflow:hidden;border-radius:calc(var(--r-scale,1)*12px);background:var(--paper)}
.prrq-thumb img{width:100%;height:100%;object-fit:cover;display:block}

/* ── 레이어 대형 이미지 ── */
.prrq-layer{margin:14px var(--pad-x,56px) 0;border-radius:var(--shape-photo,calc(var(--r-scale,1)*16px));overflow:hidden;background:var(--paper);aspect-ratio:760/480}
.prrq-layer img{width:100%;height:100%;object-fit:cover;display:block}
.prrq-layer.ph-fallback{display:none}

/* ── 텍스트 영역 ── */
.prrq-body-wrap{padding:28px var(--pad-x,56px) 0}
.prrq-body-sub{font-family:var(--font-body);font-weight:700;font-size:clamp(17px,2.4vw,24px);color:var(--accent);line-height:1.3;margin-bottom:8px}
.prrq-body-sub .em{color:var(--ink)}
.prrq-body{font-family:var(--font-body);font-weight:300;font-size:clamp(14px,1.8vw,18px);color:var(--ink-2);line-height:1.75}
.prrq-body .em{color:var(--ink);font-weight:600}

/* ── Callout 도해 (선 + 레이블) ── */
.prrq-callout{margin:30px var(--pad-x,56px) 0;position:relative;display:flex;flex-direction:column;gap:0}
.prrq-callout-title{font-size:12px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.prrq-callout-list{display:flex;flex-direction:column;gap:0}
.prrq-callout-item{display:flex;align-items:center;gap:12px;padding:6px 0}
.prrq-callout-line{flex:0 0 64px;height:1px;background:var(--ink-2);opacity:.45}
.prrq-callout-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0}
.prrq-callout-lbl{font-family:var(--font-body);font-weight:500;font-size:clamp(13px,1.6vw,17px);color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => {
    const renderSection = (sec: typeof d.sections[0], idx: number) => {
      // 전폭 히어로
      const hasHero = typeof sec.heroImage === 'string' && sec.heroImage.length > 0
      const heroHtml = hasHero
        ? `<div class="prrq-hero">${media(sec.heroImage, '', '히어로 이미지')}</div>`
        : ''

      // 썸네일 3장
      const thumbs = sec.thumbs ?? []
      const hasAnyThumb = thumbs.some(u => typeof u === 'string' && u.length > 0)
      const thumbsHtml = hasAnyThumb
        ? `<div class="prrq-thumbs">${thumbs
            .filter(u => typeof u === 'string' && u.length > 0)
            .map(u => `<div class="prrq-thumb">${media(u, '', '썸네일')}</div>`)
            .join('')}</div>`
        : ''

      // 레이어 대형 이미지
      const hasLayer = typeof sec.layerImage === 'string' && sec.layerImage.length > 0
      const layerHtml = hasLayer
        ? `<div class="prrq-layer">${media(sec.layerImage, '', '레이어 이미지')}</div>`
        : ''

      // 본문
      const bodyHtml = sec.body || sec.subHeading
        ? `<div class="prrq-body-wrap">
          ${sec.subHeading ? `<p class="prrq-body-sub">${richSafe(sec.subHeading)}</p>` : ''}
          ${sec.body ? `<div class="prrq-body">${richSafe(sec.body)}</div>` : ''}
        </div>`
        : ''

      // callout 도해
      const callouts = sec.callouts ?? []
      const calloutHtml = callouts.length > 0
        ? `<div class="prrq-callout">
          <div class="prrq-callout-list">
            ${callouts.map(c => `
            <div class="prrq-callout-item">
              <span class="prrq-callout-line"></span>
              <span class="prrq-callout-dot"></span>
              <span class="prrq-callout-lbl">${esc(c.label)}</span>
            </div>`).join('')}
          </div>
        </div>`
        : ''

      return `
<div class="prrq-sec">
  <div class="prrq-title">
    <div class="prrq-num-col">
      <span class="prrq-kw">point</span>
      <span class="prrq-num">${esc(sec.num)}</span>
    </div>
    <div class="prrq-head-col">
      <h2 class="prrq-heading">${richSafe(sec.heading)}</h2>
    </div>
  </div>
  ${heroHtml}
  ${thumbsHtml}
  ${layerHtml}
  ${bodyHtml}
  ${calloutHtml}
</div>`
    }

    return `<section class="prrq">${d.sections.map(renderSection).join('')}</section>`
  },
})
