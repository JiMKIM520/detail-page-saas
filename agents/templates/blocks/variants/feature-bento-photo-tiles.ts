/** FEATURE 아키타입: feature-bento-photo-tiles.
 *  [끝판왕] 추천·B&A #20 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 히어로 사진 + 좌하단 대형 헤드라인(오버레이) → 2열 벤토 피처 타일 그리드.
 *  각 타일: 제품 사진 100% + 짙은 그라디언트 오버레이 + eyebrow(라벨) + 제목 + 본문 텍스트.
 *  복잡도: medium. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 히어로 eyebrow — 제품 카테고리 라벨 (예: "[회사명] 서큘레이터 선풍기") */
  eyebrow: z.string().min(1),
  /** 히어로 대형 헤드라인 (em/br 허용) */
  heroTitle: z.string().min(1),
  /** 히어로 보조 설명 (선택, em 허용) */
  heroBody: z.string().optional(),
  /** 히어로 사진 URL */
  heroImage: z.string().optional(),
  /** 히어로 사진 alt */
  heroImageAlt: z.string().optional(),
  /** 벤토 피처 타일 (3~4개). 각 타일 = 사진 + 라벨 + 제목 + 본문 */
  tiles: z
    .array(
      z.object({
        /** 타일 사진 URL */
        image: z.string().optional(),
        /** 타일 사진 alt */
        imageAlt: z.string().optional(),
        /** 타일 eyebrow 라벨 (예: "AI 기반 스마트 컨트롤") */
        label: z.string().min(1),
        /** 타일 제목 (em/br 허용) */
        title: z.string().min(1),
        /** 타일 본문 (선택, em 허용) */
        body: z.string().optional(),
        /** 타일이 그리드에서 2배 넓이를 차지할지 여부 (선택, 기본 false) */
        wide: z.boolean().optional(),
      }),
    )
    .min(3)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureBentoPhotoTiles = defineBlock<Data>({
  id: 'feature-bento-photo-tiles',
  archetype: 'feature' as any,
  styleTags: ['dark', 'bento', 'photo-overlay', 'premium', 'template'],
  imageSlots: 5,
  describe:
    '피처 벤토(사진 타일 그리드). 풀블리드 히어로 사진 + 좌하단 대형 헤드라인 오버레이 → 2열 벤토 피처 타일 3~4개(사진 위 다크 그라디언트+eyebrow 라벨+제목+본문). 제품 주요 기능 시각 전달.',
  schema,
  css: `
/* feature-bento-photo-tiles — 접두사 fbpt- */

/* 전체 섹션: 배경 var(--bg), 좁은 외부 패딩 */
.fbpt{
  background:var(--bg);
  padding:0 0 40px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* ── 히어로 블록 ── */
.fbpt-hero{
  position:relative;
  width:100%;
  aspect-ratio:3/4;
  overflow:hidden;
  background:var(--ink);
}
.fbpt-hero-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.fbpt-hero-img.ph{
  width:100%;
  height:100%;
  border:none;
  background:rgba(0,0,0,.25);
  color:rgba(255,255,255,.4);
  font-size:13px;
}
/* 하단 그라디언트 오버레이 */
.fbpt-hero-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.72) 80%,rgba(0,0,0,.88) 100%);
  pointer-events:none;
}
/* 히어로 텍스트 — 좌하단 정렬 */
.fbpt-hero-text{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  padding:0 28px 32px;
}
.fbpt-hero-eyebrow{
  display:inline-block;
  font-family:var(--font-body);
  font-size:11px;
  font-weight:600;
  letter-spacing:.08em;
  color:rgba(255,255,255,.75);
  background:rgba(255,255,255,.12);
  border:1px solid rgba(255,255,255,.22);
  border-radius:3px;
  padding:3px 10px;
  margin-bottom:14px;
}
.fbpt-hero-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,7vw,48px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:10px;
}
/* 다크 오버레이 위 — .em은 var(--accent)으로 override */
.fbpt-hero-title .em{color:var(--accent)}
.fbpt-hero-body{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.7;
  color:rgba(255,255,255,.72);
  letter-spacing:-.005em;
}
.fbpt-hero-body .em{color:var(--accent);font-weight:700}

/* ── 벤토 그리드 ── */
.fbpt-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:6px;
  padding:6px 6px 0;
}

/* 개별 타일 */
.fbpt-tile{
  position:relative;
  overflow:hidden;
  border-radius:8px;
  aspect-ratio:1/1;
  background:var(--ink);
  min-height:160px;
}
/* wide 타일: 2컬럼 전체 폭 */
.fbpt-tile.wide{
  grid-column:1 / -1;
  aspect-ratio:2/1;
}
/* 타일 이미지 */
.fbpt-tile-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  border-radius:8px;
}
.fbpt-tile-img.ph{
  width:100%;
  height:100%;
  border:none;
  border-radius:8px;
  background:rgba(0,0,0,.2);
  color:rgba(255,255,255,.35);
  font-size:11px;
}
/* 타일 그라디언트 오버레이 (상단~하단) */
.fbpt-tile-overlay{
  position:absolute;
  inset:0;
  border-radius:8px;
  background:linear-gradient(to bottom,rgba(0,0,0,.08) 0%,rgba(0,0,0,.58) 60%,rgba(0,0,0,.80) 100%);
  pointer-events:none;
}
/* 타일 텍스트 — 하단 정렬 */
.fbpt-tile-text{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  padding:0 14px 16px;
}
.fbpt-tile-label{
  display:block;
  font-family:var(--font-body);
  font-size:10px;
  font-weight:700;
  letter-spacing:.1em;
  color:var(--accent);
  text-transform:uppercase;
  margin-bottom:5px;
}
.fbpt-tile-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(14px,3.2vw,18px);
  line-height:1.32;
  letter-spacing:-.015em;
  color:#fff;
  margin-bottom:5px;
}
/* 다크 타일 위 — .em도 var(--accent) */
.fbpt-tile-title .em{color:var(--accent)}
.fbpt-tile-body{
  font-family:var(--font-body);
  font-size:12px;
  line-height:1.65;
  color:rgba(255,255,255,.68);
  letter-spacing:-.005em;
}
.fbpt-tile-body .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    // 히어로 섹션
    const heroImgHtml = media(
      d.heroImage,
      'fbpt-hero-img',
      esc(d.heroImageAlt ?? '제품 대표 이미지'),
    )

    // 벤토 타일
    const tilesHtml = d.tiles
      .map((tile) => {
        const tileImgHtml = media(
          tile.image,
          'fbpt-tile-img',
          esc(tile.imageAlt ?? tile.label),
        )
        const wideClass = tile.wide ? ' wide' : ''
        return `
    <div class="fbpt-tile${wideClass}">
      ${tileImgHtml}
      <div class="fbpt-tile-overlay"></div>
      <div class="fbpt-tile-text">
        <span class="fbpt-tile-label">${esc(tile.label)}</span>
        <p class="fbpt-tile-title">${richSafe(tile.title)}</p>
        ${tile.body ? `<p class="fbpt-tile-body">${richSafe(tile.body)}</p>` : ''}
      </div>
    </div>`
      })
      .join('')

    return `
<section class="fbpt">
  <div class="fbpt-hero">
    ${heroImgHtml}
    <div class="fbpt-hero-overlay"></div>
    <div class="fbpt-hero-text">
      <span class="fbpt-hero-eyebrow">${esc(d.eyebrow)}</span>
      <h2 class="fbpt-hero-title">${richSafe(d.heroTitle)}</h2>
      ${d.heroBody ? `<p class="fbpt-hero-body">${richSafe(d.heroBody)}</p>` : ''}
    </div>
  </div>
  <div class="fbpt-grid">
    ${tilesHtml}
  </div>
</section>`
  },
})
