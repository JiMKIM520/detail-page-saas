/** POINT 아키타입: point-award-credential.
 *  [끝판왕] 포인트 구성 #6 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + 로렐 리스 헤드라인(수상 마일스톤) + 제품 히어로 이미지 위
 *  플로팅 원형 어워드 스탬프 뱃지 + 연도순 수상 히스토리 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 아이브로우 라벨 (제품명/카테고리) */
  eyebrow: z.string().min(1).optional(),
  /** 로렐 리스 내부 대형 마일스톤 문구 (em 허용 — 강조 어절) */
  headline: z.string().min(1),
  /** 제품 히어로 이미지 (1~3장) */
  heroImages: z
    .array(
      z.object({
        image: z.string().optional(),
        alt: z.string().optional(),
      }),
    )
    .min(1)
    .max(3),
  /** 플로팅 원형 어워드 스탬프 뱃지 (1~3개) */
  badges: z
    .array(
      z.object({
        /** 뱃지 상단 작은 텍스트 */
        topLine: z.string().min(1).optional(),
        /** 뱃지 중앙 큰 숫자/텍스트 */
        mainText: z.string().min(1),
        /** 뱃지 하단 작은 텍스트 */
        bottomLine: z.string().min(1).optional(),
      }),
    )
    .min(1)
    .max(3),
  /** 연도순 수상 히스토리 항목 (2~6개) */
  awards: z
    .array(
      z.object({
        /** 연도 또는 기간 레이블 (예: "2020") */
        year: z.string().min(1),
        /** 수상 내용 (em 허용 — 핵심 키워드 강조) */
        desc: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

/** 로렐 리스 인라인 SVG — 좌우 월계수 가지 */
const LAUREL_LEFT =
  '<svg class="pac-laurel pac-laurel-l" viewBox="0 0 54 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M46 10 C30 18 12 30 8 50 C4 70 18 90 30 110" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/><ellipse cx="38" cy="22" rx="9" ry="5" transform="rotate(-40 38 22)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="28" cy="38" rx="9" ry="5" transform="rotate(-50 28 38)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="20" cy="55" rx="9" ry="5" transform="rotate(-55 20 55)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="14" cy="73" rx="9" ry="5" transform="rotate(-60 14 73)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="18" cy="91" rx="9" ry="5" transform="rotate(-50 18 91)" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>'

const LAUREL_RIGHT =
  '<svg class="pac-laurel pac-laurel-r" viewBox="0 0 54 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10 C24 18 42 30 46 50 C50 70 36 90 24 110" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/><ellipse cx="16" cy="22" rx="9" ry="5" transform="rotate(40 16 22)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="26" cy="38" rx="9" ry="5" transform="rotate(50 26 38)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="34" cy="55" rx="9" ry="5" transform="rotate(55 34 55)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="40" cy="73" rx="9" ry="5" transform="rotate(60 40 73)" stroke="currentColor" stroke-width="1.8" fill="none"/><ellipse cx="36" cy="91" rx="9" ry="5" transform="rotate(50 36 91)" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>'

/** 별 아이콘 (수상 히스토리 아이템 앞) */
const STAR_ICON =
  '<svg class="pac-star" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0l1.6 6.4L16 8l-6.4 1.6L8 16l-1.6-6.4L0 8l6.4-1.6z"/></svg>'

export const pointAwardCredential = defineBlock<Data>({
  id: 'point-award-credential',
  archetype: 'point',
  styleTags: ['dark', 'award', 'credential', 'premium', 'milestone', 'template'],
  imageSlots: 3,
  describe:
    '포인트 수상 신뢰. 다크 배경 + 로렐 리스 감싼 마일스톤 대형 헤드라인 + 제품 히어로 이미지(1~3장) 위 플로팅 원형 어워드 스탬프 뱃지(1~3개) 오버랩 + 연도순 별 아이콘 수상 히스토리 리스트. 커머스 수상/인증 신뢰 섹션.',
  schema,
  css: `
/* point-award-credential — 접두사 pac- */
.pac{background:var(--ink);color:#fff;padding:56px 32px 64px;text-align:center;word-break:keep-all;overflow-wrap:break-word}

/* 아이브로우 라벨 */
.pac-eyebrow{display:inline-block;font-family:var(--font-body);font-size:13px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.55);text-transform:uppercase;margin-bottom:18px}

/* 로렐 리스 + 헤드라인 래퍼 */
.pac-wreath-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:0;margin-bottom:36px}
.pac-laurel{width:40px;height:90px;color:rgba(255,255,255,.65);flex-shrink:0}
.pac-laurel-l{transform:scaleX(1)}
.pac-laurel-r{transform:scaleX(-1) scaleX(-1)}
.pac-headline-box{padding:0 12px;display:flex;flex-direction:column;align-items:center;gap:4px}
.pac-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,8vw,52px);line-height:1.14;letter-spacing:-.02em;color:#fff}
/* 다크 배경 — .em은 골드 강조(커머스 신뢰 신호) */
.pac-headline .em{color:#D4A853}

/* 제품 히어로 + 뱃지 영역 */
.pac-hero-wrap{position:relative;margin:0 -32px 0;padding:0 0 32px}
.pac-hero-imgs{display:flex;align-items:flex-end;justify-content:center;gap:0;padding:0 16px}
.pac-hero-img{flex:1;min-width:0;aspect-ratio:2/3;object-fit:cover;display:block}
.pac-hero-img.ph{aspect-ratio:2/3;background:rgba(255,255,255,.07);border:1.5px dashed rgba(255,255,255,.22);color:rgba(255,255,255,.3);font-size:12px}

/* 플로팅 뱃지 컨테이너 — 이미지 위 절대 오버랩 */
.pac-badges{position:absolute;right:18px;top:18px;display:flex;flex-direction:column;gap:12px;align-items:flex-end;z-index:2}

/* 원형 어워드 스탬프 뱃지 */
.pac-badge{width:80px;height:80px;border-radius:50%;background:#fff;color:var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:8px;box-shadow:0 4px 20px rgba(0,0,0,.35);border:2px solid rgba(0,0,0,.08)}
.pac-badge-top{font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(0,0,0,.5);line-height:1.2;text-align:center}
.pac-badge-main{font-family:var(--font-display);font-size:14px;font-weight:800;line-height:1.15;text-align:center;color:var(--ink);letter-spacing:-.01em}
.pac-badge-bottom{font-size:7.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:rgba(0,0,0,.5);line-height:1.2;text-align:center}

/* 수상 히스토리 리스트 */
.pac-awards{margin-top:36px;display:flex;flex-direction:column;gap:0;text-align:left}
.pac-award-item{display:flex;align-items:flex-start;gap:10px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.10)}
.pac-award-item:first-child{border-top:1px solid rgba(255,255,255,.10)}
.pac-star{width:12px;height:12px;color:#D4A853;flex-shrink:0;margin-top:3px}
.pac-award-year{font-family:var(--font-body);font-size:13px;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:.04em;flex-shrink:0;min-width:52px}
.pac-award-desc{font-family:var(--font-body);font-size:14px;line-height:1.55;color:rgba(255,255,255,.80)}
/* 다크 배경 — .em은 밝은 accent */
.pac-award-desc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrow = d.eyebrow
      ? `<div class="pac-eyebrow">${esc(d.eyebrow)}</div>`
      : ''

    const heroImgs = d.heroImages
      .map((img) => media(img.image, 'pac-hero-img', esc(img.alt ?? '제품 이미지')))
      .join('')

    const badgesHtml = d.badges
      .map(
        (b) => `
        <div class="pac-badge">
          ${b.topLine ? `<div class="pac-badge-top">${esc(b.topLine)}</div>` : ''}
          <div class="pac-badge-main">${esc(b.mainText)}</div>
          ${b.bottomLine ? `<div class="pac-badge-bottom">${esc(b.bottomLine)}</div>` : ''}
        </div>`,
      )
      .join('')

    const awardsHtml = d.awards
      .map(
        (a) => `
        <div class="pac-award-item">
          ${STAR_ICON}
          <div class="pac-award-year">${esc(a.year)}</div>
          <div class="pac-award-desc">${richSafe(a.desc)}</div>
        </div>`,
      )
      .join('')

    return `
<section class="pac">
  ${eyebrow}
  <div class="pac-wreath-wrap">
    ${LAUREL_LEFT}
    <div class="pac-headline-box">
      <h2 class="pac-headline">${richSafe(d.headline)}</h2>
    </div>
    ${LAUREL_RIGHT}
  </div>
  <div class="pac-hero-wrap">
    <div class="pac-hero-imgs">
      ${heroImgs}
    </div>
    <div class="pac-badges">
      ${badgesHtml}
    </div>
  </div>
  <div class="pac-awards">
    ${awardsHtml}
  </div>
</section>`
  },
})
