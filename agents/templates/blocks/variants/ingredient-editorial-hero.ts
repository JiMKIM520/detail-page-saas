/** INGREDIENT 아키타입 변형: ingredient-editorial-hero (04_원료소개 에디토리얼 히어로).
 *  풀블리드 텍스트 히어로 오버레이 (체크무늬/사진 위 대형 중앙 헤드라인) +
 *  eyebrow + 대형 제목 + 원형 이미지·라벨·설명 2열 스플릿 행 리스트 +
 *  다크 풀블리드 클로저 배너.
 *  피그마 노드 1282:227 충실 재현. 토큰 기반 (하드코딩 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 히어로 배경 이미지 (풀블리드, 선택). 없으면 체커 패턴 표시 */
  heroImage: z.string().optional(),
  /** 히어로 오버레이 중앙 헤드라인 (em, br 지원). 예: "우리의 제품은<br><span class=\"em\">이런 원료</span>를 사용합니다" */
  heroTitle: z.string().min(1),
  /** 영문 아이브로. 예: "INGREDIENTS" */
  eyebrow: z.string().min(1).optional(),
  /** 원료 섹션 대제목 (em, br). 예: "제품 원료" */
  title: z.string().min(1),
  /** 원료 항목 (2~4개) */
  items: z
    .array(
      z.object({
        /** 원형 썸네일 이미지 */
        image: z.string().optional(),
        /** 원료 이름 (라벨 좌측). 예: "제품원료01" */
        label: z.string().min(1),
        /** 원료 설명 (우측, em·br). 2줄 내외 */
        desc: z.string().min(1).optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 클로저 배너 텍스트 (em, br). 예: "이런 좋은 원료를 통해,<br>좋은 제품을 제공합니다." */
  closer: z.string().min(1).optional(),
})
type Data = z.infer<typeof schema>

export const ingredientEditorialHero = defineBlock<Data>({
  id: 'ingredient-editorial-hero',
  archetype: 'ingredient' as any,
  styleTags: ['editorial', 'premium', 'light', 'template', 'hero-overlay'],
  imageSlots: 5,
  describe:
    '원료 소개(에디토리얼 히어로). 풀블리드 히어로(사진/패턴 위 대형 중앙 헤드라인) + 아이브로·대형 컬러 제목 + 원형이미지·라벨·설명 2열 스플릿 행 리스트 + 다크 클로저 배너. 밝고 에디토리얼.',
  schema,
  css: `
.ieh{background:var(--paper);color:var(--ink)}

/* ── 히어로 오버레이 밴드 ── */
.ieh-hero{position:relative;width:100%;height:340px;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center}
.ieh-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.ieh-hero-pattern{position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,color-mix(in srgb,var(--accent) 8%,transparent) 0px,color-mix(in srgb,var(--accent) 8%,transparent) 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,color-mix(in srgb,var(--accent) 8%,transparent) 0px,color-mix(in srgb,var(--accent) 8%,transparent) 1px,transparent 1px,transparent 32px);background-color:color-mix(in srgb,var(--accent) 5%,var(--paper))}
.ieh-hero-overlay{position:absolute;inset:0;background:rgba(255,255,255,.28)}
.ieh-hero-text{position:relative;z-index:2;padding:0 60px}
.ieh-hero-title{font-family:var(--font-display);font-weight:800;font-size:42px;letter-spacing:-.02em;line-height:1.3;color:var(--ink)}
.ieh-hero-title .em{color:var(--accent)}

/* ── 원료 리스트 섹션 ── */
.ieh-body{padding:48px 48px 52px}
.ieh-hd{text-align:center;margin-bottom:36px}
.ieh-eye{font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.22em;color:var(--accent);opacity:.75;line-height:1}
.ieh-section-title{margin-top:8px;font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;color:var(--accent);line-height:1.1}
.ieh-section-title .em{color:var(--ink)}

/* ── 스플릿 행 (원형 이미지 + 라벨 좌 + 설명 우) ── */
.ieh-row{display:grid;grid-template-columns:88px 1fr 1fr;align-items:center;gap:20px;padding:22px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.ieh-row:first-child{border-top:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.ieh-thumb{width:88px;height:88px;border-radius:50%;object-fit:cover;flex-shrink:0}
.ieh-label{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--ink);line-height:1.3}
.ieh-label .em{color:var(--accent)}
.ieh-desc{font-size:14px;color:var(--ink-2);line-height:1.7}
.ieh-desc .em{color:var(--accent);font-weight:700}

/* ── 클로저 배너 ── */
.ieh-closer{background:var(--brand);color:#fff;padding:44px 48px;text-align:center}
.ieh-closer-text{font-family:var(--font-display);font-weight:800;font-size:34px;line-height:1.45;color:#fff}
.ieh-closer-text .em{color:color-mix(in srgb,var(--accent) 70%,#fff)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ieh">

  <div class="ieh-hero">
    ${d.heroImage
      ? media(d.heroImage, 'ieh-hero-bg', '히어로 배경')
      : '<div class="ieh-hero-pattern"></div>'}
    <div class="ieh-hero-overlay"></div>
    <div class="ieh-hero-text">
      <h2 class="ieh-hero-title">${richSafe(d.heroTitle)}</h2>
    </div>
  </div>

  <div class="ieh-body">
    <div class="ieh-hd">
      ${d.eyebrow ? `<p class="ieh-eye">${esc(d.eyebrow)}</p>` : ''}
      <p class="ieh-section-title">${richSafe(d.title)}</p>
    </div>
    <div class="ieh-list">
      ${d.items
        .map(
          (it) => `
      <div class="ieh-row">
        ${media(it.image, 'ieh-thumb', esc(it.label))}
        <div class="ieh-label">${richSafe(it.label)}</div>
        ${it.desc ? `<div class="ieh-desc">${richSafe(it.desc)}</div>` : '<div class="ieh-desc"></div>'}
      </div>`,
        )
        .join('')}
    </div>
  </div>

  ${d.closer
    ? `<div class="ieh-closer"><p class="ieh-closer-text">${richSafe(d.closer)}</p></div>`
    : ''}

</section>`,
})
