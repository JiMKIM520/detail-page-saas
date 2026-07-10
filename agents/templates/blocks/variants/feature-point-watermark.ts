/** FEATURE 아키타입: feature-point-watermark
 *  피그마 283_제품소개_30 구조 재구성.
 *  좌우 분할 포인트 레이블(번호+아키타입명) / 제품명 헤더 +
 *  영문 워터마크를 배경처럼 깔아 계층 깊이를 만드는 타이포 스택 +
 *  하단 풀블리드 사진. noimg-safe: 이미지 부재 시 틴트 패널로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  pointLabel: z.string().min(1),          // "point 01" 형태 포인트 레이블 (순수 텍스트)
  productName: z.string().min(1),         // 제품명 (대형, em 허용)
  watermarkText: z.string().min(1),       // 영문 워터마크 배경 텍스트 (순수 텍스트)
  slogan: z.string().min(1),              // 대형 한글 슬로건 (em,br 허용)
  desc: z.string().optional(),            // 부연 설명 텍스트 (em,br 허용)
  image: z.string().optional(),           // 하단 풀블리드 이미지 (url)
})
type Data = z.infer<typeof schema>

export const featurePointWatermark = defineBlock<Data>({
  id: 'feature-point-watermark',
  archetype: 'feature',
  styleTags: ['light', 'editorial', 'typography', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '포인트 번호 레이블과 제품명을 좌우 분할 배치하고, 영문 워터마크 텍스트를 배경처럼 깔아 계층 깊이를 만드는 타이포그래피 구성. 하단 풀블리드 사진. 이미지 없으면 틴트 패널로 강등. 전자제품·생활용품 단일 제품 포인트 소개에 적합.',
  schema,
  css: `
.fohu{position:relative;background:var(--bg);color:var(--ink);padding:0;overflow:hidden}

/* ── 포인트 헤더: 좌우 분할 ── */
.fohu-hd{
  display:flex;align-items:stretch;
  padding:52px var(--pad-x,56px) 0;
  gap:28px;
}
/* 왼쪽: point 레이블 컬럼 */
.fohu-pt{
  flex:0 0 auto;
  display:flex;flex-direction:column;justify-content:flex-start;
  padding-top:4px;
}
.fohu-pt-text{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(22px, 3.2vw, 38px);
  line-height:1.15;
  color:var(--accent);
  white-space:pre-line;
  letter-spacing:.01em;
}
/* 오른쪽: 제품명 */
.fohu-name{
  flex:1 1 0;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(48px, 7.8vw, 80px);
  line-height:1.0;
  color:var(--ink);
  letter-spacing:-.02em;
  word-break:keep-all;
}
.fohu-name .em{color:var(--accent)}

/* ── 헤드라인 존 (워터마크 전용 컨테이너) ── */
.fohu-hd-zone{
  position:relative;
  overflow:hidden;
  /* 워터마크 높이 고정: 워터마크가 이 영역 밖으로 나가지 않음 */
  height:clamp(80px, 13vw, 130px);
  margin:0 var(--pad-x,56px);
}
/* 영문 워터마크 — 헤드라인 존 전용, 아래 텍스트 영역 침범 불가 */
.fohu-wm{
  position:absolute;
  bottom:-0.1em;left:50%;
  transform:translateX(-50%);
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(80px, 13vw, 130px);
  color:var(--ink-2);
  opacity:.08;
  white-space:nowrap;
  letter-spacing:.04em;
  pointer-events:none;
  user-select:none;
  text-transform:lowercase;
  /* 헤드라인 존 내부에 갇힘 — 부모 overflow:hidden이 클립 */
  z-index:0;
}

/* ── 타이포 스택 (슬로건 + 설명) ── */
.fohu-body{
  position:relative;
  padding:24px var(--pad-x,56px) 44px;
  overflow:visible;
}
.fohu-slogan{
  position:relative;z-index:1;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(38px, 6vw, 70px);
  line-height:1.18;
  color:var(--ink);
  letter-spacing:-.025em;
  word-break:keep-all;
}
.fohu-slogan .em{color:var(--accent)}
.fohu-desc{
  position:relative;z-index:1;
  margin-top:18px;
  font-size:clamp(16px, 1.9vw, 20px);
  font-weight:500;
  line-height:1.72;
  color:var(--ink-2);
  word-break:keep-all;
}
.fohu-desc .em{color:var(--accent);font-weight:700}

/* ── 풀블리드 이미지 영역 ── */
.fohu-img-wrap{
  width:100%;
  /* 이미지 있을 때: aspect 4:3 언저리 */
  aspect-ratio:860/620;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 8%,var(--bg));
}
.fohu-img{
  width:100%;height:100%;
  object-fit:cover;
  display:block;
  /* shape-photo 토큰 미사용: 풀블리드 이미지는 라운드 없음 */
}
/* noimg-safe: .ph는 baseCss에서 display:none!important → 이미지 부재 시 .fohu-img-wrap 배경색만 노출. 레이아웃 붕괴 없음. */
.fohu-img-wrap .ph{display:none!important}
`,
  render: (d, { esc, richSafe }) => `
<section class="fohu">
  <div class="fohu-hd">
    <div class="fohu-pt">
      <span class="fohu-pt-text">${esc(d.pointLabel)}</span>
    </div>
    <h2 class="fohu-name disp">${richSafe(d.productName)}</h2>
  </div>
  <div class="fohu-hd-zone">
    <span class="fohu-wm" aria-hidden="true">${esc(d.watermarkText)}</span>
  </div>
  <div class="fohu-body">
    <p class="fohu-slogan">${richSafe(d.slogan)}</p>
    ${d.desc ? `<p class="fohu-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
  <div class="fohu-img-wrap">
    ${media(d.image, 'fohu-img', esc(d.productName) + ' 제품 이미지')}
  </div>
</section>`,
})
