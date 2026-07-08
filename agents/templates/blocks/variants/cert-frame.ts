/** CERT 아키타입(템플릿 충실 재현): cert-frame.
 *  와디즈 200섹션 14_인증 _01(Certificate + 액자형 인증서 + CERTIFIED 씰) 패턴 재구성.
 *  대제목 + pill 라벨 + 흰 액자 안 인증서 이미지 + 홀로그램 씰 + 캡션. 인증은 brief 근거만. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(), // 기본 "Certificate"
  subtitle: z.string().min(1).optional(),
  certs: z
    .array(z.object({ label: z.string().min(1), image: z.string().optional(), caption: z.string().min(1).optional() }))
    .min(1)
    .max(4),
})
type Data = z.infer<typeof schema>

export const certFrame = defineBlock<Data>({
  id: 'cert-frame',
  archetype: 'cert',
  styleTags: ['premium', 'template', 'trust'],
  imageSlots: 4,
  describe:
    '인증/시험성적서. 대제목(Certificate) + pill 라벨 + 흰 액자 안 인증서 이미지 + CERTIFIED 씰 + 캡션 반복. 인증/시험 내용은 brief 근거만(지어내지 말 것).',
  schema,
  css: `
.cf{background:var(--bg);padding:54px var(--pad-x,56px) 58px;text-align:center}
.cf-title{font-family:var(--font-display);font-weight:800;font-size:56px;color:var(--accent);letter-spacing:-.01em;line-height:1.05}
.cf-sub{margin-top:10px;font-size:16px;font-weight:600;color:var(--ink-2)}
.cf-item{margin-top:42px}
.cf-label{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:21px;padding:12px 34px;border-radius:999px;margin-bottom:20px}
.cf-frame{position:relative;width:76%;margin:0 auto;background:#fff;border:10px solid #ECECEC;box-shadow:0 22px 46px -24px rgba(0,0,0,.4)}
.cf-img{width:100%;height:460px;object-fit:cover;display:block}
.cf-seal{position:absolute;top:-16px;right:-16px;width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 34% 28%, #ffffff 0%, #DDE4FF 38%, var(--accent) 100%);display:grid;place-items:center;color:#fff;box-shadow:0 8px 18px rgba(0,0,0,.28);transform:rotate(8deg)}
.cf-seal svg{width:36px;height:36px}
.cf-cap{margin-top:16px;font-size:13px;color:var(--muted)}
`,
  render: (d, { esc, icon }) => `
<section class="cf">
  <h2 class="cf-title">${esc(d.title ?? 'Certificate')}</h2>
  ${d.subtitle ? `<p class="cf-sub">${esc(d.subtitle)}</p>` : ''}
  ${d.certs
    .map(
      (c) => `
  <div class="cf-item">
    <span class="cf-label">${esc(c.label)}</span>
    <div class="cf-frame">
      ${media(c.image, 'cf-img', '인증서')}
      <span class="cf-seal">${icon('check')}</span>
    </div>
    ${c.caption ? `<p class="cf-cap">${esc(c.caption)}</p>` : ''}
  </div>`,
    )
    .join('')}
</section>`,
})
