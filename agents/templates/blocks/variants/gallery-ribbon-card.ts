/** GALLERY 아키타입(템플릿 충실 재현): gallery-ribbon-card.
 *  Figma 12_갤러리 섹션 1284:2767 — 리본탭 카드.
 *  구조: 컬러 배경(전체) + 섹션 헤드(대형 영문 제목 + 부제) + 흰 둥근 카드 3장 세로 스택.
 *  각 카드: 상단 중앙 강조색 리본 배지(번호) + 손글씨 제목 + 풀폭 이미지 + 본문 텍스트.
 *  gallery-options(pill+라인), gallery-numbered-badge(타원배지), gallery-caption-stack 과 다른
 *  "컬러 배경 위 흰 카드 + 상단 리본 배지" 디자인. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  heading: z.string().min(1),            // 섹션 대형 영문 제목 (예: "OPTION")
  subtitle: z.string().min(1).optional(), // 섹션 부제 (예: "내게 맞는 옵션을 선택하세요") (em,br)
  items: z
    .array(
      z.object({
        title: z.string().min(1),   // 카드 손글씨 제목 (em,br)
        image: z.string().optional(), // 카드 풀폭 이미지 (url)
        desc: z.string().min(1).optional(), // 카드 본문 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const galleryRibbonCard = defineBlock<Data>({
  id: 'gallery-ribbon-card',
  archetype: 'gallery',
  styleTags: ['playful', 'light', 'colorblock', 'template'],
  imageSlots: 4,
  describe:
    '리본탭 카드 갤러리. 컬러 배경 + 영문 대형 헤딩 + 부제 + 흰 둥근 카드(상단 리본 번호 배지 · 손글씨 제목 · 풀폭 이미지 · 본문) 2–4장 세로 스택. 귀여운 컬러블록 옵션 쇼케이스.',
  schema,
  css: `
.grc{background:color-mix(in srgb,var(--accent) 22%,#fff);padding:56px 40px 68px;text-align:center}
/* ── 섹션 헤더 ── */
.grc-hd{margin-bottom:40px}
.grc-heading{font-family:var(--font-display);font-weight:900;font-size:80px;letter-spacing:-.02em;line-height:1;color:color-mix(in srgb,var(--accent) 80%,var(--ink))}
.grc-sub{margin-top:10px;font-size:17px;color:color-mix(in srgb,var(--ink) 70%,transparent);line-height:1.5}
.grc-sub .em{color:var(--accent);font-weight:700}
/* ── 카드 ── */
.grc-card{background:#fff;border-radius:calc(var(--r-scale,1)*20px);padding:0 0 36px;margin-bottom:28px;overflow:visible;position:relative;box-shadow:0 2px 16px rgba(0,0,0,.07)}
.grc-card:last-child{margin-bottom:0}
/* ── 리본 배지 ── */
.grc-ribbon-wrap{display:flex;justify-content:center;margin-bottom:0;position:relative;top:-1px}
.grc-ribbon{display:inline-block;position:relative;background:var(--accent);color:#fff;
  font-family:var(--font-display);font-weight:800;font-size:17px;letter-spacing:.08em;
  padding:10px 40px 10px;
  /* 사다리꼴 리본: 양쪽이 살짝 좁아지는 리본 모양 */
  clip-path:polygon(8% 0%,92% 0%,100% 100%,0% 100%);
  min-width:120px;text-align:center;border-radius:0 0 calc(var(--r-scale,1)*4px) calc(var(--r-scale,1)*4px)}
/* ── 카드 내부 ── */
.grc-title{font-family:var(--font-hand);font-size:28px;color:var(--accent);margin:18px 28px 16px;line-height:1.3}
.grc-title .em{color:var(--accent-d)}
.grc-img{width:calc(100% - 40px);margin:0 20px;height:200px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));display:block;background:rgba(0,0,0,.04)}
.grc-desc{margin:20px 24px 0;font-size:15px;color:var(--ink-2);line-height:1.75;text-align:center}
.grc-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="grc">
  <div class="grc-hd">
    <h2 class="grc-heading">${esc(d.heading)}</h2>
    ${d.subtitle ? `<p class="grc-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  ${d.items
    .map(
      (it, i) => `
  <div class="grc-card">
    <div class="grc-ribbon-wrap">
      <span class="grc-ribbon">${pad2(i + 1)}</span>
    </div>
    <div class="grc-title hand">${richSafe(it.title)}</div>
    ${media(it.image, 'grc-img', `옵션 ${pad2(i + 1)} 이미지`)}
    ${it.desc ? `<div class="grc-desc">${richSafe(it.desc)}</div>` : ''}
  </div>`,
    )
    .join('')}
</section>`,
})
