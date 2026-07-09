/** POINT 아키타입: point-badge-word-split
 *  피그마 236_문제공감_05 흡수.
 *  핵심 장치: 낱글자를 원형 뱃지에 1자씩 담아 가로 배열해 단어를 분해·강조하는 타이포 장치 +
 *  대형 카피 + 이미지1 → 삼중 화살표 시퀀스 → 이미지2 + 다크 라운드 넘버드 리스트 카드.
 *  라이트 배경. 이미지 양쪽 모두 없어도 붕괴하지 않는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 원형 뱃지로 분해할 단어 (2~5자). 각 글자가 개별 뱃지 안에 들어감. */
  badgeWord: z.string().min(2).max(5),
  /** 뱃지 아래 대형 카피 (em/br 허용). */
  headline: z.string().min(1),
  /** 이미지1 — "전" 상황 사진 (url). */
  imageBefore: z.string().optional(),
  /** 이미지2 — "후" 상황 사진 (url). */
  imageAfter: z.string().optional(),
  /** 삼중 화살표 사이 레이블 (예: "적용하면"). 짧게 유지. */
  arrowLabel: z.string().optional(),
  /** 다크 카드 리스트 (2~4개). */
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const pointBadgeWordSplit = defineBlock<Data>({
  id: 'point-badge-word-split',
  archetype: 'point',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '문제 원인 강조 블록. 키워드 낱글자를 원형 다크 뱃지에 1자씩 담아 가로 배열해 단어를 시각적으로 분해하고, 대형 헤드라인 + 이미지 before/after를 삼중 화살표로 연결, 하단에 다크 라운드 넘버드 리스트 카드로 핵심 이유를 정리. 문제공감·원인 제시·차별점 섹션에 적합.',
  schema,
  css: `
/* ── point-badge-word-split ── */
.pbw{background:var(--bg);color:var(--ink);padding:72px 0 80px}

/* 뱃지 행 */
.pbw-badge-row{display:flex;justify-content:center;gap:16px;padding:0 var(--pad-x,56px)}
.pbw-badge{
  width:calc(var(--r-scale,1)*100px + 20px);
  height:calc(var(--r-scale,1)*100px + 20px);
  min-width:80px;min-height:80px;
  background:var(--brand);color:#ffffff;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(28px,5vw,56px);
  line-height:1;
  letter-spacing:0;
  padding-top:0.08em;
  flex-shrink:0;
}

/* 대형 헤드라인 */
.pbw-headline{
  margin-top:32px;
  padding:0 var(--pad-x,56px);
  text-align:center;
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(28px,4.5vw,52px);
  line-height:1.35;
  color:var(--ink);
}
.pbw-headline .em{color:var(--accent-d)}

/* 이미지 영역 */
.pbw-img-wrap{
  margin:40px var(--pad-x,56px) 0;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));
  overflow:hidden;
  aspect-ratio:800/480;
  background:color-mix(in srgb,var(--accent) 8%,var(--bg));
}
.pbw-img-wrap img{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* noimg-safe: 이미지 없을 때 wrap을 숨겨 빈 박스 노출 방지 */
.pbw-img-wrap:has(.ph){display:none}

/* 삼중 화살표 시퀀스 */
.pbw-arrow{
  display:flex;flex-direction:column;align-items:center;gap:4px;
  margin:28px auto;
  width:max-content;
}
.pbw-arrow-svg{display:block;width:80px}
.pbw-arrow-label{
  margin-top:8px;
  font-size:13px;font-weight:700;letter-spacing:.12em;
  color:var(--muted);text-transform:none;
}

/* 다크 리스트 카드 */
.pbw-list{
  display:flex;flex-direction:column;gap:16px;
  margin-top:40px;padding:0 var(--pad-x,56px);
}
.pbw-card{
  background:var(--brand);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:22px 24px;
  display:flex;align-items:flex-start;gap:16px;
}
/* 다크 배경 .em 오버라이드 */
.pbw-card .em{color:var(--em-dark,#FFF7EA)}

.pbw-num{
  flex-shrink:0;
  width:48px;height:48px;
  background:#ffffff;
  border-radius:999px;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--font-display);font-weight:700;
  font-size:24px;color:var(--brand);
  line-height:1;
}
.pbw-card-body{flex:1;min-width:0}
.pbw-card-title{
  font-size:20px;font-weight:700;color:#ffffff;
  line-height:1.3;
}
.pbw-card-text{
  margin-top:6px;
  font-size:16px;font-weight:400;
  color:rgba(255,255,255,.76);
  line-height:1.65;
}
`,
  render: (d, { esc, richSafe }) => {
    const chars = [...d.badgeWord] // 유니코드 안전 분리
    const badges = chars
      .map((ch) => `<div class="pbw-badge">${esc(ch)}</div>`)
      .join('')

    const cards = d.items
      .map(
        (item, i) => `
  <div class="pbw-card">
    <div class="pbw-num">${i + 1}</div>
    <div class="pbw-card-body">
      <div class="pbw-card-title">${esc(item.title)}</div>
      <div class="pbw-card-text">${esc(item.text)}</div>
    </div>
  </div>`,
      )
      .join('')

    /* 삼중 화살표 — 인라인 SVG 3개 */
    const arrowPath = `<svg class="pbw-arrow-svg" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 16h60M52 6l12 10-12 10" stroke="var(--accent-d)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    const tripleArrow = `${arrowPath}${arrowPath}${arrowPath}`

    return `
<section class="pbw">
  <div class="pbw-badge-row">${badges}</div>
  <h2 class="pbw-headline">${richSafe(d.headline)}</h2>
  <div class="pbw-img-wrap">${media(d.imageBefore, '', '적용 전')}</div>
  <div class="pbw-arrow">
    ${tripleArrow}
    ${d.arrowLabel ? `<span class="pbw-arrow-label">${esc(d.arrowLabel)}</span>` : ''}
  </div>
  <div class="pbw-img-wrap">${media(d.imageAfter, '', '적용 후')}</div>
  <div class="pbw-list">${cards}</div>
</section>`
  },
})
