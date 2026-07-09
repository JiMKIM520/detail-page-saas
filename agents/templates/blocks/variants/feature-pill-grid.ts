/** FEATURE 아키타입: feature-pill-grid.
 *  172_제품소개_09 구조 흡수:
 *  포인트 라벨 행 + 풀폭 사진 + 그라데이션 pill 소제목박스 + 구분선 + 설명 텍스트 + 2×2 라운드 카드 그리드(원형 아이콘+텍스트).
 *  noimg-safe: 이미지 미제공 시 사진 프레임을 숨기고 pill 소제목부터 시작하는 텍스트 전용 레이아웃으로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const ICON_NAMES_CONST = [
  'wheat', 'drop', 'clock', 'badge', 'snow', 'check', 'fryer', 'oven', 'star',
  'heart', 'gift', 'truck', 'shield', 'leaf', 'trophy', 'thumb', 'fire',
  'person', 'search', 'pin', 'box', 'calendar', 'card', 'won', 'bulb', 'gear',
  'camera', 'phone', 'bolt', 'thermometer', 'target', 'store', 'doc', 'sprout', 'bell',
] as const

const schema = z.object({
  /** 왼쪽 포인트 라벨 (예: "제품소개") — em 허용 */
  sectionLabel: z.string().min(1),
  /** 오른쪽 제품명 레이블 (예: "그린 에코 물티슈") — 선택 */
  productLabel: z.string().optional(),
  /** 풀폭 대표 이미지 URL — 없으면 사진 행 전체 생략(noimg-safe) */
  image: z.string().optional(),
  /** 그라데이션 pill 소제목 (예: "레이온 100% 원단의 특성") — em/br 허용 */
  pillTitle: z.string().min(1),
  /** pill 아래 컬러 보조 텍스트 (예: "목재 펄프에서 추출한 셀룰로오스 기반 섬유") — em 허용 */
  subHeadline: z.string().optional(),
  /** 본문 설명 (em/br 허용) */
  desc: z.string().optional(),
  /** 2×2 특성 카드 (4개 고정) */
  cards: z.array(z.object({
    icon: z.enum(ICON_NAMES_CONST),
    text: z.string().min(1),
  })).length(4),
})
type Data = z.infer<typeof schema>

export const featurePillGrid = defineBlock<Data>({
  id: 'feature-pill-grid',
  archetype: 'feature',
  styleTags: ['light', 'gradient', 'grid', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '특성 소개 블록. 포인트 라벨 행 + 풀폭 사진(선택) + 그라데이션 pill 소제목박스 + 구분선 + 컬러 보조 헤드라인 + 본문 + 2×2 원형 아이콘 라운드 카드 그리드. 이미지 미제공 시 사진 행 생략(noimg-safe).',
  schema,
  css: `
.fepx{background:var(--bg);color:var(--ink);padding-bottom:52px}
/* 포인트 라벨 행 */
.fepx-hd{display:flex;align-items:center;justify-content:space-between;padding:20px var(--pad-x,56px)}
.fepx-section-label{font-family:var(--font-display);font-weight:600;font-size:28px;color:var(--accent-d);line-height:1.2}
.fepx-section-label .em{color:var(--accent)}
.fepx-product-label{font-family:var(--font-body);font-weight:400;font-size:20px;color:var(--accent);text-align:right}
/* 풀폭 사진 */
.fepx-photo-wrap{padding:0 var(--pad-x,56px)}
.fepx-photo{width:100%;aspect-ratio:760/850;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));display:block}
.fepx-photo.ph{display:none!important}
/* 텍스트 영역 */
.fepx-body{padding:0 var(--pad-x,56px)}
/* 그라데이션 pill 소제목 박스 */
.fepx-pill-wrap{margin-top:28px;display:flex;justify-content:center}
.fepx-pill{display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(90deg,var(--accent-d),var(--accent));border-radius:999px;padding:14px 40px}
.fepx-pill-text{font-family:var(--font-display);font-weight:700;font-size:30px;color:#fff;line-height:1.2;text-align:center}
.fepx-pill-text .em{color:#ffe;font-weight:800}
/* 구분선 */
.fepx-rule{margin:18px auto 0;width:calc(100% - 80px);height:1px;background:var(--line)}
/* 보조 헤드라인 */
.fepx-subhead{margin-top:16px;font-family:var(--font-display);font-weight:700;font-size:26px;color:var(--accent);text-align:center;line-height:1.3}
.fepx-subhead .em{color:var(--accent-d)}
/* 본문 */
.fepx-desc{margin-top:12px;font-family:var(--font-body);font-weight:400;font-size:18px;color:var(--ink);text-align:center;line-height:1.72}
.fepx-desc .em{color:var(--accent-d);font-weight:700}
/* 2×2 카드 그리드 */
.fepx-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}
.fepx-card{background:color-mix(in srgb,var(--accent) 12%,var(--bg));border-radius:calc(var(--r-scale,1)*60px);padding:28px 16px 24px;display:flex;flex-direction:column;align-items:center;gap:14px}
/* 원형 아이콘 배지 */
.fepx-icon-wrap{width:80px;height:80px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fepx-icon-wrap svg{width:38px;height:38px;color:var(--accent)}
/* 카드 텍스트 */
.fepx-card-text{font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--accent-d);text-align:center;line-height:1.4}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImage = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="fepx">
  <div class="fepx-hd">
    <span class="fepx-section-label">${richSafe(d.sectionLabel)}</span>
    ${d.productLabel ? `<span class="fepx-product-label">${esc(d.productLabel)}</span>` : ''}
  </div>
  ${hasImage ? `<div class="fepx-photo-wrap">${media(d.image, 'fepx-photo', esc(d.sectionLabel))}</div>` : ''}
  <div class="fepx-body">
    <div class="fepx-pill-wrap">
      <div class="fepx-pill">
        <span class="fepx-pill-text">${richSafe(d.pillTitle)}</span>
      </div>
    </div>
    <div class="fepx-rule"></div>
    ${d.subHeadline ? `<p class="fepx-subhead">${richSafe(d.subHeadline)}</p>` : ''}
    ${d.desc ? `<p class="fepx-desc">${richSafe(d.desc)}</p>` : ''}
    <div class="fepx-grid">
      ${d.cards.map(c => `
      <div class="fepx-card">
        <div class="fepx-icon-wrap">${icon(c.icon)}</div>
        <span class="fepx-card-text">${esc(c.text)}</span>
      </div>`).join('')}
    </div>
  </div>
</section>`
  },
})
