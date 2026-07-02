/** STORY 아키타입: story-labeled-image-stack.
 *  [끝판왕] 내용전개 #5 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트(--paper/--bg) 배경 + 센터 헤더(eyebrow → 브랜드명 대형 → 수직 디바이더 → 설명쌍 → 메인 헤드라인)
 *  → [좌측 상단 앵커 accent 칩 태그 + 풀폭 이미지] 수직 반복.
 *  밝은 배경 블록: ink/muted 텍스트, 강조 .em 은 전역 accent-d 그대로. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 소형 eyebrow 설명 (선택) */
  eyebrow: z.string().optional(),
  /** 대형 브랜드명 헤드라인 (em, br 허용) */
  brandName: z.string().min(1),
  /** 브랜드명 아래 설명 첫째 줄 (선택) */
  descA: z.string().optional(),
  /** 브랜드명 아래 설명 둘째 줄 (선택) */
  descB: z.string().optional(),
  /** 메인 헤드라인 (em, br 허용) */
  headline: z.string().min(1),
  /** 메인 헤드라인 아래 보조 텍스트 첫째 줄 (선택) */
  subA: z.string().optional(),
  /** 메인 헤드라인 아래 보조 텍스트 둘째 줄 (선택) */
  subB: z.string().optional(),
  /** 칩 태그 + 풀폭 이미지 반복 유닛 (2~4개) */
  items: z
    .array(
      z.object({
        /** 좌측 상단 앵커 accent 칩 라벨 (짧게 — 예: "부연 설명 텍스트") */
        chip: z.string().min(1),
        /** 풀폭 이미지 URL (선택) */
        image: z.string().optional(),
        /** 이미지 alt 텍스트 */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const storyLabeledImageStack = defineBlock<Data>({
  id: 'story-labeled-image-stack',
  archetype: 'story',
  styleTags: ['light', 'narrative', 'scroll', 'branded', 'template'],
  imageSlots: 3,
  describe:
    '내용전개(라이트 배경 스크롤 서사). 센터 헤더(eyebrow+브랜드명 대형+수직 디바이더+설명쌍+메인 헤드라인) → [좌측 앵커 accent 칩 태그 + 풀폭 이미지] 수직 반복(2~4회). 라이트 배경, 밝은 레이아웃.',
  schema,
  css: `
/* story-labeled-image-stack — 접두사 slis- */
.slis{background:var(--paper);color:var(--ink);padding:64px 0 72px}

/* ── 센터 헤더 영역 ── */
.slis-hd{text-align:center;padding:0 40px}

/* eyebrow */
.slis-eyebrow{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:400;
  color:var(--muted);
  letter-spacing:.04em;
  margin-bottom:10px;
}

/* 대형 브랜드명 */
.slis-brand{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,7vw,52px);
  line-height:1.18;
  letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:28px;
}
.slis-brand .em{color:var(--accent-d)}

/* 수직 디바이더 라인 */
.slis-divider{
  width:1px;
  height:48px;
  background:var(--line);
  margin:0 auto 24px;
}

/* 설명쌍 */
.slis-desc{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.8;
  color:var(--muted);
  margin-bottom:32px;
}
.slis-desc .em{color:var(--accent-d);font-weight:700}

/* 메인 헤드라인 */
.slis-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,5.5vw,40px);
  line-height:1.28;
  letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:10px;
}
.slis-headline .em{color:var(--accent-d)}

/* 메인 헤드라인 아래 보조 텍스트 */
.slis-sub{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.8;
  color:var(--muted);
}
.slis-sub .em{color:var(--accent-d);font-weight:700}

/* ── 반복 아이템 영역 ── */
.slis-stack{margin-top:48px}
.slis-item{position:relative;margin-top:32px}
.slis-item:first-child{margin-top:0}

/* 좌측 상단 앵커 accent 칩 태그 */
.slis-chip{
  display:inline-block;
  margin:0 0 8px 24px;
  padding:6px 16px;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-body);
  font-size:13px;
  font-weight:700;
  letter-spacing:.01em;
  border-radius:4px;
}

/* 풀폭 이미지 */
.slis-img{
  width:100%;
  aspect-ratio:4/3;
  object-fit:cover;
  display:block;
}
.slis-img.ph{
  width:100%;
  aspect-ratio:4/3;
  border:2px dashed var(--line);
  background:var(--bg);
  color:var(--muted);
}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrowHtml = d.eyebrow
      ? `<p class="slis-eyebrow">${esc(d.eyebrow)}</p>`
      : ''

    const descHtml =
      d.descA || d.descB
        ? `<p class="slis-desc">${[d.descA, d.descB]
            .filter(Boolean)
            .map((t) => richSafe(t))
            .join('<br>')}</p>`
        : ''

    const subHtml =
      d.subA || d.subB
        ? `<p class="slis-sub">${[d.subA, d.subB]
            .filter(Boolean)
            .map((t) => richSafe(t))
            .join('<br>')}</p>`
        : ''

    const itemsHtml = d.items
      .map(
        (it) => `
    <div class="slis-item">
      <span class="slis-chip">${esc(it.chip)}</span>
      ${media(it.image, 'slis-img', esc(it.imageAlt ?? '이미지'))}
    </div>`,
      )
      .join('')

    return `
<section class="slis">
  <div class="slis-hd">
    ${eyebrowHtml}
    <h2 class="slis-brand">${richSafe(d.brandName)}</h2>
    <div class="slis-divider" aria-hidden="true"></div>
    ${descHtml}
    <h3 class="slis-headline">${richSafe(d.headline)}</h3>
    ${subHtml}
  </div>
  <div class="slis-stack">
    ${itemsHtml}
  </div>
</section>`
  },
})
