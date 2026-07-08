/** DETAIL 아키타입(템플릿 충실 재현): 17_제품 설명 _1286:188
 *  에디토리얼 헤드라인 + 원형 피처 다이어그램(Venn).
 *  배경 데코(우상단 잎) + 좌정렬 대형 헤드라인 + 본문 2단락 +
 *  겹치는 원형 이미지 3개(벤 다이어그램 배치) + 라벨. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  headline: z.string().min(1),            // 대형 에디토리얼 헤드라인 (em, br 허용)
  body: z.string().min(1),               // 본문 첫 단락 (em, br 허용)
  body2: z.string().min(1).optional(),   // 본문 둘째 단락 (em, br 허용)
  circles: z
    .array(
      z.object({
        image: z.string().optional(),    // 원형 배경 이미지 (url)
        label: z.string().min(1),        // 원 안 중앙 라벨 (em, br 허용)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const detailEditorialVenn = defineBlock<Data>({
  id: 'detail-editorial-venn',
  archetype: 'detail',
  styleTags: ['editorial', 'light', 'premium', 'template', 'diagram'],
  imageSlots: 3,
  describe:
    '제품 설명 에디토리얼+벤다이어그램. 배경 잎 데코 + 좌정렬 대형 헤드라인 + 본문 2단락 + 겹치는 원형 이미지 3개(벤 배치)+라벨. 라이트 내추럴 톤 프리미엄.',
  schema,
  css: `
.dev{
  background:var(--paper);
  color:var(--ink);
  padding:60px 0 0;
  position:relative;
  overflow:hidden;
}

/* ── 배경 데코 잎 (우상단) ── */
.dev::before{
  content:"";
  position:absolute;
  top:-40px;
  right:-50px;
  width:220px;
  height:280px;
  background:color-mix(in srgb,var(--ink) 6%,transparent);
  border-radius:0 0 50% 50% / 0 0 60% 40%;
  transform:rotate(-30deg);
  pointer-events:none;
}
.dev::after{
  content:"";
  position:absolute;
  top:20px;
  right:-20px;
  width:120px;
  height:200px;
  background:color-mix(in srgb,var(--ink) 4%,transparent);
  border-radius:50% 0 0 50% / 40% 0 0 60%;
  transform:rotate(-15deg);
  pointer-events:none;
}

/* ── 본문 영역 ── */
.dev-body{
  position:relative;
  z-index:1;
  padding:0 52px 36px;
}

/* ── 에디토리얼 헤드라인 ── */
.dev-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:42px;
  letter-spacing:-.025em;
  line-height:1.18;
  color:var(--ink);
  margin-bottom:28px;
}
.dev-headline .em{
  color:var(--accent);
}

/* ── 본문 단락 ── */
.dev-p{
  font-size:15px;
  line-height:1.85;
  color:var(--ink-2);
  margin-bottom:14px;
}
.dev-p:last-of-type{
  margin-bottom:0;
}
.dev-p .em{
  color:var(--accent);
  font-weight:600;
}

/* ── Venn 원형 다이어그램 ── */
.dev-venn{
  position:relative;
  width:100%;
  height:340px;
  margin-top:8px;
}

/* 공통 원형 */
.dev-circle{
  position:absolute;
  width:210px;
  height:210px;
  border-radius:50%;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
}

.dev-circle-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  position:absolute;
  inset:0;
  border-radius:50%;
}

/* 원형별 위치 — 피그마: 왼쪽, 중앙-위, 오른쪽, 살짝 겹침 */
.dev-circle:nth-child(1){
  left:20px;
  bottom:20px;
  z-index:2;
}
.dev-circle:nth-child(2){
  left:50%;
  transform:translateX(-50%);
  top:20px;
  z-index:3;
}
.dev-circle:nth-child(3){
  right:20px;
  bottom:20px;
  z-index:2;
}

/* 4개일 때: 4번째는 중앙-하단 앞에 */
.dev-circle:nth-child(4){
  left:50%;
  transform:translateX(-50%);
  bottom:10px;
  z-index:4;
}

/* 배경이미지 없을 때 fallback */
.dev-circle.ph{
  background:color-mix(in srgb,var(--accent) 14%,var(--paper));
  border:2px dashed var(--line);
}

/* 오버레이 라벨 */
.dev-circle-overlay{
  position:relative;
  z-index:5;
  text-align:center;
  padding:10px 12px;
  /* 반투명 배경으로 사진 위 가독성 확보 */
  background:rgba(0,0,0,.38);
  border-radius:calc(var(--r-scale,1)*8px);
  max-width:148px;
}

.dev-circle-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:17px;
  color:#fff;
  line-height:1.35;
  text-shadow:0 1px 6px rgba(0,0,0,.55);
}
.dev-circle-label .em{
  color:var(--accent);
}

/* ── 하단 여백 패드 ── */
.dev-foot{
  height:48px;
  background:var(--paper);
}
`,
  render: (d, { esc, richSafe }) => `
<section class="dev">
  <div class="dev-body">
    <h2 class="dev-headline">${richSafe(d.headline)}</h2>
    <p class="dev-p">${richSafe(d.body)}</p>
    ${d.body2 ? `<p class="dev-p">${richSafe(d.body2)}</p>` : ''}
  </div>
  <div class="dev-venn">
    ${d.circles
      .map(
        (c) => `
    <div class="dev-circle${c.image ? '' : ' ph'}">
      ${c.image ? media(c.image, 'dev-circle-img', esc(c.label)) : ''}
      <div class="dev-circle-overlay">
        <div class="dev-circle-label">${richSafe(c.label)}</div>
      </div>
    </div>`,
      )
      .join('')}
  </div>
  <div class="dev-foot"></div>
</section>`,
})
