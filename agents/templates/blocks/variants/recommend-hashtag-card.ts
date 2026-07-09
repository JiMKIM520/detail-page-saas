/** RECOMMEND 아키타입: recommend-hashtag-card.
 *  피그마 354_추천_09 구조 흡수 — 반원 상단 장식 + 2색 타이틀 + 해시태그 라운드 배지 행 + 체크리스트 카드.
 *  원본 모바일(860px) → 데스크톱 872px 재구성. 이미지 슬롯 1개(제품 컷, optional). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  titleLine1: z.string().min(1),              // 상단 타이틀 라인 (잉크 색, br/em 허용)
  titleLine2: z.string().min(1),              // 하단 강조 타이틀 라인 (액센트 색, br/em 허용)
  subtitle: z.string().optional(),            // 타이틀 아래 설명 한 줄 (순수 텍스트)
  tags: z.array(z.string().min(1)).min(1).max(6),  // 해시태그 배지 목록 (# 포함 입력, 예: "#HACCP인증")
  image: z.string().optional(),              // 제품 이미지 url — 브리프에 이미지가 있을 때만
  items: z.array(z.string().min(1)).min(2).max(8), // 체크리스트 항목 (순수 텍스트)
  // 수치·후기성 콘텐츠: 브리프에 근거 있을 때만 채운다
  badge: z.string().optional(),              // 상단 아치 위 소형 강조 뱃지 문구 (예: "수의영양학 박사 설계")
})
type Data = z.infer<typeof schema>

export const recommendHashtagCard = defineBlock<Data>({
  id: 'recommend-hashtag-card',
  archetype: 'recommend',
  styleTags: ['warm', 'playful', 'food', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '추천 대상 소개 블록. 앰버 반원 아치 상단 장식 + 2색(잉크/액센트) 2행 타이틀 + 해시태그 pill 배지 행 + 제품 이미지(optional) + 흰 카드 체크리스트. 식품·펫·헬스케어 카테고리에 적합.',
  schema,
  css: `
/* ── 최상위 ── */
.rhtc{position:relative;background:var(--bg);overflow:hidden;padding-bottom:60px}

/* ── 반원 아치 배경 장식 (상단) ── */
.rhtc-arch{
  position:relative;
  background:var(--paper);
  margin:0 auto;
  padding:0 var(--pad-x,56px) 48px;
  border-radius:0 0 calc(var(--r-scale,1)*200px) calc(var(--r-scale,1)*200px)/0 0 calc(var(--r-scale,1)*80px) calc(var(--r-scale,1)*80px);
}

/* ── 선택 뱃지 (아치 상단 중앙) ── */
.rhtc-badge{
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-size:13px;
  font-weight:800;
  letter-spacing:.04em;
  padding:6px 20px;
  border-radius:999px;
  margin-bottom:20px;
}
.rhtc-badge-wrap{text-align:center;padding-top:44px}

/* ── 아이콘 장식 (반원 내부 상단) ── */
.rhtc-deco{
  display:flex;
  justify-content:center;
  padding-top:40px;
  margin-bottom:16px;
}
.rhtc-deco svg{width:64px;height:64px;color:var(--accent)}

/* ── 2색 타이틀 ── */
.rhtc-title{text-align:center;line-height:1.12;margin-bottom:8px}
.rhtc-t1{
  display:block;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(26px,4vw,42px);
  color:var(--ink);
  line-height:1.2;
}
.rhtc-t1 .em{color:var(--accent)}
.rhtc-t2{
  display:block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(38px,6vw,64px);
  color:var(--accent);
  line-height:1.08;
}
.rhtc-t2 .em{color:var(--ink)}

/* ── 부제 ── */
.rhtc-sub{
  text-align:center;
  font-size:clamp(14px,1.8vw,18px);
  font-weight:500;
  color:var(--ink-2);
  margin-top:14px;
  line-height:1.6;
}

/* ── 해시태그 배지 행 ── */
.rhtc-tags{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:10px;
  margin-top:30px;
}
.rhtc-tag{
  background:var(--accent);
  color:var(--ink);
  font-size:clamp(13px,1.6vw,17px);
  font-weight:700;
  padding:10px 22px;
  border-radius:999px;
  white-space:nowrap;
}

/* ── 제품 이미지 ── */
.rhtc-img-wrap{
  margin:36px auto 0;
  width:min(520px,90%);
}
.rhtc-img{
  width:100%;
  aspect-ratio:1/0.92;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*24px));
  display:block;
}

/* ── 체크리스트 ── */
.rhtc-list{
  margin:36px var(--pad-x,56px) 0;
  display:flex;
  flex-direction:column;
  gap:12px;
}
.rhtc-item{
  display:flex;
  align-items:center;
  gap:14px;
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*10px);
  padding:18px 22px;
  box-shadow:0 2px 8px -4px rgba(42,33,24,.12);
}
.rhtc-check{
  flex:0 0 28px;
  width:28px;
  height:28px;
  color:var(--accent);
}
.rhtc-item-text{
  font-size:clamp(14px,1.7vw,17px);
  font-weight:500;
  color:var(--ink);
  line-height:1.5;
}
`,
  render: (d, { esc, richSafe }) => {
    const decoSvg = `<svg viewBox="0 0 64 52" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 44 C8 24 20 8 32 4 C44 8 56 24 56 44"/>
  <path d="M20 44 C20 32 25 20 32 16 C39 20 44 32 44 44"/>
  <line x1="8" y1="44" x2="56" y2="44"/>
</svg>`

    const checkSvg = `<svg class="rhtc-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`

    return `
<section class="rhtc">
  <div class="rhtc-arch">
    ${d.badge ? `<div class="rhtc-badge-wrap"><span class="rhtc-badge">${esc(d.badge)}</span></div>` : ''}
    <div class="rhtc-deco">${decoSvg}</div>
    <h2 class="rhtc-title">
      <span class="rhtc-t1">${richSafe(d.titleLine1)}</span>
      <span class="rhtc-t2">${richSafe(d.titleLine2)}</span>
    </h2>
    ${d.subtitle ? `<p class="rhtc-sub">${esc(d.subtitle)}</p>` : ''}
    <div class="rhtc-tags">
      ${d.tags.map(tag => `<span class="rhtc-tag">${esc(tag)}</span>`).join('\n      ')}
    </div>
    ${d.image
      ? `<div class="rhtc-img-wrap">${media(d.image, 'rhtc-img', '제품 이미지')}</div>`
      : ''}
  </div>
  <ul class="rhtc-list">
    ${d.items.map(item => `<li class="rhtc-item">${checkSvg}<span class="rhtc-item-text">${esc(item)}</span></li>`).join('\n    ')}
  </ul>
</section>`
  },
})
