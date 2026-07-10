/** HERO 아키타입: hero-floatcard-hand
 *  피그마 313_인트로_55 구조 흡수.
 *  배경 이미지 위에 흰 카드가 부유하고, 카드 상단 사진에
 *  큰 손글씨(--font-hand) 영문이 대각선 인상으로 오버랩.
 *  카드 하단은 세리프 영문 부제 + 산세리프 한글 타이틀 페어링(중앙 정렬).
 *  light 톤. noimg-safe: 이미지 부재 시 카드 포토 프레임을 틴트 패널로 강등. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 메인 제품 사진 (카드 상단 라운드 프레임) */
  image: z.string().optional(),
  /** 사진 위 오버랩 손글씨 영문 — 짧은 구절, 2~3단어 권장 (em 금지, 순수 라틴) */
  handText: z.string().min(1),
  /** 카드 하단 세리프 영문 부제 — 제품 컨셉 한 줄 (순수 텍스트) */
  enSub: z.string().min(1),
  /** 한글 메인 타이틀 1행 — 작은 크기 (em,br) */
  titleSm: z.string().min(1),
  /** 한글 메인 타이틀 2행 — 큰 크기, 핵심 키워드 (em,br) */
  titleLg: z.string().min(1),
  /** 배경 이미지 URL (선택). 없으면 --bg 단색 배경으로 강등. */
  bgImage: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const heroFloatcardHand = defineBlock<Data>({
  id: 'hero-floatcard-hand',
  archetype: 'hero',
  styleTags: ['light', 'editorial', 'handwriting', 'serif', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '흰 카드 부유형 히어로. 배경 이미지 위에 흰 사각 카드가 중앙 배치되고, 카드 상단 라운드 제품 사진에 큰 손글씨(--font-hand) 영문이 대각 오버랩. 카드 하단은 세리프 영문 부제 + 산세리프 한글 대/소 타이틀 페어링(중앙 정렬). 패션·뷰티·생활 브랜드 인트로에 적합. 브리프에 제품 사진과 대각선 영문 카피가 있을 때 선택.',
  schema,
  css: `
/* ── hero-floatcard-hand (hlnc) ── */
.hlnc{position:relative;display:flex;align-items:center;justify-content:center;
  min-height:720px;padding:60px var(--pad-x,56px);background:var(--bg);overflow:hidden}

/* 배경 이미지 레이어 */
.hlnc-bg{position:absolute;inset:0;z-index:0}
.hlnc-bg img,.hlnc-bg .ph{width:100%;height:100%;object-fit:cover;display:block}
/* 이미지 없을 때 배경 강등 — 틴트 오버레이로 공간 유지 */
.hlnc-bg .ph{background:color-mix(in srgb,var(--accent) 8%,var(--bg));display:block!important}
/* 배경 이미지 위 dim 스크림 */
.hlnc-bg::after{content:'';position:absolute;inset:0;
  background:linear-gradient(160deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,.04) 100%)}

/* 부유 카드 */
.hlnc-card{position:relative;z-index:1;background:var(--paper,#ffffff);
  border-radius:calc(var(--r-scale,1)*18px);
  box-shadow:0 24px 64px -16px rgba(0,0,0,.28),0 4px 16px -4px rgba(0,0,0,.12);
  width:min(600px,100%);overflow:visible;padding-bottom:36px}

/* 카드 상단 — 사진 + 손글씨 오버랩 컨테이너 */
.hlnc-photo-wrap{position:relative;width:100%;
  border-radius:calc(var(--r-scale,1)*18px) calc(var(--r-scale,1)*18px) 0 0;overflow:hidden}
.hlnc-photo-wrap img,.hlnc-photo-wrap .ph{
  width:100%;height:auto;min-height:400px;
  object-fit:cover;display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px) calc(var(--r-scale,1)*18px) 0 0)}
/* 사진 없을 때 포토 영역 강등 — 단색 틴트 패널로 높이 유지 */
.hlnc-photo-wrap .ph{min-height:400px;background:color-mix(in srgb,var(--accent) 12%,var(--paper,#fff));display:block!important}
/* 사진 위 살짝 어두운 스크림 — 손글씨 가독성 확보 */
.hlnc-photo-wrap::after{content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.0) 60%);pointer-events:none}

/* 손글씨 오버랩 텍스트 */
.hlnc-hand{position:absolute;top:18%;left:4%;z-index:2;
  font-family:var(--font-hand),'Nanum Pen Script',cursive;
  font-size:clamp(52px,8vw,82px);font-weight:400;line-height:1.1;
  color:#1a1a1a;
  text-shadow:0 2px 18px rgba(255,255,255,.55),0 1px 4px rgba(255,255,255,.8);
  letter-spacing:-.01em;pointer-events:none;white-space:pre-line}

/* 카드 하단 타이틀 영역 */
.hlnc-body{padding:22px 28px 0;text-align:center}

/* 세리프 영문 부제 */
.hlnc-en{font-family:var(--font-lat),'Cormorant Garamond',serif;
  font-size:clamp(18px,2.4vw,26px);font-weight:600;
  color:var(--accent);letter-spacing:.06em;line-height:1.3;
  text-transform:capitalize}

/* 한글 타이틀 소 */
.hlnc-title-sm{margin-top:10px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:clamp(22px,3.2vw,36px);font-weight:500;
  color:var(--ink);line-height:1.3;letter-spacing:-.01em}
.hlnc-title-sm .em{color:var(--accent)}

/* 한글 타이틀 대 */
.hlnc-title-lg{margin-top:4px;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:clamp(32px,5.2vw,56px);font-weight:700;
  color:var(--ink);line-height:1.18;letter-spacing:-.025em}
.hlnc-title-lg .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="hlnc">
  <div class="hlnc-bg">${media(d.bgImage, 'hlnc-bg-img', '배경')}</div>
  <div class="hlnc-card">
    <div class="hlnc-photo-wrap">
      ${media(d.image, 'hlnc-photo', '제품 사진')}
      <div class="hlnc-hand">${esc(d.handText)}</div>
    </div>
    <div class="hlnc-body">
      <p class="hlnc-en lat">${esc(d.enSub)}</p>
      <h2 class="hlnc-title-sm">${richSafe(d.titleSm)}</h2>
      <h1 class="hlnc-title-lg">${richSafe(d.titleLg)}</h1>
    </div>
  </div>
</section>`,
})
