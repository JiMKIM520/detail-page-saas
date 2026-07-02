/** LINEUP 아키타입(변형): package-event-price-rows.
 *  [끝판왕] 상품 구성 #1 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 섹션 헤더 + 흰 라운드 카드 안 상품 행 반복.
 *  각 행 = 썸네일 | 제품명 + 3단 가격표:
 *    정상가(취소선) / 할인가(취소선) / [이벤트가 pill + % 배지 + 최종가].
 *  기존 package-* 계열(2단)과 달리 이벤트 3단 + % 배지를 갖는 게 핵심 차별점. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const rowSchema = z.object({
  /** 제품 썸네일 이미지 URL (선택 — 없으면 placeholder) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 제품 이름 (em 허용) */
  name: z.string().min(1),
  /** 정상가 레이블 (기본 "정상가") */
  regularLabel: z.string().optional(),
  /** 정상가 수치 문자열 (취소선, 예: "399,999") */
  regularPrice: z.string().min(1),
  /** 할인가 레이블 (기본 "할인가") */
  discountLabel: z.string().optional(),
  /** 할인가 수치 문자열 (취소선, 예: "259,999") */
  discountPrice: z.string().min(1),
  /** 이벤트가 레이블 텍스트 (기본 "이벤트가") */
  eventLabel: z.string().optional(),
  /** 할인율 배지 텍스트 (예: "55%") */
  discountBadge: z.string().min(1),
  /** 최종 이벤트 가격 문자열 (예: "179,999") */
  eventPrice: z.string().min(1),
})

const schema = z.object({
  /** 섹션 상단 설명 문구 (선택) */
  eyebrow: z.string().optional(),
  /** 섹션 대제목 (em 허용) */
  title: z.string().min(1),
  /** 상품 행 목록 (1~6개) */
  items: z.array(rowSchema).min(1).max(6),
  /** 하단 주의사항/안내 문구 (선택, em 허용) */
  notice: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const packageEventPriceRows = defineBlock<Data>({
  id: 'package-event-price-rows',
  archetype: 'lineup',
  styleTags: ['dark', 'ecommerce', 'price', 'event', 'commerce', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성 이벤트 3단 가격표. 다크 섹션 헤더(eyebrow+대제목) + 흰 라운드 카드 안 상품 행 반복. 각 행: 썸네일 | 제품명 + [정상가 취소선 / 할인가 취소선 / 이벤트가 pill+%배지+최종가]. 기존 2단 package와 달리 % 배지·이벤트가 pill이 핵심.',
  schema,
  css: `
/* package-event-price-rows — 접두사 pepr- */
.pepr{background:var(--ink);padding:52px 32px 56px;word-break:keep-all}
/* 섹션 헤더 */
.pepr-hd{text-align:center;margin-bottom:28px}
.pepr-eyebrow{font-family:var(--font-body);font-size:15px;font-weight:500;color:rgba(255,255,255,.55);letter-spacing:.01em;margin-bottom:8px}
.pepr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6.5vw,38px);color:#fff;letter-spacing:-.02em;line-height:1.18}
.pepr-title .em{color:var(--accent)}
/* 카드 컨테이너 */
.pepr-card{background:#fff;border-radius:18px;overflow:hidden;padding:4px 0}
/* 개별 행 */
.pepr-row{display:grid;grid-template-columns:88px 1fr;gap:0;padding:18px 20px 18px 18px;align-items:center}
.pepr-row+.pepr-row{border-top:1px solid #EBEBEB}
/* 썸네일 */
.pepr-thumb{width:80px;height:80px;object-fit:cover;border-radius:8px;background:#F0F0F0}
.pepr-thumb.ph{width:80px;height:80px;border-radius:8px;background:#F0F0F0;border:none;color:#C0C0C0;font-size:11px;display:flex;align-items:center;justify-content:center}
/* 우측 텍스트 영역 */
.pepr-info{display:flex;flex-direction:column;gap:0;padding-left:14px}
.pepr-name{font-family:var(--font-display);font-weight:800;font-size:17px;color:var(--ink);line-height:1.28;margin-bottom:8px}
.pepr-name .em{color:var(--accent-d)}
/* 가격 그리드 — 3행: 정상가 / 할인가 / 이벤트가 pill행 */
.pepr-prices{display:grid;row-gap:4px}
/* 정상가·할인가 행 공통: 레이블(좌) + 수치(우) */
.pepr-prow{display:flex;justify-content:space-between;align-items:center}
.pepr-plabel{font-size:13px;color:#AAAAAA;font-weight:400}
.pepr-pval{font-size:13px;color:#BBBBBB;font-weight:400;text-decoration:line-through}
/* 이벤트가 pill 행 */
.pepr-event-row{display:flex;align-items:center;gap:6px;margin-top:6px}
/* 오렌지 이벤트가 pill */
.pepr-elabel{display:inline-flex;align-items:center;background:#FF6B00;color:#fff;font-size:13px;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:.01em;white-space:nowrap}
/* % 배지 — 짧은 직사각 pill */
.pepr-badge{display:inline-flex;align-items:center;background:#fff;border:1.5px solid #FF6B00;color:#FF6B00;font-size:13px;font-weight:700;padding:4px 9px;border-radius:6px;white-space:nowrap}
/* 최종 이벤트 가격 — 굵고 크게 */
.pepr-eprice{margin-left:auto;font-family:var(--font-display);font-weight:800;font-size:17px;color:var(--ink);letter-spacing:-.01em}
/* 하단 주의사항 */
.pepr-notice{margin-top:18px;font-size:12px;color:rgba(255,255,255,.40);text-align:center;line-height:1.6}
.pepr-notice .em{color:rgba(255,255,255,.65);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map((it) => {
        const thumb = it.image
          ? `<img class="pepr-thumb" src="${esc(it.image)}" alt="${esc(it.imageAlt ?? it.name)}">`
          : `<div class="pepr-thumb ph">${esc(it.imageAlt ?? '')}</div>`

        const regularLabel = esc(it.regularLabel ?? '정상가')
        const discountLabel = esc(it.discountLabel ?? '할인가')
        const eventLabel = esc(it.eventLabel ?? '이벤트가')

        return `
  <div class="pepr-row">
    ${thumb}
    <div class="pepr-info">
      <div class="pepr-name">${richSafe(it.name)}</div>
      <div class="pepr-prices">
        <div class="pepr-prow">
          <span class="pepr-plabel">${regularLabel}</span>
          <span class="pepr-pval">${esc(it.regularPrice)}</span>
        </div>
        <div class="pepr-prow">
          <span class="pepr-plabel">${discountLabel}</span>
          <span class="pepr-pval">${esc(it.discountPrice)}</span>
        </div>
        <div class="pepr-event-row">
          <span class="pepr-elabel">${eventLabel}</span>
          <span class="pepr-badge">${esc(it.discountBadge)}</span>
          <span class="pepr-eprice">${esc(it.eventPrice)}</span>
        </div>
      </div>
    </div>
  </div>`
      })
      .join('')

    return `
<section class="pepr">
  <div class="pepr-hd">
    ${d.eyebrow ? `<p class="pepr-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="pepr-title">${richSafe(d.title)}</h2>
  </div>
  <div class="pepr-card">
    ${rows}
  </div>
  ${d.notice ? `<p class="pepr-notice">${richSafe(d.notice)}</p>` : ''}
</section>`
  },
})
