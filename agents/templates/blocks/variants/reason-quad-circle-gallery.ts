/** REASON 아키타입: reason-quad-circle-gallery.
 *  010_pc_자유배너10 패턴 흡수 — 좌 텍스트 스택(서브 + 오렌지 대형 헤드라인) +
 *  우 원형 이미지 4개 균등 가로 나열 갤러리 스트립. 다크 배경. 872px 데스크톱 기준. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  sub: z.string().min(1),                // 소제목 라인 (흰색 계열)
  headline: z.string().min(1),           // 대형 강조 카피 (em,br) — 오렌지 accent
  images: z
    .array(
      z.object({
        url: z.string().optional(),      // (url) 원형 이미지
        alt: z.string().min(1),          // 대체 텍스트 (재료명·산지명 등)
      }),
    )
    .length(4),                          // 정확히 4개 — 갤러리 스트립 균일성 유지
})
type Data = z.infer<typeof schema>

export const reasonQuadCircleGallery = defineBlock<Data>({
  id: 'reason-quad-circle-gallery',
  archetype: 'reason',
  // noimg-safe: 이미지 전무 시 원형 프레임을 .ph(display:none)로 숨기고
  //             텍스트 스택 단독 전폭 레이아웃으로 강등
  styleTags: ['dark', 'food', 'reason', 'gallery', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '이유 제시 배너(다크). 좌 — 서브 라인 + 오렌지 대형 헤드라인 세로 스택; 우 — 원형 이미지 4개를 균등 간격으로 가로 나열한 갤러리 스트립. 재료·산지·성분 다양성을 한눈에 보여줄 때 사용. 이미지 없으면 텍스트 단독 전폭으로 강등.',
  schema,
  css: `
.rqdj{
  background:var(--brand);
  padding:28px var(--pad-x,56px);
  display:flex;
  align-items:center;
  gap:40px;
  min-height:160px;
}
/* 다크 배경 em 오버라이드 — CRITICAL */
.rqdj .em{color:var(--em-dark,#FFF7EA)}

/* 텍스트 스택 */
.rqdj-left{
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:6px;
  min-width:220px;
  max-width:340px;
}
.rqdj-sub{
  font-family:var(--font-display);
  font-weight:500;
  font-size:16px;
  color:rgba(255,247,234,.72);
  letter-spacing:.01em;
  line-height:1.3;
}
.rqdj-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,5vw,58px);
  color:var(--accent);
  letter-spacing:-.02em;
  line-height:1.08;
  word-break:keep-all;
}
.rqdj-headline .em{
  /* em은 흰 계열로 강조 반전 — 오렌지 위 화이트 */
  color:var(--em-dark,#FFF7EA);
  font-weight:800;
}

/* 원형 갤러리 스트립 */
.rqdj-right{
  flex:1 1 0;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:0;
}
.rqdj-circle-wrap{
  flex:0 0 auto;
  /* 겹침: 인접 원끼리 12px 겹쳐 연속성 강조 */
  margin-left:-12px;
}
.rqdj-circle-wrap:first-child{
  margin-left:0;
}
.rqdj-circle{
  width:calc(var(--r-scale,1)*112px + 0px);  /* rScale 반응 원형 크기 */
  height:calc(var(--r-scale,1)*112px + 0px);
  border-radius:50%;                          /* 원형 예외 — 규약상 50% 허용 */
  overflow:hidden;
  border:3px solid rgba(255,247,234,.18);
  background:rgba(255,247,234,.08);
  /* 이미지 없을 때 강등: .ph는 display:none!important (baseCss 전역) → 원형 wrap도 축소 */
}
.rqdj-circle img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
  display:block;
}
/* noimg-safe: 이미지 전부 없을 때 우측 스트립 숨김 + 좌 텍스트 전폭 */
.rqdj-right:has(.rqdj-circle img + .ph),
.rqdj-right:not(:has(img)){
  display:none;
}
.rqdj:not(:has(.rqdj-right img)) .rqdj-left{
  max-width:100%;
  flex:1 1 0;
}
`,
  render: (d, { esc, richSafe }) => {
    const hasAnyImg = d.images.some(
      (img) => typeof img.url === 'string' && /^(https?:\/\/|data:|\/)/.test(img.url.trim()),
    )

    return `
<section class="rqdj">
  <div class="rqdj-left">
    <p class="rqdj-sub">${esc(d.sub)}</p>
    <h2 class="rqdj-headline">${richSafe(d.headline)}</h2>
  </div>
  ${
    hasAnyImg
      ? `<div class="rqdj-right">
    ${d.images
      .map(
        (img) => `<div class="rqdj-circle-wrap">
      <div class="rqdj-circle">${media(img.url, '', esc(img.alt))}</div>
    </div>`,
      )
      .join('')}
  </div>`
      : ''
  }
</section>`
  },
})
