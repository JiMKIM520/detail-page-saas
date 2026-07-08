/** GALLERY 아키타입: gallery-barframe-card (상+하 컬러바 프레임 옵션 카드).
 *  Figma 12_갤러리 섹션 1284:2736 충실 재현.
 *  구조: 섹션 제목 + 3개 카드 세로 스택.
 *  각 카드: 상단 accent 바(라벨) → 풀폭 이미지 → 하단 accent 바(캡션).
 *  카드는 교대 배경(bg/paper)으로 구분감 부여.
 *  gallery-color-panel(교대 풀블리드 패널), gallery-caption-stack(이미지+캡션 하단),
 *  gallery-ribbon-card(리본+흰카드)와 구조적으로 다름. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subtitle: z.string().min(1).optional(),   // 섹션 상단 소형 부제 (예: "내게 맞는 옵션을 선택하세요")
  heading: z.string().min(1),               // 섹션 대형 영문 제목 (예: "OPTION") (em,br)
  cards: z
    .array(
      z.object({
        label: z.string().min(1),           // 상단 accent 바 라벨 (예: "제품 옵션 소개") (em,br)
        image: z.string().optional(),       // 풀폭 이미지 (url)
        imageAlt: z.string().min(1).optional(), // 이미지 대체 텍스트
        caption: z.string().min(1),         // 하단 accent 바 캡션 — 설명 문구 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const galleryBarframeCard = defineBlock<Data>({
  id: 'gallery-barframe-card',
  archetype: 'gallery',
  styleTags: ['colorblock', 'template', 'bold', 'centered', 'barframe'],
  imageSlots: 3,
  describe:
    '상+하 컬러바 프레임 옵션 카드 갤러리. 섹션 제목 아래 2–4개 카드 세로 스택. 각 카드: 상단 accent 바(라벨) + 풀폭 이미지 + 하단 accent 바(캡션). 교대 배경으로 카드 구분. 옵션 비교·쇼케이스용.',
  schema,
  css: `
.gbfc{background:var(--bg);padding:54px 0 0}
/* ── 섹션 헤더 ── */
.gbfc-hd{text-align:center;padding:0 44px 44px}
.gbfc-sub{font-size:16px;color:var(--ink-2);margin-bottom:10px;line-height:1.5}
.gbfc-heading{font-family:var(--font-display);font-weight:900;font-size:68px;letter-spacing:-.02em;line-height:1;color:var(--ink)}
.gbfc-heading .em{color:var(--accent)}
/* ── 카드 래퍼 ── */
.gbfc-card{padding:0 36px 48px}
.gbfc-card:nth-child(even){background:var(--paper);padding-top:32px}
.gbfc-card:nth-child(odd):not(:first-child){padding-top:0}
/* ── 상단 바 (라벨) ── */
.gbfc-top-bar{background:var(--accent);color:#fff;text-align:center;padding:14px 24px;border-radius:calc(var(--r-scale,1)*6px) calc(var(--r-scale,1)*6px) 0 0}
.gbfc-label{font-family:var(--font-display);font-weight:800;font-size:20px;letter-spacing:-.01em;line-height:1.25}
.gbfc-label .em{color:color-mix(in srgb,#fff 70%,var(--accent))}
/* ── 풀폭 이미지 ── */
.gbfc-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
/* ── 하단 바 (캡션) ── */
.gbfc-bot-bar{background:color-mix(in srgb,var(--accent) 78%,#000);color:#fff;text-align:center;padding:18px 28px;border-radius:0 0 calc(var(--r-scale,1)*6px) calc(var(--r-scale,1)*6px)}
.gbfc-caption{font-size:15px;line-height:1.65;font-weight:500}
.gbfc-caption .em{font-weight:800;color:color-mix(in srgb,#fff 75%,var(--accent))}
`,
  render: (d, { esc, richSafe }) => `
<section class="gbfc">
  <div class="gbfc-hd">
    ${d.subtitle ? `<p class="gbfc-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="gbfc-heading">${richSafe(d.heading)}</h2>
  </div>
  ${d.cards
    .map(
      (c, i) => `
  <div class="gbfc-card">
    <div class="gbfc-top-bar">
      <div class="gbfc-label">${richSafe(c.label)}</div>
    </div>
    ${media(c.image, 'gbfc-img', c.imageAlt ?? `옵션 ${i + 1} 이미지`)}
    <div class="gbfc-bot-bar">
      <p class="gbfc-caption">${richSafe(c.caption)}</p>
    </div>
  </div>`,
    )
    .join('')}
</section>`,
})
