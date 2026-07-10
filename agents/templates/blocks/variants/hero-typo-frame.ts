/** HERO 아키타입: hero-typo-frame.
 *  피그마 038_포인트_구성_페이지_8 흡수 재구성.
 *  초대형 영문 타이포(topWord / bottomWord)가 중앙 인물 이미지를 위아래로 프레임하는
 *  에디토리얼 다크 히어로.
 *  [v3] 좌우 세로 마퀴 스트립 제거 — writing-mode 애니메이션이 872px 컨테이너 외부 흰
 *       여백으로 2회 연속 이탈. overflow:hidden으로 안정화 불가(translateY -50% 기준점
 *       이탈). 심플 프레임으로 강등. marqueeText 필드는 스키마에서 제거. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  topWord: z.string().min(1),          // 상단 초대형 영문 (예: "BURN")
  bottomWord: z.string().min(1),       // 하단 초대형 영문 (예: "NOW")
  headline: z.string().optional(),     // 이미지 위 소제목 (em 허용)
  copy: z.string().min(1),             // 이미지 중앙 대형 한글 카피 (em 허용)
  image: z.string().optional(),        // 인물/제품 사진 (url)
})
type Data = z.infer<typeof schema>

export const heroTypoFrame = defineBlock<Data>({
  id: 'hero-typo-frame',
  archetype: 'hero',
  styleTags: ['dark', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '에디토리얼 다크 히어로. 초대형 영문 타이포(topWord/bottomWord)가 중앙 이미지를 위아래 프레임. 뷰티·피트니스·의류 등 강렬한 무드 브랜드 적합.',
  schema,
  css: `
/* 루트 컨테이너 — overflow:hidden으로 모든 자식을 872px 폭 안으로 가둠 */
.hxuv{
  position:relative;
  background:#000;
  color:#fff;
  width:100%;
  max-width:100%;
  overflow:hidden;
  user-select:none;
  box-sizing:border-box;
}

/* 상단 초대형 타이포 — 이미지를 위에서 프레임 */
.hxuv-top-word{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(80px, 20vw, 190px);
  line-height:.82;
  letter-spacing:-.04em;
  color:#fff;
  text-align:center;
  display:block;
  width:100%;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:clip;
  position:relative;
  z-index:2;
  /* 이미지 위로 살짝 내려 오버랩 — 프레임 장치 */
  margin-bottom:-0.16em;
  padding:0 8px;
  box-sizing:border-box;
}

/* 이미지 래퍼 */
.hxuv-img-wrap{
  position:relative;
  width:100%;
  aspect-ratio:660/865;
  overflow:hidden;
  background:#111;
  min-height:200px;
  /* 부모 overflow:hidden이 이미지 클리핑 담당 */
}
.hxuv-img-wrap img{
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center top;
  display:block;
}
/* 이미지 없을 때: 틴트 패널로 강등 (noimg-safe) */
.hxuv-img-wrap .ph{
  display:block!important;
  width:100%;height:100%;
  background:color-mix(in srgb,var(--accent,#e53935) 12%,#111);
}

/* 이미지 위 스크림 + 텍스트 오버레이 */
.hxuv-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(to top, rgba(0,0,0,.76) 0%, rgba(0,0,0,.22) 52%, transparent 100%);
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  padding:0 clamp(20px,5vw,56px) clamp(20px,4vw,40px);
  z-index:2;
  box-sizing:border-box;
}
/* richSafe 텍스트 위 em 오버라이드 (다크 영역) */
.hxuv .em{color:var(--em-dark,#FFF7EA)}
.hxuv-headline{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(14px, 3vw, 24px);
  color:rgba(255,255,255,.72);
  letter-spacing:.06em;
  margin:0 0 8px;
  line-height:1.3;
}
.hxuv-copy{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(44px, 11vw, 100px);
  line-height:1.0;
  letter-spacing:-.03em;
  color:#fff;
  text-shadow:0 2px 28px rgba(0,0,0,.55);
  margin:0;
  white-space:pre-line;
}

/* 하단 초대형 타이포 — 이미지를 아래에서 프레임 */
.hxuv-bottom-word{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(80px, 20vw, 190px);
  line-height:.82;
  letter-spacing:-.04em;
  color:#fff;
  text-align:center;
  display:block;
  width:100%;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:clip;
  position:relative;
  z-index:2;
  margin-top:-0.16em;
  padding:0 8px;
  box-sizing:border-box;
}
`,
  render: (d, { esc, richSafe }) => {
    return `
<section class="hxuv">
  <!-- 상단 프레임 타이포 -->
  <div class="hxuv-top-word" aria-hidden="true">${esc(d.topWord)}</div>

  <!-- 이미지 + 오버레이 카피 -->
  <div class="hxuv-img-wrap">
    ${media(d.image, '', '히어로 이미지')}
    <div class="hxuv-overlay">
      ${d.headline ? `<p class="hxuv-headline">${richSafe(d.headline)}</p>` : ''}
      <h2 class="hxuv-copy">${richSafe(d.copy)}</h2>
    </div>
  </div>

  <!-- 하단 프레임 타이포 -->
  <div class="hxuv-bottom-word" aria-hidden="true">${esc(d.bottomWord)}</div>
</section>`
  },
})
