/** FEATURE 아키타입: feature-pivot-arc-shot.
 *  베이지 배경 + 번호 pill + 센터 타이틀/설명 + 전체폭 제품 사진 위
 *  파란색 반투명 부채꼴 화살표 2개(좌/우 회전 각도 시각화) SVG 오버레이.
 *  원본: 296_제품특징_31.json (860px 데스크톱 확장 재구성) */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  number: z.string().min(1).optional(),       // pill 번호 레이블 (기본 "01")
  title: z.string().min(1),                   // 대제목 (em,br) — 수치+특징 2행
  desc: z.string().optional(),                // 부제목 설명 (em,br)
  image: z.string().optional(),               // 제품 사진 (url) — 없으면 플레이스홀더로 강등
  arcLabel: z.string().optional(),            // 화살표 중앙 텍스트 레이블 (기본 생략)
})
type Data = z.infer<typeof schema>

export const featurePivotArcShot = defineBlock<Data>({
  id: 'feature-pivot-arc-shot',
  archetype: 'feature',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 회전/각도 특징 블록. 베이지 배경 + 번호 pill + 센터 대제목·설명 + 전체폭 제품 사진 + 파란 반투명 부채꼴 화살표 2개 SVG 오버레이로 좌우 피벗 범위 시각화. 이미지 부재 시 화살표만 표시되는 강등 렌더.',
  schema,
  css: `
.fikv{background:var(--bg,#dfdeda);padding:0 0 60px;font-family:var(--font-body)}
.fikv-top{padding:36px var(--pad-x,56px) 0;display:flex;flex-direction:column;align-items:center}
.fikv-pill{display:inline-flex;align-items:center;justify-content:center;
  background:var(--ink,#111);color:#fff;
  width:60px;height:60px;
  border-radius:999px;
  font-family:var(--font-display);font-size:28px;font-weight:700;line-height:1}
.fikv-spacer{width:100%;height:3px;background:color-mix(in srgb,var(--ink,#111) 18%,transparent);
  border-radius:calc(var(--r-scale,1)*2px);margin:22px 0 28px}
.fikv-title{font-family:var(--font-display);font-size:clamp(48px,7.5vw,80px);font-weight:600;
  line-height:1.12;text-align:center;color:var(--ink,#111);white-space:pre-wrap}
.fikv-title .em{color:var(--accent)}
.fikv-desc{margin-top:18px;font-size:clamp(18px,2.6vw,26px);font-weight:400;
  line-height:1.65;text-align:center;color:var(--ink-2);max-width:680px}
.fikv-desc .em{color:var(--accent);font-weight:600}
.fikv-photo-wrap{position:relative;width:100%;margin-top:36px;
  aspect-ratio:860/981;overflow:hidden;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
.fikv-photo-wrap img,.fikv-photo-wrap .ph{
  width:100%;height:100%;object-fit:cover;display:block;
  border-radius:inherit}
/* noimg-safe: 이미지 없어도 배경으로 면 유지 */
.fikv-photo-wrap.fikv-noimg{
  background:color-mix(in srgb,var(--ink,#111) 8%,transparent);
  aspect-ratio:860/560}
.fikv-arc-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
/* 화살표 SVG는 원본 860×981 좌표계 기준, 뷰박스로 자동 스케일 */
`,
  render: (d, { esc, richSafe }) => {
    const num = d.number ?? '01'
    const hasImg = typeof d.image === 'string' && d.image.length > 0

    /* 원본 860×981 좌표계:
       화살표1(왼쪽): x=35,y=378 w=338,h=251 — 오른쪽 방향 부채꼴(시계방향 호 + 화살 머리)
       화살표2(오른쪽): x=517,y=523 w=296,h=220 — 왼쪽 방향 부채꼴(반시계 호 + 화살 머리)
       fill: #30a4eb @ 60% opacity */
    const arcSvg = `
<svg class="fikv-arc-svg" viewBox="0 0 860 981" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- 화살표1: 좌하단 → 우상단 부채꼴 호 (반시계방향 스윙) -->
  <g fill="#30a4eb" opacity="0.60">
    <!-- 좌측 부채꼴: 중심 약 (35,629), 반지름 251, 각도 -70°~0° -->
    <path d="
      M 204 378
      A 251 251 0 0 0 35 542
      L 35 629
      A 168 168 0 0 1 204 465
      Z
    "/>
    <!-- 화살 머리 (위쪽 끝) -->
    <polygon points="204,378 230,420 170,412"/>
  </g>
  <!-- 화살표2: 우하단 → 좌상단 부채꼴 호 (시계방향 스윙) -->
  <g fill="#30a4eb" opacity="0.60">
    <!-- 우측 부채꼴: 중심 약 (813,743), 반지름 220, 각도 180°~250° -->
    <path d="
      M 656 523
      A 220 220 0 0 1 813 637
      L 813 743
      A 137 137 0 0 0 676 660
      Z
    "/>
    <!-- 화살 머리 (위쪽 끝) -->
    <polygon points="656,523 630,568 688,558"/>
  </g>
  ${d.arcLabel ? `<text x="430" y="720" text-anchor="middle" font-family="var(--font-display)" font-size="32" font-weight="700" fill="#30a4eb" opacity="0.85">${esc(d.arcLabel)}</text>` : ''}
</svg>`

    return `
<section class="fikv">
  <div class="fikv-top">
    <span class="fikv-pill">${esc(num)}</span>
    <div class="fikv-spacer"></div>
    <h2 class="fikv-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="fikv-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
  <div class="fikv-photo-wrap${hasImg ? '' : ' fikv-noimg'}">
    ${hasImg ? media(d.image, '', '제품 사진') : ''}
    ${arcSvg}
  </div>
</section>`
  },
})
