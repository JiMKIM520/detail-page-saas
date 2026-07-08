/** FEATURE 아키타입(템플릿 충실 재현): feature-spoke-diagram.
 *  와디즈 200섹션 "03_특장점" 삼각형 스포크 다이어그램(_184:998) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(대제목+부제) + 중앙 제품 이미지 + 삼각 꼭짓점 3개 콜아웃 노드 선 연결 + 다크 마무리 카피밴드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),           // 헤더 상단 소제목 (예: "우리 제품이 특별한 이유를 직접 체험해보세요")
  title: z.string().min(1),                         // 섹션 대제목 (em,br)
  productImage: z.string().optional(),             // 중앙 제품 이미지 (url, 누끼 권장)
  spokes: z
    .array(
      z.object({
        subtitle: z.string().min(1),               // 콜아웃 소제목 (em,br)
        desc: z.string().min(1).optional(),        // 콜아웃 설명 (em,br)
      }),
    )
    .min(3)
    .max(3),
  closer: z.string().min(1).optional(),            // 마무리 카피밴드 (em,br)
})
type Data = z.infer<typeof schema>

export const featureSpokeDiagram = defineBlock<Data>({
  id: 'feature-spoke-diagram',
  archetype: 'feature',
  styleTags: ['premium', 'cobalt', 'editorial', 'template', 'diagram'],
  imageSlots: 1,
  describe:
    '특장점 삼각형 스포크 다이어그램. 중앙정렬 헤더(대제목+부제) + 중앙 제품 이미지를 삼각형 꼭짓점 3개 콜아웃 노드와 선으로 연결하는 스포크 다이어그램 + 다크 마무리 카피밴드. 시각적 삼각 구도.',
  schema,
  css: `
.fsd{background:var(--bg);color:var(--ink)}
/* ── 헤더 ── */
.fsd-hd{text-align:center;padding:56px 48px 32px}
.fsd-eye{font-size:16px;font-weight:500;color:var(--ink-2);margin-bottom:14px}
.fsd-title{font-family:var(--font-display);font-weight:800;font-size:56px;color:var(--accent);letter-spacing:-.02em;line-height:1.1}
.fsd-title .em{color:var(--ink)}
/* ── 다이어그램 래퍼: 고정 높이로 absolute 좌표 기준점 확보 ── */
.fsd-diagram{position:relative;width:100%;min-height:520px;overflow:hidden}
/* 그라데이션 배경 */
.fsd-diagram::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 10%,transparent) 0%,color-mix(in srgb,var(--accent) 6%,transparent) 60%,var(--bg) 100%);pointer-events:none}
/* ── SVG 스포크 선 레이어: absolute로 전체 diagram 덮음 ── */
.fsd-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
/* ── 노드 배치: absolute 삼각 꼭짓점 위치 ── */
/* 상단 중앙 노드 */
.fsd-spoke-top{position:absolute;left:50%;top:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;text-align:center;width:200px;z-index:3}
/* 왼쪽 하단 노드 */
.fsd-spoke-left{position:absolute;left:0;bottom:0;text-align:left;width:200px;padding-right:8px;z-index:3}
/* 오른쪽 하단 노드 */
.fsd-spoke-right{position:absolute;right:0;bottom:0;text-align:right;width:200px;padding-left:8px;z-index:3}
/* ── 중앙 제품 이미지: absolute 중앙 ── */
.fsd-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;display:flex;align-items:center;justify-content:center}
.fsd-product{width:200px;height:240px;object-fit:contain;display:block}
/* ── 노드 점 ── */
.fsd-dot{width:20px;height:20px;border-radius:50%;border:3px solid var(--accent);background:var(--bg);display:block;flex-shrink:0}
.fsd-spoke-top .fsd-dot{margin:0 auto 10px}
.fsd-spoke-left .fsd-dot{margin:0 0 10px}
.fsd-spoke-right .fsd-dot{margin:0 0 10px;margin-left:auto}
/* ── 콜아웃 텍스트 ── */
.fsd-sub{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--accent);line-height:1.2}
.fsd-sub .em{color:var(--ink)}
.fsd-desc{margin-top:6px;font-size:13px;color:var(--ink-2);line-height:1.65}
.fsd-desc .em{color:var(--accent);font-weight:700}
/* ── 마무리 카피 밴드 ── */
.fsd-closer{margin:40px 24px 0;background:var(--accent);border-radius:calc(var(--r-scale,1)*20px);padding:48px 40px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:34px;line-height:1.5;color:#fff}
.fsd-closer .em{color:color-mix(in srgb,#fff 70%,var(--accent-d))}
`,
  render: (d, { esc, richSafe }) => {
    const top = d.spokes[0]
    const left = d.spokes[1]
    const right = d.spokes[2]
    // 삼각 꼭짓점 좌표 (viewBox="0 0 100 100" 퍼센트 공간)
    // 상단: (50, 4), 좌하: (8, 90), 우하: (92, 90), 중앙: (50, 50)
    const cx = 50, cy = 50   // 중앙 이미지 중심
    const tx = 50, ty = 4    // top node dot
    const lx = 8,  ly = 90   // left node dot
    const rx = 92, ry = 90   // right node dot
    return `
<section class="fsd">
  <div class="fsd-hd">
    ${d.eyebrow ? `<p class="fsd-eye">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="fsd-title">${richSafe(d.title)}</h2>
  </div>
  <div class="fsd-diagram">
    <!-- SVG: 삼각형 채우기 + 3개 스포크 선 -->
    <svg class="fsd-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <!-- 삼각형 반투명 채우기 (세 꼭짓점 연결) -->
      <polygon
        points="${tx},${ty} ${lx},${ly} ${rx},${ry}"
        fill="currentColor"
        style="color:color-mix(in srgb,var(--accent) 18%,transparent)"
      />
      <!-- 스포크 선: 중앙 → 상단 -->
      <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}"
        stroke="var(--accent)" stroke-width="0.6" opacity="0.7"/>
      <!-- 스포크 선: 중앙 → 좌하 -->
      <line x1="${cx}" y1="${cy}" x2="${lx}" y2="${ly}"
        stroke="var(--accent)" stroke-width="0.6" opacity="0.7"/>
      <!-- 스포크 선: 중앙 → 우하 -->
      <line x1="${cx}" y1="${cy}" x2="${rx}" y2="${ry}"
        stroke="var(--accent)" stroke-width="0.6" opacity="0.7"/>
      <!-- 외곽 삼각형 테두리 선 -->
      <polygon
        points="${tx},${ty} ${lx},${ly} ${rx},${ry}"
        fill="none"
        stroke="var(--accent)" stroke-width="0.5" opacity="0.45"
      />
    </svg>
    <!-- 꼭짓점 1: 상단 중앙 -->
    <div class="fsd-spoke-top">
      <span class="fsd-dot"></span>
      <div class="fsd-sub">${richSafe(top.subtitle)}</div>
      ${top.desc ? `<p class="fsd-desc">${richSafe(top.desc)}</p>` : ''}
    </div>
    <!-- 중앙 제품 이미지 -->
    <div class="fsd-center">
      ${media(d.productImage, 'fsd-product', '제품 이미지')}
    </div>
    <!-- 꼭짓점 2: 왼쪽 하단 -->
    <div class="fsd-spoke-left">
      <span class="fsd-dot"></span>
      <div class="fsd-sub">${richSafe(left.subtitle)}</div>
      ${left.desc ? `<p class="fsd-desc">${richSafe(left.desc)}</p>` : ''}
    </div>
    <!-- 꼭짓점 3: 오른쪽 하단 -->
    <div class="fsd-spoke-right">
      <span class="fsd-dot"></span>
      <div class="fsd-sub">${richSafe(right.subtitle)}</div>
      ${right.desc ? `<p class="fsd-desc">${richSafe(right.desc)}</p>` : ''}
    </div>
  </div>
  ${d.closer ? `<div class="fsd-closer">${richSafe(d.closer)}</div>` : ''}
</section>`
  },
})
