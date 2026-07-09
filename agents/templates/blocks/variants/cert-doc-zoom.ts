/** CERT 아키타입: cert-doc-zoom
 *  피그마 116_인증서_01 패턴 재구성.
 *  타이틀 캡션 + 블랙 라벨박스 + 대형 헤드라인 + 인증서류 이미지 위에
 *  확대 클로즈업 스트립을 오버랩해 신뢰감을 강화하는 구조.
 *  그림자는 CSS로, 오버랩 레이어는 절대 위치 지정. 라이트 배경. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  caption: z.string().optional(),        // 상단 소제목 캡션 (순수 텍스트)
  labelText: z.string().min(1),          // 블랙 라벨박스 텍스트 (순수 텍스트)
  title: z.string().min(1),             // 대형 헤드라인 (em,br 허용)
  subtitle: z.string().optional(),       // 헤드라인 아래 한 줄 (순수 텍스트)
  docImage: z.string().optional(),       // 인증서 서류 전체 이미지 (url) — 브리프에 실제 인증서 이미지가 있을 때만
  zoomImage: z.string().optional(),      // 확대 클로즈업 스트립 이미지 (url) — 브리프에 클로즈업 컷이 있을 때만
  body: z.string().optional(),           // 하단 설명 본문 (em,br 허용)
})
type Data = z.infer<typeof schema>

export const certDocZoom = defineBlock<Data>({
  id: 'cert-doc-zoom',
  archetype: 'cert',
  // noimg-safe: docImage/zoomImage 부재 시 이미지 프레임을 숨기고 텍스트 영역만으로 강등 렌더
  styleTags: ['light', 'trust', 'document', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '인증서류 신뢰 블록. 블랙 라벨박스 + 대형 헤드라인 + 인증서 전체 이미지 위에 확대 클로즈업 스트립 오버랩. ' +
    '인증서 서류의 세부 내용을 확대해 보여주며 진정성과 신뢰감을 강화하는 식품/뷰티/건강기능식품 특화 패턴.',
  schema,
  css: `
.cbri{background:var(--bg);color:var(--ink);text-align:center;padding:64px var(--pad-x,56px) 72px}
.cbri-caption{font-size:20px;font-weight:600;color:var(--ink-2);letter-spacing:.01em;margin-bottom:14px}
.cbri-label{display:inline-block;background:var(--ink);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:22px;letter-spacing:.06em;padding:10px 32px;border-radius:calc(var(--r-scale,1)*4px);margin-bottom:20px}
.cbri-title{font-family:var(--font-display);font-weight:800;font-size:60px;line-height:1.12;letter-spacing:-.02em;margin-bottom:0}
.cbri-title .em{color:var(--accent-d)}
.cbri-subtitle{font-size:20px;font-weight:400;color:var(--ink-2);margin-top:16px}
.cbri-frame{position:relative;margin:40px auto 0;width:100%;max-width:520px}
.cbri-doc-wrap{position:relative;display:inline-block;width:100%}
.cbri-doc{width:76%;display:block;margin:0 auto;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));box-shadow:0 24px 48px -16px rgba(0,0,0,.28),0 8px 20px -8px rgba(0,0,0,.18)}
.cbri-doc.ph{display:none!important}
.cbri-shadow{position:absolute;left:50%;transform:translateX(-50%);bottom:-14px;width:72%;height:28px;background:radial-gradient(ellipse 80% 100% at 50% 50%,rgba(0,0,0,.22),transparent);filter:blur(6px);pointer-events:none;z-index:1}
.cbri-zoom{position:absolute;left:50%;transform:translateX(-50%);bottom:28px;width:100%;border-radius:calc(var(--r-scale,1)*6px);overflow:hidden;box-shadow:0 6px 24px -6px rgba(0,0,0,.32);z-index:2}
.cbri-zoom img{width:100%;display:block;object-fit:cover;max-height:120px}
.cbri-zoom.ph-wrap{display:none!important}
.cbri-noimg-spacer{height:32px}
.cbri-body{margin-top:40px;font-size:19px;font-weight:400;color:var(--ink-2);line-height:1.78;max-width:620px;margin-left:auto;margin-right:auto;word-break:keep-all}
.cbri-body .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const hasDoc  = typeof d.docImage  === 'string' && d.docImage.length  > 0
    const hasZoom = typeof d.zoomImage === 'string' && d.zoomImage.length > 0
    const hasAnyImg = hasDoc || hasZoom

    // 이미지 부재 시 이미지 프레임 전체 생략하고 여백 스페이서만 삽입 (noimg-safe 강등)
    const imgBlock = hasAnyImg
      ? `<div class="cbri-frame">
    <div class="cbri-doc-wrap">
      ${media(d.docImage, 'cbri-doc', '인증서류 전체')}
      ${hasDoc ? '<div class="cbri-shadow"></div>' : ''}
      ${hasZoom
        ? `<div class="cbri-zoom">
        <img src="${d.zoomImage}" alt="인증서 확대 클로즈업">
      </div>`
        : ''}
    </div>
  </div>`
      : '<div class="cbri-noimg-spacer"></div>'

    return `
<section class="cbri">
  ${d.caption ? `<p class="cbri-caption">${esc(d.caption)}</p>` : ''}
  <span class="cbri-label">${esc(d.labelText)}</span>
  <h2 class="disp cbri-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="cbri-subtitle">${esc(d.subtitle)}</p>` : ''}
  ${imgBlock}
  ${d.body ? `<p class="cbri-body">${richSafe(d.body)}</p>` : ''}
</section>`
  },
})
