/** CERT 아키타입: cert-derma-trio
 *  피그마 208_인증서_11 구조 재구성.
 *  올리브/다크 배경 + 상단 서브타이틀·대제목 + 원형 인증 마크(단독) + 하단 3열 겹침 인증서 카드 행.
 *  noimg-safe: markImage 없으면 SVG 실드 뱃지로 강등(카드 행 붕괴 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  label: z.string().min(1),          // 인증 명칭 (예: 피부자극테스트 완료)
  body: z.string().min(1),           // 세부 설명 (em 허용)
  badge: z.string().optional(),      // 카드 내 소형 뱃지 텍스트 (예: EXCELLENT)
})

const schema = z.object({
  subtitle: z.string().optional(),              // 상단 소제목 한 줄 (순수 텍스트)
  title: z.string().min(1),                     // 대제목 (em,br)
  markImage: z.string().optional(),             // 원형 인증 마크 이미지 URL
  markAlt: z.string().optional(),               // 마크 대체 텍스트
  cards: z.array(cardSchema).min(2).max(3),     // 겹침 인증서 카드 2~3장
})

type Data = z.infer<typeof schema>

export const certDermaTrio = defineBlock<Data>({
  id: 'cert-derma-trio',
  archetype: 'cert',
  styleTags: ['dark', 'premium', 'beauty', 'noimg-safe', 'overlap'],
  imageSlots: 1,
  describe:
    '인증(다크 올리브 배경). 상단 서브타이틀+대제목 → 원형 인증 마크(단독, 이미지 없으면 실드 SVG 강등) → 하단 2~3장 오버랩 카드 행. 더마테스트·피부자극 등 뷰티/헬스 인증 씰 섹션에 최적.',
  schema,
  css: `
.cltu{
  position:relative;
  padding:72px var(--pad-x,56px) 80px;
  background:var(--brand);
  color:var(--bg);
  text-align:center;
  overflow:hidden;
}
/* 다크 배경 위 em 강조 스코프 오버라이드 */
.cltu .em{color:var(--em-dark,#FFF7EA)}

/* 상단 텍스트 영역 */
.cltu-sub{
  font-family:var(--font-body);
  font-size:17px;
  font-weight:600;
  letter-spacing:.06em;
  color:color-mix(in srgb,var(--bg) 70%,transparent);
  margin-bottom:16px;
}
.cltu-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,4.2vw,52px);
  line-height:1.22;
  letter-spacing:-.02em;
  color:var(--bg);
  white-space:pre-line;
}
.cltu-title .em{color:var(--em-dark,#FFF7EA)}

/* 원형 마크 */
.cltu-mark-wrap{
  width:200px;
  height:200px;
  margin:44px auto 0;
  position:relative;
}
/* 원형 프레임 — 50% 예외 */
.cltu-mark{
  width:200px;
  height:200px;
  border-radius:50%;
  object-fit:contain;
  background:rgba(255,255,255,.12);
  border:2px solid rgba(255,255,255,.25);
  display:block;
}
/* noimg-safe: markImage 없으면 ph 숨김(전역 .ph{display:none!important}) →
   .cltu-mark-svg 폴백 SVG 실드가 대신 표시 */
.cltu-mark.ph + .cltu-mark-svg{display:flex}
.cltu-mark-svg{
  display:none;
  width:200px;
  height:200px;
  border-radius:50%;
  border:2px solid rgba(255,255,255,.25);
  background:rgba(255,255,255,.1);
  align-items:center;
  justify-content:center;
  position:absolute;
  top:0;left:0;
}
.cltu-mark-svg svg{width:90px;height:90px;color:rgba(255,255,255,.7)}

/* 3열 겹침 카드 행 */
.cltu-cards{
  display:flex;
  justify-content:center;
  align-items:flex-start;
  margin-top:48px;
  position:relative;
  /* 3장 전부 컨테이너 내로 수용: 카드 260×3 - 겹침 44×2 = 692px < 760px(pad 제외) */
  max-width:760px;
  margin-left:auto;
  margin-right:auto;
  overflow:visible;
}
/* 카드: 고정 너비로 오버플로우 예측 가능하게 */
.cltu-card{
  width:260px;
  min-width:0;
  flex-shrink:0;
  background:var(--paper, #fff);
  border-radius:calc(var(--r-scale,1)*20px);
  padding:28px 24px 32px 30px;
  box-shadow:0 12px 36px -8px rgba(0,0,0,.28);
  color:var(--ink);
  text-align:left;
  position:relative;
  overflow:hidden;
}
/* 2장 이상일 때 겹침 */
.cltu-card:not(:first-child){margin-left:-44px}
/* z-index: 왼쪽→오른쪽으로 올라감 — 세 카드 모두 동일 규칙 적용 */
.cltu-card:nth-child(1){z-index:1}
.cltu-card:nth-child(2){z-index:2}
.cltu-card:nth-child(3){z-index:3}
/* 카드 내 뱃지 */
.cltu-card-badge{
  display:inline-block;
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  font-weight:700;
  font-size:11px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--accent-d);
  background:color-mix(in srgb,var(--accent) 14%,transparent);
  border-radius:999px;
  padding:4px 14px;
  margin-bottom:14px;
}
.cltu-card-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:18px;
  line-height:1.3;
  color:var(--ink);
  margin-bottom:10px;
  word-break:keep-all;
}
.cltu-card-body{
  font-size:14px;
  font-weight:500;
  line-height:1.7;
  color:var(--ink-2);
}
.cltu-card-body .em{color:var(--accent-d);font-weight:700}
/* 카드 좌측 장식 선 */
.cltu-card::before{
  content:'';
  position:absolute;
  left:0;top:20%;
  height:60%;
  width:3px;
  border-radius:999px;
  background:var(--accent);
  opacity:.5;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const markAlt = d.markAlt ?? '인증 마크'
    const hasImg = typeof d.markImage === 'string' && d.markImage.length > 0

    const markHtml = hasImg
      ? media(d.markImage, 'cltu-mark', markAlt)
      : `<div class="cltu-mark ph" role="img" aria-label="${esc(markAlt)}"></div>`

    const cardsHtml = d.cards
      .map(
        (c) => `
    <div class="cltu-card">
      ${c.badge ? `<span class="cltu-card-badge">${esc(c.badge)}</span>` : ''}
      <div class="cltu-card-label">${esc(c.label)}</div>
      <div class="cltu-card-body">${richSafe(c.body)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="cltu">
  ${d.subtitle ? `<p class="cltu-sub">${esc(d.subtitle)}</p>` : ''}
  <h2 class="disp cltu-title">${richSafe(d.title)}</h2>
  <div class="cltu-mark-wrap">
    ${markHtml}
    <div class="cltu-mark-svg" aria-hidden="true">
      ${icon('shield')}
    </div>
  </div>
  <div class="cltu-cards">
    ${cardsHtml}
  </div>
</section>`
  },
})
