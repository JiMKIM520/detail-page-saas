/** SHIPPING 아키타입(템플릿 충실 재현): shipping-chapter-hero.
 *  와디즈 200섹션 16_배송 Figma 571:661 — 챕터번호 히어로 + 풀폭 사진 + 다크 패널 타임라인.
 *  상단 라이트 구역: 챕터 번호 + 대형 헤드라인 + 영문 아이브로 태그 + 풀폭 배송 사진.
 *  하단 다크 패널: 아이콘 배지(원형) + 소요일 강조 + 구분선 + 클로징 카피.
 *  기존 shipping-info(좌보더행), shipping-notice(타원라벨+카드), shipping-icon-hero(다크히어로+불릿)와 완전히 다른 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  /** 챕터 번호 (예: "05", "CHAPTER 05") */
  chapterNumber: z.string().min(1).optional(),
  /** 메인 헤드라인 — 2줄 대형 (em/br 허용) */
  title: z.string().min(1),
  /** 영문 아이브로 태그 (예: "CUSTOMIZED, BUT QUICKLY") */
  eyebrow: z.string().min(1).optional(),
  /** 풀폭 배송 사진 URL */
  image: z.string().optional(),
  /** 다크 패널 아이콘 이름 (기본 "truck") */
  badgeIcon: z.enum(ICON_NAMES).optional(),
  /** 아이콘 아래 소요일 안내 굵은 텍스트 (예: "제작부터 배송까지 평균 10~15일") */
  daysLabel: z.string().min(1),
  /** 소요일 아래 보조 안내 (예: "수도권은 무료 설치까지 가능합니다.") */
  daysNote: z.string().min(1).optional(),
  /** 구분선 아래 클로징 카피 — 2줄 대형 (em/br 허용) */
  closing: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const shippingChapterHero = defineBlock<Data>({
  id: 'shipping-chapter-hero',
  archetype: 'shipping' as any,
  styleTags: ['dark', 'editorial', 'template', 'chapter', 'fullbleed'],
  imageSlots: 1,
  describe:
    '배송 챕터 히어로(풀폭 사진+다크 패널). 상단 라이트 구역: 챕터번호+대형헤드라인+영문아이브로+풀폭 배송사진. 하단 다크 패널: 원형 아이콘배지+소요일+구분선+클로징 카피. 명암 대비 레이아웃.',
  schema,
  css: `
/* ── shipping-chapter-hero: sch prefix ── */

/* ─ 상단 라이트 구역 ─ */
.sch{background:var(--bg);color:var(--ink)}
.sch-light{padding:48px 56px 0}
.sch-chapter{font-size:15px;font-weight:700;letter-spacing:.12em;color:var(--muted);margin-bottom:18px}
.sch-title{font-family:var(--font-display);font-weight:800;font-size:46px;letter-spacing:-.02em;line-height:1.2;color:var(--ink);margin-bottom:16px}
.sch-title .em{color:var(--accent)}
.sch-eyebrow{font-size:13px;font-weight:700;letter-spacing:.18em;color:var(--accent);margin-bottom:36px}

/* ─ 풀폭 사진 ─ */
.sch-photo{width:100%;height:320px;object-fit:cover;display:block}

/* ─ 하단 다크 패널 ─ */
.sch-dark{background:var(--ink);color:#fff;padding:52px 56px 60px;display:flex;flex-direction:column;align-items:center;text-align:center}

/* 아이콘 배지 */
.sch-badge{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;margin-bottom:24px;color:var(--accent)}
.sch-badge svg{width:40px;height:40px}

/* 소요일 */
.sch-days{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:800;font-size:20px;color:#fff;line-height:1.45;margin-bottom:8px}
.sch-days-note{font-size:14px;color:rgba(255,255,255,.5);line-height:1.55;margin-bottom:36px}

/* 구분선 */
.sch-divider{width:1px;height:48px;background:rgba(255,255,255,.2);margin-bottom:36px}

/* 클로징 카피 */
.sch-closing{font-family:var(--font-display);font-weight:800;font-size:34px;color:#fff;line-height:1.35;letter-spacing:-.02em}
.sch-closing .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const badgeIcon = d.badgeIcon ?? 'truck'
    return `
<section class="sch">
  <div class="sch-light">
    ${d.chapterNumber ? `<p class="sch-chapter">${esc(d.chapterNumber)}</p>` : ''}
    <h2 class="sch-title">${richSafe(d.title)}</h2>
    ${d.eyebrow ? `<p class="sch-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  </div>
  ${media(d.image, 'sch-photo', '배송 사진')}
  <div class="sch-dark">
    <div class="sch-badge">${icon(badgeIcon)}</div>
    <p class="sch-days">${esc(d.daysLabel)}</p>
    ${d.daysNote ? `<p class="sch-days-note">${esc(d.daysNote)}</p>` : ''}
    <div class="sch-divider"></div>
    <p class="sch-closing">${richSafe(d.closing)}</p>
  </div>
</section>`
  },
})
