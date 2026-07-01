/** HERO 아키타입(템플릿 충실 재현): hero-photo-dual-stack.
 *  피그마 1284:1803 — 11_인트로_사진중심 / 두 사진 세로 스택 + 고스트 넘버.
 *  3존 구조:
 *    ① 상단 텍스트 존 — 브랜드 로고(accent 소형) + 제품명 대형 + 한줄 설명.
 *    ② 풀블리드 사진 1 — 상단 히어로 이미지(전체 폭).
 *    ③ 사진 2 + 고스트 넘버 존 — 두 번째 풀블리드 사진 위 초대형 반투명 숫자 오버레이
 *       + 하단 좌정렬 제품 역할 헤드라인 + 스토리텔링 설명.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandLogo: z.string().min(1).optional(),       // 브랜드 로고 텍스트 (소형, accent 색)
  productName: z.string().min(1),                // 제품명 대형 헤드라인 (em,br 허용)
  tagline: z.string().min(1).optional(),         // 한줄 제품 설명 (plain)
  image1: z.string().optional(),                 // 상단 풀블리드 사진 (url)
  ghostNumber: z.string().min(1).max(1).optional(), // 고스트 오버레이 숫자 — 단일 글자만 (예: "1")
  image2: z.string().optional(),                 // 하단 풀블리드 사진 (url)
  roleHeadline: z.string().min(1),               // 제품 역할 헤드라인 (em,br 허용)
  story: z.string().min(1).optional(),           // 스토리텔링 설명 (em,br 허용)
})
type Data = z.infer<typeof schema>

export const heroPhotoDualStack = defineBlock<Data>({
  id: 'hero-photo-dual-stack',
  archetype: 'hero',
  styleTags: ['premium', 'photo', 'editorial', 'template', 'light', 'storytelling'],
  imageSlots: 2,
  describe:
    '두 사진 세로 스택 + 고스트 넘버 인트로. ' +
    '상단 브랜드 로고+제품명+설명 → 풀블리드 사진1 → 사진2 위 초대형 반투명 숫자 오버레이 → 좌정렬 역할 헤드라인+스토리. ' +
    '사진 중심 에디토리얼 히어로, 내러티브 스토리텔링에 적합.',
  schema,
  css: `
/* ── hpds = hero-photo-dual-stack 접두사 ── */

/* ─ 존 1: 상단 텍스트 존 ─ */
.hpds{background:var(--bg);overflow:hidden}
.hpds-intro{
  padding:48px 44px 40px;
  background:var(--paper);
  text-align:center
}
.hpds-brand{
  font-family:var(--font-display);
  font-weight:700;
  font-size:16px;
  letter-spacing:.12em;
  color:var(--accent);
  margin-bottom:14px
}
.hpds-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:56px;
  letter-spacing:-.03em;
  line-height:1.08;
  color:var(--ink)
}
.hpds-name .em{color:var(--accent)}
.hpds-tagline{
  margin-top:16px;
  font-size:17px;
  color:var(--ink-2);
  line-height:1.55;
  letter-spacing:.005em
}

/* ─ 풀블리드 사진 1 ─ */
.hpds-photo1{
  width:100%;
  height:520px;
  object-fit:cover;
  display:block
}

/* ─ 존 2: 사진2 + 고스트 넘버 + 텍스트 ─ */
.hpds-bottom{
  background:var(--paper);
  overflow:hidden
}

/* 사진2 래퍼 — 고스트 넘버 위치 기준 */
.hpds-fig2{
  position:relative;
  width:100%;
  overflow:hidden
}
.hpds-photo2{
  width:100%;
  height:480px;
  object-fit:cover;
  display:block
}

/* 고스트 넘버 오버레이 */
.hpds-ghost{
  position:absolute;
  left:-12px;
  bottom:-16px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:280px;
  line-height:1;
  color:color-mix(in srgb,var(--accent) 28%,transparent);
  pointer-events:none;
  user-select:none;
  letter-spacing:-.04em
}

/* ─ 하단 텍스트 (역할 헤드라인 + 스토리) ─ */
.hpds-copy{
  padding:36px 44px 50px;
  background:var(--paper)
}
.hpds-role{
  font-family:var(--font-display);
  font-weight:800;
  font-size:34px;
  letter-spacing:-.02em;
  line-height:1.28;
  color:var(--ink)
}
.hpds-role .em{color:var(--accent)}
.hpds-story{
  margin-top:18px;
  font-size:15px;
  color:var(--ink-2);
  line-height:1.78
}
.hpds-story .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="hpds">

  <!-- 존 1: 브랜드 로고 + 제품명 + 설명 -->
  <div class="hpds-intro">
    ${d.brandLogo ? `<p class="hpds-brand">${esc(d.brandLogo)}</p>` : ''}
    <h1 class="hpds-name">${richSafe(d.productName)}</h1>
    ${d.tagline ? `<p class="hpds-tagline">${esc(d.tagline)}</p>` : ''}
  </div>

  <!-- 풀블리드 사진 1 -->
  ${media(d.image1, 'hpds-photo1', esc(d.productName))}

  <!-- 존 2: 사진2 + 고스트 넘버 + 하단 카피 -->
  <div class="hpds-bottom">
    <div class="hpds-fig2">
      ${media(d.image2, 'hpds-photo2', esc(d.roleHeadline))}
      ${d.ghostNumber ? `<span class="hpds-ghost" aria-hidden="true">${esc(d.ghostNumber)}</span>` : ''}
    </div>
    <div class="hpds-copy">
      <h2 class="hpds-role">${richSafe(d.roleHeadline)}</h2>
      ${d.story ? `<p class="hpds-story">${richSafe(d.story)}</p>` : ''}
    </div>
  </div>

</section>`,
})
