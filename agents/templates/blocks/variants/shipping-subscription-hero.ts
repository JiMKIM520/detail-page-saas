/** CS/SHIPPING 아키타입: shipping-subscription-hero.
 *  [끝판왕] CS 구성 #12 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 브랜드 웜 배경(accent 계열) + 대형 2줄 헤드라인 + 중앙 배송 이미지
 *  + 번호(01/02/03) 점선 연결 3단 혜택 스트립 + 풀폭 CTA 밴드.
 *  정기배송·구독 히어로 전용 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  /** 제품명 또는 서비스명 — 대형 1행 (em 허용) */
  productName: z.string().min(1),
  /** "정기배송" 같은 서비스 타입 라벨 — 대형 2행 (em 허용) */
  serviceLabel: z.string().min(1),
  /** 부제 안내 — 2줄 이내 (em/br 허용, 예: "주문 한 번으로<br>필요할 때, 원하는 요일에 배송받으세요.") */
  subtitle: z.string().min(1),
  /** 히어로 이미지 URL (배송 트럭·제품 3D 등) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 3단 혜택 (반드시 3개) */
  benefits: z
    .array(
      z.object({
        /** 혜택 아이콘 이름 */
        icon: z.enum(ICON_NAMES).optional(),
        /** 혜택 제목 (굵게, 1~2줄) */
        label: z.string().min(1),
        /** 혜택 보조 설명 (선택, 1줄) */
        desc: z.string().optional(),
      }),
    )
    .length(3),
  /** 하단 CTA 텍스트 (예: "정기배송 상세내용 확인하기") */
  ctaText: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const shippingSubscriptionHero = defineBlock<Data>({
  id: 'shipping-subscription-hero',
  archetype: 'cs',
  styleTags: ['warm', 'brand', 'centered', 'subscription', 'hero', 'template'],
  imageSlots: 1,
  describe:
    '정기배송·구독 히어로. 브랜드 웜 계열 배경 + 대형 2줄 제품명/서비스명 헤드라인 + 부제 + 중앙 배송 이미지 + 01/02/03 점선 연결 3단 혜택 스트립 + 풀폭 CTA 밴드. CS/정기구독 안내 섹션에 사용.',
  schema,
  css: `
/* shipping-subscription-hero — 접두사 ssh- */

/* ─ 전체 래퍼: 브랜드 웜 배경 ─ */
.ssh{
  background:var(--accent);
  color:var(--ink);
  text-align:center;
  overflow:hidden;
}

/* ─ 상단 텍스트 구역 ─ */
.ssh-top{
  padding:56px 40px 0;
}

/* 대형 헤드라인 — 2줄 (제품명 + 서비스명) */
.ssh-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(40px,9vw,68px);
  line-height:1.1;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:20px;
}
.ssh-headline .em{
  color:var(--ink);
}

/* 부제 */
.ssh-subtitle{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:clamp(14px,3.2vw,17px);
  line-height:1.7;
  color:rgba(255,255,255,.88);
  margin-bottom:32px;
}
.ssh-subtitle .em{
  font-weight:700;
  color:#fff;
}

/* ─ 히어로 이미지 ─ */
.ssh-img{
  width:80%;
  max-width:480px;
  aspect-ratio:1/1;
  object-fit:contain;
  display:block;
  margin:0 auto;
}
.ssh-img.ph{
  width:80%;
  max-width:480px;
  aspect-ratio:1/1;
  margin:0 auto;
  border:2px dashed rgba(255,255,255,.4);
  background:rgba(255,255,255,.12);
  color:rgba(255,255,255,.5);
  border-radius:8px;
}

/* ─ 3단 혜택 스트립 ─ */
.ssh-benefits{
  background:rgba(255,255,255,.18);
  padding:32px 24px 36px;
  margin-top:8px;
}

/* 번호 + 점선 연결 행 */
.ssh-steps{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:0;
  margin-bottom:20px;
}
.ssh-step-num{
  width:36px;
  height:36px;
  border-radius:50%;
  background:#fff;
  color:var(--accent-d);
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:800;
  font-size:13px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  letter-spacing:.02em;
}
.ssh-step-line{
  flex:1;
  height:1.5px;
  background:rgba(255,255,255,.5);
  border:none;
  max-width:72px;
}

/* 혜택 3열 그리드 */
.ssh-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:12px;
}
.ssh-cell{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
}
.ssh-icon{
  width:52px;
  height:52px;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
}
.ssh-icon svg{
  width:100%;
  height:100%;
}
.ssh-label{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:800;
  font-size:clamp(12px,2.8vw,15px);
  color:#fff;
  line-height:1.4;
}
.ssh-desc{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:11px;
  color:rgba(255,255,255,.7);
  line-height:1.4;
}

/* ─ 풀폭 CTA 밴드 ─ */
.ssh-cta{
  background:var(--ink);
  padding:22px 40px;
  text-align:center;
}
.ssh-cta-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(15px,3.4vw,19px);
  color:#fff;
  letter-spacing:-.01em;
  display:inline-flex;
  align-items:center;
  gap:8px;
}
.ssh-cta-arrow{
  font-style:normal;
  font-size:1.1em;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const defaultIcons: Array<typeof ICON_NAMES[number]> = ['gift', 'won', 'card']

    const stepsHtml = `
    <div class="ssh-steps">
      <div class="ssh-step-num">01</div>
      <hr class="ssh-step-line">
      <div class="ssh-step-num">02</div>
      <hr class="ssh-step-line">
      <div class="ssh-step-num">03</div>
    </div>`

    const gridHtml = d.benefits
      .map(
        (b, i) => `
      <div class="ssh-cell">
        <div class="ssh-icon">${icon(b.icon ?? defaultIcons[i])}</div>
        <p class="ssh-label">${esc(b.label)}</p>
        ${b.desc ? `<p class="ssh-desc">${esc(b.desc)}</p>` : ''}
      </div>`,
      )
      .join('')

    return `
<section class="ssh">
  <div class="ssh-top">
    <h2 class="ssh-headline">
      ${richSafe(d.productName)}<br>${richSafe(d.serviceLabel)}
    </h2>
    <p class="ssh-subtitle">${richSafe(d.subtitle)}</p>
  </div>
  ${media(d.image, 'ssh-img', esc(d.imageAlt ?? '정기배송 이미지'))}
  <div class="ssh-benefits">
    ${stepsHtml}
    <div class="ssh-grid">
      ${gridHtml}
    </div>
  </div>
  <div class="ssh-cta">
    <span class="ssh-cta-text">${esc(d.ctaText)}<i class="ssh-cta-arrow">→</i></span>
  </div>
</section>`
  },
})
