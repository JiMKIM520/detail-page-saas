/** CALLOUT 아키타입: callout-dark-stat-grid
 *  원본: 220_문제제기_08.json (다크 배경 + 형광 그린 인라인 반전 키워드 타이틀 + 이미지 여백 + 3열 통계 카드 + 공감 텍스트)
 *  구조: 다크 전면 배경 → 2단 헤드라인(형광박스 반전 단어) → 서브카피 → 선택 이미지 → 3개 통계 다크카드 행 → 공감 텍스트 스택
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statSchema = z.object({
  value: z.string().min(1),                // 수치 강조 (예: "87%", "4.2개")
  label: z.string().min(1),               // 수치 설명 레이블
})

const schema = z.object({
  // ── 헤드라인 (형광 반전 박스 키워드 구조) ──
  headBefore: z.string().optional(),       // 반전 박스 앞 줄 (em,br) — 예: "두피 가려움,"
  headHighlight: z.string().min(1),        // 형광 반전 박스 안 키워드 — 예: "샴푸를 바꿔도"
  headAfter: z.string().optional(),        // 반전 박스 뒤 줄 (em,br) — 예: "왜 반복될까요?"
  // ── 서브 카피 ──
  subCopy: z.string().optional(),          // 헤드라인 아래 보조 설명 (em,br)
  // ── 이미지 (선택) ──
  image: z.string().optional(),            // 여백 이미지 url — 없어도 붕괴하지 않는 noimg-safe
  // ── 통계 카드 3개 ──
  stats: z.array(statSchema).min(2).max(3), // 2~3개 허용 (브리프 근거 수치 있을 때만)
  // ── 공감 텍스트 스택 ──
  empathyMain: z.string().optional(),      // 공감 중심 문장 (em,br)
  empathySub: z.string().optional(),       // 공감 보조 문장 (em,br)
})
type Data = z.infer<typeof schema>

export const calloutDarkStatGrid = defineBlock<Data>({
  id: 'callout-dark-stat-grid',
  archetype: 'callout',
  styleTags: ['dark', 'bold', 'problem', 'stats', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '문제제기 다크 블록. 형광 그린(#17e497) 인라인 박스로 핵심 단어만 반전 강조하는 2단 헤드라인 + 서브카피 + 선택 이미지 + 2~3개 통계 다크카드 행 + 공감 텍스트 스택. 다크 배경에 강렬한 대비로 고객 문제를 시각화.',
  schema,
  css: `
/* ── cutk: callout-dark-stat-grid ── */
.cutk{
  background:#0c0a08;
  color:#fff;
  padding:60px var(--pad-x,56px) 64px;
}

/* 헤드라인 영역 */
.cutk-hd{margin-bottom:28px}
.cutk-line{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(44px,6.5vw,72px);
  line-height:1.14;
  letter-spacing:-.02em;
  color:#fff;
}
/* 형광 반전 박스 — 키워드만 검정 배경 위 형광 텍스트로 반전 */
.cutk-hl-wrap{
  display:inline;
}
.cutk-hl{
  display:inline;
  background:#17e497;
  color:#000;
  padding:0 8px 2px;
  border-radius:calc(var(--r-scale,1)*4px);
  /* 줄바꿈 시에도 박스가 이어지도록 */
  -webkit-box-decoration-break:clone;
  box-decoration-break:clone;
}
/* 서브카피 */
.cutk-sub{
  margin-top:18px;
  font-size:clamp(18px,2.4vw,26px);
  font-weight:500;
  color:rgba(255,255,255,0.88);
  line-height:1.6;
}
.cutk .em{color:var(--em-dark,#FFF7EA)}

/* 이미지 영역 (noimg-safe: .ph는 display:none — 공간 자체를 줄임) */
.cutk-img-wrap{
  margin:36px 0;
}
.cutk-img{
  width:100%;
  aspect-ratio:600/320;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));
  display:block;
}
/* 이미지 없으면 여백 블록 자체를 숨겨 공간 낭비 방지 */
.cutk-img-wrap:has(.ph){display:none}

/* 통계 카드 행 */
.cutk-stats{
  display:flex;
  gap:12px;
  margin-top:36px;
}
.cutk-stat{
  flex:1;
  background:#1c201f;
  border-radius:calc(var(--r-scale,1)*20px);
  padding:28px 16px 26px;
  text-align:center;
  min-width:0;
}
.cutk-stat-val{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(26px,3.8vw,42px);
  color:#17e497;
  letter-spacing:-.01em;
  line-height:1.1;
}
.cutk-stat-lbl{
  margin-top:10px;
  font-size:clamp(13px,1.6vw,16px);
  color:#fff;
  font-weight:400;
  line-height:1.5;
  word-break:keep-all;
}

/* 공감 텍스트 스택 */
.cutk-empathy{
  margin-top:44px;
  text-align:center;
}
.cutk-emp-sub{
  font-size:clamp(18px,2.6vw,28px);
  font-weight:300;
  color:rgba(255,255,255,0.78);
  line-height:1.6;
  margin-bottom:14px;
}
.cutk-emp-main{
  font-size:clamp(20px,2.8vw,30px);
  font-weight:500;
  color:#fff;
  line-height:1.5;
}
.cutk-empathy .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 강등: url 있을 때만 img-wrap을 출력 (없으면 :has(.ph) CSS가 숨기지만 마크업 자체도 생략 가능)
    const imgBlock = `
  <div class="cutk-img-wrap">
    ${media(d.image, 'cutk-img', '제품 또는 문제 상황 이미지')}
  </div>`

    const statsHtml = d.stats
      .map(
        (s) => `
    <div class="cutk-stat">
      <div class="cutk-stat-val">${esc(s.value)}</div>
      <div class="cutk-stat-lbl">${esc(s.label)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="cutk">
  <div class="cutk-hd">
    ${d.headBefore ? `<p class="cutk-line">${richSafe(d.headBefore)}</p>` : ''}
    <p class="cutk-line cutk-hl-wrap"><span class="cutk-hl">${esc(d.headHighlight)}</span></p>
    ${d.headAfter ? `<p class="cutk-line">${richSafe(d.headAfter)}</p>` : ''}
  </div>
  ${d.subCopy ? `<p class="cutk-sub">${richSafe(d.subCopy)}</p>` : ''}
  ${imgBlock}
  <div class="cutk-stats">
    ${statsHtml}
  </div>
  ${d.empathySub || d.empathyMain ? `
  <div class="cutk-empathy">
    ${d.empathySub ? `<p class="cutk-emp-sub">${richSafe(d.empathySub)}</p>` : ''}
    ${d.empathyMain ? `<p class="cutk-emp-main">${richSafe(d.empathyMain)}</p>` : ''}
  </div>` : ''}
</section>`
  },
})
