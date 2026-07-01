/** FEATURE 아키타입(템플릿 충실 재현): feature-split-panels.
 *  와디즈 200섹션 "03_특장점" 50/50 지그재그 분할 패널(_184:1048) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(아이브로+대제목+구분선) + 번호/소제목/설명 accent 패널과 이미지가 교대 배치(지그재그) + 다크 마무리 카피밴드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  eyebrow: z.string().min(1).optional(),            // 헤더 상단 소제목 (예: "우리 제품이 특별한 이유를 직접 체험해보세요")
  title: z.string().min(1),                          // 섹션 대제목 (em,br)
  rows: z
    .array(
      z.object({
        subtitle: z.string().min(1),                 // 패널 소제목 (em,br)
        desc: z.string().min(1).optional(),          // 패널 설명 (em,br)
        image: z.string().optional(),                // 이미지 슬롯 (url)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),             // 다크 마무리 카피 (em,br)
})
type Data = z.infer<typeof schema>

export const featureSplitPanels = defineBlock<Data>({
  id: 'feature-split-panels',
  archetype: 'feature',
  styleTags: ['premium', 'cobalt', 'editorial', 'template', 'zigzag'],
  imageSlots: 3,
  describe:
    '특장점 50/50 지그재그 분할 패널. 시그니처 헤더(아이브로+대제목+하단 구분선) + accent 배경 텍스트 패널(번호+소제목+설명)과 이미지가 좌우 교대(홀=텍스트 왼쪽, 짝=이미지 왼쪽) + 다크 accent 마무리 카피밴드. 색블록 지그재그 구성.',
  schema,
  css: `
.fsp{background:var(--bg);color:var(--ink)}
/* ── 헤더 ── */
.fsp-hd{text-align:center;padding:56px 56px 46px}
.fsp-eye{font-size:16px;font-weight:500;color:var(--ink-2);margin-bottom:12px}
.fsp-title{font-family:var(--font-display);font-weight:800;font-size:58px;color:var(--accent);letter-spacing:-.02em;line-height:1.1}
.fsp-title .em{color:var(--ink)}
.fsp-div{width:52px;height:4px;border-radius:2px;background:var(--accent);margin:18px auto 0}
/* ── 지그재그 행 ── */
.fsp-rows{display:flex;flex-direction:column}
.fsp-row{display:flex;width:100%;min-height:320px}
/* 홀수 행(1,3): 텍스트 패널 왼쪽 */
.fsp-row:nth-child(odd) .fsp-panel{order:0}
.fsp-row:nth-child(odd) .fsp-img-wrap{order:1}
/* 짝수 행(2,4): 이미지 왼쪽 */
.fsp-row:nth-child(even) .fsp-img-wrap{order:0}
.fsp-row:nth-child(even) .fsp-panel{order:1}
/* ── accent 텍스트 패널 ── */
.fsp-panel{flex:0 0 50%;width:50%;background:var(--accent);color:#fff;padding:44px 40px;display:flex;flex-direction:column;justify-content:center}
.fsp-no{font-size:15px;font-weight:600;color:rgba(255,255,255,.75);letter-spacing:.04em;margin-bottom:12px}
.fsp-subtitle{font-family:var(--font-display);font-weight:800;font-size:30px;line-height:1.25;color:#fff}
.fsp-subtitle .em{color:color-mix(in srgb,#fff 70%,var(--accent-d))}
.fsp-desc{margin-top:16px;font-size:14px;line-height:1.7;color:rgba(255,255,255,.88)}
.fsp-desc .em{font-weight:700;color:#fff}
/* ── 이미지 래퍼 ── */
.fsp-img-wrap{flex:0 0 50%;width:50%;overflow:hidden}
.fsp-img-wrap img,.fsp-img-wrap .fsp-ph{width:100%;height:100%;object-fit:cover;display:block}
.fsp-ph{min-height:320px}
/* ── 마무리 카피 밴드 ── */
.fsp-closer{background:var(--accent);padding:52px 48px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:38px;line-height:1.45;color:#fff}
.fsp-closer .em{color:color-mix(in srgb,#fff 65%,var(--accent-d))}
`,
  render: (d, { esc, richSafe }) => `
<section class="fsp">
  <div class="fsp-hd">
    ${d.eyebrow ? `<p class="fsp-eye">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="fsp-title">${richSafe(d.title)}</h2>
    <div class="fsp-div"></div>
  </div>
  <div class="fsp-rows">
    ${d.rows
      .map(
        (row, i) => `
    <div class="fsp-row">
      <div class="fsp-panel">
        <div class="fsp-no">${pad2(i + 1)}.</div>
        <div class="fsp-subtitle">${richSafe(row.subtitle)}</div>
        ${row.desc ? `<div class="fsp-desc">${richSafe(row.desc)}</div>` : ''}
      </div>
      <div class="fsp-img-wrap">
        ${media(row.image, 'fsp-ph', `특장점 이미지 ${pad2(i + 1)}`)}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<div class="fsp-closer">${richSafe(d.closer)}</div>` : ''}
</section>`,
})
