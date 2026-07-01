/** REVIEW 아키타입: review-image-rows.
 *  [끝판왕] 리뷰·추천 #12 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + eyebrow + 대형 헤드라인 + [좌 텍스트 | 우 썸네일] 수평 행 반복 + 행간 구분선.
 *  복잡도: low — 순수 수직 스택, 이미지 없으면 점선 placeholder 자동 대체. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 작은 eyebrow 레이블 (예: "리얼 후기 | 고객 목소리") */
  eyebrow: z.string().min(1).optional(),
  /** 대형 섹션 제목 (em 허용) */
  title: z.string().min(1),
  /** 텍스트+썸네일 반복 행 (2~6개) */
  items: z
    .array(
      z.object({
        /** 리뷰 소제목 / 한줄 요약 (em 허용) */
        heading: z.string().min(1),
        /** 리뷰 본문 (em, br 허용) */
        body: z.string().min(1).optional(),
        /** 작성자 정보 (닉네임, 마스킹 이메일 등) */
        author: z.string().min(1).optional(),
        /** 우측 썸네일 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const reviewImageRows = defineBlock<Data>({
  id: 'review-image-rows',
  archetype: 'review',
  styleTags: ['light', 'social-proof', 'list', 'template'],
  imageSlots: 4,
  describe:
    '고객 리얼 후기(텍스트+썸네일 행 반복). 밝은 배경 + eyebrow + 대형 헤드라인 + [좌: 소제목·본문·작성자 | 우: 정사각 썸네일] 수평 행(2~6개) + 행간 수평 구분선. 소셜 증거 섹션.',
  schema,
  css: `
/* review-image-rows — prefix rir- */
.rir{background:var(--paper);padding:56px 40px 60px;word-break:keep-all;overflow-wrap:break-word}
.rir-hd{margin-bottom:36px}
.rir-eyebrow{font-family:var(--font-body);font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-d);margin-bottom:14px}
.rir-title{font-family:var(--font-display);font-weight:800;font-size:clamp(30px,6vw,44px);line-height:1.18;letter-spacing:-.02em;color:var(--ink)}
.rir-title .em{color:var(--accent-d)}
.rir-list{display:flex;flex-direction:column}
.rir-row{display:flex;align-items:flex-start;gap:18px;padding:22px 0}
.rir-row+.rir-row{border-top:1px solid var(--line)}
.rir-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;justify-content:center}
.rir-heading{font-family:var(--font-display);font-weight:700;font-size:clamp(15px,3vw,18px);line-height:1.4;color:var(--ink)}
.rir-heading .em{color:var(--accent-d)}
.rir-body{font-family:var(--font-body);font-size:14px;line-height:1.7;color:var(--ink);opacity:.8}
.rir-body .em{color:var(--accent-d);font-weight:700}
.rir-author{font-family:var(--font-body);font-size:12px;color:var(--muted);letter-spacing:.01em}
.rir-thumb{flex:0 0 88px;width:88px;height:88px;object-fit:cover;border-radius:8px;display:block}
.rir-thumb.ph{flex:0 0 88px;width:88px;height:88px;border-radius:8px;border:2px dashed var(--line);background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map(
        (it) => `
    <div class="rir-row">
      <div class="rir-txt">
        <p class="rir-heading">${richSafe(it.heading)}</p>
        ${it.body ? `<p class="rir-body">${richSafe(it.body)}</p>` : ''}
        ${it.author ? `<p class="rir-author">${esc(it.author)}</p>` : ''}
      </div>
      ${media(it.image, 'rir-thumb', esc(it.imageAlt ?? '리뷰 이미지'))}
    </div>`,
      )
      .join('')

    return `
<section class="rir">
  <div class="rir-hd">
    ${d.eyebrow ? `<p class="rir-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="rir-title">${richSafe(d.title)}</h2>
  </div>
  <div class="rir-list">
    ${rows}
  </div>
</section>`
  },
})
