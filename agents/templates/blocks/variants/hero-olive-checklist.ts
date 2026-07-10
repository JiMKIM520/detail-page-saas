/** HERO 아키타입: hero-olive-checklist.
 *  피그마 204_인트로_39 흡수 — 올리브 그린 다크 배경 + 상단 영문 배지 필 + 제품명 + 부제 +
 *  대형 원형 제품 누끼 이미지 + 하단 2색 교대 체크리스트 4행 패턴 재구성.
 *  이미지 부재 시 원형 프레임 제거(noimg-safe) → 텍스트+체크리스트 단독 렌더로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge:    z.string().optional(),          // 영문 배지 라벨 (예: "Scalp Reset Shampoo")
  title:    z.string().min(1),              // 제품명 대형 헤드라인 (em,br)
  subtitle: z.string().optional(),          // 핵심 가치 한 줄 (em,br)
  body:     z.string().optional(),          // 보조 설명 2~3줄
  image:    z.string().optional(),          // 원형 제품 누끼/투명 이미지 (url)
  items:    z.array(
    z.object({ text: z.string().min(1) })   // 체크리스트 항목 텍스트
  ).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const heroOliveChecklist = defineBlock<Data>({
  id:        'hero-olive-checklist',
  archetype: 'hero',
  styleTags: ['dark', 'beauty', 'food', 'nature', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '올리브 그린 다크 배경 히어로. 영문 배지 필(pill) + 대형 제품명 + 부제 + 원형 대형 누끼 이미지 + 하단 2색 교대 체크리스트(체크 아이콘+항목). 뷰티/식품 브랜드의 첫 인상 섹션에 최적. 이미지 없으면 텍스트+리스트 단독 강등 렌더.',
  schema,
  css: `
.hsyw{
  background:var(--brand);
  color:var(--bg);
  padding:48px 0 0;
  text-align:center;
}
/* ── 다크 섹션 em 색상 오버라이드 (CRITICAL — richSafe 출력 내 .em 대비 보장) */
.hsyw .em{color:var(--em-dark,#FFF7EA)}

/* ── 배지 필 */
.hsyw-badge-wrap{padding:0 var(--pad-x,56px) 0;margin-bottom:16px}
.hsyw-badge{
  display:inline-block;
  background:color-mix(in srgb,var(--bg) 92%,transparent);
  color:var(--brand);
  font-family:var(--font-lat),'Cormorant Garamond',serif;
  font-size:17px;
  font-weight:600;
  letter-spacing:.06em;
  padding:8px 24px;
  border-radius:999px;
}

/* ── 타이틀 영역 */
.hsyw-hd{padding:0 var(--pad-x,56px)}
.hsyw-div{
  width:calc(100% - 2*var(--pad-x,56px));
  height:1px;
  background:color-mix(in srgb,var(--bg) 28%,transparent);
  margin:14px auto 18px;
}
.hsyw-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(44px,8vw,80px);
  line-height:1.08;
  color:var(--bg);
  letter-spacing:-.02em;
}
.hsyw-title .em{color:var(--em-dark,#FFF7EA)}
.hsyw-subtitle{
  margin-top:14px;
  font-size:clamp(18px,3.2vw,36px);
  font-weight:500;
  color:color-mix(in srgb,var(--bg) 90%,transparent);
  line-height:1.35;
}
.hsyw-subtitle .em{color:var(--em-dark,#FFF7EA)}
.hsyw-body{
  margin-top:12px;
  font-size:clamp(15px,2.4vw,28px);
  font-weight:400;
  color:color-mix(in srgb,var(--bg) 60%,transparent);
  line-height:1.6;
}

/* ── 원형 제품 이미지 */
.hsyw-img-wrap{
  margin:36px auto 0;
  width:min(760px,calc(100% - 2*var(--pad-x,56px)));
  aspect-ratio:1/1;
  border-radius:var(--shape-photo,50%);
  overflow:hidden;
  background:color-mix(in srgb,var(--bg) 8%,transparent);
}
.hsyw-img-wrap img{
  width:100%;
  height:100%;
  object-fit:contain;
  border-radius:inherit;
}
/* noimg-safe: 이미지 부재 시 프레임 자체를 숨겨 빈 원형 노출 방지 */
.hsyw-img-wrap.hsyw-noimg{display:none}

/* ── 체크리스트 */
.hsyw-list{margin-top:32px}
.hsyw-item{
  display:flex;
  align-items:center;
  gap:18px;
  padding:20px var(--pad-x,56px);
  font-family:var(--font-display);
  font-size:clamp(18px,3.2vw,40px);
  font-weight:600;
  color:#1f2415;
  line-height:1.3;
}
/* 홀수 행(1,3,5…): 진한 올리브 */
.hsyw-item:nth-child(odd){
  background:var(--accent);
}
/* 짝수 행(2,4,6…): 연한 올리브 */
.hsyw-item:nth-child(even){
  background:color-mix(in srgb,var(--accent) 55%,#fff);
}
.hsyw-check{
  flex:0 0 32px;
  width:32px;
  height:32px;
  color:#1f2415;
}
.hsyw-check svg{width:100%;height:100%}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="hsyw">
  ${d.badge ? `<div class="hsyw-badge-wrap"><span class="hsyw-badge">${esc(d.badge)}</span></div>` : ''}
  <div class="hsyw-hd">
    <h2 class="hsyw-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<div class="hsyw-div"></div><p class="hsyw-subtitle">${richSafe(d.subtitle)}</p>` : ''}
    ${d.body ? `<p class="hsyw-body">${esc(d.body)}</p>` : ''}
  </div>
  <div class="hsyw-img-wrap${hasImg ? '' : ' hsyw-noimg'}">${media(d.image, '', '제품 이미지')}</div>
  <div class="hsyw-list">
    ${d.items.map(item => `
    <div class="hsyw-item">
      <span class="hsyw-check">${icon('check')}</span>
      <span>${esc(item.text)}</span>
    </div>`).join('')}
  </div>
</section>`
  },
})
