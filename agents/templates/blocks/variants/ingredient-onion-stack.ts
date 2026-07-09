/** INGREDIENT 아키타입: ingredient-onion-stack
 *  원본: 148_성분소개_05.json — 상단 뱃지+헤드라인 + 3개 반투명 타원이 세로로 겹쳐 쌓인 온이언(양파) 구조.
 *  각 타원이 성분 카테고리 1개를 레이어로 표현하고, 타원 사이 '+' 기호가 복합 시너지를 암시.
 *  원본 860px 모바일 → 872px 데스크톱으로 확장. 색·폰트 전부 토큰, 카피는 zod 슬롯. */
import { z } from 'zod'
import { defineBlock } from '../types'

// 타원 레이어 1개 = 성분 카테고리 이름 + 한 줄 부제
const layerSchema = z.object({
  name: z.string().min(1),    // 예: '비타민 13종 (활력 에너지)'  (em,br)
  detail: z.string().min(1),  // 예: '활성형 비타민 B군 고함량'
})

const schema = z.object({
  badge: z.string().optional(),          // 상단 라운드 뱃지 라벨, 예: '성분안내'
  title: z.string().min(1),             // 대제목 (em,br), 예: '한 알로 채우는 건강'
  subtitle: z.string().optional(),       // 부제 (em,br), 예: '비타민 / 미네랄 / 루테인까지 올인원 영양 솔루션'
  layers: z.array(layerSchema).min(2).max(4), // 타원 레이어 2~4개
  note: z.string().optional(),           // 하단 작은 주석 (순수 텍스트, 브리프 근거 시만)
})
type Data = z.infer<typeof schema>

export const ingredientOnionStack = defineBlock<Data>({
  id: 'ingredient-onion-stack',
  archetype: 'ingredient',
  styleTags: ['light', 'health', 'food', 'editorial'],
  imageSlots: 0,
  describe:
    '온이언(양파) 타원 스택 성분 소개. 상단 뱃지+대제목+부제 + 반투명 타원 2~4개가 세로로 겹쳐 쌓이며 각 성분 카테고리를 레이어로 표현. 타원 사이 + 기호로 복합 시너지 강조. 건강기능식품·종합 영양제 올인원 성분 설명에 적합.',
  schema,
  css: `
/* ── 전체 섹션 ── */
.ihvu{background:var(--bg);color:var(--ink);padding:66px var(--pad-x,56px) 80px;text-align:center}

/* ── 상단 헤더 영역 ── */
.ihvu-badge-wrap{margin-bottom:28px}
.ihvu-badge{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.06em;padding:10px 32px;border-radius:999px}
.ihvu-title{font-family:var(--font-display);font-weight:800;font-size:58px;letter-spacing:-.02em;line-height:1.12;color:var(--ink)}
.ihvu-title .em{color:var(--accent)}
.ihvu-subtitle{margin-top:18px;font-size:21px;font-weight:500;line-height:1.6;color:var(--ink-2)}
.ihvu-subtitle .em{color:var(--accent);font-weight:700}

/* ── 타원 스택 ── */
.ihvu-stack{position:relative;margin:52px auto 0;max-width:780px}

/* 타원 공통 */
.ihvu-layer{position:relative;width:100%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;/* 겹침: 각 타원의 아래 절반을 다음 타원 위에 얹는다 */margin-bottom:-80px}
.ihvu-layer:last-child{margin-bottom:0}

/* 층별 크기+불투명도 — 위에서 아래로 갈수록 좁아지며 색이 진해짐(양파 단면 원근감) */
.ihvu-layer:nth-child(odd) .ihvu-ellipse {height:230px}
.ihvu-layer:nth-child(even) .ihvu-ellipse{height:210px}

.ihvu-ellipse{position:relative;width:100%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:0 60px}

/* 층별 배경 색조 (1=가장 연, 마지막=진함) */
.ihvu-layer:nth-child(1) .ihvu-ellipse{background:color-mix(in srgb,var(--accent) 10%,transparent);height:220px}
.ihvu-layer:nth-child(2) .ihvu-ellipse{background:color-mix(in srgb,var(--accent) 20%,transparent);height:210px}
.ihvu-layer:nth-child(3) .ihvu-ellipse{background:color-mix(in srgb,var(--accent) 30%,transparent);height:200px}
.ihvu-layer:nth-child(4) .ihvu-ellipse{background:color-mix(in srgb,var(--accent) 40%,transparent);height:190px}

/* 텍스트: 타원 위에 z-index로 부상 */
.ihvu-layer-name{position:relative;z-index:2;font-family:var(--font-display);font-weight:700;font-size:26px;line-height:1.25;color:var(--ink)}
.ihvu-layer-name .em{color:var(--accent)}
.ihvu-layer-detail{position:relative;z-index:2;font-size:18px;font-weight:500;line-height:1.45;color:var(--ink-2)}

/* '+' 기호 구분선 — 스택 사이 시너지 암시 */
.ihvu-plus{position:relative;z-index:3;text-align:center;font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--accent);margin:-10px 0;line-height:1}

/* 하단 주석 */
.ihvu-note{margin-top:104px;font-size:13px;color:var(--muted);line-height:1.55;letter-spacing:.01em}
`,
  render: (d, { esc, richSafe }) => {
    const layersHtml = d.layers
      .map(
        (lyr, i) =>
          (i > 0
            ? `<div class="ihvu-plus" aria-hidden="true">+</div>`
            : '') +
          `<div class="ihvu-layer">
  <div class="ihvu-ellipse">
    <div class="ihvu-layer-name">${richSafe(lyr.name)}</div>
    <div class="ihvu-layer-detail">${esc(lyr.detail)}</div>
  </div>
</div>`,
      )
      .join('\n')

    return `
<section class="ihvu">
  <div class="ihvu-badge-wrap">
    ${d.badge ? `<span class="ihvu-badge">${esc(d.badge)}</span>` : ''}
  </div>
  <h2 class="ihvu-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="ihvu-subtitle">${richSafe(d.subtitle)}</p>` : ''}
  <div class="ihvu-stack" role="list" aria-label="성분 레이어 구조">
${layersHtml}
  </div>
  ${d.note ? `<p class="ihvu-note">${esc(d.note)}</p>` : ''}
</section>`
  },
})
