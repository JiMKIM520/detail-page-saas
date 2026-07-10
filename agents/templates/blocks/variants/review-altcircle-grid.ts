/** REVIEW 아키타입: review-altcircle-grid
 *  피그마 300_후기_13 패턴 흡수.
 *  라이트 배경 + 영문 필 라벨 + 헤드라인 + 3×2 정방형 사진 그리드 + 4개 리뷰 카드.
 *  리뷰 카드의 원형 사진이 홀수=우측 / 짝수=좌측으로 교번 배치되어 시각 리듬을 형성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 스키마 ──────────────────────────────────────────────────────────────────

const reviewCardSchema = z.object({
  text: z.string().min(1),         // 리뷰 본문 (em 허용)
  stars: z.number().int().min(1).max(5).optional(), // 별점 (기본 5)
  nickname: z.string().optional(), // 닉네임 (예: abcd***)
  photo: z.string().optional(),    // 원형 프로필/후기 사진 (url)
})

const schema = z.object({
  label: z.string().optional(),       // 영문 라벨 텍스트 (기본 "real review")
  headline: z.string().min(1),        // 대형 헤드라인 (em,br 허용)
  subHeadline: z.string().optional(), // 헤드라인 아래 소제목 (순수 텍스트)
  gridPhotos: z.array(z.string()).min(1).max(6).optional(), // 3×2 그리드 이미지 url 배열 (1~6개)
  reviews: z.array(reviewCardSchema).min(2).max(4),        // 리뷰 카드 (2~4개)
})

type Data = z.infer<typeof schema>

// ── 헬퍼 ────────────────────────────────────────────────────────────────────

/** 별점 → 채워진/빈 ★ 마크업 (CSS로 색 제어) */
function renderStars(count: number): string {
  const filled = Math.max(0, Math.min(5, count))
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="rsjr-star${i < filled ? ' rsjr-star--on' : ''}" aria-hidden="true">★</span>`,
  ).join('')
}

// ── defineBlock ─────────────────────────────────────────────────────────────

export const reviewAltcircleGrid = defineBlock<Data>({
  id: 'review-altcircle-grid',
  archetype: 'review',
  // noimg-safe: 그리드 이미지 전무 시 그리드 섹션 자체를 생략. 카드 원형 사진 부재 시 빈 원 placeholder 표시 없이 텍스트 전용 레이아웃으로 강등.
  styleTags: ['light', 'template', 'social-proof', 'grid', 'editorial', 'noimg-safe'],
  imageSlots: 7, // 그리드 최대 6 + 카드 최대 4 (중복 카운트 방지 위해 대표값 7)
  describe:
    '고객 후기(교번 원형). 라이트 배경 + 영문 필 라벨 + 헤드라인 + 3×2 정방형 사진 그리드 + 4개 리뷰 카드(원형 썸네일 홀수=우 짝수=좌 교번 배치·별점·닉네임). 구매 전환용 사회적 증거 섹션.',
  schema,
  css: `
/* ── 섹션 래퍼 ───────────────────────────────────────────── */
.rsjr{background:var(--bg);color:var(--ink);padding:64px 0 72px}

/* ── 헤더 영역 ───────────────────────────────────────────── */
.rsjr-hd{padding:0 var(--pad-x,56px) 0;text-align:center}

/* 영문 라벨 필 버튼 */
.rsjr-label{
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-display);
  font-weight:500;
  font-size:22px;
  letter-spacing:.08em;
  padding:10px 32px;
  border-radius:calc(var(--r-scale,1)*999px);
  line-height:1.2;
}

/* 헤더 구분선 */
.rsjr-divider{
  display:block;
  width:320px;
  max-width:60%;
  height:2px;
  background:var(--line);
  margin:18px auto 0;
  opacity:.45;
}

/* 헤드라인 */
.rsjr-headline{
  margin-top:16px;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(32px,5vw,52px);
  line-height:1.25;
  color:var(--ink);
}
.rsjr-headline .em{color:var(--accent);font-weight:800}

/* 서브 헤드라인 */
.rsjr-sub{
  margin-top:10px;
  font-size:18px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.5;
}

/* ── 3×2 정방형 사진 그리드 ──────────────────────────────── */
.rsjr-grid{
  margin:40px var(--pad-x,56px) 0;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
}

.rsjr-grid-cell{
  aspect-ratio:1/1;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 8%,var(--paper));
}

.rsjr-grid-cell img,.rsjr-grid-cell .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:inherit;
  display:block;
}

/* 이미지 없을 때: 그리드 셀 자체를 틴트 패널로 (border 없이 조용하게) */
.rsjr-grid-cell .ph{
  display:block!important;
  background:color-mix(in srgb,var(--accent) 6%,var(--paper));
}

/* ── 리뷰 카드 리스트 ────────────────────────────────────── */
.rsjr-list{
  margin-top:28px;
  display:flex;
  flex-direction:column;
  gap:14px;
  padding:0 var(--pad-x,56px);
}

/* 개별 카드 */
.rsjr-card{
  display:flex;
  align-items:center;
  gap:20px;
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*24px);
  overflow:hidden;
  padding:22px 24px;
  box-shadow:0 4px 18px -8px rgba(0,0,0,.10);
}

/* 짝수 카드(0-indexed 1,3): 사진 왼쪽 배치 */
.rsjr-card--l{flex-direction:row}

/* 홀수 카드(0-indexed 0,2): 사진 오른쪽 배치 */
.rsjr-card--r{flex-direction:row-reverse}

/* 원형 사진 프레임 */
.rsjr-circle{
  flex:0 0 88px;
  width:88px;
  height:88px;
  border-radius:50%;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 10%,var(--paper));
  position:relative;
}

.rsjr-circle img,.rsjr-circle .ph{
  width:100%;
  height:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block;
  border-radius:0;
}

/* 사진 없을 때: 원 자체를 조용한 틴트로 (점선 박스 금지) */
.rsjr-circle .ph{
  display:block!important;
  background:color-mix(in srgb,var(--accent) 8%,var(--paper));
}

/* 텍스트 컨텐츠 영역 */
.rsjr-body{
  flex:1;
  min-width:0;
}

.rsjr-text{
  font-size:15px;
  font-weight:500;
  line-height:1.7;
  color:var(--ink);
  display:-webkit-box;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:3;
  overflow:hidden;
}
.rsjr-text .em{color:var(--accent);font-weight:700}

/* 별점 + 닉네임 행 */
.rsjr-meta{
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:9px;
}

.rsjr-stars{
  display:flex;
  align-items:center;
  gap:1px;
  line-height:1;
}

.rsjr-star{
  font-size:16px;
  color:var(--line);
}
.rsjr-star--on{
  color:#FFD735;
}

.rsjr-nick{
  font-size:13px;
  color:var(--muted);
  font-weight:500;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

/* ── 이미지 없는 카드: 텍스트 전용 레이아웃 강등 ─────────── */
.rsjr-card--noimg{
  flex-direction:column;
  align-items:flex-start;
  gap:12px;
}
.rsjr-card--noimg .rsjr-circle{display:none}
`,
  render: (d, { esc, richSafe }) => {
    // 그리드 이미지: 있으면 표시, 전부 없으면 그리드 섹션 통째 생략
    const gridPhotos = d.gridPhotos ?? []
    const hasGridPhotos = gridPhotos.some(
      (url) => typeof url === 'string' && /^(https?:\/\/|data:|\/)/.test(url.trim()),
    )

    const gridSection = hasGridPhotos
      ? `<div class="rsjr-grid">
    ${Array.from({ length: 6 }, (_, i) => {
      const url = gridPhotos[i]
      return `<div class="rsjr-grid-cell">${media(url, '', `후기 사진 ${i + 1}`)}</div>`
    }).join('\n    ')}
  </div>`
      : ''

    // 리뷰 카드: 인덱스 기준 홀수(0,2)=사진 우측, 짝수(1,3)=사진 좌측
    // 카드 사진 전무 시 noimg 레이아웃 강등
    const cards = d.reviews
      .map((r, i) => {
        const hasPhoto =
          typeof r.photo === 'string' && /^(https?:\/\/|data:|\/)/.test(r.photo.trim())
        const noImgClass = hasPhoto ? '' : ' rsjr-card--noimg'
        // 홀수 인덱스(0-based)=사진 오른쪽(.rsjr-card--r), 짝수 인덱스=사진 왼쪽(.rsjr-card--l)
        const sideClass = i % 2 === 0 ? 'rsjr-card--r' : 'rsjr-card--l'
        const starCount = r.stars ?? 5
        return `<div class="rsjr-card ${sideClass}${noImgClass}">
      <div class="rsjr-circle">${media(r.photo, '', '후기 작성자')}</div>
      <div class="rsjr-body">
        <p class="rsjr-text">${richSafe(r.text)}</p>
        <div class="rsjr-meta">
          <span class="rsjr-stars" aria-label="별점 ${starCount}점">${renderStars(starCount)}</span>
          ${r.nickname ? `<span class="rsjr-nick">${esc(r.nickname)}</span>` : ''}
        </div>
      </div>
    </div>`
      })
      .join('\n    ')

    return `
<section class="rsjr">
  <div class="rsjr-hd">
    <span class="rsjr-label">${esc(d.label ?? 'real review')}</span>
    <span class="rsjr-divider" aria-hidden="true"></span>
    <h2 class="rsjr-headline">${richSafe(d.headline)}</h2>
    ${d.subHeadline ? `<p class="rsjr-sub">${esc(d.subHeadline)}</p>` : ''}
  </div>
  ${gridSection}
  <div class="rsjr-list">
    ${cards}
  </div>
</section>`
  },
})
