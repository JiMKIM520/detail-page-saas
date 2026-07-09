/** CERT 아키타입: cert-spotlight-zoom (딥 톤 배경 + 인증서 카드 + 하단 확대 강조 패널).
 *  원본: 인증서/10 (860×1273, #68804e 배경, 식약처 기능성 인증 레이아웃).
 *  872px 데스크톱 기준으로 재구성. 다크 섹션 — em-dark 필수. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 대형 제목. (em,br) 허용. */
  title: z.string().min(1),
  /** 제목 아래 부제목 한 줄. 순수 텍스트. */
  subtitle: z.string().optional(),
  /** 인증서 이미지 (url). 없으면 카드 프레임만 표시. */
  image: z.string().optional(),
  /** 하단 확대 강조 패널의 핵심 문구. (em,br) 허용. 브리프에 근거 있을 때만. */
  zoomText: z.string().optional(),
  /** 확대 패널 위에 표시되는 소형 레이블 (예: "효능·효과"). 순수 텍스트. 브리프에 근거 있을 때만. */
  zoomLabel: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const certSpotlightZoom = defineBlock<Data>({
  id: 'cert-spotlight-zoom',
  archetype: 'cert',
  styleTags: ['dark', 'premium', 'beauty', 'food', 'health'],
  imageSlots: 1,
  describe:
    '딥 톤 배경(브랜드색) 위 인증서 이미지 카드 + 하단 확대 강조 패널(그라데이션 그림자+강조 문구). ' +
    '식약처·KC·특허 등 공식 인증서 원본 이미지를 사실감 있게 전시할 때 사용. ' +
    '다크 섹션: em 태그는 --em-dark 색상으로 밝게 렌더됨.',
  schema,
  css: `
.cszm{position:relative;padding:64px var(--pad-x,56px) 0;background:var(--brand);text-align:center;overflow:hidden}
/* 배경 미세 노이즈 질감 (SVG 인라인) */
.cszm::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");pointer-events:none;z-index:0}
.cszm-inner{position:relative;z-index:1}
/* 헤드라인 */
.cszm-title{font-family:var(--font-display);font-weight:700;font-size:44px;line-height:1.2;color:#fff;letter-spacing:-.02em}
.cszm-title .em{color:var(--em-dark,#FFF7EA)}
.cszm-sub{margin-top:14px;font-size:18px;font-weight:500;color:rgba(255,255,255,.72);letter-spacing:.01em}
/* 인증서 카드 */
.cszm-card-wrap{margin:36px auto 0;width:420px;max-width:100%;position:relative}
.cszm-card{width:100%;aspect-ratio:420/590;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;background:var(--paper);box-shadow:0 28px 56px -16px rgba(0,0,0,.55),0 8px 20px -8px rgba(0,0,0,.35);position:relative}
.cszm-card img,.cszm-card .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* 카드 하단 그라데이션 페이드아웃 (줌 전환 연결) */
.cszm-card::after{content:'';position:absolute;inset:auto 0 0 0;height:48%;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,.18) 100%);border-radius:0 0 calc(var(--r-scale,1)*14px) calc(var(--r-scale,1)*14px);pointer-events:none}
/* 확대 강조 패널 */
.cszm-zoom{position:relative;margin:0 calc(-1 * var(--pad-x,56px));margin-top:-2px}
.cszm-zoom-grad{height:72px;background:linear-gradient(to bottom,var(--brand) 0%,rgba(255,255,255,0) 100%);position:relative;z-index:2}
.cszm-zoom-panel{background:#fff;padding:24px var(--pad-x,56px) 44px;position:relative;z-index:2}
.cszm-zoom-label{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--brand);opacity:.7;margin-bottom:10px}
.cszm-zoom-text{font-family:var(--font-display);font-weight:700;font-size:24px;line-height:1.55;color:var(--ink)}
.cszm-zoom-text .em{color:var(--accent-d);font-weight:800}
/* 줌 패널 없을 때 하단 여백 */
.cszm-bottom-pad{height:56px}
/* 시그니처 사진 프레임 형태 토큰 소비 */
.cszm-card{border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
`,
  render: (d, { esc, richSafe }) => {
    const hasZoom = Boolean(d.zoomText)
    return `
<section class="cszm">
  <div class="cszm-inner">
    <h2 class="cszm-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="cszm-sub">${esc(d.subtitle)}</p>` : ''}
    <div class="cszm-card-wrap">
      <div class="cszm-card">
        ${media(d.image, '', '인증서 이미지')}
      </div>
    </div>
  </div>
  ${hasZoom ? `
  <div class="cszm-zoom">
    <div class="cszm-zoom-grad"></div>
    <div class="cszm-zoom-panel">
      ${d.zoomLabel ? `<span class="cszm-zoom-label">${esc(d.zoomLabel)}</span>` : ''}
      <p class="cszm-zoom-text">${richSafe(d.zoomText)}</p>
    </div>
  </div>` : '<div class="cszm-bottom-pad"></div>'}
</section>`
  },
})
