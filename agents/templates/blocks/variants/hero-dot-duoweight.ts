/** HERO 아키타입: hero-dot-duoweight
 *  피그마 047_인트로_12 흡수.
 *  핵심 장치 ①점(.) 자간 분리 한글 타이포 ②SemiBold vs ExtraLight 극대비 2줄
 *  ③중앙 제품 이미지 ④세로선 구분 ⑤하단 ExtraBold 대형 CTA + 그라디언트 서브카피 + 배지
 *  다크(검정) 배경. CSS 접두: habn. 이미지 부재 시 강등(noimg-safe) 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 점(.) 자간 분리 강조 한글 — SemiBold 대형. 예: "가.성.비.좋.은"
   *  em 태그 허용(그라디언트 오버라이드용). */
  dotPhrase: z.string().min(1),
  /** ExtraLight 대형 서술형 2번째 줄. 예: "태블릿 찾으신다면" */
  lightLine: z.string().min(1),
  /** 제품 이미지 URL. 없으면 이미지 존 자체를 생략하고 세로선도 숨김(noimg-safe). */
  image: z.string().optional(),
  /** 이미지 대체 텍스트. */
  imageAlt: z.string().optional(),
  /** 이미지 아래 중앙 점(.) 자간 분리 Bold CTA 문구. 예: "바.로.여.기" */
  ctaDot: z.string().min(1),
  /** 세로선 아래 ExtraBold 최대형 강조 문구. 예: "가성비 끝.판.왕"
   *  브리프 근거 시만: optional로 두되 없으면 ctaDot이 대신 역할. */
  heroBottom: z.string().optional(),
  /** 하단 그라디언트 서브카피(2줄 허용, \n). 예: "가격은 저렴하게\n성능은 뛰어나게" */
  subCopy: z.string().optional(),
  /** 배지(그라디언트 알약 형태) 안 제품명 텍스트. 예: "탭맥스 에어라이트 10.9" */
  badgeText: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const heroDotDuoweight = defineBlock<Data>({
  id: 'hero-dot-duoweight',
  archetype: 'hero',
  styleTags: ['dark', 'premium', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크(검정) 배경 히어로. 점(.) 자간 분리 한글 + SemiBold·ExtraLight 극대비 2줄 타이포 → 제품 이미지 → 세로선 → ExtraBold 대형 CTA → 그라디언트 서브카피 + 배지. 전자제품·태블릿 가성비 소구에 최적.',
  schema,
  css: `
/* ── 전역 레이아웃 ── */
.habn{
  background:#000;
  color:#fff;
  padding:60px var(--pad-x,56px) 72px;
  text-align:center;
  font-family:var(--font-display,var(--font-body,'Pretendard','Apple SD Gothic Neo',sans-serif));
  overflow:hidden;
  position:relative;
}
/* richSafe .em 스코프 오버라이드 (dark 영역 필수) */
.habn .em{color:var(--em-dark,#FFF7EA)}

/* ── 상단 2줄 타이포 ── */
.habn-upper{
  display:flex;
  flex-direction:column;
  gap:4px;
  margin-bottom:40px;
}
.habn-dot{
  font-size:clamp(52px,8.5vw,90px);
  font-weight:700;
  line-height:1.05;
  letter-spacing:.02em;
  background:linear-gradient(90deg,#fff 0%,#aaa 60%,#fff 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.habn-light{
  font-size:clamp(52px,8.5vw,90px);
  font-weight:200;
  line-height:1.05;
  letter-spacing:-.01em;
  background:linear-gradient(90deg,#c8c8c8 0%,#fff 40%,#c0c0c0 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}

/* ── 제품 이미지 존 ── */
.habn-img-wrap{
  margin:0 auto 36px;
  width:min(724px,100%);
  aspect-ratio:724/636;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*22px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent,#7B68EE) 8%,#111);
  display:flex;
  align-items:center;
  justify-content:center;
}
.habn-img-wrap img,.habn-img-wrap .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:inherit;
}
/* noimg-safe: 이미지 없으면 존 자체 숨김 */
.habn-img-wrap.habn--noimg{display:none}

/* ── CTA dot 문구 (Bold, 이미지 바로 아래) ── */
.habn-cta-dot{
  font-size:clamp(56px,9.5vw,100px);
  font-weight:700;
  line-height:1.0;
  letter-spacing:.04em;
  background:linear-gradient(90deg,#FF9900 0%,#FFD700 40%,#FF6B00 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  margin-bottom:28px;
}

/* ── 세로선 구분 ── */
.habn-vline{
  width:2px;
  height:56px;
  margin:0 auto 28px;
  background:linear-gradient(180deg,transparent,rgba(255,255,255,.4),transparent);
}
/* noimg-safe: 이미지 없으면 세로선도 숨김 */
.habn-vline.habn--noimg{display:none}

/* ── 하단 ExtraBold 대형 ── */
.habn-bottom{
  font-size:clamp(56px,9.5vw,100px);
  font-weight:800;
  line-height:1.0;
  letter-spacing:.04em;
  background:linear-gradient(90deg,#fff 0%,#e0e0e0 50%,#fff 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  margin-bottom:22px;
}

/* ── 하단 수평선 ── */
.habn-hline{
  width:min(740px,90%);
  height:1px;
  margin:0 auto 26px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
}

/* ── 서브카피 (그라디언트) ── */
.habn-sub{
  font-size:clamp(36px,5.5vw,65px);
  font-weight:500;
  line-height:1.35;
  white-space:pre-line;
  background:linear-gradient(90deg,#ccc 0%,#fff 45%,#ccc 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  margin-bottom:28px;
}

/* ── 배지 (그라디언트 알약) ── */
.habn-badge{
  display:inline-block;
  padding:12px 32px;
  border-radius:999px;
  background:linear-gradient(90deg,#FF9900 0%,#FFD700 50%,#FF6B00 100%);
  color:#000;
  font-size:clamp(18px,2.8vw,28px);
  font-weight:600;
  letter-spacing:.03em;
  line-height:1.2;
}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0
    return `
<section class="habn">
  <!-- 상단 2줄 타이포: 점 자간 분리 SemiBold + ExtraLight -->
  <div class="habn-upper">
    <span class="habn-dot">${richSafe(d.dotPhrase)}</span>
    <span class="habn-light">${richSafe(d.lightLine)}</span>
  </div>

  <!-- 제품 이미지 (noimg-safe: 없으면 숨김) -->
  <div class="habn-img-wrap${hasImg ? '' : ' habn--noimg'}">
    ${hasImg ? media(d.image, '', esc(d.imageAlt ?? '제품 이미지')) : ''}
  </div>

  <!-- CTA dot 문구 -->
  <p class="habn-cta-dot">${richSafe(d.ctaDot)}</p>

  <!-- 세로선 (noimg-safe: 이미지 없으면 숨김) -->
  <div class="habn-vline${hasImg ? '' : ' habn--noimg'}"></div>

  ${d.heroBottom ? `<!-- 하단 ExtraBold 대형 CTA -->
  <p class="habn-bottom">${richSafe(d.heroBottom)}</p>` : ''}

  ${(d.heroBottom || d.subCopy) ? `<!-- 수평 구분선 -->
  <div class="habn-hline"></div>` : ''}

  ${d.subCopy ? `<!-- 그라디언트 서브카피 -->
  <p class="habn-sub">${esc(d.subCopy)}</p>` : ''}

  ${d.badgeText ? `<!-- 그라디언트 배지 -->
  <span class="habn-badge">${esc(d.badgeText)}</span>` : ''}
</section>`
  },
})
