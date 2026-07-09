/** HERO 아키타입: hero-cropmark-overlay
 *  샌들/패션 브랜드 인트로 패턴 재구성.
 *  구조: 브랜드 가로선 장식 바 → 2단 타이틀+서브카피 → 원형 크롭 메인 사진+베이지 캡션 바
 *        → 스크립트 워터마크 → 전폭 제2 사진+다크 텍스트 오버레이 → 베이지 배경 블록.
 *  핵심 장치: 원형 크롭(border-radius:50%) + 스크립트 폰트 워터마크 + 오버레이 패널.
 *  noimg-safe: 메인/오버레이 사진 부재 시 각 영역을 배경색 패널로 강등(레이아웃 붕괴 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드명 (라틴 영문). 가로선 사이에 표시. */
  brandName: z.string().min(1),
  /** 헤드라인 1행 — 일반 굵기 (em,br 허용) */
  titleLight: z.string().min(1),
  /** 헤드라인 2행 — 볼드 대형 (em,br 허용) */
  titleBold: z.string().min(1),
  /** 헤드라인 아래 서브카피 (최대 2줄 권장) */
  subCopy: z.string().optional(),
  /** 원형 크롭 메인 사진 URL */
  imageCircle: z.string().optional(),
  /** 원형 크롭 아래 캡션 바 텍스트 */
  caption: z.string().optional(),
  /** 스크립트 워터마크 텍스트 (브랜드 슬로건/영문) */
  watermark: z.string().optional(),
  /** 제2 패널 — 전폭 배경 사진 URL */
  imageOverlay: z.string().optional(),
  /** 오버레이 패널 — 영문 서브레이블 (작은 글씨) */
  overlayLabel: z.string().optional(),
  /** 오버레이 패널 — 한국어 대제목 (em,br 허용) */
  overlayTitle: z.string().min(1),
  /** 오버레이 패널 — 설명 본문 (em,br 허용) */
  overlayDesc: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const heroCropmarkOverlay = defineBlock<Data>({
  id: 'hero-cropmark-overlay',
  archetype: 'hero',
  styleTags: ['light', 'editorial', 'fashion', 'premium', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '샌들/패션 브랜드 인트로. 브랜드 가로선 장식 바 + 스케일 점프 2단 타이틀 + 원형 크롭 사진(베이지 캡션 바) + 스크립트 워터마크 + 전폭 오버레이 제2 패널 + 베이지 앵커 블록. 시즌 론칭·브랜드 첫인상에 적합.',
  schema,
  css: `
/* ── hgpk: hero-cropmark-overlay ── */
.hgpk{background:var(--bg);color:var(--ink);overflow:hidden;font-family:var(--font-body),'Pretendard',sans-serif}

/* 브랜드 바 */
.hgpk-brand{display:flex;align-items:center;gap:0;padding:28px var(--pad-x,56px) 0}
.hgpk-brand-line{flex:1;height:1px;background:var(--line)}
.hgpk-brand-name{font-family:var(--font-lat),'Cormorant Garamond',serif;font-weight:700;font-size:22px;color:var(--accent);letter-spacing:.12em;padding:0 18px;white-space:nowrap}

/* 타이틀 영역 */
.hgpk-title-wrap{padding:22px var(--pad-x,56px) 0}
.hgpk-title-light{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:400;font-size:32px;line-height:1.2;color:var(--accent)}
.hgpk-title-bold{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:800;font-size:52px;line-height:1.1;color:var(--accent);letter-spacing:-.02em}
.hgpk-subcopy{margin-top:14px;font-size:18px;font-weight:300;line-height:1.65;color:var(--accent);opacity:.85}

/* 원형 크롭 사진 영역 */
.hgpk-circle-wrap{margin:28px var(--pad-x,56px) 0;position:relative}
.hgpk-circle-frame{width:100%;aspect-ratio:1/1;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--paper))}
.hgpk-circle-frame img{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* noimg-safe: 이미지 없을 때 원형 패널로 강등 */
.hgpk-circle-frame .ph{display:block!important;width:100%;height:100%;background:color-mix(in srgb,var(--accent) 8%,var(--paper));border-radius:inherit}

/* 캡션 바 */
.hgpk-caption-bar{background:color-mix(in srgb,var(--accent) 60%,var(--bg));padding:14px 20px;text-align:center;margin-top:0}
.hgpk-caption-bar p{font-size:18px;font-weight:500;color:#fff;letter-spacing:.01em}

/* 스크립트 워터마크 */
.hgpk-watermark-wrap{position:relative;height:96px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.hgpk-watermark{font-family:var(--font-hand),'Gaegu',cursive;font-size:72px;font-weight:700;color:var(--accent);opacity:.22;white-space:nowrap;letter-spacing:.04em;line-height:1;pointer-events:none;user-select:none}

/* 오버레이 패널 (제2 사진 + 다크 텍스트) */
.hgpk-overlay{position:relative;margin:0 var(--pad-x,56px);border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));overflow:hidden;min-height:320px}
.hgpk-overlay-bg{position:absolute;inset:0;background:color-mix(in srgb,var(--brand) 90%,transparent)}
.hgpk-overlay-bg img{width:100%;height:100%;object-fit:cover;display:block}
/* noimg-safe: 이미지 없을 때 brand 색 패널로 강등 */
.hgpk-overlay-bg .ph{display:block!important;width:100%;height:100%;background:var(--brand)}
.hgpk-overlay-grad{position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.18) 100%)}
.hgpk-overlay-body{position:relative;z-index:1;padding:36px 32px 40px}
.hgpk-overlay .em{color:var(--em-dark,#FFF7EA)}
.hgpk-overlay-label{font-family:var(--font-lat),'Cormorant Garamond',serif;font-weight:700;font-size:18px;color:rgba(255,255,255,.7);letter-spacing:.12em;margin-bottom:8px}
.hgpk-overlay-title{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:600;font-size:36px;color:#fff;line-height:1.25;letter-spacing:-.01em}
.hgpk-overlay-desc{margin-top:14px;font-size:17px;font-weight:300;color:rgba(255,255,255,.82);line-height:1.7}

/* 하단 베이지 앵커 블록 */
.hgpk-anchor{background:color-mix(in srgb,var(--accent) 40%,var(--paper));height:48px;margin-top:0}
`,
  render: (d, { esc, richSafe }) => `
<section class="hgpk">

  <!-- 브랜드 가로선 바 -->
  <div class="hgpk-brand">
    <span class="hgpk-brand-line"></span>
    <span class="hgpk-brand-name">${esc(d.brandName)}</span>
    <span class="hgpk-brand-line"></span>
  </div>

  <!-- 2단 타이틀 + 서브카피 -->
  <div class="hgpk-title-wrap">
    <p class="hgpk-title-light">${richSafe(d.titleLight)}</p>
    <p class="hgpk-title-bold">${richSafe(d.titleBold)}</p>
    ${d.subCopy ? `<p class="hgpk-subcopy">${esc(d.subCopy)}</p>` : ''}
  </div>

  <!-- 원형 크롭 사진 -->
  <div class="hgpk-circle-wrap">
    <div class="hgpk-circle-frame">
      ${media(d.imageCircle, '', '메인 제품 사진')}
    </div>
  </div>

  <!-- 베이지 캡션 바 -->
  ${d.caption ? `<div class="hgpk-caption-bar"><p>${esc(d.caption)}</p></div>` : ''}

  <!-- 스크립트 워터마크 -->
  ${d.watermark ? `<div class="hgpk-watermark-wrap"><span class="hgpk-watermark">${esc(d.watermark)}</span></div>` : '<div style="height:32px"></div>'}

  <!-- 오버레이 제2 패널 -->
  <div class="hgpk-overlay">
    <div class="hgpk-overlay-bg">
      ${media(d.imageOverlay, '', '브랜드 오버레이 사진')}
    </div>
    <div class="hgpk-overlay-grad"></div>
    <div class="hgpk-overlay-body">
      ${d.overlayLabel ? `<p class="hgpk-overlay-label">${esc(d.overlayLabel)}</p>` : ''}
      <h2 class="hgpk-overlay-title">${richSafe(d.overlayTitle)}</h2>
      ${d.overlayDesc ? `<p class="hgpk-overlay-desc">${richSafe(d.overlayDesc)}</p>` : ''}
    </div>
  </div>

  <!-- 하단 베이지 앵커 블록 -->
  <div class="hgpk-anchor"></div>

</section>`,
})
