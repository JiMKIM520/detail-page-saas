/** POINT 아키타입: point-heritage-split.
 *  [끝판왕] 포인트 구성 #9 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: deep crimson 다크 배경 + 단청/용문 엠보스 패턴 오버레이 +
 *  이중언어(한·한자) 대형 골드 세리프 브랜드 네임 +
 *  캡션 밴드(PREMIUM BRAND 아이레브로 + 슬로건) +
 *  하단 풀블리드 제품 사진(텍스트 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드 1행 (한글, 예: "명가") */
  brandKo: z.string().min(1),
  /** 브랜드 한자/영문 병기 (예: "名家") — 선택 */
  brandHanja: z.string().optional(),
  /** 브랜드 2행 (예: "한우") — 선택 */
  brandSub: z.string().optional(),
  /** 캡션 밴드 eyebrow 라벨 (예: "PREMIUM BRAND") */
  eyebrow: z.string().min(1),
  /** 캡션 밴드 슬로건 (em 허용) */
  slogan: z.string().min(1),
  /** 하단 풀블리드 제품 사진 URL */
  image: z.string().optional(),
  /** 제품 사진 alt */
  imageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const pointHeritageSplit = defineBlock<Data>({
  id: 'point-heritage-split',
  archetype: 'point' as any,
  styleTags: ['heritage', 'dark', 'crimson', 'korean', 'luxury', 'bilingual', 'template'],
  imageSlots: 1,
  describe:
    '헤리티지 포인트 + 풀블리드 제품 사진 2단 분할. 다크 크림슨 배경에 단청/용문 패턴 엠보스 오버레이 + 이중언어(한·한자) 대형 골드 세리프 브랜드 네임 + PREMIUM BRAND 아이레브로 + 슬로건 캡션 밴드. 하단은 텍스트 없는 풀블리드 제품 사진. 한우·명품 식품·프리미엄 뷰티 등 헤리티지 강조 브랜드에 적합.',
  schema,
  css: `
/* point-heritage-split — 접두사 phs- */
.phs{background:#1a0a0a;overflow:hidden;word-break:keep-all}

/* ── 상단 헤리티지 패널 ── */
.phs-hero{
  position:relative;
  background:#5c0a14;
  padding:48px 40px 0;
  text-align:center;
  overflow:hidden;
}

/* 단청/용문 패턴 엠보스 — SVG 반복 배경(투명 오버레이) */
.phs-hero::before{
  content:'';
  position:absolute;
  inset:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='28' fill='none' stroke='%23fff' stroke-width='0.8' stroke-dasharray='4 4' opacity='0.15'/%3E%3Ccircle cx='40' cy='40' r='16' fill='none' stroke='%23fff' stroke-width='0.5' opacity='0.10'/%3E%3Cpath d='M40 12 L46 28 L62 28 L50 38 L54 54 L40 44 L26 54 L30 38 L18 28 L34 28 Z' fill='none' stroke='%23fff' stroke-width='0.6' opacity='0.10'/%3E%3Ccircle cx='40' cy='40' r='4' fill='none' stroke='%23c8a84b' stroke-width='0.7' opacity='0.18'/%3E%3Cpath d='M0 0 Q10 5 20 0 Q30 -5 40 0 Q50 5 60 0 Q70 -5 80 0' fill='none' stroke='%23c8a84b' stroke-width='0.4' opacity='0.12'/%3E%3Cpath d='M0 80 Q10 75 20 80 Q30 85 40 80 Q50 75 60 80 Q70 85 80 80' fill='none' stroke='%23c8a84b' stroke-width='0.4' opacity='0.12'/%3E%3Cpath d='M0 0 Q5 10 0 20 Q-5 30 0 40 Q5 50 0 60 Q-5 70 0 80' fill='none' stroke='%23c8a84b' stroke-width='0.4' opacity='0.12'/%3E%3Cpath d='M80 0 Q75 10 80 20 Q85 30 80 40 Q75 50 80 60 Q85 70 80 80' fill='none' stroke='%23c8a84b' stroke-width='0.4' opacity='0.12'/%3E%3C/svg%3E");
  background-size:80px 80px;
  pointer-events:none;
  z-index:0;
}

/* 방사형 그라데이션 — 중앙 약간 밝게(캔들 효과) */
.phs-hero::after{
  content:'';
  position:absolute;
  inset:0;
  background:radial-gradient(ellipse 70% 60% at 50% 40%,rgba(180,30,50,.22) 0%,transparent 70%);
  pointer-events:none;
  z-index:0;
}

.phs-brand{
  position:relative;
  z-index:1;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:18px;
  margin-bottom:0;
}

/* 좌우 장식선 */
.phs-brand::before,.phs-brand::after{
  content:'';
  flex:1;
  height:1px;
  background:linear-gradient(90deg,transparent,#c8a84b 60%,transparent);
  opacity:.6;
  max-width:60px;
}

.phs-name-ko{
  font-family:'Gowun Batang','Cormorant Garamond',var(--font-serif),serif;
  font-weight:700;
  font-size:clamp(44px,11vw,64px);
  color:#c8a84b;
  letter-spacing:.06em;
  line-height:1.0;
  text-shadow:0 2px 18px rgba(200,168,75,.35);
}

.phs-hanja-wrap{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:2px;
}

.phs-name-hanja{
  font-family:'Gowun Batang','Cormorant Garamond',var(--font-serif),serif;
  font-weight:700;
  font-size:clamp(22px,5.5vw,32px);
  color:#e8c86a;
  letter-spacing:.08em;
  line-height:1.1;
  opacity:.92;
  writing-mode:vertical-rl;
  text-orientation:upright;
}

.phs-name-sub{
  font-family:'Gowun Batang','Cormorant Garamond',var(--font-serif),serif;
  font-weight:700;
  font-size:clamp(44px,11vw,64px);
  color:#c8a84b;
  letter-spacing:.06em;
  line-height:1.0;
  text-shadow:0 2px 18px rgba(200,168,75,.35);
}

/* 브랜드 네임 하단 장식 라인 */
.phs-ornament{
  position:relative;
  z-index:1;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  margin-top:14px;
  padding-bottom:28px;
}
.phs-ornament-line{
  width:48px;
  height:1px;
  background:linear-gradient(90deg,transparent,#c8a84b);
  opacity:.55;
}
.phs-ornament-line.r{
  background:linear-gradient(90deg,#c8a84b,transparent);
}
.phs-ornament-diamond{
  width:6px;
  height:6px;
  background:#c8a84b;
  transform:rotate(45deg);
  opacity:.75;
}

/* ── 캡션 밴드 ── */
.phs-caption{
  position:relative;
  z-index:1;
  background:#fff;
  padding:14px 24px 16px;
  text-align:center;
}
.phs-eyebrow{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:11px;
  font-weight:700;
  letter-spacing:.22em;
  color:var(--accent-d);
  text-transform:uppercase;
  margin-bottom:6px;
  opacity:.85;
}
.phs-slogan{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:clamp(14px,3.4vw,17px);
  font-weight:600;
  color:var(--ink);
  line-height:1.5;
  letter-spacing:-.01em;
}
.phs-slogan .em{
  color:var(--accent-d);
  font-weight:800;
}

/* ── 하단 제품 사진 ── */
.phs-product{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block;
}
.phs-product.ph{
  width:100%;
  aspect-ratio:1/1;
  background:#111;
  border:none;
  border-radius:0;
  color:rgba(255,255,255,.3);
}
`,
  render: (d, { esc, richSafe }) => {
    const brandBlock = `
    <div class="phs-brand">
      <span class="phs-name-ko">${esc(d.brandKo)}</span>
      ${
        d.brandHanja || d.brandSub
          ? `<div class="phs-hanja-wrap">
        ${d.brandHanja ? `<span class="phs-name-hanja">${esc(d.brandHanja)}</span>` : ''}
      </div>`
          : ''
      }
      ${d.brandSub ? `<span class="phs-name-sub">${esc(d.brandSub)}</span>` : ''}
    </div>`

    return `
<section class="phs">
  <div class="phs-hero">
    ${brandBlock}
    <div class="phs-ornament">
      <div class="phs-ornament-line"></div>
      <div class="phs-ornament-diamond"></div>
      <div class="phs-ornament-line r"></div>
    </div>
  </div>
  <div class="phs-caption">
    <div class="phs-eyebrow">${esc(d.eyebrow)}</div>
    <div class="phs-slogan">${richSafe(d.slogan)}</div>
  </div>
  ${media(d.image, 'phs-product', esc(d.imageAlt ?? '제품 이미지'))}
</section>`
  },
})
