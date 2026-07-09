/** FEATURE 아키타입: feature-highlight-caption.
 *  246_제품소개_25 패턴 재구성.
 *  구조: POINT 라벨 + 인라인 키워드 하이라이트 박스 대제목 + 보조 설명 +
 *        풀블리드 제품 사진 + 설명 텍스트 + 하단 컬러드 캡션 바 포함 보조 사진.
 *  핵심 장치: 키워드를 파란 배경박스로 인라인 감싸는 하이라이트 타이포 + 하단 캡션 바. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  pointLabel: z.string().min(1).optional(),   // 기본 "POINT 1" (순수 텍스트)
  headLine1: z.string().min(1),               // 첫 줄 — 일반 색 (em,br)
  headKeyword: z.string().min(1),             // 강조 키워드 — 파란 배경박스 인라인 삽입 (순수 텍스트)
  headLine2: z.string().optional(),           // 대제목 아래 보조 헤드라인 (em,br)
  heroImage: z.string().optional(),           // 풀블리드 제품 사진 (url)
  descTitle: z.string().min(1),              // 보조 사진 위 설명 제목 (em,br)
  descSub: z.string().optional(),             // 설명 부제 (순수 텍스트)
  subImage: z.string().optional(),            // 보조 사진 (url)
  captionBar: z.string().min(1),             // 보조 사진 하단 컬러 캡션 바 텍스트 (순수 텍스트)
})
type Data = z.infer<typeof schema>

export const featureHighlightCaption = defineBlock<Data>({
  id: 'feature-highlight-caption',
  archetype: 'feature',
  // noimg-safe: heroImage/subImage 모두 없을 때 사진 프레임을 숨겨 텍스트 중심 레이아웃으로 강등
  styleTags: ['light', 'product', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '제품 핵심 기능 강조 블록. POINT 라벨 + 키워드 파란 인라인 배경박스 대제목 + 풀블리드 제품 사진 + 설명 텍스트 + 하단 컬러드 캡션 바 포함 보조 사진. 단열·기술력 등 단일 기능을 임팩트 있게 전달.',
  schema,
  css: `
.flvu{background:var(--bg);color:var(--ink);padding-bottom:0}

/* ── POINT 라벨 ── */
.flvu-point{text-align:center;padding:54px var(--pad-x,56px) 0}
.flvu-point-lbl{display:inline-block;font-family:var(--font-display);font-weight:500;font-size:28px;color:var(--accent);letter-spacing:.06em;line-height:1}

/* ── 대제목 블록 ── */
.flvu-head{text-align:center;padding:20px var(--pad-x,56px) 0}
.flvu-h1{font-family:var(--font-display);font-weight:700;font-size:52px;line-height:1.18;color:var(--ink);letter-spacing:-.02em}
.flvu-h1 .em{color:var(--accent);font-weight:700}

/* 키워드 인라인 하이라이트 박스 */
.flvu-kw{display:inline;background:var(--accent);color:#ffffff;font-family:var(--font-display);font-weight:700;font-size:52px;line-height:1.22;letter-spacing:-.02em;padding:0 .18em;border-radius:calc(var(--r-scale,1)*6px)}

/* 보조 헤드라인 */
.flvu-h2{margin-top:14px;font-family:var(--font-display);font-weight:400;font-size:28px;line-height:1.45;color:var(--ink)}
.flvu-h2 .em{color:var(--accent);font-weight:600}

/* ── 풀블리드 제품 사진 ── */
.flvu-hero-wrap{margin-top:28px;width:100%;overflow:hidden}
.flvu-hero-img{width:100%;aspect-ratio:760/1000;object-fit:cover;display:block;background:color-mix(in srgb,var(--accent) 8%,transparent)}
/* 이미지 없을 때 강등: hero wrap 높이 0 + hidden */
.flvu-hero-wrap:has(.ph){display:none}

/* ── 설명 텍스트 영역 ── */
.flvu-desc{text-align:center;padding:40px var(--pad-x,56px) 0}
.flvu-desc-title{font-family:var(--font-display);font-weight:400;font-size:36px;line-height:1.4;color:var(--ink)}
.flvu-desc-title .em{color:var(--accent);font-weight:600}
.flvu-desc-sub{margin-top:8px;font-size:18px;font-weight:400;color:var(--ink-2);line-height:1.6}

/* ── 보조 사진 + 캡션 바 ── */
.flvu-sub-wrap{margin-top:24px;position:relative}
.flvu-sub-img{width:100%;aspect-ratio:760/560;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px) calc(var(--r-scale,1)*14px) 0 0);background:color-mix(in srgb,var(--accent) 6%,transparent)}
/* 이미지 없을 때 강등: 캡션만 남긴다 */
.flvu-sub-wrap:has(.ph) .flvu-sub-img{display:none}

/* 캡션 바 */
.flvu-caption{background:var(--accent);padding:0 var(--pad-x,56px);height:64px;display:flex;align-items:center;justify-content:center}
.flvu-caption-text{font-family:var(--font-display);font-weight:700;font-size:26px;color:#ffffff;text-align:center;letter-spacing:-.01em}
`,
  render: (d, { esc, richSafe }) => {
    const label = d.pointLabel ?? 'POINT 1'
    return `
<section class="flvu">
  <div class="flvu-point">
    <span class="flvu-point-lbl">${esc(label)}</span>
  </div>
  <div class="flvu-head">
    <p class="flvu-h1">${richSafe(d.headLine1)}<br><span class="flvu-kw">${esc(d.headKeyword)}</span></p>
    ${d.headLine2 ? `<p class="flvu-h2">${richSafe(d.headLine2)}</p>` : ''}
  </div>
  <div class="flvu-hero-wrap">
    ${media(d.heroImage, 'flvu-hero-img', '제품 사진')}
  </div>
  <div class="flvu-desc">
    <p class="flvu-desc-title">${richSafe(d.descTitle)}</p>
    ${d.descSub ? `<p class="flvu-desc-sub">${esc(d.descSub)}</p>` : ''}
  </div>
  <div class="flvu-sub-wrap">
    ${media(d.subImage, 'flvu-sub-img', '상세 사진')}
    <div class="flvu-caption">
      <span class="flvu-caption-text">${esc(d.captionBar)}</span>
    </div>
  </div>
</section>`
  },
})
