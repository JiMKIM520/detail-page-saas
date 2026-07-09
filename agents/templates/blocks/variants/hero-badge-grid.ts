/** HERO 아키타입: hero-badge-grid
 *  피그마 075_인트로_34 구조 흡수.
 *  전면 이미지 위 상단 라운드 뱃지 + 2색 대제목(브랜드컬러/흰색 2행) + 하단 다크 배너에 4열 세로선 구분 아이콘 그리드.
 *  noimg-safe: 이미지 없으면 그라디언트 패널로 강등, 그리드 배너는 항상 노출. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 뱃지(라운드 필) 안 브랜드 부제 — 순수 텍스트 */
  badge: z.string().min(1),
  /** 2색 대제목 1행: 브랜드컬러로 렌더 (em/br 허용) */
  titleBrand: z.string().min(1),
  /** 2색 대제목 2행: 흰색으로 렌더 (em/br 허용) */
  titleWhite: z.string().min(1),
  /** 대제목 아래 서브 카피 (em/br 허용, optional) */
  tagline: z.string().optional(),
  /** 전면 배경 이미지 (url) */
  image: z.string().optional(),
  /** 하단 다크 배너 아이콘 그리드: 2~4개 */
  features: z
    .array(
      z.object({
        /** icon() 이름 (35종 중 하나) */
        icon: z.string().min(1),
        /** 아이콘 아래 키워드 레이블 (em/br 허용, 2줄 권장) */
        label: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroBadgeGrid = defineBlock<Data>({
  id: 'hero-badge-grid',
  archetype: 'hero',
  styleTags: ['dark', 'brand', 'food', 'baby', 'eco', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '전면 배경이미지 위 상단 라운드 뱃지+2색 대제목(브랜드컬러1행/흰색1행) 조합, 하단 다크 브랜드색 배너에 2~4열 세로선 구분 아이콘+키워드 그리드. 자연·베이비·식품계열 프리미엄 브랜드 인트로에 적합. 이미지 없으면 그라디언트 강등.',
  schema,
  css: `
/* ── hero-badge-grid (접두: hinu) ── */
.hinu{position:relative;width:100%;background:var(--brand)}
/* ── 이미지 영역 ── */
.hinu-img-wrap{position:relative;width:100%;aspect-ratio:860/1200;overflow:hidden;background:linear-gradient(175deg,color-mix(in srgb,var(--brand) 60%,#000) 0%,var(--brand) 100%)}
.hinu-img-wrap img,.hinu-img-wrap .ph{width:100%;height:100%;object-fit:cover;display:block}
.hinu-img-wrap::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.08) 0%,rgba(0,0,0,.22) 60%,rgba(0,0,0,.52) 100%);pointer-events:none}
/* ── 타이틀 영역 (이미지 위 절대 배치) ── */
.hinu-title-area{position:absolute;top:0;left:0;right:0;padding:52px var(--pad-x,56px) 0;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center}
/* 뱃지 — 라운드 필 */
.hinu-badge{display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.92);border-radius:999px;padding:10px 28px;margin-bottom:20px}
.hinu-badge-text{font-family:var(--font-body),'Pretendard',sans-serif;font-size:17px;font-weight:600;color:var(--brand);letter-spacing:.02em;white-space:nowrap}
/* 구분선 — 뱃지와 대제목 사이 */
.hinu-divider{width:calc(var(--r-scale,1)*0px + 100%);max-width:320px;height:1px;background:rgba(255,255,255,.28);margin:0 auto 20px}
/* 대제목 공통 */
.hinu-title-brand,.hinu-title-white{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:900;font-size:clamp(64px,9.5vw,108px);line-height:1.05;letter-spacing:-.02em;display:block}
.hinu-title-brand{color:var(--accent)}
.hinu-title-brand .em{color:var(--em-dark,#FFF7EA)}
.hinu-title-white{color:#ffffff}
.hinu-title-white .em{color:var(--accent)}
/* 서브 카피 */
.hinu-tagline{margin-top:16px;font-family:var(--font-body),'Pretendard',sans-serif;font-size:18px;font-weight:500;line-height:1.6;color:rgba(255,255,255,.88)}
.hinu-tagline .em{color:var(--accent);font-weight:700}
/* ── 하단 다크 배너 ── */
.hinu-banner{position:relative;z-index:2;width:100%;background:var(--brand);padding:32px var(--pad-x,56px) 40px}
.hinu-grid{display:grid;grid-template-columns:repeat(var(--hinu-cols,4),1fr);gap:0}
/* 세로 구분선 — 2번째 열부터 왼쪽 테두리 */
.hinu-cell{display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px 8px}
.hinu-cell+.hinu-cell{border-left:1px solid rgba(255,255,255,.22)}
/* 아이콘 */
.hinu-icon{width:48px;height:48px;color:#ffffff;flex-shrink:0}
.hinu-icon svg{width:100%;height:100%}
/* 키워드 레이블 */
.hinu-label{font-family:var(--font-body),'Pretendard',sans-serif;font-size:15px;font-weight:700;line-height:1.45;color:#ffffff;text-align:center;white-space:pre-line}
.hinu-label .em{color:var(--accent)}
/* ── 다크 섹션 em 오버라이드 — richSafe 강조색 ── */
.hinu .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const cols = d.features.length
    return `
<section class="hinu" style="--hinu-cols:${cols}">
  <div class="hinu-img-wrap">
    ${media(d.image, '', '제품 배경 이미지')}
    <div class="hinu-title-area">
      <div class="hinu-badge">
        <span class="hinu-badge-text">${esc(d.badge)}</span>
      </div>
      <div class="hinu-divider"></div>
      <span class="hinu-title-brand">${richSafe(d.titleBrand)}</span>
      <span class="hinu-title-white">${richSafe(d.titleWhite)}</span>
      ${d.tagline ? `<p class="hinu-tagline">${richSafe(d.tagline)}</p>` : ''}
    </div>
  </div>
  <div class="hinu-banner">
    <div class="hinu-grid">
      ${d.features
        .map(
          (f) => `
      <div class="hinu-cell">
        <span class="hinu-icon">${icon(f.icon)}</span>
        <span class="hinu-label">${richSafe(f.label)}</span>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`
  },
})
