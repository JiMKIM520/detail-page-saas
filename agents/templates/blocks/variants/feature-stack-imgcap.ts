/** FEATURE 아키타입: feature-stack-imgcap
 *  피그마 177_제품특징_10 흡수.
 *  라운드 pill 배너 + 중앙정렬 타이틀 + 3개 세로 스택
 *  (풀폭 사진 + 다크그린 하단 바 — 원형 아이콘 배너 좌측 + 제목·설명 우측).
 *  이미지 없어도 붕괴하지 않는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  image: z.string().optional(),          // 풀폭 제품 사진 (url)
  icon: z.string().optional(),           // 원형 아이콘 배너 내 아이콘 이름 (ICON_NAMES 35종)
  label: z.string().min(1),             // 아이콘 배너 아래 항목 제목 (순수 텍스트)
  desc: z.string().min(1),              // 항목 설명 (em,br 허용)
})

const schema = z.object({
  pill: z.string().optional(),           // 상단 pill 배너 텍스트 (순수 텍스트)
  title: z.string().min(1),             // 중앙 대제목 (em,br 허용)
  subtitle: z.string().optional(),       // 대제목 아래 보조 한 줄 (순수 텍스트)
  items: z.array(itemSchema).min(2).max(5), // 세로 스택 카드 (보통 3개)
})
type Data = z.infer<typeof schema>

export const featureStackImgcap = defineBlock<Data>({
  id: 'feature-stack-imgcap',
  archetype: 'feature',
  styleTags: ['light', 'product', 'stacked', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '제품 특징 세로 스택. 라운드 pill 배너 + 중앙 대제목 + N개 이미지-캡션 일체형 카드 스택. 각 카드는 풀폭 사진 아래에 다크 배경 바(원형 아이콘 + 제목 + 설명)가 붙는다. 이미지 없을 때는 다크 바만으로 자연스럽게 강등.',
  schema,
  css: `
.fsic{background:var(--bg);color:var(--ink);padding:54px 0 64px}
.fsic-pill-wrap{display:flex;justify-content:center;margin-bottom:28px}
.fsic-pill{display:inline-block;background:var(--accent);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.04em;padding:10px 32px;border-radius:999px;line-height:1.3}
.fsic-hd{text-align:center;padding:0 var(--pad-x,56px);margin-bottom:36px}
.fsic-title{font-family:var(--font-display);font-size:40px;font-weight:400;line-height:1.25;color:var(--ink)}
.fsic-title .em{color:var(--accent)}
.fsic-sub{margin-top:14px;font-size:17px;color:var(--ink-2);line-height:1.6}
.fsic-stack{display:flex;flex-direction:column;gap:20px;padding:0 var(--pad-x,56px)}
.fsic-card{border-radius:calc(var(--r-scale,1)*14px);overflow:hidden}
.fsic-photo{width:100%;aspect-ratio:760/500;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px) calc(var(--r-scale,1)*14px) 0 0)}
.fsic-photo.ph{display:none!important}
.fsic-bar{background:var(--accent-d,#2c5e1f);display:flex;align-items:center;gap:24px;padding:20px 28px}
.fsic-bar .em{color:var(--em-dark,#FFF7EA)}
.fsic-circle{flex:0 0 72px;width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center}
.fsic-circle svg{width:34px;height:34px;stroke:#ffffff;fill:none}
.fsic-txt{flex:1;min-width:0}
.fsic-lbl{font-family:var(--font-display);font-size:18px;font-weight:700;color:#ffffff;line-height:1.25;margin-bottom:6px}
.fsic-desc{font-size:15px;color:rgba(255,255,255,.82);line-height:1.6}
.fsic-desc .em{color:var(--em-dark,#FFF7EA);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasAnyImg = d.items.some((it) => typeof it.image === 'string' && it.image.length > 0)

    const cards = d.items
      .map((it) => {
        const photoEl = hasAnyImg
          ? media(it.image, 'fsic-photo', esc(it.label))
          : ''
        const iconSvg = icon(it.icon ?? 'check')
        return `
<div class="fsic-card">
  ${photoEl}
  <div class="fsic-bar">
    <div class="fsic-circle">${iconSvg}</div>
    <div class="fsic-txt">
      <div class="fsic-lbl">${esc(it.label)}</div>
      <div class="fsic-desc">${richSafe(it.desc)}</div>
    </div>
  </div>
</div>`
      })
      .join('')

    return `
<section class="fsic">
  ${d.pill ? `<div class="fsic-pill-wrap"><span class="fsic-pill">${esc(d.pill)}</span></div>` : ''}
  <div class="fsic-hd">
    <h2 class="fsic-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fsic-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="fsic-stack">${cards}
  </div>
</section>`
  },
})
