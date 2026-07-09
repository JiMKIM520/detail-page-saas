/** PROMO 아키타입: promo-letter-badge-oval
 *  원본: 005_pc_전환8.json (pc_전환8, 1920×400)
 *  구조: 연살구 배경 + 상단 오렌지 색상 띠 + 4색 낱글자 정사각 배지 행 + 중앙 대형 헤드라인/서브/CTA + 좌우 타원 사진 프레임 2장.
 *  noimg-safe: 이미지 전무 시 타원 프레임을 숨기고 텍스트 영역을 중앙 풀폭으로 확장.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/* 낱글자 배지 색상 팔레트 — 4색 순환 (원본: 주황·초록·빨강·자주) */
const BADGE_COLORS = [
  'var(--accent)',        // 1번째: 포인트(주황 계열)
  '#88a24b',             // 2번째: 올리브그린
  '#fd6452',             // 3번째: 코럴레드
  '#a54a5c',             // 4번째: 모브
] as const

const schema = z.object({
  /** 배지 행에 한 글자씩 들어갈 단어 (2~4글자). 예: "선물세트" */
  badgeWord: z.string().min(2).max(4),
  /** 메인 헤드라인 (em/br 허용). 예: "프리미엄 <span class=\"em\">선물세트</span>" */
  title: z.string().min(1),
  /** 헤드라인 아래 서브카피 (선택, em 허용). 예: "소중한 분께 전하는 마음" */
  sub: z.string().optional(),
  /** CTA 강조 문구 (선택). 예: "사전예약하고 쿠폰도 챙기세요!" */
  cta: z.string().optional(),
  /** CTA 버튼 라벨. 기본 "지금 바로가기" */
  ctaLabel: z.string().optional(),
  /** 왼쪽 타원 사진 URL */
  imageLeft: z.string().optional(),
  /** 오른쪽 타원 사진 URL */
  imageRight: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const promoLetterBadgeOval = defineBlock<Data>({
  id: 'promo-letter-badge-oval',
  archetype: 'promo',
  styleTags: ['light', 'warm', 'food', 'gift', 'playful', 'seasonal', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '프로모션 배너(가로형). 연살구 배경 + 상단 오렌지 색상 띠 + 4색 낱글자 정사각 배지 행(2~4자) + 대형 헤드라인 + 서브카피 + 화살표 CTA 버튼 + 좌우 타원 이미지 프레임 2장. 선물세트·시즌 이벤트·사전예약 배너에 최적.',

  schema,

  css: `
/* ── 최상위 래퍼 ─────────────────────────────────────────── */
.pbec{position:relative;background:var(--pbec-bg,#f6e7d8);overflow:hidden;min-height:360px}

/* ── 상단 색상 띠 + 배지 행 ──────────────────────────────── */
.pbec-top{position:relative;z-index:2}
.pbec-strip{width:100%;height:8px;background:var(--accent)}
.pbec-badges{display:flex;align-items:center;justify-content:center;gap:0;padding:10px 0 0}
.pbec-badge{
  width:52px;height:52px;
  display:flex;align-items:center;justify-content:center;
  border-radius:calc(var(--r-scale,1)*6px);
  color:#fff;
  font-family:var(--font-display);
  font-weight:700;
  font-size:28px;
  line-height:1;
  flex-shrink:0
}

/* ── 본문 영역 (중앙) ────────────────────────────────────── */
.pbec-body{
  position:relative;z-index:3;  /* 타원(z-index:1)보다 항상 위 */
  isolation:isolate;             /* 독립 스택 컨텍스트 — 타원이 절대 침범 불가 */
  text-align:center;
  padding:18px var(--pad-x,56px) 32px;
  /* 이미지 있을 때는 좌우 타원이 절대 배치되므로 본문 폭 제한 */
  max-width:600px;
  margin:0 auto
}
.pbec-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,5.5vw,68px);
  line-height:1.12;
  color:var(--pbec-ink,#702e1d);
  letter-spacing:-.02em
}
.pbec-title .em{color:var(--accent)}
.pbec-sub{
  margin-top:8px;
  font-family:var(--font-body);
  font-weight:400;
  font-size:clamp(14px,1.8vw,20px);
  color:var(--pbec-ink,#702e1d);
  opacity:.85;
  line-height:1.5
}
.pbec-sub .em{color:var(--accent)}
.pbec-cta-text{
  margin-top:10px;
  font-family:var(--font-body);
  font-weight:500;
  font-size:clamp(13px,1.5vw,17px);
  color:var(--accent-d);
  line-height:1.4
}
.pbec-cta-text::before{content:'< '}
.pbec-cta-text::after{content:' >'}
.pbec-btn{
  display:inline-flex;align-items:center;gap:10px;
  margin-top:14px;
  background:var(--pbec-ink,#702e1d);color:#fff;
  font-family:var(--font-body);font-weight:500;font-size:clamp(13px,1.5vw,18px);
  padding:10px 22px 10px 28px;
  border-radius:999px;
  white-space:nowrap;
  text-decoration:none;cursor:default
}
.pbec-btn-arrow{
  width:28px;height:28px;background:#ffffff33;
  border-radius:999px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0
}
.pbec-btn-arrow svg{width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

/* ── 타원 사진 프레임 (좌/우 절대배치) ──────────────────── */
.pbec-oval-wrap{
  position:absolute;top:50%;transform:translateY(-50%);
  /* 폭을 본문 좌우 여백 내에만 허용 — 본문 영역(max-width:600px)을 침범하지 않도록
     viewport 절반에서 300px(본문 반폭)을 뺀 값과 28vw 중 작은 값으로 제한 */
  width:clamp(140px,min(28vw,calc(50vw - 300px - var(--pad-x,56px))),280px);
  z-index:1;          /* 본문(z-index:3)보다 항상 낮음 */
  pointer-events:none /* 오버랩 영역에서 텍스트 선택 방해 방지 */
}
.pbec-oval-wrap.left{left:var(--pad-x,56px)}
.pbec-oval-wrap.right{right:var(--pad-x,56px)}
.pbec-oval-ring{
  width:100%;aspect-ratio:1/0.94;
  border-radius:var(--shape-photo,50%);
  border:6px solid var(--accent);
  box-shadow:0 0 0 3px #fff,0 0 0 5px var(--accent);
  overflow:hidden;
  position:relative;
  background:var(--pbec-bg,#f6e7d8)
}
.pbec-oval-img,.pbec-oval-img.ph{
  width:calc(100% - 12px);height:calc(100% - 12px);
  position:absolute;top:6px;left:6px;
  object-fit:cover;
  border-radius:var(--shape-photo,50%)
}

/* ── noimg-safe: 이미지 없으면 타원 숨김 + 본문 풀폭 ───── */
.pbec.no-imgs .pbec-oval-wrap{display:none}
.pbec.no-imgs .pbec-body{max-width:100%;padding:24px var(--pad-x,56px) 36px}
`,

  render: (d, { esc, richSafe }) => {
    const label = esc(d.ctaLabel ?? '지금 바로가기')
    const chars = Array.from(d.badgeWord)         // 유니코드 안전 분리 (ES2017 compat)
    const hasLeft  = typeof d.imageLeft  === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageLeft.trim())
    const hasRight = typeof d.imageRight === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageRight.trim())
    const hasImgs  = hasLeft || hasRight
    const rootClass = `pbec${hasImgs ? '' : ' no-imgs'}`

    const badgeHtml = chars
      .map((ch, i) => {
        const bg = BADGE_COLORS[i % BADGE_COLORS.length]
        return `<span class="pbec-badge" style="background:${bg}">${esc(ch)}</span>`
      })
      .join('')

    const arrowSvg = `<svg viewBox="0 0 14 10"><path d="M1 5h12M8 1l5 4-5 4"/></svg>`

    return `
<section class="${rootClass}">
  <div class="pbec-top">
    <div class="pbec-strip"></div>
    <div class="pbec-badges">${badgeHtml}</div>
  </div>

  ${hasImgs ? `
  <div class="pbec-oval-wrap left">
    <div class="pbec-oval-ring">
      ${media(d.imageLeft, 'pbec-oval-img', '제품 이미지 1')}
    </div>
  </div>
  <div class="pbec-oval-wrap right">
    <div class="pbec-oval-ring">
      ${media(d.imageRight, 'pbec-oval-img', '제품 이미지 2')}
    </div>
  </div>` : ''}

  <div class="pbec-body">
    <h2 class="pbec-title">${richSafe(d.title)}</h2>
    ${d.sub  ? `<p class="pbec-sub">${richSafe(d.sub)}</p>` : ''}
    ${d.cta  ? `<p class="pbec-cta-text">${esc(d.cta)}</p>` : ''}
    <div>
      <span class="pbec-btn">
        ${label}
        <span class="pbec-btn-arrow">${arrowSvg}</span>
      </span>
    </div>
  </div>
</section>`
  },
})
