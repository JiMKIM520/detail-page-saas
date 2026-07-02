/** USAGE 아키타입(템플릿 충실 재현): usage-card-number.
 *  와디즈 200섹션 05_사용법 _05(HOW TO USE + 카드 행 + 초대형 번호) 패턴 재구성.
 *  라이트 배경 + 좌상단 영문 대제목 + 부제목 + 각 단계마다 독립 카드(좌측 초대형 숫자 + 우측 설명) + 마무리 카피 + 선택적 이미지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(),    // 섹션 대제목 (기본 "HOW TO USE")
  subtitle: z.string().min(1).optional(), // 대제목 아래 부제목
  steps: z
    .array(
      z.object({
        label: z.string().min(1),  // 카드 우측 주 설명 (em,br)
        desc: z.string().min(1).optional(), // 카드 우측 보조 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),    // 마무리 카피 (em,br)
  closerEmphasis: z.string().min(1).optional(), // 마무리 강조 카피 (em,br)
  image: z.string().optional(),            // 마무리 영역 우측 이미지 (url)
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const usageCardNumber = defineBlock<Data>({
  id: 'usage-card-number',
  archetype: 'usage',
  styleTags: ['premium', 'light', 'template', 'howto', 'numbered', 'card'],
  imageSlots: 1,
  describe:
    '사용법(카드 행+초대형 번호). 라이트 배경 + 좌상단 영문 대제목(HOW TO USE) + 부제목 + 단계마다 흰 카드(좌측 초대형 숫자·우측 설명) 세로 나열 + 마무리 카피(일반+강조)+이미지. 깔끔 스텝 가이드.',
  schema,
  css: `
.ucn{background:var(--bg);color:var(--ink);padding:56px 52px 0}
.ucn-hd{margin-bottom:36px}
.ucn-title{font-family:var(--font-display);font-weight:800;font-size:72px;color:var(--accent);letter-spacing:-.01em;line-height:1.0}
.ucn-sub{margin-top:10px;font-size:17px;color:var(--ink-2);font-weight:500}
.ucn-cards{display:flex;flex-direction:column;gap:16px}
.ucn-card{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:28px 32px;display:flex;align-items:center;gap:28px;min-height:100px}
.ucn-num{flex:0 0 auto;font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-weight:700;font-size:80px;line-height:1;color:var(--accent);letter-spacing:-.03em;min-width:96px;text-align:right;user-select:none}
.ucn-divider{width:2px;height:64px;background:var(--line);border-radius:2px;flex:0 0 2px}
.ucn-tx{flex:1;min-width:0}
.ucn-label{font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--ink);line-height:1.45}
.ucn-label .em{color:var(--accent)}
.ucn-desc{margin-top:6px;font-size:15px;color:var(--ink-2);line-height:1.65}
.ucn-desc .em{color:var(--accent);font-weight:700}
.ucn-footer{margin-top:48px;display:flex;align-items:flex-end;gap:0;padding-bottom:0}
.ucn-footer-tx{flex:1;padding-bottom:52px}
.ucn-closer{font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--ink);line-height:1.5}
.ucn-closer .em{color:var(--accent);font-weight:800}
.ucn-closer-em{margin-top:6px;font-family:var(--font-display);font-weight:800;font-size:34px;color:var(--accent);line-height:1.35}
.ucn-closer-em .em{color:var(--ink)}
.ucn-img{flex:0 0 280px;width:280px;height:260px;object-fit:cover;border-radius:14px 14px 0 0;align-self:flex-end}
`,
  render: (d, { esc, richSafe }) => `
<section class="ucn">
  <div class="ucn-hd">
    <h2 class="ucn-title">${esc(d.title ?? 'HOW TO USE')}</h2>
    ${d.subtitle ? `<p class="ucn-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ucn-cards">
    ${d.steps
      .map(
        (s, i) => `
    <div class="ucn-card">
      <div class="ucn-num">${pad2(i + 1)}</div>
      <div class="ucn-divider"></div>
      <div class="ucn-tx">
        <div class="ucn-label">${richSafe(s.label)}</div>
        ${s.desc ? `<div class="ucn-desc">${richSafe(s.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${(d.closer || d.closerEmphasis || d.image) ? `
  <div class="ucn-footer">
    <div class="ucn-footer-tx">
      ${d.closer ? `<p class="ucn-closer">${richSafe(d.closer)}</p>` : ''}
      ${d.closerEmphasis ? `<p class="ucn-closer-em">${richSafe(d.closerEmphasis)}</p>` : ''}
    </div>
    ${d.image ? media(d.image, 'ucn-img', '사용법 이미지') : ''}
  </div>` : '<div style="padding-bottom:56px"></div>'}
</section>`,
})
