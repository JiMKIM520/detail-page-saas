/** REVIEW 아키타입: review-icon-alternating-rows.
 *  [끝판왕] 리뷰·추천 #20 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 선명한 브랜드 배경 + 라운드 카드 행 반복 + 주제형 3D-느낌 아이콘이
 *  홀수행 좌(카드 밖 돌출) / 짝수행 우 교차 배치.
 *  리뷰어 사진 없이 아이콘으로 시각 다양성 확보. 복잡도 low. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 eyebrow 라벨 필(pill) — 브랜드명·제품 카테고리 (선택) */
  eyebrow: z.string().optional(),
  /** 섹션 대제목 (em 허용 — 핵심 어절 강조) */
  title: z.string().min(1),
  /** 리뷰 행 (2~6개). 홀수(1,3,5)=아이콘 왼쪽, 짝수(2,4,6)=아이콘 오른쪽 */
  items: z
    .array(
      z.object({
        /** 아이콘 이미지 URL (3D 오브젝트 PNG, 투명배경 권장). 없으면 라인 아이콘 폴백. */
        iconImage: z.string().optional(),
        /** ctx.icon() 폴백용 라인 아이콘 이름 (iconImage 없을 때) */
        iconName: z.string().optional(),
        /** 리뷰 키워드 헤딩 (em 허용, 예: "가성비 <span class=\"em\">최고</span>") */
        heading: z.string().min(1),
        /** 리뷰 본문 1~2줄 */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
  /** 배경색 CSS 값 — 기본 var(--accent). 브랜드 포인트색 직접 지정 가능. */
  bgColor: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const reviewIconAlternatingRows = defineBlock<Data>({
  id: 'review-icon-alternating-rows',
  archetype: 'review',
  styleTags: ['bright', 'playful', 'review', 'icon', 'alternating', 'template'],
  imageSlots: 4,
  describe:
    '고객 리뷰(아이콘 교차). 선명한 배경(기본 accent) + eyebrow 라벨 pill + 대형 헤드라인 + 화이트 라운드 카드 반복. 홀수행=3D 아이콘 왼쪽/짝수행=오른쪽 교차 배치. 리뷰어 사진 없이 지갑·엄지·깃발·핀 등 키워드 상징 아이콘으로 시각 다양성 확보.',
  schema,
  css: `
/* review-icon-alternating-rows — 접두사 riar- */
.riar{padding:52px 28px 60px;word-break:keep-all;overflow-wrap:break-word}
/* eyebrow pill */
.riar-eyebrow{display:inline-block;background:var(--ink);color:#fff;font-family:var(--font-body);font-weight:700;font-size:13px;letter-spacing:.06em;padding:6px 18px;border-radius:999px;margin-bottom:14px}
/* 대제목 */
.riar-title{font-family:var(--font-display);font-weight:900;font-size:clamp(28px,7.2vw,42px);line-height:1.22;letter-spacing:-.02em;color:var(--ink);margin-bottom:30px}
.riar-title .em{color:var(--ink);text-decoration:underline;text-decoration-color:var(--accent-d);text-underline-offset:4px}
/* 카드 리스트 */
.riar-list{display:flex;flex-direction:column;gap:16px}
/* 단일 카드 행 */
.riar-row{position:relative;background:#fff;border-radius:20px;padding:20px 20px 20px 20px;box-shadow:0 4px 18px -6px rgba(0,0,0,.14);display:flex;align-items:center;gap:0;min-height:92px}
/* 아이콘 영역 — 카드 밖 약간 돌출(홀수=좌, 짝수=우) */
.riar-icon-wrap{flex-shrink:0;width:80px;height:80px;display:flex;align-items:center;justify-content:center}
.riar-icon-wrap.left{margin-left:-12px;margin-right:8px}
.riar-icon-wrap.right{margin-right:-12px;margin-left:8px;order:2}
/* 이미지 아이콘 (3D PNG) */
.riar-icon-img{width:76px;height:76px;object-fit:contain;display:block;filter:drop-shadow(0 6px 10px rgba(0,0,0,.18))}
/* 라인 아이콘 폴백 */
.riar-icon-svg{width:44px;height:44px;color:var(--accent-d)}
.riar-icon-svg svg{width:100%;height:100%}
/* 텍스트 */
.riar-text{flex:1;min-width:0}
.riar-text.right-align{text-align:right}
.riar-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(15px,3.6vw,18px);line-height:1.35;color:var(--accent-d);margin-bottom:5px}
.riar-heading .em{color:var(--accent-d)}
.riar-body{font-family:var(--font-body);font-size:clamp(13px,3.2vw,15px);line-height:1.6;color:var(--ink)}
/* 다크 배경 대비 보정 — .em override */
.riar .riar-title .em{color:var(--ink)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const bg = d.bgColor ? d.bgColor : 'var(--accent)'

    const rows = d.items
      .map((it, i) => {
        const isLeft = i % 2 === 0 // 0-based: 홀수행(1,3,5) = index 0,2,4 → 아이콘 왼쪽
        const iconHtml = it.iconImage
          ? `<img class="riar-icon-img" src="${esc(it.iconImage)}" alt="${esc(it.heading)} 아이콘">`
          : `<span class="riar-icon-svg">${icon(it.iconName ?? 'star')}</span>`

        const iconWrap = `<div class="riar-icon-wrap ${isLeft ? 'left' : 'right'}">${iconHtml}</div>`
        const textWrap = `<div class="riar-text${isLeft ? '' : ' right-align'}">
          <div class="riar-heading">${richSafe(it.heading)}</div>
          ${it.body ? `<div class="riar-body">${richSafe(it.body)}</div>` : ''}
        </div>`

        return `<div class="riar-row">${isLeft ? iconWrap + textWrap : textWrap + iconWrap}</div>`
      })
      .join('')

    return `
<section class="riar" style="background:${esc(bg)}">
  ${d.eyebrow ? `<div style="text-align:center"><span class="riar-eyebrow">${esc(d.eyebrow)}</span></div>` : ''}
  <h2 class="riar-title" style="text-align:center">${richSafe(d.title)}</h2>
  <div class="riar-list">${rows}</div>
</section>`
  },
})
