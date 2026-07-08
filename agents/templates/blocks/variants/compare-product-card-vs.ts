/** COMPARE 아키타입: compare-product-card-vs.
 *  피그마 "[끝판왕] 추천·B&A" #22 패턴을 토큰 기반으로 재구성(픽셀 클론 아님).
 *  시그니처: 라이트 배경 + eyebrow/헤드라인 + 경쟁사(무채색 카드) vs 자사(accent-골드 카드) 2열
 *  각 카드: 제품 이미지 + 핵심 스펙 수치 라벨 + 유저 보이스 인용.
 *  승자 카드는 var(--accent)/브랜드 강조, 패자 카드는 중립 회색. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** eyebrow — 작은 상단 강조 문구 (em 허용) */
  eyebrow: z.string().min(1).optional(),
  /** 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 헤드라인 하단 보조 설명 (em 허용, 선택) */
  subtitle: z.string().optional(),
  /** 경쟁사(패자) 카드 */
  rival: z.object({
    /** 카드 라벨 — 예: "일반 디바이스" */
    label: z.string().min(1),
    /** 제품 이미지 URL */
    image: z.string().optional(),
    /** 이미지 alt */
    imageAlt: z.string().optional(),
    /** 핵심 스펙 수치 — 예: "10~15분" */
    statValue: z.string().min(1),
    /** 스펙 라벨 — 예: "평균 타이머" */
    statLabel: z.string().min(1),
    /** 보조 설명 / 단점 (em 허용) */
    body: z.string().optional(),
  }),
  /** 자사(승자) 카드 */
  own: z.object({
    /** 카드 라벨 — 예: "[회사명] 디바이스" */
    label: z.string().min(1),
    /** 제품 이미지 URL */
    image: z.string().optional(),
    /** 이미지 alt */
    imageAlt: z.string().optional(),
    /** 핵심 스펙 수치 — 예: "180분" */
    statValue: z.string().min(1),
    /** 스펙 라벨 — 예: "타이머 없음" */
    statLabel: z.string().min(1),
    /** 유저 보이스 인용 (em 허용) */
    quote: z.string().optional(),
    /** 인용 출처 — 예: "구매자 후기" */
    quoteSource: z.string().optional(),
  }),
  /** 섹션 하단 마무리 강조 문구 (em 허용, 선택) */
  closer: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const compareProductCardVs = defineBlock<Data>({
  id: 'compare-product-card-vs',
  archetype: 'compare',
  styleTags: ['light', 'comparison', 'stats', 'review', 'template'],
  imageSlots: 2,
  describe:
    '경쟁사 vs 자사 2열 제품 카드 비교. 라이트 배경 + eyebrow + 대형 헤드라인 + 좌(경쟁사·무채색) / 우(자사·accent골드) 카드. 각 카드: 제품이미지 + 핵심스펙수치 + 유저보이스 인용. 승자에 accent 강조, 패자는 중립 회색.',
  schema,
  css: `
/* compare-product-card-vs — 접두사 cpcv- */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted, eyebrow --accent-d */
.cpcv{
  background:var(--bg);
  padding:52px 28px 60px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* eyebrow */
.cpcv-eyebrow{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:700;
  letter-spacing:.08em;
  color:var(--accent-d);
  text-align:center;
  margin-bottom:14px;
  text-transform:uppercase;
}
.cpcv-eyebrow .em{color:var(--accent-d)}

/* 대형 헤드라인 */
.cpcv-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,6.2vw,44px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:var(--ink);
  text-align:center;
  margin-bottom:10px;
}
/* 라이트 배경 — .em은 --accent-d(어두운 포인트)로 충분한 대비 확보 */
.cpcv-title .em{color:var(--accent-d)}

/* 서브타이틀 */
.cpcv-sub{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.7;
  color:var(--muted);
  text-align:center;
  margin-bottom:36px;
  padding:0 8px;
}
.cpcv-sub .em{color:var(--accent-d);font-weight:700}

/* 2열 카드 컨테이너 */
.cpcv-cols{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
  align-items:stretch;
}

/* 공통 카드 베이스 */
.cpcv-card{
  border-radius:calc(var(--r-scale,1)*16px);
  overflow:hidden;
  background:var(--paper);
  display:flex;
  flex-direction:column;
  box-shadow:0 12px 28px -16px rgba(0,0,0,.22);
}

/* 카드 라벨 헤더 */
.cpcv-card-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:15px;
  letter-spacing:.04em;
  text-align:center;
  padding:14px 12px 12px;
}

/* 패자(경쟁사) 카드 — 무채색 */
.cpcv-card--rival .cpcv-card-label{
  background:#EAEAEE;
  color:#8A8A93;
}

/* 승자(자사) 카드 — accent 골드 강조 */
.cpcv-card--own .cpcv-card-label{
  background:var(--accent);
  color:#fff;
}

/* 제품 이미지 */
.cpcv-img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:contain;
  display:block;
  background:var(--paper);
  padding:8px;
}
.cpcv-img.ph{
  width:100%;
  aspect-ratio:1/1;
  border:none;
  background:rgba(0,0,0,.04);
  color:var(--muted);
  font-size:12px;
}

/* 카드 본문 영역 */
.cpcv-body{
  padding:16px 16px 20px;
  flex:1;
  display:flex;
  flex-direction:column;
  gap:10px;
}

/* 스펙 수치 영역 */
.cpcv-stat{
  text-align:center;
}
.cpcv-stat-label{
  font-family:var(--font-body);
  font-size:12px;
  font-weight:600;
  color:var(--muted);
  letter-spacing:.02em;
  margin-bottom:4px;
}
.cpcv-stat-value{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(22px,4.8vw,34px);
  line-height:1.1;
  letter-spacing:-.02em;
}

/* 패자 수치 — 중립 회색 */
.cpcv-card--rival .cpcv-stat-value{
  color:#AEAEB8;
}

/* 승자 수치 — accent */
.cpcv-card--own .cpcv-stat-value{
  color:var(--accent-d);
}

/* 구분선 */
.cpcv-divider{
  border:none;
  border-top:1px solid var(--line);
  margin:2px 0;
}

/* 보조 설명 / 단점 텍스트 */
.cpcv-desc{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.65;
  color:var(--muted);
  text-align:center;
}
.cpcv-desc .em{color:var(--accent-d);font-weight:700}

/* 유저 보이스 인용 블록 (승자 카드) */
.cpcv-quote{
  background:rgba(0,0,0,.034);
  border-radius:calc(var(--r-scale,1)*10px);
  padding:12px 14px;
  margin-top:2px;
}
.cpcv-quote-text{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.7;
  color:var(--ink);
  font-style:italic;
  text-align:center;
}
.cpcv-quote-text .em{color:var(--accent-d);font-weight:700;font-style:normal}
.cpcv-quote-source{
  font-size:11px;
  font-weight:700;
  letter-spacing:.04em;
  color:var(--muted);
  text-align:center;
  margin-top:6px;
}

/* 마무리 문구 */
.cpcv-closer{
  margin-top:44px;
  text-align:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,4.2vw,30px);
  line-height:1.35;
  color:var(--ink);
}
.cpcv-closer .em{color:var(--accent-d)}
`,
  render: (d, { esc, richSafe }) => {
    const { rival, own } = d

    const rivalCard = `
<div class="cpcv-card cpcv-card--rival">
  <div class="cpcv-card-label">${esc(rival.label)}</div>
  ${media(rival.image, 'cpcv-img', esc(rival.imageAlt ?? rival.label))}
  <div class="cpcv-body">
    <div class="cpcv-stat">
      <p class="cpcv-stat-label">${esc(rival.statLabel)}</p>
      <p class="cpcv-stat-value">${esc(rival.statValue)}</p>
    </div>
    ${rival.body ? `<hr class="cpcv-divider"><p class="cpcv-desc">${richSafe(rival.body)}</p>` : ''}
  </div>
</div>`

    const ownCard = `
<div class="cpcv-card cpcv-card--own">
  <div class="cpcv-card-label">${esc(own.label)}</div>
  ${media(own.image, 'cpcv-img', esc(own.imageAlt ?? own.label))}
  <div class="cpcv-body">
    <div class="cpcv-stat">
      <p class="cpcv-stat-label">${esc(own.statLabel)}</p>
      <p class="cpcv-stat-value">${esc(own.statValue)}</p>
    </div>
    ${own.quote ? `
    <hr class="cpcv-divider">
    <div class="cpcv-quote">
      <p class="cpcv-quote-text">"${richSafe(own.quote)}"</p>
      ${own.quoteSource ? `<p class="cpcv-quote-source">— ${esc(own.quoteSource)}</p>` : ''}
    </div>` : ''}
  </div>
</div>`

    return `
<section class="cpcv">
  ${d.eyebrow ? `<p class="cpcv-eyebrow">${richSafe(d.eyebrow)}</p>` : ''}
  <h2 class="cpcv-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="cpcv-sub">${richSafe(d.subtitle)}</p>` : ''}
  <div class="cpcv-cols">
    ${rivalCard}
    ${ownCard}
  </div>
  ${d.closer ? `<p class="cpcv-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
