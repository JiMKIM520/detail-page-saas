/** FEATURE 아키타입: feature-quad-imgcap-grid
 *  피그마 188_제품소개_17 구조 흡수 — 클론 금지.
 *  구조: 섹션태그 → 전체폭 히어로 사진 → 색상 배지 서브타이틀 → 2×2 이미지+색상캡션 그리드.
 *  핵심 장치: 브랜드 컬러 필 캡션 박스에 흰 텍스트로 세부 특징 4종 동시 노출.
 *  noimg-safe: 사진 부재 시 캡션 박스만으로 완결 렌더 (박스 높이 고정 확장).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const cardSchema = z.object({
  image: z.string().optional(),       // 카드 상단 사진 (url)
  label: z.string().min(1),           // 캡션 박스 타이틀 (em 허용)
  desc: z.string().min(1),            // 캡션 박스 본문 (em 허용)
})

const schema = z.object({
  tag: z.string().optional(),         // 섹션 태그 (예: "# 제품소개") — 기본값 있음
  headline: z.string().min(1),        // 히어로 아래 대제목 (em,br)
  sub: z.string().optional(),         // 대제목 아래 한 줄 설명
  heroImage: z.string().optional(),   // 전체폭 히어로 이미지 (url)
  badgeText: z.string().min(1),       // 색상 배지 안 서브타이틀 (em,br)
  badgeSub: z.string().optional(),    // 배지 아래 한 줄 설명
  cards: z.array(cardSchema).length(4), // 2×2 그리드 카드 정확히 4개
})
type Data = z.infer<typeof schema>

export const featureQuadImgcapGrid = defineBlock<Data>({
  id: 'feature-quad-imgcap-grid',
  archetype: 'feature',
  styleTags: ['light', 'template', 'editorial', 'product', 'noimg-safe'],
  imageSlots: 5, // heroImage + 카드 4장
  describe:
    '제품 세부 특징 4종 동시 노출. 섹션태그 + 대제목 + 전체폭 히어로 사진 + 색상 배지 서브타이틀 + 2×2 이미지·브랜드필 캡션 그리드. 라이트 배경. 이미지 부재 시 캡션 박스만으로 완결(noimg-safe).',
  schema,
  css: `
/* ── feature-quad-imgcap-grid ─────────────────────────── frlm prefix ── */
.frlm{background:var(--bg);color:var(--ink);padding-bottom:72px}

/* 섹션 태그 */
.frlm-tag{padding:44px var(--pad-x,56px) 14px;font-family:var(--font-display);font-size:32px;font-weight:600;color:var(--muted);letter-spacing:.01em}

/* 대제목 블록 */
.frlm-hd{padding:0 var(--pad-x,56px) 8px}
.frlm-headline{font-family:var(--font-display);font-size:46px;font-weight:700;line-height:1.18;letter-spacing:-.02em;color:var(--ink);text-wrap:balance}
.frlm-headline .em{color:var(--accent-d)}
.frlm-headsub{margin-top:14px;font-size:19px;color:var(--ink-2);line-height:1.65;font-weight:400}

/* 전체폭 히어로 사진 */
.frlm-hero-wrap{margin-top:32px;width:100%;overflow:hidden}
.frlm-hero-wrap img,.frlm-hero-wrap .ph{width:100%;height:540px;object-fit:cover;display:block;border-radius:0}
/* noimg-safe: 히어로 사진 없으면 wrap 자체를 숨겨 공백 방지 */
.frlm-hero-wrap:has(.ph){display:none}

/* 색상 배지 서브타이틀 */
.frlm-badge-row{padding:40px var(--pad-x,56px) 0;display:flex;flex-direction:column;align-items:center;gap:16px}
.frlm-badge{display:inline-block;background:var(--brand);color:#ffffff;padding:12px 36px;border-radius:calc(var(--r-scale,1)*8px);font-family:var(--font-display);font-size:28px;font-weight:700;line-height:1.2;text-align:center;letter-spacing:-.01em}
.frlm-badge .em{color:var(--em-dark,#FFF7EA)}
.frlm-badge-sub{font-size:17px;color:var(--ink-2);text-align:center;line-height:1.6;max-width:580px;font-weight:400}

/* 2×2 그리드 */
.frlm-grid{margin-top:36px;padding:0 var(--pad-x,56px);display:grid;grid-template-columns:1fr 1fr;gap:20px}

/* 카드 */
.frlm-card{display:flex;flex-direction:column;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;box-shadow:0 4px 20px -6px rgba(0,0,0,.12)}

/* 카드 사진 프레임 */
.frlm-card-img{width:100%;aspect-ratio:370/280;overflow:hidden;background:var(--line)}
.frlm-card-img img,.frlm-card-img .ph{width:100%;height:100%;object-fit:cover;display:block;border-radius:0}
/* noimg-safe: 사진 없으면 사진 프레임을 숨겨 캡션 박스가 카드 전체를 채움 */
.frlm-card-img:has(.ph){display:none}

/* 카드 캡션 박스 */
.frlm-card-cap{background:var(--brand);color:#ffffff;padding:20px 22px 24px;flex:1}
.frlm-card-label{font-family:var(--font-display);font-size:20px;font-weight:700;line-height:1.3;color:#ffffff;letter-spacing:-.01em}
.frlm-card-label .em{color:var(--em-dark,#FFF7EA)}
.frlm-card-desc{margin-top:8px;font-size:15px;font-weight:400;line-height:1.6;color:rgba(255,255,255,.88)}
.frlm-card-desc .em{color:var(--em-dark,#FFF7EA)}
/* noimg-safe 시 캡션 패딩 확장 */
.frlm-card:not(:has(.frlm-card-img)) .frlm-card-cap,
.frlm-card:has(.frlm-card-img:empty) .frlm-card-cap{padding:32px 22px 32px}
`,
  render: (d, { esc, richSafe }) => `
<section class="frlm">
  <p class="frlm-tag">${esc(d.tag ?? '# 제품소개')}</p>

  <div class="frlm-hd">
    <h2 class="frlm-headline">${richSafe(d.headline)}</h2>
    ${d.sub ? `<p class="frlm-headsub">${esc(d.sub)}</p>` : ''}
  </div>

  <div class="frlm-hero-wrap">
    ${media(d.heroImage, 'frlm-hero', '제품 메인 이미지')}
  </div>

  <div class="frlm-badge-row">
    <span class="frlm-badge">${richSafe(d.badgeText)}</span>
    ${d.badgeSub ? `<p class="frlm-badge-sub">${esc(d.badgeSub)}</p>` : ''}
  </div>

  <div class="frlm-grid">
    ${d.cards.map((c) => `
    <div class="frlm-card">
      <div class="frlm-card-img">
        ${media(c.image, 'frlm-cimg', esc(c.label))}
      </div>
      <div class="frlm-card-cap">
        <p class="frlm-card-label">${richSafe(c.label)}</p>
        <p class="frlm-card-desc">${richSafe(c.desc)}</p>
      </div>
    </div>`).join('')}
  </div>
</section>`,
})
