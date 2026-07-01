/** POINT 아키타입: point-fullbleed-caption.
 *  [끝판왕] 포인트 구성 #5 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 제품 사진 + 이미지 위 하단앵커 원형 번호배지(01/02…)
 *            + 이미지 하단 밝은 배경 위 accent 대형 헤드라인 + 본문 텍스트블록.
 *  반복 슬롯(items 2~4) — 같은 레이아웃 구조를 수직 스택. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 전체 아이콘 라벨 텍스트 (예: "Point") */
  badgeLabel: z.string().min(1).optional(),
  /** 포인트 반복 슬롯 (2~4개) */
  items: z
    .array(
      z.object({
        /** 풀블리드 제품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 배지 번호(자동 생성하지 않고 명시. 예: "01") — 빈 값이면 순번 자동 */
        badgeNo: z.string().optional(),
        /** accent 강조 대형 헤드라인 (em, br 허용) */
        headline: z.string().min(1),
        /** 보조 본문 (em, br 허용, 선택) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const pointFullbleedCaption = defineBlock<Data>({
  id: 'point-fullbleed-caption',
  archetype: 'point',
  styleTags: ['fullbleed', 'badge', 'caption', 'light', 'template'],
  imageSlots: 3,
  describe:
    '포인트 풀블리드 캡션. 풀폭 제품 사진 위 하단-좌 앵커 원형 번호배지(01/02…) + 이미지 하단 밝은 배경 위 accent 대형 헤드라인 + 보조 본문. 동일 구조 2~4회 수직 반복.',
  schema,
  css: `
/* point-fullbleed-caption — 접두사 pfc- */
.pfc{background:var(--paper);word-break:keep-all}
/* ── 반복 아이템 ── */
.pfc-item{position:relative}
.pfc-item+.pfc-item{margin-top:4px}
/* ── 풀블리드 이미지 ── */
.pfc-img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.pfc-img.ph{width:100%;aspect-ratio:3/4;background:rgba(0,0,0,.045);border:2px dashed var(--line);color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:13px}
/* ── 원형 번호 배지 — 이미지 하단 좌측 앵커 ── */
.pfc-badge{position:absolute;left:20px;bottom:0;transform:translateY(50%);width:60px;height:60px;border-radius:50%;border:2px solid var(--accent);background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;box-shadow:0 2px 8px rgba(0,0,0,.10)}
.pfc-badge-no{font-family:var(--font-display);font-weight:800;font-size:18px;line-height:1;color:var(--accent);letter-spacing:-.01em}
.pfc-badge-lbl{font-family:var(--font-body);font-size:9px;font-weight:600;color:var(--accent);letter-spacing:.06em;text-transform:uppercase;margin-top:1px}
/* ── 캡션 블록 (이미지 하단, 밝은 배경) ── */
.pfc-caption{background:var(--paper);padding:44px 28px 36px}
.pfc-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,6.5vw,36px);line-height:1.28;letter-spacing:-.02em;color:var(--ink)}
/* 밝은 배경 — .em은 accent-d(저대비 방지) */
.pfc-headline .em{color:var(--accent-d)}
.pfc-body{margin-top:14px;font-family:var(--font-body);font-size:15px;line-height:1.72;color:var(--muted)}
.pfc-body .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const badgeLabel = esc(d.badgeLabel ?? 'Point')
    const items = d.items
      .map(
        (it, i) => `
<div class="pfc-item">
  ${media(it.image, 'pfc-img', esc(it.imageAlt ?? '제품 이미지'))}
  <div class="pfc-badge" aria-hidden="true">
    <span class="pfc-badge-no">${esc(it.badgeNo ?? pad2(i + 1))}</span>
    <span class="pfc-badge-lbl">${badgeLabel}</span>
  </div>
  <div class="pfc-caption">
    <h3 class="pfc-headline">${richSafe(it.headline)}</h3>
    ${it.body ? `<p class="pfc-body">${richSafe(it.body)}</p>` : ''}
  </div>
</div>`,
      )
      .join('')

    return `
<section class="pfc">
  ${items}
</section>`
  },
})
