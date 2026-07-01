/** FEATURE 아키타입(템플릿 충실 재현): feature-arc-timeline.
 *  와디즈 200섹션 "03_특장점" 아크 타임라인(_184:971) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(대제목+서브) + 좌측 제품이미지 + 우측 3개 원형 넘버 노드(아크 SVG 곡선 연결) + 각 노드 오른쪽 부제목/설명 + 하단 accent 클로저 배너. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  title: z.string().min(1),              // 섹션 대제목 (em,br)
  subtitle: z.string().min(1).optional(), // 헤더 서브카피
  image: z.string().optional(),           // 좌측 제품 이미지 (url)
  nodes: z
    .array(
      z.object({
        heading: z.string().min(1),         // 노드 오른쪽 소제목 (em,br)
        desc: z.string().min(1).optional(), // 노드 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(), // 하단 accent 배너 카피 (em,br)
})
type Data = z.infer<typeof schema>

/** 노드 개수에 따른 아크 SVG 곡선 경로 생성.
 *  뷰박스 100×100: 노드는 x=50, y 위치는 균등 분배. 좌측으로 휘는 S-커브. */
function buildArcSvg(count: number): string {
  const nodeYPositions: number[] = []
  for (let i = 0; i < count; i++) {
    nodeYPositions.push(Math.round(10 + (80 / Math.max(count - 1, 1)) * i))
  }
  const top = nodeYPositions[0]
  const bot = nodeYPositions[nodeYPositions.length - 1]
  const cx = 30 // 왼쪽으로 휘는 제어점 x
  const midY = (top + bot) / 2
  // S-커브: 위→중간(왼쪽)→아래
  const d = `M 50 ${top} C ${cx} ${top}, ${cx} ${midY}, 50 ${midY} S 70 ${bot}, 50 ${bot}`
  return `<svg class="fat-arc" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${d}" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/></svg>`
}

export const featureArcTimeline = defineBlock<Data>({
  id: 'feature-arc-timeline',
  archetype: 'feature',
  styleTags: ['premium', 'cobalt', 'editorial', 'template', 'timeline'],
  imageSlots: 1,
  describe:
    '특장점 아크 타임라인. 중앙 헤더(대제목+서브) + 좌측 제품 이미지 + 우측 원형 넘버 노드(아크 SVG 곡선 연결)+각 노드 소제목/설명 + 하단 accent 배너. 넘버드 스텝을 곡선으로 시각화.',
  schema,
  css: `
.fat{background:var(--bg);color:var(--ink);padding:0 0 0}
.fat-hd{text-align:center;padding:58px 44px 36px}
.fat-title{font-family:var(--font-display);font-weight:800;font-size:58px;color:var(--accent);letter-spacing:-.02em;line-height:1.12}
.fat-title .em{color:var(--ink)}
.fat-sub{margin-top:14px;font-size:17px;color:var(--ink-2)}
.fat-body{position:relative;display:grid;grid-template-columns:260px 1fr;min-height:540px;overflow:hidden}
.fat-img{width:260px;height:100%;object-fit:cover;display:block}
.fat-right{position:relative;display:flex;flex-direction:column;justify-content:center;padding:32px 40px 32px 0}
.fat-arc{position:absolute;left:-12px;top:0;width:100px;height:100%;pointer-events:none;overflow:visible}
.fat-nodes{display:flex;flex-direction:column;justify-content:space-around;height:100%;padding:20px 0;gap:0}
.fat-node{display:flex;align-items:flex-start;gap:18px;position:relative}
.fat-circle{flex:0 0 62px;width:62px;height:62px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Cafe24 ClassicType',serif;font-size:22px;font-weight:400;letter-spacing:.02em;position:relative;z-index:1;flex-shrink:0}
.fat-tx{flex:1;padding-top:6px}
.fat-heading{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--accent);line-height:1.25}
.fat-heading .em{color:var(--ink)}
.fat-desc{margin-top:6px;font-size:14px;color:var(--ink-2);line-height:1.65}
.fat-desc .em{color:var(--accent);font-weight:700}
.fat-closer{background:var(--accent);color:#fff;text-align:center;padding:60px 44px}
.fat-closer-text{font-family:var(--font-display);font-weight:800;font-size:40px;line-height:1.35;letter-spacing:-.01em}
.fat-closer-text .em{color:color-mix(in srgb,#fff 70%,var(--accent))}
`,
  render: (d, { esc, richSafe }) => {
    const nodeCount = d.nodes.length
    const arcSvg = buildArcSvg(nodeCount)

    const nodesHtml = d.nodes
      .map(
        (n, i) => `
      <div class="fat-node">
        <div class="fat-circle">${pad2(i + 1)}</div>
        <div class="fat-tx">
          <div class="fat-heading">${richSafe(n.heading)}</div>
          ${n.desc ? `<div class="fat-desc">${richSafe(n.desc)}</div>` : ''}
        </div>
      </div>`,
      )
      .join('')

    return `
<section class="fat">
  <div class="fat-hd">
    <h2 class="fat-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fat-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="fat-body">
    ${media(d.image, 'fat-img', '제품 이미지')}
    <div class="fat-right">
      ${arcSvg}
      <div class="fat-nodes">
        ${nodesHtml}
      </div>
    </div>
  </div>
  ${d.closer ? `<div class="fat-closer"><div class="fat-closer-text">${richSafe(d.closer)}</div></div>` : ''}
</section>`
  },
})
