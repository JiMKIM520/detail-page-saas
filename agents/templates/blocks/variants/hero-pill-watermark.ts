/** HERO 아키타입: hero-pill-watermark
 *  원본: 045_인트로_10.json — 브라운 브랜드 배경 + 가로선 분기 브랜드명 + 좌측 정렬 대형 헤드라인 +
 *  r=400 pill형 제품사진 위 fs=200 반투명 필기체 워터마크 + 좌우 반투명 영문 레이블 오버레이 + 하단 제품설명.
 *  모바일(860px) 원본을 872px 데스크톱으로 확장 재구성.
 *  다크(brand 배경) 섹션 → .hpw .em{color:var(--em-dark,#FFF7EA)} 스코프 오버라이드 적용. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드명 (영문 권장, 가로선 사이 중앙 배치) */
  brand: z.string().min(1),
  /** 대형 헤드라인 — em/br 허용. 좌측 정렬 ExtraBold */
  title: z.string().min(1),
  /** r=400 pill 제품 이미지 URL */
  image: z.string().optional(),
  /** 이미지 위 fs=200 필기체 워터마크 텍스트 (영문 권장, 예: "handmade") */
  watermark: z.string().min(1),
  /** 이미지 좌측 반투명 영문 레이블 (예: "100% wool coat") */
  labelLeft: z.string().optional(),
  /** 이미지 우측 반투명 영문 레이블 (예: "handmade") */
  labelRight: z.string().optional(),
  /** 하단 제품 소제목 (중앙 정렬 Bold) */
  subName: z.string().optional(),
  /** 하단 제품 설명 본문 (중앙 정렬, 브리프 근거 시만) */
  desc: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const heroPillWatermark = defineBlock<Data>({
  id: 'hero-pill-watermark',
  archetype: 'hero',
  styleTags: ['dark', 'warm', 'premium', 'fashion', 'noimg-safe', 'editorial'],
  imageSlots: 1,
  describe:
    '브랜드 배경(brand토큰) 히어로. 가로선으로 양분된 브랜드명 행 + 좌측 정렬 대형 헤드라인 + r=400 pill 제품사진 위 fs=200 필기체 워터마크 + 좌우 반투명 영문 레이블 오버레이 + 하단 제품명·설명. 패션/수제/프리미엄 제품에 적합.',
  schema,
  css: `
/* ── hpw: hero-pill-watermark ── */
.hpw{
  position:relative;
  background:var(--brand);
  color:#fff;
  padding-bottom:60px;
  overflow:hidden
}
/* 다크 배경 em 강조 오버라이드 */
.hpw .em{color:var(--em-dark,#FFF7EA)}

/* 브랜드 행: 가로선 | 브랜드명 | 가로선 */
.hpw-brand-row{
  display:flex;
  align-items:center;
  gap:0;
  padding:0 0;
  height:56px
}
.hpw-brand-line{
  flex:1;
  height:1px;
  background:rgba(255,255,255,0.45)
}
.hpw-brand-name{
  padding:0 24px;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(28px, 3.5vw, 40px);
  color:#fff;
  white-space:nowrap;
  letter-spacing:.04em
}

/* 타이틀 영역: 좌측 정렬, 가로 패딩 */
.hpw-title-wrap{
  padding:28px var(--pad-x,56px) 32px
}
.hpw-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(64px, 9vw, 100px);
  color:#fff;
  line-height:1.06;
  letter-spacing:-.02em;
  text-align:left
}

/* 제품 이미지 영역 */
.hpw-img-zone{
  position:relative;
  width:calc(100% - var(--pad-x,56px) * 0.4);
  max-width:700px;
  margin:0 auto;
  /* 이미지 없을 때 pill 틀이 무너지지 않도록 최소 높이 */
  min-height:320px
}

/* r=400 pill 프레임 */
.hpw-pill{
  width:100%;
  aspect-ratio:700/1007;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*400px));
  overflow:hidden;
  background:rgba(255,255,255,0.10)
}
.hpw-pill img,.hpw-pill .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:inherit
}
/* noimg-safe: .ph는 전역 display:none!important이므로 pill 컨테이너가 빈 틴트 박스로 유지됨 */

/* fs=200 필기체 워터마크 오버레이 (이미지 중하단) */
.hpw-watermark{
  position:absolute;
  bottom:18%;
  left:50%;
  transform:translateX(-50%);
  width:100%;
  text-align:center;
  font-family:var(--font-hand);
  font-size:clamp(100px, 18vw, 200px);
  font-weight:400;
  color:rgba(255,255,255,0.35);
  white-space:nowrap;
  pointer-events:none;
  line-height:1;
  /* 오버플로우가 pill 밖으로 나가지 않도록 부모가 overflow:hidden */
  letter-spacing:-.01em
}

/* 좌우 반투명 영문 레이블 — 이미지 위 세로 중앙 */
.hpw-label-left,
.hpw-label-right{
  position:absolute;
  top:50%;
  font-family:var(--font-display);
  font-size:clamp(18px, 2.2vw, 28px);
  font-weight:500;
  color:rgba(255,255,255,0.35);
  white-space:nowrap;
  pointer-events:none;
  line-height:1
}
.hpw-label-left{
  left:0;
  transform:translateY(-50%) rotate(-90deg);
  transform-origin:left center;
  /* 회전 후 pill 왼쪽 밖에 위치 */
  margin-left:14px
}
.hpw-label-right{
  right:0;
  transform:translateY(-50%) rotate(90deg);
  transform-origin:right center;
  margin-right:14px
}

/* 구분선 (pill 아래) */
.hpw-divider{
  width:calc(100% - var(--pad-x,56px) * 2);
  height:1px;
  background:rgba(217,217,217,0.35);
  margin:0 auto 32px
}

/* 하단 텍스트 */
.hpw-bottom{
  padding:0 var(--pad-x,56px);
  text-align:center
}
.hpw-subname{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(46px, 6vw, 70px);
  color:#fff;
  line-height:1.12;
  letter-spacing:-.01em
}
.hpw-desc{
  margin-top:18px;
  font-family:var(--font-display);
  font-weight:400;
  font-size:clamp(24px, 3.2vw, 40px);
  color:rgba(255,255,255,0.88);
  line-height:1.55
}
`,
  render: (d, { esc, richSafe }) => `
<section class="hpw">
  <!-- 브랜드 행: 가로선 | 브랜드명 | 가로선 -->
  <div class="hpw-brand-row">
    <span class="hpw-brand-line"></span>
    <span class="hpw-brand-name">${esc(d.brand)}</span>
    <span class="hpw-brand-line"></span>
  </div>

  <!-- 대형 헤드라인 (좌측 정렬) -->
  <div class="hpw-title-wrap">
    <h1 class="hpw-title disp">${richSafe(d.title)}</h1>
  </div>

  <!-- r=400 pill 제품 이미지 + 워터마크 + 레이블 오버레이 -->
  <div class="hpw-img-zone">
    <div class="hpw-pill">
      ${media(d.image, '', '제품 이미지')}
    </div>
    <!-- fs=200 필기체 워터마크 -->
    <span class="hpw-watermark" aria-hidden="true">${esc(d.watermark)}</span>
    <!-- 좌우 반투명 영문 레이블 -->
    ${d.labelLeft ? `<span class="hpw-label-left" aria-hidden="true">${esc(d.labelLeft)}</span>` : ''}
    ${d.labelRight ? `<span class="hpw-label-right" aria-hidden="true">${esc(d.labelRight)}</span>` : ''}
  </div>

  <!-- 구분선 -->
  <div class="hpw-divider" role="separator"></div>

  <!-- 하단 제품명 + 설명 -->
  <div class="hpw-bottom">
    ${d.subName ? `<p class="hpw-subname">${richSafe(d.subName)}</p>` : ''}
    ${d.desc ? `<p class="hpw-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
</section>`,
})
