/** HERO 아키타입: hero-bubble-grid
 *  원본 프레임: 334_인트로_57.json (860px 반려동물 식품 인트로)
 *
 *  구조 흡수:
 *  - 전폭 제품 사진 위 타이틀 오버레이 (오렌지 pill 서브타이틀 칩 + 2톤 대형 헤드라인 + 설명)
 *  - 타원 말풍선 배지(꼬리 포함): 타깃 세그먼트 강조 장식
 *  - 황색 배경 + 2×3 화이트 아이콘 카드 그리드 배너 (하단 특징 6가지)
 *
 *  noimg-safe: 이미지 없으면 타이틀 영역을 황색 패널로 강등(배너 카드는 그대로 유지)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const iconNameEnum = z.enum([
  'wheat', 'drop', 'clock', 'badge', 'snow', 'check', 'fryer', 'oven', 'star',
  'heart', 'gift', 'truck', 'shield', 'leaf', 'trophy', 'thumb', 'fire',
  'person', 'search', 'pin', 'box', 'calendar', 'card', 'won', 'bulb', 'gear',
  'camera', 'phone', 'bolt', 'thermometer', 'target', 'store', 'doc', 'sprout', 'bell',
])

const schema = z.object({
  /** 오렌지 pill 칩 안 서브타이틀 (순수 텍스트) */
  chip: z.string().min(1),
  /** 헤드라인 첫째 줄 (em/br 허용) — 브랜드명 등 진한 색 */
  titleLine1: z.string().min(1),
  /** 헤드라인 둘째 줄 (em/br 허용) — 카테고리/슬로건, 녹색 강조 */
  titleLine2: z.string().min(1),
  /** 헤드라인 아래 한 줄 설명 (순수 텍스트) */
  desc: z.string().optional(),
  /** 타원 말풍선 배지 텍스트 2줄 (순수 텍스트). 예: "7세 이상\n시니어" */
  badgeLine1: z.string().optional(),
  badgeLine2: z.string().optional(),
  /** 전폭 제품 사진 URL (없으면 황색 패널로 강등) */
  image: z.string().optional(),
  /** 하단 특징 카드 6장 (2×3 그리드). min 4 / max 6. */
  features: z.array(
    z.object({
      icon: iconNameEnum,
      label: z.string().min(1),   // 2줄 이내 (순수 텍스트)
    }),
  ).min(4).max(6),
})
type Data = z.infer<typeof schema>

export const heroBubbleGrid = defineBlock<Data>({
  id: 'hero-bubble-grid',
  archetype: 'hero',
  styleTags: ['light', 'warm', 'food', 'playful', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '전폭 제품 사진 위 오렌지 pill 칩+2톤 대형 헤드라인+타원 말풍선 배지 오버레이. 하단 황색 배경 2×3 화이트 아이콘 카드 배너. 반려동물 식품·건강식품·자연식 인트로에 적합.',
  schema,
  css: `
/* ── hero-bubble-grid (prefix: hyiv) ─────────────────────────── */
.hyiv{background:var(--bg);color:var(--ink)}

/* 전폭 제품 사진 영역 */
.hyiv-photo-wrap{position:relative;width:100%;overflow:hidden;background:var(--accent)}
.hyiv-photo-wrap.no-img{background:#ffd153;min-height:320px;display:flex;align-items:center;justify-content:center}
.hyiv-photo-wrap .hyiv-photo{width:100%;display:block;object-fit:cover;max-height:560px}

/* 타이틀 오버레이 */
.hyiv-overlay{padding:32px var(--pad-x,56px) 28px;text-align:center;position:relative}
.hyiv-photo-wrap.no-img .hyiv-overlay{position:relative;width:100%;padding:48px var(--pad-x,56px) 40px}

/* 오렌지 pill 칩 */
.hyiv-chip{display:inline-block;background:#fb8031;color:var(--ink);
  font-family:var(--font-display);font-weight:500;font-size:22px;
  padding:10px 32px;border-radius:999px;margin-bottom:20px;
  letter-spacing:-.01em;white-space:nowrap}

/* 2톤 헤드라인 */
.hyiv-title{font-family:var(--font-display);font-weight:700;font-size:72px;
  line-height:1.1;letter-spacing:-.02em;margin-bottom:18px}
.hyiv-title-l1{display:block;color:var(--ink)}
.hyiv-title-l2{display:block;color:#5a7340}

/* 설명 */
.hyiv-desc{font-size:18px;font-weight:500;color:var(--ink-2);
  max-width:620px;margin:0 auto;line-height:1.6}

/* 타원 말풍선 배지 — 우상단 절대 포지션 */
.hyiv-badge{position:absolute;top:18px;right:var(--pad-x,56px);
  display:flex;flex-direction:column;align-items:center}
.hyiv-badge-ellipse{
  width:100px;height:80px;background:#5a7340;
  border-radius:50%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:2px}
.hyiv-badge-tail{
  width:0;height:0;
  border-left:9px solid transparent;
  border-right:9px solid transparent;
  border-top:16px solid #5a7340;
  margin-top:-2px;margin-left:-16px}
.hyiv-badge-l{font-family:var(--font-display);font-weight:500;font-size:13px;
  color:#fff;text-align:center;line-height:1.3;white-space:nowrap}

/* 하단 특징 배너 */
.hyiv-banner{background:#ffd153;padding:28px var(--pad-x,56px) 32px}
.hyiv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.hyiv-card{background:#fff;border-radius:calc(var(--r-scale,1)*20px);
  padding:22px 16px 20px;display:flex;flex-direction:column;
  align-items:center;gap:14px;text-align:center}
.hyiv-icon{width:56px;height:56px;border-radius:50%;
  background:#ffd153;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0}
.hyiv-icon svg{width:30px;height:30px;color:#111}
.hyiv-label{font-size:15px;font-weight:600;color:var(--ink);
  line-height:1.4;white-space:pre-line}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && d.image.trim().length > 0
    const hasBadge = d.badgeLine1 || d.badgeLine2

    const badge = hasBadge
      ? `<div class="hyiv-badge" aria-label="${esc(d.badgeLine1 ?? '')} ${esc(d.badgeLine2 ?? '')}">
  <div class="hyiv-badge-ellipse">
    ${d.badgeLine1 ? `<span class="hyiv-badge-l">${esc(d.badgeLine1)}</span>` : ''}
    ${d.badgeLine2 ? `<span class="hyiv-badge-l">${esc(d.badgeLine2)}</span>` : ''}
  </div>
  <div class="hyiv-badge-tail"></div>
</div>`
      : ''

    const overlay = `<div class="hyiv-overlay">
  ${badge}
  <span class="hyiv-chip">${esc(d.chip)}</span>
  <h1 class="hyiv-title">
    <span class="hyiv-title-l1">${richSafe(d.titleLine1)}</span>
    <span class="hyiv-title-l2">${richSafe(d.titleLine2)}</span>
  </h1>
  ${d.desc ? `<p class="hyiv-desc">${esc(d.desc)}</p>` : ''}
</div>`

    const photoSection = hasImg
      ? `<div class="hyiv-photo-wrap">
  ${media(d.image, 'hyiv-photo', esc(d.titleLine1))}
  ${overlay}
</div>`
      : `<div class="hyiv-photo-wrap no-img">
  ${overlay}
</div>`

    const cards = d.features
      .map(
        (f) => `<div class="hyiv-card">
  <div class="hyiv-icon">${icon(f.icon)}</div>
  <span class="hyiv-label">${esc(f.label)}</span>
</div>`,
      )
      .join('\n')

    return `<section class="hyiv">
  ${photoSection}
  <div class="hyiv-banner">
    <div class="hyiv-grid">
      ${cards}
    </div>
  </div>
</section>`
  },
})
