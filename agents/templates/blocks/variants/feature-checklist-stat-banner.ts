/** FEATURE 아키타입: feature-checklist-stat-banner
 *  피그마 142_제품특징_07 흡수 — 상단 풀블리드 제품 이미지 위 흰색 반투명 체크리스트 오버레이 +
 *  하단 브랜드 컬러 배너에 3열 아이콘·수치 스탯 구성.
 *  이미지 부재 시 브랜드색 그라데이션 배경으로 안전 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const statSchema = z.object({
  icon: z.string().min(1),          // icon() 이름 (bolt / clock / drop 등)
  value: z.string().min(1),         // 굵은 수치 라인 (예: "최대 60분")
  label: z.string().min(1),         // 보조 설명 라인 (예: "연속 사용")
})

const schema = z.object({
  image: z.string().optional(),     // 상단 풀블리드 배경 이미지 (url)
  title: z.string().min(1),         // 상단 대제목 (em,br 허용)
  checks: z
    .array(z.object({ text: z.string().min(1) }))
    .min(2)
    .max(4),                        // 체크 항목 2~4개
  stats: z
    .array(statSchema)
    .min(2)
    .max(3),                        // 하단 스탯 2~3열
  bannerColor: z.string().optional(), // 배너 배경색 토큰 오버라이드 (기본 var(--accent))
})
type Data = z.infer<typeof schema>

export const featureChecklistStatBanner = defineBlock<Data>({
  id: 'feature-checklist-stat-banner',
  archetype: 'feature',
  // noimg-safe: 이미지 없으면 브랜드 그라데이션 패널로 강등 — 체크리스트 읽기 유지
  styleTags: ['mixed', 'product', 'tech', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 풀블리드 이미지 위 반투명 체크리스트 오버레이 + 하단 브랜드 배너 3열 스탯. 배터리·전자제품·기능성 제품의 핵심 수치와 특징을 이중 전달. 이미지 없이도 브랜드색 배경으로 안전 렌더.',
  schema,
  css: `
.fcan{position:relative;background:var(--bg);overflow:hidden}

/* ── 상단 이미지 존 ── */
.fcan-top{position:relative;width:100%;aspect-ratio:860/1100;overflow:hidden}
.fcan-top .fcan-img{width:100%;height:100%;object-fit:cover;display:block;border-radius:0}
/* noimg-safe: 이미지 없을 때 브랜드 그라데이션 강등 */
.fcan-top .ph{
  display:block!important;width:100%;height:100%;
  background:linear-gradient(160deg,var(--accent) 0%,var(--brand) 100%);
  border-radius:0
}
/* 이미지 위 오버레이 그라데이션 — 체크리스트 가독성 보장 */
.fcan-top::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.45) 40%,rgba(0,0,0,.18) 70%,transparent 100%);
  pointer-events:none
}

/* 타이틀 + 체크리스트 오버레이 */
.fcan-overlay{
  position:absolute;bottom:0;left:0;right:0;z-index:2;
  padding:0 var(--pad-x,56px) 40px
}
.fcan-title{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(48px,6.6vw,80px);line-height:1.1;letter-spacing:-.025em;
  color:#ffffff;margin-bottom:28px;text-shadow:0 2px 12px rgba(0,0,0,.3)
}
.fcan-title .em{color:var(--em-dark,#FFF7EA)}

/* 체크 항목 리스트 */
.fcan-checks{display:flex;flex-direction:column;gap:10px}
.fcan-check{
  display:inline-flex;align-items:center;gap:12px;
  background:rgba(255,255,255,.95);
  border-radius:calc(var(--r-scale,1)*30px);
  padding:10px 20px 10px 12px;
  width:fit-content;max-width:520px
}
.fcan-check-icon{
  flex:0 0 28px;width:28px;height:28px;color:var(--accent);
  display:flex;align-items:center;justify-content:center
}
.fcan-check-icon svg{width:20px;height:20px;stroke-width:3}
.fcan-check-text{
  font-family:var(--font-body);font-weight:500;
  font-size:clamp(15px,2vw,18px);color:#111111;line-height:1.3;white-space:nowrap
}

/* ── 하단 스탯 배너 ── */
.fcan-banner{
  background:var(--fcan-banner-bg, var(--accent));
  padding:40px var(--pad-x,56px)
}
.fcan-stats{
  display:grid;grid-template-columns:repeat(var(--fcan-cols,3),1fr);
  gap:0;position:relative
}
.fcan-stat{
  display:flex;flex-direction:column;align-items:center;
  gap:0;padding:0 12px;position:relative;text-align:center
}
/* 수직 구분선 */
.fcan-stat+.fcan-stat::before{
  content:'';position:absolute;left:0;top:10%;height:80%;
  width:1px;background:rgba(255,255,255,.28)
}
.fcan-stat-icon{
  width:56px;height:56px;margin-bottom:14px;
  color:#ffffff;display:flex;align-items:center;justify-content:center
}
.fcan-stat-icon svg{width:100%;height:100%;stroke-width:2}
.fcan-stat-value{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(22px,3vw,34px);color:#ffffff;line-height:1.15;letter-spacing:-.01em
}
.fcan-stat-label{
  margin-top:4px;font-family:var(--font-body);font-weight:500;
  font-size:clamp(14px,1.8vw,20px);color:rgba(255,255,255,.85);line-height:1.3
}

/* 다크 배너 richSafe 오버라이드 */
.fcan-banner .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const cols = d.stats.length
    return `
<section class="fcan">
  <style>.fcan{--fcan-cols:${cols}${d.bannerColor ? `;--fcan-banner-bg:${esc(d.bannerColor)}` : ''}}</style>

  <!-- 상단: 풀블리드 이미지 + 오버레이 -->
  <div class="fcan-top">
    ${media(d.image, 'fcan-img', '제품 이미지')}
    <div class="fcan-overlay">
      <h2 class="fcan-title">${richSafe(d.title)}</h2>
      <ul class="fcan-checks" role="list">
        ${d.checks
          .map(
            (c) => `
        <li class="fcan-check">
          <span class="fcan-check-icon">${icon('check')}</span>
          <span class="fcan-check-text">${esc(c.text)}</span>
        </li>`,
          )
          .join('')}
      </ul>
    </div>
  </div>

  <!-- 하단: 스탯 배너 -->
  <div class="fcan-banner">
    <div class="fcan-stats">
      ${d.stats
        .map(
          (s) => `
      <div class="fcan-stat">
        <div class="fcan-stat-icon">${icon(s.icon)}</div>
        <p class="fcan-stat-value">${esc(s.value)}</p>
        <p class="fcan-stat-label">${esc(s.label)}</p>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`
  },
})
