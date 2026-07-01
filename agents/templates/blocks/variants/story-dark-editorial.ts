/** STORY 아키타입(템플릿 충실 재현): story-dark-editorial.
 *  와디즈 200섹션 09_브랜드스토리_299:458 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 솔리드 다크(--ink) 배경 + 초대형 EN 장식 텍스트(accent) 좌측 + 인셋 이미지 우측
 *  + KR 헤드라인 우정렬 + 본문 우정렬. 배경 이미지 없는 에디토리얼 다크 블록. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 초대형 장식 영문 텍스트 (예: "OUR BRAND STORY") — 순수 장식, aria-hidden */
  decoText: z.string().min(1).optional(),
  /** 인셋 이미지 URL */
  image: z.string().optional(),
  /** 인셋 이미지 alt 텍스트 */
  imageAlt: z.string().optional(),
  /** 우정렬 KR 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 본문 문단 배열 (1~3개) */
  paragraphs: z.array(z.string().min(1)).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const storyDarkEditorial = defineBlock<Data>({
  id: 'story-dark-editorial',
  archetype: 'story' as any,
  styleTags: ['dark', 'editorial', 'premium', 'template'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(다크 에디토리얼). 솔리드 다크 배경 + 초대형 EN 장식 텍스트(accent, 좌측) + 인셋 이미지(우측) + KR 헤드라인·본문 우정렬. 배경이미지 없는 에디토리얼.',
  schema,
  css: `
/* story-dark-editorial — 접두사 sde- */
.sde{
  background:var(--ink);
  color:#fff;
  padding:0;
  overflow:hidden;
  position:relative;
}

/* 바닥 그라데이션 장식 */
.sde::after{
  content:"";
  position:absolute;
  left:0;right:0;bottom:0;
  height:180px;
  background:linear-gradient(180deg,transparent 0%,color-mix(in srgb,var(--brand) 40%,transparent) 100%);
  pointer-events:none;
}

/* 상단 2열 영역: 장식 텍스트(좌) + 인셋 이미지(우) */
.sde-top{
  display:grid;
  grid-template-columns:1fr 1fr;
  align-items:flex-start;
  min-height:320px;
}

/* 초대형 장식 EN 텍스트 */
.sde-deco{
  padding:48px 0 32px 48px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,9vw,88px);
  line-height:1.05;
  letter-spacing:-.02em;
  color:var(--accent);
  word-break:break-word;
  hyphens:none;
  /* 세 줄로 자연스럽게 흘러가게 허용 */
  white-space:pre-wrap;
}

/* 인셋 이미지 */
.sde-img-wrap{
  padding:40px 48px 0 20px;
  display:flex;
  justify-content:flex-end;
}
.sde-img{
  width:100%;
  max-width:340px;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block;
}
.sde-img.ph{
  width:100%;
  max-width:340px;
  aspect-ratio:1/1;
  border:2px dashed rgba(255,255,255,.22);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.35);
}

/* 하단 우정렬 텍스트 영역 */
.sde-body{
  position:relative;
  z-index:1;
  padding:20px 48px 64px;
  text-align:right;
}

/* KR 헤드라인 */
.sde-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,5.2vw,54px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:28px;
}
.sde-title .em{color:var(--accent)}

/* 본문 문단 */
.sde-para{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.8;
  color:rgba(255,255,255,.65);
  margin-bottom:16px;
  letter-spacing:-.01em;
  text-align:right;
}
.sde-para:last-child{margin-bottom:0}
.sde-para .em{color:var(--accent);font-weight:700}

/* 구분 라인 (우정렬) */
.sde-rule{
  width:48px;
  height:2px;
  background:var(--accent);
  margin:0 0 28px auto;
}
`,
  render: (d, { esc, richSafe }) => {
    const paragraphsHtml = d.paragraphs
      .map((p) => `<p class="sde-para">${richSafe(p)}</p>`)
      .join('')

    return `
<section class="sde">
  <div class="sde-top">
    <p class="sde-deco" aria-hidden="true">${esc(d.decoText ?? 'OUR\nBRAND\nSTORY')}</p>
    <div class="sde-img-wrap">
      ${media(d.image, 'sde-img', esc(d.imageAlt ?? '브랜드 이미지'))}
    </div>
  </div>
  <div class="sde-body">
    <h2 class="sde-title">${richSafe(d.title)}</h2>
    <div class="sde-rule"></div>
    ${paragraphsHtml}
  </div>
</section>`
  },
})
