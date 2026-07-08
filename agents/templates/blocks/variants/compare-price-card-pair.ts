/** COMPARE 아키타입: compare-price-card-pair.
 *  [끝판왕] 추천·B&A #13 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 배지 라벨 eyebrow + 대형 헤드라인 + 2열 단가 비교 카드
 *  (패자=중립 회색/흐림, 승자=브랜드 accent 강조) + 하단 부연 캡션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** eyebrow 배지 라벨 (예: "가격 부담을 줄였어요") */
  badge: z.string().min(1),
  /** 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 패자(타사) 카드 */
  loser: z.object({
    /** 카드 상단 레이블 (예: "타사제품") */
    label: z.string().min(1),
    /** 이미지 URL */
    image: z.string().optional(),
    /** 이미지 alt */
    imageAlt: z.string().optional(),
    /** 단가 라벨 (예: "1회 사용") */
    priceLabel: z.string().min(1),
    /** 단가 수치 문자열 (예: "2,000원") */
    price: z.string().min(1),
  }),
  /** 승자(자사) 카드 */
  winner: z.object({
    /** 카드 상단 레이블 (예: "자사제품") */
    label: z.string().min(1),
    /** 이미지 URL */
    image: z.string().optional(),
    /** 이미지 alt */
    imageAlt: z.string().optional(),
    /** 단가 라벨 (예: "1회 사용") */
    priceLabel: z.string().min(1),
    /** 단가 수치 문자열 (예: "1,000원", em 허용 — 핵심 수치 강조) */
    price: z.string().min(1),
  }),
  /** 하단 부연 설명 (선택, 개행은 <br> 사용) */
  caption: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const comparePriceCardPair = defineBlock<Data>({
  id: 'compare-price-card-pair',
  archetype: 'compare',
  styleTags: ['light', 'price', 'comparison', 'usp', 'template'],
  imageSlots: 2,
  describe:
    '단가 비교(2열 카드). 배지 eyebrow + 대형 헤드라인 + 타사(회색/흐림) vs 자사(accent 강조) 가격 카드 나란히. 하단 부연 캡션 선택. 가격 경쟁력 어필.',
  schema,
  css: `
/* compare-price-card-pair — 접두사 cpcp- */

/* 라이트 배경: --paper/--bg, 본문 --ink, 보조 --muted */
.cpcp{
  background:var(--bg);
  padding:52px 32px 56px;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* eyebrow 배지 */
.cpcp-badge{
  display:inline-block;
  background:var(--accent-d);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:15px;
  letter-spacing:.04em;
  padding:7px 20px;
  border-radius:calc(var(--r-scale,1)*4px);
  margin-bottom:18px;
}

/* 헤드라인 */
.cpcp-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,6.8vw,48px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:36px;
}
/* 라이트 배경 — .em은 --accent-d로 충분한 대비 확보 */
.cpcp-title .em{color:var(--accent-d)}

/* 2열 카드 그리드 */
.cpcp-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
  margin-bottom:28px;
}

/* 공통 카드 */
.cpcp-card{
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));
  overflow:hidden;
  background:var(--paper);
}

/* 패자 카드 — 중립 회색 */
.cpcp-card.loser{
  border:2px solid #E0E0E6;
  opacity:.72;
}
.cpcp-card.loser .cpcp-card-label{
  background:#EAEAEE;
  color:#8A8A93;
}
.cpcp-card.loser .cpcp-card-price-num{
  color:#8A8A93;
}

/* 승자 카드 — accent 브랜드 강조 */
.cpcp-card.winner{
  border:2px solid var(--accent-d);
}
.cpcp-card.winner .cpcp-card-label{
  background:var(--accent-d);
  color:#fff;
}
.cpcp-card.winner .cpcp-card-price-num{
  color:var(--ink);
  font-weight:800;
}
/* 다크 배지(--accent-d 배경) 내부 .em은 밝은 --accent override */
.cpcp-card.winner .cpcp-card-price-num .em{
  color:var(--accent-d);
}

/* 카드 레이블 */
.cpcp-card-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:16px;
  letter-spacing:.02em;
  padding:12px 16px;
  text-align:center;
}

/* 카드 이미지 */
.cpcp-card-img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block;
}
.cpcp-card-img.ph{
  width:100%;
  aspect-ratio:1/1;
  border:none;
  border-radius:0;
  background:rgba(0,0,0,.05);
  color:var(--muted);
}

/* 카드 가격 영역 */
.cpcp-card-price{
  padding:14px 12px 16px;
  text-align:center;
}
.cpcp-card-price-label{
  font-family:var(--font-body);
  font-size:13px;
  color:var(--muted);
  margin-bottom:4px;
  letter-spacing:.01em;
}
.cpcp-card-price-num{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(16px,3.2vw,22px);
  letter-spacing:-.01em;
  line-height:1.3;
}

/* 하단 부연 캡션 */
.cpcp-caption{
  font-family:var(--font-body);
  font-size:15px;
  line-height:1.8;
  color:var(--muted);
  letter-spacing:-.005em;
}
.cpcp-caption .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const loserCard = `
<div class="cpcp-card loser">
  <div class="cpcp-card-label">${esc(d.loser.label)}</div>
  ${media(d.loser.image, 'cpcp-card-img', esc(d.loser.imageAlt ?? d.loser.label))}
  <div class="cpcp-card-price">
    <p class="cpcp-card-price-label">${esc(d.loser.priceLabel)}</p>
    <p class="cpcp-card-price-num">${esc(d.loser.price)}</p>
  </div>
</div>`

    const winnerCard = `
<div class="cpcp-card winner">
  <div class="cpcp-card-label">${esc(d.winner.label)}</div>
  ${media(d.winner.image, 'cpcp-card-img', esc(d.winner.imageAlt ?? d.winner.label))}
  <div class="cpcp-card-price">
    <p class="cpcp-card-price-label">${esc(d.winner.priceLabel)}</p>
    <p class="cpcp-card-price-num">${richSafe(d.winner.price)}</p>
  </div>
</div>`

    return `
<section class="cpcp">
  <span class="cpcp-badge">${esc(d.badge)}</span>
  <h2 class="cpcp-title">${richSafe(d.title)}</h2>
  <div class="cpcp-grid">
    ${loserCard}
    ${winnerCard}
  </div>
  ${d.caption ? `<p class="cpcp-caption">${richSafe(d.caption)}</p>` : ''}
</section>`
  },
})
