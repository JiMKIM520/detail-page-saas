/** POINT 아키타입: point-stagger-pill
 *  원본: 237_문제제기_10.json (860px 상세페이지)
 *  구조: 상단 배경이미지+대형 문제 카피 → 3분할 라운드 사진 행 → 4개 알약 리스트(불규칙 들여쓰기 스태거드) → 라운드 이미지 → 하단 해결 카피
 *  핵심 장치: 알약(pill) 너비를 항목마다 다르게 설정해 들여쓰기 리듬을 만드는 스태거드 레이아웃.
 *  이미지 없이도 붕괴하지 않는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 배경이미지 위 헤드라인 (em/br 허용). 예: "선풍기 하나 쓰는데<br>왜 이렇게 번거로울까요?" */
  headline: z.string().min(1),
  /** 헤드라인 배경 이미지 URL (optional — 없으면 다크 그라데이션 폴백) */
  heroImage: z.string().optional(),
  /** 3분할 소형 라운드 사진 3장 (optional — 전체 있을 때만 렌더) */
  photo1: z.string().optional(),
  photo2: z.string().optional(),
  photo3: z.string().optional(),
  /** 문제 알약 리스트 (2~4개). icon은 ICON_NAMES 중 하나. */
  problems: z
    .array(
      z.object({
        icon: z.string().min(1),  // ICON_NAMES 35종
        text: z.string().min(1),  // 문제 한 줄 (em 허용)
      }),
    )
    .min(2)
    .max(4),
  /** 알약 아래 대표 이미지 (optional) */
  image: z.string().optional(),
  /** 하단 해결 카피 대제목 (em/br 허용). 예: "이런 고민은 이제 그만!" */
  resolve: z.string().min(1),
  /** 하단 해결 부카피 (em/br 허용). 예: "불편했던 선풍기 사용,<br>이제 접고 펼치면 끝입니다" */
  resolveSub: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 항목 인덱스별 알약 들여쓰기 패턴 (원본 4개 너비 비율 재현: 764→686→651→686 / 860px)
 *  인덱스 0=full, 1=indent-sm, 2=indent-md, 3=indent-sm (순환) */
const PILL_INDENT = ['0', '10%', '14%', '10%']
const PILL_WIDTH  = ['100%', '90%', '86%', '90%']

export const pointStaggerPill = defineBlock<Data>({
  id: 'point-stagger-pill',
  archetype: 'point',
  // noimg-safe: 사진/이미지 전무 시 텍스트 레이아웃으로 안전 강등
  styleTags: ['mixed', 'problem', 'stagger', 'editorial', 'noimg-safe'],
  imageSlots: 5, // heroImage + photo1~3 + image
  describe:
    '문제제기 스태거드 알약. 상단 배경이미지+대형 문제 헤드라인 → 3분할 라운드 사진 행 → 너비가 불규칙한 알약형 문제 리스트(2~4개, 스태거드 들여쓰기) → 라운드 이미지 → 해결 카피. 시각 리듬이 핵심.',
  schema,
  css: `
.psp{background:var(--bg);color:var(--ink);overflow:hidden}

/* ── 상단 히어로 ── */
.psp-hero{position:relative;width:100%;aspect-ratio:860/420;background:linear-gradient(160deg,color-mix(in srgb,var(--brand) 85%,#000) 0%,color-mix(in srgb,var(--accent-d) 70%,#000) 100%);overflow:hidden;display:flex;align-items:center;justify-content:center}
.psp-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
/* 스크림: 이미지 위 텍스트 가독성 확보 */
.psp-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.52) 0%,rgba(0,0,0,.35) 60%,rgba(0,0,0,.55) 100%);pointer-events:none}
.psp-hero-body{position:relative;z-index:1;text-align:center;padding:0 var(--pad-x,56px)}
.psp-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,5.5vw,64px);color:#ffffff;line-height:1.25;text-shadow:0 2px 16px rgba(0,0,0,.4)}
.psp-headline .em{color:var(--em-dark,#FFF7EA)}
/* 도트 장식 */
.psp-dot{display:flex;justify-content:center;gap:6px;margin-top:18px}
.psp-dot span{width:7px;height:7px;border-radius:50%;background:#ffffff;opacity:.7}
.psp-dot span:nth-child(2){opacity:.35}

/* ── 3분할 사진 행 ── */
.psp-photos{display:flex;gap:12px;padding:24px var(--pad-x,56px) 0}
.psp-ph-frame{flex:1;aspect-ratio:1/1;border-radius:var(--shape-photo, calc(var(--r-scale,1)*30px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
.psp-ph-frame img,.psp-ph-frame .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}

/* ── 알약 문제 리스트 ── */
.psp-list{padding:32px var(--pad-x,56px) 0;display:flex;flex-direction:column;gap:14px}
.psp-pill{display:flex;align-items:center;gap:14px;background:#ffffff;border-radius:999px;padding:16px 24px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.psp-pill-icon{flex:0 0 32px;width:32px;height:32px;color:var(--accent)}
.psp-pill-icon svg{width:100%;height:100%}
.psp-pill-text{font-family:var(--font-display);font-weight:700;font-size:clamp(15px,2.2vw,22px);color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.psp-pill-text .em{color:var(--accent)}

/* ── 대표 이미지 ── */
.psp-img-wrap{padding:32px var(--pad-x,56px) 0}
.psp-img{width:100%;aspect-ratio:860/500;border-radius:var(--shape-photo, calc(var(--r-scale,1)*24px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
.psp-img img,.psp-img .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}

/* ── 하단 해결 카피 ── */
.psp-resolve{padding:48px var(--pad-x,56px) 56px;text-align:center}
.psp-resolve-div{width:80px;height:3px;background:color-mix(in srgb,var(--accent) 30%,var(--line));border-radius:2px;margin:0 auto 28px}
.psp-resolve-big{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,4.5vw,52px);color:var(--ink);line-height:1.2}
.psp-resolve-big .em{color:var(--accent)}
.psp-resolve-sub{margin-top:18px;font-family:var(--font-display);font-weight:500;font-size:clamp(16px,2.8vw,32px);color:var(--ink-2);line-height:1.5}
.psp-resolve-sub .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 3분할 사진: 전부 있을 때만 렌더 (하나라도 빠지면 빈 프레임 노출 방지)
    const allPhotos =
      typeof d.photo1 === 'string' && d.photo1.length > 0 &&
      typeof d.photo2 === 'string' && d.photo2.length > 0 &&
      typeof d.photo3 === 'string' && d.photo3.length > 0

    const photosHtml = allPhotos
      ? `<div class="psp-photos">
  <div class="psp-ph-frame">${media(d.photo1, '', '제품 사진 1')}</div>
  <div class="psp-ph-frame">${media(d.photo2, '', '제품 사진 2')}</div>
  <div class="psp-ph-frame">${media(d.photo3, '', '제품 사진 3')}</div>
</div>`
      : ''

    // 대표 이미지
    const hasImage = typeof d.image === 'string' && d.image.length > 0
    const imageHtml = hasImage
      ? `<div class="psp-img-wrap"><div class="psp-img">${media(d.image, '', '제품 대표 이미지')}</div></div>`
      : ''

    // 알약 리스트 (스태거드 들여쓰기)
    const pillsHtml = d.problems
      .map(
        (p, i) => {
          const idx = i % 4
          return `<div class="psp-pill" style="width:${PILL_WIDTH[idx]};margin-left:${PILL_INDENT[idx]}">
  <span class="psp-pill-icon">${icon(p.icon)}</span>
  <span class="psp-pill-text">${richSafe(p.text)}</span>
</div>`
        },
      )
      .join('\n')

    return `<section class="psp">

  <!-- 히어로 배경이미지 + 대형 문제 헤드라인 -->
  <div class="psp-hero">
    ${d.heroImage ? `<img class="psp-hero-img" src="${esc(d.heroImage)}" alt="">` : ''}
    <div class="psp-hero-body">
      <h2 class="psp-headline">${richSafe(d.headline)}</h2>
      <div class="psp-dot"><span></span><span></span><span></span></div>
    </div>
  </div>

  <!-- 3분할 라운드 사진 행 -->
  ${photosHtml}

  <!-- 스태거드 알약 문제 리스트 -->
  <div class="psp-list">
    ${pillsHtml}
  </div>

  <!-- 대표 이미지 -->
  ${imageHtml}

  <!-- 하단 해결 카피 -->
  <div class="psp-resolve">
    <div class="psp-resolve-div"></div>
    <p class="psp-resolve-big">${richSafe(d.resolve)}</p>
    ${d.resolveSub ? `<p class="psp-resolve-sub">${richSafe(d.resolveSub)}</p>` : ''}
  </div>

</section>`
  },
})
