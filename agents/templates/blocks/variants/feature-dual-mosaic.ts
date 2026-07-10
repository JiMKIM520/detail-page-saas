/** FEATURE 아키타입: feature-dual-mosaic.
 *  피그마 157_추천_및_B_A_구성_페이지_19 흡수.
 *  전체 배경 이미지 위에 좌측 대형 2행 카드(tall, 넓은 열) + 우측 소형 4행 카드(짧은 열) 비대칭 모자이크 그리드.
 *  모든 카드는 이미지 위에 스크림 + 흰색 텍스트 오버레이. 다크 톤. noimg-safe 강등 지원. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// 좌측 대형 카드 (2개 고정)
const tallCardSchema = z.object({
  image: z.string().optional(),          // (url) 카드 배경 이미지
  title: z.string().min(1),              // (em,br) 카드 제목
  desc: z.string().optional(),           // 카드 설명
})

// 우측 소형 카드 (2~4개)
const wideCardSchema = z.object({
  image: z.string().optional(),          // (url) 카드 배경 이미지
  title: z.string().min(1),             // 소형 카드 제목 (em,br)
  desc: z.string().optional(),           // 소형 카드 설명
})

const schema = z.object({
  bgImage: z.string().optional(),        // (url) 전체 배경 이미지
  eyebrow: z.string().optional(),        // 상단 라벨 (예: 제품 카테고리)
  heading: z.string().min(1),           // 섹션 헤드라인 (em,br)
  subtext: z.string().optional(),        // 헤드라인 아래 한 줄 설명
  tallCards: z.array(tallCardSchema).min(2).max(2),   // 좌열 대형 카드 정확히 2개
  smallCards: z.array(wideCardSchema).min(2).max(4),  // 우열 소형 카드 2~4개
})
type Data = z.infer<typeof schema>

export const featureDualMosaic = defineBlock<Data>({
  id: 'feature-dual-mosaic',
  archetype: 'feature',
  // noimg-safe: 이미지 없을 때 스크림 패널만으로 구조 유지 (카드 형태 붕괴 없음)
  styleTags: ['dark', 'fullbleed', 'mosaic', 'editorial', 'noimg-safe'],
  imageSlots: 7,   // bgImage(1) + tallCards×2 + smallCards×4 최대
  describe:
    '다크 풀블리드 비대칭 모자이크. 전체 배경 이미지 위에 좌측 대형 2행(tall) × 우측 소형 2~4행 이미지 카드를 나란히 배치. 각 카드는 스크림+흰 텍스트 오버레이. 전자제품·뷰티·프리미엄 제품의 핵심 기능을 시각적으로 부각.',
  schema,
  css: `
.fviv{position:relative;padding:0;overflow:hidden;background:var(--brand)}
.fviv-bg{position:absolute;inset:0;z-index:0}
.fviv-bg img,.fviv-bg .ph{width:100%;height:100%;object-fit:cover;display:block}
.fviv-bg::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.52)}
.fviv-inner{position:relative;z-index:1;padding:54px var(--pad-x,56px) 60px}
.fviv-hd{margin-bottom:32px}
.fviv-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--em-dark,#FFF7EA);opacity:.72;margin-bottom:10px}
.fviv-heading{font-family:var(--font-display);font-weight:800;font-size:38px;line-height:1.22;color:#fff;letter-spacing:-.02em}
.fviv-heading .em{color:var(--em-dark,#FFF7EA)}
.fviv-sub{margin-top:10px;font-size:16px;color:rgba(255,255,255,.65);line-height:1.6}
/* 그리드: 좌열 flex:1.44(448비율) / 우열 flex:1(312비율) */
.fviv-grid{display:flex;gap:10px;align-items:stretch}
.fviv-col-tall{display:flex;flex-direction:column;gap:10px;flex:1.44}
.fviv-col-small{display:flex;flex-direction:column;gap:10px;flex:1}
/* 대형 카드 — 이미지 전체 침투 */
.fviv-card-tall{position:relative;overflow:hidden;border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px));min-height:260px;flex:1}
.fviv-card-tall img,.fviv-card-tall .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}
/* 스크림: 상단 텍스트 가독성 보장 */
.fviv-card-tall::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.62) 0%,rgba(0,0,0,.18) 55%,rgba(0,0,0,.04) 100%);border-radius:inherit;pointer-events:none}
.fviv-card-tall-body{position:relative;z-index:1;padding:20px 22px}
.fviv-card-tall-title{font-family:var(--font-display);font-weight:800;font-size:22px;line-height:1.3;color:#fff}
.fviv-card-tall-title .em{color:var(--em-dark,#FFF7EA)}
.fviv-card-tall-desc{margin-top:8px;font-size:14px;color:rgba(255,255,255,.8);line-height:1.6}
/* noimg 강등: 이미지 없으면 브랜드 틴트 패널 */
.fviv-card-tall.noimg-bg{background:linear-gradient(135deg,var(--accent-d) 0%,var(--brand) 100%)}
.fviv-card-tall.noimg-bg::after{background:rgba(0,0,0,.22)}
/* 소형 카드 */
.fviv-card-small{position:relative;overflow:hidden;border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px));min-height:120px;flex:1}
.fviv-card-small img,.fviv-card-small .ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}
.fviv-card-small::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.65) 0%,rgba(0,0,0,.15) 60%,rgba(0,0,0,.04) 100%);border-radius:inherit;pointer-events:none}
.fviv-card-small-body{position:relative;z-index:1;padding:14px 16px}
.fviv-card-small-title{font-family:var(--font-display);font-weight:700;font-size:16px;line-height:1.3;color:#fff}
.fviv-card-small-title .em{color:var(--em-dark,#FFF7EA)}
.fviv-card-small-desc{margin-top:5px;font-size:12px;color:rgba(255,255,255,.78);line-height:1.55}
.fviv-card-small.noimg-bg{background:linear-gradient(135deg,var(--accent-d) 0%,var(--brand) 100%)}
.fviv-card-small.noimg-bg::after{background:rgba(0,0,0,.22)}
/* 다크 영역 em 오버라이드 */
.fviv .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 카드별로 이미지 유무를 판단해 noimg-bg 클래스 부여 (전체 올오어낫싱 불필요)
    const tallCards = d.tallCards
      .map((c) => {
        const hasImg = typeof c.image === 'string' && /^(https?:\/\/|data:|\/)/.test(c.image.trim())
        return `
    <div class="fviv-card-tall${hasImg ? '' : ' noimg-bg'}">
      ${hasImg ? media(c.image, '', '특징 이미지') : ''}
      <div class="fviv-card-tall-body">
        <p class="fviv-card-tall-title">${richSafe(c.title)}</p>
        ${c.desc ? `<p class="fviv-card-tall-desc">${esc(c.desc)}</p>` : ''}
      </div>
    </div>`
      })
      .join('')

    const smallCards = d.smallCards
      .map((c) => {
        const hasImg = typeof c.image === 'string' && /^(https?:\/\/|data:|\/)/.test(c.image.trim())
        return `
    <div class="fviv-card-small${hasImg ? '' : ' noimg-bg'}">
      ${hasImg ? media(c.image, '', '기능 이미지') : ''}
      <div class="fviv-card-small-body">
        <p class="fviv-card-small-title">${richSafe(c.title)}</p>
        ${c.desc ? `<p class="fviv-card-small-desc">${esc(c.desc)}</p>` : ''}
      </div>
    </div>`
      })
      .join('')

    const hasBg = typeof d.bgImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.bgImage.trim())

    return `
<section class="fviv">
  <div class="fviv-bg">
    ${hasBg ? media(d.bgImage, '', '섹션 배경') : ''}
  </div>
  <div class="fviv-inner">
    <div class="fviv-hd">
      ${d.eyebrow ? `<span class="fviv-eyebrow">${esc(d.eyebrow)}</span>` : ''}
      <h2 class="fviv-heading">${richSafe(d.heading)}</h2>
      ${d.subtext ? `<p class="fviv-sub">${esc(d.subtext)}</p>` : ''}
    </div>
    <div class="fviv-grid">
      <div class="fviv-col-tall">
        ${tallCards}
      </div>
      <div class="fviv-col-small">
        ${smallCards}
      </div>
    </div>
  </div>
</section>`
  },
})
