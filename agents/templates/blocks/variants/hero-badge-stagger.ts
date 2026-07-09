/** HERO 아키타입: hero-badge-stagger
 *  원본: 070_제품소개_04 — 전면 분위기 사진 위에 브랜드 헤더(라틴명+가로선) + 중앙 두 배지 수평 오프셋 스태거 + 하단 브랜드 바.
 *  핵심 장치: 카피(슬로건·제품명)를 황금·오렌지 두 배지로 수평 오프셋 배치해 레이어드 스태거 효과.
 *  CSS 접두: huip (과제 지정 고정)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 브랜드 라인 — 라틴 영문 브랜드명 또는 시리즈명 (순수 텍스트) */
  brandLatin: z.string().min(1),
  /** 배지1 카피 — 슬로건·가치 문구 (em 허용). 황금 배지. */
  badge1: z.string().min(1),
  /** 배지2 카피 — 제품명·핵심 키워드 (em 허용). 오렌지 배지. */
  badge2: z.string().min(1),
  /** 하단 브랜드 바 부제 — 영문 제품 카테고리/태그라인 (순수 텍스트) */
  brandSub: z.string().optional(),
  /** 전면 배경 분위기 사진 (url). 없으면 딥 브랜드 컬러 그라디언트로 강등. */
  image: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const heroBadgeStagger = defineBlock<Data>({
  id: 'hero-badge-stagger',
  archetype: 'hero',
  /** noimg-safe: 이미지 부재 시 배경을 브랜드 그라디언트(강등 폴백)로 전환해 구조 붕괴 없음 */
  styleTags: ['dark', 'premium', 'mixed', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '전면 배경 사진 위 브랜드 헤더(라틴명+가로선) + 두 배지 수평 오프셋 스태거(황금·오렌지) + 하단 브랜드 바. 뷰티·프리미엄 제품 히어로. 이미지 부재 시 브랜드 그라디언트 강등.',
  schema,
  css: `
/* ── hero-badge-stagger ── */
.huip{position:relative;width:100%;min-height:700px;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;background:var(--brand)}
/* 배경 이미지 레이어 */
.huip-bg{position:absolute;inset:0;z-index:0}
.huip-bg img,.huip-bg .ph{width:100%;height:100%;object-fit:cover;display:block;border-radius:0}
/* 이미지 부재 강등: .ph는 숨겨지므로 배경 자체(var(--brand) 그라디언트)가 보임 */
.huip-bg .ph{display:none!important}
.huip-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(to bottom,rgba(0,0,0,.18) 0%,rgba(0,0,0,.05) 40%,rgba(0,0,0,.32) 100%)}
/* 상단 브랜드 행 */
.huip-top{position:relative;z-index:2;display:flex;align-items:center;gap:18px;padding:32px var(--pad-x,56px) 0}
.huip-brand-lat{font-family:var(--font-lat,'Cormorant Garamond',serif);font-size:28px;font-weight:400;letter-spacing:.08em;color:#fff;white-space:nowrap;opacity:.92}
.huip-top .em{color:var(--em-dark,#FFF7EA)}
.huip-hairline{flex:1;height:1px;background:#fff;opacity:.45;min-width:40px}
/* 중앙 배지 영역 */
.huip-center{position:relative;z-index:2;padding:0 var(--pad-x,56px);flex:1;display:flex;flex-direction:column;justify-content:center;gap:0}
.huip-badges{display:flex;flex-direction:column;gap:0;align-items:flex-start}
/* 배지 공통 */
.huip-badge{display:inline-flex;align-items:center;padding:10px 28px;border-radius:calc(var(--r-scale,1)*4px)}
.huip-badge span{font-family:var(--font-display,'Pretendard',sans-serif);font-size:clamp(30px,4vw,42px);font-weight:600;line-height:1.18;color:#fff;letter-spacing:-.01em}
.huip-badge .em{color:var(--em-dark,#FFF7EA)}
/* 배지1 — 황금, 왼쪽 기준 */
.huip-b1{background:#d09939;align-self:flex-start;margin-left:0}
/* 배지2 — 오렌지, 오른쪽으로 50px 오프셋하여 스태거 */
.huip-b2{background:#e68102;align-self:flex-start;margin-left:50px;margin-top:8px}
/* 하단 브랜드 바 */
.huip-bottom{position:relative;z-index:2;background:var(--brand);padding:14px var(--pad-x,56px)}
.huip-bottom-text{font-family:var(--font-display,'Pretendard',sans-serif);font-size:clamp(22px,3vw,34px);font-weight:200;letter-spacing:.06em;color:transparent;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.5) 100%);-webkit-background-clip:text;background-clip:text;text-align:center}
.huip-bottom .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => `
<section class="huip">
  <div class="huip-bg">${media(d.image, 'huip-bg-img', esc(d.badge2))}</div>
  <div class="huip-overlay"></div>

  <div class="huip-top">
    <span class="huip-brand-lat">${esc(d.brandLatin)}</span>
    <span class="huip-hairline" aria-hidden="true"></span>
  </div>

  <div class="huip-center">
    <div class="huip-badges">
      <div class="huip-badge huip-b1"><span>${richSafe(d.badge1)}</span></div>
      <div class="huip-badge huip-b2"><span>${richSafe(d.badge2)}</span></div>
    </div>
  </div>

  <div class="huip-bottom">
    <p class="huip-bottom-text">${d.brandSub ? esc(d.brandSub) : ''}</p>
  </div>
</section>`,
})
