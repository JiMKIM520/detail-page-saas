/** POINT/FEATURE 아키타입: feature-dark-float-cutout.
 *  [끝판왕] 포인트 구성 #7 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + 대형 헤드라인 → floating product cutout(좌상 오버플로) +
 *  overflow lifestyle 이미지 카드 + 우하 burst 할인 뱃지 오버레이 + eyebrow 라벨 + 서술 카피. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 대형 헤드라인 (em 허용 — 일부 어절 accent 강조, br 허용) */
  headline: z.string().min(1),
  /** 라이프스타일 풀폭 이미지 URL (카드 메인) */
  lifestyleImage: z.string().optional(),
  /** 라이프스타일 이미지 alt */
  lifestyleAlt: z.string().optional(),
  /** 누끼 제품 컷아웃 이미지 URL (좌상 플로팅, optional) */
  cutoutImage: z.string().optional(),
  /** 컷아웃 이미지 alt */
  cutoutAlt: z.string().optional(),
  /** 우하단 burst 뱃지 텍스트 (예: "~35%", "BEST") — 없으면 뱃지 숨김 */
  badgeMain: z.string().optional(),
  /** burst 뱃지 서브 레이블 (예: "SALE", "OFF") — 없으면 생략 */
  badgeSub: z.string().optional(),
  /** 이미지 하단 eyebrow 제품명 라벨 (작은 회색 텍스트) */
  eyebrow: z.string().optional(),
  /** 본문 설명 카피 (em/br 허용, 2~4줄) */
  body: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const featureDarkFloatCutout = defineBlock<Data>({
  id: 'feature-dark-float-cutout',
  archetype: 'point',
  styleTags: ['dark', 'lifestyle', 'float', 'badge', 'commerce', 'template'],
  imageSlots: 2,
  describe:
    '포인트 다크 플로팅 컷아웃. 다크 배경 + 대형 헤드라인 + overflow 라이프스타일 이미지 카드(좌상 누끼 제품 플로팅 오버랩 + 우하 burst 할인/강조 뱃지) + eyebrow 제품 라벨 + 서술 카피. 패션/라이프스타일 강조 커머스 포인트 섹션.',
  schema,
  css: `
/* feature-dark-float-cutout — 접두사 fdfc- */
.fdfc{background:var(--ink);padding:52px 0 60px;word-break:keep-all;overflow-wrap:break-word}
/* 헤드라인 영역 */
.fdfc-hd{padding:0 36px 36px}
.fdfc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,7.8vw,52px);line-height:1.22;letter-spacing:-.025em;color:#fff}
.fdfc-title .em{color:var(--accent)}
/* 이미지 카드 래퍼 — 좌우 패딩으로 살짝 안쪽 여백, overflow visible로 플로팅 컷아웃 노출 */
.fdfc-card{position:relative;margin:0 20px;border-radius:16px;overflow:visible}
/* 라이프스타일 이미지 */
.fdfc-life{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;border-radius:16px}
.fdfc-life.ph{width:100%;aspect-ratio:3/4;border-radius:16px;border:2px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.05);color:rgba(255,255,255,.3)}
/* 누끼 컷아웃 — 좌상단 오버플로 플로팅 */
.fdfc-cutout-wrap{position:absolute;top:-28px;left:-16px;z-index:3;width:38%;max-width:160px;pointer-events:none}
.fdfc-cutout{width:100%;aspect-ratio:3/4;object-fit:contain;display:block;filter:drop-shadow(0 8px 24px rgba(0,0,0,.55))}
.fdfc-cutout.ph{width:100%;aspect-ratio:3/4;background:rgba(255,255,255,.08);border:2px dashed rgba(255,255,255,.2);color:rgba(255,255,255,.3);border-radius:10px}
/* 우하단 burst 할인 뱃지 */
.fdfc-badge{position:absolute;bottom:14px;right:14px;z-index:4;width:78px;height:78px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#E8002D;color:#fff;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);text-align:center}
.fdfc-badge-main{font-family:var(--font-display);font-weight:800;font-size:18px;line-height:1;letter-spacing:-.02em}
.fdfc-badge-sub{font-family:var(--font-body);font-weight:800;font-size:10px;letter-spacing:.08em;margin-top:1px;opacity:.92}
/* eyebrow 라벨 */
.fdfc-eyebrow{margin:18px 20px 0;font-family:var(--font-body);font-size:13px;font-weight:400;color:rgba(255,255,255,.5);letter-spacing:.01em}
/* 본문 카피 */
.fdfc-body{margin:14px 20px 0;font-family:var(--font-body);font-size:16px;line-height:1.72;color:rgba(255,255,255,.82)}
.fdfc-body .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const hasBadge = d.badgeMain

    return `
<section class="fdfc">
  <div class="fdfc-hd">
    <h2 class="fdfc-title">${richSafe(d.headline)}</h2>
  </div>
  <div class="fdfc-card">
    ${media(d.lifestyleImage, 'fdfc-life', esc(d.lifestyleAlt ?? '라이프스타일 이미지'))}
    <div class="fdfc-cutout-wrap">${media(d.cutoutImage, 'fdfc-cutout', esc(d.cutoutAlt ?? '제품 이미지'))}</div>
    ${hasBadge
      ? `<div class="fdfc-badge" role="img" aria-label="${esc(d.badgeMain)}${d.badgeSub ? ' ' + esc(d.badgeSub) : ''}"><span class="fdfc-badge-main">${esc(d.badgeMain)}</span>${d.badgeSub ? `<span class="fdfc-badge-sub">${esc(d.badgeSub)}</span>` : ''}</div>`
      : ''}
  </div>
  ${d.eyebrow ? `<p class="fdfc-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  ${d.body ? `<p class="fdfc-body">${richSafe(d.body)}</p>` : ''}
</section>`
  },
})
