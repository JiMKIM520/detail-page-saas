/** STORY 아키타입(템플릿 충실 재현): story-brand.
 *  와디즈 200섹션 09_브랜드 스토리_09 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 풀블리드 이미지 배경 + 상단 메타바(번호·슬로건·연도) + "OUR BRAND STORY" 라벨
 *  + 대형 혼합 굵기 제목 + 반투명 frosted 패널 위 브랜드 카피 블록.
 *  에디토리얼 잡지 표지 느낌의 브랜드 스토리 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 메타바 왼쪽 인덱스 번호 (예: "01", "00") */
  index: z.string().min(1).optional(),
  /** 상단 메타바 가운데 슬로건 (예: "HOW WE STARTED") */
  slogan: z.string().min(1).optional(),
  /** 상단 메타바 오른쪽 연도 (예: "2021") */
  year: z.string().min(1).optional(),
  /** 영문 섹션 라벨 (예: "OUR BRAND STORY") */
  label: z.string().min(1),
  /** 대형 제목 일반 텍스트 — 첫 줄 (예: "우리의") */
  titlePre: z.string().min(1).optional(),
  /** 대형 제목 강조 텍스트 — 굵게 표시됨 (예: "브랜드 스토리") */
  titleBold: z.string().min(1),
  /** 대형 제목 후속 텍스트 (예: "를\n들려주세요") */
  titlePost: z.string().min(1).optional(),
  /** 브랜드 스토리 본문 문단들 (1~4개) */
  paragraphs: z.array(z.string().min(1)).min(1).max(4),
  /** 풀블리드 배경 이미지 URL */
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const storyBrand = defineBlock<Data>({
  id: 'story-brand',
  archetype: 'story',
  styleTags: ['premium', 'editorial', 'template', 'fullbleed', 'story'],
  imageSlots: 1,
  describe:
    '브랜드 스토리 에디토리얼. 풀블리드 이미지 배경 + 상단 메타바(인덱스·슬로건·연도) + "OUR BRAND STORY" 라벨 + 대형 혼합 굵기 한국어 제목 + 반투명 frosted 패널 위 브랜드 카피 블록. 에디토리얼 잡지 표지 톤.',
  schema,
  css: `
/* story-brand — 접두사 sb- */
.sb{position:relative;background:var(--bg);min-height:560px;overflow:hidden}
.sb-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.sb-bg.ph{position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:0}

/* 상단 오버레이: 이미지 위 밝은 그라데이션으로 메타바 가독성 확보 */
.sb-top-veil{position:absolute;top:0;left:0;right:0;height:220px;background:linear-gradient(180deg,rgba(255,255,255,.72) 0%,rgba(255,255,255,0) 100%);pointer-events:none}

/* 하단 오버레이: 본문 패널 위 영역 */
.sb-bot-veil{position:absolute;bottom:0;left:0;right:0;height:55%;background:linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.95) 22%,rgba(255,255,255,1) 45%);pointer-events:none}

/* 전체 콘텐츠 컨테이너 */
.sb-inner{position:relative;z-index:2;display:flex;flex-direction:column;min-height:560px}

/* 메타바 */
.sb-meta{display:flex;align-items:center;justify-content:space-between;padding:28px 48px 22px;border-bottom:1.5px solid rgba(0,0,0,.12)}
.sb-meta-idx{font-family:var(--font-body);font-weight:600;font-size:15px;color:var(--ink-2);letter-spacing:.04em}
.sb-meta-slogan{font-family:var(--font-body);font-weight:700;font-size:15px;color:var(--accent);letter-spacing:.12em;text-transform:uppercase}
.sb-meta-year{font-family:var(--font-body);font-weight:600;font-size:15px;color:var(--ink-2);letter-spacing:.04em}

/* 섹션 라벨 */
.sb-label{padding:52px 48px 0;font-family:'Cafe24 ClassicType',serif;font-size:28px;font-weight:400;color:var(--ink);letter-spacing:.16em;text-transform:uppercase;line-height:1}

/* 대형 제목 영역 (이미지 위, 절반 높이) */
.sb-title-wrap{padding:36px 48px 0;flex:0 0 auto}
.sb-title{font-family:var(--font-display);font-size:clamp(52px,8vw,82px);line-height:1.18;letter-spacing:-.03em;color:var(--ink)}
.sb-title-pre{font-weight:400}
.sb-title-bold{font-weight:800;color:var(--ink)}
.sb-title-post{font-weight:400}

/* 스페이서: 이미지 영역 차지 */
.sb-spacer{flex:1 1 auto;min-height:220px}

/* 본문 패널 */
.sb-panel{padding:0 48px 56px;flex:0 0 auto}
.sb-copy{display:flex;flex-direction:column;gap:18px}
.sb-p{font-family:var(--font-body);font-size:17px;font-weight:400;color:var(--ink-2);line-height:1.78;letter-spacing:-.015em}

/* 하단 장식 라인 */
.sb-foot{margin-top:28px;height:2px;width:48px;background:var(--accent);border-radius:2px}
`,
  render: (d, { esc }) => {
    const paragraphsHtml = d.paragraphs
      .map((p) => `<p class="sb-p">${esc(p)}</p>`)
      .join('')

    return `
<section class="sb">
  ${media(d.image, 'sb-bg', '브랜드 스토리 이미지')}
  <div class="sb-top-veil"></div>
  <div class="sb-bot-veil"></div>
  <div class="sb-inner">
    <div class="sb-meta">
      <span class="sb-meta-idx">${esc(d.index ?? '01')}</span>
      <span class="sb-meta-slogan">${esc(d.slogan ?? 'OUR BRAND STORY')}</span>
      <span class="sb-meta-year">${esc(d.year ?? '2024')}</span>
    </div>
    <div class="sb-label">${esc(d.label)}</div>
    <div class="sb-title-wrap">
      <h2 class="sb-title">${d.titlePre ? `<span class="sb-title-pre">${esc(d.titlePre)}<br></span>` : ''}<span class="sb-title-bold">${esc(d.titleBold)}</span>${d.titlePost ? `<span class="sb-title-post">${esc(d.titlePost)}</span>` : ''}</h2>
    </div>
    <div class="sb-spacer"></div>
    <div class="sb-panel">
      <div class="sb-copy">
        ${paragraphsHtml}
      </div>
      <div class="sb-foot"></div>
    </div>
  </div>
</section>`
  },
})
