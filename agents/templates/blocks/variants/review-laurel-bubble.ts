/** REVIEW 아키타입: review-laurel-bubble
 *  205_후기_09 구조 흡수 — 월계수 인라인 SVG 장식 + 그라데이션 누적판매량 수치,
 *  꼬리 방향이 좌·우로 교번하는 말풍선 리뷰 4개 세로 스택, 하단 전체 폭 리뷰 사진.
 *  이미지 없을 시 사진 행 숨김(noimg-safe). 라이트 톤.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const reviewItem = z.object({
  text: z.string().min(1),                 // 후기 본문 (em,br)
  stars: z.number().int().min(1).max(5).optional(), // 별점 (기본 5)
  nick: z.string().optional(),             // 닉네임 (기본 생략)
})

const schema = z.object({
  // ── 헤더 ─────────────────────────────────────────────
  heading: z.string().min(1),              // 소제목 라인 (em,br) 예: "고객이 증명한 만족도"
  displayText: z.string().optional(),      // 영문/포인트 대형 디스플레이 텍스트 예: "real review"
  subheading: z.string().optional(),       // 헤더 아래 가는 설명

  // ── 판매량 ───────────────────────────────────────────
  salesNumber: z.string().optional(),      // 브리프 근거 시만: "123,456" 형태 숫자 문자열
  salesLabel: z.string().optional(),       // 판매량 라벨 예: "차원이 다른 누적판매량"
  salesNote: z.string().optional(),        // 각주 예: "* 2026년 01월 스마트스토어 기준"

  // ── 리뷰 목록 ────────────────────────────────────────
  reviews: z.array(reviewItem).min(2).max(4),

  // ── 하단 사진 ────────────────────────────────────────
  photo: z.string().optional(),            // (url) 전체 폭 리뷰 이미지
})

type Data = z.infer<typeof schema>

/** 별점 HTML — 채워진 별(★) + 빈 별(☆) 혼합 */
function renderStars(n: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(n)))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

export const reviewLaurelBubble = defineBlock<Data>({
  id: 'review-laurel-bubble',
  archetype: 'review',
  styleTags: ['light', 'warm', 'social-proof', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '고객 후기 블록. 월계수 SVG 장식으로 감싼 그라데이션 누적판매량 수치 + 꼬리 방향이 좌·우로 교번하는 말풍선 후기 2~4개 세로 스택 + 하단 전체 폭 리뷰 사진(이미지 없으면 사진 행 숨김). 라이트 크림 배경. 식품·뷰티 신뢰 섹션에 적합.',
  schema,
  css: `
/* ── 섹션 래퍼 ─────────────────────────────── */
.rlev{background:var(--bg);padding:64px 0 0;color:var(--ink)}

/* ── 헤더 ──────────────────────────────────── */
.rlev-hd{text-align:center;padding:0 var(--pad-x,56px) 0}
.rlev-heading{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:600;font-size:clamp(20px,2.6vw,28px);color:var(--accent);letter-spacing:-.01em;line-height:1.3}
.rlev-heading .em{color:var(--accent-d);font-weight:800}
.rlev-display{font-family:var(--font-hand),'Cafe24 Dangdanghae',cursive;font-weight:400;font-size:clamp(44px,7vw,72px);color:var(--accent);line-height:1.1;margin-top:4px}
.rlev-sub{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:300;font-size:clamp(14px,1.6vw,18px);color:var(--accent);margin-top:10px;opacity:.85}

/* ── 판매량 ────────────────────────────────── */
.rlev-sales{display:flex;align-items:center;justify-content:center;gap:0;margin:36px auto 0;max-width:520px;position:relative}
.rlev-laurel{flex:0 0 88px;width:88px;height:auto;opacity:.9}
.rlev-sales-inner{flex:1;text-align:center;padding:0 8px}
.rlev-sales-label{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:400;font-size:clamp(14px,1.5vw,18px);color:var(--ink);line-height:1}
.rlev-sales-num{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:800;font-size:clamp(42px,7vw,72px);line-height:1.1;margin-top:4px;
  background:linear-gradient(135deg,var(--accent-d) 0%,var(--accent) 55%,color-mix(in srgb,var(--accent) 60%,#fff) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.rlev-divider{width:80%;height:1px;background:var(--line);margin:14px auto 0;opacity:.6}
.rlev-note{text-align:center;font-size:clamp(11px,1.2vw,13px);color:var(--muted);margin-top:10px;padding:0 var(--pad-x,56px)}

/* ── 리뷰 리스트 ────────────────────────────── */
.rlev-list{margin:32px 0 0;padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:28px}
.rlev-item{position:relative}

/* 말풍선 본체 */
.rlev-bubble{background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*22px);padding:20px 28px 16px;position:relative}

/* 꼬리 — 왼쪽 (홀수 인덱스: 0,2) */
.rlev-item.tail-left .rlev-tail{position:absolute;bottom:-18px;left:32px;width:0;height:0;
  border-left:12px solid transparent;border-right:12px solid transparent;border-top:20px solid var(--paper,#fff)}

/* 꼬리 — 오른쪽 (짝수 인덱스: 1,3) */
.rlev-item.tail-right .rlev-tail{position:absolute;bottom:-18px;right:32px;width:0;height:0;
  border-left:12px solid transparent;border-right:12px solid transparent;border-top:20px solid var(--paper,#fff)}

.rlev-text{font-family:var(--font-body),'Pretendard',sans-serif;font-size:clamp(14px,1.6vw,17px);font-weight:400;color:var(--ink);line-height:1.75;text-align:center}
.rlev-text .em{color:var(--accent-d);font-weight:700}

.rlev-meta{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px}
.rlev-stars{font-size:clamp(13px,1.4vw,16px);color:#ffc935;letter-spacing:1px;line-height:1}
.rlev-nick{font-size:clamp(12px,1.3vw,14px);font-weight:500;color:var(--muted);line-height:1}

/* ── 하단 사진 ──────────────────────────────── */
.rlev-photo-wrap{margin-top:36px;width:100%;overflow:hidden}
.rlev-photo{width:100%;aspect-ratio:860/560;object-fit:cover;border-radius:var(--shape-photo, 0px);display:block}
/* noimg-safe: photo url 없으면 .ph → display:none!important (baseCss 전역) → 패딩만 사라짐 */
.rlev-photo.ph{display:none!important}
.rlev-photo-wrap:has(.ph){margin-top:0;padding-bottom:36px}
`,
  render: (d, { esc, richSafe }) => {
    // 꼬리 방향: 인덱스 0·2 → 왼쪽 / 1·3 → 오른쪽 (원본 교번 패턴)
    const tailClass = (i: number) => (i % 2 === 0 ? 'tail-left' : 'tail-right')

    const reviewsHtml = d.reviews
      .map((r, i) => {
        const stars = r.stars ?? 5
        const starsHtml = renderStars(stars)
        const nickHtml = r.nick ? `<span class="rlev-nick">${esc(r.nick)}</span>` : ''
        return `
    <div class="rlev-item ${tailClass(i)}">
      <div class="rlev-bubble">
        <p class="rlev-text">${richSafe(r.text)}</p>
        <div class="rlev-meta">
          <span class="rlev-stars">${starsHtml}</span>
          ${nickHtml}
        </div>
      </div>
      <div class="rlev-tail"></div>
    </div>`
      })
      .join('')

    // 월계수 SVG — 왼쪽(미러 없음)·오른쪽(scaleX(-1)) 각각 인라인
    const laurelLeft = `<svg class="rlev-laurel" viewBox="0 0 88 176" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g opacity=".88" fill="var(--accent)" fill-rule="evenodd" clip-rule="evenodd">
    <!-- 줄기 -->
    <rect x="42" y="16" width="4" height="144" rx="2"/>
    <!-- 잎사귀 7쌍: 아래→위 방향, 왼쪽 줄기 기준 왼쪽으로 뻗음 -->
    <ellipse cx="32" cy="152" rx="12" ry="6" transform="rotate(-20 32 152)"/>
    <ellipse cx="24" cy="136" rx="13" ry="6" transform="rotate(-30 24 136)"/>
    <ellipse cx="18" cy="118" rx="13" ry="6" transform="rotate(-38 18 118)"/>
    <ellipse cx="14" cy="99"  rx="13" ry="5.5" transform="rotate(-45 14 99)"/>
    <ellipse cx="14" cy="80"  rx="12" ry="5"   transform="rotate(-50 14 80)"/>
    <ellipse cx="18" cy="62"  rx="11" ry="5"   transform="rotate(-55 18 62)"/>
    <ellipse cx="26" cy="46"  rx="10" ry="4.5" transform="rotate(-60 26 46)"/>
    <!-- 리본 하단 -->
    <path d="M30 162 Q44 168 44 174 Q44 168 58 162 L56 158 Q44 163 44 158 Q44 163 32 158Z"/>
  </g>
</svg>`

    const laurelRight = `<svg class="rlev-laurel" viewBox="0 0 88 176" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="transform:scaleX(-1)">
  <g opacity=".88" fill="var(--accent)" fill-rule="evenodd" clip-rule="evenodd">
    <rect x="42" y="16" width="4" height="144" rx="2"/>
    <ellipse cx="32" cy="152" rx="12" ry="6" transform="rotate(-20 32 152)"/>
    <ellipse cx="24" cy="136" rx="13" ry="6" transform="rotate(-30 24 136)"/>
    <ellipse cx="18" cy="118" rx="13" ry="6" transform="rotate(-38 18 118)"/>
    <ellipse cx="14" cy="99"  rx="13" ry="5.5" transform="rotate(-45 14 99)"/>
    <ellipse cx="14" cy="80"  rx="12" ry="5"   transform="rotate(-50 14 80)"/>
    <ellipse cx="18" cy="62"  rx="11" ry="5"   transform="rotate(-55 18 62)"/>
    <ellipse cx="26" cy="46"  rx="10" ry="4.5" transform="rotate(-60 26 46)"/>
    <path d="M30 162 Q44 168 44 174 Q44 168 58 162 L56 158 Q44 163 44 158 Q44 163 32 158Z"/>
  </g>
</svg>`

    const salesBlock = d.salesNumber
      ? `
  <div class="rlev-sales">
    ${laurelLeft}
    <div class="rlev-sales-inner">
      ${d.salesLabel ? `<p class="rlev-sales-label">${esc(d.salesLabel)}</p>` : ''}
      <p class="rlev-sales-num">${esc(d.salesNumber)}</p>
    </div>
    ${laurelRight}
  </div>
  <hr class="rlev-divider">
  ${d.salesNote ? `<p class="rlev-note">${esc(d.salesNote)}</p>` : ''}`
      : ''

    return `
<section class="rlev">
  <div class="rlev-hd">
    <p class="rlev-heading">${richSafe(d.heading)}</p>
    ${d.displayText ? `<p class="rlev-display">${esc(d.displayText)}</p>` : ''}
    ${d.subheading ? `<p class="rlev-sub">${esc(d.subheading)}</p>` : ''}
  </div>
  ${salesBlock}
  <div class="rlev-list">
    ${reviewsHtml}
  </div>
  <div class="rlev-photo-wrap">
    ${media(d.photo, 'rlev-photo', '고객 리뷰 사진')}
  </div>
</section>`
  },
})
