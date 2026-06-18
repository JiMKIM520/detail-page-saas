/** GALLERY 아키타입(템플릿 충실 재현): gallery-grid.
 *  와디즈 200섹션 12_갤러리 섹션_04/06 패턴 재구성 (license-safe).
 *  사진 중심 룩북 갤러리: eyebrow + 대형 DETAIL 타이틀 + 풀폭 히어로 이미지 +
 *  섀도우 액자 포트레이트 그리드(1열 or 2열) + 이미지별 인덱스 번호+라벨+캡션.
 *  gallery-options(옵션 pill+라인)와 완전히 다른 "사진 중심" 디자인. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),      // 기본 "PRODUCT DETAIL"
  title: z.string().min(1),                    // 대형 섹션 제목 (예: "DETAIL SHOT")
  subtitle: z.string().min(1).optional(),      // 제목 아래 보조 문구
  hero: z.string().optional(),                 // 풀폭 히어로 이미지 (선택)
  shots: z
    .array(
      z.object({
        image: z.string().optional(),
        label: z.string().min(1),             // 연출컷 라벨 (예: "01 정면 컷")
        desc: z.string().min(1).optional(),   // 짧은 설명
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const galleryGrid = defineBlock<Data>({
  id: 'gallery-grid',
  archetype: 'gallery',
  styleTags: ['premium', 'template', 'editorial', 'photo'],
  imageSlots: 7,
  describe:
    '사진 중심 룩북/갤러리. eyebrow + 대형 DETAIL 타이틀 + 풀폭 히어로 이미지 + 섀도우 액자 포트레이트 쇼트 반복(2~6장). 이미지별 인덱스 번호+라벨+캡션. 연출컷·스타일링샷·디테일컷 쇼케이스에 최적.',
  schema,
  css: `
.gg{background:var(--bg);padding:0 0 64px}
/* ── 헤더 ── */
.gg-hd{padding:52px 56px 0;text-align:center}
.gg-eye{font-family:var(--font-display);font-weight:800;font-size:14px;letter-spacing:.22em;color:var(--accent);text-transform:uppercase;margin-bottom:14px}
.gg-title{font-family:'Cafe24 ClassicType',serif;font-size:88px;line-height:1;color:var(--ink);letter-spacing:-.03em}
.gg-sub{margin-top:14px;font-size:16px;font-weight:500;color:var(--ink-2);letter-spacing:.01em}
/* 헤더 구분선 */
.gg-rule{width:56px;height:3px;border-radius:2px;background:var(--accent);margin:22px auto 0}
/* ── 히어로 밴드 ── */
.gg-hero{width:100%;height:480px;object-fit:cover;display:block;margin-top:44px}
/* ── 그리드 ── */
.gg-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:0}
/* 첫 번째 아이템은 풀폭 단독; 나머지 orphan은 JS 인라인 스타일로 처리 */
.gg-item{position:relative;background:var(--paper)}
.gg-item:first-child{grid-column:1/-1}
.gg-item--full{grid-column:1/-1}
.gg-frame{position:relative;margin:40px 40px 0;background:#fff;box-shadow:0 19px 41px -8px rgba(0,0,0,.10),0 4px 12px -2px rgba(0,0,0,.06)}
.gg-frame--full{margin:40px 56px 0}
.gg-img{width:100%;height:420px;object-fit:cover;display:block}
.gg-img--full{width:100%;height:560px;object-fit:cover;display:block}
/* 인덱스 오버레이 */
.gg-idx{position:absolute;top:-18px;left:28px;font-family:'Cafe24 ClassicType',serif;font-size:68px;line-height:1;color:var(--accent);opacity:.18;pointer-events:none;user-select:none}
.gg-frame--full .gg-idx{font-size:96px;top:-24px}
/* 캡션 영역 */
.gg-cap{padding:16px 40px 0}
.gg-cap--full{padding:16px 56px 0}
.gg-lbl{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--ink);letter-spacing:.04em}
.gg-desc{margin-top:6px;font-size:13px;color:var(--muted);line-height:1.6}
`,
  render: (d, { esc }) => {
    const n = d.shots.length
    return `
<section class="gg">
  <div class="gg-hd">
    <div class="gg-eye">${esc(d.eyebrow ?? 'PRODUCT DETAIL')}</div>
    <h2 class="gg-title">${esc(d.title)}</h2>
    ${d.subtitle ? `<p class="gg-sub">${esc(d.subtitle)}</p>` : ''}
    <div class="gg-rule"></div>
  </div>
  ${d.hero ? media(d.hero, 'gg-hero', '히어로 갤러리') : ''}
  <div class="gg-grid">
    ${d.shots
      .map((s, i) => {
        // full-width: first item, or last item when it would be orphaned (odd index in 2-col grid after first)
        const isFirst = i === 0
        const isOrphan = i === n - 1 && (n - 1) % 2 === 1 // last item in odd position after first
        const full = isFirst || isOrphan
        return `
    <div class="gg-item${full ? ' gg-item--full' : ''}">
      <div class="gg-frame${full ? ' gg-frame--full' : ''}">
        <span class="gg-idx">${pad2(i + 1)}</span>
        ${media(s.image, full ? 'gg-img gg-img--full' : 'gg-img', '연출컷')}
      </div>
      <div class="${full ? 'gg-cap gg-cap--full' : 'gg-cap'}">
        <div class="gg-lbl">${esc(s.label)}</div>
        ${s.desc ? `<p class="gg-desc">${esc(s.desc)}</p>` : ''}
      </div>
    </div>`
      })
      .join('')}
  </div>
</section>`
  },
})
