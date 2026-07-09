/** REVIEW 아키타입: review-bubble-score
 *  연파 배경 + 인용부호 SVG + 섹션 타이틀 + 대형 숫자 평점(4.9/5) + 그라데이션 별점 5개 +
 *  기준 주석 + 4개 꼬리 달린 말풍선 카드 + 하단 전폭 이미지.
 *  출처: 094_후기_04.json (860px 모바일 → 872px 데스크톱 확장 재구성)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 제목 헤드라인 (em, br 허용). 예: "고객들이 인정한 <span class=\"em\">산뜻함</span>" */
  title: z.string().min(1),
  /** 평점 숫자 문자열. 예: "4.9/5" */
  score: z.string().min(1).optional(),
  /** 평점 라벨. 예: "사용자 리뷰 평점" */
  scoreLabel: z.string().optional(),
  /** 평점 기준 주석. 예: "＊2026년 01월 스마트스토어 기준" */
  scoreNote: z.string().optional(),
  /** 말풍선 리뷰 카드 (2~4개) */
  bubbles: z
    .array(
      z.object({
        /** 리뷰 본문 (em, br 허용) */
        text: z.string().min(1),
        /** 리뷰어 닉네임 또는 출처 (순수 텍스트) */
        author: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 하단 전폭 이미지 URL (없으면 섹션 붕괴 방지 — noimg-safe) */
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 그라데이션 별 5개 SVG (accent → accent-d 수평 그라데이션) */
const STAR_GRADIENT_SVG = `<svg class="rbs-stars" viewBox="0 0 290 54" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="rbs-star-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="var(--accent)"/>
      <stop offset="100%" stop-color="var(--accent-d)"/>
    </linearGradient>
  </defs>
  ${[0, 59, 118, 177, 236]
    .map(
      (x) =>
        `<path fill="url(#rbs-star-grad)" transform="translate(${x},0)" d="M27 2l5 16h17L36 28l5 17-14-10-14 10 5-17L5 18h17z"/>`,
    )
    .join('')}
</svg>`

/** 인용 여는 부호 SVG (accent 색) */
const QUOTE_SVG = `<svg class="rbs-quote" viewBox="0 0 72 49" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="var(--accent)" d="M0 49V28C0 12.5 8.5 3.2 25.5 0l3.8 6.3C21.2 8.7 16.5 13.6 15.5 20H28V49H0zm44 0V28C44 12.5 52.5 3.2 69.5 0l3.8 6.3C65.2 8.7 60.5 13.6 59.5 20H72V49H44z"/>
</svg>`

/** 말풍선 꼬리 SVG (아래쪽 중앙, white fill) */
const TAIL_SVG = `<svg class="rbs-tail" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="var(--paper)" d="M0 0 L50 0 L25 50 Z"/>
</svg>`

export const reviewBubbleScore = defineBlock<Data>({
  id: 'review-bubble-score',
  archetype: 'review',
  // noimg-safe: 하단 이미지 없을 때 이미지 영역 자체를 숨겨 레이아웃 붕괴 방지
  styleTags: ['light', 'review', 'bubble', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '고객 리뷰 블록. 연파 배경 + 인용부호 SVG + 대형 숫자 평점(예: 4.9/5) + 그라데이션 별 5개 + 기준 주석 + 꼬리 달린 말풍선 카드 2~4개 + 하단 전폭 사진. 브리프에 실측 평점·기준일이 있을 때만 score/scoreNote 슬롯에 기입.',
  schema,
  css: `
/* ── review-bubble-score ── */
.rbs{
  background:color-mix(in srgb,var(--accent) 10%,#e8f4ff);
  padding:72px var(--pad-x,56px) 0;
  text-align:center;
  overflow:hidden
}

/* 인용 부호 */
.rbs-quote{
  width:56px;height:38px;
  margin:0 auto 18px;
  display:block
}

/* 섹션 타이틀 */
.rbs-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,5vw,58px);
  color:var(--accent);
  line-height:1.15;
  letter-spacing:-.02em
}
.rbs-title .em{color:var(--accent-d)}

/* 평점 영역 */
.rbs-score-wrap{
  margin:36px auto 0;
  display:flex;flex-direction:column;align-items:center;gap:8px
}
.rbs-score-label{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(18px,2.5vw,24px);
  color:var(--accent)
}
.rbs-score-num{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(56px,9vw,88px);
  color:var(--accent);
  line-height:1;
  letter-spacing:-.04em
}
.rbs-stars{
  width:clamp(160px,25vw,240px);
  height:auto;
  display:block
}
.rbs-score-note{
  font-size:clamp(13px,1.5vw,16px);
  color:var(--muted);
  margin-top:4px
}

/* 말풍선 카드 리스트 */
.rbs-bubbles{
  margin:44px auto 0;
  display:flex;
  flex-direction:column;
  gap:0;
  max-width:760px
}

/* 개별 말풍선 래퍼 (카드 + 꼬리) */
.rbs-bubble-wrap{
  display:flex;
  flex-direction:column;
  align-items:center
}

/* 말풍선 카드 본체 */
.rbs-bubble{
  background:var(--paper,#fff);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:24px 32px;
  width:100%
}
.rbs-bubble-text{
  font-family:var(--font-body);
  font-weight:400;
  font-size:clamp(16px,2vw,20px);
  color:var(--ink);
  line-height:1.75;
  text-align:center
}
.rbs-bubble-text .em{color:var(--accent-d);font-weight:700}
.rbs-bubble-author{
  margin-top:10px;
  font-size:clamp(12px,1.3vw,14px);
  color:var(--muted);
  font-weight:600;
  text-align:right
}

/* 꼬리 삼각형 */
.rbs-tail{
  width:40px;height:32px;
  display:block;
  /* 꼬리를 카드 fill과 동일하게 — CSS var 사용 */
  color:var(--paper,#fff);
  margin-top:-1px
}
/* 마지막 말풍선 꼬리 제거(이미지와 연결 안 되는 경우 시각 완결) */
.rbs-bubble-wrap:last-child .rbs-tail{display:none}

/* 하단 전폭 이미지 */
.rbs-img-wrap{
  margin-top:40px;
  /* 이미지 없으면 높이 0으로 완전 숨김 — noimg-safe */
  line-height:0
}
.rbs-img-wrap.rbs-noimg{display:none}
.rbs-photo{
  width:calc(100% + calc(var(--pad-x,56px)*2));
  margin-left:calc(var(--pad-x,56px)*-1);
  height:auto;
  aspect-ratio:860/600;
  object-fit:cover;
  border-radius:0;
  display:block;
  border-radius:var(--shape-photo, 0px)
}
/* placeholder 숨김(noimg-safe) */
.rbs-photo.ph{display:none!important}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage =
      typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())

    return `
<section class="rbs">
  ${QUOTE_SVG}
  <h2 class="rbs-title">${richSafe(d.title)}</h2>

  <div class="rbs-score-wrap">
    ${d.scoreLabel ? `<p class="rbs-score-label">${esc(d.scoreLabel)}</p>` : ''}
    ${d.score ? `<p class="rbs-score-num">${esc(d.score)}</p>` : ''}
    ${STAR_GRADIENT_SVG}
    ${d.scoreNote ? `<p class="rbs-score-note">${esc(d.scoreNote)}</p>` : ''}
  </div>

  <div class="rbs-bubbles">
    ${d.bubbles
      .map(
        (b) => `
    <div class="rbs-bubble-wrap">
      <div class="rbs-bubble">
        <p class="rbs-bubble-text">${richSafe(b.text)}</p>
        ${b.author ? `<p class="rbs-bubble-author">— ${esc(b.author)}</p>` : ''}
      </div>
      ${TAIL_SVG}
    </div>`,
      )
      .join('')}
  </div>

  <div class="rbs-img-wrap${hasImage ? '' : ' rbs-noimg'}">
    ${media(d.image, 'rbs-photo', '고객 리뷰 대표 이미지')}
  </div>
</section>`
  },
})
