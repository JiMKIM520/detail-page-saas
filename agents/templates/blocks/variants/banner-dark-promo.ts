/** BANNER 아키타입(템플릿 충실 재현): banner-dark-promo.
 *  와디즈 200섹션 19_기념일배너 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(잉크) 배경 + 반복 텍스트 패턴 텍스처(CSS) + 한 줄 서브헤드 +
 *  대형 영문 2줄 타이틀(Black Han Sans) + 3D 소품 3개 이미지 산재.
 *  블랙프라이데이·기념일 특가·시즌 다크 이벤트 배너. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  patternText: z.string().min(1).optional(),   // 반복 텍스처 문자열 (예: "BLACK FRIDAY SALE")
  subhead: z.string().min(1).optional(),        // 상단 한 줄 서브헤드 (em,br)
  titleLine1: z.string().min(1),               // 영문 대형 타이틀 첫째 줄 (em,br)
  titleLine2: z.string().min(1).optional(),    // 영문 대형 타이틀 둘째 줄 (em,br)
  propLeft: z.string().optional(),             // 좌하단 3D 소품 이미지 (url)
  propRight: z.string().optional(),            // 우하단 3D 소품 이미지 (url)
  propAccent: z.string().optional(),           // 좌상단 강조 소품 이미지 (url)
})
type Data = z.infer<typeof schema>

export const bannerDarkPromo = defineBlock<Data>({
  id: 'banner-dark-promo',
  archetype: 'banner',
  styleTags: ['dark', 'bold', 'seasonal', 'editorial', 'template', 'promo'],
  imageSlots: 3,
  describe:
    '다크 타이포 프로모 배너. 다크(잉크) 배경 + 반복 텍스트 패턴 텍스처(CSS) + 한 줄 서브헤드 + Black Han Sans 대형 영문 2줄 타이틀 + 3D 소품 3개(좌상단·좌하단·우하단) 산재. 블랙프라이데이·기념일 특가·시즌 다크 이벤트 배너.',
  schema,
  css: `
/* bdp- : banner-dark-promo 전용 접두사 */
.bdp{
  position:relative;
  overflow:hidden;
  background:var(--ink);
  min-height:760px;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  justify-content:flex-start;
  padding:54px 52px 64px;
  color:#fff;
}

/* 반복 텍스트 패턴 텍스처 — 대각선 타일 */
.bdp-pattern{
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  overflow:hidden;
}
.bdp-pattern-inner{
  position:absolute;
  inset:-60px;
  display:flex;
  flex-direction:column;
  gap:0;
}
.bdp-pattern-row{
  display:flex;
  gap:0;
  white-space:nowrap;
  transform:rotate(-28deg);
  transform-origin:center center;
  line-height:1;
  padding:4px 0;
}
.bdp-pattern-row:nth-child(even){
  transform:rotate(-28deg) translateX(-80px);
}
.bdp-pattern-word{
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  letter-spacing:.18em;
  color:rgba(255,255,255,.11);
  text-transform:uppercase;
  padding:0 18px;
  user-select:none;
}

/* 콘텐츠 래퍼 */
.bdp-body{
  position:relative;
  z-index:2;
  width:100%;
}

/* 서브헤드 */
.bdp-sub{
  font-family:var(--font-body);
  font-weight:700;
  font-size:17px;
  color:rgba(255,255,255,.82);
  margin-bottom:16px;
  letter-spacing:.01em;
  line-height:1.5;
}
.bdp-sub .em{color:var(--accent)}

/* 대형 영문 타이틀 */
.bdp-t1{
  font-family:'Black Han Sans',var(--font-display),sans-serif;
  font-weight:400;
  font-size:112px;
  line-height:.92;
  color:#fff;
  letter-spacing:-.01em;
  text-transform:uppercase;
  margin:0;
  word-break:keep-all;
  overflow-wrap:break-word;
  max-width:100%;
}
.bdp-t2{
  font-family:'Black Han Sans',var(--font-display),sans-serif;
  font-weight:400;
  font-size:112px;
  line-height:.96;
  color:#fff;
  letter-spacing:-.01em;
  text-transform:uppercase;
  margin:0;
  word-break:keep-all;
  overflow-wrap:break-word;
  max-width:100%;
}
.bdp-t1 .em,
.bdp-t2 .em{color:var(--accent)}

/* 3D 소품 이미지들 */

/* 좌상단 강조 소품(번개·볼트 등) */
.bdp-prop-accent{
  position:absolute;
  top:42px;
  left:38px;
  z-index:3;
  width:88px;
  height:88px;
  object-fit:contain;
  filter:drop-shadow(0 8px 18px rgba(0,0,0,.5));
  pointer-events:none;
}
.bdp-prop-accent.ph{
  display:none!important;
}

/* 좌하단 소품(크리스탈·하트 등) */
.bdp-prop-left{
  position:absolute;
  bottom:36px;
  left:36px;
  z-index:3;
  width:110px;
  height:110px;
  object-fit:contain;
  filter:drop-shadow(0 10px 24px rgba(0,0,0,.55));
  pointer-events:none;
}
.bdp-prop-left.ph{
  display:none!important;
}

/* 우하단 소품(확성기·메가폰 등) */
.bdp-prop-right{
  position:absolute;
  bottom:28px;
  right:30px;
  z-index:3;
  width:130px;
  height:130px;
  object-fit:contain;
  filter:drop-shadow(0 10px 28px rgba(0,0,0,.5));
  pointer-events:none;
}
.bdp-prop-right.ph{
  display:none!important;
}

/* 우상단 테두리 텍스처 분리선 강조 */
.bdp::after{
  content:"";
  position:absolute;
  inset:0;
  z-index:1;
  border:1px solid rgba(255,255,255,.06);
  pointer-events:none;
}

/* 모서리 대각선 SALE 액센트 띠 */
.bdp-sale-ribbon{
  position:absolute;
  z-index:4;
  pointer-events:none;
}
/* 우상단 */
.bdp-sale-ribbon.top-right{
  top:22px;
  right:-38px;
  width:160px;
  background:#e8003d;
  color:#fff;
  font-family:var(--font-display);
  font-weight:900;
  font-size:13px;
  letter-spacing:.22em;
  text-align:center;
  text-transform:uppercase;
  padding:5px 0;
  transform:rotate(45deg);
  transform-origin:center center;
}
/* 좌하단 */
.bdp-sale-ribbon.bottom-left{
  bottom:22px;
  left:-38px;
  width:160px;
  background:#e8003d;
  color:#fff;
  font-family:var(--font-display);
  font-weight:900;
  font-size:13px;
  letter-spacing:.22em;
  text-align:center;
  text-transform:uppercase;
  padding:5px 0;
  transform:rotate(-45deg);
  transform-origin:center center;
}
`,
  render: (d, { esc, richSafe }) => {
    const patternStr = d.patternText ?? 'BLACK FRIDAY SALE'
    // 패턴 단어를 한 행에 충분히 채울 반복 횟수
    const repeat = 12
    const words = Array.from({ length: repeat }, () => `<span class="bdp-pattern-word">${esc(patternStr)}</span>`).join('')
    // 7개 행 생성 — 대각선 텍스처 충분히 채움
    const rows = Array.from({ length: 7 }, () => `<div class="bdp-pattern-row">${words}</div>`).join('')

    return `
<section class="bdp">
  <div class="bdp-pattern">
    <div class="bdp-pattern-inner">
      ${rows}
    </div>
  </div>
  <div class="bdp-sale-ribbon top-right">SALE</div>
  <div class="bdp-sale-ribbon bottom-left">SALE</div>
  ${d.propAccent ? media(d.propAccent, 'bdp-prop-accent', '강조 소품') : ''}
  ${d.propLeft ? media(d.propLeft, 'bdp-prop-left', '좌측 소품') : ''}
  ${d.propRight ? media(d.propRight, 'bdp-prop-right', '우측 소품') : ''}
  <div class="bdp-body">
    ${d.subhead ? `<p class="bdp-sub">${richSafe(d.subhead)}</p>` : ''}
    <h2 class="bdp-t1">${richSafe(d.titleLine1)}</h2>
    ${d.titleLine2 ? `<h2 class="bdp-t2">${richSafe(d.titleLine2)}</h2>` : ''}
  </div>
</section>`
  },
})
