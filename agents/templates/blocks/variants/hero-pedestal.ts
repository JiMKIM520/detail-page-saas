/** HERO 아키타입(템플릿 충실 재현): hero-pedestal.
 *  피그마 184:641 — 01_인트로 / 3D 받침대 이미지 + 컬러 밴드 제목.
 *  3존 구조:
 *    ① 상단 라이트 존 — 장식 아치 배경 + 3D 원통 받침대 위 제품 이미지 (누끼 권장).
 *    ② 컬러 밴드 — 부제목(소) + 제품명 대형 타이틀 (흰 텍스트 on accent 그라데이션).
 *    ③ 포인트 리스트 — Point 01/02/03 라벨 + 설명 텍스트 (구분선 포함, accent 계열 배경).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  productImage: z.string().optional(),         // 받침대 위 제품 이미지 (url, 누끼 권장)
  subtitle: z.string().min(1).optional(),      // 컬러 밴드 부제목 (소형, em 허용)
  productName: z.string().min(1),              // 컬러 밴드 제품명 대형 (em,br 허용)
  points: z
    .array(
      z.object({
        label: z.string().min(1).optional(),   // 예) "Point 01" — 기본값 자동 생성
        desc: z.string().min(1),               // 포인트 설명 (em,br 허용)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroPedestal = defineBlock<Data>({
  id: 'hero-pedestal',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'colorblock', 'light', '3d', 'centered'],
  imageSlots: 1,
  describe:
    '3D 원통 받침대 위 제품 이미지 + 컬러 밴드 제품명 + Point 번호형 설명 리스트. ' +
    '라이트 상단(아치 장식)+accent 그라데이션 밴드+포인트 존 3단 구성. 강한 컬러블록 인트로.',
  schema,
  css: `
/* ── hped = hero-pedestal 접두사 ── */

/* ─ 존 1: 라이트 상단 (받침대 비주얼) ─ */
.hped{background:var(--bg);overflow:hidden}
.hped-stage{
  position:relative;
  background:var(--paper);
  padding:56px 0 0;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  align-items:center
}

/* 장식 아치 (순수 CSS, 원호 겹침) */
.hped-arcs{
  position:absolute;
  inset:0;
  pointer-events:none;
  overflow:hidden
}
.hped-arcs::before,
.hped-arcs::after{
  content:"";
  position:absolute;
  border-radius:50%;
  border:1.5px solid color-mix(in srgb,var(--accent) 22%,transparent)
}
.hped-arcs::before{
  width:480px;height:480px;
  top:-120px;left:-60px
}
.hped-arcs::after{
  width:360px;height:360px;
  top:-60px;left:-10px
}

/* 받침대 — 순수 CSS 원통 (아래 반타원) */
.hped-pedestal-wrap{
  position:relative;
  z-index:1;
  width:260px;
  display:flex;
  flex-direction:column;
  align-items:center
}

/* 제품 이미지 영역 */
.hped-product{
  width:220px;
  height:240px;
  object-fit:contain;
  display:block;
  position:relative;
  z-index:2
}

/* 받침대 본체 */
.hped-base{
  width:260px;
  height:64px;
  background:linear-gradient(180deg,#fff 0%,color-mix(in srgb,var(--accent) 8%,#e8e8e8) 100%);
  border-radius:50% 50% 44% 44% / 28px 28px 22px 22px;
  box-shadow:0 6px 28px rgba(0,0,0,.10),inset 0 -4px 12px rgba(0,0,0,.06);
  position:relative;
  z-index:1;
  margin-top:-10px
}
/* 받침대 상단 타원 하이라이트 */
.hped-base::before{
  content:"";
  position:absolute;
  top:-10px;left:50%;
  transform:translateX(-50%);
  width:220px;height:20px;
  background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.3));
  border-radius:50%;
  box-shadow:0 2px 12px rgba(0,0,0,.08)
}

/* ─ 존 2: 컬러 밴드 (제품명) ─ */
.hped-band{
  background:linear-gradient(180deg,var(--accent) 0%,var(--accent-d) 100%);
  color:#fff;
  text-align:center;
  padding:42px 48px 46px
}
.hped-sub{
  font-size:15px;
  font-weight:500;
  color:rgba(255,255,255,.82);
  margin-bottom:10px;
  letter-spacing:.01em
}
.hped-sub .em{color:#fff;font-weight:700}
.hped-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:52px;
  letter-spacing:-.025em;
  line-height:1.1;
  color:#fff
}
.hped-name .em{color:color-mix(in srgb,#fff 70%,var(--accent-d))}

/* ─ 존 3: 포인트 리스트 ─ */
.hped-points{
  background:color-mix(in srgb,var(--accent) 88%,var(--brand));
  padding:8px 0 16px
}
.hped-pt{
  padding:28px 56px
}
.hped-pt+.hped-pt{
  border-top:1px solid rgba(255,255,255,.18)
}
.hped-ptlabel{
  font-family:var(--font-display);
  font-weight:800;
  font-size:16px;
  letter-spacing:.06em;
  color:#fff;
  margin-bottom:8px
}
.hped-ptdesc{
  font-size:14px;
  font-weight:400;
  line-height:1.72;
  color:rgba(255,255,255,.82)
}
.hped-ptdesc .em{color:#fff;font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="hped">

  <!-- 존 1: 라이트 받침대 비주얼 -->
  <div class="hped-stage">
    <div class="hped-arcs"></div>
    <div class="hped-pedestal-wrap">
      ${media(d.productImage, 'hped-product', esc(d.productName))}
      <div class="hped-base"></div>
    </div>
  </div>

  <!-- 존 2: 컬러 밴드 — 부제목 + 제품명 -->
  <div class="hped-band">
    ${d.subtitle ? `<p class="hped-sub">${richSafe(d.subtitle)}</p>` : ''}
    <h1 class="hped-name">${richSafe(d.productName)}</h1>
  </div>

  <!-- 존 3: 포인트 리스트 -->
  <div class="hped-points">
    ${d.points
      .map(
        (pt, i) => `
    <div class="hped-pt">
      <div class="hped-ptlabel">${esc(pt.label ?? `Point ${String(i + 1).padStart(2, '0')}`)}</div>
      <div class="hped-ptdesc">${richSafe(pt.desc)}</div>
    </div>`,
      )
      .join('')}
  </div>

</section>`,
})
