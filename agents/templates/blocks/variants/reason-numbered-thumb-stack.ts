/** REASON 아키타입: reason-numbered-thumb-stack.
 *  066_리뷰_및_추천_구성_페이지_24 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 그라데이션 배경 + 2행 헤드라인(N가지 이유 오렌지 강조) +
 *  흰 카드 최대 5개 수직 스택, 카드 좌측에 오렌지 "01."~"05." 번호 + 제목 + 설명,
 *  카드 우측에 소형 섬네일 이미지 고정. 이미지 없을 때 텍스트만으로 붕괴 없음(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  /** 헤드라인 첫 줄: 제품명·브랜드 컨텍스트 (em/br 허용, 예: "[제품명]이 만족도 1등인") */
  headSub: z.string().min(1),
  /** 헤드라인 두 번째 줄 강조 앞부분: 기본 "N가지 이유" (em 허용) */
  headAccent: z.string().min(1),
  /** 헤드라인 두 번째 줄 일반 뒷부분: 기본 "를 확인하세요!" (em 허용) */
  headPlain: z.string().optional(),
  /** 이유 카드 (2~5개). 번호는 자동 생성(01.~05.) */
  items: z
    .array(
      z.object({
        /** 카드 소제목 (em 허용) */
        label: z.string().min(1),
        /** 카드 설명 텍스트 (em 허용) */
        text: z.string().min(1),
        /** 우측 섬네일 이미지 URL (선택 — 없어도 붕괴 안 함) */
        image: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const reasonNumberedThumbStack = defineBlock<Data>({
  id: 'reason-numbered-thumb-stack',
  archetype: 'reason',
  // noimg-safe: 이미지 미제공 시 우측 섬네일 영역을 숨기고 텍스트 전체폭으로 강등
  styleTags: ['mixed', 'reason', 'gradient', 'numbered', 'thumbnail', 'stack', 'noimg-safe'],
  imageSlots: 5,
  describe:
    '이유 나열형 스택 카드. 그라데이션 배경 + 2행 헤드라인(오렌지 강조 앞부분+일반 뒷부분) + 흰 카드 2~5개 수직 스택, 각 카드 좌측에 오렌지 "01."~"05." 번호·소제목·설명, 우측에 소형 섬네일. 이미지 없어도 텍스트 레이아웃으로 안전 강등.',
  schema,
  css: `
/* reason-numbered-thumb-stack — 접두사 rymj- */

/* ── 섹션 래퍼: 그라데이션 배경 ── */
.rymj {
  background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 14%, var(--bg)), var(--bg) 72%);
  color: var(--ink);
  padding: 64px var(--pad-x,56px) 72px;
}

/* 다크 배경(브랜드색 강조) 위 richSafe em 오버라이드 */
.rymj .em { color: var(--em-dark,#FFF7EA) }

/* ── 헤드라인 블록 ── */
.rymj-hd {
  margin-bottom: 40px;
}
.rymj-sub {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(18px, 3.6vw, 26px);
  line-height: 1.3;
  color: var(--ink);
  letter-spacing: -.01em;
  margin-bottom: 6px;
}
.rymj-sub .em { color: var(--accent); }
.rymj-h2 {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 10px;
}
.rymj-accent {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 6.4vw, 46px);
  line-height: 1.12;
  letter-spacing: -.02em;
  color: var(--accent);
}
.rymj-accent .em { color: var(--ink); }
.rymj-plain {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 6.4vw, 46px);
  line-height: 1.12;
  letter-spacing: -.02em;
  color: var(--ink);
}
.rymj-plain .em { color: var(--accent); }

/* ── 카드 스택 ── */
.rymj-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── 단일 카드 ── */
.rymj-card {
  display: flex;
  align-items: stretch;
  background: var(--paper, #ffffff);
  border-radius: calc(var(--r-scale,1) * 12px);
  overflow: hidden;
  box-shadow: 0 4px 20px -6px rgba(0,0,0,.13);
}

/* ── 카드 좌측: 번호 + 텍스트 ── */
.rymj-body {
  flex: 1 1 0;
  padding: 26px 28px 26px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rymj-num-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}
.rymj-num {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(20px, 3.2vw, 28px);
  line-height: 1;
  color: var(--accent);
  letter-spacing: .01em;
  flex-shrink: 0;
}
.rymj-label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(16px, 2.8vw, 22px);
  line-height: 1.25;
  letter-spacing: -.01em;
  color: var(--ink);
}
.rymj-label .em { color: var(--accent); font-weight: 800; }
.rymj-text {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: clamp(13px, 2.2vw, 16px);
  line-height: 1.65;
  color: var(--ink-2, #555);
  letter-spacing: -.003em;
}
.rymj-text .em { color: var(--accent); font-weight: 600; }

/* ── 카드 우측: 섬네일 이미지 ── */
.rymj-thumb-wrap {
  flex: 0 0 130px;
  width: 130px;
  align-self: stretch;
  overflow: hidden;
  border-radius: 0 calc(var(--r-scale,1) * 12px) calc(var(--r-scale,1) * 12px) 0;
}
.rymj-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--shape-photo, calc(var(--r-scale,1) * 8px));
  display: block;
}

/* noimg-safe: .ph(placeholder) 숨김 → 섬네일 래퍼도 숨김 */
.rymj-thumb-wrap:has(.ph) {
  display: none;
}
/* has() 미지원 폴백: JS 없이도 섬네일 없는 카드 정상 표시 */
@supports not selector(:has(*)) {
  .rymj-thumb-wrap { flex: 0 0 0; width: 0; overflow: hidden; }
}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.items
      .map((item, i) => {
        const numStr = `${pad2(i + 1)}.`
        const thumbWrap = `
      <div class="rymj-thumb-wrap">
        ${media(item.image, 'rymj-thumb', `이유 ${pad2(i + 1)} 섬네일`)}
      </div>`
        return `
    <div class="rymj-card">
      <div class="rymj-body">
        <div class="rymj-num-row">
          <span class="rymj-num">${esc(numStr)}</span>
          <span class="rymj-label">${richSafe(item.label)}</span>
        </div>
        <p class="rymj-text">${richSafe(item.text)}</p>
      </div>
      ${thumbWrap}
    </div>`
      })
      .join('')

    return `
<section class="rymj">
  <header class="rymj-hd">
    <p class="rymj-sub">${richSafe(d.headSub)}</p>
    <div class="rymj-h2">
      <span class="rymj-accent">${richSafe(d.headAccent)}</span>
      ${d.headPlain ? `<span class="rymj-plain">${richSafe(d.headPlain)}</span>` : ''}
    </div>
  </header>
  <div class="rymj-stack">
    ${cards}
  </div>
</section>`
  },
})
