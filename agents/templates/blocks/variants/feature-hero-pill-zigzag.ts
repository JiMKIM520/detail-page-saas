/** FEATURE 아키타입: feature-hero-pill-zigzag.
 *  피그마 255_제품특징_17 구조 흡수 — 전폭 제품사진 다크 히어로(브랜드+상품명 오버레이) +
 *  하단 2~3행 교차 이미지·텍스트 블록 + 컬러 pill 번호 뱃지.
 *  홀수 행 = 이미지 왼쪽/텍스트 오른쪽, 짝수 행 = 텍스트 왼쪽/이미지 오른쪽.
 *  이미지 전무 시 텍스트 전용 세로 스택으로 강등 (noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const featureSchema = z.object({
  /** 브랜드명 (영문 라벨 — em 허용) */
  brand: z.string().min(1).optional(),
  /** 제품 핵심 가치 한 줄 (예: "언제나 최적의 온도 유지") */
  tagline: z.string().min(1).optional(),
  /** 히어로 상품명 (em,br 허용 — 대형 굵은 제목) */
  title: z.string().min(1),
  /** 히어로 서브 카피 (경량 — 소형 설명) */
  subtitle: z.string().optional(),
  /** 히어로 배경 전폭 제품 사진 */
  heroImage: z.string().optional(),
  /** 특징 행 (2~3행). 홀/짝 행 자동 교차 배치. */
  features: z
    .array(
      z.object({
        /** 특징 사진 (디테일 컷) */
        image: z.string().optional(),
        /** 특징 제목 (em,br 허용) */
        heading: z.string().min(1),
        /** 특징 설명 */
        body: z.string().min(1),
      }),
    )
    .min(2)
    .max(3),
})
type FnxaData = z.infer<typeof featureSchema>

export const featureHeroPillZigzag = defineBlock<FnxaData>({
  id: 'feature-hero-pill-zigzag',
  archetype: 'feature',
  styleTags: ['dark', 'editorial', 'zigzag', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '다크 전폭 제품사진 히어로(브랜드+상품명 오버레이) + 하단 2~3행 교차 이미지·텍스트 + 컬러 pill 번호 뱃지. 전자제품/생활용품처럼 제품 비주얼이 강한 카테고리에 적합. 홀수=이미지왼쪽, 짝수=이미지오른쪽. 이미지 없으면 텍스트 세로 스택으로 자동 강등.',
  schema: featureSchema,
  css: `
.fnxa{background:var(--bg);color:var(--ink);font-family:var(--font-body),'Pretendard',sans-serif}

/* ── 히어로 영역 ── */
.fnxa-hero{position:relative;width:100%;aspect-ratio:860/1376;background:var(--brand,#000);overflow:hidden}
.fnxa-hero-img{width:100%;height:100%;object-fit:cover;display:block}
.fnxa-hero-img.ph{display:none!important}
/* 히어로 이미지 부재 시 배경 강등: 브랜드 다크 + 그라데이션 */
.fnxa-hero.no-img{aspect-ratio:860/540;background:linear-gradient(160deg,var(--brand,#111) 0%,color-mix(in srgb,var(--brand,#111) 70%,var(--accent)) 100%)}
.fnxa-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.18) 0%,rgba(0,0,0,.55) 60%,rgba(0,0,0,.82) 100%)}
.fnxa-hero-copy{position:absolute;left:0;right:0;bottom:0;padding:0 var(--pad-x,56px) 48px;text-align:center}
.fnxa-brand{font-family:var(--font-display);font-weight:700;font-size:50px;color:#fff;letter-spacing:.06em;line-height:1;text-transform:uppercase}
.fnxa-brand .em{color:var(--em-dark,#FFF7EA)}
.fnxa-tagline{margin-top:12px;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:400;font-size:28px;color:rgba(255,255,255,.82);letter-spacing:-.01em}
.fnxa-title{margin-top:8px;font-family:var(--font-display);font-weight:700;font-size:72px;color:#fff;line-height:1.08;letter-spacing:-.02em}
.fnxa-title .em{color:var(--em-dark,#FFF7EA)}
.fnxa-subtitle{margin-top:16px;font-family:var(--font-body),'Pretendard',sans-serif;font-weight:300;font-size:28px;color:rgba(255,255,255,.7);letter-spacing:-.005em}

/* ── 특징 리스트 ── */
.fnxa-list{background:var(--bg)}
.fnxa-row{display:flex;align-items:stretch;min-height:350px}
.fnxa-row.rev{flex-direction:row-reverse}

/* 이미지 셀 */
.fnxa-img-cell{flex:0 0 50%;width:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper,#f5f5f5))}
.fnxa-img-cell img{width:100%;height:100%;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*20px))}
.fnxa-img-cell .ph{display:none!important}

/* 텍스트 셀 */
.fnxa-txt-cell{flex:1;display:flex;flex-direction:column;justify-content:center;padding:32px 36px;background:var(--paper,#fff)}
.fnxa-row.rev .fnxa-txt-cell{background:var(--bg)}

/* pill 번호 뱃지 */
.fnxa-pill{display:inline-flex;align-items:center;justify-content:center;min-width:90px;padding:7px 22px;border-radius:999px;background:var(--accent);font-family:var(--font-display);font-weight:700;font-size:22px;color:#fff;letter-spacing:.04em;margin-bottom:18px}

.fnxa-feat-heading{font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--ink);line-height:1.3;letter-spacing:-.01em}
.fnxa-feat-heading .em{color:var(--accent)}
.fnxa-feat-body{margin-top:12px;font-family:var(--font-body),'Pretendard',sans-serif;font-size:20px;font-weight:400;color:var(--ink-2);line-height:1.68}

/* ── 이미지 전무 강등: 텍스트 세로 스택 ── */
.fnxa-list.noimg .fnxa-row{flex-direction:column;min-height:unset}
.fnxa-list.noimg .fnxa-img-cell{display:none}
.fnxa-list.noimg .fnxa-txt-cell{padding:28px var(--pad-x,56px);background:var(--bg)}
.fnxa-list.noimg .fnxa-row:nth-child(even) .fnxa-txt-cell{background:var(--paper,#f9f9f9)}

/* em 스코프 오버라이드 — 다크 히어로 영역 */
.fnxa-hero .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const pad2 = (n: number) => String(n).padStart(2, '0')
    const hasHeroImg = typeof d.heroImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.heroImage.trim())
    const withImgs = d.features.every(
      (f) => typeof f.image === 'string' && /^(https?:\/\/|data:|\/)/.test(f.image.trim()),
    )

    const heroImgHtml = hasHeroImg
      ? `<img class="fnxa-hero-img" src="${d.heroImage!.trim()}" alt="${esc(d.title)}">`
      : `<div class="fnxa-hero-img ph" role="img" aria-label="${esc(d.title)}"></div>`

    const rows = d.features
      .map((f, i) => {
        const isRev = i % 2 === 1
        const label = `DETAIL ${pad2(i + 1)}`
        const imgCell = withImgs
          ? `<div class="fnxa-img-cell">${media(f.image, '', `특징 ${i + 1} 이미지`)}</div>`
          : ''
        return `
    <div class="fnxa-row${isRev ? ' rev' : ''}">
      ${imgCell}
      <div class="fnxa-txt-cell">
        <span class="fnxa-pill">${esc(label)}</span>
        <h3 class="fnxa-feat-heading">${richSafe(f.heading)}</h3>
        <p class="fnxa-feat-body">${esc(f.body)}</p>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="fnxa">
  <div class="fnxa-hero${hasHeroImg ? '' : ' no-img'}">
    ${heroImgHtml}
    <div class="fnxa-hero-overlay"></div>
    <div class="fnxa-hero-copy">
      ${d.brand ? `<p class="fnxa-brand">${richSafe(d.brand)}</p>` : ''}
      ${d.tagline ? `<p class="fnxa-tagline">${esc(d.tagline)}</p>` : ''}
      <h2 class="fnxa-title">${richSafe(d.title)}</h2>
      ${d.subtitle ? `<p class="fnxa-subtitle">${esc(d.subtitle)}</p>` : ''}
    </div>
  </div>
  <div class="fnxa-list${withImgs ? '' : ' noimg'}">
    ${rows}
  </div>
</section>`
  },
})
