/** POINT 아키타입: point-dark-grid-resolve.
 *  원본: 249_문제제기_13 (문제제기 섹션)
 *  구조 — 어두운 네이비 배경, 대제목+설명, 2×2 이미지+다크 캡션 카드 그리드,
 *  원형 체크 아이콘 리스트 4항목, 세로선 전환, 결론 텍스트, 색상 강조 클로징 박스(반전).
 *  noimg-safe: 이미지 전부 없으면 캡션 카드를 텍스트 전용 패널로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  image: z.string().optional(),   // (url) 문제 상황 사진
  sub: z.string().min(1),         // 카드 위 소제목 (예: "금방 식어버리는")
  keyword: z.string().min(1),     // 카드 굵은 키워드 (예: "보온/보냉")
})

const schema = z.object({
  title: z.string().min(1),       // (em,br) 대제목 — 문제 제기 질문
  desc: z.string().optional(),    // 소제목 설명 한 줄
  cards: z.array(cardSchema).min(2).max(4),  // 2×2 이미지 그리드 (권장 4개)
  checks: z.array(z.string().min(1)).min(2).max(6),  // 체크리스트 항목
  resolveLabel: z.string().min(1),  // 결론 텍스트 상단 (예: "일반 텀블러가 가진 불.편.함")
  resolveBox: z.string().min(1),    // (em,br) 강조 박스 내 클로징 문구
  bridgeText: z.string().optional(), // 세로선 사이 브리지 텍스트 (em,br)
})
type Data = z.infer<typeof schema>

export const pointDarkGridResolve = defineBlock<Data>({
  id: 'point-dark-grid-resolve',
  archetype: 'point',
  styleTags: ['dark', 'problem', 'grid', 'checklist', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '문제제기 섹션. 네이비 다크 배경 + 대제목(문제 질문) + 2×2 이미지·다크 캡션 카드 그리드 + 원형 체크 리스트 + 세로선 전환 + 결론 브리지 텍스트 + 색상 반전 클로징 박스. 이미지 없을 때 텍스트 패널로 강등.',
  schema,
  css: `
/* ── point-dark-grid-resolve ─────────────────────────────── */
.pjyo{background:#34495e;color:#eaeaea;padding:60px var(--pad-x,56px) 0;font-family:var(--font-body),'Pretendard',sans-serif}
.pjyo .em{color:var(--em-dark,#FFF7EA)}

/* 타이틀 */
.pjyo-ttl{font-family:var(--font-display),'Pretendard',sans-serif;font-size:clamp(36px,6vw,70px);font-weight:700;line-height:1.2;text-align:center;color:#eaeaea}
.pjyo-sub{margin-top:16px;font-size:clamp(16px,2.2vw,22px);font-weight:300;line-height:1.55;text-align:center;color:#c8d6e0;white-space:pre-line}

/* 2×2 카드 그리드 */
.pjyo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:40px}
.pjyo-card{border-radius:calc(var(--r-scale,1)*12px);overflow:hidden;background:#10202f}
/* 이미지 프레임 */
.pjyo-card-img{width:100%;aspect-ratio:1/0.74;object-fit:cover;display:block;border-radius:0}
.pjyo-card-img.ph{display:none!important}
/* 이미지 없으면 캡션만(패딩 보정) */
.pjyo-card.noimg .pjyo-caption{padding:32px 20px}
.pjyo-caption{padding:16px 20px 20px;background:#10202f}
.pjyo-cap-sub{font-size:clamp(12px,1.4vw,15px);font-weight:400;line-height:1.4;color:rgba(234,234,234,.88);text-align:center}
.pjyo-cap-kw{margin-top:4px;font-size:clamp(17px,2vw,22px);font-weight:500;line-height:1.3;color:#d2d2d2;text-align:center}

/* 체크리스트 */
.pjyo-checks{margin-top:40px;display:flex;flex-direction:column;gap:0}
.pjyo-check{display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.07)}
.pjyo-check:last-child{border-bottom:none}
.pjyo-check-icon{flex:0 0 40px;width:40px;height:40px;border-radius:50%;background:#eaeaea;display:flex;align-items:center;justify-content:center;color:#2c3e50}
.pjyo-check-icon svg{width:22px;height:18px}
.pjyo-check-text{font-size:clamp(15px,1.9vw,20px);font-weight:400;color:#eaeaea;line-height:1.5}

/* 세로선 */
.pjyo-vline{width:2px;height:80px;background:rgba(255,255,255,.22);margin:32px auto 0;border-radius:999px}

/* 브리지 텍스트 */
.pjyo-bridge{margin-top:32px;font-family:var(--font-display),'Pretendard',sans-serif;font-size:clamp(22px,3.6vw,36px);font-weight:300;line-height:1.5;text-align:center;color:#eaeaea;white-space:pre-line}
.pjyo-bridge .em{color:var(--em-dark,#FFF7EA)}

/* 결론 영역 */
.pjyo-resolve{margin-top:40px;text-align:center;padding-bottom:0}
.pjyo-resolve-label{font-size:clamp(20px,2.8vw,30px);font-weight:500;color:#eaeaea;line-height:1.35;letter-spacing:.01em}

/* 세로선 2 */
.pjyo-vline2{width:2px;height:80px;background:rgba(255,255,255,.22);margin:24px auto 0;border-radius:999px}

/* 클로징 강조 박스 */
.pjyo-box-wrap{padding:0 var(--pad-x,56px) 60px;margin-top:24px;background:#34495e}
.pjyo-box{background:#96cce4;border-radius:calc(var(--r-scale,1)*10px);padding:20px 28px;text-align:center}
.pjyo-box-text{font-family:var(--font-display),'Pretendard',sans-serif;font-size:clamp(26px,4.5vw,48px);font-weight:600;line-height:1.25;color:#34495e}
.pjyo-box-text .em{color:#10202f;font-weight:800}
`,
  render: (d, { esc, richSafe, icon }) => {
    // noimg-safe: 카드 전부에 이미지가 있어야 이미지 프레임을 그림
    const withImgs = d.cards.every((c) => typeof c.image === 'string' && c.image.length > 0)

    const cardHtml = d.cards
      .map((c) => {
        const noImgCls = withImgs ? '' : ' noimg'
        const imgEl = withImgs
          ? media(c.image, 'pjyo-card-img', esc(c.sub))
          : ''
        return `<div class="pjyo-card${noImgCls}">
  ${imgEl}
  <div class="pjyo-caption">
    <div class="pjyo-cap-sub">${esc(c.sub)}</div>
    <div class="pjyo-cap-kw">${esc(c.keyword)}</div>
  </div>
</div>`
      })
      .join('\n')

    const checksHtml = d.checks
      .map(
        (item) => `<div class="pjyo-check">
  <div class="pjyo-check-icon">${icon('check')}</div>
  <div class="pjyo-check-text">${esc(item)}</div>
</div>`,
      )
      .join('\n')

    return `<section class="pjyo">
  <h2 class="pjyo-ttl">${richSafe(d.title)}</h2>
  ${d.desc ? `<p class="pjyo-sub">${esc(d.desc)}</p>` : ''}
  <div class="pjyo-grid">
    ${cardHtml}
  </div>
  <div class="pjyo-checks">
    ${checksHtml}
  </div>
  <div class="pjyo-vline"></div>
  ${d.bridgeText ? `<p class="pjyo-bridge">${richSafe(d.bridgeText)}</p>` : ''}
  <div class="pjyo-resolve">
    <p class="pjyo-resolve-label">${esc(d.resolveLabel)}</p>
  </div>
  <div class="pjyo-vline2"></div>
</section>
<div class="pjyo-box-wrap">
  <div class="pjyo-box">
    <p class="pjyo-box-text">${richSafe(d.resolveBox)}</p>
  </div>
</div>`
  },
})
