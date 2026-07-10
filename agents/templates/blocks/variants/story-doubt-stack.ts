/** STORY 아키타입: story-doubt-stack.
 *  094_내용_전개_구성_페이지_2 패턴 재구성.
 *  다크 배경 + 상단 원형 물음표 아이콘(호기심 유도) + 볼드 헤드라인,
 *  이미지 2개 수직 나열 + 각 이미지 아래 4줄 설명 텍스트.
 *  이미지 부재 시 이미지 영역 제거 후 설명만 노출하는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const panelSchema = z.object({
  image: z.string().optional(),       // (url)
  desc: z.string().min(1),            // 4줄 분량 설명 텍스트 (em,br)
})

const schema = z.object({
  headline: z.string().min(1),        // 볼드 대형 헤드라인 (em,br)
  panels: z.array(panelSchema).min(2).max(2),
})
type Data = z.infer<typeof schema>

export const storyDoubtStack = defineBlock<Data>({
  id: 'story-doubt-stack',
  archetype: 'story',
  styleTags: ['dark', 'editorial', 'bold', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '다크 배경 질문형 스토리 오프닝. 상단 원형 CSS 물음표 아이콘으로 호기심을 자극하고, 대형 볼드 헤드라인 아래 이미지+설명 패널 2개를 수직 나열. 이미지 없이도 붕괴하지 않는 noimg-safe 강등 구현.',
  schema,
  css: `
.sdrt{background:#1b1b1b;color:#ffffff;padding:64px var(--pad-x,56px) 72px;font-family:var(--font-body),'Pretendard',sans-serif}
/* 물음표 아이콘 */
.sdrt-icon-wrap{display:flex;justify-content:center;margin-bottom:36px}
.sdrt-icon{width:86px;height:86px;border-radius:50%;background:rgba(255,255,255,0.10);border:2.5px solid rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sdrt-icon-q{font-family:var(--font-display);font-weight:800;font-size:48px;line-height:1;color:#ffffff;letter-spacing:-.02em;user-select:none}
/* 헤드라인 */
.sdrt-hl{font-family:var(--font-display);font-weight:800;font-size:52px;line-height:1.22;letter-spacing:-.025em;color:#ffffff;margin-bottom:52px;word-break:keep-all}
.sdrt .em{color:var(--em-dark,#FFF7EA)}
/* 패널 */
.sdrt-panels{display:flex;flex-direction:column;gap:52px}
.sdrt-panel{}
/* 이미지 프레임 */
.sdrt-img{width:100%;aspect-ratio:709/483;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));display:block}
.sdrt-img-ph{width:100%;aspect-ratio:709/483;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));background:rgba(255,255,255,0.06)}
/* noimg-safe: 이미지 없으면 이미지 영역 통째로 숨김 */
.sdrt-img-wrap:empty,.sdrt-img-wrap:has(.ph){display:none}
/* 설명 텍스트 */
.sdrt-desc{margin-top:24px;font-size:18px;font-weight:700;line-height:1.8;color:#ffffff}
.sdrt-desc .em{color:var(--em-dark,#FFF7EA)}
/* 이미지 없을 때 설명 위 마진 제거 */
.sdrt-img-wrap:empty+.sdrt-desc,.sdrt-img-wrap:has(.ph)+.sdrt-desc{margin-top:0}
`,
  render: (d, { richSafe }) => {
    // noimg-safe: 패널 내 이미지가 하나라도 없으면 전 패널 이미지 영역 강등
    const withImgs = d.panels.every(
      (p) => typeof p.image === 'string' && p.image.length > 0,
    )

    const panelHtml = d.panels
      .map(
        (p) => `
    <div class="sdrt-panel">
      <div class="sdrt-img-wrap">${
        withImgs
          ? media(p.image, 'sdrt-img', '스토리 이미지')
          : '<div class="ph"></div>'
      }</div>
      <p class="sdrt-desc">${richSafe(p.desc)}</p>
    </div>`,
      )
      .join('')

    return `
<section class="sdrt">
  <div class="sdrt-icon-wrap">
    <div class="sdrt-icon">
      <span class="sdrt-icon-q">?</span>
    </div>
  </div>
  <h2 class="sdrt-hl">${richSafe(d.headline)}</h2>
  <div class="sdrt-panels">
    ${panelHtml}
  </div>
</section>`
  },
})
