/** BANNER 아키타입(템플릿 충실 재현): banner-seasonal-illustration.
 *  와디즈 200섹션 18_시즈널배너 _1965 패턴 — 전면 계절 일러스트 배경 씬 + 최상단 날짜 바 + KR+EN 대형 타이틀.
 *  시그니처: 따뜻한 베이지 풀배경 → 상단 색 띠(날짜/기간 pill) → 초대형 KR 제목 + EN 부제목(세리프)
 *  → 하단 풀블리드 계절 일러스트 씬 이미지. 이미지 1장(일러스트)으로 계절감 최대화.
 *  banner-seasonal(CSS 블롭), banner-seasonal-wreath(화환 4장)과 구별되는 일러스트 씬 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  dateBadge: z.string().min(1).optional(),   // 상단 날짜 바 텍스트 (예: "9.15일(월) - 09.25일(목)")
  titleKr: z.string().min(1),                // 대형 한국어 타이틀 (em,br 허용)
  titleEn: z.string().min(1),                // 대형 영문 타이틀 (예: "EVENT", "SALE")
  illustrationImage: z.string().optional(),  // 하단 계절 일러스트 씬 이미지 (url)
  bgColor: z.string().optional(),            // 배경 색상 (CSS 색상값, 기본: var(--bg))
  badgeColor: z.string().optional(),         // 날짜 바 배경색 (CSS 색상값, 기본: var(--brand))
})
type Data = z.infer<typeof schema>

export const bannerSeasonalIllustration = defineBlock<Data>({
  id: 'banner-seasonal-illustration',
  archetype: 'banner',
  styleTags: ['premium', 'template', 'seasonal', 'warm', 'playful', 'illustration'],
  imageSlots: 1,
  describe:
    '계절 일러스트 씬 배너. 따뜻한 풀배경 위에 상단 날짜 바(색 띠) + 초대형 KR 한국어 타이틀 + EN 영문 부제목(세리프) + 하단 풀폭 계절 일러스트 씬 이미지. 봄·여름·가을·겨울 시즌 이벤트 배너에 적합. 일러스트 1장으로 계절감 최대화.',
  schema,
  css: `
/* bsi- : banner-seasonal-illustration 전용 접두사 */
.bsi{
  position:relative;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  align-items:center;
  background:var(--bsi-bg, var(--bg));
  min-height:620px;
  padding-bottom:300px; /* 하단 일러스트 씬이 점유할 공간 확보 */
}

/* 상단 날짜 바 — 색 띠 pill */
.bsi-datebar{
  display:inline-block;
  margin:44px auto 0;
  padding:10px 28px;
  background:var(--bsi-badge, var(--brand));
  color:#fff;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:17px;
  font-weight:700;
  letter-spacing:.04em;
  border-radius:calc(var(--r-scale,1)*6px);
  line-height:1.4;
  text-align:center;
  white-space:nowrap;
  position:relative;
  z-index:2;
}

/* 콘텐츠 영역 — 날짜 바 아래, 일러스트 위 */
.bsi-content{
  position:relative;
  z-index:2;
  text-align:center;
  padding:10px 32px 0;
  width:100%;
  max-width:100%;
}

/* KR 대형 타이틀 */
.bsi-title-kr{
  font-family:var(--font-serif),'Gowun Batang',serif;
  font-weight:700;
  font-size:clamp(56px, 15vw, 112px);
  line-height:1.05;
  color:var(--brand);
  letter-spacing:-.02em;
  margin:0;
  word-break:keep-all;
  overflow-wrap:break-word;
  max-width:100%;
}
.bsi-title-kr .em{
  color:var(--accent);
}

/* EN 대형 타이틀 — 영문 대문자 세리프(Cormorant Garamond) */
.bsi-title-en{
  font-family:var(--font-lat),'Cormorant Garamond',serif;
  font-weight:600;
  font-size:clamp(60px, 16vw, 120px);
  line-height:1.0;
  color:var(--brand);
  letter-spacing:.04em;
  text-transform:uppercase;
  margin:0 0 4px;
  word-break:keep-all;
  overflow-wrap:break-word;
  max-width:100%;
}
.bsi-title-en .em{
  color:var(--accent);
}

/* 하단 일러스트 씬 — 풀블리드 배경 레이어, 하단 고정 */
.bsi-illust{
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  height:auto;
  object-fit:cover;
  z-index:1;
  display:block;
}
.bsi-illust.ph{
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  height:300px;
  object-fit:cover;
  z-index:1;
}
`,
  render: (d, { esc, richSafe }) => {
    const styleAttr = [
      d.bgColor ? `--bsi-bg:${esc(d.bgColor)}` : '',
      d.badgeColor ? `--bsi-badge:${esc(d.badgeColor)}` : '',
    ]
      .filter(Boolean)
      .join(';')

    return `
<section class="bsi"${styleAttr ? ` style="${styleAttr}"` : ''}>
  ${d.dateBadge ? `<span class="bsi-datebar">${esc(d.dateBadge)}</span>` : ''}
  <div class="bsi-content">
    <h2 class="bsi-title-kr">${richSafe(d.titleKr)}</h2>
    <h2 class="bsi-title-en">${richSafe(d.titleEn)}</h2>
  </div>
  ${media(d.illustrationImage, 'bsi-illust', '계절 일러스트 씬')}
</section>`
  },
})
