/** HERO 아키타입: hero-sandwich-stack.
 *  피그마 인트로/16 패턴 재구성 — 상단 전면 이미지 + 중앙 웨이트 대비 텍스트 스택
 *  (ExtraLight 서브 → Bold 대형 타이틀 → 수평 룰 → Light 하단 서브) + 하단 전면 이미지.
 *  위아래 두 이미지가 텍스트 블록을 샌드위치로 감싸는 세로 분할 다크 히어로. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  imageTop: z.string().optional(),        // 상단 전면 이미지 (url) — 없을 때 강등 렌더
  imageBottom: z.string().optional(),     // 하단 전면 이미지 (url) — 없을 때 강등 렌더
  subTop: z.string().min(1),              // 상단 서브 카피 (em,br) — ExtraLight 소형
  title: z.string().min(1),              // 대형 타이틀 (em,br) — Bold 대형
  subBottom: z.string().min(1),          // 하단 서브 카피 (em,br) — Light 중형
})
type Data = z.infer<typeof schema>

export const heroSandwichStack = defineBlock<Data>({
  id: 'hero-sandwich-stack',
  archetype: 'hero',
  // noimg-safe: 이미지 부재 시 어두운 그라데이션 패널로 강등, 텍스트 가독성 유지
  styleTags: ['dark', 'editorial', 'food', 'premium', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '다크 샌드위치 히어로. 상단 전면 이미지 + 중앙 웨이트 대비 타이포(ExtraLight 서브→Bold 대제목→수평 룰→Light 서브) + 하단 전면 이미지. 위아래 두 이미지가 텍스트 블록을 감싸는 세로 분할 구조. 프리미엄 식품·뷰티 인트로에 적합.',
  schema,
  css: `
.hdcz{background:var(--bg,#171412);color:#fff;width:100%}

/* ── 상단/하단 이미지 패널 ── */
.hdcz-top,.hdcz-bot{width:100%;overflow:hidden;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))}
.hdcz-top{aspect-ratio:860/1010}
.hdcz-top img,.hdcz-top .ph-panel{width:100%;height:100%;object-fit:cover;display:block}
.hdcz-bot{aspect-ratio:860/1000}
.hdcz-bot img,.hdcz-bot .ph-panel{width:100%;height:100%;object-fit:cover;display:block}

/* 이미지 없을 때 강등: 어두운 그라데이션 패널 */
.hdcz-top .ph-panel{background:linear-gradient(180deg,#2a2018 0%,#1a150f 100%);min-height:320px}
.hdcz-bot .ph-panel{background:linear-gradient(0deg,#2a2018 0%,#1a150f 100%);min-height:300px}

/* ── 텍스트 스택 (중앙 영역) ── */
.hdcz-body{
  background:#171412!important;
  padding:56px var(--pad-x,56px) 60px;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0
}

/* 상단 서브 — ExtraLight */
.hdcz-sub-top{
  font-family:var(--font-display);
  font-weight:200;
  font-size:28px;
  line-height:1.4;
  color:#fff;
  letter-spacing:.01em;
  margin-bottom:18px
}
.hdcz-sub-top .em{color:var(--em-dark,#FFF7EA)}

/* 대형 타이틀 — Bold */
.hdcz-title{
  font-family:var(--font-display);
  font-weight:700;
  font-size:64px;
  line-height:1.12;
  color:#fff!important;
  letter-spacing:-.02em;
  margin-bottom:24px;
  word-break:keep-all
}
.hdcz-title .em{color:#FFF7EA!important}

/* 수평 룰 — 장식 구분선 */
.hdcz-rule{
  width:60px;
  height:1px;
  background:rgba(255,255,255,.35);
  margin:0 auto 24px;
  flex-shrink:0
}

/* 하단 서브 — Light */
.hdcz-sub-bot{
  font-family:var(--font-display);
  font-weight:300;
  font-size:36px;
  line-height:1.45;
  color:rgba(255,255,255,.9);
  letter-spacing:.005em;
  word-break:keep-all
}
.hdcz-sub-bot .em{color:var(--em-dark,#FFF7EA)}

/* 다크 스코프 — richSafe em 오버라이드 */
.hdcz .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { richSafe }) => {
    const hasTop = typeof d.imageTop === 'string' && d.imageTop.length > 0
    const hasBot = typeof d.imageBottom === 'string' && d.imageBottom.length > 0

    const topSlot = hasTop
      ? media(d.imageTop, 'hdcz-top-img', '제품 상단 이미지')
      : '<div class="ph-panel" role="img" aria-label="제품 이미지"></div>'

    const botSlot = hasBot
      ? media(d.imageBottom, 'hdcz-bot-img', '제품 하단 이미지')
      : '<div class="ph-panel" role="img" aria-label="제품 이미지"></div>'

    return `
<section class="hdcz">
  <div class="hdcz-top">${topSlot}</div>

  <div class="hdcz-body">
    <p class="hdcz-sub-top">${richSafe(d.subTop)}</p>
    <h2 class="hdcz-title">${richSafe(d.title)}</h2>
    <div class="hdcz-rule" aria-hidden="true"></div>
    <p class="hdcz-sub-bot">${richSafe(d.subBottom)}</p>
  </div>

  <div class="hdcz-bot">${botSlot}</div>
</section>`
  },
})
