/** FEATURE 아키타입: feature-alt-card-stack.
 *  피그마 187_제품소개_16 패턴 재구성 —
 *  섹션 태그 + 헤드라인 → 전체폭 대표 이미지 → 색상 배지 서브타이틀 →
 *  2~4개 좌우 교대형 라운드 카드(이미지+텍스트 스택). 라이트 배경.
 *  홀수 카드 = 이미지왼쪽/텍스트오른쪽, 짝수 카드 = 이미지오른쪽/텍스트왼쪽.
 *  이미지 부재 시 카드 레이아웃이 붕괴하지 않도록 noimg-safe 강등 처리. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  tag: z.string().optional(),           // 섹션 태그 (예: "# 제품소개"). 기본값 사용 시 생략 가능
  title: z.string().min(1),            // (em,br) 대표 헤드라인
  subtitle: z.string().optional(),     // 헤드라인 아래 보조 설명 텍스트
  heroImage: z.string().optional(),    // 전체폭 대표 이미지 (url)
  badgeText: z.string().optional(),    // 색상 배지 안 서브타이틀 (em,br)
  badgeDesc: z.string().optional(),    // 배지 아래 설명 텍스트 (em,br)
  cards: z
    .array(
      z.object({
        label: z.string().min(1),      // 색상 레이블 (예: "detail_01"). (em 허용)
        cardTitle: z.string().min(1),  // 카드 소제목 (em,br)
        cardDesc: z.string().min(1),   // 카드 본문 (em,br)
        image: z.string().optional(),  // 카드 이미지 (url)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureAltCardStack = defineBlock<Data>({
  id: 'feature-alt-card-stack',
  archetype: 'feature',
  styleTags: ['light', 'template', 'editorial', 'zigzag', 'noimg-safe'],
  imageSlots: 4, // heroImage(1) + 최대 카드 이미지(3)
  describe:
    '제품 기능 소개(교대형 카드 스택). 라이트 배경 + 섹션 태그 + 헤드라인 + 전체폭 대표 이미지 + 색상 배지 서브타이틀 + 2~4개 좌우 교대형 라운드 카드(이미지·레이블·소제목·설명). 상세한 기능 특징 나열에 적합.',
  schema,
  css: `
.facs{background:var(--bg);color:var(--ink);padding:0 0 72px}

/* 섹션 태그 */
.facs-tag{
  padding:52px var(--pad-x,56px) 0;
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(26px,3.2vw,50px);
  color:var(--muted);
  letter-spacing:-.01em;
  line-height:1.1;
}

/* 메인 헤드라인 + 서브 */
.facs-hd{padding:14px var(--pad-x,56px) 0}
.facs-title{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(28px,4vw,60px);
  color:var(--ink);
  letter-spacing:-.02em;
  line-height:1.18;
}
.facs-title .em{color:var(--accent-d)}
.facs-sub{
  margin-top:14px;
  font-size:clamp(15px,1.6vw,20px);
  font-weight:400;
  color:var(--ink-2);
  line-height:1.65;
}

/* 전체폭 대표 이미지 */
.facs-hero-wrap{margin-top:40px;width:100%;overflow:hidden}
.facs-hero,
.facs-hero.ph{
  display:block;
  width:100%;
  /* 시그니처 사진 프레임 — 피그마 원본 직각(r=0) 전체폭에서 var(--shape-photo) 재해석 */
  border-radius:var(--shape-photo, 0px);
  aspect-ratio:860/520;
  object-fit:cover;
  background:color-mix(in srgb,var(--accent) 8%,var(--paper));
}
/* noimg-safe: 영웅 이미지 없으면 wrapper를 숨겨 레이아웃 보존 */
.facs-hero.ph{display:none!important}

/* 배지 서브타이틀 블록 */
.facs-badge-section{
  margin:52px var(--pad-x,56px) 0;
  padding:22px 32px;
  background:var(--brand);
  border-radius:calc(var(--r-scale,1)*14px);
}
.facs-badge-text{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(18px,2.2vw,32px);
  color:#fff;
  text-align:center;
  line-height:1.3;
}
.facs-badge-text .em{color:var(--em-dark,#FFF7EA)}
.facs-badge-desc{
  margin-top:10px;
  font-size:clamp(14px,1.4vw,18px);
  font-weight:400;
  color:rgba(255,255,255,.82);
  text-align:center;
  line-height:1.6;
}
.facs-badge-desc .em{color:var(--em-dark,#FFF7EA)}

/* 교대형 카드 스택 */
.facs-cards{
  margin-top:40px;
  padding:0 var(--pad-x,56px);
  display:flex;
  flex-direction:column;
  gap:24px;
}

/* 카드 공통 */
.facs-card{
  display:flex;
  align-items:stretch;
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*50px);
  overflow:hidden;
  min-height:220px;
}
/* 짝수 카드: 이미지 오른쪽 */
.facs-card.rev{flex-direction:row-reverse}

/* 카드 이미지 영역 */
.facs-card-img-wrap{
  flex:0 0 48%;
  min-height:200px;
  overflow:hidden;
  position:relative;
}
.facs-card-img,
.facs-card-img.ph{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:0;
  /* 이미지 없으면 placeholder — 부모 flex셀이 크기를 유지하므로 카드 붕괴 없음 */
  background:color-mix(in srgb,var(--accent) 10%,var(--paper));
}
/* noimg-safe: 전체 카드에 이미지가 하나도 없으면 이미지 컬럼 자체를 숨겨 텍스트 풀폭 */
.facs-card.noimg .facs-card-img-wrap{display:none}
.facs-card.noimg .facs-card-body{padding:28px 36px}

/* 카드 텍스트 영역 */
.facs-card-body{
  flex:1;
  padding:32px 36px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:8px;
}
.facs-card-label{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(12px,1.2vw,17px);
  color:var(--muted);
  letter-spacing:.04em;
  line-height:1.2;
}
.facs-card-label .em{color:var(--accent-d)}
.facs-card-title{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(17px,1.8vw,26px);
  color:var(--ink);
  letter-spacing:-.01em;
  line-height:1.3;
  margin-top:2px;
}
.facs-card-title .em{color:var(--accent-d)}
.facs-card-desc{
  margin-top:6px;
  font-size:clamp(13px,1.3vw,17px);
  font-weight:400;
  color:var(--ink-2);
  line-height:1.7;
}
.facs-card-desc .em{color:var(--accent-d);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 카드 이미지가 단 하나도 없으면 이미지 컬럼 전체 숨김
    const withCardImgs = d.cards.some((c) => typeof c.image === 'string' && c.image.length > 0)

    // 영웅 이미지 렌더 (없으면 wrapper 자체를 숨김)
    const heroHtml = d.heroImage
      ? `<div class="facs-hero-wrap">${media(d.heroImage, 'facs-hero', '제품 대표 이미지')}</div>`
      : ''

    // 배지 섹션
    const badgeHtml =
      d.badgeText
        ? `<div class="facs-badge-section">
    <p class="facs-badge-text">${richSafe(d.badgeText)}</p>
    ${d.badgeDesc ? `<p class="facs-badge-desc">${richSafe(d.badgeDesc)}</p>` : ''}
  </div>`
        : ''

    // 카드 목록
    const cardsHtml = d.cards
      .map((c, i) => {
        const isRev = i % 2 === 1 // 짝수 인덱스(0-base) = 이미지 오른쪽
        const noImgClass = !withCardImgs ? ' noimg' : ''
        return `<div class="facs-card${isRev ? ' rev' : ''}${noImgClass}">
      ${withCardImgs ? `<div class="facs-card-img-wrap">${media(c.image, 'facs-card-img', esc(c.cardTitle))}</div>` : ''}
      <div class="facs-card-body">
        <span class="facs-card-label">${richSafe(c.label)}</span>
        <h3 class="facs-card-title">${richSafe(c.cardTitle)}</h3>
        <p class="facs-card-desc">${richSafe(c.cardDesc)}</p>
      </div>
    </div>`
      })
      .join('\n    ')

    return `
<section class="facs">
  ${d.tag !== undefined ? `<p class="facs-tag">${esc(d.tag)}</p>` : `<p class="facs-tag"># 제품소개</p>`}
  <div class="facs-hd">
    <h2 class="facs-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="facs-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${heroHtml}
  ${badgeHtml}
  <div class="facs-cards">
    ${cardsHtml}
  </div>
</section>`
  },
})
