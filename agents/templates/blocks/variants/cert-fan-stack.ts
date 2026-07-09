/** CERT 아키타입: cert-fan-stack
 *  노란 배경 + 오렌지 배지 + 대형 타이틀/설명 + 3장 인증서 카드 팬 스택(Z축 엇쌓기) + 다크 라운드 라벨 행.
 *  피그마 352_인증서_12 구조 흡수 — 팬 스택(카드 3장 오버랩 입체감)이 핵심 장치.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const certCardSchema = z.object({
  image: z.string().optional(),         // 인증서 이미지 url
  label: z.string().min(1),             // 하단 다크 라벨 텍스트 (예: "HACCP 인증")
})

const schema = z.object({
  badge: z.string().optional(),         // 오렌지 배지 텍스트 (예: "안심할 수 있는 자연식 사료")
  title: z.string().min(1),             // 대형 볼드 제목 (em 허용)
  desc: z.string().optional(),          // 부제/설명 (br 허용)
  cards: z.array(certCardSchema).min(2).max(3),  // 인증서 카드 2~3장
})

type Data = z.infer<typeof schema>

export const certFanStack = defineBlock<Data>({
  id: 'cert-fan-stack',
  archetype: 'cert',
  styleTags: ['warm', 'food', 'trust', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '노란 배경 + 오렌지 배지 + 대형 타이틀 + 인증서 3장 팬 스택(Z축 엇쌓기 오버랩) + 다크 라운드 라벨 행. ' +
    '복수 인증서 신뢰 어필에 최적. 이미지 없이도 라벨만으로 안전 강등(noimg-safe).',
  schema,
  css: `
/* ── cert-fan-stack ── */
.cfs{position:relative;padding:60px var(--pad-x,56px) 64px;background:#ffd153;text-align:center;overflow:hidden}

/* 오렌지 배지 */
.cfs-badge{
  display:inline-block;
  background:#fb8031;
  color:#fff;
  font-family:var(--font-display,'Paperlogy',sans-serif);
  font-weight:500;
  font-size:clamp(16px,2.2vw,22px);
  padding:10px 28px;
  border-radius:calc(var(--r-scale,1)*50px);
  margin-bottom:28px;
  letter-spacing:-.01em;
}

/* 대형 타이틀 */
.cfs-title{
  font-family:var(--font-display,'Paperlogy',sans-serif);
  font-weight:700;
  font-size:clamp(48px,7.5vw,90px);
  line-height:1.12;
  color:#5a7340;
  margin-bottom:20px;
}
.cfs-title .em{color:var(--accent-d)}

/* 설명 */
.cfs-desc{
  font-family:var(--font-body,'Pretendard',sans-serif);
  font-weight:500;
  font-size:clamp(17px,2.4vw,26px);
  line-height:1.6;
  color:#111;
  max-width:640px;
  margin:0 auto 52px;
}

/* 팬 스택 컨테이너 */
.cfs-fan{
  position:relative;
  width:100%;
  max-width:760px;
  margin:0 auto;
  height:clamp(320px,46vw,560px);
}

/* 카드 공통 */
.cfs-card{
  position:absolute;
  top:0;
  width:clamp(180px,40.7vw,350px);
  height:clamp(290px,64.1vw,551px);
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));
  background:#fff;
  overflow:hidden;
  box-shadow:0 12px 36px -8px rgba(60,40,0,.18);
}
.cfs-card img{
  width:100%;
  height:100%;
  object-fit:contain;
  padding:10px;
}
/* 이미지 없을 때 강등: 흰 카드 자체가 유지되고 .ph는 숨김(baseCss .ph{display:none!important}) */
.cfs-card .ph{
  /* 숨기되 카드 높이는 유지 — display:none은 baseCss가 강제하므로 height만 보장 */
  min-height:100%;
}

/* 팬 위치 (left·right 기준 — 3장) */
.cfs-card-1{left:0;    z-index:2;transform:rotate(-5deg);transform-origin:bottom center}
.cfs-card-2{left:50%;  z-index:3;transform:translateX(-50%) rotate(0deg);transform-origin:bottom center}
.cfs-card-3{right:0;   z-index:2;transform:rotate(5deg);transform-origin:bottom center}

/* 2장 모드 */
.cfs-fan[data-count="2"] .cfs-card-1{left:6%;  transform:rotate(-4deg);transform-origin:bottom center}
.cfs-fan[data-count="2"] .cfs-card-2{right:6%; left:auto; transform:rotate(4deg) translateX(0); transform-origin:bottom center}

/* 라벨 행 */
.cfs-labels{
  display:flex;
  justify-content:center;
  gap:12px;
  margin-top:40px;
  flex-wrap:wrap;
}
.cfs-label{
  background:#383432;
  color:#fff;
  font-family:var(--font-body,'Pretendard',sans-serif);
  font-weight:500;
  font-size:clamp(14px,1.8vw,20px);
  padding:10px 24px;
  border-radius:calc(var(--r-scale,1)*6px);
  white-space:nowrap;
}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.cards.slice(0, 3)
    const count = cards.length

    const cardHtml = cards
      .map((c, i) => {
        const cls = `cfs-card cfs-card-${i + 1}`
        return `<div class="${cls}">${media(c.image, '', esc(c.label) + ' 인증서')}</div>`
      })
      .join('\n    ')

    const labelHtml = cards
      .map((c) => `<span class="cfs-label">${esc(c.label)}</span>`)
      .join('\n    ')

    return `
<section class="cfs">
  ${d.badge ? `<p class="cfs-badge">${esc(d.badge)}</p>` : ''}
  <h2 class="cfs-title">${richSafe(d.title)}</h2>
  ${d.desc ? `<p class="cfs-desc">${richSafe(d.desc)}</p>` : ''}
  <div class="cfs-fan" data-count="${count}">
    ${cardHtml}
  </div>
  <div class="cfs-labels">
    ${labelHtml}
  </div>
</section>`
  },
})
