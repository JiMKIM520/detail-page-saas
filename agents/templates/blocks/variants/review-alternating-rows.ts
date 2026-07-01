/** REVIEW 아키타입(템플릿 충실 재현): review-alternating-rows.
 *  와디즈 200섹션 06_고객리뷰 568:2657 — 아치형 제품 이미지 + 피처드 리뷰 + accent/light 교차 전체폭 행.
 *  아바타 없음. 컬러 교차 리듬으로 사회적 증거를 임팩트 있게 전달. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const star5 = (icon: (n: string) => string): string =>
  Array.from({ length: 5 }, () => icon('star')).join('')

const schema = z.object({
  title: z.string().min(1),            // 대제목, em/br 허용
  subtitle: z.string().min(1).optional(),
  productImage: z.string().optional(), // 아치형 클립 제품 이미지 (url)
  featured: z.object({
    label: z.string().min(1).optional(), // 예 "Customer Review"
    body: z.string().min(1),             // 리뷰 본문 em/br
    highlight: z.string().min(1).optional(), // 두꺼운 강조 문장 em/br
  }),
  rows: z
    .array(
      z.object({
        body: z.string().min(1),         // 리뷰 본문 em/br
        highlight: z.string().min(1).optional(), // 두꺼운 강조 문장 em/br
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const reviewAlternatingRows = defineBlock<Data>({
  id: 'review-alternating-rows',
  archetype: 'review',
  styleTags: ['premium', 'trust', 'template', 'colorblock', 'centered'],
  imageSlots: 1,
  describe:
    '고객 리뷰(아치 이미지+교차 행). 대제목+아치형 제품 이미지+수직 구분선+피처드 리뷰(영문 레이블+별점) + accent/light 배경이 교차하는 전체폭 별점 리뷰 행(아바타 없음). 강한 사회적 증거.',
  schema,
  css: `
.rar{background:var(--bg);color:var(--ink);text-align:center}

/* 헤더 영역 */
.rar-hd{padding:56px 56px 0}
.rar-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:var(--accent)}
.rar-sub{margin-top:12px;font-size:17px;color:var(--ink-2)}
.rar .em{color:var(--accent);font-weight:800}

/* 아치형 이미지 */
.rar-arch-wrap{margin:36px auto 0;width:330px;height:330px;overflow:hidden;border-radius:165px 165px 0 0}
.rar-arch-img{width:100%;height:100%;object-fit:cover;display:block}

/* 수직 구분선 */
.rar-divider{width:1px;height:56px;background:var(--line);margin:0 auto}

/* 피처드 리뷰 */
.rar-feat{padding:28px 56px 40px}
.rar-feat-label{font-size:15px;font-weight:700;letter-spacing:.08em;color:var(--accent);margin-bottom:12px}
.rar-feat-stars{display:inline-flex;gap:5px;color:var(--accent);margin-bottom:16px}
.rar-feat-stars svg{width:22px;height:22px}
.rar-feat-body{font-size:17px;color:var(--ink-2);line-height:1.7}
.rar-feat-hi{margin-top:4px;font-size:17px;font-weight:800;color:var(--ink);line-height:1.7}

/* 교차 행 */
.rar-row{width:100%;padding:36px 56px}
.rar-row:nth-child(odd){background:color-mix(in srgb,var(--accent) 18%,transparent)}
.rar-row:nth-child(even){background:var(--bg)}
.rar-row-stars{display:inline-flex;gap:5px;color:var(--accent);margin-bottom:14px}
.rar-row-stars svg{width:22px;height:22px}
.rar-row-body{font-size:17px;color:var(--ink-2);line-height:1.7}
.rar-row-hi{margin-top:4px;font-size:17px;font-weight:800;color:var(--ink);line-height:1.7}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rar">
  <div class="rar-hd">
    <h2 class="disp rar-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="rar-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="rar-arch-wrap">
    ${media(d.productImage, 'rar-arch-img', '제품 이미지')}
  </div>
  <div class="rar-divider"></div>
  <div class="rar-feat">
    ${d.featured.label ? `<p class="rar-feat-label">${esc(d.featured.label)}</p>` : ''}
    <div class="rar-feat-stars">${star5(icon)}</div>
    <p class="rar-feat-body">${richSafe(d.featured.body)}</p>
    ${d.featured.highlight ? `<p class="rar-feat-hi">${richSafe(d.featured.highlight)}</p>` : ''}
  </div>
  ${d.rows
    .map(
      (r) => `
  <div class="rar-row">
    <div class="rar-row-stars">${star5(icon)}</div>
    <p class="rar-row-body">${richSafe(r.body)}</p>
    ${r.highlight ? `<p class="rar-row-hi">${richSafe(r.highlight)}</p>` : ''}
  </div>`,
    )
    .join('')}
</section>`,
})
