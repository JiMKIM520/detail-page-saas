/** COMPARE 아키타입: ba-photo-split-card.
 *  [끝판왕] 추천·B&A #2 패턴 — 민트 배경 + 흰 라운드 카드 내 2열 이미지 슬롯 +
 *  색상 차별화 캡션바(전=차콜/후=틸 accent). 토큰 기반 재구성(픽셀 클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 최상단 작은 eyebrow 텍스트 (선택, 예: "안전성 검사 테스트 완료") */
  eyebrow: z.string().optional(),
  /** 대형 섹션 제목 (em, br 허용) */
  title: z.string().min(1),
  /** 카드 내 작은 서브 텍스트 (선택, 예: "달라진 몸을 느껴보세요!") */
  cardNote: z.string().optional(),
  /** 카드 내 강조 소제목 (em 허용, 예: "1회 사용 제품 효과를 적어주세요") */
  cardHeading: z.string().min(1),
  /** 뱃지/인증 라벨 (선택, 예: "제품효과 인체작용시험 완료") */
  badge: z.string().optional(),
  /** 전(BEFORE) 이미지 URL */
  beforeImage: z.string().optional(),
  /** 전 캡션바 텍스트 (기본: "사용 전") */
  beforeLabel: z.string().optional(),
  /** 후(AFTER) 이미지 URL */
  afterImage: z.string().optional(),
  /** 후 캡션바 텍스트 (기본: "사용 후") */
  afterLabel: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const baPhotoSplitCard = defineBlock<Data>({
  id: 'ba-photo-split-card',
  archetype: 'compare',
  styleTags: ['light', 'mint', 'beforeafter', 'photo', 'card', 'template'],
  imageSlots: 2,
  describe:
    '사용 전후 포토 비교(B&A). 민트/세이지 섹션 배경 + 흰 라운드 카드 내 2열 이미지 슬롯 + 색상 차별화 캡션바(전=차콜/후=틸 accent). 상단 대형 제목 + eyebrow + 카드 내 소제목 포함. 뷰티·식품·헬스케어 사용 전후 대조에 최적.',
  schema,
  css: `
/* ba-photo-split-card — 접두사 bpsc- */

/* 섹션 전체: 민트/세이지 배경 */
.bpsc{
  background:var(--bg);
  padding:54px 32px 60px;
  text-align:center;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* eyebrow: 작은 대문자 서브텍스트 */
.bpsc-eyebrow{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  letter-spacing:.06em;
  color:var(--accent-d);
  margin-bottom:10px;
}

/* 섹션 대제목 */
.bpsc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,6.8vw,50px);
  line-height:1.18;
  letter-spacing:-.025em;
  color:var(--ink);
  margin-bottom:20px;
}
.bpsc-title .em{color:var(--accent-d)}

/* 인증 뱃지 — 테두리형 pill */
.bpsc-badge{
  display:inline-block;
  border:1.5px solid var(--ink);
  border-radius:calc(var(--r-scale,1)*6px);
  padding:7px 20px;
  font-family:var(--font-body);
  font-size:14px;
  font-weight:600;
  color:var(--ink);
  letter-spacing:.01em;
  margin-bottom:28px;
}

/* 흰 라운드 카드 */
.bpsc-card{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:28px 24px 0;
  box-shadow:0 8px 32px -10px rgba(0,0,0,.12);
  overflow:hidden;
}

/* 카드 내 보조 텍스트 */
.bpsc-note{
  font-family:var(--font-body);
  font-size:14px;
  font-weight:500;
  color:var(--muted);
  text-align:left;
  margin-bottom:4px;
}

/* 카드 내 강조 소제목 */
.bpsc-heading{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(16px,3.2vw,20px);
  line-height:1.45;
  letter-spacing:-.015em;
  color:var(--accent-d);
  text-align:left;
  margin-bottom:22px;
}
.bpsc-heading .em{color:var(--accent-d)}

/* 2열 이미지 그리드 */
.bpsc-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}

/* 각 이미지 열 래퍼 — 캡션바 포함 */
.bpsc-col{
  display:flex;
  flex-direction:column;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));
  overflow:hidden;
}

/* 이미지 슬롯: 4:3 비율 */
.bpsc-img{
  width:100%;
  aspect-ratio:3/4;
  object-fit:cover;
  display:block;
}
.bpsc-img.ph{
  width:100%;
  aspect-ratio:3/4;
  background:rgba(0,0,0,.06);
  border:none;
  color:var(--muted);
  font-size:13px;
}

/* 캡션바 공통 */
.bpsc-cap{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:12px 8px;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(14px,2.8vw,17px);
  letter-spacing:.02em;
  color:#fff;
}

/* 전(BEFORE) — 차콜 */
.bpsc-cap-before{
  background:#3C3C3C;
}

/* 후(AFTER) — 틸/accent */
.bpsc-cap-after{
  background:var(--accent);
}
`,
  render: (d, { esc, richSafe }) => {
    const beforeLabel = esc(d.beforeLabel ?? '사용 전')
    const afterLabel = esc(d.afterLabel ?? '사용 후')

    return `
<section class="bpsc">
  ${d.eyebrow ? `<p class="bpsc-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  <h2 class="bpsc-title">${richSafe(d.title)}</h2>
  ${d.badge ? `<div class="bpsc-badge">${esc(d.badge)}</div>` : ''}
  <div class="bpsc-card">
    ${d.cardNote ? `<p class="bpsc-note">${esc(d.cardNote)}</p>` : ''}
    <p class="bpsc-heading">${richSafe(d.cardHeading)}</p>
    <div class="bpsc-grid">
      <div class="bpsc-col">
        ${media(d.beforeImage, 'bpsc-img', beforeLabel)}
        <div class="bpsc-cap bpsc-cap-before">${beforeLabel}</div>
      </div>
      <div class="bpsc-col">
        ${media(d.afterImage, 'bpsc-img', afterLabel)}
        <div class="bpsc-cap bpsc-cap-after">${afterLabel}</div>
      </div>
    </div>
  </div>
</section>`
  },
})
