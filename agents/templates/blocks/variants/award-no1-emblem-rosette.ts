/** FEATURE 아키타입: award-no1-emblem-rosette.
 *  [끝판왕] 어워드(수상·권위) 구성 #12 패턴을 토큰 기반으로 재구성(픽셀 클론 아님).
 *
 *  시그니처:
 *   Zone A — 다크(딥브라운) 배경 + 스포트라이트 + 런칭 연차 골드 헤드라인 +
 *             브랜드 신뢰 서브카피 + 수상·특허 인증 텍스트 블록(2줄).
 *   Zone B — 반투명 유리 직사각 플라크(frosted glass) + 그 위 완전 원형 로제트 월계관 +
 *             대형 3D 엠보스 "1" 수자 + 좌우 인증서 이미지 슬롯 2개 +
 *             로제트 하단 리본 배너(브랜드명) + 골드 포디움(반타원 받침대).
 *   Zone C — 마무리 클로저 카피.
 *
 *  ⚠️  수상명·연도·기관·브랜드명·인증 내역은 반드시 플레이스홀더로 입력하십시오.
 *       brief에 근거 없는 실제 수상 내역·특허 번호·브랜드명 무단 기재 금지(허위 광고 위험).
 *       schema 필드 주석 및 describe 참고.
 *
 *  골드 계열(#C9A84C~#F5D77E)·딥브라운(#13100A)·리본 다크골드는 커머스 권위 신호색으로 하드코딩 허용.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

// ── 인라인 SVG 상수 ───────────────────────────────────────────────────────────

/**
 * 완전 원형 로제트 월계관 (뷰박스 200×200).
 * 줄기 원(stroke) + 좌/우 각 6쌍 타원 잎으로 구성.
 * 실제 로제트 실루엣 근사 — 픽셀 클론 아님.
 */
const ROSETTE_WREATH =
  '<svg class="aner-wreath" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  /* 줄기 링 */ '<circle cx="100" cy="100" r="72" stroke="currentColor" stroke-width="3.2" fill="none" opacity=".55"/>' +
  /* 좌측 가지 — 6쌍 잎 (0°~180° 반시계) */
  '<ellipse cx="62"  cy="40"  rx="13" ry="5.5" transform="rotate(-52 62 40)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="68"  cy="34"  rx="9"  ry="3.6" transform="rotate(-38 68 34)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="36"  cy="60"  rx="13" ry="5.5" transform="rotate(-72 36 60)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="44"  cy="52"  rx="9"  ry="3.6" transform="rotate(-56 44 52)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="22"  cy="92"  rx="13" ry="5.5" transform="rotate(-88 22 92)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="28"  cy="82"  rx="9"  ry="3.6" transform="rotate(-74 28 82)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="22"  cy="128" rx="13" ry="5.5" transform="rotate(88 22 128)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="28"  cy="118" rx="9"  ry="3.6" transform="rotate(74 28 118)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="36"  cy="158" rx="13" ry="5.5" transform="rotate(68 36 158)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="44"  cy="148" rx="9"  ry="3.6" transform="rotate(54 44 148)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="62"  cy="178" rx="13" ry="5.5" transform="rotate(48 62 178)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="70"  cy="170" rx="9"  ry="3.6" transform="rotate(36 70 170)"   fill="currentColor" opacity=".60"/>' +
  /* 우측 가지 — 6쌍 잎 (0°~180° 시계) */
  '<ellipse cx="138" cy="40"  rx="13" ry="5.5" transform="rotate(52 138 40)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="132" cy="34"  rx="9"  ry="3.6" transform="rotate(38 132 34)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="164" cy="60"  rx="13" ry="5.5" transform="rotate(72 164 60)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="156" cy="52"  rx="9"  ry="3.6" transform="rotate(56 156 52)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="178" cy="92"  rx="13" ry="5.5" transform="rotate(88 178 92)"   fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="172" cy="82"  rx="9"  ry="3.6" transform="rotate(74 172 82)"   fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="178" cy="128" rx="13" ry="5.5" transform="rotate(-88 178 128)" fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="172" cy="118" rx="9"  ry="3.6" transform="rotate(-74 172 118)" fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="164" cy="158" rx="13" ry="5.5" transform="rotate(-68 164 158)" fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="156" cy="148" rx="9"  ry="3.6" transform="rotate(-54 156 148)" fill="currentColor" opacity=".60"/>' +
  '<ellipse cx="138" cy="178" rx="13" ry="5.5" transform="rotate(-48 138 178)" fill="currentColor" opacity=".90"/>' +
  '<ellipse cx="130" cy="170" rx="9"  ry="3.6" transform="rotate(-36 130 170)" fill="currentColor" opacity=".60"/>' +
  /* 상단 중앙 집속 잎 쌍 (로제트 꼭대기 마감) */
  '<ellipse cx="100" cy="24"  rx="9"  ry="4"   transform="rotate(0 100 24)"    fill="currentColor" opacity=".80"/>' +
  '<ellipse cx="93"  cy="27"  rx="7"  ry="3"   transform="rotate(14 93 27)"    fill="currentColor" opacity=".55"/>' +
  '<ellipse cx="107" cy="27"  rx="7"  ry="3"   transform="rotate(-14 107 27)"  fill="currentColor" opacity=".55"/>' +
  /* 하단 중앙 집속 잎 쌍 (로제트 바닥 마감) */
  '<ellipse cx="100" cy="176" rx="9"  ry="4"   transform="rotate(0 100 176)"   fill="currentColor" opacity=".80"/>' +
  '<ellipse cx="93"  cy="173" rx="7"  ry="3"   transform="rotate(-14 93 173)"  fill="currentColor" opacity=".55"/>' +
  '<ellipse cx="107" cy="173" rx="7"  ry="3"   transform="rotate(14 107 173)"  fill="currentColor" opacity=".55"/>' +
  '</svg>'

/**
 * 리본 배너 SVG (뷰박스 160×36).
 * 양쪽 삼각 노치 컷 + 중앙 직사각형으로 구성.
 * 브랜드명 텍스트는 <foreignObject> 대신 CSS로 오버레이.
 */
const RIBBON_SVG =
  '<svg class="aner-ribbon-svg" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M0 0 H160 V36 H0 Z" fill="url(#aner-rib-grad)"/>' +
  /* 좌 노치 */ '<path d="M0 0 L14 18 L0 36 Z" fill="#13100A"/>' +
  /* 우 노치 */ '<path d="M160 0 L146 18 L160 36 Z" fill="#13100A"/>' +
  '<defs>' +
  '<linearGradient id="aner-rib-grad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">' +
  '<stop offset="0%" stop-color="#E8C96A"/>' +
  '<stop offset="50%" stop-color="#C9A84C"/>' +
  '<stop offset="100%" stop-color="#8A5E12"/>' +
  '</linearGradient>' +
  '</defs>' +
  '</svg>'

// ── Zod 스키마 ────────────────────────────────────────────────────────────────

const schema = z.object({
  /**
   * Zone A: 런칭 연차 헤드라인 (예: "브랜드 런칭 <span class="em">N년 차</span>").
   * em 허용. ⚠️ 실제 연차는 사업주가 직접 확인 후 입력 — 임의 기재 금지.
   */
  headline: z.string().min(1),

  /**
   * Zone A: 브랜드 신뢰 서브카피 (예: "[회사명]은 여러분의 신뢰를 얻기위해 수많은 노력을 했습니다.").
   * ⚠️ 회사명은 반드시 플레이스홀더([회사명])로 기재.
   */
  subCopy: z.string().min(1).optional(),

  /**
   * Zone A: 수상·특허 인증 텍스트 블록 1행
   * (예: "[회사명] N년 연속 베스트셀러 브랜드 선정").
   * ⚠️ 수상 내역·연도는 반드시 플레이스홀더 — 실제 수상 근거 없이 기재 금지.
   */
  credLine1: z.string().min(1).optional(),

  /**
   * Zone A: 수상·특허 인증 텍스트 블록 2행
   * (예: "국 내외 다수 특허 인증 획득").
   * ⚠️ 특허·인증 내역은 반드시 플레이스홀더 — 실제 인증 근거 없이 기재 금지.
   */
  credLine2: z.string().min(1).optional(),

  /**
   * Zone B: 플라크 중앙 대형 수자 텍스트 (기본 "1").
   * "1", "No.1", "1st" 등 가능.
   */
  plaqueCenterText: z.string().min(1),

  /**
   * Zone B: 플라크 좌측 인증서 이미지 URL.
   * ⚠️ 인증서 내용은 실제 보유 인증서만 — 임의 생성 이미지 삽입 금지.
   */
  certImageLeft: z.string().optional(),

  /**
   * Zone B: 플라크 우측 인증서 이미지 URL.
   * ⚠️ 상동.
   */
  certImageRight: z.string().optional(),

  /**
   * Zone B: 리본 배너 브랜드명 (예: "[회사명]").
   * ⚠️ 실제 브랜드명은 사업주가 직접 입력.
   */
  ribbonBrandName: z.string().min(1),

  /**
   * Zone C: 마무리 클로저 카피 (예: "수 년 간 연구하고 직접 체험하며 탄생한<br>저희의 제품을 믿고 구매해보세요.").
   * br, em 허용.
   */
  closerCopy: z.string().min(1).optional(),
})

type Data = z.infer<typeof schema>

// ── defineBlock ───────────────────────────────────────────────────────────────

export const awardNo1EmblemRosette = defineBlock<Data>({
  id: 'award-no1-emblem-rosette',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'authority', 'rosette', 'plaque', 'certificate', 'podium', 'premium', 'template'],
  imageSlots: 2,
  describe:
    '어워드 권위(No.1 로제트 플라크+포디움). 딥브라운 배경 스포트라이트 + 골드 런칭 연차 헤드라인 + 브랜드 서브카피 + 수상·특허 인증 2줄 텍스트 블록(Zone A) + 반투명 유리 직사각 플라크(frosted glass) 위 완전 원형 로제트 월계관 + 대형 3D 골드 "1" 수자 + 좌우 인증서 이미지 슬롯 2개 + 하단 골드 리본 배너(브랜드명) + 반타원 골드 포디움 받침대(Zone B) + 마무리 클로저(Zone C). award_12 Figma 프레임 패턴. ⚠️ 수상명·연도·기관·브랜드명·인증 내역은 반드시 플레이스홀더 — 허위 수상·인증 기재 절대 금지.',
  schema,
  css: `
/* award-no1-emblem-rosette — 접두사 aner- */
/* 골드(#C9A84C~#F5D77E)·딥브라운(#13100A)은 커머스 권위 신호색으로 하드코딩 허용 */

.aner{
  background:#13100A;
  color:#fff;
  padding:52px 32px 0;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
  overflow:hidden;
  position:relative;
}

/* ── 배경 스포트라이트 버스트 ── */
.aner::before{
  content:'';
  position:absolute;
  left:50%;top:0;
  transform:translateX(-50%);
  width:600px;height:700px;
  background:radial-gradient(ellipse at 50% 20%,rgba(201,168,76,.15) 0%,rgba(201,168,76,.06) 38%,transparent 68%);
  pointer-events:none;
  z-index:0;
}

/* ── Zone A: 텍스트 블록 ── */
.aner-zone-a{
  position:relative;
  z-index:1;
  margin-bottom:36px;
}

/* 런칭 연차 헤드라인 */
.aner-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,6.5vw,42px);
  line-height:1.18;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:12px;
}
.aner-headline .em{color:#E8C96A}

/* 브랜드 신뢰 서브카피 */
.aner-sub{
  font-family:var(--font-body);
  font-size:clamp(13px,3vw,15px);
  line-height:1.65;
  color:rgba(255,255,255,.62);
  margin-bottom:16px;
}
.aner-sub .em{color:#E8C96A;font-weight:700}

/* 수상·특허 인증 텍스트 블록 */
.aner-cred-block{
  display:inline-block;
  text-align:center;
}
.aner-cred-line{
  display:block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,3.2vw,17px);
  line-height:1.55;
  letter-spacing:-.01em;
  color:rgba(255,255,255,.92);
}
.aner-cred-line .em{color:#E8C96A}

/* ── Zone B: 플라크 영역 ── */
.aner-zone-b{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  align-items:center;
}

/* 반투명 유리 플라크 */
.aner-plaque{
  position:relative;
  width:min(340px,88vw);
  background:linear-gradient(160deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.05) 60%,rgba(120,100,60,.10) 100%);
  border:1px solid rgba(232,201,106,.30);
  border-radius:calc(var(--r-scale,1)*6px);
  box-shadow:
    0 8px 32px rgba(0,0,0,.55),
    0 0 0 1px rgba(201,168,76,.12) inset,
    0 24px 60px rgba(0,0,0,.4);
  backdrop-filter:blur(4px);
  -webkit-backdrop-filter:blur(4px);
  padding:28px 20px 16px;
  display:flex;
  flex-direction:column;
  align-items:center;
}

/* 플라크 내부 인증서+로제트 행 */
.aner-plaque-inner{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  width:100%;
}

/* 인증서 이미지 슬롯 */
.aner-cert{
  width:90px;
  aspect-ratio:3/4;
  object-fit:cover;
  border-radius:calc(var(--r-scale,1)*3px);
  flex-shrink:0;
  display:block;
  filter:brightness(.88) sepia(.1);
}
.aner-cert.ph{
  width:90px;
  aspect-ratio:3/4;
  border:2px dashed rgba(201,168,76,.35);
  background:rgba(201,168,76,.06);
  color:rgba(201,168,76,.48);
  font-size:10px;
  border-radius:calc(var(--r-scale,1)*3px);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  text-align:center;
  padding:4px;
  line-height:1.4;
}

/* 로제트+숫자 중앙 스택 */
.aner-rosette-stack{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}

/* 완전 원형 로제트 월계관 SVG */
.aner-wreath{
  width:160px;
  height:160px;
  color:#C9A84C;
  display:block;
  filter:drop-shadow(0 0 8px rgba(201,168,76,.35));
}

/* 대형 3D 엠보스 "1" 수자 */
.aner-num{
  position:absolute;
  left:50%;top:50%;
  transform:translate(-50%,-50%);
  font-family:'Cormorant Garamond','Georgia',serif;
  font-weight:700;
  font-size:clamp(72px,16vw,108px);
  line-height:1;
  letter-spacing:-.04em;
  /* 3D 골드 그라데이션 + 엠보스 텍스트쉐도우 */
  background:linear-gradient(180deg,#F5D77E 0%,#E8C96A 30%,#C9A84C 62%,#8A5E12 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  text-shadow:none;
  filter:drop-shadow(0 4px 10px rgba(0,0,0,.65)) drop-shadow(0 1px 0 rgba(255,220,100,.4));
  pointer-events:none;
  user-select:none;
}

/* 리본 배너 래퍼 */
.aner-ribbon-wrap{
  position:relative;
  width:160px;
  height:36px;
  margin-top:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.aner-ribbon-svg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
}
.aner-ribbon-text{
  position:relative;
  z-index:2;
  font-family:var(--font-display);
  font-weight:800;
  font-size:12px;
  letter-spacing:.06em;
  color:#13100A;
  text-align:center;
  line-height:1;
  padding:0 20px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  max-width:130px;
}

/* ── 포디움(반타원 받침대) ── */
.aner-podium-wrap{
  width:min(340px,88vw);
  display:flex;
  flex-direction:column;
  align-items:center;
  margin-top:-2px;
}
/* 계단 3단 */
.aner-pod-t1{
  width:min(280px,72vw);
  height:24px;
  background:linear-gradient(180deg,#F5D77E 0%,#C9A84C 40%,#9A6C1A 100%);
  border-radius:calc(var(--r-scale,1)*4px) calc(var(--r-scale,1)*4px) 0 0;
  box-shadow:0 -3px 10px rgba(201,168,76,.40),0 6px 18px rgba(0,0,0,.55);
}
.aner-pod-t2{
  width:min(310px,80vw);
  height:18px;
  background:linear-gradient(180deg,#C9A84C 0%,#7A5210 100%);
}
.aner-pod-t3{
  width:min(340px,88vw);
  height:14px;
  background:linear-gradient(180deg,#A8881A 0%,#5A3A08 100%);
  border-radius:0 0 calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*8px);
  /* 반타원 바닥 연출 */
  clip-path:ellipse(50% 100% at 50% 0%);
}

/* ── Zone C: 마무리 클로저 ── */
.aner-zone-c{
  position:relative;
  z-index:1;
  padding:40px 28px 52px;
}
.aner-closer{
  font-family:var(--font-body);
  font-size:clamp(14px,3.2vw,16px);
  line-height:1.75;
  color:rgba(255,255,255,.72);
  text-align:center;
}
.aner-closer .em{
  color:#E8C96A;
  font-weight:700;
}
`,

  render: (d, { esc, richSafe }) => {
    /* Zone A */
    const subCopyHtml = d.subCopy
      ? `<p class="aner-sub">${richSafe(d.subCopy)}</p>`
      : ''

    const credHtml = (d.credLine1 || d.credLine2)
      ? `<div class="aner-cred-block" role="note">
          ${d.credLine1 ? `<span class="aner-cred-line">${richSafe(d.credLine1)}</span>` : ''}
          ${d.credLine2 ? `<span class="aner-cred-line">${richSafe(d.credLine2)}</span>` : ''}
        </div>`
      : ''

    /* Zone B — 인증서 슬롯 */
    const certLeft = d.certImageLeft
      ? `<img class="aner-cert" src="${attr(d.certImageLeft)}" alt="인증서 (좌)">`
      : `<div class="aner-cert ph" role="img" aria-label="인증서를 넣어주세요">인증서를<br>넣어주세요</div>`

    const certRight = d.certImageRight
      ? `<img class="aner-cert" src="${attr(d.certImageRight)}" alt="인증서 (우)">`
      : `<div class="aner-cert ph" role="img" aria-label="인증서를 넣어주세요">인증서를<br>넣어주세요</div>`

    /* Zone C */
    const closerHtml = d.closerCopy
      ? `<div class="aner-zone-c"><p class="aner-closer">${richSafe(d.closerCopy)}</p></div>`
      : ''

    return `
<section class="aner">
  <!-- Zone A: 헤드라인 + 인증 텍스트 -->
  <div class="aner-zone-a">
    <h2 class="aner-headline">${richSafe(d.headline)}</h2>
    ${subCopyHtml}
    ${credHtml}
  </div>

  <!-- Zone B: 플라크 + 로제트 + 포디움 -->
  <div class="aner-zone-b">
    <div class="aner-plaque">
      <div class="aner-plaque-inner">
        ${certLeft}
        <div class="aner-rosette-stack">
          ${ROSETTE_WREATH}
          <span class="aner-num" aria-label="${attr(d.plaqueCenterText)}">${esc(d.plaqueCenterText)}</span>
        </div>
        ${certRight}
      </div>
      <div class="aner-ribbon-wrap" aria-label="${attr(d.ribbonBrandName)}">
        ${RIBBON_SVG}
        <span class="aner-ribbon-text">${esc(d.ribbonBrandName)}</span>
      </div>
    </div>
    <div class="aner-podium-wrap" aria-hidden="true">
      <div class="aner-pod-t1"></div>
      <div class="aner-pod-t2"></div>
      <div class="aner-pod-t3"></div>
    </div>
  </div>

  <!-- Zone C: 마무리 클로저 -->
  ${closerHtml}
</section>`
  },
})
