/** FAQ 아키타입: faq-chat-bubble.
 *  269_Q_A_10 피그마 원본 흡수 —
 *  상단 전폭 히어로 이미지 → 중앙 타이틀(Q&A + 부제) → 말풍선 대화 형식 Q&A 1~5쌍.
 *  파란 질문 말풍선(꼬리 왼쪽 하단) + 흰 답변 말풍선(꼬리 오른쪽 하단)으로 채팅 UI를 이식.
 *  noimg-safe: 히어로 이미지 미제공 시 틴트 패널로 강등(레이아웃 붕괴 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pairSchema = z.object({
  q: z.string().min(1),           // 질문 (em 허용)
  a: z.string().min(1),           // 답변 (em,br 허용)
})

const schema = z.object({
  title:    z.string().min(1),              // 대제목 (기본 "Q&A", em 허용)
  subtitle: z.string().optional(),          // 부제 한 줄 (순수 텍스트)
  image:    z.string().optional(),          // 상단 전폭 히어로 이미지 (url) — 없으면 틴트 패널 강등
  pairs:    z.array(pairSchema).min(1).max(5),
})
type Data = z.infer<typeof schema>

export const faqChatBubble = defineBlock<Data>({
  id: 'faq-chat-bubble',
  archetype: 'faq',
  styleTags: ['light', 'friendly', 'noimg-safe'],
  imageSlots: 1,
  describe:
    'FAQ 채팅 말풍선 블록. 상단 전폭 히어로 이미지(선택) + 중앙 Q&A 타이틀 + 1~5쌍 대화형 말풍선. ' +
    '파란 질문 말풍선(꼬리 좌하)과 흰 답변 말풍선(꼬리 우하)으로 채팅 UI를 상세페이지에 이식. ' +
    '히어로 이미지 미제공 시 틴트 패널로 자동 강등(noimg-safe).',
  schema,
  css: `
/* ── faq-chat-bubble (frvx) ── */
.frvx{background:var(--bg);color:var(--ink);padding-bottom:64px;font-family:var(--font-body),'Pretendard',sans-serif}

/* 히어로 이미지 / 강등 패널 */
.frvx-hero{width:100%;height:360px;overflow:hidden;position:relative}
.frvx-hero img{width:100%;height:100%;object-fit:cover;display:block}
.frvx-hero-ph{width:100%;height:360px;background:color-mix(in srgb,var(--accent) 14%,var(--bg));display:flex;align-items:center;justify-content:center}
.frvx-hero-ph-inner{width:56px;height:56px;border-radius:50%;background:color-mix(in srgb,var(--accent) 22%,transparent)}

/* 타이틀 영역 */
.frvx-hd{text-align:center;padding:52px var(--pad-x,56px) 40px}
.frvx-title{font-family:var(--font-display);font-weight:800;font-size:60px;line-height:1.05;letter-spacing:-.02em;color:var(--ink)}
.frvx-title .em{color:var(--accent)}
.frvx-sub{margin-top:14px;font-size:17px;font-weight:500;color:var(--ink-2)}

/* 쌍 목록 */
.frvx-pairs{display:flex;flex-direction:column;gap:0;padding:0 var(--pad-x,56px)}

/* 단일 Q&A 쌍 */
.frvx-pair{padding:28px 0;border-bottom:1px solid var(--line)}
.frvx-pair:last-child{border-bottom:none}

/* 질문 말풍선 (파란 배경, 꼬리 좌하) */
.frvx-q-wrap{position:relative;margin-bottom:16px}
.frvx-q-bubble{
  background:var(--accent);
  color:#fff;
  border-radius:calc(var(--r-scale,1)*16px);
  padding:18px 22px 18px 20px;
  display:flex;align-items:flex-start;gap:14px;
  box-shadow:0 6px 18px -8px color-mix(in srgb,var(--accent) 55%,transparent)
}
.frvx-q-icon{flex:0 0 32px;width:32px;height:32px;color:#fff;opacity:.92}
.frvx-q-text{font-size:17px;font-weight:700;line-height:1.55;color:#fff}
.frvx-q-text .em{color:#fff;text-decoration:underline;text-underline-offset:2px}
/* 꼬리: 좌하단 삼각형 */
.frvx-q-tail{
  position:absolute;bottom:-13px;left:22px;
  width:0;height:0;
  border-left:13px solid transparent;
  border-right:0px solid transparent;
  border-top:14px solid var(--accent)
}

/* 답변 말풍선 (흰 배경, 꼬리 우하) */
.frvx-a-wrap{position:relative;margin-top:14px}
.frvx-a-bubble{
  background:var(--paper);
  color:var(--ink);
  border-radius:calc(var(--r-scale,1)*16px);
  padding:18px 22px 18px 20px;
  display:flex;align-items:flex-start;gap:14px;
  box-shadow:0 4px 16px -8px rgba(0,0,0,.14)
}
.frvx-a-icon{flex:0 0 32px;width:32px;height:32px;color:var(--ink-2)}
.frvx-a-text{font-size:16px;font-weight:400;line-height:1.75;color:var(--ink)}
.frvx-a-text .em{color:var(--accent);font-weight:700}
/* 꼬리: 우하단 삼각형 */
.frvx-a-tail{
  position:absolute;bottom:-13px;right:22px;
  width:0;height:0;
  border-right:13px solid transparent;
  border-left:0px solid transparent;
  border-top:14px solid var(--paper)
}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 히어로 이미지 강등 처리 — URL 형태가 있을 때만 <img>
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    const heroHtml = hasImg
      ? `<div class="frvx-hero">${media(d.image, '', '상품 대표 이미지')}</div>`
      : `<div class="frvx-hero"><div class="frvx-hero-ph"><div class="frvx-hero-ph-inner"></div></div></div>`

    const pairsHtml = d.pairs.map((p) => `
    <div class="frvx-pair">
      <div class="frvx-q-wrap">
        <div class="frvx-q-bubble">
          <span class="frvx-q-icon">${icon('bulb')}</span>
          <p class="frvx-q-text">${richSafe(p.q)}</p>
        </div>
        <div class="frvx-q-tail"></div>
      </div>
      <div class="frvx-a-wrap">
        <div class="frvx-a-bubble">
          <span class="frvx-a-icon">${icon('check')}</span>
          <p class="frvx-a-text">${richSafe(p.a)}</p>
        </div>
        <div class="frvx-a-tail"></div>
      </div>
    </div>`).join('')

    return `
<section class="frvx">
  ${heroHtml}
  <div class="frvx-hd">
    <h2 class="disp frvx-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="frvx-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="frvx-pairs">
    ${pairsHtml}
  </div>
</section>`
  },
})
