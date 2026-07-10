/** HERO 아키타입: hero-marker-panel
 *  출처: 022_모바일_전환_14 (750×600, 다크 배경 + 흰 라운드 패널 + 형광펜 하이라이트 장치)
 *  구조 흡수: 다크 배경 위 중앙 흰 카드 — 3단 타이포(소형 키커 → 대형 헤드라인 → 설명)
 *  핵심 장치: 형광 노란 바를 타이틀 텍스트 뒤에 absolute로 깔아 "형광펜" 효과 구현.
 *  이미지 슬롯 없음. noimg-safe 해당 없음.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  kicker:    z.string().optional(),          // 소형 보조 키커 라인 (em 허용)
  title:     z.string().min(1),             // 형광펜 하이라이트 대상 헤드라인 (em,br)
  headline:  z.string().min(1),             // 대형 디스플레이 주제목 (em,br)
  desc:      z.string().optional(),         // 본문 한 줄 설명 (순수 텍스트)
})
type Data = z.infer<typeof schema>

export const heroMarkerPanel = defineBlock<Data>({
  id: 'hero-marker-panel',
  archetype: 'hero',
  styleTags: ['dark', 'playful', 'food', 'warm'],
  imageSlots: 0,
  describe:
    '다크 배경 위 흰 라운드 패널 중앙 배치. 소형 키커 → 형광펜 하이라이트 타이틀 → 대형 헤드라인 → 설명 3단 타이포 구성. 이미지 없이 카피 임팩트만으로 첫 화면을 완성하는 식품/식물성 제품 히어로.',
  schema,
  css: `
.hvfj{
  background:var(--brand);
  padding:48px var(--pad-x,56px) 52px;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:320px;
}
.hvfj .em{color:var(--em-dark,#FFF7EA)}
.hvfj-panel{
  background:#ffffff;
  border-radius:calc(var(--r-scale,1)*30px);
  padding:40px 48px 36px;
  text-align:center;
  width:100%;
  max-width:680px;
  box-shadow:0 24px 48px -20px rgba(0,0,0,.45);
}
.hvfj-kicker{
  font-size:16px;
  font-weight:600;
  color:var(--ink-2);
  letter-spacing:.05em;
  margin-bottom:18px;
  line-height:1.4;
}
.hvfj-kicker .em{color:var(--accent-d);font-weight:800}
.hvfj-title-wrap{
  position:relative;
  display:inline-block;
  margin-bottom:10px;
}
.hvfj-marker{
  position:absolute;
  left:50%;
  transform:translateX(-50%);
  bottom:4px;
  width:calc(100% + 12px);
  height:18px;
  background:#fff600;
  border-radius:calc(var(--r-scale,1)*3px);
  z-index:0;
  opacity:.85;
}
.hvfj-title{
  position:relative;
  z-index:1;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:22px;
  font-weight:700;
  color:var(--brand);
  line-height:1.55;
  letter-spacing:-.01em;
}
.hvfj-title .em{color:var(--brand);font-weight:900}
.hvfj-headline{
  font-family:var(--font-display);
  font-size:52px;
  font-weight:900;
  color:var(--brand);
  line-height:1.1;
  letter-spacing:-.02em;
  margin-top:6px;
  word-break:keep-all;
}
.hvfj-headline .em{color:var(--accent-d)}
.hvfj-desc{
  margin-top:16px;
  font-size:16px;
  font-weight:500;
  color:var(--ink-2);
  line-height:1.6;
  letter-spacing:-.005em;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="hvfj">
  <div class="hvfj-panel">
    ${d.kicker ? `<p class="hvfj-kicker">${richSafe(d.kicker)}</p>` : ''}
    <div class="hvfj-title-wrap">
      <span class="hvfj-marker" aria-hidden="true"></span>
      <p class="hvfj-title">${richSafe(d.title)}</p>
    </div>
    <h2 class="hvfj-headline">${richSafe(d.headline)}</h2>
    ${d.desc ? `<p class="hvfj-desc">${esc(d.desc)}</p>` : ''}
  </div>
</section>`,
})
