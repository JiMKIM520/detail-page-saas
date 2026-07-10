/** HERO 아키타입: hero-pill-serif-zones
 *  피그마 240_인트로_45 구조 흡수 — 베이지 배경박스 상단(부제목+대제목+구분선+설명)+640px 이미지 중단,
 *  하단 pill 뱃지+Abhaya Libre 영문 세리프 대제목+한글 설명+760px 이미지 2단, 미니 세리프 레이블+
 *  클로저 카피로 마무리. 라이트 웜 톤. 이미지 부재 시 배경박스·이미지 프레임 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 배경박스 영역 */
  supertitle: z.string().min(1),        // 배경박스 상단 소제목 (순수 텍스트)
  title: z.string().min(1),             // 배경박스 메인 대제목 (em, br 허용)
  intro: z.string().min(1),             // 배경박스 설명 한 줄 (em, br 허용)

  /** 중단 대표 이미지 */
  imageMain: z.string().optional(),     // 640px 대표 이미지 url

  /** 중단 세리프 영역 */
  badgeLabel: z.string().min(1),        // pill 뱃지 텍스트 (순수 텍스트)
  serifTitle: z.string().min(1),        // 영문 세리프 대제목 (순수 텍스트 — Abhaya Libre)
  serifDesc: z.string().min(1),         // 세리프 아래 한글 설명 (em, br 허용)
  imageWide: z.string().optional(),     // 760px 하단 와이드 이미지 url

  /** 하단 클로저 */
  closerLabel: z.string().optional(),   // 작은 영문 세리프 레이블 (순수 텍스트)
  closerTitle: z.string().min(1),       // 클로저 대제목 (em, br 허용)
  closerSub: z.string().optional(),     // 클로저 부제 (em, br 허용)
})
type Data = z.infer<typeof schema>

export const heroPillSerifZones = defineBlock<Data>({
  id: 'hero-pill-serif-zones',
  archetype: 'hero',
  styleTags: ['light', 'warm', 'editorial', 'serif', 'fashion', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '베이지 배경박스+소제목·대제목·구분선·설명 상단 존, 640px 대표 이미지 중단, pill 뱃지+영문 Abhaya Libre 세리프 대제목+한글 설명+760px 이미지 하단 존, 영문 세리프 레이블+클로저 카피 마무리. 패션·라이프스타일 첫 화면 특화 웜 라이트 인트로.',
  schema,
  css: `
/* ── hero-pill-serif-zones (hpsz) ── */
.hpsz{background:var(--bg,#fff);color:var(--ink);font-family:var(--font-body)}

/* 상단 배경박스 존 */
.hpsz-topzone{background:color-mix(in srgb,var(--paper,#f0e9e3) 100%,transparent);padding:40px var(--pad-x,56px) 0;text-align:center}
.hpsz-supertitle{font-family:var(--font-body);font-weight:500;font-size:36px;line-height:1.2;color:color-mix(in srgb,var(--accent,#b19e86) 90%,var(--ink))}
.hpsz-title{font-family:var(--font-body);font-weight:800;font-size:54px;line-height:1.18;color:color-mix(in srgb,var(--accent-d,#836f57) 100%,transparent);margin-top:6px;word-break:keep-all}
.hpsz-title .em{color:var(--accent-d,#836f57)}
.hpsz-divider{width:60px;height:4px;background:color-mix(in srgb,var(--accent,#b19e86) 70%,transparent);border-radius:999px;margin:20px auto}
.hpsz-intro{font-family:var(--font-body);font-weight:300;font-size:24px;line-height:1.65;color:var(--ink);word-break:keep-all}
.hpsz-intro .em{color:var(--accent-d,#836f57);font-weight:600}

/* 중단 대표 이미지 */
.hpsz-topzone-img{background:color-mix(in srgb,var(--paper,#f0e9e3) 100%,transparent);padding-top:32px;display:flex;justify-content:center}
.hpsz-img-main{width:640px;max-width:100%;aspect-ratio:640/900;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));display:block}
.hpsz-img-main.ph{background:color-mix(in srgb,var(--accent,#b19e86) 18%,var(--paper,#f0e9e3));min-height:200px;display:block}

/* 세리프 존 */
.hpsz-serif-zone{padding:48px var(--pad-x,56px) 0;text-align:center}
.hpsz-badge-row{display:flex;justify-content:center;margin-bottom:20px}
.hpsz-badge{display:inline-flex;align-items:center;padding:10px 28px;background:color-mix(in srgb,var(--accent,#b19e86) 80%,transparent);border-radius:999px}
.hpsz-badge-text{font-family:var(--font-body);font-weight:500;font-size:24px;color:#fff;letter-spacing:.01em}
.hpsz-divider-thin{width:calc(100% - 2*var(--pad-x,56px));max-width:600px;height:1px;background:color-mix(in srgb,var(--line,#d9d9d9) 100%,transparent);margin:0 auto 24px}
.hpsz-serif-title{font-family:var(--font-serif,var(--font-lat,'Georgia'));font-weight:700;font-size:56px;line-height:1.12;color:color-mix(in srgb,var(--accent,#b19e86) 90%,transparent);letter-spacing:.01em;word-break:break-word}
.hpsz-serif-desc{font-family:var(--font-body);font-weight:300;font-size:24px;line-height:1.72;color:var(--ink);margin-top:18px;word-break:keep-all}
.hpsz-serif-desc .em{color:var(--accent-d,#836f57);font-weight:600}

/* 하단 와이드 이미지 */
.hpsz-img-wide-wrap{margin-top:32px;display:flex;justify-content:center;padding:0 var(--pad-x,56px)}
.hpsz-img-wide{width:760px;max-width:100%;aspect-ratio:760/1000;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));display:block}
.hpsz-img-wide.ph{background:color-mix(in srgb,var(--accent,#b19e86) 12%,var(--bg,#fff));min-height:160px;display:block}

/* 클로저 존 */
.hpsz-closer{padding:40px var(--pad-x,56px) 48px;text-align:center}
.hpsz-closer-label{font-family:var(--font-serif,var(--font-lat,'Georgia'));font-weight:700;font-size:44px;line-height:1.1;color:color-mix(in srgb,var(--accent,#b19e86) 85%,transparent);margin-bottom:16px}
.hpsz-closer-title{font-family:var(--font-body);font-weight:600;font-size:38px;line-height:1.42;color:var(--ink);word-break:keep-all}
.hpsz-closer-title .em{color:var(--accent-d,#836f57)}
.hpsz-closer-sub{font-family:var(--font-body);font-weight:300;font-size:24px;line-height:1.65;color:var(--ink-2,#555);margin-top:12px;word-break:keep-all}
.hpsz-closer-sub .em{color:var(--accent-d,#836f57);font-weight:500}

/* noimg-safe 강등: 이미지 없으면 배경박스 하단 패딩으로 볼륨 유지 */
.hpsz-topzone.no-img-main{padding-bottom:40px}
.hpsz-serif-zone.no-img-wide{padding-bottom:40px}
`,
  render: (d, { esc, richSafe }) => {
    const hasMain = typeof d.imageMain === 'string' && d.imageMain.length > 0
    const hasWide = typeof d.imageWide === 'string' && d.imageWide.length > 0

    return `
<section class="hpsz">

  <!-- 상단 배경박스 존 -->
  <div class="hpsz-topzone${hasMain ? '' : ' no-img-main'}">
    <p class="hpsz-supertitle">${esc(d.supertitle)}</p>
    <h2 class="hpsz-title">${richSafe(d.title)}</h2>
    <div class="hpsz-divider"></div>
    <p class="hpsz-intro">${richSafe(d.intro)}</p>
  </div>

  <!-- 중단 대표 이미지 -->
  ${hasMain
    ? `<div class="hpsz-topzone-img">
    ${media(d.imageMain, 'hpsz-img-main', '대표 제품 이미지')}
  </div>`
    : ''}

  <!-- 세리프 존 -->
  <div class="hpsz-serif-zone${hasWide ? '' : ' no-img-wide'}">
    <div class="hpsz-badge-row">
      <div class="hpsz-badge"><span class="hpsz-badge-text">${esc(d.badgeLabel)}</span></div>
    </div>
    <div class="hpsz-divider-thin"></div>
    <p class="hpsz-serif-title">${esc(d.serifTitle)}</p>
    <p class="hpsz-serif-desc">${richSafe(d.serifDesc)}</p>
  </div>

  <!-- 하단 와이드 이미지 -->
  ${hasWide
    ? `<div class="hpsz-img-wide-wrap">
    ${media(d.imageWide, 'hpsz-img-wide', '착용 컷 이미지')}
  </div>`
    : ''}

  <!-- 클로저 존 -->
  <div class="hpsz-closer">
    ${d.closerLabel ? `<p class="hpsz-closer-label">${esc(d.closerLabel)}</p>` : ''}
    <h3 class="hpsz-closer-title">${richSafe(d.closerTitle)}</h3>
    ${d.closerSub ? `<p class="hpsz-closer-sub">${richSafe(d.closerSub)}</p>` : ''}
  </div>

</section>`
  },
})
