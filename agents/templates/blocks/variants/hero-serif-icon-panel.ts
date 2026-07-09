/** HERO 아키타입: hero-serif-icon-panel
 *  피그마 310_인트로_52 구조 흡수 — 전폭 배경 이미지 위 명조 감성 대형 카피 + 별 장식 구분선,
 *  하단 흰 라운드 패널에 3열 원형 아이콘+라벨+설명 기능 배너 중첩.
 *  이미지 부재 시 brand 색조 그라디언트 배경으로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const featureSchema = z.object({
  icon: z.string().min(1),         // 원형 아이콘 영역 인라인 SVG 또는 단일 문자 (emoji 금지 — 텍스트 슬롯)
  label: z.string().min(1),        // 기능 키워드 (예: "아치지지")
  text: z.string().min(1),         // 짧은 부연 설명 (em 허용)
})

const schema = z.object({
  headline: z.string().min(1),     // (em, br) 명조 대형 감성 카피 — 2~3줄 권장
  subline: z.string().optional(),  // (em, br) 헤드라인 아래 보조 카피
  image: z.string().optional(),    // 전폭 배경 이미지 url — 없으면 brand 그라디언트로 강등
  panelTitle: z.string().optional(), // 배너 패널 상단 작은 레이블 (optional)
  features: z.array(featureSchema).min(2).max(3),  // 2~3열 아이콘 기능 배너
})
type Data = z.infer<typeof schema>

export const heroSerifIconPanel = defineBlock<Data>({
  id: 'hero-serif-icon-panel',
  archetype: 'hero',
  styleTags: ['warm', 'editorial', 'premium', 'serif', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '전폭 배경 사진 위 명조 감성 대형 카피(별 장식 구분선 포함) + 하단 흰 라운드 패널에 2~3열 원형 아이콘·기능 요약 배너 중첩. 패션·라이프스타일·식품 첫 화면 특화. 이미지 없으면 brand 그라디언트로 자동 강등.',
  schema,
  css: `
/* ── hero-serif-icon-panel (hmcq) ── */
.hmcq{position:relative;background:var(--brand);overflow:hidden}
.hmcq-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top}
.hmcq-bg.ph{display:block!important;background:linear-gradient(160deg,var(--brand) 0%,color-mix(in srgb,var(--accent-d) 60%,#000) 100%)}
.hmcq-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,.08) 50%,rgba(0,0,0,.45) 100%)}
.hmcq-body{position:relative;z-index:1;padding:64px var(--pad-x,56px) 280px;text-align:center}
.hmcq .em{color:var(--em-dark,#FFF7EA)}
.hmcq-headline{font-family:var(--font-serif);font-weight:400;font-size:62px;line-height:1.22;letter-spacing:-.01em;color:#fff;word-break:keep-all}
.hmcq-deco{display:flex;align-items:center;justify-content:center;gap:0;margin:22px auto 20px;width:260px}
.hmcq-deco-line{flex:1;height:1px;background:rgba(255,255,255,.7)}
.hmcq-deco-star{width:28px;height:28px;flex:0 0 28px;color:rgba(255,255,255,.9)}
.hmcq-subline{font-family:var(--font-serif);font-weight:400;font-size:26px;line-height:1.6;color:rgba(255,255,255,.88);word-break:keep-all}
.hmcq-subline .em{color:var(--em-dark,#FFF7EA);font-weight:700}

/* ── 하단 기능 패널 ── */
.hmcq-panel-wrap{position:relative;z-index:2;margin:-220px var(--pad-x,56px) 0;padding-bottom:40px}
.hmcq-panel{background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*20px);padding:30px 16px 28px;
  box-shadow:0 -4px 24px -8px rgba(0,0,0,.14),0 12px 32px -16px rgba(0,0,0,.18)}
.hmcq-panel-label{text-align:center;font-size:12px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;margin-bottom:18px;font-weight:600}
.hmcq-features{display:flex;align-items:stretch;gap:0}
.hmcq-feat{flex:1;display:flex;flex-direction:column;align-items:center;padding:0 8px;position:relative}
.hmcq-feat+.hmcq-feat::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:1px;background:var(--line)}
.hmcq-icon-wrap{width:80px;height:80px;border-radius:999px;background:color-mix(in srgb,var(--accent) 14%,var(--paper,#fff));
  display:flex;align-items:center;justify-content:center;margin-bottom:14px;flex:0 0 80px}
.hmcq-icon-wrap svg{width:36px;height:36px;color:var(--accent-d)}
.hmcq-feat-label{font-size:17px;font-weight:700;color:var(--ink);margin-bottom:6px;text-align:center}
.hmcq-feat-text{font-size:13px;font-weight:400;line-height:1.56;color:var(--ink-2);text-align:center}
.hmcq-feat-text .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const bgImg = media(d.image, 'hmcq-bg', '히어로 배경')
    const colCount = d.features.length

    const featItems = d.features.map((f) => `
    <div class="hmcq-feat">
      <div class="hmcq-icon-wrap">${icon(f.icon)}</div>
      <div class="hmcq-feat-label">${esc(f.label)}</div>
      <div class="hmcq-feat-text">${richSafe(f.text)}</div>
    </div>`).join('')

    return `
<section class="hmcq">
  ${bgImg}
  <div class="hmcq-overlay" aria-hidden="true"></div>
  <div class="hmcq-body">
    <h2 class="hmcq-headline">${richSafe(d.headline)}</h2>
    <div class="hmcq-deco" aria-hidden="true">
      <span class="hmcq-deco-line"></span>
      <svg class="hmcq-deco-star" viewBox="0 0 28 28" fill="currentColor"><path d="M14 1 l3 9.6h10l-8 5.8 3 9.6L14 21l-8 5 3-9.6-8-5.8h10z"/></svg>
      <span class="hmcq-deco-line"></span>
    </div>
    ${d.subline ? `<p class="hmcq-subline">${richSafe(d.subline)}</p>` : ''}
  </div>
  <div class="hmcq-panel-wrap">
    <div class="hmcq-panel">
      ${d.panelTitle ? `<p class="hmcq-panel-label">${esc(d.panelTitle)}</p>` : ''}
      <div class="hmcq-features" style="--col:${colCount}">
        ${featItems}
      </div>
    </div>
  </div>
</section>`
  },
})
