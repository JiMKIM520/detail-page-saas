/** STATS 아키타입 추가 변형(템플릿 충실 재현): 02_수치강조 Figma 184:719.
 *  stats-glass-cards: 단색 브랜드 배경 + 상단 별점 pill 뱃지 + 라벨/대형 숫자 헤드라인
 *  + 중앙 히어로 이미지(트로피 등) + 반투명 frosted-glass 둥근 카드 3개 세로 스택.
 *  statsFigures(다크 대형숫자·금배지 행), statsZigzag(지그재그), statsHighlight(아이콘 카드행)와
 *  다른 글래스모피즘 카드 스택 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  label: z.string().min(1),        // 카드 소제목 (예: "만족도 평점")
  value: z.string().min(1),        // 카드 대형 수치/텍스트 (em, br 허용)
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(),  // 상단 소제목 레이블 (예: "누적 판매량")
  headline: z.string().min(1),            // 대형 숫자 헤드라인 (em, br 허용)
  heroImage: z.string().optional(),       // 중앙 히어로 이미지 (트로피·제품·심볼)
  starCount: z.number().int().min(0).max(5).optional(), // 별점 개수 (0~5, 기본 5)
  cards: z.array(cardSchema).min(2).max(4), // 하단 글래스 카드 2~4개
})
type Data = z.infer<typeof schema>

export const statsGlassCards = defineBlock<Data>({
  id: 'stats-glass-cards',
  archetype: 'stats',
  styleTags: ['premium', 'template', 'cobalt', 'glassmorphism', 'impact'],
  imageSlots: 1,
  describe:
    '수치 강조(글래스모피즘 카드 스택). 단색 브랜드 배경 + 별점 pill 뱃지 + 라벨/대형 숫자 헤드라인 + 중앙 히어로 이미지(트로피·심볼 등) + 반투명 frosted-glass 둥근 카드(2~4개) 세로 스택. 누적 판매량·만족도·리뷰수 등 핵심 성과 수치 강조에 적합.',
  schema,
  css: `
/* sgc = stats-glass-cards 접두사 */
.sgc{background:var(--brand);padding:52px 36px 56px;text-align:center;position:relative;overflow:hidden;color:#fff}

/* 은은한 배경 광원 */
.sgc::before{content:'';position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(ellipse at center,rgba(255,255,255,.10) 0%,transparent 70%);pointer-events:none}

/* 별점 pill 뱃지 */
.sgc-stars{display:inline-flex;align-items:center;gap:5px;background:color-mix(in srgb,#fff 22%,transparent);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:6px 16px;margin-bottom:20px}
.sgc-star{width:18px;height:18px;color:#FFD166}
.sgc-star svg{width:18px;height:18px}

/* 소제목 레이블 */
.sgc-eyebrow{font-family:var(--font-display);font-weight:700;font-size:20px;color:rgba(255,255,255,.88);letter-spacing:.03em;margin-bottom:10px}

/* 대형 숫자 헤드라인 */
.sgc-headline{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-weight:400;font-size:72px;color:#fff;line-height:1.05;letter-spacing:-.02em}
.sgc-headline .em{color:#FFD166}

/* 히어로 이미지 */
.sgc-hero{width:260px;height:260px;object-fit:contain;display:block;margin:30px auto 32px;filter:drop-shadow(0 10px 28px rgba(0,0,0,.28))}
.sgc-hero.ph{background:rgba(255,255,255,.08);border:none;color:rgba(255,255,255,.3);font-size:12px;border-radius:16px}

/* 글래스 카드 스택 */
.sgc-cards{display:flex;flex-direction:column;gap:14px}

/* 개별 글래스 카드 */
.sgc-card{background:color-mix(in srgb,#fff 16%,transparent);backdrop-filter:blur(12px) saturate(140%);-webkit-backdrop-filter:blur(12px) saturate(140%);border:1px solid rgba(255,255,255,.30);border-radius:20px;padding:20px 24px 22px;text-align:center}

/* 카드 구분선 */
.sgc-card-divider{width:80%;height:1px;background:rgba(255,255,255,.22);margin:0 auto 14px}

/* 카드 소제목 */
.sgc-card-label{font-size:14px;font-weight:600;color:rgba(255,255,255,.70);letter-spacing:.04em;margin-bottom:8px}

/* 카드 대형 수치 */
.sgc-card-value{font-family:var(--font-display);font-weight:800;font-size:26px;color:#fff;line-height:1.2}
.sgc-card-value .em{color:#FFD166}
`,
  render: (d, { esc, richSafe }) => {
    const starCount = d.starCount ?? 5
    const starsHtml = starCount > 0
      ? `<div class="sgc-stars">${Array(starCount).fill(0).map(() =>
          `<span class="sgc-star"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg></span>`
        ).join('')}</div>`
      : ''

    const cardsHtml = d.cards.map((card) => `
    <div class="sgc-card">
      <div class="sgc-card-label">${esc(card.label)}</div>
      <div class="sgc-card-value">${richSafe(card.value)}</div>
    </div>`).join('')

    return `
<section class="sgc">
  ${starsHtml}
  ${d.eyebrow ? `<div class="sgc-eyebrow">${esc(d.eyebrow)}</div>` : ''}
  <h2 class="sgc-headline">${richSafe(d.headline)}</h2>
  ${media(d.heroImage, 'sgc-hero', '브랜드 히어로 이미지')}
  <div class="sgc-cards">
    ${cardsHtml}
  </div>
</section>`
  },
})
