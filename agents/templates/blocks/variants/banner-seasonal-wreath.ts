/** BANNER 아키타입(템플릿 충실 재현): banner-seasonal-wreath.
 *  와디즈 200섹션 18_시즈널배너 패턴 — 낙엽·꽃 이미지를 4방향 화환 테두리로 배치.
 *  밝은 배경 중앙에 라벨 + 초대형 할인율 숫자 + 날짜를 집중 배치.
 *  banner-seasonal(그라데이션+CSS블롭) 및 banner-event(단순 텍스트)와 구분되는
 *  이미지 주도 화환 프레임 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  label: z.string().min(1).optional(),          // 할인 라벨 (예: "간절기 시즌오프 할인")
  discountRate: z.string().min(1),              // 초대형 할인율 숫자만 (예: "50") — 단위 제외
  discountUnit: z.string().min(1).optional(),   // 단위 (예: "%", "원", "OFF") 기본 "%"
  period: z.string().min(1).optional(),         // 기간 텍스트 (예: "9.15 - 9.30")
  wreathTL: z.string().optional(),              // 왼쪽 상단 화환 이미지 (url)
  wreathTR: z.string().optional(),              // 오른쪽 상단 화환 이미지 (url)
  wreathBL: z.string().optional(),              // 왼쪽 하단 화환 이미지 (url)
  wreathBR: z.string().optional(),              // 오른쪽 하단 화환 이미지 (url)
})
type Data = z.infer<typeof schema>

export const bannerSeasonalWreath = defineBlock<Data>({
  id: 'banner-seasonal-wreath',
  archetype: 'banner',
  styleTags: ['premium', 'template', 'seasonal', 'warm', 'editorial', 'light'],
  imageSlots: 4,
  describe:
    '시즌 화환 배너. 밝은 배경에 계절 소재(낙엽·꽃) 이미지 4장을 사방 모서리에 화환처럼 배치. 중앙 여백에 라벨 + 초대형 할인율 + 날짜 텍스트. 이미지 중심 프리미엄 시즌 배너.',
  schema,
  css: `
/* bsw- : banner-seasonal-wreath 전용 접두사 */
.bsw{
  position:relative;
  background:var(--paper);
  overflow:hidden;
  min-height:720px;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:80px 56px;
}

/* 화환 이미지 — 4 모서리 절대배치 슬롯
   broken img의 alt 텍스트가 노출되지 않도록
   color:transparent / font-size:0 처리 */
.bsw-img{
  position:absolute;
  display:block;
  pointer-events:none;
  color:transparent;
  font-size:0;
  line-height:0;
}
/* placeholder(이미지 없는 경우): 완전히 숨김 */
.bsw-img.ph{
  display:none !important;
}
.bsw-tl{
  top:-30px;
  left:-30px;
  width:56%;
  max-width:340px;
  aspect-ratio:1/1;
  object-fit:contain;
  transform:rotate(-6deg);
}
.bsw-tr{
  top:-30px;
  right:-30px;
  width:52%;
  max-width:300px;
  aspect-ratio:1/1;
  object-fit:contain;
  transform:scaleX(-1) rotate(-6deg);
}
.bsw-bl{
  bottom:-30px;
  left:-20px;
  width:48%;
  max-width:280px;
  aspect-ratio:1/1;
  object-fit:contain;
  transform:rotate(10deg);
}
.bsw-br{
  bottom:-30px;
  right:-20px;
  width:48%;
  max-width:280px;
  aspect-ratio:1/1;
  object-fit:contain;
  transform:scaleX(-1) rotate(10deg);
}

/* 중앙 콘텐츠 래퍼 */
.bsw-body{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
  align-items:center;
  max-width:100%;
  overflow:hidden;
}

/* 라벨 텍스트 */
.bsw-label{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:20px;
  font-weight:600;
  letter-spacing:.04em;
  color:var(--ink-2);
  margin-bottom:18px;
}

/* 할인율 행 — 숫자 + 단위를 한 줄로, 오버플로 방지 */
.bsw-rate{
  display:flex;
  align-items:flex-start;
  gap:4px;
  max-width:100%;
  overflow:hidden;
}

/* 할인율 숫자 — 초대형, fluid 크기로 컨테이너 넘침 방지 */
.bsw-num{
  font-family:var(--font-serif),'Gowun Batang',serif;
  font-size:clamp(80px,18vw,200px);
  font-weight:700;
  line-height:0.88;
  color:#b82828;
  letter-spacing:-.04em;
  white-space:nowrap;
}

/* 단위 (퍼센트 기호) — superscript 느낌 */
.bsw-unit{
  font-family:var(--font-serif),'Gowun Batang',serif;
  font-size:clamp(32px,6vw,72px);
  font-weight:700;
  color:#b82828;
  margin-top:clamp(10px,2vw,24px);
  line-height:1;
  letter-spacing:-.02em;
  white-space:nowrap;
}

/* 기간 텍스트 */
.bsw-period{
  margin-top:28px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:20px;
  font-weight:500;
  letter-spacing:.06em;
  color:var(--ink-2);
}
`,
  render: (d, { esc }) => `
<section class="bsw">
  ${media(d.wreathTL, 'bsw-img bsw-tl', '')}
  ${media(d.wreathTR, 'bsw-img bsw-tr', '')}
  ${media(d.wreathBL, 'bsw-img bsw-bl', '')}
  ${media(d.wreathBR, 'bsw-img bsw-br', '')}
  <div class="bsw-body">
    ${d.label ? `<p class="bsw-label">${esc(d.label)}</p>` : ''}
    <div class="bsw-rate">
      <span class="bsw-num">${esc(d.discountRate)}</span><span class="bsw-unit">${esc(d.discountUnit ?? '%')}</span>
    </div>
    ${d.period ? `<p class="bsw-period">${esc(d.period)}</p>` : ''}
  </div>
</section>`,
})
