/** POINT 아키타입: point-fullbleed-bookend.
 *  [끝판왕] 포인트 구성 #14 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 번호 pill 뱃지(Point N) → eyebrow(선행 소문장) → 대형 볼드 헤드라인 →
 *  서브바디 → 풀블리드 제품 사진 → 독립 클로징 스테이트먼트.
 *  이미지가 텍스트에 위아래로 감싸이는 북엔드(bookend) 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 포인트 번호 표기 라벨 (예: "Point 1") */
  pointLabel: z.string().min(1),
  /** 헤드라인 위 작은 서술 문장 (em 허용) */
  eyebrow: z.string().min(1).optional(),
  /** 메인 헤드라인 — 대형 볼드 (em, br 허용) */
  headline: z.string().min(1),
  /** 헤드라인 아래 보조 설명 1~2줄 (em, br 허용) */
  body: z.string().min(1).optional(),
  /** 풀블리드 제품 사진 URL */
  image: z.string().optional(),
  /** 이미지 alt 텍스트 */
  imageAlt: z.string().optional(),
  /** 이미지 아래 독립 클로징 스테이트먼트 (em, br 허용) */
  closing: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const pointFullbleedBookend = defineBlock<Data>({
  id: 'point-fullbleed-bookend',
  archetype: 'point',
  styleTags: ['warm', 'editorial', 'narrative', 'template'],
  imageSlots: 1,
  describe:
    '포인트 섹션 북엔드형. pill 뱃지(Point N) → eyebrow 소문장 → 대형 볼드 헤드라인 → 보조 바디 → 풀블리드 제품 사진 → 클로징 스테이트먼트. 이미지가 위아래 텍스트 사이에 끼는 서사형 구조.',
  schema,
  css: `
/* point-fullbleed-bookend — 접두사 pfb- */
.pfb{background:var(--paper);padding:0;word-break:keep-all;overflow-wrap:break-word}
.pfb-top{padding:48px 40px 36px;text-align:center}
.pfb-pill{display:inline-block;border:1.5px solid var(--ink);border-radius:999px;padding:5px 18px;font-family:var(--font-body);font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--ink);margin-bottom:20px}
.pfb-eyebrow{font-family:var(--font-body);font-size:14px;line-height:1.6;color:var(--muted);margin-bottom:12px}
.pfb-eyebrow .em{color:var(--accent-d);font-weight:600}
.pfb-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,7.5vw,44px);line-height:1.25;letter-spacing:-.02em;color:var(--ink);margin-bottom:18px}
.pfb-headline .em{color:var(--accent-d)}
.pfb-body{font-family:var(--font-body);font-size:15px;line-height:1.72;color:var(--muted)}
.pfb-body .em{color:var(--accent-d);font-weight:700}
.pfb-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.pfb-img.ph{width:100%;aspect-ratio:1/1;background:rgba(0,0,0,.04);border:2px dashed var(--line);color:var(--muted);font-size:13px}
.pfb-closing{padding:44px 40px 52px;text-align:center}
.pfb-closing-text{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5.5vw,34px);line-height:1.45;letter-spacing:-.02em;color:var(--ink)}
.pfb-closing-text .em{color:var(--accent-d)}
`,
  render: (d, { esc, richSafe }) => `
<section class="pfb">
  <div class="pfb-top">
    <span class="pfb-pill">${esc(d.pointLabel)}</span>
    ${d.eyebrow ? `<p class="pfb-eyebrow">${richSafe(d.eyebrow)}</p>` : ''}
    <h2 class="pfb-headline">${richSafe(d.headline)}</h2>
    ${d.body ? `<p class="pfb-body">${richSafe(d.body)}</p>` : ''}
  </div>
  ${media(d.image, 'pfb-img', esc(d.imageAlt ?? '제품 이미지'))}
  <div class="pfb-closing">
    <p class="pfb-closing-text">${richSafe(d.closing)}</p>
  </div>
</section>`,
})
