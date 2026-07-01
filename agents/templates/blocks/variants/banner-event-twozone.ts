/** BANNER 아키타입(템플릿 충실 재현): banner-event-twozone.
 *  Figma 19_기념일배너 1284:2067 — 2존 구조(상반부 텍스트 + 하반부 3D 상품 오브젝트).
 *  시그니처: 단색 배경 + oval/pill 이벤트 날짜 뱃지(상단 중앙) +
 *  영문 대형 2줄 타이틀(accent 1줄 + ink 1줄, lat/display 폰트) +
 *  3D 상품 오브젝트 이미지 블록(누끼/PNG 권장) + 선택적 하단 부제목.
 *  화이트데이·빼빼로데이·발렌타인 등 기념일 배너 2존 구조. 이미지 없이도 완결 가능. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eventBadge: z.string().min(1).optional(), // oval 뱃지 텍스트 (예: "3.14 EVENT", "D-DAY")
  titleAccent: z.string().min(1),           // 상단 대형 타이틀 1줄 — accent 색 (예: "WHITEDAY")
  titleDark: z.string().min(1).optional(),  // 하단 대형 타이틀 2줄 — ink 색 (예: "SPECIAL")
  productImage: z.string().optional(),      // 3D 상품 오브젝트 이미지 URL (누끼/PNG 권장)
  subtitle: z.string().min(1).optional(),   // 하단 보조 문구 (em,br)
  bgColor: z.string().optional(),           // 배경 단색 (CSS 색상값, 기본 토큰 paper)
})
type Data = z.infer<typeof schema>

export const bannerEventTwozone = defineBlock<Data>({
  id: 'banner-event-twozone',
  archetype: 'banner',
  styleTags: ['warm', 'bold', 'playful', 'seasonal', 'template'],
  imageSlots: 1,
  describe:
    '기념일/이벤트 2존 배너. 단색 배경 + oval pill 이벤트 날짜 뱃지 + 영문 대형 2줄 타이틀(accent 1줄·ink 1줄) + 하단 3D 상품 오브젝트 이미지. 화이트데이·발렌타인·기념일 배너.',
  schema,
  css: `
/* betz- : banner-event-twozone 전용 접두사 */
.betz{
  position:relative;
  overflow:hidden;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:56px 40px 0;
  background:var(--betz-bg, var(--paper));
  min-height:520px;
}

/* oval 이벤트 날짜 뱃지 */
.betz-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:2px solid var(--ink);
  border-radius:999px;
  padding:7px 26px;
  font-family:var(--font-body);
  font-size:15px;
  font-weight:700;
  letter-spacing:.12em;
  color:var(--ink);
  margin-bottom:28px;
  text-transform:uppercase;
}

/* 상단 존 — 영문 대형 타이틀 */
.betz-zone-text{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
}

.betz-t1{
  font-family:'Cormorant Garamond', var(--font-display), serif;
  font-weight:700;
  font-size:110px;
  line-height:0.95;
  letter-spacing:-.02em;
  color:var(--accent);
  margin:0;
  text-transform:uppercase;
}

.betz-t2{
  font-family:'Cormorant Garamond', var(--font-display), serif;
  font-weight:700;
  font-size:110px;
  line-height:0.95;
  letter-spacing:-.02em;
  color:var(--ink);
  margin:0;
  text-transform:uppercase;
}

/* 하단 존 — 3D 상품 오브젝트 이미지 */
.betz-zone-img{
  width:100%;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  margin-top:32px;
  min-height:220px;
}

.betz-product{
  width:88%;
  max-width:620px;
  height:320px;
  object-fit:contain;
  display:block;
  filter:drop-shadow(0 24px 40px rgba(0,0,0,.14));
}

.betz-product.ph{
  border-radius:16px;
  height:260px;
}

/* 하단 부제목 (선택) */
.betz-sub{
  margin-top:28px;
  margin-bottom:36px;
  font-family:var(--font-body);
  font-size:16px;
  font-weight:600;
  color:var(--ink-2);
  line-height:1.6;
}

.betz .em{
  color:var(--accent);
  font-weight:800;
}
`,
  render: (d, { esc, richSafe }) => {
    const styleAttr = d.bgColor ? ` style="--betz-bg:${esc(d.bgColor)}"` : ''
    return `
<section class="betz"${styleAttr}>
  ${d.eventBadge ? `<span class="betz-badge">${esc(d.eventBadge)}</span>` : ''}
  <div class="betz-zone-text">
    <h2 class="betz-t1">${esc(d.titleAccent)}</h2>
    ${d.titleDark ? `<h2 class="betz-t2">${esc(d.titleDark)}</h2>` : ''}
  </div>
  <div class="betz-zone-img">
    ${media(d.productImage, 'betz-product', '상품 오브젝트')}
  </div>
  ${d.subtitle ? `<p class="betz-sub">${richSafe(d.subtitle)}</p>` : ''}
</section>`
  },
})
