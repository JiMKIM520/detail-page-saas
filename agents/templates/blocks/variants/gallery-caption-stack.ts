/** GALLERY 아키타입: gallery-caption-stack (단순 스택 갤러리).
 *  Figma 12_갤러리 섹션 576:348 충실 재현.
 *  좌정렬 대형 섹션 제목 + 풀폭 이미지 + 아래 중앙 제목/캡션 블록 3–4회 반복.
 *  pill·커넥터·번호 없음 — 가장 콘텐츠 중심의 갤러리 변형.
 *  gallery-options(pill+line), gallery-grid(액자+인덱스번호)와 구조적으로 다름. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  sectionTitle: z.string().min(1),          // 좌정렬 대형 섹션 제목 (예: "DETAIL")
  sectionSub: z.string().min(1).optional(), // 제목 아래 보조 설명
  items: z
    .array(
      z.object({
        image: z.string().optional(),       // (url) 풀폭 이미지
        title: z.string().min(1),           // 이미지 아래 중앙 제목 (em,br)
        caption: z.string().min(1).optional(), // 제목 아래 보조 캡션 (em,br)
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const galleryCaptionStack = defineBlock<Data>({
  id: 'gallery-caption-stack',
  archetype: 'gallery',
  styleTags: ['minimal', 'editorial', 'light', 'content-first'],
  imageSlots: 4,
  describe:
    '단순 스택 갤러리. 좌정렬 대형 섹션 제목 + 풀폭 이미지 + 중앙 제목/캡션 블록 2–5회 반복. pill·번호·커넥터 없음. 가장 콘텐츠 중심.',
  schema,
  css: `
.gcs{background:var(--bg);padding:54px 0 64px}
/* ── 섹션 헤더 (좌정렬) ── */
.gcs-hd{padding:0 48px 40px}
.gcs-title{font-family:var(--font-display);font-weight:900;font-size:72px;letter-spacing:-.03em;line-height:1;color:var(--ink)}
.gcs-sub{margin-top:10px;font-size:17px;color:var(--ink-2);line-height:1.6}
/* ── 각 갤러리 아이템 ── */
.gcs-item{margin-bottom:52px}
.gcs-item:last-child{margin-bottom:0}
/* 풀폭 이미지 */
.gcs-img{width:100%;height:480px;object-fit:cover;display:block}
/* 이미지 아래 캡션 블록 (중앙 정렬) */
.gcs-body{text-align:center;padding:28px 56px 0}
.gcs-item-title{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);letter-spacing:-.01em;line-height:1.35}
.gcs-item-title .em{color:var(--accent)}
.gcs-caption{margin-top:10px;font-size:15px;color:var(--ink-2);line-height:1.75}
.gcs-caption .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="gcs">
  <div class="gcs-hd">
    <h2 class="gcs-title">${esc(d.sectionTitle)}</h2>
    ${d.sectionSub ? `<p class="gcs-sub">${esc(d.sectionSub)}</p>` : ''}
  </div>
  ${d.items
    .map(
      (it) => `
  <div class="gcs-item">
    ${media(it.image, 'gcs-img', '갤러리 이미지')}
    <div class="gcs-body">
      <div class="gcs-item-title">${richSafe(it.title)}</div>
      ${it.caption ? `<p class="gcs-caption">${richSafe(it.caption)}</p>` : ''}
    </div>
  </div>`,
    )
    .join('')}
</section>`,
})
