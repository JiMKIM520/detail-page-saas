/** LINEUP 아키타입(템플릿 충실 재현): 08_상품 구성 _히어로페이드리스트.
 *  피그마 204:392 — 풀블리드 히어로(accent→fade) + 흰 셰이프 오버레이 + 중앙 제목/소제목;
 *  "OUR PACKAGE" 아이브로 + 헤어라인 구분 + 텍스트 전용 3행(이름/설명 좌, 정가취소+accent가격 우).
 *  package-hero-list(히어로 이미지 아래 배치)와 구별: 히어로 영역에 accent fade 그라디언트 + 흰 웨이브 오버레이. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subtitle: z.string().min(1).optional(),       // 히어로 상단 소제목 (예: "여러분을 위한 상품 패키지입니다")
  title: z.string().min(1).optional(),           // 히어로 대제목 (기본 "WHAT'S FOR YOU?")  (em,br)
  heroImage: z.string().optional(),              // (url) 히어로 영역 배경 이미지 (페이드 오버레이 아래)
  sectionLabel: z.string().min(1).optional(),    // 패키지 리스트 상단 섹션 라벨 (기본 "OUR PACKAGE")
  packages: z
    .array(
      z.object({
        name: z.string().min(1),                 // (em,br) 패키지명 (좌측 굵은)
        desc: z.string().min(1).optional(),      // 패키지 설명 (em,br)
        priceOriginal: z.string().min(1).optional(), // 정가 취소선 텍스트
        price: z.string().min(1).optional(),     // 최종가 accent 강조
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageHeroFadeList = defineBlock<Data>({
  id: 'package-hero-fade-list',
  archetype: 'lineup',
  styleTags: ['premium', 'light', 'template', 'pricing', 'centered', 'fade', 'colorblock'],
  imageSlots: 1,
  describe:
    '상품 구성(히어로 페이드+텍스트 리스트). accent 풀블리드 히어로(그라디언트 페이드+체커 오버레이+흰 웨이브) + 중앙 소제목·대형 display 타이틀 + "OUR PACKAGE" 섹션 라벨 + 헤어라인 구분 텍스트 리스트(이름/설명 좌, 정가취소선+accent가격 우). 이미지 없는 패키지 행.',
  schema,
  css: `
.phfl{background:var(--bg);color:var(--ink)}

/* ── 히어로 영역 ── */
.phfl-hero{position:relative;overflow:hidden;min-height:380px;background:color-mix(in srgb,var(--accent) 72%,var(--brand))}
.phfl-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:.32}
/* 체커보드 패턴 오버레이 (Figma 반투명 격자 재현) */
.phfl-hero::before{
  content:"";position:absolute;inset:0;z-index:1;
  background-image:
    linear-gradient(45deg,rgba(255,255,255,.13) 25%,transparent 25%),
    linear-gradient(-45deg,rgba(255,255,255,.13) 25%,transparent 25%),
    linear-gradient(45deg,transparent 75%,rgba(255,255,255,.13) 75%),
    linear-gradient(-45deg,transparent 75%,rgba(255,255,255,.13) 75%);
  background-size:24px 24px;
  background-position:0 0,0 12px,12px -12px,-12px 0;
}
/* 히어로 하단 흰 웨이브 오버레이 */
.phfl-hero::after{
  content:"";position:absolute;bottom:-2px;left:0;right:0;z-index:2;
  height:72px;
  background:var(--bg);
  clip-path:ellipse(56% 100% at 50% 100%);
}
/* 히어로 텍스트 */
.phfl-hd{
  position:relative;z-index:3;
  text-align:center;padding:52px 44px 76px;
  display:flex;flex-direction:column;align-items:center;gap:0;
}
.phfl-sub{font-size:15px;font-weight:600;color:rgba(255,255,255,.88);letter-spacing:.01em;margin-bottom:12px}
.phfl-title{
  font-family:var(--font-display);font-weight:800;font-size:66px;
  color:#fff;letter-spacing:-.02em;line-height:1.06;
  text-shadow:0 2px 18px rgba(0,0,0,.18);
}
.phfl-title .em{color:color-mix(in srgb,#fff 70%,var(--accent))}

/* ── 섹션 라벨 ── */
.phfl-sec{
  text-align:center;padding:36px 44px 8px;
}
.phfl-sec-lbl{
  display:inline-block;
  font-family:var(--font-display);font-weight:800;font-size:18px;
  letter-spacing:.18em;color:var(--accent);
  padding-bottom:8px;
  border-bottom:2px solid var(--accent);
}

/* ── 패키지 리스트 ── */
.phfl-list{padding:8px 44px 56px}
.phfl-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:26px 0}
.phfl-row+.phfl-row{border-top:1px solid var(--line)}
.phfl-left{flex:1 1 auto}
.phfl-name{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);line-height:1.25}
.phfl-name .em{color:var(--accent)}
.phfl-desc{margin-top:6px;font-size:13px;color:var(--ink-2);line-height:1.55}
.phfl-desc .em{color:var(--accent);font-weight:600}
.phfl-right{flex:0 0 auto;text-align:right}
.phfl-orig{font-size:13px;color:var(--muted);text-decoration:line-through;margin-bottom:4px;letter-spacing:.01em}
.phfl-price{font-family:var(--font-display);font-weight:800;font-size:24px;color:var(--accent);line-height:1.15}
`,
  render: (d, { esc, richSafe }) => `
<section class="phfl">
  <div class="phfl-hero">
    ${d.heroImage ? media(d.heroImage, 'phfl-hero-img', '상품 히어로') : '<div class="phfl-hero-img ph" style="position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:0">상품 이미지</div>'}
    <div class="phfl-hd">
      ${d.subtitle ? `<p class="phfl-sub">${esc(d.subtitle)}</p>` : ''}
      <h2 class="phfl-title">${richSafe(d.title ?? "WHAT'S<br>FOR YOU?")}</h2>
    </div>
  </div>
  <div class="phfl-sec">
    <span class="phfl-sec-lbl">${esc(d.sectionLabel ?? 'OUR PACKAGE')}</span>
  </div>
  <div class="phfl-list">
    ${d.packages
      .map(
        (p) => `
    <div class="phfl-row">
      <div class="phfl-left">
        <div class="phfl-name">${richSafe(p.name)}</div>
        ${p.desc ? `<div class="phfl-desc">${richSafe(p.desc)}</div>` : ''}
      </div>
      ${
        p.price || p.priceOriginal
          ? `<div class="phfl-right">${p.priceOriginal ? `<div class="phfl-orig">${esc(p.priceOriginal)}</div>` : ''}${p.price ? `<div class="phfl-price">${esc(p.price)}</div>` : ''}</div>`
          : ''
      }
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
