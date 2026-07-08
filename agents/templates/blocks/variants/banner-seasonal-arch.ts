/** BANNER 아키타입(템플릿 충실 재현): banner-seasonal-arch.
 *  와디즈 200섹션 18_시즈널배너 — 아치형 컨테이너 배너.
 *  포토 배경 전체 + 중앙 아치형(상단 반원) 반투명 컨테이너 안에
 *  영문 이벤트 라벨 + 월 숫자(대형) + 제목 + 기간 pill.
 *  좌하단 할인 뱃지(~N% OFF). 봄·여름 시즌 배너 대표 레이아웃.
 *  banner-seasonal(CSS블롭), banner-seasonal-wreath(화환)와 구분되는
 *  사진배경 + 아치 컨테이너 집중 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  bgImage: z.string().optional(),             // 풀배경 포토 이미지 (url)
  eyebrow: z.string().min(1).optional(),      // 아치 상단 영문 이벤트 라벨 (예: "SPRING EVENT")
  month: z.string().min(1).optional(),        // 월 숫자 텍스트 (예: "5월", "12월")
  title: z.string().min(1),                   // 아치 내 제목 (em, br 허용)
  period: z.string().min(1).optional(),       // 기간 pill (예: "5월 1일(금) ~ 5월 31일(일)")
  discountRate: z.string().min(1).optional(), // 좌하단 뱃지 할인율 (예: "~50%")
  discountLabel: z.string().min(1).optional(),// 뱃지 하단 라벨 (예: "OFF")
})
type Data = z.infer<typeof schema>

export const bannerSeasonalArch = defineBlock<Data>({
  id: 'banner-seasonal-arch',
  archetype: 'banner',
  styleTags: ['premium', 'template', 'seasonal', 'playful', 'warm', 'light'],
  imageSlots: 1,
  describe:
    '시즌 아치형 배너. 풀배경 포토 위 아치형(상단 반원) 반투명 컨테이너 — 안에 영문 이벤트 라벨 + 대형 월 숫자 + 제목 + 기간 pill. 좌하단 할인 뱃지. 봄·여름 시즌 포토 배너.',
  schema,
  css: `
/* bsa- : banner-seasonal-arch 전용 접두사 */
.bsa{
  position:relative;
  overflow:hidden;
  min-height:560px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:color-mix(in srgb,var(--accent) 18%,#fff);
}

/* 풀배경 이미지 */
.bsa-bg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  z-index:0;
}
/* placeholder: 반투명 accent 틴트로 fallback */
.bsa-bg.ph{
  background:linear-gradient(150deg,color-mix(in srgb,var(--accent) 30%,#fff) 0%,var(--bg) 100%);
  border:none;
}

/* 중앙 아치형 컨테이너
   상단 반원(border-radius 50% on top) + 하단 직각 */
.bsa-arch{
  position:relative;
  z-index:2;
  width:340px;
  background:rgba(255,255,255,0.58);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  border-radius:170px 170px calc(var(--r-scale,1)*28px) calc(var(--r-scale,1)*28px);
  border:2px solid rgba(255,255,255,0.72);
  box-shadow:0 8px 48px rgba(0,0,0,0.08);
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:44px 36px 40px;
  text-align:center;
  margin:60px auto;
}

/* 영문 이벤트 라벨 */
.bsa-eyebrow{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:14px;
  font-weight:800;
  letter-spacing:.22em;
  color:color-mix(in srgb,var(--ink) 72%,transparent);
  margin-bottom:16px;
  text-transform:uppercase;
}

/* 월 숫자 — 대형 디스플레이 */
.bsa-month{
  font-family:var(--font-display);
  font-weight:800;
  font-size:88px;
  line-height:0.9;
  letter-spacing:-.03em;
  color:var(--ink);
  margin-bottom:10px;
}

/* 제목 */
.bsa-title{
  font-family:var(--font-display);
  font-weight:700;
  font-size:28px;
  line-height:1.25;
  color:var(--ink);
  letter-spacing:-.01em;
  margin-bottom:0;
}
.bsa-title .em{
  color:var(--accent);
}

/* 기간 pill */
.bsa-period{
  display:inline-block;
  margin-top:22px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:14px;
  font-weight:600;
  color:var(--ink);
  letter-spacing:.01em;
  padding:8px 20px;
  background:rgba(255,255,255,0.78);
  border-radius:999px;
  border:1.5px solid rgba(255,255,255,0.9);
  box-shadow:0 2px 8px rgba(0,0,0,0.06);
}

/* 좌하단 할인 뱃지 */
.bsa-badge{
  position:absolute;
  left:40px;
  bottom:44px;
  z-index:3;
  background:rgba(255,255,255,0.82);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  border:2px solid rgba(255,255,255,0.9);
  border-radius:calc(var(--r-scale,1)*18px);
  padding:14px 22px;
  display:flex;
  flex-direction:column;
  align-items:center;
  box-shadow:0 4px 20px rgba(0,0,0,0.10);
  min-width:88px;
}

/* 할인율 */
.bsa-badge-rate{
  font-family:var(--font-display);
  font-weight:800;
  font-size:26px;
  line-height:1;
  color:#c0392b;
  letter-spacing:-.01em;
}

/* 뱃지 하단 라벨 */
.bsa-badge-label{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:13px;
  font-weight:700;
  letter-spacing:.12em;
  color:#c0392b;
  margin-top:4px;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="bsa">
  ${media(d.bgImage, 'bsa-bg', '시즌 배경 이미지')}
  <div class="bsa-arch">
    ${d.eyebrow ? `<p class="bsa-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    ${d.month ? `<p class="bsa-month">${esc(d.month)}</p>` : ''}
    <h2 class="bsa-title">${richSafe(d.title)}</h2>
    ${d.period ? `<p class="bsa-period">${esc(d.period)}</p>` : ''}
  </div>
  ${(d.discountRate || d.discountLabel) ? `
  <div class="bsa-badge">
    ${d.discountRate ? `<span class="bsa-badge-rate">${esc(d.discountRate)}</span>` : ''}
    ${d.discountLabel ? `<span class="bsa-badge-label">${esc(d.discountLabel)}</span>` : ''}
  </div>` : ''}
</section>`,
})
