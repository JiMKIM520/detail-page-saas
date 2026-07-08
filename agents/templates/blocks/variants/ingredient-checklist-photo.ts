/** INGREDIENT 아키타입: 04_원료소개 — 체크리스트 카드 + 하단 사진.
 *  흰 카드 안에 check아이콘+라벨+설명 4행(점선 구분) + 하단 풀폭 이미지 + 오버레이 캡션.
 *  와디즈 200섹션 패턴을 토큰 기반으로 재구성(클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),       // 영문 카테고리 라벨 (예 "INGREDIENTS")
  title: z.string().min(1),                     // 대형 제목 (em, br 허용)
  subtitle: z.string().min(1).optional(),       // 제목 아래 한 줄 설명
  items: z
    .array(
      z.object({
        label: z.string().min(1),               // 체크 라벨 (em 허용)
        desc: z.string().min(1).optional(),     // 설명 텍스트 (em, br 허용)
      }),
    )
    .min(2)
    .max(4),
  photo: z.string().optional(),                 // 하단 풀폭 이미지 (url)
  closer: z.string().min(1).optional(),         // 이미지 위 오버레이 캡션 (em, br 허용)
})
type Data = z.infer<typeof schema>

export const ingredientChecklistPhoto = defineBlock<Data>({
  id: 'ingredient-checklist-photo',
  archetype: 'ingredient',
  styleTags: ['light', 'trust', 'minimal', 'checklist', 'template'],
  imageSlots: 1,
  describe:
    '원료 소개(체크리스트+하단사진). 연한 배경 + 영문 아이브로 + 대형 제목 + 흰 카드(체크아이콘·라벨·설명 2~4행, 점선 구분) + 하단 풀폭 사진(오버레이 캡션). 신뢰감 강조 심플 라이트 레이아웃.',
  schema,
  css: `
.icp{background:var(--bg);color:var(--ink);padding:56px 0 0}
.icp-hd{padding:0 var(--pad-x,56px) 32px}
.icp-eye{display:block;font-size:13px;font-weight:700;letter-spacing:.2em;color:var(--ink-2);text-transform:uppercase;margin-bottom:10px}
.icp-title{font-family:var(--font-display);font-weight:800;font-size:58px;letter-spacing:-.02em;line-height:1.1;color:var(--accent)}
.icp-title .em{color:var(--accent)}
.icp-sub{margin-top:16px;font-size:17px;color:var(--ink);line-height:1.6}
.icp-rule{width:3px;height:48px;background:var(--accent);border-radius:calc(var(--r-scale,1)*2px);margin:20px 56px 0;opacity:.5}
.icp-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*20px);margin:24px 24px 0;padding:10px 0}
.icp-row{display:flex;align-items:flex-start;gap:14px;padding:22px 28px}
.icp-row+.icp-row{border-top:1px dashed color-mix(in srgb,var(--ink) 14%,transparent)}
.icp-icon{flex:0 0 28px;width:28px;height:28px;color:var(--accent);margin-top:1px}
.icp-body{flex:1;min-width:0}
.icp-label{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--accent);line-height:1.2}
.icp-label .em{color:var(--accent-d)}
.icp-desc{margin-top:6px;font-size:14px;color:var(--ink-2);line-height:1.65}
.icp-desc .em{color:var(--accent)}
.icp-photo-wrap{position:relative;margin-top:32px;width:100%;overflow:hidden}
.icp-photo{width:100%;height:340px;object-fit:cover;display:block}
.icp-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:32px 40px;background:linear-gradient(to top,rgba(0,0,0,.52) 0%,rgba(0,0,0,.0) 55%)}
.icp-closer{font-family:var(--font-display);font-weight:700;font-size:28px;color:#fff;text-align:center;line-height:1.45}
.icp-closer .em{font-weight:800;color:#fff}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="icp">
  <div class="icp-hd">
    ${d.eyebrow ? `<span class="icp-eye">${esc(d.eyebrow)}</span>` : ''}
    <h2 class="icp-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="icp-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="icp-rule"></div>
  <div class="icp-card">
    ${d.items
      .map(
        (it) => `
    <div class="icp-row">
      <span class="icp-icon">${icon('check')}</span>
      <div class="icp-body">
        <div class="icp-label">${richSafe(it.label)}</div>
        ${it.desc ? `<div class="icp-desc">${richSafe(it.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  <div class="icp-photo-wrap">
    ${media(d.photo, 'icp-photo', '원료 사진')}
    ${d.closer ? `<div class="icp-overlay"><p class="icp-closer">${richSafe(d.closer)}</p></div>` : ''}
  </div>
</section>`,
})
