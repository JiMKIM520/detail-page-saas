/** STATS 아키타입(템플릿 충실 재현): stats-header-card-stack.
 *  와디즈 200섹션 02_수치강조 섹션_1279:518 패턴 재구성.
 *  라이트 배경 + 세로 구분선 + 대형 숫자 헤드라인 + 컬러 헤더바·이미지·흰 값 바 3레이어 카드 3개 스택.
 *  기존 stats-figures(다크 브랜드 배경)·stats-highlight(아이콘 카드행)와 다른 라이트 카드 스택형. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  headerLabel: z.string().min(1),   // 컬러 헤더바 라벨 (예: "만족도 평점")
  image: z.string().optional(),     // 카드 중간 이미지 슬롯
  value: z.string().min(1),         // 흰 값 바의 강조 수치 (em,br)
})

const schema = z.object({
  dividerLabel: z.string().optional(),  // 세로 구분선 위 레이블 (예: "누적 판매량")
  headline: z.string().min(1),          // 대형 숫자 헤드라인 (em,br) (예: "10,000건!")
  cards: z.array(cardSchema).min(2).max(4),  // 카드 스택 2~4개
})

type Data = z.infer<typeof schema>

export const statsHeaderCardStack = defineBlock<Data>({
  id: 'stats-header-card-stack',
  archetype: 'stats',
  styleTags: ['light', 'template', 'impact', 'cobalt', 'cardstack'],
  imageSlots: 3,
  describe:
    '수치 강조(라이트 카드 스택형). 라이트 배경 + 세로 구분선 + 대형 숫자 헤드라인 + 컬러 헤더바·이미지·흰 값 바 3레이어 카드 3개 스택. 누적 판매량·만족도·리뷰수·매출 등 복수 수치를 카드 단위로 시각화.',
  schema,
  css: `
/* shcs = stats-header-card-stack 접두사 */
.shcs{background:var(--bg);padding:56px 40px 64px;text-align:center}

/* 상단 구분선 + 레이블 */
.shcs-divider-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:22px}
.shcs-divider-line{width:1px;height:48px;background:color-mix(in srgb,var(--ink) 30%,transparent)}
.shcs-divider-label{font-size:15px;font-weight:600;color:var(--ink-2);letter-spacing:.04em}

/* 대형 숫자 헤드라인 */
.shcs-headline{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-weight:400;font-size:76px;color:var(--ink);line-height:1.05;letter-spacing:-.02em;margin-bottom:40px}
.shcs-headline .em{color:var(--accent)}

/* 카드 스택 */
.shcs-stack{display:flex;flex-direction:column;gap:16px}

/* 개별 카드 */
.shcs-card{border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}

/* 컬러 헤더바 */
.shcs-card-header{background:color-mix(in srgb,var(--accent) 72%,var(--brand));padding:12px 24px;text-align:center}
.shcs-card-header-label{font-size:15px;font-weight:700;color:#fff;letter-spacing:.04em}

/* 이미지 슬롯 */
.shcs-card-img{width:100%;height:220px;object-fit:cover;display:block}

/* 흰 값 바 */
.shcs-card-value-bar{background:var(--paper);padding:20px 24px;text-align:center}
.shcs-card-value{font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--ink);line-height:1.15;letter-spacing:-.01em}
.shcs-card-value .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="shcs">
  ${d.dividerLabel ? `
  <div class="shcs-divider-wrap">
    <div class="shcs-divider-line"></div>
    <span class="shcs-divider-label">${esc(d.dividerLabel)}</span>
  </div>` : '<div class="shcs-divider-wrap"><div class="shcs-divider-line"></div></div>'}
  <h2 class="shcs-headline">${richSafe(d.headline)}</h2>
  <div class="shcs-stack">
    ${d.cards.map((c) => `
    <div class="shcs-card">
      <div class="shcs-card-header">
        <span class="shcs-card-header-label">${esc(c.headerLabel)}</span>
      </div>
      ${media(c.image, 'shcs-card-img', c.headerLabel)}
      <div class="shcs-card-value-bar">
        <div class="shcs-card-value">${richSafe(c.value)}</div>
      </div>
    </div>`).join('')}
  </div>
</section>`,
})
