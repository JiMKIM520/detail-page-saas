/** POINT 아키타입: package-split-icon-cards.
 *  [끝판왕] 상품 구성 #15 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 히어로(pill eyebrow + accent 대헤드라인 + 서브) →
 *  라이트 아이콘 카드 2-col 그리드(라운드 카드, 번호 레이블, 아이콘, 설명, 푸터 스트라이프) →
 *  중앙 마무리 본문. 가격 없는 구성 특징 안내 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const schema = z.object({
  /** pill 형 eyebrow 레이블 (선택) */
  eyebrow: z.string().optional(),
  /** 다크 섹션 대헤드라인 (em 허용 — accent 강조 어절) */
  title: z.string().min(1),
  /** 헤드라인 아래 서브카피 (선택) */
  subtitle: z.string().optional(),
  /** 아이콘 카드 항목 2~4개 */
  cards: z
    .array(
      z.object({
        /** 카드 상단 번호/짧은 레이블 (예: "1번 텍스트") */
        label: z.string().min(1),
        /** 아이콘 이름 (ICONS 목록) */
        icon: z.enum(ICON_NAMES),
        /** 카드 메인 카피 (em, br 허용) */
        heading: z.string().min(1),
        /** 카드 하단 스트라이프 한 줄 부가 설명 (선택) */
        footer: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 카드 섹션 하단 마무리 본문 (em, br 허용, 선택) */
  body: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const packageSplitIconCards = defineBlock<Data>({
  id: 'package-split-icon-cards',
  archetype: 'point',
  styleTags: ['dark-hero', 'light-cards', 'icon', 'split-bg', 'feature', 'template'],
  imageSlots: 0,
  describe:
    '구성 특징 안내(가격 없음). 다크 네이비 히어로(pill eyebrow + accent 강조 대헤드라인 + 서브) → 라이트 배경 아이콘 카드 2열 그리드(번호 레이블, 아이콘, 설명, 하단 스트라이프 푸터) → 마무리 본문. 상품 구성·기능 설명에 적합.',
  schema,
  css: `
/* package-split-icon-cards — 접두사 psic- */
*{word-break:keep-all;overflow-wrap:break-word}
.psic-hero{background:var(--ink);padding:52px 40px 56px;text-align:center}
.psic-eyebrow{display:inline-block;padding:6px 20px;border:1.5px solid var(--accent);border-radius:999px;font-size:14px;font-weight:600;color:var(--accent);letter-spacing:.04em;margin-bottom:22px}
.psic-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,8.5vw,56px);line-height:1.18;letter-spacing:-.02em;color:#fff;margin-bottom:0}
.psic-title .em{color:var(--accent)}
.psic-sub{margin-top:20px;font-size:16px;line-height:1.7;color:rgba(255,255,255,.62)}
.psic-sub .em{color:var(--accent);font-weight:700}
.psic-cards-wrap{background:var(--paper);padding:36px 28px 40px}
.psic-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.psic-card{background:#fff;border-radius:calc(var(--r-scale,1)*16px);overflow:hidden;box-shadow:0 4px 18px -6px rgba(0,0,0,.12);display:flex;flex-direction:column}
.psic-card-top{padding:18px 18px 6px;text-align:center}
.psic-card-label{font-size:13px;font-weight:700;color:var(--accent-d);letter-spacing:.03em;margin-bottom:14px}
.psic-card-icon{width:56px;height:56px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;color:var(--accent)}
.psic-card-icon svg{width:40px;height:40px}
.psic-card-muted{font-size:12px;color:var(--muted);margin-bottom:4px}
.psic-card-heading{font-family:var(--font-display);font-weight:800;font-size:17px;line-height:1.4;color:var(--ink);padding:0 4px 14px}
.psic-card-heading .em{color:var(--accent-d)}
.psic-card-footer{margin-top:auto;background:var(--bg);border-top:1px solid var(--line);padding:10px 16px;font-size:13px;color:var(--muted);text-align:center;line-height:1.5}
.psic-body{background:var(--paper);padding:0 40px 44px;text-align:center;font-size:15px;line-height:1.8;color:var(--ink)}
.psic-body .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const eyebrow = d.eyebrow
      ? `<span class="psic-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    const cards = d.cards
      .map(
        (c) => `
    <div class="psic-card">
      <div class="psic-card-top">
        <div class="psic-card-label">${esc(c.label)}</div>
        <div class="psic-card-icon">${icon(c.icon)}</div>
        <p class="psic-card-muted">여기에다가</p>
        <h3 class="psic-card-heading">${richSafe(c.heading)}</h3>
      </div>
      ${c.footer ? `<div class="psic-card-footer">${esc(c.footer)}</div>` : ''}
    </div>`,
      )
      .join('')

    return `
<section class="psic-hero">
  ${eyebrow}
  <h2 class="psic-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="psic-sub">${richSafe(d.subtitle)}</p>` : ''}
</section>
<div class="psic-cards-wrap">
  <div class="psic-grid">
    ${cards}
  </div>
</div>
${d.body ? `<div class="psic-body"><p>${richSafe(d.body)}</p></div>` : ''}`
  },
})
