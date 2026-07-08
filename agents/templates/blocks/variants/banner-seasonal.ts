/** BANNER 아키타입(템플릿 충실 재현): banner-seasonal.
 *  와디즈 200섹션 18_시즈널배너 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 시즌 무드 그라데이션 배경 + 소프트 데코 블롭(라이선스 세이프 CSS 도형) + 양쪽 라인 눈썹 +
 *  대형 2줄 타이틀(Cafe24 Dangdanghae) + 기간 pill. 이미지 없이도 완결되는 자족형 배너.
 *  봄·여름·가을·겨울 모두 커버하는 범용 구조(bgFrom/bgTo로 시즌 무드 조정). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1),           // 상단 영문 라벨 (예: "SPRING EVENT", "SUMMER SALE")
  titleLine1: z.string().min(1),        // 대제목 첫 번째 줄 (한국어, 대형)
  titleLine2: z.string().min(1).optional(), // 대제목 두 번째 줄 (선택)
  period: z.string().min(1).optional(), // 기간 텍스트 (예: "4.1일(화) - 4.15일(화)")
  image: z.string().optional(),         // 중앙 제품/오브젝트 이미지 (URL, 없으면 미표시)
  decoImage: z.string().optional(),     // 배경 장식 이미지 (플라워/리프 등, URL, 없으면 CSS 블롭만)
  bgFrom: z.string().optional(),        // 그라데이션 시작색 (CSS 색상 문자열, 기본 토큰 accent 26%)
  bgTo: z.string().optional(),          // 그라데이션 끝색 (CSS 색상 문자열, 기본 토큰 bg)
})
type Data = z.infer<typeof schema>

export const bannerSeasonal = defineBlock<Data>({
  id: 'banner-seasonal',
  archetype: 'banner',
  styleTags: ['premium', 'template', 'seasonal', 'playful', 'warm'],
  imageSlots: 2,
  describe:
    '시즌/기념일 배너. 시즌 무드 그라데이션 배경 + 소프트 데코 블롭(CSS) + 선택 데코 이미지 + 양쪽 라인 눈썹 라벨 + Cafe24 Dangdanghae 대형 2줄 타이틀 + 기간 pill. 봄·여름·가을·겨울 시즌 배너. 이미지 없이도 완결되는 자족형. bgFrom/bgTo로 시즌 톤 조정.',
  schema,
  css: `
/* bs- : banner-seasonal 전용 접두사 */
.bs{position:relative;overflow:hidden;text-align:center;min-height:480px;display:flex;flex-direction:column;align-items:center;justify-content:center}

/* 그라데이션 배경 — bgFrom/bgTo 없으면 토큰 accent 틴트 */
.bs-bg{position:absolute;inset:0;z-index:0;
  background:linear-gradient(150deg, var(--bs-from,color-mix(in srgb,var(--accent) 26%,#fff)) 0%, var(--bs-to,var(--bg)) 86%)}

/* 소프트 데코 블롭(시즌 컨페티) — 라이선스 세이프 CSS 도형. 이미지 없어도 분위기 채움 */
.bs-blob{position:absolute;z-index:1;border-radius:50%;filter:blur(1px);pointer-events:none}
.bs-blob.b1{width:130px;height:130px;top:-34px;left:-24px;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 55%,#fff) 0%,transparent 70%)}
.bs-blob.b2{width:88px;height:88px;top:42px;right:36px;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 46%,#fff) 0%,transparent 70%)}
.bs-blob.b3{width:150px;height:150px;bottom:-44px;right:-32px;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 50%,#fff) 0%,transparent 70%)}
.bs-blob.b4{width:66px;height:66px;bottom:54px;left:44px;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 40%,#fff) 0%,transparent 70%)}

/* 배경 장식 이미지(꽃잎·잎 등) — 있을 때만 전체 오버레이 */
.bs-deco{position:absolute;inset:0;z-index:2;width:100%;height:100%;object-fit:cover;opacity:.55;mix-blend-mode:multiply;pointer-events:none}
.bs-deco.ph{display:none!important}

/* 콘텐츠 래퍼 */
.bs-body{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;width:100%;padding:60px var(--pad-x,56px)}

/* 눈썹 라인 + 라벨 */
.bs-eyebrow{display:flex;align-items:center;gap:16px;margin-bottom:22px;width:100%;max-width:440px}
.bs-line{flex:1;height:2px;background:var(--accent);border-radius:1px;min-width:36px}
.bs-label{font-family:var(--font-body);font-size:18px;font-weight:700;letter-spacing:.12em;color:var(--accent);white-space:nowrap}

/* 대형 타이틀 (Cafe24 Dangdanghae 시그니처 톤) */
.bs-t1{font-family:var(--font-hand);font-weight:400;font-size:78px;line-height:1.02;color:var(--ink);letter-spacing:-.01em;margin:0}
.bs-t2{font-family:var(--font-hand);font-weight:400;font-size:78px;line-height:1.02;color:var(--ink);letter-spacing:-.01em;margin:2px 0 0}

/* 제품/오브젝트 이미지 — 있을 때만 */
.bs-img{width:220px;height:240px;object-fit:contain;margin:30px 0 4px;filter:drop-shadow(0 18px 30px rgba(0,0,0,.18))}
.bs-img.ph{display:none!important}

/* 기간 pill */
.bs-period{display:inline-block;margin-top:28px;font-family:var(--font-body);font-weight:600;font-size:19px;color:var(--ink);letter-spacing:.01em;padding:11px 30px;background:rgba(255,255,255,.62);border-radius:999px;box-shadow:0 6px 16px rgba(0,0,0,.06)}
`,
  render: (d, { esc }) => {
    const styleAttr = [
      d.bgFrom ? `--bs-from:${esc(d.bgFrom)}` : '',
      d.bgTo ? `--bs-to:${esc(d.bgTo)}` : '',
    ]
      .filter(Boolean)
      .join(';')

    return `
<section class="bs"${styleAttr ? ` style="${styleAttr}"` : ''}>
  <div class="bs-bg"></div>
  <span class="bs-blob b1"></span>
  <span class="bs-blob b2"></span>
  <span class="bs-blob b3"></span>
  <span class="bs-blob b4"></span>
  ${d.decoImage ? media(d.decoImage, 'bs-deco', '시즌 장식 이미지') : ''}
  <div class="bs-body">
    <div class="bs-eyebrow">
      <span class="bs-line"></span>
      <span class="bs-label">${esc(d.eyebrow)}</span>
      <span class="bs-line"></span>
    </div>
    <h2 class="bs-t1">${esc(d.titleLine1)}</h2>
    ${d.titleLine2 ? `<h2 class="bs-t2">${esc(d.titleLine2)}</h2>` : ''}
    ${d.image ? media(d.image, 'bs-img', '시즌 이벤트 이미지') : ''}
    ${d.period ? `<p class="bs-period">${esc(d.period)}</p>` : ''}
  </div>
</section>`
  },
})
