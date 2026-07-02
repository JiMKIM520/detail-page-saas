/** CS 아키타입: cs-authorized-retailer-badge.
 *  [끝판왕] CS 구성 #23 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--ink) 배경 + 좌측 공식판매처 뱃지(원형, 금색 테두리) + 우측 대형 헤드라인
 *  + 비공식 구매 시 불이익 경고 박스(둥근 코너 다크 패널) + 하단 저작권 법적 고지.
 *  공식 리테일러 인증 마크 패턴. CS/신뢰 보증 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 뱃지 내 브랜드명 (예: "브랜드명") */
  badgeBrand: z.string().min(1),
  /** 뱃지 하단 라벨 (예: "공식판매처") */
  badgeLabel: z.string().min(1),
  /** 별 개수 (1~5, 기본 3) */
  badgeStars: z.number().int().min(1).max(5).default(3),
  /** 섹션 메인 헤드라인 (em, br 허용 — 브랜드명 강조 등) */
  headline: z.string().min(1),
  /** 정품 보증 강조 문구 (볼드, em 허용) */
  certBody: z.string().min(1),
  /** 정품 보증 보조 설명 (선택, em 허용) */
  certSub: z.string().optional(),
  /** 비공식 구매 경고 박스 텍스트 (첫 줄, 선택 em 허용) */
  warningLead: z.string().min(1),
  /** 비공식 구매 경고 박스 본문 (강조 볼드, em 허용) */
  warningBody: z.string().min(1),
  /** 비공식 구매 경고 박스 보조 문구 (선택) */
  warningSub: z.string().optional(),
  /** 하단 저작권/지식재산권 고지 (선택) */
  legalNotice: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const csAuthorizedRetailerBadge = defineBlock<Data>({
  id: 'cs-authorized-retailer-badge',
  archetype: 'cs',
  styleTags: ['dark', 'trust', 'badge', 'legal', 'cs', 'template'],
  imageSlots: 0,
  describe:
    '공식 판매처 인증 배지 섹션. 다크 배경 + 원형 금색 테두리 공식판매처 배지(좌) + 대형 헤드라인(우) + 비공식 구매 불이익 경고 박스 + 저작권 법적 고지. 신뢰/CS 보증 섹션.',
  schema,
  css: `
/* cs-authorized-retailer-badge — 접두사 carb- */

/* 다크 배경 블록: --ink 배경, 본문 #fff, 보조 rgba(255,255,255,.6) */
.carb{
  background:var(--ink);
  color:#fff;
  padding:52px 36px 40px;
}

/* 상단 영역: 배지(좌) + 헤드라인(우) */
.carb-top{
  display:flex;
  align-items:center;
  gap:32px;
  margin-bottom:40px;
}

/* 원형 배지 */
.carb-badge{
  flex-shrink:0;
  width:148px;
  height:148px;
  border-radius:50%;
  background:linear-gradient(145deg,#2a2418 0%,#1a1710 100%);
  border:3px solid #c9a84c;
  box-shadow:0 0 0 6px rgba(201,168,76,.18),inset 0 0 0 8px rgba(201,168,76,.12);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:6px;
  position:relative;
  padding:0 12px;
}

/* 배지 내부 반원 장식 테두리 */
.carb-badge::before{
  content:'';
  position:absolute;
  inset:7px;
  border-radius:50%;
  border:1.5px solid rgba(201,168,76,.35);
  pointer-events:none;
}

/* 배지 하단 리본 */
.carb-badge-ribbon{
  position:absolute;
  bottom:-18px;
  left:50%;
  transform:translateX(-50%);
  width:0;
  border-left:20px solid transparent;
  border-right:20px solid transparent;
  border-top:20px solid #c9a84c;
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));
}
.carb-badge-ribbon::after{
  content:'';
  position:absolute;
  top:-20px;
  left:-16px;
  width:0;
  border-left:16px solid transparent;
  border-right:16px solid transparent;
  border-top:16px solid #2a2418;
}

.carb-badge-brand{
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  letter-spacing:.04em;
  color:#c9a84c;
  text-align:center;
  line-height:1.3;
}

.carb-badge-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:11px;
  letter-spacing:.06em;
  color:#e8d090;
  text-align:center;
  line-height:1.2;
}

.carb-badge-stars{
  display:flex;
  gap:3px;
  align-items:center;
}
.carb-badge-stars svg{
  width:12px;
  height:12px;
  color:#c9a84c;
}

/* 우측 텍스트 영역 */
.carb-right{
  flex:1;
  min-width:0;
}

.carb-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(22px,5.2vw,36px);
  line-height:1.22;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:14px;
}
/* 다크 배경 — .em은 밝은 --accent로 override */
.carb-headline .em{color:var(--accent)}

.carb-cert-body{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(14px,2.8vw,18px);
  line-height:1.55;
  letter-spacing:-.01em;
  color:#fff;
  margin-bottom:8px;
}
.carb-cert-body .em{color:var(--accent)}

.carb-cert-sub{
  font-family:var(--font-body);
  font-size:12px;
  line-height:1.7;
  color:rgba(255,255,255,.55);
  letter-spacing:-.005em;
}

/* 경고 박스 */
.carb-warning{
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.12);
  border-radius:10px;
  padding:22px 24px;
  margin-bottom:20px;
  text-align:center;
}

.carb-warning-lead{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.7;
  color:rgba(255,255,255,.65);
  margin-bottom:8px;
  letter-spacing:-.005em;
}

.carb-warning-body{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(13px,2.6vw,16px);
  line-height:1.65;
  letter-spacing:-.01em;
  color:#fff;
  margin-bottom:8px;
}
.carb-warning-body .em{color:var(--accent)}

.carb-warning-sub{
  font-family:var(--font-body);
  font-size:12px;
  line-height:1.7;
  color:rgba(255,255,255,.5);
  letter-spacing:-.005em;
}

/* 법적 고지 */
.carb-legal{
  font-family:var(--font-body);
  font-size:10.5px;
  line-height:1.8;
  color:rgba(255,255,255,.35);
  letter-spacing:-.005em;
  text-align:center;
}
`,
  render: (d, { esc, richSafe }) => {
    // 별 SVG (star 아이콘 인라인 — shared ICONS.star와 동일 패턴)
    const starSvg =
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>'
    const stars = Array.from({ length: Math.max(1, Math.min(5, d.badgeStars)) }, () => starSvg).join('')

    return `
<section class="carb">
  <div class="carb-top">
    <div class="carb-badge">
      <span class="carb-badge-brand">${esc(d.badgeBrand)}</span>
      <span class="carb-badge-label">${esc(d.badgeLabel)}</span>
      <div class="carb-badge-stars">${stars}</div>
      <div class="carb-badge-ribbon"></div>
    </div>
    <div class="carb-right">
      <h2 class="carb-headline">${richSafe(d.headline)}</h2>
      <p class="carb-cert-body">${richSafe(d.certBody)}</p>
      ${d.certSub ? `<p class="carb-cert-sub">${esc(d.certSub)}</p>` : ''}
    </div>
  </div>
  <div class="carb-warning">
    <p class="carb-warning-lead">${richSafe(d.warningLead)}</p>
    <p class="carb-warning-body">${richSafe(d.warningBody)}</p>
    ${d.warningSub ? `<p class="carb-warning-sub">${esc(d.warningSub)}</p>` : ''}
  </div>
  ${d.legalNotice ? `<p class="carb-legal">${esc(d.legalNotice)}</p>` : ''}
</section>`
  },
})
