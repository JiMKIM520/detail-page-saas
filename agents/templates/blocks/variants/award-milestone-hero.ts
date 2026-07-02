/** STATS/PROMO 아키타입: award-milestone-hero.
 *  [끝판왕] 어워드(수상·권위) #8 패턴을 토큰 기반으로 재구성(클론 아님, 패턴만).
 *  시그니처: 딥블랙 배경 + 왕관 아이콘 → 누적판매 마일스톤 초대형 헤드라인(3줄) →
 *  월계관 감싼 태그라인 + 서브카피 → 스포트라이트 원형 글로우 + 포디움 위 제품샷.
 *
 *  ⚠️  수상명·연도·기관은 반드시 플레이스홀더로 채울 것.
 *      근거 없는 수상 정보를 지어내는 것은 허위광고에 해당합니다.
 *      (tagline / subCopy 슬롯에 보증 문구를 입력할 때도 동일 원칙 적용) */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 마일스톤 상단 소제목 (예: "누적판매") — 마일스톤 숫자 위 작은 라벨 */
  eyebrow: z.string().min(1),
  /**
   * 초대형 마일스톤 숫자·단위 (em 허용 — 숫자 강조).
   * 예: "<span class=\"em\">약 N</span> 만개"
   * ⚠️ 실제 수치를 모를 경우 "약 N만개" 등 플레이스홀더 사용 필수.
   */
  milestoneNumber: z.string().min(1),
  /** 마일스톤 하단 강조어 (예: "돌파!") */
  milestoneSuffix: z.string().min(1).optional(),
  /**
   * 월계관 안 태그라인 (em 허용 — 핵심 키워드 강조).
   * 예: "품질이 <span class=\"em\">보증된</span> 국민템!"
   * ⚠️ 수상/인증 근거가 없는 경우 과장 표현 금지 — 플레이스홀더 사용 필수.
   */
  tagline: z.string().min(1),
  /** 태그라인 아래 서브카피 (선택) */
  subCopy: z.string().min(1).optional(),
  /** 포디움 위 제품 이미지 URL */
  productImage: z.string().optional(),
  /** 제품 이미지 alt 텍스트 */
  productImageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

/* ── 왕관 인라인 SVG ── */
const CROWN_SVG = `<svg class="amh-crown" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 왕관 외형 — 커머스 권위 신호 장식 (픽셀 클론 아님, 패턴만) -->
  <path d="M4 42 L8 16 L20 30 L32 6 L44 30 L56 16 L60 42 Z" stroke="#D4C9B0" stroke-width="2.2" stroke-linejoin="round" fill="none"/>
  <path d="M4 42 L8 16 L20 30 L32 6 L44 30 L56 16 L60 42 Z" fill="url(#amh-crown-grad)" opacity="0.18"/>
  <!-- 왕관 기저 밴드 -->
  <rect x="4" y="40" width="56" height="6" rx="2" fill="#C9A84C" opacity="0.55"/>
  <!-- 보석 심볼 (중앙 상단) -->
  <circle cx="32" cy="8" r="3.5" fill="#E8D48A" opacity="0.9"/>
  <circle cx="8" cy="18" r="2.4" fill="#D4C9B0" opacity="0.7"/>
  <circle cx="56" cy="18" r="2.4" fill="#D4C9B0" opacity="0.7"/>
  <defs>
    <linearGradient id="amh-crown-grad" x1="32" y1="6" x2="32" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
    </linearGradient>
  </defs>
</svg>`

/* ── 월계관(로렐 리스) 좌우 인라인 SVG — point-award-credential.ts 로렐 패턴 참조, 수평 확장형 ── */
const LAUREL_LEFT = `<svg class="amh-laurel amh-laurel-l" viewBox="0 0 70 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 줄기 곡선 -->
  <path d="M64 46 C50 42 32 36 12 28 C6 24 4 18 8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- 잎 타원 — 5장 -->
  <ellipse cx="54" cy="40" rx="8" ry="4" transform="rotate(-20 54 40)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="42" cy="34" rx="8" ry="4" transform="rotate(-30 42 34)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="30" cy="26" rx="8" ry="4" transform="rotate(-40 30 26)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="19" cy="19" rx="8" ry="4" transform="rotate(-50 19 19)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="11" cy="12" rx="7" ry="3.5" transform="rotate(-55 11 12)" stroke="currentColor" stroke-width="1.6" fill="none"/>
</svg>`

const LAUREL_RIGHT = `<svg class="amh-laurel amh-laurel-r" viewBox="0 0 70 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 줄기 곡선 (좌우 반전) -->
  <path d="M6 46 C20 42 38 36 58 28 C64 24 66 18 62 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- 잎 타원 — 5장 -->
  <ellipse cx="16" cy="40" rx="8" ry="4" transform="rotate(20 16 40)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="28" cy="34" rx="8" ry="4" transform="rotate(30 28 34)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="40" cy="26" rx="8" ry="4" transform="rotate(40 40 26)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="51" cy="19" rx="8" ry="4" transform="rotate(50 51 19)" stroke="currentColor" stroke-width="1.6" fill="none"/>
  <ellipse cx="59" cy="12" rx="7" ry="3.5" transform="rotate(55 59 12)" stroke="currentColor" stroke-width="1.6" fill="none"/>
</svg>`

export const awardMilestoneHero = defineBlock<Data>({
  id: 'award-milestone-hero',
  archetype: 'stats' as any,
  styleTags: ['dark', 'award', 'milestone', 'stage', 'spotlight', 'premium', 'gold', 'template'],
  imageSlots: 1,
  describe:
    '어워드 마일스톤 히어로. 딥블랙 배경 + 왕관 아이콘 → 초대형 누적판매 마일스톤 숫자(3줄 eyebrow/number/suffix) → 월계관(로렐 리스) 감싼 골드 태그라인 + 서브카피 → 스포트라이트 원형 글로우 + 포디움 위 제품샷. 단일 수치(마일스톤)가 헤드라인 핵심인 어워드·판매 실적 섹션. ⚠️ 수상명·수치·기관은 플레이스홀더 필수.',
  schema,
  css: `
/* award-milestone-hero — 접두사 amh- */
.amh{
  position:relative;background:#0D0D0F;color:#fff;
  padding:64px 40px 0;text-align:center;
  word-break:keep-all;overflow-wrap:break-word;overflow:hidden
}

/* 배경 파티클 효과 — radial-gradient 스포트라이트 레이어 */
.amh::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(ellipse 60% 40% at 50% 20%, rgba(201,168,76,.07) 0%, transparent 70%),
    radial-gradient(ellipse 80% 60% at 50% 75%, rgba(255,255,255,.04) 0%, transparent 65%);
  z-index:0
}

/* 왕관 아이콘 */
.amh-crown{
  width:54px;height:42px;display:block;
  margin:0 auto 12px;position:relative;z-index:1
}

/* 마일스톤 3줄 헤드라인 영역 */
.amh-milestone{position:relative;z-index:1;margin-bottom:32px}
.amh-eyebrow{
  font-family:var(--font-body);font-size:16px;font-weight:700;
  letter-spacing:.06em;color:rgba(255,255,255,.55);margin-bottom:4px
}
.amh-number{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(54px,13vw,88px);line-height:1.06;
  letter-spacing:-.03em;color:#fff
}
/* 마일스톤 숫자 강조 — 골드 계열(커머스 권위 신호) */
.amh-number .em{color:#E8D48A}
.amh-suffix{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(32px,7vw,52px);line-height:1.14;
  letter-spacing:-.02em;color:#fff;margin-top:2px
}

/* 월계관 + 태그라인 래퍼 */
.amh-wreath-wrap{
  position:relative;z-index:1;
  display:flex;align-items:center;justify-content:center;
  gap:4px;margin-bottom:10px;flex-wrap:nowrap
}
.amh-laurel{
  width:54px;height:42px;
  color:#C9A84C;flex-shrink:0;opacity:.88
}
/* 우측 월계관: CSS transform으로 수평 반전(viewBox 자체는 이미 반전) */
.amh-laurel-r{transform:none}
.amh-tagline{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(20px,5vw,32px);line-height:1.22;
  letter-spacing:-.01em;color:#fff;
  padding:0 6px;flex:0 1 auto;max-width:calc(100% - 130px)
}
/* 다크 배경 — .em은 골드(커머스 신뢰 신호) */
.amh-tagline .em{color:#E8D48A}

/* 서브카피 */
.amh-sub{
  position:relative;z-index:1;
  font-family:var(--font-body);font-size:15px;line-height:1.6;
  color:rgba(255,255,255,.50);margin-bottom:36px
}

/* 스테이지 영역 — 스포트라이트 + 포디움 + 제품샷 */
.amh-stage{
  position:relative;z-index:1;
  margin:0 -40px;padding-top:12px
}

/* 스포트라이트 원형 글로우 링 */
.amh-spotlight{
  position:absolute;left:50%;top:50%;
  transform:translate(-50%, -50%);
  width:340px;height:340px;border-radius:50%;
  box-shadow:0 0 0 2px rgba(255,255,255,.20), 0 0 60px 4px rgba(255,255,255,.08);
  pointer-events:none;z-index:0
}

/* 포디움 — clip-path 원기둥 근사 (사각형 스택) */
.amh-podium{
  position:relative;z-index:1;
  width:100%;display:flex;flex-direction:column;align-items:center
}
.amh-podium-top{
  width:72%;height:18px;border-radius:50% 50% 0 0 / 100% 100% 0 0;
  background:linear-gradient(180deg,#2A2820 0%,#1A1810 100%);
  box-shadow:0 -2px 8px rgba(201,168,76,.12)
}
.amh-podium-body{
  width:80%;height:52px;
  background:linear-gradient(180deg,#1E1C18 0%,#141210 100%);
  position:relative;overflow:hidden
}
/* 포디움 골드 라인 밴드 */
.amh-podium-body::before{
  content:'';position:absolute;bottom:14px;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent 0%,#C9A84C 20%,#F5D77E 50%,#C9A84C 80%,transparent 100%);
  opacity:.8
}
.amh-podium-body::after{
  content:'';position:absolute;bottom:8px;left:0;right:0;height:1.5px;
  background:linear-gradient(90deg,transparent 0%,#C9A84C 20%,#F5D77E 50%,#C9A84C 80%,transparent 100%);
  opacity:.5
}
/* 포디움 하단 그림자 */
.amh-podium-shadow{
  width:86%;height:24px;border-radius:50%;
  background:radial-gradient(ellipse at center,rgba(201,168,76,.18) 0%,transparent 70%);
  margin-top:4px
}

/* 제품 이미지 */
.amh-product{
  position:relative;z-index:2;
  width:56%;max-width:320px;margin:0 auto;
  aspect-ratio:3/4;object-fit:contain;display:block
}
.amh-product.ph{
  aspect-ratio:3/4;width:56%;max-width:320px;margin:0 auto;
  background:rgba(255,255,255,.05);border:1.5px dashed rgba(255,255,255,.18);
  color:rgba(255,255,255,.28);font-size:13px;display:flex;
  align-items:center;justify-content:center
}
`,
  render: (d, { esc, richSafe }) => {
    const suffixHtml = d.milestoneSuffix
      ? `<div class="amh-suffix">${esc(d.milestoneSuffix)}</div>`
      : ''
    const subCopyHtml = d.subCopy
      ? `<p class="amh-sub">${esc(d.subCopy)}</p>`
      : ''

    return `
<section class="amh">
  ${CROWN_SVG}

  <div class="amh-milestone">
    <div class="amh-eyebrow">${esc(d.eyebrow)}</div>
    <div class="amh-number">${richSafe(d.milestoneNumber)}</div>
    ${suffixHtml}
  </div>

  <div class="amh-wreath-wrap">
    ${LAUREL_LEFT}
    <h2 class="amh-tagline">${richSafe(d.tagline)}</h2>
    ${LAUREL_RIGHT}
  </div>
  ${subCopyHtml}

  <div class="amh-stage">
    <div class="amh-spotlight"></div>
    <div class="amh-podium">
      ${media(d.productImage, 'amh-product', esc(d.productImageAlt ?? '제품 이미지'))}
      <div class="amh-podium-top"></div>
      <div class="amh-podium-body"></div>
      <div class="amh-podium-shadow"></div>
    </div>
  </div>
</section>`
  },
})
