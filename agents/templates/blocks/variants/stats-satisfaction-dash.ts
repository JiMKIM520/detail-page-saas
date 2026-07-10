/** STATS 아키타입: stats-satisfaction-dash
 *  피그마 037_포인트_구성_페이지_32 구조 흡수.
 *  상단 대형 수치 + 설명 + 앱 UI 이미지 클러스터, 하단 2열 만족도 카드 그리드.
 *  noimg-safe: 이미지 전무 시 클러스터 영역을 악센트 바로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  category: z.string().min(1),       // 영문 카테고리 라벨 (예: Glowing Skin)
  label: z.string().min(1),          // 한국어 만족 진술 (em 허용)
  pct: z.string().min(1),            // 퍼센트 수치 (예: 99.8%)
})

const schema = z.object({
  eyebrow: z.string().optional(),    // 섹션 상단 작은 라벨 (예: 소비자 만족도)
  heroStat: z.string().min(1),       // 대형 수치 (예: 99.8%)
  heroDesc: z.string().optional(),   // 대형 수치 옆/아래 설명 문구 (em 허용)
  image1: z.string().optional(),     // 앱 UI 이미지 — 중앙 메인 (url)
  image2: z.string().optional(),     // 앱 UI 이미지 — 좌측 보조 (url)
  image3: z.string().optional(),     // 앱 UI 이미지 — 우측 보조 (url)
  cards: z
    .array(cardSchema)
    .min(2)
    .max(6),                         // 2열 그리드 카드. 짝수 개 권장
})
type Data = z.infer<typeof schema>

export const statsSatisfactionDash = defineBlock<Data>({
  id: 'stats-satisfaction-dash',
  archetype: 'stats',
  styleTags: ['light', 'warm', 'beauty', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '소비자 만족도 대시보드. 상단 대형 수치(히어로 스탯) + 설명 + 앱 UI 이미지 클러스터(최대 3장, 없으면 강등), 하단 2열×N행 라운드 카드(카테고리·진술·% 수치). 뷰티/식품 후기 만족도 수치 나열에 최적.',
  schema,
  css: `
.spis{background:var(--bg);color:var(--ink);padding:64px var(--pad-x,56px) 72px}
/* ── 상단 히어로 영역 ── */
.spis-top{display:flex;align-items:flex-start;gap:32px;margin-bottom:52px}
.spis-hero{flex:0 0 auto;max-width:55%}
.spis-eyebrow{font-size:18px;font-weight:600;color:var(--ink-2);letter-spacing:.04em;margin-bottom:6px}
.spis-stat{font-family:var(--font-display);font-weight:900;font-size:120px;line-height:.92;color:var(--accent);letter-spacing:-.03em}
.spis-desc{margin-top:18px;font-size:17px;font-weight:400;line-height:1.7;color:var(--ink-2);max-width:300px}
.spis-desc .em{color:var(--accent);font-weight:700}
/* ── 앱 UI 이미지 클러스터 ── */
.spis-cluster{flex:1;position:relative;min-height:260px;display:flex;align-items:center;justify-content:center}
/* 이미지 있는 경우: 3장 오버랩 배치 */
.spis-cluster.has-imgs{display:block}
.spis-img-main{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:130px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));
  overflow:hidden;
  box-shadow:0 16px 40px -10px rgba(0,0,0,.22);
  z-index:2
}
.spis-img-main img,.spis-img-main .ph{width:100%;height:auto;object-fit:cover;border-radius:inherit;display:block}
.spis-img-l{
  position:absolute;left:8%;top:50%;transform:translateY(-40%);
  width:110px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
  overflow:hidden;
  box-shadow:0 10px 28px -8px rgba(0,0,0,.18);
  z-index:1
}
.spis-img-l img,.spis-img-l .ph{width:100%;height:auto;object-fit:cover;border-radius:inherit;display:block}
.spis-img-r{
  position:absolute;right:8%;top:50%;transform:translateY(-55%);
  width:110px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));
  overflow:hidden;
  box-shadow:0 10px 28px -8px rgba(0,0,0,.18);
  z-index:1
}
.spis-img-r img,.spis-img-r .ph{width:100%;height:auto;object-fit:cover;border-radius:inherit;display:block}
/* noimg-safe 강등: 이미지 전무 시 장식 바 */
.spis-cluster-bar{
  width:100%;height:180px;
  border-radius:calc(var(--r-scale,1)*20px);
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 18%,var(--bg)) 0%,color-mix(in srgb,var(--accent) 8%,var(--bg)) 100%);
  display:flex;align-items:center;justify-content:center
}
.spis-cluster-bar-inner{
  width:64px;height:64px;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 22%,var(--bg));
  display:flex;align-items:center;justify-content:center
}
.spis-cluster-bar-inner svg{width:32px;height:32px;color:var(--accent)}
/* ── 카드 그리드 ── */
.spis-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px
}
.spis-card{
  background:var(--paper,#fff);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:24px 28px 20px;
  position:relative;overflow:hidden
}
.spis-card-cat{
  font-size:15px;font-weight:600;
  color:var(--accent);
  letter-spacing:.03em;margin-bottom:6px
}
.spis-card-label{
  font-size:17px;font-weight:700;line-height:1.5;
  color:var(--ink)
}
.spis-card-label .em{color:var(--accent);font-weight:800}
.spis-card-pct{
  font-family:var(--font-display);font-weight:900;
  font-size:62px;line-height:1;letter-spacing:-.03em;
  color:var(--accent);margin-top:10px
}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 클러스터 이미지 존재 여부
    const hasAny = [d.image1, d.image2, d.image3].some(
      (u) => typeof u === 'string' && u.trim().length > 0
    )

    const clusterHtml = hasAny
      ? `<div class="spis-cluster has-imgs" style="height:280px">
        <div class="spis-img-l">${media(d.image2, '', '앱 화면 보조 1')}</div>
        <div class="spis-img-main">${media(d.image1, '', '앱 화면 메인')}</div>
        <div class="spis-img-r">${media(d.image3, '', '앱 화면 보조 2')}</div>
      </div>`
      : `<div class="spis-cluster">
        <div class="spis-cluster-bar">
          <div class="spis-cluster-bar-inner">${icon('star')}</div>
        </div>
      </div>`

    const cardsHtml = d.cards
      .map(
        (c) => `
      <div class="spis-card">
        <div class="spis-card-cat">${esc(c.category)}</div>
        <div class="spis-card-label">${richSafe(c.label)}</div>
        <div class="spis-card-pct">${esc(c.pct)}</div>
      </div>`
      )
      .join('')

    return `
<section class="spis">
  <div class="spis-top">
    <div class="spis-hero">
      ${d.eyebrow ? `<p class="spis-eyebrow">${esc(d.eyebrow)}</p>` : ''}
      <div class="spis-stat">${esc(d.heroStat)}</div>
      ${d.heroDesc ? `<p class="spis-desc">${richSafe(d.heroDesc)}</p>` : ''}
    </div>
    ${clusterHtml}
  </div>
  <div class="spis-grid">
    ${cardsHtml}
  </div>
</section>`
  },
})
