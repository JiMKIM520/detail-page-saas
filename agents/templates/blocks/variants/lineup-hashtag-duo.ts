/** LINEUP 아키타입: lineup-hashtag-duo
 *  원본: 015_상품_구성_페이지_18 (슬레이트 다크 배경, 2열 카드, 해시태그+이미지+제품명+블루 pill 버튼)
 *  SNS 감성 패키지 선택 UI — 해시태그 행이 카드 상단에, 파란 pill 버튼이 카드 하단에 배치되어
 *  인스타그램 스타일의 쇼핑 감성을 구현한다. 최대 2개 상품 카드를 나란히 배치. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  tags: z.array(z.string().min(1)).min(1).max(4),   // 해시태그 배열 (#없이 입력, 렌더에서 # 붙임)
  image: z.string().optional(),                       // 제품 이미지 (url)
  name: z.string().min(1),                            // 제품명 (em 허용)
  subText: z.string().optional(),                     // 간단 보조 설명 (순수 텍스트)
  buttonLabel: z.string().min(1),                     // pill 버튼 텍스트
})

const schema = z.object({
  headline: z.string().min(1),     // 상단 대형 제목 (em/br 허용)
  badge: z.string().optional(),    // 헤드라인 위 작은 태그 라벨 (순수 텍스트)
  bodyText: z.string().optional(), // 카드 아래 멀티라인 설명 (순수 텍스트)
  cards: z.array(cardSchema).min(1).max(2),
})
type Data = z.infer<typeof schema>

export const lineupHashtagDuo = defineBlock<Data>({
  id: 'lineup-hashtag-duo',
  archetype: 'lineup',
  styleTags: ['dark', 'sns', 'package', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '슬레이트 다크 배경 라인업. 상단 대형 제목+배지 태그, 하단 2열 카드(카드별: 해시태그행·제품 이미지·제품명·보조설명·파란 pill 버튼). SNS 감성 패키지 선택 UI에 최적.',
  schema,
  css: `
/* ── lineup-hashtag-duo (lruw) ── */
.lruw{background:#293647;color:#fff;padding:60px var(--pad-x,56px) 72px}
.lruw .em{color:var(--em-dark,#FFF7EA)}
.lruw-top{margin-bottom:44px}
.lruw-badge{display:inline-flex;align-items:center;height:44px;padding:0 22px;
  border:1.5px solid rgba(255,255,255,.30);border-radius:999px;
  font-size:15px;font-weight:500;color:rgba(255,255,255,.70);
  letter-spacing:.06em;margin-bottom:20px}
.lruw-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5.5vw,72px);
  line-height:1.12;letter-spacing:-.02em;word-break:keep-all}
.lruw-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
/* ── 카드 ── */
.lruw-card{background:#fff;border-radius:calc(var(--r-scale,1)*20px);overflow:hidden;
  display:flex;flex-direction:column}
/* 카드 헤더: 해시태그 행 */
.lruw-tags{display:flex;flex-wrap:wrap;gap:6px;padding:16px 18px 0;min-height:40px}
.lruw-tag{font-size:13px;font-weight:500;color:#696969;line-height:1.4}
/* 넘버 배지 — 원본 '01' 디바이더 장치 재현 (인라인 SVG 수평선) */
.lruw-num-row{display:flex;align-items:center;gap:0;padding:10px 18px 0}
.lruw-num-line{flex:1;height:1px;background:#d9d9d9}
.lruw-num{font-size:13px;font-weight:500;color:#000;padding:0 10px;white-space:nowrap;
  font-family:var(--font-lat,'Cormorant Garamond',serif);letter-spacing:.04em}
/* 이미지 프레임 */
.lruw-img-wrap{margin:10px 18px 0;border-radius:calc(var(--r-scale,1)*10px);
  overflow:hidden;aspect-ratio:299/153;background:color-mix(in srgb,var(--accent) 8%,#e8e8e8);
  flex-shrink:0}
.lruw-img-wrap img,.lruw-img-wrap .ph{width:100%;height:100%;object-fit:cover;
  border-radius:inherit;display:block}
/* 이미지 없을 때 붕괴 방지: .ph는 전역 display:none!important 이므로 aspect-ratio 박스가 빈 패널로 표시 */
.lruw-name{padding:12px 18px 4px;font-size:clamp(18px,2.4vw,28px);font-weight:700;color:#000;
  line-height:1.25;word-break:keep-all}
.lruw-name .em{color:var(--accent-d)}
.lruw-sub{padding:0 18px;font-size:14px;color:#696969;line-height:1.55;margin-bottom:4px}
/* pill 버튼 — 원본 Rectangle67 (#50647e, r:40) 재현 */
.lruw-btn-wrap{padding:12px 18px 18px;margin-top:auto}
.lruw-btn{display:block;width:100%;text-align:center;
  background:#50647e;color:#fff;border:none;border-radius:999px;
  font-size:clamp(14px,1.8vw,22px);font-weight:700;padding:14px 20px;
  cursor:pointer;letter-spacing:.02em;
  transition:background .18s ease}
.lruw-btn:hover{background:#3d5066}
/* 하단 보조 텍스트 */
.lruw-body{margin-top:32px;font-size:clamp(15px,2vw,22px);font-weight:500;
  color:rgba(255,255,255,.82);line-height:1.65;text-align:center;word-break:keep-all}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.cards.map((c, i) => {
      const tagRow = c.tags.map((t) => `<span class="lruw-tag">#${esc(t)}</span>`).join('')
      const numLabel = `${String(i + 1).padStart(2, '0')}`
      return `
<div class="lruw-card">
  <div class="lruw-tags">${tagRow}</div>
  <div class="lruw-num-row">
    <span class="lruw-num-line"></span>
    <span class="lruw-num">${esc(numLabel)}</span>
    <span class="lruw-num-line"></span>
  </div>
  <div class="lruw-img-wrap">${media(c.image, '', '상품 이미지')}</div>
  <p class="lruw-name">${richSafe(c.name)}</p>
  ${c.subText ? `<p class="lruw-sub">${esc(c.subText)}</p>` : ''}
  <div class="lruw-btn-wrap">
    <button class="lruw-btn">${esc(c.buttonLabel)}</button>
  </div>
</div>`
    }).join('')

    return `
<section class="lruw">
  <div class="lruw-top">
    ${d.badge ? `<span class="lruw-badge">${esc(d.badge)}</span>` : ''}
    <h2 class="lruw-headline">${richSafe(d.headline)}</h2>
  </div>
  <div class="lruw-cards">${cards}</div>
  ${d.bodyText ? `<p class="lruw-body">${esc(d.bodyText)}</p>` : ''}
</section>`
  },
})
