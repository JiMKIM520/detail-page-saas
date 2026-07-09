/** INGREDIENT 아키타입: ingredient-ph-scale
 *  210_성분소개_09 패턴 흡수.
 *  중앙 타이틀 + pH 그라데이션 원형 스케일(산성~알칼리성 스펙트럼 + 약산성 위치 pill) + 전폭 제품 사진.
 *  라이트(sage) 배경. 이미지 없을 때 사진 영역을 숨겨 붕괴하지 않는 noimg-safe 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),              // (em,br) 예: "두피가 편한\n저자극 약산성 세정"
  subtitle: z.string().optional(),       // 부제 순수 텍스트
  phValue: z.string().optional(),        // 기본 "5.5" — 원 안 수치
  phLabel: z.string().optional(),        // 기본 "약산성" — pill 레이블
  acidLabel: z.string().optional(),      // 기본 "산성" — 스케일 좌측 레이블
  alkLabel: z.string().optional(),       // 기본 "알칼리성" — 스케일 우측 레이블
  desc: z.string().optional(),           // (em,br) 스케일 아래 보조 설명 (브리프 근거 시만)
  image: z.string().optional(),          // (url) 전폭 제품 사진
})
type Data = z.infer<typeof schema>

export const ingredientPhScale = defineBlock<Data>({
  id: 'ingredient-ph-scale',
  archetype: 'ingredient',
  styleTags: ['light', 'beauty', 'skincare', 'science', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '성분 소개 — pH 그라데이션 원형 스케일 장치. 중앙 정렬 타이틀 + 산성~알칼리성 스펙트럼을 원형 그라데이션으로 시각화 + 약산성 위치 pill 뱃지 + 전폭 제품 사진. 저자극/약산성 성분 어필에 최적.',
  schema,
  css: `
.iyxv{
  background:var(--bg);
  color:var(--ink);
  padding:60px 0 0;
  text-align:center;
  overflow:hidden;
}
/* ── 타이틀 영역 ── */
.iyxv-hd{padding:0 var(--pad-x,56px) 0}
.iyxv-title{
  font-family:var(--font-display);
  font-weight:400;
  font-size:56px;
  line-height:1.22;
  color:var(--ink);
  letter-spacing:-.02em;
  white-space:pre-wrap;
}
.iyxv-title .em{color:var(--accent-d)}
.iyxv-sub{
  margin-top:16px;
  font-family:var(--font-body);
  font-size:17px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.7;
}
/* ── pH 스케일 원형 그래프 영역 ── */
.iyxv-scale-wrap{
  margin:40px auto 0;
  width:340px;
  height:340px;
  position:relative;
}
/* 원형 그라데이션 링 (산성=오렌지 → 중립=연두 → 알칼리=보라) */
.iyxv-ring{
  width:100%;
  height:100%;
  border-radius:50%;
  /* 그라데이션: 산성(오렌지) 0° → 약산성(그린) 110° → 중립(연두) 180° → 알칼리(보라) 360° */
  background:conic-gradient(
    from -90deg,
    #e78157 0%,
    #d4ab5e 22%,
    #9ab85c 44%,
    #5fa854 58%,
    #6cbca3 72%,
    #7da8d4 84%,
    #bc8ec2 100%
  );
  position:relative;
}
/* 중앙 흰 원(도넛 구조) */
.iyxv-inner{
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  width:62%;
  height:62%;
  border-radius:50%;
  background:var(--bg);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
}
.iyxv-ph-num{
  font-family:var(--font-display);
  font-size:32px;
  font-weight:400;
  color:var(--ink);
  line-height:1;
}
/* 약산성 pill — 원 안 하단 */
.iyxv-pill{
  display:inline-block;
  padding:5px 16px;
  border-radius:999px;
  background:#2d8714;
  color:#fff;
  font-size:13px;
  font-weight:700;
  letter-spacing:.03em;
  margin-top:4px;
}
/* 산성/알칼리성 양극 레이블 — 원 외부 절대 배치 */
.iyxv-acid-lbl{
  position:absolute;
  left:2px;
  top:50%;
  transform:translateY(-50%);
  font-size:13px;
  font-weight:600;
  color:#e78157;
  letter-spacing:.02em;
}
.iyxv-alk-lbl{
  position:absolute;
  right:2px;
  top:50%;
  transform:translateY(-50%);
  font-size:13px;
  font-weight:600;
  color:#bc8ec2;
  letter-spacing:.02em;
}
/* 약산성 위치 마커 SVG — scale-wrap(340×340) 위에 절대 오버레이
   pH 5.5 위치: conic-gradient from -90deg, 44% 지점
   각도 θ = -90 + 360×0.44 = 68.4° (수학 좌표계 기준 90-68.4=21.6°)
   링 외경 r_out=170, 내원 r_in=105, 중간 r_mid=138, 중심(170,170)
   dot 좌표: (170+138×sin68.4°, 170−138×cos68.4°) ≈ (298, 119)
   arrow: dot→내원 방향 24px 선분 끝점 ≈ (276, 127)
   SVG는 scale-wrap과 동일한 340×340, pointer-events:none */
.iyxv-marker{
  position:absolute;
  top:0;
  left:0;
  width:340px;
  height:340px;
  pointer-events:none;
  overflow:hidden;
}
/* ── 보조 설명 ── */
.iyxv-desc{
  margin:28px auto 0;
  max-width:560px;
  padding:0 var(--pad-x,56px);
  font-size:15px;
  line-height:1.75;
  color:var(--ink-2);
}
.iyxv-desc .em{color:var(--accent-d);font-weight:700}
/* ── 전폭 제품 사진 ── */
.iyxv-photo-wrap{
  margin-top:40px;
  width:100%;
  aspect-ratio:860/700;
  overflow:hidden;
  /* noimg-safe: 이미지 없으면 이 wrap 자체를 숨김 */
}
.iyxv-photo-wrap.noimg{display:none}
.iyxv-photo{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:var(--shape-photo, 0px);
  display:block;
}
/* noimg-safe: ph 클래스를 가진 div는 baseCss에서 이미 display:none 처리됨 — wrap도 숨김 */
.iyxv-photo-wrap:has(.ph){display:none}
`,
  render: (d, { esc, richSafe }) => {
    const phNum = esc(d.phValue ?? '5.5')
    const pill  = esc(d.phLabel  ?? '약산성')
    const acid  = esc(d.acidLabel ?? '산성')
    const alk   = esc(d.alkLabel  ?? '알칼리성')

    // 이미지 유무 판별 — noimg-safe: 이미지가 없으면 wrap에 .noimg 클래스 추가
    const isUrl = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const wrapCls = isUrl ? 'iyxv-photo-wrap' : 'iyxv-photo-wrap noimg'

    return `
<section class="iyxv">
  <div class="iyxv-hd">
    <h2 class="disp iyxv-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="iyxv-sub">${esc(d.subtitle)}</p>` : ''}
  </div>

  <div class="iyxv-scale-wrap">
    <!-- 그라데이션 링 -->
    <div class="iyxv-ring">
      <!-- 중앙 내원 — ph 수치 + 약산성 pill -->
      <div class="iyxv-inner">
        <span class="iyxv-ph-num">pH${phNum}</span>
        <span class="iyxv-pill">${pill}</span>
      </div>
    </div>
    <!-- pH 위치 마커 SVG — scale-wrap 기준 오버레이 -->
    <svg class="iyxv-marker" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- dot: 링 위 pH5.5 위치 (cx≈298, cy≈119) -->
      <circle cx="298" cy="119" r="5" fill="var(--ink)"/>
      <!-- arrow: dot에서 내원 방향으로 24px 선분 (끝점≈276,127) -->
      <line x1="295" y1="121" x2="274" y2="129" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <!-- 양극 레이블 (원 외부) -->
    <span class="iyxv-acid-lbl">${acid}</span>
    <span class="iyxv-alk-lbl">${alk}</span>
  </div>

  ${d.desc ? `<p class="iyxv-desc">${richSafe(d.desc)}</p>` : ''}

  <div class="${wrapCls}">
    ${media(d.image, 'iyxv-photo', '제품 사진')}
  </div>
</section>`
  },
})
