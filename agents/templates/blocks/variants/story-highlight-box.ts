/** STORY 아키타입(템플릿 충실 재현): story-highlight-box.
 *  와디즈 200섹션 09_브랜드스토리 568:4909 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 상단 사진 → EN 디스플레이 3행 타이틀(중간 1행만 accent 강조 바) →
 *  본문 문단 → accent 배경 KR 대형 헤드라인 박스.
 *  story-photo-header(얇은 라벨 띠+좌정렬)와 달리 타이틀 하이라이트 바 + 하단 accent 박스가 시그니처. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 풀블리드 히어로 이미지 URL */
  heroImage: z.string().optional(),
  /** EN 디스플레이 대제목 1행 (예: "OUR") — em,br 허용 */
  titleLine1: z.string().min(1),
  /** EN 디스플레이 대제목 2행 — accent 하이라이트 바 강조 (예: "BRAND") — em,br 허용 */
  titleLine2: z.string().min(1),
  /** EN 디스플레이 대제목 3행 (예: "STORY") — em,br 허용 */
  titleLine3: z.string().min(1).optional(),
  /** 본문 문단들 (1~3개) — em,br 허용 */
  paragraphs: z.array(z.string().min(1)).min(1).max(3),
  /** 하단 accent 박스 KR 헤드라인 (예: "우리의 브랜드 스토리를<br>들려주세요") — em,br 허용 */
  accentHeadline: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const storyHighlightBox = defineBlock<Data>({
  id: 'story-highlight-box',
  archetype: 'story',
  styleTags: ['editorial', 'light', 'template', 'fullbleed', 'story', 'colorblock'],
  imageSlots: 1,
  describe:
    '브랜드 스토리(EN 타이틀 하이라이트 바 + accent 박스). 풀폭 사진 히어로 + EN 3행 디스플레이 제목(중간 행만 accent 컬러 강조 바) + 본문 + 하단 accent 배경 KR 대형 헤드라인 박스. story-photo-header보다 타이틀 포인트와 하단 accent 박스가 강함.',
  schema,
  css: `
/* story-highlight-box — 접두사 shb- */
.shb{background:var(--bg);color:var(--ink)}

/* 풀블리드 상단 히어로 이미지 */
.shb-hero{width:100%;height:500px;object-fit:cover;display:block}
.shb-hero.ph{width:100%;height:500px;border-radius:0;border:none}

/* 타이틀 영역 */
.shb-title-wrap{padding:52px 48px 0}

/* EN 디스플레이 타이틀 행 공통 */
.shb-line{display:block;font-family:var(--font-display);font-weight:800;font-size:clamp(60px,10vw,90px);line-height:1.05;letter-spacing:-.02em;color:var(--accent)}

/* 중간 행: accent 컬러 배경 강조 바 (하이라이트 바) */
.shb-line-hl{display:inline-block;background:var(--accent);color:#fff;padding:0 10px;line-height:1.1}

/* 본문 영역 */
.shb-body{padding:40px 48px 48px;text-align:center}
.shb-copy{display:flex;flex-direction:column;gap:14px}
.shb-p{font-family:var(--font-body);font-size:15px;font-weight:400;color:var(--ink-2);line-height:1.85;letter-spacing:-.01em}
.shb-p .em{color:var(--accent);font-weight:600}

/* 하단 accent 박스 */
.shb-accent-box{background:var(--accent);padding:56px 40px 60px;text-align:left}
.shb-accent-hl{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,5.5vw,48px);color:#fff;line-height:1.25;letter-spacing:-.02em}
.shb-accent-hl .em{color:color-mix(in srgb,#fff 70%,transparent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="shb">
  ${media(d.heroImage, 'shb-hero', '브랜드 스토리 대표 이미지')}
  <div class="shb-title-wrap">
    <span class="shb-line">${richSafe(d.titleLine1)}</span>
    <span class="shb-line"><span class="shb-line-hl">${richSafe(d.titleLine2)}</span></span>
    ${d.titleLine3 ? `<span class="shb-line">${richSafe(d.titleLine3)}</span>` : ''}
  </div>
  <div class="shb-body">
    <div class="shb-copy">
      ${d.paragraphs.map((p) => `<p class="shb-p">${richSafe(p)}</p>`).join('\n      ')}
    </div>
  </div>
  <div class="shb-accent-box">
    <h2 class="shb-accent-hl">${richSafe(d.accentHeadline)}</h2>
  </div>
</section>`,
})
