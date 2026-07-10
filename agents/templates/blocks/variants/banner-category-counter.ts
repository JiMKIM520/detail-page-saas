/** BANNER 아키타입: banner-category-counter
 *  와이드 카테고리 섹션 구분자. 대형 카테고리명(좌) + 원형 도트·수량·단위 레이블(우).
 *  이모지 없음 — 아이콘 슬롯으로 대체. 이미지 슬롯 없음(noimg-safe).
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 카테고리명 — 대형 타이포로 표시. (em) 허용: 강조 키워드에 accent 색. */
  label: z.string().min(1),
  /** 수량 숫자 — 에셋 개수, 상품 수 등. */
  count: z.number().int().min(0),
  /** 수량 단위 레이블 (예: ITEMS · 구성 · ASSETS). 생략 시 숨김. */
  unit: z.string().optional(),
  /** 카테고리 설명 한 줄 — 섹션 역할을 보조 설명 (optional). */
  sub: z.string().optional(),
})

type Data = z.infer<typeof schema>

export const bannerCategoryCounter = defineBlock<Data>({
  id: 'banner-category-counter',
  archetype: 'banner',
  styleTags: ['light', 'editorial', 'minimal'],
  imageSlots: 0,
  describe:
    '와이드 카테고리 섹션 구분자 배너. 좌측 대형 카테고리명 + 우측 원형 액센트 도트·수량 숫자·단위 레이블을 한 줄에 배치. 상세페이지 내 섹션 헤더 또는 상품 구성 소개 타이틀로 사용.',
  schema,
  css: `
.bazt{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:clamp(28px,5vw,56px) var(--pad-x,56px) clamp(24px,4vw,48px);
  min-height:clamp(100px,16vw,160px);
  background:var(--bg);
  border-bottom:1.5px solid var(--line);
}
.bazt-label{
  font-family:var(--font-display);
  font-size:clamp(36px, 5.8vw, 80px);
  font-weight:700;
  line-height:1.08;
  letter-spacing:-.02em;
  color:var(--ink);
  flex:1 1 auto;
  min-width:0;
}
.bazt-label .em{color:var(--accent-d)}
.bazt-sub{
  margin-top:6px;
  font-size:14px;
  font-weight:500;
  color:var(--muted);
  letter-spacing:.01em;
}
.bazt-counter{
  display:flex;
  align-items:center;
  gap:10px;
  flex:0 0 auto;
}
.bazt-dot{
  width:14px;
  height:14px;
  border-radius:50%;
  background:var(--accent);
  flex-shrink:0;
}
.bazt-num{
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-size:clamp(40px, 5.2vw, 72px);
  font-weight:700;
  line-height:1;
  color:var(--ink);
  letter-spacing:-.03em;
}
.bazt-unit{
  font-size:clamp(11px, 1.2vw, 15px);
  font-weight:700;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ink-2);
  align-self:flex-end;
  padding-bottom:.18em;
}
`,
  render: (d, { richSafe, esc }) => `
<section class="bazt">
  <div class="bazt-left">
    <p class="bazt-label">${richSafe(d.label)}</p>
    ${d.sub ? `<p class="bazt-sub">${esc(d.sub)}</p>` : ''}
  </div>
  <div class="bazt-counter">
    <span class="bazt-dot" aria-hidden="true"></span>
    <span class="bazt-num">${esc(String(d.count))}</span>
    ${d.unit ? `<span class="bazt-unit">${esc(d.unit)}</span>` : ''}
  </div>
</section>`,
})
