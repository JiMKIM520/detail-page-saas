/** FEATURE 아키타입: feature-hashtag-chip-zigzag.
 *  피그마 175_제품소개_13 흡수.
 *  구조: # 해시태그형 섹션 헤더(컬러 라벨 + 우측 수평선) + 대제목/부제 + 풀폭 히어로 이미지
 *        + 3행 지그재그 리스트 (순서번호 01/02/03 강조·소제목·설명·컬러필 키워드 칩).
 *  홀수행=이미지 왼쪽, 짝수행=이미지 오른쪽. noimg-safe: 전행 이미지 부재 시 텍스트 전용 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const featureItemSchema = z.object({
  image: z.string().optional(),          // (url) 썸네일 — 전체 없으면 텍스트 전용 강등
  name: z.string().min(1),               // 특징명 (순수 텍스트)
  desc: z.string().min(1),               // 설명 (em,br)
  chip: z.string().min(1),               // 키워드 칩 텍스트 (순수 텍스트)
})

const schema = z.object({
  sectionLabel: z.string().optional(),   // 해시태그 헤더 라벨 (기본: "# 제품소개")
  title: z.string().min(1),             // 섹션 대제목 (em,br)
  subtitle: z.string().optional(),       // 부제 (em,br)
  heroImage: z.string().optional(),      // (url) 풀폭 히어로 이미지
  items: z.array(featureItemSchema).min(2).max(5),
})
type Data = z.infer<typeof schema>

export const featureHashtagChipZigzag = defineBlock<Data>({
  id: 'feature-hashtag-chip-zigzag',
  archetype: 'feature',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '제품 특징 지그재그 블록. # 해시태그 스타일 섹션 헤더(컬러 텍스트+우측 수평선) + 대제목/부제 + 풀폭 히어로 이미지 + 2~5행 번호형(01/02/03) 지그재그 리스트(썸네일·특징명·설명·컬러필 라운드 키워드 칩). 홀수행 이미지 왼쪽, 짝수행 이미지 오른쪽. 이미지 전무 시 번호+텍스트 단열 강등.',
  schema,
  css: `
.fldg{background:var(--bg);color:var(--ink);padding-bottom:64px}

/* ── 섹션 헤더 (해시태그 + 우측 수평선) ── */
.fldg-hdr{display:flex;align-items:center;gap:16px;padding:48px var(--pad-x,56px) 0}
.fldg-hdr-lbl{font-family:var(--font-display);font-weight:600;font-size:28px;color:var(--accent);white-space:nowrap;flex-shrink:0}
.fldg-hdr-line{flex:1;height:1.5px;background:var(--line)}

/* ── 타이틀 블록 ── */
.fldg-ttl{padding:28px var(--pad-x,56px) 0}
.fldg-ttl h2{font-family:var(--font-display);font-weight:700;font-size:36px;line-height:1.25;color:var(--ink)}
.fldg-ttl h2 .em{color:var(--accent)}
.fldg-ttl p{margin-top:12px;font-size:18px;line-height:1.65;color:var(--ink-2)}
.fldg-ttl p .em{color:var(--accent);font-weight:700}

/* ── 풀폭 히어로 이미지 ── */
.fldg-hero{margin:32px 0 0;width:100%;aspect-ratio:860/480;overflow:hidden;background:color-mix(in srgb,var(--accent) 6%,var(--bg))}
.fldg-hero img{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0px)}
.fldg-hero .ph{display:none!important}

/* ── 지그재그 리스트 ── */
.fldg-list{margin-top:40px;display:flex;flex-direction:column;gap:0}
.fldg-row{display:flex;align-items:center;gap:0;padding:24px var(--pad-x,56px)}
.fldg-row.rev{flex-direction:row-reverse}

/* 썸네일 프레임 */
.fldg-thumb{flex:0 0 300px;width:300px}
.fldg-thumb-img{width:100%;aspect-ratio:300/400;overflow:hidden;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));background:color-mix(in srgb,var(--accent) 8%,var(--bg))}
.fldg-thumb-img img,.fldg-thumb-img .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.fldg-thumb-img .ph{display:none!important}

/* 텍스트 영역 */
.fldg-body{flex:1;padding:0 40px}
.fldg-row.rev .fldg-body{padding:0 0 0 40px}

/* 번호 + 특징명 한 줄 */
.fldg-num-row{display:flex;align-items:baseline;gap:10px;margin-bottom:10px}
.fldg-num{font-family:var(--font-display);font-weight:700;font-size:36px;color:var(--accent);line-height:1;flex-shrink:0}
.fldg-name{font-family:var(--font-display);font-weight:700;font-size:24px;color:var(--ink);line-height:1.2}

/* 설명 */
.fldg-desc{font-size:15px;line-height:1.75;color:var(--ink-2)}
.fldg-desc .em{color:var(--accent);font-weight:700}

/* 키워드 칩 */
.fldg-chip{display:inline-block;margin-top:16px;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:600;font-size:14px;padding:8px 18px;border-radius:999px;letter-spacing:.02em}

/* ── 노이미지 강등 (텍스트 전용 단열) ── */
.fldg-row--noimg{flex-direction:column;align-items:flex-start;padding:18px var(--pad-x,56px)}
.fldg-row--noimg .fldg-body{padding:0;flex:unset}
`,
  render: (d, { esc, richSafe }) => {
    const label = d.sectionLabel ?? '# 제품소개'
    const pad2 = (n: number) => String(n).padStart(2, '0')

    // noimg-safe: 전 행에 이미지가 있을 때만 지그재그 썸네일 레이아웃 사용.
    // 하나라도 빈 행이 있으면 썸네일 프레임 전체를 생략한 텍스트 단열로 강등.
    const withImgs = d.items.every((it) => typeof it.image === 'string' && it.image.length > 0)

    const heroHtml = d.heroImage
      ? `<div class="fldg-hero">${media(d.heroImage, '', '제품 대표 이미지')}</div>`
      : ''

    const rows = d.items
      .map((it, i) => {
        const isRev = i % 2 === 1
        if (withImgs) {
          return `
<div class="fldg-row${isRev ? ' rev' : ''}">
  <div class="fldg-thumb">
    <div class="fldg-thumb-img">${media(it.image, '', esc(it.name))}</div>
  </div>
  <div class="fldg-body">
    <div class="fldg-num-row">
      <span class="fldg-num">${pad2(i + 1)}.</span>
      <span class="fldg-name">${esc(it.name)}</span>
    </div>
    <p class="fldg-desc">${richSafe(it.desc)}</p>
    <span class="fldg-chip">${esc(it.chip)}</span>
  </div>
</div>`
        }
        // 이미지 없는 강등 레이아웃
        return `
<div class="fldg-row fldg-row--noimg">
  <div class="fldg-body">
    <div class="fldg-num-row">
      <span class="fldg-num">${pad2(i + 1)}.</span>
      <span class="fldg-name">${esc(it.name)}</span>
    </div>
    <p class="fldg-desc">${richSafe(it.desc)}</p>
    <span class="fldg-chip">${esc(it.chip)}</span>
  </div>
</div>`
      })
      .join('')

    return `
<section class="fldg">
  <div class="fldg-hdr">
    <span class="fldg-hdr-lbl">${esc(label)}</span>
    <span class="fldg-hdr-line"></span>
  </div>
  <div class="fldg-ttl">
    <h2>${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p>${richSafe(d.subtitle)}</p>` : ''}
  </div>
  ${heroHtml}
  <div class="fldg-list">${rows}</div>
</section>`
  },
})
