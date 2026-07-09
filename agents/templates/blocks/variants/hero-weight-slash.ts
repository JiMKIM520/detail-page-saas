/** HERO 아키타입: hero-weight-slash
 *  062_인트로_27 패턴 재구성.
 *  상단 회색 표면에 브랜드명을 ExtraBold+Thin 2행 웨이트 대비로 쌓고, 제품 이미지를 아래에 배치.
 *  하단 그라디언트 영역에 슬래시(/) 분리 키워드(ExtraBold 대형) + 카테고리 필 배지 + 서브 카피.
 *  이미지 없을 때 상단 표면을 단색 패널로 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드명 상단 행 — ExtraBold. (em 허용) */
  brandStrong: z.string().min(1),
  /** 브랜드명 하단 행 — Thin 웨이트 대비. (em 허용) */
  brandLight: z.string().min(1),
  /** 제품 이미지 URL */
  image: z.string().optional(),
  /** 슬래시 분리 키워드 배열 (2~5개). 예: ["비교", "불가", "압도적"] → 비/교/불/가/압/도/적 */
  keywords: z.array(z.string().min(1)).min(2).max(5),
  /** 카테고리 필 배지 텍스트 (optional). 예: "초경량 가성비 노트북" */
  badge: z.string().optional(),
  /** 서브 카피 — 그라디언트 하단 메시지. (em/br 허용) */
  sub: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const heroWeightSlash = defineBlock<Data>({
  id: 'hero-weight-slash',
  archetype: 'hero',
  styleTags: ['mixed', 'editorial', 'tech', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '브랜드명 ExtraBold/Thin 2행 웨이트 대비 + 제품 이미지(상단 회색 표면) / 슬래시 분리 키워드 대형 타이포 + 필 배지 + 서브 카피(하단 그라디언트). 전자제품·패션·뷰티 등 브랜드 정체성 강조 첫 화면. 이미지 미제공 시 상단은 단색 패널로 강등.',
  schema,
  css: `
.hpuz{width:100%;font-family:var(--font-display,'Pretendard',sans-serif)}

/* ── 상단 회색 표면 ── */
.hpuz-top{
  background:#e9eaee;
  padding:48px var(--pad-x,56px) 0;
  position:relative;
  overflow:hidden;
  min-height:340px;
}
/* noimg-safe: 이미지 없을 때 최소 높이로 유지 */
.hpuz-top.hpuz-noimg{
  min-height:220px;
  padding-bottom:48px;
}

/* 브랜드명 2행 */
.hpuz-brand{
  display:flex;
  flex-direction:column;
  gap:0;
  line-height:1.0;
  letter-spacing:-.03em;
}
.hpuz-brand-strong{
  font-size:clamp(56px, 11vw, 96px);
  font-weight:900;
  color:var(--brand,#001fe6);
  font-family:var(--font-display,'Pretendard',sans-serif);
}
.hpuz-brand-strong .em{color:var(--accent)}
.hpuz-brand-light{
  font-size:clamp(56px, 11vw, 96px);
  font-weight:100;
  color:var(--brand,#001fe6);
  font-family:var(--font-display,'Pretendard',sans-serif);
  opacity:.88;
}
.hpuz-brand-light .em{color:var(--accent)}

/* 제품 이미지 프레임 */
.hpuz-img-wrap{
  margin-top:32px;
  width:100%;
  height:340px;
  border-radius:calc(var(--r-scale,1)*18px) calc(var(--r-scale,1)*18px) 0 0;
  overflow:hidden;
  background:color-mix(in srgb,var(--brand,#001fe6) 6%,transparent);
}
.hpuz-img-wrap img,
.hpuz-img-wrap .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center top;
  border-radius:inherit;
  display:block;
}
/* noimg: 이미지 래퍼 자체를 숨겨 상단 표면이 붕괴하지 않게 */
.hpuz-top.hpuz-noimg .hpuz-img-wrap{
  display:none;
}

/* ── 하단 그라디언트 영역 ── */
.hpuz-bot{
  background:linear-gradient(160deg, var(--brand,#001fe6) 0%, color-mix(in srgb,var(--brand,#001fe6) 70%,#000) 100%);
  padding:40px var(--pad-x,56px) 52px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
}
.hpuz-bot .em{color:var(--em-dark,#FFF7EA)}

/* 슬래시 키워드 */
.hpuz-keywords{
  font-size:clamp(52px, 10vw, 88px);
  font-weight:900;
  color:#fff;
  letter-spacing:-.02em;
  line-height:1.0;
  text-align:center;
  word-break:keep-all;
}
.hpuz-keywords .em{color:var(--em-dark,#FFF7EA)}
.hpuz-slash{
  opacity:.55;
  font-weight:300;
  margin:0 .08em;
}

/* 구분선 */
.hpuz-divider{
  width:100%;
  height:1px;
  background:rgba(255,255,255,.2);
  margin:22px 0 20px;
}

/* 카테고리 필 배지 */
.hpuz-badge{
  display:inline-block;
  background:rgba(255,255,255,.16);
  color:#fff;
  font-size:clamp(17px, 3vw, 24px);
  font-weight:600;
  padding:10px 28px;
  border-radius:999px;
  letter-spacing:.03em;
  margin-bottom:18px;
  border:1.5px solid rgba(255,255,255,.3);
}

/* 서브 카피 */
.hpuz-sub{
  font-size:clamp(22px, 4vw, 38px);
  font-weight:500;
  color:rgba(255,255,255,.9);
  text-align:center;
  line-height:1.5;
  letter-spacing:-.01em;
  white-space:pre-line;
}
.hpuz-sub .em{color:var(--em-dark,#FFF7EA);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const hasImg = typeof d.image === 'string' && d.image.length > 0

    // 슬래시 분리 키워드: 배열 → "키워드1 / 키워드2 / 키워드3" 형식 (풀 단어 단위 슬래시)
    const keywordHtml = d.keywords
      .map((k, i) =>
        i < d.keywords.length - 1
          ? `${esc(k)}<span class="hpuz-slash">/</span>`
          : esc(k),
      )
      .join('')

    return `
<section class="hpuz">
  <div class="hpuz-top${hasImg ? '' : ' hpuz-noimg'}">
    <div class="hpuz-brand">
      <span class="hpuz-brand-strong">${richSafe(d.brandStrong)}</span>
      <span class="hpuz-brand-light">${richSafe(d.brandLight)}</span>
    </div>
    <div class="hpuz-img-wrap">
      ${media(d.image, '', '제품 이미지')}
    </div>
  </div>
  <div class="hpuz-bot">
    <p class="hpuz-keywords">${keywordHtml}</p>
    <div class="hpuz-divider"></div>
    ${d.badge ? `<span class="hpuz-badge">${esc(d.badge)}</span>` : ''}
    <p class="hpuz-sub">${richSafe(d.sub)}</p>
  </div>
</section>`
  },
})
