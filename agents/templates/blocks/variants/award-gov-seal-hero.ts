/** FEATURE 아키타입: award-gov-seal-hero.
 *  [끝판왕] 어워드(수상·권위) #6 패턴을 토큰 기반으로 재구성(클론 아님).
 *
 *  시그니처:
 *   - 딥브라운/블랙 배경 + 스포트라이트 글로우
 *   - 상단 아이브로우(small centered) + 풀쿼트 대형 골드 헤드라인
 *   - 다면 크리스탈 메달리온(팔각형 facet SVG) + 중앙 정부기관 원형 씰 이미지
 *   - 씰 아래 수상 부문 라벨
 *   - 좌우 대칭 골드 월계수 리스 (인라인 SVG — point-award-credential 로렐 SVG 패턴 확장)
 *   - 하단 3단 원형 포디움(clip-path CSS 스택) + 대리석 사각 베이스
 *
 *  ⚠️  수상명·연도·기관명은 반드시 플레이스홀더로 채워야 한다.
 *      brief(제품별 근거) 없이 특정 기관명·수상연도를 지어내는 것은 금지다.
 *      (허위 인증 표기는 전자상거래법 위반 소지)
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 아이브로우 — 제품 카테고리나 브랜드 포지셔닝 한 줄
   *  예: "[제품명] 전문 브랜드 중 국내유일" */
  eyebrow: z.string().min(1).optional(),

  /** 풀쿼트 대형 헤드라인 — em으로 인용 기관명 강조 가능
   *  ⚠️  실제 수상 근거 없이 기관명 지어내기 금지. 플레이스홀더 사용.
   *  예: "<span class=\"em\">\"[기관명]\"</span><br>처장상 수상" */
  headline: z.string().min(1),

  /** 수상 부문 라벨 — 메달리온 씰 하단에 표시
   *  예: "[제품 안전 부문]" */
  category: z.string().min(1).optional(),

  /** 정부기관 씰/엠블럼 이미지 URL (선택 — 없으면 원형 플레이스홀더)
   *  실제 공공기관 로고 사용 시 해당 기관 이미지 사용 정책 준수 필요 */
  sealImage: z.string().optional(),

  /** 씰 이미지 alt 텍스트 */
  sealAlt: z.string().optional(),

  /** 수상 연도 또는 수상 요약 뱃지 라인 (선택)
   *  예: "2024년 수상" */
  yearBadge: z.string().optional(),
})
type Data = z.infer<typeof schema>

/* ── 인라인 SVG 에셋 ────────────────────────────────────────────────────────── */

/** 다면 크리스탈 메달리온 — 팔각 facet 실루엣 (패턴만, 픽셀 클론 아님) */
const CRYSTAL_MEDALLION = `<svg class="agsh-crystal" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 외곽 팔각 폴리곤 -->
  <polygon points="75,10 125,10 170,45 185,95 170,145 125,185 75,185 30,145 15,95 30,45"
    fill="url(#agsh-crystal-fill)" stroke="url(#agsh-gold)" stroke-width="1.5" opacity="0.92"/>
  <!-- facet 선 — 중심에서 꼭짓점으로 뻗는 절개선 -->
  <line x1="100" y1="100" x2="75"  y2="10"  stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="125" y2="10"  stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="170" y2="45"  stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="185" y2="95"  stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="170" y2="145" stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="125" y2="185" stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="75"  y2="185" stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="30"  y2="145" stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="15"  y2="95"  stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <line x1="100" y1="100" x2="30"  y2="45"  stroke="url(#agsh-gold)" stroke-width="0.8" opacity="0.55"/>
  <!-- 상단 하이라이트 삼각 facet -->
  <polygon points="100,100 75,10 125,10" fill="rgba(255,255,255,0.18)"/>
  <polygon points="100,100 125,10 170,45" fill="rgba(255,255,255,0.08)"/>
  <polygon points="100,100 30,45 75,10"  fill="rgba(255,255,255,0.12)"/>
  <!-- 하단 섀도 facet -->
  <polygon points="100,100 125,185 75,185" fill="rgba(0,0,0,0.18)"/>
  <polygon points="100,100 170,145 125,185" fill="rgba(0,0,0,0.12)"/>
  <!-- 스파클 하이라이트 -->
  <circle cx="170" cy="45" r="3.5" fill="#fff" opacity="0.75"/>
  <circle cx="30"  cy="45" r="2.5" fill="#fff" opacity="0.55"/>
  <circle cx="185" cy="95" r="2"   fill="#fff" opacity="0.45"/>
  <defs>
    <linearGradient id="agsh-crystal-fill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#C9A84C" stop-opacity="0.25"/>
      <stop offset="50%"  stop-color="#F5D77E" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#8B6914" stop-opacity="0.30"/>
    </linearGradient>
    <linearGradient id="agsh-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="50%"  stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#F0C040"/>
    </linearGradient>
  </defs>
</svg>`

/** 좌측 월계수 가지 (point-award-credential 로렐 패턴 확장 — 잎 7매) */
const LAUREL_LEFT = `<svg class="agsh-laurel agsh-laurel-l" viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 8 C34 18 14 34 9 58 C4 82 16 106 26 130" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <ellipse cx="42" cy="22" rx="10" ry="5.5" transform="rotate(-38 42 22)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="32" cy="38" rx="10" ry="5.5" transform="rotate(-48 32 38)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="22" cy="55" rx="10" ry="5.5" transform="rotate(-55 22 55)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="15" cy="73" rx="10" ry="5.5" transform="rotate(-60 15 73)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="13" cy="92" rx="10" ry="5.5" transform="rotate(-58 13 92)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="17" cy="111" rx="10" ry="5.5" transform="rotate(-50 17 111)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="24" cy="128" rx="9"  ry="5"   transform="rotate(-42 24 128)" stroke="currentColor" stroke-width="1.6"/>
</svg>`

/** 우측 월계수 가지 (좌측 수평 반전) */
const LAUREL_RIGHT = `<svg class="agsh-laurel agsh-laurel-r" viewBox="0 0 60 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 8 C26 18 46 34 51 58 C56 82 44 106 34 130" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <ellipse cx="18" cy="22" rx="10" ry="5.5" transform="rotate(38 18 22)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="28" cy="38" rx="10" ry="5.5" transform="rotate(48 28 38)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="38" cy="55" rx="10" ry="5.5" transform="rotate(55 38 55)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="45" cy="73" rx="10" ry="5.5" transform="rotate(60 45 73)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="47" cy="92" rx="10" ry="5.5" transform="rotate(58 47 92)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="43" cy="111" rx="10" ry="5.5" transform="rotate(50 43 111)" stroke="currentColor" stroke-width="1.8"/>
  <ellipse cx="36" cy="128" rx="9"  ry="5"   transform="rotate(42 36 128)" stroke="currentColor" stroke-width="1.6"/>
</svg>`

export const awardGovSealHero = defineBlock<Data>({
  id: 'award-gov-seal-hero',
  archetype: 'feature' as any,
  styleTags: ['dark', 'award', 'government', 'seal', 'medallion', 'premium', 'authority', 'template'],
  imageSlots: 1,
  describe:
    '정부기관 수상 히어로. 딥브라운 다크 배경 + 스포트라이트 글로우 + 상단 아이브로우 + 풀쿼트 골드 대형 헤드라인 + 다면 크리스탈 메달리온(중앙 정부 씰 이미지) + 좌우 대칭 골드 월계수 리스 + 3단 원형 포디움+대리석 사각 베이스. 공공기관 인증·수상 섹션. ⚠️ 수상명·연도·기관명은 플레이스홀더만 — 근거 없이 지어내기 금지.',
  schema,
  css: `
/* award-gov-seal-hero — 접두사 agsh- */
.agsh{
  position:relative;background:#1A1208;color:#fff;
  padding:64px 32px 72px;text-align:center;
  overflow:hidden;word-break:keep-all;overflow-wrap:break-word
}
/* 스포트라이트 글로우 — 중앙 황금빛 원형 */
.agsh::before{
  content:'';position:absolute;
  left:50%;top:38%;transform:translate(-50%,-50%);
  width:520px;height:420px;border-radius:50%;
  background:radial-gradient(ellipse at center,rgba(201,168,76,0.22) 0%,rgba(201,168,76,0.07) 45%,transparent 72%);
  pointer-events:none;z-index:0
}
/* 모든 자식 z-index 기준면 위로 */
.agsh > *{position:relative;z-index:1}

/* 아이브로우 */
.agsh-eyebrow{
  display:inline-block;font-family:var(--font-body);
  font-size:14px;font-weight:700;letter-spacing:.08em;
  color:rgba(255,255,255,.55);margin-bottom:20px;line-height:1.5
}

/* 풀쿼트 헤드라인 */
.agsh-headline{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(34px,9vw,56px);line-height:1.18;
  letter-spacing:-.02em;color:#F0C040;
  margin-bottom:44px;word-break:keep-all
}
/* 골드 em — 커머스 권위 신호색(하드코딩 허용) */
.agsh-headline .em{color:#F5D77E;font-style:normal}

/* 메달리온 + 리스 중앙 어셈블리 */
.agsh-assembly{
  position:relative;
  display:flex;align-items:center;justify-content:center;
  gap:0;margin:0 auto 0;
  width:100%;max-width:360px
}

/* 월계수 리스 */
.agsh-laurel{
  width:52px;height:130px;flex-shrink:0;
  color:#C9A84C  /* 골드 — 커머스 권위 신호색 하드코딩 허용 */
}
.agsh-laurel-l{transform-origin:right center}
.agsh-laurel-r{transform-origin:left center}

/* 크리스탈 메달리온 SVG */
.agsh-crystal{
  width:200px;height:200px;flex-shrink:0;
  filter:drop-shadow(0 8px 32px rgba(201,168,76,0.50)) drop-shadow(0 0 12px rgba(245,215,126,0.35))
}

/* 메달리온 내부 씰 영역 — SVG 위 절대 오버레이 */
.agsh-seal-wrap{
  position:absolute;
  left:50%;top:50%;transform:translate(-50%,-52%);
  width:90px;height:90px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  z-index:2
}
.agsh-seal-img{
  width:64px;height:64px;border-radius:50%;
  object-fit:contain;background:transparent
}
.agsh-seal-img.ph{
  width:64px;height:64px;border-radius:50%;
  border:2px dashed rgba(255,255,255,.35);
  background:rgba(255,255,255,.08);
  color:rgba(255,255,255,.35);font-size:10px;
  display:flex;align-items:center;justify-content:center
}
.agsh-category{
  font-family:var(--font-body);font-size:11px;font-weight:700;
  letter-spacing:.04em;color:#fff;
  white-space:nowrap;
  text-shadow:0 1px 4px rgba(0,0,0,.6)
}

/* 3단 원형 포디움 */
.agsh-podium{
  position:relative;margin:0 auto;
  width:220px
}
/* 공통 드럼 */
.agsh-drum{
  margin:0 auto;border-radius:50%;
  background:linear-gradient(180deg,#F5D77E 0%,#C9A84C 40%,#8B6914 100%);
  box-shadow:0 4px 16px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.35)
}
.agsh-drum-1{width:160px;height:28px} /* 최상단 — 가장 좁음 */
.agsh-drum-2{width:200px;height:24px;margin-top:-2px} /* 중단 */
.agsh-drum-3{width:220px;height:20px;margin-top:-2px} /* 최하단 — 가장 넓음 */
/* 포디움 장식 줄무늬 */
.agsh-drum-1::after,.agsh-drum-2::after,.agsh-drum-3::after{
  content:'';display:block;margin:6px auto 0;
  width:70%;height:2px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);
  border-radius:1px
}

/* 대리석 사각 베이스 */
.agsh-base{
  margin:0 auto;
  width:250px;height:38px;border-radius:6px;margin-top:-1px;
  background:linear-gradient(180deg,#E8E0D4 0%,#C8BFB0 50%,#A89880 100%);
  box-shadow:0 6px 20px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.5);
  position:relative;overflow:hidden
}
/* 대리석 결 */
.agsh-base::before{
  content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(
    108deg,
    transparent 0px,transparent 18px,
    rgba(0,0,0,.04) 18px,rgba(0,0,0,.04) 19px
  )
}

/* 연도 뱃지 (선택) */
.agsh-year-badge{
  display:inline-block;margin-top:32px;
  font-family:var(--font-body);font-size:13px;font-weight:700;
  letter-spacing:.08em;
  color:#C9A84C; /* 골드 — 커머스 권위 신호색 */
  border:1.5px solid rgba(201,168,76,.45);
  border-radius:999px;padding:6px 20px;
  background:rgba(201,168,76,.08)
}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrow = d.eyebrow
      ? `<div class="agsh-eyebrow">${richSafe(d.eyebrow)}</div>`
      : ''

    const sealHtml = d.sealImage
      ? `<img class="agsh-seal-img" src="${esc(d.sealImage)}" alt="${esc(d.sealAlt ?? '정부기관 씰')}">`
      : `<div class="agsh-seal-img ph">${esc(d.sealAlt ?? '씰')}</div>`

    const categoryHtml = d.category
      ? `<div class="agsh-category">${esc(d.category)}</div>`
      : ''

    const yearBadge = d.yearBadge
      ? `<div class="agsh-year-badge">${esc(d.yearBadge)}</div>`
      : ''

    return `
<section class="agsh">
  ${eyebrow}
  <h2 class="agsh-headline">${richSafe(d.headline)}</h2>

  <!-- 크리스탈 메달리온 + 좌우 월계수 리스 -->
  <div class="agsh-assembly">
    ${LAUREL_LEFT}
    <div style="position:relative;display:inline-block;flex-shrink:0">
      ${CRYSTAL_MEDALLION}
      <div class="agsh-seal-wrap">
        ${sealHtml}
        ${categoryHtml}
      </div>
    </div>
    ${LAUREL_RIGHT}
  </div>

  <!-- 3단 원형 포디움 + 대리석 사각 베이스 -->
  <div class="agsh-podium">
    <div class="agsh-drum agsh-drum-1"></div>
    <div class="agsh-drum agsh-drum-2"></div>
    <div class="agsh-drum agsh-drum-3"></div>
  </div>
  <div class="agsh-base"></div>

  ${yearBadge}
</section>`
  },
})
