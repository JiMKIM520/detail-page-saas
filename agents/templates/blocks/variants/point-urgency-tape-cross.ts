/** POINT 아키타입: point-urgency-tape-cross.
 *  [끝판왕] 포인트 구성 #31 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--ink) 배경 + eyebrow 라벨 + D-day 카운터 + 대형 urgency 헤드라인
 *  + 중앙 제품 이미지 위 X자 대각선 테이프 밴드(반복 마키 텍스트, 애니메이션 스크롤)
 *  + 하단 urgency 서브카피 + CTA.
 *  커머스 마감 임박 · 블랙프라이데이 · 타임세일 섹션 최적화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 eyebrow 라벨 (예: "BLACK FRIDAY", "FLASH SALE") */
  eyebrow: z.string().min(1),
  /** D-day 카운터 라인 (예: "종료 D-7", "마감 D-3") */
  dday: z.string().min(1),
  /** 대형 urgency 헤드라인 (em 허용) */
  title: z.string().min(1),
  /** 테이프 밴드에 반복될 마키 텍스트 (예: "BLACK FRIDAY", "LIMITED OFFER") */
  tapeText: z.string().min(1),
  /** 중앙 제품 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 하단 urgency 서브카피 (em, br 허용) */
  body: z.string().min(1),
  /** 하단 CTA 버튼 텍스트 (선택) */
  cta: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 마키 텍스트를 n회 반복한 문자열 생성 (애니메이션 -50% translateX에 맞춰 2배 패딩) */
function repeatTape(text: string, n: number): string {
  return Array(n).fill(text).join(' · ')
}

export const pointUrgencyTapeCross = defineBlock<Data>({
  id: 'point-urgency-tape-cross',
  archetype: 'point' as any,
  styleTags: ['dark', 'urgency', 'promo', 'tape', 'dday', 'template'],
  imageSlots: 1,
  describe:
    '마감 임박 urgency 포인트. 다크 배경 + eyebrow 라벨 + D-day 카운터 + 대형 헤드라인 + 중앙 제품 이미지 위 X자 대각선 테이프 밴드(반복 마키 텍스트 스크롤 오버레이) + 하단 urgency 서브카피 + CTA. 블랙프라이데이·타임세일·마감임박 섹션.',
  schema,
  css: `
/* point-urgency-tape-cross — 접두사 putc- */
.putc{background:var(--ink);color:#fff;padding:56px 0 60px;text-align:center;overflow:hidden;word-break:keep-all}

/* ── 상단 헤더 ── */
.putc-eyebrow{display:inline-block;background:#e8174a;color:#fff;font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.18em;text-transform:uppercase;padding:5px 18px;border-radius:2px;margin-bottom:16px}
.putc-dday{font-family:var(--font-display);font-weight:700;font-size:clamp(16px,3.6vw,22px);color:rgba(255,255,255,.72);letter-spacing:.04em;margin-bottom:8px}
.putc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(44px,10vw,72px);line-height:1.08;letter-spacing:-.03em;color:#fff;padding:0 40px;margin-bottom:36px}
.putc-title .em{color:#e8174a}

/* ── 제품 이미지 스테이지 + X자 테이프 오버레이 ── */
.putc-stage{position:relative;width:100%;padding-top:96%;max-width:440px;margin:0 auto}
/* 이미지/placeholder: 스테이지 중앙 정렬, 테이프 아래 레이어 */
.putc-img{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;width:68%;aspect-ratio:1/1;object-fit:contain;filter:drop-shadow(0 8px 32px rgba(0,0,0,.55))}
/* media() placeholder: .ph 클래스 공존 가능 — shared.ts media()는 sizeClass로 클래스 지정 */
.putc-img.ph{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;width:68%;aspect-ratio:1/1;border-radius:50%;border:2px dashed rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:rgba(255,255,255,.35);font-size:13px;display:flex;align-items:center;justify-content:center}

/* 테이프 공통 — position:absolute, 스테이지 중앙 근처 */
.putc-tape{position:absolute;left:-20%;width:140%;height:44px;background:#e8174a;display:flex;align-items:center;overflow:hidden;white-space:nowrap;z-index:3;box-shadow:0 4px 18px rgba(232,23,74,.45)}
.putc-tape-txt{font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.14em;color:#fff;text-transform:uppercase;white-space:nowrap;will-change:transform;animation:putc-scroll 18s linear infinite}
.putc-tape.rev .putc-tape-txt{animation-direction:reverse}
/* 테이프A: 왼쪽위→오른쪽아래 (피그마 상단 대각선) */
.putc-tape.t1{top:32%;transform:rotate(-20deg);transform-origin:center}
/* 테이프B: 오른쪽위→왼쪽아래 (피그마 하단 대각선, 역방향) */
.putc-tape.t2{top:56%;transform:rotate(20deg);transform-origin:center}
/* 테이프 끝 그림자로 단면 입체감 */
.putc-tape::before,.putc-tape::after{content:'';position:absolute;top:0;height:100%;width:14px;z-index:1;pointer-events:none}
.putc-tape::before{left:0;background:linear-gradient(90deg,rgba(0,0,0,.28),transparent)}
.putc-tape::after{right:0;background:linear-gradient(-90deg,rgba(0,0,0,.28),transparent)}
@keyframes putc-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* ── 하단 카피 + CTA ── */
.putc-body{margin-top:36px;padding:0 40px;font-family:var(--font-display);font-weight:700;font-size:clamp(18px,4vw,26px);line-height:1.5;color:#fff}
.putc-body .em{color:#e8174a}
.putc-cta{display:inline-block;margin-top:26px;background:#e8174a;color:#fff;font-family:var(--font-display);font-weight:800;font-size:17px;padding:16px 48px;border-radius:4px;letter-spacing:.04em;box-shadow:0 6px 24px rgba(232,23,74,.5)}
`,
  render: (d, { esc, richSafe }) => {
    // 테이프 텍스트: 12회 반복 → 복제 한 번 더 붙여 seamless -50% loop
    const half = repeatTape(esc(d.tapeText), 12)
    const tapeDouble = `${half} &nbsp; ${half}`

    return `
<section class="putc">
  <span class="putc-eyebrow">${esc(d.eyebrow)}</span>
  <p class="putc-dday">${esc(d.dday)}</p>
  <h2 class="putc-title">${richSafe(d.title)}</h2>

  <div class="putc-stage">
    ${media(d.image, 'putc-img', esc(d.imageAlt ?? '제품 이미지'))}
    <div class="putc-tape t1">
      <span class="putc-tape-txt">${tapeDouble}</span>
    </div>
    <div class="putc-tape t2 rev">
      <span class="putc-tape-txt">${tapeDouble}</span>
    </div>
  </div>

  <p class="putc-body">${richSafe(d.body)}</p>
  ${d.cta ? `<span class="putc-cta">${esc(d.cta)}</span>` : ''}
</section>`
  },
})
