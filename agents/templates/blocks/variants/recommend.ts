/** RECOMMEND 아키타입: recommend-dark (다크 배경 추천 + 사선 리본 사진). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  floatImage: z.string().optional(),
  title: z.string().min(1), // em 강조 허용
  en: z.string().optional(),
  image: z.string().optional(),
  ribbon: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const recommendDark = defineBlock<Data>({
  id: 'recommend-dark',
  archetype: 'recommend',
  styleTags: ['warm', 'playful', 'food', 'bold'],
  imageSlots: 2,
  describe: '다크 배경 추천 섹션. 떠있는 제품 누끼 + 2톤 제목 + 영문 서브 + 사선 리본 태그가 박힌 연출 사진.',
  schema,
  css: `
.rec{position:relative;background:var(--brand);color:#F3E9DA;text-align:center;padding:56px var(--pad-x,56px) 64px;overflow:hidden}
.rec-float{width:96px;height:96px;border-radius:calc(var(--r-scale,1)*18px);object-fit:cover;margin:0 auto 22px;box-shadow:0 16px 30px rgba(0,0,0,.4);transform:rotate(-6deg)}
.rec-h{font-size:42px;color:#fff}
.rec-en{margin-top:12px;font-size:15px;font-weight:700;letter-spacing:.32em;color:#B79B7C;text-transform:uppercase}
.rec-fig{position:relative;margin:34px auto 0;width:600px;overflow:hidden;border-radius:var(--shape-photo, calc(var(--r-scale,1)*22px))}
.rec-media{width:100%;height:360px;object-fit:cover}
.rec-ribbon{position:absolute;top:20px;left:-46px;width:180px;transform:rotate(-45deg);background:var(--accent);color:#fff;font-weight:700;font-size:19px;text-align:center;padding:7px 0;box-shadow:0 6px 14px rgba(0,0,0,.3);z-index:2}
.rec .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => `
<section class="rec">
  <div class="wm light"></div>
  ${d.floatImage ? media(d.floatImage, 'rec-float', '제품') : ''}
  <h2 class="disp rec-h">${richSafe(d.title)}</h2>
  ${d.en ? `<p class="rec-en">${esc(d.en)}</p>` : ''}
  <figure class="rec-fig">
    ${media(d.image, 'rec-media', '연출 이미지')}
    ${d.ribbon ? `<span class="rec-ribbon hand">${esc(d.ribbon)}</span>` : ''}
  </figure>
</section>`,
})
