/** EVENT 아키타입(템플릿 충실 재현): event-review-prize-grid.
 *  와디즈 200섹션 "13_이벤트" 440:107 (다크 히어로 + 번호형 참여 단계 + 다열 경품 카드 그리드) 패턴을
 *  토큰 기반으로 재구성(클론 아님).
 *  전체 배경 제품 이미지(다크 오버레이) 상단 히어로 + 번호형 참여 단계(3-step) + 다열 경품/쿠폰 카드 그리드 + 유의사항 텍스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().min(1).optional(),          // 우상단 스탬프 배지 (예: "PHOTO REVIEW")
  heroImage: z.string().optional(),             // 배경 풀블리드 제품 이미지 url
  title: z.string().min(1),                     // 대형 이벤트 제목 (em,br 허용)
  subtitle: z.string().min(1).optional(),       // 제목 아래 서브카피 (예: "1프로 맞춤 소파 체험 이벤트")
  prizeLabel: z.string().min(1).optional(),     // 경품 섹션 상단 라벨 (예: "경품")
  prizes: z
    .array(
      z.object({
        image: z.string().optional(),           // 경품 이미지 url
        name: z.string().min(1),               // 경품명 (예: "신세계상품권 5만원권")
        winners: z.string().min(1),            // 당첨 인원 (예: "3명")
      }),
    )
    .min(2)
    .max(4),
  stepsLabel: z.string().min(1).optional(),    // 참여 방법 섹션 라벨 (예: "참여방법")
  steps: z
    .array(
      z.object({
        text: z.string().min(1),              // 단계 설명 (em,br 허용)
      }),
    )
    .min(2)
    .max(4),
  notesLabel: z.string().min(1).optional(),   // 유의사항 라벨 (예: "유의사항")
  notes: z
    .array(z.object({ text: z.string().min(1) }))
    .min(1)
    .max(8)
    .optional(),
  footer: z.string().min(1).optional(),       // 하단 강조 안내 (예: "1인 1회 참가 가능 / 중복 참여 불가")
})
type Data = z.infer<typeof schema>

export const eventReviewPrizeGrid = defineBlock<Data>({
  id: 'event-review-prize-grid',
  archetype: 'event',
  styleTags: ['premium', 'template', 'dark', 'review', 'event', 'prize'],
  imageSlots: 4,
  describe:
    '리뷰 이벤트(경품 그리드형). 풀블리드 제품 배경+다크 오버레이 히어로(배지·대형 제목·서브카피) + 다열 경품/쿠폰 카드 그리드(이미지·경품명·당첨인원) + 번호형 참여 단계 카드 + 유의사항 리스트. 포토리뷰·구매후기 이벤트에 최적.',
  schema,
  css: `
/* ── hero ── */
.erpg-hero{position:relative;width:100%;min-height:420px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end}
.erpg-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.erpg-hero-bg.ph{position:absolute;inset:0;border-radius:0}
.erpg-overlay{position:absolute;inset:0;background:linear-gradient(170deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,.55) 60%,rgba(0,0,0,.80) 100%)}

/* badge stamp */
.erpg-badge{position:absolute;top:28px;right:28px;width:92px;height:92px;border-radius:50%;background:var(--accent);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transform:rotate(12deg);box-shadow:0 4px 18px rgba(0,0,0,.45);z-index:3}
.erpg-badge-only{font-size:9px;font-weight:800;letter-spacing:.12em;color:#fff;opacity:.85;text-transform:uppercase}
.erpg-badge-text{font-family:var(--font-display);font-weight:800;font-size:13px;color:#fff;line-height:1.2;margin-top:2px;letter-spacing:.04em}

/* hero text */
.erpg-hero-body{position:relative;z-index:2;padding:44px 40px 38px}
.erpg-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:14px;font-weight:700;color:rgba(255,255,255,.78);letter-spacing:.1em;margin-bottom:16px}
.erpg-eyebrow::before{content:'◆';color:var(--accent);font-size:10px}
.erpg-title{font-family:var(--font-display);font-weight:800;font-size:62px;color:#fff;letter-spacing:-.02em;line-height:1.05}
.erpg-title .em{color:var(--accent)}
.erpg-subtitle{margin-top:14px;font-size:17px;color:rgba(255,255,255,.82);font-weight:500;line-height:1.4}

/* ── prizes ── */
.erpg-prizes-section{background:var(--paper);padding:36px 28px 32px}
.erpg-section-label{font-family:var(--font-display);font-weight:800;font-size:14px;letter-spacing:.14em;color:var(--accent);margin-bottom:18px;text-align:center;opacity:.9}
.erpg-prize-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.erpg-prize-card{background:var(--bg);border:1.5px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;align-items:center;text-align:center;padding-bottom:16px}
.erpg-prize-img{width:100%;height:120px;object-fit:cover}
.erpg-prize-img.ph{height:120px;border-radius:0}
.erpg-prize-name{font-size:13px;font-weight:700;color:var(--ink);line-height:1.35;margin-top:12px;padding:0 10px}
.erpg-prize-winners{display:inline-block;margin-top:8px;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent);font-family:var(--font-display);font-weight:800;font-size:16px;padding:4px 14px;border-radius:999px}

/* ── steps ── */
.erpg-steps-section{background:var(--ink);padding:36px 36px 38px}
.erpg-steps-label{font-family:var(--font-display);font-weight:800;font-size:18px;color:#fff;margin-bottom:24px;display:flex;align-items:center;gap:10px}
.erpg-steps-label::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.16)}
.erpg-step-row{display:flex;align-items:flex-start;gap:18px;padding:14px 0}
.erpg-step-row + .erpg-step-row{border-top:1px solid rgba(255,255,255,.10)}
.erpg-step-num{flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center}
.erpg-step-text{font-size:16px;color:rgba(255,255,255,.9);line-height:1.55;padding-top:7px;font-weight:500}
.erpg-step-text .em{color:var(--accent);font-weight:700}

/* ── notes ── */
.erpg-notes-section{background:var(--ink);padding:0 36px 36px}
.erpg-notes-divider{height:1px;background:rgba(255,255,255,.12);margin-bottom:22px}
.erpg-notes-label{font-size:14px;font-weight:800;color:rgba(255,255,255,.55);letter-spacing:.06em;margin-bottom:12px}
.erpg-note{display:flex;gap:9px;font-size:13px;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:6px}
.erpg-note::before{content:'·';flex-shrink:0;color:var(--accent)}
.erpg-footer{margin-top:18px;padding:12px 18px;background:color-mix(in srgb,var(--accent) 18%,transparent);border:1.5px solid var(--accent);border-radius:10px;font-size:14px;font-weight:700;color:var(--accent);text-align:center;letter-spacing:.02em}
`,
  render: (d, { esc, richSafe }) => `
<section class="erpg">
  <!-- hero -->
  <div class="erpg-hero">
    ${media(d.heroImage, 'erpg-hero-bg', '이벤트 배경 이미지')}
    <div class="erpg-overlay"></div>
    ${d.badge ? `
    <div class="erpg-badge">
      <span class="erpg-badge-only">ONLY</span>
      <span class="erpg-badge-text">${esc(d.badge)}</span>
    </div>` : ''}
    <div class="erpg-hero-body">
      <div class="erpg-eyebrow">PHOTO REVIEW EVENT</div>
      <h2 class="erpg-title">${richSafe(d.title)}</h2>
      ${d.subtitle ? `<p class="erpg-subtitle">${esc(d.subtitle)}</p>` : ''}
    </div>
  </div>

  <!-- prize grid -->
  <div class="erpg-prizes-section">
    ${d.prizeLabel ? `<p class="erpg-section-label">${esc(d.prizeLabel)}</p>` : ''}
    <div class="erpg-prize-grid">
      ${d.prizes.map(p => `
      <div class="erpg-prize-card">
        ${media(p.image, 'erpg-prize-img', esc(p.name))}
        <span class="erpg-prize-name">${esc(p.name)}</span>
        <span class="erpg-prize-winners">${esc(p.winners)}</span>
      </div>`).join('')}
    </div>
  </div>

  <!-- steps -->
  <div class="erpg-steps-section">
    <div class="erpg-steps-label">${esc(d.stepsLabel ?? '참여방법')}</div>
    ${d.steps.map((s, i) => `
    <div class="erpg-step-row">
      <span class="erpg-step-num">${i + 1}</span>
      <span class="erpg-step-text">${richSafe(s.text)}</span>
    </div>`).join('')}
  </div>

  <!-- notes -->
  ${(d.notes && d.notes.length > 0) || d.footer ? `
  <div class="erpg-notes-section">
    <div class="erpg-notes-divider"></div>
    ${d.notesLabel ? `<p class="erpg-notes-label">${esc(d.notesLabel)}</p>` : ''}
    ${(d.notes ?? []).map(n => `
    <div class="erpg-note">${esc(n.text)}</div>`).join('')}
    ${d.footer ? `<div class="erpg-footer">${esc(d.footer)}</div>` : ''}
  </div>` : ''}
</section>`,
})
