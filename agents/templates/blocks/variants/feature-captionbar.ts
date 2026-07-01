/** FEATURE 아키타입(템플릿 충실 재현): feature-captionbar.
 *  와디즈 200섹션 "03_특장점" 자막바 이미지 반복(_figma 1270:1251) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(아이브로+코발트 대제목+구분선) + [소제목 뱃지 → 풀폭 이미지 → 다크 자막바] 그룹 반복. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(), // 상단 작은 안내 카피
  title: z.string().min(1), // 섹션 대제목 (em,br)
  items: z
    .array(
      z.object({
        subtitle: z.string().min(1), // 소제목 뱃지 라벨 (em,br)
        image: z.string().optional(), // 풀폭 이미지 (url)
        caption: z.string().min(1), // 자막바 텍스트 (em,br) — 이미지 하단 다크바
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureCaptionbar = defineBlock<Data>({
  id: 'feature-captionbar',
  archetype: 'feature',
  styleTags: ['premium', 'editorial', 'cobalt', 'template', 'captionbar'],
  imageSlots: 3,
  describe:
    '특장점 자막바 반복. 시그니처 헤더(아이브로+코발트 대제목+구분선) + [소제목 뱃지 → 풀폭 이미지 → 이미지 하단 다크 자막바] 그룹 반복(2~4회). 이미지+캡션 조합 프리미엄 내러티브.',
  schema,
  css: `
.fcb{background:var(--bg);padding:58px 0 64px}
.fcb-hd{text-align:center;padding:0 56px;margin-bottom:44px}
.fcb-eyebrow{font-size:15px;font-weight:600;color:var(--ink-2);letter-spacing:.04em;margin-bottom:10px}
.fcb-title{font-family:var(--font-display);font-weight:800;font-size:58px;color:var(--accent);letter-spacing:-.02em;line-height:1.12}
.fcb-title .em{color:var(--accent-d)}
.fcb-div{width:64px;height:3px;border-radius:2px;background:var(--accent);margin:20px auto 0}
.fcb-item{margin-bottom:36px}
.fcb-item:last-child{margin-bottom:0}
.fcb-sub-wrap{padding:0 56px;margin-bottom:14px}
.fcb-sub{display:inline-block;background:var(--ink);color:#fff;font-family:var(--font-display);font-weight:800;font-size:24px;padding:10px 28px;border-radius:4px;line-height:1.2}
.fcb-sub .em{color:var(--accent)}
.fcb-img{width:100%;height:420px;object-fit:cover;display:block}
.fcb-cap{background:color-mix(in srgb,var(--ink) 90%,transparent);color:#fff;padding:20px 56px;text-align:center;font-size:16px;line-height:1.72;font-weight:500}
.fcb-cap .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="fcb">
  <div class="fcb-hd">
    ${d.eyebrow ? `<p class="fcb-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="fcb-title">${richSafe(d.title)}</h2>
    <div class="fcb-div"></div>
  </div>
  ${d.items
    .map(
      (it) => `
  <div class="fcb-item">
    <div class="fcb-sub-wrap"><span class="fcb-sub">${richSafe(it.subtitle)}</span></div>
    ${media(it.image, 'fcb-img', '특장점 이미지')}
    <div class="fcb-cap">${richSafe(it.caption)}</div>
  </div>`,
    )
    .join('')}
</section>`,
})
