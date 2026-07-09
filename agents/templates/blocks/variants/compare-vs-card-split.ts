/** COMPARE 아키타입: compare-vs-card-split
 *  좌(회색 라운드 카드·타사)·우(브랜드 라운드 카드·자사) 나란히 배치,
 *  경계 중앙에 원형 VS 배지가 오버랩되는 비포애프터 대비 구성.
 *  상단 타이틀 + 설명 + 카드 내부 헤더 라벨·사진·하단 캡션 슬롯.
 *  이미지 없어도 붕괴 없는 noimg-safe 강등(사진 프레임 대신 틴트 패널). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 대제목 (em,br 허용) */
  title: z.string().min(1),
  /** 대제목 아래 서브 설명 (순수 텍스트) */
  desc: z.string().optional(),
  /** 좌측 카드 (타사 / 비포) */
  before: z.object({
    /** 카드 상단 라벨 (예: "타사제품") */
    label: z.string().min(1),
    /** 사진 URL */
    image: z.string().optional(),
    /** 사진 아래 캡션 (em,br 허용) */
    caption: z.string().min(1),
  }),
  /** 우측 카드 (자사 / 애프터) */
  after: z.object({
    /** 카드 상단 라벨 (예: "자사제품") */
    label: z.string().min(1),
    /** 사진 URL */
    image: z.string().optional(),
    /** 사진 아래 캡션 (em,br 허용) */
    caption: z.string().min(1),
  }),
  /** VS 배지 텍스트 (기본 "VS") */
  badgeText: z.string().min(1).max(4).optional(),
})
type Data = z.infer<typeof schema>

export const compareVsCardSplit = defineBlock<Data>({
  id: 'compare-vs-card-split',
  archetype: 'compare',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '좌우 라운드 카드 VS 배지 오버랩 비교 블록. 회색 타사 카드(왼)·브랜드색 자사 카드(오른) 나란히, 경계 중앙 원형 VS 배지 오버랩. 상단 대제목+설명, 카드 내 헤더 라벨·사진·하단 캡션.',
  schema,
  css: `
.chvp{position:relative;padding:54px var(--pad-x,56px) 60px;background:var(--bg);color:var(--ink)}
.chvp-hd{margin-bottom:36px}
.chvp-title{font-size:36px;font-weight:700;font-family:var(--font-display);line-height:1.22;letter-spacing:-.02em;color:var(--ink)}
.chvp-title .em{color:var(--accent)}
.chvp-desc{margin-top:14px;font-size:17px;font-weight:500;line-height:1.7;color:var(--ink-2)}
.chvp-arena{position:relative;display:flex;gap:0;align-items:stretch}
.chvp-card{flex:1;border-radius:calc(var(--r-scale,1)*22px);overflow:hidden;display:flex;flex-direction:column}
.chvp-card--before{background:#dbdbdb}
.chvp-card--after{background:var(--accent)}
.chvp-card-hd{padding:18px 20px 16px;text-align:center}
.chvp-card-label{font-size:22px;font-weight:500;line-height:1.2}
.chvp-card--before .chvp-card-label{color:#5d5d5d}
.chvp-card--after .chvp-card-label{color:#ffffff;font-weight:700}
.chvp-photo{width:100%;aspect-ratio:360/500;object-fit:cover;display:block}
.chvp-photo-ph{width:100%;aspect-ratio:360/500;background:color-mix(in srgb,var(--accent) 14%,transparent);display:block}
.chvp-card--before .chvp-photo-ph{background:rgba(0,0,0,.08)}
.chvp-card-ft{padding:18px 20px 22px;text-align:center;flex:1;display:flex;align-items:center;justify-content:center}
.chvp-caption{font-size:18px;font-weight:500;line-height:1.6;color:#5d5d5d}
.chvp-card--after .chvp-caption{color:#ffffff;font-weight:600}
.chvp-caption .em{color:var(--accent-d)}
.chvp-card--after .chvp-caption .em{color:#FFF7EA}
.chvp-vs{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:10;width:72px;height:72px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,.22)}
.chvp-vs-text{color:#ffffff;font-size:24px;font-weight:500;font-family:var(--font-display);letter-spacing:.02em;line-height:1}
`,
  render: (d, { esc, richSafe }) => {
    const badge = d.badgeText ?? 'VS'
    const beforeImg = d.before.image
    const afterImg = d.after.image

    // noimg-safe: 이미지 없으면 틴트 패널로 강등 (높이 유지)
    const beforeMedia = (beforeImg && /^(https?:\/\/|data:|\/)/.test(beforeImg.trim()))
      ? `<img class="chvp-photo" src="${esc(beforeImg)}" alt="${esc(d.before.label)} 비교 사진">`
      : `<div class="chvp-photo-ph" role="img" aria-label="${esc(d.before.label)} 이미지 영역"></div>`

    const afterMedia = (afterImg && /^(https?:\/\/|data:|\/)/.test(afterImg.trim()))
      ? `<img class="chvp-photo" src="${esc(afterImg)}" alt="${esc(d.after.label)} 비교 사진">`
      : `<div class="chvp-photo-ph" role="img" aria-label="${esc(d.after.label)} 이미지 영역"></div>`

    return `
<section class="chvp">
  <div class="chvp-hd">
    <h2 class="disp chvp-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="chvp-desc">${esc(d.desc)}</p>` : ''}
  </div>
  <div class="chvp-arena">
    <div class="chvp-card chvp-card--before">
      <div class="chvp-card-hd">
        <span class="chvp-card-label">${esc(d.before.label)}</span>
      </div>
      ${beforeMedia}
      <div class="chvp-card-ft">
        <p class="chvp-caption">${richSafe(d.before.caption)}</p>
      </div>
    </div>
    <div class="chvp-vs" aria-hidden="true">
      <span class="chvp-vs-text">${esc(badge)}</span>
    </div>
    <div class="chvp-card chvp-card--after">
      <div class="chvp-card-hd">
        <span class="chvp-card-label">${esc(d.after.label)}</span>
      </div>
      ${afterMedia}
      <div class="chvp-card-ft">
        <p class="chvp-caption">${richSafe(d.after.caption)}</p>
      </div>
    </div>
  </div>
</section>`
  },
})
