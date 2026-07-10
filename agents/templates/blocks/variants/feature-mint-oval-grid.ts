/** FEATURE 아키타입: feature-mint-oval-grid.
 *  피그마 069_제품소개_03 흡수 — 민트 배경 + 아이콘+소제목 상단 헤더, 다중 타원 BOOLEAN 마스크 클리핑
 *  제품 이미지 + 원형 인증 배지(우하단 오버랩), 하단 2×2 흰 라운드 카드 그리드(원형 아이콘 배경+설명).
 *  이미지 없을 때 이미지+배지 영역 은닉(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  icon: z.string().optional(),   // ICON_NAMES 35종 (생략 시 check)
  label: z.string().min(1),      // 카드 제목
  text: z.string().min(1),       // 카드 설명
})

const schema = z.object({
  eyebrow: z.string().optional(),    // 상단 소형 레이블 (예: "제품 소개")
  title: z.string().min(1),          // 소제목 — 2~3줄 (em,br 허용)
  headline: z.string().min(1),       // 대형 대제목 — 1~2줄 (em,br 허용)
  image: z.string().optional(),      // 제품 이미지 URL (타원 마스크 클리핑)
  badgeLine1: z.string().optional(), // 원형 인증 배지 1행 (기본 "인증")
  badgeLine2: z.string().optional(), // 원형 인증 배지 2행 (기본 "완료")
  badgeSub: z.string().optional(),   // 원형 인증 배지 서브 (기본 "테스트")
  cards: z.array(cardSchema).min(2).max(4),  // 2×2 기능 카드 (2~4개)
})
type Data = z.infer<typeof schema>

export const featureMintOvalGrid = defineBlock<Data>({
  id: 'feature-mint-oval-grid',
  archetype: 'feature',
  styleTags: ['light', 'mint', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '민트 배경 기능 소개 블록. 아이콘+소제목+대형 대제목 헤더 + 다중 타원 마스크로 클리핑한 제품 이미지(우하단 원형 인증 배지 오버랩) + 하단 2×2 흰 라운드 카드 그리드(원형 민트 배경 아이콘+라벨+설명). 펫/뷰티/생활용품 제품 소개 섹션에 적합. 이미지 없으면 이미지 영역 은닉.',
  schema,
  css: `
.fmog{background:var(--fmog-mint,#d4f1e8);color:var(--ink);padding:72px var(--pad-x,56px) 64px}
/* ── 헤더 ── */
.fmog-hd{text-align:center;margin-bottom:48px}
.fmog-eyebrow-row{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:18px}
.fmog-icon-wrap{color:var(--fmog-accent,#48ad8e)}
.fmog-icon-wrap svg{width:44px;height:36px;stroke:var(--fmog-accent,#48ad8e);fill:var(--fmog-accent,#48ad8e)}
.fmog-eyebrow{font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--fmog-accent,#48ad8e);letter-spacing:.04em}
.fmog-title{font-family:var(--font-display);font-weight:600;font-size:clamp(18px,2.4vw,24px);color:var(--fmog-accent,#48ad8e);line-height:1.35;letter-spacing:-.01em;margin-bottom:10px}
.fmog-title .em{color:var(--fmog-accent,#48ad8e)}
.fmog-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(44px,7vw,100px);color:var(--fmog-accent,#48ad8e);line-height:1.05;letter-spacing:-.03em}
.fmog-headline .em{color:var(--fmog-accent,#48ad8e)}
/* ── 이미지 영역 ── */
.fmog-photo-wrap{position:relative;width:666px;max-width:100%;margin:0 auto 48px;aspect-ratio:666/751}
.fmog-oval-mask{position:absolute;inset:0;overflow:hidden;pointer-events:none}
/* 두 타원을 SVG clipPath로 BOOLEAN 교차 마스크 구현 */
.fmog-oval-mask svg{position:absolute;width:0;height:0}
.fmog-product-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  position:absolute;
  inset:0;
  clip-path:url(#fmog-clip);
  /* 이미지 없을 때 강등: .ph 클래스로 display:none 전환됨 */
  border-radius:var(--shape-photo, 42% 58% 60% 40% / 45% 40% 60% 55%);
}
.fmog-product-img.ph{display:none!important}
/* 외곽선 장식 — 동일 형태를 약간 오프셋해 테두리 효과 */
.fmog-oval-outline{
  position:absolute;inset:0;
  border:3px solid var(--fmog-accent,#48ad8e);
  border-radius:var(--shape-photo, 40% 60% 58% 42% / 43% 38% 62% 57%);
  opacity:.4;
  pointer-events:none;
}
/* ── 인증 배지 ── */
.fmog-badge{
  position:absolute;right:0;bottom:0;
  width:200px;height:200px;
  border-radius:50%;
  background:var(--fmog-accent,#48ad8e);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
}
.fmog-badge-line{
  font-family:var(--font-display);font-weight:300;font-size:clamp(26px,4vw,40px);
  color:#fff;line-height:1.15;text-align:center;
}
.fmog-badge-sub{
  font-family:var(--font-display);font-weight:300;font-size:clamp(16px,2vw,20px);
  color:#fff;opacity:.9;margin-top:2px;
}
/* ── 이미지+배지 숨김 (noimg-safe) ── */
.fmog-photo-section{display:block}
.fmog-photo-section.fmog-hidden{display:none!important}
/* ── 카드 그리드 ── */
.fmog-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:20px;
}
.fmog-card{
  background:#fff;
  border-radius:calc(var(--r-scale,1)*28px);
  padding:40px 32px 36px;
  display:flex;flex-direction:column;align-items:center;gap:14px;
  text-align:center;
}
.fmog-card-icon-bg{
  width:90px;height:90px;border-radius:50%;
  background:var(--fmog-mint,#d4f1e8);
  display:flex;align-items:center;justify-content:center;
  position:relative;flex-shrink:0;
}
.fmog-card-icon-bg svg{width:44px;height:44px;color:var(--fmog-accent,#48ad8e);stroke:var(--fmog-accent,#48ad8e)}
.fmog-card-label{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(20px,2.8vw,32px);color:var(--ink);line-height:1.2;
}
.fmog-card-text{
  font-size:clamp(14px,1.8vw,20px);font-weight:400;
  color:var(--ink-2);line-height:1.6;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const badgeLine1 = d.badgeLine1 ?? '인증'
    const badgeLine2 = d.badgeLine2 ?? '완료'
    const badgeSub   = d.badgeSub   ?? '테스트'

    // noimg-safe: 이미지 URL 없으면 이미지+배지 섹션 전체 은닉
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    const photoSection = `
<div class="fmog-photo-section${hasImg ? '' : ' fmog-hidden'}" aria-hidden="${hasImg ? 'false' : 'true'}">
  <div class="fmog-photo-wrap">
    <!-- SVG clipPath: 두 타원 BOOLEAN intersection으로 마스크 구현 -->
    <svg style="position:absolute;width:0;height:0" aria-hidden="true">
      <defs>
        <clipPath id="fmog-clip" clipPathUnits="objectBoundingBox">
          <!-- 타원 1: 상부 클리핑 -->
          <ellipse cx="0.5" cy="0.42" rx="0.5" ry="0.32"/>
          <!-- 타원 2: 하부 클리핑 — union 근사를 단일 ellipse로 표현 -->
          <ellipse cx="0.5" cy="0.64" rx="0.5" ry="0.36"/>
        </clipPath>
      </defs>
    </svg>
    <div class="fmog-oval-outline" aria-hidden="true"></div>
    ${media(d.image, 'fmog-product-img', '제품 이미지')}
    <div class="fmog-badge" aria-label="${esc(badgeLine1)} ${esc(badgeLine2)} ${esc(badgeSub)}">
      <span class="fmog-badge-line">${esc(badgeLine1)}</span>
      <span class="fmog-badge-line">${esc(badgeLine2)}</span>
      <span class="fmog-badge-sub">${esc(badgeSub)}</span>
    </div>
  </div>
</div>`

    const cards = d.cards.map(c => `
<div class="fmog-card">
  <div class="fmog-card-icon-bg" aria-hidden="true">${icon(c.icon ?? 'check')}</div>
  <div class="fmog-card-label">${esc(c.label)}</div>
  <p class="fmog-card-text">${esc(c.text)}</p>
</div>`).join('')

    return `
<section class="fmog">
  <div class="fmog-hd">
    ${d.eyebrow ? `<div class="fmog-eyebrow-row">
      <span class="fmog-icon-wrap" aria-hidden="true">${icon('leaf')}</span>
      <span class="fmog-eyebrow">${esc(d.eyebrow)}</span>
    </div>` : ''}
    <p class="fmog-title">${richSafe(d.title)}</p>
    <h2 class="fmog-headline">${richSafe(d.headline)}</h2>
  </div>
  ${photoSection}
  <div class="fmog-grid" role="list">
    ${d.cards.map(c => `
    <div class="fmog-card" role="listitem">
      <div class="fmog-card-icon-bg" aria-hidden="true">${icon(c.icon ?? 'check')}</div>
      <div class="fmog-card-label">${esc(c.label)}</div>
      <p class="fmog-card-text">${esc(c.text)}</p>
    </div>`).join('')}
  </div>
</section>`
  },
})
