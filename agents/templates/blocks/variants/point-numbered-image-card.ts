/** POINT 아키타입: point-numbered-image-card.
 *  [끝판왕] 포인트 구성 #18 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 카드 + 좌상단 앵커 대형 서수 번호 + 짧은 설명 텍스트 + 하단 풀너비 제품 이미지.
 *  텍스트·이미지 비중복 완전 분리 — 수직 스택 카드 반복(2~5개). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 상단 eyebrow 레이블 (선택) */
  eyebrow: z.string().optional(),
  /** 카드 반복 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 짧은 설명 카피 (em, br 허용) — 번호 아래 1-2줄 */
        caption: z.string().min(1),
        /** 굵은 제품/포인트 이름 (em 허용) */
        label: z.string().min(1),
        /** 풀너비 제품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const pointNumberedImageCard = defineBlock<Data>({
  id: 'point-numbered-image-card',
  archetype: 'point',
  styleTags: ['dark', 'editorial', 'numbered', 'product', 'template'],
  imageSlots: 3,
  describe:
    '포인트 번호 카드(다크). 다크 배경 카드에 좌상단 대형 서수(01/02…) + 짧은 설명 + 굵은 제품명 텍스트 존 위, 하단 풀너비 제품 이미지 존 분리. 텍스트·이미지 비중복 수직 스택(2~5회). 심플 에디토리얼 포인트 섹션.',
  schema,
  css: `
/* point-numbered-image-card — 접두사 pnic- */
.pnic{background:var(--bg);padding:48px 28px 60px;word-break:keep-all;overflow-wrap:break-word}
.pnic-eyebrow{text-align:center;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-d);margin-bottom:32px}
/* 카드 — 다크 표면 */
.pnic-card{background:var(--ink);border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px));overflow:hidden;margin-bottom:18px}
.pnic-card:last-child{margin-bottom:0}
/* 텍스트 존 */
.pnic-txt{padding:28px 28px 22px;position:relative}
/* 대형 서수 앵커 */
.pnic-no{font-family:var(--font-display);font-weight:800;font-size:clamp(68px,15vw,96px);line-height:1;letter-spacing:-.03em;color:#fff;display:block;margin-bottom:10px}
/* 다크 배경 — .em을 var(--accent) override(전역 accent-d 저대비 방지) */
.pnic-no .em{color:var(--accent)}
/* 설명 카피 */
.pnic-caption{font-family:var(--font-body);font-size:clamp(13px,3.4vw,15px);line-height:1.65;color:rgba(255,255,255,.62);margin-bottom:6px}
.pnic-caption .em{color:var(--accent);font-weight:700}
/* 제품/포인트 이름 */
.pnic-label{font-family:var(--font-display);font-weight:800;font-size:clamp(18px,4.6vw,24px);line-height:1.3;letter-spacing:-.01em;color:#fff}
.pnic-label .em{color:var(--accent)}
/* 이미지 존 — 풀너비, 이미지와 텍스트 비중복 */
.pnic-img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
.pnic-img.ph{width:100%;aspect-ratio:3/4;background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.18);color:rgba(255,255,255,.32);font-size:13px;display:flex;align-items:center;justify-content:center}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrowHtml = d.eyebrow
      ? `<p class="pnic-eyebrow">${esc(d.eyebrow)}</p>`
      : ''

    const cards = d.items
      .map(
        (it, i) => `
  <div class="pnic-card">
    <div class="pnic-txt">
      <span class="pnic-no">${pad2(i + 1)}</span>
      <p class="pnic-caption">${richSafe(it.caption)}</p>
      <p class="pnic-label">${richSafe(it.label)}</p>
    </div>
    ${media(it.image, 'pnic-img', esc(it.imageAlt ?? '제품 이미지'))}
  </div>`,
      )
      .join('')

    return `
<section class="pnic">
  ${eyebrowHtml}
  ${cards}
</section>`
  },
})
