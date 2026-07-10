/** AWARD 아키타입: award-serif-gold-decl — 세리프 골드 그라디언트 수상 선언 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 수상 기관명 + 수상명 한 줄 (예: "[제품] 전문 브랜드 중 국내유일 식약처장상 수상") — em 허용 */
  tagline: z.string().min(1),
  /** 대형 수상 기관 이름 (예: "식품의약품안전처") — em 허용 */
  authority: z.string().min(1),
  /** 수상 종류 (예: "처장상 수상") — em 허용 */
  awardTitle: z.string().min(1),
  /** 수상 부문 레이블 (예: "제품 안전 부문") */
  awardCategory: z.string().optional(),
  /** 배경 이미지 URL (전면 배치, 없으면 다크 배경으로 강등) */
  bgImage: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const awardSerifGoldDecl = defineBlock<Data>({
  id: 'award-serif-gold-decl',
  archetype: 'award',
  styleTags: ['dark', 'premium', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '배경 이미지 전면 위에 Nanum Myeongjo 세리프 + 골드 그라디언트 텍스트만으로 수상을 선언하는 미니멀 어워드 타이포 섹션. 상단 소형 수상 부연 → 중앙 대형 기관명/수상 타이틀 2단 → 하단 수상 부문 레이블. 배경 이미지 없으면 딥 다크 배경으로 안전 강등.',
  schema,
  css: `
.aqvp{position:relative;width:100%;min-height:600px;overflow:hidden;
  background:var(--brand);
  display:flex;flex-direction:column;justify-content:space-between;
  padding:56px var(--pad-x,56px) 64px}

/* 배경 이미지 */
.aqvp-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;display:block}
/* 스크림: 텍스트 가독성 보장 */
.aqvp-scrim{position:absolute;inset:0;z-index:1;
  background:linear-gradient(to bottom,
    rgba(10,6,2,.55) 0%,
    rgba(10,6,2,.30) 45%,
    rgba(10,6,2,.60) 100%)}

/* noimg 강등: 배경 없을 때 스크림 비활성 */
.aqvp.aqvp--noimg .aqvp-scrim{display:none}
.aqvp.aqvp--noimg{background:linear-gradient(160deg,#1a0f02 0%,#2e1a04 60%,#180d01 100%)}

/* 콘텐츠 레이어 */
.aqvp-top{position:relative;z-index:2}
.aqvp-mid{position:relative;z-index:2;flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:40px 0 20px}
.aqvp-bot{position:relative;z-index:2;text-align:center}

/* 골드 그라디언트 텍스트 공통 */
.aqvp-gold{
  background:linear-gradient(135deg,#C9A24A 0%,#F0D87A 38%,#E8C84C 55%,#B8862A 80%,#D4A840 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;color:transparent}

/* 상단 tagline */
.aqvp-tagline{font-family:var(--font-serif,'Nanum Myeongjo',serif);font-size:22px;font-weight:700;line-height:1.45;letter-spacing:.02em}
.aqvp-tagline .em{-webkit-text-fill-color:var(--em-dark,#FFF7EA);color:var(--em-dark,#FFF7EA)}

/* 중앙 대형 authority */
.aqvp-authority{font-family:var(--font-serif,'Nanum Myeongjo',serif);font-size:clamp(44px,8vw,76px);font-weight:800;line-height:1.15;letter-spacing:-.01em}
.aqvp-authority .em{-webkit-text-fill-color:var(--em-dark,#FFF7EA);color:var(--em-dark,#FFF7EA)}

/* 중앙 award 타이틀 */
.aqvp-award-title{font-family:var(--font-serif,'Nanum Myeongjo',serif);font-size:clamp(36px,6vw,62px);font-weight:800;line-height:1.2;margin-top:8px;letter-spacing:-.01em}
.aqvp-award-title .em{-webkit-text-fill-color:var(--em-dark,#FFF7EA);color:var(--em-dark,#FFF7EA)}

/* 하단 수상 부문 */
.aqvp-category{display:inline-block;font-family:var(--font-serif,'Nanum Myeongjo',serif);font-size:26px;font-weight:800;
  color:#4c2100;background:linear-gradient(135deg,#F0D87A 0%,#D4A840 100%);
  padding:10px 28px;border-radius:calc(var(--r-scale,1)*4px);letter-spacing:.04em}

/* 다크 영역 richSafe em 스코프 오버라이드 */
.aqvp .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = !!d.bgImage
    return `
<section class="aqvp${hasImg ? '' : ' aqvp--noimg'}">
  ${hasImg
    ? `<img class="aqvp-bg" src="${esc(d.bgImage)}" alt="" aria-hidden="true" loading="lazy">`
    : ''}
  ${hasImg ? '<div class="aqvp-scrim" aria-hidden="true"></div>' : ''}

  <div class="aqvp-top">
    <p class="aqvp-tagline aqvp-gold">${richSafe(d.tagline)}</p>
  </div>

  <div class="aqvp-mid">
    <h2 class="aqvp-authority aqvp-gold">${richSafe(d.authority)}</h2>
    <p class="aqvp-award-title aqvp-gold">${richSafe(d.awardTitle)}</p>
  </div>

  <div class="aqvp-bot">
    ${d.awardCategory ? `<span class="aqvp-category">${esc(d.awardCategory)}</span>` : ''}
  </div>
</section>`
  },
})
