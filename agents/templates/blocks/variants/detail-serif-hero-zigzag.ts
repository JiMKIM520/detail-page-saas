/** DETAIL 아키타입(템플릿 충실 재현): detail-serif-hero-zigzag.
 *  피그마 323_제품특징_37 패턴 재구성.
 *  좌정렬 영문 세리프 대제목(detail point) + 한글 부제 →
 *  대형 풀폭 999px 원형 곡률 대표 이미지 →
 *  3행 지그재그(홀수=이미지왼쪽+텍스트오른쪽 / 짝수=텍스트왼쪽+이미지오른쪽):
 *    각 행: 영문 세리프 번호("detail 01.") + 세로선 구분자 + 한글 라벨 + 본문.
 *  라이트 배경, 웜 브랜드 컬러 강조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  num: z.string().min(1).optional(),     // "detail 01." 형식 — 생략 시 자동 생성
  label: z.string().min(1),             // 소재/디테일 라벨 (예: "깔끔한 라운드 넥")
  text: z.string().min(1),              // 본문 설명 (em,br 허용)
  image: z.string().optional(),         // 클로즈업 사진 (url)
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(),        // 영문 세리프 대제목 — 기본 "detail point" (em,br)
  subtitle: z.string().min(1).optional(),       // 한글 부제 (순수 텍스트)
  heroImage: z.string().optional(),             // 풀폭 원형 대표 이미지 (url)
  items: z
    .array(itemSchema)
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

/** 번호 문자열 자동 생성: "detail 01." */
const autoNum = (i: number): string => `detail ${String(i + 1).padStart(2, '0')}.`

export const detailSerifHeroZigzag = defineBlock<Data>({
  id: 'detail-serif-hero-zigzag',
  archetype: 'detail',
  // noimg-safe: 아이템 이미지가 전부 없을 때 이미지 패널을 생략하고 텍스트 단일 열로 강등 렌더
  styleTags: ['light', 'editorial', 'warm', 'template', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '소재·디테일 클로즈업 지그재그. 좌정렬 영문 세리프 대제목(detail point)+한글 부제 → 999px 완전원형 곡률 풀폭 대표 이미지 → 홀수=이미지좌+텍스트우 / 짝수=텍스트좌+이미지우 교차 행(세리프 번호+세로선+라벨+본문). 패션·뷰티·리빙 소재 강조에 적합.',
  schema,
  css: `
/* ── 래퍼 ── */
.dgic{background:var(--bg);color:var(--ink);padding:54px 0 64px}

/* ── 헤더 ── */
.dgic-hd{padding:0 var(--pad-x,56px) 32px}
.dgic-eyebrow{font-family:var(--font-serif);font-weight:700;font-size:60px;color:var(--accent);line-height:1.05;letter-spacing:-.01em}
.dgic-eyebrow .em{color:var(--accent-d)}
.dgic-sub{margin-top:8px;font-family:var(--font-body,inherit);font-size:22px;font-weight:300;color:var(--ink);line-height:1.4;letter-spacing:-.01em}

/* ── 풀폭 원형 대표 이미지 ── */
.dgic-hero-wrap{padding:0 var(--pad-x,56px) 48px;box-sizing:border-box;max-width:100%}
.dgic-hero{
  width:100%;
  max-width:100%;
  aspect-ratio:760/800;
  /* 999px = 완전 원형·pill 곡률 — 규약 예외 허용 */
  border-radius:999px;
  overflow:hidden;
  box-sizing:border-box;
  background:color-mix(in srgb,var(--accent) 8%,transparent);
}
.dgic-hero img,.dgic-hero .ph{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:inherit;
}
/* 이미지 없을 때 최소 높이 유지 */
.dgic-hero.ph-only{aspect-ratio:auto;min-height:160px}

/* ── 지그재그 리스트 ── */
.dgic-list{}
.dgic-row{
  display:flex;
  align-items:center;
  gap:0;
  min-height:280px;
  padding:48px var(--pad-x,56px);
  margin-bottom:0;
  border-top:1px solid var(--line);
  box-sizing:border-box;
}
.dgic-row:last-child{border-bottom:1px solid var(--line)}
/* 짝수 인덱스(0-based) = 홀수 항목 → 이미지 왼쪽(기본)
   홀수 인덱스(0-based) = 짝수 항목 → 텍스트 왼쪽 */
.dgic-row.rev{flex-direction:row-reverse}

/* ── 이미지 패널 ── */
.dgic-img-panel{
  flex:0 0 50%;
  width:50%;
  padding:0;
}
.dgic-img-frame{
  width:100%;
  aspect-ratio:1/1;
  /* 고유 사진 프레임 — 소재 클로즈업용 */
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 7%,transparent);
}
.dgic-img-frame img,.dgic-img-frame .ph{
  width:100%;height:100%;
  object-fit:cover;
  border-radius:inherit;
}
/* 이미지 없을 때 패널 자체를 숨겨 텍스트가 전폭을 차지 */
.dgic-row.no-img .dgic-img-panel{display:none}
.dgic-row.no-img .dgic-body{flex:1;padding:32px 0}

/* ── 텍스트 패널 ── */
.dgic-body{
  flex:1;
  padding:32px 28px;
  display:flex;
  flex-direction:column;
  gap:0;
}
.dgic-row.rev .dgic-body{padding:32px 0 32px 28px}
.dgic-row:not(.rev) .dgic-body{padding:32px 0 32px 28px}
.dgic-row.rev .dgic-img-panel{padding-left:0}
.dgic-row:not(.rev) .dgic-img-panel{padding-right:28px}

/* ── 번호 ── */
.dgic-num{
  font-family:var(--font-serif);
  font-weight:700;
  font-size:38px;
  color:var(--accent);
  line-height:1;
  letter-spacing:-.01em;
  margin-bottom:10px;
}

/* ── 세로선 ── */
.dgic-vline{
  width:36px;
  height:2px;
  background:var(--accent);
  opacity:.45;
  margin-bottom:12px;
  border-radius:1px;
}

/* ── 라벨 ── */
.dgic-label{
  font-family:var(--font-body,inherit);
  font-weight:600;
  font-size:22px;
  color:var(--accent);
  line-height:1.3;
  margin-bottom:8px;
}

/* ── 본문 ── */
.dgic-text{
  font-size:15px;
  color:var(--ink-2);
  line-height:1.75;
}
.dgic-text .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    // 전 아이템에 이미지가 있을 때만 이미지 패널을 그린다 (균일화 가드).
    // 하나라도 비면 텍스트 단열 레이아웃으로 강등(noimg-safe).
    const withImgs = d.items.every(
      (it) => typeof it.image === 'string' && it.image.length > 0,
    )

    const rows = d.items
      .map((it, i) => {
        // 0-based: i%2===0 → 이미지 왼쪽(기본), i%2===1 → 이미지 오른쪽(rev)
        const revClass = i % 2 === 1 ? ' rev' : ''
        const noImgClass = withImgs ? '' : ' no-img'
        const numStr = it.num ?? autoNum(i)
        return `
<div class="dgic-row${revClass}${noImgClass}">
  ${withImgs ? `<div class="dgic-img-panel">
    <div class="dgic-img-frame">${media(it.image, '', esc(it.label))}</div>
  </div>` : ''}
  <div class="dgic-body">
    <span class="dgic-num">${esc(numStr)}</span>
    <div class="dgic-vline"></div>
    <span class="dgic-label">${esc(it.label)}</span>
    <p class="dgic-text">${richSafe(it.text)}</p>
  </div>
</div>`
      })
      .join('')

    // 대표 이미지: 없으면 pill 프레임 자체를 숨긴다
    const heroBlock =
      typeof d.heroImage === 'string' && d.heroImage.length > 0
        ? `<div class="dgic-hero-wrap">
  <div class="dgic-hero">${media(d.heroImage, '', '대표 제품 이미지')}</div>
</div>`
        : ''

    return `
<section class="dgic">
  <div class="dgic-hd">
    <h2 class="dgic-eyebrow">${richSafe(d.eyebrow ?? 'detail point')}</h2>
    ${d.subtitle ? `<p class="dgic-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${heroBlock}
  <div class="dgic-list">
    ${rows}
  </div>
</section>`
  },
})
