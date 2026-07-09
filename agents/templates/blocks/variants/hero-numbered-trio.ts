/** HERO 아키타입: hero-numbered-trio
 *  피그마 038_인트로_04 구조 재구성.
 *  상단 중앙 타이포(브랜드명 + 제품명 2행 + 태그라인) +
 *  원형 모서리 대형 제품 이미지(object-fit:cover) +
 *  하단 흰색 카드 3열 번호 포인트 배너(01/02/03 원형 뱃지 + 구분선 + 키워드 2행 + 서브텍스트). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pointSchema = z.object({
  keyword: z.string().min(1),   // 굵은 키워드 (em,br) — 2줄 이내 권장
  sub: z.string().min(1),       // 서브 설명 텍스트 (plain)
})

const schema = z.object({
  brand: z.string().min(1),               // 브랜드명 (plain) — 상단 소제목
  productName: z.string().min(1),         // 제품명 (em,br) — 대형 헤드라인 2행
  tagline: z.string().min(1),             // 태그라인 (plain) — 제품명 아래 1행
  image: z.string().optional(),           // 제품 대표 이미지 (url)
  points: z.array(pointSchema).min(3).max(3),  // 포인트 배너 3열 고정
})
type Data = z.infer<typeof schema>

export const heroNumberedTrio = defineBlock<Data>({
  id: 'hero-numbered-trio',
  archetype: 'hero',
  styleTags: ['light', 'clean', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '첫 화면 히어로 블록. 중앙 정렬 브랜드명+제품명(대형)+태그라인 타이포 → 원형 모서리 대형 제품 이미지 → 하단 흰 카드 3열 번호(01/02/03) 뱃지+구분선+키워드+서브 포인트 배너. 식품·뷰티·펫 등 제품형 상세페이지 첫 화면. 이미지 부재 시 이미지 영역 생략(noimg-safe).',
  schema,
  css: `
.heis{
  background:var(--brand);
  color:var(--bg);
  padding:40px var(--pad-x,56px) 0;
  text-align:center;
  overflow:hidden
}
.heis .em{color:var(--em-dark,#FFF7EA)}
.heis-brand{
  font-family:var(--font-display);
  font-size:22px;
  font-weight:700;
  letter-spacing:.12em;
  color:var(--bg);
  opacity:.85;
  text-transform:uppercase
}
.heis-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,8vw,88px);
  line-height:1.08;
  letter-spacing:-.02em;
  margin-top:14px;
  color:var(--bg)
}
.heis-tag{
  margin-top:16px;
  font-size:18px;
  font-weight:500;
  letter-spacing:.02em;
  color:var(--bg);
  opacity:.88;
  line-height:1.5
}
/* 이미지 영역 — 이미지 없으면 .heis-photo-wrap 전체 숨김 */
.heis-photo-wrap{
  margin:32px auto 0;
  width:calc(100% + 0px);
  max-width:740px
}
.heis-photo{
  width:100%;
  aspect-ratio:740/850;
  object-fit:cover;
  border-radius:var(--shape-photo, 999px);
  display:block
}
/* noimg-safe: 이미지 슬롯 비어있을 때 photo-wrap 숨김, 배너가 brand 배경에 바로 붙도록 패딩 조정 */
.heis-photo-wrap:has(.ph){display:none}
.heis-photo-wrap:has(.ph) ~ .heis-banner{margin-top:32px}
/* 포인트 배너 — 화이트 카드 */
.heis-banner{
  background:var(--paper,#fff);
  border-radius:calc(var(--r-scale,1)*24px) calc(var(--r-scale,1)*24px) 0 0;
  margin-top:0;
  padding:28px var(--pad-x,56px) 32px;
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:0;
  position:relative;
  z-index:1;
  margin-left:calc(var(--pad-x,56px)*-1);
  margin-right:calc(var(--pad-x,56px)*-1);
  width:calc(100% + var(--pad-x,56px)*2)
}
.heis-point{
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:0 12px;
  position:relative
}
/* 열 사이 세로 구분선 — 가상 요소로 처리 */
.heis-point+.heis-point::before{
  content:'';
  position:absolute;
  left:0;top:10%;
  height:80%;
  width:1px;
  background:var(--line,#e0e0e0)
}
.heis-badge{
  width:52px;
  height:52px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 12%,transparent);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0
}
.heis-num{
  font-family:var(--font-display);
  font-size:22px;
  font-weight:700;
  color:var(--accent);
  line-height:1
}
/* 구분 헤어라인 — 뱃지 아래 */
.heis-div{
  width:32px;
  height:1px;
  background:var(--line,#d9d9d9);
  margin:10px auto 0
}
.heis-kw{
  font-family:var(--font-display);
  font-size:20px;
  font-weight:700;
  color:var(--ink);
  line-height:1.25;
  text-align:center;
  margin-top:10px;
  word-break:keep-all
}
.heis-kw .em{color:var(--accent);font-weight:800}
.heis-sub{
  font-size:13px;
  font-weight:400;
  color:var(--ink-2,#666);
  line-height:1.55;
  text-align:center;
  margin-top:6px;
  word-break:keep-all
}
`,
  render: (d, { esc, richSafe }) => {
    const nums = ['01', '02', '03']
    return `
<section class="heis">
  <p class="heis-brand">${esc(d.brand)}</p>
  <h1 class="disp heis-name">${richSafe(d.productName)}</h1>
  <p class="heis-tag">${esc(d.tagline)}</p>
  <div class="heis-photo-wrap">
    ${media(d.image, 'heis-photo', `${esc(d.brand)} 제품 이미지`)}
  </div>
  <div class="heis-banner">
    ${d.points.map((p, i) => `
    <div class="heis-point">
      <div class="heis-badge"><span class="heis-num">${nums[i]}</span></div>
      <div class="heis-div"></div>
      <p class="heis-kw">${richSafe(p.keyword)}</p>
      <p class="heis-sub">${esc(p.sub)}</p>
    </div>`).join('')}
  </div>
</section>`
  },
})
