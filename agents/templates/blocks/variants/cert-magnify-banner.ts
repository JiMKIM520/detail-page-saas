/** CERT 아키타입: cert-magnify-banner
 *  128_인증서_03 흡수 — 배경 이미지 위 인증서 카드 중앙 배치 + 하단 그라디언트 섀도+확대 텍스트 레이어로
 *  돋보기 줌인 효과 연출. 하단 흰 배너에 원형 아이콘 배지 + 제목/설명 문구 배치. 다크 톤.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 배경 이미지 위 대형 제목 (em, br 허용) */
  heroTitle: z.string().min(1),
  /** 대형 제목 아래 서브 카피 */
  heroSub: z.string().optional(),
  /** 인증서 카드 안 메인 문구 (em 허용) — 확대 효과 줌 레이어에도 동일 복사 */
  certLabel: z.string().min(1),
  /** 인증서 카드 배경 이미지 (생략 시 흰 카드로 강등) */
  bgImage: z.string().optional(),
  /** 하단 배너 아이콘 (ICON_NAMES 35종) */
  bannerIcon: z.enum([
    'wheat','drop','clock','badge','snow','check','fryer','oven','star',
    'heart','gift','truck','shield','leaf','trophy','thumb','fire',
    'person','search','pin','box','calendar','card','won','bulb','gear',
    'camera','phone','bolt','thermometer','target','store','doc','sprout','bell',
  ]).default('badge'),
  /** 하단 배너 굵은 제목 */
  bannerTitle: z.string().min(1),
  /** 하단 배너 본문 설명 */
  bannerDesc: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const certMagnifyBanner = defineBlock<Data>({
  id: 'cert-magnify-banner',
  archetype: 'cert',
  styleTags: ['dark', 'premium', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '인증서 돋보기 줌인 블록. 배경 이미지 위 흰 인증서 카드 중앙 배치 → 카드 하단에 그라디언트 섀도+확대 텍스트 레이어로 줌인 효과 연출. 최하단 흰 배너에 원형 아이콘 배지 + 제목/설명. 특허·인증 강조에 적합.',
  schema,
  css: `
/* ── 최상위 래퍼 ── */
.cmnd{width:100%;background:var(--bg);font-family:var(--font-body),'Pretendard',sans-serif;color:var(--ink)}

/* ── 상단 영역: 배경 이미지 + 오버레이 ── */
.cmnd-top{position:relative;width:100%;min-height:680px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;overflow:hidden;background:var(--ink)}
.cmnd-top .cmnd-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
.cmnd-top .cmnd-bg.ph{display:block!important;background:color-mix(in srgb,var(--accent) 18%,var(--ink));opacity:.7}
.cmnd-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.38) 0%,rgba(0,0,0,.22) 60%,rgba(0,0,0,.55) 100%)}

/* ── 히어로 텍스트 (배경 위 화이트) ── */
.cmnd-hero-txt{position:relative;z-index:2;text-align:center;padding:52px var(--pad-x,56px) 0}
.cmnd-hero-title{font-family:var(--font-display);font-weight:800;font-size:64px;line-height:1.1;letter-spacing:-.02em;color:#fff}
.cmnd-hero-title .em{color:var(--em-dark,#FFF7EA)}
.cmnd-hero-sub{margin-top:14px;font-size:26px;font-weight:500;color:rgba(255,255,255,.82);line-height:1.5}
.cmnd-hero-sub .em{color:var(--em-dark,#FFF7EA)}

/* ── 인증서 카드 영역 ── */
.cmnd-card-wrap{position:relative;z-index:2;margin:36px auto 0;width:62%;max-width:532px}
.cmnd-card{width:100%;background:#fff;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;box-shadow:0 24px 64px -20px rgba(0,0,0,.52)}

/* 인증서 카드 내부 패딩 영역 */
.cmnd-card-inner{padding:42px 32px 0;display:flex;flex-direction:column;align-items:center;gap:14px;min-height:280px}

/* 인증서 카드 상단 장식 라인 */
.cmnd-cert-deco{width:80%;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);margin-bottom:6px}

/* 인증서 카드 메인 레이블 */
.cmnd-cert-label{font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--ink);text-align:center;line-height:1.25;letter-spacing:-.01em}
.cmnd-cert-label .em{color:var(--accent-d)}

/* 인증서 카드 하단 인장 장식 */
.cmnd-cert-seal{margin:18px auto 0;width:68px;height:68px}

/* ── 확대 효과 레이어 (줌인 텍스트 + 그라디언트 섀도) ── */
.cmnd-zoom{width:100%;background:#fff;position:relative;margin-top:0}
.cmnd-zoom-shadow{width:100%;height:20px;background:linear-gradient(180deg,rgba(0,0,0,.0) 0%,rgba(0,0,0,.10) 100%);flex-shrink:0}
.cmnd-zoom-bar{background:#fff;padding:12px 24px 20px;text-align:center}
.cmnd-zoom-text{font-family:var(--font-display);font-weight:700;font-size:34px;color:var(--ink);letter-spacing:-.02em;line-height:1.2}
.cmnd-zoom-text .em{color:var(--accent-d)}

/* ── 하단 배너 ── */
.cmnd-banner{width:100%;background:#fff;padding:38px var(--pad-x,56px) 42px;display:flex;align-items:center;gap:32px}
.cmnd-banner-icon-wrap{flex:0 0 120px;width:120px;height:120px;border-radius:50%;background:color-mix(in srgb,var(--accent) 10%,var(--bg));display:flex;align-items:center;justify-content:center;border:2px solid color-mix(in srgb,var(--accent) 22%,transparent)}
.cmnd-banner-icon-wrap svg{width:58px;height:58px;color:var(--accent-d)}
.cmnd-banner-txt{flex:1;min-width:0}
.cmnd-banner-title{font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--ink);line-height:1.25;letter-spacing:-.01em}
.cmnd-banner-desc{margin-top:10px;font-size:16px;font-weight:400;color:var(--ink-2);line-height:1.7}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="cmnd">
  <!-- 상단: 배경 이미지 + 히어로 텍스트 + 인증서 카드 -->
  <div class="cmnd-top">
    ${media(d.bgImage, 'cmnd-bg', '인증 배경')}
    <div class="cmnd-overlay"></div>

    <!-- 히어로 텍스트 -->
    <div class="cmnd-hero-txt">
      <h2 class="cmnd-hero-title">${richSafe(d.heroTitle)}</h2>
      ${d.heroSub ? `<p class="cmnd-hero-sub">${richSafe(d.heroSub)}</p>` : ''}
    </div>

    <!-- 인증서 카드 -->
    <div class="cmnd-card-wrap">
      <div class="cmnd-card">
        <div class="cmnd-card-inner">
          <div class="cmnd-cert-deco"></div>
          <!-- 인장 SVG (인라인) -->
          <svg class="cmnd-cert-seal" viewBox="0 0 68 68" fill="none" aria-hidden="true">
            <circle cx="34" cy="34" r="30" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3"/>
            <circle cx="34" cy="34" r="22" stroke="var(--accent)" stroke-width="1.4"/>
            <path d="M34 14l2.4 7.4H44l-6.2 4.5 2.4 7.4L34 29l-6.2 4.3 2.4-7.4L24 21.4h7.6z" fill="var(--accent)" opacity=".28"/>
            <text x="34" y="37" text-anchor="middle" font-family="var(--font-display)" font-weight="700" font-size="9" fill="var(--accent)">CERTIFIED</text>
          </svg>
          <p class="cmnd-cert-label">${richSafe(d.certLabel)}</p>
        </div>

        <!-- 확대 효과 레이어 -->
        <div class="cmnd-zoom">
          <div class="cmnd-zoom-shadow"></div>
          <div class="cmnd-zoom-bar">
            <span class="cmnd-zoom-text">${richSafe(d.certLabel)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 하단 배너 -->
  <div class="cmnd-banner">
    <div class="cmnd-banner-icon-wrap">
      ${icon(d.bannerIcon)}
    </div>
    <div class="cmnd-banner-txt">
      <p class="cmnd-banner-title">${esc(d.bannerTitle)}</p>
      ${d.bannerDesc ? `<p class="cmnd-banner-desc">${esc(d.bannerDesc)}</p>` : ''}
    </div>
  </div>
</section>`,
})
