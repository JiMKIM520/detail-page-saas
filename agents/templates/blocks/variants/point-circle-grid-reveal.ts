/** POINT 아키타입: point-circle-grid-reveal
 *  원본: 248_문제제기_12 (피그마 문제제기 템플릿)
 *  구조: 인용문 텍스트박스(회색) → 설명 → 원형 이미지+세로선 전환 연출 → 고민 키워드
 *        → 2×2 어두운 카드 그리드(이미지+라벨+설명) → 화살표 → 형광펜 밑줄 결론+아이콘+텍스트
 *        → 풀블리드 이미지 (옵션)
 *  톤: light / 이미지 없이도 붕괴하지 않는 noimg-safe 강등 구현
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  image: z.string().optional(),       // (url) 그리드 카드 이미지
  label: z.string().min(1),           // 카드 제목 (em 허용)
  text: z.string().min(1),            // 카드 설명
})

const schema = z.object({
  quote: z.string().min(1),           // 인용 문구 (따옴표 포함 표기 권장, em/br)
  quoteDesc: z.string().optional(),   // 인용문 아래 설명 문장
  circleImage: z.string().optional(), // (url) 원형 히어로 이미지
  keyword: z.string().min(1),         // 세로선 아래 고민 키워드 헤드라인 (em/br)
  cards: z.array(cardSchema).min(2).max(4), // 2×2 어두운 카드 (2~4개)
  conclusionIcon: z.string().optional(),    // 결론 위 아이콘 이름 (bulb/check/bolt 등) — 브리프 근거 시만
  conclusion: z.string().min(1),      // 형광펜 밑줄 결론 텍스트 (em/br)
  conclusionSub: z.string().optional(), // 결론 아래 보조 한 줄
  fullbleedImage: z.string().optional(), // (url) 풀블리드 하단 이미지 — 브리프 근거 시만
})
type Data = z.infer<typeof schema>

export const pointCircleGridReveal = defineBlock<Data>({
  id: 'point-circle-grid-reveal',
  archetype: 'point',
  styleTags: ['light', 'editorial', 'problem', 'noimg-safe'],
  imageSlots: 6,
  describe:
    '문제 제기 섹션. 인용문 텍스트박스(회색) + 원형 히어로 이미지 + 세로선 전환 연출 + 고민 키워드 헤드라인 + 2×2 어두운 카드 그리드(이미지+라벨+설명) + 하향 화살표 + 형광펜 밑줄 결론+아이콘 + 풀블리드 이미지(옵션). 소비자 고민을 구체적으로 열거하고 결론으로 해소하는 구조.',
  schema,
  css: `
/* ── point-circle-grid-reveal (phiu) ── */
.phiu{background:var(--bg);color:var(--ink);padding-bottom:0}

/* 인용문 텍스트박스 */
.phiu-quote-wrap{padding:54px var(--pad-x,56px) 0;text-align:center}
.phiu-quote-box{display:inline-block;background:#797979;color:#fff;
  border-radius:calc(var(--r-scale,1)*10px);padding:14px 32px}
.phiu-quote-box .em{color:var(--em-dark,#FFF7EA)}
.phiu-quote-text{font-size:42px;font-weight:700;line-height:1.2;letter-spacing:-.02em;
  font-family:var(--font-display)}

/* 인용문 아래 설명 */
.phiu-quote-desc{margin-top:28px;padding:0 var(--pad-x,56px);text-align:center;
  font-size:19px;font-weight:300;line-height:1.7;color:var(--ink-2)}

/* 원형 이미지 */
.phiu-circle-wrap{display:flex;justify-content:center;margin-top:40px;padding:0 var(--pad-x,56px)}
.phiu-circle{width:260px;height:260px;border-radius:50%;overflow:hidden;
  background:color-mix(in srgb,var(--accent) 10%,transparent);flex-shrink:0}
.phiu-circle img,.phiu-circle .ph{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}
/* noimg-safe: 원형 이미지 없으면 숨겨 세로선이 바로 이어지도록 */
.phiu-circle.ph-wrap{display:none}

/* 세로선 전환 연출 */
.phiu-vline-wrap{display:flex;flex-direction:column;align-items:center;
  padding:0 var(--pad-x,56px);margin-top:28px;gap:0}
.phiu-vline{width:1px;height:60px;background:var(--ink-2);opacity:.35}

/* 고민 키워드 헤드라인 */
.phiu-keyword{margin-top:20px;padding:0 var(--pad-x,56px);text-align:center;
  font-family:var(--font-display);font-size:36px;font-weight:700;line-height:1.4;color:#797979}
.phiu-keyword .em{color:var(--accent)}

/* 2×2 어두운 카드 그리드 */
.phiu-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;
  margin-top:32px;padding:0 var(--pad-x,56px)}
/* 홀수 3개: 1행 3칸 (빈 칸 없음) */
.phiu-grid[data-count="3"]{grid-template-columns:repeat(3,1fr)}
.phiu-card{background:#363636;border-radius:calc(var(--r-scale,1)*10px);overflow:hidden;
  display:flex;flex-direction:column}
/* 카드 이미지 영역 */
.phiu-card-img{width:100%;aspect-ratio:370/360;overflow:hidden;background:#d9d9d9;flex-shrink:0}
.phiu-card-img img{width:100%;height:100%;object-fit:cover;display:block}
.phiu-card-img .ph{display:none!important}
/* noimg-safe: 이미지 없으면 이미지 영역 숨김 — 텍스트 패널만으로 카드 구성 */
.phiu-card.no-img .phiu-card-img{display:none}
/* 카드 텍스트 패널 */
.phiu-card-body{padding:16px 20px 20px;background:#363636}
.phiu-card-label{font-size:17px;font-weight:500;color:#d2d2d2;line-height:1.3;
  font-family:var(--font-display)}
.phiu-card-label .em{color:var(--em-dark,#FFF7EA)}
.phiu-card-text{margin-top:8px;font-size:14px;font-weight:400;color:rgba(161,161,161,.9);
  line-height:1.6}
/* em override — 어두운 카드 영역 */
.phiu-card .em{color:var(--em-dark,#FFF7EA)}

/* 화살표 */
.phiu-arrow-wrap{display:flex;justify-content:center;margin-top:32px;
  padding:0 var(--pad-x,56px);color:var(--ink-2)}
.phiu-arrow{width:28px;height:40px;opacity:.55}

/* 결론 영역 */
.phiu-conclusion{margin-top:32px;padding:0 var(--pad-x,56px) 52px;text-align:center}
/* 아이콘 */
.phiu-icon{display:flex;justify-content:center;margin-bottom:18px}
.phiu-icon svg{width:52px;height:52px;color:var(--ink)}
/* 결론 텍스트 + 형광펜 밑줄 */
.phiu-conclusion-text{position:relative;display:inline-block;
  font-family:var(--font-display);font-size:30px;font-weight:500;line-height:1.6;
  color:var(--ink)}
.phiu-conclusion-text .em{color:var(--accent)}
.phiu-hl{position:relative;display:inline}
.phiu-hl::after{content:'';position:absolute;left:0;right:0;bottom:2px;height:14px;
  background:#e8d4b0;z-index:-1;border-radius:calc(var(--r-scale,1)*2px)}
/* 구분선 */
.phiu-rule{width:100%;height:1px;background:var(--line);margin:24px 0 20px}
/* 보조 문장 */
.phiu-conclusion-sub{font-size:18px;font-weight:300;color:var(--ink-2);line-height:1.7}

/* 풀블리드 이미지 */
.phiu-fullbleed{width:100%;aspect-ratio:860/1000;overflow:hidden;display:block;
  border-radius:var(--shape-photo,0px)}
.phiu-fullbleed img{width:100%;height:100%;object-fit:cover;display:block}
.phiu-fullbleed .ph{display:none!important}
`,
  render: (d, { esc, richSafe, icon }) => {
    // noimg-safe: 카드 이미지가 전혀 없으면 카드에 no-img 클래스 추가
    const hasCardImgs = d.cards.some((c) => typeof c.image === 'string' && c.image.length > 0)
    // noimg-safe: 원형 이미지 없으면 circle wrap 숨김
    const hasCircle = typeof d.circleImage === 'string' && d.circleImage.length > 0

    return `
<section class="phiu">
  <!-- 인용문 텍스트박스 -->
  <div class="phiu-quote-wrap">
    <div class="phiu-quote-box">
      <p class="phiu-quote-text">${richSafe(d.quote)}</p>
    </div>
  </div>
  ${d.quoteDesc ? `<p class="phiu-quote-desc">${esc(d.quoteDesc)}</p>` : ''}

  <!-- 원형 이미지 (noimg-safe: 없으면 숨김) -->
  ${hasCircle
    ? `<div class="phiu-circle-wrap">
    <div class="phiu-circle">${media(d.circleImage, '', '대표 이미지')}</div>
  </div>`
    : ''}

  <!-- 세로선 전환 연출 -->
  <div class="phiu-vline-wrap">
    <div class="phiu-vline"></div>
  </div>

  <!-- 고민 키워드 헤드라인 -->
  <p class="phiu-keyword">${richSafe(d.keyword)}</p>

  <!-- 2×2 어두운 카드 그리드 -->
  <div class="phiu-grid" data-count="${d.cards.length}">
    ${d.cards
      .map(
        (c) => `
    <div class="phiu-card${!hasCardImgs ? ' no-img' : ''}">
      <div class="phiu-card-img">${media(c.image, '', esc(c.label))}</div>
      <div class="phiu-card-body">
        <p class="phiu-card-label">${richSafe(c.label)}</p>
        <p class="phiu-card-text">${esc(c.text)}</p>
      </div>
    </div>`,
      )
      .join('')}
  </div>

  <!-- 하향 화살표 -->
  <div class="phiu-arrow-wrap">
    <svg class="phiu-arrow" viewBox="0 0 28 40" fill="none" stroke="currentColor"
         stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 4v28M5 25l9 10 9-10"/>
    </svg>
  </div>

  <!-- 결론 영역 -->
  <div class="phiu-conclusion">
    ${d.conclusionIcon
      ? `<div class="phiu-icon">${icon(d.conclusionIcon)}</div>`
      : ''}
    <p class="phiu-conclusion-text">${richSafe(d.conclusion)}</p>
    ${d.conclusionSub
      ? `<hr class="phiu-rule"><p class="phiu-conclusion-sub">${esc(d.conclusionSub)}</p>`
      : ''}
  </div>

  <!-- 풀블리드 이미지 (옵션) -->
  ${d.fullbleedImage
    ? `<div class="phiu-fullbleed">${media(d.fullbleedImage, '', '제품 풀컷')}</div>`
    : ''}
</section>`
  },
})
