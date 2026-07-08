/** POINT 아키타입: point-numbered-hero-card.
 *  [끝판왕] 포인트 구성 #17 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 카드 + 상단 번호 pill 뱃지 + 헤드라인 헤더 존 →
 *            카드 내 contained 이미지(풀블리드 아님) →
 *            별도 배경색 하단 캡션 스트립.
 *  feature-captionbar 와의 차이: 번호 뱃지+헤드라인이 이미지 위 별도 헤더 존에 배치,
 *  이미지는 카드 내부(패딩 있는 contained), 캡션은 분리된 스트립 배경. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 반복 카드 유닛 (1~5개). 각 카드 = 번호 뱃지 + 헤드라인 + 이미지 + 캡션 스트립. */
  items: z
    .array(
      z.object({
        /** 번호 pill 뱃지 텍스트 (예: "Point 1", "POINT 01") */
        badge: z.string().min(1),
        /** 카드 헤더 헤드라인 (em, br 허용) */
        heading: z.string().min(1),
        /** contained 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 캡션 스트립 본문 (em 허용 — 굵은 강조 포함) */
        caption: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),
})
type Data = z.infer<typeof schema>

export const pointNumberedHeroCard = defineBlock<Data>({
  id: 'point-numbered-hero-card',
  archetype: 'point',
  styleTags: ['dark', 'numbered', 'card', 'contained-image', 'caption-strip', 'template'],
  imageSlots: 3,
  describe:
    '포인트 번호 카드. 다크 카드 + 상단 번호 pill 뱃지 + 헤드라인 헤더 존 → 카드 내 contained 이미지 → 별도 배경 하단 캡션 스트립. 번호(Point 1/2/3) 시리즈 포인트 전개에 최적.',
  schema,
  css: `
/* point-numbered-hero-card — 접두사 pnhc- */
.pnhc{background:var(--bg);padding:40px 32px 48px;display:flex;flex-direction:column;gap:28px;word-break:keep-all;overflow-wrap:break-word}
/* 카드 래퍼 */
.pnhc-card{background:var(--ink);border-radius:calc(var(--r-scale,1)*20px);overflow:hidden}
/* 헤더 존: 번호 뱃지 + 헤드라인 — 이미지 위 별도 구역 */
.pnhc-hd{padding:28px 28px 20px;display:flex;flex-direction:column;gap:12px}
/* 번호 pill 뱃지 */
.pnhc-badge{display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.14);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-size:13px;font-weight:700;letter-spacing:.06em;border-radius:999px;padding:5px 14px;width:fit-content}
/* 헤드라인 */
.pnhc-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5.8vw,34px);line-height:1.28;letter-spacing:-.02em;color:#fff}
.pnhc-heading .em{color:var(--accent)}
/* contained 이미지 존: 카드 내 패딩으로 둘러싸임 */
.pnhc-img-wrap{padding:0 24px 24px}
.pnhc-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px))}
.pnhc-img.ph{width:100%;aspect-ratio:4/3;border:2px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:rgba(255,255,255,.38);border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px))}
/* 하단 캡션 스트립 — 별도 배경으로 분리 */
.pnhc-strip{background:rgba(255,255,255,.08);border-top:1px solid rgba(255,255,255,.10);padding:18px 28px 22px;text-align:center}
.pnhc-caption{font-family:var(--font-body),'Pretendard',sans-serif;font-size:15px;line-height:1.65;color:rgba(255,255,255,.72)}
.pnhc-caption .em{color:#fff;font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.items
      .map(
        (it) => `
    <div class="pnhc-card">
      <div class="pnhc-hd">
        <span class="pnhc-badge">${esc(it.badge)}</span>
        <h3 class="pnhc-heading">${richSafe(it.heading)}</h3>
      </div>
      <div class="pnhc-img-wrap">
        ${media(it.image, 'pnhc-img', esc(it.imageAlt ?? '포인트 이미지'))}
      </div>
      <div class="pnhc-strip">
        <p class="pnhc-caption">${richSafe(it.caption)}</p>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="pnhc">
  ${cards}
</section>`
  },
})
