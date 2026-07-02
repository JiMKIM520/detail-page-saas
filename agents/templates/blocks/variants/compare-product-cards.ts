/** COMPARE 아키타입: compare-product-cards.
 *  [끝판왕] 추천·B&A #4 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 대형 헤드라인 + 3줄 부연설명 → 2열 카드(타사=중립회색/자사=accent 오렌지).
 *  각 카드: 라벨(badge) + 설명 텍스트 + 제품 이미지 + 핵심 기능 문구. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 부연 설명 줄 목록 (2~4줄) */
  subtitleLines: z.array(z.string().min(1)).min(2).max(4),
  /** 타사(패자) 카드 */
  rival: z.object({
    /** 카드 라벨 (예: "타사 제품") */
    label: z.string().min(1),
    /** 설명 줄 목록 (1~3줄) */
    descLines: z.array(z.string().min(1)).min(1).max(3),
    /** 제품 이미지 URL */
    image: z.string().optional(),
    /** 이미지 alt */
    imageAlt: z.string().optional(),
    /** 하단 핵심 기능 문구 */
    feature: z.string().min(1),
  }),
  /** 자사(승자) 카드 */
  ours: z.object({
    /** 카드 라벨 (예: "자사 제품") */
    label: z.string().min(1),
    /** 설명 줄 목록 (1~3줄, em 허용) */
    descLines: z.array(z.string().min(1)).min(1).max(3),
    /** 제품 이미지 URL */
    image: z.string().optional(),
    /** 이미지 alt */
    imageAlt: z.string().optional(),
    /** 하단 핵심 기능 문구 (em 허용) */
    feature: z.string().min(1),
  }),
})
type Data = z.infer<typeof schema>

export const compareProductCards = defineBlock<Data>({
  id: 'compare-product-cards',
  archetype: 'compare',
  styleTags: ['light', 'comparison', 'cards', 'template', 'commerce'],
  imageSlots: 2,
  describe:
    '타사/자사 제품 2열 카드 비교. 대형 헤드라인 + 부연 3줄 → [타사=중립회색 카드 / 자사=accent 오렌지 강조 카드] 나란히. 각 카드: 라벨(badge) + 설명 텍스트 + 제품 이미지 + 하단 핵심 기능 문구. 패자 카드는 회색, 승자(자사) 카드는 accent 브랜드 강조.',
  schema,
  css: `
/* compare-product-cards — 접두사 cpc- */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted */
.cpc{
  background:var(--bg);
  padding:52px 28px 60px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 헤드라인 영역 */
.cpc-hd{
  margin-bottom:36px;
}
.cpc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,7.2vw,52px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:20px;
}
.cpc-title .em{color:var(--accent-d)}
.cpc-subtitle{
  list-style:none;
  padding:0;
  margin:0;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.cpc-subtitle li{
  font-family:var(--font-body);
  font-size:clamp(14px,3.2vw,16px);
  line-height:1.7;
  color:var(--muted);
  letter-spacing:-.005em;
}
.cpc-subtitle li .em{color:var(--accent-d);font-weight:700}

/* 2열 카드 그리드 */
.cpc-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}

/* 공통 카드 */
.cpc-card{
  border-radius:20px;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  padding:22px 18px 24px;
  gap:0;
}

/* 타사(패자): 중립 회색 */
.cpc-card--rival{
  background:#F2F2F4;
}
/* 자사(승자): accent 계열 웜 배경 */
.cpc-card--ours{
  background:#FFF0E0;
}

/* 라벨 */
.cpc-label{
  display:inline-block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(15px,3.4vw,20px);
  letter-spacing:-.01em;
  margin-bottom:16px;
  padding:5px 12px 5px 0;
  border-radius:4px;
}
.cpc-card--rival .cpc-label{
  color:#8A8A93;
  background:transparent;
  padding:0;
}
/* 승자 라벨: accent 배지 스타일 */
.cpc-card--ours .cpc-label{
  color:#fff;
  background:var(--accent);
  padding:5px 14px;
  border-radius:6px;
}

/* 설명 텍스트 줄 */
.cpc-descs{
  display:flex;
  flex-direction:column;
  gap:2px;
  margin-bottom:18px;
  min-height:52px;
}
.cpc-desc{
  font-family:var(--font-body);
  font-size:clamp(12px,2.6vw,14px);
  line-height:1.65;
  letter-spacing:-.005em;
}
.cpc-card--rival .cpc-desc{color:#9A9AA3}
.cpc-card--ours .cpc-desc{color:var(--accent-d);font-weight:600}
.cpc-card--ours .cpc-desc .em{color:var(--accent)}

/* 제품 이미지 영역 */
.cpc-media{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  border-radius:10px;
  margin-bottom:18px;
  display:block;
}
.cpc-media.ph{
  width:100%;
  aspect-ratio:1/1;
  border-radius:10px;
  margin-bottom:18px;
}
.cpc-card--rival .cpc-media.ph{
  background:#E0E0E4;
  border:2px dashed #C8C8CE;
  color:#9A9AA3;
}
.cpc-card--ours .cpc-media.ph{
  background:#F5D8B2;
  border:2px dashed #E8B87C;
  color:#C0844A;
}

/* 하단 핵심 기능 문구 */
.cpc-feature{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(14px,3.2vw,18px);
  line-height:1.4;
  letter-spacing:-.01em;
  text-align:center;
  margin-top:4px;
}
.cpc-card--rival .cpc-feature{color:#6E6E77}
.cpc-card--ours .cpc-feature{color:var(--accent)}
.cpc-card--ours .cpc-feature .em{color:var(--accent-d)}
`,
  render: (d, { esc, richSafe }) => {
    const subtitleHtml = d.subtitleLines
      .map((line) => `<li>${richSafe(line)}</li>`)
      .join('')

    const rivalDescsHtml = d.rival.descLines
      .map((line) => `<p class="cpc-desc">${esc(line)}</p>`)
      .join('')

    const oursDescsHtml = d.ours.descLines
      .map((line) => `<p class="cpc-desc">${richSafe(line)}</p>`)
      .join('')

    return `
<section class="cpc">
  <div class="cpc-hd">
    <h2 class="cpc-title">${richSafe(d.title)}</h2>
    <ul class="cpc-subtitle">${subtitleHtml}</ul>
  </div>
  <div class="cpc-grid">
    <div class="cpc-card cpc-card--rival">
      <span class="cpc-label">${esc(d.rival.label)}</span>
      <div class="cpc-descs">${rivalDescsHtml}</div>
      ${media(d.rival.image, 'cpc-media', esc(d.rival.imageAlt ?? '제품 이미지'))}
      <p class="cpc-feature">${esc(d.rival.feature)}</p>
    </div>
    <div class="cpc-card cpc-card--ours">
      <span class="cpc-label">${esc(d.ours.label)}</span>
      <div class="cpc-descs">${oursDescsHtml}</div>
      ${media(d.ours.image, 'cpc-media', esc(d.ours.imageAlt ?? '제품 이미지'))}
      <p class="cpc-feature">${richSafe(d.ours.feature)}</p>
    </div>
  </div>
</section>`
  },
})
