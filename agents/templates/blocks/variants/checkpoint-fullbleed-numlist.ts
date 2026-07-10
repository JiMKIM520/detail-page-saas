/** CHECKPOINT 아키타입: checkpoint-fullbleed-numlist
 *  066_제품특징_01 패턴 재구성.
 *  전폭 제품 사진(상단) + "check point" 대형 ExtraBold 라틴 헤더 + 대형 라이트웨이트 번호를
 *  좌측 장식 타이포로 배치한 3항목 수직 리스트. 번호가 단순 인덱스를 넘어 시각적 포인트로 전환되는
 *  체크포인트 요약 블록. 라이트 배경. noimg-safe: 이미지 없으면 상단 사진 프레임 생략. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 헤더 라틴 텍스트. 기본 "check point". 순수 텍스트. */
  header: z.string().optional(),
  /** 상단 전폭 제품 이미지 (url). 없으면 이미지 영역 전체 생략. */
  image: z.string().optional(),
  /** 체크포인트 항목 2~5개. */
  items: z
    .array(
      z.object({
        /** 항목 제목 (em 허용). 강조 색상으로 표시. */
        label: z.string().min(1),
        /** 항목 설명 (em/br 허용). 보조 텍스트. */
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const checkpointFullbleedNumlist = defineBlock<Data>({
  id: 'checkpoint-fullbleed-numlist',
  archetype: 'checkpoint',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '전폭 제품 사진(상단) + "check point" 대형 ExtraBold 헤더 + 대형 라이트웨이트 번호를 좌측 장식 타이포로 배치한 수직 체크포인트 리스트. 번호가 항목 구분자이자 시각 포인트. 뷰티·식품·전자제품 범용.',
  schema,
  css: `
.ctbj{background:var(--bg);color:var(--ink);padding-bottom:64px}

/* ── 상단 전폭 이미지 ── */
.ctbj-img{width:100%;aspect-ratio:860/520;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,var(--paper));position:relative}
.ctbj-img img{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0px)}
.ctbj-img .ph{display:none!important}

/* ── 헤더 "check point" ── */
.ctbj-hd{padding:46px var(--pad-x,56px) 0;text-align:center}
.ctbj-hd-txt{font-family:var(--font-display),var(--font-lat),'Cormorant Garamond',serif;font-weight:800;font-size:clamp(52px,8.5vw,90px);color:var(--accent);letter-spacing:-.02em;line-height:1}

/* ── 리스트 ── */
.ctbj-list{margin-top:36px;padding:0 var(--pad-x,56px);display:flex;flex-direction:column;gap:0}

/* ── 개별 항목 ── */
.ctbj-item{display:flex;align-items:flex-start;gap:12px;padding:26px 0;border-top:1px solid var(--line)}
.ctbj-item:last-child{border-bottom:1px solid var(--line)}

/* 장식 번호 — 라이트웨이트 대형 타이포 */
.ctbj-num{flex:0 0 88px;width:88px;text-align:center;font-family:var(--font-display),var(--font-lat),'Cormorant Garamond',serif;font-weight:300;font-size:clamp(72px,11vw,108px);color:var(--accent);line-height:.9;letter-spacing:-.02em;user-select:none;padding-top:2px}

/* 텍스트 영역 */
.ctbj-body{flex:1;display:flex;flex-direction:column;gap:8px;padding-top:6px}
.ctbj-label{font-family:var(--font-display);font-weight:700;font-size:clamp(18px,2.8vw,22px);color:var(--accent);line-height:1.2}
.ctbj-label .em{color:var(--accent-d)}
.ctbj-text{font-size:clamp(14px,1.9vw,16px);font-weight:400;color:var(--ink-2);line-height:1.78}
.ctbj-text .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const hasImage = typeof d.image === 'string' && d.image.length > 0
    const headerText = d.header ?? 'check point'

    return `
<section class="ctbj">
  ${hasImage ? `<div class="ctbj-img">${media(d.image, '', '제품 이미지')}</div>` : ''}
  <div class="ctbj-hd">
    <p class="ctbj-hd-txt">${esc(headerText)}</p>
  </div>
  <ul class="ctbj-list" role="list">
    ${d.items
      .map(
        (item, i) => `
    <li class="ctbj-item">
      <span class="ctbj-num" aria-hidden="true">${i + 1}</span>
      <div class="ctbj-body">
        <p class="ctbj-label">${richSafe(item.label)}</p>
        <p class="ctbj-text">${richSafe(item.text)}</p>
      </div>
    </li>`,
      )
      .join('')}
  </ul>
</section>`
  },
})
