/** CLOSING 아키타입: closing-quote-photo
 *  풀블리드 사진 배경 + 다크 스크림 + 인용부호·구분선·대형 헤드라인 스택 + 좌우 원형 사진 2장.
 *  원본 피그마 프레임: 004_pc_전환7 (1920×400, 중앙 텍스트 + 양측 원형 누끼)
 *  872px 기준 재구성 — 색·폰트 전부 토큰, 카피 zod 슬롯.
 *  noimg-safe: 원형 이미지 전무 시 텍스트 블록으로 강등(원형 프레임 은폐). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 배경 사진 URL. 없으면 --brand 색 배경으로 강등. */
  bgImage: z.string().optional(),
  /** 인용부호 바로 아래 보조 헤드라인 (em 허용). 원본 44px 라인. */
  subHead: z.string().min(1),
  /** 대형 강조 헤드라인 (em 허용). 원본 75px 옐로우 라인. */
  title: z.string().min(1),
  /** 헤드라인 아래 한 줄 설명 (em,br 허용). 원본 36px 화이트 라인. */
  desc: z.string().optional(),
  /** 좌측 원형 사진 URL. 브리프에 인물·제품 근접 컷이 있을 때만. */
  photoLeft: z.string().optional(),
  /** 우측 원형 사진 URL. 브리프에 인물·제품 근접 컷이 있을 때만. */
  photoRight: z.string().optional(),
  /** 수치·후기성 뱃지 텍스트 (예: "★ 4.9 / 1,200건"). 브리프에 근거 있을 때만. */
  badge: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const closingQuotePhoto = defineBlock<Data>({
  id: 'closing-quote-photo',
  archetype: 'closing',
  styleTags: ['dark', 'editorial', 'food', 'premium', 'noimg-safe'],
  imageSlots: 3, // bgImage + photoLeft + photoRight
  describe:
    '풀블리드 사진 배경 + 다크 스크림 위 인용부호·구분선·대형 헤드라인 텍스트 스택 + 좌우 원형 사진 2장. 마무리 클로징 히어로. 원형 사진 없을 때는 중앙 텍스트 전용으로 강등(noimg-safe). 수치·후기성 badge는 브리프에 근거 있을 때만.',
  schema,
  css: `
/* ── 최상위 컨테이너 ─────────────────────────── */
.cqph{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:360px;
  overflow:hidden;
  background:var(--brand);
  padding:48px var(--pad-x,56px);
}
/* 배경 이미지 */
.cqph-bg{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;
  object-position:center;
  z-index:0;
}
/* 다크 스크림 — em-dark 필수 (Sprint 6 Directive) */
.cqph-scrim{
  position:absolute;inset:0;
  background:linear-gradient(to right,
    rgba(0,0,0,.55) 0%,
    rgba(0,0,0,.38) 50%,
    rgba(0,0,0,.55) 100%);
  z-index:1;
}
/* 배경 없을 때 폴백 그라디언트 */
.cqph.no-bg .cqph-scrim{
  background:linear-gradient(135deg,
    color-mix(in srgb,var(--brand) 92%,#000) 0%,
    color-mix(in srgb,var(--brand) 70%,#000) 100%);
}
/* ── 내부 3열 레이아웃 ───────────────────────── */
.cqph-inner{
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:32px;
  width:100%;
  max-width:760px;
}
/* ── 원형 사진 ──────────────────────────────── */
.cqph-circle-wrap{
  flex:0 0 auto;
  width:160px;
  height:160px;
}
.cqph-circle-wrap img,
.cqph-circle-wrap .ph{
  width:160px;
  height:160px;
  border-radius:50%;
  object-fit:cover;
  border:3px solid rgba(255,255,255,.22);
  box-shadow:0 8px 28px rgba(0,0,0,.45);
}
/* noimg-safe: .ph는 전역 display:none — 원형 래퍼 자체도 숨김 */
.cqph-circle-wrap:has(.ph){
  display:none;
}
/* ── 중앙 텍스트 스택 ────────────────────────── */
.cqph-body{
  flex:1 1 0;
  min-width:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
  text-align:center;
  color:#fff;
}
/* 인용부호 — CSS 생성 (벡터 장식 재구성) */
.cqph-quotemark{
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-size:52px;
  line-height:.7;
  color:rgba(255,255,255,.9);
  margin-bottom:6px;
  letter-spacing:-.02em;
  user-select:none;
}
/* 상단 구분선 */
.cqph-rule{
  width:120px;
  height:2px;
  background:rgba(217,217,217,.55);
  margin:10px auto 14px;
  border:none;
}
/* 보조 헤드라인 */
.cqph-subhead{
  font-family:var(--font-display);
  font-weight:700;
  font-size:20px;
  line-height:1.35;
  color:#fff;
  letter-spacing:-.01em;
}
.cqph-subhead .em{
  color:var(--em-dark,#FFF7EA);
  font-weight:800;
}
/* 대형 강조 헤드라인 */
.cqph-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,4vw,46px);
  line-height:1.15;
  color:var(--accent);
  letter-spacing:-.02em;
  margin-top:6px;
}
.cqph-title .em{
  color:var(--em-dark,#FFF7EA);
}
/* 설명 한 줄 */
.cqph-desc{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:400;
  line-height:1.6;
  color:rgba(255,255,255,.88);
  margin-top:10px;
}
.cqph-desc .em{
  color:var(--em-dark,#FFF7EA);
  font-weight:700;
}
/* 하단 구분선 */
.cqph-rule-b{
  width:120px;
  height:2px;
  background:rgba(217,217,217,.55);
  margin:14px auto 0;
  border:none;
}
/* 수치·후기성 뱃지 (optional) */
.cqph-badge{
  margin-top:14px;
  display:inline-block;
  background:rgba(255,255,255,.15);
  border:1px solid rgba(255,255,255,.3);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:5px 16px;
  font-size:13px;
  font-weight:700;
  color:#fff;
  letter-spacing:.03em;
  backdrop-filter:blur(4px);
}
/* ── 시그니처 사진 프레임 토큰 노출 ────────────
   원형 border-radius는 50%(예외) — shape-photo는 bg 대형 사진에 적용 안 함 */
.cqph-bg{border-radius:0}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe 판정: 좌우 원형 사진이 모두 없을 때 원형 래퍼(:has(.ph))가 자동 은폐됨
    // — CSS로 처리하므로 render 분기 불필요. bgImage 없을 때 no-bg 클래스 추가.
    const hasBg = typeof d.bgImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.bgImage.trim())
    const sectionClass = `cqph${hasBg ? '' : ' no-bg'}`

    return `
<section class="${sectionClass}">
  ${hasBg ? `<img class="cqph-bg" src="${esc(d.bgImage)}" alt="">` : ''}
  <div class="cqph-scrim"></div>
  <div class="cqph-inner">
    <div class="cqph-circle-wrap">
      ${media(d.photoLeft, 'cqph-circle', '제품 사진 좌')}
    </div>
    <div class="cqph-body">
      <div class="cqph-quotemark">&ldquo;</div>
      <hr class="cqph-rule">
      <p class="cqph-subhead">${richSafe(d.subHead)}</p>
      <h2 class="cqph-title">${richSafe(d.title)}</h2>
      ${d.desc ? `<p class="cqph-desc">${richSafe(d.desc)}</p>` : ''}
      <hr class="cqph-rule-b">
      ${d.badge ? `<span class="cqph-badge">${esc(d.badge)}</span>` : ''}
    </div>
    <div class="cqph-circle-wrap">
      ${media(d.photoRight, 'cqph-circle', '제품 사진 우')}
    </div>
  </div>
</section>`
  },
})
