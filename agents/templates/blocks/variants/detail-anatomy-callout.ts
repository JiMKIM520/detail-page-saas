/** DETAIL 아키타입: detail-anatomy-callout
 *  제품 중앙 세로 이미지에서 6방향 선이 뻗어 원형 디테일 컷 + 텍스트 라벨이 플로팅하는
 *  해부도식 콜아웃 구성. 상단 2행 대형 헤드라인 + 설명, 하단 4행 원형아이콘+제목+설명 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const calloutSchema = z.object({
  /** 콜아웃 라벨 (em 허용) */
  label: z.string().min(1),
  /** 원형 디테일 컷 이미지 url (선택) */
  image: z.string().optional(),
  /**
   * 콜아웃 위치 (제품 이미지 기준 좌/우, 위→아래 순 3개씩)
   * left-top | left-mid | left-bot | right-top | right-mid | right-bot
   */
  side: z.enum(['left-top', 'left-mid', 'left-bot', 'right-top', 'right-mid', 'right-bot']),
})

const featureSchema = z.object({
  /** 기능 아이콘 이름 (ICON_NAMES 35종) */
  icon: z.string().min(1).optional(),
  /** 기능 제목 (em 허용) */
  title: z.string().min(1),
  /** 기능 설명 (em 허용) */
  desc: z.string().min(1),
})

const schema = z.object({
  /** 상단 헤드라인 1행 (em/br 허용) */
  headLine1: z.string().min(1),
  /** 상단 헤드라인 2행 (em/br 허용) */
  headLine2: z.string().min(1),
  /** 헤드라인 아래 설명 (em/br 허용) */
  desc: z.string().optional(),
  /** 중앙 제품 이미지 (세로형, 누끼 또는 실물 사진) */
  productImage: z.string().optional(),
  /** 해부도 콜아웃 (최대 6개, 좌3·우3 배분 권장) */
  callouts: z.array(calloutSchema).min(2).max(6),
  /** 하단 기능 리스트 (2~4개) */
  features: z.array(featureSchema).min(2).max(4),
  /** 배경 강조색 (선택, 미지정 시 --bg 사용) */
  bgOverride: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 콜아웃 위치별 레이아웃 메타 */
const SLOT_META: Record<
  string,
  { col: 'left' | 'right'; yPercent: number; lineFrom: string; lineTo: string }
> = {
  'left-top':  { col: 'left',  yPercent: 20, lineFrom: '100% 50%', lineTo: '0% 50%' },
  'left-mid':  { col: 'left',  yPercent: 45, lineFrom: '100% 50%', lineTo: '0% 50%' },
  'left-bot':  { col: 'left',  yPercent: 70, lineFrom: '100% 50%', lineTo: '0% 50%' },
  'right-top': { col: 'right', yPercent: 20, lineFrom: '0% 50%', lineTo: '100% 50%' },
  'right-mid': { col: 'right', yPercent: 45, lineFrom: '0% 50%', lineTo: '100% 50%' },
  'right-bot': { col: 'right', yPercent: 70, lineFrom: '0% 50%', lineTo: '100% 50%' },
}

export const detailAnatomyCallout = defineBlock<Data>({
  id: 'detail-anatomy-callout',
  archetype: 'detail',
  styleTags: ['light', 'technical', 'editorial', 'noimg-safe'],
  imageSlots: 7, // 중앙 제품 1 + 원형 디테일 컷 최대 6
  describe:
    '해부도식 콜아웃 상세 블록. 중앙 세로 제품 이미지에서 좌우 6방향으로 선이 뻗어 원형 디테일 컷+라벨이 플로팅. 상단 2행 대형 헤드라인+설명, 하단 4행 원형아이콘+기능 리스트. 기술제품·주방용품·뷰티기기 특징 강조에 최적.',
  schema,
  css: `
.djav{background:var(--bg);color:var(--ink);padding:0 0 72px}
/* ── 상단 헤드라인 영역 ── */
.djav-hd{text-align:center;padding:64px var(--pad-x,56px) 56px}
.djav-hl1{font-family:var(--font-display);font-weight:800;font-size:60px;color:var(--accent);letter-spacing:-.025em;line-height:1.08}
.djav-hl2{font-family:var(--font-display);font-weight:500;font-size:60px;color:var(--ink);letter-spacing:-.025em;line-height:1.08;margin-top:4px}
.djav-hdesc{margin-top:24px;font-size:19px;font-weight:400;line-height:1.75;color:var(--ink-2);max-width:640px;margin-left:auto;margin-right:auto}
.djav-hdesc .em{color:var(--accent);font-weight:700}
/* ── 해부도 영역 ── */
.djav-anatomy{position:relative;width:100%;padding:0 var(--pad-x,56px);box-sizing:border-box;display:grid;grid-template-columns:1fr 200px 1fr;align-items:start;gap:0 0;min-height:640px}
/* 좌/우 콜아웃 열 */
.djav-col{display:flex;flex-direction:column;gap:0;position:relative}
.djav-col-l{align-items:flex-end;padding-right:24px}
.djav-col-r{align-items:flex-start;padding-left:24px}
/* 콜아웃 카드 */
.djav-co{display:flex;flex-direction:column;align-items:center;gap:10px;margin:28px 0;position:relative}
.djav-col-l .djav-co{align-items:flex-end}
.djav-col-r .djav-co{align-items:flex-start}
/* 원형 디테일 컷 */
.djav-circle{width:88px;height:88px;border-radius:50%;overflow:hidden;border:2.5px solid var(--accent);background:color-mix(in srgb,var(--accent) 8%,var(--paper,#fff));flex-shrink:0}
.djav-circle img,.djav-circle .ph{width:100%;height:100%;object-fit:cover}
/* noimg-safe: 이미지 없으면 circle을 숨기고 라벨만 표시 */
.djav-circle.ph-wrap:has(.ph){display:none}
/* 콜아웃 라벨 — 배경 패널로 원 이미지와 시각 분리 */
.djav-co-label{font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--accent);text-align:center;line-height:1.4;letter-spacing:.01em;background:color-mix(in srgb,var(--paper,#fff) 92%,transparent);padding:4px 8px;border-radius:calc(var(--r-scale,1)*6px);max-width:110px;white-space:pre-line}
.djav-col-l .djav-co-label{text-align:right}
.djav-col-r .djav-co-label{text-align:left}
.djav-co-label .em{color:var(--ink);font-weight:800}
/* 콜아웃 연결선 (SVG 절대 포지션으로 오버레이) */
.djav-lines{position:absolute;inset:0;pointer-events:none;width:100%;height:100%}
/* 중앙 제품 이미지 */
.djav-prod{position:relative;display:flex;justify-content:center;align-items:flex-start}
.djav-prod-img{width:200px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));object-fit:cover;display:block}
/* noimg-safe: 제품 이미지 없으면 틴트 패널로 강등 */
.djav-prod-img.ph{display:flex!important;width:200px;height:540px;background:color-mix(in srgb,var(--accent) 7%,var(--paper,#fff));border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px))}
/* ── 하단 기능 리스트 ── */
.djav-feats{display:grid;grid-template-columns:repeat(2,1fr);gap:20px 32px;padding:52px var(--pad-x,56px) 0;margin-top:52px;border-top:1px solid var(--line)}
.djav-feat{display:flex;align-items:flex-start;gap:18px}
.djav-feat-icon{width:52px;height:52px;flex-shrink:0;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff}
.djav-feat-icon svg{width:26px;height:26px;stroke:#fff;fill:none}
.djav-feat-body{}
.djav-feat-title{font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--ink);line-height:1.3}
.djav-feat-title .em{color:var(--accent)}
.djav-feat-desc{margin-top:5px;font-size:14px;color:var(--ink-2);line-height:1.65}
.djav-feat-desc .em{color:var(--accent);font-weight:700}
/* 기능 1열 (2개) 레이아웃 */
.djav-feats.cols1{grid-template-columns:1fr}
`,
  render: (d, { esc, richSafe, icon }) => {
    // 콜아웃을 좌/우로 분리
    const left  = d.callouts.filter(c => c.side.startsWith('left'))
    const right = d.callouts.filter(c => c.side.startsWith('right'))

    const renderCallout = (c: typeof d.callouts[number]) => {
      const hasImg = typeof c.image === 'string' && c.image.length > 0
      return `
<div class="djav-co">
  <div class="djav-circle ph-wrap">${media(c.image, 'djav-circle-img', esc(c.label))}</div>
  <div class="djav-co-label">${richSafe(c.label)}</div>
</div>`
    }

    // 선 렌더: 각 콜아웃 측 기준 고정 위치에서 중앙으로
    // SVG는 anatomy grid 위에 absolute 오버레이 — 단순 장식선, 의미 전달은 라벨이 담당
    const lineCount = d.callouts.length
    const svgLines = d.callouts.map((c, i) => {
      const meta = SLOT_META[c.side] ?? SLOT_META['left-top']
      const isLeft = meta.col === 'left'
      // 좌측: x1=33%, 우측: x1=67% → 중앙(50%)으로
      const x1 = isLeft ? '33%' : '67%'
      const x2 = '50%'
      // y: 콜아웃 위치별 비율
      const y1 = `${meta.yPercent}%`
      const y2 = `${meta.yPercent}%`
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 3" opacity=".55"/>`
    }).join('\n    ')

    const featColClass = d.features.length <= 2 ? ' cols1' : ''
    const renderFeature = (f: typeof d.features[number], _i: number) => `
<div class="djav-feat">
  <div class="djav-feat-icon">${f.icon ? icon(f.icon) : icon('check')}</div>
  <div class="djav-feat-body">
    <div class="djav-feat-title">${richSafe(f.title)}</div>
    <div class="djav-feat-desc">${richSafe(f.desc)}</div>
  </div>
</div>`

    return `
<section class="djav">
  <div class="djav-hd">
    <div class="djav-hl1">${richSafe(d.headLine1)}</div>
    <div class="djav-hl2">${richSafe(d.headLine2)}</div>
    ${d.desc ? `<p class="djav-hdesc">${richSafe(d.desc)}</p>` : ''}
  </div>

  <div class="djav-anatomy">
    <svg class="djav-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      ${svgLines}
    </svg>

    <div class="djav-col djav-col-l">
      ${left.map(renderCallout).join('')}
    </div>

    <div class="djav-prod">
      ${media(d.productImage, 'djav-prod-img', '제품 이미지')}
    </div>

    <div class="djav-col djav-col-r">
      ${right.map(renderCallout).join('')}
    </div>
  </div>

  <div class="djav-feats${featColClass}">
    ${d.features.map(renderFeature).join('')}
  </div>
</section>`
  },
})
