/** EVENT 아키타입: event-overlap-refund
 *  피그마 353_이벤트_07 구조 흡수.
 *  다크(브랜드색) 배경 + 노란 라운드 배지 + 대형 볼드 타이틀 + 설명 →
 *  원형 이미지와 전폭 직사각 이미지를 겹쳐 깊이감 연출 +
 *  그라디언트 원형 '환불 보장' 배지 우상단 플로팅 →
 *  하단 소셜 증거 문구 클로저.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badgeText: z.string().min(1),           // 상단 노란 라운드 배지 한 줄 (예: "7일 동안 충분히 체험해보세요.")
  title: z.string().min(1),              // 대형 볼드 타이틀 (em,br 허용)
  desc: z.string().optional(),           // 제목 아래 설명 (순수 텍스트)
  imageCircle: z.string().optional(),    // 원형 프레임 이미지 (url) — 제품/모델 클로즈업
  imageRect: z.string().optional(),      // 배경 직사각 이미지 (url) — 분위기/환경 컷
  refundLine1: z.string().optional(),    // 환불 배지 1행 (예: "안 되면")
  refundLine2: z.string().optional(),    // 환불 배지 2~3행 (em,br 허용; 예: "100%<br>환불")
  socialProof: z.string().optional(),    // 하단 소셜 증거 문구 (순수 텍스트; "브리프 근거 시만")
})
type Data = z.infer<typeof schema>

export const eventOverlapRefund = defineBlock<Data>({
  id: 'event-overlap-refund',
  archetype: 'event',
  // noimg-safe: 이미지 부재 시 사진 영역을 숨기고 텍스트+배지만 렌더 (이미지 0~2장 모두 안전)
  styleTags: ['dark', 'bold', 'food', 'pet', 'guarantee', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '이벤트/환불보장 블록. 다크 브랜드 배경 위 노란 라운드 배지(eyebrow) + 대형 볼드 타이틀 + 설명 → 원형·직사각 이미지 오버랩으로 깊이감 → 그라디언트 원형 배지(환불 보장) 우상단 플로팅 → 소셜 증거 클로저. 반품/환불 이벤트 강조 섹션에 적합.',
  schema,
  css: `
/* ── ehui: event-overlap-refund ── */
.ehui{
  position:relative;
  background:var(--brand);
  color:var(--ink);
  padding:56px 0 64px;
  overflow:hidden;
}

/* ── 다크 영역 em 색 스코프 오버라이드 ── */
.ehui .em{color:var(--em-dark,#FFF7EA)}

/* ── 타이틀 블록 ── */
.ehui-hd{
  padding:0 var(--pad-x,56px);
  text-align:center;
}

/* 상단 노란 라운드 배지 */
.ehui-badge{
  display:inline-block;
  background:#FFD153;
  color:#111;
  font-family:var(--font-display);
  font-weight:500;
  font-size:20px;
  line-height:1.3;
  padding:14px 32px;
  border-radius:999px;
  margin-bottom:28px;
  letter-spacing:-.01em;
}

/* 대형 타이틀 */
.ehui-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px, 8vw, 64px);
  line-height:1.18;
  letter-spacing:-.03em;
  color:#FFF7EA;
  margin-bottom:20px;
}
.ehui-title .em{color:var(--em-dark,#FFF7EA)}

/* 설명 */
.ehui-desc{
  font-family:var(--font-body);
  font-size:18px;
  font-weight:400;
  line-height:1.75;
  color:rgba(255,247,234,.72);
  max-width:640px;
  margin:0 auto;
}

/* ── 사진 영역 (원형 + 직사각 오버랩) ── */
.ehui-photo-wrap{
  position:relative;
  margin:44px 0 0;
  height:480px;
}

/* 배경 전폭 직사각 이미지 */
.ehui-rect{
  position:absolute;
  inset:60px 0 0 0;
  width:100%;
  height:420px;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));
}
.ehui-rect.ph{display:none!important}

/* 원형 이미지 — 중앙 상단에 겹침 */
.ehui-circle-wrap{
  position:absolute;
  top:0;
  left:50%;
  transform:translateX(-50%);
  width:340px;
  height:340px;
  border-radius:50%;
  overflow:hidden;
  border:4px solid var(--brand);
  box-shadow:0 12px 40px -8px rgba(0,0,0,.45);
  z-index:2;
}
.ehui-circle{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
}
.ehui-circle.ph{display:none!important}

/* 원형 이미지 없을 때 겹침 영역 공간 유지용 빈 블록 숨김 */
.ehui-circle-wrap:has(.ph){display:none}

/* ── 환불 보장 배지 (우상단 플로팅) ── */
.ehui-refund{
  position:absolute;
  top:0;
  right:var(--pad-x,56px);
  width:160px;
  height:160px;
  border-radius:50%;
  background:conic-gradient(from 160deg, #FFD153 0%, #FF8C42 40%, #FFB347 80%, #FFD153 100%);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  z-index:3;
  box-shadow:0 8px 32px -4px rgba(0,0,0,.32);
}
/* 내부 링 */
.ehui-refund::before{
  content:'';
  position:absolute;
  inset:8px;
  border-radius:50%;
  border:2px solid rgba(76,65,36,.4);
  pointer-events:none;
}
.ehui-refund-l1{
  font-family:var(--font-display);
  font-weight:900;
  font-size:17px;
  color:#4C4124;
  line-height:1.2;
  text-align:center;
}
.ehui-refund-l2{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(20px,3.6vw,28px);
  color:#4C4124;
  line-height:1.15;
  text-align:center;
}
.ehui-refund-l2 .em{color:#4C4124}

/* 사진 영역 전체 없을 때(양쪽 모두 이미지 없음) 래퍼 숨김 */
.ehui-photo-wrap.ehui--nophoto{display:none}

/* ── 소셜 증거 클로저 ── */
.ehui-social{
  margin:48px var(--pad-x,56px) 0;
  text-align:center;
  font-family:var(--font-body);
  font-size:18px;
  font-weight:500;
  line-height:1.7;
  color:rgba(255,247,234,.82);
}
`,
  render: (d, { esc, richSafe }) => {
    const hasCircle = typeof d.imageCircle === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageCircle.trim())
    const hasRect   = typeof d.imageRect   === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageRect.trim())
    const hasPhoto  = hasCircle || hasRect
    const noPhotoClass = hasPhoto ? '' : ' ehui--nophoto'

    const refundLine1 = d.refundLine1 ?? '안 되면'
    const refundLine2 = d.refundLine2 ?? '100%<br>환불'

    return `
<section class="ehui">

  <div class="ehui-hd">
    <span class="ehui-badge">${esc(d.badgeText)}</span>
    <h2 class="ehui-title">${richSafe(d.title)}</h2>
    ${d.desc ? `<p class="ehui-desc">${esc(d.desc)}</p>` : ''}
  </div>

  <div class="ehui-photo-wrap${noPhotoClass}">

    ${hasRect
      ? `${media(d.imageRect, 'ehui-rect', '이벤트 배경 이미지')}`
      : '<div class="ehui-rect ph" role="img" aria-label="배경 이미지 자리"></div>'}

    ${hasCircle
      ? `<div class="ehui-circle-wrap">${media(d.imageCircle, 'ehui-circle', '제품 원형 이미지')}</div>`
      : '<div class="ehui-circle-wrap"><div class="ehui-circle ph" role="img" aria-label="제품 이미지 자리"></div></div>'}

    <div class="ehui-refund" aria-label="환불 보장 배지">
      <span class="ehui-refund-l1">${esc(refundLine1)}</span>
      <span class="ehui-refund-l2">${richSafe(refundLine2)}</span>
    </div>

  </div>

  ${d.socialProof ? `<p class="ehui-social">${esc(d.socialProof)}</p>` : ''}

</section>`
  },
})
