/** STORY 아키타입(템플릿 충실 재현): story-text-first.
 *  와디즈 200섹션 09_브랜드스토리_571:701 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 상단 작은 EN 라벨(accent) + 풀폭 수평선(HR) →
 *  좌정렬 대형 혼합 굵기 KR 제목 → 짧은 수직 강조선(left-border 구분) →
 *  1~2개 본문 문단. 이미지는 먼 배경(선택)에만. 텍스트 우선 에디토리얼 브랜드 스토리. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 영문 섹션 라벨 (예: "OUR BRAND STORY") */
  label: z.string().min(1).optional(),
  /** 제목 첫 줄 — 가는 굵기 (예: "우리의") */
  titlePre: z.string().min(1).optional(),
  /** 제목 굵은 강조 텍스트 (예: "브랜드 스토리를") — em, br 허용 */
  titleBold: z.string().min(1),
  /** 제목 후속 줄 — 가는 굵기 (예: "들려주세요") */
  titlePost: z.string().min(1).optional(),
  /** 본문 문단들 (1~4개) — em, br 허용 */
  paragraphs: z.array(z.string().min(1)).min(1).max(4),
  /** 먼 배경 이미지 (선택 — 배경 채움용, 텍스트 뒤에 위치) */
  bgImage: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const storyTextFirst = defineBlock<Data>({
  id: 'story-text-first',
  archetype: 'story',
  styleTags: ['editorial', 'light', 'template', 'story', 'minimal'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(텍스트 우선 에디토리얼). 상단 작은 EN 라벨+수평선 → 좌정렬 대형 혼합 굵기 KR 제목 → 짧은 수직 강조선 구분 → 본문 문단. 이미지는 먼 배경에만. story-brand·story-photo-header와 달리 텍스트가 주역.',
  schema,
  css: `
/* story-text-first — 접두사 stf- */
.stf{position:relative;background:var(--bg);color:var(--ink);overflow:hidden}

/* 배경 이미지 (먼 배경 — 텍스트 위계 유지) */
.stf-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:.08;pointer-events:none}
.stf-bg.ph{position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:0;opacity:.08}

/* 콘텐츠 컨테이너 */
.stf-inner{position:relative;z-index:2;padding:44px 48px 64px}

/* 상단 라벨 + HR */
.stf-header{margin-bottom:40px}
.stf-label{display:inline-block;font-family:var(--font-body);font-weight:700;font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);line-height:1;margin-bottom:14px}
.stf-hr{border:none;border-top:1.5px solid color-mix(in srgb,var(--ink) 18%,transparent);margin:0}

/* 대형 혼합 굵기 제목 */
.stf-title{font-family:var(--font-display);font-size:clamp(52px,8vw,80px);line-height:1.18;letter-spacing:-.03em;color:var(--ink);margin-bottom:32px}
.stf-title-pre{font-weight:400;display:block}
.stf-title-bold{font-weight:800;display:block}
.stf-title-post{font-weight:400;display:block}
.stf-title .em{color:var(--accent)}

/* 수직 강조선 구분 */
.stf-divider{display:block;width:3px;height:56px;background:var(--accent);margin-bottom:28px;border-radius:calc(var(--r-scale,1)*2px)}

/* 본문 문단 */
.stf-copy{display:flex;flex-direction:column;gap:20px;max-width:520px}
.stf-p{font-family:var(--font-body);font-size:16px;font-weight:400;color:var(--ink-2);line-height:1.82;letter-spacing:-.012em}
.stf-p .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="stf">
  ${d.bgImage ? media(d.bgImage, 'stf-bg', '배경 이미지') : ''}
  <div class="stf-inner">
    <div class="stf-header">
      ${d.label ? `<span class="stf-label">${esc(d.label)}</span>` : '<span class="stf-label">OUR BRAND STORY</span>'}
      <hr class="stf-hr">
    </div>
    <h2 class="stf-title">${d.titlePre ? `<span class="stf-title-pre">${esc(d.titlePre)}</span>` : ''}<span class="stf-title-bold">${richSafe(d.titleBold)}</span>${d.titlePost ? `<span class="stf-title-post">${esc(d.titlePost)}</span>` : ''}</h2>
    <span class="stf-divider"></span>
    <div class="stf-copy">
      ${d.paragraphs.map((p) => `<p class="stf-p">${richSafe(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>`,
})
