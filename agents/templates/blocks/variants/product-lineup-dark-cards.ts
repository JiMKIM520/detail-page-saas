/** LINEUP 아키타입: product-lineup-dark-cards.
 *  [끝판왕] 상품 구성 #18 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + 대형 헤드라인 + pill 서브배지 + 2열 카드(해시태그 상단 라벨 + numbered-divider-line(── N ──) + 이미지 + 제품명/설명 + 인셋 다크 푸터 밴드) + 하단 본문. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 대형 헤드라인 (em 허용) */
  title: z.string().min(1),
  /** 헤드라인 바로 아래 pill 배지 서브카피 (선택) */
  badge: z.string().optional(),
  /** 상품 카드 목록 (2~4개; 2개씩 2열로 배치) */
  items: z
    .array(
      z.object({
        /** 카드 상단 해시태그 라벨 (예: "#해시태그 #해시태그") */
        hashtags: z.string().min(1),
        /** 카드 번호 표시 (예: "01", "02") — 미입력 시 자동 넘버링 */
        number: z.string().optional(),
        /** 제품 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 제품명 (em 허용) */
        name: z.string().min(1),
        /** 짧은 상세 설명 */
        desc: z.string().optional(),
        /** 카드 하단 인셋 다크 푸터 밴드 텍스트 (em 허용) */
        footer: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
  /** 카드 그리드 아래 본문 단락 (br/em 허용, 선택) */
  body: z.string().optional(),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const productLineupDarkCards = defineBlock<Data>({
  id: 'product-lineup-dark-cards',
  archetype: 'lineup',
  styleTags: ['dark', 'lineup', 'cards', 'numbered', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성(라인업). 다크 배경 + 대형 헤드라인 + pill 서브배지 + 2열 카드(해시태그 상단 라벨 + ── N ── 구분선 + 제품 이미지 + 제품명/설명 + 인셋 다크 푸터 밴드) + 하단 본문.',
  schema,
  css: `
/* product-lineup-dark-cards — 접두사 pldc- */
.pldc{background:var(--ink);padding:56px 32px 64px;text-align:center;word-break:keep-all}
.pldc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,8vw,58px);line-height:1.14;letter-spacing:-.025em;color:#fff;margin-bottom:18px}
.pldc-title .em{color:var(--accent)}
.pldc-badge{display:inline-block;border:1.5px solid rgba(255,255,255,.55);border-radius:999px;padding:8px 22px;font-size:15px;font-weight:500;color:rgba(255,255,255,.85);letter-spacing:.01em;margin-bottom:36px}
.pldc-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pldc-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);overflow:hidden;display:flex;flex-direction:column;text-align:left}
.pldc-card-top{padding:14px 16px 0}
.pldc-hashtags{font-size:12px;font-weight:500;color:var(--muted);letter-spacing:.01em;margin-bottom:10px}
.pldc-divider{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.pldc-divider-line{flex:1;height:1px;background:var(--line)}
.pldc-divider-num{font-size:12px;font-weight:700;color:var(--ink);letter-spacing:.06em;flex-shrink:0}
.pldc-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));margin-bottom:14px}
.pldc-name{font-family:var(--font-display);font-weight:800;font-size:17px;line-height:1.3;color:var(--ink);padding:0 16px 4px}
.pldc-name .em{color:var(--accent-d)}
.pldc-desc{font-size:13px;line-height:1.55;color:var(--muted);padding:0 16px 14px}
.pldc-card-footer{background:rgba(0,0,0,.72);padding:12px 16px;margin-top:auto;font-family:var(--font-display);font-weight:700;font-size:14px;line-height:1.4;color:#fff;text-align:center}
.pldc-card-footer .em{color:var(--accent)}
.pldc-body{margin-top:36px;font-size:15px;line-height:1.75;color:rgba(255,255,255,.72);text-align:center}
.pldc-body .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.items
      .map(
        (it, i) => `
    <div class="pldc-card">
      <div class="pldc-card-top">
        <div class="pldc-hashtags">${esc(it.hashtags)}</div>
        <div class="pldc-divider">
          <div class="pldc-divider-line"></div>
          <span class="pldc-divider-num">${esc(it.number ?? pad2(i + 1))}</span>
          <div class="pldc-divider-line"></div>
        </div>
        ${media(it.image, 'pldc-img', esc(it.imageAlt ?? it.name))}
      </div>
      <div class="pldc-name">${richSafe(it.name)}</div>
      ${it.desc ? `<div class="pldc-desc">${esc(it.desc)}</div>` : ''}
      <div class="pldc-card-footer">${richSafe(it.footer)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="pldc">
  <h2 class="pldc-title">${richSafe(d.title)}</h2>
  ${d.badge ? `<div class="pldc-badge">${esc(d.badge)}</div>` : ''}
  <div class="pldc-grid">
    ${cards}
  </div>
  ${d.body ? `<p class="pldc-body">${richSafe(d.body)}</p>` : ''}
</section>`
  },
})
