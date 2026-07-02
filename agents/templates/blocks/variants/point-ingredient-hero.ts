/** POINT 아키타입: point-ingredient-hero.
 *  [끝판왕] 포인트 구성 #10 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: pill 브랜드 배지 + 인라인 키워드 컬러 하이라이트 헤드라인 + 서브 + 본문 카피
 *  + 풀블리드 성분/원료 이미지 하단 수직 스택. 밝은 배경. 복잡도 low. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** pill 배지 브랜드/라벨 텍스트 (선택 — 없으면 배지 숨김) */
  badge: z.string().optional(),
  /** 대형 헤드라인 (em 허용 — 키워드 accent 인라인 강조, br 허용) */
  title: z.string().min(1),
  /** 보조 헤드라인 / 슬로건 (em, br 허용) */
  subheading: z.string().min(1).optional(),
  /** 본문 설명 카피 (1~2문장, em 허용) */
  body: z.string().optional(),
  /** 풀블리드 성분/원료 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointIngredientHero = defineBlock<Data>({
  id: 'point-ingredient-hero',
  archetype: 'point',
  styleTags: ['bright', 'keyword-highlight', 'ingredient', 'pill-badge', 'template'],
  imageSlots: 1,
  describe:
    '포인트 성분 히어로. 밝은 배경 + pill 브랜드 배지 + 인라인 키워드 accent 강조 대형 헤드라인 + 서브헤드 + 본문 카피 + 풀블리드 성분/원료 이미지 수직 스택. 뷰티·건강기능식품 포인트 섹션.',
  schema,
  css: `
/* point-ingredient-hero — 접두사 pih- */
.pih{background:var(--paper);padding:52px 36px 0;text-align:center;overflow:hidden;word-break:keep-all}
/* pill 배지 */
.pih-badge{display:inline-block;padding:7px 20px;border-radius:999px;border:1.5px solid var(--accent-d);color:var(--accent-d);font-family:var(--font-body);font-size:14px;font-weight:700;letter-spacing:.04em;margin-bottom:22px;line-height:1}
/* 대형 헤드라인 */
.pih-title{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,8.5vw,52px);line-height:1.22;letter-spacing:-.025em;color:var(--ink);margin-bottom:10px}
.pih-title .em{color:var(--accent-d)}
/* 서브헤드 */
.pih-sub{font-family:var(--font-body);font-weight:700;font-size:clamp(17px,4vw,21px);line-height:1.5;color:var(--ink);margin-bottom:12px}
.pih-sub .em{color:var(--accent-d)}
/* 본문 */
.pih-body{font-family:var(--font-body);font-size:14px;line-height:1.75;color:var(--muted);margin-bottom:36px}
.pih-body .em{color:var(--accent-d);font-weight:700}
/* 풀블리드 성분 이미지 */
.pih-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.pih-img.ph{width:100%;aspect-ratio:1/1;background:rgba(0,0,0,.04);border:2px dashed var(--line);color:var(--muted)}
`,
  render: (d, { esc, richSafe }) => `
<section class="pih">
  ${d.badge ? `<div class="pih-badge">${esc(d.badge)}</div>` : ''}
  <h2 class="pih-title">${richSafe(d.title)}</h2>
  ${d.subheading ? `<p class="pih-sub">${richSafe(d.subheading)}</p>` : ''}
  ${d.body ? `<p class="pih-body">${richSafe(d.body)}</p>` : ''}
  ${media(d.image, 'pih-img', esc(d.imageAlt ?? '성분 이미지'))}
</section>`,
})
