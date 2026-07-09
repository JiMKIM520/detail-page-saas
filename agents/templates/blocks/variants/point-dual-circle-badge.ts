/** POINT 아키타입: point-dual-circle-badge
 *  원본: 031_pc_전환12.json (1920×400 라이트 라임 배경)
 *  구조: 좌·우 대형 원형 이미지 프레임 + 배경 중앙 대원(시각 앵커) + 좌측 타이틀 스택 + 하단 이중 원 뱃지 3개 행.
 *  이중 원 뱃지 = 외곽 베이지 타원 + 내부 흰 원 + 강조색 볼드 2행 텍스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const badgeSchema = z.object({
  line1: z.string().min(1), // 뱃지 첫째 줄 (짧게, 최대 6자)
  line2: z.string().min(1), // 뱃지 둘째 줄 (짧게, 최대 6자)
})

const schema = z.object({
  subtitle: z.string().optional(),     // 소형 손글씨체 서브타이틀 (em 허용)
  title: z.string().min(1),            // 대형 볼드 메인 타이틀 (em,br 허용)
  tagline: z.string().optional(),      // 타이틀 아래 미디엄 한 줄 (em 허용)
  imageLeft: z.string().optional(),    // 좌측 대형 원형 이미지 (url)
  imageRight: z.string().optional(),   // 우측 대형 원형 이미지 (url)
  badges: z.array(badgeSchema).min(2).max(4), // 하단 이중 원 뱃지 (2~4개)
})
type Data = z.infer<typeof schema>

export const pointDualCircleBadge = defineBlock<Data>({
  id: 'point-dual-circle-badge',
  archetype: 'point',
  // noimg-safe: 이미지 없을 때 원형 프레임 숨김(강등) 처리 — 타이틀+뱃지 단독 레이아웃으로 안전 유지
  styleTags: ['light', 'food', 'natural', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '좌·우 대형 원형 사진 프레임 + 배경 중앙 그린 대원(시각 앵커) + 좌측 3단 타이틀 스택 + 하단 이중 원 뱃지 행(2~4개). 친환경·식품·산지직송 등 신뢰 포인트 강조에 최적. 라이트 라임 계열 무드.',
  schema,
  css: `
.phsd{
  position:relative;
  background:var(--bg);
  padding:40px var(--pad-x,56px) 48px;
  overflow:hidden;
  min-height:360px;
  display:flex;
  flex-direction:column;
  gap:0;
}

/* ── 배경 중앙 대원 (시각 앵커) ── */
.phsd-anchor{
  position:absolute;
  width:clamp(320px,38vw,580px);
  height:clamp(320px,38vw,580px);
  border-radius:50%;
  background:var(--accent);
  opacity:.55;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  pointer-events:none;
  z-index:0;
}

/* ── 메인 레이아웃: 이미지 + 타이틀 영역 ── */
.phsd-main{
  position:relative;
  z-index:1;
  display:flex;
  align-items:center;
  gap:clamp(20px,3vw,48px);
  flex:1;
}

/* ── 원형 이미지 슬롯 ── */
.phsd-img-wrap{
  flex:0 0 auto;
  position:relative;
}
.phsd-img-l{
  width:clamp(220px,22vw,380px);
  height:clamp(220px,22vw,380px);
  border-radius:50%;
  object-fit:cover;
  display:block;
  box-shadow:0 8px 32px -8px rgba(31,73,0,.28);
}
.phsd-img-r{
  width:clamp(200px,20vw,340px);
  height:clamp(200px,20vw,340px);
  border-radius:50%;
  object-fit:cover;
  display:block;
  box-shadow:0 8px 32px -8px rgba(31,73,0,.22);
}
/* 이미지 강등: placeholder 숨기고 wrap도 collapse */
.phsd-img-wrap:has(.ph){ display:none }

/* ── 타이틀 스택 (중앙 영역) ── */
.phsd-title-area{
  flex:1;
  display:flex;
  flex-direction:column;
  gap:6px;
  padding:0 clamp(12px,2vw,32px);
}
.phsd-sub{
  font-family:var(--font-hand);
  font-size:clamp(18px,2.2vw,30px);
  color:var(--accent-d);
  line-height:1.3;
}
.phsd-sub .em{ color:var(--brand) }
.phsd-hero{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,4.5vw,72px);
  color:var(--ink);
  line-height:1.1;
  letter-spacing:-.02em;
}
.phsd-hero .em{ color:var(--accent-d) }
.phsd-tag{
  font-family:var(--font-display);
  font-weight:500;
  font-size:clamp(16px,2vw,40px);
  color:var(--ink-2);
  line-height:1.3;
  margin-top:4px;
}
.phsd-tag .em{ color:var(--accent-d) }

/* ── 이중 원 뱃지 행 ── */
.phsd-badges{
  position:relative;
  z-index:1;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:clamp(14px,2.5vw,36px);
  margin-top:clamp(20px,3vw,36px);
  flex-wrap:wrap;
}
.phsd-badge{
  position:relative;
  width:clamp(110px,10vw,168px);
  height:clamp(110px,10vw,168px);
  display:flex;
  align-items:center;
  justify-content:center;
}
/* 외곽 베이지 원 */
.phsd-badge::before{
  content:'';
  position:absolute;
  inset:0;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 12%,#f7f6ee);
}
/* 내부 흰 원 (이중 원 효과) */
.phsd-badge::after{
  content:'';
  position:absolute;
  inset:calc(var(--r-scale,1)*9px);
  border-radius:50%;
  background:#ffffff;
  box-shadow:0 2px 8px -2px rgba(31,73,0,.15);
}
.phsd-badge-inner{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:1px;
  text-align:center;
}
.phsd-badge-l1,
.phsd-badge-l2{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(13px,1.4vw,22px);
  color:var(--accent-d);
  line-height:1.2;
  letter-spacing:-.01em;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="phsd">
  <!-- 배경 대원 앵커 -->
  <div class="phsd-anchor" aria-hidden="true"></div>

  <!-- 메인: 좌이미지 + 타이틀 + 우이미지 -->
  <div class="phsd-main">
    <div class="phsd-img-wrap">
      ${media(d.imageLeft, 'phsd-img-l', '제품 좌측 이미지')}
    </div>

    <div class="phsd-title-area">
      ${d.subtitle ? `<p class="phsd-sub">${richSafe(d.subtitle)}</p>` : ''}
      <h2 class="phsd-hero">${richSafe(d.title)}</h2>
      ${d.tagline ? `<p class="phsd-tag">${richSafe(d.tagline)}</p>` : ''}
    </div>

    <div class="phsd-img-wrap">
      ${media(d.imageRight, 'phsd-img-r', '제품 우측 이미지')}
    </div>
  </div>

  <!-- 하단 이중 원 뱃지 행 -->
  <div class="phsd-badges">
    ${d.badges.map(b => `
    <div class="phsd-badge">
      <div class="phsd-badge-inner">
        <span class="phsd-badge-l1">${esc(b.line1)}</span>
        <span class="phsd-badge-l2">${esc(b.line2)}</span>
      </div>
    </div>`).join('')}
  </div>
</section>`,
})
