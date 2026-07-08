/** DETAIL 아키타입: package-numbered-option-selector.
 *  [끝판왕] 상품 구성 #13 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + 중앙정렬 헤드라인 + 4-column equal-width 넘버드 옵션 카드 그리드.
 *  카드: 상단 번호 레이블(01–04) → 이미지 슬롯 → 제품명 + 불릿 피처 리스트.
 *  하나의 카드가 active 상태(filled accent 배경 + 흰 텍스트). 나머지는 paper 배경 + ink 텍스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  /** 카드 번호 레이블 (예: "01", "02"). 미입력 시 인덱스에서 자동 생성 */
  label: z.string().optional(),
  /** 제품/옵션 이름 */
  name: z.string().min(1),
  /** 카드 이미지 URL */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 주요 특징 불릿 리스트 (1~4개) */
  features: z.array(z.string().min(1)).min(1).max(4),
  /** 이 카드를 active(선택) 상태로 표시할지 여부 */
  active: z.boolean().optional(),
})

const schema = z.object({
  /** 섹션 상단 대제목 (em/br 허용) */
  title: z.string().min(1),
  /** 서브 설명 (선택) */
  subtitle: z.string().optional(),
  /** 옵션 카드 목록 (2~4개; 4개가 기본 패턴) */
  options: z.array(cardSchema).min(2).max(4),
})

type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const packageNumberedOptionSelector = defineBlock<Data>({
  id: 'package-numbered-option-selector',
  archetype: 'detail',
  styleTags: ['light', 'selector', 'grid', 'package', 'numbered', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성 옵션 선택기. 밝은 배경 + 중앙정렬 헤드라인 + equal-width 4컬럼 넘버드 카드 그리드. 각 카드: 상단 번호(01~04) + 이미지 + 제품명 + 불릿 피처 리스트. 하나의 카드가 filled accent active 상태.',
  schema,
  css: `
/* package-numbered-option-selector — 접두사 pnos- */
.pnos{background:var(--paper);padding:52px 20px 56px;text-align:center;word-break:keep-all}
.pnos-hd{margin-bottom:32px;padding:0 12px}
.pnos-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.5vw,38px);line-height:1.28;letter-spacing:-.02em;color:var(--ink)}
.pnos-title .em{color:var(--accent-d)}
.pnos-sub{margin-top:10px;font-size:15px;color:var(--muted);line-height:1.6}
/* 4-col equal grid */
.pnos-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
/* Card base */
.pnos-card{border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;background:var(--bg);border:2px solid var(--line);display:flex;flex-direction:column;transition:box-shadow .18s}
/* Active card — filled accent */
.pnos-card.is-active{background:var(--accent);border-color:var(--accent)}
/* Number badge row */
.pnos-num{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,4.4vw,28px);letter-spacing:.02em;padding:14px 14px 0;text-align:left;color:var(--accent-d);line-height:1}
.pnos-card.is-active .pnos-num{color:#fff}
/* Image slot */
.pnos-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.pnos-img.ph{width:100%;aspect-ratio:1/1;background:rgba(0,0,0,.055);border:none;border-radius:0;color:var(--muted);font-size:12px}
.pnos-card.is-active .pnos-img.ph{background:rgba(255,255,255,.18);color:rgba(255,255,255,.6)}
/* Card body */
.pnos-body{padding:12px 12px 16px;text-align:left;flex:1;display:flex;flex-direction:column;gap:6px}
.pnos-name{font-family:var(--font-display);font-weight:700;font-size:clamp(13px,2.4vw,15px);color:var(--ink);line-height:1.35}
.pnos-card.is-active .pnos-name{color:#fff}
/* Feature bullet list */
.pnos-feats{list-style:none;display:flex;flex-direction:column;gap:4px;margin-top:2px}
.pnos-feat{font-size:clamp(11px,1.8vw,13px);color:var(--muted);line-height:1.5;padding-left:12px;position:relative}
.pnos-feat::before{content:'#';position:absolute;left:0;font-weight:700;color:var(--accent-d)}
.pnos-card.is-active .pnos-feat{color:rgba(255,255,255,.82)}
.pnos-card.is-active .pnos-feat::before{color:rgba(255,255,255,.9)}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.options
      .map((opt, i) => {
        const isActive = opt.active === true
        const label = esc(opt.label ?? pad2(i + 1))
        const name = esc(opt.name)
        const feats = opt.features
          .map((f) => `<li class="pnos-feat">${esc(f)}</li>`)
          .join('')
        const imgHtml = media(
          opt.image,
          'pnos-img',
          esc(opt.imageAlt ?? opt.name),
        )
        return `<div class="pnos-card${isActive ? ' is-active' : ''}">
  <div class="pnos-num">${label}</div>
  ${imgHtml}
  <div class="pnos-body">
    <div class="pnos-name">${name}</div>
    <ul class="pnos-feats">${feats}</ul>
  </div>
</div>`
      })
      .join('')

    return `
<section class="pnos">
  <div class="pnos-hd">
    <h2 class="pnos-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="pnos-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="pnos-grid">
    ${cards}
  </div>
</section>`
  },
})
