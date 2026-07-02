/** FEATURE 아키타입: award-warranty-pledge.
 *  [끝판왕] 어워드(수상·권위) 구성 #16 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 딥네이비(var(--ink)) 배경 + 골드 계열 헤드라인 + 숫자 강조("365일"/"1년") +
 *  클럭+렌치 골드 원형 픽토그램 엠블럼 + A/S 보증 기간 필 라벨 + 풀폭 제품 이미지 +
 *  담당자 원형 캐릭터 아이콘 + 보증 선언 스트립. 수상·랭킹이 아닌 A/S 보증 권위 선언 패턴.
 *
 *  ⚠️ 수상명·연도·기관은 반드시 플레이스홀더로 입력할 것 —
 *     근거 없이 임의로 지어내는 것을 금지 (schema describe 및 zod describe 참고).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 골드 클럭+렌치 픽토그램 엠블럼 (인라인 SVG, best-effort 근사) ─────────────
// 시계 원형 테두리 안에 렌치와 인증서 문서 아이콘을 배치 — 커머스 A/S 권위 신호.
const EMBLEM_SVG = `<svg class="awp-emblem-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 외부 원형 테두리 -->
  <circle cx="60" cy="60" r="55" stroke="#C9A84C" stroke-width="3.5"/>
  <!-- 시계 페이스 -->
  <circle cx="48" cy="58" r="26" stroke="#C9A84C" stroke-width="2.8"/>
  <!-- 시계 눈금 12·3·6·9시 -->
  <line x1="48" y1="34" x2="48" y2="40" stroke="#C9A84C" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="48" y1="76" x2="48" y2="82" stroke="#C9A84C" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="22" y1="58" x2="28" y2="58" stroke="#C9A84C" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="68" y1="58" x2="74" y2="58" stroke="#C9A84C" stroke-width="2.4" stroke-linecap="round"/>
  <!-- 시계 시침·분침 (11시 10분) -->
  <line x1="48" y1="58" x2="48" y2="44" stroke="#C9A84C" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="48" y1="58" x2="58" y2="52" stroke="#C9A84C" stroke-width="2.2" stroke-linecap="round"/>
  <!-- 중심점 -->
  <circle cx="48" cy="58" r="2.8" fill="#C9A84C"/>
  <!-- 렌치 (오른쪽 오버랩) -->
  <g transform="translate(66,38) rotate(35)">
    <path d="M6 0 C10 0 14 3 14 8 C14 12 11 15 8 15.5 L8 32 C8 33.1 7.1 34 6 34 C4.9 34 4 33.1 4 32 L4 15.5 C1 15 -2 12 -2 8 C-2 3 2 0 6 0 Z"
          stroke="#C9A84C" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
    <line x1="0" y1="5" x2="12" y2="5" stroke="#C9A84C" stroke-width="1.6"/>
    <line x1="0" y1="11" x2="12" y2="11" stroke="#C9A84C" stroke-width="1.6"/>
  </g>
  <!-- 인증 뱃지 체크 (우측 하단) -->
  <circle cx="88" cy="86" r="14" fill="#1a2540" stroke="#C9A84C" stroke-width="2.2"/>
  <path d="M81 86 L86 91 L95 80" stroke="#C9A84C" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`

// ── 담당자 캐릭터 원형 아이콘 SVG (도어맨/컨시어지 실루엣, best-effort 근사) ──
const AVATAR_SVG = `<svg class="awp-avatar-svg" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 골드 원형 배경 -->
  <circle cx="48" cy="48" r="46" fill="#C9A84C"/>
  <!-- 얼굴 -->
  <circle cx="48" cy="34" r="14" fill="#1a2540"/>
  <!-- 모자 (정모) -->
  <rect x="33" y="20" width="30" height="6" rx="3" fill="#1a2540"/>
  <rect x="38" y="14" width="20" height="8" rx="2" fill="#1a2540"/>
  <!-- 모자 챙 강조선 -->
  <line x1="33" y1="20" x2="63" y2="20" stroke="#C9A84C" stroke-width="1.5"/>
  <!-- 몸 / 유니폼 -->
  <path d="M24 72 C24 58 34 52 48 52 C62 52 72 58 72 72 Z" fill="#1a2540"/>
  <!-- 유니폼 라펠 -->
  <path d="M48 52 L44 64 L48 68 L52 64 Z" fill="#C9A84C" opacity="0.7"/>
</svg>`

const schema = z.object({
  /** 헤드라인 위 작은 아이브로우 텍스트 (선택) */
  eyebrow: z.string().optional().describe('예: "안심하고 사용하는"'),

  /** 대형 헤드라인 — 숫자/기간 강조에 em 태그 허용 (예: <span class="em">365일</span> 안심 케어) */
  headline: z.string().min(1).describe('예: "<span class=\\"em\\">365일</span> 안심 케어"'),

  /** 헤드라인 바로 아래 보조 설명 한 줄 (선택) */
  subCopy: z.string().optional().describe('예: "1년 무상 A/S, 고객님의 편의를 최우선으로"'),

  /** 골드 엠블럼 하단 필 라벨 텍스트 (예: "1년 무상 A/S") */
  emblemLabel: z.string().min(1).describe('예: "1년 무상 A/S"'),

  /** 풀폭 제품 이미지 URL (선택 — 없으면 placeholder) */
  productImage: z.string().optional(),

  /** 제품 이미지 alt 텍스트 */
  productImageAlt: z.string().optional(),

  /** 제품 이미지 아래 굵은 서약 카피 (em/br 허용) */
  pledgeCopy: z
    .string()
    .min(1)
    .describe('예: "프리미엄 주방 가전,<br><span class=\\"em\\">처음부터 끝까지</span> 책임지겠습니다."'),

  /** 하단 스트립 보증 메시지 (em 허용) */
  stripCopy: z
    .string()
    .min(1)
    .describe('예: "<span class=\\"em\\">1년 무상 보증</span>으로 걱정없이 사용하세요."'),

  /** 하단 스트립 면책/예외 안내 소문자 (선택) */
  disclaimer: z.string().optional().describe('예: "* 일부 소모품은 제외될 수 있습니다."'),
})
type Data = z.infer<typeof schema>

export const awardWarrantyPledge = defineBlock<Data>({
  id: 'award-warranty-pledge',
  archetype: 'feature' as any,
  styleTags: ['dark', 'gold', 'warranty', 'award', 'premium', 'template'],
  imageSlots: 1,
  describe:
    'A/S 보증 권위 선언 (어워드 #16 패턴). 딥네이비 배경 + 골드 헤드라인("365일"/"1년" 숫자 강조) + 골드 원형 픽토그램 엠블럼(시계+렌치+체크) + A/S 기간 필 라벨 + 풀폭 제품 이미지 + 굵은 서약 카피 + 담당자 원형 캐릭터 아이콘 보증 선언 스트립. 수상/랭킹이 아닌 A/S·보증 권위 섹션.',
  schema,
  css: `
/* award-warranty-pledge — 접두사 awp- */
.awp{background:var(--ink);color:#fff;word-break:keep-all;overflow-wrap:break-word}

/* ── 상단 헤드라인 존 ── */
.awp-header{padding:56px 40px 40px;text-align:center}
.awp-eyebrow{display:block;font-family:var(--font-body);font-size:16px;font-weight:600;color:rgba(255,255,255,.65);letter-spacing:.02em;margin-bottom:10px}
.awp-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,9vw,56px);line-height:1.15;letter-spacing:-.025em;color:#fff}
/* 다크 배경 — .em은 골드(커머스 신뢰/보증 신호색, 하드코딩 허용) */
.awp-headline .em{color:#F5D77E}
.awp-sub{margin-top:14px;font-family:var(--font-body);font-size:17px;font-weight:500;color:rgba(255,255,255,.72);line-height:1.5}

/* ── 골드 원형 픽토그램 엠블럼 ── */
.awp-emblem-wrap{display:flex;flex-direction:column;align-items:center;gap:0;padding:0 40px 36px}
.awp-emblem-svg{width:120px;height:120px;display:block}
/* 하단 필 라벨 */
.awp-emblem-pill{margin-top:12px;display:inline-block;background:linear-gradient(135deg,#C9A84C 0%,#F5D77E 50%,#C9A84C 100%);color:#1a2540;font-family:var(--font-display);font-weight:800;font-size:16px;letter-spacing:.04em;padding:8px 28px;border-radius:999px}

/* ── 풀폭 제품 이미지 ── */
.awp-product-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.awp-product-img.ph{width:100%;aspect-ratio:4/3;background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.18);color:rgba(255,255,255,.35);font-size:13px}

/* ── 서약 카피 존 ── */
.awp-pledge{padding:44px 40px 48px;text-align:center;background:var(--ink)}
.awp-pledge-copy{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5.5vw,34px);line-height:1.45;color:#fff;letter-spacing:-.015em}
/* 다크 배경 — .em은 골드 */
.awp-pledge-copy .em{color:#F5D77E}

/* ── 하단 담당자 아이콘 + 보증 선언 스트립 ── */
.awp-strip{background:#F5EDD8;padding:28px 32px 24px;display:flex;align-items:center;gap:20px}
.awp-avatar-svg{width:72px;height:72px;flex-shrink:0;border-radius:50%;overflow:hidden}
.awp-strip-text{flex:1;min-width:0}
.awp-strip-copy{font-family:var(--font-body);font-size:clamp(16px,4.2vw,20px);font-weight:700;color:#1a2540;line-height:1.45}
/* 밝은 배경 — .em은 var(--accent-d) */
.awp-strip-copy .em{color:var(--accent-d);font-weight:800}
.awp-disclaimer{margin-top:6px;font-family:var(--font-body);font-size:12px;color:rgba(26,37,64,.5);line-height:1.5}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrow = d.eyebrow
      ? `<span class="awp-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    const subCopy = d.subCopy
      ? `<p class="awp-sub">${esc(d.subCopy)}</p>`
      : ''

    const productImg = media(
      d.productImage,
      'awp-product-img',
      esc(d.productImageAlt ?? '제품 이미지'),
    )

    const disclaimer = d.disclaimer
      ? `<p class="awp-disclaimer">${esc(d.disclaimer)}</p>`
      : ''

    return `
<section class="awp">
  <div class="awp-header">
    ${eyebrow}
    <h2 class="awp-headline">${richSafe(d.headline)}</h2>
    ${subCopy}
  </div>

  <div class="awp-emblem-wrap">
    ${EMBLEM_SVG}
    <span class="awp-emblem-pill">${esc(d.emblemLabel)}</span>
  </div>

  ${productImg}

  <div class="awp-pledge">
    <p class="awp-pledge-copy">${richSafe(d.pledgeCopy)}</p>
  </div>

  <div class="awp-strip">
    ${AVATAR_SVG}
    <div class="awp-strip-text">
      <p class="awp-strip-copy">${richSafe(d.stripCopy)}</p>
      ${disclaimer}
    </div>
  </div>
</section>`
  },
})
