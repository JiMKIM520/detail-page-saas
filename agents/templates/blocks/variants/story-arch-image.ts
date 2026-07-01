/** STORY 아키타입(템플릿 충실 재현): story-arch-image.
 *  와디즈 200섹션 09_브랜드스토리 299:448 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 상단 accent 배경 + 아치/pill 형 이미지(영문 라벨 오버레이) →
 *  하단 라이트 배경 + 중앙 KR 제목(일반+굵게) + 중앙 본문 문단.
 *  story-curve-panel(곡선 패널)·story-brand(풀블리드)와 달리 아치 이미지 컨테이너 중심 구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 아치 이미지 위 영문 라벨 (예: "OUR BRAND STORY") */
  enLabel: z.string().min(1),
  /** 아치/pill 이미지 URL */
  image: z.string().optional(),
  /** KR 제목 일반 텍스트 첫 줄 (예: "우리의 브랜드") — em,br 허용 */
  titlePre: z.string().min(1).optional(),
  /** KR 제목 굵은 텍스트 둘째 줄 (예: "스토리를 들려주세요") — em,br 허용 */
  titleBold: z.string().min(1),
  /** 본문 문단들 (1~3개) — em,br 허용 */
  paragraphs: z.array(z.string().min(1)).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const storyArchImage = defineBlock<Data>({
  id: 'story-arch-image',
  archetype: 'story' as any,
  styleTags: ['editorial', 'light', 'template', 'arch', 'story', 'centered'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(아치 이미지). 상단 accent 배경 + 아치/pill형 이미지(영문 라벨 오버레이) + 하단 라이트 배경 중앙 KR 제목(일반+굵게) + 중앙 본문. story-curve-panel의 곡선 패널과 달리 아치 이미지 컨테이너 중심.',
  schema,
  css: `
/* story-arch-image — 접두사 sai- */
.sai{background:var(--bg);color:var(--ink)}

/* 상단 accent 밴드: 아치 이미지를 담는 배경 */
.sai-top{
  background:color-mix(in srgb,var(--accent) 22%,var(--bg));
  padding:52px 44px 0;
  text-align:center;
}

/* 아치(pill) 이미지 컨테이너: 위쪽 두 모서리만 라운드 처리 */
.sai-arch{
  position:relative;
  width:100%;
  max-width:600px;
  margin:0 auto;
  border-radius:999px 999px 0 0;
  overflow:hidden;
  /* 세로:가로 = 약 4:3, 이미지가 아치 공간 채움 */
  aspect-ratio:3/4;
}
.sai-arch-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.sai-arch-img.ph{
  width:100%;
  height:100%;
  border-radius:0;
  border:none;
}

/* 이미지 위 그라데이션 오버레이: 하단에서 위로 어둡게 — 라벨 가독성 */
.sai-arch::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(
    180deg,
    rgba(0,0,0,0) 45%,
    rgba(0,0,0,.38) 78%,
    rgba(0,0,0,.55) 100%
  );
  pointer-events:none;
}

/* 아치 이미지 위 영문 라벨 (하단 중앙 절대 배치) */
.sai-en-label{
  position:absolute;
  bottom:36px;
  left:0;right:0;
  z-index:2;
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,5vw,44px);
  letter-spacing:.06em;
  line-height:1.18;
  color:var(--accent);
  text-shadow:0 2px 18px rgba(0,0,0,.22);
}

/* 하단 라이트 콘텐츠 영역 */
.sai-body{
  padding:56px 44px 64px;
  text-align:center;
}

/* KR 제목 */
.sai-title{
  font-family:var(--font-display);
  font-size:clamp(34px,6vw,52px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:36px;
}
.sai-title-pre{
  font-weight:400;
  display:block;
}
.sai-title-bold{
  font-weight:800;
  display:block;
  color:var(--ink);
}
.sai-title .em{color:var(--accent)}

/* 본문 문단 */
.sai-copy{
  max-width:560px;
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:24px;
}
.sai-p{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.85;
  letter-spacing:-.01em;
}
.sai-p .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="sai">
  <div class="sai-top">
    <div class="sai-arch">
      ${media(d.image, 'sai-arch-img', '브랜드 스토리 이미지')}
      <div class="sai-en-label">${esc(d.enLabel)}</div>
    </div>
  </div>
  <div class="sai-body">
    <h2 class="sai-title">${d.titlePre ? `<span class="sai-title-pre">${richSafe(d.titlePre)}</span>` : ''}<span class="sai-title-bold">${richSafe(d.titleBold)}</span></h2>
    <div class="sai-copy">
      ${d.paragraphs.map((p) => `<p class="sai-p">${richSafe(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>`,
})
