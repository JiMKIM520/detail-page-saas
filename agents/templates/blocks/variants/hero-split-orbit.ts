/** HERO 아키타입: hero-split-orbit
 *  상단 흰 패널(라인텍스트 뱃지 + 2줄 타이틀) ↔ 하단 다크 그라디언트 패널(대형 카피 + 부제)
 *  경계에서 원형 제품 이미지가 두 영역을 오버랩하며 자연스러운 색 전환을 연결한다.
 *  이미지 부재 시 원형 프레임이 사라지고 두 패널이 헤어라인 구분으로 강등 렌더 (noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().optional(),           // 상단 라인텍스트 뱃지 (순수 텍스트)
  titleSub: z.string().min(1),            // 타이틀 1행 (em,br 허용) — 작은 톤
  titleMain: z.string().min(1),           // 타이틀 2행 (em,br 허용) — 큰 톤
  image: z.string().optional(),           // 원형 제품 이미지 (url)
  headlineTop: z.string().min(1),         // 다크 영역 대형 카피 상단 (em,br 허용) — 슬래시 구분 형식도 가능
  headlineBottom: z.string().min(1),      // 다크 영역 대형 카피 하단 (em,br 허용)
  subCopy: z.string().optional(),         // 다크 영역 부제 (em,br 허용) — 브리프 근거 시만
})
type Data = z.infer<typeof schema>

export const heroSplitOrbit = defineBlock<Data>({
  id: 'hero-split-orbit',
  archetype: 'hero',
  styleTags: ['mixed', 'split', 'product', 'premium', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '상단 흰 영역(라인텍스트 뱃지 + 2줄 브랜드 타이틀)과 하단 다크 그라디언트 영역(대형 임팩트 카피)을 원형 제품 이미지가 경계에서 오버랩하며 이분할 색 전환을 연결하는 히어로. 전자제품·가전·무선기기류의 성능 강조에 적합.',
  schema,
  css: `
.havd{position:relative;width:100%;overflow:hidden;background:var(--bg)}

/* ── 상단 흰 영역 ──────────────────────────────────────────── */
.havd-top{
  position:relative;
  padding:54px var(--pad-x,56px) 0;
  background:#ffffff;
  text-align:center;
  z-index:1;
}

/* 백그라운드 벡터 장식 — 흰 패널에 은은한 웨이브 실루엣 */
.havd-top::before{
  content:'';
  position:absolute;
  inset:0;
  background:
    radial-gradient(ellipse 140% 60% at 50% 110%, color-mix(in srgb,var(--accent) 6%,transparent) 0%, transparent 70%);
  pointer-events:none;
}

/* 라인텍스트 뱃지 */
.havd-badge-wrap{
  display:inline-flex;
  align-items:center;
  gap:10px;
  margin-bottom:22px;
}
.havd-badge-line{flex:0 0 40px;height:1.5px;background:var(--ink);opacity:.35}
.havd-badge{
  font-size:17px;
  font-weight:600;
  letter-spacing:.08em;
  color:var(--ink);
  white-space:nowrap;
}

/* 2줄 타이틀 */
.havd-title-sub{
  font-family:var(--font-display);
  font-size:30px;
  font-weight:500;
  color:var(--brand);
  line-height:1.2;
  letter-spacing:-.01em;
  margin-bottom:10px;
}
.havd-title-sub .em{color:var(--accent-d);font-weight:700}
.havd-title-main{
  font-family:var(--font-display);
  font-size:52px;
  font-weight:800;
  color:var(--brand);
  line-height:1.1;
  letter-spacing:-.02em;
  margin-bottom:0;
}
.havd-title-main .em{color:var(--accent-d)}

/* 원형 이미지 오버랩 — 하단 다크 영역에 절반 이상 걸쳐 경계를 연결 */
.havd-orbit-wrap{
  position:relative;
  z-index:10;
  margin:30px auto -120px;
  width:340px;
  height:340px;
}
.havd-orbit-img{
  width:340px;
  height:340px;
  border-radius:50%;
  object-fit:contain;
  background:transparent;
  display:block;
  filter:drop-shadow(0 24px 48px rgba(0,0,0,.22));
}
/* 이미지 없을 때 오버랩 래퍼 자체를 숨겨 레이아웃 붕괴 방지 (noimg-safe) */
.havd-orbit-wrap.havd--noimg{
  display:none;
  margin-bottom:0;
}
/* 이미지 없을 때 상단 패널 하단 패딩 보상 */
.havd--noimg-active .havd-top{padding-bottom:40px}
.havd--noimg-active .havd-divider{display:block}

/* 상단↔하단 전환 연결 곡선 SVG */
.havd-wave{
  position:relative;
  z-index:2;
  display:block;
  width:100%;
  height:70px;
  margin-top:0;
  overflow:hidden;
  background:transparent;
}
.havd-wave svg{display:block;width:100%;height:100%}

/* ── 하단 다크 그라디언트 영역 ───────────────────────────────── */
.havd-bot{
  position:relative;
  z-index:1;
  padding:140px var(--pad-x,56px) 64px;
  background:linear-gradient(175deg, var(--brand) 0%, color-mix(in srgb,var(--brand) 70%,#000) 100%);
  text-align:center;
}
/* noimg-safe: 이미지 없을 때 상단 패딩 축소 */
.havd--noimg-active .havd-bot{padding-top:48px}

/* 다크 영역 richSafe em 스코프 오버라이드 */
.havd-bot .em{color:var(--em-dark,#FFF7EA)}

.havd-hl-top{
  font-family:var(--font-display);
  font-size:72px;
  font-weight:800;
  color:#ffffff;
  line-height:1.08;
  letter-spacing:-.02em;
  word-break:keep-all;
}
.havd-hl-top .em{color:var(--em-dark,#FFF7EA)}

/* 구분선 */
.havd-rule{
  width:100%;
  height:1px;
  background:#ffffff;
  opacity:.22;
  margin:28px 0;
}

.havd-hl-bot{
  font-family:var(--font-display);
  font-size:36px;
  font-weight:500;
  color:#ffffff;
  line-height:1.5;
  letter-spacing:-.01em;
  opacity:.92;
}
.havd-hl-bot .em{color:var(--em-dark,#FFF7EA)}

.havd-subcopy{
  margin-top:20px;
  font-size:18px;
  font-weight:500;
  color:#ffffff;
  opacity:.7;
  line-height:1.65;
}
.havd-subcopy .em{color:var(--em-dark,#FFF7EA)}

/* noimg-safe: 이미지 없을 때 대신 노출하는 헤어라인 구분 */
.havd-divider{
  display:none;
  width:60px;
  height:3px;
  background:var(--accent);
  border-radius:999px;
  margin:0 auto 24px;
}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const noImgClass = hasImg ? '' : ' havd--noimg-active'

    return `
<section class="havd${noImgClass}">

  <!-- 상단 흰 영역 -->
  <div class="havd-top">
    ${d.badge ? `
    <div class="havd-badge-wrap">
      <span class="havd-badge-line"></span>
      <span class="havd-badge">${esc(d.badge)}</span>
      <span class="havd-badge-line"></span>
    </div>` : ''}
    <p class="havd-title-sub">${richSafe(d.titleSub)}</p>
    <h1 class="havd-title-main">${richSafe(d.titleMain)}</h1>

    <!-- 원형 제품 이미지 오버랩 -->
    <div class="havd-orbit-wrap${hasImg ? '' : ' havd--noimg'}">
      ${hasImg ? media(d.image, 'havd-orbit-img', esc(d.titleMain)) : ''}
    </div>
  </div>

  <!-- 상단↔하단 연결 웨이브 (이미지 있을 때만 시각적으로 의미 있음) -->
  <div class="havd-wave" aria-hidden="true">
    <svg viewBox="0 0 860 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0 L860 0 L860 70 Q430 0 0 70 Z"
        fill="url(#havd-grad)"
      />
      <defs>
        <linearGradient id="havd-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="transparent"/>
        </linearGradient>
      </defs>
    </svg>
  </div>

  <!-- 하단 다크 그라디언트 영역 -->
  <div class="havd-bot">
    <div class="havd-divider"></div>
    <p class="havd-hl-top">${richSafe(d.headlineTop)}</p>
    <div class="havd-rule" aria-hidden="true"></div>
    <p class="havd-hl-bot">${richSafe(d.headlineBottom)}</p>
    ${d.subCopy ? `<p class="havd-subcopy">${richSafe(d.subCopy)}</p>` : ''}
  </div>

</section>`
  },
})
