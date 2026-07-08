/** CERT 아키타입(템플릿 충실 재현): cert-clipboard.
 *  와디즈 200섹션 14_인증 _클립보드 래퍼형 패턴 재구성.
 *  클립보드 프롭 안 인증서 카드 정확히 2장 + CERTIFIED 씰 스탬프.
 *  상단 "Certificate" 디스플레이 제목 + 부제 + 클립보드 래퍼(클립 + 흰 보드 + 그림자) +
 *  카드마다 제목·이미지·(하단 풋노트 캡션)·금색 씰 스탬프. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const cardSchema = z.object({
  title: z.string().min(1),          // 카드 제목 (em,br)
  image: z.string().optional(),      // 인증서/시험 이미지 (url)
  caption: z.string().min(1).optional(), // 하단 캡션 (* 시험기관 등)
  sealText: z.string().min(1).optional(), // 씰 텍스트, 기본 "CERTIFIED"
})

const schema = z.object({
  title: z.string().min(1).optional(),    // 섹션 대제목, 기본 "Certificate"
  subtitle: z.string().min(1).optional(), // 부제 (em,br)
  cards: z
    .array(cardSchema)
    .min(1)
    .max(2),
})
type Data = z.infer<typeof schema>

export const certClipboard = defineBlock<Data>({
  id: 'cert-clipboard',
  archetype: 'cert',
  styleTags: ['trust', 'premium', 'template', 'light', 'clipboard'],
  imageSlots: 2,
  describe:
    '클립보드 래퍼형 인증 블록. Certificate 대제목 + 부제 + 클립보드 프롭(클립+흰 보드+그림자) 안에 인증서 카드 최대 2장(제목·이미지·카드 내부 하단 풋노트 캡션·CERTIFIED 씰 스탬프). 시험성적서/합격 인증 신뢰 강조.',
  schema,
  css: `
.ccb{background:var(--bg);padding:60px 44px 70px;text-align:center}
.ccb-title{font-family:var(--font-display);font-weight:800;font-size:58px;color:var(--accent);letter-spacing:-.01em;line-height:1.05;font-style:italic}
.ccb-sub{margin-top:12px;font-size:16px;font-weight:500;color:var(--ink-2);line-height:1.65}
.ccb-sub .em{color:var(--accent);font-weight:700}
.ccb-board{position:relative;margin:36px auto 0;max-width:620px;background:color-mix(in srgb,var(--paper) 85%,#888 15%);border-radius:calc(var(--r-scale,1)*6px) calc(var(--r-scale,1)*6px) calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*8px);box-shadow:0 12px 40px -14px rgba(0,0,0,.28),0 2px 8px rgba(0,0,0,.08);padding:0 0 32px}
.ccb-clip{position:absolute;top:-22px;left:50%;transform:translateX(-50%);width:64px;height:42px;background:#2e2e2e;border-radius:calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*4px) calc(var(--r-scale,1)*4px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;box-shadow:0 4px 10px rgba(0,0,0,.35)}
.ccb-clip::before{content:"";display:block;width:34px;height:14px;border:3px solid #555;border-bottom:none;border-radius:calc(var(--r-scale,1)*4px) calc(var(--r-scale,1)*4px) 0 0}
.ccb-clip::after{content:"";display:block;width:20px;height:7px;background:#444;border-radius:calc(var(--r-scale,1)*2px);margin-top:-2px}
.ccb-card{margin:40px 28px 0;background:#fff;border-radius:calc(var(--r-scale,1)*6px);box-shadow:0 4px 14px rgba(0,0,0,.1);overflow:visible;position:relative;text-align:left}
.ccb-card+.ccb-card{margin-top:20px}
.ccb-card-title{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);padding:18px 20px 14px;line-height:1.3}
.ccb-card-title .em{color:var(--accent)}
.ccb-card-divider{height:1px;background:color-mix(in srgb,var(--line) 70%,transparent);margin:0 20px}
.ccb-card-media{position:relative;margin:14px 20px}
.ccb-img{width:100%;height:220px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px));display:block}
.ccb-seal{position:absolute;top:-14px;right:-14px;width:72px;height:72px;border-radius:50%;background:radial-gradient(circle at 36% 30%,#fff9ec 0%,#f5c842 42%,#c8860a 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(0,0,0,.3);transform:rotate(8deg);z-index:2}
.ccb-seal-text{font-family:var(--font-display);font-weight:800;font-size:8px;letter-spacing:.06em;color:#5c3c00;line-height:1.2;text-align:center}
.ccb-seal::before{content:"";position:absolute;inset:5px;border:1.5px solid rgba(92,60,0,.35);border-radius:50%}
.ccb-caption{padding:10px 20px 14px;font-size:12px;color:var(--muted);line-height:1.5}
`,
  render: (d, { esc, richSafe }) => `
<section class="ccb">
  <h2 class="ccb-title">${esc(d.title ?? 'Certificate')}</h2>
  ${d.subtitle ? `<p class="ccb-sub">${richSafe(d.subtitle)}</p>` : ''}
  <div class="ccb-board">
    <div class="ccb-clip"></div>
    ${d.cards
      .map(
        (c) => `
    <div class="ccb-card">
      <div class="ccb-card-title">${richSafe(c.title)}</div>
      <div class="ccb-card-divider"></div>
      <div class="ccb-card-media">
        ${media(c.image, 'ccb-img', '인증서 이미지')}
        <div class="ccb-seal" aria-label="${attr(c.sealText ?? 'CERTIFIED')}">
          <span class="ccb-seal-text">${esc(c.sealText ?? 'CERTIFIED')}</span>
        </div>
      </div>
      ${c.caption ? `<p class="ccb-caption">${esc(c.caption)}</p>` : ''}
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
