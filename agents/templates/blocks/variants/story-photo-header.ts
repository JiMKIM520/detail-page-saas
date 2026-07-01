/** STORY 아키타입(템플릿 충실 재현): story-photo-header.
 *  와디즈 200섹션 09_브랜드스토리_01 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 상단 사진 히어로 → 얇은 accent 라벨 띠(우측 정렬) →
 *  plain 배경 좌정렬 본문(손글씨 아이브로 + 대형 EN 디스플레이 제목 + 본문).
 *  story-brand(이미지 오버레이 에디토리얼)보다 단순·명쾌. 이미지 그리드 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 풀블리드 히어로 이미지 URL */
  heroImage: z.string().optional(),
  /** 라벨 띠 텍스트 (예: "Brand Story", "Our Story") */
  stripLabel: z.string().min(1).optional(),
  /** 제목 위 손글씨/필기체 소제목 (예: "우리의 브랜드 스토리를 들려주세요") — em,br 허용 */
  eyebrow: z.string().min(1).optional(),
  /** EN 디스플레이 대제목 1행 (예: "OUR") — em,br 허용 */
  titleLine1: z.string().min(1),
  /** EN 디스플레이 대제목 2행 (예: "BRAND STORY") — em,br 허용 */
  titleLine2: z.string().min(1).optional(),
  /** 본문 문단들 (1~3개) — em,br 허용 */
  paragraphs: z.array(z.string().min(1)).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const storyPhotoHeader = defineBlock<Data>({
  id: 'story-photo-header',
  archetype: 'story' as any,
  styleTags: ['editorial', 'light', 'template', 'fullbleed', 'story'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(풀블리드 상단 히어로). 풀폭 사진 히어로 + 얇은 accent 라벨 띠(우정렬) + plain 배경 좌정렬 본문(손글씨 아이브로 + 대형 EN 디스플레이 제목 + 본문). story-brand보다 단순·에디토리얼.',
  schema,
  css: `
/* story-photo-header — 접두사 sph- */
.sph{background:var(--bg);color:var(--ink)}

/* 풀블리드 상단 히어로 이미지 */
.sph-hero{width:100%;height:520px;object-fit:cover;display:block}
.sph-hero.ph{width:100%;height:520px;border-radius:0;border:none}

/* 얇은 accent 라벨 띠 */
.sph-strip{width:100%;background:var(--accent);display:flex;align-items:center;justify-content:flex-end;padding:10px 40px}
.sph-strip-label{font-family:var(--font-body);font-weight:600;font-size:15px;color:#fff;letter-spacing:.12em;text-transform:capitalize}

/* 본문 영역 */
.sph-body{padding:52px 40px 60px}

/* 손글씨 아이브로 */
.sph-eyebrow{font-family:var(--font-hand),'Gaegu',cursive;font-size:22px;font-weight:400;color:var(--ink-2);line-height:1.5;margin-bottom:18px;letter-spacing:.01em}
.sph-eyebrow .em{color:var(--accent)}

/* EN 디스플레이 대제목 */
.sph-title{font-family:var(--font-display);font-weight:800;font-size:clamp(56px,10vw,88px);line-height:1.06;letter-spacing:-.02em;color:var(--accent);margin-bottom:36px}
.sph-title .em{color:var(--accent-dark,var(--accent))}

/* 본문 문단 */
.sph-copy{display:flex;flex-direction:column;gap:16px}
.sph-p{font-family:var(--font-body);font-size:16px;font-weight:400;color:var(--ink-2);line-height:1.82;letter-spacing:-.01em}
.sph-p .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="sph">
  ${media(d.heroImage, 'sph-hero', '브랜드 스토리 대표 이미지')}
  <div class="sph-strip">
    <span class="sph-strip-label">${esc(d.stripLabel ?? 'Brand Story')}</span>
  </div>
  <div class="sph-body">
    ${d.eyebrow ? `<p class="sph-eyebrow">${richSafe(d.eyebrow)}</p>` : ''}
    <h2 class="sph-title">${richSafe(d.titleLine1)}${d.titleLine2 ? `<br>${richSafe(d.titleLine2)}` : ''}</h2>
    <div class="sph-copy">
      ${d.paragraphs.map((p) => `<p class="sph-p">${richSafe(p)}</p>`).join('\n      ')}
    </div>
  </div>
</section>`,
})
