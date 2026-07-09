/** HERO 아키타입: hero-vertical-badge
 *  피그마 039_인트로_05 구조 흡수 — 전폭 배경 이미지 위 우측 세로쓰기 텍스트 컬럼 +
 *  좌측 원형 성분 뱃지 3단 수직 배열 + 하단 브랜드·헤드라인·태그라인 타이포 블록.
 *  원본 860px 모바일 → 872px 데스크톱으로 확장. 이미지 부재 시 브랜드색 패널 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const badgeSchema = z.object({
  /** 원형 뱃지 한 줄 (em,br) — 예: "단백질<br>25g" */
  line1: z.string().min(1),
  /** 원형 뱃지 두 번째 줄 (em,br) — 예: "25g" (line1에 br 포함 시 생략 가능) */
  line2: z.string().optional(),
  /** 'light' | 'mid' | 'dark' — 원 3단 톤 순서 그대로 */
  tone: z.enum(['light', 'mid', 'dark']),
})

const schema = z.object({
  /** 배경 제품 사진 url */
  image: z.string().optional(),
  /** 세로쓰기 텍스트 라인 1 (em 허용) */
  vertLine1: z.string().min(1),
  /** 세로쓰기 텍스트 라인 2 (em 허용) */
  vertLine2: z.string().optional(),
  /** 성분 뱃지 3개 (원본 고정 3단) */
  badges: z.array(badgeSchema).min(1).max(3),
  /** 브랜드 레이블 — 영문 소괄호 스타일. 예: "[ Muscle max ]" */
  brandLabel: z.string().optional(),
  /** 대제목 (em,br) — ExtraBold 임팩트 라인 */
  title: z.string().min(1),
  /** 서브 카피 (em,br) */
  desc: z.string().optional(),
})

type Data = z.infer<typeof schema>

export const heroVerticalBadge = defineBlock<Data>({
  id: 'hero-vertical-badge',
  archetype: 'hero',
  styleTags: ['dark', 'food', 'premium', 'impact', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크 배경 전폭 제품 사진 위 우측 세로쓰기 카피 + 좌측 원형 성분 뱃지 3단 컬럼 + 하단 브랜드·대제목·서브카피. 식품·보충제·음료 카테고리 인트로에 적합. 이미지 없을 때 브랜드색 패널로 강등.',
  schema,
  css: `
/* ── hero-vertical-badge (hlzs 접두) ── */
.hlzs{position:relative;background:var(--brand);color:var(--bg);overflow:hidden;font-family:var(--font-body),'Pretendard',sans-serif}

/* 이미지 영역 — 전폭 비율 고정 */
.hlzs-img-wrap{position:relative;width:100%;aspect-ratio:872/620;overflow:hidden;background:var(--brand)}
.hlzs-img-wrap img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;border-radius:var(--shape-photo,0)}
/* 이미지 없을 때(ph) — 브랜드색 패널로 유지, 자식 오버레이는 그대로 */
.hlzs-img-wrap .ph{width:100%;height:100%;background:var(--brand);display:block!important;border-radius:0}

/* 다크 그라디언트 오버레이 (이미지 가독성) */
.hlzs-img-wrap::after{content:'';position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.38) 0%,rgba(0,0,0,0) 60%),linear-gradient(to top,rgba(0,0,0,.5) 0%,rgba(0,0,0,0) 45%);pointer-events:none}

/* 좌측 뱃지 컬럼 */
.hlzs-badges{position:absolute;left:var(--pad-x,56px);top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:14px;z-index:2}
.hlzs-badge{width:120px;height:120px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:0;line-height:1.2;padding:8px}
.hlzs-badge.tone-light{background:var(--bg);color:var(--brand)}
.hlzs-badge.tone-mid{background:var(--accent-d);color:var(--bg)}
.hlzs-badge.tone-dark{background:var(--brand);color:var(--bg);border:2.5px solid rgba(255,255,255,.28)}
.hlzs-badge-l1{font-size:15px;font-weight:800;font-family:var(--font-display),'Pretendard',sans-serif;white-space:pre-line}
.hlzs-badge-l1 .em{color:inherit}
.hlzs-badge-l2{font-size:13px;font-weight:700;opacity:.82}

/* 우측 세로쓰기 텍스트 컬럼 */
.hlzs-vert{position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:2;display:flex;flex-direction:row;gap:6px;writing-mode:vertical-rl;text-orientation:mixed;padding-right:var(--pad-x,56px);max-height:90%;overflow:hidden}
.hlzs-vert-l{font-size:22px;font-weight:500;color:#fff;letter-spacing:.14em;line-height:1.5;white-space:nowrap;font-family:var(--font-body),'Pretendard',sans-serif}
.hlzs-vert-l .em{color:var(--em-dark,#FFF7EA)}

/* 하단 타이포 블록 */
.hlzs-copy{padding:32px var(--pad-x,56px) 48px;background:var(--brand);text-align:center}
.hlzs-brand{font-size:15px;font-weight:700;letter-spacing:.18em;color:rgba(255,255,255,.62);margin-bottom:10px;font-family:var(--font-lat),'Pretendard',sans-serif;text-transform:uppercase}
.hlzs-title{font-family:var(--font-display),'Pretendard',sans-serif;font-size:clamp(40px,5.5vw,72px);font-weight:800;line-height:1.1;letter-spacing:-.02em;color:#fff;white-space:pre-line}
.hlzs-title .em{color:var(--em-dark,#FFF7EA)}
.hlzs-desc{margin-top:18px;font-size:17px;font-weight:500;line-height:1.72;color:rgba(255,255,255,.75);max-width:620px;margin-inline:auto}
.hlzs-desc .em{color:var(--em-dark,#FFF7EA);font-weight:700}

/* dark 스코프 em 오버라이드 (Sprint 6 Directive) */
.hlzs .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const toneClass = (t: 'light' | 'mid' | 'dark') => `tone-${t}`

    const badgesHtml = d.badges
      .map(
        (b) => `
    <div class="hlzs-badge ${toneClass(b.tone)}">
      <span class="hlzs-badge-l1">${richSafe(b.line1)}</span>
      ${b.line2 ? `<span class="hlzs-badge-l2">${esc(b.line2)}</span>` : ''}
    </div>`,
      )
      .join('')

    const vertHtml = [d.vertLine1, d.vertLine2]
      .filter(Boolean)
      .map((l) => `<span class="hlzs-vert-l">${richSafe(l as string)}</span>`)
      .join('')

    return `
<section class="hlzs">
  <div class="hlzs-img-wrap">
    ${media(d.image, 'hlzs-img', '제품 대표 이미지')}
    <div class="hlzs-badges">${badgesHtml}
    </div>
    <div class="hlzs-vert">${vertHtml}</div>
  </div>
  <div class="hlzs-copy">
    ${d.brandLabel ? `<p class="hlzs-brand">${esc(d.brandLabel)}</p>` : ''}
    <h1 class="hlzs-title">${richSafe(d.title)}</h1>
    ${d.desc ? `<p class="hlzs-desc">${richSafe(d.desc)}</p>` : ''}
  </div>
</section>`
  },
})
