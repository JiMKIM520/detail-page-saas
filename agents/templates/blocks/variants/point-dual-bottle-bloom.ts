/** POINT 아키타입: point-dual-bottle-bloom
 *  피그마 "포인트 구성 페이지_33" 흡수 재구성.
 *  다크 배경 이미지 위, 두 제품 병 모크업을 서로 마주보게 역방향으로 기울여 플로팅 배치하고
 *  핑크 파티클(꽃잎·도트) CSS 애니메이션을 주변에 산포한 뷰티 라이프스타일 포인트 구성 블록.
 *  이미지가 없을 때 다크 그라데이션 배경으로 강등 (noimg-safe).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),           // (em,br) 포인트 헤드라인
  subtitle: z.string().optional(),    // 소형 영문/한글 서브 레이블
  desc: z.string().optional(),        // 본문 한 줄 설명 (em 허용)
  badge: z.string().optional(),       // 브랜드 뱃지 이미지 url (원형 95px)
  bottleLeft: z.string().optional(),  // 좌측 제품 병 이미지 url (누끼/contain)
  bottleRight: z.string().optional(), // 우측 제품 병 이미지 url (누끼/contain)
  bg: z.string().optional(),          // 배경 이미지 url (없으면 다크 그라데이션 강등)
  particleColor: z.string().optional(), // 파티클 색상 hex (기본 #eabcc4)
})
type Data = z.infer<typeof schema>

export const pointDualBottleBloom = defineBlock<Data>({
  id: 'point-dual-bottle-bloom',
  archetype: 'point',
  styleTags: ['dark', 'beauty', 'lifestyle', 'noimg-safe', 'playful'],
  imageSlots: 4,
  describe:
    '뷰티 포인트 구성. 다크 배경 사진 위 두 제품 병 모크업을 역방향(좌측 -12°/우측 +12°)으로 기울여 마주보게 플로팅 배치하고 핑크 파티클 CSS 산포. 제품 대비 강조 + 라이프스타일 무드.',
  schema,
  css: `
/* ── point-dual-bottle-bloom ── CSS 접두: pwkw ── */
.pwkw{
  position:relative;
  width:100%;
  min-height:560px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-end;
  padding:48px var(--pad-x,56px) 56px;
  overflow:hidden;
  background:var(--brand,#1a0d1e);
  color:#fff;
  text-align:center;
}

/* 배경 이미지 레이어 */
.pwkw-bg{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;
  object-position:center;
  z-index:0;
}
/* 배경 없을 때: 다크 그라데이션 강등 */
.pwkw-bg.ph{
  display:block!important;
  background:radial-gradient(ellipse 120% 100% at 50% 80%,
    color-mix(in srgb,var(--accent,#e8b4c3) 18%,transparent) 0%,
    #140a1a 55%,
    #0c0610 100%);
}

/* 스크림 — 하단 텍스트 가독성 */
.pwkw::after{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(
    to bottom,
    transparent 0%,
    transparent 30%,
    rgba(10,4,16,.55) 62%,
    rgba(10,4,16,.82) 100%
  );
  z-index:1;
  pointer-events:none;
}

/* ── 병 모크업 스테이지 ── */
.pwkw-stage{
  position:absolute;
  inset:0;
  z-index:2;
  pointer-events:none;
}

/* 공통 병 래퍼 */
.pwkw-bottle{
  position:absolute;
  bottom:18%;
  width:28%;
  max-width:200px;
  display:flex;
  align-items:flex-end;
  justify-content:center;
}
.pwkw-bottle--l{
  left:8%;
  transform:rotate(-12deg) translateY(8px);
  transform-origin:bottom center;
}
.pwkw-bottle--r{
  right:8%;
  transform:rotate(12deg) translateY(8px);
  transform-origin:bottom center;
}

/* 병 이미지: contain — 누끼 전용, 비율 유지 */
.pwkw-bottle img{
  width:100%;
  height:auto;
  max-height:340px;
  object-fit:contain;
  display:block;
}
/* 병 이미지 없을 때 강등 placeholder: 반투명 라운드 실루엣 */
.pwkw-bottle .ph{
  display:block!important;
  width:100%;
  height:280px;
  border-radius:calc(var(--r-scale,1)*40px) calc(var(--r-scale,1)*40px) calc(var(--r-scale,1)*24px) calc(var(--r-scale,1)*24px);
  background:color-mix(in srgb,var(--accent,#e8b4c3) 22%,rgba(255,255,255,.08));
  border:1.5px dashed color-mix(in srgb,var(--accent,#e8b4c3) 40%,transparent);
}

/* ── 파티클 산포 ── */
.pwkw-particles{
  position:absolute;
  inset:0;
  z-index:3;
  pointer-events:none;
  overflow:hidden;
}
/* 파티클 공통 */
.pwkw-p{
  position:absolute;
  border-radius:50%;
  opacity:.7;
  animation:pwkw-drift 6s ease-in-out infinite;
}
@keyframes pwkw-drift{
  0%,100%{transform:translate(0,0) scale(1)}
  33%{transform:translate(4px,-6px) scale(1.1)}
  66%{transform:translate(-3px,4px) scale(.9)}
}
/* 꽃잎 변형 — 타원 기울기 */
.pwkw-p.petal{
  border-radius:50% 50% 50% 0 / 50% 50% 0 50%;
  opacity:.55;
  animation-duration:7.5s;
}
/* 각 파티클 위치·크기·지연 */
.pwkw-p:nth-child(1){width:8px;height:8px;left:29%;top:52%;animation-delay:0s}
.pwkw-p:nth-child(2){width:5px;height:5px;left:36%;top:60%;animation-delay:.7s}
.pwkw-p:nth-child(3){width:9px;height:7px;left:42%;top:48%;animation-delay:1.1s;transform:rotate(30deg)}
.pwkw-p:nth-child(4){width:6px;height:6px;left:55%;top:58%;animation-delay:1.8s}
.pwkw-p:nth-child(5){width:10px;height:8px;left:61%;top:50%;animation-delay:.4s;transform:rotate(-20deg)}
.pwkw-p:nth-child(6){width:5px;height:5px;left:68%;top:65%;animation-delay:2.2s}
.pwkw-p:nth-child(7){width:7px;height:5px;left:48%;top:42%;animation-delay:.9s}
.pwkw-p:nth-child(8){width:6px;height:9px;left:24%;top:68%;animation-delay:3.0s}
.pwkw-p:nth-child(9){width:4px;height:4px;left:72%;top:44%;animation-delay:1.5s}
.pwkw-p:nth-child(10){width:8px;height:6px;left:33%;top:76%;animation-delay:2.5s;transform:rotate(45deg)}
.pwkw-p:nth-child(11){width:5px;height:7px;left:64%;top:74%;animation-delay:3.6s}
.pwkw-p:nth-child(12){width:6px;height:4px;left:52%;top:67%;animation-delay:1.3s}

/* ── 콘텐츠 레이어 ── */
.pwkw-body{
  position:relative;
  z-index:4;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
  max-width:540px;
  width:100%;
}

/* 배지 */
.pwkw-badge-wrap{
  width:64px;height:64px;
  border-radius:50%;
  overflow:hidden;
  border:2.5px solid color-mix(in srgb,var(--accent,#e8b4c3) 60%,transparent);
  box-shadow:0 0 0 4px color-mix(in srgb,var(--accent,#e8b4c3) 18%,transparent);
  flex-shrink:0;
}
.pwkw-badge-wrap img{
  width:100%;height:100%;
  object-fit:cover;
}
.pwkw-badge-wrap .ph{
  display:block!important;
  width:100%;height:100%;
  background:color-mix(in srgb,var(--accent,#e8b4c3) 20%,rgba(255,255,255,.06));
}

/* 서브 레이블 */
.pwkw-sub{
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-size:13px;
  font-weight:500;
  letter-spacing:.22em;
  text-transform:uppercase;
  color:color-mix(in srgb,var(--accent,#e8b4c3) 90%,transparent);
  margin-top:4px;
}

/* 헤드라인 */
.pwkw-title{
  font-family:var(--font-display,'Pretendard',sans-serif);
  font-size:clamp(28px,5vw,42px);
  font-weight:800;
  line-height:1.18;
  letter-spacing:-.02em;
  color:#fff;
  word-break:keep-all;
}
/* 다크 영역 richSafe em 오버라이드 */
.pwkw .em{color:var(--em-dark,#FFF7EA)}

/* 설명 */
.pwkw-desc{
  font-size:15px;
  font-weight:500;
  line-height:1.72;
  color:rgba(255,255,255,.72);
  max-width:400px;
}
.pwkw-desc .em{color:var(--em-dark,#FFF7EA);font-weight:700}

/* ── 사진 프레임 시그니처 (포인트 대형 모크업 스테이지) ── */
.pwkw-bottle img,.pwkw-bottle .ph{
  --shape-photo: var(--shape-photo, calc(var(--r-scale,1)*40px) calc(var(--r-scale,1)*40px) calc(var(--r-scale,1)*20px) calc(var(--r-scale,1)*20px));
}
`,
  render: (d, { esc, richSafe }) => {
    const pc = d.particleColor ?? '#eabcc4'
    // 파티클 색상 CSS 커스텀 인라인 — var로 토큰화
    const particleStyle = `background:${pc.replace(/[^#a-zA-Z0-9(),. %]/g, '')}`
    const petalStyle = `background:${pc.replace(/[^#a-zA-Z0-9(),. %]/g, '')};`

    // 파티클 12개: 홀수=도트, 짝수=꽃잎
    const particles = Array.from({ length: 12 }, (_, i) =>
      i % 2 === 0
        ? `<span class="pwkw-p" style="${particleStyle}"></span>`
        : `<span class="pwkw-p petal" style="${petalStyle}"></span>`,
    ).join('\n      ')

    return `
<section class="pwkw">
  ${d.bg
    ? `<img class="pwkw-bg" src="${d.bg.replace(/"/g, '&quot;')}" alt="" aria-hidden="true">`
    : `<div class="pwkw-bg ph" aria-hidden="true"></div>`}

  <!-- 병 모크업 스테이지 -->
  <div class="pwkw-stage">
    <div class="pwkw-bottle pwkw-bottle--l">
      ${media(d.bottleLeft, 'pwkw-btl-img', '제품 좌측')}
    </div>
    <div class="pwkw-bottle pwkw-bottle--r">
      ${media(d.bottleRight, 'pwkw-btl-img', '제품 우측')}
    </div>
  </div>

  <!-- 파티클 산포 -->
  <div class="pwkw-particles" aria-hidden="true">
    ${particles}
  </div>

  <!-- 텍스트 콘텐츠 -->
  <div class="pwkw-body">
    ${d.badge ? `
    <div class="pwkw-badge-wrap">
      ${media(d.badge, 'pwkw-badge-img', '브랜드 뱃지')}
    </div>` : ''}
    ${d.subtitle ? `<p class="pwkw-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="pwkw-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="pwkw-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
</section>`
  },
})
