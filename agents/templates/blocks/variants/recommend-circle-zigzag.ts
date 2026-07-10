/** RECOMMEND 아키타입: recommend-circle-zigzag.
 *  피그마 154_추천_05 패턴 재구성.
 *  상단 아이콘+2줄 헤드라인 + 3개 행(정원 썸네일·오렌지 pill 뱃지·제목·설명)의 지그재그 교차 배치.
 *  홀수 행=이미지왼쪽·텍스트오른쪽, 짝수 행=텍스트왼쪽·이미지오른쪽.
 *  noimg-safe: 이미지 전무 시 원형 프레임을 숨기고 텍스트 전용 행으로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 아이콘 — 허용 이름은 shared ICON_NAMES 35종. 기본 'person' */
  icon: z.string().optional(),
  /** 대형 주제목 (em,br) — 원본 fs:75 파란색 */
  headline: z.string().min(1),
  /** 보조 한 줄 설명 (em,br) — 원본 fs:65 검정 */
  subHeadline: z.string().optional(),
  /** 추천 대상 행. 최소 2, 최대 4 */
  items: z
    .array(
      z.object({
        /** 정원 썸네일 이미지 (url). 없으면 원형 프레임 숨김 */
        image: z.string().optional(),
        /** 오렌지 pill 뱃지 텍스트 — 예: "option 01" */
        badge: z.string().min(1),
        /** 행 제목 (em,br) */
        title: z.string().min(1),
        /** 설명 최대 5줄 (em,br) */
        desc: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const recommendCircleZigzag = defineBlock<Data>({
  id: 'recommend-circle-zigzag',
  archetype: 'recommend',
  // noimg-safe: 이미지 전무 시 원형 프레임 생략하고 텍스트 전용 행으로 강등 렌더
  styleTags: ['light', 'zigzag', 'editorial', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '추천 대상(지그재그 교차). 라이트 배경 + 상단 아이콘·대형 주제목·보조설명 + 2~4행 정원(50%) 썸네일·오렌지 pill 뱃지·제목·설명 교차 배치. 홀수=이미지왼쪽, 짝수=이미지오른쪽.',
  schema,
  css: `
.rnic{background:var(--bg);color:var(--ink);padding:60px 0 68px}
.rnic-hd{text-align:center;padding:0 var(--pad-x,56px) 0}
.rnic-icon{display:flex;justify-content:center;margin-bottom:18px}
.rnic-icon svg{width:64px;height:64px;color:var(--accent)}
.rnic-headline{font-family:var(--font-display);font-weight:800;font-size:52px;color:var(--accent);letter-spacing:-.02em;line-height:1.1;text-align:center}
.rnic-headline .em{color:var(--accent-d)}
.rnic-subheadline{margin-top:10px;font-family:var(--font-display);font-weight:500;font-size:34px;color:var(--ink);letter-spacing:-.01em;line-height:1.25;text-align:center}
.rnic-subheadline .em{color:var(--accent)}
.rnic-list{margin-top:44px;display:flex;flex-direction:column;gap:24px;padding:0 var(--pad-x,56px)}
/* 각 행 */
.rnic-row{display:flex;align-items:center;gap:32px;background:var(--paper);border-radius:calc(var(--r-scale,1)*24px);padding:28px 32px;min-height:200px}
.rnic-row.rev{flex-direction:row-reverse}
/* 이미지가 없을 때(noimg-safe): 원형 래퍼 자체를 숨겨 텍스트 전용 행으로 */
.rnic-row.noimg{padding:28px 40px}
/* 정원 썸네일 래퍼 */
.rnic-circle-wrap{flex:0 0 160px;width:160px;height:160px}
.rnic-circle{width:160px;height:160px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,transparent)}
.rnic-circle img,.rnic-circle .ph{width:100%;height:100%;object-fit:cover;border-radius:50%}
/* 텍스트 영역 */
.rnic-body{flex:1;min-width:0}
.rnic-badge{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:700;font-size:15px;padding:5px 18px;border-radius:999px;letter-spacing:.04em;margin-bottom:12px}
.rnic-title{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--ink);line-height:1.35;margin-bottom:10px}
.rnic-title .em{color:var(--accent-d)}
.rnic-desc{font-size:15px;color:var(--ink-2);line-height:1.75;white-space:pre-line}
.rnic-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 전 행에 이미지가 있을 때만 원형 프레임을 그린다(균일화 가드).
    // 하나라도 없으면 텍스트 전용 행으로 강등해 빈 원형 노출을 방지.
    const withImgs = d.items.every((it) => typeof it.image === 'string' && it.image.length > 0)

    const iconName = d.icon ?? 'person'

    return `
<section class="rnic">
  <div class="rnic-hd">
    <div class="rnic-icon">${icon(iconName)}</div>
    <h2 class="rnic-headline">${richSafe(d.headline)}</h2>
    ${d.subHeadline ? `<p class="rnic-subheadline">${richSafe(d.subHeadline)}</p>` : ''}
  </div>
  <div class="rnic-list">
    ${d.items
      .map((item, i) => {
        const isRev = i % 2 === 1
        const rowClass = `rnic-row${isRev ? ' rev' : ''}${!withImgs ? ' noimg' : ''}`
        return `<div class="${rowClass}">
      ${withImgs ? `<div class="rnic-circle-wrap">
        <div class="rnic-circle">${media(item.image, '', '추천 대상')}</div>
      </div>` : ''}
      <div class="rnic-body">
        <span class="rnic-badge">${esc(item.badge)}</span>
        <p class="rnic-title">${richSafe(item.title)}</p>
        <p class="rnic-desc">${richSafe(item.desc)}</p>
      </div>
    </div>`
      })
      .join('\n    ')}
  </div>
</section>`
  },
})
