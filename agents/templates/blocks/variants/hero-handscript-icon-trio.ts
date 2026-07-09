/** HERO 아키타입: hero-handscript-icon-trio
 *  출처: 041_인트로_06 (수제 딸기잼 히어로)
 *  구조: 상단 브랜드 pill 배지 → 핸드라이팅 대형 헤드라인 + 본문 + 구분선 → 해시태그 pill 행 →
 *        중앙 제품 이미지(우측 손글씨 장식 텍스트 + 화살표 SVG) → 하단 r=100 아이콘 pill 카드 3종.
 *  라이트 배경. 이미지 없이도 붕괴하지 않는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드/제품명 — 상단 pill 배지 */
  brand: z.string().min(1),
  /** 핸드라이팅 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 헤드라인 아래 본문 설명 (em, br 허용) */
  desc: z.string().optional(),
  /** 해시태그 pill 목록 (2~4개, '#' 포함) */
  tags: z.array(z.string().min(1)).min(2).max(4),
  /** 제품 메인 이미지 (url) */
  image: z.string().optional(),
  /** 이미지 우측 손글씨 장식 텍스트 (em, br 허용) — 브리프 근거 시만 */
  sideNote: z.string().optional(),
  /** 하단 아이콘 카드 3종 (이미지 or 아이콘 중 하나만 사용) */
  cards: z
    .array(
      z.object({
        /** 카드 아이콘 이미지 (url) — 없으면 iconName 폴백 */
        iconImage: z.string().optional(),
        /** 아이콘 이름 (iconImage 없을 때 사용, 기본 'check') */
        iconName: z.string().optional(),
        /** 카드 라벨 — 두 줄 가능 (br 허용) */
        label: z.string().min(1),
      }),
    )
    .min(3)
    .max(3),
})
type Data = z.infer<typeof schema>

export const heroHandscriptIconTrio = defineBlock<Data>({
  id: 'hero-handscript-icon-trio',
  archetype: 'hero',
  styleTags: ['light', 'food', 'playful', 'handwriting', 'noimg-safe'],
  imageSlots: 4, // 메인 1 + 카드 아이콘 최대 3
  describe:
    '라이트 히어로. 상단 브랜드 pill 배지 + 핸드라이팅 대형 헤드라인 + 해시태그 pill 행 + 중앙 제품 이미지(우측 손글씨 장식 텍스트+화살표) + 하단 r=100 아이콘 카드 3종. 수제/식품/건강 상품에 적합. 이미지 없이도 붕괴 없음.',
  schema,
  css: `
.humg{background:var(--bg);padding-bottom:0;text-align:center;overflow:hidden}

/* ── 브랜드 배지 ── */
.humg-brand{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:900;font-size:20px;letter-spacing:.04em;padding:10px 28px;border-radius:calc(var(--r-scale,1)*10px);margin:36px 0 0}

/* ── 텍스트 영역 ── */
.humg-text{padding:24px var(--pad-x,56px) 0}
.humg-title{font-family:var(--font-hand),'Cafe24 Dangdanghae',cursive;font-weight:400;font-size:clamp(52px,8vw,90px);line-height:1.15;color:var(--accent);letter-spacing:-.01em}
.humg-divider{width:600px;max-width:80%;height:1px;background:var(--line);margin:20px auto 0}
.humg-desc{margin-top:18px;font-size:18px;font-weight:500;line-height:1.65;color:var(--ink-2)}
.humg-desc .em{color:var(--accent);font-weight:700}

/* ── 해시태그 pill 행 ── */
.humg-tags{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:20px var(--pad-x,56px) 0}
.humg-tag{display:inline-flex;align-items:center;height:44px;padding:0 22px;border:2.5px solid var(--accent);border-radius:999px;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:900;font-size:16px;color:var(--accent);letter-spacing:.02em}

/* ── 사진 영역 ── */
.humg-photo-wrap{position:relative;display:flex;justify-content:center;align-items:flex-end;padding:28px var(--pad-x,56px) 0;min-height:200px}
.humg-photo-frame{position:relative;flex:0 0 auto;width:50%;max-width:430px}
.humg-photo{width:100%;aspect-ratio:430/627;border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px));object-fit:cover;display:block}
/* noimg-safe: 이미지 없으면 .ph가 display:none이 되어 자리를 차지하지 않음 → 사진 프레임 자체를 숨겨 사이드노트만 남기지 않음 */
.humg-photo-frame:has(.ph){display:none}

/* 우측 손글씨 장식 */
.humg-sidenote{position:absolute;right:var(--pad-x,56px);bottom:40px;max-width:200px;text-align:center;pointer-events:none}
.humg-sidenote-text{font-family:var(--font-hand),'Cafe24 Dangdanghae',cursive;font-size:22px;line-height:1.5;color:var(--ink)}
.humg-arrow{display:block;margin:6px auto 0;color:var(--accent)}
/* 이미지 없을 때 사이드노트도 숨김 (noimg-safe) */
.humg-photo-wrap:not(:has(.humg-photo-frame)){display:none}

/* ── 하단 아이콘 카드 3종 ── */
.humg-cards{display:flex;justify-content:center;gap:20px;padding:24px var(--pad-x,56px) 44px}
.humg-card{flex:1;max-width:220px;display:flex;flex-direction:column;align-items:center;background:var(--accent);border-radius:999px;padding:26px 16px 22px;gap:0}
.humg-card-icon{width:80px;height:80px;border-radius:calc(var(--r-scale,1)*12px);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.18)}
.humg-card-icon img{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.humg-card-icon .ph{display:none!important}
/* 아이콘 없으면 SVG 아이콘으로 폴백 */
.humg-card-icon-svg{width:80px;height:80px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
.humg-card-icon-svg svg{width:44px;height:44px}
.humg-card-label{margin-top:14px;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:700;font-size:20px;color:#fff;text-align:center;line-height:1.35;word-break:keep-all}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 화살표 SVG (원본 #d22525 벡터를 currentColor로 재작성)
    const arrowSvg = `<svg class="humg-arrow" width="44" height="46" viewBox="0 0 44 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 4C10 16 22 22 38 20" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 14l6 6-8 2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

    const cardHtml = d.cards
      .map((c) => {
        const hasImg =
          typeof c.iconImage === 'string' && /^(https?:\/\/|data:|\/)/.test(c.iconImage.trim())
        const iconBlock = hasImg
          ? `<div class="humg-card-icon">${media(c.iconImage, '', '카드 아이콘')}</div>`
          : `<div class="humg-card-icon-svg">${icon(c.iconName ?? 'check')}</div>`
        return `<div class="humg-card">${iconBlock}<div class="humg-card-label">${richSafe(c.label)}</div></div>`
      })
      .join('\n      ')

    const tagsHtml = d.tags
      .map((t) => `<span class="humg-tag">${esc(t)}</span>`)
      .join('\n      ')

    const hasImg =
      typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    return `
<section class="humg">
  <span class="humg-brand">${esc(d.brand)}</span>

  <div class="humg-text">
    <h2 class="humg-title">${richSafe(d.title)}</h2>
    <div class="humg-divider" aria-hidden="true"></div>
    ${d.desc ? `<p class="humg-desc">${richSafe(d.desc)}</p>` : ''}
  </div>

  <div class="humg-tags">
    ${tagsHtml}
  </div>

  ${
    hasImg
      ? `<div class="humg-photo-wrap">
    <div class="humg-photo-frame">
      <img class="humg-photo" src="${esc(d.image)}" alt="${esc(d.brand)} 제품 이미지">
    </div>
    ${
      d.sideNote
        ? `<div class="humg-sidenote">
      <span class="humg-sidenote-text">${richSafe(d.sideNote)}</span>
      ${arrowSvg}
    </div>`
        : ''
    }
  </div>`
      : ''
  }

  <div class="humg-cards">
    ${cardHtml}
  </div>
</section>`
  },
})
