/** BANNER 아키타입: banner-grand-mosaic
 *  오프라인 몰/매장 그랜드 오픈 공지 레이아웃.
 *  구조: 다크 전면 — 브랜드명(소제목) + GRAND OPEN 그라디언트 헤드라인 + 설명 카피
 *        → 와이드 가로 대표 이미지
 *        → 카테고리 텍스트 행(구분자 포함)
 *        → 하단 비대칭 이미지 모자이크 (좌: 2단 스택 / 우: 세로 풀하이트)
 *  원본: 044_포인트_구성_페이지_26 — 카피·이미지·브랜드 전부 슬롯으로 재구성(클론 금지). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드명 또는 공지 소제목 (em 허용) */
  brandLine: z.string().min(1),
  /** 대형 헤드라인 상단 라인 (em 허용) — ex. "GRAND OPEN" */
  headlineTop: z.string().min(1),
  /** 대형 헤드라인 하단 라인 — optional 두 번째 줄 (em 허용) */
  headlineBottom: z.string().optional(),
  /** 설명 카피 (em/br 허용) */
  desc: z.string().optional(),
  /** 와이드 대표 이미지 (url) */
  heroImage: z.string().optional(),
  /** 카테고리 라벨 목록 (2~6개) */
  categories: z.array(z.string().min(1)).min(2).max(6),
  /** 좌측 상단 이미지 (url) — 모자이크 2단 스택 상단 */
  mosaicLeftTop: z.string().optional(),
  /** 좌측 하단 이미지 (url) — 모자이크 2단 스택 하단 */
  mosaicLeftBottom: z.string().optional(),
  /** 우측 세로 이미지 (url) — 모자이크 풀하이트 */
  mosaicRight: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const bannerGrandMosaic = defineBlock<Data>({
  id: 'banner-grand-mosaic',
  archetype: 'banner',
  styleTags: ['dark', 'editorial', 'grand-open', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '오프라인 매장/팝업스토어 그랜드 오픈 공지 배너. 다크 배경 + 그라디언트 대형 헤드라인(GRAND OPEN 류) + 브랜드 소제목 + 설명 카피 → 와이드 대표 이미지 → 카테고리 텍스트 행 → 하단 3컷 비대칭 이미지 모자이크(좌 2단 스택 + 우 세로 풀하이트). 이미지 없을 때 모자이크 영역 강등.',
  schema,
  css: `
/* ── banner-grand-mosaic (brgb) ──────────────────────────────── */
.brgb{background:#111;color:#fff;padding:0;font-family:var(--font-body),'Pretendard',sans-serif}

/* 다크 영역 em 오버라이드 */
.brgb .em{color:var(--em-dark,#FFF7EA)}

/* ── 상단 텍스트 존 ─────────────────────────────────────────── */
.brgb-top{padding:54px var(--pad-x,56px) 36px;text-align:center}

.brgb-brand{font-size:15px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:20px}

.brgb-hl{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:clamp(64px,9.6vw,96px);line-height:.96;letter-spacing:-.04em;
  background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,.72) 38%,var(--accent,#c9a96e) 70%,var(--accent-d,#a0784a) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-fill-color:transparent;
  display:inline-block}

/* 그라디언트 텍스트 em 오버라이드 — clip 맥락에서는 -webkit-text-fill-color로 override 불가,
   em 대신 두 번째 줄(headlineBottom) 슬롯 사용 유도; em이 들어와도 시각 파손 없도록 span 색 재설정 */
.brgb-hl .em{-webkit-text-fill-color:var(--accent,#c9a96e);background:none}

.brgb-hl-bottom{display:block;margin-top:2px}

.brgb-desc{margin-top:22px;font-size:17px;font-weight:400;line-height:1.75;color:rgba(255,255,255,.78);max-width:540px;margin-left:auto;margin-right:auto}

/* ── 와이드 대표 이미지 ─────────────────────────────────────── */
.brgb-hero-wrap{padding:0 var(--pad-x,56px) 0;margin-top:0}
.brgb-hero-img{width:100%;aspect-ratio:740/280;object-fit:cover;
  border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px));display:block}
.brgb-hero-ph{width:100%;aspect-ratio:740/280;background:rgba(255,255,255,.06);
  border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px))}

/* ── 카테고리 행 ────────────────────────────────────────────── */
.brgb-cats{display:flex;align-items:center;justify-content:center;gap:0;
  padding:20px var(--pad-x,56px) 18px;flex-wrap:wrap}
.brgb-cat{font-size:14px;font-weight:400;letter-spacing:.1em;color:rgba(255,255,255,.7);text-transform:uppercase}
.brgb-sep{width:1px;height:12px;background:rgba(255,255,255,.25);margin:0 16px;flex-shrink:0}

/* ── 하단 비대칭 모자이크 ──────────────────────────────────── */
.brgb-mosaic{padding:0 var(--pad-x,56px) 52px;display:flex;gap:10px;align-items:stretch}

/* 좌: 2단 세로 스택 */
.brgb-col-left{flex:1;display:flex;flex-direction:column;gap:10px}
.brgb-ml-top,.brgb-ml-bot{flex:1;overflow:hidden;border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px));min-height:130px}
.brgb-ml-top img,.brgb-ml-top .ph,
.brgb-ml-bot img,.brgb-ml-bot .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}

/* 우: 세로 풀하이트 */
.brgb-col-right{flex:1;overflow:hidden;border-radius:var(--shape-photo,calc(var(--r-scale,1)*14px));min-height:280px}
.brgb-col-right img,.brgb-col-right .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}

/* noimg-safe: 모자이크 이미지가 전혀 없으면 모자이크 영역 자체를 접고 카테고리 행에 하단 패딩만 부여 */
.brgb-mosaic.brgb--noimg{display:none}
.brgb--noimg-pad{padding-bottom:40px}
`,
  render: (d, { esc, richSafe }) => {
    // 모자이크 이미지 존재 여부 판단
    const hasMosaic =
      (typeof d.mosaicLeftTop === 'string' && d.mosaicLeftTop.length > 0) ||
      (typeof d.mosaicLeftBottom === 'string' && d.mosaicLeftBottom.length > 0) ||
      (typeof d.mosaicRight === 'string' && d.mosaicRight.length > 0)

    // 대표 이미지 존재 여부
    const hasHero = typeof d.heroImage === 'string' && d.heroImage.length > 0

    // 카테고리 구분자 삽입
    const catHtml = d.categories
      .map((c, i) =>
        i === 0
          ? `<span class="brgb-cat">${esc(c)}</span>`
          : `<span class="brgb-sep" aria-hidden="true"></span><span class="brgb-cat">${esc(c)}</span>`,
      )
      .join('')

    return `
<section class="brgb">

  <!-- 상단 텍스트 존 -->
  <div class="brgb-top">
    <p class="brgb-brand">${richSafe(d.brandLine)}</p>
    <h2 class="brgb-hl">
      <span>${richSafe(d.headlineTop)}</span>${d.headlineBottom ? `<span class="brgb-hl-bottom">${richSafe(d.headlineBottom)}</span>` : ''}
    </h2>
    ${d.desc ? `<p class="brgb-desc">${richSafe(d.desc)}</p>` : ''}
  </div>

  <!-- 와이드 대표 이미지 -->
  <div class="brgb-hero-wrap">
    ${hasHero
      ? `<img class="brgb-hero-img" src="${d.heroImage}" alt="대표 이미지">`
      : `<div class="brgb-hero-ph"></div>`}
  </div>

  <!-- 카테고리 행 -->
  <div class="brgb-cats${!hasMosaic ? ' brgb--noimg-pad' : ''}">
    ${catHtml}
  </div>

  <!-- 하단 비대칭 이미지 모자이크 -->
  <div class="brgb-mosaic${!hasMosaic ? ' brgb--noimg' : ''}">
    <div class="brgb-col-left">
      <div class="brgb-ml-top">${media(d.mosaicLeftTop, '', '매장 이미지 1')}</div>
      <div class="brgb-ml-bot">${media(d.mosaicLeftBottom, '', '매장 이미지 2')}</div>
    </div>
    <div class="brgb-col-right">${media(d.mosaicRight, '', '매장 이미지 3')}</div>
  </div>

</section>`
  },
})
