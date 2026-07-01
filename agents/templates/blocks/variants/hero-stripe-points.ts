/** HERO 아키타입(템플릿 충실 재현): hero-stripe-points.
 *  와디즈 200섹션 01_인트로 _1270:293 패턴 재구성.
 *  좌정렬 제품명+설명 → 풀폭 이미지(체커보드 배경) →
 *  체커보드 스트라이프 구분 띠 → 번호(01/02/03) + 설명 텍스트 블록 3개.
 *  다른 히어로 변형과의 차별화:
 *    hero-icon-rows — 아이콘 원형 + 헤어라인 행 구분
 *    hero-stripe-points — 체커보드 스트라이프 띠 + 대형 번호 포인트 블록 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  brand: z.string().min(1).optional(),          // 좌상단 브랜드/라벨 (선택)
  title: z.string().min(1),                     // 대형 제품명 (em, br 허용)
  subtitle: z.string().min(1).optional(),       // 소제목 / 한줄 설명 (br 허용)
  heroImage: z.string().optional(),             // 풀폭 제품 이미지 (url)
  points: z
    .array(
      z.object({
        label: z.string().min(1).optional(),    // 번호 대신 커스텀 라벨 (선택)
        desc: z.string().min(1),                // 포인트 설명 2줄 (em, br 허용)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroStripePoints = defineBlock<Data>({
  id: 'hero-stripe-points',
  archetype: 'hero',
  styleTags: ['modern', 'commerce', 'template', 'numbered', 'stripe'],
  imageSlots: 1,
  describe:
    '체커보드 스트라이프 구분 띠 + 번호 텍스트 블록 히어로. 좌정렬 제품명+설명 → 풀폭 제품 이미지(체커보드 배경) → accent 체커보드 스트라이프 띠 → 대형 번호(01/02/03)+설명 텍스트 블록 2~4개. 경쾌하고 명확한 포인트 전달형.',
  schema,
  css: `
/* ── hsp = hero-stripe-points 접두사 ── */
.hsp{background:var(--bg);overflow:hidden}

/* ─ 헤더 존 ─ */
.hsp-hd{padding:44px 44px 32px;background:var(--bg)}
.hsp-brand{
  display:inline-block;
  font-size:12px;font-weight:800;
  letter-spacing:.22em;text-transform:uppercase;
  color:#fff;
  background:var(--accent);
  padding:5px 14px;
  margin-bottom:14px
}
.hsp-title{
  font-family:var(--font-display);
  font-weight:800;font-size:54px;
  letter-spacing:-.025em;line-height:1.08;
  color:var(--ink)
}
.hsp-title .em{color:var(--accent)}
.hsp-sub{
  margin-top:10px;
  font-family:var(--font-body);
  font-size:17px;font-weight:400;
  color:var(--ink-2);line-height:1.6
}

/* ─ 이미지 존: 체커보드 배경 + 풀폭 이미지 ─ */
.hsp-img-wrap{
  position:relative;
  width:100%;
  /* 체커보드 배경: 연한 격자 패턴 */
  background-color:color-mix(in srgb,var(--line) 60%,var(--bg));
  background-image:
    linear-gradient(45deg,color-mix(in srgb,var(--line) 80%,transparent) 25%,transparent 25%,transparent 75%,color-mix(in srgb,var(--line) 80%,transparent) 75%),
    linear-gradient(45deg,color-mix(in srgb,var(--line) 80%,transparent) 25%,transparent 25%,transparent 75%,color-mix(in srgb,var(--line) 80%,transparent) 75%);
  background-size:24px 24px;
  background-position:0 0,12px 12px
}
.hsp-img{width:100%;height:460px;object-fit:contain;display:block;position:relative;z-index:1}
.hsp-brand-wm{
  position:absolute;
  bottom:24px;left:50%;
  transform:translateX(-50%);
  font-family:var(--font-display);
  font-weight:800;font-size:48px;
  letter-spacing:.12em;
  color:color-mix(in srgb,var(--ink) 12%,transparent);
  white-space:nowrap;
  z-index:0;
  pointer-events:none;
  user-select:none
}

/* ─ 체커보드 스트라이프 띠 ─ */
.hsp-stripe{
  width:100%;height:28px;
  flex-shrink:0;
  /* accent 색과 투명 교차 체커 패턴 */
  background-color:var(--bg);
  background-image:
    linear-gradient(45deg,var(--accent) 25%,transparent 25%,transparent 75%,var(--accent) 75%),
    linear-gradient(45deg,var(--accent) 25%,transparent 25%,transparent 75%,var(--accent) 75%);
  background-size:28px 28px;
  background-position:0 0,14px 14px
}

/* ─ 포인트 블록 존 ─ */
.hsp-points{
  background:var(--bg);
  padding:48px 44px 52px
}
.hsp-pt{
  text-align:center;
  padding:28px 0
}
.hsp-pt + .hsp-pt{
  border-top:1px solid var(--line)
}
.hsp-no{
  font-family:'Cafe24 ClassicType',serif;
  font-size:52px;
  font-weight:400;
  line-height:1;
  color:var(--accent);
  margin-bottom:14px
}
.hsp-pt-lbl{
  font-family:var(--font-display);
  font-weight:800;font-size:20px;
  color:var(--ink);
  letter-spacing:-.01em;
  margin-bottom:4px
}
.hsp-pt-desc{
  font-family:var(--font-body);
  font-size:15px;line-height:1.75;
  color:var(--ink-2)
}
.hsp-pt-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="hsp">

  <!-- 헤더 존: 좌정렬 브랜드 레이블 + 대형 제목 + 소제목 -->
  <div class="hsp-hd">
    ${d.brand ? `<span class="hsp-brand">${esc(d.brand)}</span>` : ''}
    <h1 class="hsp-title">${richSafe(d.title)}</h1>
    ${d.subtitle ? `<p class="hsp-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>

  <!-- 풀폭 제품 이미지 (체커보드 배경 위) -->
  <div class="hsp-img-wrap">
    ${media(d.heroImage, 'hsp-img', esc(d.title))}
    <span class="hsp-brand-wm">${d.brand ? esc(d.brand) : 'BRAND LOGO'}</span>
  </div>

  <!-- 체커보드 스트라이프 구분 띠 -->
  <div class="hsp-stripe" role="presentation" aria-hidden="true"></div>

  <!-- 번호 텍스트 포인트 블록 -->
  <div class="hsp-points">
    ${d.points
      .map(
        (p, i) => `
    <div class="hsp-pt">
      <div class="hsp-no">${esc(p.label ?? pad2(i + 1))}</div>
      <div class="hsp-pt-desc">${richSafe(p.desc)}</div>
    </div>`,
      )
      .join('')}
  </div>

</section>`,
})
