/** POINT 아키타입(템플릿 충실 재현): point-promo-asymcard.
 *  [끝판왕] 포인트 구성 #2 패턴 — 비대칭 2열(tall 좌카드 + 우측 3-unit 스택) + floating burst 배지.
 *  시그니처: eyebrow 카피 + 대형 디스플레이 헤드라인 + 날짜 + 좌측 tall 사진카드(pill 라벨)
 *              + 우측 3-unit 스택(썸네일/라벨/프리뷰) + 우하단 burst 할인 배지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** eyebrow 한 줄 (예: "여름이니까 몰래하게 할인!") */
  eyebrow: z.string().min(1),
  /** 대형 디스플레이 헤드라인 (em 허용) */
  title: z.string().min(1),
  /** 날짜/기간 문자열 (예: "2025. 07월 01일 ~ 07월 31일") */
  dateRange: z.string().optional(),
  /** 좌측 tall 사진카드 */
  mainCard: z.object({
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** pill 라벨 텍스트 (예: "LUCKY SALE WEEK") */
    label: z.string().optional(),
  }),
  /** 우측 3-unit 스택 (최소 2, 최대 3) */
  stackItems: z
    .array(
      z.object({
        image: z.string().optional(),
        imageAlt: z.string().optional(),
        /** 유닛 라벨/캡션 (em 허용, 선택) */
        label: z.string().optional(),
      }),
    )
    .min(2)
    .max(3),
  /** burst 배지 수치 문자열 (예: "~75%") */
  burstValue: z.string().optional(),
  /** burst 배지 아래 작은 설명 (예: "최대 할인") */
  burstCaption: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointPromoAsymcard = defineBlock<Data>({
  id: 'point-promo-asymcard',
  archetype: 'point',
  styleTags: ['promo', 'gradient', 'asymmetric', 'commerce', 'sale', 'template'],
  imageSlots: 4,
  describe:
    '포인트 프로모 비대칭 카드. vivid 그라데이션 배경 + eyebrow + 대형 헤드라인 + 날짜 + 좌측 tall 사진카드(pill 라벨) + 우측 3-unit 스택 + 우하단 burst 할인 배지. 시즌 세일/기획전 임팩트 섹션.',
  schema,
  css: `
/* point-promo-asymcard — 접두사 ppa- */
.ppa{position:relative;padding:48px 28px 56px;background:linear-gradient(160deg,var(--accent) 0%,var(--brand) 100%);overflow:hidden;word-break:keep-all;overflow-wrap:break-word}
/* 배경 장식 오브 */
.ppa::before{content:'';position:absolute;top:-60px;right:-80px;width:320px;height:320px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none}
.ppa::after{content:'';position:absolute;bottom:-40px;left:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none}
/* 헤더 영역 */
.ppa-hd{position:relative;z-index:1;text-align:center;margin-bottom:24px}
.ppa-eyebrow{display:inline-block;font-family:var(--font-body),'Pretendard',sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,.82);letter-spacing:.06em;margin-bottom:8px}
.ppa-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,8vw,52px);line-height:1.12;letter-spacing:-.02em;color:#fff}
.ppa-title .em{color:#FFE566}
.ppa-date{margin-top:8px;font-size:12px;font-weight:500;color:rgba(255,255,255,.65);letter-spacing:.03em}
/* 2열 레이아웃 */
.ppa-grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
/* 좌: tall 메인 카드 */
.ppa-main{position:relative;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));overflow:hidden;box-shadow:0 12px 28px -8px rgba(0,0,0,.38)}
.ppa-main-img{width:100%;aspect-ratio:9/16;object-fit:cover;display:block}
.ppa-main-img.ph{width:100%;aspect-ratio:9/16;background:rgba(255,255,255,.14);border:2px dashed rgba(255,255,255,.30);color:rgba(255,255,255,.55);font-size:12px}
/* pill 라벨 (좌상단 오버레이) */
.ppa-pill{position:absolute;top:12px;left:12px;display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.56);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#fff;font-size:11px;font-weight:800;letter-spacing:.05em;padding:5px 10px;border-radius:999px}
.ppa-pill-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0}
/* 우: 스택 컬럼 */
.ppa-stack{display:flex;flex-direction:column;gap:10px}
.ppa-unit{border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));overflow:hidden;background:rgba(255,255,255,.12);box-shadow:0 6px 16px -6px rgba(0,0,0,.25)}
.ppa-unit-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.ppa-unit-img.ph{width:100%;aspect-ratio:4/3;background:rgba(255,255,255,.10);border:2px dashed rgba(255,255,255,.25);color:rgba(255,255,255,.50);font-size:11px}
.ppa-unit-label{padding:8px 12px;font-family:var(--font-body),'Pretendard',sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,.90);letter-spacing:.04em;line-height:1.3}
.ppa-unit-label .em{color:#FFE566}
/* placeholder 전용 유닛 (이미지 없고 라벨만) */
.ppa-unit.label-only{display:flex;align-items:center;justify-content:center;min-height:54px;padding:10px 12px;background:rgba(255,255,255,.16)}
.ppa-unit.label-only .ppa-unit-label{padding:0;font-size:12px}
/* burst 배지 — 우하단 floating */
.ppa-burst{position:absolute;right:22px;bottom:28px;z-index:2;width:72px;height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.ppa-burst-bg{position:absolute;inset:0;background:#1a2f3a;clip-path:polygon(50% 0%,58% 18%,78% 8%,72% 28%,93% 28%,80% 44%,95% 58%,76% 60%,80% 80%,61% 72%,54% 92%,44% 74%,26% 84%,30% 64%,10% 66%,22% 50%,5% 38%,26% 34%,18% 14%,38% 22%)}
.ppa-burst-val{position:relative;z-index:1;font-family:var(--font-display);font-weight:800;font-size:18px;line-height:1;color:#FFE566;letter-spacing:-.01em}
.ppa-burst-cap{position:relative;z-index:1;margin-top:2px;font-size:9px;font-weight:700;color:rgba(255,255,255,.80);letter-spacing:.03em}
`,
  render: (d, { esc, richSafe }) => {
    /* 좌 메인 카드 */
    const mainImg = media(d.mainCard.image, 'ppa-main-img', esc(d.mainCard.imageAlt ?? '메인 상품 이미지'))
    const pill = d.mainCard.label
      ? `<div class="ppa-pill"><span class="ppa-pill-dot"></span>${esc(d.mainCard.label)}</div>`
      : ''

    /* 우 스택 유닛 */
    const units = d.stackItems
      .map((u) => {
        const hasImg = !!u.image
        if (hasImg) {
          return `<div class="ppa-unit">
        ${media(u.image, 'ppa-unit-img', esc(u.imageAlt ?? '상품 이미지'))}
        ${u.label ? `<div class="ppa-unit-label">${richSafe(u.label)}</div>` : ''}
      </div>`
        }
        /* 이미지 없고 라벨만 있는 유닛 */
        return u.label
          ? `<div class="ppa-unit label-only"><div class="ppa-unit-label">${richSafe(u.label)}</div></div>`
          : `<div class="ppa-unit">${media(undefined, 'ppa-unit-img', esc(u.imageAlt ?? '상품 이미지'))}</div>`
      })
      .join('\n    ')

    /* burst 배지 */
    const burst =
      d.burstValue
        ? `<div class="ppa-burst">
      <div class="ppa-burst-bg"></div>
      <span class="ppa-burst-val">${esc(d.burstValue)}</span>
      ${d.burstCaption ? `<span class="ppa-burst-cap">${esc(d.burstCaption)}</span>` : ''}
    </div>`
        : ''

    return `<section class="ppa">
  <div class="ppa-hd">
    <div class="ppa-eyebrow">${esc(d.eyebrow)}</div>
    <h2 class="ppa-title">${richSafe(d.title)}</h2>
    ${d.dateRange ? `<div class="ppa-date">${esc(d.dateRange)}</div>` : ''}
  </div>
  <div class="ppa-grid">
    <div class="ppa-main">
      ${mainImg}
      ${pill}
    </div>
    <div class="ppa-stack">
      ${units}
    </div>
  </div>
  ${burst}
</section>`
  },
})
