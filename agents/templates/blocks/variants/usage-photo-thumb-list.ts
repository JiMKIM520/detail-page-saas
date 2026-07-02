/** USAGE 아키타입(템플릿 충실 재현): usage-photo-thumb-list.
 *  와디즈 200섹션 05_사용법 1283:1004 (풀블리드 히어로 사진+CTA 오버랩 + 원형 썸네일 리스트) 패턴 재구성.
 *  상단 절반: 풀폭 배경 사진 위 accent 대제목(HOW TO USE) + 소제목 오버레이.
 *  하단 절반: 흰 배경 + 대형 클로저 헤드라인 + 원형 썸네일·STEP 배지·제목·설명 수직 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  bgImage: z.string().optional(),             // 상단 히어로 배경 사진 (url)
  title: z.string().min(1).optional(),        // 히어로 대제목, 기본 "HOW TO USE" (em,br)
  subtitle: z.string().min(1).optional(),     // 히어로 소제목 한 줄
  closer: z.string().min(1).optional(),       // 스텝 섹션 상단 클로저 헤드라인 (em,br)
  steps: z
    .array(
      z.object({
        image: z.string().optional(),         // 원형 썸네일 (url)
        label: z.string().min(1).optional(),  // 기본 "STEP 0N"
        title: z.string().min(1),             // 스텝 제목 (em,br)
        desc: z.string().min(1).optional(),   // 스텝 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const usagePhotoThumbList = defineBlock<Data>({
  id: 'usage-photo-thumb-list',
  archetype: 'usage',
  styleTags: ['premium', 'photo', 'template', 'howto', 'overlay', 'thumblist'],
  imageSlots: 5,
  describe:
    '사용법(풀블리드 히어로+원형 썸네일 리스트). 상단 풀폭 배경 사진 위 accent 대제목(HOW TO USE)+소제목 오버레이 + 하단 흰 배경 클로저 헤드라인 + 원형 썸네일·STEP 배지·제목·설명 수직 리스트. 상·하단 명확한 레이어 분리.',
  schema,
  css: `
.uptl{background:var(--paper);color:var(--ink)}
/* ── 상단 히어로 영역 ── */
.uptl-hero{position:relative;width:100%;height:420px;overflow:hidden}
.uptl-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.uptl-hero-img.ph{position:absolute;inset:0;border-radius:0}
/* 히어로 오버레이(상단 가독성 스크림) */
.uptl-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(170deg,rgba(0,0,0,.38) 0%,rgba(0,0,0,.10) 60%,rgba(0,0,0,0) 100%);pointer-events:none}
/* 히어로 텍스트 (좌상단 고정) */
.uptl-hero-cap{position:absolute;top:0;left:0;z-index:2;padding:44px 48px 0}
.uptl-hd-title{font-family:var(--font-display);font-weight:800;font-size:74px;color:var(--accent);letter-spacing:-.02em;line-height:0.95;text-shadow:0 2px 18px rgba(0,0,0,.18)}
.uptl-hd-title .em{color:#fff}
.uptl-hd-sub{margin-top:14px;font-size:16px;font-weight:500;color:rgba(255,255,255,.9);line-height:1.6;text-shadow:0 1px 8px rgba(0,0,0,.28)}
/* ── 하단 콘텐츠 영역 ── */
.uptl-body{background:var(--paper);padding:48px 0 56px}
/* 클로저 헤드라인 */
.uptl-closer{padding:0 48px 40px;text-align:center}
.uptl-closer-txt{font-family:var(--font-display);font-weight:800;font-size:34px;color:var(--ink);line-height:1.35}
.uptl-closer-txt .em{color:var(--accent)}
/* 스텝 리스트 */
.uptl-list{display:flex;flex-direction:column}
.uptl-row{display:flex;align-items:center;gap:24px;padding:20px 48px}
.uptl-row+.uptl-row{border-top:1px solid color-mix(in srgb,var(--line) 80%,transparent)}
/* 원형 썸네일 */
.uptl-circle{flex:0 0 88px;width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid color-mix(in srgb,var(--line) 60%,transparent)}
.uptl-circle.ph{border-radius:50%;flex:0 0 88px;width:88px;height:88px}
/* 우측 텍스트 */
.uptl-tx{flex:1;min-width:0}
.uptl-badge{display:block;font-family:var(--font-display);font-weight:800;font-size:14px;letter-spacing:.1em;color:var(--accent);margin-bottom:6px}
.uptl-step-title{font-family:var(--font-display);font-weight:800;font-size:19px;color:var(--ink);line-height:1.35}
.uptl-step-title .em{color:var(--accent)}
.uptl-step-desc{margin-top:5px;font-size:14px;color:var(--ink-2);line-height:1.68}
.uptl-step-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="uptl">
  <div class="uptl-hero">
    ${d.bgImage
      ? media(d.bgImage, 'uptl-hero-img', '히어로 배경 사진')
      : '<div class="uptl-hero-img ph"></div>'}
    <div class="uptl-hero-cap">
      <h2 class="uptl-hd-title">${richSafe(d.title ?? 'HOW TO USE')}</h2>
      ${d.subtitle ? `<p class="uptl-hd-sub">${esc(d.subtitle)}</p>` : ''}
    </div>
  </div>
  <div class="uptl-body">
    ${d.closer ? `
    <div class="uptl-closer">
      <p class="uptl-closer-txt">${richSafe(d.closer)}</p>
    </div>` : ''}
    <div class="uptl-list">
      ${d.steps
        .map(
          (s, i) => `
      <div class="uptl-row">
        ${media(s.image, 'uptl-circle', `STEP ${pad2(i + 1)}`)}
        <div class="uptl-tx">
          <span class="uptl-badge">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</span>
          <div class="uptl-step-title">${richSafe(s.title)}</div>
          ${s.desc ? `<div class="uptl-step-desc">${richSafe(s.desc)}</div>` : ''}
        </div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`,
})
