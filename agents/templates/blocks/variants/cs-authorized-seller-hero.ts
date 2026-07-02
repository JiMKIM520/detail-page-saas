/** CS 아키타입: cs-authorized-seller-hero.
 *  [끝판왕] CS 구성 #22 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 투존 — 상단 라이트 배경(로고·브랜드명 + 대형 "공식 판매처" 헤드라인 + 우측 배지 이미지)
 *  / 하단 라운드 화이트 카드(shield 경고 아이콘 + 구매 경로 주의 문구 + 법적 면책 본문).
 *  공식 판매처 인증 히어로 용도. 밝은 배경판. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드/회사명 (eyebrow 위 작은 라벨, 예: "[회사명]") */
  brandLabel: z.string().min(1),
  /** 공식 판매처 헤드라인 (em/br 허용, 예: "[회사명] 공식 판매처") */
  title: z.string().min(1),
  /** 헤드라인 하단 인증 캡션 (1줄, 선택, 예: "본 인증뱃지는 공식 판매처에게만 부여됩니다.") */
  certCaption: z.string().optional(),
  /** 우측 배지/상품 이미지 URL (공식판매처 스탬프 씰 또는 제품 묶음) */
  badgeImage: z.string().optional(),
  /** 배지 이미지 alt */
  badgeImageAlt: z.string().optional(),
  /** 경고 카드 주요 문구 (em 허용 — CS 대응 핵심 강조 어절에 사용) */
  warningText: z.string().min(1),
  /** 경고 카드 하단 법적 면책 본문 (선택, em 허용) */
  disclaimerText: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const csAuthorizedSellerHero = defineBlock<Data>({
  id: 'cs-authorized-seller-hero',
  archetype: 'cs',
  styleTags: ['light', 'warm', 'cs', 'authorized', 'hero', 'trust', 'template'],
  imageSlots: 1,
  describe:
    'CS 공식 판매처 인증 히어로. 투존: 상단 라이트 배경(로고 라벨 + 대형 "공식 판매처" 헤드라인 + 우측 배지/스탬프 이미지), 하단 라운드 화이트 카드(shield 경고 아이콘 + 비공식 구매 경고 문구 + 면책 본문). 신뢰/정품 인증 섹션.',
  schema,
  css: `
/* cs-authorized-seller-hero — 접두사 cash- */

/* ── 전체 래퍼 ── */
.cash{
  background:var(--bg);
  overflow:hidden;
  padding-bottom:40px;
}

/* ── 상단 히어로 존 ── */
.cash-hero{
  position:relative;
  padding:44px 36px 48px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  min-height:220px;
}

/* 좌측 텍스트 영역 */
.cash-left{
  flex:1;
  min-width:0;
}

/* 브랜드 라벨 (상단 eyebrow) */
.cash-brand-label{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:400;
  color:var(--muted);
  letter-spacing:.04em;
  margin-bottom:10px;
  display:block;
}

/* 대형 헤드라인 */
.cash-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,6vw,44px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:14px;
}
/* 라이트 배경 — .em은 --accent-d로 충분한 대비 확보 */
.cash-title .em{color:var(--accent-d)}

/* 인증 캡션 */
.cash-cert-caption{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.7;
  color:var(--muted);
  letter-spacing:-.005em;
}

/* 우측 배지 이미지 */
.cash-badge{
  width:180px;
  height:180px;
  object-fit:contain;
  flex-shrink:0;
}
.cash-badge.ph{
  width:180px;
  height:180px;
  flex-shrink:0;
  border:2px dashed var(--line);
  background:rgba(0,0,0,.03);
  color:var(--muted);
  border-radius:50%;
  font-size:12px;
}

/* ── 하단 경고 카드 존 ── */
.cash-card-wrap{
  padding:0 24px;
}
.cash-card{
  background:#fff;
  border-radius:16px;
  padding:28px 28px 28px 24px;
  display:flex;
  align-items:flex-start;
  gap:22px;
}

/* Shield 아이콘 영역 */
.cash-icon-wrap{
  flex-shrink:0;
  width:52px;
  height:52px;
  border-radius:50%;
  background:rgba(0,0,0,.06);
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--ink);
  margin-top:2px;
}
.cash-icon-wrap svg{
  width:28px;
  height:28px;
}

/* 경고 텍스트 영역 */
.cash-card-body{flex:1;min-width:0}

.cash-warning{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(14px,3vw,17px);
  line-height:1.6;
  color:var(--ink);
  margin-bottom:12px;
  letter-spacing:-.01em;
}
/* 라이트 배경 카드 위 — .em은 --accent-d + underline으로 강조 */
.cash-warning .em{
  color:var(--accent-d);
  text-decoration:underline;
  text-underline-offset:3px;
  text-decoration-thickness:1.5px;
}

.cash-disclaimer{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.8;
  color:var(--muted);
  letter-spacing:-.005em;
}
.cash-disclaimer .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const shieldIcon = icon('shield')

    return `
<section class="cash">
  <div class="cash-hero">
    <div class="cash-left">
      <span class="cash-brand-label">${esc(d.brandLabel)}</span>
      <h2 class="cash-title">${richSafe(d.title)}</h2>
      ${d.certCaption ? `<p class="cash-cert-caption">${esc(d.certCaption)}</p>` : ''}
    </div>
    ${media(d.badgeImage, 'cash-badge', esc(d.badgeImageAlt ?? '공식판매처 인증 배지'))}
  </div>
  <div class="cash-card-wrap">
    <div class="cash-card">
      <div class="cash-icon-wrap">${shieldIcon}</div>
      <div class="cash-card-body">
        <p class="cash-warning">${richSafe(d.warningText)}</p>
        ${d.disclaimerText ? `<p class="cash-disclaimer">${richSafe(d.disclaimerText)}</p>` : ''}
      </div>
    </div>
  </div>
</section>`
  },
})
