/** USAGE 아키타입(템플릿 충실 재현): usage-photo-card.
 *  와디즈 200섹션 05_사용법 208:1223 (전체 배경 사진 + 상단 강조 헤더 + 단계들을 반투명 흰 카드 패널에) 패턴 재구성.
 *  풀배경 사진 위 오버레이 + 상단 강조색 대제목(HOW TO USE) + 부제목 + 프로스티드 배너 문구 +
 *  반투명 흰 카드 패널 내 스텝 행(원형 이미지 좌, STEP 배지+제목+설명 우) 반복. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  bgImage: z.string().optional(),              // 전체 배경 사진 (url)
  title: z.string().min(1).optional(),         // 대제목, 기본 "HOW TO USE" (em,br)
  subtitle: z.string().min(1).optional(),      // 대제목 아래 한 줄 부제목
  bannerText: z.string().min(1).optional(),    // 프로스티드 배너 강조 문구 (em,br)
  steps: z
    .array(
      z.object({
        image: z.string().optional(),          // 원형 단계 이미지 (url)
        label: z.string().min(1).optional(),   // 기본 "STEP 0N"
        title: z.string().min(1),              // 단계 제목 (em,br)
        desc: z.string().min(1).optional(),    // 단계 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const usagePhotoCard = defineBlock<Data>({
  id: 'usage-photo-card',
  archetype: 'usage',
  styleTags: ['premium', 'photo', 'frosted', 'template', 'howto', 'overlay'],
  imageSlots: 5,
  describe:
    '사용법(배경 사진+프로스티드 카드). 전체 배경 사진 + accent 대제목(HOW TO USE)+부제목 상단 영역 + 반투명 배너 강조 문구 + 반투명 흰 카드 패널(원형 이미지 좌·STEP 배지+제목+설명 우) 세로 나열. 배경 이미지 위 유리감 카드 연출.',
  schema,
  css: `
.upc{position:relative;color:var(--ink);overflow:hidden}
/* 배경 이미지 */
.upc-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:0}
.upc-bg-ph{position:absolute;inset:0;z-index:0;background:color-mix(in srgb,var(--accent) 18%,#ddd)}
/* 배경 위 어두운 스크림(가독성) */
.upc::before{content:"";position:absolute;inset:0;background:rgba(255,255,255,.22);z-index:1}
/* 모든 콘텐츠는 z-index:2 이상 */
.upc-inner{position:relative;z-index:2;padding:54px 0 58px}
/* 상단 헤더 */
.upc-hd{padding:0 52px 0;text-align:center}
.upc-title{font-family:var(--font-display);font-weight:800;font-size:64px;letter-spacing:-.01em;line-height:1.0;color:var(--accent);text-shadow:0 2px 16px rgba(0,0,0,.12)}
.upc-title .em{color:var(--accent-d)}
.upc-sub{margin-top:10px;font-size:17px;color:var(--ink);opacity:.8;font-weight:500}
/* 프로스티드 배너 */
.upc-banner{margin:28px 0 0;padding:22px 52px;background:rgba(255,255,255,.52);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,.75);border-bottom:1px solid rgba(255,255,255,.75);text-align:center}
.upc-banner-txt{font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.4}
.upc-banner-txt .em{color:var(--accent)}
/* 카드 패널 영역 */
.upc-panel{margin:28px 24px 0;background:rgba(255,255,255,.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(255,255,255,.85);overflow:hidden}
/* 스텝 행 */
.upc-row{display:flex;align-items:center;gap:20px;padding:22px 28px}
.upc-row+.upc-row{border-top:1px solid rgba(0,0,0,.07)}
/* 원형 이미지 */
.upc-circle{flex:0 0 90px;width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.10)}
.upc-circle.ph{border-radius:50%}
/* 우측 텍스트 */
.upc-tx{flex:1;min-width:0}
.upc-badge{display:inline-block;font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.08em;color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent);border:1.5px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:999px;padding:3px 14px;margin-bottom:8px}
.upc-step-title{font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--ink);line-height:1.4}
.upc-step-title .em{color:var(--accent)}
.upc-step-desc{margin-top:5px;font-size:14px;color:var(--ink);opacity:.7;line-height:1.65}
.upc-step-desc .em{color:var(--accent);font-weight:700;opacity:1}
`,
  render: (d, { esc, richSafe }) => `
<section class="upc">
  ${d.bgImage
    ? media(d.bgImage, 'upc-bg', '배경 사진')
    : '<div class="upc-bg-ph"></div>'}
  <div class="upc-inner">
    <div class="upc-hd">
      <h2 class="upc-title">${richSafe(d.title ?? 'HOW TO USE')}</h2>
      ${d.subtitle ? `<p class="upc-sub">${esc(d.subtitle)}</p>` : ''}
    </div>
    ${d.bannerText ? `
    <div class="upc-banner">
      <p class="upc-banner-txt">${richSafe(d.bannerText)}</p>
    </div>` : ''}
    <div class="upc-panel">
      ${d.steps
        .map(
          (s, i) => `
      <div class="upc-row">
        ${media(s.image, 'upc-circle', `STEP ${pad2(i + 1)}`)}
        <div class="upc-tx">
          <span class="upc-badge">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</span>
          <div class="upc-step-title">${richSafe(s.title)}</div>
          ${s.desc ? `<div class="upc-step-desc">${richSafe(s.desc)}</div>` : ''}
        </div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`,
})
