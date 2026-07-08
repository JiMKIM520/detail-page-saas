/** PROMO 아키타입(템플릿 충실 재현): promo-story-price-reveal.
 *  [끝판왕] 포인트 구성 #13 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 신입사원 일지 프레임 헤더 + 대형 헤드라인 흐름 속 인라인 반응 pill 뱃지(구어체 스토리텔링)
 *  + 판매 기간 pill + 가격 계단(정가 취소선 → 최종가 대형 타이포) + 제품 이미지 오른쪽 오버랩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 왼쪽 브랜드/출처 라벨 (예: "회사 로고") */
  sourceLabel: z.string().optional(),
  /** 상단 오른쪽 다이어리 부제 (예: "신입사원 첫 광고 일지") */
  diaryLabel: z.string().optional(),
  /** 헤드라인 줄 1 — em 허용, pill 허용
   *  pill 삽입: 텍스트 안 원하는 위치에 [pill:텍스트] 마크업 사용 */
  line1: z.string().min(1),
  /** 헤드라인 줄 2 — em·pill 허용 */
  line2: z.string().min(1),
  /** 헤드라인 줄 3 — em·pill 허용 (선택) */
  line3: z.string().optional(),
  /** 판매 기간 문자열 (예: "5.10 - 5.15") */
  salePeriod: z.string().optional(),
  /** 정가 (취소선) (예: "99,000원") */
  originalPrice: z.string().optional(),
  /** 최종가 레이블 (예: "최종가격 (찐찐찐최종)") */
  finalLabel: z.string().optional(),
  /** 최종가 숫자 강조 텍스트 (예: "99,000원") */
  finalPrice: z.string().min(1),
  /** 제품 하단 스펙 한 줄 (예: "20,000mAh + 3대 동시충전") */
  specLine: z.string().optional(),
  /** 제품 이미지 URL (오른쪽 오버랩) */
  productImage: z.string().optional(),
  /** 제품 이미지 alt */
  productImageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

/**
 * [pill:텍스트] → <span class="pspr-pill">텍스트</span> 변환.
 * em 태그는 richSafe를 먼저 거쳤다고 가정하고 pill만 추가 처리.
 */
function parsePills(s: string): string {
  return s.replace(/\[pill:([^\]]+)\]/g, (_m, txt) => `<span class="pspr-pill">${txt}</span>`)
}

export const promoStoryPriceReveal = defineBlock<Data>({
  id: 'promo-story-price-reveal',
  archetype: 'promo',
  styleTags: ['storytelling', 'conversational', 'price', 'diary', 'inline-chip', 'template'],
  imageSlots: 1,
  describe:
    '프로모 스토리 가격 공개. 다이어리 스타일 헤더(출처 라벨 + 일지 부제) + 대형 헤드라인 흐름 안에 구어체 반응 pill 뱃지 인라인 삽입(독자 대화형 스토리텔링) + 판매 기간 pill + 가격 계단(정가 취소선 → 최종가 대형 강조) + 제품 이미지 오른쪽 오버랩. 커머스 신입사원 일지 / 반응형 이벤트 오퍼 구조.',
  schema,
  css: `
/* promo-story-price-reveal — 접두사 pspr- */
.pspr{background:var(--paper);padding:0 0 40px;word-break:keep-all;overflow-wrap:break-word;position:relative}

/* ── 상단 헤더 바 ── */
.pspr-hd{display:flex;justify-content:space-between;align-items:center;padding:16px 20px 14px;border-bottom:1px solid var(--line)}
.pspr-src{font-family:var(--font-body);font-size:13px;color:var(--muted);font-weight:500}
.pspr-diary{font-family:var(--font-body);font-size:13px;color:var(--muted);font-weight:500}

/* ── 본문 영역(이미지 오버랩 레이아웃) ── */
.pspr-body{position:relative;padding:28px 22px 0;min-height:320px}

/* ── 헤드라인 ── */
.pspr-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,9vw,54px);line-height:1.2;letter-spacing:-.025em;color:var(--ink);position:relative;z-index:2}
.pspr-headline .em{color:var(--accent-d)}
/* 인라인 반응 pill — accent 노란 배경(커머스 신호색 허용) + 잉크 텍스트 */
.pspr-pill{display:inline-block;background:#F9E825;color:#1a1a1a;font-family:var(--font-body);font-size:clamp(13px,3.2vw,16px);font-weight:700;padding:3px 12px;border-radius:999px;letter-spacing:-.01em;vertical-align:middle;margin:0 2px;line-height:1.5}

/* ── 기간 pill ── */
.pspr-period{display:inline-block;background:var(--accent-d);color:#fff;font-family:var(--font-body);font-size:clamp(13px,3.2vw,15px);font-weight:700;padding:5px 16px;border-radius:999px;letter-spacing:.01em;margin-top:18px;position:relative;z-index:2}

/* ── 제품 이미지 오버랩 ── */
.pspr-img-wrap{position:absolute;right:-8px;bottom:0;width:56%;max-width:260px;z-index:1;pointer-events:none}
.pspr-img{width:100%;height:auto;object-fit:contain;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px))}
.pspr-img.ph{width:100%;aspect-ratio:3/4;border:2px dashed var(--line);background:var(--bg);color:var(--muted);font-size:12px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px))}

/* ── 가격 영역 ── */
.pspr-price-wrap{padding:24px 22px 0;position:relative;z-index:2}
/* 정가 취소선 */
.pspr-orig{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.pspr-orig-label{font-family:var(--font-body);font-size:14px;color:var(--muted);font-weight:500}
.pspr-orig-val{display:inline-block;background:rgba(0,0,0,.07);color:var(--muted);font-family:var(--font-body);font-size:15px;font-weight:600;padding:3px 12px;border-radius:calc(var(--r-scale,1)*6px);text-decoration:line-through;text-decoration-color:var(--muted)}
/* 최종가 */
.pspr-final-label{font-family:var(--font-body);font-size:clamp(14px,3.6vw,17px);font-weight:700;color:var(--ink);margin-bottom:4px}
.pspr-final-price{font-family:var(--font-display);font-weight:800;font-size:clamp(38px,9.5vw,58px);letter-spacing:-.03em;line-height:1.1;color:var(--ink)}
.pspr-final-price .em{color:var(--accent-d)}

/* ── 스펙 한 줄 ── */
.pspr-spec{padding:14px 22px 0;font-family:var(--font-body);font-size:14px;color:var(--muted);font-weight:500;position:relative;z-index:2}
`,
  render: (d, { esc, richSafe }) => {
    const line1 = parsePills(richSafe(d.line1))
    const line2 = parsePills(richSafe(d.line2))
    const line3 = d.line3 ? parsePills(richSafe(d.line3)) : ''

    const headerHtml =
      d.sourceLabel || d.diaryLabel
        ? `<div class="pspr-hd">
    <span class="pspr-src">${esc(d.sourceLabel ?? '')}</span>
    <span class="pspr-diary">${esc(d.diaryLabel ?? '')}</span>
  </div>`
        : ''

    const periodHtml = d.salePeriod
      ? `<div><span class="pspr-period">${esc(d.salePeriod)}</span></div>`
      : ''

    const imgHtml = `<div class="pspr-img-wrap">
    ${media(d.productImage, 'pspr-img', esc(d.productImageAlt ?? '제품 이미지'))}
  </div>`

    const origHtml = d.originalPrice
      ? `<div class="pspr-orig">
    <span class="pspr-orig-label">정가</span>
    <span class="pspr-orig-val">${esc(d.originalPrice)}</span>
  </div>`
      : ''

    const finalLabelHtml = d.finalLabel
      ? `<div class="pspr-final-label">${esc(d.finalLabel)}</div>`
      : ''

    const specHtml = d.specLine
      ? `<div class="pspr-spec">${esc(d.specLine)}</div>`
      : ''

    return `
<section class="pspr">
  ${headerHtml}
  <div class="pspr-body">
    <div class="pspr-headline">
      <div>${line1}</div>
      <div>${line2}</div>
      ${line3 ? `<div>${line3}</div>` : ''}
    </div>
    ${periodHtml}
    ${imgHtml}
  </div>
  <div class="pspr-price-wrap">
    ${origHtml}
    ${finalLabelHtml}
    <div class="pspr-final-price">${richSafe(d.finalPrice)}</div>
  </div>
  ${specHtml}
</section>`
  },
})
