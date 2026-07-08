/** EVENT 아키타입: event-comment-prize-grid.
 *  [끝판왕] 추천·B&A #5 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 필 배지(Event 번호) + CTA 헤드라인 → 폰 목업 내 해시태그 댓글버블 2개
 *  → 마감일 안내 → 2열 경품카드(이미지 + 당첨인원 원형배지 + 다크 라벨 푸터).
 *  댓글 이벤트·공유·당첨 경품 안내에 특화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 배지 텍스트 (예: "Event 01") */
  badgeLabel: z.string().min(1),
  /** CTA 헤드라인 (em, br 허용) */
  headline: z.string().min(1),
  /** 댓글 버블 2개 (username + 해시태그 댓글 내용) */
  comments: z
    .array(
      z.object({
        /** 사용자명 (예: "lisboa_fan") */
        username: z.string().min(1),
        /** 해시태그 포함 댓글 내용 (em 허용) */
        text: z.string().min(1),
      }),
    )
    .min(1)
    .max(3),
  /** 마감일/결과 발표 안내 텍스트 (예: "결과 발표: 5월 22일(수)") */
  deadline: z.string().min(1),
  /** 경품 카드 (2~3개, 이미지+라벨+당첨인원) */
  prizes: z
    .array(
      z.object({
        /** 경품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 경품 이름 (다크 푸터 라벨) */
        label: z.string().min(1),
        /** 당첨 인원 (예: "50명") — 원형 배지 텍스트 */
        winnerCount: z.string().min(1),
      }),
    )
    .min(2)
    .max(3),
})
type Data = z.infer<typeof schema>

export const eventCommentPrizeGrid = defineBlock<Data>({
  id: 'event-comment-prize-grid',
  archetype: 'event',
  styleTags: ['light', 'playful', 'event', 'social', 'template'],
  imageSlots: 3,
  describe:
    '댓글 이벤트+경품 안내. 필 배지(Event 번호) + CTA 헤드라인 + 폰 목업 내 해시태그 댓글버블(1~3개) + 마감일 안내 + 2열 경품카드(이미지+당첨인원 원형배지+다크 라벨 푸터). 소셜 공유/댓글 이벤트 프로모션 섹션.',
  schema,
  css: `
/* event-comment-prize-grid — 접두사 ecpg- */

/* 라이트 배경 블록 */
.ecpg{
  background:var(--paper);
  color:var(--ink);
  padding:52px 32px 56px;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 이벤트 배지 — 필 모양, accent 배경 */
.ecpg-badge{
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:14px;
  letter-spacing:.06em;
  padding:7px 22px;
  border-radius:999px;
  margin-bottom:22px;
}

/* CTA 헤드라인 */
.ecpg-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(24px,5.8vw,38px);
  line-height:1.3;
  letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:36px;
}
/* 라이트 배경 — .em은 --accent-d로 대비 확보 */
.ecpg-headline .em{color:var(--accent-d)}

/* 폰 목업 래퍼 */
.ecpg-phone-wrap{
  display:flex;
  justify-content:center;
  margin-bottom:24px;
}
.ecpg-phone{
  width:260px;
  background:#fff;
  border-radius:calc(var(--r-scale,1)*36px);
  border:2.5px solid #E2E2E8;
  box-shadow:0 8px 32px -8px rgba(0,0,0,.18);
  padding:24px 20px 20px;
  display:flex;
  flex-direction:column;
  gap:14px;
  /* 화면 내부처럼 보이도록 */
  position:relative;
}
/* 폰 노치(장식) */
.ecpg-phone::before{
  content:'';
  display:block;
  width:56px;
  height:6px;
  background:#D0D0D8;
  border-radius:999px;
  margin:0 auto 10px;
}

/* 댓글 버블 */
.ecpg-bubble{
  background:var(--bg);
  border-radius:calc(var(--r-scale,1)*14px);
  padding:12px 14px;
  text-align:left;
}
.ecpg-bubble-user{
  font-family:var(--font-body);
  font-size:11px;
  font-weight:700;
  color:var(--muted);
  margin-bottom:5px;
  letter-spacing:.01em;
}
.ecpg-bubble-text{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.55;
  color:var(--ink);
  word-break:break-all;
}
/* 해시태그 강조 */
.ecpg-bubble-text .em{
  color:var(--accent-d);
  font-weight:700;
}

/* 마감일 안내 */
.ecpg-deadline{
  font-family:var(--font-body);
  font-size:13px;
  color:var(--muted);
  margin-bottom:32px;
  letter-spacing:-.01em;
}

/* 구분선 */
.ecpg-divider{
  border:none;
  border-top:1px solid var(--line);
  margin:0 0 28px;
}

/* 경품 그리드 — 2열 */
.ecpg-prizes{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}
/* 3개일 때는 마지막 아이템이 풀폭 */
.ecpg-prizes.ecpg-prizes-3 .ecpg-card:last-child{
  grid-column:1 / -1;
  max-width:calc(50% - 7px);
  margin:0 auto;
}

/* 경품 카드 */
.ecpg-card{
  background:#fff;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));
  overflow:hidden;
  box-shadow:0 4px 18px -6px rgba(0,0,0,.14);
  position:relative;
  display:flex;
  flex-direction:column;
}

/* 경품 이미지 */
.ecpg-card-img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block;
}
.ecpg-card-img.ph{
  width:100%;
  aspect-ratio:1/1;
  border:none;
  background:rgba(0,0,0,.05);
  color:var(--muted);
  font-size:12px;
}

/* 당첨 인원 원형 배지 — 카드 우상단에 절대 배치 */
.ecpg-winner-badge{
  position:absolute;
  top:10px;
  right:10px;
  width:46px;
  height:46px;
  border-radius:50%;
  background:var(--accent);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:12px;
  line-height:1.15;
  text-align:center;
  white-space:pre-line;
  box-shadow:0 2px 8px rgba(0,0,0,.2);
  pointer-events:none;
}

/* 다크 라벨 푸터 */
.ecpg-card-label{
  background:var(--ink);
  color:#fff;
  font-family:var(--font-display);
  font-weight:700;
  font-size:13px;
  text-align:center;
  padding:11px 8px;
  letter-spacing:.01em;
  line-height:1.4;
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
}
`,
  render: (d, { esc, richSafe }) => {
    // 댓글 버블들
    const bubbles = d.comments
      .map(
        (c) => `
      <div class="ecpg-bubble">
        <div class="ecpg-bubble-user">${esc(c.username)}</div>
        <div class="ecpg-bubble-text">${richSafe(c.text)}</div>
      </div>`,
      )
      .join('')

    // 경품 카드들
    const cards = d.prizes
      .map(
        (p) => `
      <div class="ecpg-card">
        ${media(p.image, 'ecpg-card-img', esc(p.imageAlt ?? p.label))}
        <div class="ecpg-winner-badge">${esc(p.winnerCount)}</div>
        <div class="ecpg-card-label">${esc(p.label)}</div>
      </div>`,
      )
      .join('')

    const prizeGridClass =
      d.prizes.length === 3 ? 'ecpg-prizes ecpg-prizes-3' : 'ecpg-prizes'

    return `
<section class="ecpg">
  <span class="ecpg-badge">${esc(d.badgeLabel)}</span>
  <h2 class="ecpg-headline">${richSafe(d.headline)}</h2>

  <div class="ecpg-phone-wrap">
    <div class="ecpg-phone">
      ${bubbles}
    </div>
  </div>

  <p class="ecpg-deadline">${esc(d.deadline)}</p>
  <hr class="ecpg-divider">

  <div class="${prizeGridClass}">
    ${cards}
  </div>
</section>`
  },
})
