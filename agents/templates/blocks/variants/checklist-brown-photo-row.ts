/** CHECKLIST 아키타입: checklist-brown-photo-row.
 *  피그마 190_제품특징_11 흡수. 진한 갈색 배경 + 6행 [정사각 이미지 | 번호박스·제목·설명] 리스트
 *  + 하단 전체폭 사진 위 흰색 텍스트 오버레이. 다크 톤. noimg-safe 적용.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  image: z.string().optional(),          // 정사각 상세 사진 (url)
  label: z.string().min(1),             // 순번·타이틀 (예: "대용량 수납")
  text: z.string().min(1),              // 설명 (em/br 허용)
})

const schema = z.object({
  subtitle: z.string().optional(),       // 상단 서브타이틀 (예: "[ Happy tour carrier ]")
  title: z.string().min(1),             // 대형 헤드라인 (em/br 허용)
  caption: z.string().optional(),        // 헤드라인 아래 부제 한 줄
  items: z.array(itemSchema).min(2).max(6),
  photoImage: z.string().optional(),     // 하단 전체폭 사진 (url)
  photoTitle: z.string().optional(),     // 사진 위 대형 텍스트 (em/br 허용)
  photoSub: z.string().optional(),       // 사진 위 보조 텍스트
})

type Data = z.infer<typeof schema>

export const checklistBrownPhotoRow = defineBlock<Data>({
  id: 'checklist-brown-photo-row',
  archetype: 'checklist',
  styleTags: ['dark', 'warm', 'numbered', 'image-list', 'photo-footer', 'noimg-safe'],
  imageSlots: 7, // items 최대 6 + 하단 전체폭 1
  describe:
    '진한 갈색(brand) 배경 체크리스트. 중앙정렬 서브타이틀+대형 헤드라인+부제 → 2~6행 리스트(좌 정사각 이미지 + 우 흰색 번호박스·제목·설명, brand 필) → 하단 전체폭 사진 위 흰색 텍스트 오버레이. 이미지 없을 때 이미지 열 자동 생략(noimg-safe).',
  schema,
  css: `
/* ── 루트 래퍼 ── */
.cxdt{background:var(--brand);color:#fff;padding:0}
/* ── 타이틀 영역 ── */
.cxdt-hd{padding:60px var(--pad-x,56px) 40px;text-align:center}
.cxdt-sub{font-family:var(--font-display);font-size:18px;font-weight:400;color:rgba(255,255,255,.75);letter-spacing:.08em;margin-bottom:20px}
.cxdt-title{font-family:var(--font-display);font-size:clamp(36px,5.5vw,64px);font-weight:700;line-height:1.22;color:#fff}
.cxdt-title .em{color:var(--em-dark,#FFF7EA)}
.cxdt-cap{margin-top:18px;font-size:clamp(15px,2vw,20px);font-weight:400;color:rgba(255,255,255,.72);line-height:1.55}
/* ── 리스트 ── */
.cxdt-list{display:flex;flex-direction:column;gap:0;padding:0 var(--pad-x,56px) 0}
.cxdt-row{display:flex;align-items:stretch;background:color-mix(in srgb,var(--brand) 60%,#5c4633 40%);border-radius:calc(var(--r-scale,1)*10px);overflow:hidden;margin-bottom:8px}
/* 이미지 열 */
.cxdt-img-col{flex:0 0 auto;width:220px}
.cxdt-img-col .cxdt-thumb{width:220px;height:220px;object-fit:cover;display:block}
.cxdt-img-col .cxdt-thumb.ph{display:none!important}
/* 이미지 없을 때 텍스트 열이 전체폭 차지 */
.cxdt-row.no-img .cxdt-img-col{display:none}
.cxdt-row.no-img .cxdt-txt-col{padding:28px 32px}
/* 텍스트 열 */
.cxdt-txt-col{flex:1;padding:28px 32px 28px 28px;display:flex;flex-direction:column;justify-content:center;gap:0}
.cxdt-num-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.cxdt-num{width:38px;height:38px;border-radius:calc(var(--r-scale,1)*6px);background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cxdt-num span{font-family:var(--font-display);font-size:20px;font-weight:700;color:color-mix(in srgb,var(--brand) 60%,#5c4633 40%);line-height:1}
.cxdt-item-title{font-family:var(--font-display);font-size:clamp(17px,2.2vw,22px);font-weight:700;color:#fff;line-height:1.25}
.cxdt-item-text{font-size:clamp(14px,1.8vw,17px);font-weight:400;color:rgba(255,255,255,.82);line-height:1.65;margin-top:4px}
.cxdt-item-text .em{color:var(--em-dark,#FFF7EA);font-weight:600}
/* ── 하단 사진 오버레이 영역 ── */
.cxdt-photo-wrap{position:relative;width:100%;margin-top:0;overflow:hidden}
.cxdt-photo-frame{width:100%;aspect-ratio:860/480;border-radius:var(--shape-photo, 0px);overflow:hidden;background:color-mix(in srgb,var(--brand) 80%,#3a2a1c 20%)}
.cxdt-photo-frame img,.cxdt-photo-frame .ph{width:100%;height:100%;object-fit:cover;display:block}
.cxdt-photo-frame .ph{display:none!important}
.cxdt-photo-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px var(--pad-x,56px);gap:14px}
.cxdt-photo-line{width:min(480px,80%);height:1px;background:rgba(255,255,255,.4)}
.cxdt-photo-title{font-family:var(--font-display);font-size:clamp(24px,4vw,48px);font-weight:500;color:#fff;text-align:center;line-height:1.38}
.cxdt-photo-title .em{color:var(--em-dark,#FFF7EA)}
.cxdt-photo-sub{font-size:clamp(14px,1.8vw,20px);font-weight:400;color:rgba(255,255,255,.82);text-align:center;line-height:1.55}
.cxdt-photo-sub .em{color:var(--em-dark,#FFF7EA)}
/* 사진 영역 전체가 없을 때 하단 여백 보정 */
.cxdt-list:last-child{padding-bottom:56px}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 아이템 이미지가 하나라도 있으면 이미지 열을 그린다.
    // 전무 시 이미지 열을 완전히 생략하고 텍스트 열 전체폭 레이아웃으로 강등.
    const withImgs = d.items.some((it) => typeof it.image === 'string' && it.image.length > 0)

    const rows = d.items
      .map((item, i) => {
        const hasImg = withImgs && typeof item.image === 'string' && item.image.length > 0
        const imgCol = withImgs
          ? `<div class="cxdt-img-col">
          ${media(item.image, 'cxdt-thumb', esc(item.label))}
        </div>`
          : ''
        return `
      <div class="cxdt-row${withImgs ? '' : ' no-img'}">
        ${imgCol}
        <div class="cxdt-txt-col">
          <div class="cxdt-num-row">
            <div class="cxdt-num"><span>${i + 1}</span></div>
            <p class="cxdt-item-title">${esc(item.label)}</p>
          </div>
          <p class="cxdt-item-text">${richSafe(item.text)}</p>
        </div>
      </div>`
      })
      .join('')

    const hasPhoto = (d.photoTitle || d.photoSub) || (typeof d.photoImage === 'string' && d.photoImage.length > 0)
    const photoBlock = hasPhoto
      ? `
    <div class="cxdt-photo-wrap">
      <div class="cxdt-photo-frame">${media(d.photoImage, '', '제품 대표 사진')}</div>
      ${d.photoTitle || d.photoSub ? `
      <div class="cxdt-photo-text">
        ${d.photoTitle ? `<p class="cxdt-photo-title">${richSafe(d.photoTitle)}</p>` : ''}
        ${d.photoTitle && d.photoSub ? '<div class="cxdt-photo-line"></div>' : ''}
        ${d.photoSub ? `<p class="cxdt-photo-sub">${richSafe(d.photoSub)}</p>` : ''}
      </div>` : ''}
    </div>`
      : ''

    return `
<section class="cxdt">
  <div class="cxdt-hd">
    ${d.subtitle ? `<p class="cxdt-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="cxdt-title">${richSafe(d.title)}</h2>
    ${d.caption ? `<p class="cxdt-cap">${esc(d.caption)}</p>` : ''}
  </div>
  <div class="cxdt-list">
    ${rows}
  </div>
  ${photoBlock}
</section>`
  },
})
