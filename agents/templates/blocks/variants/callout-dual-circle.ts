/** CALLOUT 아키타입: callout-dual-circle
 *  피그마 026_모바일_자유배너_10 흡수 — 좌측 텍스트 스택(서브 + 대형 오렌지 헤드라인) +
 *  우측 두 원형 이미지가 부분 오버랩되는 시각 장치. 라이트 배경. 872px 데스크톱 확장.
 *  noimg-safe: 이미지 미제공 시 오버랩 원 컬러 플레이스홀더로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  sub: z.string().min(1),              // 서브 헤드라인 (순수 텍스트)
  title: z.string().min(1),            // 대형 헤드라인 (em,br 허용)
  imageA: z.string().optional(),       // 왼쪽 원형 이미지 (url)
  imageB: z.string().optional(),       // 오른쪽 원형 이미지 (url) — 부분 오버랩
})
type Data = z.infer<typeof schema>

export const calloutDualCircle = defineBlock<Data>({
  id: 'callout-dual-circle',
  archetype: 'callout',
  styleTags: ['light', 'food', 'playful', 'noimg-safe'],
  imageSlots: 2,
  describe: '좌우 2단 배너. 좌측 서브+대형 오렌지 헤드라인, 우측 두 원형 이미지가 부분 오버랩되어 시각 리듬 생성. 식품·뷰티 강조 배너에 적합.',
  schema,
  css: `
.cphv{
  background:var(--bg);
  padding:48px var(--pad-x,56px);
  display:flex;
  align-items:center;
  gap:40px;
  min-height:220px;
  overflow:hidden; /* 원형 프레임 우측 이탈 차단 */
}
/* ── 좌측 텍스트 스택 ───────────────────── */
.cphv-text{
  flex:1 1 auto;
  min-width:0;
}
.cphv-sub{
  font-family:var(--font-display);
  font-size:clamp(15px,1.4vw,20px);
  font-weight:500;
  color:var(--ink-2);
  line-height:1.4;
  margin:0 0 8px;
}
.cphv-title{
  font-family:var(--font-display);
  font-size:clamp(36px,5.5vw,72px);
  font-weight:800;
  color:var(--accent);
  line-height:1.1;
  letter-spacing:-.02em;
  margin:0;
}
.cphv-title .em{
  color:var(--ink);
}
/* ── 우측 오버랩 원형 이미지 쌍 ────────── */
.cphv-circles{
  flex:0 1 345px;   /* 공간 부족 시 축소 허용 */
  min-width:0;
  position:relative;
  /* 원 지름 200px × 2 — 오버랩 55px → 총 너비 345px */
  width:345px;
  height:200px;
}
.cphv-circle{
  position:absolute;
  top:0;
  width:200px;
  height:200px;
  border-radius:50%;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 14%,var(--bg));
  --shape-photo:50%;
}
.cphv-circle-a{
  left:0;
  z-index:1;
  box-shadow:3px 0 12px -4px rgba(42,33,24,.18);
}
.cphv-circle-b{
  left:145px; /* 200-55px 오버랩 */
  z-index:2;
}
.cphv-circle img,
.cphv-circle .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
}
/* noimg-safe: 이미지 없을 때 색 원으로 강등 */
.cphv-circle .ph{
  display:block;
  background:color-mix(in srgb,var(--accent) 18%,var(--bg));
}
/* ── 반응형 축소 ─────────────────────────── */
@media(max-width:640px){
  .cphv{flex-direction:column;align-items:flex-start;gap:28px}
  .cphv-circles{flex:0 0 auto;width:280px;height:160px}
  .cphv-circle{width:160px;height:160px}
  .cphv-circle-b{left:116px}
}
`,
  render: (d, { esc, richSafe }) => `
<section class="cphv">
  <div class="cphv-text">
    <p class="cphv-sub">${esc(d.sub)}</p>
    <h2 class="cphv-title">${richSafe(d.title)}</h2>
  </div>
  <div class="cphv-circles" aria-hidden="true">
    <div class="cphv-circle cphv-circle-a">${media(d.imageA, '', '이미지 A')}</div>
    <div class="cphv-circle cphv-circle-b">${media(d.imageB, '', '이미지 B')}</div>
  </div>
</section>`,
})
