/** POINT 아키타입: point-circle-badge-panel.
 *  원형 제품 사진 + 좌하 오렌지 원형 수치 뱃지 오버랩 + 우측 반투명 흰 패널에
 *  네이비 라운드 태그 + 대형 헤드라인 + 본문 조합. 라이트 배경 수평 배너.
 *  034_pc_전환15 (당도 뱃지 × 반투명 패널) 구조 흡수. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 원형 제품 이미지 URL */
  image: z.string().optional(),
  /** 뱃지 상단 수치 (예: "11.5") */
  badgeValue: z.string().min(1),
  /** 뱃지 하단 단위/라벨 (예: "Brix") */
  badgeUnit: z.string().min(1),
  /** 반투명 패널 내 라운드 태그 텍스트 (예: "비타민 폭발!") */
  tag: z.string().min(1),
  /** 대형 헤드라인 — (em, br) 허용 */
  title: z.string().min(1),
  /** 부제·설명 한 줄 */
  desc: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointCircleBadgePanel = defineBlock<Data>({
  id: 'point-circle-badge-panel',
  archetype: 'point',
  // noimg-safe: 이미지 없으면 원형 프레임을 accent 틴트 배경으로 강등
  styleTags: ['light', 'food', 'warm', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '포인트 배너 — 좌측 원형 제품 이미지에 오렌지 원형 수치 뱃지(Brix·당도 등)를 좌하 오버랩하고, 우측 90% 반투명 흰 패널에 네이비 라운드 태그 + 대형 헤드라인 + 한 줄 본문을 배치. 식품 당도·영양 수치 강조에 최적. 브리프 근거 시만 badgeValue/badgeUnit 사용.',
  schema,
  css: `
.ptfu{
  position:relative;
  display:flex;
  align-items:center;
  padding:0 var(--pad-x,56px);
  background:var(--bg);
  min-height:400px;
  overflow:hidden;
  gap:0;
}

/* ── 좌측 원형 이미지 영역 ── */
.ptfu-circle-wrap{
  position:relative;
  flex:0 0 auto;
  width:380px;
  height:380px;
  margin-right:32px;
}
/* 원형 마스크 전용 래퍼 — 뱃지가 overflow 밖으로 나올 수 있도록 wrap은 visible 유지 */
.ptfu-img-mask{
  width:380px;
  height:380px;
  border-radius:50%;
  overflow:hidden;
  position:relative;
}
.ptfu-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg));
}
/* 이미지 부재 강등 — ph 은닉 대신 원형 틴트 박스로 표현 */
.ptfu-img.ph{
  display:block!important;
  background:color-mix(in srgb,var(--accent) 15%,var(--bg));
  border:2px dashed color-mix(in srgb,var(--accent) 35%,transparent);
}
/* border-radius는 .ptfu-img-mask 에서 처리 — img 자체는 100%×100% fill */

/* ── 오렌지 수치 뱃지 (좌하 오버랩) ── */
.ptfu-badge{
  position:absolute;
  left:-10px;
  bottom:10px;
  width:calc(var(--r-scale,1)*0px + 195px); /* 고정 원형 — 크기 기반 비율 유지 */
  height:calc(var(--r-scale,1)*0px + 195px);
  border-radius:50%;
  background:var(--accent);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:0;
  box-shadow:0 4px 20px -4px color-mix(in srgb,var(--accent) 60%,transparent);
}
.ptfu-badge::after{
  content:'';
  position:absolute;
  inset:10px;
  border-radius:50%;
  border:1.5px solid rgba(255,255,255,.40);
  pointer-events:none;
}
.ptfu-badge-val{
  font-family:var(--font-display);
  font-weight:800;
  font-size:42px;
  color:var(--bg);
  line-height:1;
  letter-spacing:-.02em;
}
.ptfu-badge-unit{
  font-family:var(--font-display);
  font-weight:700;
  font-size:20px;
  color:var(--bg);
  opacity:.90;
  line-height:1.2;
  letter-spacing:.04em;
}

/* ── 우측 반투명 패널 ── */
.ptfu-panel{
  flex:1;
  background:color-mix(in srgb,var(--bg) 90%,transparent);
  backdrop-filter:blur(2px);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:44px 52px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:20px;
  min-width:0;
}

/* 라운드 태그 */
.ptfu-tag{
  display:inline-block;
  background:var(--brand);
  color:var(--accent);
  font-family:var(--font-display);
  font-weight:600;
  font-size:22px;
  padding:10px 28px;
  border-radius:999px;
  letter-spacing:.01em;
  line-height:1.3;
}

/* 헤드라인 */
.ptfu-title{
  font-family:var(--font-serif);
  font-weight:400;
  font-size:clamp(44px,5vw,72px);
  color:var(--ink);
  text-align:center;
  line-height:1.12;
  letter-spacing:-.01em;
}
.ptfu-title .em{
  color:var(--accent-d);
}

/* 본문 */
.ptfu-desc{
  font-family:var(--font-body);
  font-size:18px;
  font-weight:500;
  color:var(--ink-2);
  text-align:center;
  line-height:1.6;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="ptfu">
  <div class="ptfu-circle-wrap">
    <div class="ptfu-img-mask">${media(d.image, 'ptfu-img', '제품 사진')}</div>
    <div class="ptfu-badge" aria-label="${esc(d.badgeValue)} ${esc(d.badgeUnit)}">
      <span class="ptfu-badge-val">${esc(d.badgeValue)}</span>
      <span class="ptfu-badge-unit">${esc(d.badgeUnit)}</span>
    </div>
  </div>
  <div class="ptfu-panel">
    <span class="ptfu-tag">${esc(d.tag)}</span>
    <h2 class="ptfu-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="ptfu-desc">${esc(d.desc)}</p>` : ''}
  </div>
</section>`,
})
