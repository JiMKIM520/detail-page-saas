/** FEATURE 아키타입: feature-bookmark-compare
 *  다크 네이비 배경 + 그라디언트 원형 장식 + 대형 그라디언트 제품 타이포 +
 *  라벨 pill 2개 + 하단 2열 '책갈피 카드' (상단 탭·다중 수평 줄무늬·아이콘·설명·회색 푸터).
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const cardSchema = z.object({
  tag: z.string().min(1),                  // 카드 상단 녹색 라벨 (짧은 키워드)
  icon: z.enum([
    'check','wheat','drop','clock','badge','snow','fryer','oven','star',
    'heart','gift','truck','shield','leaf','trophy','thumb','fire',
    'person','search','pin','box','calendar','card','won','bulb','gear',
    'camera','phone','bolt','thermometer','target','store','doc','sprout','bell',
  ]).optional(),
  body: z.string().min(1),                 // 카드 중앙 본문 (em/br 허용)
  foot: z.string().optional(),             // 카드 하단 회색 푸터 텍스트
})

const schema = z.object({
  headline: z.string().min(1),             // 대형 그라디언트 제품명 (em/br 허용)
  pill1: z.string().optional(),            // 상단 pill 라벨 1
  pill2: z.string().optional(),            // 상단 pill 라벨 2
  subDesc: z.string().optional(),          // headline 아래 보조 설명
  cards: z.array(cardSchema).min(2).max(2), // 책갈피 카드 정확히 2개
  caption: z.string().optional(),          // 카드 아래 보조 캡션
})
type Data = z.infer<typeof schema>

export const featureBookmarkCompare = defineBlock<Data>({
  id: 'feature-bookmark-compare',
  archetype: 'feature',
  styleTags: ['dark', 'premium', 'structured'],
  imageSlots: 0,
  describe: '다크 네이비 배경 + 상단 대형 그라디언트 제품 헤드라인 + pill 라벨 + 2열 책갈피 카드(상단 탭·줄무늬 구분·아이콘·설명·회색 푸터). 물리적 책갈피 은유로 두 특징/구성을 시각 대비.',
  schema,
  css: `
/* ── feature-bookmark-compare (fgpy) ──────────────────────────── */
.fgpy{
  position:relative;overflow:hidden;
  background:var(--bg);
  padding:72px var(--pad-x,56px) 80px;
  font-family:var(--font-body),'Pretendard',sans-serif;
}
/* 그라디언트 원형 장식 */
.fgpy-orb{
  position:absolute;top:-60px;right:-80px;
  width:460px;height:460px;border-radius:50%;
  background:radial-gradient(circle at 40% 40%,
    rgba(76,229,208,.28) 0%,rgba(99,102,241,.18) 45%,transparent 72%);
  pointer-events:none;
}
/* 상단 pill 행 */
.fgpy-pills{
  display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;
}
.fgpy-pill{
  display:inline-flex;align-items:center;
  padding:6px 20px;
  border-radius:999px;
  border:1.5px solid rgba(76,229,208,.7);
  color:#4ce5d0;
  font-size:15px;font-weight:600;letter-spacing:.03em;
  background:rgba(76,229,208,.08);
}
/* 대형 그라디언트 헤드라인 */
.fgpy-hl{
  font-family:var(--font-display),'Pretendard',sans-serif;
  font-size:clamp(52px,8vw,90px);font-weight:800;
  line-height:1.08;letter-spacing:-.02em;
  background:linear-gradient(135deg,#6ee7f7 0%,#a78bfa 55%,#f472b6 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
  margin-bottom:20px;word-break:keep-all;
}
/* 보조 설명 */
.fgpy-sub{
  font-size:17px;font-weight:500;color:rgba(255,255,255,.72);
  margin-bottom:48px;line-height:1.6;
}
/* 다크 영역 em 스코프 오버라이드 (필수) */
.fgpy .em{color:var(--em-dark,#FFF7EA)}
/* 2열 책갈피 카드 컨테이너 */
.fgpy-cards{
  display:grid;grid-template-columns:1fr 1fr;gap:20px;
  margin-bottom:36px;
}
/* 책갈피 카드 외형 */
.fgpy-card{
  border-radius:calc(var(--r-scale,1)*14px);
  overflow:hidden;
  background:#fff;
  box-shadow:0 24px 48px -16px rgba(0,0,0,.45);
  display:flex;flex-direction:column;
}
/* 책갈피 탭 (상단 짧은 어두운 줄 — 카드 너비 전체) */
.fgpy-tab{
  height:44px;
  background:#3a1717;
  flex-shrink:0;
}
/* 카드 본문 영역 */
.fgpy-body{
  flex:1;display:flex;flex-direction:column;
  padding:0;position:relative;
}
/* 줄무늬 구분선 1 (얇은) */
.fgpy-stripe-a{
  height:9px;background:#3a1717;flex-shrink:0;
}
/* 아이콘 + 태그 중간 영역 */
.fgpy-mid{
  flex:1;padding:16px 20px 12px;
  display:flex;flex-direction:column;align-items:center;gap:10px;
}
.fgpy-tag{
  font-size:15px;font-weight:800;
  color:#009c53;letter-spacing:.02em;
  align-self:flex-start;
}
.fgpy-icon{
  width:64px;height:64px;color:#5b6bff;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.fgpy-icon svg{width:100%;height:100%}
.fgpy-text{
  font-size:15px;font-weight:700;line-height:1.55;
  color:#2f302f;text-align:center;word-break:keep-all;
}
/* 줄무늬 구분선 2 (중간 두께) */
.fgpy-stripe-b{
  height:18px;background:#3a1717;flex-shrink:0;
}
/* 줄무늬 구분선 3 (굵은) */
.fgpy-stripe-c{
  height:34px;background:#3a1717;flex-shrink:0;
}
/* 회색 푸터 바 */
.fgpy-foot{
  height:50px;background:#cecece;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  padding:0 16px;
}
.fgpy-foot-txt{
  font-size:13px;font-weight:600;color:#555;
  text-align:center;letter-spacing:.01em;
}
/* 하단 캡션 */
.fgpy-cap{
  font-size:15px;font-weight:500;color:rgba(255,255,255,.68);
  line-height:1.65;text-align:center;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const pills = [d.pill1, d.pill2].filter(Boolean)
    const pillsHtml = pills.length
      ? `<div class="fgpy-pills">${pills.map(p => `<span class="fgpy-pill">${esc(p)}</span>`).join('')}</div>`
      : ''

    const cardHtml = (c: Data['cards'][number]) => `
<div class="fgpy-card">
  <div class="fgpy-tab"></div>
  <div class="fgpy-body">
    <div class="fgpy-stripe-a"></div>
    <div class="fgpy-mid">
      <span class="fgpy-tag">${esc(c.tag)}</span>
      <div class="fgpy-icon">${icon(c.icon ?? 'check')}</div>
      <p class="fgpy-text">${richSafe(c.body)}</p>
    </div>
    <div class="fgpy-stripe-b"></div>
    <div class="fgpy-stripe-c"></div>
    <div class="fgpy-foot">
      ${c.foot ? `<span class="fgpy-foot-txt">${esc(c.foot)}</span>` : ''}
    </div>
  </div>
</div>`

    return `
<section class="fgpy">
  <div class="fgpy-orb" aria-hidden="true"></div>
  ${pillsHtml}
  <h2 class="fgpy-hl">${richSafe(d.headline)}</h2>
  ${d.subDesc ? `<p class="fgpy-sub">${esc(d.subDesc)}</p>` : ''}
  <div class="fgpy-cards">
    ${d.cards.map(cardHtml).join('')}
  </div>
  ${d.caption ? `<p class="fgpy-cap">${esc(d.caption)}</p>` : ''}
</section>`
  },
})
