/** FEATURE 아키타입(템플릿 충실 재현): feature-editorial.
 *  와디즈 200섹션 "03_특장점" 거대숫자 에디토리얼(_08) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(뱃지+코발트 대제목+서브+구분선) + Cafe24 ClassicType 대형 숫자 오버랩 + 풀폭 이미지 밴드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1), // 섹션 대제목 (예: "제품 특장점")
  subtitle: z.string().min(1).optional(), // 헤더 서브카피
  items: z
    .array(
      z.object({
        heading: z.string().min(1), // em 허용
        desc: z.string().min(1).optional(), // em/br 허용
        image: z.string().optional(), // 풀폭 밴드 이미지(url)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const featureEditorial = defineBlock<Data>({
  id: 'feature-editorial',
  archetype: 'feature',
  styleTags: ['premium', 'editorial', 'cobalt', 'template'],
  imageSlots: 4,
  describe:
    '특장점 에디토리얼. 시그니처 헤더(코발트 뱃지+대제목+서브+구분선) + 대형 숫자(01/02/03) 오버랩한 소제목/설명 + 풀폭 이미지 밴드 반복. 프리미엄 다크커머스 템플릿 톤.',
  schema,
  css: `
.fen{background:var(--bg);padding:58px 0 60px}
.fen-hd{text-align:center;padding:0 56px;margin-bottom:46px}
.fen-badge{width:62px;height:62px;margin:0 auto 20px;border-radius:50%;background:var(--accent);display:grid;place-items:center;color:#fff}
.fen-badge svg{width:32px;height:32px}
.fen-title{font-family:var(--font-display);font-weight:800;font-size:58px;color:var(--accent);letter-spacing:-.02em;line-height:1.12}
.fen-sub{margin-top:14px;font-size:18px;font-weight:600;color:var(--ink-2)}
.fen-div{width:64px;height:3px;border-radius:2px;background:var(--accent);margin:22px auto 0}
.fen-item + .fen-item{margin-top:10px}
.fen-txt{position:relative;padding:34px 56px 22px;min-height:120px}
.fen-no{position:absolute;left:42px;top:2px;font-family:var(--font-serif);font-size:132px;line-height:1;color:var(--accent);opacity:.20}
.fen-h{position:relative;padding-left:106px;padding-top:30px;font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.25}
.fen-h .em{color:var(--accent)}
.fen-d{position:relative;padding-left:106px;margin-top:10px;font-size:15px;color:var(--ink-2);line-height:1.65}
.fen-band{width:100%;height:430px;object-fit:cover;display:block;margin-top:16px}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="fen">
  <div class="fen-hd">
    <span class="fen-badge">${icon('check')}</span>
    <h2 class="fen-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fen-sub">${esc(d.subtitle)}</p>` : ''}
    <div class="fen-div"></div>
  </div>
  ${d.items
    .map(
      (it, i) => `
  <div class="fen-item">
    <div class="fen-txt">
      <span class="fen-no">${pad2(i + 1)}</span>
      <h3 class="fen-h">${richSafe(it.heading)}</h3>
      ${it.desc ? `<p class="fen-d">${richSafe(it.desc)}</p>` : ''}
    </div>
    ${media(it.image, 'fen-band', '특장점 이미지')}
  </div>`,
    )
    .join('')}
</section>`,
})

// ── feature-cards (03_특장점 _06 그라데이션 카드 충실 재현) ──────────────────
const cardsSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  image: z.string().optional(), // 제품 이미지(그라데이션 타원 위)
  cards: z
    .array(z.object({ heading: z.string().min(1), desc: z.string().min(1).optional() }))
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(), // 하단 마무리 카피(em,br)
})
type CardsData = z.infer<typeof cardsSchema>

export const featureCards = defineBlock<CardsData>({
  id: 'feature-cards',
  archetype: 'feature',
  styleTags: ['premium', 'cobalt', 'rounded', 'template'],
  imageSlots: 1,
  describe:
    '특장점 그라데이션 카드. 둥근 코발트 타이틀(Dangdanghae) + 제품 이미지 위 코발트 그라데이션 타원 + 그라데이션 보더 라운드 카드 반복 + 마무리 카피. 밝고 부드러운 프리미엄.',
  schema: cardsSchema,
  css: `
.fc{position:relative;background:var(--paper);padding:58px 56px 60px;text-align:center;overflow:hidden}
.fc-title{font-family:var(--font-hand);font-size:54px;color:var(--accent);line-height:1.1}
.fc-sub{margin-top:12px;font-size:17px;font-weight:600;color:var(--ink-2)}
.fc-fig{position:relative;margin:34px auto 30px;width:380px;height:460px}
.fc-orb{position:absolute;left:50%;bottom:-30px;transform:translateX(-50%);width:620px;height:560px;border-radius:50%;background:linear-gradient(180deg,rgba(88,116,215,0) 30%,rgba(88,116,215,.9) 100%);z-index:0}
.fc-media{position:relative;z-index:1;width:380px;height:460px;object-fit:cover;border-radius:14px}
.fc-cards{position:relative;z-index:1;display:flex;flex-direction:column;gap:18px}
.fc-card{background:linear-gradient(var(--paper),var(--paper)) padding-box,linear-gradient(180deg,var(--accent) 0%,#8795F8 100%) border-box;border:3px solid transparent;border-radius:30px;padding:34px 40px}
.fc-ch{font-family:var(--font-hand);font-size:30px;color:var(--accent);line-height:1.2}
.fc-cd{margin-top:10px;font-size:15px;color:var(--ink-2);line-height:1.7}
.fc-closer{margin-top:42px;font-family:var(--font-hand);font-size:38px;color:var(--ink);line-height:1.4}
.fc-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="fc">
  <h2 class="fc-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="fc-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="fc-fig">
    <div class="fc-orb"></div>
    ${media(d.image, 'fc-media', '제품 이미지')}
  </div>
  <div class="fc-cards">
    ${d.cards
      .map(
        (c) =>
          `<div class="fc-card"><div class="fc-ch">${richSafe(c.heading)}</div>${c.desc ? `<div class="fc-cd">${richSafe(c.desc)}</div>` : ''}</div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="fc-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})

// ── feature-dark (03_특장점 _03 블랙 에디토리얼 충실 재현) ────────────────────
const darkSchema = z.object({
  intro: z.string().min(1).optional(),
  title: z.string().min(1),
  items: z
    .array(z.object({ heading: z.string().min(1), desc: z.string().min(1).optional(), image: z.string().optional() }))
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(), // em,br
})
type DarkData = z.infer<typeof darkSchema>

export const featureDark = defineBlock<DarkData>({
  id: 'feature-dark',
  archetype: 'feature',
  styleTags: ['premium', 'dark', 'editorial', 'template'],
  imageSlots: 4,
  describe:
    '특장점 블랙 에디토리얼. 홀로그램 오브 + 인트로 + 코발트 대제목, 풀폭 이미지 밴드 아래 코발트 소제목/설명 반복, 마무리 카피. 다크 럭셔리.',
  schema: darkSchema,
  css: `
.fd{background:#120D1E;padding:56px 0 60px;color:#fff}
.fd-hd{text-align:center;padding:0 56px;margin-bottom:42px}
.fd-orb{width:118px;height:118px;margin:0 auto 26px;border-radius:50%;background:linear-gradient(135deg,#DDE4FF 0%,#8795F8 45%,#5874D7 100%);box-shadow:0 14px 40px -10px rgba(88,116,215,.7)}
.fd-intro{font-size:16px;color:rgba(255,255,255,.62)}
.fd-title{margin-top:10px;font-family:var(--font-display);font-weight:800;font-size:58px;color:var(--accent);letter-spacing:-.02em;line-height:1.12}
.fd-item + .fd-item{margin-top:44px}
.fd-band{width:100%;height:380px;object-fit:cover;display:block}
.fd-h{padding:24px 56px 0;text-align:center;font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--accent)}
.fd-d{padding:10px 56px 0;text-align:center;font-size:15px;color:rgba(255,255,255,.66);line-height:1.65}
.fd-closer{margin-top:50px;padding:0 56px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:34px;color:#fff;line-height:1.4}
.fd-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="fd">
  <div class="fd-hd">
    <div class="fd-orb"></div>
    ${d.intro ? `<p class="fd-intro">${esc(d.intro)}</p>` : ''}
    <h2 class="fd-title">${richSafe(d.title)}</h2>
  </div>
  ${d.items
    .map(
      (it) => `
  <div class="fd-item">
    ${media(it.image, 'fd-band', '특장점 이미지')}
    <h3 class="fd-h">${richSafe(it.heading)}</h3>
    ${it.desc ? `<p class="fd-d">${richSafe(it.desc)}</p>` : ''}
  </div>`,
    )
    .join('')}
  ${d.closer ? `<p class="fd-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
