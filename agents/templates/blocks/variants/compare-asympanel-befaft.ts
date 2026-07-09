/** COMPARE 아키타입: compare-asympanel-befaft
 *  피그마 345_비교_15 흡수 — VS 원형 뱃지 + 2행 타이틀 + 비대칭(좁은 전/넓은 후) 패널 비교.
 *  "전" 패널 340px(기준비 44%), "후" 패널 380px(56%) — 우측 그라디언트 섀도 오버레이로 시선 유도.
 *  이미지 없이도 붕괴하지 않는 noimg-safe 강등 내장(패널 상단 컬러 필 유지).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  text: z.string().min(1), // (em) 허용
})

const schema = z.object({
  /** VS 배지 라벨 — 기본 "VS" */
  badge: z.string().optional(),
  /** 타이틀 첫 행 (em,br) */
  title1: z.string().min(1),
  /** 타이틀 둘째 행 — accent 색으로 렌더 (em,br) */
  title2: z.string().min(1),
  /** 헤더 부제 */
  subtitle: z.string().optional(),
  /* ── 전(before) 패널 ── */
  beforeLabel: z.string().optional(),   // 기본 "사용 전"
  beforeImage: z.string().optional(),   // (url) 없으면 컬러 패널로 강등
  /** 전 패널 항목 2~4개 — 부정적 상태 나열 */
  beforeItems: z.array(itemSchema).min(2).max(4),
  /* ── 후(after) 패널 ── */
  afterLabel: z.string().optional(),    // 기본 "사용 후"
  afterImage: z.string().optional(),    // (url) 없으면 컬러 패널로 강등
  /** 후 패널 항목 2~4개 — 긍정적 변화 나열 */
  afterItems: z.array(itemSchema).min(2).max(4),
})
type Data = z.infer<typeof schema>

export const compareAsympanelBefaft = defineBlock<Data>({
  id: 'compare-asympanel-befaft',
  archetype: 'compare',
  // noimg-safe: 이미지 없을 때 컬러 패널 상단으로 자동 강등 (사진 틀 미노출)
  styleTags: ['light', 'warm', 'food', 'compare', 'asymmetric', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '비대칭 전/후 비교 블록. VS 원형 뱃지 + 2행 타이틀 + 전(좁은 44%)·후(넓은 56%) 패널을 나란히 배치. 우측 패널에 그라디언트 섀도 오버레이로 시선 집중. 식품·뷰티·헬스케어의 사용 전후 임팩트 비교에 적합.',
  schema,
  css: `
.bzqf{background:var(--bg);padding:64px 0 72px;overflow:hidden;position:relative}

/* ── 타이틀 영역 ── */
.bzqf-head{padding:0 var(--pad-x,56px) 40px;text-align:center;position:relative}
.bzqf-badge{display:inline-flex;align-items:center;justify-content:center;width:88px;height:88px;border-radius:50%;background:var(--accent);margin-bottom:20px}
.bzqf-badge-lbl{font-family:var(--font-display);font-weight:800;font-size:32px;color:var(--bg);line-height:1}
.bzqf-title1{font-family:var(--font-display);font-weight:800;font-size:60px;color:var(--ink);line-height:1.12;letter-spacing:-.02em}
.bzqf-title2{font-family:var(--font-display);font-weight:800;font-size:60px;color:var(--accent);line-height:1.12;letter-spacing:-.02em}
.bzqf-sub{margin-top:14px;font-size:18px;font-weight:500;color:var(--ink-2);line-height:1.6}

/* ── 비교 패널 컨테이너 — 비대칭 flex ── */
.bzqf-panels{display:flex;align-items:stretch;min-height:640px;position:relative}

/* ── 전(BEFORE) 패널: 44% 폭, 뮤트 톤 ── */
.bzqf-before{flex:0 0 44%;position:relative;background:color-mix(in srgb,var(--ink) 22%,var(--brand,#5a5347));overflow:hidden;display:flex;flex-direction:column}
.bzqf-before-hd{padding:20px 0 16px;text-align:center}
.bzqf-before-label{display:inline-block;background:color-mix(in srgb,var(--ink) 30%,var(--brand,#5a5347));border-radius:calc(var(--r-scale,1)*16px);padding:10px 28px;font-family:var(--font-display);font-weight:700;font-size:26px;color:rgba(255,255,255,.80);letter-spacing:.01em}
.bzqf-before-photo{margin:0 20px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));overflow:hidden;aspect-ratio:1/1;flex-shrink:0;background:color-mix(in srgb,var(--ink) 18%,var(--brand,#5a5347))}
.bzqf-before-photo img,.bzqf-before-photo .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.bzqf-before-items{flex:1;padding:20px 20px 28px;display:flex;flex-direction:column;gap:8px}
.bzqf-bi{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.12)}
.bzqf-bi:last-child{border-bottom:none}
.bzqf-bi-icon{width:28px;height:28px;opacity:.75;color:rgba(255,255,255,.80);flex-shrink:0}
.bzqf-bi-text{font-size:22px;font-weight:500;color:rgba(255,255,255,.80);line-height:1.3;word-break:keep-all}
.bzqf-bi-text .em{color:rgba(255,255,255,.95);font-weight:700}

/* ── 후(AFTER) 패널: 56% 폭, accent 톤 ── */
.bzqf-after{flex:1;position:relative;background:var(--accent);overflow:hidden;display:flex;flex-direction:column}
.bzqf-after-hd{padding:24px 0 18px;text-align:center}
.bzqf-after-label{font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--bg);line-height:1;letter-spacing:.01em}
.bzqf-after-photo{margin:0 24px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));overflow:hidden;aspect-ratio:1/0.94;flex-shrink:0;background:color-mix(in srgb,var(--accent-d) 60%,transparent)}
.bzqf-after-photo img,.bzqf-after-photo .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.bzqf-after-items{flex:1;padding:20px 24px 32px;display:flex;flex-direction:column;gap:6px}
.bzqf-ai{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid rgba(0,0,0,.10)}
.bzqf-ai:last-child{border-bottom:none}
.bzqf-ai-icon{width:34px;height:34px;color:var(--bg);flex-shrink:0}
.bzqf-ai-text{font-size:26px;font-weight:700;color:var(--bg);line-height:1.25;word-break:keep-all}
.bzqf-ai-text .em{color:var(--accent-d);font-weight:800}

/* ── 우측 그라디언트 섀도 오버레이 — 시선 유도 ── */
.bzqf-after::after{content:'';position:absolute;top:0;right:0;width:40px;height:100%;background:linear-gradient(to right,transparent,rgba(0,0,0,.18));pointer-events:none}
`,
  render: (d, { esc, richSafe, icon }) => {
    const badge = d.badge ?? 'VS'
    const beforeLabel = d.beforeLabel ?? '사용 전'
    const afterLabel = d.afterLabel ?? '사용 후'
    return `
<section class="bzqf">
  <div class="bzqf-head">
    <div class="bzqf-badge"><span class="bzqf-badge-lbl">${esc(badge)}</span></div>
    <div class="bzqf-title1">${richSafe(d.title1)}</div>
    <div class="bzqf-title2">${richSafe(d.title2)}</div>
    ${d.subtitle ? `<p class="bzqf-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="bzqf-panels">
    <div class="bzqf-before">
      <div class="bzqf-before-hd"><span class="bzqf-before-label">${esc(beforeLabel)}</span></div>
      ${d.beforeImage ? `<div class="bzqf-before-photo">${media(d.beforeImage, '', '사용 전 이미지')}</div>` : ''}
      <div class="bzqf-before-items">
        ${d.beforeItems.map(item => `
        <div class="bzqf-bi">
          <span class="bzqf-bi-icon">${icon('fire')}</span>
          <span class="bzqf-bi-text">${richSafe(item.text)}</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="bzqf-after">
      <div class="bzqf-after-hd"><span class="bzqf-after-label">${esc(afterLabel)}</span></div>
      ${d.afterImage ? `<div class="bzqf-after-photo">${media(d.afterImage, '', '사용 후 이미지')}</div>` : ''}
      <div class="bzqf-after-items">
        ${d.afterItems.map(item => `
        <div class="bzqf-ai">
          <span class="bzqf-ai-icon">${icon('check')}</span>
          <span class="bzqf-ai-text">${richSafe(item.text)}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
  },
})
