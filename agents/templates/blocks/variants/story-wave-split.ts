/** STORY 아키타입(템플릿 충실 재현): story-wave-split.
 *  와디즈 200섹션 09_브랜드스토리_568:4885 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 이미지 + 상단 다크 그라데이션 오버레이 위 EN 디스플레이 텍스트 →
 *  SVG 웨이브(하향 아치) 전환 → 솔리드 accent 브랜드 패널(KR 대형 헤드라인 + 본문).
 *  story-photo-header(히어로+라벨띠+라이트 본문)·story-dark-editorial(다크 잉크 인셋 2열)과 다른
 *  웨이브 도형 전환 + 컬러 패널 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 풀블리드 배경 이미지 URL */
  heroImage: z.string().optional(),
  /** 이미지 위 장식 EN 디스플레이 텍스트 (예: "OUR BRAND\nSTORY") — aria-hidden, 순수 장식 */
  decoText: z.string().min(1).optional(),
  /** accent 패널 KR 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 본문 문단 배열 (1~3개, em/br 허용) */
  paragraphs: z.array(z.string().min(1)).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const storyWaveSplit = defineBlock<Data>({
  id: 'story-wave-split',
  archetype: 'story',
  styleTags: ['dark', 'editorial', 'premium', 'template', 'fullbleed', 'colorblock'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(웨이브 전환). 풀블리드 이미지 + 상단 다크 그라데이션 위 EN 장식 텍스트 → SVG 웨이브 하향 아치 전환 → accent 솔리드 패널(KR 대형 헤드라인 + 본문). 이미지-컬러블록 웨이브 분할 구조.',
  schema,
  css: `
/* story-wave-split — 접두사 sws- */
.sws{
  background:var(--bg);
  overflow:hidden;
  position:relative;
}

/* ── 상단: 풀블리드 이미지 영역 ── */
.sws-hero-wrap{
  position:relative;
  width:100%;
  /* 이미지 높이 + 웨이브가 겹칠 공간 확보 */
  padding-bottom:0;
  overflow:hidden;
}

/* 풀블리드 히어로 이미지 */
.sws-hero{
  width:100%;
  height:520px;
  object-fit:cover;
  display:block;
}
.sws-hero.ph{
  width:100%;
  height:520px;
  border-radius:0;
  border:none;
  background:rgba(0,0,0,.08);
}

/* 상단 다크 그라데이션 오버레이 (EN 텍스트 가독성) */
.sws-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(180deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.12) 52%,rgba(0,0,0,0) 100%);
  pointer-events:none;
}

/* EN 장식 디스플레이 텍스트 */
.sws-deco{
  position:absolute;
  top:52px;
  left:50%;
  transform:translateX(-50%);
  width:calc(100% - 64px);
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,9.5vw,88px);
  line-height:1.08;
  letter-spacing:-.01em;
  color:#fff;
  text-align:center;
  white-space:pre-wrap;
  word-break:keep-all;
  text-shadow:0 2px 24px rgba(0,0,0,.35);
  z-index:2;
  pointer-events:none;
}

/* ── 웨이브 전환: 이미지 하단 → accent 패널 ── */
/* SVG 웨이브는 이미지 영역 하단에 겹쳐 accent 색으로 채운 하향 아치를 그린다 */
.sws-wave{
  display:block;
  width:100%;
  /* 웨이브 높이 — 이미지 영역과 패널 사이 부드러운 전환 */
  height:72px;
  margin-top:-1px; /* 픽셀 갭 방지 */
}

/* ── 하단: accent 솔리드 브랜드 패널 ── */
.sws-panel{
  background:var(--accent);
  color:#fff;
  padding:44px 40px 64px;
}

/* KR 대형 헤드라인 */
.sws-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,5.8vw,52px);
  line-height:1.22;
  letter-spacing:-.03em;
  color:#fff;
  margin-bottom:28px;
  word-break:keep-all;
}
.sws-title .em{
  color:color-mix(in srgb,#fff 70%,var(--accent-dark,var(--accent)));
}

/* 본문 문단 */
.sws-copy{
  display:flex;
  flex-direction:column;
  gap:18px;
}
.sws-p{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:400;
  color:rgba(255,255,255,.82);
  line-height:1.85;
  letter-spacing:-.01em;
  word-break:keep-all;
}
.sws-p .em{
  color:#fff;
  font-weight:700;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="sws">
  <div class="sws-hero-wrap">
    ${media(d.heroImage, 'sws-hero', '브랜드 스토리 대표 이미지')}
    <div class="sws-overlay"></div>
    <p class="sws-deco" aria-hidden="true">${esc(d.decoText ?? 'OUR BRAND\nSTORY')}</p>
  </div>
  <svg class="sws-wave" viewBox="0 0 1000 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M0,0 C250,72 750,72 1000,0 L1000,72 L0,72 Z" fill="var(--accent)"/>
  </svg>
  <div class="sws-panel">
    <h2 class="sws-title">${richSafe(d.title)}</h2>
    <div class="sws-copy">
      ${d.paragraphs.map((p) => `<p class="sws-p">${richSafe(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>`,
})
