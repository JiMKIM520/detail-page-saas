/** STORY 아키타입(템플릿 충실 재현): story-centered-secondary-image.
 *  와디즈 200섹션 09_브랜드스토리 1284:3046 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 배경 텍스처(옅은 paper 오버레이) + 중앙정렬 EN 라벨(상하 HR) +
 *  혼합 굵기 KR 대형 제목(중앙) + 중앙정렬 본문 문단들 + 하단 보조 제품 이미지(풀폭).
 *  story-text-first와 달리 좌정렬이 아닌 완전 중앙정렬, 하단 보조 이미지가 필수 슬롯. */
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
  /** 하단 보조 제품 이미지 URL */
  secondaryImage: z.string().optional(),
  /** 보조 이미지 alt (예: "제품 상세 이미지") */
  secondaryImageAlt: z.string().min(1).optional(),
})
type Data = z.infer<typeof schema>

export const storyCenteredSecondaryImage = defineBlock<Data>({
  id: 'story-centered-secondary-image',
  archetype: 'story',
  styleTags: ['editorial', 'light', 'template', 'story', 'centered', 'texture'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(중앙정렬 + 하단 보조 이미지). 배경 텍스처 + 중앙정렬 EN 라벨(상하 수평선) + 혼합 굵기 KR 대형 제목 + 중앙정렬 본문 문단 + 하단 보조 제품 이미지. story-text-first와 달리 완전 중앙정렬이며 하단에 보조 이미지 슬롯 보유.',
  schema,
  css: `
/* story-centered-secondary-image — 접두사 scsi- */
.scsi{position:relative;background:var(--bg);color:var(--ink);overflow:hidden}

/* 배경 텍스처 오버레이 — paper 표면감 */
.scsi::before{content:"";position:absolute;inset:0;
  background:
    radial-gradient(ellipse 140% 80% at 50% 0%,color-mix(in srgb,var(--paper) 60%,transparent) 0%,transparent 70%),
    radial-gradient(ellipse 100% 60% at 50% 110%,color-mix(in srgb,var(--paper) 40%,transparent) 0%,transparent 65%);
  pointer-events:none;z-index:0}

/* 콘텐츠 컨테이너 */
.scsi-inner{position:relative;z-index:1;padding:52px 48px 0;text-align:center}

/* 상단 라벨 영역 */
.scsi-label-wrap{margin-bottom:44px}
.scsi-hr{border:none;border-top:1px solid color-mix(in srgb,var(--ink) 20%,transparent);margin:0}
.scsi-label{display:inline-block;font-family:var(--font-body);font-weight:700;font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-2);line-height:1;padding:13px 0}

/* 대형 혼합 굵기 제목 */
.scsi-title{font-family:var(--font-display);font-size:clamp(48px,7vw,74px);line-height:1.22;letter-spacing:-.03em;color:var(--ink);margin-bottom:40px}
.scsi-title-pre{font-weight:400;display:block}
.scsi-title-bold{font-weight:800;display:block}
.scsi-title-post{font-weight:400;display:block}
.scsi-title .em{color:var(--accent)}

/* 본문 문단 */
.scsi-copy{display:flex;flex-direction:column;gap:22px;max-width:480px;margin:0 auto;padding-bottom:52px}
.scsi-p{font-family:var(--font-body);font-size:15px;font-weight:400;color:var(--ink-2);line-height:1.88;letter-spacing:-.01em}
.scsi-p .em{color:var(--accent);font-weight:600}

/* 하단 보조 이미지 */
.scsi-img-wrap{position:relative;z-index:1;width:100%;padding:0 36px 52px}
.scsi-secondary{width:100%;height:280px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px));display:block}
`,
  render: (d, { esc, richSafe }) => `
<section class="scsi">
  <div class="scsi-inner">
    <div class="scsi-label-wrap">
      <hr class="scsi-hr">
      <span class="scsi-label">${esc(d.label ?? 'OUR BRAND STORY')}</span>
      <hr class="scsi-hr">
    </div>
    <h2 class="scsi-title">${d.titlePre ? `<span class="scsi-title-pre">${esc(d.titlePre)}</span>` : ''}<span class="scsi-title-bold">${richSafe(d.titleBold)}</span>${d.titlePost ? `<span class="scsi-title-post">${esc(d.titlePost)}</span>` : ''}</h2>
    <div class="scsi-copy">
      ${d.paragraphs.map((p) => `<p class="scsi-p">${richSafe(p)}</p>`).join('\n      ')}
    </div>
  </div>
  <div class="scsi-img-wrap">
    ${media(d.secondaryImage, 'scsi-secondary', esc(d.secondaryImageAlt ?? '제품 이미지'))}
  </div>
</section>`,
})
