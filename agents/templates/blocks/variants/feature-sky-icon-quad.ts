/** FEATURE 아키타입: feature-sky-icon-quad.
 *  피그마 067_제품특징_02 구조 흡수 — 하늘 배경 + "check point" 대형 라틴 헤더 + 라인 배지
 *  → 2×2 흰 라운드 카드 그리드. 각 카드에 레이어드 아이콘(아이콘 + 연한 원 오프셋 겹침)으로 깊이감 부여.
 *  뷰티·스킨케어·식품 등 성분/특징 4가지 강조에 적합한 light 톤 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 대형 라틴 헤드워드 (예: "check point" / "key point"). 기본 "check point" */
  headword: z.string().optional(),
  /** 배지 라인 텍스트 — 카테고리·제품 핵심 캐치프레이즈 (em 허용) */
  badge: z.string().min(1),
  /** 섹션 배경색 오버라이드 (기본 하늘 var(--sky,#B8DDFA)). hex/rgb 직접 지정 가능 */
  skyBg: z.string().optional(),
  /** 4개 고정 특징 카드. 4개 필요(2×2 그리드), 최소 2개 → 빈 자리 없음 원칙이나 2~4 허용 */
  items: z
    .array(
      z.object({
        /** ICON_NAMES 35종 중 하나 (생략 시 check) */
        icon: z.string().optional(),
        /** 카드 제목 (em 허용) */
        heading: z.string().min(1),
        /** 카드 설명 (em/br 허용) */
        body: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureSkyIconQuad = defineBlock<Data>({
  id: 'feature-sky-icon-quad',
  archetype: 'feature',
  styleTags: ['light', 'beauty', 'sky', 'icon-card', 'quad-grid'],
  imageSlots: 0,
  describe:
    '하늘색 배경 + 대형 라틴 헤드워드(check point 등) + 라인 배지 문구 → 2×2 흰 라운드 카드 그리드. 각 카드는 레이어드 아이콘(아이콘+연한 원 오프셋)으로 깊이감 연출. 이미지 없이도 완결. 뷰티·성분·제품 특징 4종 강조에 최적.',
  schema,
  css: `
/* feature-sky-icon-quad — 접두사 ftrt- */
.ftrt{background:var(--ftrt-sky,var(--sky,#B8DDFA));padding:52px var(--pad-x,56px) 60px;word-break:keep-all;overflow-wrap:break-word}

/* ── 타이틀 영역 ── */
.ftrt-head{text-align:center;margin-bottom:34px}
.ftrt-hw{font-family:var(--font-lat,'Cormorant Garamond',serif);font-size:clamp(52px,10vw,96px);font-weight:700;line-height:1;letter-spacing:-.02em;color:var(--accent-d);text-transform:lowercase}

/* 라인 배지: 배지 텍스트를 중앙 가로선 위에 배치 */
.ftrt-badge-wrap{position:relative;display:flex;align-items:center;justify-content:center;margin-top:20px}
.ftrt-badge-wrap::before,.ftrt-badge-wrap::after{content:"";flex:1;height:1.5px;background:var(--accent-d);opacity:.35}
.ftrt-badge-wrap::before{margin-right:14px}
.ftrt-badge-wrap::after{margin-left:14px}
.ftrt-badge{font-family:var(--font-body);font-size:18px;font-weight:600;color:var(--accent-d);letter-spacing:-.01em;white-space:nowrap}
.ftrt-badge .em{color:var(--accent)}

/* ── 2×2 카드 그리드 ── */
.ftrt-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:30px}
.ftrt-card{background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*20px);padding:30px 22px 28px;display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 4px 18px -6px rgba(62,109,181,.13)}

/* ── 레이어드 아이콘 (아이콘 + 연한 원 오프셋 겹침) ── */
.ftrt-icon-wrap{position:relative;width:72px;height:72px;margin-bottom:18px;flex-shrink:0}
/* 연한 배경 원: 아이콘보다 뒤에(z-index 낮음), 우하 방향 오프셋으로 깊이감 */
.ftrt-icon-wrap::after{
  content:"";
  position:absolute;
  right:-10px;bottom:-8px;
  width:48px;height:48px;
  border-radius:50%;
  background:var(--ftrt-orb,#C4E4F8);
  z-index:0
}
/* 아이콘 자체는 연한 원 위에(z-index 높음) */
.ftrt-icon{
  position:absolute;
  inset:0;
  display:grid;place-items:center;
  z-index:1;
  color:var(--accent-d)
}
.ftrt-icon svg{width:36px;height:36px;stroke-width:2}

.ftrt-ch{font-family:var(--font-display);font-weight:700;font-size:20px;line-height:1.35;color:var(--ink);margin-bottom:8px}
.ftrt-ch .em{color:var(--accent-d)}
.ftrt-cb{font-family:var(--font-body);font-size:15px;line-height:1.65;color:var(--ink-2)}
.ftrt-cb .em{color:var(--accent-d);font-weight:600}
`,
  render: (d, { esc, richSafe, icon }) => {
    const bgStyle = d.skyBg ? ` style="background:${esc(d.skyBg)}"` : ''
    const hw = d.headword ?? 'check point'

    const cards = d.items
      .map(
        (it) => `
    <div class="ftrt-card">
      <div class="ftrt-icon-wrap">
        <div class="ftrt-icon">${icon(it.icon ?? 'check')}</div>
      </div>
      <div class="ftrt-ch">${richSafe(it.heading)}</div>
      <div class="ftrt-cb">${richSafe(it.body)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="ftrt"${bgStyle}>
  <div class="ftrt-head">
    <p class="ftrt-hw">${esc(hw)}</p>
    <div class="ftrt-badge-wrap">
      <span class="ftrt-badge">${richSafe(d.badge)}</span>
    </div>
  </div>
  <div class="ftrt-grid">
    ${cards}
  </div>
</section>`
  },
})
