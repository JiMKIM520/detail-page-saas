/** GALLERY 아키타입(템플릿 충실 재현): gallery-numbered-badge.
 *  Figma 12_갤러리 섹션 576:186 — 타원 번호 배지 + 구분선 + 풀폭 이미지.
 *  헤더: 소형 eyebrow + 대형 display 타이틀.
 *  각 항목: 중앙 타원(oval) 테두리 번호 배지(01–04) → 풀폭 둥근 이미지.
 *  항목 사이 수평 헤어라인 구분. 캡션 없음. 우아한 번호 강조.
 *  gallery-options(pill+라인), gallery-grid(액자 그리드)와 다른 "번호 배지 중심" 디자인. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  eyebrow: z.string().min(1).optional(),   // 소형 라벨 (예: "제품 이미지 디테일 컷")
  title: z.string().min(1),               // 대형 display 제목 (예: "DETAIL.") (em,br 가능)
  images: z
    .array(z.string().optional())
    .min(2)
    .max(4),                              // 각 항목 풀폭 이미지 (url)
})
type Data = z.infer<typeof schema>

export const galleryNumberedBadge = defineBlock<Data>({
  id: 'gallery-numbered-badge',
  archetype: 'gallery',
  styleTags: ['premium', 'editorial', 'minimal', 'light', 'template'],
  imageSlots: 4,
  describe:
    '타원 번호 배지 갤러리. eyebrow + 대형 display 타이틀 + (번호 타원 배지 → 풀폭 둥근 이미지) 2–4회 반복, 항목 사이 헤어라인 구분. 캡션 없는 우아한 번호 강조 디테일 컷.',
  schema,
  css: `
.gnb{background:var(--paper);color:var(--ink);padding:56px 0 60px}
/* ── 헤더 ── */
.gnb-hd{text-align:center;padding:0 var(--pad-x,56px);margin-bottom:40px}
.gnb-eye{font-size:14px;font-weight:500;color:var(--ink-2);letter-spacing:.04em;line-height:1}
.gnb-title{margin-top:8px;font-family:var(--font-display);font-weight:800;font-size:72px;letter-spacing:-.02em;line-height:1;color:var(--ink)}
.gnb-title .em{color:var(--accent)}
/* ── 항목 구분선 ── */
.gnb-rule{border:none;border-top:1px solid var(--line);margin:0 56px}
/* ── 항목 ── */
.gnb-item{padding:36px 0 0}
/* ── 번호 배지 ── */
.gnb-badge-wrap{display:flex;justify-content:center;margin-bottom:28px}
.gnb-badge{display:inline-flex;align-items:center;justify-content:center;
  width:68px;height:44px;
  border-radius:999px;
  border:1.5px solid var(--ink);
  font-family:'Cormorant Garamond',var(--font-serif),serif;
  font-weight:500;
  font-size:20px;
  letter-spacing:.06em;
  color:var(--ink);
  background:transparent}
/* ── 풀폭 이미지 ── */
.gnb-img{width:calc(100% - 112px);margin:0 56px;height:280px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));display:block}
/* 항목 하단 여백 */
.gnb-item-inner{padding-bottom:36px}
`,
  render: (d, { esc, richSafe }) => {
    const n = d.images.length
    return `
<section class="gnb">
  <div class="gnb-hd">
    ${d.eyebrow ? `<p class="gnb-eye">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="gnb-title disp">${richSafe(d.title)}</h2>
  </div>
  ${d.images
    .map((url, i) => `
  ${i > 0 ? '<hr class="gnb-rule">' : ''}
  <div class="gnb-item">
    <div class="gnb-item-inner">
      <div class="gnb-badge-wrap"><span class="gnb-badge">${pad2(i + 1)}</span></div>
      ${media(url, 'gnb-img', `상세 이미지 ${pad2(i + 1)}`)}
    </div>
  </div>`)
    .join('')}
</section>`
  },
})
