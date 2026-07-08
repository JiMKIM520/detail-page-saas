/** POINT 아키타입: feature-image-row-list.
 *  [끝판왕] 포인트 구성 #30 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 단일 파스텔 배경 + 상단 증정 오퍼 배너(대형 목업 이미지) + 하단 좌정사각이미지-우타이틀/설명 3행 반복(행 구분선). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 상단 오퍼 배너 아이캐처 텍스트 (em 허용, 예: "구매 시 <span class=\"em\">증정품</span> 증정") */
  offerLabel: z.string().min(1),
  /** 오퍼 배너 서브 카피 (선택, 예: "신제품 출시 기념 특별 이벤트") */
  offerSub: z.string().optional(),
  /** 오퍼 배너 대형 목업 이미지 URL */
  offerImage: z.string().optional(),
  /** 오퍼 이미지 alt */
  offerImageAlt: z.string().optional(),
  /** 포인트 행 반복 (2~4개) */
  items: z
    .array(
      z.object({
        /** 좌측 정사각 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 우측 굵은 제목 (em 허용) */
        heading: z.string().min(1),
        /** 우측 본문 설명 (em/br 허용, 선택) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureImageRowList = defineBlock<Data>({
  id: 'feature-image-row-list',
  archetype: 'point',
  styleTags: ['pastel', 'offer', 'row-list', 'commerce', 'template'],
  imageSlots: 4,
  describe:
    '포인트 구성(증정/혜택 강조). 파스텔 배경 + 상단 증정 오퍼 배너(아이캐처 텍스트 + 대형 목업 이미지) + 하단 좌정사각이미지-우제목/설명 행 반복(2~4행, 행 구분선). 증정·구성·혜택 포인트 강조에 최적.',
  schema,
  css: `
/* feature-image-row-list — 접두사 firl- */
.firl{background:var(--bg);padding:0 0 48px;word-break:keep-all;overflow-wrap:break-word}

/* ── 상단 오퍼 배너 ── */
.firl-banner{background:var(--paper);padding:32px 28px 0;text-align:center}
.firl-offer-label{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,4.8vw,28px);line-height:1.4;color:var(--ink);letter-spacing:-.01em;margin-bottom:4px}
.firl-offer-label .em{color:var(--accent-d)}
.firl-offer-sub{font-size:14px;color:var(--muted);line-height:1.6;margin-bottom:20px}
.firl-banner-img{width:100%;max-height:380px;object-fit:contain;display:block;margin:0 auto}
.firl-banner-img.ph{width:100%;height:280px;border:2px dashed var(--line);background:var(--bg);color:var(--muted);font-size:13px;display:flex;align-items:center;justify-content:center;border-radius:0}

/* ── 행 목록 ── */
.firl-list{padding:0 20px}
.firl-row{display:grid;grid-template-columns:88px 1fr;gap:16px;align-items:center;padding:20px 0}
.firl-row + .firl-row{border-top:1px solid var(--line)}
.firl-thumb{width:88px;height:88px;object-fit:cover;border-radius:calc(var(--r-scale,1)*8px);flex-shrink:0;display:block}
.firl-thumb.ph{width:88px;height:88px;border:2px dashed var(--line);background:var(--bg);color:var(--muted);font-size:12px;border-radius:calc(var(--r-scale,1)*8px);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.firl-text{}
.firl-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(16px,3.6vw,20px);line-height:1.4;color:var(--ink);margin-bottom:4px;letter-spacing:-.01em}
.firl-heading .em{color:var(--accent-d)}
.firl-body{font-size:13px;line-height:1.65;color:var(--muted)}
.firl-body .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const bannerImg = d.offerImage
      ? `<img class="firl-banner-img" src="${attr(d.offerImage)}" alt="${attr(d.offerImageAlt ?? '증정 이미지')}">`
      : `<div class="firl-banner-img ph">${esc(d.offerImageAlt ?? '증정 이미지')}</div>`

    const rows = d.items
      .map((it) => {
        const thumb = it.image
          ? `<img class="firl-thumb" src="${attr(it.image)}" alt="${attr(it.imageAlt ?? '')}">`
          : `<div class="firl-thumb ph">${esc(it.imageAlt ?? '이미지')}</div>`
        return `
    <div class="firl-row">
      ${thumb}
      <div class="firl-text">
        <div class="firl-heading">${richSafe(it.heading)}</div>
        ${it.body ? `<div class="firl-body">${richSafe(it.body)}</div>` : ''}
      </div>
    </div>`
      })
      .join('')

    return `
<section class="firl">
  <div class="firl-banner">
    <div class="firl-offer-label">${richSafe(d.offerLabel)}</div>
    ${d.offerSub ? `<p class="firl-offer-sub">${esc(d.offerSub)}</p>` : ''}
    ${bannerImg}
  </div>
  <div class="firl-list">
    ${rows}
  </div>
</section>`
  },
})
