/** DETAIL 아키타입: detail-spec-icon-bar
 *  원본: 284_제품소개_32.json (860px 모바일 → 872px 데스크톱 재구성)
 *  구조: 상단 블루 필 배지 + 대형 볼드 제목 + 설명 / 중간 둥근 사진 / 하단 흰 카드에 세로선 구분된 3열 원형 아이콘+텍스트 스펙 바
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const ICON_NAMES = [
  'wheat','drop','clock','badge','snow','check','fryer','oven','star',
  'heart','gift','truck','shield','leaf','trophy','thumb','fire',
  'person','search','pin','box','calendar','card','won','bulb','gear',
  'camera','phone','bolt','thermometer','target','store','doc','sprout','bell',
] as const

const schema = z.object({
  badge:   z.string().min(1),                  // 상단 배지 라벨 (순수 텍스트)
  title:   z.string().min(1),                  // 대형 볼드 제목 (em,br)
  desc:    z.string().optional(),              // 제목 아래 설명 (em,br)
  image:   z.string().optional(),              // 중간 사진 URL
  specs: z
    .array(
      z.object({
        icon:  z.enum(ICON_NAMES),             // 원형 영역 아이콘
        label: z.string().min(1),             // 아이콘 아래 스펙 텍스트 (순수)
      }),
    )
    .min(2)
    .max(4),                                  // 2~4열 (3열이 전형)
})
type Data = z.infer<typeof schema>

export const detailSpecIconBar = defineBlock<Data>({
  id: 'detail-spec-icon-bar',
  archetype: 'detail',
  styleTags: ['light', 'clean', 'product', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '제품 상세 3단 구성: 상단 블루 필 배지+대형 볼드 제목+설명, 중간 둥근 직사각 사진, 하단 흰 카드에 세로선 구분된 원형 아이콘+라벨 N열 스펙 바. 전자기기·생활용품 스펙 요약에 적합.',
  schema,
  css: `
.dsib{background:var(--bg);padding:48px var(--pad-x,56px) 52px;color:var(--ink)}
.dsib-badge{display:inline-block;background:var(--accent);color:#fff;font-size:18px;font-weight:700;padding:7px 22px;border-radius:calc(var(--r-scale,1)*999px);letter-spacing:.02em;margin-bottom:22px}
.dsib-title{font-family:var(--font-display);font-weight:800;font-size:44px;line-height:1.22;letter-spacing:-.02em;margin-bottom:14px}
.dsib-title .em{color:var(--accent)}
.dsib-desc{font-size:20px;font-weight:500;color:var(--ink-2);line-height:1.6}
.dsib-desc .em{color:var(--accent);font-weight:700}
.dsib-photo{margin:28px 0;width:100%;aspect-ratio:740/500;border-radius:var(--shape-photo,calc(var(--r-scale,1)*18px));overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper))}
.dsib-photo img,.dsib-photo .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.dsib-bar{background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);padding:22px 0;display:flex;align-items:stretch}
.dsib-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;padding:4px 12px;position:relative}
.dsib-col+.dsib-col::before{content:"";position:absolute;left:0;top:10%;bottom:10%;width:1px;background:var(--line)}
.dsib-icon{width:52px;height:52px;border-radius:999px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dsib-icon svg{width:26px;height:26px;stroke:var(--ink);color:var(--ink)}
.dsib-label{font-size:16px;font-weight:600;color:var(--ink);text-align:center;line-height:1.35}
`,
  render: (d, { esc, richSafe, icon }) => {
    // noimg-safe: 이미지 없을 때 사진 프레임 숨김 (붕괴 없이 배지+제목+스펙바 단독 유지)
    const hasImg = typeof d.image === 'string' && d.image.length > 0
    return `
<section class="dsib">
  <span class="dsib-badge">${esc(d.badge)}</span>
  <h2 class="dsib-title">${richSafe(d.title)}</h2>
  ${d.desc ? `<p class="dsib-desc">${richSafe(d.desc)}</p>` : ''}
  ${hasImg ? `<div class="dsib-photo">${media(d.image, '', '제품 이미지')}</div>` : ''}
  <div class="dsib-bar">
    ${d.specs.map((s) => `
    <div class="dsib-col">
      <div class="dsib-icon">${icon(s.icon)}</div>
      <span class="dsib-label">${esc(s.label)}</span>
    </div>`).join('')}
  </div>
</section>`
  },
})
